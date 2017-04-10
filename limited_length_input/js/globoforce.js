if (typeof GLOBOFORCE === "undefined" || !GLOBOFORCE) {

    // Global root of GLOBOFORCE namespace.
    var GLOBOFORCE = {};
}

// Turn on background image caching in IE
// --------------------------------------
/*@cc_on
 if (document && document.execCommand) {
 try { document.execCommand("BackgroundImageCache",false, true); }
 catch (e) { }
 }
 @*/

GLOBOFORCE.browserDetect = function() {

    var searchString, versionSearchString, searchVersion, dataBrowser, browser, version;

    searchString = function (data) {
        for (var i=0 ; i < data.length ; i++) {
            var dataString = data[i].string;
            versionSearchString = data[i].subString;

            if (dataString.indexOf(data[i].subString) != -1) {
                return data[i].identity;
            }
        }
    };

    searchVersion = function (dataString) {
        var index = dataString.indexOf(versionSearchString);
        if (index == -1) return;
        return parseFloat(dataString.substring(index + versionSearchString.length+1));
    };

    dataBrowser =
        [
            { string: navigator.userAgent, subString: "Chrome",  identity: "Chrome" },
            { string: navigator.userAgent, subString: "MSIE",    identity: "Explorer" },
            { string: navigator.userAgent, subString: "Firefox", identity: "Firefox" },
            { string: navigator.userAgent, subString: "Safari",  identity: "Safari" },
            { string: navigator.userAgent, subString: "Opera",   identity: "Opera" }
        ];

    browser = searchString(dataBrowser) || "Other";
    version = searchVersion(navigator.userAgent) || searchVersion(navigator.appVersion) || "Unknown";

    return {
        browser: browser,
        version: version
    };

}();



/**
 * Get the text content of an element, given its id.
 * @param id the id of an element on the page
 * @return the plain text content of the element (or null if the element
 * does not exist)
 */
GLOBOFORCE.getText = function (id) {
    var msg;
    var text;
    msg = YAHOO.util.Dom.get(id);
    if (msg === null) {
        // the id didn't match anything on the page
        return null;
    }

    // http://www.quirksmode.org/dom/w3c_html.html
    if (YAHOO.lang.isUndefined(msg.innerText)) {
        text = msg.textContent; // Firefox
    } else {
        text = msg.innerText; // Everyone else
    }
    return text;
};

/**
 * Get the text content of an element, given its id and convert it to boolean.
 * @param id the id of an element on the page
 * @return the boolean value of the element (if the element does not exist return FALSE)
 */
GLOBOFORCE.getBoolean = function (id) {
    var text = GLOBOFORCE.getText(id);
    if (text == null) {
        return false;
    }

    return text === "true";
};

/**
 * Create a namespace, if it does not already exist.
 */
GLOBOFORCE.namespace = function(ns) {
    var parts, i;
    parts = ns.split(".");
    for (i = 0; i < parts.length; i += 1) {
        if (typeof GLOBOFORCE[parts[i]] === "undefined") {
            GLOBOFORCE[parts[i]] = {};
        }
    }
};

/**
 * Get the text content of an element, given its id.
 * @param id the id of an element on the page
 * @return the html text content of the element (or null if the element
 * does not exist)
 */
GLOBOFORCE.getHTML = function (id) {
    var msg;
    msg = YAHOO.util.Dom.get(id);
    if (msg === null) {
        // the id didn't match anything on the page
        return null;
    }

    return msg.innerHTML;
};

/**
 * Get the text content of an element, given its id.
 * @param id the id of an element on the page
 * @return the plain text content of the element (or null if the element
 * does not exist)
 */
GLOBOFORCE.setText = function (id, text) {
    var msg;
    msg = YAHOO.util.Dom.get(id);
    if (msg === null) {
        // the id didn't match anything on the page
        return null;
    }

    // http://www.quirksmode.org/dom/w3c_html.html
    if (YAHOO.lang.isUndefined(msg.innerText)) {
        msg.textContent = text; // Firefox
    } else {
        msg.innerText = text; // Everyone else
    }
};

