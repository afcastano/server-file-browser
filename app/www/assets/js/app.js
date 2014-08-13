"use strict";
angular.module('server-explorer', ['angularTreeview'])
.controller('filesController', ['$scope', '$http', 
	function($scope, $http) {
		
		$scope.initialize = function() {
			$http.get('/api/defaultpath').success(function(data){
				//$scope.treedata = data;
					$scope.origin = data.origin;
					$scope.originDir = data.origin;
					$scope.target = data.target;
					$scope.targetDir = $scope.target;
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
			$http.get('/api/list?dir=' + $scope.origin).success(function(data){
				$scope.origindata = data;
			});
		};

		$scope.loadTargetFiles = function() {
			$http.get('/api/list?dir=' + $scope.target).success(function(data){
				$scope.targetdata = data;
			});
		};

		$scope.moveFile = function() {
			$http.post('/api/move', {origin: $scope.originDir, target: $scope.targetDir, file: $scope.originFile})
			.success(function(){
				$scope.loadOriginFiles();
				$scope.loadTargetFiles();
			});
		}


	}
]);