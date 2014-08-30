angular.module('sfb-files')
.filter('bytes', function() {
	return function(bytes, precision) {
		if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
		if (typeof precision === 'undefined') precision = 1;
		var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
			number = Math.floor(Math.log(bytes) / Math.log(1024));
		return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
	}
})
.factory('fileDataService', function(httpQ){
	
	function getDefaultPaths() {
		return httpQ.get('/api/defaultpath');
	}

	function listFiles(dirPath) {
		return httpQ.get('/api/list?dir=' + dirPath);
	}

	function copy(data) {
		return httpQ.post('/api/copy', data);
	}

	function deleteFile(filePath) {
		return httpQ.delete('/api/file?path='+filePath);
	}

	function mkDir(dirPath) {
		return httpQ.post('/api/mkdir?path=' + dirPath);
	}

	return {
		getDefaultPaths: getDefaultPaths,
		listFiles: listFiles,
		copy: copy,
		deleteFile: deleteFile,
		mkDir: mkDir
	}
})
.factory('copyMonitor', function(serverSocket){

	var error = [];
	var end = [];
	var progress = [];

	serverSocket.on('copyEnd', function(msg){
		_.each(end, function(fn){
			fn();
		});
	});

	serverSocket.on('copyError', function(err){
		_.each(error, function(fn){
			fn(err);
		});
	});

	serverSocket.on('copyProgress', function(data){
		var progressData = {
			percentage: data.copied/data.total,
			totalSize: data.total
		};
		_.each(progress, function(fn){
			fn(progressData);
		});
	});

	return {
		register: function(opts) {
			opts.onError && error.push(opts.onError);
			opts.onEnd && end.push(opts.onEnd);
			opts.onProgress && progress.push(opts.onProgress);
		}
	}


});