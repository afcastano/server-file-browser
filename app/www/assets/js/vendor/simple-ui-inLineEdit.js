angular.module('simple.ui.inLineEdit', [])
.directive('inLineEditable', function($timeout) {


		function execCallback($scope, attrs, oldVal) {

			if (attrs.afterUpdate) {
				var afterUpdate = $scope.afterUpdate();

				afterUpdate($scope.model, function(err) {
					if (err) {
						scope.model[attrs.modelAtt] = oldVal;
					}
				}, {
					oldVal: oldVal,
					attr: attrs.modelAtt
				});
			}

		}

		function createInputElement(element, attributes) {
			var inputElement = toEl('<input type="text" ng-model="$parent.localModel" ng-if="editMode"/>');


			_.each(element[0].attributes, function(att) {
				var name = att.name;
				var value = att.value;
				if (name.substring(0, 2) == "s-" && name != "s-editable") {
					inputElement.attr(name.substring(2, name.length), value);
				}

			});

			return inputElement[0].outerHTML;
		}

		function createDisplayElement(attrs) {
			var spanStr = '<span ng-show="!editMode">{{model.' + attrs.modelAtt;
			if (attrs.displayFilter) {
				spanStr += ' | ' + attrs.displayFilter + ' ';
			}
			spanStr += '}}</span>';
			return spanStr;
		}

		function toEl(html) {
			return $('<div/>').html(html).contents();
		}

		return {

			scope: {
				model: '=ngModel',
				afterUpdate: '&'
			},
			template: function(element, attrs) {
				return createDisplayElement(attrs) + createInputElement(element, attrs);
			},

			link: function($scope, element, attrs) {

				var postWhenValueChange = attrs.postOnChange !== undefined;
				var unregisterLocalModelWatch = null;

				function toDisplayMode() {
					$scope.editMode = false;
					if (unregisterLocalModelWatch) {
						unregisterLocalModelWatch();
					}
				}

				function toEditMode() {
					//Wait until input element is created
					var unwatchCreation = $scope.$watch(
						function() {
							return element.children().length;
						},
						function(length, oldVal) {

							if (length < 2) {
								return;
							}
							unwatchCreation();

							$scope.localModel = $scope.model[attrs.modelAtt];
							var inputElement = $(element.children()[1]);

							//used on input elements that have pop ups. (selects, date pickers etc...)
							if (postWhenValueChange) {
								unregisterLocalModelWatch = $scope.$watch("localModel", function(newVal, oldVal) {
									if (newVal != oldVal) {
										postChanges();
									}
								});
							} else {
								//If it is a simple text input, post on blur.
								inputElement.on('blur', function() {
									$timeout(function() {
										postChanges();
									});
								});
							}
							
							$timeout(function() {
								inputElement.focus();
								inputElement.select();
							});

						});

					$scope.$apply(function() {
						$scope.editMode = true;
					});
				}


				function init() {
					element.attr('tabindex', 1);
					initContainerListeners();
					toDisplayMode();
				}

				function initContainerListeners() {
					element.keydown(function(event) {
						if (event.which == '27') {

							if ($scope.editMode) {
								toDisplayMode();
								$timeout(function() {
									element.focus();
								});
							}

						} else if (event.which == '13') {

							if ($scope.editMode == false) {
								toEditMode();

							} else {

								$scope.$apply(function() {
									postChanges();
								});

								$timeout(function() {
									element.focus();
								});
							}
						}
					});

					var clickFunction = function() {
						if (!$scope.editMode) {
							toEditMode();
						}
					}

					if(attrs.editOnDoubleclick !== undefined){
						element.on('dblclick', clickFunction);
					}else{
						element.on('click', clickFunction);
					}


				}

				function postChanges() {
					var oldVal = $scope.model[attrs.modelAtt];
					$scope.model[attrs.modelAtt] = $scope.localModel;
					execCallback($scope, attrs, oldVal);
					//Wait until all components are updated.
					$timeout(function(){
						toDisplayMode();
					});
				}

				init();
			}



		}


	});