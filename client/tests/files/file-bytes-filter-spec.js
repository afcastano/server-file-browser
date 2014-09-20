describe('Unit: bytes', function() {
	var bytesFilter;
	// Load the module with filter
	beforeEach(module('sfb-files'));

	beforeEach(inject(function($filter){
		bytesFilter = $filter('bytes');
	}));


	it('Should format bytes properly', function(){
		expect(bytesFilter('123')).toEqual('123.0 bytes');
	});
	it('Should format KB properly', function(){
		expect(bytesFilter('12345')).toEqual('12.1 kB');
	});
	it('Should format MB properly', function(){
		expect(bytesFilter('12345678')).toEqual('11.8 MB');
	});
	it('Should format GB properly', function(){
		expect(bytesFilter('12345678901')).toEqual('11.5 GB');
	});

});