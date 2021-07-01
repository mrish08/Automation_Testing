/*!
 * © 2016 Avira Operations GmbH & Co. KG. All rights reserved.
 * No part of this extension may be reproduced, stored or transmitted in any
 * form, for any reason or by any means, without the prior permission in writing
 * from the copyright owner. The text, layout, and designs presented are
 * protected by the copyright laws of the United States and international
 * treaties.
 */
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){(function (){
"use strict";

require("core-js/modules/es6.array.iterator.js");

require("core-js/modules/web.dom.iterable.js");

require("core-js/modules/es6.array.sort.js");

(function () {
  'use strict';
  /* eslint-disable no-underscore-dangle */

  /* global window, navigator, chrome, $ */

  /*
   * In Firefox 53 versions clicking a link with target _blank in an iframe where the source
   * is an extension the link will only open a blank page instead of the actual link.
   * Calling this function will make those links open.
   * Unfortunately it will just add the new tab to the end of the window instead of next to the
   * current tab so we apply the fix only where needed.
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

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }
  /**
   * A specialized version of `_.filter` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {Array} Returns the new filtered array.
   */


  function arrayFilter(array, predicate) {
    var index = -1,
        length = array == null ? 0 : array.length,
        resIndex = 0,
        result = [];

    while (++index < length) {
      var value = array[index];

      if (predicate(value, index, array)) {
        result[resIndex++] = value;
      }
    }

    return result;
  }

  var _arrayFilter = arrayFilter;
  /**
   * Creates a base function for methods like `_.forIn` and `_.forOwn`.
   *
   * @private
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {Function} Returns the new base function.
   */

  function createBaseFor(fromRight) {
    return function (object, iteratee, keysFunc) {
      var index = -1,
          iterable = Object(object),
          props = keysFunc(object),
          length = props.length;

      while (length--) {
        var key = props[fromRight ? length : ++index];

        if (iteratee(iterable[key], key, iterable) === false) {
          break;
        }
      }

      return object;
    };
  }

  var _createBaseFor = createBaseFor;
  /**
   * The base implementation of `baseForOwn` which iterates over `object`
   * properties returned by `keysFunc` and invokes `iteratee` for each property.
   * Iteratee functions may exit iteration early by explicitly returning `false`.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @param {Function} keysFunc The function to get the keys of `object`.
   * @returns {Object} Returns `object`.
   */

  var baseFor = _createBaseFor();

  var _baseFor = baseFor;
  /**
   * The base implementation of `_.times` without support for iteratee shorthands
   * or max array length checks.
   *
   * @private
   * @param {number} n The number of times to invoke `iteratee`.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the array of results.
   */

  function baseTimes(n, iteratee) {
    var index = -1,
        result = Array(n);

    while (++index < n) {
      result[index] = iteratee(index);
    }

    return result;
  }

  var _baseTimes = baseTimes;
  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
    return module = {
      exports: {}
    }, fn(module, module.exports), module.exports;
  }
  /** Detect free variable `global` from Node.js. */


  var freeGlobal = _typeof(commonjsGlobal) == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
  var _freeGlobal = freeGlobal;
  /** Detect free variable `self`. */

  var freeSelf = (typeof self === "undefined" ? "undefined" : _typeof(self)) == 'object' && self && self.Object === Object && self;
  /** Used as a reference to the global object. */

  var root = _freeGlobal || freeSelf || Function('return this')();
  var _root = root;
  /** Built-in value references. */

  var _Symbol2 = _root.Symbol;
  var _Symbol = _Symbol2;
  /** Used for built-in method references. */

  var objectProto = Object.prototype;
  /** Used to check objects for own properties. */

  var hasOwnProperty = objectProto.hasOwnProperty;
  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */

  var nativeObjectToString = objectProto.toString;
  /** Built-in value references. */

  var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;
  /**
   * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the raw `toStringTag`.
   */

  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag),
        tag = value[symToStringTag];

    try {
      value[symToStringTag] = undefined;
      var unmasked = true;
    } catch (e) {}

    var result = nativeObjectToString.call(value);

    if (unmasked) {
      if (isOwn) {
        value[symToStringTag] = tag;
      } else {
        delete value[symToStringTag];
      }
    }

    return result;
  }

  var _getRawTag = getRawTag;
  /** Used for built-in method references. */

  var objectProto$1 = Object.prototype;
  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */

  var nativeObjectToString$1 = objectProto$1.toString;
  /**
   * Converts `value` to a string using `Object.prototype.toString`.
   *
   * @private
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   */

  function objectToString(value) {
    return nativeObjectToString$1.call(value);
  }

  var _objectToString = objectToString;
  /** `Object#toString` result references. */

  var nullTag = '[object Null]',
      undefinedTag = '[object Undefined]';
  /** Built-in value references. */

  var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;
  /**
   * The base implementation of `getTag` without fallbacks for buggy environments.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */

  function baseGetTag(value) {
    if (value == null) {
      return value === undefined ? undefinedTag : nullTag;
    }

    return symToStringTag$1 && symToStringTag$1 in Object(value) ? _getRawTag(value) : _objectToString(value);
  }

  var _baseGetTag = baseGetTag;
  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */

  function isObjectLike(value) {
    return value != null && _typeof(value) == 'object';
  }

  var isObjectLike_1 = isObjectLike;
  /** `Object#toString` result references. */

  var argsTag = '[object Arguments]';
  /**
   * The base implementation of `_.isArguments`.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   */

  function baseIsArguments(value) {
    return isObjectLike_1(value) && _baseGetTag(value) == argsTag;
  }

  var _baseIsArguments = baseIsArguments;
  /** Used for built-in method references. */

  var objectProto$2 = Object.prototype;
  /** Used to check objects for own properties. */

  var hasOwnProperty$1 = objectProto$2.hasOwnProperty;
  /** Built-in value references. */

  var propertyIsEnumerable = objectProto$2.propertyIsEnumerable;
  /**
   * Checks if `value` is likely an `arguments` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   *  else `false`.
   * @example
   *
   * _.isArguments(function() { return arguments; }());
   * // => true
   *
   * _.isArguments([1, 2, 3]);
   * // => false
   */

  var isArguments = _baseIsArguments(function () {
    return arguments;
  }()) ? _baseIsArguments : function (value) {
    return isObjectLike_1(value) && hasOwnProperty$1.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
  };
  var isArguments_1 = isArguments;
  /**
   * Checks if `value` is classified as an `Array` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array, else `false`.
   * @example
   *
   * _.isArray([1, 2, 3]);
   * // => true
   *
   * _.isArray(document.body.children);
   * // => false
   *
   * _.isArray('abc');
   * // => false
   *
   * _.isArray(_.noop);
   * // => false
   */

  var isArray = Array.isArray;
  var isArray_1 = isArray;
  /**
   * This method returns `false`.
   *
   * @static
   * @memberOf _
   * @since 4.13.0
   * @category Util
   * @returns {boolean} Returns `false`.
   * @example
   *
   * _.times(2, _.stubFalse);
   * // => [false, false]
   */

  function stubFalse() {
    return false;
  }

  var stubFalse_1 = stubFalse;
  var isBuffer_1 = createCommonjsModule(function (module, exports) {
    /** Detect free variable `exports`. */
    var freeExports = exports && !exports.nodeType && exports;
    /** Detect free variable `module`. */

    var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;
    /** Detect the popular CommonJS extension `module.exports`. */

    var moduleExports = freeModule && freeModule.exports === freeExports;
    /** Built-in value references. */

    var Buffer = moduleExports ? _root.Buffer : undefined;
    /* Built-in method references for those with the same name as other `lodash` methods. */

    var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;
    /**
     * Checks if `value` is a buffer.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
     * @example
     *
     * _.isBuffer(new Buffer(2));
     * // => true
     *
     * _.isBuffer(new Uint8Array(2));
     * // => false
     */

    var isBuffer = nativeIsBuffer || stubFalse_1;
    module.exports = isBuffer;
  });
  /** Used as references for various `Number` constants. */

  var MAX_SAFE_INTEGER = 9007199254740991;
  /** Used to detect unsigned integer values. */

  var reIsUint = /^(?:0|[1-9]\d*)$/;
  /**
   * Checks if `value` is a valid array-like index.
   *
   * @private
   * @param {*} value The value to check.
   * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
   * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
   */

  function isIndex(value, length) {
    var type = _typeof(value);

    length = length == null ? MAX_SAFE_INTEGER : length;
    return !!length && (type == 'number' || type != 'symbol' && reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
  }

  var _isIndex = isIndex;
  /** Used as references for various `Number` constants. */

  var MAX_SAFE_INTEGER$1 = 9007199254740991;
  /**
   * Checks if `value` is a valid array-like length.
   *
   * **Note:** This method is loosely based on
   * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
   * @example
   *
   * _.isLength(3);
   * // => true
   *
   * _.isLength(Number.MIN_VALUE);
   * // => false
   *
   * _.isLength(Infinity);
   * // => false
   *
   * _.isLength('3');
   * // => false
   */

  function isLength(value) {
    return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER$1;
  }

  var isLength_1 = isLength;
  /** `Object#toString` result references. */

  var argsTag$1 = '[object Arguments]',
      arrayTag = '[object Array]',
      boolTag = '[object Boolean]',
      dateTag = '[object Date]',
      errorTag = '[object Error]',
      funcTag = '[object Function]',
      mapTag = '[object Map]',
      numberTag = '[object Number]',
      objectTag = '[object Object]',
      regexpTag = '[object RegExp]',
      setTag = '[object Set]',
      stringTag = '[object String]',
      weakMapTag = '[object WeakMap]';
  var arrayBufferTag = '[object ArrayBuffer]',
      dataViewTag = '[object DataView]',
      float32Tag = '[object Float32Array]',
      float64Tag = '[object Float64Array]',
      int8Tag = '[object Int8Array]',
      int16Tag = '[object Int16Array]',
      int32Tag = '[object Int32Array]',
      uint8Tag = '[object Uint8Array]',
      uint8ClampedTag = '[object Uint8ClampedArray]',
      uint16Tag = '[object Uint16Array]',
      uint32Tag = '[object Uint32Array]';
  /** Used to identify `toStringTag` values of typed arrays. */

  var typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
  /**
   * The base implementation of `_.isTypedArray` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
   */

  function baseIsTypedArray(value) {
    return isObjectLike_1(value) && isLength_1(value.length) && !!typedArrayTags[_baseGetTag(value)];
  }

  var _baseIsTypedArray = baseIsTypedArray;
  /**
   * The base implementation of `_.unary` without support for storing metadata.
   *
   * @private
   * @param {Function} func The function to cap arguments for.
   * @returns {Function} Returns the new capped function.
   */

  function baseUnary(func) {
    return function (value) {
      return func(value);
    };
  }

  var _baseUnary = baseUnary;

  var _nodeUtil = createCommonjsModule(function (module, exports) {
    /** Detect free variable `exports`. */
    var freeExports = exports && !exports.nodeType && exports;
    /** Detect free variable `module`. */

    var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;
    /** Detect the popular CommonJS extension `module.exports`. */

    var moduleExports = freeModule && freeModule.exports === freeExports;
    /** Detect free variable `process` from Node.js. */

    var freeProcess = moduleExports && _freeGlobal.process;
    /** Used to access faster Node.js helpers. */

    var nodeUtil = function () {
      try {
        // Use `util.types` for Node.js 10+.
        var types = freeModule && freeModule.require && freeModule.require('util').types;

        if (types) {
          return types;
        } // Legacy `process.binding('util')` for Node.js < 10.


        return freeProcess && freeProcess.binding && freeProcess.binding('util');
      } catch (e) {}
    }();

    module.exports = nodeUtil;
  });
  /* Node.js helper references. */


  var nodeIsTypedArray = _nodeUtil && _nodeUtil.isTypedArray;
  /**
   * Checks if `value` is classified as a typed array.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
   * @example
   *
   * _.isTypedArray(new Uint8Array);
   * // => true
   *
   * _.isTypedArray([]);
   * // => false
   */

  var isTypedArray = nodeIsTypedArray ? _baseUnary(nodeIsTypedArray) : _baseIsTypedArray;
  var isTypedArray_1 = isTypedArray;
  /** Used for built-in method references. */

  var objectProto$3 = Object.prototype;
  /** Used to check objects for own properties. */

  var hasOwnProperty$2 = objectProto$3.hasOwnProperty;
  /**
   * Creates an array of the enumerable property names of the array-like `value`.
   *
   * @private
   * @param {*} value The value to query.
   * @param {boolean} inherited Specify returning inherited property names.
   * @returns {Array} Returns the array of property names.
   */

  function arrayLikeKeys(value, inherited) {
    var isArr = isArray_1(value),
        isArg = !isArr && isArguments_1(value),
        isBuff = !isArr && !isArg && isBuffer_1(value),
        isType = !isArr && !isArg && !isBuff && isTypedArray_1(value),
        skipIndexes = isArr || isArg || isBuff || isType,
        result = skipIndexes ? _baseTimes(value.length, String) : [],
        length = result.length;

    for (var key in value) {
      if ((inherited || hasOwnProperty$2.call(value, key)) && !(skipIndexes && ( // Safari 9 has enumerable `arguments.length` in strict mode.
      key == 'length' || // Node.js 0.10 has enumerable non-index properties on buffers.
      isBuff && (key == 'offset' || key == 'parent') || // PhantomJS 2 has enumerable non-index properties on typed arrays.
      isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset') || // Skip index properties.
      _isIndex(key, length)))) {
        result.push(key);
      }
    }

    return result;
  }

  var _arrayLikeKeys = arrayLikeKeys;
  /** Used for built-in method references. */

  var objectProto$4 = Object.prototype;
  /**
   * Checks if `value` is likely a prototype object.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
   */

  function isPrototype(value) {
    var Ctor = value && value.constructor,
        proto = typeof Ctor == 'function' && Ctor.prototype || objectProto$4;
    return value === proto;
  }

  var _isPrototype = isPrototype;
  /**
   * Creates a unary function that invokes `func` with its argument transformed.
   *
   * @private
   * @param {Function} func The function to wrap.
   * @param {Function} transform The argument transform.
   * @returns {Function} Returns the new function.
   */

  function overArg(func, transform) {
    return function (arg) {
      return func(transform(arg));
    };
  }

  var _overArg = overArg;
  /* Built-in method references for those with the same name as other `lodash` methods. */

  var nativeKeys = _overArg(Object.keys, Object);

  var _nativeKeys = nativeKeys;
  /** Used for built-in method references. */

  var objectProto$5 = Object.prototype;
  /** Used to check objects for own properties. */

  var hasOwnProperty$3 = objectProto$5.hasOwnProperty;
  /**
   * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */

  function baseKeys(object) {
    if (!_isPrototype(object)) {
      return _nativeKeys(object);
    }

    var result = [];

    for (var key in Object(object)) {
      if (hasOwnProperty$3.call(object, key) && key != 'constructor') {
        result.push(key);
      }
    }

    return result;
  }

  var _baseKeys = baseKeys;
  /**
   * Checks if `value` is the
   * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
   * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */

  function isObject(value) {
    var type = _typeof(value);

    return value != null && (type == 'object' || type == 'function');
  }

  var isObject_1 = isObject;
  /** `Object#toString` result references. */

  var asyncTag = '[object AsyncFunction]',
      funcTag$1 = '[object Function]',
      genTag = '[object GeneratorFunction]',
      proxyTag = '[object Proxy]';
  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   *
   * _.isFunction(/abc/);
   * // => false
   */

  function isFunction(value) {
    if (!isObject_1(value)) {
      return false;
    } // The use of `Object#toString` avoids issues with the `typeof` operator
    // in Safari 9 which returns 'object' for typed arrays and other constructors.


    var tag = _baseGetTag(value);

    return tag == funcTag$1 || tag == genTag || tag == asyncTag || tag == proxyTag;
  }

  var isFunction_1 = isFunction;
  /**
   * Checks if `value` is array-like. A value is considered array-like if it's
   * not a function and has a `value.length` that's an integer greater than or
   * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
   * @example
   *
   * _.isArrayLike([1, 2, 3]);
   * // => true
   *
   * _.isArrayLike(document.body.children);
   * // => true
   *
   * _.isArrayLike('abc');
   * // => true
   *
   * _.isArrayLike(_.noop);
   * // => false
   */

  function isArrayLike(value) {
    return value != null && isLength_1(value.length) && !isFunction_1(value);
  }

  var isArrayLike_1 = isArrayLike;
  /**
   * Creates an array of the own enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects. See the
   * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
   * for more details.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keys(new Foo);
   * // => ['a', 'b'] (iteration order is not guaranteed)
   *
   * _.keys('hi');
   * // => ['0', '1']
   */

  function keys(object) {
    return isArrayLike_1(object) ? _arrayLikeKeys(object) : _baseKeys(object);
  }

  var keys_1 = keys;
  /**
   * The base implementation of `_.forOwn` without support for iteratee shorthands.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Object} Returns `object`.
   */

  function baseForOwn(object, iteratee) {
    return object && _baseFor(object, iteratee, keys_1);
  }

  var _baseForOwn = baseForOwn;
  /**
   * Creates a `baseEach` or `baseEachRight` function.
   *
   * @private
   * @param {Function} eachFunc The function to iterate over a collection.
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {Function} Returns the new base function.
   */

  function createBaseEach(eachFunc, fromRight) {
    return function (collection, iteratee) {
      if (collection == null) {
        return collection;
      }

      if (!isArrayLike_1(collection)) {
        return eachFunc(collection, iteratee);
      }

      var length = collection.length,
          index = fromRight ? length : -1,
          iterable = Object(collection);

      while (fromRight ? index-- : ++index < length) {
        if (iteratee(iterable[index], index, iterable) === false) {
          break;
        }
      }

      return collection;
    };
  }

  var _createBaseEach = createBaseEach;
  /**
   * The base implementation of `_.forEach` without support for iteratee shorthands.
   *
   * @private
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array|Object} Returns `collection`.
   */

  var baseEach = _createBaseEach(_baseForOwn);

  var _baseEach = baseEach;
  /**
   * The base implementation of `_.filter` without support for iteratee shorthands.
   *
   * @private
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {Array} Returns the new filtered array.
   */

  function baseFilter(collection, predicate) {
    var result = [];

    _baseEach(collection, function (value, index, collection) {
      if (predicate(value, index, collection)) {
        result.push(value);
      }
    });

    return result;
  }

  var _baseFilter = baseFilter;
  /**
   * Removes all key-value entries from the list cache.
   *
   * @private
   * @name clear
   * @memberOf ListCache
   */

  function listCacheClear() {
    this.__data__ = [];
    this.size = 0;
  }

  var _listCacheClear = listCacheClear;
  /**
   * Performs a
   * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * comparison between two values to determine if they are equivalent.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   * @example
   *
   * var object = { 'a': 1 };
   * var other = { 'a': 1 };
   *
   * _.eq(object, object);
   * // => true
   *
   * _.eq(object, other);
   * // => false
   *
   * _.eq('a', 'a');
   * // => true
   *
   * _.eq('a', Object('a'));
   * // => false
   *
   * _.eq(NaN, NaN);
   * // => true
   */

  function eq(value, other) {
    return value === other || value !== value && other !== other;
  }

  var eq_1 = eq;
  /**
   * Gets the index at which the `key` is found in `array` of key-value pairs.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {*} key The key to search for.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */

  function assocIndexOf(array, key) {
    var length = array.length;

    while (length--) {
      if (eq_1(array[length][0], key)) {
        return length;
      }
    }

    return -1;
  }

  var _assocIndexOf = assocIndexOf;
  /** Used for built-in method references. */

  var arrayProto = Array.prototype;
  /** Built-in value references. */

  var splice = arrayProto.splice;
  /**
   * Removes `key` and its value from the list cache.
   *
   * @private
   * @name delete
   * @memberOf ListCache
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */

  function listCacheDelete(key) {
    var data = this.__data__,
        index = _assocIndexOf(data, key);

    if (index < 0) {
      return false;
    }

    var lastIndex = data.length - 1;

    if (index == lastIndex) {
      data.pop();
    } else {
      splice.call(data, index, 1);
    }

    --this.size;
    return true;
  }

  var _listCacheDelete = listCacheDelete;
  /**
   * Gets the list cache value for `key`.
   *
   * @private
   * @name get
   * @memberOf ListCache
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */

  function listCacheGet(key) {
    var data = this.__data__,
        index = _assocIndexOf(data, key);

    return index < 0 ? undefined : data[index][1];
  }

  var _listCacheGet = listCacheGet;
  /**
   * Checks if a list cache value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf ListCache
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */

  function listCacheHas(key) {
    return _assocIndexOf(this.__data__, key) > -1;
  }

  var _listCacheHas = listCacheHas;
  /**
   * Sets the list cache `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf ListCache
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the list cache instance.
   */

  function listCacheSet(key, value) {
    var data = this.__data__,
        index = _assocIndexOf(data, key);

    if (index < 0) {
      ++this.size;
      data.push([key, value]);
    } else {
      data[index][1] = value;
    }

    return this;
  }

  var _listCacheSet = listCacheSet;
  /**
   * Creates an list cache object.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */

  function ListCache(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;
    this.clear();

    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  } // Add methods to `ListCache`.


  ListCache.prototype.clear = _listCacheClear;
  ListCache.prototype['delete'] = _listCacheDelete;
  ListCache.prototype.get = _listCacheGet;
  ListCache.prototype.has = _listCacheHas;
  ListCache.prototype.set = _listCacheSet;
  var _ListCache = ListCache;
  /**
   * Removes all key-value entries from the stack.
   *
   * @private
   * @name clear
   * @memberOf Stack
   */

  function stackClear() {
    this.__data__ = new _ListCache();
    this.size = 0;
  }

  var _stackClear = stackClear;
  /**
   * Removes `key` and its value from the stack.
   *
   * @private
   * @name delete
   * @memberOf Stack
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */

  function stackDelete(key) {
    var data = this.__data__,
        result = data['delete'](key);
    this.size = data.size;
    return result;
  }

  var _stackDelete = stackDelete;
  /**
   * Gets the stack value for `key`.
   *
   * @private
   * @name get
   * @memberOf Stack
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */

  function stackGet(key) {
    return this.__data__.get(key);
  }

  var _stackGet = stackGet;
  /**
   * Checks if a stack value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf Stack
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */

  function stackHas(key) {
    return this.__data__.has(key);
  }

  var _stackHas = stackHas;
  /** Used to detect overreaching core-js shims. */

  var coreJsData = _root['__core-js_shared__'];
  var _coreJsData = coreJsData;
  /** Used to detect methods masquerading as native. */

  var maskSrcKey = function () {
    var uid = /[^.]+$/.exec(_coreJsData && _coreJsData.keys && _coreJsData.keys.IE_PROTO || '');
    return uid ? 'Symbol(src)_1.' + uid : '';
  }();
  /**
   * Checks if `func` has its source masked.
   *
   * @private
   * @param {Function} func The function to check.
   * @returns {boolean} Returns `true` if `func` is masked, else `false`.
   */


  function isMasked(func) {
    return !!maskSrcKey && maskSrcKey in func;
  }

  var _isMasked = isMasked;
  /** Used for built-in method references. */

  var funcProto = Function.prototype;
  /** Used to resolve the decompiled source of functions. */

  var funcToString = funcProto.toString;
  /**
   * Converts `func` to its source code.
   *
   * @private
   * @param {Function} func The function to convert.
   * @returns {string} Returns the source code.
   */

  function toSource(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e) {}

      try {
        return func + '';
      } catch (e) {}
    }

    return '';
  }

  var _toSource = toSource;
  /**
   * Used to match `RegExp`
   * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
   */

  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
  /** Used to detect host constructors (Safari). */

  var reIsHostCtor = /^\[object .+?Constructor\]$/;
  /** Used for built-in method references. */

  var funcProto$1 = Function.prototype,
      objectProto$6 = Object.prototype;
  /** Used to resolve the decompiled source of functions. */

  var funcToString$1 = funcProto$1.toString;
  /** Used to check objects for own properties. */

  var hasOwnProperty$4 = objectProto$6.hasOwnProperty;
  /** Used to detect if a method is native. */

  var reIsNative = RegExp('^' + funcToString$1.call(hasOwnProperty$4).replace(reRegExpChar, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');
  /**
   * The base implementation of `_.isNative` without bad shim checks.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a native function,
   *  else `false`.
   */

  function baseIsNative(value) {
    if (!isObject_1(value) || _isMasked(value)) {
      return false;
    }

    var pattern = isFunction_1(value) ? reIsNative : reIsHostCtor;
    return pattern.test(_toSource(value));
  }

  var _baseIsNative = baseIsNative;
  /**
   * Gets the value at `key` of `object`.
   *
   * @private
   * @param {Object} [object] The object to query.
   * @param {string} key The key of the property to get.
   * @returns {*} Returns the property value.
   */

  function getValue(object, key) {
    return object == null ? undefined : object[key];
  }

  var _getValue = getValue;
  /**
   * Gets the native function at `key` of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {string} key The key of the method to get.
   * @returns {*} Returns the function if it's native, else `undefined`.
   */

  function getNative(object, key) {
    var value = _getValue(object, key);

    return _baseIsNative(value) ? value : undefined;
  }

  var _getNative = getNative;
  /* Built-in method references that are verified to be native. */

  var Map = _getNative(_root, 'Map');

  var _Map = Map;
  /* Built-in method references that are verified to be native. */

  var nativeCreate = _getNative(Object, 'create');

  var _nativeCreate = nativeCreate;
  /**
   * Removes all key-value entries from the hash.
   *
   * @private
   * @name clear
   * @memberOf Hash
   */

  function hashClear() {
    this.__data__ = _nativeCreate ? _nativeCreate(null) : {};
    this.size = 0;
  }

  var _hashClear = hashClear;
  /**
   * Removes `key` and its value from the hash.
   *
   * @private
   * @name delete
   * @memberOf Hash
   * @param {Object} hash The hash to modify.
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */

  function hashDelete(key) {
    var result = this.has(key) && delete this.__data__[key];
    this.size -= result ? 1 : 0;
    return result;
  }

  var _hashDelete = hashDelete;
  /** Used to stand-in for `undefined` hash values. */

  var HASH_UNDEFINED = '__lodash_hash_undefined__';
  /** Used for built-in method references. */

  var objectProto$7 = Object.prototype;
  /** Used to check objects for own properties. */

  var hasOwnProperty$5 = objectProto$7.hasOwnProperty;
  /**
   * Gets the hash value for `key`.
   *
   * @private
   * @name get
   * @memberOf Hash
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */

  function hashGet(key) {
    var data = this.__data__;

    if (_nativeCreate) {
      var result = data[key];
      return result === HASH_UNDEFINED ? undefined : result;
    }

    return hasOwnProperty$5.call(data, key) ? data[key] : undefined;
  }

  var _hashGet = hashGet;
  /** Used for built-in method references. */

  var objectProto$8 = Object.prototype;
  /** Used to check objects for own properties. */

  var hasOwnProperty$6 = objectProto$8.hasOwnProperty;
  /**
   * Checks if a hash value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf Hash
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */

  function hashHas(key) {
    var data = this.__data__;
    return _nativeCreate ? data[key] !== undefined : hasOwnProperty$6.call(data, key);
  }

  var _hashHas = hashHas;
  /** Used to stand-in for `undefined` hash values. */

  var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';
  /**
   * Sets the hash `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf Hash
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the hash instance.
   */

  function hashSet(key, value) {
    var data = this.__data__;
    this.size += this.has(key) ? 0 : 1;
    data[key] = _nativeCreate && value === undefined ? HASH_UNDEFINED$1 : value;
    return this;
  }

  var _hashSet = hashSet;
  /**
   * Creates a hash object.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */

  function Hash(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;
    this.clear();

    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  } // Add methods to `Hash`.


  Hash.prototype.clear = _hashClear;
  Hash.prototype['delete'] = _hashDelete;
  Hash.prototype.get = _hashGet;
  Hash.prototype.has = _hashHas;
  Hash.prototype.set = _hashSet;
  var _Hash = Hash;
  /**
   * Removes all key-value entries from the map.
   *
   * @private
   * @name clear
   * @memberOf MapCache
   */

  function mapCacheClear() {
    this.size = 0;
    this.__data__ = {
      'hash': new _Hash(),
      'map': new (_Map || _ListCache)(),
      'string': new _Hash()
    };
  }

  var _mapCacheClear = mapCacheClear;
  /**
   * Checks if `value` is suitable for use as unique object key.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
   */

  function isKeyable(value) {
    var type = _typeof(value);

    return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean' ? value !== '__proto__' : value === null;
  }

  var _isKeyable = isKeyable;
  /**
   * Gets the data for `map`.
   *
   * @private
   * @param {Object} map The map to query.
   * @param {string} key The reference key.
   * @returns {*} Returns the map data.
   */

  function getMapData(map, key) {
    var data = map.__data__;
    return _isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map;
  }

  var _getMapData = getMapData;
  /**
   * Removes `key` and its value from the map.
   *
   * @private
   * @name delete
   * @memberOf MapCache
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */

  function mapCacheDelete(key) {
    var result = _getMapData(this, key)['delete'](key);

    this.size -= result ? 1 : 0;
    return result;
  }

  var _mapCacheDelete = mapCacheDelete;
  /**
   * Gets the map value for `key`.
   *
   * @private
   * @name get
   * @memberOf MapCache
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */

  function mapCacheGet(key) {
    return _getMapData(this, key).get(key);
  }

  var _mapCacheGet = mapCacheGet;
  /**
   * Checks if a map value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf MapCache
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */

  function mapCacheHas(key) {
    return _getMapData(this, key).has(key);
  }

  var _mapCacheHas = mapCacheHas;
  /**
   * Sets the map `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf MapCache
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the map cache instance.
   */

  function mapCacheSet(key, value) {
    var data = _getMapData(this, key),
        size = data.size;

    data.set(key, value);
    this.size += data.size == size ? 0 : 1;
    return this;
  }

  var _mapCacheSet = mapCacheSet;
  /**
   * Creates a map cache object to store key-value pairs.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */

  function MapCache(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;
    this.clear();

    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  } // Add methods to `MapCache`.


  MapCache.prototype.clear = _mapCacheClear;
  MapCache.prototype['delete'] = _mapCacheDelete;
  MapCache.prototype.get = _mapCacheGet;
  MapCache.prototype.has = _mapCacheHas;
  MapCache.prototype.set = _mapCacheSet;
  var _MapCache = MapCache;
  /** Used as the size to enable large array optimizations. */

  var LARGE_ARRAY_SIZE = 200;
  /**
   * Sets the stack `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf Stack
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the stack cache instance.
   */

  function stackSet(key, value) {
    var data = this.__data__;

    if (data instanceof _ListCache) {
      var pairs = data.__data__;

      if (!_Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
        pairs.push([key, value]);
        this.size = ++data.size;
        return this;
      }

      data = this.__data__ = new _MapCache(pairs);
    }

    data.set(key, value);
    this.size = data.size;
    return this;
  }

  var _stackSet = stackSet;
  /**
   * Creates a stack cache object to store key-value pairs.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */

  function Stack(entries) {
    var data = this.__data__ = new _ListCache(entries);
    this.size = data.size;
  } // Add methods to `Stack`.


  Stack.prototype.clear = _stackClear;
  Stack.prototype['delete'] = _stackDelete;
  Stack.prototype.get = _stackGet;
  Stack.prototype.has = _stackHas;
  Stack.prototype.set = _stackSet;
  var _Stack = Stack;
  /** Used to stand-in for `undefined` hash values. */

  var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';
  /**
   * Adds `value` to the array cache.
   *
   * @private
   * @name add
   * @memberOf SetCache
   * @alias push
   * @param {*} value The value to cache.
   * @returns {Object} Returns the cache instance.
   */

  function setCacheAdd(value) {
    this.__data__.set(value, HASH_UNDEFINED$2);

    return this;
  }

  var _setCacheAdd = setCacheAdd;
  /**
   * Checks if `value` is in the array cache.
   *
   * @private
   * @name has
   * @memberOf SetCache
   * @param {*} value The value to search for.
   * @returns {number} Returns `true` if `value` is found, else `false`.
   */

  function setCacheHas(value) {
    return this.__data__.has(value);
  }

  var _setCacheHas = setCacheHas;
  /**
   *
   * Creates an array cache object to store unique values.
   *
   * @private
   * @constructor
   * @param {Array} [values] The values to cache.
   */

  function SetCache(values) {
    var index = -1,
        length = values == null ? 0 : values.length;
    this.__data__ = new _MapCache();

    while (++index < length) {
      this.add(values[index]);
    }
  } // Add methods to `SetCache`.


  SetCache.prototype.add = SetCache.prototype.push = _setCacheAdd;
  SetCache.prototype.has = _setCacheHas;
  var _SetCache = SetCache;
  /**
   * A specialized version of `_.some` for arrays without support for iteratee
   * shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {boolean} Returns `true` if any element passes the predicate check,
   *  else `false`.
   */

  function arraySome(array, predicate) {
    var index = -1,
        length = array == null ? 0 : array.length;

    while (++index < length) {
      if (predicate(array[index], index, array)) {
        return true;
      }
    }

    return false;
  }

  var _arraySome = arraySome;
  /**
   * Checks if a `cache` value for `key` exists.
   *
   * @private
   * @param {Object} cache The cache to query.
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */

  function cacheHas(cache, key) {
    return cache.has(key);
  }

  var _cacheHas = cacheHas;
  /** Used to compose bitmasks for value comparisons. */

  var COMPARE_PARTIAL_FLAG = 1,
      COMPARE_UNORDERED_FLAG = 2;
  /**
   * A specialized version of `baseIsEqualDeep` for arrays with support for
   * partial deep comparisons.
   *
   * @private
   * @param {Array} array The array to compare.
   * @param {Array} other The other array to compare.
   * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
   * @param {Function} customizer The function to customize comparisons.
   * @param {Function} equalFunc The function to determine equivalents of values.
   * @param {Object} stack Tracks traversed `array` and `other` objects.
   * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
   */

  function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
        arrLength = array.length,
        othLength = other.length;

    if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
      return false;
    } // Assume cyclic values are equal.


    var stacked = stack.get(array);

    if (stacked && stack.get(other)) {
      return stacked == other;
    }

    var index = -1,
        result = true,
        seen = bitmask & COMPARE_UNORDERED_FLAG ? new _SetCache() : undefined;
    stack.set(array, other);
    stack.set(other, array); // Ignore non-index properties.

    while (++index < arrLength) {
      var arrValue = array[index],
          othValue = other[index];

      if (customizer) {
        var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
      }

      if (compared !== undefined) {
        if (compared) {
          continue;
        }

        result = false;
        break;
      } // Recursively compare arrays (susceptible to call stack limits).


      if (seen) {
        if (!_arraySome(other, function (othValue, othIndex) {
          if (!_cacheHas(seen, othIndex) && (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
            return seen.push(othIndex);
          }
        })) {
          result = false;
          break;
        }
      } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
        result = false;
        break;
      }
    }

    stack['delete'](array);
    stack['delete'](other);
    return result;
  }

  var _equalArrays = equalArrays;
  /** Built-in value references. */

  var Uint8Array = _root.Uint8Array;
  var _Uint8Array = Uint8Array;
  /**
   * Converts `map` to its key-value pairs.
   *
   * @private
   * @param {Object} map The map to convert.
   * @returns {Array} Returns the key-value pairs.
   */

  function mapToArray(map) {
    var index = -1,
        result = Array(map.size);
    map.forEach(function (value, key) {
      result[++index] = [key, value];
    });
    return result;
  }

  var _mapToArray = mapToArray;
  /**
   * Converts `set` to an array of its values.
   *
   * @private
   * @param {Object} set The set to convert.
   * @returns {Array} Returns the values.
   */

  function setToArray(set) {
    var index = -1,
        result = Array(set.size);
    set.forEach(function (value) {
      result[++index] = value;
    });
    return result;
  }

  var _setToArray = setToArray;
  /** Used to compose bitmasks for value comparisons. */

  var COMPARE_PARTIAL_FLAG$1 = 1,
      COMPARE_UNORDERED_FLAG$1 = 2;
  /** `Object#toString` result references. */

  var boolTag$1 = '[object Boolean]',
      dateTag$1 = '[object Date]',
      errorTag$1 = '[object Error]',
      mapTag$1 = '[object Map]',
      numberTag$1 = '[object Number]',
      regexpTag$1 = '[object RegExp]',
      setTag$1 = '[object Set]',
      stringTag$1 = '[object String]',
      symbolTag = '[object Symbol]';
  var arrayBufferTag$1 = '[object ArrayBuffer]',
      dataViewTag$1 = '[object DataView]';
  /** Used to convert symbols to primitives and strings. */

  var symbolProto = _Symbol ? _Symbol.prototype : undefined,
      symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;
  /**
   * A specialized version of `baseIsEqualDeep` for comparing objects of
   * the same `toStringTag`.
   *
   * **Note:** This function only supports comparing values with tags of
   * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
   *
   * @private
   * @param {Object} object The object to compare.
   * @param {Object} other The other object to compare.
   * @param {string} tag The `toStringTag` of the objects to compare.
   * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
   * @param {Function} customizer The function to customize comparisons.
   * @param {Function} equalFunc The function to determine equivalents of values.
   * @param {Object} stack Tracks traversed `object` and `other` objects.
   * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
   */

  function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
    switch (tag) {
      case dataViewTag$1:
        if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
          return false;
        }

        object = object.buffer;
        other = other.buffer;

      case arrayBufferTag$1:
        if (object.byteLength != other.byteLength || !equalFunc(new _Uint8Array(object), new _Uint8Array(other))) {
          return false;
        }

        return true;

      case boolTag$1:
      case dateTag$1:
      case numberTag$1:
        // Coerce booleans to `1` or `0` and dates to milliseconds.
        // Invalid dates are coerced to `NaN`.
        return eq_1(+object, +other);

      case errorTag$1:
        return object.name == other.name && object.message == other.message;

      case regexpTag$1:
      case stringTag$1:
        // Coerce regexes to strings and treat strings, primitives and objects,
        // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
        // for more details.
        return object == other + '';

      case mapTag$1:
        var convert = _mapToArray;

      case setTag$1:
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG$1;
        convert || (convert = _setToArray);

        if (object.size != other.size && !isPartial) {
          return false;
        } // Assume cyclic values are equal.


        var stacked = stack.get(object);

        if (stacked) {
          return stacked == other;
        }

        bitmask |= COMPARE_UNORDERED_FLAG$1; // Recursively compare objects (susceptible to call stack limits).

        stack.set(object, other);

        var result = _equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);

        stack['delete'](object);
        return result;

      case symbolTag:
        if (symbolValueOf) {
          return symbolValueOf.call(object) == symbolValueOf.call(other);
        }

    }

    return false;
  }

  var _equalByTag = equalByTag;
  /**
   * Appends the elements of `values` to `array`.
   *
   * @private
   * @param {Array} array The array to modify.
   * @param {Array} values The values to append.
   * @returns {Array} Returns `array`.
   */

  function arrayPush(array, values) {
    var index = -1,
        length = values.length,
        offset = array.length;

    while (++index < length) {
      array[offset + index] = values[index];
    }

    return array;
  }

  var _arrayPush = arrayPush;
  /**
   * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
   * `keysFunc` and `symbolsFunc` to get the enumerable property names and
   * symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Function} keysFunc The function to get the keys of `object`.
   * @param {Function} symbolsFunc The function to get the symbols of `object`.
   * @returns {Array} Returns the array of property names and symbols.
   */

  function baseGetAllKeys(object, keysFunc, symbolsFunc) {
    var result = keysFunc(object);
    return isArray_1(object) ? result : _arrayPush(result, symbolsFunc(object));
  }

  var _baseGetAllKeys = baseGetAllKeys;
  /**
   * This method returns a new empty array.
   *
   * @static
   * @memberOf _
   * @since 4.13.0
   * @category Util
   * @returns {Array} Returns the new empty array.
   * @example
   *
   * var arrays = _.times(2, _.stubArray);
   *
   * console.log(arrays);
   * // => [[], []]
   *
   * console.log(arrays[0] === arrays[1]);
   * // => false
   */

  function stubArray() {
    return [];
  }

  var stubArray_1 = stubArray;
  /** Used for built-in method references. */

  var objectProto$9 = Object.prototype;
  /** Built-in value references. */

  var propertyIsEnumerable$1 = objectProto$9.propertyIsEnumerable;
  /* Built-in method references for those with the same name as other `lodash` methods. */

  var nativeGetSymbols = Object.getOwnPropertySymbols;
  /**
   * Creates an array of the own enumerable symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of symbols.
   */

  var getSymbols = !nativeGetSymbols ? stubArray_1 : function (object) {
    if (object == null) {
      return [];
    }

    object = Object(object);
    return _arrayFilter(nativeGetSymbols(object), function (symbol) {
      return propertyIsEnumerable$1.call(object, symbol);
    });
  };
  var _getSymbols = getSymbols;
  /**
   * Creates an array of own enumerable property names and symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names and symbols.
   */

  function getAllKeys(object) {
    return _baseGetAllKeys(object, keys_1, _getSymbols);
  }

  var _getAllKeys = getAllKeys;
  /** Used to compose bitmasks for value comparisons. */

  var COMPARE_PARTIAL_FLAG$2 = 1;
  /** Used for built-in method references. */

  var objectProto$a = Object.prototype;
  /** Used to check objects for own properties. */

  var hasOwnProperty$7 = objectProto$a.hasOwnProperty;
  /**
   * A specialized version of `baseIsEqualDeep` for objects with support for
   * partial deep comparisons.
   *
   * @private
   * @param {Object} object The object to compare.
   * @param {Object} other The other object to compare.
   * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
   * @param {Function} customizer The function to customize comparisons.
   * @param {Function} equalFunc The function to determine equivalents of values.
   * @param {Object} stack Tracks traversed `object` and `other` objects.
   * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
   */

  function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG$2,
        objProps = _getAllKeys(object),
        objLength = objProps.length,
        othProps = _getAllKeys(other),
        othLength = othProps.length;

    if (objLength != othLength && !isPartial) {
      return false;
    }

    var index = objLength;

    while (index--) {
      var key = objProps[index];

      if (!(isPartial ? key in other : hasOwnProperty$7.call(other, key))) {
        return false;
      }
    } // Assume cyclic values are equal.


    var stacked = stack.get(object);

    if (stacked && stack.get(other)) {
      return stacked == other;
    }

    var result = true;
    stack.set(object, other);
    stack.set(other, object);
    var skipCtor = isPartial;

    while (++index < objLength) {
      key = objProps[index];
      var objValue = object[key],
          othValue = other[key];

      if (customizer) {
        var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
      } // Recursively compare objects (susceptible to call stack limits).


      if (!(compared === undefined ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
        result = false;
        break;
      }

      skipCtor || (skipCtor = key == 'constructor');
    }

    if (result && !skipCtor) {
      var objCtor = object.constructor,
          othCtor = other.constructor; // Non `Object` object instances with different constructors are not equal.

      if (objCtor != othCtor && 'constructor' in object && 'constructor' in other && !(typeof objCtor == 'function' && objCtor instanceof objCtor && typeof othCtor == 'function' && othCtor instanceof othCtor)) {
        result = false;
      }
    }

    stack['delete'](object);
    stack['delete'](other);
    return result;
  }

  var _equalObjects = equalObjects;
  /* Built-in method references that are verified to be native. */

  var DataView = _getNative(_root, 'DataView');

  var _DataView = DataView;
  /* Built-in method references that are verified to be native. */

  var Promise$1 = _getNative(_root, 'Promise');

  var _Promise = Promise$1;
  /* Built-in method references that are verified to be native. */

  var Set = _getNative(_root, 'Set');

  var _Set = Set;
  /* Built-in method references that are verified to be native. */

  var WeakMap = _getNative(_root, 'WeakMap');

  var _WeakMap = WeakMap;
  /** `Object#toString` result references. */

  var mapTag$2 = '[object Map]',
      objectTag$1 = '[object Object]',
      promiseTag = '[object Promise]',
      setTag$2 = '[object Set]',
      weakMapTag$1 = '[object WeakMap]';
  var dataViewTag$2 = '[object DataView]';
  /** Used to detect maps, sets, and weakmaps. */

  var dataViewCtorString = _toSource(_DataView),
      mapCtorString = _toSource(_Map),
      promiseCtorString = _toSource(_Promise),
      setCtorString = _toSource(_Set),
      weakMapCtorString = _toSource(_WeakMap);
  /**
   * Gets the `toStringTag` of `value`.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */


  var getTag = _baseGetTag; // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.

  if (_DataView && getTag(new _DataView(new ArrayBuffer(1))) != dataViewTag$2 || _Map && getTag(new _Map()) != mapTag$2 || _Promise && getTag(_Promise.resolve()) != promiseTag || _Set && getTag(new _Set()) != setTag$2 || _WeakMap && getTag(new _WeakMap()) != weakMapTag$1) {
    getTag = function getTag(value) {
      var result = _baseGetTag(value),
          Ctor = result == objectTag$1 ? value.constructor : undefined,
          ctorString = Ctor ? _toSource(Ctor) : '';

      if (ctorString) {
        switch (ctorString) {
          case dataViewCtorString:
            return dataViewTag$2;

          case mapCtorString:
            return mapTag$2;

          case promiseCtorString:
            return promiseTag;

          case setCtorString:
            return setTag$2;

          case weakMapCtorString:
            return weakMapTag$1;
        }
      }

      return result;
    };
  }

  var _getTag = getTag;
  /** Used to compose bitmasks for value comparisons. */

  var COMPARE_PARTIAL_FLAG$3 = 1;
  /** `Object#toString` result references. */

  var argsTag$2 = '[object Arguments]',
      arrayTag$1 = '[object Array]',
      objectTag$2 = '[object Object]';
  /** Used for built-in method references. */

  var objectProto$b = Object.prototype;
  /** Used to check objects for own properties. */

  var hasOwnProperty$8 = objectProto$b.hasOwnProperty;
  /**
   * A specialized version of `baseIsEqual` for arrays and objects which performs
   * deep comparisons and tracks traversed objects enabling objects with circular
   * references to be compared.
   *
   * @private
   * @param {Object} object The object to compare.
   * @param {Object} other The other object to compare.
   * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
   * @param {Function} customizer The function to customize comparisons.
   * @param {Function} equalFunc The function to determine equivalents of values.
   * @param {Object} [stack] Tracks traversed `object` and `other` objects.
   * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
   */

  function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
    var objIsArr = isArray_1(object),
        othIsArr = isArray_1(other),
        objTag = objIsArr ? arrayTag$1 : _getTag(object),
        othTag = othIsArr ? arrayTag$1 : _getTag(other);
    objTag = objTag == argsTag$2 ? objectTag$2 : objTag;
    othTag = othTag == argsTag$2 ? objectTag$2 : othTag;
    var objIsObj = objTag == objectTag$2,
        othIsObj = othTag == objectTag$2,
        isSameTag = objTag == othTag;

    if (isSameTag && isBuffer_1(object)) {
      if (!isBuffer_1(other)) {
        return false;
      }

      objIsArr = true;
      objIsObj = false;
    }

    if (isSameTag && !objIsObj) {
      stack || (stack = new _Stack());
      return objIsArr || isTypedArray_1(object) ? _equalArrays(object, other, bitmask, customizer, equalFunc, stack) : _equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
    }

    if (!(bitmask & COMPARE_PARTIAL_FLAG$3)) {
      var objIsWrapped = objIsObj && hasOwnProperty$8.call(object, '__wrapped__'),
          othIsWrapped = othIsObj && hasOwnProperty$8.call(other, '__wrapped__');

      if (objIsWrapped || othIsWrapped) {
        var objUnwrapped = objIsWrapped ? object.value() : object,
            othUnwrapped = othIsWrapped ? other.value() : other;
        stack || (stack = new _Stack());
        return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
      }
    }

    if (!isSameTag) {
      return false;
    }

    stack || (stack = new _Stack());
    return _equalObjects(object, other, bitmask, customizer, equalFunc, stack);
  }

  var _baseIsEqualDeep = baseIsEqualDeep;
  /**
   * The base implementation of `_.isEqual` which supports partial comparisons
   * and tracks traversed objects.
   *
   * @private
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @param {boolean} bitmask The bitmask flags.
   *  1 - Unordered comparison
   *  2 - Partial comparison
   * @param {Function} [customizer] The function to customize comparisons.
   * @param {Object} [stack] Tracks traversed `value` and `other` objects.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   */

  function baseIsEqual(value, other, bitmask, customizer, stack) {
    if (value === other) {
      return true;
    }

    if (value == null || other == null || !isObjectLike_1(value) && !isObjectLike_1(other)) {
      return value !== value && other !== other;
    }

    return _baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
  }

  var _baseIsEqual = baseIsEqual;
  /** Used to compose bitmasks for value comparisons. */

  var COMPARE_PARTIAL_FLAG$4 = 1,
      COMPARE_UNORDERED_FLAG$2 = 2;
  /**
   * The base implementation of `_.isMatch` without support for iteratee shorthands.
   *
   * @private
   * @param {Object} object The object to inspect.
   * @param {Object} source The object of property values to match.
   * @param {Array} matchData The property names, values, and compare flags to match.
   * @param {Function} [customizer] The function to customize comparisons.
   * @returns {boolean} Returns `true` if `object` is a match, else `false`.
   */

  function baseIsMatch(object, source, matchData, customizer) {
    var index = matchData.length,
        length = index,
        noCustomizer = !customizer;

    if (object == null) {
      return !length;
    }

    object = Object(object);

    while (index--) {
      var data = matchData[index];

      if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
        return false;
      }
    }

    while (++index < length) {
      data = matchData[index];
      var key = data[0],
          objValue = object[key],
          srcValue = data[1];

      if (noCustomizer && data[2]) {
        if (objValue === undefined && !(key in object)) {
          return false;
        }
      } else {
        var stack = new _Stack();

        if (customizer) {
          var result = customizer(objValue, srcValue, key, object, source, stack);
        }

        if (!(result === undefined ? _baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$4 | COMPARE_UNORDERED_FLAG$2, customizer, stack) : result)) {
          return false;
        }
      }
    }

    return true;
  }

  var _baseIsMatch = baseIsMatch;
  /**
   * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` if suitable for strict
   *  equality comparisons, else `false`.
   */

  function isStrictComparable(value) {
    return value === value && !isObject_1(value);
  }

  var _isStrictComparable = isStrictComparable;
  /**
   * Gets the property names, values, and compare flags of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the match data of `object`.
   */

  function getMatchData(object) {
    var result = keys_1(object),
        length = result.length;

    while (length--) {
      var key = result[length],
          value = object[key];
      result[length] = [key, value, _isStrictComparable(value)];
    }

    return result;
  }

  var _getMatchData = getMatchData;
  /**
   * A specialized version of `matchesProperty` for source values suitable
   * for strict equality comparisons, i.e. `===`.
   *
   * @private
   * @param {string} key The key of the property to get.
   * @param {*} srcValue The value to match.
   * @returns {Function} Returns the new spec function.
   */

  function matchesStrictComparable(key, srcValue) {
    return function (object) {
      if (object == null) {
        return false;
      }

      return object[key] === srcValue && (srcValue !== undefined || key in Object(object));
    };
  }

  var _matchesStrictComparable = matchesStrictComparable;
  /**
   * The base implementation of `_.matches` which doesn't clone `source`.
   *
   * @private
   * @param {Object} source The object of property values to match.
   * @returns {Function} Returns the new spec function.
   */

  function baseMatches(source) {
    var matchData = _getMatchData(source);

    if (matchData.length == 1 && matchData[0][2]) {
      return _matchesStrictComparable(matchData[0][0], matchData[0][1]);
    }

    return function (object) {
      return object === source || _baseIsMatch(object, source, matchData);
    };
  }

  var _baseMatches = baseMatches;
  /** `Object#toString` result references. */

  var symbolTag$1 = '[object Symbol]';
  /**
   * Checks if `value` is classified as a `Symbol` primitive or object.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
   * @example
   *
   * _.isSymbol(Symbol.iterator);
   * // => true
   *
   * _.isSymbol('abc');
   * // => false
   */

  function isSymbol(value) {
    return _typeof(value) == 'symbol' || isObjectLike_1(value) && _baseGetTag(value) == symbolTag$1;
  }

  var isSymbol_1 = isSymbol;
  /** Used to match property names within property paths. */

  var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
      reIsPlainProp = /^\w*$/;
  /**
   * Checks if `value` is a property name and not a property path.
   *
   * @private
   * @param {*} value The value to check.
   * @param {Object} [object] The object to query keys on.
   * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
   */

  function isKey(value, object) {
    if (isArray_1(value)) {
      return false;
    }

    var type = _typeof(value);

    if (type == 'number' || type == 'symbol' || type == 'boolean' || value == null || isSymbol_1(value)) {
      return true;
    }

    return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
  }

  var _isKey = isKey;
  /** Error message constants. */

  var FUNC_ERROR_TEXT = 'Expected a function';
  /**
   * Creates a function that memoizes the result of `func`. If `resolver` is
   * provided, it determines the cache key for storing the result based on the
   * arguments provided to the memoized function. By default, the first argument
   * provided to the memoized function is used as the map cache key. The `func`
   * is invoked with the `this` binding of the memoized function.
   *
   * **Note:** The cache is exposed as the `cache` property on the memoized
   * function. Its creation may be customized by replacing the `_.memoize.Cache`
   * constructor with one whose instances implement the
   * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
   * method interface of `clear`, `delete`, `get`, `has`, and `set`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Function
   * @param {Function} func The function to have its output memoized.
   * @param {Function} [resolver] The function to resolve the cache key.
   * @returns {Function} Returns the new memoized function.
   * @example
   *
   * var object = { 'a': 1, 'b': 2 };
   * var other = { 'c': 3, 'd': 4 };
   *
   * var values = _.memoize(_.values);
   * values(object);
   * // => [1, 2]
   *
   * values(other);
   * // => [3, 4]
   *
   * object.a = 2;
   * values(object);
   * // => [1, 2]
   *
   * // Modify the result cache.
   * values.cache.set(object, ['a', 'b']);
   * values(object);
   * // => ['a', 'b']
   *
   * // Replace `_.memoize.Cache`.
   * _.memoize.Cache = WeakMap;
   */

  function memoize(func, resolver) {
    if (typeof func != 'function' || resolver != null && typeof resolver != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT);
    }

    var memoized = function memoized() {
      var args = arguments,
          key = resolver ? resolver.apply(this, args) : args[0],
          cache = memoized.cache;

      if (cache.has(key)) {
        return cache.get(key);
      }

      var result = func.apply(this, args);
      memoized.cache = cache.set(key, result) || cache;
      return result;
    };

    memoized.cache = new (memoize.Cache || _MapCache)();
    return memoized;
  } // Expose `MapCache`.


  memoize.Cache = _MapCache;
  var memoize_1 = memoize;
  /** Used as the maximum memoize cache size. */

  var MAX_MEMOIZE_SIZE = 500;
  /**
   * A specialized version of `_.memoize` which clears the memoized function's
   * cache when it exceeds `MAX_MEMOIZE_SIZE`.
   *
   * @private
   * @param {Function} func The function to have its output memoized.
   * @returns {Function} Returns the new memoized function.
   */

  function memoizeCapped(func) {
    var result = memoize_1(func, function (key) {
      if (cache.size === MAX_MEMOIZE_SIZE) {
        cache.clear();
      }

      return key;
    });
    var cache = result.cache;
    return result;
  }

  var _memoizeCapped = memoizeCapped;
  /** Used to match property names within property paths. */

  var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
  /** Used to match backslashes in property paths. */

  var reEscapeChar = /\\(\\)?/g;
  /**
   * Converts `string` to a property path array.
   *
   * @private
   * @param {string} string The string to convert.
   * @returns {Array} Returns the property path array.
   */

  var stringToPath = _memoizeCapped(function (string) {
    var result = [];

    if (string.charCodeAt(0) === 46
    /* . */
    ) {
        result.push('');
      }

    string.replace(rePropName, function (match, number, quote, subString) {
      result.push(quote ? subString.replace(reEscapeChar, '$1') : number || match);
    });
    return result;
  });

  var _stringToPath = stringToPath;
  /**
   * A specialized version of `_.map` for arrays without support for iteratee
   * shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the new mapped array.
   */

  function arrayMap(array, iteratee) {
    var index = -1,
        length = array == null ? 0 : array.length,
        result = Array(length);

    while (++index < length) {
      result[index] = iteratee(array[index], index, array);
    }

    return result;
  }

  var _arrayMap = arrayMap;
  /** Used as references for various `Number` constants. */

  var INFINITY = 1 / 0;
  /** Used to convert symbols to primitives and strings. */

  var symbolProto$1 = _Symbol ? _Symbol.prototype : undefined,
      symbolToString = symbolProto$1 ? symbolProto$1.toString : undefined;
  /**
   * The base implementation of `_.toString` which doesn't convert nullish
   * values to empty strings.
   *
   * @private
   * @param {*} value The value to process.
   * @returns {string} Returns the string.
   */

  function baseToString(value) {
    // Exit early for strings to avoid a performance hit in some environments.
    if (typeof value == 'string') {
      return value;
    }

    if (isArray_1(value)) {
      // Recursively convert values (susceptible to call stack limits).
      return _arrayMap(value, baseToString) + '';
    }

    if (isSymbol_1(value)) {
      return symbolToString ? symbolToString.call(value) : '';
    }

    var result = value + '';
    return result == '0' && 1 / value == -INFINITY ? '-0' : result;
  }

  var _baseToString = baseToString;
  /**
   * Converts `value` to a string. An empty string is returned for `null`
   * and `undefined` values. The sign of `-0` is preserved.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   * @example
   *
   * _.toString(null);
   * // => ''
   *
   * _.toString(-0);
   * // => '-0'
   *
   * _.toString([1, 2, 3]);
   * // => '1,2,3'
   */

  function toString(value) {
    return value == null ? '' : _baseToString(value);
  }

  var toString_1 = toString;
  /**
   * Casts `value` to a path array if it's not one.
   *
   * @private
   * @param {*} value The value to inspect.
   * @param {Object} [object] The object to query keys on.
   * @returns {Array} Returns the cast property path array.
   */

  function castPath(value, object) {
    if (isArray_1(value)) {
      return value;
    }

    return _isKey(value, object) ? [value] : _stringToPath(toString_1(value));
  }

  var _castPath = castPath;
  /** Used as references for various `Number` constants. */

  var INFINITY$1 = 1 / 0;
  /**
   * Converts `value` to a string key if it's not a string or symbol.
   *
   * @private
   * @param {*} value The value to inspect.
   * @returns {string|symbol} Returns the key.
   */

  function toKey(value) {
    if (typeof value == 'string' || isSymbol_1(value)) {
      return value;
    }

    var result = value + '';
    return result == '0' && 1 / value == -INFINITY$1 ? '-0' : result;
  }

  var _toKey = toKey;
  /**
   * The base implementation of `_.get` without support for default values.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Array|string} path The path of the property to get.
   * @returns {*} Returns the resolved value.
   */

  function baseGet(object, path) {
    path = _castPath(path, object);
    var index = 0,
        length = path.length;

    while (object != null && index < length) {
      object = object[_toKey(path[index++])];
    }

    return index && index == length ? object : undefined;
  }

  var _baseGet = baseGet;
  /**
   * Gets the value at `path` of `object`. If the resolved value is
   * `undefined`, the `defaultValue` is returned in its place.
   *
   * @static
   * @memberOf _
   * @since 3.7.0
   * @category Object
   * @param {Object} object The object to query.
   * @param {Array|string} path The path of the property to get.
   * @param {*} [defaultValue] The value returned for `undefined` resolved values.
   * @returns {*} Returns the resolved value.
   * @example
   *
   * var object = { 'a': [{ 'b': { 'c': 3 } }] };
   *
   * _.get(object, 'a[0].b.c');
   * // => 3
   *
   * _.get(object, ['a', '0', 'b', 'c']);
   * // => 3
   *
   * _.get(object, 'a.b.c', 'default');
   * // => 'default'
   */

  function get(object, path, defaultValue) {
    var result = object == null ? undefined : _baseGet(object, path);
    return result === undefined ? defaultValue : result;
  }

  var get_1 = get;
  /**
   * The base implementation of `_.hasIn` without support for deep paths.
   *
   * @private
   * @param {Object} [object] The object to query.
   * @param {Array|string} key The key to check.
   * @returns {boolean} Returns `true` if `key` exists, else `false`.
   */

  function baseHasIn(object, key) {
    return object != null && key in Object(object);
  }

  var _baseHasIn = baseHasIn;
  /**
   * Checks if `path` exists on `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Array|string} path The path to check.
   * @param {Function} hasFunc The function to check properties.
   * @returns {boolean} Returns `true` if `path` exists, else `false`.
   */

  function hasPath(object, path, hasFunc) {
    path = _castPath(path, object);
    var index = -1,
        length = path.length,
        result = false;

    while (++index < length) {
      var key = _toKey(path[index]);

      if (!(result = object != null && hasFunc(object, key))) {
        break;
      }

      object = object[key];
    }

    if (result || ++index != length) {
      return result;
    }

    length = object == null ? 0 : object.length;
    return !!length && isLength_1(length) && _isIndex(key, length) && (isArray_1(object) || isArguments_1(object));
  }

  var _hasPath = hasPath;
  /**
   * Checks if `path` is a direct or inherited property of `object`.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Object
   * @param {Object} object The object to query.
   * @param {Array|string} path The path to check.
   * @returns {boolean} Returns `true` if `path` exists, else `false`.
   * @example
   *
   * var object = _.create({ 'a': _.create({ 'b': 2 }) });
   *
   * _.hasIn(object, 'a');
   * // => true
   *
   * _.hasIn(object, 'a.b');
   * // => true
   *
   * _.hasIn(object, ['a', 'b']);
   * // => true
   *
   * _.hasIn(object, 'b');
   * // => false
   */

  function hasIn(object, path) {
    return object != null && _hasPath(object, path, _baseHasIn);
  }

  var hasIn_1 = hasIn;
  /** Used to compose bitmasks for value comparisons. */

  var COMPARE_PARTIAL_FLAG$5 = 1,
      COMPARE_UNORDERED_FLAG$3 = 2;
  /**
   * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
   *
   * @private
   * @param {string} path The path of the property to get.
   * @param {*} srcValue The value to match.
   * @returns {Function} Returns the new spec function.
   */

  function baseMatchesProperty(path, srcValue) {
    if (_isKey(path) && _isStrictComparable(srcValue)) {
      return _matchesStrictComparable(_toKey(path), srcValue);
    }

    return function (object) {
      var objValue = get_1(object, path);
      return objValue === undefined && objValue === srcValue ? hasIn_1(object, path) : _baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$5 | COMPARE_UNORDERED_FLAG$3);
    };
  }

  var _baseMatchesProperty = baseMatchesProperty;
  /**
   * This method returns the first argument it receives.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Util
   * @param {*} value Any value.
   * @returns {*} Returns `value`.
   * @example
   *
   * var object = { 'a': 1 };
   *
   * console.log(_.identity(object) === object);
   * // => true
   */

  function identity(value) {
    return value;
  }

  var identity_1 = identity;
  /**
   * The base implementation of `_.property` without support for deep paths.
   *
   * @private
   * @param {string} key The key of the property to get.
   * @returns {Function} Returns the new accessor function.
   */

  function baseProperty(key) {
    return function (object) {
      return object == null ? undefined : object[key];
    };
  }

  var _baseProperty = baseProperty;
  /**
   * A specialized version of `baseProperty` which supports deep paths.
   *
   * @private
   * @param {Array|string} path The path of the property to get.
   * @returns {Function} Returns the new accessor function.
   */

  function basePropertyDeep(path) {
    return function (object) {
      return _baseGet(object, path);
    };
  }

  var _basePropertyDeep = basePropertyDeep;
  /**
   * Creates a function that returns the value at `path` of a given object.
   *
   * @static
   * @memberOf _
   * @since 2.4.0
   * @category Util
   * @param {Array|string} path The path of the property to get.
   * @returns {Function} Returns the new accessor function.
   * @example
   *
   * var objects = [
   *   { 'a': { 'b': 2 } },
   *   { 'a': { 'b': 1 } }
   * ];
   *
   * _.map(objects, _.property('a.b'));
   * // => [2, 1]
   *
   * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
   * // => [1, 2]
   */

  function property(path) {
    return _isKey(path) ? _baseProperty(_toKey(path)) : _basePropertyDeep(path);
  }

  var property_1 = property;
  /**
   * The base implementation of `_.iteratee`.
   *
   * @private
   * @param {*} [value=_.identity] The value to convert to an iteratee.
   * @returns {Function} Returns the iteratee.
   */

  function baseIteratee(value) {
    // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
    // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
    if (typeof value == 'function') {
      return value;
    }

    if (value == null) {
      return identity_1;
    }

    if (_typeof(value) == 'object') {
      return isArray_1(value) ? _baseMatchesProperty(value[0], value[1]) : _baseMatches(value);
    }

    return property_1(value);
  }

  var _baseIteratee = baseIteratee;
  /**
   * Iterates over elements of `collection`, returning an array of all elements
   * `predicate` returns truthy for. The predicate is invoked with three
   * arguments: (value, index|key, collection).
   *
   * **Note:** Unlike `_.remove`, this method returns a new array.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Collection
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} [predicate=_.identity] The function invoked per iteration.
   * @returns {Array} Returns the new filtered array.
   * @see _.reject
   * @example
   *
   * var users = [
   *   { 'user': 'barney', 'age': 36, 'active': true },
   *   { 'user': 'fred',   'age': 40, 'active': false }
   * ];
   *
   * _.filter(users, function(o) { return !o.active; });
   * // => objects for ['fred']
   *
   * // The `_.matches` iteratee shorthand.
   * _.filter(users, { 'age': 36, 'active': true });
   * // => objects for ['barney']
   *
   * // The `_.matchesProperty` iteratee shorthand.
   * _.filter(users, ['active', false]);
   * // => objects for ['fred']
   *
   * // The `_.property` iteratee shorthand.
   * _.filter(users, 'active');
   * // => objects for ['barney']
   */

  function filter(collection, predicate) {
    var func = isArray_1(collection) ? _arrayFilter : _baseFilter;
    return func(collection, _baseIteratee(predicate));
  }

  var filter_1 = filter;
  /**
   * Gets the first element of `array`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @alias first
   * @category Array
   * @param {Array} array The array to query.
   * @returns {*} Returns the first element of `array`.
   * @example
   *
   * _.head([1, 2, 3]);
   * // => 1
   *
   * _.head([]);
   * // => undefined
   */

  function head(array) {
    return array && array.length ? array[0] : undefined;
  }

  var head_1 = head;
  /**
   * The base implementation of `_.findIndex` and `_.findLastIndex` without
   * support for iteratee shorthands.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {Function} predicate The function invoked per iteration.
   * @param {number} fromIndex The index to search from.
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */

  function baseFindIndex(array, predicate, fromIndex, fromRight) {
    var length = array.length,
        index = fromIndex + (fromRight ? 1 : -1);

    while (fromRight ? index-- : ++index < length) {
      if (predicate(array[index], index, array)) {
        return index;
      }
    }

    return -1;
  }

  var _baseFindIndex = baseFindIndex;
  /**
   * The base implementation of `_.isNaN` without support for number objects.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
   */

  function baseIsNaN(value) {
    return value !== value;
  }

  var _baseIsNaN = baseIsNaN;
  /**
   * A specialized version of `_.indexOf` which performs strict equality
   * comparisons of values, i.e. `===`.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {*} value The value to search for.
   * @param {number} fromIndex The index to search from.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */

  function strictIndexOf(array, value, fromIndex) {
    var index = fromIndex - 1,
        length = array.length;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }

    return -1;
  }

  var _strictIndexOf = strictIndexOf;
  /**
   * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {*} value The value to search for.
   * @param {number} fromIndex The index to search from.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */

  function baseIndexOf(array, value, fromIndex) {
    return value === value ? _strictIndexOf(array, value, fromIndex) : _baseFindIndex(array, _baseIsNaN, fromIndex);
  }

  var _baseIndexOf = baseIndexOf;
  /** `Object#toString` result references. */

  var stringTag$2 = '[object String]';
  /**
   * Checks if `value` is classified as a `String` primitive or object.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a string, else `false`.
   * @example
   *
   * _.isString('abc');
   * // => true
   *
   * _.isString(1);
   * // => false
   */

  function isString(value) {
    return typeof value == 'string' || !isArray_1(value) && isObjectLike_1(value) && _baseGetTag(value) == stringTag$2;
  }

  var isString_1 = isString;
  /** Used as references for various `Number` constants. */

  var NAN = 0 / 0;
  /** Used to match leading and trailing whitespace. */

  var reTrim = /^\s+|\s+$/g;
  /** Used to detect bad signed hexadecimal string values. */

  var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
  /** Used to detect binary string values. */

  var reIsBinary = /^0b[01]+$/i;
  /** Used to detect octal string values. */

  var reIsOctal = /^0o[0-7]+$/i;
  /** Built-in method references without a dependency on `root`. */

  var freeParseInt = parseInt;
  /**
   * Converts `value` to a number.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to process.
   * @returns {number} Returns the number.
   * @example
   *
   * _.toNumber(3.2);
   * // => 3.2
   *
   * _.toNumber(Number.MIN_VALUE);
   * // => 5e-324
   *
   * _.toNumber(Infinity);
   * // => Infinity
   *
   * _.toNumber('3.2');
   * // => 3.2
   */

  function toNumber(value) {
    if (typeof value == 'number') {
      return value;
    }

    if (isSymbol_1(value)) {
      return NAN;
    }

    if (isObject_1(value)) {
      var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
      value = isObject_1(other) ? other + '' : other;
    }

    if (typeof value != 'string') {
      return value === 0 ? value : +value;
    }

    value = value.replace(reTrim, '');
    var isBinary = reIsBinary.test(value);
    return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
  }

  var toNumber_1 = toNumber;
  /** Used as references for various `Number` constants. */

  var INFINITY$2 = 1 / 0,
      MAX_INTEGER = 1.7976931348623157e+308;
  /**
   * Converts `value` to a finite number.
   *
   * @static
   * @memberOf _
   * @since 4.12.0
   * @category Lang
   * @param {*} value The value to convert.
   * @returns {number} Returns the converted number.
   * @example
   *
   * _.toFinite(3.2);
   * // => 3.2
   *
   * _.toFinite(Number.MIN_VALUE);
   * // => 5e-324
   *
   * _.toFinite(Infinity);
   * // => 1.7976931348623157e+308
   *
   * _.toFinite('3.2');
   * // => 3.2
   */

  function toFinite(value) {
    if (!value) {
      return value === 0 ? value : 0;
    }

    value = toNumber_1(value);

    if (value === INFINITY$2 || value === -INFINITY$2) {
      var sign = value < 0 ? -1 : 1;
      return sign * MAX_INTEGER;
    }

    return value === value ? value : 0;
  }

  var toFinite_1 = toFinite;
  /**
   * Converts `value` to an integer.
   *
   * **Note:** This method is loosely based on
   * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to convert.
   * @returns {number} Returns the converted integer.
   * @example
   *
   * _.toInteger(3.2);
   * // => 3
   *
   * _.toInteger(Number.MIN_VALUE);
   * // => 0
   *
   * _.toInteger(Infinity);
   * // => 1.7976931348623157e+308
   *
   * _.toInteger('3.2');
   * // => 3
   */

  function toInteger(value) {
    var result = toFinite_1(value),
        remainder = result % 1;
    return result === result ? remainder ? result - remainder : result : 0;
  }

  var toInteger_1 = toInteger;
  /**
   * The base implementation of `_.values` and `_.valuesIn` which creates an
   * array of `object` property values corresponding to the property names
   * of `props`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Array} props The property names to get values for.
   * @returns {Object} Returns the array of property values.
   */

  function baseValues(object, props) {
    return _arrayMap(props, function (key) {
      return object[key];
    });
  }

  var _baseValues = baseValues;
  /**
   * Creates an array of the own enumerable string keyed property values of `object`.
   *
   * **Note:** Non-object values are coerced to objects.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property values.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.values(new Foo);
   * // => [1, 2] (iteration order is not guaranteed)
   *
   * _.values('hi');
   * // => ['h', 'i']
   */

  function values(object) {
    return object == null ? [] : _baseValues(object, keys_1(object));
  }

  var values_1 = values;
  /* Built-in method references for those with the same name as other `lodash` methods. */

  var nativeMax = Math.max;
  /**
   * Checks if `value` is in `collection`. If `collection` is a string, it's
   * checked for a substring of `value`, otherwise
   * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * is used for equality comparisons. If `fromIndex` is negative, it's used as
   * the offset from the end of `collection`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Collection
   * @param {Array|Object|string} collection The collection to inspect.
   * @param {*} value The value to search for.
   * @param {number} [fromIndex=0] The index to search from.
   * @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
   * @returns {boolean} Returns `true` if `value` is found, else `false`.
   * @example
   *
   * _.includes([1, 2, 3], 1);
   * // => true
   *
   * _.includes([1, 2, 3], 1, 2);
   * // => false
   *
   * _.includes({ 'a': 1, 'b': 2 }, 1);
   * // => true
   *
   * _.includes('abcd', 'bc');
   * // => true
   */

  function includes(collection, value, fromIndex, guard) {
    collection = isArrayLike_1(collection) ? collection : values_1(collection);
    fromIndex = fromIndex && !guard ? toInteger_1(fromIndex) : 0;
    var length = collection.length;

    if (fromIndex < 0) {
      fromIndex = nativeMax(length + fromIndex, 0);
    }

    return isString_1(collection) ? fromIndex <= length && collection.indexOf(value, fromIndex) > -1 : !!length && _baseIndexOf(collection, value, fromIndex) > -1;
  }

  var includes_1 = includes;
  /** Built-in value references. */

  var spreadableSymbol = _Symbol ? _Symbol.isConcatSpreadable : undefined;
  /**
   * Checks if `value` is a flattenable `arguments` object or array.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
   */

  function isFlattenable(value) {
    return isArray_1(value) || isArguments_1(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
  }

  var _isFlattenable = isFlattenable;
  /**
   * The base implementation of `_.flatten` with support for restricting flattening.
   *
   * @private
   * @param {Array} array The array to flatten.
   * @param {number} depth The maximum recursion depth.
   * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
   * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
   * @param {Array} [result=[]] The initial result value.
   * @returns {Array} Returns the new flattened array.
   */

  function baseFlatten(array, depth, predicate, isStrict, result) {
    var index = -1,
        length = array.length;
    predicate || (predicate = _isFlattenable);
    result || (result = []);

    while (++index < length) {
      var value = array[index];

      if (depth > 0 && predicate(value)) {
        if (depth > 1) {
          // Recursively flatten arrays (susceptible to call stack limits).
          baseFlatten(value, depth - 1, predicate, isStrict, result);
        } else {
          _arrayPush(result, value);
        }
      } else if (!isStrict) {
        result[result.length] = value;
      }
    }

    return result;
  }

  var _baseFlatten = baseFlatten;
  /**
   * The base implementation of `_.map` without support for iteratee shorthands.
   *
   * @private
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the new mapped array.
   */

  function baseMap(collection, iteratee) {
    var index = -1,
        result = isArrayLike_1(collection) ? Array(collection.length) : [];

    _baseEach(collection, function (value, key, collection) {
      result[++index] = iteratee(value, key, collection);
    });

    return result;
  }

  var _baseMap = baseMap;
  /**
   * The base implementation of `_.sortBy` which uses `comparer` to define the
   * sort order of `array` and replaces criteria objects with their corresponding
   * values.
   *
   * @private
   * @param {Array} array The array to sort.
   * @param {Function} comparer The function to define sort order.
   * @returns {Array} Returns `array`.
   */

  function baseSortBy(array, comparer) {
    var length = array.length;
    array.sort(comparer);

    while (length--) {
      array[length] = array[length].value;
    }

    return array;
  }

  var _baseSortBy = baseSortBy;
  /**
   * Compares values to sort them in ascending order.
   *
   * @private
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @returns {number} Returns the sort order indicator for `value`.
   */

  function compareAscending(value, other) {
    if (value !== other) {
      var valIsDefined = value !== undefined,
          valIsNull = value === null,
          valIsReflexive = value === value,
          valIsSymbol = isSymbol_1(value);
      var othIsDefined = other !== undefined,
          othIsNull = other === null,
          othIsReflexive = other === other,
          othIsSymbol = isSymbol_1(other);

      if (!othIsNull && !othIsSymbol && !valIsSymbol && value > other || valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol || valIsNull && othIsDefined && othIsReflexive || !valIsDefined && othIsReflexive || !valIsReflexive) {
        return 1;
      }

      if (!valIsNull && !valIsSymbol && !othIsSymbol && value < other || othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol || othIsNull && valIsDefined && valIsReflexive || !othIsDefined && valIsReflexive || !othIsReflexive) {
        return -1;
      }
    }

    return 0;
  }

  var _compareAscending = compareAscending;
  /**
   * Used by `_.orderBy` to compare multiple properties of a value to another
   * and stable sort them.
   *
   * If `orders` is unspecified, all values are sorted in ascending order. Otherwise,
   * specify an order of "desc" for descending or "asc" for ascending sort order
   * of corresponding values.
   *
   * @private
   * @param {Object} object The object to compare.
   * @param {Object} other The other object to compare.
   * @param {boolean[]|string[]} orders The order to sort by for each property.
   * @returns {number} Returns the sort order indicator for `object`.
   */

  function compareMultiple(object, other, orders) {
    var index = -1,
        objCriteria = object.criteria,
        othCriteria = other.criteria,
        length = objCriteria.length,
        ordersLength = orders.length;

    while (++index < length) {
      var result = _compareAscending(objCriteria[index], othCriteria[index]);

      if (result) {
        if (index >= ordersLength) {
          return result;
        }

        var order = orders[index];
        return result * (order == 'desc' ? -1 : 1);
      }
    } // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
    // that causes it, under certain circumstances, to provide the same value for
    // `object` and `other`. See https://github.com/jashkenas/underscore/pull/1247
    // for more details.
    //
    // This also ensures a stable sort in V8 and other engines.
    // See https://bugs.chromium.org/p/v8/issues/detail?id=90 for more details.


    return object.index - other.index;
  }

  var _compareMultiple = compareMultiple;
  /**
   * The base implementation of `_.orderBy` without param guards.
   *
   * @private
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function[]|Object[]|string[]} iteratees The iteratees to sort by.
   * @param {string[]} orders The sort orders of `iteratees`.
   * @returns {Array} Returns the new sorted array.
   */

  function baseOrderBy(collection, iteratees, orders) {
    var index = -1;
    iteratees = _arrayMap(iteratees.length ? iteratees : [identity_1], _baseUnary(_baseIteratee));

    var result = _baseMap(collection, function (value, key, collection) {
      var criteria = _arrayMap(iteratees, function (iteratee) {
        return iteratee(value);
      });

      return {
        'criteria': criteria,
        'index': ++index,
        'value': value
      };
    });

    return _baseSortBy(result, function (object, other) {
      return _compareMultiple(object, other, orders);
    });
  }

  var _baseOrderBy = baseOrderBy;
  /**
   * A faster alternative to `Function#apply`, this function invokes `func`
   * with the `this` binding of `thisArg` and the arguments of `args`.
   *
   * @private
   * @param {Function} func The function to invoke.
   * @param {*} thisArg The `this` binding of `func`.
   * @param {Array} args The arguments to invoke `func` with.
   * @returns {*} Returns the result of `func`.
   */

  function apply(func, thisArg, args) {
    switch (args.length) {
      case 0:
        return func.call(thisArg);

      case 1:
        return func.call(thisArg, args[0]);

      case 2:
        return func.call(thisArg, args[0], args[1]);

      case 3:
        return func.call(thisArg, args[0], args[1], args[2]);
    }

    return func.apply(thisArg, args);
  }

  var _apply = apply;
  /* Built-in method references for those with the same name as other `lodash` methods. */

  var nativeMax$1 = Math.max;
  /**
   * A specialized version of `baseRest` which transforms the rest array.
   *
   * @private
   * @param {Function} func The function to apply a rest parameter to.
   * @param {number} [start=func.length-1] The start position of the rest parameter.
   * @param {Function} transform The rest array transform.
   * @returns {Function} Returns the new function.
   */

  function overRest(func, start, transform) {
    start = nativeMax$1(start === undefined ? func.length - 1 : start, 0);
    return function () {
      var args = arguments,
          index = -1,
          length = nativeMax$1(args.length - start, 0),
          array = Array(length);

      while (++index < length) {
        array[index] = args[start + index];
      }

      index = -1;
      var otherArgs = Array(start + 1);

      while (++index < start) {
        otherArgs[index] = args[index];
      }

      otherArgs[start] = transform(array);
      return _apply(func, this, otherArgs);
    };
  }

  var _overRest = overRest;
  /**
   * Creates a function that returns `value`.
   *
   * @static
   * @memberOf _
   * @since 2.4.0
   * @category Util
   * @param {*} value The value to return from the new function.
   * @returns {Function} Returns the new constant function.
   * @example
   *
   * var objects = _.times(2, _.constant({ 'a': 1 }));
   *
   * console.log(objects);
   * // => [{ 'a': 1 }, { 'a': 1 }]
   *
   * console.log(objects[0] === objects[1]);
   * // => true
   */

  function constant(value) {
    return function () {
      return value;
    };
  }

  var constant_1 = constant;

  var defineProperty = function () {
    try {
      var func = _getNative(Object, 'defineProperty');

      func({}, '', {});
      return func;
    } catch (e) {}
  }();

  var _defineProperty$1 = defineProperty;
  /**
   * The base implementation of `setToString` without support for hot loop shorting.
   *
   * @private
   * @param {Function} func The function to modify.
   * @param {Function} string The `toString` result.
   * @returns {Function} Returns `func`.
   */

  var baseSetToString = !_defineProperty$1 ? identity_1 : function (func, string) {
    return _defineProperty$1(func, 'toString', {
      'configurable': true,
      'enumerable': false,
      'value': constant_1(string),
      'writable': true
    });
  };
  var _baseSetToString = baseSetToString;
  /** Used to detect hot functions by number of calls within a span of milliseconds. */

  var HOT_COUNT = 800,
      HOT_SPAN = 16;
  /* Built-in method references for those with the same name as other `lodash` methods. */

  var nativeNow = Date.now;
  /**
   * Creates a function that'll short out and invoke `identity` instead
   * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
   * milliseconds.
   *
   * @private
   * @param {Function} func The function to restrict.
   * @returns {Function} Returns the new shortable function.
   */

  function shortOut(func) {
    var count = 0,
        lastCalled = 0;
    return function () {
      var stamp = nativeNow(),
          remaining = HOT_SPAN - (stamp - lastCalled);
      lastCalled = stamp;

      if (remaining > 0) {
        if (++count >= HOT_COUNT) {
          return arguments[0];
        }
      } else {
        count = 0;
      }

      return func.apply(undefined, arguments);
    };
  }

  var _shortOut = shortOut;
  /**
   * Sets the `toString` method of `func` to return `string`.
   *
   * @private
   * @param {Function} func The function to modify.
   * @param {Function} string The `toString` result.
   * @returns {Function} Returns `func`.
   */

  var setToString = _shortOut(_baseSetToString);

  var _setToString = setToString;
  /**
   * The base implementation of `_.rest` which doesn't validate or coerce arguments.
   *
   * @private
   * @param {Function} func The function to apply a rest parameter to.
   * @param {number} [start=func.length-1] The start position of the rest parameter.
   * @returns {Function} Returns the new function.
   */

  function baseRest(func, start) {
    return _setToString(_overRest(func, start, identity_1), func + '');
  }

  var _baseRest = baseRest;
  /**
   * Checks if the given arguments are from an iteratee call.
   *
   * @private
   * @param {*} value The potential iteratee value argument.
   * @param {*} index The potential iteratee index or key argument.
   * @param {*} object The potential iteratee object argument.
   * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
   *  else `false`.
   */

  function isIterateeCall(value, index, object) {
    if (!isObject_1(object)) {
      return false;
    }

    var type = _typeof(index);

    if (type == 'number' ? isArrayLike_1(object) && _isIndex(index, object.length) : type == 'string' && index in object) {
      return eq_1(object[index], value);
    }

    return false;
  }

  var _isIterateeCall = isIterateeCall;
  /**
   * Creates an array of elements, sorted in ascending order by the results of
   * running each element in a collection thru each iteratee. This method
   * performs a stable sort, that is, it preserves the original sort order of
   * equal elements. The iteratees are invoked with one argument: (value).
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Collection
   * @param {Array|Object} collection The collection to iterate over.
   * @param {...(Function|Function[])} [iteratees=[_.identity]]
   *  The iteratees to sort by.
   * @returns {Array} Returns the new sorted array.
   * @example
   *
   * var users = [
   *   { 'user': 'fred',   'age': 48 },
   *   { 'user': 'barney', 'age': 36 },
   *   { 'user': 'fred',   'age': 40 },
   *   { 'user': 'barney', 'age': 34 }
   * ];
   *
   * _.sortBy(users, [function(o) { return o.user; }]);
   * // => objects for [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 40]]
   *
   * _.sortBy(users, ['user', 'age']);
   * // => objects for [['barney', 34], ['barney', 36], ['fred', 40], ['fred', 48]]
   */

  var sortBy = _baseRest(function (collection, iteratees) {
    if (collection == null) {
      return [];
    }

    var length = iteratees.length;

    if (length > 1 && _isIterateeCall(collection, iteratees[0], iteratees[1])) {
      iteratees = [];
    } else if (length > 2 && _isIterateeCall(iteratees[0], iteratees[1], iteratees[2])) {
      iteratees = [iteratees[0]];
    }

    return _baseOrderBy(collection, _baseFlatten(iteratees, 1), []);
  });

  var sortBy_1 = sortBy; // NOTE: this list must be up-to-date with browsers listed in
  // test/acceptance/useragentstrings.yml

  var BROWSER_ALIASES_MAP = {
    'Amazon Silk': 'amazon_silk',
    'Android Browser': 'android',
    Bada: 'bada',
    BlackBerry: 'blackberry',
    Chrome: 'chrome',
    Chromium: 'chromium',
    Electron: 'electron',
    Epiphany: 'epiphany',
    Firefox: 'firefox',
    Focus: 'focus',
    Generic: 'generic',
    'Google Search': 'google_search',
    Googlebot: 'googlebot',
    'Internet Explorer': 'ie',
    'K-Meleon': 'k_meleon',
    Maxthon: 'maxthon',
    'Microsoft Edge': 'edge',
    'MZ Browser': 'mz',
    'NAVER Whale Browser': 'naver',
    Opera: 'opera',
    'Opera Coast': 'opera_coast',
    PhantomJS: 'phantomjs',
    Puffin: 'puffin',
    QupZilla: 'qupzilla',
    QQ: 'qq',
    QQLite: 'qqlite',
    Safari: 'safari',
    Sailfish: 'sailfish',
    'Samsung Internet for Android': 'samsung_internet',
    SeaMonkey: 'seamonkey',
    Sleipnir: 'sleipnir',
    Swing: 'swing',
    Tizen: 'tizen',
    'UC Browser': 'uc',
    Vivaldi: 'vivaldi',
    'WebOS Browser': 'webos',
    WeChat: 'wechat',
    'Yandex Browser': 'yandex',
    Roku: 'roku'
  };
  var BROWSER_MAP = {
    amazon_silk: 'Amazon Silk',
    android: 'Android Browser',
    bada: 'Bada',
    blackberry: 'BlackBerry',
    chrome: 'Chrome',
    chromium: 'Chromium',
    electron: 'Electron',
    epiphany: 'Epiphany',
    firefox: 'Firefox',
    focus: 'Focus',
    generic: 'Generic',
    googlebot: 'Googlebot',
    google_search: 'Google Search',
    ie: 'Internet Explorer',
    k_meleon: 'K-Meleon',
    maxthon: 'Maxthon',
    edge: 'Microsoft Edge',
    mz: 'MZ Browser',
    naver: 'NAVER Whale Browser',
    opera: 'Opera',
    opera_coast: 'Opera Coast',
    phantomjs: 'PhantomJS',
    puffin: 'Puffin',
    qupzilla: 'QupZilla',
    qq: 'QQ Browser',
    qqlite: 'QQ Browser Lite',
    safari: 'Safari',
    sailfish: 'Sailfish',
    samsung_internet: 'Samsung Internet for Android',
    seamonkey: 'SeaMonkey',
    sleipnir: 'Sleipnir',
    swing: 'Swing',
    tizen: 'Tizen',
    uc: 'UC Browser',
    vivaldi: 'Vivaldi',
    webos: 'WebOS Browser',
    wechat: 'WeChat',
    yandex: 'Yandex Browser'
  };
  var PLATFORMS_MAP = {
    tablet: 'tablet',
    mobile: 'mobile',
    desktop: 'desktop',
    tv: 'tv'
  };
  var OS_MAP = {
    WindowsPhone: 'Windows Phone',
    Windows: 'Windows',
    MacOS: 'macOS',
    iOS: 'iOS',
    Android: 'Android',
    WebOS: 'WebOS',
    BlackBerry: 'BlackBerry',
    Bada: 'Bada',
    Tizen: 'Tizen',
    Linux: 'Linux',
    ChromeOS: 'Chrome OS',
    PlayStation4: 'PlayStation 4',
    Roku: 'Roku'
  };
  var ENGINE_MAP = {
    EdgeHTML: 'EdgeHTML',
    Blink: 'Blink',
    Trident: 'Trident',
    Presto: 'Presto',
    Gecko: 'Gecko',
    WebKit: 'WebKit'
  };

  var Utils = /*#__PURE__*/function () {
    function Utils() {
      _classCallCheck(this, Utils);
    }

    _createClass(Utils, null, [{
      key: "getFirstMatch",

      /**
       * Get first matched item for a string
       * @param {RegExp} regexp
       * @param {String} ua
       * @return {Array|{index: number, input: string}|*|boolean|string}
       */
      value: function getFirstMatch(regexp, ua) {
        var match = ua.match(regexp);
        return match && match.length > 0 && match[1] || '';
      }
      /**
       * Get second matched item for a string
       * @param regexp
       * @param {String} ua
       * @return {Array|{index: number, input: string}|*|boolean|string}
       */

    }, {
      key: "getSecondMatch",
      value: function getSecondMatch(regexp, ua) {
        var match = ua.match(regexp);
        return match && match.length > 1 && match[2] || '';
      }
      /**
       * Match a regexp and return a constant or undefined
       * @param {RegExp} regexp
       * @param {String} ua
       * @param {*} _const Any const that will be returned if regexp matches the string
       * @return {*}
       */

    }, {
      key: "matchAndReturnConst",
      value: function matchAndReturnConst(regexp, ua, _const) {
        if (regexp.test(ua)) {
          return _const;
        }

        return void 0;
      }
    }, {
      key: "getWindowsVersionName",
      value: function getWindowsVersionName(version) {
        switch (version) {
          case 'NT':
            return 'NT';

          case 'XP':
            return 'XP';

          case 'NT 5.0':
            return '2000';

          case 'NT 5.1':
            return 'XP';

          case 'NT 5.2':
            return '2003';

          case 'NT 6.0':
            return 'Vista';

          case 'NT 6.1':
            return '7';

          case 'NT 6.2':
            return '8';

          case 'NT 6.3':
            return '8.1';

          case 'NT 10.0':
            return '10';

          default:
            return undefined;
        }
      }
      /**
       * Get macOS version name
       *    10.5 - Leopard
       *    10.6 - Snow Leopard
       *    10.7 - Lion
       *    10.8 - Mountain Lion
       *    10.9 - Mavericks
       *    10.10 - Yosemite
       *    10.11 - El Capitan
       *    10.12 - Sierra
       *    10.13 - High Sierra
       *    10.14 - Mojave
       *    10.15 - Catalina
       *
       * @example
       *   getMacOSVersionName("10.14") // 'Mojave'
       *
       * @param  {string} version
       * @return {string} versionName
       */

    }, {
      key: "getMacOSVersionName",
      value: function getMacOSVersionName(version) {
        var v = version.split('.').splice(0, 2).map(function (s) {
          return parseInt(s, 10) || 0;
        });
        v.push(0);
        if (v[0] !== 10) return undefined;

        switch (v[1]) {
          case 5:
            return 'Leopard';

          case 6:
            return 'Snow Leopard';

          case 7:
            return 'Lion';

          case 8:
            return 'Mountain Lion';

          case 9:
            return 'Mavericks';

          case 10:
            return 'Yosemite';

          case 11:
            return 'El Capitan';

          case 12:
            return 'Sierra';

          case 13:
            return 'High Sierra';

          case 14:
            return 'Mojave';

          case 15:
            return 'Catalina';

          default:
            return undefined;
        }
      }
      /**
       * Get Android version name
       *    1.5 - Cupcake
       *    1.6 - Donut
       *    2.0 - Eclair
       *    2.1 - Eclair
       *    2.2 - Froyo
       *    2.x - Gingerbread
       *    3.x - Honeycomb
       *    4.0 - Ice Cream Sandwich
       *    4.1 - Jelly Bean
       *    4.4 - KitKat
       *    5.x - Lollipop
       *    6.x - Marshmallow
       *    7.x - Nougat
       *    8.x - Oreo
       *    9.x - Pie
       *
       * @example
       *   getAndroidVersionName("7.0") // 'Nougat'
       *
       * @param  {string} version
       * @return {string} versionName
       */

    }, {
      key: "getAndroidVersionName",
      value: function getAndroidVersionName(version) {
        var v = version.split('.').splice(0, 2).map(function (s) {
          return parseInt(s, 10) || 0;
        });
        v.push(0);
        if (v[0] === 1 && v[1] < 5) return undefined;
        if (v[0] === 1 && v[1] < 6) return 'Cupcake';
        if (v[0] === 1 && v[1] >= 6) return 'Donut';
        if (v[0] === 2 && v[1] < 2) return 'Eclair';
        if (v[0] === 2 && v[1] === 2) return 'Froyo';
        if (v[0] === 2 && v[1] > 2) return 'Gingerbread';
        if (v[0] === 3) return 'Honeycomb';
        if (v[0] === 4 && v[1] < 1) return 'Ice Cream Sandwich';
        if (v[0] === 4 && v[1] < 4) return 'Jelly Bean';
        if (v[0] === 4 && v[1] >= 4) return 'KitKat';
        if (v[0] === 5) return 'Lollipop';
        if (v[0] === 6) return 'Marshmallow';
        if (v[0] === 7) return 'Nougat';
        if (v[0] === 8) return 'Oreo';
        if (v[0] === 9) return 'Pie';
        return undefined;
      }
      /**
       * Get version precisions count
       *
       * @example
       *   getVersionPrecision("1.10.3") // 3
       *
       * @param  {string} version
       * @return {number}
       */

    }, {
      key: "getVersionPrecision",
      value: function getVersionPrecision(version) {
        return version.split('.').length;
      }
      /**
       * Calculate browser version weight
       *
       * @example
       *   compareVersions('1.10.2.1',  '1.8.2.1.90')    // 1
       *   compareVersions('1.010.2.1', '1.09.2.1.90');  // 1
       *   compareVersions('1.10.2.1',  '1.10.2.1');     // 0
       *   compareVersions('1.10.2.1',  '1.0800.2');     // -1
       *   compareVersions('1.10.2.1',  '1.10',  true);  // 0
       *
       * @param {String} versionA versions versions to compare
       * @param {String} versionB versions versions to compare
       * @param {boolean} [isLoose] enable loose comparison
       * @return {Number} comparison result: -1 when versionA is lower,
       * 1 when versionA is bigger, 0 when both equal
       */

      /* eslint consistent-return: 1 */

    }, {
      key: "compareVersions",
      value: function compareVersions(versionA, versionB) {
        var isLoose = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false; // 1) get common precision for both versions, for example for "10.0" and "9" it should be 2

        var versionAPrecision = Utils.getVersionPrecision(versionA);
        var versionBPrecision = Utils.getVersionPrecision(versionB);
        var precision = Math.max(versionAPrecision, versionBPrecision);
        var lastPrecision = 0;
        var chunks = Utils.map([versionA, versionB], function (version) {
          var delta = precision - Utils.getVersionPrecision(version); // 2) "9" -> "9.0" (for precision = 2)

          var _version = version + new Array(delta + 1).join('.0'); // 3) "9.0" -> ["000000000"", "000000009"]


          return Utils.map(_version.split('.'), function (chunk) {
            return new Array(20 - chunk.length).join('0') + chunk;
          }).reverse();
        }); // adjust precision for loose comparison

        if (isLoose) {
          lastPrecision = precision - Math.min(versionAPrecision, versionBPrecision);
        } // iterate in reverse order by reversed chunks array


        precision -= 1;

        while (precision >= lastPrecision) {
          // 4) compare: "000000009" > "000000010" = false (but "9" > "10" = true)
          if (chunks[0][precision] > chunks[1][precision]) {
            return 1;
          }

          if (chunks[0][precision] === chunks[1][precision]) {
            if (precision === lastPrecision) {
              // all version chunks are same
              return 0;
            }

            precision -= 1;
          } else if (chunks[0][precision] < chunks[1][precision]) {
            return -1;
          }
        }

        return undefined;
      }
      /**
       * Array::map polyfill
       *
       * @param  {Array} arr
       * @param  {Function} iterator
       * @return {Array}
       */

    }, {
      key: "map",
      value: function map(arr, iterator) {
        var result = [];
        var i;

        if (Array.prototype.map) {
          return Array.prototype.map.call(arr, iterator);
        }

        for (i = 0; i < arr.length; i += 1) {
          result.push(iterator(arr[i]));
        }

        return result;
      }
      /**
       * Array::find polyfill
       *
       * @param  {Array} arr
       * @param  {Function} predicate
       * @return {Array}
       */

    }, {
      key: "find",
      value: function find(arr, predicate) {
        var i;
        var l;

        if (Array.prototype.find) {
          return Array.prototype.find.call(arr, predicate);
        }

        for (i = 0, l = arr.length; i < l; i += 1) {
          var value = arr[i];

          if (predicate(value, i)) {
            return value;
          }
        }

        return undefined;
      }
      /**
       * Object::assign polyfill
       *
       * @param  {Object} obj
       * @param  {Object} ...objs
       * @return {Object}
       */

    }, {
      key: "assign",
      value: function assign(obj) {
        var result = obj;
        var i;
        var l;

        for (var _len = arguments.length, assigners = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          assigners[_key - 1] = arguments[_key];
        }

        if (Object.assign) {
          return Object.assign.apply(Object, [obj].concat(assigners));
        }

        var _loop = function _loop() {
          var assigner = assigners[i];

          if (_typeof(assigner) === 'object' && assigner !== null) {
            var keys = Object.keys(assigner);
            keys.forEach(function (key) {
              result[key] = assigner[key];
            });
          }
        };

        for (i = 0, l = assigners.length; i < l; i += 1) {
          _loop();
        }

        return obj;
      }
      /**
       * Get short version/alias for a browser name
       *
       * @example
       *   getBrowserAlias('Microsoft Edge') // edge
       *
       * @param  {string} browserName
       * @return {string}
       */

    }, {
      key: "getBrowserAlias",
      value: function getBrowserAlias(browserName) {
        return BROWSER_ALIASES_MAP[browserName];
      }
      /**
       * Get short version/alias for a browser name
       *
       * @example
       *   getBrowserAlias('edge') // Microsoft Edge
       *
       * @param  {string} browserAlias
       * @return {string}
       */

    }, {
      key: "getBrowserTypeByAlias",
      value: function getBrowserTypeByAlias(browserAlias) {
        return BROWSER_MAP[browserAlias] || '';
      }
    }]);

    return Utils;
  }();
  /**
   * Browsers' descriptors
   *
   * The idea of descriptors is simple. You should know about them two simple things:
   * 1. Every descriptor has a method or property called `test` and a `describe` method.
   * 2. Order of descriptors is important.
   *
   * More details:
   * 1. Method or property `test` serves as a way to detect whether the UA string
   * matches some certain browser or not. The `describe` method helps to make a result
   * object with params that show some browser-specific things: name, version, etc.
   * 2. Order of descriptors is important because a Parser goes through them one by one
   * in course. For example, if you insert Chrome's descriptor as the first one,
   * more then a half of browsers will be described as Chrome, because they will pass
   * the Chrome descriptor's test.
   *
   * Descriptor's `test` could be a property with an array of RegExps, where every RegExp
   * will be applied to a UA string to test it whether it matches or not.
   * If a descriptor has two or more regexps in the `test` array it tests them one by one
   * with a logical sum operation. Parser stops if it has found any RegExp that matches the UA.
   *
   * Or `test` could be a method. In that case it gets a Parser instance and should
   * return true/false to get the Parser know if this browser descriptor matches the UA or not.
   */


  var commonVersionIdentifier = /version\/(\d+(\.?_?\d+)+)/i;
  var browsersList = [
  /* Googlebot */
  {
    test: [/googlebot/i],
    describe: function describe(ua) {
      var browser = {
        name: 'Googlebot'
      };
      var version = Utils.getFirstMatch(/googlebot\/(\d+(\.\d+))/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  },
  /* Opera < 13.0 */
  {
    test: [/opera/i],
    describe: function describe(ua) {
      var browser = {
        name: 'Opera'
      };
      var version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:opera)[\s/](\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  },
  /* Opera > 13.0 */
  {
    test: [/opr\/|opios/i],
    describe: function describe(ua) {
      var browser = {
        name: 'Opera'
      };
      var version = Utils.getFirstMatch(/(?:opr|opios)[\s/](\S+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/SamsungBrowser/i],
    describe: function describe(ua) {
      var browser = {
        name: 'Samsung Internet for Android'
      };
      var version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:SamsungBrowser)[\s/](\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/Whale/i],
    describe: function describe(ua) {
      var browser = {
        name: 'NAVER Whale Browser'
      };
      var version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:whale)[\s/](\d+(?:\.\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/MZBrowser/i],
    describe: function describe(ua) {
      var browser = {
        name: 'MZ Browser'
      };
      var version = Utils.getFirstMatch(/(?:MZBrowser)[\s/](\d+(?:\.\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/focus/i],
    describe: function describe(ua) {
      var browser = {
        name: 'Focus'
      };
      var version = Utils.getFirstMatch(/(?:focus)[\s/](\d+(?:\.\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/swing/i],
    describe: function describe(ua) {
      var browser = {
        name: 'Swing'
      };
      var version = Utils.getFirstMatch(/(?:swing)[\s/](\d+(?:\.\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/coast/i],
    describe: function describe(ua) {
      var browser = {
        name: 'Opera Coast'
      };
      var version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:coast)[\s/](\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/opt\/\d+(?:.?_?\d+)+/i],
    describe: function describe(ua) {
      var browser = {
        name: 'Opera Touch'
      };
      var version = Utils.getFirstMatch(/(?:opt)[\s/](\d+(\.?_?\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/yabrowser/i],
    describe: function describe(ua) {
      var browser = {
        name: 'Yandex Browser'
      };
      var version = Utils.getFirstMatch(/(?:yabrowser)[\s/](\d+(\.?_?\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/ucbrowser/i],
    describe: function describe(ua) {
      var browser = {
        name: 'UC Browser'
      };
      var version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:ucbrowser)[\s/](\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/Maxthon|mxios/i],
    describe: function describe(ua) {
      var browser = {
        name: 'Maxthon'
      };
      var version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:Maxthon|mxios)[\s/](\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/epiphany/i],
    describe: function describe(ua) {
      var browser = {
        name: 'Epiphany'
      };
      var version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:epiphany)[\s/](\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/puffin/i],
    describe: function describe(ua) {
      var browser = {
        name: 'Puffin'
      };
      var version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:puffin)[\s/](\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/sleipnir/i],
    describe: function describe(ua) {
      var browser = {
        name: 'Sleipnir'
      };
      var version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:sleipnir)[\s/](\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/k-meleon/i],
    describe: function describe(ua) {
      var browser = {
        name: 'K-Meleon'
      };
      var version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:k-meleon)[\s/](\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/micromessenger/i],
    describe: function describe(ua) {
      var browser = {
        name: 'WeChat'
      };
      var version = Utils.getFirstMatch(/(?:micromessenger)[\s/](\d+(\.?_?\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/qqbrowser/i],
    describe: function describe(ua) {
      var browser = {
        name: /qqbrowserlite/i.test(ua) ? 'QQ Browser Lite' : 'QQ Browser'
      };
      var version = Utils.getFirstMatch(/(?:qqbrowserlite|qqbrowser)[/](\d+(\.?_?\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/msie|trident/i],
    describe: function describe(ua) {
      var browser = {
        name: 'Internet Explorer'
      };
      var version = Utils.getFirstMatch(/(?:msie |rv:)(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/\sedg\//i],
    describe: function describe(ua) {
      var browser = {
        name: 'Microsoft Edge'
      };
      var version = Utils.getFirstMatch(/\sedg\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/edg([ea]|ios)/i],
    describe: function describe(ua) {
      var browser = {
        name: 'Microsoft Edge'
      };
      var version = Utils.getSecondMatch(/edg([ea]|ios)\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/vivaldi/i],
    describe: function describe(ua) {
      var browser = {
        name: 'Vivaldi'
      };
      var version = Utils.getFirstMatch(/vivaldi\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/seamonkey/i],
    describe: function describe(ua) {
      var browser = {
        name: 'SeaMonkey'
      };
      var version = Utils.getFirstMatch(/seamonkey\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/sailfish/i],
    describe: function describe(ua) {
      var browser = {
        name: 'Sailfish'
      };
      var version = Utils.getFirstMatch(/sailfish\s?browser\/(\d+(\.\d+)?)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/silk/i],
    describe: function describe(ua) {
      var browser = {
        name: 'Amazon Silk'
      };
      var version = Utils.getFirstMatch(/silk\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/phantom/i],
    describe: function describe(ua) {
      var browser = {
        name: 'PhantomJS'
      };
      var version = Utils.getFirstMatch(/phantomjs\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/slimerjs/i],
    describe: function describe(ua) {
      var browser = {
        name: 'SlimerJS'
      };
      var version = Utils.getFirstMatch(/slimerjs\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/blackberry|\bbb\d+/i, /rim\stablet/i],
    describe: function describe(ua) {
      var browser = {
        name: 'BlackBerry'
      };
      var version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/blackberry[\d]+\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/(web|hpw)[o0]s/i],
    describe: function describe(ua) {
      var browser = {
        name: 'WebOS Browser'
      };
      var version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/w(?:eb)?[o0]sbrowser\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/bada/i],
    describe: function describe(ua) {
      var browser = {
        name: 'Bada'
      };
      var version = Utils.getFirstMatch(/dolfin\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/tizen/i],
    describe: function describe(ua) {
      var browser = {
        name: 'Tizen'
      };
      var version = Utils.getFirstMatch(/(?:tizen\s?)?browser\/(\d+(\.?_?\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/qupzilla/i],
    describe: function describe(ua) {
      var browser = {
        name: 'QupZilla'
      };
      var version = Utils.getFirstMatch(/(?:qupzilla)[\s/](\d+(\.?_?\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/firefox|iceweasel|fxios/i],
    describe: function describe(ua) {
      var browser = {
        name: 'Firefox'
      };
      var version = Utils.getFirstMatch(/(?:firefox|iceweasel|fxios)[\s/](\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/electron/i],
    describe: function describe(ua) {
      var browser = {
        name: 'Electron'
      };
      var version = Utils.getFirstMatch(/(?:electron)\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/MiuiBrowser/i],
    describe: function describe(ua) {
      var browser = {
        name: 'Miui'
      };
      var version = Utils.getFirstMatch(/(?:MiuiBrowser)[\s/](\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/chromium/i],
    describe: function describe(ua) {
      var browser = {
        name: 'Chromium'
      };
      var version = Utils.getFirstMatch(/(?:chromium)[\s/](\d+(\.?_?\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/chrome|crios|crmo/i],
    describe: function describe(ua) {
      var browser = {
        name: 'Chrome'
      };
      var version = Utils.getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  }, {
    test: [/GSA/i],
    describe: function describe(ua) {
      var browser = {
        name: 'Google Search'
      };
      var version = Utils.getFirstMatch(/(?:GSA)\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  },
  /* Android Browser */
  {
    test: function test(parser) {
      var notLikeAndroid = !parser.test(/like android/i);
      var butAndroid = parser.test(/android/i);
      return notLikeAndroid && butAndroid;
    },
    describe: function describe(ua) {
      var browser = {
        name: 'Android Browser'
      };
      var version = Utils.getFirstMatch(commonVersionIdentifier, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  },
  /* PlayStation 4 */
  {
    test: [/playstation 4/i],
    describe: function describe(ua) {
      var browser = {
        name: 'PlayStation 4'
      };
      var version = Utils.getFirstMatch(commonVersionIdentifier, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  },
  /* Safari */
  {
    test: [/safari|applewebkit/i],
    describe: function describe(ua) {
      var browser = {
        name: 'Safari'
      };
      var version = Utils.getFirstMatch(commonVersionIdentifier, ua);

      if (version) {
        browser.version = version;
      }

      return browser;
    }
  },
  /* Something else */
  {
    test: [/.*/i],
    describe: function describe(ua) {
      /* Here we try to make sure that there are explicit details about the device
       * in order to decide what regexp exactly we want to apply
       * (as there is a specific decision based on that conclusion)
       */
      var regexpWithoutDeviceSpec = /^(.*)\/(.*) /;
      var regexpWithDeviceSpec = /^(.*)\/(.*)[ \t]\((.*)/;
      var hasDeviceSpec = ua.search('\\(') !== -1;
      var regexp = hasDeviceSpec ? regexpWithDeviceSpec : regexpWithoutDeviceSpec;
      return {
        name: Utils.getFirstMatch(regexp, ua),
        version: Utils.getSecondMatch(regexp, ua)
      };
    }
  }];
  var osParsersList = [
  /* Roku */
  {
    test: [/Roku\/DVP/],
    describe: function describe(ua) {
      var version = Utils.getFirstMatch(/Roku\/DVP-(\d+\.\d+)/i, ua);
      return {
        name: OS_MAP.Roku,
        version: version
      };
    }
  },
  /* Windows Phone */
  {
    test: [/windows phone/i],
    describe: function describe(ua) {
      var version = Utils.getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i, ua);
      return {
        name: OS_MAP.WindowsPhone,
        version: version
      };
    }
  },
  /* Windows */
  {
    test: [/windows /i],
    describe: function describe(ua) {
      var version = Utils.getFirstMatch(/Windows ((NT|XP)( \d\d?.\d)?)/i, ua);
      var versionName = Utils.getWindowsVersionName(version);
      return {
        name: OS_MAP.Windows,
        version: version,
        versionName: versionName
      };
    }
  },
  /* Firefox on iPad */
  {
    test: [/Macintosh(.*?) FxiOS(.*?)\//],
    describe: function describe(ua) {
      var result = {
        name: OS_MAP.iOS
      };
      var version = Utils.getSecondMatch(/(Version\/)(\d[\d.]+)/, ua);

      if (version) {
        result.version = version;
      }

      return result;
    }
  },
  /* macOS */
  {
    test: [/macintosh/i],
    describe: function describe(ua) {
      var version = Utils.getFirstMatch(/mac os x (\d+(\.?_?\d+)+)/i, ua).replace(/[_\s]/g, '.');
      var versionName = Utils.getMacOSVersionName(version);
      var os = {
        name: OS_MAP.MacOS,
        version: version
      };

      if (versionName) {
        os.versionName = versionName;
      }

      return os;
    }
  },
  /* iOS */
  {
    test: [/(ipod|iphone|ipad)/i],
    describe: function describe(ua) {
      var version = Utils.getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i, ua).replace(/[_\s]/g, '.');
      return {
        name: OS_MAP.iOS,
        version: version
      };
    }
  },
  /* Android */
  {
    test: function test(parser) {
      var notLikeAndroid = !parser.test(/like android/i);
      var butAndroid = parser.test(/android/i);
      return notLikeAndroid && butAndroid;
    },
    describe: function describe(ua) {
      var version = Utils.getFirstMatch(/android[\s/-](\d+(\.\d+)*)/i, ua);
      var versionName = Utils.getAndroidVersionName(version);
      var os = {
        name: OS_MAP.Android,
        version: version
      };

      if (versionName) {
        os.versionName = versionName;
      }

      return os;
    }
  },
  /* WebOS */
  {
    test: [/(web|hpw)[o0]s/i],
    describe: function describe(ua) {
      var version = Utils.getFirstMatch(/(?:web|hpw)[o0]s\/(\d+(\.\d+)*)/i, ua);
      var os = {
        name: OS_MAP.WebOS
      };

      if (version && version.length) {
        os.version = version;
      }

      return os;
    }
  },
  /* BlackBerry */
  {
    test: [/blackberry|\bbb\d+/i, /rim\stablet/i],
    describe: function describe(ua) {
      var version = Utils.getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i, ua) || Utils.getFirstMatch(/blackberry\d+\/(\d+([_\s]\d+)*)/i, ua) || Utils.getFirstMatch(/\bbb(\d+)/i, ua);
      return {
        name: OS_MAP.BlackBerry,
        version: version
      };
    }
  },
  /* Bada */
  {
    test: [/bada/i],
    describe: function describe(ua) {
      var version = Utils.getFirstMatch(/bada\/(\d+(\.\d+)*)/i, ua);
      return {
        name: OS_MAP.Bada,
        version: version
      };
    }
  },
  /* Tizen */
  {
    test: [/tizen/i],
    describe: function describe(ua) {
      var version = Utils.getFirstMatch(/tizen[/\s](\d+(\.\d+)*)/i, ua);
      return {
        name: OS_MAP.Tizen,
        version: version
      };
    }
  },
  /* Linux */
  {
    test: [/linux/i],
    describe: function describe() {
      return {
        name: OS_MAP.Linux
      };
    }
  },
  /* Chrome OS */
  {
    test: [/CrOS/],
    describe: function describe() {
      return {
        name: OS_MAP.ChromeOS
      };
    }
  },
  /* Playstation 4 */
  {
    test: [/PlayStation 4/],
    describe: function describe(ua) {
      var version = Utils.getFirstMatch(/PlayStation 4[/\s](\d+(\.\d+)*)/i, ua);
      return {
        name: OS_MAP.PlayStation4,
        version: version
      };
    }
  }];
  /*
   * Tablets go first since usually they have more specific
   * signs to detect.
   */

  var platformParsersList = [
  /* Googlebot */
  {
    test: [/googlebot/i],
    describe: function describe() {
      return {
        type: 'bot',
        vendor: 'Google'
      };
    }
  },
  /* Huawei */
  {
    test: [/huawei/i],
    describe: function describe(ua) {
      var model = Utils.getFirstMatch(/(can-l01)/i, ua) && 'Nova';
      var platform = {
        type: PLATFORMS_MAP.mobile,
        vendor: 'Huawei'
      };

      if (model) {
        platform.model = model;
      }

      return platform;
    }
  },
  /* Nexus Tablet */
  {
    test: [/nexus\s*(?:7|8|9|10).*/i],
    describe: function describe() {
      return {
        type: PLATFORMS_MAP.tablet,
        vendor: 'Nexus'
      };
    }
  },
  /* iPad */
  {
    test: [/ipad/i],
    describe: function describe() {
      return {
        type: PLATFORMS_MAP.tablet,
        vendor: 'Apple',
        model: 'iPad'
      };
    }
  },
  /* Firefox on iPad */
  {
    test: [/Macintosh(.*?) FxiOS(.*?)\//],
    describe: function describe() {
      return {
        type: PLATFORMS_MAP.tablet,
        vendor: 'Apple',
        model: 'iPad'
      };
    }
  },
  /* Amazon Kindle Fire */
  {
    test: [/kftt build/i],
    describe: function describe() {
      return {
        type: PLATFORMS_MAP.tablet,
        vendor: 'Amazon',
        model: 'Kindle Fire HD 7'
      };
    }
  },
  /* Another Amazon Tablet with Silk */
  {
    test: [/silk/i],
    describe: function describe() {
      return {
        type: PLATFORMS_MAP.tablet,
        vendor: 'Amazon'
      };
    }
  },
  /* Tablet */
  {
    test: [/tablet(?! pc)/i],
    describe: function describe() {
      return {
        type: PLATFORMS_MAP.tablet
      };
    }
  },
  /* iPod/iPhone */
  {
    test: function test(parser) {
      var iDevice = parser.test(/ipod|iphone/i);
      var likeIDevice = parser.test(/like (ipod|iphone)/i);
      return iDevice && !likeIDevice;
    },
    describe: function describe(ua) {
      var model = Utils.getFirstMatch(/(ipod|iphone)/i, ua);
      return {
        type: PLATFORMS_MAP.mobile,
        vendor: 'Apple',
        model: model
      };
    }
  },
  /* Nexus Mobile */
  {
    test: [/nexus\s*[0-6].*/i, /galaxy nexus/i],
    describe: function describe() {
      return {
        type: PLATFORMS_MAP.mobile,
        vendor: 'Nexus'
      };
    }
  },
  /* Mobile */
  {
    test: [/[^-]mobi/i],
    describe: function describe() {
      return {
        type: PLATFORMS_MAP.mobile
      };
    }
  },
  /* BlackBerry */
  {
    test: function test(parser) {
      return parser.getBrowserName(true) === 'blackberry';
    },
    describe: function describe() {
      return {
        type: PLATFORMS_MAP.mobile,
        vendor: 'BlackBerry'
      };
    }
  },
  /* Bada */
  {
    test: function test(parser) {
      return parser.getBrowserName(true) === 'bada';
    },
    describe: function describe() {
      return {
        type: PLATFORMS_MAP.mobile
      };
    }
  },
  /* Windows Phone */
  {
    test: function test(parser) {
      return parser.getBrowserName() === 'windows phone';
    },
    describe: function describe() {
      return {
        type: PLATFORMS_MAP.mobile,
        vendor: 'Microsoft'
      };
    }
  },
  /* Android Tablet */
  {
    test: function test(parser) {
      var osMajorVersion = Number(String(parser.getOSVersion()).split('.')[0]);
      return parser.getOSName(true) === 'android' && osMajorVersion >= 3;
    },
    describe: function describe() {
      return {
        type: PLATFORMS_MAP.tablet
      };
    }
  },
  /* Android Mobile */
  {
    test: function test(parser) {
      return parser.getOSName(true) === 'android';
    },
    describe: function describe() {
      return {
        type: PLATFORMS_MAP.mobile
      };
    }
  },
  /* desktop */
  {
    test: function test(parser) {
      return parser.getOSName(true) === 'macos';
    },
    describe: function describe() {
      return {
        type: PLATFORMS_MAP.desktop,
        vendor: 'Apple'
      };
    }
  },
  /* Windows */
  {
    test: function test(parser) {
      return parser.getOSName(true) === 'windows';
    },
    describe: function describe() {
      return {
        type: PLATFORMS_MAP.desktop
      };
    }
  },
  /* Linux */
  {
    test: function test(parser) {
      return parser.getOSName(true) === 'linux';
    },
    describe: function describe() {
      return {
        type: PLATFORMS_MAP.desktop
      };
    }
  },
  /* PlayStation 4 */
  {
    test: function test(parser) {
      return parser.getOSName(true) === 'playstation 4';
    },
    describe: function describe() {
      return {
        type: PLATFORMS_MAP.tv
      };
    }
  },
  /* Roku */
  {
    test: function test(parser) {
      return parser.getOSName(true) === 'roku';
    },
    describe: function describe() {
      return {
        type: PLATFORMS_MAP.tv
      };
    }
  }];
  /*
   * More specific goes first
   */

  var enginesParsersList = [
  /* EdgeHTML */
  {
    test: function test(parser) {
      return parser.getBrowserName(true) === 'microsoft edge';
    },
    describe: function describe(ua) {
      var isBlinkBased = /\sedg\//i.test(ua); // return blink if it's blink-based one

      if (isBlinkBased) {
        return {
          name: ENGINE_MAP.Blink
        };
      } // otherwise match the version and return EdgeHTML


      var version = Utils.getFirstMatch(/edge\/(\d+(\.?_?\d+)+)/i, ua);
      return {
        name: ENGINE_MAP.EdgeHTML,
        version: version
      };
    }
  },
  /* Trident */
  {
    test: [/trident/i],
    describe: function describe(ua) {
      var engine = {
        name: ENGINE_MAP.Trident
      };
      var version = Utils.getFirstMatch(/trident\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        engine.version = version;
      }

      return engine;
    }
  },
  /* Presto */
  {
    test: function test(parser) {
      return parser.test(/presto/i);
    },
    describe: function describe(ua) {
      var engine = {
        name: ENGINE_MAP.Presto
      };
      var version = Utils.getFirstMatch(/presto\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        engine.version = version;
      }

      return engine;
    }
  },
  /* Gecko */
  {
    test: function test(parser) {
      var isGecko = parser.test(/gecko/i);
      var likeGecko = parser.test(/like gecko/i);
      return isGecko && !likeGecko;
    },
    describe: function describe(ua) {
      var engine = {
        name: ENGINE_MAP.Gecko
      };
      var version = Utils.getFirstMatch(/gecko\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        engine.version = version;
      }

      return engine;
    }
  },
  /* Blink */
  {
    test: [/(apple)?webkit\/537\.36/i],
    describe: function describe() {
      return {
        name: ENGINE_MAP.Blink
      };
    }
  },
  /* WebKit */
  {
    test: [/(apple)?webkit/i],
    describe: function describe(ua) {
      var engine = {
        name: ENGINE_MAP.WebKit
      };
      var version = Utils.getFirstMatch(/webkit\/(\d+(\.?_?\d+)+)/i, ua);

      if (version) {
        engine.version = version;
      }

      return engine;
    }
  }];
  /**
   * The main class that arranges the whole parsing process.
   */

  var Parser = /*#__PURE__*/function () {
    /**
     * Create instance of Parser
     *
     * @param {String} UA User-Agent string
     * @param {Boolean} [skipParsing=false] parser can skip parsing in purpose of performance
     * improvements if you need to make a more particular parsing
     * like {@link Parser#parseBrowser} or {@link Parser#parsePlatform}
     *
     * @throw {Error} in case of empty UA String
     *
     * @constructor
     */
    function Parser(UA) {
      var skipParsing = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      _classCallCheck(this, Parser);

      if (UA === void 0 || UA === null || UA === '') {
        throw new Error("UserAgent parameter can't be empty");
      }

      this._ua = UA;
      /**
       * @typedef ParsedResult
       * @property {Object} browser
       * @property {String|undefined} [browser.name]
       * Browser name, like `"Chrome"` or `"Internet Explorer"`
       * @property {String|undefined} [browser.version] Browser version as a String `"12.01.45334.10"`
       * @property {Object} os
       * @property {String|undefined} [os.name] OS name, like `"Windows"` or `"macOS"`
       * @property {String|undefined} [os.version] OS version, like `"NT 5.1"` or `"10.11.1"`
       * @property {String|undefined} [os.versionName] OS name, like `"XP"` or `"High Sierra"`
       * @property {Object} platform
       * @property {String|undefined} [platform.type]
       * platform type, can be either `"desktop"`, `"tablet"` or `"mobile"`
       * @property {String|undefined} [platform.vendor] Vendor of the device,
       * like `"Apple"` or `"Samsung"`
       * @property {String|undefined} [platform.model] Device model,
       * like `"iPhone"` or `"Kindle Fire HD 7"`
       * @property {Object} engine
       * @property {String|undefined} [engine.name]
       * Can be any of this: `WebKit`, `Blink`, `Gecko`, `Trident`, `Presto`, `EdgeHTML`
       * @property {String|undefined} [engine.version] String version of the engine
       */

      this.parsedResult = {};

      if (skipParsing !== true) {
        this.parse();
      }
    }
    /**
     * Get UserAgent string of current Parser instance
     * @return {String} User-Agent String of the current <Parser> object
     *
     * @public
     */


    _createClass(Parser, [{
      key: "getUA",
      value: function getUA() {
        return this._ua;
      }
      /**
       * Test a UA string for a regexp
       * @param {RegExp} regex
       * @return {Boolean}
       */

    }, {
      key: "test",
      value: function test(regex) {
        return regex.test(this._ua);
      }
      /**
       * Get parsed browser object
       * @return {Object}
       */

    }, {
      key: "parseBrowser",
      value: function parseBrowser() {
        var _this = this;

        this.parsedResult.browser = {};
        var browserDescriptor = Utils.find(browsersList, function (_browser) {
          if (typeof _browser.test === 'function') {
            return _browser.test(_this);
          }

          if (_browser.test instanceof Array) {
            return _browser.test.some(function (condition) {
              return _this.test(condition);
            });
          }

          throw new Error("Browser's test function is not valid");
        });

        if (browserDescriptor) {
          this.parsedResult.browser = browserDescriptor.describe(this.getUA());
        }

        return this.parsedResult.browser;
      }
      /**
       * Get parsed browser object
       * @return {Object}
       *
       * @public
       */

    }, {
      key: "getBrowser",
      value: function getBrowser() {
        if (this.parsedResult.browser) {
          return this.parsedResult.browser;
        }

        return this.parseBrowser();
      }
      /**
       * Get browser's name
       * @return {String} Browser's name or an empty string
       *
       * @public
       */

    }, {
      key: "getBrowserName",
      value: function getBrowserName(toLowerCase) {
        if (toLowerCase) {
          return String(this.getBrowser().name).toLowerCase() || '';
        }

        return this.getBrowser().name || '';
      }
      /**
       * Get browser's version
       * @return {String} version of browser
       *
       * @public
       */

    }, {
      key: "getBrowserVersion",
      value: function getBrowserVersion() {
        return this.getBrowser().version;
      }
      /**
       * Get OS
       * @return {Object}
       *
       * @example
       * this.getOS();
       * {
       *   name: 'macOS',
       *   version: '10.11.12'
       * }
       */

    }, {
      key: "getOS",
      value: function getOS() {
        if (this.parsedResult.os) {
          return this.parsedResult.os;
        }

        return this.parseOS();
      }
      /**
       * Parse OS and save it to this.parsedResult.os
       * @return {*|{}}
       */

    }, {
      key: "parseOS",
      value: function parseOS() {
        var _this2 = this;

        this.parsedResult.os = {};
        var os = Utils.find(osParsersList, function (_os) {
          if (typeof _os.test === 'function') {
            return _os.test(_this2);
          }

          if (_os.test instanceof Array) {
            return _os.test.some(function (condition) {
              return _this2.test(condition);
            });
          }

          throw new Error("Browser's test function is not valid");
        });

        if (os) {
          this.parsedResult.os = os.describe(this.getUA());
        }

        return this.parsedResult.os;
      }
      /**
       * Get OS name
       * @param {Boolean} [toLowerCase] return lower-cased value
       * @return {String} name of the OS — macOS, Windows, Linux, etc.
       */

    }, {
      key: "getOSName",
      value: function getOSName(toLowerCase) {
        var _this$getOS = this.getOS(),
            name = _this$getOS.name;

        if (toLowerCase) {
          return String(name).toLowerCase() || '';
        }

        return name || '';
      }
      /**
       * Get OS version
       * @return {String} full version with dots ('10.11.12', '5.6', etc)
       */

    }, {
      key: "getOSVersion",
      value: function getOSVersion() {
        return this.getOS().version;
      }
      /**
       * Get parsed platform
       * @return {{}}
       */

    }, {
      key: "getPlatform",
      value: function getPlatform() {
        if (this.parsedResult.platform) {
          return this.parsedResult.platform;
        }

        return this.parsePlatform();
      }
      /**
       * Get platform name
       * @param {Boolean} [toLowerCase=false]
       * @return {*}
       */

    }, {
      key: "getPlatformType",
      value: function getPlatformType() {
        var toLowerCase = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        var _this$getPlatform = this.getPlatform(),
            type = _this$getPlatform.type;

        if (toLowerCase) {
          return String(type).toLowerCase() || '';
        }

        return type || '';
      }
      /**
       * Get parsed platform
       * @return {{}}
       */

    }, {
      key: "parsePlatform",
      value: function parsePlatform() {
        var _this3 = this;

        this.parsedResult.platform = {};
        var platform = Utils.find(platformParsersList, function (_platform) {
          if (typeof _platform.test === 'function') {
            return _platform.test(_this3);
          }

          if (_platform.test instanceof Array) {
            return _platform.test.some(function (condition) {
              return _this3.test(condition);
            });
          }

          throw new Error("Browser's test function is not valid");
        });

        if (platform) {
          this.parsedResult.platform = platform.describe(this.getUA());
        }

        return this.parsedResult.platform;
      }
      /**
       * Get parsed engine
       * @return {{}}
       */

    }, {
      key: "getEngine",
      value: function getEngine() {
        if (this.parsedResult.engine) {
          return this.parsedResult.engine;
        }

        return this.parseEngine();
      }
      /**
       * Get engines's name
       * @return {String} Engines's name or an empty string
       *
       * @public
       */

    }, {
      key: "getEngineName",
      value: function getEngineName(toLowerCase) {
        if (toLowerCase) {
          return String(this.getEngine().name).toLowerCase() || '';
        }

        return this.getEngine().name || '';
      }
      /**
       * Get parsed platform
       * @return {{}}
       */

    }, {
      key: "parseEngine",
      value: function parseEngine() {
        var _this4 = this;

        this.parsedResult.engine = {};
        var engine = Utils.find(enginesParsersList, function (_engine) {
          if (typeof _engine.test === 'function') {
            return _engine.test(_this4);
          }

          if (_engine.test instanceof Array) {
            return _engine.test.some(function (condition) {
              return _this4.test(condition);
            });
          }

          throw new Error("Browser's test function is not valid");
        });

        if (engine) {
          this.parsedResult.engine = engine.describe(this.getUA());
        }

        return this.parsedResult.engine;
      }
      /**
       * Parse full information about the browser
       * @returns {Parser}
       */

    }, {
      key: "parse",
      value: function parse() {
        this.parseBrowser();
        this.parseOS();
        this.parsePlatform();
        this.parseEngine();
        return this;
      }
      /**
       * Get parsed result
       * @return {ParsedResult}
       */

    }, {
      key: "getResult",
      value: function getResult() {
        return Utils.assign({}, this.parsedResult);
      }
      /**
       * Check if parsed browser matches certain conditions
       *
       * @param {Object} checkTree It's one or two layered object,
       * which can include a platform or an OS on the first layer
       * and should have browsers specs on the bottom-laying layer
       *
       * @returns {Boolean|undefined} Whether the browser satisfies the set conditions or not.
       * Returns `undefined` when the browser is no described in the checkTree object.
       *
       * @example
       * const browser = Bowser.getParser(window.navigator.userAgent);
       * if (browser.satisfies({chrome: '>118.01.1322' }))
       * // or with os
       * if (browser.satisfies({windows: { chrome: '>118.01.1322' } }))
       * // or with platforms
       * if (browser.satisfies({desktop: { chrome: '>118.01.1322' } }))
       */

    }, {
      key: "satisfies",
      value: function satisfies(checkTree) {
        var _this5 = this;

        var platformsAndOSes = {};
        var platformsAndOSCounter = 0;
        var browsers = {};
        var browsersCounter = 0;
        var allDefinitions = Object.keys(checkTree);
        allDefinitions.forEach(function (key) {
          var currentDefinition = checkTree[key];

          if (typeof currentDefinition === 'string') {
            browsers[key] = currentDefinition;
            browsersCounter += 1;
          } else if (_typeof(currentDefinition) === 'object') {
            platformsAndOSes[key] = currentDefinition;
            platformsAndOSCounter += 1;
          }
        });

        if (platformsAndOSCounter > 0) {
          var platformsAndOSNames = Object.keys(platformsAndOSes);
          var OSMatchingDefinition = Utils.find(platformsAndOSNames, function (name) {
            return _this5.isOS(name);
          });

          if (OSMatchingDefinition) {
            var osResult = this.satisfies(platformsAndOSes[OSMatchingDefinition]);

            if (osResult !== void 0) {
              return osResult;
            }
          }

          var platformMatchingDefinition = Utils.find(platformsAndOSNames, function (name) {
            return _this5.isPlatform(name);
          });

          if (platformMatchingDefinition) {
            var platformResult = this.satisfies(platformsAndOSes[platformMatchingDefinition]);

            if (platformResult !== void 0) {
              return platformResult;
            }
          }
        }

        if (browsersCounter > 0) {
          var browserNames = Object.keys(browsers);
          var matchingDefinition = Utils.find(browserNames, function (name) {
            return _this5.isBrowser(name, true);
          });

          if (matchingDefinition !== void 0) {
            return this.compareVersion(browsers[matchingDefinition]);
          }
        }

        return undefined;
      }
      /**
       * Check if the browser name equals the passed string
       * @param browserName The string to compare with the browser name
       * @param [includingAlias=false] The flag showing whether alias will be included into comparison
       * @returns {boolean}
       */

    }, {
      key: "isBrowser",
      value: function isBrowser(browserName) {
        var includingAlias = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var defaultBrowserName = this.getBrowserName().toLowerCase();
        var browserNameLower = browserName.toLowerCase();
        var alias = Utils.getBrowserTypeByAlias(browserNameLower);

        if (includingAlias && alias) {
          browserNameLower = alias.toLowerCase();
        }

        return browserNameLower === defaultBrowserName;
      }
    }, {
      key: "compareVersion",
      value: function compareVersion(version) {
        var expectedResults = [0];
        var comparableVersion = version;
        var isLoose = false;
        var currentBrowserVersion = this.getBrowserVersion();

        if (typeof currentBrowserVersion !== 'string') {
          return void 0;
        }

        if (version[0] === '>' || version[0] === '<') {
          comparableVersion = version.substr(1);

          if (version[1] === '=') {
            isLoose = true;
            comparableVersion = version.substr(2);
          } else {
            expectedResults = [];
          }

          if (version[0] === '>') {
            expectedResults.push(1);
          } else {
            expectedResults.push(-1);
          }
        } else if (version[0] === '=') {
          comparableVersion = version.substr(1);
        } else if (version[0] === '~') {
          isLoose = true;
          comparableVersion = version.substr(1);
        }

        return expectedResults.indexOf(Utils.compareVersions(currentBrowserVersion, comparableVersion, isLoose)) > -1;
      }
    }, {
      key: "isOS",
      value: function isOS(osName) {
        return this.getOSName(true) === String(osName).toLowerCase();
      }
    }, {
      key: "isPlatform",
      value: function isPlatform(platformType) {
        return this.getPlatformType(true) === String(platformType).toLowerCase();
      }
    }, {
      key: "isEngine",
      value: function isEngine(engineName) {
        return this.getEngineName(true) === String(engineName).toLowerCase();
      }
      /**
       * Is anything? Check if the browser is called "anything",
       * the OS called "anything" or the platform called "anything"
       * @param {String} anything
       * @param [includingAlias=false] The flag showing whether alias will be included into comparison
       * @returns {Boolean}
       */

    }, {
      key: "is",
      value: function is(anything) {
        var includingAlias = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        return this.isBrowser(anything, includingAlias) || this.isOS(anything) || this.isPlatform(anything);
      }
      /**
       * Check if any of the given values satisfies this.is(anything)
       * @param {String[]} anythings
       * @returns {Boolean}
       */

    }, {
      key: "some",
      value: function some() {
        var _this6 = this;

        var anythings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        return anythings.some(function (anything) {
          return _this6.is(anything);
        });
      }
    }]);

    return Parser;
  }();
  /**
   * Bowser class.
   * Keep it simple as much as it can be.
   * It's supposed to work with collections of {@link Parser} instances
   * rather then solve one-instance problems.
   * All the one-instance stuff is located in Parser class.
   *
   * @class
   * @classdesc Bowser is a static object, that provides an API to the Parsers
   * @hideconstructor
   */


  var Bowser = /*#__PURE__*/function () {
    function Bowser() {
      _classCallCheck(this, Bowser);
    }

    _createClass(Bowser, null, [{
      key: "getParser",

      /**
       * Creates a {@link Parser} instance
       *
       * @param {String} UA UserAgent string
       * @param {Boolean} [skipParsing=false] Will make the Parser postpone parsing until you ask it
       * explicitly. Same as `skipParsing` for {@link Parser}.
       * @returns {Parser}
       * @throws {Error} when UA is not a String
       *
       * @example
       * const parser = Bowser.getParser(window.navigator.userAgent);
       * const result = parser.getResult();
       */
      value: function getParser(UA) {
        var skipParsing = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        if (typeof UA !== 'string') {
          throw new Error('UserAgent should be a string');
        }

        return new Parser(UA, skipParsing);
      }
      /**
       * Creates a {@link Parser} instance and runs {@link Parser.getResult} immediately
       *
       * @param UA
       * @return {ParsedResult}
       *
       * @example
       * const result = Bowser.parse(window.navigator.userAgent);
       */

    }, {
      key: "parse",
      value: function parse(UA) {
        return new Parser(UA).getResult();
      }
    }, {
      key: "BROWSER_MAP",
      get: function get() {
        return BROWSER_MAP;
      }
    }, {
      key: "ENGINE_MAP",
      get: function get() {
        return ENGINE_MAP;
      }
    }, {
      key: "OS_MAP",
      get: function get() {
        return OS_MAP;
      }
    }, {
      key: "PLATFORMS_MAP",
      get: function get() {
        return PLATFORMS_MAP;
      }
    }]);

    return Bowser;
  }();
  /**
   * The base implementation of `_.some` without support for iteratee shorthands.
   *
   * @private
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {boolean} Returns `true` if any element passes the predicate check,
   *  else `false`.
   */


  function baseSome(collection, predicate) {
    var result;

    _baseEach(collection, function (value, index, collection) {
      result = predicate(value, index, collection);
      return !result;
    });

    return !!result;
  }

  var _baseSome = baseSome;
  /**
   * Checks if `predicate` returns truthy for **any** element of `collection`.
   * Iteration is stopped once `predicate` returns truthy. The predicate is
   * invoked with three arguments: (value, index|key, collection).
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Collection
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} [predicate=_.identity] The function invoked per iteration.
   * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
   * @returns {boolean} Returns `true` if any element passes the predicate check,
   *  else `false`.
   * @example
   *
   * _.some([null, 0, 'yes', false], Boolean);
   * // => true
   *
   * var users = [
   *   { 'user': 'barney', 'active': true },
   *   { 'user': 'fred',   'active': false }
   * ];
   *
   * // The `_.matches` iteratee shorthand.
   * _.some(users, { 'user': 'barney', 'active': false });
   * // => false
   *
   * // The `_.matchesProperty` iteratee shorthand.
   * _.some(users, ['active', false]);
   * // => true
   *
   * // The `_.property` iteratee shorthand.
   * _.some(users, 'active');
   * // => true
   */

  function some(collection, predicate, guard) {
    var func = isArray_1(collection) ? _arraySome : _baseSome;

    if (guard && _isIterateeCall(collection, predicate, guard)) {
      predicate = undefined;
    }

    return func(collection, _baseIteratee(predicate));
  }

  var some_1 = some;
  /**
   * The base implementation of `_.slice` without an iteratee call guard.
   *
   * @private
   * @param {Array} array The array to slice.
   * @param {number} [start=0] The start position.
   * @param {number} [end=array.length] The end position.
   * @returns {Array} Returns the slice of `array`.
   */

  function baseSlice(array, start, end) {
    var index = -1,
        length = array.length;

    if (start < 0) {
      start = -start > length ? 0 : length + start;
    }

    end = end > length ? length : end;

    if (end < 0) {
      end += length;
    }

    length = start > end ? 0 : end - start >>> 0;
    start >>>= 0;
    var result = Array(length);

    while (++index < length) {
      result[index] = array[index + start];
    }

    return result;
  }

  var _baseSlice = baseSlice;
  /**
   * Casts `array` to a slice if it's needed.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {number} start The start position.
   * @param {number} [end=array.length] The end position.
   * @returns {Array} Returns the cast slice.
   */

  function castSlice(array, start, end) {
    var length = array.length;
    end = end === undefined ? length : end;
    return !start && end >= length ? array : _baseSlice(array, start, end);
  }

  var _castSlice = castSlice;
  /** Used to compose unicode character classes. */

  var rsAstralRange = "\\ud800-\\udfff",
      rsComboMarksRange = "\\u0300-\\u036f",
      reComboHalfMarksRange = "\\ufe20-\\ufe2f",
      rsComboSymbolsRange = "\\u20d0-\\u20ff",
      rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
      rsVarRange = "\\ufe0e\\ufe0f";
  /** Used to compose unicode capture groups. */

  var rsZWJ = "\\u200d";
  /** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */

  var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange + rsComboRange + rsVarRange + ']');
  /**
   * Checks if `string` contains Unicode symbols.
   *
   * @private
   * @param {string} string The string to inspect.
   * @returns {boolean} Returns `true` if a symbol is found, else `false`.
   */

  function hasUnicode(string) {
    return reHasUnicode.test(string);
  }

  var _hasUnicode = hasUnicode;
  /** `Object#toString` result references. */

  var regexpTag$2 = '[object RegExp]';
  /**
   * The base implementation of `_.isRegExp` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a regexp, else `false`.
   */

  function baseIsRegExp(value) {
    return isObjectLike_1(value) && _baseGetTag(value) == regexpTag$2;
  }

  var _baseIsRegExp = baseIsRegExp;
  /* Node.js helper references. */

  var nodeIsRegExp = _nodeUtil && _nodeUtil.isRegExp;
  /**
   * Checks if `value` is classified as a `RegExp` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a regexp, else `false`.
   * @example
   *
   * _.isRegExp(/abc/);
   * // => true
   *
   * _.isRegExp('/abc/');
   * // => false
   */

  var isRegExp = nodeIsRegExp ? _baseUnary(nodeIsRegExp) : _baseIsRegExp;
  var isRegExp_1 = isRegExp;
  /**
   * Gets the size of an ASCII `string`.
   *
   * @private
   * @param {string} string The string inspect.
   * @returns {number} Returns the string size.
   */

  var asciiSize = _baseProperty('length');

  var _asciiSize = asciiSize;
  /** Used to compose unicode character classes. */

  var rsAstralRange$1 = "\\ud800-\\udfff",
      rsComboMarksRange$1 = "\\u0300-\\u036f",
      reComboHalfMarksRange$1 = "\\ufe20-\\ufe2f",
      rsComboSymbolsRange$1 = "\\u20d0-\\u20ff",
      rsComboRange$1 = rsComboMarksRange$1 + reComboHalfMarksRange$1 + rsComboSymbolsRange$1,
      rsVarRange$1 = "\\ufe0e\\ufe0f";
  /** Used to compose unicode capture groups. */

  var rsAstral = '[' + rsAstralRange$1 + ']',
      rsCombo = '[' + rsComboRange$1 + ']',
      rsFitz = "\\ud83c[\\udffb-\\udfff]",
      rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
      rsNonAstral = '[^' + rsAstralRange$1 + ']',
      rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}",
      rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]",
      rsZWJ$1 = "\\u200d";
  /** Used to compose unicode regexes. */

  var reOptMod = rsModifier + '?',
      rsOptVar = '[' + rsVarRange$1 + ']?',
      rsOptJoin = '(?:' + rsZWJ$1 + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
      rsSeq = rsOptVar + reOptMod + rsOptJoin,
      rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';
  /** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */

  var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');
  /**
   * Gets the size of a Unicode `string`.
   *
   * @private
   * @param {string} string The string inspect.
   * @returns {number} Returns the string size.
   */

  function unicodeSize(string) {
    var result = reUnicode.lastIndex = 0;

    while (reUnicode.test(string)) {
      ++result;
    }

    return result;
  }

  var _unicodeSize = unicodeSize;
  /**
   * Gets the number of symbols in `string`.
   *
   * @private
   * @param {string} string The string to inspect.
   * @returns {number} Returns the string size.
   */

  function stringSize(string) {
    return _hasUnicode(string) ? _unicodeSize(string) : _asciiSize(string);
  }

  var _stringSize = stringSize;
  /**
   * Converts an ASCII `string` to an array.
   *
   * @private
   * @param {string} string The string to convert.
   * @returns {Array} Returns the converted array.
   */

  function asciiToArray(string) {
    return string.split('');
  }

  var _asciiToArray = asciiToArray;
  /** Used to compose unicode character classes. */

  var rsAstralRange$2 = "\\ud800-\\udfff",
      rsComboMarksRange$2 = "\\u0300-\\u036f",
      reComboHalfMarksRange$2 = "\\ufe20-\\ufe2f",
      rsComboSymbolsRange$2 = "\\u20d0-\\u20ff",
      rsComboRange$2 = rsComboMarksRange$2 + reComboHalfMarksRange$2 + rsComboSymbolsRange$2,
      rsVarRange$2 = "\\ufe0e\\ufe0f";
  /** Used to compose unicode capture groups. */

  var rsAstral$1 = '[' + rsAstralRange$2 + ']',
      rsCombo$1 = '[' + rsComboRange$2 + ']',
      rsFitz$1 = "\\ud83c[\\udffb-\\udfff]",
      rsModifier$1 = '(?:' + rsCombo$1 + '|' + rsFitz$1 + ')',
      rsNonAstral$1 = '[^' + rsAstralRange$2 + ']',
      rsRegional$1 = "(?:\\ud83c[\\udde6-\\uddff]){2}",
      rsSurrPair$1 = "[\\ud800-\\udbff][\\udc00-\\udfff]",
      rsZWJ$2 = "\\u200d";
  /** Used to compose unicode regexes. */

  var reOptMod$1 = rsModifier$1 + '?',
      rsOptVar$1 = '[' + rsVarRange$2 + ']?',
      rsOptJoin$1 = '(?:' + rsZWJ$2 + '(?:' + [rsNonAstral$1, rsRegional$1, rsSurrPair$1].join('|') + ')' + rsOptVar$1 + reOptMod$1 + ')*',
      rsSeq$1 = rsOptVar$1 + reOptMod$1 + rsOptJoin$1,
      rsSymbol$1 = '(?:' + [rsNonAstral$1 + rsCombo$1 + '?', rsCombo$1, rsRegional$1, rsSurrPair$1, rsAstral$1].join('|') + ')';
  /** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */

  var reUnicode$1 = RegExp(rsFitz$1 + '(?=' + rsFitz$1 + ')|' + rsSymbol$1 + rsSeq$1, 'g');
  /**
   * Converts a Unicode `string` to an array.
   *
   * @private
   * @param {string} string The string to convert.
   * @returns {Array} Returns the converted array.
   */

  function unicodeToArray(string) {
    return string.match(reUnicode$1) || [];
  }

  var _unicodeToArray = unicodeToArray;
  /**
   * Converts `string` to an array.
   *
   * @private
   * @param {string} string The string to convert.
   * @returns {Array} Returns the converted array.
   */

  function stringToArray(string) {
    return _hasUnicode(string) ? _unicodeToArray(string) : _asciiToArray(string);
  }

  var _stringToArray = stringToArray;
  /** Used as default options for `_.truncate`. */

  var DEFAULT_TRUNC_LENGTH = 30,
      DEFAULT_TRUNC_OMISSION = '...';
  /** Used to match `RegExp` flags from their coerced string values. */

  var reFlags = /\w*$/;
  /**
   * Truncates `string` if it's longer than the given maximum string length.
   * The last characters of the truncated string are replaced with the omission
   * string which defaults to "...".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category String
   * @param {string} [string=''] The string to truncate.
   * @param {Object} [options={}] The options object.
   * @param {number} [options.length=30] The maximum string length.
   * @param {string} [options.omission='...'] The string to indicate text is omitted.
   * @param {RegExp|string} [options.separator] The separator pattern to truncate to.
   * @returns {string} Returns the truncated string.
   * @example
   *
   * _.truncate('hi-diddly-ho there, neighborino');
   * // => 'hi-diddly-ho there, neighbo...'
   *
   * _.truncate('hi-diddly-ho there, neighborino', {
   *   'length': 24,
   *   'separator': ' '
   * });
   * // => 'hi-diddly-ho there,...'
   *
   * _.truncate('hi-diddly-ho there, neighborino', {
   *   'length': 24,
   *   'separator': /,? +/
   * });
   * // => 'hi-diddly-ho there...'
   *
   * _.truncate('hi-diddly-ho there, neighborino', {
   *   'omission': ' [...]'
   * });
   * // => 'hi-diddly-ho there, neig [...]'
   */

  function truncate(string, options) {
    var length = DEFAULT_TRUNC_LENGTH,
        omission = DEFAULT_TRUNC_OMISSION;

    if (isObject_1(options)) {
      var separator = 'separator' in options ? options.separator : separator;
      length = 'length' in options ? toInteger_1(options.length) : length;
      omission = 'omission' in options ? _baseToString(options.omission) : omission;
    }

    string = toString_1(string);
    var strLength = string.length;

    if (_hasUnicode(string)) {
      var strSymbols = _stringToArray(string);

      strLength = strSymbols.length;
    }

    if (length >= strLength) {
      return string;
    }

    var end = length - _stringSize(omission);

    if (end < 1) {
      return omission;
    }

    var result = strSymbols ? _castSlice(strSymbols, 0, end).join('') : string.slice(0, end);

    if (separator === undefined) {
      return result + omission;
    }

    if (strSymbols) {
      end += result.length - end;
    }

    if (isRegExp_1(separator)) {
      if (string.slice(end).search(separator)) {
        var match,
            substring = result;

        if (!separator.global) {
          separator = RegExp(separator.source, toString_1(reFlags.exec(separator)) + 'g');
        }

        separator.lastIndex = 0;

        while (match = separator.exec(substring)) {
          var newEnd = match.index;
        }

        result = result.slice(0, newEnd === undefined ? end : newEnd);
      }
    } else if (string.indexOf(_baseToString(separator), end) != end) {
      var index = result.lastIndexOf(separator);

      if (index > -1) {
        result = result.slice(0, index);
      }
    }

    return result + omission;
  }

  var truncate_1 = truncate;
  var CITY_HOTEL = 'CityHotel';
  var COUPON = 'Coupon';
  var HOTEL = 'Hotel';
  var PRODUCT = 'Product';
  var SIMILAR_HOTEL = 'Similarhotel';
  var SIMILAR_PRODUCT = 'Similar';
  var SPECIAL_COUPON = 'SpecialCoupon';
  var billigerCatalog = ['imdb', 'hcgame', 'youtube', 'wiki', 'pinterest'];

  function getIsCatalog(products) {
    return some_1(products, function (item) {
      return includes_1(billigerCatalog, item.catalog);
    });
  }

  function calculateRatingPercent(rating) {
    return Math.round(parseFloat(rating) / 5 * 100);
  }

  function filterByCategory(offers, category) {
    return filter_1(offers, function (item) {
      return item.category === category;
    });
  }

  function containsCategory(products, category) {
    return some_1(products, function (item) {
      return item.category === category;
    });
  }

  var orderedCategories = [PRODUCT, SIMILAR_PRODUCT, COUPON, SPECIAL_COUPON, HOTEL, SIMILAR_HOTEL, CITY_HOTEL];

  function getCategories(offers) {
    return orderedCategories.filter(function (category) {
      return containsCategory(offers, category);
    });
  } // @todo Refactor and cover with tests


  function getCategoriesToShow(offers, showCoupons, showSimilar, showHotel, showSimilarHotel) {
    var categories = getCategories(offers);
    var isCatalog = getIsCatalog(offers);

    if (includes_1(categories, COUPON)) {
      if (showCoupons) {
        return [COUPON];
      }

      if (includes_1(categories, PRODUCT)) {
        return [PRODUCT];
      }

      if (includes_1(categories, SIMILAR_PRODUCT)) {
        return [SIMILAR_PRODUCT];
      }
    }

    if (categories[0] === PRODUCT && categories[1] === SIMILAR_PRODUCT) {
      if (showSimilar) {
        categories = [SIMILAR_PRODUCT];
      } else {
        categories = [PRODUCT, SIMILAR_PRODUCT];
      }
    } else if (includes_1(categories, HOTEL)) {
      if (showSimilarHotel) {
        return [SIMILAR_HOTEL];
      }

      if (showHotel) {
        return [HOTEL];
      }
    }

    if (isCatalog && !includes_1(categories, SIMILAR_PRODUCT)) {
      categories.push(SIMILAR_PRODUCT);
    }

    return categories;
  }

  function isFavoriteShop(_ref) {
    var _ref$av_fav_shop = _ref.av_fav_shop,
        av_fav_shop = _ref$av_fav_shop === void 0 ? null : _ref$av_fav_shop; // eslint-disable-next-line camelcase

    return !!av_fav_shop; // Return always boolean value
  }

  function hasSearchTerm(_ref2) {
    var searchTerm = _ref2.searchTerm; // eslint-disable-next-line camelcase

    return !!searchTerm;
  }

  function truncateSearchTerm(_ref3) {
    var searchTerm = _ref3.searchTerm;

    if (!isString_1(searchTerm)) {
      return '';
    }

    return truncate_1(searchTerm, {
      length: 16,
      separator: ' '
    });
  }

  function isSimilarHotel(_ref) {
    var _ref$category = _ref.category,
        category = _ref$category === void 0 ? '' : _ref$category;
    return category === SIMILAR_HOTEL;
  }

  function containsSimilarHotels(offers) {
    return offers.some(isSimilarHotel);
  }

  function isHotel(_ref2) {
    var _ref2$category = _ref2.category,
        category = _ref2$category === void 0 ? '' : _ref2$category;
    return category === HOTEL;
  }

  function containsHotels(offers) {
    return offers.some(isHotel);
  }

  function isCityHotel(_ref3) {
    var _ref3$category = _ref3.category,
        category = _ref3$category === void 0 ? '' : _ref3$category;
    return category === CITY_HOTEL;
  }

  function containsCityHotels(offers) {
    return offers.some(isCityHotel);
  }

  function isAnyHotel(offer) {
    return isHotel(offer) || isSimilarHotel(offer) || isCityHotel(offer);
  }

  function isSpecialCoupon(_ref) {
    var _ref$category = _ref.category,
        category = _ref$category === void 0 ? '' : _ref$category;
    return category === SPECIAL_COUPON;
  }

  function isCoupon(_ref2) {
    var _ref2$category = _ref2.category,
        category = _ref2$category === void 0 ? '' : _ref2$category;
    return category === COUPON;
  }

  function isProduct(_ref3) {
    var _ref3$category = _ref3.category,
        category = _ref3$category === void 0 ? '' : _ref3$category;
    return category === PRODUCT;
  }

  function containsCoupons(offers) {
    return offers.some(isCoupon);
  }

  function containsProducts(offers) {
    return offers.some(isProduct);
  }

  function couponSpecialValue(product) {
    return product.value.toLowerCase() === 'special';
  }
  /* eslint-disable camelcase */


  function hasCouponCode(_ref4) {
    var code = _ref4.code,
        coupon_code = _ref4.coupon_code;

    if (code && code !== '') {
      return true;
    }
    /* eslint-disable camelcase */


    return coupon_code && coupon_code !== '';
  }

  function isSimilar(_ref) {
    var _ref$category = _ref.category,
        category = _ref$category === void 0 ? '' : _ref$category;
    return category === SIMILAR_PRODUCT;
  }

  function containsSimilarProducts(offers) {
    return offers.some(isSimilar);
  }

  function isDarkTheme(_ref) {
    var _ref$meta = _ref.meta,
        meta = _ref$meta === void 0 ? {} : _ref$meta;
    return meta.theme === 'theme_dark';
  }
  /* eslint-disable no-restricted-globals */


  var browserVal = Bowser.getParser(window.navigator.userAgent);
  var isFirefox = browserVal.getBrowserName() === 'Firefox';

  function getLocalStorage() {
    if (isFirefox) {
      return browser;
    }

    return chrome;
  }

  function getLocalStorageValue(key) {
    return new Promise(function (resolve, reject) {
      try {
        var localStorageVar = getLocalStorage();
        localStorageVar.storage.local.get(key, function getLcStorage(value) {
          if (localStorageVar.runtime.error) {
            reject(localStorageVar.runtime.error);
          } else {
            resolve(value);
          }
        });
      } catch (ex) {
        reject(ex);
      }
    });
  }

  function setLocalStorageValue(data) {
    return new Promise(function (resolve, reject) {
      try {
        var localStorageVar = getLocalStorage();
        localStorageVar.storage.local.set(data, function setLcStorage() {
          if (localStorageVar.runtime.error) {
            reject(localStorageVar.runtime.error);
          } else {
            resolve('Data saved');
          }
        });
      } catch (ex) {
        reject(ex);
      }
    });
  }

  function getWishlist() {
    return new Promise(function (resolve, reject) {
      try {
        getLocalStorageValue('wishlist').then(function (result) {
          resolve(result.wishlist);
        });
      } catch (ex) {
        reject(ex);
      }
    });
  }

  function saveWishlist(data) {
    setLocalStorageValue({
      wishlist: data
    }).then(function (result) {
      console.log("wishlist saved ".concat(result)); // eslint-disable-line no-console
    });
  }

  function stockCheck(product) {
    return product.availability_code;
  }

  var common = {
    notification: {},
    listing: {},
    ftu: {},
    view: {},
    wishlist: {},
    wishlistmodal: {},
    external: {}
  };

  function hideWishlistBasedOnABSver() {
    var browserVal = Bowser.getParser(window.navigator.userAgent);
    var isFirefox = browserVal.getBrowserName() === 'Firefox';

    function getLocalStorage() {
      if (isFirefox) {
        return browser;
      }

      return chrome;
    }

    var localStorageVar = getLocalStorage();
    var absBuldVer = localStorageVar.runtime.getManifest().version;

    if (absBuldVer < '3.1.0') {
      $('.ftu-wishlist-trigger').addClass('hidden');
    } else {
      $('.ftu-wishlist-trigger').removeClass('hidden');
    }
  }

  var addedWishlist = false;
  var currentWishlistProducts = 0;

  common.notification.afterRender = function afterRender() {
    var _this = this;

    hideWishlistBasedOnABSver();
    setTimeout(function checkwsh() {
      getWishlist().then(function (result) {
        return result === undefined ? [] : result;
      }).then(function (result) {
        if (result.length > 0) {
          currentWishlistProducts = result.length;
          document.getElementById('wishlist-counter-p').innerHTML = currentWishlistProducts;
          $('.wishlist-added-bubble').removeClass('hidden');
        } else {
          $('.wishlist-added-bubble').addClass('hidden');
        }
      });
    }, 80);

    if (addedWishlist) {
      $('.wishlist-added-bubble').removeClass('hidden');
      $('.wishlist-added-tooltip').removeClass('hidden');
      setTimeout(function productAddedToWishlsitTooltip() {
        addedWishlist = false;
        $('.wishlist-added-tooltip').addClass('hidden');
      }, 2000);
    }

    var ftuBtnTrigger = $('.ftu-video-trigger');
    var tourArea = $('#tourArea');
    var dashBackground = $('.dash-background');
    ftuBtnTrigger.hover(function () {
      $(_this).toggleClass('active-tooltip');
      tourArea.addClass('no-activated');
      dashBackground.addClass('not-active');
    });
    ftuBtnTrigger.click(function () {
      tourArea.removeClass('no-activated');
      dashBackground.removeClass('not-active');
    });
  };

  function enhanceProduct(p) {
    var product = _objectSpread2(_objectSpread2({}, p), {}, {
      stockCheck: stockCheck(p),
      hasCouponsCode: hasCouponCode(p),
      isCoupon: isCoupon(p),
      isProduct: isProduct(p),
      isSpecialCoupon: isSpecialCoupon(p),
      isSimilar: isSimilar(p),
      isHotelItem: isAnyHotel(p),
      isFavoriteShop: isFavoriteShop(p)
    });

    var rating = product.isHotelItem ? product.stars : product.rating;

    if (rating) {
      product.ratingPercent = calculateRatingPercent(rating);
    }

    if (product.isCoupon) {
      product.saving = product.value; // product.label = product.name ? product.name : product.label;

      product.couponSpecialValue = couponSpecialValue(product);
    }

    return product;
  }

  common.notification.beforeRender = function beforeRender(data) {
    var products = data.products,
        notification = data.notification,
        meta = data.meta;
    var logoAnimation = meta.icon_animation;
    var hasHotel = containsHotels(products);
    var offersNoHotels = filterByCategory(products, HOTEL).length;
    var hasSimilarHotel = containsSimilarHotels(products);
    var offersNoSimilarHotels = filterByCategory(products, SIMILAR_HOTEL).length;
    var hasCityHotel = containsCityHotels(products);
    var isCombinedHotels = hasSimilarHotel && hasHotel;
    var categoriesToShow = getCategoriesToShow(products);
    var initialCategory = head_1(categoriesToShow);
    var firstProduct = head_1(filter_1(products, function (_ref) {
      var category = _ref.category;
      return category === initialCategory;
    })); // const firstProduct = isCombinedHotels ? products[3] : products[0]; // @todo investigate why it works like this

    var hideElements = hasHotel && firstProduct.query_fprice > firstProduct.fprice;
    var hideElementsNumeric = hasHotel && firstProduct.query_price > firstProduct.price / 100;
    var browser = Bowser.getParser(window.navigator.userAgent);
    var isFirefox = browser.getBrowserName() === 'Firefox';
    return {
      firstProduct: firstProduct,
      hasCityHotel: hasCityHotel,
      hasHotel: hasHotel,
      hasSearchTerm: hasSearchTerm(data),
      hasSimilarHotel: hasSimilarHotel,
      hideElements: hideElements,
      logoAnimation: logoAnimation,
      hideElementsNumeric: hideElementsNumeric,
      isCatalog: getIsCatalog(products),
      isCombinedHotels: isCombinedHotels,
      isDarkTheme: isDarkTheme(data),
      meta: meta,
      notification: notification,
      offersNo: products.length,
      offersNoHotels: offersNoHotels,
      offersNoSimilarHotels: offersNoSimilarHotels,
      product: products,
      // @todo investigate why it is here
      ratingPercent: firstProduct && firstProduct.stars ? calculateRatingPercent(firstProduct.stars) : 0,
      searchTerm: truncateSearchTerm(data),
      stockCheck: stockCheck(products),
      isFirefox: isFirefox
    };
  };

  var searchTypeAmazon = false;

  common.listing.beforeRender = function beforeRender(data) {
    if (data.scrapedData.data && data.scrapedData.data.search_type === 'bulk') {
      searchTypeAmazon = true;
    }

    var showCoupons = location.hash === '#offers/coupons';
    var showSimilar = location.hash === '#offers/similar';
    var showHotel = location.hash === '#offers/hotel';
    var showSimilarHotel = location.hash === '#offers/similarhotel';
    var browserVal = Bowser.getParser(window.navigator.userAgent);
    var isFirefox = browserVal.getBrowserName() === 'Firefox';
    var products = data.products.map(enhanceProduct);
    var hasCoupons = containsCoupons(products);
    var hasSimilar = containsSimilarProducts(products);
    var hasSimilarHotel = containsSimilarHotels(products);
    var hasHotel = containsHotels(products);
    var categoriesToShow = getCategoriesToShow(products, showCoupons, showSimilar, showHotel, showSimilarHotel);
    var initialCategory = head_1(categoriesToShow);
    var firstProduct = head_1(filter_1(products, function (_ref2) {
      var category = _ref2.category;
      return category === initialCategory;
    }));
    var hideElementsNumeric = hasHotel && firstProduct.query_price > firstProduct.price / 100;
    var similarNo = filterByCategory(products, SIMILAR_PRODUCT).length;
    var similarStyle;

    if (similarNo === 3 || similarNo === 6 || similarNo === 5 || similarNo === 9) {
      similarStyle = 'three-col';
    } else if (similarNo === 4 || similarNo === 8 || similarNo === 7 || similarNo === 12) {
      similarStyle = 'four-col';
    } else {
      similarStyle = 'normal-col';
    }

    if (similarNo > 1) {
      similarStyle += ' onscroll';
    }

    var isCatalog = getIsCatalog(products);

    if (isCatalog) {
      products = sortBy_1(products, 'sortorder');
    } else {
      products = sortBy_1(products, 'sortorder');
    } // products.forEach((product) => {
    //     console.log(`${product.label} ${product.slug}`);
    //     console.log(product);
    //     console.log(hasCouponsCode);
    // });


    return _objectSpread2(_objectSpread2({}, data), {}, {
      affiliateName: firstProduct.affiliate ? firstProduct.affiliate : data.meta.domain,
      hasCoupons: hasCoupons,
      hasSimilar: hasSimilar,
      similarNo: similarNo,
      similarStyle: similarStyle,
      initialCategory: head_1(categoriesToShow) + (isCatalog ? ' isCatalog' : ''),
      isCatalog: isCatalog,
      hideElementsNumeric: hideElementsNumeric,
      isCombinedHotels: hasHotel && hasSimilarHotel,
      isDarkTheme: isDarkTheme(data),
      onlySimilar: !showSimilar,
      products: products,
      showCityHotel: includes_1(categoriesToShow, CITY_HOTEL),
      showCoupons: showCoupons,
      showHotel: includes_1(categoriesToShow, HOTEL),
      showSimilarHotel: includes_1(categoriesToShow, SIMILAR_HOTEL),
      searchTypeAmazon: searchTypeAmazon,
      isFirefox: isFirefox
    });
  };

  common.listing.afterRender = function afterRender() {
    var activeButton = $('a.triggers.active');
    var buttonLeft = activeButton.position().left;
    var buttonWidth = activeButton.outerWidth();
    var buttonRight = buttonLeft + buttonWidth;
    var couponInfoBtn = $('.icon-info-icon');
    couponInfoBtn.each(function eachItem() {
      $(this).hover(function eachhover() {
        var couponInfoBoxOffsetTop = $(this).offset().top;
        var couponInfoBoxLeft = $(this).offset().left;
        var couponInfoBox = $(this).find('p');
        var styleInfoBox = "top:calc(40px + ".concat(couponInfoBoxOffsetTop.toFixed(0), "px)!important;") + "left: ".concat(couponInfoBoxLeft.toFixed(0), "px;");
        couponInfoBox.attr('style', styleInfoBox);
      });
    });
    var style = "left:calc(0% + ".concat((buttonRight - 720).toFixed(0), "px)!important;") + "right:calc(100% - ".concat((buttonRight + 20).toFixed(0), "px)!important;");
    $('div.new-ui.dash-offers').attr('style', style);
  };

  common.ftu.beforeRender = function beforeRender(data) {
    return _objectSpread2(_objectSpread2({}, data), {}, {
      isDarkTheme: isDarkTheme(data)
    });
  };

  common.ftu.afterRender = function afterRender() {
    var dashBackground = $('.dash-background');
    var videoCloseModal = $('.ftu-video-close');
    var playpause = $('.playpause');
    var videoItem = $('.ftu-video');
    var modalVideoBody = $('.video-container');
    var browser = Bowser.getParser(window.navigator.userAgent);
    var isFirefox = browser.getBrowserName() === 'Firefox';
    var ftuVidContainer = $('.video-ftu-container');
    dashBackground.addClass('active');

    if (isFirefox) {
      dashBackground.addClass('activeff');
    }

    videoCloseModal.click(function clickmodal() {
      dashBackground.removeClass('active');

      if (isFirefox) {
        dashBackground.removeClass('activeff');
      }

      modalVideoBody.hide();
      videoItem.get(0).pause();
      videoItem.get(0).currentTime = 0;
    });
    playpause.click(function playpausevideo() {
      $(this).addClass('playing');

      if ($(this).parent().children('video').get(0).paused) {
        $(this).parent().children('video').get(0).play();
      } else {
        $(this).parent().children('video').get(0).pause();
      }
    });
    ftuVidContainer.click(function closeVModal(e) {
      if (e.target !== this) return;
      location.hash = '#offers/minimized';
      dashBackground.removeClass('active');

      if (isFirefox) {
        dashBackground.removeClass('activeff');
      }

      modalVideoBody.hide();
      videoItem.get(0).pause();
      videoItem.get(0).currentTime = 0;
    });
  };

  var scrapedData = false;
  var isNotProduct = false; // eslint-disable-line prefer-const

  var canonicalUrlMissing = false;

  common.wishlist.beforeRender = function beforeRender(data) {
    scrapedData = data;
    var products = scrapedData.products.map(enhanceProduct);
    var hasProducts = containsProducts(products);
    var hasCoupons = containsCoupons(products);
    var hasSimilar = containsSimilarProducts(products);
    var hasSimilarHotel = containsSimilarHotels(products);
    var hasHotel = containsHotels(products);
    var categoriesToShow = getCategoriesToShow(products);
    var initialCategory = head_1(categoriesToShow);
    var firstProduct = head_1(filter_1(products, function (_ref3) {
      var category = _ref3.category;
      return category === initialCategory;
    }));
    isNotProduct = scrapedData.notification.category !== 'Product' && scrapedData.notification.category !== 'Similar';

    if (hasProducts) {
      if (scrapedData.scrapedData.data.canonical_url === undefined || scrapedData.scrapedData.data.canonical_url === '') {
        canonicalUrlMissing = true;
      }
    }

    var queryFpriceAdd = {
      query_fprice: firstProduct.query_fprice
    };

    if (isNotProduct) {
      Object.assign(scrapedData.notification, queryFpriceAdd);
    }

    return _objectSpread2(_objectSpread2({}, data), {}, {
      firstProduct: firstProduct,
      hasCoupons: hasCoupons,
      hasSimilar: hasSimilar,
      initialCategory: head_1(categoriesToShow),
      isCombinedHotels: hasHotel && hasSimilarHotel,
      isDarkTheme: isDarkTheme(data),
      products: products
    });
  };

  common.wishlist.afterRender = function afterRender() {
    var scraped = scrapedData;
    var modalWbg = $('.tourtip-container'); // const hasCoupons = containsCoupons(scraped.products);

    var products = scrapedData.products.map(enhanceProduct);
    var hasProducts = containsProducts(products);
    var hasSimilar = containsSimilarProducts(products); // const hasCoupons = containsCoupons(products);

    if (!hasProducts) {
      if (!hasSimilar) {
        $('#addProductWishlist').hide();
        $('#removeProductWishlist').hide();
      }
    }

    modalWbg.click(function closeModal(e) {
      if (e.target !== this) return;
      location.hash = '#offers/minimized';
    });

    if (canonicalUrlMissing) {
      $('#addProductWishlist').hide();
      $('#removeProductWishlist').hide();
    }

    getWishlist().then(function (result) {
      return result === undefined ? [] : result;
    }).then(function (result) {
      var existingProducts = result;

      if (Object.keys(result).length === 0) {
        existingProducts = [];
      } else {
        Object.keys(result).forEach(function (key) {
          var existingProduct = result[key];

          if (scraped.scrapedData.data.canonical_url === existingProduct.scrapedData.data.canonical_url) {
            $('.remove-wishlist-product').removeClass('hidden');
            $('.add-wishlist-product').addClass('hidden');
          }
        });
      }

      return existingProducts;
    }).then(function (result) {
      saveWishlist(result);
    });

    document.getElementById('addProductWishlist').onclick = function () {
      addedWishlist = true;
      getWishlist().then(function (result) {
        if (result.length > 0) {
          document.getElementById('wishlist-counter-p').innerHTML = result.length;
          $('.wishlist-added-bubble').removeClass('hidden');
        } else {
          $('.wishlist-added-bubble').addClass('hidden');
        }

        return result || [];
      }).then(function (result) {
        var existingProducts = result;

        if (Object.keys(result).length === 0) {
          existingProducts = [];

          if (canonicalUrlMissing === false) {
            existingProducts.push(scraped);
          }
        } else {
          var replaced = false; // find product and replace it

          Object.keys(result).forEach(function (key) {
            var existingProduct = result[key];

            if (scraped.scrapedData.data.canonical_url === existingProduct.scrapedData.data.canonical_url) {
              existingProducts[key] = scraped;
              replaced = true;
            }
          });

          if (!replaced) {
            existingProducts.push(scraped);
          }
        }

        if (existingProducts.length > 0) {
          currentWishlistProducts = existingProducts.length;
          document.getElementById('wishlist-counter-p').innerHTML = currentWishlistProducts;
          $('.wishlist-added-bubble').removeClass('hidden');
        } else {
          $('.wishlist-added-bubble').addClass('hidden');
        }

        return existingProducts;
      }).then(function (result) {
        saveWishlist(result);
      });
    };

    document.getElementById('removeProductWishlist').onclick = function () {
      addedWishlist = false;
      getWishlist().then(function (result) {
        return result === undefined ? [] : result;
      }).then(function (result) {
        var existingProducts = result.filter(function (el) {
          return el.scrapedData.data.canonical_url !== scraped.scrapedData.data.canonical_url;
        });

        if (existingProducts.length > 0) {
          currentWishlistProducts = existingProducts.length;
          document.getElementById('wishlist-counter-p').innerHTML = currentWishlistProducts;
          $('.wishlist-added-bubble').removeClass('hidden');
        } else {
          $('.wishlist-added-bubble').addClass('hidden');
        }

        return existingProducts;
      }).then(function (result) {
        saveWishlist(result);
      });
    };
  };

  function undoWislistItem(dest, x) {
    dest.parent().find('.undo-label').click(function undoRemovingWishItem() {
      clearInterval(x);
      $(this).parent().parent().parent().removeClass('removing').find('.item-wishlist--remove-cover').addClass('hidden');
      $(this).parent().find('.count-undo').html('3');
    });
  }

  function removingWishlistTimmer(dest, stop) {
    var count = 2;
    var itemUrl = dest.parent().find('a').attr('href');
    var x = setInterval(function deletionCountdown() {
      undoWislistItem(dest, x);

      if (stop === true) {
        clearInterval(x);
      }

      if (dest !== '') {
        dest.parent().find('.count-undo').html(count);

        if (count === 0) {
          clearInterval(x);
          dest.parent().remove();
          getWishlist().then(function (result) {
            return result === undefined ? [] : result;
          }).then(function (result) {
            var existingProducts = result.filter(function (el) {
              return el.scrapedData.data.canonical_url !== itemUrl;
            });

            if (existingProducts.length === 0) {
              $('.wishlist-empty').removeClass('hidden');
              $('.wishlist-not-empty').addClass('hidden');
              $('.wishlist-modal--mainboard').addClass('no-products');
            }

            document.getElementById('total-wishlist--items').innerHTML = existingProducts.length;
            return existingProducts;
          }).then(function (result) {
            saveWishlist(result);
          });
        }
      }

      count -= 1;
    }, 1000);

    if (stop === true) {
      clearInterval(x);
    }

    dest.parent().find('.count-undo').html(3);
  }

  function removingWishlistItem() {
    $('.item-wishlist--remove').each(function eachItemRemove() {
      var that = $(this);
      that.click(function remvingWishItem() {
        $(this).parent().addClass('removing').find('.item-wishlist--remove-cover').removeClass('hidden');
        removingWishlistTimmer($(this), false);
      });
    });
  }

  common.wishlistmodal.beforeRender = function beforeRender(data) {
    return _objectSpread2(_objectSpread2({}, data), {}, {
      isDarkTheme: isDarkTheme(data)
    });
  };

  common.wishlistmodal.afterRender = function afterRender() {
    var undoString = $('.undo-string').text();
    var undoCountString = $('.undo-count-string').html();
    var ctaLabelString = $('.goshop-string').text();
    var modalBg = $('.wishlist-modal');
    var modalCloseBtn = $('.wishlist-video-close');
    modalBg.click(function closeModal(e) {
      if (e.target !== this) return;
      location.hash = '#offers/minimized';
      modalBg.hide();
    });
    modalCloseBtn.click(function closeXModal(e) {
      if (e.target !== this) return;
      location.hash = '#offers/minimized';
      modalBg.hide();
    });
    getWishlist().then(function (result) {
      result.reverse();

      if (result.length > 0) {
        $('.wishlist-modal--mainboard').removeClass('no-products');
        document.getElementById('total-wishlist--items').innerHTML = result.length;
        var finalResponse = '';
        Object.keys(result).forEach(function (key) {
          finalResponse += "<div class=\"item-wishlist\">";
          finalResponse += "<div class=\"item-wishlist--remove-cover hidden\"><div class=\"undo-action\" data-event=\"Undo Delete Wishlist Product\"><span class=\"undo-label\"><span class=\"icon-undo\"></span>".concat(undoString, "</span></div><div class=\"undo-countdown\">").concat(undoCountString, "</div></div>"); // eslint-disable-line

          finalResponse += "<span class=\"item-wishlist--remove\"><i class=\"icon-trash\"></i></span>"; // finalResponse += `<span class="item-wishlist--affiliate-name hidden">${result[key].notification.affiliate}</span>`; // eslint-disable-line
          // if (result[key].notification.affiliate_image !== undefined) {
          //     finalResponse += `<div class="item-wishlist--affiliate" style="background-image: url('${result[key].notification.affiliate_image}')"></div>`; // eslint-disable-line
          // }

          finalResponse += "<a href=\"".concat(result[key].scrapedData.data.canonical_url, "\" rel=\"noopener\" target=\"_blank\" data-event=\"Open Wishlist Product\">"); // eslint-disable-line

          finalResponse += "<div class=\"item-wishlist--inner\">";
          finalResponse += "<div class=\"item-wishlist--domain\">".concat(result[key].meta.domain, "</div>");
          finalResponse += "<div class=\"item-wishlist--thumb\"><img class=\"img-responsive\" alt=\"\" src=\"".concat(result[key].scrapedData.data.image ? result[key].scrapedData.data.image.indexOf('https:') < 0 ? 'https:' + result[key].scrapedData.data.image : result[key].scrapedData.data.image : 'https://assets.prod.cms.avira.com/cache-buster-1612950231/assets/www/_pim/safeshopping/abs-placeholder.png', "\"></div>"); // eslint-disable-line

          finalResponse += "<div class=\"item-wishlist--title\">".concat(result[key].scrapedData.data.title, "</div>"); // eslint-disable-line
          // if (result[key].notification.saving) {
          //     finalResponse += `<div class="item-wishlist--price"><span class="rprice">${result[key].notification.query_fprice}</span><span class="price">${result[key].notification.fprice}</span></div>`; // eslint-disable-line
          // } else {
          //     finalResponse += `<div class="item-wishlist--price"><span class="price">${result[key].notification.fprice}</span></div>`; // eslint-disable-line
          // }

          finalResponse += "<div class=\"item-wishlist--price\"><span class=\"price\">".concat(result[key].notification.query_fprice, "</span></div>"); // eslint-disable-line

          finalResponse += "<div class=\"item-wishlist--cta\"><span class=\"go-to-shop cta-button\">".concat(ctaLabelString, "</span></div>"); // eslint-disable-line

          finalResponse += "</div>";
          finalResponse += "</a></div>";
        });
        document.getElementById('productResult').innerHTML = finalResponse;
        $('.wishlist-empty').addClass('hidden');
        $('.wishlist-not-empty').removeClass('hidden');
        $('.item-wishlist--affiliate').hover(function hoveringAffiliateCircle() {
          $(this).parent().find('.item-wishlist--affiliate-name').toggleClass('hidden');
        });
      } else {
        $('.wishlist-empty').removeClass('hidden');
        $('.wishlist-not-empty').addClass('hidden');
      }

      removingWishlistItem();
    });
  };

  common.external.beforeRender = function beforeRender(data) {
    return _objectSpread2(_objectSpread2({}, data), {}, {
      isDarkTheme: isDarkTheme(data)
    });
  };

  var coupons = {
    notification: {},
    listing: {},
    coupon: {},
    help: {},
    ftu: {}
  };

  coupons.notification.beforeRender = function beforeRender(_ref) {
    var products = _ref.products,
        meta = _ref.meta; // eslint-disable-next-line camelcase

    var icon_animation = meta.icon_animation;
    var couponsNo = filterByCategory(products, COUPON).length;
    var firstProduct = head_1(products);
    var hasCouponsCode = hasCouponCode(firstProduct);
    var browser = Bowser.getParser(window.navigator.userAgent);
    var isFirefox = browser.getBrowserName() === 'Firefox';
    return {
      couponsNo: couponsNo,
      firstProduct: firstProduct,
      logoAnimation: icon_animation,
      hasCouponsCode: hasCouponsCode,
      isDarkTheme: isDarkTheme({
        meta: meta
      }),
      meta: meta,
      isFirefox: isFirefox
    };
  };

  var singleCoupon = false;

  coupons.coupon.beforeRender = function beforeRender(data) {
    singleCoupon = true;
    return _objectSpread2(_objectSpread2({}, data), {}, {
      isDarkTheme: isDarkTheme(data)
    });
  };

  function hideWishlistBasedOnABSver$1() {
    var browserVal = Bowser.getParser(window.navigator.userAgent);
    var isFirefox = browserVal.getBrowserName() === 'Firefox';

    function getLocalStorage() {
      if (isFirefox) {
        return browser;
      }

      return chrome;
    }

    var localStorageVar = getLocalStorage();
    var absBuildVer = localStorageVar.runtime.getManifest().version;

    if (absBuildVer < '3.1.0') {
      $('.ftu-wishlist-trigger').addClass('hidden');
    } else {
      $('.ftu-wishlist-trigger').removeClass('hidden');
    }
  }

  var copySuccess;
  var currentWishlistProducts$1 = 0;

  coupons.coupon.afterRender = function afterRender() {
    hideWishlistBasedOnABSver$1();
    setTimeout(function checkwsh() {
      getWishlist().then(function (result) {
        return result === undefined ? [] : result;
      }).then(function (result) {
        if (result.length > 0) {
          currentWishlistProducts$1 = result.length;

          if ($('#wishlist-counter-p').length > 0) {
            document.getElementById('wishlist-counter-p').innerHTML = currentWishlistProducts$1;
          }

          $('.wishlist-added-bubble').removeClass('hidden');
        } else {
          $('.wishlist-added-bubble').addClass('hidden');
        }
      });
    }, 80);

    function selectElementText(el) {
      var range = document.createRange(); // create new range object

      range.selectNodeContents(el); // set range to encompass desired element text

      var selection = window.getSelection(); // get Selection object from currently user selected text

      selection.removeAllRanges(); // unselect any user selected text (if any)

      selection.addRange(range); // add range to Selection object to select it
    }

    function copySelectionText() {
      try {
        copySuccess = document.execCommand('copy'); // run command to copy selected text to clipboard
      } catch (e) {
        copySuccess = false;
      }

      return copySuccess;
    }

    $('.copy-callback').on('click', function () {
      var para = document.getElementById('code');
      selectElementText(para); // select the element's text we wish to read

      copySuccess = copySelectionText(); // copy user selected text to clipboard

      $('.copy-callback span').fadeOut('slow', function () {
        $('.copy-success').delay(900).fadeIn('fast');
      });
    });

    if (copySuccess) {
      $('.copy-callback span').hide();
      $('.copy-success').show();
    }

    $('#feedback-yes, #feedback-no').on('click', function () {
      var feedbackContainer = $('.feedback');
      feedbackContainer.find('.feedback--step-1').addClass('hidden');
      feedbackContainer.find('.feedback--step-2').removeClass('hidden');
    });
  };

  coupons.help.afterRender = function afterRender() {
    var activeButtonHelp = $('a.toggle-button.help.active');
    var buttonLeftHelp = activeButtonHelp.position().left;
    var buttonWidthHelp = activeButtonHelp.outerWidth();
    var buttonRightHelp = buttonLeftHelp + buttonWidthHelp;
    var styleHelp = "left:calc(0% + ".concat((buttonRightHelp - 223).toFixed(0), "px)!important;") + "right:calc(100% - ".concat((buttonRightHelp + 20).toFixed(0), "px)!important;");
    $('div.new-ui.dropdown-content-wrapper.coupons').attr('style', styleHelp);
  };

  coupons.ftu.beforeRender = function beforeRender(data) {
    return _objectSpread2(_objectSpread2({}, data), {}, {
      isDarkTheme: isDarkTheme(data),
      singleCoupon: singleCoupon
    });
  };

  coupons.notification.afterRender = common.notification.afterRender;
  coupons.listing.beforeRender = common.listing.beforeRender;
  coupons.listing.afterRender = common.listing.afterRender;

  function isGoogleSearchTermTest(_ref) {
    var _ref$meta = _ref.meta,
        meta = _ref$meta === void 0 ? {} : _ref$meta;
    var bucket = meta.ab_bucket;
    var group = meta.ab_group;
    return bucket === 'googleSearchTerm' && group === 'test';
  } // export function isCouponsAbTest({ meta = {} }) {
  //     const bucket = meta.ab_bucket;
  //     const group = meta.ab_group;
  //
  //     return bucket === 'couponTeaser' && group === 'test';
  // }
  // export function iconAnimationTest1({ meta = {} }) {
  //     const bucket = meta.ab_bucket;
  //     const group = meta.ab_group;
  //
  //     return bucket === 'iconDropdownAnimationTest' && group === 'icon-1';
  // }
  //
  // export function iconAnimationTest2({ meta = {} }) {
  //     const bucket = meta.ab_bucket;
  //     const group = meta.ab_group;
  //
  //     return bucket === 'iconDropdownAnimationTest' && group === 'icon-2';
  // }
  //
  // export function iconAnimationTest3({ meta = {} }) {
  //     const bucket = meta.ab_bucket;
  //     const group = meta.ab_group;
  //
  //     return bucket === 'iconDropdownAnimationTest' && group === 'icon-3';
  // }
  // export function similarItemsTest({ meta = {} }) {
  //     const bucket = meta.ab_bucket;
  //     const group = meta.ab_group;
  //
  //     return bucket === 'similarItemsTest' && group === 'test';
  // }
  // export function isNewUiTest({ meta = {} }) {
  //     const bucket = meta.ab_bucket;
  //     const group = meta.ab_group;
  //
  //     return bucket === 'isNewUiTest' && group === 'test';
  // }
  // export function isHighlightShopsTest({ meta = {} }) {
  //     const bucket = meta.ab_bucket;
  //     const group = meta.ab_group;
  //
  //     return bucket === 'highlightShops' && group !== 'control';
  // }
  //
  // export function getHighlightedShopTheme({ meta = {} }) {
  //     const group = meta.ab_group;
  //
  //     if (group === 'test-blue') {
  //         return 'blue';
  //     }
  //
  //     if (group === 'test-green') {
  //         return 'green';
  //     }
  //
  //     if (group === 'test-grey') {
  //         return 'grey';
  //     }
  //
  //     return 'default';
  // }

  /* global $, window */


  function containsAll(elem, array) {
    return elem.every(function (e) {
      return array.includes(e);
    });
  }

  var couponsWithOffers = {
    notification: {},
    listing: {},
    coupon: {},
    ftu: {}
  };
  var searchTypeAmazon$1 = false;

  couponsWithOffers.notification.beforeRender = function beforeRender(data) {
    var meta = data.meta,
        products = data.products,
        scrapedData = data.scrapedData;
    var logoAnimation = meta.icon_animation;
    var categoriesToShow = getCategoriesToShow(products);
    var initialCategory = head_1(categoriesToShow);
    var showSimilarBtn = containsAll([PRODUCT, SIMILAR_PRODUCT], categoriesToShow);
    var hasCoupons = containsCoupons(products);
    var firstProduct = head_1(products);
    var hasCouponsCode = hasCouponCode(firstProduct);
    var productsToShow = filter_1(products, function (item) {
      return includes_1(categoriesToShow, item.category);
    });
    var productsByPrice = sortBy_1(productsToShow, 'sortorder');
    var productItems = filterByCategory(productsByPrice, initialCategory); // This is legacy way to count number of items. I wouldn't touch it for now

    var offersNo = hasCoupons || showSimilarBtn ? productItems.length : productsByPrice.length; // This is better way to count items by category

    var couponsNo = filterByCategory(products, COUPON).length;
    var similarNo = filterByCategory(products, SIMILAR_PRODUCT).length;
    var offersNoMore = productItems.length > 1;
    var isSearchTermTest = isGoogleSearchTermTest(data);
    var browser = Bowser.getParser(window.navigator.userAgent);
    var isFirefox = browser.getBrowserName() === 'Firefox';

    if (scrapedData.data.search_type === 'bulk') {
      searchTypeAmazon$1 = true;
    }

    return {
      couponsNo: couponsNo,
      firstProduct: head_1(productItems),
      hasCoupons: hasCoupons,
      hasSearchTerm: isSearchTermTest && hasSearchTerm(data),
      isDarkTheme: isDarkTheme({
        meta: meta
      }),
      logoAnimation: logoAnimation,
      meta: meta,
      similarNo: similarNo,
      offersNo: offersNo,
      offersNoMore: offersNoMore,
      onlySimilar: initialCategory === SIMILAR_PRODUCT,
      isProduct: initialCategory === PRODUCT,
      searchTerm: data.searchTerm,
      showSimilarBtn: showSimilarBtn,
      hasCouponsCode: hasCouponsCode,
      searchTypeAmazon: searchTypeAmazon$1,
      isFirefox: isFirefox
    };
  };

  couponsWithOffers.notification.afterRender = function afterRender() {
    var _this = this;

    $('.triggers').on('hover', function () {
      $(_this).addClass('active');
    });
  };

  couponsWithOffers.notification.beforeRender = couponsWithOffers.notification.beforeRender;
  couponsWithOffers.notification.afterRender = common.notification.afterRender;
  couponsWithOffers.listing.beforeRender = common.listing.beforeRender;
  couponsWithOffers.listing.afterRender = common.listing.afterRender;
  /* global ABS, document */

  ABS.run(function run(config) {
    // eslint-disable-next-line no-param-reassign
    config.templates = {
      tpl_coupon_single: coupons.coupon,
      tpl_help_coupons: coupons.help,
      tpl_ftu_coupons_and_offers: couponsWithOffers.ftu,
      tpl_ftu_coupons: coupons.ftu,
      tpl_listing_coupons_and_offers: common.listing,
      tpl_listing_coupons: common.listing,
      tpl_listing_hotels: common.listing,
      tpl_listing: common.listing,
      tpl_ftu: common.ftu,
      tpl_wishlist: common.wishlist,
      tpl_wishlistmodal: common.wishlistmodal,
      tpl_notification_billiger: common.notification,
      tpl_notification_coupons_and_offers: couponsWithOffers.notification,
      tpl_notification_google_offers: couponsWithOffers.notification,
      tpl_notification_coupons: coupons.notification,
      tpl_notification_hotels: common.notification,
      tpl_notification_splashoffer: common.notification,
      tpl_external_splashoffer: common.external,
      tpl_notification_utilities: common.notification
    };
  });
  fixBrokenFirefoxLinks(document.body);
})();

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"core-js/modules/es6.array.iterator.js":48,"core-js/modules/es6.array.sort.js":49,"core-js/modules/web.dom.iterable.js":50}],2:[function(require,module,exports){
module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

},{}],3:[function(require,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = require('./_wks')('unscopables');
var ArrayProto = Array.prototype;
if (ArrayProto[UNSCOPABLES] == undefined) require('./_hide')(ArrayProto, UNSCOPABLES, {});
module.exports = function (key) {
  ArrayProto[UNSCOPABLES][key] = true;
};

},{"./_hide":18,"./_wks":47}],4:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

},{"./_is-object":22}],5:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject');
var toLength = require('./_to-length');
var toAbsoluteIndex = require('./_to-absolute-index');
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

},{"./_to-absolute-index":40,"./_to-iobject":42,"./_to-length":43}],6:[function(require,module,exports){
var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};

},{}],7:[function(require,module,exports){
var core = module.exports = { version: '2.6.12' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

},{}],8:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

},{"./_a-function":2}],9:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

},{}],10:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_fails":14}],11:[function(require,module,exports){
var isObject = require('./_is-object');
var document = require('./_global').document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};

},{"./_global":16,"./_is-object":22}],12:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');

},{}],13:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var hide = require('./_hide');
var redefine = require('./_redefine');
var ctx = require('./_ctx');
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE];
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
  var key, own, out, exp;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if (target) redefine(target, key, out, type & $export.U);
    // export
    if (exports[key] != out) hide(exports, key, exp);
    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
  }
};
global.core = core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;

},{"./_core":7,"./_ctx":8,"./_global":16,"./_hide":18,"./_redefine":35}],14:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

},{}],15:[function(require,module,exports){
module.exports = require('./_shared')('native-function-to-string', Function.toString);

},{"./_shared":38}],16:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

},{}],17:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};

},{}],18:[function(require,module,exports){
var dP = require('./_object-dp');
var createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

},{"./_descriptors":10,"./_object-dp":29,"./_property-desc":34}],19:[function(require,module,exports){
var document = require('./_global').document;
module.exports = document && document.documentElement;

},{"./_global":16}],20:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function () {
  return Object.defineProperty(require('./_dom-create')('div'), 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_descriptors":10,"./_dom-create":11,"./_fails":14}],21:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};

},{"./_cof":6}],22:[function(require,module,exports){
module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

},{}],23:[function(require,module,exports){
'use strict';
var create = require('./_object-create');
var descriptor = require('./_property-desc');
var setToStringTag = require('./_set-to-string-tag');
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};

},{"./_hide":18,"./_object-create":28,"./_property-desc":34,"./_set-to-string-tag":36,"./_wks":47}],24:[function(require,module,exports){
'use strict';
var LIBRARY = require('./_library');
var $export = require('./_export');
var redefine = require('./_redefine');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var $iterCreate = require('./_iter-create');
var setToStringTag = require('./_set-to-string-tag');
var getPrototypeOf = require('./_object-gpo');
var ITERATOR = require('./_wks')('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && typeof IteratorPrototype[ITERATOR] != 'function') hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};

},{"./_export":13,"./_hide":18,"./_iter-create":23,"./_iterators":26,"./_library":27,"./_object-gpo":31,"./_redefine":35,"./_set-to-string-tag":36,"./_wks":47}],25:[function(require,module,exports){
module.exports = function (done, value) {
  return { value: value, done: !!done };
};

},{}],26:[function(require,module,exports){
module.exports = {};

},{}],27:[function(require,module,exports){
module.exports = false;

},{}],28:[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = require('./_an-object');
var dPs = require('./_object-dps');
var enumBugKeys = require('./_enum-bug-keys');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = require('./_dom-create')('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};

},{"./_an-object":4,"./_dom-create":11,"./_enum-bug-keys":12,"./_html":19,"./_object-dps":30,"./_shared-key":37}],29:[function(require,module,exports){
var anObject = require('./_an-object');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var toPrimitive = require('./_to-primitive');
var dP = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

},{"./_an-object":4,"./_descriptors":10,"./_ie8-dom-define":20,"./_to-primitive":45}],30:[function(require,module,exports){
var dP = require('./_object-dp');
var anObject = require('./_an-object');
var getKeys = require('./_object-keys');

module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};

},{"./_an-object":4,"./_descriptors":10,"./_object-dp":29,"./_object-keys":33}],31:[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = require('./_has');
var toObject = require('./_to-object');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};

},{"./_has":17,"./_shared-key":37,"./_to-object":44}],32:[function(require,module,exports){
var has = require('./_has');
var toIObject = require('./_to-iobject');
var arrayIndexOf = require('./_array-includes')(false);
var IE_PROTO = require('./_shared-key')('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};

},{"./_array-includes":5,"./_has":17,"./_shared-key":37,"./_to-iobject":42}],33:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = require('./_object-keys-internal');
var enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};

},{"./_enum-bug-keys":12,"./_object-keys-internal":32}],34:[function(require,module,exports){
module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

},{}],35:[function(require,module,exports){
var global = require('./_global');
var hide = require('./_hide');
var has = require('./_has');
var SRC = require('./_uid')('src');
var $toString = require('./_function-to-string');
var TO_STRING = 'toString';
var TPL = ('' + $toString).split(TO_STRING);

require('./_core').inspectSource = function (it) {
  return $toString.call(it);
};

(module.exports = function (O, key, val, safe) {
  var isFunction = typeof val == 'function';
  if (isFunction) has(val, 'name') || hide(val, 'name', key);
  if (O[key] === val) return;
  if (isFunction) has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if (O === global) {
    O[key] = val;
  } else if (!safe) {
    delete O[key];
    hide(O, key, val);
  } else if (O[key]) {
    O[key] = val;
  } else {
    hide(O, key, val);
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString() {
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});

},{"./_core":7,"./_function-to-string":15,"./_global":16,"./_has":17,"./_hide":18,"./_uid":46}],36:[function(require,module,exports){
var def = require('./_object-dp').f;
var has = require('./_has');
var TAG = require('./_wks')('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};

},{"./_has":17,"./_object-dp":29,"./_wks":47}],37:[function(require,module,exports){
var shared = require('./_shared')('keys');
var uid = require('./_uid');
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};

},{"./_shared":38,"./_uid":46}],38:[function(require,module,exports){
var core = require('./_core');
var global = require('./_global');
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: core.version,
  mode: require('./_library') ? 'pure' : 'global',
  copyright: '© 2020 Denis Pushkarev (zloirock.ru)'
});

},{"./_core":7,"./_global":16,"./_library":27}],39:[function(require,module,exports){
'use strict';
var fails = require('./_fails');

module.exports = function (method, arg) {
  return !!method && fails(function () {
    // eslint-disable-next-line no-useless-call
    arg ? method.call(null, function () { /* empty */ }, 1) : method.call(null);
  });
};

},{"./_fails":14}],40:[function(require,module,exports){
var toInteger = require('./_to-integer');
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};

},{"./_to-integer":41}],41:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

},{}],42:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject');
var defined = require('./_defined');
module.exports = function (it) {
  return IObject(defined(it));
};

},{"./_defined":9,"./_iobject":21}],43:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer');
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

},{"./_to-integer":41}],44:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function (it) {
  return Object(defined(it));
};

},{"./_defined":9}],45:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

},{"./_is-object":22}],46:[function(require,module,exports){
var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

},{}],47:[function(require,module,exports){
var store = require('./_shared')('wks');
var uid = require('./_uid');
var Symbol = require('./_global').Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;

},{"./_global":16,"./_shared":38,"./_uid":46}],48:[function(require,module,exports){
'use strict';
var addToUnscopables = require('./_add-to-unscopables');
var step = require('./_iter-step');
var Iterators = require('./_iterators');
var toIObject = require('./_to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./_iter-define')(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');

},{"./_add-to-unscopables":3,"./_iter-define":24,"./_iter-step":25,"./_iterators":26,"./_to-iobject":42}],49:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var aFunction = require('./_a-function');
var toObject = require('./_to-object');
var fails = require('./_fails');
var $sort = [].sort;
var test = [1, 2, 3];

$export($export.P + $export.F * (fails(function () {
  // IE8-
  test.sort(undefined);
}) || !fails(function () {
  // V8 bug
  test.sort(null);
  // Old WebKit
}) || !require('./_strict-method')($sort)), 'Array', {
  // 22.1.3.25 Array.prototype.sort(comparefn)
  sort: function sort(comparefn) {
    return comparefn === undefined
      ? $sort.call(toObject(this))
      : $sort.call(toObject(this), aFunction(comparefn));
  }
});

},{"./_a-function":2,"./_export":13,"./_fails":14,"./_strict-method":39,"./_to-object":44}],50:[function(require,module,exports){
var $iterators = require('./es6.array.iterator');
var getKeys = require('./_object-keys');
var redefine = require('./_redefine');
var global = require('./_global');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var wks = require('./_wks');
var ITERATOR = wks('iterator');
var TO_STRING_TAG = wks('toStringTag');
var ArrayValues = Iterators.Array;

var DOMIterables = {
  CSSRuleList: true, // TODO: Not spec compliant, should be false.
  CSSStyleDeclaration: false,
  CSSValueList: false,
  ClientRectList: false,
  DOMRectList: false,
  DOMStringList: false,
  DOMTokenList: true,
  DataTransferItemList: false,
  FileList: false,
  HTMLAllCollection: false,
  HTMLCollection: false,
  HTMLFormElement: false,
  HTMLSelectElement: false,
  MediaList: true, // TODO: Not spec compliant, should be false.
  MimeTypeArray: false,
  NamedNodeMap: false,
  NodeList: true,
  PaintRequestList: false,
  Plugin: false,
  PluginArray: false,
  SVGLengthList: false,
  SVGNumberList: false,
  SVGPathSegList: false,
  SVGPointList: false,
  SVGStringList: false,
  SVGTransformList: false,
  SourceBufferList: false,
  StyleSheetList: true, // TODO: Not spec compliant, should be false.
  TextTrackCueList: false,
  TextTrackList: false,
  TouchList: false
};

for (var collections = getKeys(DOMIterables), i = 0; i < collections.length; i++) {
  var NAME = collections[i];
  var explicit = DOMIterables[NAME];
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  var key;
  if (proto) {
    if (!proto[ITERATOR]) hide(proto, ITERATOR, ArrayValues);
    if (!proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
    Iterators[NAME] = ArrayValues;
    if (explicit) for (key in $iterators) if (!proto[key]) redefine(proto, key, $iterators[key], true);
  }
}

},{"./_global":16,"./_hide":18,"./_iterators":26,"./_object-keys":33,"./_redefine":35,"./_wks":47,"./es6.array.iterator":48}]},{},[1]);
