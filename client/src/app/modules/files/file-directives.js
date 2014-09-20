angular.module('sfb-files').
controller('newDirModalCtrl',function($scope, $modalInstance, targetDir, fileDataService) {
		$scope.modalData = {
			targetDir: targetDir,
			newDirName: ""
		};
		
		$scope.ok = function() {
			var newDir = $scope.modalData.targetDir + '/' + $scope.modalData.newDirName;
			fileDataService.mkDir(newDir)
			.then(function(){
				$modalInstance.close(newDir);
			}).catch(function(err){
				$modalInstance.dismiss(err);				
			});
		};

		$scope.cancel = function() {
			$modalInstance.dismiss();
		};

	}).
directive('newDirDialog', function($modal){

	return {
		restrict: 'E',
		scope: {
			targetDir: '=',
			show: '=',
			onAccept: '&accept',
			onError: '&error'
		},
		replace: true,
		link: function($scope, element, attrs) {
			var instance = undefined;
			$scope.$watch('show', function(newVal, oldVal){

				if(newVal == oldVal) {
					return;
				}

				if(newVal) {
					instance = $modal.open({
				  		templateUrl:'/assets/tpl/files/newdir_dialog.tpl.html',
				  		controller: 'newDirModalCtrl',
				  		windowClass: 'modal fade in',
				  		resolve: {
				  			targetDir: function() {
				  				return $scope.targetDir
				  			}	
				  		} 
				  	});

				  	instance.result.then(function(dir){
					  		$scope.onAccept({
					  			dir: dir
					  		});
						},
				  		function(err){
				  			if(err) {
				  				$scope.onError({err: err});	
				  			}
				  			
				  		}).finally(function(){
					  		instance = undefined;
				  			$scope.show = false;
				  		});
				  	
				} else {
					if(instance) {
						instance.opened.then(function(){
							instance.dismiss();
							instance = undefined;
						});
					}
				}
			});

		}
	}
}).
directive('copyDialog', function($modal, copyMonitor, $rootScope) {

	var modalCtrl = function($scope, $modalInstance ) {
		copyMonitor.register(
			{
				onProgress: function(data){
					$scope.data = data;
				}
			}
		);
	}

	return {
		restrict: 'E',
		scope: {
			onEnd: '&end',
			onError: '&error'
		},
		replace: true, // Replace with the template below
		link: function($scope, element, attrs) {

			var instance = undefined;

			copyMonitor.register({
				onError: function(err) {
					$scope.show = false;
					$scope.onError({error: err});
				},
				onEnd: function() {
					$scope.show = false;
					$scope.onEnd({});	
				},
				onProgress: function(data) {
					if(data && data.totalSize && data.percentage != 1){
						$scope.show = true;
					}
				}
			});	

			$scope.$watch('show', function(newVal, oldVal){

				if(newVal == oldVal) {
					return;
				}

				if(newVal) {
				  	instance = $modal.open({
				  		templateUrl:'/assets/tpl/files/progress_dialog.tpl.html',
				  		controller: modalCtrl,
				  		windowClass: 'modal fade in',
				  		size: 'sm'
				  	});
				} else {
					if(instance) {
						instance.opened.then(function(){
							instance.dismiss();
							instance = undefined;
						});
					}
				}

			});	
		}
	};
});