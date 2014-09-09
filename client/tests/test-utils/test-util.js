angular.module('test-util', [])
.factory('qUtil', function($q){
	return {
		resolvedPromise: function(resolvedValue) {
			var deferred = $q.defer();
        	deferred.resolve(resolvedValue);
        	return deferred.promise;
		}
	}
});
