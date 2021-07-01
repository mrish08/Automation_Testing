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

/**
 * Chrome throws an error if two different listeners try to redirect
 * the same request. It doesn't cause any side effect other than showing a
 * yellow warning on the 3 dots menu and a red warning on extensions list.
 * This is meant to avoid this by not allowing a second redirect.
 * See issue: https://project.avira.org/browse/ABS-3885
 */
function singleRedirect(event) {
  let lastRedirectedRequestId = -1;
  const originalAddListener = event.addListener.bind(event);

  event.addListener = (handler, ...args) => {
    originalAddListener(details => {
      const result = handler(details);

      if (details.requestId === lastRedirectedRequestId) {
        return null;
      }

      if (result && result.redirectUrl != null) {
        lastRedirectedRequestId = details.requestId;
      }

      return result;
    }, ...args);
  };
}

singleRedirect(chrome.webRequest.onBeforeRequest);

},{}]},{},[1]);
