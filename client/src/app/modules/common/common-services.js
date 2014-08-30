angular.module('sfb-common')
.filter('percentage', function ($filter) {
  return function (input, decimals) {
    return $filter('number')(input*100 , decimals) + '%';
  }
})
.factory('serverSocket', function(socketFactory){
	return socketFactory();
})
.factory('configService', function(httpQ){

	return {
		getVersion: function() {
			return httpQ.get('/api/version');
		}
	};
})
.factory('httpQ', function($http, $q){

	//This is needed because the success method handles http errors whilst the then method doesn't.
	//Since the success method doesn't return a promise, I have to translate it.
	function httpToPromise(httpPromise) {
		var deferred = $q.defer();
		try {
			httpPromise.success(function(data){
				deferred.resolve(data);
			}).error(function(err){
				deferred.reject(err)
			});

		} catch (err) {
			deferred.reject(err);				
		}

		return deferred.promise;	
	}


	return {
		get: function(url) {
			return httpToPromise($http.get(url));
		},
		post: function(url, data) {
			return httpToPromise($http.post(url, data));
		},
		delete: function(url) {
			return httpToPromise($http.delete(url));
		}
	}
});