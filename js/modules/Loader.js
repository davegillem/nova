/**
 * A view class to generate the Loader display
 * @module NovaLoader
 */
/**
 * @classdesc A view class to generate the Loader display
 * @constructor
 */
 var NovaLoader = (function(window) {
    'use strict';
	var watcherData, templateData,
    	NovaConfig			 	= window.NovaConfig,
    	loaderCreated			= false,
    	$contentLoader,
        $container,

	// PRIVATE METHODS
	// -------------------------
	/**
	* Initialize view/module
	*
	* @method _init
	* @fires /NovaLoader/initialized
	* @private
	*/
	init						= function (container, contentLoader){
        console.log('LOADER INIT');
        loaderCreated = true;
        $contentLoader          = contentLoader;
        $container              = container;
        showLoader();
    },

    // PUBLIC METHODS
	// -------------------------
    /**
	* Removes all events created in this view.
	* Removes all UI elements from the view
	*
	* @method hideLoader
	* @param {Object} containerID - DOM object that points to the container that the loader should appear inside of
	*/
    hideLoader                  = function ($containerObj){
    	var $loadContainer = $containerObj || $container;
    	$contentLoader.fadeOut(500, function () {
    		$loadContainer.fadeIn(300, function() {
    			$.watcher('publish', '/Nova.Loader/contentShowing', watcherData);
    		});
    		NovaUtilities.dataLoading(false);
    	});
    },
    /**
	* Shows the content loader
	*
	* @method showLoader
	* @param {boolean} subLoad - does the loader need to appear lower on the page to account for the header bar
	*/
    showLoader                  = function (){
	    if (loaderCreated){
            NovaUtilities.dataLoading(true);
            $contentLoader.fadeIn(300);
        }
    },

    // public api
    publicApi   = {
                    init        : init,
					hideLoader 	: hideLoader,
					showLoader 	: showLoader
    };

    return publicApi;
})(window);