/*
var SB = require('./bots/_SocketBot.js');
var a = new SB({"tags": ["t1","t2"]});
a.start();

var msg = {
"action": "listtable"
}
a.random(msg, 1, 'dataset', function(e, d) {
console.log(d);
var _msg = {
"action": "getSchema",
"table": d.data[0].name
}
a.random(_msg, 1, 'dataset', function(_e, _d) {console.log(_d);});
});


# Dataset
{
	"column": ["c1", "c2", "c3"],
	"value": [
		["a11", "a21", "a31"],
		["a12", "a22", "a32"],
		["a13", "a23", "a32"]
	]
}

## NEW Dataset
### JSON
### XLSX
### CSV

## Merge
### Dataset
#### Inner
#### Left
#### Right
#### Full

### API
#### {params}
#### {$params}
*/


var ParentBot = require('./_SocketBot.js')
,	util = require('util')
,	ecDB = require('ecdb')
,	Result = require('../classes/Result.js');

var Bot = function (config) {
	if (!config) config = {};
	this.init(config);
};

util.inherits(Bot, ParentBot);

Bot.prototype.init = function (config) {
	Bot.super_.prototype.init.call(this, config);
	this.path = [
		{"method": "get", "path": "/dataset/"},
		{"method": "all", "path": "/dataset/:table"},
		{"method": "all", "path": "/dataset/:table/:id"}
	];
};

