angular.module('simple-todo')
.factory('parserService', ['$rootScope', '$sce', 'storageService', function($rootScope, $sce, storageService) {
	var markdownData = 'Test from module';
	var parsedHtml = '';
	var hashtags = [];
	var listTitles = [];
	var listModels = [];
	var textSymbols = {
		title: "\n=================\n",
		jumpLine: "\n",
		done: "- ",
		pending: "+ "	
	};



	var service = {};

	function toEl(html) {
		return $('<div/>').html(html);
	}

	function extractTagsFromElement(el){
		var tags = [];
		el.find('.hashtag').each(function(){
			tags.push($(this).text());
		});

		return tags;
	}

	function addTitle(title){
		if(listTitles.indexOf(title) === -1){
			listTitles.push(title);
		}
	}

	function addHashtag(tag){
		if(hashtags.indexOf(tag) === -1){
			hashtags.push(tag);
		}
	}

	function loadParsedModel(parsedHtml){
		var el = toEl(parsedHtml.toString());

		// hashtags = [];
		// el.find('.hashtag').each(function(){
		// 	addHashtag($(this).text());
		// });

		// listTitles = [];
		// el.find('h1').each(function(){
		// 	addTitle($(this).text());
		// });

		listModels = [];
		el.find('ul').each(function(){
			var listTitle;
			var listItems = [];
			var element = $(this);

			if(element.prev().prop('tagName') === 'H1'){
				listTitle = element.prev().text();
			}

			element.children().each(function(){
				var listItemEl 	= $(this);
				var listItem = {
					done: listItemEl.find('.donetask').length !== 0,
					text: listItemEl.text().trim(),
					tags: extractTagsFromElement(listItemEl)
				};

				listItems.push(listItem);
			});

			listModels.push({
				title: listTitle,
				items: listItems
			});

		});

		loadAttributesFromModel();

	}

	function loadAttributesFromModel(){
		listTitles = [];
		hashtags = [];
		_.each(listModels, function(todoModel){
			listTitles.push(todoModel.title);

			_.each(todoModel.items, function(item){
				_.each(item.tags, function(tag){
					addHashtag(tag);
				});
			});
		});
	}

	function initService(){
		service.load();
		//TODO this is wrooong!!! Wrong service.
		hoodie.remote.on('change:todo-list', function (eventName, changedObject) {
			service.load();
			$rootScope.$broadcast('dbModfiedRemotely', changedObject);
		});

	}

	//TODO check if this can be done watching the whole model.
	service.modelUpdated = function(){
		service.save();
		//TODO extract tags and publish event 'attributesUpdated'
	}

	//TODO Check if this two methods should be here. In theory they are not part of "parsing" functionality.
	service.load = function(){
		storageService.load(function(model){
			listModels=model;
			loadAttributesFromModel();
		});
	}

	service.save = function(){
		storageService.save(listModels);
	}
	//----------------------------------------------

	service.setMarkdownData = function(data){
		markdownData = data;
		parsedHtml = $sce.trustAsHtml(markdownTodo.parse(markdownData));
		loadParsedModel(parsedHtml);
		$rootScope.$broadcast('markdownLoaded', markdownData);
	}

	service.generateFileContent = function(){
		var fileText = "";
		_.each(listModels, function(todoModel){
			if(todoModel.title){
				fileText += todoModel.title + textSymbols.title;
			}

			_.each(todoModel.items, function(item){
				if(item.done){
					fileText += textSymbols.done;
				}else{
					fileText += textSymbols.pending;
				}

				fileText += item.text + textSymbols.jumpLine;

			});
			fileText += textSymbols.jumpLine;
		});
		return fileText;
	}

	service.getTodoHtml = function(){
		return  parsedHtml;
	}

	service.getTodoModels = function(){
		return listModels;
	}

	service.refreshModels =function() {
		service.load();
		return service.getTodoModels();
	}

	service.getHashtags = function(){
		return hashtags;
	}

	service.refreshHashtags =function() {
		service.load();
		return service.getHashtags();
	}

	service.getTodoLists = function(){
		return markdownData;
	}

	service.refreshTodoLists =function() {
		service.load();
		return service.getTodoLists();
	}

	service.getListTitles = function(){
		return listTitles;
	}

	service.refreshListTitles =function() {
		service.load();
		return service.getListTitles();
	}

	initService();

	return service;
}]);