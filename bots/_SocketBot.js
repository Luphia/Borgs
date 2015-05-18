/* test case

var Coordinator = require('./bots/Coordinator.js');

var coordinator = new Coordinator();
coordinator.start();

var SB = require('./bots/_SocketBot.js');
var a = new SB({"tags": ["t1","t2"]});
var b = new SB({"tags": ["t2","t3"]});
var c = new SB({"tags": ["t3","t4"]});
a.start();
b.start();
c.start();
c.broadcast('yo', 't2', function(e, d) { console.log('response for yo:'); console.log(d); });

 */

var Bot = require('./_Bot.js')
,	util = require('util')
,	Result = require('../classes/Result.js');

var SocketBot = function(config) {
	if(!config) config = {};
	this.init(config);
};

util.inherits(SocketBot, Bot);

SocketBot.prototype.init = function(config) {
	config = config || {};
	SocketBot.super_.prototype.init.call(this, config);
	this.server = config.server || 'ws://127.0.0.1:2266';
	this.tags = config.tags || [];
};

SocketBot.prototype.start = function() {
	if(this.active) { return; }
	var self = this;
	SocketBot.super_.prototype.start.apply(this);
	this.socket = require('socket.io-client')(this.server, {'force new connection': true});
	this.tag(this.tags);

	this.socket.on('message', function(msg) {
		if(msg._response) {
			self.getResponse(msg);
		}
		else {
			self.get(msg);
		}
	});

	this.socket.on('wait', function(msg) {
		self.addJob(msg._id, msg.jobs);
		self.done(msg._id);

		if(!(msg.jobs > 0)) {
			self.done(msg._id, 'bot not fount');
		}
	});
};

SocketBot.prototype.stop = function() {
	SocketBot.super_.prototype.stop.apply(this);
	this.socket.disconnect();
};

SocketBot.prototype.tag = function(tag) {
	if(Array.isArray(tag)) {
		for(var k in tag) {
			this.tag(tag[k]);
		}

		return true;
	}

	if(this.tags.indexOf(tag) == -1) { this.tags.push(tag); }
	if(this.socket) { this.socket.emit('tag', tag); }
	return true;
};

SocketBot.prototype.untag = function() {
	this.tags = [];
	this.socket.emit('untag');
};

SocketBot.prototype.send = function(msg, option, callback) {
	if(typeof msg != 'object' || Array.isArray(msg)) {
		msg = {"data": msg};
	}

	msg._id = this.randomID();
	msg._option = option;

	this.initEvent(msg._id);
	this.socket.emit('message', msg);
	this.addJob(msg._id, 1, callback);

};

SocketBot.prototype.broadcast = function(msg, tags, callback) {
	var option = {
		"method": "broadcast",
		"tag": tags,
		"waiting": true
	};

	return this.send(msg, option, callback);
};

SocketBot.prototype.peer = function(msg, clients, callback) {
	var option = {
		"method": "peer",
		"peer": clients,
		"waiting": true
	}

	return this.send(msg, option, callback);
};

SocketBot.prototype.random = function(msg, num, tags, callback) {
	var option = {
		"method": "random",
		"num": num,
		"tag": tags,
		"waiting": true
	};

	return this.send(msg, option, callback);
};

SocketBot.prototype.get = function(message) {
	var self = this;
	this.exec(message, function(err, data) {
		self.response(data, message);
	});
};
SocketBot.prototype.getResponse = function(message) {
	this.done(message._response, message);
	// console.log('I got response: %s', JSON.stringify(message))
};

SocketBot.prototype.response = function(msg, oldMsg) {
	if(!oldMsg._from) { return false; }
	if(typeof msg != 'object' || Array.isArray(msg)) { msg = {"data": msg}; }
	msg._id = oldMsg._id;
	msg._response = oldMsg._id;
	this.peer(msg, oldMsg._from);
};

SocketBot.prototype.record = function(table, data) {
	var message = {
		"table": table,
		"data": data
	};

	this.random(message, 1, 'recorder');
};

SocketBot.prototype.setAsk = function(func) {
	if(typeof(func) == "function") {
		this.ask = func;
	}
}
SocketBot.prototype.ask = function(message, target, callback) {
	var rs;
	console.log("I don't know how to ask");
	return rs;
};

module.exports = SocketBot;