/**
 * Trims whitespaces from the string (both sides)
 * @param source source string
 * @return trimmed string
 */
GLOBOFORCE.trim = function(source) {
    return source.replace(/^\s+|\s+$/g,"");
};

/**
 * Redirects to general error page. Usefull in AJAX handlers to handle fatal errors
 * @param errorUUId error uuid code
 */
GLOBOFORCE.redirectToErrorPage = function(errorUUId) {
    var clientName = GLOBOFORCE.getText("clientName");
    var params = [{ name: "errorUUId", value: errorUUId}];

    GLOBOFORCE.redirectToPage("microsites/t_pub/GeneralErrorPage", params);
};

/**
 * Redirects to a given page.
 *
 * @param pageName - page name
 * @param params - parameters to be passed to the page request
 */
GLOBOFORCE.redirectToPage = function(pageName, params) {
    var clientName = GLOBOFORCE.getText("clientName");
    var newUrl = window.location.protocol + "//" + window.location.host + "/";
    // if page urls already contains microsites - skip it
    if(pageName.indexOf("microsites")<0) {
        newUrl += "microsites/";
    }
    newUrl += pageName + "?client=" + clientName;
    if (params) {
        for (var i = 0; i < params.length; i++) {
            newUrl += "&" + params[i].name + "=" + params[i].value;
        }
    }
    window.location = newUrl;
};

/**
 * Function that reads css property from the element
 */
GLOBOFORCE.getCssProperty = function(elementId, attributeName) {
    var element = YAHOO.util.Dom.get(elementId);
    var val = null;
    if (element.style[attributeName]) {
        // inline style property
        val = element.style[attributeName];
    } else if (element.currentStyle) {
        // external stylesheet for Explorer
        val = element.currentStyle[attributeName];
    } else if (document.defaultView && document.defaultView.getComputedStyle) {
        // external stylesheet for Mozilla and Safari 1.3+
        attributeName = attributeName.replace(/([A-Z])/g, "-$1");
        attributeName = attributeName.toLowerCase();
        val = document.defaultView.getComputedStyle(element, "")
            .getPropertyValue(attributeName);
    }
    return val;
};
/**
 * Checks if the response is an error response
 */
GLOBOFORCE.checkErrorResponse = function(responseText) {
    try {
        var unmarshalledResponse = YAHOO.lang.JSON.parse(responseText);
        if("errorType" in unmarshalledResponse) {
            return true;
        }
    }
    catch(e) {
        // it wasn't AJAX response - ignore it
    }
    return false;
};

/**
 * Checks if session is expired - if so then redirects to session expired error page
 */
GLOBOFORCE.redirectOnSessionExpiry = function(responseText) {
    if(GLOBOFORCE.checkErrorResponse(responseText)===true) {
        var unmarshalledResponse = YAHOO.lang.JSON.parse(responseText);
        if(unmarshalledResponse.exceptionMessage==="session_expired") {

            // redirect to session expired error page
            GLOBOFORCE.redirectToPage(unmarshalledResponse.errorPage);
            return true;
        }
    }
    return false;
};

/**
 * Checks if there are any errors in response. If yes then handles the errors (redirects to error page). If no returns true;
 */
GLOBOFORCE.handlePotentialErrorsInResponse = function(response) {
    var sessionExpired = GLOBOFORCE.redirectOnSessionExpiry(response.responseText);
    if (sessionExpired) {
        return false;
    }

    var parsedResponse, uuid;
    uuid = "";
    try {
        parsedResponse = YAHOO.lang.JSON.parse(response.responseText);
        uuid = parsedResponse.errorUUId;
    } catch (e) {
    }
    if (uuid != "") {
        GLOBOFORCE.redirectToErrorPage(uuid);
        return false;
    }

    return true;
};

/**
 * Clears warnings and errors on the page (see warningerror.jsp)
 *
 */
