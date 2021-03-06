var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var env = require(__dirname + '/../../' + process.argv[2]);
var versionProp = require(__dirname + '/../../package.json');
var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');

var Files = require('./modules/Files');



app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use( bodyParser.urlencoded({
	extended: true
}) );

app.use(fileUpload());

app.use(express.static(__dirname + "/../../client/build"));

io.on('connection', function(socket){
	console.log('A user connected');

});

var server = http.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});


var monitorFile = function(originFile, targetFile) {

	return Files.fullStat(originFile).then(function(stats){

		return setInterval(function(){

			Files.fullStat(targetFile).then(function(targetStats){
				io.sockets.emit('copyProgress', {copied: targetStats.size, total: stats.size});

			}).fail(function(err){
				console.log("Error thrown on copy " + err.stack);
	   			io.sockets.emit('copyError',err.message);

			});

		}, 200);

	});
};

app.get('/api/list', function(req, res){

	var dir = req.query.dir;

	Files.listFiles(dir,false).then(function(result){
		res.send(result);

	}).fail(function(err){
		console.log(err.stack);
		res.status(500).send(err.message);

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
	var filePath = req.body.origin + '/' + req.body.file;
	var targetPath = req.body.target + '/' + req.body.file;
	res.send('OK');


	//Here I am setting the interval for the progress of the copy.
	console.log('Copying file: ' + filePath);
	var intervalPromise = monitorFile(filePath, targetPath);

	Files.copyFile(filePath, targetPath).then(function(){
		io.sockets.emit('copyEnd', filePath);

	}).fail(function(err){
		console.log("Error thrown on copy " + err.stack);
		io.sockets.emit('copyError', err.message);

	}).fin(function(){
		intervalPromise.then(function(interval){
			clearInterval(interval);
			console.log('Copy finished');
		});

	});

});

app.post('/api/subtitle', function(req, res){
    Files.saveSubtitle(req.body, req.files).then(function(){
        console.log('Subtitle uploaded ok');
        res.send({status: 'OK'});
        return;
    }).fail(function(err){
        console.log('failed upload');
        res.status(500).send(err.message);
        return;
    });

});


app.delete('/api/file', function(req, res){

	var filePath =  req.query.path;
	Files.removeFile(filePath).then(function(){
		console.log('delete ok!')
		res.send('OK');

	}).fail(function(err){
		console.log("Error thrown deleting " + err.stack);
		res.status(500).send(err.message);

	});

});

app.post('/api/mkdir', function(req, res){

	var filePath =  req.query.path;
	Files.mkDir(filePath).then(function(){
		console.log('dir created ok!')
		res.send('OK');

	}).fail(function(err){
		console.log("Error thrown creating " + err.stack);
		res.status(500).send(err.message);

	});

});
