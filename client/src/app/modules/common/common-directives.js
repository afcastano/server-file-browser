angular.module('sfb-common').
directive('loadingDialog', function($modal) {

	var modalController = function($scope, $modalInstance) {
		$scope.dialogText = 'Loading...';
	};

	return {
		restrict: 'E',
		scope: {
			show: '='
		},
		replace: true, // Replace with the template below
		//transclude: true, // we want to insert custom content inside the directive
		link: function($scope, element, attrs) {
		
			var instance = undefined;
			$scope.$watch('show', function(newVal, oldVal){

				if(newVal == oldVal) {
					return;
				}

				if(newVal) {
				  	instance = $modal.open({
				  		templateUrl:'/assets/tpl/common/loading_dialog.tpl.html',
				  		windowClass: 'modal fade in',
				  		controller: modalController,
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