GLOBOFORCE.cleanMessage = function() {
    YAHOO.util.Dom.setStyle('error', 'display', 'none');
    YAHOO.util.Dom.setStyle('warning', 'display', 'none');
    document.getElementById('errorMessage').innerHTML = 'none';
    document.getElementById('warningMessage').innerHTML = 'none';
};
/**
 * Showas warnings and errors on the page (see warningerror.jsp)
 * @param message
 * @param type 'error', 'warning', 'info'
 */
GLOBOFORCE.showMessage = function(message, type) {
    YAHOO.util.Dom.setStyle(type, 'display', 'block');

    if (document.getElementById(type + 'Message').innerHTML === 'none' )
    {
        document.getElementById(type + 'Message').innerHTML = message;
    } else {
        document.getElementById(type + 'Message').innerHTML = document.getElementById(type + 'Message').innerHTML + "<br>" + message;
    }
};

/**
 * Finds the index of an object in the given array.
 *
 * @param arr
 * @param obj
 */
GLOBOFORCE.indexOf = function(arr, obj) {

    for(var i=0; i<arr.length; i++){
        if(arr[i]===obj){
            return i;
        }
    }
    return -1;
};

/**
 * Returns true if using IE6.
 */
GLOBOFORCE.isIE6 = function() {

    return Math.floor(YAHOO.env.ua.ie) == 6;
};

GLOBOFORCE.getOuterHeight = function (el, margin) {
    var heightAttributes = [
        "height",
        "border-top-width",
        "border-bottom-width",
        "padding-top",
        "padding-bottom"
    ];
    if (margin) {
        heightAttributes[heightAttributes.length] = "margin-top";
        heightAttributes[heightAttributes.length] = "margin-bottom";
    }

    var getAttributeValue = function (attributeName) {
        // For most browsers, getStyle() will get us a value for the attribute
        // that is parse-able into a number:
        var attributeValue = parseFloat(YAHOO.util.Dom.getStyle(el, attributeName));

        // If the browser returns something that is not parse-able, like "auto",
        // getComputedStyle() should get us what we need:
        if (isNaN(attributeValue)) {
            attributeValue = parseFloat(YAHOO.util.Dom.getComputedStyle(el, attributeName));
        }

        if (isNaN(attributeValue)) {
            attributeValue = 0;
        }
        return attributeValue;
    };

    var height = 0;
    for (var i = 0; i < heightAttributes.length; i++) {
        var attributeName = heightAttributes[i];
        height += getAttributeValue(attributeName);
    }
    return isNaN(height) ? 0 : height;
};

GLOBOFORCE.getOuterWidth = function (el, margin) {
    var widthAttributes = [
        "width",
        "border-left-width",
        "border-right-width",
        "padding-left",
        "padding-right"
    ];
    if (margin) {
        widthAttributes[widthAttributes.length] = "margin-left";
        widthAttributes[widthAttributes.length] = "margin-right";
    }

    var getAttributeValue = function (attributeName) {
        // For most browsers, getStyle() will get us a value for the attribute
        // that is parse-able into a number:
        var attributeValue = parseFloat(YAHOO.util.Dom.getStyle(el, attributeName));

        // If the browser returns something that is not parse-able, like "auto",
        // getComputedStyle() should get us what we need:
        if (isNaN(attributeValue)) {
            attributeValue = parseFloat(YAHOO.util.Dom.getComputedStyle(el, attributeName));
        }

        if (isNaN(attributeValue)) {
            attributeValue = 0;
        }
        return attributeValue;
    };

    var width = 0;
    for (var i = 0; i < widthAttributes.length; i++) {
        var attributeName = widthAttributes[i];
        width += getAttributeValue(attributeName);
    }
    return isNaN(width) ? 0 : width;
};

/**
 * Returns uncoded request parameter (optionally decoded)
 * @param name
 * @param decoding - true by default
 * @returns {*}
 */
GLOBOFORCE.getRequestParameter = function (name, decoding) {
    decoding = (typeof decoding === "undefined") ? true : decoding;
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( window.location.href );
    if( results === null )
        return results;
    else
        return decoding ? decodeURIComponent(results[1]) : results[1];
};

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 */
GLOBOFORCE.debounce = function (func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};


