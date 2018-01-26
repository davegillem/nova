/**
 * @classdesc A view class to generate the Header display
 *
 * @class Nova.TopBar
 * @constructor
 * @param {Object} options - parameters used for initializing the view
 * @param {Object} options.container - DOM object indicating where the header should be loaded into
 * @param {string} options.headerText - Text used for header display - indicates the name of the product
 * @param {string} options.logoutText - Text used to display the logout link
 * @param {string} [options.user] - The logged in users display name
 */
Nova.TopBar = function(options) {
	'use strict';

	if (!(this instanceof Nova.TopBar)) {
		throw new Error('Nova.TopBar needs to be called with the new keyword');
	}

	var watcherData,
		$container,
		$logout,
		template = 'topBar',
		textKeys = options.textKeys,
		// PRIVATE METHODS
		// -------------------------
		/**
		 * Initialize view/module
		 *
		 * @method _init
		 * @memberof Nova.TopBar
		 * @fires /Nova.TopBar/initialized
		 * @private
		 */
		_init = function() {
			$container = options.$container;
			// let listeners know everything has been started
			watcherData = {};
			$.watcher('publish', '/Nova.TopBar/initialized', watcherData);
			_render();
		},
		/**
		 * Generates the actual view items for output to the screen
		 *
		 * @method _render
		 * @memberof Nova.TopBar
		 * @private
		 */
		_render = function() {
			var templateData = {
				textKeys: textKeys,
				headerText: textKeys.global.headerText
			};
			$container.handlebars(template, templateData, true);
			_bindEvents();
		},
		/**
		 * Binds events to the current view items
		 *
		 * @method _bindEvents
		 * @memberof Nova.TopBar
		 * @fires /Nova.TopBar/logout
		 * @private
		 */
		_bindEvents = function() {},
		/**
		 * Events this view is subscribed to outside of this view
		 *
		 * @method _subscribeEvents
		 * @memberof Nova.TopBar
		 * @private
		 */
		_subscribeEvents = function() {},
		/**
		 * Removes all events created in this view.
		 * Also removes all subscribers from any events this view creates.
		 *
		 * @method _unbindEvents
		 * @memberof Nova.TopBar
		 * @private
		 */
		_unbindEvents = function() {
			var evtStr;
			// unbind all events
			$logout.off('click');
			// remove all subscribers
			$.watcher('unsubscribeAll', '/Nova.TopBar/initialized');
			$.watcher('unsubscribeAll', '/Nova.TopBar/destroyed');
			$.watcher('unsubscribeAll', '/Nova.TopBar/logoutLink');
		},
		// PUBLIC METHODS
		// -------------------------
		/**
		 * Removes all events created in this view.
		 * Removes all UI elements from the view
		 *
		 * @method destroy
		 * @memberof Nova.TopBar
		 * @fires /Nova.TopBar/destroyed
		 */
		destroy = function() {
			// let listeners know everything has been destroyed
			watcherData = {};
			$.watcher('publish', '/Nova.TopBar/destroyed', watcherData);
			_unbindEvents();
		},
		// public api
		publicApi = {
			destroy: destroy
		};

	_init();
	return publicApi;
};
