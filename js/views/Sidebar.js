/**
 * @classdesc A view class to generate the Sidebar display
 *
 * @class Nova.Sidebar
 * @constructor
 * @param {Object} options - parameters used for initializing the view
 * @param {boolean} [options.allowBeta=false] - Allow beta navigation items to be visible or not
 * @param {Object} options.container - DOM object indicating where the sidebar should be loaded into
 * @param {string} [options.clientAlt] - Alt text to display for the logo
 * @param {string} [options.clientLogo] - Path to a client logo to use in place of the default logo
 * @param {Object} options.sidebarKeys - Text keys to use for generating the UI
 * @param {string} [options.startupPage='company-info'] - Page name to start the navigation on
 */
Nova.Sidebar = function(options) {
	'use strict';

	if (!(this instanceof Nova.Sidebar)) {
		throw new Error('Nova.Sidebar needs to be called with the new keyword');
	}

	var watcherData,
		templateData,
		$leftNav,
		animSpeed = 300,
		clientAlt = options.clientAlt,
		clientLogo = options.clientLogo,
		template = 'sidebar',
		textKeys = options.sidebarKeys,
		navItems = [
			{
				label: textKeys.mainNav1,
				id: 'mainNav1',
				iconCSS: 'fa fa-institution',
				sections: [
					{ label: textKeys.mainNav1_sub1, id: 'mainNav1_sub1' },
					{ label: textKeys.mainNav1_sub2, id: 'mainNav1_sub2' },
					{ label: textKeys.mainNav1_sub3, id: 'mainNav1_sub3' }
				]
			}
		],
		startupPage = options.startupPage,
		// DOM CACHE
		$container = options.$container,
		// PRIVATE METHODS
		// -------------------------
		/**
		 * Initialize view/module
		 *
		 * @method _init
		 * @memberof Nova.Sidebar
		 * @fires /Nova.Sidebar/initialized
		 * @private
		 */
		_init = function() {
			_render();
			// let listeners know everything has been started
			watcherData = {};
			$.watcher('publish', '/Nova.Sidebar/initialized', watcherData);
		},
		/**
		 * Generates the actual view items for output to the screen
		 *
		 * @method _render
		 * @memberof Nova.Sidebar
		 * @private
		 */
		_render = function() {
			templateData = {
				navItems: navItems,
				clientLogo: clientLogo,
				clientAlt: clientAlt
			};
			$container.handlebars(template, templateData, true);
			_subscribeEvents();
			_bindEvents();
		},
		/**
		 * Binds events to the current view items
		 *
		 * @method _bindEvents
		 * @memberof Nova.Sidebar
		 * @fires /Nova.Sidebar/navChange
		 * @fires /Nova.Sidebar/pendingChange
		 * @private
		 */
		_bindEvents = function() {
			// bind all events
			$leftNav = $('#navMenu');
			$leftNav
				// Main Section Actions
				.find('li.mainLevelNav>a')
				.on('click', function(evt) {
					evt.preventDefault();
					if (!$(this).hasClass('current')) {
						$(this)
							.toggleClass('selected')
							.next()
							.toggleClass('selected')
							.slideToggle(animSpeed);
					}
					return false;
				})
				.end()
				// Sub Section Actions
				.find('a.subLevelNav')
				.on('click', function(evt) {
					evt.preventDefault();
					if (!$(this).hasClass('selected')) {
						var sectID,
							subID,
							$section = $(this)
								.parent()
								.parent()
								.parent()
								.parent(),
							$sectionLink = $section.children('a');

						$leftNav
							.find('a.subLevelNav.selected')
							.removeClass('selected fa-circle')
							.addClass('fa-circle-o');
						$(this).addClass('selected fa-circle');
						if (!$sectionLink.hasClass('current')) {
							$leftNav
								.find('li.mainLevelNav>a')
								.not($sectionLink)
								.removeClass('current selected')
								.next()
								.slideUp(animSpeed);
							$sectionLink.addClass('current').removeClass('selected');
							$('html, body').animate({ scrollTop: 0 }, animSpeed);
						}

						// change content
						sectID = $section.find('a').attr('data-id');
						subID = $(this).data('id');
						watcherData = { sectID: sectID, subID: subID };
						$.watcher('publish', '/Nova.Sidebar/navChange', watcherData);
					}
					return false;
				});
			_setDefaultState();
		},
		/**
		 * Events this view is subscribed to outside of this view
		 *
		 * @method _subscribeEvents
		 * @memberof Nova.Sidebar
		 * @listens /Nova.NovaUtilities/pendingChange
		 * @private
		 */
		_subscribeEvents = function() {},
		/**
		 * Removes all events created in this view.
		 * Also removes all subscribers from any events this view creates.
		 *
		 * @method _unbindEvents
		 * @memberof Nova.Sidebar
		 * @private
		 */
		_unbindEvents = function() {
			// unbind all events
			$leftNav
				.find('li.mainLevelNav>a')
				.off('click')
				.end()
				.find('a.subLevelNav')
				.off('click');
			// remove all subscribers
			$.watcher('unsubscribeAll', '/Nova.Sidebar/initialized');
			$.watcher('unsubscribeAll', '/Nova.Sidebar/destroyed');
			$.watcher('unsubscribeAll', '/Nova.Sidebar/navChange');
		},
		/**
		 * Sets the default active navigation state of the left hand menu
		 *
		 * @method _setDefaultState
		 * @memberof Nova.Sidebar
		 * @private
		 */
		_setDefaultState = function() {
			// trigger initial content
			var subID = startupPage,
				divider = subID.indexOf('-'),
				secID = subID.substring(0, divider),
				leftID = 'leftNav-' + secID;

			$('#' + leftID)
				.find('>a')
				.trigger('click')
				.end()
				.find('div ul li a[data-id="' + subID + '"]')
				.trigger('click');
		},
		// PUBLIC METHODS
		// -------------------------
		/**
		 * Removes all events created in this view.
		 * Removes all UI elements from the view
		 *
		 * @method destroy
		 * @memberof Nova.Sidebar
		 * @fires /Nova.Sidebar/destroyed
		 */
		destroy = function() {
			// let listeners know everything has been destroyed
			watcherData = {};
			$.watcher('publish', '/Nova.Sidebar/destroyed', watcherData);
			_unbindEvents();
		},
		// public api
		publicApi = {
			destroy: destroy
		};

	_init();
	return publicApi;
};