/**
 * The bind function is an addition to ECMA-262, 5th edition;
 * as such it may not be present in all browsers, the following allowing use of much of the functionality of bind()
 * in implementations that do not natively support it.
 */
if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
        if (typeof this !== 'function') {
            // closest thing possible to the ECMAScript 5
            // internal IsCallable function
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }

        var aArgs   = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP    = function() {},
            fBound  = function() {
                return fToBind.apply(this instanceof fNOP
                        ? this
                        : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}
/**
 * The includes() method determines whether one string may be found within another string, returning true or false as appropriate.
 * This method has been added to the ECMAScript 6 specification and may not be available in all JavaScript implementations yet.
 * Polyfill this method.
 */
if (!String.prototype.includes) {
    String.prototype.includes = function() {'use strict';
        return String.prototype.indexOf.apply(this, arguments) !== -1;
    };
}



/**
 * The escapeHtmlEntities method escape text to html entity encoding
 */
GLOBOFORCE.escapeHtmlEntities = function (text) {
    return text.replace(/[\x01-\t\x0B\f\x0E-\x1F\x7F\x81\x8D\x8F\x90\x9D\xA0-\uFFFF<>\&，"]/g, function(c) {
        return '&' +
            (GLOBOFORCE.escapeHtmlEntities.entityTable[c.charCodeAt(0)] || '#'+c.charCodeAt(0)) + ';';
    });
};

// all HTML4 entities as defined here: http://www.w3.org/TR/html4/sgml/entities.html
// added: amp, lt, gt, quot and apos
GLOBOFORCE.escapeHtmlEntities.entityTable = {
    34 : 'quot',
    38 : 'amp',
    39 : 'apos',
    60 : 'lt',
    62 : 'gt',
    160 : 'nbsp',
    161 : 'iexcl',
    162 : 'cent',
    163 : 'pound',
    164 : 'curren',
    165 : 'yen',
    166 : 'brvbar',
    167 : 'sect',
    168 : 'uml',
    169 : 'copy',
    170 : 'ordf',
    171 : 'laquo',
    172 : 'not',
    173 : 'shy',
    174 : 'reg',
    175 : 'macr',
    176 : 'deg',
    177 : 'plusmn',
    178 : 'sup2',
    179 : 'sup3',
    180 : 'acute',
    181 : 'micro',
    182 : 'para',
    183 : 'middot',
    184 : 'cedil',
    185 : 'sup1',
    186 : 'ordm',
    187 : 'raquo',
    188 : 'frac14',
    189 : 'frac12',
    190 : 'frac34',
    191 : 'iquest',
    192 : 'Agrave',
    193 : 'Aacute',
    194 : 'Acirc',
    195 : 'Atilde',
    196 : 'Auml',
    197 : 'Aring',
    198 : 'AElig',
    199 : 'Ccedil',
    200 : 'Egrave',
    201 : 'Eacute',
    202 : 'Ecirc',
    203 : 'Euml',
    204 : 'Igrave',
    205 : 'Iacute',
    206 : 'Icirc',
    207 : 'Iuml',
    208 : 'ETH',
    209 : 'Ntilde',
    210 : 'Ograve',
    211 : 'Oacute',
    212 : 'Ocirc',
    213 : 'Otilde',
    214 : 'Ouml',
    215 : 'times',
    216 : 'Oslash',
    217 : 'Ugrave',
    218 : 'Uacute',
    219 : 'Ucirc',
    220 : 'Uuml',
    221 : 'Yacute',
    222 : 'THORN',
    223 : 'szlig',
    224 : 'agrave',
    225 : 'aacute',
    226 : 'acirc',
    227 : 'atilde',
    228 : 'auml',
    229 : 'aring',
    230 : 'aelig',
    231 : 'ccedil',
    232 : 'egrave',
    233 : 'eacute',
    234 : 'ecirc',
    235 : 'euml',
    236 : 'igrave',
    237 : 'iacute',
    238 : 'icirc',
    239 : 'iuml',
    240 : 'eth',
    241 : 'ntilde',
    242 : 'ograve',
    243 : 'oacute',
    244 : 'ocirc',
    245 : 'otilde',
    246 : 'ouml',
    247 : 'divide',
    248 : 'oslash',
    249 : 'ugrave',
    250 : 'uacute',
    251 : 'ucirc',
    252 : 'uuml',
    253 : 'yacute',
    254 : 'thorn',
    255 : 'yuml',
    402 : 'fnof',
    913 : 'Alpha',
    914 : 'Beta',
    915 : 'Gamma',
    916 : 'Delta',
    917 : 'Epsilon',
    918 : 'Zeta',
    919 : 'Eta',
    920 : 'Theta',
    921 : 'Iota',
    922 : 'Kappa',
    923 : 'Lambda',
    924 : 'Mu',
    925 : 'Nu',
    926 : 'Xi',
    927 : 'Omicron',
    928 : 'Pi',
    929 : 'Rho',
    931 : 'Sigma',
    932 : 'Tau',
    933 : 'Upsilon',
    934 : 'Phi',
    935 : 'Chi',
    936 : 'Psi',
    937 : 'Omega',
    945 : 'alpha',
    946 : 'beta',
    947 : 'gamma',
    948 : 'delta',
    949 : 'epsilon',
    950 : 'zeta',
    951 : 'eta',
    952 : 'theta',
    953 : 'iota',
    954 : 'kappa',
    955 : 'lambda',
    956 : 'mu',
    957 : 'nu',
    958 : 'xi',
    959 : 'omicron',
    960 : 'pi',
    961 : 'rho',
    962 : 'sigmaf',
    963 : 'sigma',
    964 : 'tau',
    965 : 'upsilon',
    966 : 'phi',
    967 : 'chi',
    968 : 'psi',
    969 : 'omega',
    977 : 'thetasym',
    978 : 'upsih',
    982 : 'piv',
    8226 : 'bull',
    8230 : 'hellip',
    8242 : 'prime',
    8243 : 'Prime',
    8254 : 'oline',
    8260 : 'frasl',
    8472 : 'weierp',
    8465 : 'image',
    8476 : 'real',
    8482 : 'trade',
    8501 : 'alefsym',
    8592 : 'larr',
    8593 : 'uarr',
    8594 : 'rarr',
    8595 : 'darr',
    8596 : 'harr',
    8629 : 'crarr',
    8656 : 'lArr',
    8657 : 'uArr',
    8658 : 'rArr',
    8659 : 'dArr',
    8660 : 'hArr',
    8704 : 'forall',
    8706 : 'part',
    8707 : 'exist',
    8709 : 'empty',
    8711 : 'nabla',
    8712 : 'isin',
    8713 : 'notin',
    8715 : 'ni',
    8719 : 'prod',
    8721 : 'sum',
    8722 : 'minus',
    8727 : 'lowast',
    8730 : 'radic',
    8733 : 'prop',
    8734 : 'infin',
    8736 : 'ang',
    8743 : 'and',
    8744 : 'or',
    8745 : 'cap',
    8746 : 'cup',
    8747 : 'int',
    8756 : 'there4',
    8764 : 'sim',
    8773 : 'cong',
    8776 : 'asymp',
    8800 : 'ne',
    8801 : 'equiv',
    8804 : 'le',
    8805 : 'ge',
    8834 : 'sub',
    8835 : 'sup',
    8836 : 'nsub',
    8838 : 'sube',
    8839 : 'supe',
    8853 : 'oplus',
    8855 : 'otimes',
    8869 : 'perp',
    8901 : 'sdot',
    8968 : 'lceil',
    8969 : 'rceil',
    8970 : 'lfloor',
    8971 : 'rfloor',
    9001 : 'lang',
    9002 : 'rang',
    9674 : 'loz',
    9824 : 'spades',
    9827 : 'clubs',
    9829 : 'hearts',
    9830 : 'diams',
    338 : 'OElig',
    339 : 'oelig',
    352 : 'Scaron',
    353 : 'scaron',
    376 : 'Yuml',
    710 : 'circ',
    732 : 'tilde',
    8194 : 'ensp',
    8195 : 'emsp',
    8201 : 'thinsp',
    8204 : 'zwnj',
    8205 : 'zwj',
    8206 : 'lrm',
    8207 : 'rlm',
    8211 : 'ndash',
    8212 : 'mdash',
    8216 : 'lsquo',
    8217 : 'rsquo',
    8218 : 'sbquo',
    8220 : 'ldquo',
    8221 : 'rdquo',
    8222 : 'bdquo',
    8224 : 'dagger',
    8225 : 'Dagger',
    8240 : 'permil',
    8249 : 'lsaquo',
    8250 : 'rsaquo',
    8364 : 'euro'
};

// Flag changed to true if an error is being handled.
GLOBOFORCE.inflightError=false;


/**
 * Handles an error obtaining extra information of the error and the browser sends it to the server.
 * Expects from the server an error code UUID that is used to redirect to the error page.
 *
 * @param message message of the error.
 * @param url url where the error happends.
 * @param line line where the error happend.
 * @param col column line where the error happend. Can be undefined on old browsers.
 * @param error Error object. Can be undefined on old browsers.
 */
GLOBOFORCE.handleError = function(message, url, line, col, error) {

    // Avoid loops
    if(GLOBOFORCE.inflightError===true) {
        console.log("Loop in error handling.");
        return;
    }
    GLOBOFORCE.inflightError=true;

    var errorData = {};
    errorData.message = message;
    errorData.url = url;
    errorData.line = line;
    errorData.col = col;
    errorData.error = GLOBOFORCE.printableError(error);
    errorData.page = window.location.href;
    errorData.navigator = GLOBOFORCE.printableNavigator();

    // If the error object is provided and the ErrorStackParser framework is available, enhance it and store it in stackframes.
    if(typeof error != 'undefined' && typeof ErrorStackParser != 'undefined') {
        errorData.stackframes = ErrorStackParser.parse(error);
    }

    // Generate JSON
    var errorDataJson=JSON.stringify(errorData);

    // Send error to server
    var xhr = new XMLHttpRequest();

    xhr.open("POST", "/microsites/t_pub/jserror", true);
    xhr.responseType = 'text';

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {

            // Redirect to error page with the received error code.
            //TODO: uncomment redirection after IE issues are handled.
            //GLOBOFORCE.redirectToErrorPage(xhr.responseText);
            console.error("Error UUID: " + xhr.responseText);
        }
    };

    xhr.send(errorDataJson);

    console.error(errorDataJson);

    return true;
};


