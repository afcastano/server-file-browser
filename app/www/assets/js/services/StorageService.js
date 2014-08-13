"use strict";
angular.module('simple-todo')
.factory('storageService', ['$rootScope', function($rootScope) {
	
		//TODO Create a hoodie service or find a way to load the data.
		hoodie.store.findOrAdd('todo-list','testuser');

		var service = {};

		service.save = function(model){
			hoodie.store.update('todo-list', 'testuser' ,model);
		};

		service.load = function(callback){
			hoodie.store.findAll('todo-list').done(function(data){
				var models = [];
				for( var i in data[0] ) {
					if(!isNaN(parseInt(i))){
						models.push(data[0][i]);
					}
				}

				callback(models);
			});
		};

		return service;
	}]);