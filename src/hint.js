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
