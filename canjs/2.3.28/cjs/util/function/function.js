/*!
 * CanJS - 2.3.28
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Thu, 08 Dec 2016 20:53:50 GMT
 * Licensed MIT
 */

/*can@2.3.28#util/function/function*/
var can = require('../util.js');
can.debounce = function (fn, time, context) {
    var timeout;
    return function () {
        var args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(can.proxy(function () {
            fn.apply(this, args);
        }, context || this), time);
    };
};
can.throttle = function (fn, time, context) {
    var run;
    return function () {
        var args = arguments;
        var ctx = context || this;
        if (!run) {
            run = true;
            setTimeout(function () {
                fn.apply(ctx, args);
                run = false;
            }, time);
        }
    };
};
can.defer = function (fn, context) {
    var args = arguments;
    var ctx = context || this;
    setTimeout(function () {
        fn.apply(ctx, args);
    }, 0);
};
module.exports = can;