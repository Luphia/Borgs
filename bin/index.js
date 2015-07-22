#!/usr/bin/env node
var fs = require('fs'),
	path = require('path'),
	log4js = require('log4js'),
	sub = 'js',
	config = {},
	reg = new RegExp('\.' + sub + '$'),
	folder = path.join(__dirname, "../bots/"),
	files = fs.readdirSync(folder),
	bots = [],
	skip = ["Coordinator.js", "Receptor.js", "Channel.js"],
	Coordinator = require('../bots/Coordinator.js'),
	Receptor = require('../bots/Receptor.js'),
	Channel = require('../bots/Channel.js'),
	ecDB = require('ecdb'),
	coordinator = new Coordinator(),
	channel = new Channel(),
	ecdb = new ecDB();

// initial folder
var pkg = require("../package.json");
var homepath = path.join(process.env.HOME || process.env.USERPROFILE, pkg.name);
var upload = path.join(homepath, "uploads/");
var logs = path.join(homepath, "logs/");
var dataset = path.join(homepath, "dataset/");

var folders = {
	home: homepath,
	upload: upload, 
	logs: logs
};

if (!fs.existsSync(homepath)){ fs.mkdirSync(homepath); }
if (!fs.existsSync(upload)){ fs.mkdirSync(upload); }
if (!fs.existsSync(logs)){ fs.mkdirSync(logs); }
if (!fs.existsSync(dataset)){ fs.mkdirSync(dataset); }

ecdb.connect({url: dataset}, function() {});

// initial logger
var infoPath = path.join(logs, 'info');
var exceptionPath = path.join(logs, 'exception.log');
var threatPath = path.join(logs, 'threat.log');
log4js.configure({
	"appenders": [
		{ "type": "console" },
		{ "type": "dateFile", "filename": infoPath, "category": "info", "pattern": "-yyyy-MM-dd.log", "alwaysIncludePattern": true, "backups": 365 },
		{ "type": "file", "filename": exceptionPath, "category": "exception", "maxLogSize": 10485760, "backups": 10 },
		{ "type": "file", "filename": threatPath, "category": "threat", "maxLogSize": 10485760, "backups": 10 }
	],
	"replaceConsole": true
});

var options = {
	path: folders,
	log4js: log4js,
	db: ecdb
};

coordinator.start();

for(var key in files) {
	if(reg.test(files[key]) && files[key].indexOf("_") == -1 && skip.indexOf(files[key]) == -1 ) {
		var BOT = require(folder + files[key])
		,	tag
		,	tagArr = files[key].split(".")
		,	bot = new BOT(options);

		tagArr.pop();
		tag = tagArr.join(".");
		bot.name = tag;

		bots.push(bot);
	}
}

for(var k in bots) {
	bots[k].start();
	bots[k].tag(bots[k].name.toLowerCase());
}


var receptor = new Receptor(options);
receptor.start();
for(var k in bots) {
	receptor.registPath(bots[k].path, bots[k].name)
}

channel.setApp( receptor.http, receptor.https );
channel.db = ecdb;
channel.start();