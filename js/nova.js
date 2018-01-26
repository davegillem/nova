// @codekit-prepend 'nova.utilities.js'
// @codekit-prepend 'nova.handlebarHelpers.js'
// @codekit-prepend 'nova.config.js'
// @codekit-prepend 'nova.data.js'

// ------------------MODULE INCLUDES ----------------------------- //
// @codekit-prepend 'modules/Loader.js'
// @codekit-append 'modules/ContentArea.js'

// ------------------VIEWS INCLUDES ------------------------------ //
// @codekit-append 'views/SampleView.js'

var Nova = (function(window) {
	'use strict';
	var //------------------- GLOBAL VARS -------------------------//
		// HARD CODED CONFIG DATA
		textKeys = NovaConfig.textKeys,
		defaultView = 'SampleView',
		defaultLanguage = NovaConfig.defaultLanguage,
		// VIEWS REFERENCES
		$contentView, // holds a reference to the content container view including content area headers
		$contentMenuView, // holds a reference to the main table when a modal table is loaded
		$currentView, // will hold a reference to the active view so that it can be destroyed as needed
		$footerView,
		$headerView,
		$sidebarView,
		// VARIABLE DEFAULTS
		contentViewReady = false, // temporary variable to indicate if the new contentView should be used.
		// VARIABLE PLACEHOLDERS
		applicationData, // stores info from initGatway call
		languages, // available languages that have been setup per client
		preferences = {},
		watcherData = {},
		//------------------- DATA HANDLING -------------------------//
		// SETUP CALLS
		setupNova = function(prefs) {
			preferences = $.extend(preferences, prefs);
			NovaData.getAuth(false);
		},
		initNova = function(serverData, extraParams) {
			var serviceName = 'initNova',
				callback = setGlobals,
				cbParams = extraParams, // empty
				params = {};

			NovaData.getData(serviceName, params, callback, cbParams);
		},
		novaSessionEnded = function() {
			window.location.replace('/pkmslogout'); // redirect to logout page
		},
		// GLOBAL SETUP
		setGlobals = function(serverData, extraParams) {
			NovaUtilities.setNovaDefaults(serverData);

			// set display
			setupFooterView();
			setupHeaderView();
			setupSidebarView();
			setGlobalWatchers();

			// setup form validation
			$.gwvalidate.messages(textKeys.validations);

			$(window).on('hashchange', NovaUtilities.setHash);
		},
		setGlobalWatchers = function() {
			$.watcher('subscribe', '/Nova.NovaUtilities/variableChange', function(
				results
			) {});
		},
		setupFooterView = function() {
			$footerView = new Nova.Footer({
				$container: $('#footer'),
				footerText: textKeys.global.footerText
			});
		},
		setupHeaderView = function(isDeviceMgmt) {
			$.watcher('subscribe', '/Nova.TopBar/logout', function(results) {
				NovaData.destroyToken(novaSessionEnded);
			});
			$headerView = new Nova.TopBar({
				$container: $('#topBar'),
				textKeys: textKeys
			});
		},
		setupSidebarView = function() {
			$.watcher('subscribe', '/Nova.Sidebar/pendingChange', function(results) {
				NovaUtilities.warnPendingChange(results.element, results.type);
			});
			$.watcher('subscribe', '/Nova.Sidebar/navChange', function(results) {
				var sectID = results.sectID,
					subID = results.subID,
					isInIframe = results.isIframe;
				setContentSection(sectID, subID, isInIframe);
			});
			$sidebarView = new Nova.Sidebar({
				allowBeta:
					$.getUrlVar('demo') && $.getUrlVar('demo').toString() === 'true',
				$container: $('#sidebar'),
				clientAlt: preferences.clientAlt || textKeys.global.logoAltText,
				clientLogo: preferences.clientLogo || '/images/ibm-admin-logo.png',
				sidebarKeys: textKeys.sidebarKeys,
				environmentSettings: applicationData.environmentSettings,
				startupPage: NovaUtilities.getUrlParams('page') || defaultView
			});
		},
		setupContentView = function(viewData, section) {
			// TEMPORARY HIDING OF LOADER UNTIL ALL VIEWS ARE MIGRATED
			// $('#contentLoader')
			// 	.add('#contentHeaderHolder', '#contentHeaderHolder')
			// 	.hide('fast', function () {
			//  	$('#contentHeaderHolder', '#contentHeaderHolder').remove();
			//  });

			$.watcher('subscribe', '/Nova.ContentArea/destroyed', function(evt) {
				$contentView = null;
				contentViewReady = false;
			});
			$.watcher('subscribe', '/Nova.ContentArea/changeContentArea', function(
				results
			) {
				NovaUtilities.setVariableValue('currContentBlock', results.content);
			});
			$.watcher('subscribe', '/Nova.ContentArea/showContent', function(
				results
			) {
				NovaUtilities.showHideArea(results.id);
			});
			$.watcher('subscribe', '/Nova.ContentArea/containerReady', function(
				results
			) {
				contentViewReady = true;
				setNewView(viewData, section);
			});
			$.watcher('subscribe', '/Nova.ContentArea/updateHash', function(results) {
				// update urlParams and hash
				var hashItem,
					hashVal,
					params = results.hashItems;
				for (var i = 0, loopcount = params.length; i < loopcount; i++) {
					hashItem = params[i];
					hashVal = hashItem.value;
					if (hashVal) {
						NovaUtilities.setUrlParam(hashItem.label, hashItem.value);
					} else {
						NovaUtilities.removeUrlParam(hashItem.label);
					}
				}
				NovaUtilities.updateHash(NovaUtilities.getUrlParams());
			});

			var setupData = {
				textKeys: textKeys
			};

			$contentView = new Nova.ContentArea(setupData);
			$contentView.init();
		},
		// VIEWS SETUP
		setUSampleView = function(viewData) {
			$currentView = new Nova.Users({
				viewData: viewData,
				textKeys: textKeys
			});
		},
		//------------------- CONTENT HANDLING -------------------------//
		// CHANGE CONTENT DISPLAY
		setContentSection = function(secID, section, framed) {
			NovaUtilities.resetUpdatedData();
			window.location.hash = 'page:' + section;
			NovaUtilities.setUrlParam('page', section);

			setNewView(NovaConfig.viewMap[section], section);

			NovaUtilities.updateHash(NovaUtilities.getUrlParams());
		},
		// NEW CONTENT HANDLING FOR VIEWS
		cleanupViews = function(removeContentView, contentViewOnly) {
			if ($currentView) {
				$currentView.destroy(); // remove current view from memory
				$currentView = null;
			}
			if (removeContentView && $contentView) {
				$contentView.destroy(); // remove content view from memory
			}
		},
		setNewView = function(viewData, section) {
			// make sure content area is ready
			if (contentViewReady === false) {
				setupContentView(viewData, section);
				return;
			}
			cleanupViews(false);
			// let content view know to show the content loader
			watcherData = {
				viewData: viewData,
				section: section
			};
			$.watcher('publish', '/Nova/changingContent', watcherData);
			// setup the actual content template
			var viewMethod = NovaConfig.viewMethods[viewData[0].id],
				callback = Nova[viewMethod];
			callback(viewData, section);
		},
		viewLoaded = function($container, subLoad) {
			// tell $contentView that the view is ready
			watcherData = {};
			$.watcher('publish', '/Nova/viewLoaded', watcherData);

			var subContentID = NovaUtilities.getUrlParams('content') || null;
			NovaUtilities.setFormStyles();
			NovaUtilities.showHideArea(subContentID);
		},
		updateHash = function(hashItems) {
			NovaUtilities.updateHash(NovaUtilities.getUrlParams());
		},
		//------------------- PUBLIC METHODS -------------------------//
		startNova = function(options) {
			var callback = initNova;

			if (Nova.VERSION) {
				console.info('Nova.VERSION', Nova.VERSION);
			}
			NovaData.init(callback, NovaUtilities.dataUpdated);
			$('body').waitForImages({
				waitForAll: true,
				finished: function() {
					setupNova(options);
				}
			});
		};

	// Assign plugins to usable references
	var nova = window.nova,
		Handlebars = window.Handlebars;

	return {
		novaSessionEnded: novaSessionEnded,
		setContentSection: setContentSection,
		startNova: startNova,
		//
		applicationData: applicationData,
		setUSampleView: setUSampleView
	};
})(window);
