//*************************** BEGIN SETUP *************************//
var NovaData = (function(window) {
	'use strict';
	var initCall, dataUpdated, appToken, xhr, config,
		//*********************** GLOBAL VARS *************************//
		watcherData 	= {},
		// DEFAULT DATA VARIABLES
		dataCache 		= {},
		language 		= 'en-us',
		defaultContentType = 'application/json; charset=utf-8;',
		urlObject 		= $.getUrlVars(),
		// DATA SERVICES
		serviceURL 		= '/PATH_TO_SERVER/API_NAME',
		// LOG STYLING
		logStyling      = 'color:#fff; font-weight:bold; background:#1E619E; padding:2px 5px;',
		apiLogStyle     = logStyling + ' background:#1E619E;',
		successLogStyle = logStyling + ' background:#084908;',
		errorLogStyle   = logStyling + ' background:#800005;',
		informLogStyle  = logStyling + ' background:#0e7560;',
		warnLogStyle    = logStyling + ' background:#ba4b01;',
		paramLogStyle   = 'font-weight:bold; margin-left:10px;',
		cachedLogStyle 	= warnLogStyle + ' color:#000;',
		// DATA CALLS
		dataMethod 		= {
			sampleCall: { apiCall: 'sampleCall/{id}', method: 'PUT', contentType: '' }
		},
		// DEFAULT DATA METHODS
		init 			= function(initMethod, dataUpdatedFn) {
			if (initMethod) {
				initCall = initMethod;
				dataUpdated = dataUpdatedFn || dataError;
			} else {
				throw new Error('NO INIT METHOD HAS BEEN DEFINED');
			}
		},
		getAuth 		= function(reAuth, _callData) {
			var callback = reAuth ? reSubmitRequest : initCall,
				callData = dataMethod.getToken,
				apiCall = callData.apiCall,
				method = callData.method,
				servicePath = serviceURL,
				cbParams = _callData || {},
				params = {};

			cbParams.reAuth = reAuth;
			cbParams.tokenCall = true;

			callAPI(apiCall, params, method, callback, cbParams, servicePath);
		},
		reSubmitRequest = function(serverData, extraParams) {
			getData(
				extraParams.serviceName,
				extraParams.params,
				extraParams.callback,
				extraParams.cbParams,
				extraParams.isDataTable,
				extraParams.cacheRef,
				extraParams.bypassCache
			);
		},
		getData 		= function(
			serviceName,
			params,
			callback,
			cbParams,
			isDataTable,
			cacheRef,
			bypassCache
		) {
			var cacheData,
				apiVar,
				paramsHolder,
				prop,
				propVar,
				callData = dataMethod[serviceName] || {},
				apiCall = callData.apiCall || serviceName,
				method = callData.method || 'GET',
				contentType = callData.contentType
					? defaultContentType + callData.contentType
					: defaultContentType;

			// Need to hold a copy of parameters, in case we re-submit the request
			if ($.isArray(params)) {
				paramsHolder = params;
			} else {
				paramsHolder = $.extend({}, params);
			}

			if (isDataTable) {
				paramsHolder.language = language;
			}
			if (cacheRef && !bypassCache) {
				cacheData = checkCache(cacheRef);
				if (cacheData) {
					callback(cacheData, cbParams);
					return;
				}
				if (!dataCache[cacheRef]) {
					dataCache[cacheRef] = {};
				}
				cbParams.dataCache = { reference: cacheRef };
			}

			for (prop in paramsHolder) {
				if (paramsHolder.hasOwnProperty(prop)) {
					propVar = '{' + prop + '}';
					if (apiCall.indexOf(propVar) >= 0) {
						apiCall = apiCall.replace(
							propVar,
							encodeURIComponent(paramsHolder[prop])
						);
						//if(method != 'PUT'){ // Anton/Steve says all PUTs should have id in path AND in the object - DG 2.29.16
						delete paramsHolder[prop];
						//}
					}
				}
			}

			cbParams._callData = {
				serviceName: serviceName,
				params: params,
				callback: callback,
				cbParams: cbParams,
				isDataTable: isDataTable,
				cacheRef: cacheRef,
				bypassCache: bypassCache
			};

			callAPI(
				apiCall,
				paramsHolder,
				method,
				callback,
				cbParams,
				serviceURL,
				contentType,
				cacheRef
			);
		},
		dataError 		= function() {
			throw new Error('NO ERROR CALLBACK METHODS HAVE BEEN DEFINED');
		},
		cancelDataCall 	= function() {
			if (xhr && xhr.readyState !== 4) {
				console.log('CANCELLING DATA CALL', xhr);
				xhr.abort();
			}
		},
		callAPI 		= function(apiCall, params, method, callback, callbackParams, servicePath, contentType, cacheRef) {
			var serviceParams, errors, errorMsg, resultText, responseJSON, statusCode, statusType, xhrHeaders, cachedData,
				dataType    = 'json',
				headers     = callbackParams.tokenCall ? {} : { Authorization : 'Bearer ' + appToken, Accept : 'application/json' },
				processData = true,
				isTable     = callbackParams._callData && callbackParams._callData.isDataTable,
				serviceCall = servicePath + apiCall;

			$('html').addClass('loading');
			if (method === 'GET') {
				serviceParams = $.param(params);
			} else if (method === 'DELETE') {
				if (!_.isEmpty(params)) {
					serviceCall = serviceCall + '?' + $.param(params); // The default action for a DELETE with parameters is for them to be appended as a query string to the api call
				}
				serviceParams = null;
			} else {
				serviceParams = $.toJSON(params);
			}

			//------------------- DEBUG DATA ONLY -------------------/
			console.group('%c' + method + ' - ' + apiCall + ' ', apiLogStyle);
			console.log('CALLING - ', serviceCall);
			console.log('CALLBACK PARAMS - ', callbackParams);
			console.log('PASSING - ', serviceParams);
			console.groupEnd();
			xhr = $.ajax({
				type        : method,
				url         : serviceCall,
				data        : serviceParams,
				contentType : contentType,
				processData : processData,
				dataType    : dataType,
				headers     : headers,
				cache       : false,
				beforeSend: function(jqXHR) {
					watcherData = { request: jqXHR };
					$.watcher('publish', '/NovaData/requestSent', watcherData);
				},
				complete: function(jqXHR, textStatus) {
					watcherData = { request: jqXHR, textStatus: textStatus };
					$.watcher('publish', '/NovaData/responseRecieved', watcherData);
				}
			})
				// TODO add statusCode handling
				.done(function(data, textStatus, jqXHR) {
					$('html').removeClass('loading');
					xhrHeaders   = getHeaderObject(jqXHR.getAllResponseHeaders()) || {};
					resultText   = jqXHR.responseText;
					responseJSON = jqXHR.responseJSON;
					statusCode   = String(jqXHR.status);
					statusType   = statusCode.charAt(0); // check to see if its a 4** error or a 5** error code
					console.group('\t%c[' + statusCode + '] RESPONSE FOR : ' + apiCall,successLogStyle);
					console.log('\tHEADERS FOR ' + apiCall + ' : ', xhrHeaders);
					console.log('\tDATA FOR ' + apiCall + ' : ', data || 'API RETURNS NO DATA HERE');
					if (isTable) {
						console.table(data.data);
					}
					console.groupEnd();
					// Sloppy conditional to account for inconsistant server responses
					if (callbackParams.tokenCall) {
						appToken = data.entry.access_token;
						//expires = data.entry.expires_in;
						callbackParams.reAuth = null;
						callbackParams.tokenCall = null;
						callbackParams.appToken = appToken;
						callback(data, callbackParams, xhrHeaders, statusCode);
					} else if (
						!data ||
						!data.status ||
						data.status.success === true ||
						data.status === 'success' ||
						(data.status.success === false && data.status.apiError === false)
					) {
						if (cacheRef) {
							cachedData = callbackParams.cachedData || data; // used for when the update call doesn't return the updated data
							updateCache(cacheRef, cachedData);
						}
						if (callback) {
							callback(data, callbackParams, xhrHeaders, statusCode);
						} else {
							return data, callbackParams, xhrHeaders, statusCode;
						}
					} else if (
						data.status &&
						(data.status.apiError === true || data.status.success === false)
					) {
						if (callback && callbackParams && callbackParams.handleApiErrors) {
							callback(data, callbackParams, xhrHeaders, statusCode); // sends data back to UI for handling errors in the UI
						}
						console.log('\t%cERROR: ', errorLogStyle, data.status.message);
						watcherData = {
							apiCall    : apiCall,
							data       : data,
							headers    : xhrHeaders,
							result     : jqXHR,
							statusCode : statusCode,
							textStatus : textStatus
						};
						$.watcher('publish', '/NovaData/apiError', watcherData);
					}
					//xhr = null;
				})
				.fail(function(jqXHR, textStatus) {
					$('html').removeClass('loading');
					xhrHeaders = getHeaderObject(jqXHR.getAllResponseHeaders()) || {};
					resultText = jqXHR.responseText;
					responseJSON = jqXHR.responseJSON || 'no responseJSON present';
					statusCode = String(jqXHR.status);
					statusType = statusCode.charAt(0); // check to see if its a 4** error or a 5** error code
					console.group('\t%cFAILED - ' + apiCall + ' ', errorLogStyle);
					console.error('\t%c[' + statusCode + '] RESPONSE FOR ' + apiCall + ' :',errorLogStyle,jqXHR,textStatus);
					console.error(
						'\t%cHEADERS FOR ' + apiCall + ' : ',
						errorLogStyle,
						xhrHeaders
					);
					watcherData = {
						apiCall    : apiCall,
						headers    : xhrHeaders,
						result     : jqXHR,
						statusCode : statusCode,
						textStatus : textStatus
					};
					if (textStatus === 'abort') {
						console.groupEnd();
						console.log(
							'\t%cCALL ABORTED - ' + apiCall + ' ',
							warnLogStyle,
							serviceCall,
							arguments
						);
						xhr = null;
						$.watcher('publish', '/NovaData/aborted', watcherData);
						return;
					}
					dataUpdated(true);

					console.error(
						'\t%cFAIL ARGUEMENTS FOR ' + apiCall + ' :',
						errorLogStyle,
						arguments,
						responseJSON
					);

					$.watcher('publish', '/NovaData/error', watcherData);

					if (responseJSON && responseJSON.success === false) {
						errors = responseJSON.errors;
						errorMsg = '- ' + responseJSON.message + ' -';
						for (var p in errors) {
							if (errors.hasOwnProperty(p)) {
								errorMsg += '\n- ' + errors[p];
							}
						}
						console.error('\t%cAPI ERROR CALL: ', errorLogStyle, errorMsg);
						$.watcher('publish', '/NovaData/apiError', watcherData);
					} else {
						console.error(
							'\t%c[' + jqXHR.statusText + '] FAILED FOR ' + apiCall + ' :  ',
							errorLogStyle,
							jqXHR.status + ' : ' + textStatus
						);
						console.error('\t%cSTATUS - ', errorLogStyle, textStatus);
						watcherData = {
							apiCall    : apiCall,
							headers    : xhrHeaders,
							result     : jqXHR,
							statusCode : statusCode,
							textStatus : textStatus
						};
						//console.groupEnd('%c'+apiCall+' ', apiLogStyle);
						// get token without refresh
						if (statusType === '4') {
							if (statusCode === '401') {
								getAuth(true, callbackParams._callData);
								return false;
							} else if (statusCode === '404') {
								callback({}, callbackParams, xhrHeaders, statusCode);
								return false;
							} else {
								$.watcher('publish', '/NovaData/apiError', watcherData);
								return false;
							}
						} else if (
							resultText &&
							resultText.toLowerCase().indexOf('<body') > 0
						) {
							$.watcher('publish', '/NovaData/expiredError', watcherData);
							return false;
						} else {
							$.watcher('publish', '/NovaData/serverError', watcherData);
						}
					}
					console.groupEnd();
				});
		},
		getHeaderObject = function(str) {
			if (str.length) {
				var propItems,
					headerObj = {},
					properties = str.split('\n');

				properties.forEach(function(property) {
					propItems = property.split(': ');
					if (propItems[0].length) {
						headerObj[propItems[0].toLowerCase()] = propItems[1];
					}
				});
				return headerObj;
			}
		},
		// Cache Data
		checkCache 		= function(cacheRef) {
			if (!dataCache[cacheRef]) {
				return false;
			} else if (!dataCache[cacheRef]) {
				return false;
			} else {
				var cachedData = dataCache[cacheRef];
				console.group(
					'%c' + cacheRef + ' - %cCACHED DATA ',
					apiLogStyle,
					cachedLogStyle
				);
				console.log('%cRESPONSE : ', paramLogStyle, cachedData);
				console.groupEnd();
				return cachedData;
			}
		},
		updateCache 	= function(cacheRef, data) {
			dataCache[cacheRef] = data;
		},
		removeCache 	= function(cacheRef) {
			delete dataCache[cacheRef];
		};

	return {
		apiLogStyle    : apiLogStyle,
		cachedLogStyle : cachedLogStyle,
		cancelDataCall : cancelDataCall,
		checkCache     : checkCache,
		errorLogStyle  : errorLogStyle,
		getAuth        : getAuth,
		getData        : getData,
		informLogStyle : informLogStyle,
		init           : init,
		logStyling     : logStyling,
		paramLogStyle  : paramLogStyle,
		removeCache    : removeCache,
		updateCache    : updateCache,
		warnLogStyle   : warnLogStyle
	};
})(window);
