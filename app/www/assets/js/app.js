"use strict";
angular.module('server-explorer', ['angularTreeview'])
.controller('filesController', ['$scope', '$http', 
	function($scope, $http) {
		
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

		$scope.loadOriginFiles = function() {
			$http.get('/api/list?dir=' + $scope.rootOrigin).success(function(data){
				$scope.origindata = data;
			});
		};

		$scope.loadTargetFiles = function() {
			$http.get('/api/list?dir=' + $scope.rootTarget).success(function(data){
				$scope.targetdata = data;
			});
		};

		$scope.copyFile = function() {
			$http.post('/api/copy', {origin: $scope.originDir, target: $scope.targetDir, file: $scope.originFile})
			.success(function(){
				$scope.loadOriginFiles();
				$scope.loadTargetFiles();
			});
		};

		$scope.deleteFile = function() {
			$http.delete('/api/file?path=' + $scope.originDir + '/' + $scope.originFile)
			.success(function(){
				$scope.loadOriginFiles();
				$scope.loadTargetFiles();
			});
		};


	}
]);