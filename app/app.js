var express = require('express');


var qfs = require('q-io/fs');
var Q = require('q');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var env = require(__dirname + '/../' + process.argv[2]);
var versionProp = require(__dirname + '/../package.json');
var async = require('async');
var _ = require('underscore');


var bodyParser = require('body-parser');

function fullStat(path) {

	var deferred = Q.defer();

	qfs.exists(path).then(function(exists){
		if(!exists) {
			deferred.resolve(undefined);
		}
	});

	qfs.stat(path).then(function(stats){
		if(stats.isDirectory()){	
			deferred.resolve(dirStat(path));
		}else{
			deferred.resolve(fileDto(undefined, path, stats));
		}
	}).fail(deferred.reject);

	return deferred.promise;
}

function dirStat(path) {
	var deferred = Q.defer();

	listDirFiles(path, true)
	.then(function(filesDto){

		var promises = [];
		var totalStat = {
			size: 0,
			isDir: true,
			id: path
		}

		_.each(filesDto, function(fileDto){
			if(fileDto.isDir) {
				promises.push(dirStat(fileDto.id));
			} else {
				totalStat.size = totalStat.size + fileDto.size;
			}
		});

		Q.all(promises).then(function(subDirStats){
			_.each(subDirStats, function(subDirStat){
				totalStat.size = totalStat.size + subDirStat.size;	
			});
			deferred.resolve(totalStat);

		}).fail(deferred.reject);

	}).fail(deferred.reject);

	return deferred.promise;
}

var monitorFile = function(file, totalSize) {
	return setInterval(function(){

		fullStat(file)
		.then(function(stats){
			io.sockets.emit('copyProgress', {copied: stats.size, total: totalSize});	
		})
		.fail(function(err){
			console.log("Error thrown on copy " + err.stack);
   			io.sockets.emit('copyError',err.message);
		});

	}, 200);
}

var isDir = function(filePath) {
	return stats(filePath).isDir;
}

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use( bodyParser.urlencoded({
	extended: true
}) );


function listDirFiles(path, includeHidden) {
	var deferred = Q.defer();

	qfs.list(path)
	.then(function(files){
		
		var promises = _.chain(files)
		.filter(function(fileName){

			if(includeHidden) {
				return true;
			}

			return isHidden(fileName);

		}).map(function(fileName){
			return loadFileDto(fileName, path);
		}).value();

		Q.all(promises).then(deferred.resolve)
		.fail(deferred.reject);
			
	}).fail(deferred.reject);

	return deferred.promise;
}

app.get('/api/list', function(req, res){
	
	var dir = req.query.dir;
	listDirFiles(dir,false)
	.then(function(result){
		res.send(result);
	})
	.fail(function(err){
		console.log(err);
		res.status(500).send(err.message);	
	});	 

});

function isHidden(path) {
	var isHidden = /^\./.test(path);
	return !isHidden;	
}

function loadFileDto(fileName, dir){
	var deferred = Q.defer();

	var fullPath = dir + '/' + fileName;
	
	qfs.stat(fullPath).then(function(stats){
		deferred.resolve(fileDto(fileName, dir, stats));
	}).fail(function(err){
		deferred.reject(err);
	});

	return deferred.promise;
};

function fileDto(fileName, dir, stats) {
	return {
			label: fileName,			
			id: dir + '/' + fileName,
			isDir: stats.isDirectory(),
			size: stats.size,
			dir: dir,
			children: []
	}
};


app.get('/api/defaultpath', function(req, res) {
	res.send({
		origin: env.origin,
		target: env.target
	})
});

app.get('/api/version', function(req, res){
	res.send(versionProp.version);
});

app.post('/api/copy', function(req, res){
	var filePath = req.body.origin + '/' + req.body.file;
	var targetPath = req.body.target + '/' + req.body.file;
	res.send('OK');

	fullStat(filePath).then(function(fullStats){
		if(fullStats.isDir){
			copyDir(filePath, targetPath, fullStats);
		} else {
			copyFile(filePath, targetPath, fullStats);
		}
	}).fail(function(err){
		console.log("Error thrown on copy " + err.stack);
		io.sockets.emit('copyError', err.message);
	});
	
});

function copyFile(originPath, targetPath, originStats) {
	var interval = monitorFile(targetPath, originStats.size);
	qfs.copy(originPath, targetPath).then(function(){
		console.log('Copy file ok!');
  		clearInterval(interval);
  		io.sockets.emit('copyEnd', originPath);	
	}).fail(function(err){
		console.log("Error thrown on copy " + err.stack);
		io.sockets.emit('copyError',err.message);
		clearInterval(interval);	
	});	
}

function copyDir(originPath, targetPath, originStats) {
	var interval = monitorFile(targetPath, originStats.size);
	qfs.copyTree(originPath, targetPath).then(function(){
  		console.log('Copy dir ok!');
  		clearInterval(interval);
		io.sockets.emit('copyEnd', originPath);	
	}).fail(function(err){
		console.log("Error thrown on copy " + err.stack);
		io.sockets.emit('copyError',err.message);
		clearInterval(interval);
  	});
}

app.delete('/api/file', function(req, res){

	var filePath =  req.query.path;
	fullStat(filePath)
	.then(function(stats){

		var promise = stats.isDir ? qfs.removeTree(filePath) : qfs.remove(filePath);

		promise.then(function(){
			console.log('delete ok!')
			res.send('OK');
		})
		.fail(function(err){
			console.log("Error thrown deleting " + err.stack);
			res.status(500).send(err.message);
		});

	})
	.fail(function(err){
		console.log("Error thrown deleting " + err.stack);
		res.status(500).send(err.message);	
	});

});

app.use(express.static(__dirname + "/www"));

io.on('connection', function(socket){
	console.log('A user connected');
	
});

var server = http.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
