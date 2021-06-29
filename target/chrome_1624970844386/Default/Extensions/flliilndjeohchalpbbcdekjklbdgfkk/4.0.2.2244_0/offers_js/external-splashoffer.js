/*!
 * © 2016 Avira Operations GmbH & Co. KG. All rights reserved.
 * No part of this extension may be reproduced, stored or transmitted in any
 * form, for any reason or by any means, without the prior permission in writing
 * from the copyright owner. The text, layout, and designs presented are
 * protected by the copyright laws of the United States and international
 * treaties.
 */
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

(function () {
  'use strict';
  /* eslint-disable no-underscore-dangle */

  /* global window, navigator, chrome, $ */

  /*
   * In Firefox 53 versions clicking a link with target _blank in an iframe where the source
   * is an extension the link will only open a blank page instead of the actuall link.
   * Calling this function will make those links open.
   * Unfortunately it will just add the new tab to the end of the window instead of next to the
   * current tab so we apply the fix only where neeeded.
   */

  function fixBrokenFirefoxLinks(root) {
    if (window._fixBrokenFirefoxLinksApplied) {
      return;
    }

    window._fixBrokenFirefoxLinksApplied = true; // Only versions of FF53 and higher are affected

    var m = navigator.userAgent.match(/Firefox\/(\d+)/);
    if (!m || parseInt(m[1], 10) < 53) return; // Make sure we are in webext

    if (!(chrome && chrome.runtime && chrome.runtime.sendMessage)) return;
    $(root).on('click', 'a[target=_blank][href]', function click(e) {
      e.preventDefault();
      chrome.runtime.sendMessage({
        publish: 'navigate',
        message: {
          url: e.currentTarget.href,
          as_separate: true
        }
      });
    });
  }
  /* global document */


  fixBrokenFirefoxLinks(document.body);
})();

},{}]},{},[1]);
