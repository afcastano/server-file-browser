var express = require('express');

var fs = require('fs.extra');
var app = express();
var env = require(__dirname + '/../' + process.argv[2]);
var versionProp = require(__dirname + '/../package.json');



var bodyParser = require('body-parser');

var isDir = function(filePath) {
	return fs.lstatSync(filePath).isDirectory();
}

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use( bodyParser.urlencoded({
	extended: true
}) );


app.get('/api/list', function(req, res){

	var structure = getContents(req.query.dir);

	res.send(structure);
	
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

	try {


		if(isDir(filePath)){

			fs.copyRecursive(filePath, req.body.target + '/' + req.body.file, function(err){
				if (err) {
					console.log("Error thrown on copy " + err);
		   			res.status(500).send(err.message);
		   			return;
		  		}
		  		console.log('Copy dir ok!')
		  		res.send('OK');
					
			});

		} else {
			fs.copy(filePath, req.body.target + '/' + req.body.file, function(err){
				if (err) {
					console.log("Error thrown on copy " + err);
		   			res.status(500).send(err.message);
		   			return;
		  		}
		  		console.log('Copy file ok!')
		  		res.send('OK');
					
			});
		}	

	}catch(err) {
		console.log("Error thrown on copy" + err);
		res.status(500).send(err.message);
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

function getContents(dir) {
	var contents = [];
	var files = fs.readdirSync(dir);
	for(var i = 0; i < files.length; i ++) {
		var fileName = files[i];
		var fullPath = dir + '/' + fileName;
		var isDirectory = isDir(fullPath);
		var isHidden = /^\./.test(fileName);

		if(isHidden) {
			continue;
		}

		var fileDto = {
			label: fileName,			
			id: fullPath,
			isDir: isDirectory,
			dir: dir,
			children: []
		}

		contents.push(fileDto);
	}

	return contents;	
}

function getRecursive(dir){
	var contents = [];
	var files = fs.readdirSync(dir);
	for(var i = 0; i < files.length; i ++) {
		var fileName = files[i];
		var fullPath = dir + '/' + fileName;
		var isDirectory = isDir(fullPath);
		var isHidden = /^\./.test(fileName);

		if(isHidden) {
			continue;
		}

		var fileDto = {
			label: fileName,			
			id: fullPath,
			isDir: isDirectory,
			dir: dir,
			children: []
		}

		if(isDirectory) {
			var children = getRecursive(fullPath);
			fileDto.children = fileDto.children.concat(children);		
		}

		contents.push(fileDto);
	}

	return contents;
}

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
