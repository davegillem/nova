//*************************** BEGIN SETUP *************************//
var NovaConfig = (function(window) {
	'use strict';
	var //*********************** GLOBAL VARS ****************************//
		defaultLanguage = 'en-us',
		textKeys = {
			global: {
				footerText: '&copy; Nova - ' + new Date().getFullYear(),
				headerText: 'Nova / <span>Administration</span>',
				loadingText: 'Loading...',
				logoAltText: 'Nova - Administration',
				logoutLabel: 'Log out'
			},
			sidebarKeys: {
				mainNav1: 'Main Nav Item 1',
				mainNav1_sub1: 'Sub Nav Item 1',
				mainNav1_sub2: 'Sub Nav Item 2',
				mainNav1_sub3: 'Sub Nav Item 3'
			}
		},
		viewMap = {
			'auth-settings': [
				{
					// TODO: This section has been moved to Phase 2 unless it can be completed on time - DG 9-28-17
					buttonBarOptions: {
						keys: textKeys.authentication,
						options: {},
						template: null,
						type: 'authFlow'
					},
					menuBarOptions: {}, // Doesn't need a menu bar
					headerSave: true,
					instanceMenu: false,
					id: 'auth-config'
				},
				{
					buttonBarOptions: {
						keys: textKeys.authentication,
						options: {},
						template: null,
						type: 'authSource'
					},
					menuBarOptions: {
						label: '',
						keys: textKeys.authentication,
						options: {
							buttonLabel: textKeys.buttons.addNewSource,
							label: textKeys.authentication.beginSearch,
							orLabel: textKeys.global.orLabel
						},
						template: 'auth-menuBar',
						type: 'custom'
					},
					headerSave: false,
					instanceMenu: false,
					id: 'auth-source'
				},
				{
					buttonBarOptions: {
						keys: textKeys.authentication,
						options: {},
						template: null,
						type: 'authHandler'
					},
					menuBarOptions: {
						label: '',
						keys: textKeys.authentication,
						options: {
							buttonLabel: textKeys.buttons.addNewHandler,
							label: textKeys.authentication.beginSearch,
							orLabel: textKeys.global.orLabel
						},
						template: 'auth-menuBar',
						type: 'custom'
					},
					headerSave: false,
					instanceMenu: false,
					id: 'auth-handler'
				}
			]
		},
		viewMethods = {
			apiKeyMgmt: 'setApiKeyMgmt'
		}; // maps the view ID to methods called from the main Nova script, sub pages will be handled by the view itself
	//*********************** PUBLIC METHODS *************************//
	return {
		defaultLanguage: defaultLanguage,
		textKeys: textKeys,
		viewMap: viewMap,
		viewMethods: viewMethods
	};
})(window);
