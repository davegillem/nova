//*************************** BEGIN SETUP *************************//
var NovaUtilities = (function() {
	'use strict';
	var watcherData,
		currLanguage = 'en-us', // default language to load content in for
		textKeys = NovaConfig.textKeys,
		urlParams = {}, // a cache of the URL hash params
		// DOM References
		$body = $('body'),
		// SETUP Nova
		setNovaDefaults = function(serverData) {
			setHash();
			setUrlParam('modal', null);
		},
		//********************* HELPER METHODS **************************//
		convertTimestamp = function(value, toMinutes, normalHour, trimLeadingZero) {
			var split,
				hour,
				hours,
				min,
				timeStamp,
				total,
				newHours,
				morning = false,
				timeKeys = textKeys.dateTime;
			if (toMinutes) {
				// Convert 24 hour timestamp to minutes
				split = value.toString().split(':');
				hour = parseInt(split[0], 10) * 60;
				min = parseInt(split[1], 10);
				timeStamp = hour + min;
			} else {
				// Convert minutes to 24 hour timestamp
				total = Math.round(value);
				hour = Math.floor(total / 60);
				min = total - hour * 60;
				if (isNaN(total) || total === 0) {
					timeStamp = '00:00';
				} else {
					timeStamp = ('0' + hour).slice(-2) + ':' + ('0' + min).slice(-2);
				}
			}
			if (normalHour) {
				hours = parseInt(timeStamp.substring(0, 2));
				if (hours < 12 || hours === 24) {
					morning = true;
					timeStamp = hours === 24 ? '12:00' : timeStamp; // check for 12:00 am which is still morning
					timeStamp += timeKeys.timeIndicator.morning;
					if (timeStamp.charAt(0) === '0') {
						timeStamp = timeStamp.substr(1);
					}
				}
				// check to see if the first character is still 0
				if (morning && timeStamp.charAt(0) === '0') {
					timeStamp = timeStamp.substr(1);
					timeStamp = '12' + timeStamp;
				} else if (!morning) {
					if (hours > 12) {
						newHours = hours - 12;
						timeStamp = String(newHours) + timeStamp.substr(-3);
					}
					timeStamp += timeKeys.timeIndicator.afternoon;
				}
			}
			if (trimLeadingZero && !normalHour) {
				if (timeStamp.charAt(0) === '0') {
					timeStamp = timeStamp.substr(1);
				}
			}
			return timeStamp;
		},
		getUrlParams = function(param) {
			if (param) {
				return urlParams[param];
			} else {
				return urlParams;
			}
		},
		isTruncated = function(element) {
			// only works with block-level elements
			return element.offsetWidth < element.scrollWidth;
		},
		removeUrlParam = function(param) {
			delete urlParams[param];
		},
		setHash = function() {
			urlParams = NovaUtilities.parseHash();
		},
		setUrlParam = function(param, value) {
			urlParams[param] = value;
		},
		showHideArea = function(subID, hideSelector, showCSS, hideCSS) {
			var id = subID ? '#' + subID : '.contentSubBlock:first',
				selector = hideSelector || '.contentSubBlock',
				visibleCSS = showCSS || '',
				hiddenCSS = hideCSS || '',
				$contentArea = $('#contentHolder').length
					? $('#contentHolder')
					: $('#contentArea');

			$contentArea
				.find(selector)
				.hide()
				.addClass(hiddenCSS)
				.removeClass(visibleCSS)
				.end()
				.find(id)
				.fadeIn()
				.addClass(visibleCSS)
				.removeClass(hiddenCSS);
		},
		//********************* REFERENCES **************************//
		getVariableValue = function(varName) {
			return NovaUtilities[varName];
		},
		setVariableValue = function(varName, varVal) {
			// restrict setting only certain variables
			var allowedVars = [
				'currLanguage',
				'currMenuVal',
				'pendingChange',
				'urlParams',
				'currContentBlock'
			];
			if (allowedVars.indexOf(varName) < 0) {
				return false;
			}

			NovaUtilities[varName] = varVal;
			watcherData = {name: varName, value: varVal};
			$.watcher('publish', '/Nova.NovaUtilities/variableChange', watcherData);
			$.watcher('publish', '/Nova.NovaUtilities/' + varName, watcherData);
		},
		//********************* HELPER METHODS **************************//
		arrayBufferToBase64 = function(buffer) {
			var binary = '',
				bytes = new window.Uint8Array(buffer),
				len = bytes.byteLength;
			for (var i = 0; i < len; i++) {
				binary += String.fromCharCode(bytes[i]);
			}
			return window.btoa(binary);
		},
		checkTrue = function(val) {
			return (val + '').toLowerCase() === 'true';
		},
		checkValidPropertyName = function(str) {
			// check to make sure property name follows best practices  - https://ldapwiki.willeke.com/wiki/Best%20Practices%20For%20LDAP%20Naming%20Attributes
			var re = new RegExp('^[a-zA-Z_][a-zA-Z_0-9-]*$');
			return re.test(str);
		},
		createPathFromArray = function(base, names, value) {
			// If a value is given, remove the last name and keep it for later:
			var lastName = arguments.length === 3 ? names.pop() : false,
				nameLen = names.length,
				newBase = base;

			// Walk the hierarchy, creating new objects where needed.
			// If the lastName was removed, then the last object is not set yet:
			for (var i = 0; i < nameLen; i++) {
				newBase = newBase[names[i]] = base[names[i]] || {};
			}

			// If a value was given, set it to the last name:
			if (lastName) {
				newBase = newBase[lastName] = value;
			}

			// Return the last object in the hierarchy:
			return newBase;
		},
		/*Returns a function, that, as long as it continues to be invoked, will not
		 * be triggered. The function will be called after it stops being called for
		 * N milliseconds. If `immediate` is passed, trigger the function on the
		 * leading edge, instead of the trailing.
		 * Usage :
		 * 			var myDelayedFunction = debounce(function() {
		 * 									All the taxing stuff you do
		 *								}, 250);
		 * 					// Add the event listener
		 * 					window.addEventListener("resize", myDelayedFunction, false);
		 * */
		debounce = function(func, wait, immediate) {
			var timeout;
			return function() {
				var context = this,
					args = arguments,
					later = function() {
						timeout = null;
						if (!immediate) {
							func.apply(context, args);
						}
					},
					callNow = immediate && !timeout;

				clearTimeout(timeout);
				timeout = setTimeout(later, wait);
				if (callNow) {
					func.apply(context, args);
				}
			};
		},
		getArrayByKeyValue = function(arr, key) {
			var obj,
				result = [];
			for (var i = 0, iLen = arr.length; i < iLen; i++) {
				obj = arr[i];
				for (var prop in obj) {
					if (obj.hasOwnProperty(prop) && prop === key) {
						result.push(obj[prop]);
					}
				}
			}
			return result;
		},
		getCleanIdString = function(str) {
			var testStr = str ? str.toString() : '';
			return testStr.replace(/[^a-zA-Z0-9]/g, '_-_');
		},
		getFunctionName = function(func) {
			var ret = func.toString();
			ret = ret.substr('function '.length);
			ret = ret.substr(0, ret.indexOf('('));
			return ret;
		},
		getDeepCopy = function(obj) {
			var copy = obj,
				k;

			if (obj && typeof obj === 'object') {
				copy =
					Object.prototype.toString.call(obj) === '[object Array]' ? [] : {};
				for (k in obj) {
					if (obj.hasOwnProperty(k)) {
						copy[k] = getDeepCopy(obj[k]);
					}
				}
			}

			return copy;
		},
		getObjectFromProp = function(prop, val, arr) {
			var item;
			for (var i = 0, len = arr.length; i < len; i++) {
				if (arr[i][prop] === val) {
					item = arr[i];
					return item;
				}
			}
			return false;
		},
		getObjectLength = function(obj, isOld) {
			if (isOld) {
				var count = 0;
				for (var i in obj) {
					if (obj.hasOwnProperty(i)) {
						count++;
					}
				}
				return count;
			} else {
				// the keys method is only available in modern browsers, and is not available in IE8 and below
				// GMA supports IE9+
				return Object.keys(obj).length;
			}
		},
		getScrollbarWidth = function(divID, windowHeight) {
			// passing in window height for better accuracy
			var winHeight = windowHeight || 50,
				div = $(
					'<div style="width:50px;height:' +
						winHeight +
						'px;overflow:hidden;position:absolute;top:-2000px;left:-2000px;"><div style="height:100px;"></div></div>'
				);
			$('#' + divID).append(div);
			var w1 = $('div', div).innerWidth();
			div.css('overflow-y', 'auto');
			var w2 = $('div', div).innerWidth();
			$(div).remove();
			return w1 - w2;
		},
		getUniqueArray = function(arr, testKey) {
			var i,
				key,
				arrLen = arr.length,
				cleanArr = [],
				cleanObj = {};
			if (testKey) {
				for (i = 0; i < arrLen; i++) {
					cleanObj[arr[i][testKey]] = arr[i];
				}
				for (key in cleanObj) {
					if (cleanObj.hasOwnProperty(key)) {
						cleanArr.push(cleanObj[key]);
					}
				}
			} else {
				$.each(arr, function(index, el) {
					if ($.inArray(el, cleanArr) === -1) {
						cleanArr.push(el);
					}
				});
			}
			return cleanArr;
		},
		isObject = function(obj) {
			return obj === Object(obj);
		},
		isValidURL = function(str) {
			// based on Grubers URL matching regex
			return /\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/i.test(
				str
			);
		},
		limitNumber = function(min, max, test) {
			var minNum = min || 0,
				maxNum = max || 100,
				testNum = test || 0;
			return Math.min(Math.max(testNum, minNum), maxNum);
		},
		objectToArray = function(obj) {
			// convert single object to array of objects
			var newArray = [],
				newObj;
			for (var prop in obj) {
				if (obj.hasOwnProperty(prop)) {
					newObj = {};
					newObj[prop] = obj[prop];
					newArray.push(newObj);
				}
			}
			return newArray;
		},
		objValuesToString = function(obj, insertSpaces) {
			var p,
				str = '',
				space = insertSpaces ? ' ' : '';
			for (p in obj) {
				if (obj.hasOwnProperty(p)) {
					str += obj[p] + space;
				}
			}
			return $.trim(str);
		},
		once = function(fn, context) {
			var result;
			return function() {
				if (fn) {
					result = fn.apply(context || this, arguments);
					fn = null;
				}
				return result;
			};
		},
		parseHash = function() {
			var i,
				token,
				data = {},
				tokens = location.hash.substring(1).split('&'),
				tokenLen = tokens.length;
			for (i = 0; i < tokenLen; i++) {
				token = tokens[i].split(':');
				data[token[0]] = token[1];
			}
			return data;
		},
		removeHashVar = function(param, url_string) {
			var URL = !url_string ? String(window.location.hash) : String(url_string),
				regex = new RegExp('\\?' + param + '=[^&]*&?', 'gi');

			URL = URL.replace(regex, '?');
			regex = new RegExp('\\&' + param + '=[^&]*&?', 'gi');
			URL = URL.replace(regex, '&');
			URL = URL.replace(/(\?|&)$/, '');
			regex = null;

			//console.log('REMOVING HASH', param, url_string);

			if (!url_string) {
				window.location.hash = URL;
			} else {
				return URL;
			}
			//console.log('Removing Hash', param, URL, setLoc);
		},
		getUrlVariable = function(name) {
			var url = window.location.href,
				newName = name.replace(/[\[\]]/g, '\\$&'),
				regex = new RegExp('[?&]' + newName + '(=([^&#]*)|&|#|$)'),
				results = regex.exec(url);

			if (!results) {
				return null;
			}
			if (!results[2]) {
				return '';
			}
			return decodeURIComponent(results[2].replace(/\+/g, ' '));
		},
		renameObjKeys = function(arr, oldKey, newKey) {
			var newArr = arr;
			for (var i = 0, loopcount = newArr.length; i < loopcount; i++) {
				newArr[i][newKey] = newArr[i][oldKey];
				delete newArr[i][oldKey];
			}
			return newArr;
		},
		searchArrayOfObjects = function(arr, key, value, remove) {
			// returns an object that has a key/value match in the array
			var tempItem,
				match = [];

			for (var i = 0, loopcount = arr.length; i < loopcount; i++) {
				tempItem = arr[i];
				if (tempItem[key] === value) {
					if (remove) {
						arr.splice(i, 1);
					} else {
						match.push(tempItem);
					}
				}
			}
			return match;
		},
		searchObjectProperties = function(obj, searchString) {
			// returns an array of objects that match the search string
			var items = [],
				newObj;
			$.each(obj, function(key, element) {
				if (key.indexOf(searchString) !== -1) {
					newObj = {};
					newObj[key] = obj[key];
					items.push(newObj);
				}
			});
			return items;
		},
		setDivScrollOnly = function(target, disable) {
			if (disable) {
				$(target).off('mousewheel DOMMouseScroll');
			} else {
				$(target).on('mousewheel DOMMouseScroll', function(evt) {
					var dist = evt.originalEvent.wheelDelta || -evt.originalEvent.detail,
						dir = dist > 0 ? 'up' : 'down',
						stop =
							(dir === 'up' && this.scrollTop === 0) ||
							(dir === 'down' &&
								this.scrollTop === this.scrollHeight - this.offsetHeight);
					if (stop) {
						evt.preventDefault();
					}
				});
			}
		},
		sortArrayOfObjects = function(key) {
			// EX MY_ARRAY.sort(NovaUtilities.sortArrayOfObjects(MY_KEY));
			return function(a, b) {
				var aName = a[key],
					bName = b[key];
				return aName < bName ? -1 : aName > bName ? 1 : 0;
			};
		},
		sortKeys = function(a, b) {
			var aName = a.label.toLowerCase();
			var bName = b.label.toLowerCase();
			return aName < bName ? -1 : aName > bName ? 1 : 0;
		},
		stripSpaces = function(str, substitute, convertToCamelCase) {
			if (str) {
				if (typeof str === 'string') {
					var replaceSub = substitute || '_';
					if (convertToCamelCase) {
						str.convertCamelCase();
					}
					// replace spaces with underscores
					return str.replace(/ /g, replaceSub);
				} else if (typeof str === 'number') {
					return str;
				}
			}
			// fallback
			return '';
		},
		stripSpecial = function(str) {
			var cleanStr = '';
			if (str) {
				cleanStr = str.replace(
					/[`~!@#$%^&*()|+=÷¿?;:'",.<>\{\}\[\]\\\/]/gi,
					''
				);
			}
			// fallback
			return cleanStr;
		},
		updateHash = function(urlParams) {
			var prop,
				newHash,
				tempHash = '',
				obj = urlParams;

			for (prop in obj) {
				if (obj.hasOwnProperty(prop)) {
					if (obj[prop]) {
						tempHash += prop + ':' + obj[prop] + '&';
					}
				}
			}
			newHash = tempHash.substring(0, tempHash.length - 1);
			window.location.hash = newHash;
		},
		//*********************** HTML GENERATORS ************************//
		getFaIcon = function(css) {
			var simpleIcon = $('<i/>', {
				class: css || 'fa'
			});
			return simpleIcon;
		},
		getSimpleButton = function(id, css, label, automation) {
			var simpleBtn = $('<button/>', {
				id: id || null,
				class: css || null,
				text: label || '',
				type: 'button',
				'data-automation':
					automation || 'btn_' + stripSpaces(label, null, true) + '_' + id
			});
			return simpleBtn;
		},
		getSimpleDiv = function(id, css, content) {
			var simpleDiv = $('<div/>', {
				id: id || null,
				class: css || null,
				html: content || ''
			});
			return simpleDiv;
		},
		getSimpleInput = function(
			id,
			name,
			type,
			value,
			css,
			checked,
			disabled,
			automation
		) {
			var simpleInput = $('<input/>', {
				id: id || '',
				class: css || '',
				name: name || '',
				type: type || 'text',
				value: value || '',
				'data-automation':
					automation || 'txt_' + stripSpaces(name, null, true) + '_' + id
			});
			if ((type === 'radio' || type === 'checkbox') && checked === true) {
				simpleInput.attr('checked', 'checked');
			}
			if (disabled === true) {
				simpleInput.prop('disabled', true);
			}
			return simpleInput;
		},
		getSimpleLabel = function(labelFor, css, content, automation) {
			var simpleLabel = $('<label/>', {
				for: labelFor || '',
				class: css || '',
				html: content || '',
				'data-automation': automation || 'lbl_' + labelFor
			});
			return simpleLabel;
		},
		getSimpleLink = function(label, css, url, id, extraAttributes, automation) {
			var extra = extraAttributes || {},
				linkData = $.extend({}, extra, {
					href: url || 'javascript:void(0)',
					class: css || '',
					html: label || '',
					id: id || '',
					'data-automation':
						automation || 'lnk_' + stripSpaces(label, null, true) + '_' + id
				}),
				simpleLink = $('<a/>', linkData);
			return simpleLink;
		},
		getSimpleListItem = function(content, css) {
			var $simpleList = $('<li/>', {
				html: content || '',
				class: css || ''
			});
			return $simpleList;
		},
		getSimpleListWrapper = function(content, css, id) {
			var $simpleList = $('<ul/>', {
				html: content || '',
				class: css || '',
				id: id || ''
			});
			return $simpleList;
		},
		getSimpleMenu = function(id, css, options) {
			var i,
				tempOption,
				$simpleMenu = getSimpleSelect(id, css),
				optionCount = options.length;
			for (i = 0; i < optionCount; i++) {
				tempOption = options[i];
				$simpleMenu.append(getSimpleOption(tempOption.value, tempOption.label));
			}
			return $simpleMenu;
		},
		getSimpleOption = function(value, label, selected, automation) {
			var $optionItem = $('<option/>', {
				value: value,
				text: label,
				'data-automation': 'lst_option_' + stripSpaces(value, null, true)
			});
			if (selected) {
				$optionItem.selected = true;
			}
			return $optionItem;
		},
		getSimpleSelect = function(id, css, type, options, automation) {
			var currOption,
				selected,
				$selectItem = $('<select/>', {
					id: id,
					class: css,
					'data-menutype': type || '',
					'data-automation':
						automation || 'lst_' + stripSpaces(type, null, true) + '_' + id
				});
			if (options) {
				for (var i = 0, itemLen = options.length; i < itemLen; i++) {
					currOption = options[i];
					selected = currOption.selected || false;
					$selectItem.append(
						getSimpleOption(currOption.value, currOption.label, selected)
					);
				}
			}
			return $selectItem;
		},
		getSimpleSpan = function(content, css, id) {
			var simpleSpan = $('<span/>', {
				text: content,
				class: css || '',
				id: id || ''
			});
			return simpleSpan;
		};

	return {
		convertTimestamp: convertTimestamp,
		currLanguage: currLanguage,
		getFaIcon: getFaIcon,
		getSimpleButton: getSimpleButton,
		getSimpleDiv: getSimpleDiv,
		getSimpleInput: getSimpleInput,
		getSimpleLabel: getSimpleLabel,
		getSimpleLink: getSimpleLink,
		getSimpleListItem: getSimpleListItem,
		getSimpleListWrapper: getSimpleListWrapper,
		getSimpleMenu: getSimpleMenu,
		getSimpleOption: getSimpleOption,
		getSimpleSelect: getSimpleSelect,
		getSimpleSpan: getSimpleSpan,
		getUrlParams: getUrlParams,
		getVariableValue: getVariableValue,
		isTruncated: isTruncated,
		removeUrlParam: removeUrlParam,
		setNovaDefaults: setNovaDefaults,
		setHash: setHash,
		setUrlParam: setUrlParam,
		setVariableValue: setVariableValue,
		showHideArea: showHideArea,
		urlParams: urlParams
	};
})(jQuery);

// HANDLEBARS HELPERS
$.fn.handlebars = function(template, data, precompiled) {
	'use strict';
	var compiledTPL,
		temp = template,
		Handlebars = window.Handlebars;
	if (precompiled === true) {
		compiledTPL = Handlebars.templates[temp];
		this.html(compiledTPL(data));
	} else {
		compiledTPL = {};
		if (temp instanceof jQuery) {
			temp = $(temp).html();
		}
		compiledTPL[temp] = Handlebars.compile(temp);
		this.html(compiledTPL[temp](data));
	}
};