/**
 * Replace navigator object by new representation that can be converted to JSON.
 *
 * @returns Object with navigator information.
 */
GLOBOFORCE.printableNavigator = function() {
    var _navigator = {};
    for (var i in navigator) _navigator[i] = navigator[i];

    // For Internet Explorer
    delete _navigator.plugins;
    delete _navigator.mimeTypes;

    return _navigator;
};


/**
 * Replace error object by new representation that can be converted to JSON.
 *
 * @param error Error object
 * @returns Object with error information.
 */
GLOBOFORCE.printableError = function(error) {
    if (error instanceof Error) {
        var _error = {};

        Object.getOwnPropertyNames(error).forEach(function (key) {
            _error[key] = error[key];
        });

        return _error;
    }
};


/**
 * Throw an error with the provided message.
 *
 * @param message error message.
 */
GLOBOFORCE.throwError = function(message) {
    throw new Error(message);
};


/**
 * Function that catches any un-catched error in the page.
 *
 * @param message message of the error.
 * @param url url where the error happends.
 * @param line line where the error happend.
 * @param col column line where the error happend. Can be undefined on old browsers.
 * @param error Error object. Can be undefined on old browsers.
 */
window.onerror = function(message, url, line, col, error) {
    GLOBOFORCE.handleError(message, url, line, col, error);
};


/**
 * Detect and return ltr or rtl
 */
GLOBOFORCE.langDirection = function() {
    var direction = document.getElementsByTagName('html')[0].dir;
    return direction;
}();
