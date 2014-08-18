var express = require('express');

var fs = require('fs.extra');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var env = require(__dirname + '/../' + process.argv[2]);
var versionProp = require(__dirname + '/../package.json');
var async = require('async');


var bodyParser = require('body-parser');

var stats = function(filePath) {
	var stats = fs.lstatSync(filePath); 

	return {
		isDir: stats.isDirectory(),
		size: stats.size 
	};
}

var monitorFile = function(file, totalSize) {
	return setInterval(function(){
		var data = stats(file);
		if(data.isDir) {

			getDirStats(file, function (err, data){
				
				if (err) {
					console.log("Error thrown on copy " + err);
		   			io.sockets.emit('copyError',err.message);
		   			return;
		  		}

		  		if(data === undefined) {
		  			return;
		  		}

				console.log('Size: ' + data.size + ' files: ' + data.numberOfFiles);
				io.sockets.emit('copyProgress', {copied: data.size, total: totalSize});	
			});

		}else {
			io.sockets.emit('copyProgress', {copied: data.size, total: totalSize});						
		}

	}, 200);
}

var isDir = function(filePath) {
	return stats(filePath).isDir;
}

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use( bodyParser.urlencoded({
	extended: true
}) );


app.get('/api/list', function(req, res){

	getContents(req.query.dir, function (content){
		
			res.send(content);
			
	});

});

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
	console.log(req.body.origin);
	console.log(req.body.target);
	console.log(req.body.file);

	var filePath = req.body.origin + '/' + req.body.file;
	var targetPath = req.body.target + '/' + req.body.file;
	res.send('OK');
	
	try {

		var data = stats(filePath);
		console.log('start copying');

		if(data.isDir){

			getDirStats(filePath, function(err, dirData){

				if (err) {
					console.log("Error thrown on copy " + err);
		   			io.sockets.emit('copyError',err.message);
		   			return;
		  		}

				var interval = monitorFile(targetPath, dirData.size);
				fs.copyRecursive(filePath, targetPath, function(err){
					if (err) {
						console.log("Error thrown on copy " + err);
			   			io.sockets.emit('copyError',err.message);
			   			clearInterval(interval);
			   			return;
			  		}
			  		console.log('Copy dir ok!');
			  		clearInterval(interval);
					io.sockets.emit('copyEnd',req.body.file);	
				});
			});


		} else {
			// setTimeout(function(){
				var interval = monitorFile(targetPath, data.size);
				fs.copy(filePath, targetPath, function(err){
					if (err) {
						console.log("Error thrown on copy " + err);
			   			io.sockets.emit('copyError',err.message);
			   			clearInterval(interval);
			   			return;
			  		}
			  		console.log('Copy file ok!');
			  		clearInterval(interval);
			  		io.sockets.emit('copyEnd',req.body.file);
						
				});
			// }, 5000);
		}	

	}catch(err) {
		console.log("Error thrown on copy " + err);
		io.sockets.emit('copyError',err.message);
		return;
	}
	

	
});

app.delete('/api/file', function(req, res){
	try {

		var filePath =  req.query.path;
		
		if(isDir(filePath)) {
			fs.rmrf(filePath, function(err){
				if (err) {
					console.log("Error thrown deleting " + err);
			 		res.status(500).send(err.message);
					return;
				}
				console.log('delete dir ok!')
				res.send('OK');
			});
		} else {
			fs.unlink(filePath, function(err){
				if (err) {
					console.log("Error thrown deleting " + err);
			 		res.status(500).send(err.message);
					return;
				}
				console.log('delete file ok!')
				res.send('OK');
			});
		}

	}catch(err) {
		console.log("Error thrown deleting " + err);
		res.status(500).send(err.message);
		return;
	}

});

app.use(express.static(__dirname + "/www"));

function getContents(dir, cb) {
	fs.readdir(dir,function(err, files){
		var contents = [];
		files = files || [];
		for(var i = 0; i < files.length; i ++) {
			var fileName = files[i];
			var fullPath = dir + '/' + fileName;

			var data = stats(fullPath);
			var isHidden = /^\./.test(fileName);

			if(isHidden) {
				continue;
			}

			var fileDto = {
				label: fileName,			
				id: fullPath,
				isDir: data.isDir,
				size: data.size,
				dir: dir,
				children: []
			}

			contents.push(fileDto);
		}

		cb(contents);	
	});
}

function getDirStats(dir, cb){
	var exists = fs.existsSync(dir);
	if(!exists) {
		cb(undefined,undefined);
		return;
	}

	fs.readdir(dir, function(err, files){

		if(err){
			cb(err);
			return;	
		}

		var dirStats = {
			id: dir,
			numberOfFiles: 0,
			size: 0,
			add: function(newStats) {
				this.numberOfFiles = this.numberOfFiles + newStats.numberOfFiles;
				this.size = this.size + newStats.size;
			}
		}

		var dirs = [];	
		async.eachSeries(files, function(fileName, next){

			var fullPath = dir + '/' + fileName;
			var data = stats(fullPath);
			var isHidden = /^\./.test(fileName);
			if(isHidden) {
				next();
			}

			if(data.isDir) {
				dirs.push(fullPath);
				next();
			} else {
				dirStats.numberOfFiles = dirStats.numberOfFiles + 1;
				dirStats.size = dirStats.size + data.size;
				next();
			}

		}, function(err){
			if(err){
				cb(err);
				return;	
			}
		});

		var totalDirs = dirs.length;

		if(totalDirs == 0) {
			cb(undefined, dirStats);
			return;
		}

		async.each(dirs, function(curr, next){
			getDirStats(curr, function(err, newStats){

				if(err) {
					cb(err);
					return;
				}

				dirStats.add(newStats);
				totalDirs = totalDirs - 1;

				if(totalDirs === 0) {
					cb(undefined, dirStats);	
				}
				
			});

			next();

		}, function(err){
			if(err){
				cb(err);
				return;
			}
		});

		

		

	});

}

io.on('connection', function(socket){
	console.log('A user connected');
	
});

var server = http.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
