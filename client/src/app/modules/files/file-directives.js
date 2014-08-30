angular.module('sfb-files').
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
			$scope.modalData = {};

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