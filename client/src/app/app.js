angular.module('server-explorer', ['angularTreeview', 'btford.socket-io'])
.factory('serverSocket', ['socketFactory', function(socketFactory){
	return socketFactory();
}])
.controller('filesController', ['$scope', '$http', 'serverSocket',
	function($scope, $http, serverSocket) {

		$scope.dialogText = "Loading...";

		$scope.initialize = function() {
			$http.get('/api/defaultpath').success(function(data){
				//$scope.treedata = data;
					$scope.rootOrigin = data.origin;
					$scope.originDir = data.origin;
					$scope.rootTarget = data.target;
					$scope.targetDir = data.target;
			});

			$http.get('/api/version').success(function(data){
				$scope.version = data;
			});

			$scope.$watch( 'originTree.currentNode', function( newObj, oldObj ) {
			    if( $scope.originTree && angular.isObject($scope.originTree.currentNode) ) {
			        $scope.originFile = $scope.originTree.currentNode.label;
			        $scope.originDir = $scope.originTree.currentNode.dir;
			        console.log($scope.originFile);
			        console.log($scope.originDir);
			    }
			}, false);
			
			$scope.$watch( 'targetTree.currentNode', function( newObj, oldObj ) {
			    if( $scope.targetTree && angular.isObject($scope.targetTree.currentNode) ) {
			    	var node = 	$scope.targetTree.currentNode;
			    	if(node.isDir) {
			    		$scope.targetDir = node.dir + '/' + node.label;	
			    	} else {
			    		$scope.targetDir = node.dir;
			    	}
			        
			        console.log($scope.targetDir);
			    }
			}, false);

		};

		$scope.onNodeExpanded = function(node) {
			$('#loadingWidget').modal('show');
			$http.get('/api/list?dir=' + node.id).success(function(data){

				$scope.collapseAll(data);

				node.children = data;
				$('#loadingWidget').modal('hide');
			}).error(function(err){
				$('#loadingWidget').modal('hide');
				alert('Error: ' + err);
				
			});
		};

		$scope.collapseAll = function(data) {
			_.each(data, function(node){
				node.collapsed = true;
				if(node.children) {
					$scope.collapseAll(node.children);
				}
			});

		};

		$scope.loadOriginFiles = function() {
			$('#loadingWidget').modal('show');
			$http.get('/api/list?dir=' + $scope.rootOrigin).success(function(data){

				$scope.collapseAll(data);

				$scope.origindata = data;
				$('#loadingWidget').modal('hide');
			}).error(function(err){
				$('#loadingWidget').modal('hide');
				alert('Error: ' + err);
				
			});
		};

		$scope.loadTargetFiles = function() {
			$('#loadingWidget').modal('show');
			$http.get('/api/list?dir=' + $scope.rootTarget).success(function(data){
				$scope.collapseAll(data);
				$scope.targetdata = data;
				$('#loadingWidget').modal('hide');
			}).error(function(err){
				$('#loadingWidget').modal('hide');
				alert('Error: ' + err);
			});
		};

		serverSocket.on('copyEnd', function(msg){
			console.log('Copy OK: ' + msg);
			$scope.loadOriginFiles();
			$scope.loadTargetFiles();
			$('#loadingWidget').modal('hide');
			$scope.dialogText = "Loading...";
		});

		serverSocket.on('copyError', function(err){
			console.log(err);
			$('#loadingWidget').modal('hide');
			$scope.dialogText = "Loading...";
			alert('Error: ' + err);

		});

		serverSocket.on('copyProgress', function(data){
			var percentage = Math.floor((data.copied/data.total)*100);
			$scope.dialogText='Transfered ' + percentage + '%';
		});

		$scope.copyFile = function() {
			$('#loadingWidget').modal('show');
			$http.post('/api/copy', {origin: $scope.originDir, target: $scope.targetDir, file: $scope.originFile})
			.error(function(err){
				$('#loadingWidget').modal('hide');
				alert('Error: ' + err);
			});
		};

		$scope.deleteFile = function() {
			$('#loadingWidget').modal('show');
			$http.delete('/api/file?path=' + $scope.originDir + '/' + $scope.originFile)
			.success(function(){
				$('#loadingWidget').modal('hide');
				$scope.loadOriginFiles();
			}).error(function(err){
				$('#loadingWidget').modal('hide');
				alert('Error: ' + err);
			});
		};


	}
]);