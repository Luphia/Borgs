/* test case

var Coordinator = require('./bots/Coordinator.js');
var Receptor = require('./bots/Receptor.js');
var SB = require('./bots/_SocketBot.js');

var coordinator = new Coordinator();
coordinator.start();

var a = new SB({"tags": ["t1","t2"]});
var b = new SB({"tags": ["t2","t3"]});
var c = new SB({"tags": ["t3","t4"]});
a.start();
b.start();
c.start();

var receptor = new Receptor();
receptor.start();

*/

var SocketBot = require('./_SocketBot.js')
,	util = require('util')
,	log4js = require('log4js')
,	express = require('express')
,	Session = require('express-session')
,	favicon = require('serve-favicon')
,	fs = require('fs')
,	path = require('path')
,	bodyParser = require('body-parser')
,	multer  = require('multer')
,	ncp = require('ncp').ncp
,	exec = require('child_process').exec
,	Result = require('../classes/Result.js');

var pathCert = __dirname + '/../config/cert.pfx'
,	pathPw = __dirname + '/../config/pw.txt';

var Receptor = function(config) {
	this.init(config);
};

util.inherits(Receptor, SocketBot);

Receptor.prototype.init = function(config) {
	Receptor.super_.prototype.init.call(this, config);
	var self = this;
	this.serverPort = [3000, 80];
	this.httpsPort = [4000, 443];
	this.modules = {};

	var upload = "./uploads/";
	if (!fs.existsSync(upload)){
		fs.mkdirSync(upload);
	}
	var logs = "./logs/";
	if (!fs.existsSync(logs)){
		fs.mkdirSync(logs);
	}

	log4js.configure({
		"appenders": [
			{ "type": "console" },
			{ "type": "dateFile", "filename": "./logs/catering", "category": "catering.log", "pattern": "-yyyy-MM-dd.log", "alwaysIncludePattern": true, "backups": 365 },
			{ "type": "file", "filename": "./logs/catering.exception.log", "category": "catering.exception", "maxLogSize": 10485760, "backups": 10 },
			{ "type": "file", "filename": "./logs/catering.threat.log", "category": "catering.threat", "maxLogSize": 10485760, "backups": 10 }
		],
		"replaceConsole": true
	});

	this.router = express.Router();
	this.app = express();
	this.http = require('http').createServer(this.app);
	this.http.on('error', function(err) {
		if(err.syscall == 'listen') {
			var nextPort = self.serverPort.pop() || self.listening + 1;
			self.startServer(nextPort);
		}
		else {
			throw err;
		}
	});
	this.http.on('listening', function() {
		console.log('Receptor is listening on port: %d', self.listening);
	});

	// if has pxf -> create https service
	if(fs.existsSync(pathCert)) {
		this.pfx = fs.readFileSync(pathCert);
		this.pfxpw = fs.readFileSync(pathPw);

		this.https = require('https').createServer({
			pfx: this.pfx,
			passphrase: this.pfxpw
		}, this.app);
		this.https.on('error', function(err) {
			if(err.syscall == 'listen') {
				var nextPort = self.httpsPort.pop() || self.listeningHttps + 1;
				self.startServer(nextPort);
			}
			else {
				throw err;
			}
		});

		this.https.on('listening', function() {
			console.log('Receptor is listening on port: %d', self.listeningHttps);
		});
	}

	this.session = Session({
		secret: this.randomID(),
		resave: true,
		saveUninitialized: true
	});

	this.app.set('port', this.serverPort.pop());
	this.app.set('portHttps', this.httpsPort.pop());
	this.app.use(log4js.connectLogger(log4js.getLogger('catering.log'), { level: log4js.levels.INFO, format: ':remote-addr :user-agent :method :url :status - :response-time ms' }));
	this.app.use(this.session);
	this.app.use(bodyParser.urlencoded({ extended: false }));
	this.app.use(bodyParser.json({limit: '10mb'}));
	this.app.use(multer({ dest: './uploads/', limit: '10mb'}));
	this.app.use(this.filter);
	this.app.use(express.static(path.join(__dirname, '../public')));
	this.app.use(this.router);
	this.app.use(this.returnData);

	this.ctrl = [];
};

Receptor.prototype.exec = function(msg, callback) {
	msg = msg || {};
	var action = new String(msg.action).toLowerCase();

	switch(msg.action) {
		case 'registpath':
			this.registPath(msg.path, msg.botname);
			break;
	}
};
Receptor.prototype.registPath = function(path, botname) {
	var self = this;
	if(util.isArray(path)) {
		for(var k in path) {
			this.registPath(path[k], botname);
		}
	}
	else if(!!path) {
		if(typeof(path) == "string") { path = {"method": "all", "path": path}; }
		var method = (path.method || 'all').toLowerCase()
		,	path = path.path;

		if(typeof(this.router[method]) == "function") {
			this.router[method](path, function(req, res, next) {
				var msg = {
					"url": req._parsedOriginalUrl.pathname,
					"method": req.method,
					"params": req.params,
					"query": req.query,
					"body": req.body,
					"sessionID": req.sessionID,
					"session": req.session,
					"files": req.files
				};

				self.random(msg, 1, botname, function(e, d) {
					if(d.length == 1) {
						d = d[0];
					}

					res.result = new Result(d);
					next();
				});
			});
		}
	}
};

Receptor.prototype.start = function() {
	Receptor.super_.prototype.start.apply(this);
	var self = this;

	var httpPort = this.app.get('port');
	var httpsPort = this.app.get('portHttps');
	this.startServer(httpPort, httpsPort);
};

Receptor.prototype.startServer = function(port, httpsPort) {
	this.listening = port;
	this.listeningHttps = httpsPort;
	this.http.listen(port, function() {});

	if(this.pfx) {
		this.https.listen(httpsPort, function() {});
	}
}

Receptor.prototype.stop = function() {
	Receptor.super_.prototype.stop.apply(this);
	this.http.close();

	if(this.pfx) {
		this.https.close();
	}
};

Receptor.prototype.filter = function(req, res, next) {
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	if(!req.session.ip) { req.session.ip = ip; }
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
	next();
};

Receptor.prototype.returnData = function(req, res, next) {
	var result = res.result
	,	session;

	if(result) {

		if(typeof(result.getSession) == 'function') {
			session = result.getSession();

			for(var key in session) {
				if(session[key] === null) {
					delete req.session[key];
				}
				else {
					req.session[key] = session[key];
				}
			}
		}
	}
	else {
		result = new Result();
		result.setMessage("Invalid operation");
	}

	if(typeof(result.toJSON) == 'function') {
		var json = result.toJSON();
		var isFile = new RegExp("^[a-zA-Z0-9\-]+/[a-zA-Z0-9\-]+$").test(json.message);

		if(isFile) {
			res.header("Content-Type", json.message);
			res.send(json.data);
		}
		else {
			res.send(json);
		}
	}
	else {
		res.send(result);
	}
};

Receptor.prototype.api = function(msg, tag) {
	var rs = this.ctrl[tag].exec(msg);
	return rs;
};

module.exports = Receptor;