angular.module('file-mock', ['test-util'])
.factory('mockFileServices', function(qUtil){
	return {
		fileDataService: {
			
			getDefaultPaths : function() {
				return qUtil.resolvedPromise({
	        		origin: 'originDir',
	        		target: 'targetDir'
	        	});
			},
			copy : function(data) {
				return qUtil.resolvedPromise();
			}	

		}
	}
});
