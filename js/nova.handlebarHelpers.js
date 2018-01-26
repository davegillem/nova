/*eslint strict:0, eqeqeq:0*/
/* jshint eqeqeq:false */
var Handlebars  = window.Handlebars;
//*************************** HELPER ASSIGNMENTS *************************//
Handlebars.registerHelper('partial',        function (templateName) {
    return new Handlebars.SafeString(Handlebars.templates[templateName](this));
});
Handlebars.registerHelper('include',        function (templatename, options) {
    'use strict';
	// include a partial but also pass in varaibales to the partial
    var partial = Handlebars.templates[templatename],
        context = $.extend({}, this, options.hash);
    return new Handlebars.SafeString(partial(context));
});
Handlebars.registerHelper('comparemultiple', function (leftVal, rightVal, orVal, options) {
    'use strict';
    if (arguments.length < 3){
        throw new Error('Handlerbars Helper "comparemultiple" needs at least 2 parameters');
    }
    var result,
        ignoreCase = options.hash.ignoreCase || false,
        lvalue      = leftVal || '',
        rvalue      = rightVal || '',
        ovalue      = orVal || '',
        operators = {
                        '=='        : function(l, r, o) { return l === r || l === o; },
                        '==='       : function(l, r, o) { return l === r || l === o; },
                        '!='        : function(l, r, o) { return l !== r || l !== o; },
                        '<'         : function(l, r, o) { return l < r || l < o; },
                        '>'         : function(l, r, o) { return l > r || l > o; },
                        '<='        : function(l, r, o) { return l <= r || l <= o; },
                        '>='        : function(l, r, o) { return l >= r || l >= o; }
                    },
        operator = options.hash.operator || '==';
    if (!operators[operator]){
        throw new Error('Handlerbars Helper "comparemultiple" doesn\'t know the operator '+operator);
    }
    if (ignoreCase){
        result = operators[operator](lvalue.toLowerCase(), rvalue.toLowerCase(), ovalue.toLowerCase());
    } else {
        result = operators[operator](lvalue, rvalue, ovalue);
    }
    if (result) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
    // EXAMPLE
    //{{#comparemultiple unicorns ponies horses operator="<"}}
    //    I knew it, unicorns are just low-quality ponies!
    //    And they arent even horses either!
    //{{/comparemultiple}}
    //
});
Handlebars.registerHelper('compare',        function (leftVal, rightVal, options) {
    'use strict';
	if (arguments.length < 3) {
        throw new Error('Handlerbars Helper "compare" needs 2 parameters');
    }

    var result,
    	ignoreCase = options.hash.ignoreCase || false,
    	lvalue		= leftVal || '',
    	rvalue		= rightVal || '',
        operators = {
                        '=='        : function(l, r) { return l == r; },
                        '==='       : function(l, r) { return l === r; },
                        '!='        : function(l, r) { return l != r; },
                        '<'         : function(l, r) { return l < r; },
                        '>'         : function(l, r) { return l > r; },
                        '<='        : function(l, r) { return l <= r; },
                        '>='        : function(l, r) { return l >= r; },
                        'typeof'    : function(l, r) { return typeof l === r; }
                    },
        operator = options.hash.operator || '==';
        //console.log('COMPARING', leftVal, rightVal, operator, leftVal == rightVal);
    if (!operators[operator]) {
        throw new Error('Handlerbars Helper "compare" doesn\'t know the operator '+operator);
    }
    if (ignoreCase) {
	    result = operators[operator](lvalue.toLowerCase(), rvalue.toLowerCase());
	} else {
		result = operators[operator](lvalue, rvalue);
	}
    if (result) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
    // EXAMPLE
    //{{#compare unicorns ponies operator="<"}}
    //    I knew it, unicorns are just low-quality ponies!
    //{{/compare}}
    //
});
Handlebars.registerHelper('setDisplayIndex', function (value, increase) {
    // {{setDisplayIndex @index}} creates an index variable that begins at 1 for display
    // reference using {{displayIndex}} after its created
    var increaseValue = increase === false ? 0:1;
    this.displayIndex = Number(value+increaseValue);
});
Handlebars.registerHelper('setTemplateVar', function (varName, options) {
    //  {{setTemplateVar "itemID" string1=@index string2="-" string3=displayIndex }}
    //   creates a myVar variable and combines all of the string values (1-n) into a single string
	var p, index,
		hashArray 	= [],
		data 		= options.hash;

	for (p in data) {
		if (data.hasOwnProperty(p)) {
			index = Number(p.substr(6));
			hashArray[index] = data[p];
	    }
	}
    this[varName] = hashArray.join('');
});
Handlebars.registerHelper('setCleanID', 	function (str, newVarName) {
    // {{setCleanID 'test blah' 'cleanID'}} creates an variable named cleanID with a value that has all spaces and special characters replaced - 'test_-_blah'
    this[newVarName] = NovaUtilities.getCleanIdString(str);
});
Handlebars.registerHelper('stripSpaces',    function (str, substitute, stripSpecial) {
    var convertToCamelCase = substitute.length > 0,
        cleanStr = stripSpecial ? NovaUtilities.stripSpecial(str) : str;
   return NovaUtilities.stripSpaces(cleanStr, substitute, convertToCamelCase);
});
Handlebars.registerHelper('toLowerCase',    function (stringToConvert) {
    if (typeof stringToConvert === 'string') {
        return stringToConvert.toLowerCase();
    } else {
        return stringToConvert;
    }
});
Handlebars.registerHelper('debug',          function (msg, options) {
    console.log('Current Context');
    console.log('====================');
    console.log(this);

    if (msg) {
        console.log('Value');
        console.log('====================');
        console.log(msg, options);
    }
});
Handlebars.registerHelper('times',          function (number, zero, options) {
    var i,
        result = '',
        newOptions = options || zero,
        newZero = ( zero === 'zero' );
    if (newZero) {
        for ( i = 0; i < number; i++ ) {result += newOptions.fn( i );}
    } else {
        for ( i = 1; i <= number; i++ ) {result += newOptions.fn( i );}
    }
    return result;
});
Handlebars.registerHelper('truncate',       function (str, options) {
    'use strict';
	//console.log('TRUNCATE OPTIONS',options);
    var new_str,
    	opts 	= options.hash,
    	tail	= opts.overflowText || '',
    	//str		= opts.string,
    	len		= Number(opts.trimLength),
    	newVal 	= str;

    if (str.length > len && str.length > 0) {
        new_str = str + ' ';
        new_str = str.substr(0, len);
        new_str = str.substr(0, new_str.lastIndexOf(' '));
        new_str = (new_str.length > 0) ? new_str : str.substr(0, len);

        newVal = new Handlebars.SafeString( new_str + tail);
    }
    //console.log('TRUNCATED '+str+' to '+newVal, options);
    return newVal;
});
Handlebars.registerHelper('ifAnd',          function (a, b, options) {
    if (a && b) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
});
Handlebars.registerHelper('if_even',        function (conditional, options) {
    'use strict';
    if ((conditional % 2) === 0) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});
Handlebars.registerHelper('ifObject',       function(item, options) {
  if (typeof item === 'object') {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});
Handlebars.registerHelper('ifArray',        function(item, options) {
  if (item instanceof Array) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});