module.exports =(function(){

	var originPath;
	var targetPath;

	var page = {

      originInput : element(by.model('rootOrigin')),
	  targetInput : element(by.model('rootTarget')),
	  loadOriginButton : element(by.id('load-origin')),
	  loadTargetButton : element(by.id('load-target')),
	  originFiles : element.all(by.repeater('node in origindata').column('node.label')),
	  targetFiles : element.all(by.repeater('node in targetdata').column('node.label')),
	  targetFolders : element.all(by.repeater('node in targetdata')),
	  targetChildren : element.all(by.repeater('node in node.children').column('node.label')),
	  copyBtn : element(by.id('copy-btn')),
	  deleteBtn : element(by.id('delete-btn')),
	  newDirBtn: element(by.id('newDir-btn')),
	  createDirBtn: element(by.id('createDir-btn')),
	  newDirInput: element(by.model('newDirName')),
	  
	  setPaths : function(origin, target) {
	  	originPath = origin;
	  	targetPath = target;
	  },

	  loadOriginFiles : function() {
  		page.originInput.clear();
  		page.originInput.sendKeys(originPath);
  		page.loadOriginButton.click();
      },

      loadTargetFiles : function() {
  		page.targetInput.clear();
  		page.targetInput.sendKeys(targetPath);
  		page.loadTargetButton.click();
  	  },
  	  selectFirstTargetDir : function() {
	    page.loadTargetFiles(targetPath);
	    page.targetFiles.first().click();
	  },
	  selectFirstOriginFile : function() {
	    page.loadOriginFiles(originPath);
	    page.originFiles.first().click();
	  }

	}

	return page;

})();