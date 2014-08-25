angular.module('sfb-common', ['btford.socket-io'])
.factory('serverSocket', ['socketFactory', function(socketFactory){
	return socketFactory();
}]);