Bot.prototype.exec = function (msg, callback) {
	var rs = new Result();
	var url = msg.url;
	var body = msg.body;
	var pass, uri, table, sql, query, schema, id, rsdata, info, message;

	if(url) {
		pass = (msg.method == 'GET' && (url.lastIndexOf('/') == url.length - 1) ? 'LIST' : msg.method) + url.split('/').length.toString();
		uri = url.split('/');
		table = msg.params.table || msg.params['0'];
		id = msg.params.id || msg.params['1'];
		sql = msg.query.sql;
		query = msg.query.q;
	}
	else if(typeof(msg.action) == "string") {
		var action = msg.action.toLowerCase();
		sql = msg.sql;
		table = msg.table;
		schema = msg.schema;
		query = msg.query;
		id = msg.id;
		datarow = msg.datarow;
		label = msg.label;
		rtdata = !!msg.rtdata;

		switch(action) {
			case 'sql':
				this.db.sql(sql, function(e, d) {
					var rscode = !e? 1: 0;
					var rsdata = e || d;
					if(!e) {
						message = "SQL Execute Successful";

					}
					else {
						message = "SQL Execute Fail";
					}

					rs.setResult(rscode);
					rs.setMessage(message);
					rs.setData(rsdata);

					callback(false, rs);
				});
				break;

			case 'getschema':
				this.db.getTable(table, function(e, d) {
					var rscode = !e? 1: 0;
					var rsdata = e || d;
					if(!e) {
						message = "Get Table Schema Successful";

					}
					else {
						message = "Get Table Schema Fail";
					}

					rs.setResult(rscode);
					rs.setMessage(message);
					rs.setData(rsdata);

					callback(false, rs);
				});
				break;
			case 'setschema':
				this.db.setSchema(table, schema, function(e, d) {
					var rscode = !e? 1: 0;
					var rsdata = e || d;
					if(!e) {
						message = "Set " + table + " Schema Successful";
					}
					else {
						message = "Get " + table + " Schema Fail";
					}

					rs.setResult(rscode);
					rs.setMessage(message);
					rs.setData(rsdata);

					callback(false, rs);
				});
				break;
			case 'listtable':
				this.db.listTable(function(e, d) {
					var rscode = !e? 1: 0;
					var rsdata = e || d;
					if(!e) {
						message = "List All Table Successful";
					}
					else {
						message = "List All Table Fail";
					}

					rs.setResult(rscode);
					rs.setMessage(message);
					rs.setData(rsdata);

					callback(false, rs);
				});
				break;
			case 'gettable':
				this.db.getTable(table, function(e, d) {
					var rscode = !e? 1: 0;
					var rsdata = e || d;
					if(!e) {
						message = "Get Table: " + table + " Successful";
					}
					else {
						message = "Get Table: " + table + " Fail";
					}

					rs.setResult(rscode);
					rs.setMessage(message);
					rs.setData(rsdata);

					callback(false, rs);
				});
				break;
			case 'posttable':
				this.db.postTable(table, schema, function(e, d) {
					var rscode = !e? 1: 0;
					var rsdata = e || d;
					if(!e) {
						message = "Post Table: " + table + " Successful";
					}
					else {
						message = "Post Table: " + table + " Fail";
					}

					rs.setResult(rscode);
					rs.setMessage(message);
					rs.setData(rsdata);

					callback(false, rs);
				});
				break;
			case 'puttable':
				this.db.putTable(table, schema, function(e, d) {
					var rscode = !e? 1: 0;
					var rsdata = e || d;
					if(!e) {
						message = "Put Table: " + table + " Successful";
					}
					else {
						message = "Put Table: " + table + " Fail";
					}

					rs.setResult(rscode);
					rs.setMessage(message);
					rs.setData(rsdata);

					callback(false, rs);
				});
				break;
			case 'cleantable':
				this.db.cleanTable(table, function(e, d) {
					var rscode = !e? 1: 0;
					var rsdata = e || d;
					if(!e) {
						message = "Clean Table: " + table + " Successful";
					}
					else {
						message = "Clean Table: " + table + " Fail";
					}

					rs.setResult(rscode);
					rs.setMessage(message);
					rs.setData(rsdata);

					callback(false, rs);
				});
				break;
			case 'deletetable':
				this.db.deleteTable(table, function(e, d) {
					var rscode = !e? 1: 0;
					var rsdata = e || d;
					if(!e) {
						message = "Delete Table: " + table + " Successful";
					}
					else {
						message = "Delete Table: " + table + " Fail";
					}

					rs.setResult(rscode);
					rs.setMessage(message);
					rs.setData(rsdata);

					callback(false, rs);
				});
				break;
			case 'newdataset':
				this.newDataset(datarow, label, rtdata, function(err, data) {
					var rscode = !err? 1: 0;
					var rsdata = err || data;
					if(!err) {
						message = "Set new Dataset Successful";

					}
					else {
						message = "Set new Dataset Fail";
					}

					rs.setResult(rscode);
					rs.setMessage(message);
					rs.setData(rsdata);

					callback(false, rs);
				});
				break;
			case 'listdata':
				this.db.listData(table, query, function(e, d) {
					var rscode = !e? 1: 0;
					var rsdata = e || d;
					if(!e) {
						message = "List Data in " + table + " Successful";
					}
					else {
						message = "List Data in " + table + " Fail";
					}

					rs.setResult(rscode);
					rs.setMessage(message);
					rs.setData(rsdata);

					callback(false, rs);
				});
				break;
			case 'flowdata':
				this.db.flowData(table, query, function(e, d) {
					var rscode = !e? 1: 0;
					var rsdata = e || d;
					if(!e) {
						message = "Flow Data in " + table + " Successful";
					}
					else {
						message = "Flow Data in " + table + " Fail";
					}

					rs.setResult(rscode);
					rs.setMessage(message);
					rs.setData(rsdata);

					callback(false, rs);
				});
				break;
			case 'pagedata':
				this.db.listData(table, query, function(e, d) {
					var rscode = !e? 1: 0;
					var rsdata = e || d;
					if(!e) {
						message = "Page Data in " + table + " Successful";
					}
					else {
						message = "Page Data in " + table + " Fail";
					}

					rs.setResult(rscode);
					rs.setMessage(message);
					rs.setData(rsdata);

					callback(false, rs);
				});
				break;
			case 'getdata':
				this.db.getData(table, id, function(e, d) {
					var rscode = !e? 1: 0;
					var rsdata = e || d;
					if(!e) {
						message = "Get Data in " + table + " Successful";
					}
					else {
						message = "Get Data in " + table + " Fail";
					}

					rs.setResult(rscode);
					rs.setMessage(message);
					rs.setData(rsdata);

					callback(false, rs);
				});
				break;
			case 'find':
				this.db.find(table, query, function(e, d) {
					var rscode = !e? 1: 0;
					var rsdata = e || d;
					if(!e) {
						message = "Find Data in " + table + " Successful";
					}
					else {
						message = "Find Data in " + table + " Fail";
					}

					rs.setResult(rscode);
					rs.setMessage(message);
					rs.setData(rsdata);

					callback(false, rs);
				});
				break;
			case 'datafind':
				this.db.dataFind(datarow, sql, function(e, d) {
					var rscode = !e? 1: 0;
					var rsdata = e || d;
					if(!e) {
						message = "Find Data Successful";
					}
					else {
						message = "Find Data Fail";
					}

					rs.setResult(rscode);
					rs.setMessage(message);
					rs.setData(rsdata);

					callback(false, rs);
				});
				break;
			case 'postdata':
				this.db.postData(table, datarow, function(e, d) {
					var rscode = !e? 1: 0;
					var rsdata = e || d;
					if(!e) {
						message = "Insert into " + table + " Successful";
					}
					else {
						message = "Insert into " + table + " Fail";
					}

					rs.setResult(rscode);
					rs.setMessage(message);
					rs.setData(rsdata);

					callback(false, rs);
				});
				break;
			case 'updatedata':
				this.db.updateData(table, query, datarow, function(e, d) {
					var rscode = !e? 1: 0;
					var rsdata = e || d;
					if(!e) {
						message = "Update data in " + table + " Successful";
					}
					else {
						message = "Update data in " + table + " Fail";
					}

					rs.setResult(rscode);
					rs.setMessage(message);
					rs.setData(rsdata);

					callback(false, rs);
				});
				break;
			case 'replacedata':
				this.db.replaceData(table, id, datarow, function(e, d) {
					var rscode = !e? 1: 0;
					var rsdata = e || d;
					if(!e) {
						message = "Replace data in " + table + " Successful";
					}
					else {
						message = "Replace data in " + table + " Fail";
					}

					rs.setResult(rscode);
					rs.setMessage(message);
					rs.setData(rsdata);

					callback(false, rs);
				});
				break;
			case 'putdata':
				this.db.putData(table, id, datarow, function(e, d) {
					var rscode = !e? 1: 0;
					var rsdata = e || d;
					if(!e) {
						message = "Put data in " + table + " Successful";
					}
					else {
						message = "Put data in " + table + " Fail";
					}

					rs.setResult(rscode);
					rs.setMessage(message);
					rs.setData(rsdata);

					callback(false, rs);
				});
				break;
			case 'deletedata':
				this.db.deleteData(table, query, function(e, d) {
					var rscode = !e? 1: 0;
					var rsdata = e || d;
					if(!e) {
						message = "Delete data from " + table + " Successful";
					}
					else {
						message = "Delete data from " + table + " Fail";
					}

					rs.setResult(rscode);
					rs.setMessage(message);
					rs.setData(rsdata);

					callback(false, rs);
				});
				break;

			default:
				rsdata = msg;
				message = "Debug Message";
				rs.setResult(0);
				rs.setMessage(message);
				rs.setData(rsdata);

				callback(false, rs);
				break;
		}

		return true;
	}
	else {
		pass = 'newDataset';
	}

	switch (pass) {
		case 'newDataset':
			var label = msg.query.label;
			var response = msg.query.response
			this.newDataset(msg.body, label, response, function(err, data) {
				var rscode = !err? 1: 0;
				var rsdata = err || data;
				if(!err) {
					message = "Set new Dataset Successful";

				}
				else {
					message = "Set new Dataset Fail";
				}

				rs.setResult(rscode);
				rs.setMessage(message);
				rs.setData(rsdata);

				callback(false, rs);
			});

			break;

		case 'FIND':
			this.db.find(table, query, function(err, data) {
				var rscode = !err? 1: 0;
				var rsdata = err || data;
				if(!err) {
					message = "Find Table Data Successful";

				}
				else {
					message = "Find Table Data Fail";
				}

				rs.setResult(rscode);
				rs.setMessage(message);
				rs.setData(rsdata);

				callback(false, rs);
			});
			break;
		case 'LIST3':
			if (sql) {
				this.db.sql(sql, function(err, data) {
					var rscode = !err? 1: 0;
					var rsdata = err || data;
					if(!err) {
						message = "SQL Execute Successful";

					}
					else {
						message = "SQL Execute Fail";
					}

					rs.setResult(rscode);
					rs.setMessage(message);
					rs.setData(rsdata);

					callback(false, rs);
				});
			}
			else {
				this.db.listTable(function(err, data) {
					var rscode = !err? 1: 0;
					var rsdata = err || data;
					if(!err) {
						message = "List All Table Successful";

					}
					else {
						message = "List All Table Fail";
					}

					rs.setResult(rscode);
					rs.setMessage(message);
					rs.setData(rsdata);

					callback(false, rs);
				});
			}
			break;
		case 'GET3':
			this.db.getTable(table, function(err, data) {
				var rscode = !err? 1: 0;
				var rsdata = err || data;
				if(!err) {
					message = "Get Table Schema Successful";

				}
				else {
					message = "Get Table Schema Fail";
				}

				rs.setResult(rscode);
				rs.setMessage(message);
				rs.setData(rsdata);

				callback(false, rs);
			});
			break;
		case 'POST3':
			var schema = body;
			this.db.postTable(table, schema, function(err, data) {
				var rscode = !err? 1: 0;
				var rsdata = err || data;
				if(!err) {
					message = "Create Table Successful";

				}
				else {
					message = "Create Table Fail";
				}

				rs.setResult(rscode);
				rs.setMessage(message);
				rs.setData(rsdata);

				callback(false, rs);
			});
			break;
		case 'PUT3':
			var schema = body;
			this.db.putTable(table, schema, function(err, data) {
				var rscode = !err? 1: 0;
				var rsdata = err || data;
				if(!err) {
					message = "Modify Table Successful";

				}
				else {
					message = "Modify Table Fail";
				}

				rs.setResult(rscode);
				rs.setMessage(message);
				rs.setData(rsdata);

				callback(false, rs);
			});
			break;
		case 'DELETE3':
			this.db.deleteTable(table, function(err, data) {
				var rscode = !err? 1: 0;
				var rsdata = err || data;
				if(!err) {
					message = "Delete Table Successful";

				}
				else {
					message = "Delete Table Fail";
				}

				rs.setResult(rscode);
				rs.setMessage(message);
				rs.setData(rsdata);

				callback(false, rs);
			});
			break;
		case 'LIST4':
			this.db.pageData(table, query, function(err, data) {
				var rscode = !err? 1: 0;
				var rsdata = err || data;
				if(!err) {
					message = "List Data in " + table + " Successful";

				}
				else {
					message = "List Data in " + table + " Fail";
				}

				rs.setResult(rscode);
				rs.setMessage(message);
				rs.setData(rsdata);

				callback(false, rs);
			});
			break;
		case 'GET4':
			if(id.toLowerCase() == 'clean') {
				this.db.cleanTable(table, function(err, data) {
					var rscode = !err? 1: 0;
					var rsdata = err || data;
					if(!err) {
						message = "Table Clean: " + table;

					}
					else {
						message = "Table Clean: " + table + " Fail";
					}

					rs.setResult(rscode);
					rs.setMessage(message);
					rs.setData(rsdata);

					callback(false, rs);
				});
			}
			else {
				this.db.getData(table, id, function(err, data) {
					var rscode = !err? 1: 0;
					var rsdata = err || data;
					if(!err) {
						message = "Get Data from " + table + " Table Successful";

					}
					else {
						message = "Get Data from " + table + " Table Fail";
					}

					rs.setResult(rscode);
					rs.setMessage(message);
					rs.setData(rsdata);

					callback(false, rs);
				});
			}
			break;
		case 'POST4':
			var data = body;
			this.db.postData(table, body, function(err, data) {
				var rscode = !err? 1: 0;
				var rsdata = err || data;
				if(!err) {
					message = "Insert Data into " + table + " Successful";

				}
				else {
					message = "Insert Data into " + table + " Fail";
				}

				rs.setResult(rscode);
				rs.setMessage(message);
				rs.setData(rsdata);

				callback(false, rs);
			});
			break;
		case 'PUT4':
			var data = body;
			if (query) {
				this.db.updateData(table, id, data, function(err, data) {
					var rscode = !err? 1: 0;
					var rsdata = err || data;
					if(!err) {
						message = "Update Data from " + table + " Successful";

					}
					else {
						message = "Update Data from " + table + " Fail";
					}

					rs.setResult(rscode);
					rs.setMessage(message);
					rs.setData(rsdata);

					callback(false, rs);
				});
			}
			else {
				this.db.putData(table, id, data, function(err, data) {
					var rscode = !err? 1: 0;
					var rsdata = err || data;
					if(!err) {
						message = "Update or Insert Data into " + table + " Successful";

					}
					else {
						message = "Update or Insert Data into " + table + " Fail";
					}

					rs.setResult(rscode);
					rs.setMessage(message);
					rs.setData(rsdata);

					callback(false, rs);
				});
			}
			break;
		case 'DELETE4':
			if(id === undefined) {
				this.db.cleanTable(table, function(e, d) {
					var rscode = !e? 1: 0;
					var rsdata = e || d;
					if(!e) {
						message = "Clean Table: " + table + " Successful";
					}
					else {
						message = "Clean Table: " + table + " Fail";
					}

					rs.setResult(rscode);
					rs.setMessage(message);
					rs.setData(rsdata);

					callback(false, rs);
				});
			}
			else {
				this.db.deleteData(table, id, function(err, data) {
					var rscode = !err? 1: 0;
					var rsdata = err || data;
					if(!err) {
						message = "Delete Data from " + table + " Successful";

					}
					else {
						message = "Delete Data from " + table + " Fail";
					}

					rs.setResult(rscode);
					rs.setMessage(message);
					rs.setData(rsdata);

					callback(false, rs);
				});
			}
			break;

		default:
			rsdata = msg;
			message = "Debug Message";
			rs.setResult(0);
			rs.setMessage(message);
			rs.setData(rsdata);

			callback(false, rs);
			break;
	}

	return true;
};

Bot.prototype.newDataset = function(dataset, label, response) {
	var table = this.randomID(16);
	var rs = {"name": table, "label": label};
	var rows = [];

	for(var i = 1; i < dataset.length; i++) {
		var row = this.parseRow(dataset[0], dataset[i]);
		rows.push(row);
	}
	this.db.postData(rs, rows);
	if(response) {
		rs.data = rows;
	}

	return rs;
};

Bot.prototype.parseRow = function(column, rowdata) {
/*
type1:
	{"key1": "value", "key2": "value", "key3": "value"}
type2:
	[{"attr": "", "value": ""}, {"attr": "", "value": ""}, {"attr": "", "value": ""}]
type3:
	["", "", "", ""]
*/

	var row = {};

	if(util.isArray(rowdata)) {
		for(var k in column) {
			row[column[k]] = rowdata[k];
		}
	}
	else if(typeof(rowdata) == 'object') {
		row = rowdata;
	}

	return row;
};

Bot.prototype.mergeData = function() {

};

Bot.prototype.innerJoin = function() {

};

Bot.prototype.leftJoin = function() {

};

Bot.prototype.rightJoin = function() {

};

Bot.prototype.fullJoin = function() {

};

module.exports = Bot;
