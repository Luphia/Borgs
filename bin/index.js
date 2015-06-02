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
,	coordinator = new Coordinator();

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

		bots.push(bot);
	}
}

for(var k in bots) {
	bots[k].start();
	bot.tag(bot.name.toLowerCase());
}


var receptor = new Receptor();
receptor.start();