#!/usr/bin/env node
var fs = require('fs')
,	sub = 'js'
,	config = {}
,	reg = new RegExp('\.' + sub + '$')
,	folder = __dirname + "/../bots/"
,	files = fs.readdirSync(folder)
,	bots = []
,	skip = ["Coordinator.js", "Receptor.js"]
,	Coordinator = require('../bots/Coordinator.js')
,	Receptor = require('../bots/Receptor.js')
,	ecDB = require('ecdb')
,	coordinator = new Coordinator()
,	ecdb = new ecDB();

ecdb.connect();
coordinator.start();

for(var key in files) {
	if(reg.test(files[key]) && files[key].indexOf("_") == -1 && skip.indexOf(files[key]) == -1 ) {
		var BOT = require(folder + files[key])
		,	tag
		,	tagArr = files[key].split(".")
		,	bot = new BOT();

		tagArr.pop();
		tag = tagArr.join(".");
		bot.name = tag;
		bot.db = ecdb;

		bots.push(bot);
	}
}

for(var k in bots) {
	bots[k].start();
	bots[k].tag(bots[k].name.toLowerCase());
}


var receptor = new Receptor();
receptor.start();
for(var k in bots) {
	receptor.registPath(bots[k].path, bots[k].name)
}