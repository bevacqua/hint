/**
 * flexarea - Pretty flexible textareas
 * @version v1.0.26
 * @link https://github.com/bevacqua/flexarea
 * @license MIT
 */
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.flexarea=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

var doc = document;

module.exports = function (textarea) {
  var wrapper = doc.createElement('div');
  var grip = doc.createElement('div');
  var min = 32;
  var offset;
  var position;

  textarea.classList.add('fa-textarea');
  textarea.parentNode.replaceChild(wrapper, textarea);
  wrapper.appendChild(textarea);
  wrapper.appendChild(grip);
  wrapper.classList.add('fa-wrapper');
  grip.classList.add('fa-grip');
  grip.addEventListener('mousedown', start);
  grip.style.marginRight = (grip.offsetWidth - textarea.offsetWidth) + 'px';

  function start (e) {
    textarea.blur();
    textarea.classList.add('fa-textarea-resizing');
    position = getPosition(e).y;
    offset = textarea.offsetHeight - position;
    doc.addEventListener('mousemove', move);
    doc.addEventListener('mouseup', end);
    return false;
  }

  function move (e) {
    var current = getPosition(e).y;
    var moved = offset + current;
    if (position >= current) {
      moved -= 5;
    }
    position = current;
    moved = Math.max(min, moved);
    textarea.style.height = moved + 'px';
    if (moved < min) {
      end(e);
    }
    return false;
  }

  function end (e) {
    doc.removeEventListener('mousemove', move);
    doc.removeEventListener('mouseup', end);
    textarea.classList.remove('fa-textarea-resizing');
    textarea.focus();
  }

  function getPosition (e) {
    return {
      x: e.clientX + doc.documentElement.scrollLeft,
      y: e.clientY + doc.documentElement.scrollTop
    };
  }
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvbmljby9uaWNvL2dpdC9mbGV4YXJlYS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL25pY28vbmljby9naXQvZmxleGFyZWEvc3JjL2ZsZXhhcmVhLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBkb2MgPSBkb2N1bWVudDtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodGV4dGFyZWEpIHtcbiAgdmFyIHdyYXBwZXIgPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHZhciBncmlwID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICB2YXIgbWluID0gMzI7XG4gIHZhciBvZmZzZXQ7XG4gIHZhciBwb3NpdGlvbjtcblxuICB0ZXh0YXJlYS5jbGFzc0xpc3QuYWRkKCdmYS10ZXh0YXJlYScpO1xuICB0ZXh0YXJlYS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZCh3cmFwcGVyLCB0ZXh0YXJlYSk7XG4gIHdyYXBwZXIuYXBwZW5kQ2hpbGQodGV4dGFyZWEpO1xuICB3cmFwcGVyLmFwcGVuZENoaWxkKGdyaXApO1xuICB3cmFwcGVyLmNsYXNzTGlzdC5hZGQoJ2ZhLXdyYXBwZXInKTtcbiAgZ3JpcC5jbGFzc0xpc3QuYWRkKCdmYS1ncmlwJyk7XG4gIGdyaXAuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgc3RhcnQpO1xuICBncmlwLnN0eWxlLm1hcmdpblJpZ2h0ID0gKGdyaXAub2Zmc2V0V2lkdGggLSB0ZXh0YXJlYS5vZmZzZXRXaWR0aCkgKyAncHgnO1xuXG4gIGZ1bmN0aW9uIHN0YXJ0IChlKSB7XG4gICAgdGV4dGFyZWEuYmx1cigpO1xuICAgIHRleHRhcmVhLmNsYXNzTGlzdC5hZGQoJ2ZhLXRleHRhcmVhLXJlc2l6aW5nJyk7XG4gICAgcG9zaXRpb24gPSBnZXRQb3NpdGlvbihlKS55O1xuICAgIG9mZnNldCA9IHRleHRhcmVhLm9mZnNldEhlaWdodCAtIHBvc2l0aW9uO1xuICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBtb3ZlKTtcbiAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGVuZCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gbW92ZSAoZSkge1xuICAgIHZhciBjdXJyZW50ID0gZ2V0UG9zaXRpb24oZSkueTtcbiAgICB2YXIgbW92ZWQgPSBvZmZzZXQgKyBjdXJyZW50O1xuICAgIGlmIChwb3NpdGlvbiA+PSBjdXJyZW50KSB7XG4gICAgICBtb3ZlZCAtPSA1O1xuICAgIH1cbiAgICBwb3NpdGlvbiA9IGN1cnJlbnQ7XG4gICAgbW92ZWQgPSBNYXRoLm1heChtaW4sIG1vdmVkKTtcbiAgICB0ZXh0YXJlYS5zdHlsZS5oZWlnaHQgPSBtb3ZlZCArICdweCc7XG4gICAgaWYgKG1vdmVkIDwgbWluKSB7XG4gICAgICBlbmQoZSk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGVuZCAoZSkge1xuICAgIGRvYy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBtb3ZlKTtcbiAgICBkb2MucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGVuZCk7XG4gICAgdGV4dGFyZWEuY2xhc3NMaXN0LnJlbW92ZSgnZmEtdGV4dGFyZWEtcmVzaXppbmcnKTtcbiAgICB0ZXh0YXJlYS5mb2N1cygpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0UG9zaXRpb24gKGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgeDogZS5jbGllbnRYICsgZG9jLmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0LFxuICAgICAgeTogZS5jbGllbnRZICsgZG9jLmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3BcbiAgICB9O1xuICB9XG59O1xuIl19
(1)
});
