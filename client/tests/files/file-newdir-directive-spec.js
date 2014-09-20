describe('Unit: New dir directive', function() {
	var scope, element, modal, modalController, modalInstanceMock, fileDataService;

	beforeEach(module('file-mock'));
	beforeEach(module('common-mock'));
	beforeEach(function(){
		
		module('sfb-files', function($provide){

			$provide.decorator('$modal', function($delegate){
				spyOn($delegate, 'open').andReturn(
					{
					    result: {
					        then: function(confirmCallback, cancelCallback) {
					            //Store the callbacks for later when the user clicks on the OK or Cancel button of the dialog
					            this.confirmCallBack = confirmCallback;
					            this.cancelCallback = cancelCallback;

					            return {
					            	finally: function() {

					            	}
					            }
					        }
					    },
					    close: function( item ) {
					        //The user clicked OK on the modal dialog, call the stored confirm callback with the selected item
					        this.result.confirmCallBack( item );
					    },
					    dismiss: function( type ) {
					        //The user clicked cancel on the modal dialog, call the stored cancel callback
					        this.result.cancelCallback( type );
					    }

					}
				);
				return $delegate;
			});
		});

	});

	beforeEach(inject(function($compile, $rootScope, _$modal_, $controller, mockFileServices){
	  	scope = $rootScope.$new();
		fileDataService = mockFileServices.fileDataService;

  		modalInstanceMock = {
	        close: function (result) {

	        }
	    };

	    spyOn(modalInstanceMock, "close");
	    spyOn(fileDataService, 'mkDir').andCallThrough();

	    modalController = $controller("newDirModalCtrl", {
	        $scope: scope,
	        $modalInstance: modalInstanceMock,
	        targetDir: 'targetDirval',
	        fileDataService: fileDataService

	    });

		  modal = _$modal_;
		  element = '<new-dir-dialog show="createNewDir" target-dir="targetDir" accept="onDirCreated(dir)" error="onDirCreationError(err)"></new-dir-dialog>';
		  scope.targetDir="targetDirval";
		  element = $compile(element)(scope);
		  scope.$digest();
		  scope.createNewDir = true;
		  scope.$digest();
	}));

	it('Calls the modal with the right parameters', function() {
		expect(modal.open).toHaveBeenCalled();
		var modalArg = modal.open.argsForCall[0][0];
		expect(modalArg.resolve.targetDir()).toEqual('targetDirval');
	});

	it('Creates the directory on the service when ok is called', function(){
		scope.modalData.newDirName = "testNewDir";
		scope.ok();
		scope.$apply();
		expect(fileDataService.mkDir).toHaveBeenCalledWith('targetDirval/testNewDir');
		expect(modalInstanceMock.close).toHaveBeenCalledWith('targetDirval/testNewDir');
	});
});