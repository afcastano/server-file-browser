var fs = require('fs');
var q = require('q');
var page = require('../page/files_page.js');

// spec.js
describe('Server File Browser', function() {


  var originPath = __dirname + '/../resources/origin';
  var targetPath = __dirname + '/../resources/target';

  beforeEach(function(){
    page.setPaths(originPath, targetPath);
  	createOriginFile('f1.bla');
  	createOriginFile('f2.bla');
    createTargetDir('1d');
  });
  beforeEach(function() {
    browser.get('http://localhost:3000/');
  });

  afterEach(function(){
    deleteOriginFile('f1.bla');
    deleteOriginFile('f2.bla');
    deleteTargetFile('f1.bla');
    deleteTargetDir('1d', 'f1.bla', '2d');
    deleteTargetDir('2d');
  });


  function createOriginFile(fileName) {
  		fs.writeFile(originPath + '/' + fileName, 'bla bla bla');
  }

  function createTargetDir(dirName) {
      fs.mkdirSync(targetPath + '/' + dirName);  
  }

  function deleteOriginFile(fileName) {
  	var path = originPath + '/' + fileName;
  	if (fs.existsSync(path)) {
  		fs.unlinkSync(path);	
    }
  }

  function deleteTargetFile(fileName) {

  	var path = targetPath + '/' + fileName;
  	if (fs.existsSync(path)) {
  		fs.unlinkSync(path);	
    }
  }

  function deleteTargetDir(dir, file, subdir) {
    var path = targetPath + '/' + dir;
    
    if(file) {
      deleteTargetFile(dir + '/' + file);
    }

    if(subdir) {
      deleteTargetDir(dir + '/' + subdir);
    }

    if (fs.existsSync(path)) {
      fs.rmdirSync(path); 
    }
  }

  it('should copy one file from origin to target', function(){
    page.selectFirstOriginFile();
    page.loadTargetFiles();
  	expect(page.originFiles.count()).toEqual(2);
  	expect(page.targetFiles.count()).toEqual(1);

  	page.copyBtn.click();
  	expect(page.targetFiles.count()).toEqual(2);
  });

  it('should delete one file from origin', function(){
  	page.selectFirstOriginFile();
  	expect(page.originFiles.count()).toEqual(2);
  	page.deleteBtn.click();
  	expect(page.originFiles.count()).toEqual(1);
  });

  it('should copy to a subdirectory in target', function(){
    page.selectFirstOriginFile();
    page.selectFirstTargetDir();
    expect(page.originFiles.count()).toEqual(2);
    expect(page.targetFiles.count()).toEqual(1);
    
    page.copyBtn.click();
    expect(page.targetFiles.count()).toEqual(1);
    page.targetFolders.first().element(by.css('.collapsed')).click();
    expect(page.targetChildren.count()).toEqual(1);


  });

  it('should create a new dir on target', function(){
    page.loadTargetFiles();
    expect(page.targetFiles.count()).toEqual(1);
    page.newDirBtn.click();
    page.newDirInput.sendKeys('2d');
    page.createDirBtn.click();
    expect(page.targetFiles.count()).toEqual(2);
    expect(page.targetFiles.get(1).getText()).toEqual('2d');

  });

  it('should create a new dir inside the main dir', function(){
    page.selectFirstTargetDir();
    page.newDirBtn.click();
    page.newDirInput.sendKeys('2d');
    page.createDirBtn.click();
    page.targetFolders.first().element(by.css('.collapsed')).click();
    expect(page.targetChildren.count()).toEqual(1);
    expect(page.targetChildren.get(0).getText()).toEqual('2d');    
  });

});