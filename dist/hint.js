/**
 * hint - Awesome tooltips at your fingertips
 * @version v1.4.0
 * @link https://github.com/bevacqua/hint
 * @license MIT
 */
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.hint=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
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

},{}],2:[function(_dereq_,module,exports){
'use strict';

_dereq_('./object-keys');
_dereq_('./array-map');

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

},{"./array-map":1,"./object-keys":3}],3:[function(_dereq_,module,exports){
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

},{}],4:[function(_dereq_,module,exports){
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

},{}],5:[function(_dereq_,module,exports){
'use strict';

var insertRule = _dereq_('insert-rule').context('hint');
var events = _dereq_('./events');
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

},{"./events":4,"insert-rule":2}]},{},[5])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvbmljby9uaWNvL2dpdC9oaW50L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbmljby9uaWNvL2dpdC9oaW50L25vZGVfbW9kdWxlcy9pbnNlcnQtcnVsZS9zcmMvYXJyYXktbWFwLmpzIiwiL1VzZXJzL25pY28vbmljby9naXQvaGludC9ub2RlX21vZHVsZXMvaW5zZXJ0LXJ1bGUvc3JjL2luc2VydFJ1bGUuanMiLCIvVXNlcnMvbmljby9uaWNvL2dpdC9oaW50L25vZGVfbW9kdWxlcy9pbnNlcnQtcnVsZS9zcmMvb2JqZWN0LWtleXMuanMiLCIvVXNlcnMvbmljby9uaWNvL2dpdC9oaW50L3NyYy9ldmVudHMuanMiLCIvVXNlcnMvbmljby9uaWNvL2dpdC9oaW50L3NyYy9oaW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpZiAoIUFycmF5LnByb3RvdHlwZS5tYXApIHtcbiAgQXJyYXkucHJvdG90eXBlLm1hcCA9IGZ1bmN0aW9uIChmbikge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGlmICh0aGlzID09PSB2b2lkIDAgfHwgdGhpcyA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xuICAgIH1cblxuICAgIHZhciB0ID0gT2JqZWN0KHRoaXMpO1xuICAgIHZhciBsZW4gPSB0Lmxlbmd0aCA+Pj4gMDtcbiAgICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCk7XG4gICAgfVxuXG4gICAgdmFyIHJlcyA9IG5ldyBBcnJheShsZW4pO1xuICAgIHZhciBjdHggPSBhcmd1bWVudHMubGVuZ3RoID49IDIgPyBhcmd1bWVudHNbMV0gOiB2b2lkIDA7XG4gICAgdmFyIGk7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpZiAoaSBpbiB0KSB7XG4gICAgICAgIHJlc1tpXSA9IGZuLmNhbGwoY3R4LCB0W2ldLCBpLCB0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzO1xuICB9O1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5yZXF1aXJlKCcuL29iamVjdC1rZXlzJyk7XG5yZXF1aXJlKCcuL2FycmF5LW1hcCcpO1xuXG52YXIgY2FtZWwgPSAvKFthLXpdKShbQS1aXSkvZztcbnZhciBoeXBoZW5zID0gJyQxLSQyJztcbnZhciBjb250ZXh0cyA9IHt9O1xuXG5mdW5jdGlvbiBwYXJzZVN0eWxlcyAoc3R5bGVzKSB7XG4gIGlmICh0eXBlb2Ygc3R5bGVzID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBzdHlsZXM7XG4gIH1cbiAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzdHlsZXMpICE9PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgIHJldHVybiAnJztcbiAgfVxuICByZXR1cm4gT2JqZWN0LmtleXMoc3R5bGVzKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciBwcm9wID0ga2V5LnJlcGxhY2UoY2FtZWwsIGh5cGhlbnMpLnRvTG93ZXJDYXNlKCk7XG4gICAgcmV0dXJuIHByb3AgKyAnOicgKyBzdHlsZXNba2V5XTtcbiAgfSkuam9pbignOycpO1xufVxuXG5mdW5jdGlvbiBjb250ZXh0IChuYW1lKSB7XG4gIGlmIChjb250ZXh0c1tuYW1lXSkge1xuICAgIHJldHVybiBjb250ZXh0c1tuYW1lXTtcbiAgfVxuICB2YXIgY2FjaGU7XG4gIHZhciBydWxlcztcbiAgdmFyIHJlbW92ZTtcblxuICBmdW5jdGlvbiBnZXRTdHlsZXNoZWV0ICgpIHtcbiAgICBpZiAoY2FjaGUpIHtcbiAgICAgIHJldHVybiBjYWNoZTtcbiAgICB9XG4gICAgdmFyIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHN0eWxlKTtcbiAgICBzdHlsZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtY29udGV4dCcsIG5hbWUpO1xuICAgIGNhY2hlID0gZG9jdW1lbnQuc3R5bGVTaGVldHNbZG9jdW1lbnQuc3R5bGVTaGVldHMubGVuZ3RoIC0gMV07XG4gICAgcnVsZXMgPSBjYWNoZS5jc3NSdWxlcyA/ICdjc3NSdWxlcycgOiAncnVsZXMnO1xuICAgIHJlbW92ZSA9IGNhY2hlLnJlbW92ZVJ1bGUgPyAncmVtb3ZlUnVsZScgOiAnZGVsZXRlUnVsZSc7XG4gICAgcmV0dXJuIGNhY2hlO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkIChzZWxlY3Rvciwgc3R5bGVzKSB7XG4gICAgdmFyIGNzcyA9IHBhcnNlU3R5bGVzKHN0eWxlcyk7XG4gICAgdmFyIHNoZWV0ID0gZ2V0U3R5bGVzaGVldCgpO1xuICAgIHZhciBsZW4gPSBzaGVldFtydWxlc10ubGVuZ3RoO1xuICAgIGlmIChzaGVldC5pbnNlcnRSdWxlKSB7XG4gICAgICBzaGVldC5pbnNlcnRSdWxlKHNlbGVjdG9yICsgJ3snICsgY3NzICsgJ30nLCBsZW4pO1xuICAgIH0gZWxzZSBpZiAoc2hlZXQuYWRkUnVsZSkge1xuICAgICAgc2hlZXQuYWRkUnVsZShzZWxlY3RvciwgY3NzLCBsZW4pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZSAoc2VsZWN0b3IpIHtcbiAgICB2YXIgc2hlZXQgPSBnZXRTdHlsZXNoZWV0KCk7XG4gICAgdmFyIGxlbmd0aCA9IHNoZWV0W3J1bGVzXS5sZW5ndGg7XG4gICAgdmFyIGk7XG4gICAgZm9yIChpID0gbGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGlmIChzaGVldFtydWxlc11baV0uc2VsZWN0b3JUZXh0ID09PSBzZWxlY3Rvcikge1xuICAgICAgICBzaGVldFtyZW1vdmVdKGkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNsZWFyICgpIHtcbiAgICB2YXIgc2hlZXQgPSBnZXRTdHlsZXNoZWV0KCk7XG4gICAgd2hpbGUgKHNoZWV0W3J1bGVzXS5sZW5ndGgpIHtcbiAgICAgIHNoZWV0W3JlbW92ZV0oMCk7XG4gICAgfVxuICB9XG5cbiAgYWRkLmNsZWFyID0gY2xlYXI7XG4gIGFkZC5yZW1vdmUgPSByZW1vdmU7XG4gIGNvbnRleHRzW25hbWVdID0gYWRkO1xuICByZXR1cm4gY29udGV4dHNbbmFtZV07XG59XG5cbnZhciBjdHggPSBjb250ZXh0KCdkZWZhdWx0Jyk7XG5jdHguY29udGV4dCA9IGNvbnRleHQ7XG5tb2R1bGUuZXhwb3J0cyA9IGN0eDtcbiIsImlmICghT2JqZWN0LmtleXMpIHtcbiAgT2JqZWN0LmtleXMgPSAoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICB2YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuICAgIHZhciBoYXNEb250RW51bUJ1ZyA9ICEoe3RvU3RyaW5nOiBudWxsfSkucHJvcGVydHlJc0VudW1lcmFibGUoJ3RvU3RyaW5nJyk7XG4gICAgdmFyIGRvbnRFbnVtcyA9IFtcbiAgICAgICd0b1N0cmluZycsXG4gICAgICAndG9Mb2NhbGVTdHJpbmcnLFxuICAgICAgJ3ZhbHVlT2YnLFxuICAgICAgJ2hhc093blByb3BlcnR5JyxcbiAgICAgICdpc1Byb3RvdHlwZU9mJyxcbiAgICAgICdwcm9wZXJ0eUlzRW51bWVyYWJsZScsXG4gICAgICAnY29uc3RydWN0b3InXG4gICAgXTtcbiAgICB2YXIgZG9udEVudW1zTGVuZ3RoID0gZG9udEVudW1zLmxlbmd0aDtcblxuICAgIHJldHVybiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICBpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcgJiYgKHR5cGVvZiBvYmogIT09ICdmdW5jdGlvbicgfHwgb2JqID09PSBudWxsKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdPYmplY3Qua2V5cyBjYWxsZWQgb24gbm9uLW9iamVjdCcpO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICB2YXIgcHJvcDtcbiAgICAgIHZhciBpO1xuXG4gICAgICBmb3IgKHByb3AgaW4gb2JqKSB7XG4gICAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIHtcbiAgICAgICAgICByZXN1bHQucHVzaChwcm9wKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoaGFzRG9udEVudW1CdWcpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGRvbnRFbnVtc0xlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwob2JqLCBkb250RW51bXNbaV0pKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaChkb250RW51bXNbaV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9KCkpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYWRkRXZlbnQgPSBhZGRFdmVudEVhc3k7XG52YXIgcmVtb3ZlRXZlbnQgPSByZW1vdmVFdmVudEVhc3k7XG5cbmlmICghd2luZG93LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgYWRkRXZlbnQgPSBhZGRFdmVudEhhcmQ7XG59XG5cbmlmICghd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIpIHtcbiAgcmVtb3ZlRXZlbnQgPSByZW1vdmVFdmVudEhhcmQ7XG59XG5cbmZ1bmN0aW9uIGFkZEV2ZW50RWFzeSAoZWxlbWVudCwgZXZ0LCBmbikge1xuICByZXR1cm4gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2dCwgZm4pO1xufVxuXG5mdW5jdGlvbiBhZGRFdmVudEhhcmQgKGVsZW1lbnQsIGV2dCwgZm4pIHtcbiAgcmV0dXJuIGVsZW1lbnQuYXR0YWNoRXZlbnQoJ29uJyArIGV2dCwgZnVuY3Rpb24gKGUpIHtcbiAgICBlID0gZSB8fCB3aW5kb3cuZXZlbnQ7XG4gICAgZS50YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCAgPSBlLnByZXZlbnREZWZhdWx0ICB8fCBmdW5jdGlvbiBwcmV2ZW50RGVmYXVsdCAoKSB7IGUucmV0dXJuVmFsdWUgPSBmYWxzZTsgfTtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbiA9IGUuc3RvcFByb3BhZ2F0aW9uIHx8IGZ1bmN0aW9uIHN0b3BQcm9wYWdhdGlvbiAoKSB7IGUuY2FuY2VsQnViYmxlID0gdHJ1ZTsgfTtcbiAgICBmbi5jYWxsKGVsZW1lbnQsIGUpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRXZlbnRFYXN5IChlbGVtZW50LCBldnQsIGZuKSB7XG4gIHJldHVybiBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZ0LCBmbik7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUV2ZW50SGFyZCAoZWxlbWVudCwgZXZ0LCBmbikge1xuICByZXR1cm4gZWxlbWVudC5kZXRhY2hFdmVudCgnb24nICsgZXZ0LCBmbik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhZGQ6IGFkZEV2ZW50LFxuICByZW1vdmU6IHJlbW92ZUV2ZW50XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaW5zZXJ0UnVsZSA9IHJlcXVpcmUoJ2luc2VydC1ydWxlJykuY29udGV4dCgnaGludCcpO1xudmFyIGV2ZW50cyA9IHJlcXVpcmUoJy4vZXZlbnRzJyk7XG52YXIgZXhwYW5kbyA9ICdoaW50LScgKyBEYXRlLm5vdygpO1xudmFyIGFwaSA9IHtcbiAgbWF4aW11bVdpZHRoOiA2NTBcbn07XG5cbmV2ZW50cy5hZGQoZG9jdW1lbnQuYm9keSwgJ21vdXNlb3ZlcicsIGVudGVyKTtcbmV2ZW50cy5hZGQoZG9jdW1lbnQuYm9keSwgJ21vdXNlb3V0JywgbGVhdmUpO1xuXG5mdW5jdGlvbiBlbnRlciAoZSkge1xuICB2YXIgcHJldiA9IHNjYW4oZS5mcm9tRWxlbWVudCk7XG4gIHZhciBlbGVtID0gc2NhbihlLnRhcmdldCk7XG4gIGlmIChlbGVtICYmIGVsZW0gIT09IHByZXYpIHtcbiAgICBtb3ZlKGVsZW0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGxlYXZlIChlKSB7XG4gIHZhciBuZXh0ID0gc2NhbihlLnRvRWxlbWVudCk7XG4gIHZhciBlbGVtID0gc2NhbihlLnRhcmdldCk7XG4gIGlmIChlbGVtICYmIGVsZW0gIT09IG5leHQpIHtcbiAgICBjbGVhcihlbGVtKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzY2FuIChlbGVtKSB7XG4gIHdoaWxlIChlbGVtKSB7XG4gICAgaWYgKHByb2JlKGVsZW0pKSB7XG4gICAgICByZXR1cm4gZWxlbTtcbiAgICB9XG4gICAgZWxlbSA9IGVsZW0ucGFyZW50RWxlbWVudDtcbiAgfVxufVxuXG5mdW5jdGlvbiBwcm9iZSAoZWxlbSkge1xuICByZXR1cm4gZWxlbS5nZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnKSB8fCBlbGVtLmdldEF0dHJpYnV0ZSgnZGF0YS1oaW50Jyk7XG59XG5cbmZ1bmN0aW9uIGV4cGFuZGV4ICgpIHtcbiAgcmV0dXJuIGV4cGFuZG8gKyBEYXRlLm5vdygpO1xufVxuXG5mdW5jdGlvbiBpIChweCkge1xuICB2YXIgcmF3ID0gcHgucmVwbGFjZSgncHgnLCAnJyk7XG4gIHJldHVybiBwYXJzZUludChyYXcsIDEwKTtcbn1cblxuZnVuY3Rpb24gZ2V0UHNldWRvIChlbGVtKSB7XG4gIHJldHVybiBlbGVtLmNsYXNzTmFtZS5pbmRleE9mKCdoaW50LWJlZm9yZScpICE9PSAtMSA/ICc6YmVmb3JlJyA6ICc6YWZ0ZXInO1xufVxuXG5mdW5jdGlvbiBtb3ZlIChlbGVtKSB7XG4gIHZhciB0b3RhbFdpZHRoID0gaW5uZXJXaWR0aDtcbiAgdmFyIHBzZXVkbyA9IGdldFBzZXVkbyhlbGVtKTtcbiAgdmFyIGMgPSBnZXRDb21wdXRlZFN0eWxlKGVsZW0sIHBzZXVkbyk7XG4gIHZhciBleGlzdGVkID0gZWxlbS5nZXRBdHRyaWJ1dGUoJ2lkJyk7XG4gIHZhciBpZCA9IGV4aXN0ZWQgfHwgZXhwYW5kZXgoKTtcbiAgaWYgKGlkLmluZGV4T2YoZXhwYW5kbykgPT09IDApIHtcbiAgICBlbGVtLnNldEF0dHJpYnV0ZSgnaWQnLCBpZCk7XG4gIH1cblxuICB2YXIgc2VsZWN0b3IgPSAnIycgKyBpZCArIHBzZXVkbztcbiAgdmFyIHJlY3QgPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB2YXIgcGFkZGluZ3MgPSBpKGMucGFkZGluZ0xlZnQpICsgaShjLnBhZGRpbmdSaWdodCkgKyBpKGMubWFyZ2luTGVmdCkgKyBpKGMubWFyZ2luUmlnaHQpO1xuICB2YXIgd2lkdGg7XG4gIHZhciBsZWZ0O1xuICB2YXIgcmlnaHQgPSByZWN0LmxlZnQgKyBpKGMud2lkdGgpICsgaShjLmxlZnQpICsgcGFkZGluZ3M7XG4gIHZhciBjb2xsYXBzZTtcbiAgdmFyIG9mZnNldDtcbiAgdmFyIG1hcmdpbiA9IDIwO1xuICB2YXIgbWF4ID0gYXBpLm1heGltdW1XaWR0aCA9PT0gJ2F1dG8nID8gSW5maW5pdHkgOiBhcGkubWF4aW11bVdpZHRoO1xuXG4gIGlmIChpKGMud2lkdGgpICsgbWFyZ2luID4gdG90YWxXaWR0aCkge1xuICAgIGNvbGxhcHNlID0gdG90YWxXaWR0aCAtIG1hcmdpbiA+IG1heDtcbiAgICB3aWR0aCA9IGNvbGxhcHNlID8gbWF4IDogdG90YWxXaWR0aCAtIG1hcmdpbjtcbiAgICBvZmZzZXQgPSBjb2xsYXBzZSA/IHRvdGFsV2lkdGggLSBtYXggLSBtYXJnaW4gOiAwO1xuICAgIGxlZnQgPSAtKHJlY3QubGVmdCArIHBhZGRpbmdzKSArIG9mZnNldDtcblxuICAgIGluc2VydFJ1bGUoc2VsZWN0b3IsIHtcbiAgICAgIHdpZHRoOiB3aWR0aCArICdweCcsXG4gICAgICBsZWZ0OiBsZWZ0IC0gMTUgKyAncHgnLFxuICAgICAgd2hpdGVTcGFjZTogJ2luaGVyaXQnXG4gICAgfSk7XG4gIH0gZWxzZSBpZiAocmlnaHQgKyBtYXJnaW4gPiB0b3RhbFdpZHRoKSB7XG4gICAgaW5zZXJ0UnVsZShzZWxlY3Rvciwge1xuICAgICAgbGVmdDogdG90YWxXaWR0aCAtIHJpZ2h0ICsgbWFyZ2luICsgJ3B4J1xuICAgIH0pO1xuICB9XG4gIHRyYW5zcGFyZW50KCk7XG4gIHNldFRpbWVvdXQob3BhcXVlLCAxMDAwKTtcblxuICBmdW5jdGlvbiB0cmFuc3BhcmVudCAoKSB7XG4gICAgaW5zZXJ0UnVsZShzZWxlY3RvciwgeyBvcGFjaXR5OiAwIH0pO1xuICB9XG4gIGZ1bmN0aW9uIG9wYXF1ZSAoKSB7XG4gICAgaW5zZXJ0UnVsZShzZWxlY3RvciwgdHJhbnNpdGlvbih7XG4gICAgICBvcGFjaXR5OiAxXG4gICAgfSkpO1xuICB9XG4gIGZ1bmN0aW9uIHRyYW5zaXRpb24gKGNzcykge1xuICAgIHZhciBydWxlID0gJ3RyYW5zaXRpb24nO1xuICAgIHZhciBwcmVmaXhlcyA9IFsnJywgJy13ZWJraXQtJywgJy1tb3otJywgJy1vLScsICctbXMtJ107XG4gICAgZnVuY3Rpb24gYWRkIChwcmVmaXgpIHtcbiAgICAgIGNzc1twcmVmaXggKyBydWxlXSA9ICdvcGFjaXR5IDAuM3MgZWFzZS1pbi1vdXQnO1xuICAgIH1cbiAgICBwcmVmaXhlcy5mb3JFYWNoKGFkZCk7XG4gICAgcmV0dXJuIGNzcztcbiAgfVxufVxuXG5mdW5jdGlvbiBjbGVhciAoZWxlbSkge1xuICB2YXIgcHNldWRvID0gZ2V0UHNldWRvKGVsZW0pO1xuICB2YXIgaWQgPSBlbGVtLmlkO1xuICBpZiAoaWQuaW5kZXhPZihleHBhbmRvKSA9PT0gMCkge1xuICAgIGVsZW0ucmVtb3ZlQXR0cmlidXRlKCdpZCcpO1xuICB9XG4gIHZhciBzZWxlY3RvciA9ICcjJyArIGlkICsgcHNldWRvO1xuICBpbnNlcnRSdWxlLnJlbW92ZShzZWxlY3Rvcik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXBpO1xuIl19
(5)
});
