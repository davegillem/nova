/**
 * A module class to generate the contentOptionss.js display
 * @module Nova.ContentArea
 **/
/**
 * @constructor
 * @param {Object} options - parameters used for initializing the view
 */
Nova.ContentArea = function(options) {
	'use strict';

	if (!(this instanceof Nova.ContentArea)) {
		throw new Error('Nova.ContentArea needs to be called with the new keyword');
	}

	var watcherData,
		subItems,
		$currentView,
		$contentArea,
		$contentHeader,
		watchPending,
		watchUpdate,
		watchChanging,
		watchLoaded,
		$dialog,
		watchInstanceLoad,
		watchChangingBlock,
		template = 'contentArea',
		currSection = NovaUtilities.getUrlParams('subsection'),
		currViewData = null,
		currViewSubData = null,
		textKeys = options.textKeys,
		// PRIVATE METHODS
		// -------------------------
		/**
		 * Initialize view/module
		 *
		 * @method _init
		 * @memberof Nova.ContentArea
		 * @fires /Nova.ContentArea/initialized
		 * @private
		 */
		_init = function() {
			// let listeners know everything has been started
			watcherData = {};
			$.watcher('publish', '/Nova.ContentArea/initialized', watcherData);
			_render();
		},
		/**
		 * Generates the actual view items for output to the screen
		 *
		 * @method _render
		 * @memberof Nova.ContentArea
		 * @private
		 */
		_render = function() {
			var templateData = {
				saveLabel: textKeys.buttons.save,
				loadingText: textKeys.global.loadingText
			};
			$('#content').handlebars(template, templateData, true);
			$contentArea = $('#contentArea');
			$contentHeader = $('#contentHeader');
			_subscribeEvents();
			$contentArea.hide();
			NovaLoader.init($contentArea, $('#contentLoader'));

			watcherData = {};
			$.watcher('publish', '/Nova.ContentArea/containerReady', watcherData);
		},
		/**
		 * Binds events to the current view items
		 *
		 * @method _bindEvents
		 * @memberof Nova.ContentArea
		 * @private
		 */
		_bindEvents = function() {},
		/**
		 * Events this view is subscribed to outside of this view
		 *
		 * @method _subscribeEvents
		 * @memberof Nova.ContentArea
		 * @listens
		 * @private
		 */
		_subscribeEvents = function() {
			// external publishers need to be assigned to a varaible so they can be referenced when unsubscribing
			watchUpdate = $.watcher('subscribe', '/Nova/updateContent', function(
				results
			) {
				console.log('UPDATING CONTENT');
			});
			watchChanging = $.watcher('subscribe', '/Nova/changingContent', function(
				results
			) {
				currSection = results.section;
				currViewData = results.viewData;
				NovaLoader.showLoader();
				$contentArea.fadeOut(100); //, function() { console.log('SHOWING LOADER');NovaLoader.showLoader($contentArea);});
			});
			watchLoaded = $.watcher('subscribe', '/Nova/viewLoaded', function(
				results
			) {
				NovaLoader.hideLoader();
			});
		},
		/**
		 * Removes all events created in this view.
		 * Also removes all subscribers from any events this view creates.
		 *
		 * @method _unbindEvents
		 * @memberof Nova.ContentArea
		 * @private
		 */
		_unbindEvents = function() {
			$.watcher('unsubscribeAll', '/Nova.ContentArea/initialized');
			$.watcher('unsubscribeAll', '/Nova.ContentArea/destroyed');
			$.watcher('unsubscribeAll', '/Nova.ContentArea/changeContentArea');
			$.watcher('unsubscribeAll', '/Nova.ContentArea/containerReady');
			$.watcher('unsubscribeAll', '/Nova.ContentArea/updateHash');
			$.watcher('unsubscribeAll', '/Nova.ContentArea/updateInstance');
			// unsubscribe from external publishers
			$.watcher('unsubscribe', '/Nova/viewLoaded', watchLoaded);
			$.watcher('unsubscribe', '/Nova/changingContent', watchChanging);
			$.watcher('unsubscribe', '/Nova/updateContent', watchUpdate);
		},
		/**
		 *
		 *
		 * @method _setVisible
		 * @memberof Nova.ContentArea.js
		 * @param
		 */
		_setVisible = function(obj, key, itemArr) {
			var i,
				arr = itemArr,
				proto = Object.prototype,
				ts = proto.toString,
				hasOwn = proto.hasOwnProperty.bind(obj);

			if ('[object Array]' !== ts.call(arr)) {
				arr = [];
			}

			for (i in obj) {
				if (hasOwn(i)) {
					if (i === key) {
						arr.push(obj[i]);
					} else if (
						'[object Array]' === ts.call(obj[i]) ||
						'[object Object]' === ts.call(obj[i])
					) {
						_setVisible(obj[i], key, arr);
					}
				}
			}

			return arr;
		},
		/**
		 * Changes the URL hash to reflect current content display settings
		 *
		 * @method _updateHash
		 * @memberof Nova.ContentArea
		 * @param items (
		 */
		_updateHash = function(items) {
			// check to see if sub buttons value, as well as instance and content menu value
			var hashItems = [];
			for (var p in items) {
				if (items.hasOwnProperty(p)) {
					hashItems.push({
						label: p,
						value: items[p]
					});
				}
			}

			watcherData = { hashItems: hashItems };
			$.watcher('publish', '/Nova.ContentArea/updateHash', watcherData);
		},
		// PUBLIC METHODS
		// -------------------------
		/**
		 * Removes all events created in this view.
		 * Removes all UI elements from the view
		 *
		 * @method destroy
		 * @memberof Nova.ContentArea
		 * @fires /Nova.ContentArea/destroyed
		 */
		destroy = function() {
			// let listeners know everything has been destroyed
			watcherData = {};
			$.watcher('publish', '/Nova.ContentArea/destroyed', watcherData);
			_unbindEvents();
		},
		showContentLoader = function() {
			NovaLoader.showLoader();
		},
		hideContentLoader = function() {
			NovaLoader.hideLoader();
		},
		// public api
		publicApi = {
			destroy: destroy,
			hideContentLoader: hideContentLoader,
			showContentLoader: showContentLoader,
			init: _init
		};

	return publicApi;
};
