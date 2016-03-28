var qfs = require('q-io/fs');
var _ = require('underscore');
var Q = require('q');
var path = require('path');

module.exports =(function(){

	function isHidden(path) {
		var isHidden = /^\./.test(path);
		return !isHidden;
	}

	function loadFileDto(fileName, dir){
		return qfs.stat(dir+'/'+fileName).then(function(stats){
			return fileDto(fileName, dir, stats);
		});
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



	function dirStat(path) {
		return listFiles(path, true)
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

			return Q.all(promises).then(function(subDirStats){
				_.each(subDirStats, function(subDirStat){
					totalStat.size = totalStat.size + subDirStat.size;
				});

				return totalStat;

			});

		});

	};


	function fullStat(path) {

		qfs.exists(path).then(function(exists){
			if(!exists) {
				var deferred = Q.defer();
				deferred.resolve(undefined);
				return deferred.promise;
			}
		});

		return qfs.stat(path).then(function(stats){
			if(stats.isDirectory()){
				return dirStat(path);
			}else{
				return fileDto(undefined, path, stats);
			}
		});
	};

	function isHidden(path) {
		var isHidden = /^\./.test(path);
		return !isHidden;
	};

	function loadFileDto(fileName, dir){
		return qfs.stat(dir+'/'+fileName).then(function(stats){
			return fileDto(fileName, dir, stats);
		});
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

	function listFiles(path, includeHidden) {
		return qfs.list(path)
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

			return Q.all(promises);

		});
	};

	function copyFile(originPath, targetPath) {
		return fullStat(originPath).then(function(fullStats){
			return !fullStats.isDir ? qfs.copy(originPath, targetPath) : qfs.copyTree(originPath, targetPath);
		});
	};

	function removeFile(filePath) {
		return fullStat(filePath).then(function(stats){
			return  stats.isDir ? qfs.removeTree(filePath) : qfs.remove(filePath);
		});
	};

	function mkDir(filePath) {
		return qfs.makeDirectory(filePath);
	};

    function saveSubtitle(subtitleProperties, files){
        if(!files) {
            return Q.reject({message: 'No files were selected!'});
        }

        if(Object.keys(files).length > 1) {
            return Q.reject({message: 'More than one file was selected!'});
        }

        var subtitleName = Object.keys(files)[0];
        var subtitleData = files[subtitleName];

        var existingFileExt = path.extname(subtitleProperties.existingFileName);
        var subtitleExt = path.extname(subtitleName);

        if(existingFileExt == subtitleExt) {
            return Q.reject({message: 'The subtitle can not have same extension as the target file.'});
        }


        var newSubtitleName = path.basename(subtitleProperties.existingFileName, existingFileExt) + subtitleExt;
        var newSubtlFullPath = subtitleProperties.targetDir + '/' + newSubtitleName;

        return qfs.write(newSubtlFullPath, subtitleData.data);
    };

	return {
		listFiles: listFiles,
		fullStat: fullStat,
		removeFile: removeFile,
		copyFile: copyFile,
		mkDir: mkDir,
        saveSubtitle: saveSubtitle
	}
})();