angular.module('sfb-common')
.factory('serverSocket', ['socketFactory', function(socketFactory){
	return socketFactory();
}]);