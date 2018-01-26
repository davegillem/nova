/*eslint strict:0, no-cond-assign:0*/
//** SET USER AGENT IN BROWSER **//
var DEBUG, JQDEBUG,
	debugLogStyle = 'color:#fff; font-weight:bold; background:#845100; padding:5px;',
    doc = document.documentElement;
doc.setAttribute('data-useragent', navigator.userAgent);
$.extend({
    getUrlVars: function (str) {
        var i,
            hash,
            hashLoc,
            hashSlice,
            vars    = [],
            urlStr  = str || window.location.href,
            hashes  = urlStr.slice(urlStr.indexOf('?') + 1).split('&'),
            hashLen = hashes.length;

        for (i = 0; i < hashLen; i++) {
            hashLoc = hashes[i].indexOf('#');
            hashSlice = hashLoc > 0 ? hashLoc : hashes[i].length;
            //hash = hashes[i].split('=');
            // updated to make sure hash isnt included in param value
            hash = hashes[i].slice(0, hashSlice).split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    },
    getUrlVar: function (name, str) {
        return $.getUrlVars(str)[name];
    }
});
//*** IE CONSOLE & DEBUG HACK/FIX ***//
DEBUG = $.getUrlVar('debug') === 'true';
JQDEBUG = $.getUrlVar('jqdebug') === 'true';
// disable console if debug !== true and fixes console availability in IE
(function (a) {function b() {} for (var c='assert,clear,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,table,time,timestamp,timeEnd,trace,warn'.split(','), d; !!(d=c.pop());) {a[d]=a[d]||b;}})(
function () {
	var isConsole = true;
	if (DEBUG) {
		try {
			console.log();
			if (window.console.group){
				window.console.group = window.console.groupCollapsed;
			}
			return window.console;
		} catch (a) {
			isConsole = false;
			return (window.console={});
		}
	} else {
		return (window.console={});
	}
}());

// Place notification in the output window to indicate debugging and enable jQuery Migrate logging
if (DEBUG) {console.warn('%cIN DEBUG MODE', debugLogStyle);}//else{console.log=function() {};}
if (JQDEBUG) {$.migrateMute=false;} else {$.migrateMute=true;}