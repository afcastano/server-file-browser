angular.module('sfb-files')
.controller('filesController', function($scope, configService, fileDataService) {

		$scope.initialize = function() {
			fileDataService.getDefaultPaths().then(function(data){
				$scope.rootOrigin = data.origin;
				$scope.originDir = data.origin;
				$scope.rootTarget = data.target;
				$scope.targetDir = data.target;
			});

			configService.getVersion().then(function(data){
				$scope.version = data;
			});

			$scope.fileSelected = false;

			$scope.$watch( 'originTree.currentNode', function( newObj, oldObj ) {
			    if( $scope.originTree && angular.isObject($scope.originTree.currentNode) ) {
			        $scope.originFile = $scope.originTree.currentNode.label;
			        $scope.originDir = $scope.originTree.currentNode.dir;
			    }
			}, false);
			
			$scope.$watch( 'targetTree.currentNode', function( newObj, oldObj ) {
				$scope.fileSelected = false;
			    if( $scope.targetTree && angular.isObject($scope.targetTree.currentNode) ) {
			    	var node = 	$scope.targetTree.currentNode;
			    	if(node.isDir) {
			    		$scope.targetDir = node.dir + '/' + node.label;	
			    	} else {
			    		$scope.targetDir = node.dir;
    					$scope.fileSelected = true;
			    	}

			    	$scope.targetNode = node;
			        
			    }
			}, false);

		};

		$scope.onDirCreated = function(dir) {
			$scope.loadTargetFiles();
		};

		$scope.onNodeExpanded = function(node) {
			$scope.loading = true;
			fileDataService.listFiles(node.id).then(function(data){
				$scope.collapseAll(data);
				$scope.setParent(node, data);

				node.children = data;
			}).catch(function(err){
				alert('Error: ' + err);
			}).finally(function(){
				node.collapsed = false;
				$scope.loading = false;
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

		$scope.setParent = function(parent,data) {
			_.each(data, function(node){
				node.parent = parent;
			});
		};

		$scope.onCopyError = function(error) {
			console.log(error);
			alert('Error: ' + error);
		}

		$scope.onCopyEnd = function() {
			if($scope.targetNode) {
				if($scope.targetNode.isDir) {
					$scope.onNodeExpanded($scope.targetNode); 
				} else {
					if($scope.targetNode.parent) {
						$scope.onNodeExpanded($scope.targetNode.parent); 
					} else {
						$scope.loadTargetFiles();		
					}
				}
			} else {
				$scope.loadTargetFiles();
			}
		}

		$scope.loadOriginFiles = function() {
			$scope.loading = true;
			fileDataService.listFiles($scope.rootOrigin).then(function(data){

				$scope.collapseAll(data);

				$scope.origindata = data;
			}).catch(function(err){
				alert('Error: ' + err);
				
			}).finally(function(){
				$scope.loading = false;			
			});
		};

		$scope.loadTargetFiles = function() {
			$scope.loading = true;
			fileDataService.listFiles($scope.rootTarget).then(function(data){
				$scope.collapseAll(data);
				$scope.targetdata = data;
				$scope.targetDir = $scope.rootTarget;
			}).catch(function(err){
				alert('Error: ' + err);
			}).finally(function(){
				$scope.loading = false;
			});
		};

		$scope.onDirCreationError = function(err) {
			alert(err);
		};

		$scope.copyFile = function() {
			fileDataService.copy({origin: $scope.originDir, target: $scope.targetDir, file: $scope.originFile})
			.catch(function(err){
				alert('Error: ' + err);
			});
		};

		$scope.deleteFile = function() {
			$scope.loading = true;
			fileDataService.deleteFile($scope.originDir + '/' + $scope.originFile)
			.then(function(){
				$scope.loadOriginFiles();
			}).catch(function(err){
				alert('Error: ' + err);
			}).finally(function(){
				$scope.loading = false;
			});
		};

		$scope.chooseDir = function() {
			$scope.createNewDir=true;			
		};

	}
);