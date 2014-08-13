angular.module('simple-todo')
.controller('listsController', ['$scope', 'parserService', function($scope, parserService) {
	
		$scope.$on('markdownLoaded', function(event, info){
			$scope.init();
		});

		$scope.$on('dbModfiedRemotely', function(event, info){
			$scope.$apply(function(){
				$scope.init();
			});
		});

		$scope.init = function(){
			$scope.listTitles = parserService.getListTitles();
		};

}]);