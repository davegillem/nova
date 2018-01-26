/**
 * @classdesc A view class to generate the Footer display
 *
 * @class Nova.Footer
 * @constructor
 * @param {Object} options - parameters used for initializing the view
 * @param {Object} options.container - DOM object indicating where the footer should be loaded into
 * @param {string} options.footerText - Text used for footer display (i.e. copyright information)
 */
Nova.Footer  = function (options){
    'use strict';

    if (!(this instanceof Nova.Footer)) {
        throw new Error('Nova.Footer needs to be called with the new keyword');
    }

    var watcherData, $container, templateData,
    	template				= 'footer',

	// PRIVATE METHODS
	// -------------------------
	/**
	* Initialize view/module
	*
	* @method _init
	* @memberof Nova.Footer
	* @fires /Nova.Footer/initialized
	* @private
	*/
	_init						= function (){
    	$container = options.$container;
		_render();
    	// let listeners know everything has been started
    	watcherData = {};
    	$.watcher('publish', '/Nova.Footer/initialized', watcherData);
    },
	/**
	* Generates the actual view items for output to the screen
	*
	* @method _render
	* @memberof Nova.Footer
	* @private
	*/
	_render						= function (){
		templateData			= {copyright : options.footerText};
		$container.handlebars(template, templateData, true);
		_bindEvents();
	},
	/**
	* Binds events to the current view items
	*
	* @method _bindEvents
	* @memberof Nova.Footer
	* @private
	*/
	_bindEvents 				= function (){},
	/**
	* Events this view is subscribed to outside of this view
	*
	* @method _subscribeEvents
	* @memberof Nova.Footer
	* @private
	*/
	_subscribeEvents 			= function (){},
	/**
	* Removes all events created in this view.
	* Also removes all subscribers from any events this view creates.
	*
	* @method _unbindEvents
	* @memberof Nova.Footer
	* @private
	*/
	_unbindEvents 				= function (){
		$.watcher('unsubscribeAll', '/Nova.Footer/initialized');
		$.watcher('unsubscribeAll', '/Nova.Footer/destroyed');
	},


    // PUBLIC METHODS
	// -------------------------
    /**
	* Removes all events created in this view.
	* Removes all UI elements from the view
	*
	* @method destroy
	* @memberof Nova.Footer
	* @fires /Nova.Footer/destroyed
	*/
    destroy						= function (){
		// let listeners know everything has been destroyed
    	watcherData = {};
    	$.watcher('publish', '/Nova.Footer/destroyed', watcherData);
    	_unbindEvents();
    },

    // public api
    publicApi   = {
					destroy 	: destroy
    };

	_init();
    return publicApi;
};
