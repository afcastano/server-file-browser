var express = require('express');

var fs = require('fs');
var app = express();
var env = require(__dirname + '/../' + process.argv[2]);
var versionProp = require(__dirname + '/../package.json');



var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use( bodyParser.urlencoded({
	extended: true
}) );


app.get('/api/list', function(req, res){

	var structure = getRecursive(req.query.dir);

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

app.post('/api/move', function(req, res){
	console.log(req.body.origin);
	console.log(req.body.target);
	console.log(req.body.file);

	fs.renameSync(req.body.origin + '/' + req.body.file, req.body.target + '/' + req.body.file);

	res.send('OK');
});

app.use(express.static(__dirname + "/www"));


function getRecursive(dir){
	var contents = [];
	var files = fs.readdirSync(dir);
	for(var i = 0; i < files.length; i ++) {
		var fileName = files[i];
		var fullPath = dir + '/' + fileName;
		var isDir = fs.lstatSync(fullPath).isDirectory();

		var fileDto = {
			label: fileName,			
			id: fullPath,
			dir: dir,
			isDir: isDir,
			children: []
		}

		if(isDir) {
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
