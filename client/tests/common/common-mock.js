angular.module('common-mock', ['test-util'])
.factory('mockCommonServices', function(qUtil){
	return {
		configService: {
			
			getVersion : function() {
				return qUtil.resolvedPromise('versionRet');
			}

		}
	}
});