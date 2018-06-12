/**
 * css-hint - Awesome tooltips at your fingertips
 * @version v2.0.4
 * @link https://github.com/bevacqua/css-hint
 * @license MIT
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hint = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
if (!Array.prototype.map) {
  Array.prototype.map = function (fn) {
    'use strict';

    if (this === void 0 || this === null) {
      throw new TypeError();
    }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fn !== 'function') {
      throw new TypeError();
    }

    var res = new Array(len);
    var ctx = arguments.length >= 2 ? arguments[1] : void 0;
    var i;
    for (i = 0; i < len; i++) {
      if (i in t) {
        res[i] = fn.call(ctx, t[i], i, t);
      }
    }

    return res;
  };
}

},{}],2:[function(require,module,exports){
'use strict';

require('./object-keys');
require('./array-map');

var camel = /([a-z])([A-Z])/g;
var hyphens = '$1-$2';
var contexts = {};

function parseStyles (styles) {
  if (typeof styles === 'string') {
    return styles;
  }
  if (Object.prototype.toString.call(styles) !== '[object Object]') {
    return '';
  }
  return Object.keys(styles).map(function (key) {
    var prop = key.replace(camel, hyphens).toLowerCase();
    return prop + ':' + styles[key];
  }).join(';');
}

function context (name) {
  if (contexts[name]) {
    return contexts[name];
  }
  var cache;
  var rules;
  var remove;

  function getStylesheet () {
    if (cache) {
      return cache;
    }
    var style = document.createElement('style');
    document.body.appendChild(style);
    style.setAttribute('data-context', name);
    cache = document.styleSheets[document.styleSheets.length - 1];
    rules = cache.cssRules ? 'cssRules' : 'rules';
    remove = cache.removeRule ? 'removeRule' : 'deleteRule';
    return cache;
  }

  function add (selector, styles) {
    var css = parseStyles(styles);
    var sheet = getStylesheet();
    var len = sheet[rules].length;
    if (sheet.insertRule) {
      sheet.insertRule(selector + '{' + css + '}', len);
    } else if (sheet.addRule) {
      sheet.addRule(selector, css, len);
    }
  }

  function remove (selector) {
    var sheet = getStylesheet();
    var length = sheet[rules].length;
    var i;
    for (i = length - 1; i >= 0; i--) {
      if (sheet[rules][i].selectorText === selector) {
        sheet[remove](i);
      }
    }
  }

  function clear () {
    var sheet = getStylesheet();
    while (sheet[rules].length) {
      sheet[remove](0);
    }
  }

  add.clear = clear;
  add.remove = remove;
  contexts[name] = add;
  return contexts[name];
}

var ctx = context('default');
ctx.context = context;
module.exports = ctx;

},{"./array-map":1,"./object-keys":3}],3:[function(require,module,exports){
if (!Object.keys) {
  Object.keys = (function () {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString');
    var dontEnums = [
      'toString',
      'toLocaleString',
      'valueOf',
      'hasOwnProperty',
      'isPrototypeOf',
      'propertyIsEnumerable',
      'constructor'
    ];
    var dontEnumsLength = dontEnums.length;

    return function (obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [];
      var prop;
      var i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}

},{}],4:[function(require,module,exports){
'use strict';

var insertRule = require('insert-rule').context('hint');
var events = require('./events');
var expando = 'hint-' + Date.now();
var api = {
  maximumWidth: 650
};

events.add(document.body, 'mouseover', enter);
events.add(document.body, 'mouseout', leave);

function enter (e) {
  var prev = scan(e.fromElement);
  var elem = scan(e.target);
  if (elem && elem !== prev) {
    move(elem);
  }
}

function leave (e) {
  var next = scan(e.toElement);
  var elem = scan(e.target);
  if (elem && elem !== next) {
    clear(elem);
  }
}

function scan (elem) {
  while (elem) {
    if (probe(elem)) {
      return elem;
    }
    elem = elem.parentElement;
  }
}

function probe (elem) {
  return elem.getAttribute('aria-label') || elem.getAttribute('data-hint');
}

function expandex () {
  return expando + Date.now();
}

function i (px) {
  var raw = px.replace('px', '');
  return parseInt(raw, 10);
}

function getPseudo (elem) {
  return elem.className.indexOf('hint-before') !== -1 ? ':before' : ':after';
}

function move (elem) {
  var totalWidth = innerWidth;
  var pseudo = getPseudo(elem);
  var c = getComputedStyle(elem, pseudo);
  var existed = elem.getAttribute('id');
  var id = existed || expandex();
  if (id.indexOf(expando) === 0) {
    elem.setAttribute('id', id);
  }

  var selector = '#' + id + pseudo;
  var rect = elem.getBoundingClientRect();
  var paddings = i(c.paddingLeft) + i(c.paddingRight) + i(c.marginLeft) + i(c.marginRight);
  var width;
  var left;
  var right = rect.left + i(c.width) + i(c.left) + paddings;
  var collapse;
  var offset;
  var margin = 20;
  var max = api.maximumWidth === 'auto' ? Infinity : api.maximumWidth;

  if (i(c.width) + margin > totalWidth) {
    collapse = totalWidth - margin > max;
    width = collapse ? max : totalWidth - margin;
    offset = collapse ? totalWidth - max - margin : 0;
    left = -(rect.left + paddings) + offset;

    insertRule(selector, {
      width: width + 'px',
      left: left - 15 + 'px',
      whiteSpace: 'inherit'
    });
  } else if (right + margin > totalWidth) {
    insertRule(selector, {
      left: totalWidth - right + margin + 'px'
    });
  }
  transparent();
  setTimeout(opaque, 1000);

  function transparent () {
    insertRule(selector, { opacity: 0 });
  }
  function opaque () {
    insertRule(selector, transition({
      opacity: 1
    }));
  }
  function transition (css) {
    var rule = 'transition';
    var prefixes = ['', '-webkit-', '-moz-', '-o-', '-ms-'];
    function add (prefix) {
      css[prefix + rule] = 'opacity 0.3s ease-in-out';
    }
    prefixes.forEach(add);
    return css;
  }
}

function clear (elem) {
  var pseudo = getPseudo(elem);
  var id = elem.id;
  if (id.indexOf(expando) === 0) {
    elem.removeAttribute('id');
  }
  var selector = '#' + id + pseudo;
  insertRule.remove(selector);
}

module.exports = api;

},{"./events":5,"insert-rule":2}],5:[function(require,module,exports){
'use strict';

var addEvent = addEventEasy;
var removeEvent = removeEventEasy;

if (!window.addEventListener) {
  addEvent = addEventHard;
}

if (!window.removeEventListener) {
  removeEvent = removeEventHard;
}

function addEventEasy (element, evt, fn) {
  return element.addEventListener(evt, fn);
}

function addEventHard (element, evt, fn) {
  return element.attachEvent('on' + evt, function (e) {
    e = e || window.event;
    e.target = e.target || e.srcElement;
    e.preventDefault  = e.preventDefault  || function preventDefault () { e.returnValue = false; };
    e.stopPropagation = e.stopPropagation || function stopPropagation () { e.cancelBubble = true; };
    fn.call(element, e);
  });
}

function removeEventEasy (element, evt, fn) {
  return element.removeEventListener(evt, fn);
}

function removeEventHard (element, evt, fn) {
  return element.detachEvent('on' + evt, fn);
}

module.exports = {
  add: addEvent,
  remove: removeEvent
};

},{}]},{},[4])(4)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaW5zZXJ0LXJ1bGUvc3JjL2FycmF5LW1hcC5qcyIsIm5vZGVfbW9kdWxlcy9pbnNlcnQtcnVsZS9zcmMvaW5zZXJ0UnVsZS5qcyIsIm5vZGVfbW9kdWxlcy9pbnNlcnQtcnVsZS9zcmMvb2JqZWN0LWtleXMuanMiLCJzcmMvY3NzLWhpbnQuanMiLCJzcmMvZXZlbnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiaWYgKCFBcnJheS5wcm90b3R5cGUubWFwKSB7XG4gIEFycmF5LnByb3RvdHlwZS5tYXAgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBpZiAodGhpcyA9PT0gdm9pZCAwIHx8IHRoaXMgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcbiAgICB9XG5cbiAgICB2YXIgdCA9IE9iamVjdCh0aGlzKTtcbiAgICB2YXIgbGVuID0gdC5sZW5ndGggPj4+IDA7XG4gICAgaWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xuICAgIH1cblxuICAgIHZhciByZXMgPSBuZXcgQXJyYXkobGVuKTtcbiAgICB2YXIgY3R4ID0gYXJndW1lbnRzLmxlbmd0aCA+PSAyID8gYXJndW1lbnRzWzFdIDogdm9pZCAwO1xuICAgIHZhciBpO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgaWYgKGkgaW4gdCkge1xuICAgICAgICByZXNbaV0gPSBmbi5jYWxsKGN0eCwgdFtpXSwgaSwgdCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlcztcbiAgfTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxucmVxdWlyZSgnLi9vYmplY3Qta2V5cycpO1xucmVxdWlyZSgnLi9hcnJheS1tYXAnKTtcblxudmFyIGNhbWVsID0gLyhbYS16XSkoW0EtWl0pL2c7XG52YXIgaHlwaGVucyA9ICckMS0kMic7XG52YXIgY29udGV4dHMgPSB7fTtcblxuZnVuY3Rpb24gcGFyc2VTdHlsZXMgKHN0eWxlcykge1xuICBpZiAodHlwZW9mIHN0eWxlcyA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gc3R5bGVzO1xuICB9XG4gIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoc3R5bGVzKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbiAgcmV0dXJuIE9iamVjdC5rZXlzKHN0eWxlcykubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICB2YXIgcHJvcCA9IGtleS5yZXBsYWNlKGNhbWVsLCBoeXBoZW5zKS50b0xvd2VyQ2FzZSgpO1xuICAgIHJldHVybiBwcm9wICsgJzonICsgc3R5bGVzW2tleV07XG4gIH0pLmpvaW4oJzsnKTtcbn1cblxuZnVuY3Rpb24gY29udGV4dCAobmFtZSkge1xuICBpZiAoY29udGV4dHNbbmFtZV0pIHtcbiAgICByZXR1cm4gY29udGV4dHNbbmFtZV07XG4gIH1cbiAgdmFyIGNhY2hlO1xuICB2YXIgcnVsZXM7XG4gIHZhciByZW1vdmU7XG5cbiAgZnVuY3Rpb24gZ2V0U3R5bGVzaGVldCAoKSB7XG4gICAgaWYgKGNhY2hlKSB7XG4gICAgICByZXR1cm4gY2FjaGU7XG4gICAgfVxuICAgIHZhciBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzdHlsZSk7XG4gICAgc3R5bGUuc2V0QXR0cmlidXRlKCdkYXRhLWNvbnRleHQnLCBuYW1lKTtcbiAgICBjYWNoZSA9IGRvY3VtZW50LnN0eWxlU2hlZXRzW2RvY3VtZW50LnN0eWxlU2hlZXRzLmxlbmd0aCAtIDFdO1xuICAgIHJ1bGVzID0gY2FjaGUuY3NzUnVsZXMgPyAnY3NzUnVsZXMnIDogJ3J1bGVzJztcbiAgICByZW1vdmUgPSBjYWNoZS5yZW1vdmVSdWxlID8gJ3JlbW92ZVJ1bGUnIDogJ2RlbGV0ZVJ1bGUnO1xuICAgIHJldHVybiBjYWNoZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZCAoc2VsZWN0b3IsIHN0eWxlcykge1xuICAgIHZhciBjc3MgPSBwYXJzZVN0eWxlcyhzdHlsZXMpO1xuICAgIHZhciBzaGVldCA9IGdldFN0eWxlc2hlZXQoKTtcbiAgICB2YXIgbGVuID0gc2hlZXRbcnVsZXNdLmxlbmd0aDtcbiAgICBpZiAoc2hlZXQuaW5zZXJ0UnVsZSkge1xuICAgICAgc2hlZXQuaW5zZXJ0UnVsZShzZWxlY3RvciArICd7JyArIGNzcyArICd9JywgbGVuKTtcbiAgICB9IGVsc2UgaWYgKHNoZWV0LmFkZFJ1bGUpIHtcbiAgICAgIHNoZWV0LmFkZFJ1bGUoc2VsZWN0b3IsIGNzcywgbGVuKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmUgKHNlbGVjdG9yKSB7XG4gICAgdmFyIHNoZWV0ID0gZ2V0U3R5bGVzaGVldCgpO1xuICAgIHZhciBsZW5ndGggPSBzaGVldFtydWxlc10ubGVuZ3RoO1xuICAgIHZhciBpO1xuICAgIGZvciAoaSA9IGxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBpZiAoc2hlZXRbcnVsZXNdW2ldLnNlbGVjdG9yVGV4dCA9PT0gc2VsZWN0b3IpIHtcbiAgICAgICAgc2hlZXRbcmVtb3ZlXShpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjbGVhciAoKSB7XG4gICAgdmFyIHNoZWV0ID0gZ2V0U3R5bGVzaGVldCgpO1xuICAgIHdoaWxlIChzaGVldFtydWxlc10ubGVuZ3RoKSB7XG4gICAgICBzaGVldFtyZW1vdmVdKDApO1xuICAgIH1cbiAgfVxuXG4gIGFkZC5jbGVhciA9IGNsZWFyO1xuICBhZGQucmVtb3ZlID0gcmVtb3ZlO1xuICBjb250ZXh0c1tuYW1lXSA9IGFkZDtcbiAgcmV0dXJuIGNvbnRleHRzW25hbWVdO1xufVxuXG52YXIgY3R4ID0gY29udGV4dCgnZGVmYXVsdCcpO1xuY3R4LmNvbnRleHQgPSBjb250ZXh0O1xubW9kdWxlLmV4cG9ydHMgPSBjdHg7XG4iLCJpZiAoIU9iamVjdC5rZXlzKSB7XG4gIE9iamVjdC5rZXlzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgdmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbiAgICB2YXIgaGFzRG9udEVudW1CdWcgPSAhKHt0b1N0cmluZzogbnVsbH0pLnByb3BlcnR5SXNFbnVtZXJhYmxlKCd0b1N0cmluZycpO1xuICAgIHZhciBkb250RW51bXMgPSBbXG4gICAgICAndG9TdHJpbmcnLFxuICAgICAgJ3RvTG9jYWxlU3RyaW5nJyxcbiAgICAgICd2YWx1ZU9mJyxcbiAgICAgICdoYXNPd25Qcm9wZXJ0eScsXG4gICAgICAnaXNQcm90b3R5cGVPZicsXG4gICAgICAncHJvcGVydHlJc0VudW1lcmFibGUnLFxuICAgICAgJ2NvbnN0cnVjdG9yJ1xuICAgIF07XG4gICAgdmFyIGRvbnRFbnVtc0xlbmd0aCA9IGRvbnRFbnVtcy5sZW5ndGg7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKG9iaikge1xuICAgICAgaWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnICYmICh0eXBlb2Ygb2JqICE9PSAnZnVuY3Rpb24nIHx8IG9iaiA9PT0gbnVsbCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignT2JqZWN0LmtleXMgY2FsbGVkIG9uIG5vbi1vYmplY3QnKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgdmFyIHByb3A7XG4gICAgICB2YXIgaTtcblxuICAgICAgZm9yIChwcm9wIGluIG9iaikge1xuICAgICAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2gocHJvcCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGhhc0RvbnRFbnVtQnVnKSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBkb250RW51bXNMZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgZG9udEVudW1zW2ldKSkge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goZG9udEVudW1zW2ldKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfSgpKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGluc2VydFJ1bGUgPSByZXF1aXJlKCdpbnNlcnQtcnVsZScpLmNvbnRleHQoJ2hpbnQnKTtcbnZhciBldmVudHMgPSByZXF1aXJlKCcuL2V2ZW50cycpO1xudmFyIGV4cGFuZG8gPSAnaGludC0nICsgRGF0ZS5ub3coKTtcbnZhciBhcGkgPSB7XG4gIG1heGltdW1XaWR0aDogNjUwXG59O1xuXG5ldmVudHMuYWRkKGRvY3VtZW50LmJvZHksICdtb3VzZW92ZXInLCBlbnRlcik7XG5ldmVudHMuYWRkKGRvY3VtZW50LmJvZHksICdtb3VzZW91dCcsIGxlYXZlKTtcblxuZnVuY3Rpb24gZW50ZXIgKGUpIHtcbiAgdmFyIHByZXYgPSBzY2FuKGUuZnJvbUVsZW1lbnQpO1xuICB2YXIgZWxlbSA9IHNjYW4oZS50YXJnZXQpO1xuICBpZiAoZWxlbSAmJiBlbGVtICE9PSBwcmV2KSB7XG4gICAgbW92ZShlbGVtKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBsZWF2ZSAoZSkge1xuICB2YXIgbmV4dCA9IHNjYW4oZS50b0VsZW1lbnQpO1xuICB2YXIgZWxlbSA9IHNjYW4oZS50YXJnZXQpO1xuICBpZiAoZWxlbSAmJiBlbGVtICE9PSBuZXh0KSB7XG4gICAgY2xlYXIoZWxlbSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2NhbiAoZWxlbSkge1xuICB3aGlsZSAoZWxlbSkge1xuICAgIGlmIChwcm9iZShlbGVtKSkge1xuICAgICAgcmV0dXJuIGVsZW07XG4gICAgfVxuICAgIGVsZW0gPSBlbGVtLnBhcmVudEVsZW1lbnQ7XG4gIH1cbn1cblxuZnVuY3Rpb24gcHJvYmUgKGVsZW0pIHtcbiAgcmV0dXJuIGVsZW0uZ2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJykgfHwgZWxlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaGludCcpO1xufVxuXG5mdW5jdGlvbiBleHBhbmRleCAoKSB7XG4gIHJldHVybiBleHBhbmRvICsgRGF0ZS5ub3coKTtcbn1cblxuZnVuY3Rpb24gaSAocHgpIHtcbiAgdmFyIHJhdyA9IHB4LnJlcGxhY2UoJ3B4JywgJycpO1xuICByZXR1cm4gcGFyc2VJbnQocmF3LCAxMCk7XG59XG5cbmZ1bmN0aW9uIGdldFBzZXVkbyAoZWxlbSkge1xuICByZXR1cm4gZWxlbS5jbGFzc05hbWUuaW5kZXhPZignaGludC1iZWZvcmUnKSAhPT0gLTEgPyAnOmJlZm9yZScgOiAnOmFmdGVyJztcbn1cblxuZnVuY3Rpb24gbW92ZSAoZWxlbSkge1xuICB2YXIgdG90YWxXaWR0aCA9IGlubmVyV2lkdGg7XG4gIHZhciBwc2V1ZG8gPSBnZXRQc2V1ZG8oZWxlbSk7XG4gIHZhciBjID0gZ2V0Q29tcHV0ZWRTdHlsZShlbGVtLCBwc2V1ZG8pO1xuICB2YXIgZXhpc3RlZCA9IGVsZW0uZ2V0QXR0cmlidXRlKCdpZCcpO1xuICB2YXIgaWQgPSBleGlzdGVkIHx8IGV4cGFuZGV4KCk7XG4gIGlmIChpZC5pbmRleE9mKGV4cGFuZG8pID09PSAwKSB7XG4gICAgZWxlbS5zZXRBdHRyaWJ1dGUoJ2lkJywgaWQpO1xuICB9XG5cbiAgdmFyIHNlbGVjdG9yID0gJyMnICsgaWQgKyBwc2V1ZG87XG4gIHZhciByZWN0ID0gZWxlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgdmFyIHBhZGRpbmdzID0gaShjLnBhZGRpbmdMZWZ0KSArIGkoYy5wYWRkaW5nUmlnaHQpICsgaShjLm1hcmdpbkxlZnQpICsgaShjLm1hcmdpblJpZ2h0KTtcbiAgdmFyIHdpZHRoO1xuICB2YXIgbGVmdDtcbiAgdmFyIHJpZ2h0ID0gcmVjdC5sZWZ0ICsgaShjLndpZHRoKSArIGkoYy5sZWZ0KSArIHBhZGRpbmdzO1xuICB2YXIgY29sbGFwc2U7XG4gIHZhciBvZmZzZXQ7XG4gIHZhciBtYXJnaW4gPSAyMDtcbiAgdmFyIG1heCA9IGFwaS5tYXhpbXVtV2lkdGggPT09ICdhdXRvJyA/IEluZmluaXR5IDogYXBpLm1heGltdW1XaWR0aDtcblxuICBpZiAoaShjLndpZHRoKSArIG1hcmdpbiA+IHRvdGFsV2lkdGgpIHtcbiAgICBjb2xsYXBzZSA9IHRvdGFsV2lkdGggLSBtYXJnaW4gPiBtYXg7XG4gICAgd2lkdGggPSBjb2xsYXBzZSA/IG1heCA6IHRvdGFsV2lkdGggLSBtYXJnaW47XG4gICAgb2Zmc2V0ID0gY29sbGFwc2UgPyB0b3RhbFdpZHRoIC0gbWF4IC0gbWFyZ2luIDogMDtcbiAgICBsZWZ0ID0gLShyZWN0LmxlZnQgKyBwYWRkaW5ncykgKyBvZmZzZXQ7XG5cbiAgICBpbnNlcnRSdWxlKHNlbGVjdG9yLCB7XG4gICAgICB3aWR0aDogd2lkdGggKyAncHgnLFxuICAgICAgbGVmdDogbGVmdCAtIDE1ICsgJ3B4JyxcbiAgICAgIHdoaXRlU3BhY2U6ICdpbmhlcml0J1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKHJpZ2h0ICsgbWFyZ2luID4gdG90YWxXaWR0aCkge1xuICAgIGluc2VydFJ1bGUoc2VsZWN0b3IsIHtcbiAgICAgIGxlZnQ6IHRvdGFsV2lkdGggLSByaWdodCArIG1hcmdpbiArICdweCdcbiAgICB9KTtcbiAgfVxuICB0cmFuc3BhcmVudCgpO1xuICBzZXRUaW1lb3V0KG9wYXF1ZSwgMTAwMCk7XG5cbiAgZnVuY3Rpb24gdHJhbnNwYXJlbnQgKCkge1xuICAgIGluc2VydFJ1bGUoc2VsZWN0b3IsIHsgb3BhY2l0eTogMCB9KTtcbiAgfVxuICBmdW5jdGlvbiBvcGFxdWUgKCkge1xuICAgIGluc2VydFJ1bGUoc2VsZWN0b3IsIHRyYW5zaXRpb24oe1xuICAgICAgb3BhY2l0eTogMVxuICAgIH0pKTtcbiAgfVxuICBmdW5jdGlvbiB0cmFuc2l0aW9uIChjc3MpIHtcbiAgICB2YXIgcnVsZSA9ICd0cmFuc2l0aW9uJztcbiAgICB2YXIgcHJlZml4ZXMgPSBbJycsICctd2Via2l0LScsICctbW96LScsICctby0nLCAnLW1zLSddO1xuICAgIGZ1bmN0aW9uIGFkZCAocHJlZml4KSB7XG4gICAgICBjc3NbcHJlZml4ICsgcnVsZV0gPSAnb3BhY2l0eSAwLjNzIGVhc2UtaW4tb3V0JztcbiAgICB9XG4gICAgcHJlZml4ZXMuZm9yRWFjaChhZGQpO1xuICAgIHJldHVybiBjc3M7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2xlYXIgKGVsZW0pIHtcbiAgdmFyIHBzZXVkbyA9IGdldFBzZXVkbyhlbGVtKTtcbiAgdmFyIGlkID0gZWxlbS5pZDtcbiAgaWYgKGlkLmluZGV4T2YoZXhwYW5kbykgPT09IDApIHtcbiAgICBlbGVtLnJlbW92ZUF0dHJpYnV0ZSgnaWQnKTtcbiAgfVxuICB2YXIgc2VsZWN0b3IgPSAnIycgKyBpZCArIHBzZXVkbztcbiAgaW5zZXJ0UnVsZS5yZW1vdmUoc2VsZWN0b3IpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFwaTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGFkZEV2ZW50ID0gYWRkRXZlbnRFYXN5O1xudmFyIHJlbW92ZUV2ZW50ID0gcmVtb3ZlRXZlbnRFYXN5O1xuXG5pZiAoIXdpbmRvdy5hZGRFdmVudExpc3RlbmVyKSB7XG4gIGFkZEV2ZW50ID0gYWRkRXZlbnRIYXJkO1xufVxuXG5pZiAoIXdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKSB7XG4gIHJlbW92ZUV2ZW50ID0gcmVtb3ZlRXZlbnRIYXJkO1xufVxuXG5mdW5jdGlvbiBhZGRFdmVudEVhc3kgKGVsZW1lbnQsIGV2dCwgZm4pIHtcbiAgcmV0dXJuIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldnQsIGZuKTtcbn1cblxuZnVuY3Rpb24gYWRkRXZlbnRIYXJkIChlbGVtZW50LCBldnQsIGZuKSB7XG4gIHJldHVybiBlbGVtZW50LmF0dGFjaEV2ZW50KCdvbicgKyBldnQsIGZ1bmN0aW9uIChlKSB7XG4gICAgZSA9IGUgfHwgd2luZG93LmV2ZW50O1xuICAgIGUudGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xuICAgIGUucHJldmVudERlZmF1bHQgID0gZS5wcmV2ZW50RGVmYXVsdCAgfHwgZnVuY3Rpb24gcHJldmVudERlZmF1bHQgKCkgeyBlLnJldHVyblZhbHVlID0gZmFsc2U7IH07XG4gICAgZS5zdG9wUHJvcGFnYXRpb24gPSBlLnN0b3BQcm9wYWdhdGlvbiB8fCBmdW5jdGlvbiBzdG9wUHJvcGFnYXRpb24gKCkgeyBlLmNhbmNlbEJ1YmJsZSA9IHRydWU7IH07XG4gICAgZm4uY2FsbChlbGVtZW50LCBlKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUV2ZW50RWFzeSAoZWxlbWVudCwgZXZ0LCBmbikge1xuICByZXR1cm4gZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2dCwgZm4pO1xufVxuXG5mdW5jdGlvbiByZW1vdmVFdmVudEhhcmQgKGVsZW1lbnQsIGV2dCwgZm4pIHtcbiAgcmV0dXJuIGVsZW1lbnQuZGV0YWNoRXZlbnQoJ29uJyArIGV2dCwgZm4pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWRkOiBhZGRFdmVudCxcbiAgcmVtb3ZlOiByZW1vdmVFdmVudFxufTtcbiJdfQ==
