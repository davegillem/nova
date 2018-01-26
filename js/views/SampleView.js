/**
 * @classdesc A view class to generate the SampleView display
 *
 * @class Nova.SampleView
 * @constructor
 * @param {Object} options - parameters used for initializing the view
 * @param {Object} options.container - DOM object indicating where the footer should be loaded into
 * @param {string} options.footerText - Text used for footer display (i.e. copyright information)
 */
Nova.SampleView = function(options) {
	'use strict';

	if (!(this instanceof Nova.SampleView)) {
		throw new Error('Nova.SampleView needs to be called with the new keyword');
	}

	var watcherData,
		$container,
		templateData,
		template = 'footer',
		// PRIVATE METHODS
		// -------------------------
		/**
		 * Initialize view/module
		 *
		 * @method _init
		 * @memberof Nova.SampleView
		 * @fires /Nova.SampleView/initialized
		 * @private
		 */
		_init = function() {
			$container = options.$container;
			_render();
			// let listeners know everything has been started
			watcherData = {};
			$.watcher('publish', '/Nova.SampleView/initialized', watcherData);
		},
		/**
		 * Generates the actual view items for output to the screen
		 *
		 * @method _render
		 * @memberof Nova.SampleView
		 * @private
		 */
		_render = function() {
			templateData = { copyright: options.footerText };
			$container.handlebars(template, templateData, true);
			_bindEvents();
		},
		/**
		 * Binds events to the current view items
		 *
		 * @method _bindEvents
		 * @memberof Nova.SampleView
		 * @private
		 */
		_bindEvents = function() {},
		/**
		 * Events this view is subscribed to outside of this view
		 *
		 * @method _subscribeEvents
		 * @memberof Nova.SampleView
		 * @private
		 */
		_subscribeEvents = function() {},
		/**
		 * Removes all events created in this view.
		 * Also removes all subscribers from any events this view creates.
		 *
		 * @method _unbindEvents
		 * @memberof Nova.SampleView
		 * @private
		 */
		_unbindEvents = function() {
			$.watcher('unsubscribeAll', '/Nova.SampleView/initialized');
			$.watcher('unsubscribeAll', '/Nova.SampleView/destroyed');
		},
		// PUBLIC METHODS
		// -------------------------
		/**
		 * Removes all events created in this view.
		 * Removes all UI elements from the view
		 *
		 * @method destroy
		 * @memberof Nova.SampleView
		 * @fires /Nova.SampleView/destroyed
		 */
		destroy = function() {
			// let listeners know everything has been destroyed
			watcherData = {};
			$.watcher('publish', '/Nova.SampleView/destroyed', watcherData);
			_unbindEvents();
		},
		// public api
		publicApi = {
			destroy: destroy
		};

	_init();
	return publicApi;
};
