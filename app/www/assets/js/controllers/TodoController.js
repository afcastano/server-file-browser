angular.module('simple-todo')
.controller('todoController', ['$rootScope','$scope', 'parserService', function($rootScope, $scope, parserService) {
	
		$scope.$on('markdownLoaded', function(event, info){
			$scope.initialize();
		});


		$scope.$on('dbModfiedRemotely', function(event, info){
			$scope.$apply(function(){
				$scope.initialize();
			});
			
		});
		

		$scope.addItem = function(todoModel, $index){
			todoModel.items.splice($index+1, 0, {done: false, text: 'Click me to start editing...'});
			$scope.modelUpdated();
		};

		$scope.removeItem = function(todoModel, $index){
			todoModel.items.splice($index, 1);
			$scope.modelUpdated();
		};

		$scope.initialize = function(){
			$scope.todoModels = parserService.getTodoModels();
		};

		$scope.modelUpdated = function(item){
			parserService.modelUpdated();
		};

		$scope.markItem = function(item){
			item.done = !item.done;
			$scope.modelUpdated();
		};

		$scope.moveUp = function(todoModel, $index){
			moveElement(todoModel.items, $index, $index-1);

		};

		$scope.moveDown = function(todoModel, $index){
			moveElement(todoModel.items, $index, $index+1);
		};

		$scope.toggleShowDone = function(todoModel){
			todoModel.hideCompleted = !todoModel.hideCompleted;
			$scope.modelUpdated();
		};

		$scope.toggleShowList = function(todoModel){
			todoModel.hideList = !todoModel.hideList;
			$scope.modelUpdated();
		}

		$scope.showItem = function(todoModel, item){
			
			if(todoModel.hideList){
				return false;
			}

			return !(todoModel.hideCompleted && item.done);
		};

		function moveElement(list, from, to){

			if(from == to || to < 0 || to == list.length){
				return list;
			}

			var element = list[from];
			list.splice(from, 1);
			list.splice(to,0,element);
			$scope.modelUpdated();	
		};

}]);