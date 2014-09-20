describe('Unit: filesController', function() {
  
	var ctrl, scope, fileDataService;

	// Load the module with MainController
	beforeEach(module('sfb-files'));
	beforeEach(module('file-mock'));
	beforeEach(module('common-mock'));


	// inject the $controller and $rootScope services
	// in the beforeEach block
	beforeEach(inject(function($controller, $rootScope, mockFileServices, mockCommonServices) {
		// Create a new scope that's a child of the $rootScope
		scope = $rootScope.$new();

		//I need to spy on this one.
		fileDataService = mockFileServices.fileDataService;

		// Create the controller
		ctrl = $controller('filesController', {
			$scope: scope,
			fileDataService: fileDataService,
			configService: mockCommonServices.configService
		});
	}));


	it('should initialize the controller properly', 
		function() {
			scope.initialize();
			scope.$digest();
			expect(scope.rootOrigin).toEqual('originDir');
			expect(scope.originDir).toEqual('originDir');
			expect(scope.rootTarget).toEqual('targetDir');
			expect(scope.targetDir).toEqual('targetDir');
			expect(scope.version).toEqual('versionRet');

		}
	);

	it('Should watch changes on the tree model', function() {
		scope.initialize();
		scope.$digest();
		scope.originTree = {
			currentNode: {
				label: 'originL',
				dir: 'originDir'
			}	
		};

		scope.targetTree = {
			currentNode: {
				label: 'targetL',
				dir: 'targetDir',
				isDir: false
			}
		};

		scope.$digest();

		expect(scope.originFile).toEqual('originL');
		expect(scope.originDir).toEqual('originDir');
		expect(scope.targetDir).toEqual('targetDir');

		scope.targetTree.currentNode = {
				label: 'targetFile',
				dir: 'targetDir',
				isDir: true
		}

		scope.$digest();
		expect(scope.targetDir).toEqual('targetDir/targetFile');

	});

	it('Should delegate to the file service to copy the files', function(){
		scope.originDir = 'oDir';
		scope.targetDir = 'tDir';
		scope.originFile = 'oFile';
		spyOn(fileDataService, 'copy').andCallThrough();
		scope.copyFile();
		expect(fileDataService.copy).toHaveBeenCalledWith({origin: 'oDir', target:'tDir', file:'oFile'});
	}); 

	it('Should open dialog when mehtod called', function(){
		scope.createNewDir=false;
		scope.chooseDir();
		expect(scope.createNewDir).toEqual(true);	
	});

	it('Should load the selected node on copy end', function(){
		scope.targetNode = {
			isDir: true
		};
		
		spyOn(scope,'onNodeExpanded');

		scope.onCopyEnd();

		expect(scope.onNodeExpanded).toHaveBeenCalledWith(scope.targetNode);

	});

	it('Should load the parent node on copy end', function(){
		var parent = {};

		scope.targetNode = {
			isDir: false,
			parent: parent
		};
		
		spyOn(scope,'onNodeExpanded');

		scope.onCopyEnd();

		expect(scope.onNodeExpanded).toHaveBeenCalledWith(scope.targetNode.parent);

	});

	it('Should load the base node when the parent is null', function(){
		var parent = null;

		scope.targetNode = {
			isDir: false,
			parent: parent
		};
		
		spyOn(scope,'loadTargetFiles');

		scope.onCopyEnd();

		expect(scope.loadTargetFiles).toHaveBeenCalled();

	});

	it('Should load the base node when there is no selected node', function(){

		scope.targetNode = null;
		
		spyOn(scope,'loadTargetFiles');

		scope.onCopyEnd();

		expect(scope.loadTargetFiles).toHaveBeenCalled();

	});
});