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

require("core-js/modules/es6.array.iterator.js");

require("core-js/modules/web.dom.iterable.js");

class LocalStorage {
  constructor() {
    this._initialized = false;
    this._initializationPromise = null;
    this._storage = {};
    this._persistentStorage = chrome.storage.local;
    this._keys = [];
    this.length = 0;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new this();
    }

    return this.instance;
  }

  initialize() {
    if (this._initializationPromise) {
      return this._initializationPromise;
    }

    this._initializationPromise = new Promise(resolve => this._persistentStorage.get(null, storage => {
      this._storage = storage;
      this._keys = Object.keys(storage);

      this._updateLength();

      this._initialized = true;
      return resolve();
    }));
    return this._initializationPromise;
  }

  getItem(key) {
    this._checkInitialization();

    let value = this._storage[key];

    if (typeof value === 'undefined') {
      value = null;
    }

    return value;
  }

  setItem(key, value) {
    this._checkInitialization();

    if (typeof key !== 'string') {
      throw new TypeError(`item must be a string ${JSON.stringify(key)}`);
    }

    const val = `${value}`;

    if (this._storage[key] !== val) {
      if (!Array.from(this._keys).includes(key)) {
        this._keys.push(key);

        this._updateLength();
      }

      this._storage[key] = val;

      this._persistentStorage.set({
        [key]: val
      });
    }
  }

  removeItem(key) {
    this._checkInitialization();

    if (this._storage[key]) {
      delete this._storage[key];

      this._persistentStorage.remove(key);

      this._keys.splice(this._keys.indexOf(key), 1);

      this._updateLength();
    }
  }

  key(index) {
    this._checkInitialization();

    return this._keys[index];
  }

  _updateLength() {
    this.length = this._keys.length;
  }

  _checkInitialization() {
    if (!this._initialized) {
      throw new Error('LocalStorage accessed before initialization was completed');
    }
  }

}

module.exports = LocalStorage;

},{"core-js/modules/es6.array.iterator.js":59,"core-js/modules/web.dom.iterable.js":60}],2:[function(require,module,exports){
module.exports={
	"barTransitionDelay": 200,
	"default_language": "en-US",
	"languages": [
		"en-US",
		"de-DE",
		"es-ES",
		"fr-FR",
		"it-IT",
		"ja-JP",
		"nl-NL",
		"pt-BR",
		"ru-RU",
		"tr-TR",
		"zh-CN",
		"zh-TW"
	],
	"language_fallbacks": {
		"de": "de-DE",
		"es": "es-ES",
		"fr": "fr-FR",
		"it": "it-IT",
		"ru": "ru-RU",
		"pt": "pt-BR"
	},
	"auc": {
		"server": "https://v2.auc.avira.com/api",
		"api_key": "2216cc6964aa79fa09205dd4b08fb808",
		"product": "avira-browser-safety",
		"product_version": "0.0.0",
		"lang": "en-US",
		"locale": "en-US",
		"sync": true
	},
	"avira_dnt": {
		"update_url": "https://download.avira.com/update/donottrack/rules.json",
		"update_cycle": 86400
	},
	"aims": {
		"productid": 199
	},
	"ao": {
		"api_url": "https://offers.avira.com/aviraoffers/api/v2",
		"api_client": "abs",
		"api_key": "DhwrO06Igpulf142CT6NcUDrKlh4OG4L",
		"coupons_domain": "offers.avira.com",
		"dnt_disable_timeout": 7200000
	},
	"adguard": {
		"filtersMetadataUrl": "https://download.avira.com/update/adguard/filters.json",
		"filterRulesUrl": "https://download.avira.com/update/adguard/filters/{filter_id}.txt",
		"offers_whitelist": "https://download.avira.com/update/donottrack/offers_wl.json",
		"rules": []
	},
	"mixpanel": {
		"token": "c34a8016e04ab4b4b232b1e71cc12d66",
		"active_cycle": 21600
	},
	"sentry_dsn": "https://de51468527964eda8ca3e52ac844db69@sentry.avira.net/20",
	"update_bridge": {
		"api_url": "https://dispatch.avira-update.com/",
		"product_id": 199
	},
	"beta": {
		"gc_id": "biegckbcmgljgabmpjcpmkbheikknfch"
	},
	"nightly": {
		"gc_id": "enhedicmkidpahjffkbmhgiacbodpcbo"
	},
	"chrome": {
		"id": "flliilndjeohchalpbbcdekjklbdgfkk"
	},
	"nophish": {
		"whitelist_url": "https://download.avira.com/update/nophishwhitelist/common/int/NophishWhitelist.json"
	},
	"avira": {
		"base_url": "https://www.avira.com/"
	},
	"supportedSettings": {
		"dark_mode": true,
		"offers": true,
		"dnt_header": true,
		"inAppTracking": false,
		"adguard": true,
		"adguard_social_media": true,
		"adguard_useful_ads": true,
		"extension_scan": true
	},
	"extensionOnboarding": {
		"extensions": {
			"abs": [
				"flliilndjeohchalpbbcdekjklbdgfkk",
				"ccbpbkebodcjkknkfkpmfeciinhidaeh",
				"abs@avira.com",
				"dalelnnofafalcmkmnhdbigbjjkloabo",
				"caiblelclndcckfafdaggpephhgfpoip"
			],
			"pwm": [
				"caljgklbbfbcjjanaijlacgncafpegll",
				"pedpfpedmgmbfnplmhbkodnfbfelgdbc",
				"kfbldoladabfjgedblncjojgmcplnbac",
				"passwordmanager@avira.com",
				"passwordmanager-beta@avira.com",
				"ngohaaocccbohaffogpbgfpmpgbcgccg",
				"emgfgdclgfeldebanedpihppahgngnle"
			]
		},
		"onboardingWebsite": "https://extensions.avira.com",
		"rollout": 0.03
	}
}
},{}],3:[function(require,module,exports){
"use strict";

/* eslint-disable no-restricted-globals */
const $ = require('jquery');

const _ = require('underscore');

const Mustache = require('mustache'); // const config = require('config');
// const Locale = require('Locale');


const i18nLoader = require('content/i18n_loader');

const messenger = require('content/messagingInterface');

const mixpanel = require('content/mixpanel');

const blockedTpl = require('blocked/message.mustache');

const URLSearchParams = require('url-search-params');

const SettingsModel = require('content/Models/Settings');

const categoriesDictionary = {
  0: 'unknown',
  1: 'safe',
  2: 'malware',
  3: 'phishing',
  4: 'spam',
  5: 'pua',
  6: 'pua2',
  7: 'mse'
};
/**
 *  Responsible for rendering the blocked page that is shown to the customer
 *  when a categorie of 1-7 is detected
 */

class BlockedPage {
  static initClass() {
    this.prototype._$dialog = null;
  } // eslint-disable-next-line max-params


  constructor(channel1, domain, url, category, i18n, source, whiteListVersion, exceptionListVersion, prevPUADownloadUrl) {
    this._toggleException = this._toggleException.bind(this);
    this._continue = this._continue.bind(this);
    this._gotoLastSafeUrl = this._gotoLastSafeUrl.bind(this);
    this._mseTakeMeAway = this._mseTakeMeAway.bind(this);
    this.channel = channel1;
    this.domain = domain;
    this.url = url;
    this.category = category;
    this.i18n = i18n;
    this.source = source;
    this.whiteListVersion = whiteListVersion;
    this.exceptionListVersion = exceptionListVersion;
    this.prevPUADownloadUrl = prevPUADownloadUrl;
  }

  render(tabData) {
    this._updateMode();

    const category = this._getCategory(tabData.category);

    const title = this.i18n[`msg_category_${category}`];
    const subtitle = this.i18n[`msg_category_${category}_sub`];

    const isPUADownload = this._isPUADownload(tabData.category);

    $('body').html(Mustache.render(blockedTpl, _.extend(tabData, {
      title,
      subtitle,
      isPUADownload
    }), this.i18n));
    this._$dialog = $('.drop');
    return this._$dialog;
  }

  track(action, callback) {
    if (callback == null) {
      // eslint-disable-next-line no-param-reassign
      callback = () => {};
    }

    return mixpanel.track(this._trackingName(action), {
      Domain: this.domain,
      Category: this._categoryName(),
      Source: this.source,
      WhiteListVersion: this.whiteListVersion,
      ExceptionListVersion: this.exceptionListVersion
    }, callback);
  }

  init() {
    return this._initListeners();
  }

  _getCategory(catNum) {
    return categoriesDictionary[catNum];
  }

  _isPUADownload(catNum) {
    return catNum === 5;
  }

  _initListeners() {
    // "take me away" button
    const ESC = 27;
    $('#btn-back').on('click', this._gotoLastSafeUrl);
    $('#btn-mse-take-me-away').on('click', this._mseTakeMeAway); // "more options" dialog controls

    $('#btn-continue').on('click', this._continue);
    $('#cb-add-exception').on('change', this._toggleException); // "more options" dialog

    this._$dialog.on('click', e => this._toggleDialog(true, e));

    $('.drop__close').on('click', e => this._toggleDialog(false, e));
    $('body').on('click', e => this._toggleDialog(false, e));
    $(document).on('keyup', e => this._toggleDialog(false, e.keyCode === ESC ? e : undefined));
  }

  _toggleDialog(toOpen, e) {
    if (e) {
      e.stopPropagation();
    }

    return this._$dialog.toggleClass('drop--active', toOpen);
  }

  _toggleException(e) {
    const isExempt = e.target.checked;
    const action = isExempt ? 'addException' : 'removeException';
    messenger.publish(this.channel, {
      action,
      domain: this.domain,
      permanent: true
    });
    return this.track(action);
  }

  _continue(e) {
    e.preventDefault();

    const isPUADownload = this._isPUADownload(this.category);

    if ($('#cb-add-exception').checked) {
      return top.location.replace(this.url);
    }

    return messenger.publish(this.channel, {
      action: 'addException',
      permanent: false
    }, () => {
      this.track('ignore');

      if (isPUADownload) {
        let prevUrlDelay = 100;

        if (top === window) {
          const link = document.createElement('a');
          link.href = this.url;
          link.download = '';
          document.body.appendChild(link);
          link.click();
        } else {
          top.location.replace(this.url);
          prevUrlDelay = 500;
        }

        return setTimeout(() => top.location.replace(this.prevPUADownloadUrl), prevUrlDelay);
      }

      return top.location.replace(this.url);
    });
  }

  _updateMode() {
    SettingsModel.getInstance().fetch().then(settings => {
      if (settings.dark_mode) {
        $('body').addClass('theme-dark');
      } else {
        $('body').removeClass('theme-dark');
      }
    });
  }

  _gotoLastSafeUrl() {
    return messenger.publish(this.channel, {
      action: 'getLastSafeURL'
    }, lastSafeUrl => {
      this.track('back');
      return top.location.replace(lastSafeUrl);
    });
  }

  _mseTakeMeAway(e) {
    return messenger.publish('navigate', {
      url: e.target.dataset.href
    });
  }

  _trackingName(action) {
    // eslint-disable-next-line consistent-return
    return `BlockedPage - ${(() => {
      // eslint-disable-next-line default-case
      switch (action) {
        case 'ignore':
          return 'Ignore';

        case 'back':
          return 'Take me back';

        case 'addException':
          return 'Add Exception';

        case 'removeException':
          return 'Remove Exception';

        case 'blocked':
          return 'Show';
      }
    })()}`;
  }

  _categoryName() {
    const categoryList = {
      0: 'Unknown',
      1: 'Safe',
      2: 'Malware',
      3: 'Phishing',
      4: 'Spam',
      5: 'PUA Download',
      6: 'PUA Portal'
    };

    if (categoryList[this.category]) {
      return categoryList[this.category];
    }

    return `Category ${this.category}`;
  }

}

BlockedPage.initClass();
const channel = 'AUCClassifier';

const tabDataHandler = tabData => i18nLoader.getLocaleStrings(i18n => {
  const page = new BlockedPage(channel, tabData.domain, tabData.url, tabData.category, i18n, tabData.source, tabData.whiteListVersion, tabData.exceptionListVersion, tabData.prevPUADownloadUrl);
  page.render(tabData);
  page.track('blocked');
  return page.init();
});

messenger.publish('Tabs:getData', {
  classifier: 'AUCClassifier'
}, tabData => {
  // TODO: we can restore tab data inside getTabData, so we can remove restoreTabData
  if (!tabData || !tabData.url || !tabData.unsafe && !tabData.isWarning) {
    try {
      const searchParams = new URLSearchParams(location.search.replace(/^\?/, ''));
      const data = JSON.parse(decodeURIComponent(atob(searchParams.get('tabData'))));
      return messenger.publish('Tabs:restoreData', {
        data,
        classifier: 'AUCClassifier'
      }, restoredData => tabDataHandler(restoredData));
    } catch (error) {
      return messenger.publish('closeTab');
    }
  } else {
    return tabDataHandler(tabData);
  }
});

},{"blocked/message.mustache":69,"content/Models/Settings":85,"content/i18n_loader":87,"content/messagingInterface":88,"content/mixpanel":89,"jquery":"jquery","mustache":"mustache","underscore":67,"url-search-params":68}],4:[function(require,module,exports){
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

module.exports = _assertThisInitialized;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],5:[function(require,module,exports){
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],6:[function(require,module,exports){
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

module.exports = _createClass;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],7:[function(require,module,exports){
function _getPrototypeOf(o) {
  module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  module.exports["default"] = module.exports, module.exports.__esModule = true;
  return _getPrototypeOf(o);
}

module.exports = _getPrototypeOf;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],8:[function(require,module,exports){
var setPrototypeOf = require("./setPrototypeOf.js");

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) setPrototypeOf(subClass, superClass);
}

module.exports = _inherits;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{"./setPrototypeOf.js":11}],9:[function(require,module,exports){
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],10:[function(require,module,exports){
var _typeof = require("@babel/runtime/helpers/typeof")["default"];

var assertThisInitialized = require("./assertThisInitialized.js");

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }

  return assertThisInitialized(self);
}

module.exports = _possibleConstructorReturn;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{"./assertThisInitialized.js":4,"@babel/runtime/helpers/typeof":12}],11:[function(require,module,exports){
function _setPrototypeOf(o, p) {
  module.exports = _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  module.exports["default"] = module.exports, module.exports.__esModule = true;
  return _setPrototypeOf(o, p);
}

module.exports = _setPrototypeOf;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],12:[function(require,module,exports){
function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return typeof obj;
    };

    module.exports["default"] = module.exports, module.exports.__esModule = true;
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    module.exports["default"] = module.exports, module.exports.__esModule = true;
  }

  return _typeof(obj);
}

module.exports = _typeof;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],13:[function(require,module,exports){
(function (global){(function (){
//     Backbone.js 1.3.3

//     (c) 2010-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(factory) {

  // Establish the root object, `window` (`self`) in the browser, or `global` on the server.
  // We use `self` instead of `window` for `WebWorker` support.
  var root = (typeof self == 'object' && self.self === self && self) ||
            (typeof global == 'object' && global.global === global && global);

  // Set up Backbone appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'jquery', 'exports'], function(_, $, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Backbone.
      root.Backbone = factory(root, exports, _, $);
    });

  // Next for Node.js or CommonJS. jQuery may not be needed as a module.
  } else if (typeof exports !== 'undefined') {
    var _ = require('underscore'), $;
    try { $ = require('jquery'); } catch (e) {}
    factory(root, exports, _, $);

  // Finally, as a browser global.
  } else {
    root.Backbone = factory(root, {}, root._, (root.jQuery || root.Zepto || root.ender || root.$));
  }

})(function(root, Backbone, _, $) {

  // Initial Setup
  // -------------

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create a local reference to a common array method we'll want to use later.
  var slice = Array.prototype.slice;

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '1.3.3';

  // For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
  // the `$` variable.
  Backbone.$ = $;

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PATCH"`, `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... this will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Proxy Backbone class methods to Underscore functions, wrapping the model's
  // `attributes` object or collection's `models` array behind the scenes.
  //
  // collection.filter(function(model) { return model.get('age') > 10 });
  // collection.each(this.addView);
  //
  // `Function#apply` can be slow so we use the method's arg count, if we know it.
  var addMethod = function(length, method, attribute) {
    switch (length) {
      case 1: return function() {
        return _[method](this[attribute]);
      };
      case 2: return function(value) {
        return _[method](this[attribute], value);
      };
      case 3: return function(iteratee, context) {
        return _[method](this[attribute], cb(iteratee, this), context);
      };
      case 4: return function(iteratee, defaultVal, context) {
        return _[method](this[attribute], cb(iteratee, this), defaultVal, context);
      };
      default: return function() {
        var args = slice.call(arguments);
        args.unshift(this[attribute]);
        return _[method].apply(_, args);
      };
    }
  };
  var addUnderscoreMethods = function(Class, methods, attribute) {
    _.each(methods, function(length, method) {
      if (_[method]) Class.prototype[method] = addMethod(length, method, attribute);
    });
  };

  // Support `collection.sortBy('attr')` and `collection.findWhere({id: 1})`.
  var cb = function(iteratee, instance) {
    if (_.isFunction(iteratee)) return iteratee;
    if (_.isObject(iteratee) && !instance._isModel(iteratee)) return modelMatcher(iteratee);
    if (_.isString(iteratee)) return function(model) { return model.get(iteratee); };
    return iteratee;
  };
  var modelMatcher = function(attrs) {
    var matcher = _.matches(attrs);
    return function(model) {
      return matcher(model.attributes);
    };
  };

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // a custom event channel. You may bind a callback to an event with `on` or
  // remove with `off`; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {};

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Iterates over the standard `event, callback` (as well as the fancy multiple
  // space-separated events `"change blur", callback` and jQuery-style event
  // maps `{event: callback}`).
  var eventsApi = function(iteratee, events, name, callback, opts) {
    var i = 0, names;
    if (name && typeof name === 'object') {
      // Handle event maps.
      if (callback !== void 0 && 'context' in opts && opts.context === void 0) opts.context = callback;
      for (names = _.keys(name); i < names.length ; i++) {
        events = eventsApi(iteratee, events, names[i], name[names[i]], opts);
      }
    } else if (name && eventSplitter.test(name)) {
      // Handle space-separated event names by delegating them individually.
      for (names = name.split(eventSplitter); i < names.length; i++) {
        events = iteratee(events, names[i], callback, opts);
      }
    } else {
      // Finally, standard events.
      events = iteratee(events, name, callback, opts);
    }
    return events;
  };

  // Bind an event to a `callback` function. Passing `"all"` will bind
  // the callback to all events fired.
  Events.on = function(name, callback, context) {
    return internalOn(this, name, callback, context);
  };

  // Guard the `listening` argument from the public API.
  var internalOn = function(obj, name, callback, context, listening) {
    obj._events = eventsApi(onApi, obj._events || {}, name, callback, {
      context: context,
      ctx: obj,
      listening: listening
    });

    if (listening) {
      var listeners = obj._listeners || (obj._listeners = {});
      listeners[listening.id] = listening;
    }

    return obj;
  };

  // Inversion-of-control versions of `on`. Tell *this* object to listen to
  // an event in another object... keeping track of what it's listening to
  // for easier unbinding later.
  Events.listenTo = function(obj, name, callback) {
    if (!obj) return this;
    var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
    var listeningTo = this._listeningTo || (this._listeningTo = {});
    var listening = listeningTo[id];

    // This object is not listening to any other events on `obj` yet.
    // Setup the necessary references to track the listening callbacks.
    if (!listening) {
      var thisId = this._listenId || (this._listenId = _.uniqueId('l'));
      listening = listeningTo[id] = {obj: obj, objId: id, id: thisId, listeningTo: listeningTo, count: 0};
    }

    // Bind callbacks on obj, and keep track of them on listening.
    internalOn(obj, name, callback, this, listening);
    return this;
  };

  // The reducing API that adds a callback to the `events` object.
  var onApi = function(events, name, callback, options) {
    if (callback) {
      var handlers = events[name] || (events[name] = []);
      var context = options.context, ctx = options.ctx, listening = options.listening;
      if (listening) listening.count++;

      handlers.push({callback: callback, context: context, ctx: context || ctx, listening: listening});
    }
    return events;
  };

  // Remove one or many callbacks. If `context` is null, removes all
  // callbacks with that function. If `callback` is null, removes all
  // callbacks for the event. If `name` is null, removes all bound
  // callbacks for all events.
  Events.off = function(name, callback, context) {
    if (!this._events) return this;
    this._events = eventsApi(offApi, this._events, name, callback, {
      context: context,
      listeners: this._listeners
    });
    return this;
  };

  // Tell this object to stop listening to either specific events ... or
  // to every object it's currently listening to.
  Events.stopListening = function(obj, name, callback) {
    var listeningTo = this._listeningTo;
    if (!listeningTo) return this;

    var ids = obj ? [obj._listenId] : _.keys(listeningTo);

    for (var i = 0; i < ids.length; i++) {
      var listening = listeningTo[ids[i]];

      // If listening doesn't exist, this object is not currently
      // listening to obj. Break out early.
      if (!listening) break;

      listening.obj.off(name, callback, this);
    }

    return this;
  };

  // The reducing API that removes a callback from the `events` object.
  var offApi = function(events, name, callback, options) {
    if (!events) return;

    var i = 0, listening;
    var context = options.context, listeners = options.listeners;

    // Delete all events listeners and "drop" events.
    if (!name && !callback && !context) {
      var ids = _.keys(listeners);
      for (; i < ids.length; i++) {
        listening = listeners[ids[i]];
        delete listeners[listening.id];
        delete listening.listeningTo[listening.objId];
      }
      return;
    }

    var names = name ? [name] : _.keys(events);
    for (; i < names.length; i++) {
      name = names[i];
      var handlers = events[name];

      // Bail out if there are no events stored.
      if (!handlers) break;

      // Replace events if there are any remaining.  Otherwise, clean up.
      var remaining = [];
      for (var j = 0; j < handlers.length; j++) {
        var handler = handlers[j];
        if (
          callback && callback !== handler.callback &&
            callback !== handler.callback._callback ||
              context && context !== handler.context
        ) {
          remaining.push(handler);
        } else {
          listening = handler.listening;
          if (listening && --listening.count === 0) {
            delete listeners[listening.id];
            delete listening.listeningTo[listening.objId];
          }
        }
      }

      // Update tail event if the list has any events.  Otherwise, clean up.
      if (remaining.length) {
        events[name] = remaining;
      } else {
        delete events[name];
      }
    }
    return events;
  };

  // Bind an event to only be triggered a single time. After the first time
  // the callback is invoked, its listener will be removed. If multiple events
  // are passed in using the space-separated syntax, the handler will fire
  // once for each event, not once for a combination of all events.
  Events.once = function(name, callback, context) {
    // Map the event into a `{event: once}` object.
    var events = eventsApi(onceMap, {}, name, callback, _.bind(this.off, this));
    if (typeof name === 'string' && context == null) callback = void 0;
    return this.on(events, callback, context);
  };

  // Inversion-of-control versions of `once`.
  Events.listenToOnce = function(obj, name, callback) {
    // Map the event into a `{event: once}` object.
    var events = eventsApi(onceMap, {}, name, callback, _.bind(this.stopListening, this, obj));
    return this.listenTo(obj, events);
  };

  // Reduces the event callbacks into a map of `{event: onceWrapper}`.
  // `offer` unbinds the `onceWrapper` after it has been called.
  var onceMap = function(map, name, callback, offer) {
    if (callback) {
      var once = map[name] = _.once(function() {
        offer(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
    }
    return map;
  };

  // Trigger one or many events, firing all bound callbacks. Callbacks are
  // passed the same arguments as `trigger` is, apart from the event name
  // (unless you're listening on `"all"`, which will cause your callback to
  // receive the true name of the event as the first argument).
  Events.trigger = function(name) {
    if (!this._events) return this;

    var length = Math.max(0, arguments.length - 1);
    var args = Array(length);
    for (var i = 0; i < length; i++) args[i] = arguments[i + 1];

    eventsApi(triggerApi, this._events, name, void 0, args);
    return this;
  };

  // Handles triggering the appropriate event callbacks.
  var triggerApi = function(objEvents, name, callback, args) {
    if (objEvents) {
      var events = objEvents[name];
      var allEvents = objEvents.all;
      if (events && allEvents) allEvents = allEvents.slice();
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, [name].concat(args));
    }
    return objEvents;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return;
    }
  };

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Allow the `Backbone` object to serve as a global event bus, for folks who
  // want global "pubsub" in a convenient place.
  _.extend(Backbone, Events);

  // Backbone.Model
  // --------------

  // Backbone **Models** are the basic data object in the framework --
  // frequently representing a row in a table in a database on your server.
  // A discrete chunk of data and a bunch of useful, related methods for
  // performing computations and transformations on that data.

  // Create a new model with the specified attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function(attributes, options) {
    var attrs = attributes || {};
    options || (options = {});
    this.cid = _.uniqueId(this.cidPrefix);
    this.attributes = {};
    if (options.collection) this.collection = options.collection;
    if (options.parse) attrs = this.parse(attrs, options) || {};
    var defaults = _.result(this, 'defaults');
    attrs = _.defaults(_.extend({}, defaults, attrs), defaults);
    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // The value returned during the last failed validation.
    validationError: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // The prefix is used to create the client id which is used to identify models locally.
    // You may want to override this if you're experiencing name clashes with model ids.
    cidPrefix: 'c',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Proxy `Backbone.sync` by default -- but override this if you need
    // custom syncing semantics for *this* particular model.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      return _.escape(this.get(attr));
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Special-cased proxy to underscore's `_.matches` method.
    matches: function(attrs) {
      return !!_.iteratee(attrs, this)(this.attributes);
    },

    // Set a hash of model attributes on the object, firing `"change"`. This is
    // the core primitive operation of a model, updating the data and notifying
    // anyone who needs to know about the change in state. The heart of the beast.
    set: function(key, val, options) {
      if (key == null) return this;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      var attrs;
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options || (options = {});

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Extract attributes and options.
      var unset      = options.unset;
      var silent     = options.silent;
      var changes    = [];
      var changing   = this._changing;
      this._changing = true;

      if (!changing) {
        this._previousAttributes = _.clone(this.attributes);
        this.changed = {};
      }

      var current = this.attributes;
      var changed = this.changed;
      var prev    = this._previousAttributes;

      // For each `set` attribute, update or delete the current value.
      for (var attr in attrs) {
        val = attrs[attr];
        if (!_.isEqual(current[attr], val)) changes.push(attr);
        if (!_.isEqual(prev[attr], val)) {
          changed[attr] = val;
        } else {
          delete changed[attr];
        }
        unset ? delete current[attr] : current[attr] = val;
      }

      // Update the `id`.
      if (this.idAttribute in attrs) this.id = this.get(this.idAttribute);

      // Trigger all relevant attribute changes.
      if (!silent) {
        if (changes.length) this._pending = options;
        for (var i = 0; i < changes.length; i++) {
          this.trigger('change:' + changes[i], this, current[changes[i]], options);
        }
      }

      // You might be wondering why there's a `while` loop here. Changes can
      // be recursively nested within `"change"` events.
      if (changing) return this;
      if (!silent) {
        while (this._pending) {
          options = this._pending;
          this._pending = false;
          this.trigger('change', this, options);
        }
      }
      this._pending = false;
      this._changing = false;
      return this;
    },

    // Remove an attribute from the model, firing `"change"`. `unset` is a noop
    // if the attribute doesn't exist.
    unset: function(attr, options) {
      return this.set(attr, void 0, _.extend({}, options, {unset: true}));
    },

    // Clear all attributes on the model, firing `"change"`.
    clear: function(options) {
      var attrs = {};
      for (var key in this.attributes) attrs[key] = void 0;
      return this.set(attrs, _.extend({}, options, {unset: true}));
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (attr == null) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var old = this._changing ? this._previousAttributes : this.attributes;
      var changed = {};
      for (var attr in diff) {
        var val = diff[attr];
        if (_.isEqual(old[attr], val)) continue;
        changed[attr] = val;
      }
      return _.size(changed) ? changed : false;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (attr == null || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Fetch the model from the server, merging the response with the model's
    // local attributes. Any changed attributes will trigger a "change" event.
    fetch: function(options) {
      options = _.extend({parse: true}, options);
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        var serverAttrs = options.parse ? model.parse(resp, options) : resp;
        if (!model.set(serverAttrs, options)) return false;
        if (success) success.call(options.context, model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, val, options) {
      // Handle both `"key", value` and `{key: value}` -style arguments.
      var attrs;
      if (key == null || typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options = _.extend({validate: true, parse: true}, options);
      var wait = options.wait;

      // If we're not waiting and attributes exist, save acts as
      // `set(attr).save(null, opts)` with validation. Otherwise, check if
      // the model will be valid when the attributes, if any, are set.
      if (attrs && !wait) {
        if (!this.set(attrs, options)) return false;
      } else if (!this._validate(attrs, options)) {
        return false;
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      var model = this;
      var success = options.success;
      var attributes = this.attributes;
      options.success = function(resp) {
        // Ensure attributes are restored during synchronous saves.
        model.attributes = attributes;
        var serverAttrs = options.parse ? model.parse(resp, options) : resp;
        if (wait) serverAttrs = _.extend({}, attrs, serverAttrs);
        if (serverAttrs && !model.set(serverAttrs, options)) return false;
        if (success) success.call(options.context, model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);

      // Set temporary attributes if `{wait: true}` to properly find new ids.
      if (attrs && wait) this.attributes = _.extend({}, attributes, attrs);

      var method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
      if (method === 'patch' && !options.attrs) options.attrs = attrs;
      var xhr = this.sync(method, this, options);

      // Restore attributes.
      this.attributes = attributes;

      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;
      var wait = options.wait;

      var destroy = function() {
        model.stopListening();
        model.trigger('destroy', model, model.collection, options);
      };

      options.success = function(resp) {
        if (wait) destroy();
        if (success) success.call(options.context, model, resp, options);
        if (!model.isNew()) model.trigger('sync', model, resp, options);
      };

      var xhr = false;
      if (this.isNew()) {
        _.defer(options.success);
      } else {
        wrapError(this, options);
        xhr = this.sync('delete', this, options);
      }
      if (!wait) destroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base =
        _.result(this, 'urlRoot') ||
        _.result(this.collection, 'url') ||
        urlError();
      if (this.isNew()) return base;
      var id = this.get(this.idAttribute);
      return base.replace(/[^\/]$/, '$&/') + encodeURIComponent(id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return !this.has(this.idAttribute);
    },

    // Check if the model is currently in a valid state.
    isValid: function(options) {
      return this._validate({}, _.extend({}, options, {validate: true}));
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
    _validate: function(attrs, options) {
      if (!options.validate || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validationError = this.validate(attrs, options) || null;
      if (!error) return true;
      this.trigger('invalid', this, error, _.extend(options, {validationError: error}));
      return false;
    }

  });

  // Underscore methods that we want to implement on the Model, mapped to the
  // number of arguments they take.
  var modelMethods = {keys: 1, values: 1, pairs: 1, invert: 1, pick: 0,
      omit: 0, chain: 1, isEmpty: 1};

  // Mix in each Underscore method as a proxy to `Model#attributes`.
  addUnderscoreMethods(Model, modelMethods, 'attributes');

  // Backbone.Collection
  // -------------------

  // If models tend to represent a single row of data, a Backbone Collection is
  // more analogous to a table full of data ... or a small slice or page of that
  // table, or a collection of rows that belong together for a particular reason
  // -- all of the messages in this particular folder, all of the documents
  // belonging to this particular author, and so on. Collections maintain
  // indexes of their models, both in order, and for lookup by `id`.

  // Create a new **Collection**, perhaps to contain a specific type of `model`.
  // If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.model) this.model = options.model;
    if (options.comparator !== void 0) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, _.extend({silent: true}, options));
  };

  // Default options for `Collection#set`.
  var setOptions = {add: true, remove: true, merge: true};
  var addOptions = {add: true, remove: false};

  // Splices `insert` into `array` at index `at`.
  var splice = function(array, insert, at) {
    at = Math.min(Math.max(at, 0), array.length);
    var tail = Array(array.length - at);
    var length = insert.length;
    var i;
    for (i = 0; i < tail.length; i++) tail[i] = array[i + at];
    for (i = 0; i < length; i++) array[i + at] = insert[i];
    for (i = 0; i < tail.length; i++) array[i + length + at] = tail[i];
  };

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model) { return model.toJSON(options); });
    },

    // Proxy `Backbone.sync` by default.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Add a model, or list of models to the set. `models` may be Backbone
    // Models or raw JavaScript objects to be converted to Models, or any
    // combination of the two.
    add: function(models, options) {
      return this.set(models, _.extend({merge: false}, options, addOptions));
    },

    // Remove a model, or a list of models from the set.
    remove: function(models, options) {
      options = _.extend({}, options);
      var singular = !_.isArray(models);
      models = singular ? [models] : models.slice();
      var removed = this._removeModels(models, options);
      if (!options.silent && removed.length) {
        options.changes = {added: [], merged: [], removed: removed};
        this.trigger('update', this, options);
      }
      return singular ? removed[0] : removed;
    },

    // Update a collection by `set`-ing a new list of models, adding new ones,
    // removing models that are no longer present, and merging models that
    // already exist in the collection, as necessary. Similar to **Model#set**,
    // the core operation for updating the data contained by the collection.
    set: function(models, options) {
      if (models == null) return;

      options = _.extend({}, setOptions, options);
      if (options.parse && !this._isModel(models)) {
        models = this.parse(models, options) || [];
      }

      var singular = !_.isArray(models);
      models = singular ? [models] : models.slice();

      var at = options.at;
      if (at != null) at = +at;
      if (at > this.length) at = this.length;
      if (at < 0) at += this.length + 1;

      var set = [];
      var toAdd = [];
      var toMerge = [];
      var toRemove = [];
      var modelMap = {};

      var add = options.add;
      var merge = options.merge;
      var remove = options.remove;

      var sort = false;
      var sortable = this.comparator && at == null && options.sort !== false;
      var sortAttr = _.isString(this.comparator) ? this.comparator : null;

      // Turn bare objects into model references, and prevent invalid models
      // from being added.
      var model, i;
      for (i = 0; i < models.length; i++) {
        model = models[i];

        // If a duplicate is found, prevent it from being added and
        // optionally merge it into the existing model.
        var existing = this.get(model);
        if (existing) {
          if (merge && model !== existing) {
            var attrs = this._isModel(model) ? model.attributes : model;
            if (options.parse) attrs = existing.parse(attrs, options);
            existing.set(attrs, options);
            toMerge.push(existing);
            if (sortable && !sort) sort = existing.hasChanged(sortAttr);
          }
          if (!modelMap[existing.cid]) {
            modelMap[existing.cid] = true;
            set.push(existing);
          }
          models[i] = existing;

        // If this is a new, valid model, push it to the `toAdd` list.
        } else if (add) {
          model = models[i] = this._prepareModel(model, options);
          if (model) {
            toAdd.push(model);
            this._addReference(model, options);
            modelMap[model.cid] = true;
            set.push(model);
          }
        }
      }

      // Remove stale models.
      if (remove) {
        for (i = 0; i < this.length; i++) {
          model = this.models[i];
          if (!modelMap[model.cid]) toRemove.push(model);
        }
        if (toRemove.length) this._removeModels(toRemove, options);
      }

      // See if sorting is needed, update `length` and splice in new models.
      var orderChanged = false;
      var replace = !sortable && add && remove;
      if (set.length && replace) {
        orderChanged = this.length !== set.length || _.some(this.models, function(m, index) {
          return m !== set[index];
        });
        this.models.length = 0;
        splice(this.models, set, 0);
        this.length = this.models.length;
      } else if (toAdd.length) {
        if (sortable) sort = true;
        splice(this.models, toAdd, at == null ? this.length : at);
        this.length = this.models.length;
      }

      // Silently sort the collection if appropriate.
      if (sort) this.sort({silent: true});

      // Unless silenced, it's time to fire all appropriate add/sort/update events.
      if (!options.silent) {
        for (i = 0; i < toAdd.length; i++) {
          if (at != null) options.index = at + i;
          model = toAdd[i];
          model.trigger('add', model, this, options);
        }
        if (sort || orderChanged) this.trigger('sort', this, options);
        if (toAdd.length || toRemove.length || toMerge.length) {
          options.changes = {
            added: toAdd,
            removed: toRemove,
            merged: toMerge
          };
          this.trigger('update', this, options);
        }
      }

      // Return the added (or merged) model (or models).
      return singular ? models[0] : models;
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any granular `add` or `remove` events. Fires `reset` when finished.
    // Useful for bulk operations and optimizations.
    reset: function(models, options) {
      options = options ? _.clone(options) : {};
      for (var i = 0; i < this.models.length; i++) {
        this._removeReference(this.models[i], options);
      }
      options.previousModels = this.models;
      this._reset();
      models = this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return models;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      return this.add(model, _.extend({at: this.length}, options));
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      return this.remove(model, options);
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      return this.add(model, _.extend({at: 0}, options));
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      return this.remove(model, options);
    },

    // Slice out a sub-array of models from the collection.
    slice: function() {
      return slice.apply(this.models, arguments);
    },

    // Get a model from the set by id, cid, model object with id or cid
    // properties, or an attributes object that is transformed through modelId.
    get: function(obj) {
      if (obj == null) return void 0;
      return this._byId[obj] ||
        this._byId[this.modelId(obj.attributes || obj)] ||
        obj.cid && this._byId[obj.cid];
    },

    // Returns `true` if the model is in the collection.
    has: function(obj) {
      return this.get(obj) != null;
    },

    // Get the model at the given index.
    at: function(index) {
      if (index < 0) index += this.length;
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of
    // `filter`.
    where: function(attrs, first) {
      return this[first ? 'find' : 'filter'](attrs);
    },

    // Return the first model with matching attributes. Useful for simple cases
    // of `find`.
    findWhere: function(attrs) {
      return this.where(attrs, true);
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      var comparator = this.comparator;
      if (!comparator) throw new Error('Cannot sort a set without a comparator');
      options || (options = {});

      var length = comparator.length;
      if (_.isFunction(comparator)) comparator = _.bind(comparator, this);

      // Run sort based on type of `comparator`.
      if (length === 1 || _.isString(comparator)) {
        this.models = this.sortBy(comparator);
      } else {
        this.models.sort(comparator);
      }
      if (!options.silent) this.trigger('sort', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return this.map(attr + '');
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `reset: true` is passed, the response
    // data will be passed through the `reset` method instead of `set`.
    fetch: function(options) {
      options = _.extend({parse: true}, options);
      var success = options.success;
      var collection = this;
      options.success = function(resp) {
        var method = options.reset ? 'reset' : 'set';
        collection[method](resp, options);
        if (success) success.call(options.context, collection, resp, options);
        collection.trigger('sync', collection, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      options = options ? _.clone(options) : {};
      var wait = options.wait;
      model = this._prepareModel(model, options);
      if (!model) return false;
      if (!wait) this.add(model, options);
      var collection = this;
      var success = options.success;
      options.success = function(m, resp, callbackOpts) {
        if (wait) collection.add(m, callbackOpts);
        if (success) success.call(callbackOpts.context, m, resp, callbackOpts);
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new collection with an identical list of models as this one.
    clone: function() {
      return new this.constructor(this.models, {
        model: this.model,
        comparator: this.comparator
      });
    },

    // Define how to uniquely identify models in the collection.
    modelId: function(attrs) {
      return attrs[this.model.prototype.idAttribute || 'id'];
    },

    // Private method to reset all internal state. Called when the collection
    // is first initialized or reset.
    _reset: function() {
      this.length = 0;
      this.models = [];
      this._byId  = {};
    },

    // Prepare a hash of attributes (or other model) to be added to this
    // collection.
    _prepareModel: function(attrs, options) {
      if (this._isModel(attrs)) {
        if (!attrs.collection) attrs.collection = this;
        return attrs;
      }
      options = options ? _.clone(options) : {};
      options.collection = this;
      var model = new this.model(attrs, options);
      if (!model.validationError) return model;
      this.trigger('invalid', this, model.validationError, options);
      return false;
    },

    // Internal method called by both remove and set.
    _removeModels: function(models, options) {
      var removed = [];
      for (var i = 0; i < models.length; i++) {
        var model = this.get(models[i]);
        if (!model) continue;

        var index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;

        // Remove references before triggering 'remove' event to prevent an
        // infinite loop. #3693
        delete this._byId[model.cid];
        var id = this.modelId(model.attributes);
        if (id != null) delete this._byId[id];

        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }

        removed.push(model);
        this._removeReference(model, options);
      }
      return removed;
    },

    // Method for checking whether an object should be considered a model for
    // the purposes of adding to the collection.
    _isModel: function(model) {
      return model instanceof Model;
    },

    // Internal method to create a model's ties to a collection.
    _addReference: function(model, options) {
      this._byId[model.cid] = model;
      var id = this.modelId(model.attributes);
      if (id != null) this._byId[id] = model;
      model.on('all', this._onModelEvent, this);
    },

    // Internal method to sever a model's ties to a collection.
    _removeReference: function(model, options) {
      delete this._byId[model.cid];
      var id = this.modelId(model.attributes);
      if (id != null) delete this._byId[id];
      if (this === model.collection) delete model.collection;
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if (model) {
        if ((event === 'add' || event === 'remove') && collection !== this) return;
        if (event === 'destroy') this.remove(model, options);
        if (event === 'change') {
          var prevId = this.modelId(model.previousAttributes());
          var id = this.modelId(model.attributes);
          if (prevId !== id) {
            if (prevId != null) delete this._byId[prevId];
            if (id != null) this._byId[id] = model;
          }
        }
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  // 90% of the core usefulness of Backbone Collections is actually implemented
  // right here:
  var collectionMethods = {forEach: 3, each: 3, map: 3, collect: 3, reduce: 0,
      foldl: 0, inject: 0, reduceRight: 0, foldr: 0, find: 3, detect: 3, filter: 3,
      select: 3, reject: 3, every: 3, all: 3, some: 3, any: 3, include: 3, includes: 3,
      contains: 3, invoke: 0, max: 3, min: 3, toArray: 1, size: 1, first: 3,
      head: 3, take: 3, initial: 3, rest: 3, tail: 3, drop: 3, last: 3,
      without: 0, difference: 0, indexOf: 3, shuffle: 1, lastIndexOf: 3,
      isEmpty: 1, chain: 1, sample: 3, partition: 3, groupBy: 3, countBy: 3,
      sortBy: 3, indexBy: 3, findIndex: 3, findLastIndex: 3};

  // Mix in each Underscore method as a proxy to `Collection#models`.
  addUnderscoreMethods(Collection, collectionMethods, 'models');

  // Backbone.View
  // -------------

  // Backbone Views are almost more convention than they are actual code. A View
  // is simply a JavaScript object that represents a logical chunk of UI in the
  // DOM. This might be a single item, an entire list, a sidebar or panel, or
  // even the surrounding frame which wraps your whole app. Defining a chunk of
  // UI as a **View** allows you to define your DOM events declaratively, without
  // having to worry about render order ... and makes it easy for the view to
  // react to specific changes in the state of your models.

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    _.extend(this, _.pick(options, viewOptions));
    this._ensureElement();
    this.initialize.apply(this, arguments);
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be set as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be preferred to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view by taking the element out of the DOM, and removing any
    // applicable Backbone.Events listeners.
    remove: function() {
      this._removeElement();
      this.stopListening();
      return this;
    },

    // Remove this view's element from the document and all event listeners
    // attached to it. Exposed for subclasses using an alternative DOM
    // manipulation API.
    _removeElement: function() {
      this.$el.remove();
    },

    // Change the view's element (`this.el` property) and re-delegate the
    // view's events on the new element.
    setElement: function(element) {
      this.undelegateEvents();
      this._setElement(element);
      this.delegateEvents();
      return this;
    },

    // Creates the `this.el` and `this.$el` references for this view using the
    // given `el`. `el` can be a CSS selector or an HTML string, a jQuery
    // context or an element. Subclasses can override this to utilize an
    // alternative DOM manipulation API and are only required to set the
    // `this.el` property.
    _setElement: function(el) {
      this.$el = el instanceof Backbone.$ ? el : Backbone.$(el);
      this.el = this.$el[0];
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save',
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    delegateEvents: function(events) {
      events || (events = _.result(this, 'events'));
      if (!events) return this;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[method];
        if (!method) continue;
        var match = key.match(delegateEventSplitter);
        this.delegate(match[1], match[2], _.bind(method, this));
      }
      return this;
    },

    // Add a single event listener to the view's element (or a child element
    // using `selector`). This only works for delegate-able events: not `focus`,
    // `blur`, and not `change`, `submit`, and `reset` in Internet Explorer.
    delegate: function(eventName, selector, listener) {
      this.$el.on(eventName + '.delegateEvents' + this.cid, selector, listener);
      return this;
    },

    // Clears all callbacks previously bound to the view by `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      if (this.$el) this.$el.off('.delegateEvents' + this.cid);
      return this;
    },

    // A finer-grained `undelegateEvents` for removing a single delegated event.
    // `selector` and `listener` are both optional.
    undelegate: function(eventName, selector, listener) {
      this.$el.off(eventName + '.delegateEvents' + this.cid, selector, listener);
      return this;
    },

    // Produces a DOM element to be assigned to your view. Exposed for
    // subclasses using an alternative DOM manipulation API.
    _createElement: function(tagName) {
      return document.createElement(tagName);
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = _.extend({}, _.result(this, 'attributes'));
        if (this.id) attrs.id = _.result(this, 'id');
        if (this.className) attrs['class'] = _.result(this, 'className');
        this.setElement(this._createElement(_.result(this, 'tagName')));
        this._setAttributes(attrs);
      } else {
        this.setElement(_.result(this, 'el'));
      }
    },

    // Set attributes from a hash on this view's element.  Exposed for
    // subclasses using an alternative DOM manipulation API.
    _setAttributes: function(attributes) {
      this.$el.attr(attributes);
    }

  });

  // Backbone.sync
  // -------------

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    _.defaults(options || (options = {}), {
      emulateHTTP: Backbone.emulateHTTP,
      emulateJSON: Backbone.emulateJSON
    });

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = _.result(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(options.attrs || model.toJSON(options));
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (options.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
      params.type = 'POST';
      if (options.emulateJSON) params.data._method = type;
      var beforeSend = options.beforeSend;
      options.beforeSend = function(xhr) {
        xhr.setRequestHeader('X-HTTP-Method-Override', type);
        if (beforeSend) return beforeSend.apply(this, arguments);
      };
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !options.emulateJSON) {
      params.processData = false;
    }

    // Pass along `textStatus` and `errorThrown` from jQuery.
    var error = options.error;
    options.error = function(xhr, textStatus, errorThrown) {
      options.textStatus = textStatus;
      options.errorThrown = errorThrown;
      if (error) error.call(options.context, xhr, textStatus, errorThrown);
    };

    // Make the request, allowing the user to override any Ajax options.
    var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
    model.trigger('request', model, xhr, options);
    return xhr;
  };

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'patch': 'PATCH',
    'delete': 'DELETE',
    'read': 'GET'
  };

  // Set the default implementation of `Backbone.ajax` to proxy through to `$`.
  // Override this if you'd like to use a different library.
  Backbone.ajax = function() {
    return Backbone.$.ajax.apply(Backbone.$, arguments);
  };

  // Backbone.Router
  // ---------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var optionalParam = /\((.*?)\)/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (_.isFunction(name)) {
        callback = name;
        name = '';
      }
      if (!callback) callback = this[name];
      var router = this;
      Backbone.history.route(route, function(fragment) {
        var args = router._extractParameters(route, fragment);
        if (router.execute(callback, args, name) !== false) {
          router.trigger.apply(router, ['route:' + name].concat(args));
          router.trigger('route', name, args);
          Backbone.history.trigger('route', router, name, args);
        }
      });
      return this;
    },

    // Execute a route handler with the provided parameters.  This is an
    // excellent place to do pre-route setup or post-route cleanup.
    execute: function(callback, args, name) {
      if (callback) callback.apply(this, args);
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
      return this;
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      this.routes = _.result(this, 'routes');
      var route, routes = _.keys(this.routes);
      while ((route = routes.pop()) != null) {
        this.route(route, this.routes[route]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(optionalParam, '(?:$1)?')
                   .replace(namedParam, function(match, optional) {
                     return optional ? match : '([^/?]+)';
                   })
                   .replace(splatParam, '([^?]*?)');
      return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted decoded parameters. Empty or unmatched parameters will be
    // treated as `null` to normalize cross-browser behavior.
    _extractParameters: function(route, fragment) {
      var params = route.exec(fragment).slice(1);
      return _.map(params, function(param, i) {
        // Don't decode the search params.
        if (i === params.length - 1) return param || null;
        return param ? decodeURIComponent(param) : null;
      });
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on either
  // [pushState](http://diveintohtml5.info/history.html) and real URLs, or
  // [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
  // and URL fragments. If the browser supports neither (old IE, natch),
  // falls back to polling.
  var History = Backbone.History = function() {
    this.handlers = [];
    this.checkUrl = _.bind(this.checkUrl, this);

    // Ensure that `History` can be used outside of the browser.
    if (typeof window !== 'undefined') {
      this.location = window.location;
      this.history = window.history;
    }
  };

  // Cached regex for stripping a leading hash/slash and trailing space.
  var routeStripper = /^[#\/]|\s+$/g;

  // Cached regex for stripping leading and trailing slashes.
  var rootStripper = /^\/+|\/+$/g;

  // Cached regex for stripping urls of hash.
  var pathStripper = /#.*$/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Are we at the app root?
    atRoot: function() {
      var path = this.location.pathname.replace(/[^\/]$/, '$&/');
      return path === this.root && !this.getSearch();
    },

    // Does the pathname match the root?
    matchRoot: function() {
      var path = this.decodeFragment(this.location.pathname);
      var rootPath = path.slice(0, this.root.length - 1) + '/';
      return rootPath === this.root;
    },

    // Unicode characters in `location.pathname` are percent encoded so they're
    // decoded for comparison. `%25` should not be decoded since it may be part
    // of an encoded parameter.
    decodeFragment: function(fragment) {
      return decodeURI(fragment.replace(/%25/g, '%2525'));
    },

    // In IE6, the hash fragment and search params are incorrect if the
    // fragment contains `?`.
    getSearch: function() {
      var match = this.location.href.replace(/#.*/, '').match(/\?.+/);
      return match ? match[0] : '';
    },

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(window) {
      var match = (window || this).location.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the pathname and search params, without the root.
    getPath: function() {
      var path = this.decodeFragment(
        this.location.pathname + this.getSearch()
      ).slice(this.root.length - 1);
      return path.charAt(0) === '/' ? path.slice(1) : path;
    },

    // Get the cross-browser normalized URL fragment from the path or hash.
    getFragment: function(fragment) {
      if (fragment == null) {
        if (this._usePushState || !this._wantsHashChange) {
          fragment = this.getPath();
        } else {
          fragment = this.getHash();
        }
      }
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error('Backbone.history has already been started');
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({root: '/'}, this.options, options);
      this.root             = this.options.root;
      this._wantsHashChange = this.options.hashChange !== false;
      this._hasHashChange   = 'onhashchange' in window && (document.documentMode === void 0 || document.documentMode > 7);
      this._useHashChange   = this._wantsHashChange && this._hasHashChange;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.history && this.history.pushState);
      this._usePushState    = this._wantsPushState && this._hasPushState;
      this.fragment         = this.getFragment();

      // Normalize root to always include a leading and trailing slash.
      this.root = ('/' + this.root + '/').replace(rootStripper, '/');

      // Transition from hashChange to pushState or vice versa if both are
      // requested.
      if (this._wantsHashChange && this._wantsPushState) {

        // If we've started off with a route from a `pushState`-enabled
        // browser, but we're currently in a browser that doesn't support it...
        if (!this._hasPushState && !this.atRoot()) {
          var rootPath = this.root.slice(0, -1) || '/';
          this.location.replace(rootPath + '#' + this.getPath());
          // Return immediately as browser will do redirect to new url
          return true;

        // Or if we've started out with a hash-based route, but we're currently
        // in a browser where it could be `pushState`-based instead...
        } else if (this._hasPushState && this.atRoot()) {
          this.navigate(this.getHash(), {replace: true});
        }

      }

      // Proxy an iframe to handle location events if the browser doesn't
      // support the `hashchange` event, HTML5 history, or the user wants
      // `hashChange` but not `pushState`.
      if (!this._hasHashChange && this._wantsHashChange && !this._usePushState) {
        this.iframe = document.createElement('iframe');
        this.iframe.src = 'javascript:0';
        this.iframe.style.display = 'none';
        this.iframe.tabIndex = -1;
        var body = document.body;
        // Using `appendChild` will throw on IE < 9 if the document is not ready.
        var iWindow = body.insertBefore(this.iframe, body.firstChild).contentWindow;
        iWindow.document.open();
        iWindow.document.close();
        iWindow.location.hash = '#' + this.fragment;
      }

      // Add a cross-platform `addEventListener` shim for older browsers.
      var addEventListener = window.addEventListener || function(eventName, listener) {
        return attachEvent('on' + eventName, listener);
      };

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._usePushState) {
        addEventListener('popstate', this.checkUrl, false);
      } else if (this._useHashChange && !this.iframe) {
        addEventListener('hashchange', this.checkUrl, false);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      if (!this.options.silent) return this.loadUrl();
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      // Add a cross-platform `removeEventListener` shim for older browsers.
      var removeEventListener = window.removeEventListener || function(eventName, listener) {
        return detachEvent('on' + eventName, listener);
      };

      // Remove window listeners.
      if (this._usePushState) {
        removeEventListener('popstate', this.checkUrl, false);
      } else if (this._useHashChange && !this.iframe) {
        removeEventListener('hashchange', this.checkUrl, false);
      }

      // Clean up the iframe if necessary.
      if (this.iframe) {
        document.body.removeChild(this.iframe);
        this.iframe = null;
      }

      // Some environments will throw when clearing an undefined interval.
      if (this._checkUrlInterval) clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();

      // If the user pressed the back button, the iframe's hash will have
      // changed and we should use that for comparison.
      if (current === this.fragment && this.iframe) {
        current = this.getHash(this.iframe.contentWindow);
      }

      if (current === this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl();
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragment) {
      // If the root doesn't match, no routes can match either.
      if (!this.matchRoot()) return false;
      fragment = this.fragment = this.getFragment(fragment);
      return _.some(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: !!options};

      // Normalize the fragment.
      fragment = this.getFragment(fragment || '');

      // Don't include a trailing slash on the root.
      var rootPath = this.root;
      if (fragment === '' || fragment.charAt(0) === '?') {
        rootPath = rootPath.slice(0, -1) || '/';
      }
      var url = rootPath + fragment;

      // Strip the hash and decode for matching.
      fragment = this.decodeFragment(fragment.replace(pathStripper, ''));

      if (this.fragment === fragment) return;
      this.fragment = fragment;

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._usePushState) {
        this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this._updateHash(this.location, fragment, options.replace);
        if (this.iframe && fragment !== this.getHash(this.iframe.contentWindow)) {
          var iWindow = this.iframe.contentWindow;

          // Opening and closing the iframe tricks IE7 and earlier to push a
          // history entry on hash-tag change.  When replace is true, we don't
          // want this.
          if (!options.replace) {
            iWindow.document.open();
            iWindow.document.close();
          }

          this._updateHash(iWindow.location, fragment, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        return this.location.assign(url);
      }
      if (options.trigger) return this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        var href = location.href.replace(/(javascript:|#).*$/, '');
        location.replace(href + '#' + fragment);
      } else {
        // Some browsers require that `hash` contains a leading #.
        location.hash = '#' + fragment;
      }
    }

  });

  // Create the default Backbone.history.
  Backbone.history = new History;

  // Helpers
  // -------

  // Helper function to correctly set up the prototype chain for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function and add the prototype properties.
    child.prototype = _.create(parent.prototype, protoProps);
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Set up inheritance for the model, collection, router, view and history.
  Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

  // Wrap an optional error callback with a fallback error event.
  var wrapError = function(model, options) {
    var error = options.error;
    options.error = function(resp) {
      if (error) error.call(options.context, model, resp, options);
      model.trigger('error', model, resp, options);
    };
  };

  return Backbone;
});

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"jquery":"jquery","underscore":67}],14:[function(require,module,exports){
module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

},{}],15:[function(require,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = require('./_wks')('unscopables');
var ArrayProto = Array.prototype;
if (ArrayProto[UNSCOPABLES] == undefined) require('./_hide')(ArrayProto, UNSCOPABLES, {});
module.exports = function (key) {
  ArrayProto[UNSCOPABLES][key] = true;
};

},{"./_hide":30,"./_wks":58}],16:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

},{"./_is-object":34}],17:[function(require,module,exports){
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

},{"./_to-absolute-index":51,"./_to-iobject":53,"./_to-length":54}],18:[function(require,module,exports){
var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};

},{}],19:[function(require,module,exports){
var core = module.exports = { version: '2.6.12' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

},{}],20:[function(require,module,exports){
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

},{"./_a-function":14}],21:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

},{}],22:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_fails":26}],23:[function(require,module,exports){
var isObject = require('./_is-object');
var document = require('./_global').document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};

},{"./_global":28,"./_is-object":34}],24:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');

},{}],25:[function(require,module,exports){
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

},{"./_core":19,"./_ctx":20,"./_global":28,"./_hide":30,"./_redefine":47}],26:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

},{}],27:[function(require,module,exports){
module.exports = require('./_shared')('native-function-to-string', Function.toString);

},{"./_shared":50}],28:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

},{}],29:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};

},{}],30:[function(require,module,exports){
var dP = require('./_object-dp');
var createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

},{"./_descriptors":22,"./_object-dp":41,"./_property-desc":46}],31:[function(require,module,exports){
var document = require('./_global').document;
module.exports = document && document.documentElement;

},{"./_global":28}],32:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function () {
  return Object.defineProperty(require('./_dom-create')('div'), 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_descriptors":22,"./_dom-create":23,"./_fails":26}],33:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};

},{"./_cof":18}],34:[function(require,module,exports){
module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

},{}],35:[function(require,module,exports){
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

},{"./_hide":30,"./_object-create":40,"./_property-desc":46,"./_set-to-string-tag":48,"./_wks":58}],36:[function(require,module,exports){
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

},{"./_export":25,"./_hide":30,"./_iter-create":35,"./_iterators":38,"./_library":39,"./_object-gpo":43,"./_redefine":47,"./_set-to-string-tag":48,"./_wks":58}],37:[function(require,module,exports){
module.exports = function (done, value) {
  return { value: value, done: !!done };
};

},{}],38:[function(require,module,exports){
module.exports = {};

},{}],39:[function(require,module,exports){
module.exports = false;

},{}],40:[function(require,module,exports){
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

},{"./_an-object":16,"./_dom-create":23,"./_enum-bug-keys":24,"./_html":31,"./_object-dps":42,"./_shared-key":49}],41:[function(require,module,exports){
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

},{"./_an-object":16,"./_descriptors":22,"./_ie8-dom-define":32,"./_to-primitive":56}],42:[function(require,module,exports){
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

},{"./_an-object":16,"./_descriptors":22,"./_object-dp":41,"./_object-keys":45}],43:[function(require,module,exports){
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

},{"./_has":29,"./_shared-key":49,"./_to-object":55}],44:[function(require,module,exports){
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

},{"./_array-includes":17,"./_has":29,"./_shared-key":49,"./_to-iobject":53}],45:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = require('./_object-keys-internal');
var enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};

},{"./_enum-bug-keys":24,"./_object-keys-internal":44}],46:[function(require,module,exports){
module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

},{}],47:[function(require,module,exports){
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

},{"./_core":19,"./_function-to-string":27,"./_global":28,"./_has":29,"./_hide":30,"./_uid":57}],48:[function(require,module,exports){
var def = require('./_object-dp').f;
var has = require('./_has');
var TAG = require('./_wks')('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};

},{"./_has":29,"./_object-dp":41,"./_wks":58}],49:[function(require,module,exports){
var shared = require('./_shared')('keys');
var uid = require('./_uid');
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};

},{"./_shared":50,"./_uid":57}],50:[function(require,module,exports){
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

},{"./_core":19,"./_global":28,"./_library":39}],51:[function(require,module,exports){
var toInteger = require('./_to-integer');
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};

},{"./_to-integer":52}],52:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

},{}],53:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject');
var defined = require('./_defined');
module.exports = function (it) {
  return IObject(defined(it));
};

},{"./_defined":21,"./_iobject":33}],54:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer');
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

},{"./_to-integer":52}],55:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function (it) {
  return Object(defined(it));
};

},{"./_defined":21}],56:[function(require,module,exports){
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

},{"./_is-object":34}],57:[function(require,module,exports){
var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

},{}],58:[function(require,module,exports){
var store = require('./_shared')('wks');
var uid = require('./_uid');
var Symbol = require('./_global').Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;

},{"./_global":28,"./_shared":50,"./_uid":57}],59:[function(require,module,exports){
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

},{"./_add-to-unscopables":15,"./_iter-define":36,"./_iter-step":37,"./_iterators":38,"./_to-iobject":53}],60:[function(require,module,exports){
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

},{"./_global":28,"./_hide":30,"./_iterators":38,"./_object-keys":45,"./_redefine":47,"./_wks":58,"./es6.array.iterator":59}],61:[function(require,module,exports){
"use strict";

module.exports = require('./src/ContentMessenger');

},{"./src/ContentMessenger":62}],62:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var Messenger = require('./Messenger');

var ContentTopic = require('./ContentTopic');

var chrome = require('./chrome');

var ContentMessenger = /*#__PURE__*/function (_Messenger) {
  (0, _inherits2["default"])(ContentMessenger, _Messenger);

  var _super = _createSuper(ContentMessenger);

  function ContentMessenger() {
    var _this;

    (0, _classCallCheck2["default"])(this, ContentMessenger);
    _this = _super.call(this, ContentTopic);

    var onMessage = _this._onMessage.bind((0, _assertThisInitialized2["default"])(_this));

    chrome.runtime.onMessage.addListener(onMessage); // Workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=1296609

    window.addEventListener('unload', function () {
      chrome.runtime.onMessage.removeListener(onMessage);
    });
    var port = chrome.runtime.connect({
      name: 'ContentMessenger'
    });
    port.onDisconnect.addListener(_this._onDisconnect.bind((0, _assertThisInitialized2["default"])(_this)));
    return _this;
  }

  (0, _createClass2["default"])(ContentMessenger, [{
    key: "_onMessage",
    value: function _onMessage(message, sender, callback) {
      if (!sender.tab && message.publish) {
        var topic = this._getTopic(message.publish);

        if (topic) {
          topic.publish(message.message, callback);
        }
      }

      return true; // Allows callbacks to be called asynchronos
    }
  }, {
    key: "_onDisconnect",
    value: function _onDisconnect() {
      var topic = this._getTopic('Background:closed');

      if (topic) {
        topic.publish();
      }
    }
  }, {
    key: "publish",
    value: function publish(topicName, message, callback) {
      var retries = 10;
      var delay = 50;
      var NO_RECIEVING_END = 'Could not establish connection. Receiving end does not exist.';

      var sendMessage = function sendMessage() {
        chrome.runtime.sendMessage({
          publish: topicName,
          message: message
        }, function (response) {
          var error = chrome.runtime.lastError;

          if (error && error.message === NO_RECIEVING_END) {
            retries -= 1;
            if (retries) setTimeout(sendMessage, delay);
          } else if (typeof callback === 'function') {
            callback(response);
          }
        });
      };

      sendMessage();
    }
  }]);
  return ContentMessenger;
}(Messenger);

module.exports = ContentMessenger;

},{"./ContentTopic":63,"./Messenger":64,"./chrome":66,"@babel/runtime/helpers/assertThisInitialized":4,"@babel/runtime/helpers/classCallCheck":5,"@babel/runtime/helpers/createClass":6,"@babel/runtime/helpers/getPrototypeOf":7,"@babel/runtime/helpers/inherits":8,"@babel/runtime/helpers/interopRequireDefault":9,"@babel/runtime/helpers/possibleConstructorReturn":10}],63:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var Topic = require('./Topic');

var chrome = require('./chrome');

var ContentTopic = /*#__PURE__*/function (_Topic) {
  (0, _inherits2["default"])(ContentTopic, _Topic);

  var _super = _createSuper(ContentTopic);

  function ContentTopic(name) {
    var _this;

    (0, _classCallCheck2["default"])(this, ContentTopic);
    _this = _super.call(this, name);
    chrome.runtime.sendMessage({
      subscribe: name
    });
    return _this;
  }

  return ContentTopic;
}(Topic);

module.exports = ContentTopic;

},{"./Topic":65,"./chrome":66,"@babel/runtime/helpers/classCallCheck":5,"@babel/runtime/helpers/getPrototypeOf":7,"@babel/runtime/helpers/inherits":8,"@babel/runtime/helpers/interopRequireDefault":9,"@babel/runtime/helpers/possibleConstructorReturn":10}],64:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var Messenger = /*#__PURE__*/function () {
  function Messenger(topicClass) {
    (0, _classCallCheck2["default"])(this, Messenger);
    this._topicClass = topicClass;
    this._topics = {};
  }

  (0, _createClass2["default"])(Messenger, [{
    key: "_getTopic",
    value: function _getTopic(name, create) {
      var topic = this._topics[name];

      if (!topic && create) {
        this._topics[name] = topic = new this._topicClass(name);
      }

      return topic;
    }
  }, {
    key: "subscribe",
    value: function subscribe(topicName, callback) {
      this._getTopic(topicName, true).subscribe(callback);
    }
  }, {
    key: "publish",
    value: function publish(topicName, message, callback, sender) {
      var topic = this._getTopic(topicName);

      if (topic) {
        topic.publish(message, callback, sender);
      }
    }
  }], [{
    key: "getInstance",
    value: function getInstance() {
      if (!this._instance) {
        this._instance = new this();
      }

      return this._instance;
    }
  }]);
  return Messenger;
}();

module.exports = Messenger;

},{"@babel/runtime/helpers/classCallCheck":5,"@babel/runtime/helpers/createClass":6,"@babel/runtime/helpers/interopRequireDefault":9}],65:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var Topic = /*#__PURE__*/function () {
  function Topic(name) {
    (0, _classCallCheck2["default"])(this, Topic);
    this._name = name; // Subscribers in the same context (functions)

    this._callbacks = [];
  }

  (0, _createClass2["default"])(Topic, [{
    key: "publish",
    value: function publish(message, callback) {
      var cb = this._wrapCallback(callback);

      this._callbacks.forEach(function (fn) {
        return fn(message, cb);
      });
    }
  }, {
    key: "_wrapCallback",
    value: function _wrapCallback(callback) {
      if (callback == null) {
        return callback;
      }

      return function () {
        try {
          callback.apply(void 0, arguments);
        } catch (e) {
          if (e.message !== 'Attempting to use a disconnected port object') {
            throw e;
          }
        }
      };
    }
  }, {
    key: "subscribe",
    value: function subscribe(callback) {
      this._callbacks.push(callback);
    }
  }]);
  return Topic;
}();

module.exports = Topic;

},{"@babel/runtime/helpers/classCallCheck":5,"@babel/runtime/helpers/createClass":6,"@babel/runtime/helpers/interopRequireDefault":9}],66:[function(require,module,exports){
"use strict";

/* globals chrome, browser */
if (typeof browser !== 'undefined' && browser.runtime) {
  module.exports = browser;
} else {
  module.exports = chrome;
}

},{}],67:[function(require,module,exports){
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}],68:[function(require,module,exports){
(function (global){(function (){
/*!
Copyright (C) 2015-2017 Andrea Giammarchi - @WebReflection

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
'use strict';

function URLSearchParams(query) {
  var
    index, key, value,
    pairs, i, length,
    dict = Object.create(null)
  ;
  this[secret] = dict;
  if (!query) return;
  if (typeof query === 'string') {
    if (query.charAt(0) === '?') {
      query = query.slice(1);
    }
    for (
      pairs = query.split('&'),
      i = 0,
      length = pairs.length; i < length; i++
    ) {
      value = pairs[i];
      index = value.indexOf('=');
      if (-1 < index) {
        appendTo(
          dict,
          decode(value.slice(0, index)),
          decode(value.slice(index + 1))
        );
      } else if (value.length){
        appendTo(
          dict,
          decode(value),
          ''
        );
      }
    }
  } else {
    if (isArray(query)) {
      for (
        i = 0,
        length = query.length; i < length; i++
      ) {
        value = query[i];
        appendTo(dict, value[0], value[1]);
      }
    } else {
      for (key in query) {
         appendTo(dict, key, query[key]);
      }
    }
  }
}

var
  isArray = Array.isArray,
  URLSearchParamsProto = URLSearchParams.prototype,
  find = /[!'\(\)~]|%20|%00/g,
  plus = /\+/g,
  replace = {
    '!': '%21',
    "'": '%27',
    '(': '%28',
    ')': '%29',
    '~': '%7E',
    '%20': '+',
    '%00': '\x00'
  },
  replacer = function (match) {
    return replace[match];
  },
  secret = '__URLSearchParams__:' + Math.random()
;

function appendTo(dict, name, value) {
  if (name in dict) {
    dict[name].push('' + value);
  } else {
    dict[name] = isArray(value) ? value : ['' + value];
  }
}

function decode(str) {
  return decodeURIComponent(str.replace(plus, ' '));
}

function encode(str) {
  return encodeURIComponent(str).replace(find, replacer);
}

URLSearchParamsProto.append = function append(name, value) {
  appendTo(this[secret], name, value);
};

URLSearchParamsProto.delete = function del(name) {
  delete this[secret][name];
};

URLSearchParamsProto.get = function get(name) {
  var dict = this[secret];
  return name in dict ? dict[name][0] : null;
};

URLSearchParamsProto.getAll = function getAll(name) {
  var dict = this[secret];
  return name in dict ? dict[name].slice(0) : [];
};

URLSearchParamsProto.has = function has(name) {
  return name in this[secret];
};

URLSearchParamsProto.set = function set(name, value) {
  this[secret][name] = ['' + value];
};

URLSearchParamsProto.forEach = function forEach(callback, thisArg) {
  var dict = this[secret];
  Object.getOwnPropertyNames(dict).forEach(function(name) {
    dict[name].forEach(function(value) {
      callback.call(thisArg, value, name, this);
    }, this);
  }, this);
};

/*
URLSearchParamsProto.toBody = function() {
  return new Blob(
    [this.toString()],
    {type: 'application/x-www-form-urlencoded'}
  );
};
*/

URLSearchParamsProto.toJSON = function toJSON() {
  return {};
};

URLSearchParamsProto.toString = function toString() {
  var dict = this[secret], query = [], i, key, name, value;
  for (key in dict) {
    name = encode(key);
    for (
      i = 0,
      value = dict[key];
      i < value.length; i++
    ) {
      query.push(name + '=' + encode(value[i]));
    }
  }
  return query.join('&');
};

URLSearchParams = (module.exports = global.URLSearchParams || URLSearchParams);

(function (URLSearchParamsProto) {

  var iterable = (function () {
    try {
      return !!Symbol.iterator;
    } catch(error) {
      return false;
    }
  }());

  // mostly related to issue #24
  if (!('forEach' in URLSearchParamsProto)) {
    URLSearchParamsProto.forEach = function forEach(callback, thisArg) {
      var names = Object.create(null);
      this.toString()
          .replace(/=[\s\S]*?(?:&|$)/g, '=')
          .split('=')
          .forEach(function (name) {
            if (!name.length || name in names) return;
            (names[name] = this.getAll(name)).forEach(function(value) {
              callback.call(thisArg, value, name, this);
            }, this);
          }, this);
    };
  }

  if (!('keys' in URLSearchParamsProto)) {
    URLSearchParamsProto.keys = function keys() {
      var items = [];
      this.forEach(function(value, name) { items.push(name); });
      var iterator = {
        next: function() {
          var value = items.shift();
          return {done: value === undefined, value: value};
        }
      };

      if (iterable) {
        iterator[Symbol.iterator] = function() {
          return iterator;
        };
      }

      return iterator;
    };
  }

  if (!('values' in URLSearchParamsProto)) {
    URLSearchParamsProto.values = function values() {
      var items = [];
      this.forEach(function(value) { items.push(value); });
      var iterator = {
        next: function() {
          var value = items.shift();
          return {done: value === undefined, value: value};
        }
      };

      if (iterable) {
        iterator[Symbol.iterator] = function() {
          return iterator;
        };
      }

      return iterator;
    };
  }

  if (!('entries' in URLSearchParamsProto)) {
    URLSearchParamsProto.entries = function entries() {
      var items = [];
      this.forEach(function(value, name) { items.push([name, value]); });
      var iterator = {
        next: function() {
          var value = items.shift();
          return {done: value === undefined, value: value};
        }
      };

      if (iterable) {
        iterator[Symbol.iterator] = function() {
          return iterator;
        };
      }

      return iterator;
    };
  }

  if (iterable && !(Symbol.iterator in URLSearchParamsProto)) {
    URLSearchParamsProto[Symbol.iterator] = URLSearchParamsProto.entries;
  }

  if (!('sort' in URLSearchParamsProto)) {
    URLSearchParamsProto.sort = function sort() {
      var
        entries = this.entries(),
        entry = entries.next(),
        done = entry.done,
        keys = [],
        values = Object.create(null),
        i, key, value
      ;
      while (!done) {
        value = entry.value;
        key = value[0];
        keys.push(key);
        if (!(key in values)) {
          values[key] = [];
        }
        values[key].push(value[1]);
        entry = entries.next();
        done = entry.done;
      }
      // not the champion in efficiency
      // but these two bits just do the job
      keys.sort();
      for (i = 0; i < keys.length; i++) {
        this.delete(keys[i]);
      }
      for (i = 0; i < keys.length; i++) {
        key = keys[i];
        this.append(key, values[key].shift());
      }
    };
  }

}(URLSearchParams.prototype));

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],69:[function(require,module,exports){
module.exports = "<header class=\"header\">\n  <img class=\"header__img\" src=\"/img/avira_icon48.png\" alt=\"Avira\" width=\"48\" />\n</header>\n\n<div id=\"message\" class=\"abs-page\">\n  <article class=\"content\">\n     <img class=\"message__img\" src=\"/img/abs-danger.svg\" />\n    {{^ isPUADownload }}\n      <h1 id=\"domain\" class=\"txt--xl mb0\" title=\"{{ url }}\">{{ domain }}</h1>\n    {{/ isPUADownload }}\n\n    <h2 id=\"title\" class=\"txt--xl {{# isPUADownload }} mbs {{/ isPUADownload }}\">{{ title }}</h2>\n\n    {{^ isPUADownload }}\n      {{# subtitle}}\n        <div id=\"subtitle\" class=\"txt--s txt--center txt--lead txt--osans\"> {{ subtitle }}\n        {{# isMSE }}\n          <button id=\"btn-mse-take-me-away\" class=\"button mbs\" data-href=\"{{> lnk_avira }}\">{{> lb_mse_take_me_away }}</button>\n        {{/ isMSE }}\n        {{^ isMSE }}\n          <button id=\"btn-back\" class=\"button mbs mtm\" data-href=\"{{> lnk_avira }}\">\n            {{# isPUADownload }}\n              {{> lb_dash_pua_action_cancel }}\n            {{/ isPUADownload }}\n            {{^ isPUADownload }}\n              {{> btn_blocking_back }}\n            {{/ isPUADownload }}\n          </button>\n        {{/ isMSE }}\n        </div>\n      {{/ subtitle}}\n    {{/ isPUADownload }}\n\n    {{# isPUADownload }}\n      <div id=\"subtitle\" class=\"txt--lead txt--center txt--osans\">\n        <a href=\"{{> lnk_what_is_pua }}\" target=\"_blank\">\n          {{> msg_what_is_pua }}\n        </a>\n        {{# isMSE }}\n          <button id=\"btn-mse-take-me-away\" class=\"button mbs\" data-href=\"{{> lnk_avira }}\">{{> lb_mse_take_me_away }}</button>\n        {{/ isMSE }}\n        {{^ isMSE }}\n          <button id=\"btn-back\" class=\"button mbs mtm\">\n            {{# isPUADownload }}\n              {{> lb_dash_pua_action_cancel }}\n            {{/ isPUADownload }}\n            {{^ isPUADownload }}\n              {{> btn_blocking_back }}\n            {{/ isPUADownload }}\n          </button>\n        {{/ isMSE }}\n      </div>\n    {{/ isPUADownload }}\n\n    <div>\n      {{# isPUADownload }}\n        <a id=\"btn-continue\" href=\"#\">{{> btn_blocking_continue }}</a>\n      {{/ isPUADownload }}\n      {{^ isPUADownload }}\n          <section class=\"ptm\">\n\n            <div class=\"check txt--lead\">\n              <input\n                id=\"cb-add-exception\"\n                type=\"checkbox\"\n                name=\"check\"\n              />\n\n              <label class=\"check__label check__action mbs\" for=\"cb-add-exception\">\n                <i class=\"check__box\"></i>\n                <span>{{> lb_blocking_add_exception }}</span>\n              </label>\n\n              <div class=\"check__action\">\n                <a id=\"btn-continue\" class=\"txt--osans txt--semibold\" href=\"#\">{{> btn_blocking_continue }}</a>\n              </div>\n            </div>\n\n      {{/ isPUADownload }}\n    </div>\n\n  </article>\n</div>\n";

},{}],70:[function(require,module,exports){
module.exports={
    "lb_safe_website": "Sichere Webseite",
    "lb_unsafe_website": "Unsichere Webseite",
    "lb_unsafe_content_website": "Unsicherer Inhalt",
    "lb_mse_website": "Nicht vertrauenswürdige Suchmaschine",
    "lb_trackers_blocked": "{{ count }} Werbeanzeigen und Tracker auf {{ domain }} <span class=\"txt--green\">blockiert</span>",
    "lb_trackers_blocked_short": "{{ count }} Werbeanzeigen und Tracker blockiert",
    "lb_trackers_block_all": "Auf dieser Webseite blockieren",
    "lb_trackers_allow_all": "Werbeanzeigen und Tracker freigeben",
    "msg_no_trackers": "Es gibt auf dieser Webseite keine Tracker, die Sie verfolgen. Wenn Sie eine Webseite mit aktiven Trackern öffnen, wird hier eine vollständige Liste der Tracker angezeigt.",
    "msg_trackers_tooltip": "Das sind alle Tracker der aktuell geöffneten Webseite. Sie können einen Tracker blockieren, indem Sie den nebenstehenden Regler klicken. Ist die Farbe des Reglers grün, wird der dazugehörige Tracker blockiert und kann Ihr Surfverhalten nicht verfolgen. Beachten Sie, dass manche Tracker standardmäßig erlaubt sind. Ein Blockieren dieser Tracker kann dazu führen, dass die Webseite nicht ordnungsgemäß funktioniert.",
    "lb_settings": "Einstellungen",
    "lb_setting_offers": "Preisvergleich anzeigen",
    "lb_setting_tooltip_offers": "Für die Artikel, an denen Sie interessiert sind, werden bessere Angebote ausschließlich von sicheren Webseiten angezeigt.",
    "lb_setting_dnt_header": "Do-Not-Track-Header senden",
    "lb_setting_tooltip_dnt_header": "Fordern Sie Webseiten auf, Sie nicht zu verfolgen. Falls Ihre Aufforderung ignoriert wird, blockiert ABS weiterhin alle Tracker.",
    "lb_setting_top_bar": "Sicherheitsleiste anzeigen",
    "lb_setting_block_trackers": "Tracker standardmäßig blockieren",
    "lb_setting_tooltip_block_trackers": "Schützen Sie Ihre Privatsphäre, indem Sie Tracker standardmäßig blockieren.",
    "lb_setting_cliqz": "Sichere Suche mit CLIQZ",
    "lb_setting_tooltip_cliqz": "Schon während Sie in der Adressleiste Ihres Browsers tippen, schlägt CLIQZ Ihnen Webseiten und relevante Informationen vor. Dadurch suchen Sie effizienter, schneller und sicherer.",
    "lb_setting_privacy_badger": "Privacy Badger",
    "lb_setting_tooltip_privacy_badger": "Privacy Badger blockiert Werbeanzeigen und Tracker, die Sie ohne Ihre Erlaubnis heimlich ausspionieren wollen.",
    "lb_setting_https_everywhere": "HTTPS Everywhere",
    "lb_setting_tooltip_https_everywhere": "HTTPS Everywhere verschlüsselt Ihre gesamte Kommunikation und schützt Sie beim Surfen.",
    "lb_setting_inAppTracking": "Anonymisierte Statistik",
    "lb_setting_tooltip_inAppTracking": "Helfen Sie, unsere Produkte zu verbessern, indem Sie Daten anonym mit uns teilen.",
    "lb_setting_show_advanced_controls": "Mehr Steuerelemente anzeigen",
    "lb_setting_tooltip_show_advanced_controls": "Zeigt Privacy Badger und HTTPS Everywhere in der Symbolleiste.",
    "lb_setting_google_services": "Google-Dienste",
    "lb_setting_adguard": "Werbeanzeigen und Web-Tracking blockieren",
    "lb_setting_tooltip_adguard": "Schützt Ihre Privatsphäre, indem andere daran gehindert werden, Ihre Online-Aktivität zu überwachen. Blockiert auch aufdringliche Pop-ups, Webbanner, Videoanzeigen und mehr.",
    "lb_setting_adguard_social_media": "Tracking durch soziale Medien blockieren",
    "lb_setting_tooltip_adguard_social_media": "Deaktiviert Social-Media-Schaltflächen und Widgets auf Webseiten, sodass soziale Netzwerke nicht verfolgen können, welche Webseiten Sie besuchen.",
    "lb_setting_adguard_useful_ads": "Nützliche Werbe-Anzeigen nicht blockieren",
    "lb_setting_tooltip_adguard_useful_ads": "Relevante, nicht aufdringliche Anzeigen können in Ihren Suchergebnissen angezeigt werden.",
    "lb_setting_extension_scan": "Analyse der Erweiterungen",
    "lb_setting_tooltip_extension_scan": "Aktivieren um einen anonymisierten Bericht an Avira zu senden, wenn eine verdächtige Aktivitäten während dem Surfen festgestellt wurde.",
    "lb_setting_dark_mode": "Dunkelmodus",
    "lb_setting_tooltip_dark_mode": "Dunkelmodus ein/aus",
    "btn_blocking_back": "Seite verlassen",
    "lb_blocking_options": "Weitere Optionen",
    "lb_blocking_add_exception": "Diese Webseite nie blockieren",
    "btn_blocking_continue": "Trotzdem fortfahren",
    "btn_dash_classification_cb_exception": "Diese Webseite nie blockieren",
    "lb_dash_classification_exception_info_add": "Ausnahme wird hinzugefügt",
    "msg_dash_classification_exception_info_add": "Diese Seite ist zur Zeit NICHT auf Ihrer Ausnahmeliste. Wenn Sie eine Ausnahme hinzufügen, wird diese Web-Adresse bei Zugriff nicht mehr blockiert. Die Warnung am oberen Bildschirmrand bleibt jedoch bestehen.",
    "lb_dash_classification_exception_info_remove": "Ausnahme wird entfernt",
    "msg_dash_classification_exception_info_remove": "Diese Seite befindet zur Zeit auf Ihrer Ausnahmeliste. Wenn Sie die Ausnahme entfernen, wird diese Web-Adresse bei Zugriff immer blockiert.",
    "lb_privacy": "Datenschutz",
    "lnk_privacy": "https://www.avira.com/de/general-privacy",
    "lb_eula": "Endbenutzer-Lizenzvereinbarung",
    "lnk_eula": "https://www.avira.com/de/license-agreement-terms-of-use",
    "lb_discover_mode": "Entdecken Sie mehr",
    "lb_feedback": "Feedback",
    "lb_rate": "App bewerten",
    "lb_dash_pua_action_cancel": "Download abbrechen",
    "msg_mse_bar_warning": "Die Einstellungen Ihrer Suchmaschine wurden wahrscheinlich manipuliert.",
    "lb_mse_take_me_away": "Seite verlassen",
    "lb_mse_hide_warning": "Ich vertraue dieser Suchmaschine",
    "lnk_avira": "http://www.avira.com/de/",
    "msg_blocked_iframe_replacement": "Unsicherer Inhalt",
    "lb_unsafe_content_bar_warning": "Avira Browser Safety verhindert, dass unsicherer Inhalt auf dieser Webseite geladen wird.",
    "lb_unsafe_content_bar_ignore": "Diese Meldung nicht mehr anzeigen",
    "lb_extension_permission_notification_extension_description": "Die Avira Browserschutz Erweiterung benötigt ihre Zustimmung um einen Bericht über verdächtige Aktivitäten an Avira zusenden.",
    "lb_extension_permission_notification_extension_permission_title": "Aktivieren um einen anonymisierten Bericht an Avira zu senden, wenn eine verdächtige Aktivitäten während dem Surfen festgestellt wurde.",
    "lb_extension_permission_notification_extension_permission_button": "Erlauben",
    "lb_extension_permission_notification_extension_permission_no_title": "Diese Funktion kann später in den Einstellungen aktiviert werden.",
    "lb_extension_permission_notification_extension_permission_no_button": "Nicht erneut fragen",
    "lb_unsafe_content": "Unsicherer Inhalt",
    "msg_dash_unsafe_content_details_no_exception": "Blockierter unsicherer Inhalt:",
    "msg_dash_unsafe_content_details_exception": "Unsicherer Inhalt blockiert",
    "msg_dash_unsafe_content_risk_no_exception": "Aus Sicherheitsgründen wird empfohlen, die Blockierung des Inhalts beizubehalten.",
    "msg_dash_unsafe_content_risk_exception": "Aus Sicherheitsgründen wird empfohlen, die Ausnahme zu entfernen und damit den unsicheren Inhalt zu blockieren.",
    "lb_dash_unsafe_content_show_details": "Technische Details",
    "lb_dash_unsafe_content_hide_details": "Ausblenden",
    "msg_category_unknown": "Es wurden keine Informationen für diese Webseite gefunden.",
    "msg_category_safe": "Keine bekannten Bedrohungen.",
    "msg_category_malware": "Dies ist eine Malware-Webseite",
    "msg_category_malware_sub": "Malware-Webseiten infizieren Ihr Gerät und können Viren, Würmer, Spyware und Trojaner enthalten.",
    "msg_category_phishing": "Dies ist eine Phishing-Webseite",
    "msg_category_phishing_sub": "Phishing-Webseiten versuchen, Sie durch Täuschung dazu zu verleiten, persönliche Informationen wie Kennwörter und Kontoinformationen preiszugeben.",
    "msg_category_spam": "Dies ist eine Spam-Webseite",
    "msg_category_spam_sub": "Spam-Webseiten verwenden Ihre E-Mail-Adresse, um Ihnen Werbung per E-Mail zu senden.",
    "msg_category_pua": "Der Download enthält Potenziell Unerwünschte Anwendungen.",
    "msg_category_pua2": "Diese Webseite verbreitet PUA",
    "msg_category_pua2_sub": "Potenziell Unerwünschte Anwendungen (PUA) zeigen unerwünschtes Verhalten oder beinhalten unerwünschte Funktionen.",
    "msg_category_mse": "Nicht vertrauenswürdige Suchmaschine",
    "msg_category_mse_sub": "Dieser Suchmaschine wird nicht vertraut, da bekannt ist, dass Malware und Potenziell Unerwünschte Anwendungen Datenverkehr dorthin umleiten.",
    "msg_category_unsafe_content": "Unsicherer Inhalt blockiert",
    "msg_category_unsafe_content_sub": "Webseiten laden unsicheren Inhalt, wenn beeinträchtigter oder externer Inhalt gehackt wurde oder vorsätzlich schädlich ist.",
    "msg_what_is_pua": "Was bedeutet PUA?",
    "lnk_what_is_pua": "https://www.avira.com/de-de/potentially-unwanted-applications",
    "lb_tab_privacy": "Privatsphäre",
    "lb_tab_security": "Sicherheit",
    "lb_my_modes": "Modi",
    "msg_mode_select": "Wählen Sie den Modus, der <br/>Ihren Anforderungen entspricht",
    "lb_mode_safe-surfing": "Sicheres Surfen",
    "lb_mode_safe-private": "Sicher und privat",
    "lb_mode_custom": "Benutzerdefiniert",
    "lb_powered_by_avira": "Bereitgestellt von Avira",
    "lb_help": "Hilfe",
    "lnk_abs_landing": "http://www.avira.com/abs-ftu",
    "lb_trackers_twitter_share": "{{ threshold }} Werbeanzeigen und #Tracker wurden von #Avira Browserschutz blockiert. Holen Sie sich Ihre eigene Version – #kostenlos!",
    "lb_trackers_facebook_share": "{{ threshold }} – so viele Werbeanzeigen und Tracker hat Avira Browserschutz bislang blockiert und so davon abgehalten, meine Onlineaktivitäten auszuspionieren. Avira Browserschutz ist kostenlos und wärmstens zu empfehlen.",
    "lb_congratulations": "Herzlichen Glückwunsch!",
    "lb_trackers_blocked_count": "{{ threshold }} Werbeanzeigen und Tracker blockiert!",
    "lb_trackers_milestone_subtitle": "Hilf auch du, deine Familie und Freunde zu schützen.",
    "lb_tracker_notification_share_url_twitter": "http://www.avira.com/de/avira-browser-safety?x-a-source=ABSSocial&x-a-medium=Twitter",
    "lb_tracker_notification_share_url_facebook": "http://www.avira.com/de/avira-browser-safety?x-a-source=ABSSocial&x-a-medium=Facebook",
    "lb_tweet": "Tweet",
    "lb_share": "Teilen",
    "lb_trackers": "Tracker",
    "lb_ads": "Werbeanzeigen",
    "lb_trackers_blocked_this_page": "<span class=\"txt--orange-dark\">Tracker</span> auf dieser Webseite blockiert",
    "lb_ads_blocked_this_page": "<span class=\"txt--orange\">Werbeanzeigen</span> auf dieser Webseite blockiert",
    "lb_blocked_total": "Insgesamt <strong>{{ countTotal }}</strong><br>Werbeanzeigen und Tracker blockiert",
    "lb_adblocking_credits": "\"Werbeanzeige von <a href=\"https://adguard.com/?aid=27248\" target=\"_blank\">Adguard</a> blockiert\""
}

},{}],71:[function(require,module,exports){
module.exports={
    "lb_safe_website": "Safe website",
    "lb_unsafe_website": "Unsafe website",
    "lb_unsafe_content_website": "Unsafe content",
    "lb_mse_website": "Distrusted Search Engine",
    "lb_trackers_blocked": "{{ count }} ads and trackers <span class=\"txt--green\">blocked</span> on {{ domain }}",
    "lb_trackers_blocked_short": "{{ count }} ads and trackers blocked",
    "lb_trackers_block_all": "Block on this website",
    "lb_trackers_allow_all": "Unblock ads and trackers",
    "msg_no_trackers": "There are no trackers following you on the current page. If you open a website with active trackers, the complete list will be shown here.",
    "msg_trackers_tooltip": "These are all the trackers on the website you are viewing. You can block a tracker by clicking on the slider next to it. When a slider is green, that tracker is blocked and cannot track your browsing activity. Note that some trackers are allowed by default. Blocking them might result in the web page not working properly.",
    "lb_settings": "Settings",
    "lb_setting_offers": "Show price comparisons",
    "lb_setting_tooltip_offers": "Show better deals for the items you’re shopping for – from only safe websites.",
    "lb_setting_dnt_header": "Send Do Not Track header",
    "lb_setting_tooltip_dnt_header": "Inform websites they should not track you. If they ignore the request, ABS still blocks any trackers.",
    "lb_setting_top_bar": "Show safety indicator",
    "lb_setting_block_trackers": "Block trackers by default",
    "lb_setting_tooltip_block_trackers": "Protect your privacy by blocking trackers by default.",
    "lb_setting_cliqz": "CLIQZ Search",
    "lb_setting_tooltip_cliqz": "CLIQZ Search suggests you websites and relevant information in real-time while you enter your search in the browser bar, which enables you to search safer and faster.",
    "lb_setting_privacy_badger": "Privacy Badger",
    "lb_setting_tooltip_privacy_badger": "Privacy Badger blocks spying ads and prevents invisible trackers from tracking you secretly without your permission.",
    "lb_setting_https_everywhere": "HTTPS Everywhere",
    "lb_setting_tooltip_https_everywhere": "HTTPS Everywhere encrypts your communications and makes your browsing more secure.",
    "lb_setting_inAppTracking": "Anonymous Statistics",
    "lb_setting_tooltip_inAppTracking": "Help us improve the product by sharing anonymous data.",
    "lb_setting_show_advanced_controls": "Show extra browsing controls",
    "lb_setting_tooltip_show_advanced_controls": "Displays Privacy Badger and HTTPS Everywhere icons in the toolbar.",
    "lb_setting_google_services": "Google Services",
    "lb_setting_adguard": "Block ads & web tracking",
    "lb_setting_tooltip_adguard": "Protects your privacy by stopping anyone from monitoring you online. Also blocks intrusive popups, web banners, video ads, and more.",
    "lb_setting_adguard_social_media": "Block social media tracking",
    "lb_setting_tooltip_adguard_social_media": "Disables social media buttons and widgets from websites, so that social networks cannot keep track of what sites you visit.",
    "lb_setting_adguard_useful_ads": "Do not block useful ads",
    "lb_setting_tooltip_adguard_useful_ads": "Allows relevant, non-intrusive ads to be shown in your search results.",
    "lb_setting_extension_scan": "Extensions Analysis",
    "lb_setting_tooltip_extension_scan": "Enable to send an anonymous report to Avira if suspicious activity is detected while browsing.",
    "lb_setting_dark_mode": "Dark mode",
    "lb_setting_tooltip_dark_mode": "Switch dark mode on/off",
    "btn_blocking_back": "Take me away!",
    "lb_blocking_options": "More options",
    "lb_blocking_add_exception": "Never block this website",
    "btn_blocking_continue": "Continue anyway",
    "btn_dash_classification_cb_exception": "Never block this website",
    "lb_dash_classification_exception_info_add": "Adding an exception",
    "msg_dash_classification_exception_info_add": "This site is currently NOT on your exception list. When you add an exception, the address will not be blocked when you attempt to view it. You will still see the warning on the top of the screen.",
    "lb_dash_classification_exception_info_remove": "Removing an exception",
    "msg_dash_classification_exception_info_remove": "This site is currently on your exception list. If you remove the exception, the address will be blocked every time you attempt to view it.",
    "lb_privacy": "Privacy policy",
    "lnk_privacy": "https:\/\/www.avira.com\/en\/general-privacy",
    "lb_eula": "End User License Agreement",
    "lnk_eula": "https:\/\/www.avira.com\/en\/license-agreement-terms-of-use",
    "lb_discover_mode": "Discover more",
    "lb_feedback": "Feedback",
    "lb_rate": "Rate app",
    "lb_dash_pua_action_cancel": "Cancel download",
    "msg_mse_bar_warning": "Your search engine settings were possibly tampered with.",
    "lb_mse_take_me_away": "Take me away!",
    "lnk_avira": "https://www.avira.com/en/",
    "lb_mse_hide_warning": "I trust this search engine",
    "msg_blocked_iframe_replacement": "Unsafe content",
    "lb_unsafe_content_bar_warning": "Avira Browser Safety prevented unsafe content from loading on this webpage.",
    "lb_unsafe_content_bar_ignore": "Don't show message again",
    "lb_extension_permission_notification_extension_description": "The Avira Browser Safety Extension needs your approval to send a report about suspicious activities to Avira.",
    "lb_extension_permission_notification_extension_permission_title": "Enable to send an anonymous report to Avira if suspicious activity is detected while browsing.",
    "lb_extension_permission_notification_extension_permission_button": "Allow",
    "lb_extension_permission_notification_extension_permission_no_title": "You can enable this feature at anytime in the settings.",
    "lb_extension_permission_notification_extension_permission_no_button": "Do not ask again",
    "lb_unsafe_content": "Unsafe Content",
    "msg_dash_unsafe_content_details_no_exception": "Unsafe content blocked:",
    "msg_dash_unsafe_content_details_exception": "Unsafe content blocked",
    "msg_dash_unsafe_content_risk_no_exception": "For safety, you are recommended to keep the content blocked.",
    "msg_dash_unsafe_content_risk_exception": "For safety, you are recommended to block the unsafe content by removing the exception.",
    "lb_dash_unsafe_content_show_details": "Technical details",
    "lb_dash_unsafe_content_hide_details": "Hide",
    "msg_category_unknown": "No information was found for this website.",
    "msg_category_safe": "No known threats.",
    "msg_category_malware": "This is a malware website",
    "msg_category_malware_sub": "Malware websites infect your device and can include viruses, worms, spyware, and Trojans.",
    "msg_category_phishing": "This is a phishing website",
    "msg_category_phishing_sub": "Phishing websites trick you into revealing your personal information, such as passwords and bank account information.",
    "msg_category_spam": "This is a spam website",
    "msg_category_spam_sub": "Spam websites get your email address so they can send you adverts by email.",
    "msg_category_pua": "The download contains Potentially Unwanted Applications",
    "msg_category_pua2": "This website distributes PUAs",
    "msg_category_pua2_sub": "Potentially Unwanted Applications (PUAs) exhibit behavior or contain features that are considered undesirable by users.",
    "msg_category_mse": "Distrusted search engine",
    "msg_category_mse_sub": "This search engine is distrusted because malware and Potentially Unwanted Applications are known to redirect traffic to it.",
    "msg_category_unsafe_content": "Unsafe content blocked",
    "msg_category_unsafe_content_sub": "Webpages load unsafe content if compromised or third-party content is hacked or intentionally harmful.",
    "msg_what_is_pua": "What is a PUA?",
    "lnk_what_is_pua": "https:\/\/www.avira.com\/en\/potentially-unwanted-applications",
    "lb_tab_privacy": "Privacy",
    "lb_tab_security": "Security",
    "lb_my_modes": "Modes",
    "msg_mode_select": "Select the mode that best meets<br\/>your needs",
    "lb_mode_safe-surfing": "Safe Surfing",
    "lb_mode_safe-private": "Safe and Private",
    "lb_mode_custom": "Custom",
    "lb_powered_by_avira": "Powered by Avira",
    "lb_help": "Help",
    "lnk_abs_landing": "http:\/\/www.avira.com\/abs-ftu",
    "lb_trackers_twitter_share": "{{ threshold }} ads and #trackers were blocked by #Avira Browser Safety. Get yours now #forfree!",
    "lb_trackers_facebook_share": "{{ threshold }} - that's how many ads and trackers Avira Browser Safety has blocked from spying on my online activities so far. It's free and I highly recommend it.",
    "lb_congratulations": "Congratulations!",
    "lb_trackers_blocked_count": "{{ threshold }} ads and trackers blocked!",
    "lb_trackers_milestone_subtitle": "Help protect your family and friends, too.",
    "lb_tracker_notification_share_url_twitter": "http://www.avira.com/en/avira-browser-safety?x-a-source=ABSSocial&x-a-medium=Twitter",
    "lb_tracker_notification_share_url_facebook": "http://www.avira.com/en/avira-browser-safety?x-a-source=ABSSocial&x-a-medium=Facebook",
    "lb_tweet": "Tweet",
    "lb_share": "Share",
    "lb_trackers": "Trackers",
    "lb_ads": "Ads",
    "lb_trackers_blocked_this_page": "<span class=\"txt--orange-dark\">Trackers</span> blocked on this website",
    "lb_ads_blocked_this_page": "<span class=\"txt--orange\">Ads</span> blocked on this website",
    "lb_blocked_total": "<strong>{{ countTotal }}</strong><br>Overall ads and trackers blocked",
    "lb_adblocking_credits": "Ad blocking by <a href=\"https://adguard.com/?aid=27248\" target=\"_blank\">Adguard</a>"
}

},{}],72:[function(require,module,exports){
module.exports={
    "lb_safe_website": "Sitio web seguro",
    "lb_unsafe_website": "Sitio web no seguro",
    "lb_unsafe_content_website": "Contenido no seguro",
    "lb_mse_website": "Motor de búsqueda poco fiable",
    "lb_trackers_blocked": "{{ count }} anuncios y rastreadores <span class=\"txt--green\">bloqueados</span> en {{ domain }}",
    "lb_trackers_blocked_short": "{{ count }} anuncios y rastreadores bloqueados",
    "lb_trackers_block_all": "Bloquear en este sitio web",
    "lb_trackers_allow_all": "Desbloquear anuncios y rastreadores",
    "msg_no_trackers": "No hay rastreadores que le estén siguiendo en la página actual. Si abre una página web con rastreadores activos, se mostrará la lista completa aquí.",
    "msg_trackers_tooltip": "Estos son todos los rastreadores en el sitio web que está visitando. Puede bloquear un rastreador haciendo clic en el control deslizante junto al mismo. Cuando un control deslizante está en verde, el rastreador estará bloqueado y no podrá rastrear su actividad de exploración. Tenga en cuenta que algunos rastreadores están permitidos por defecto. Su bloqueo puede hacer que el sitio web no funcione correctamente.",
    "lb_settings": "Configuración",
    "lb_setting_offers": "Mostrar comparativas de precios",
    "lb_setting_tooltip_offers": "Mostrar las mejores ofertas para los productos que está comprando (solo de sitios web seguros).",
    "lb_setting_dnt_header": "Enviar solicitud Protección de rastreo",
    "lb_setting_tooltip_dnt_header": "Informa a los sitios web que no deberían rastrearle. En caso de que ignoren la solicitud, SNA bloqueará todos los rastreadores.",
    "lb_setting_top_bar": "Mostrar indicador de seguridad",
    "lb_setting_block_trackers": "Bloquee rastreadores de forma predeterminada",
    "lb_setting_tooltip_block_trackers": "Proteja su privacidad bloqueando los rastreadores de forma predeterminada.",
    "lb_setting_cliqz": "Motor de búsqueda CLIQZ",
    "lb_setting_tooltip_cliqz": "El motor de búsqueda CLIQZ le sugiere sitios web e información relevante en tiempo real mientras introduce su búsqueda en la barra del navegador lo que le permite buscar de forma más segura y más rápida.",
    "lb_setting_privacy_badger": "Privacy Badger",
    "lb_setting_tooltip_privacy_badger": "Privacy Badger bloquea anuncios espía y evita que los rastreadores invisibles le rastreen de forma secreta sin su permiso.",
    "lb_setting_https_everywhere": "HTTPS Everywhere",
    "lb_setting_tooltip_https_everywhere": "HTTPS Everywhere cifra sus comunicaciones y hace que su navegación sea más segura.",
    "lb_setting_inAppTracking": "Estadísticas anónimas",
    "lb_setting_tooltip_inAppTracking": "Ayúdenos a mejorar el producto compartiendo datos anónimos.",
    "lb_setting_show_advanced_controls": "Más controles de navegación",
    "lb_setting_tooltip_show_advanced_controls": "Se muestran en la barra de herramientas los iconos de Privacy Badger y HTTPS Everywhere.",
    "lb_setting_google_services": "Servicios de Google",
    "lb_setting_adguard": "Bloquear anuncios y el rastreo web",
    "lb_setting_tooltip_adguard": "Protege su privacidad evitando que cualquiera supervise lo que hace en línea. Bloquea también ventanas emergentes intrusivas, anuncios web, anuncios en vídeo y más.",
    "lb_setting_adguard_social_media": "Bloquear el rastreo de redes sociales",
    "lb_setting_tooltip_adguard_social_media": "Deshabilita los botones y widgets de redes sociales de los sitios web para que las redes sociales no puedan rastrear los sitios que visita.",
    "lb_setting_adguard_useful_ads": "No bloquear anuncios útiles",
    "lb_setting_tooltip_adguard_useful_ads": "Permite que en sus resultados de búsqueda aparezcan anuncios relevantes y no intrusivos.",
    "lb_setting_extension_scan": "Análisis de extensiones",
    "lb_setting_tooltip_extension_scan": "Activar el envío a Avira de un informe anónimo si se detecta actividad sospechosa mientras se navega.",
    "lb_setting_dark_mode": "Modo oscuro",
    "lb_setting_tooltip_dark_mode": "Activar/Desactivar Modo oscuro",
    "btn_blocking_back": "Salir de aquí",
    "lb_blocking_options": "Otras opciones",
    "lb_blocking_add_exception": "Nunca bloquear este sitio web",
    "btn_blocking_continue": "Continuar de todas formas",
    "btn_dash_classification_cb_exception": "Nunca bloquear este sitio web",
    "lb_dash_classification_exception_info_add": "Adición de una excepción",
    "msg_dash_classification_exception_info_add": "Este sitio NO se encuentra actualmente en su lista de excepciones. Si añade una excepción, la dirección no se bloqueará cuando trate de verla. Aun así, verá la advertencia en la parte superior de la pantalla.",
    "lb_dash_classification_exception_info_remove": "Eliminación de una excepción",
    "msg_dash_classification_exception_info_remove": "Este sitio se encuentra actualmente en su lista de excepciones. Si elimina la excepción, siempre que trate de ver la excepción, esta se bloqueará.",
    "lb_privacy": "Política de privacidad",
    "lnk_privacy": "https://www.avira.com/es/general-privacy",
    "lb_eula": "Acuerdo de licencia de usuario final",
    "lnk_eula": "https://www.avira.com/es/license-agreement-terms-of-use",
    "lb_discover_mode": "Obtener más información",
    "lb_feedback": "Comentarios",
    "lb_rate": "Valorar aplicación",
    "lb_dash_pua_action_cancel": "Cancelar descarga",
    "msg_mse_bar_warning": "Es posible que la configuración de su motor de búsqueda haya sido manipulada.",
    "lb_mse_take_me_away": "Salir de aquí",
    "lb_mse_hide_warning": "Confío en este motor de búsqueda",
    "lnk_avira": "http://www.avira.com/es/",
    "msg_blocked_iframe_replacement": "Contenido no seguro",
    "lb_unsafe_content_bar_warning": "Avira Navegación segura ha evitado que se cargue contenido no seguro en esta página web.",
    "lb_unsafe_content_bar_ignore": "No volver a mostrar el mensaje",
    "lb_extension_permission_notification_extension_description": "La extensión Avira Navegación segura requiere su aprobación para enviar a Avira un informe sobre actividades sospechosas.",
    "lb_extension_permission_notification_extension_permission_title": "Activar el envío a Avira de un informe anónimo si se detecta actividad sospechosa mientras se navega.",
    "lb_extension_permission_notification_extension_permission_button": "Permitir",
    "lb_extension_permission_notification_extension_permission_no_title": "Puede activar esta función en la configuración en cualquier momento.",
    "lb_extension_permission_notification_extension_permission_no_button": "No volver a preguntar",
    "lb_unsafe_content": "Contenido no seguro",
    "msg_dash_unsafe_content_details_no_exception": "Contenido no seguro bloqueado:",
    "msg_dash_unsafe_content_details_exception": "Contenido no seguro bloqueado",
    "msg_dash_unsafe_content_risk_no_exception": "Por seguridad, le recomendamos que mantenga el contenido bloqueado.",
    "msg_dash_unsafe_content_risk_exception": "Por seguridad, le recomendamos que bloquee el contenido no seguro eliminando la excepción.",
    "lb_dash_unsafe_content_show_details": "Detalles técnicos",
    "lb_dash_unsafe_content_hide_details": "Ocultar",
    "msg_category_unknown": "No se ha encontrado información sobre este sitio web.",
    "msg_category_safe": "Sin amenazas conocidas.",
    "msg_category_malware": "Este sitio web contiene malware",
    "msg_category_malware_sub": "Los sitios web con malware infectan su dispositivo y pueden incluir virus, gusanos, spyware y troyanos.",
    "msg_category_phishing": "Este es un sitio web de suplantación de identidad",
    "msg_category_phishing_sub": "Los sitios web de suplantación de identidad intentan engañar al usuario para revelar información personal, como contraseñas y datos bancarios.",
    "msg_category_spam": "Este es un sitio web de correo no deseado",
    "msg_category_spam_sub": "Los sitios web de correo no deseado capturan su dirección de correo electrónico para enviarle publicidad no deseada por correo electrónico.",
    "msg_category_pua": "La descarga contiene aplicaciones potencialmente no deseadas",
    "msg_category_pua2": "Este sitio web distribuye PUA",
    "msg_category_pua2_sub": "Las aplicaciones potencialmente no deseadas (PUA) muestran un comportamiento o contienen características que suelen ser consideradas como no deseables por los usuarios.",
    "msg_category_mse": "Motor de búsqueda poco fiable",
    "msg_category_mse_sub": "Se desconfía de este motor de búsqueda porque se sabe que programas maliciosos y aplicaciones potencialmente no deseadas redirigen aquí el tráfico.",
    "msg_category_unsafe_content": "Contenido no seguro bloqueado",
    "msg_category_unsafe_content_sub": "Las páginas web pueden cargar contenido no seguro si han sido comprometidas o si el contenido de terceros se ha pirateado o es malicioso de forma intencionada.",
    "msg_what_is_pua": "¿Qué es PUA?",
    "lnk_what_is_pua": "https://www.avira.com/es-es/potentially-unwanted-applications",
    "lb_tab_privacy": "Privacidad",
    "lb_tab_security": "Seguridad",
    "lb_my_modes": "Modos",
    "msg_mode_select": "Seleccione el modo que se adapta más a <br/>sus necesidades",
    "lb_mode_safe-surfing": "Navegación segura",
    "lb_mode_safe-private": "Segura y privada",
    "lb_mode_custom": "Personalizado",
    "lb_powered_by_avira": "Contenido provisto por Avira",
    "lb_help": "Ayuda",
    "lnk_abs_landing": "http://www.avira.com/abs-ftu",
    "lb_trackers_twitter_share": "{{ threshold }} anuncios y #rastreadores bloqueados por #Avira Navegación segura. ¡Consiga el suyo ahora #gratis!",
    "lb_trackers_facebook_share": "{{ threshold }}: estos son todos los anuncios y rastreadores que Avira Navegación segura ha bloqueado hasta ahora para evitar el espionaje de mis actividades en línea. Es gratuito y lo recomiendo mucho.",
    "lb_congratulations": "¡Enhorabuena!",
    "lb_trackers_blocked_count": "{{ threshold }} anuncios y rastreadores bloqueados.",
    "lb_trackers_milestone_subtitle": "Contribuye también a la protección de tu familia y amigos.",
    "lb_tracker_notification_share_url_twitter": "http://www.avira.com/es/avira-browser-safety?x-a-source=ABSSocial&x-a-medium=Twitter",
    "lb_tracker_notification_share_url_facebook": "http://www.avira.com/es/avira-browser-safety?x-a-source=ABSSocial&x-a-medium=Facebook",
    "lb_tweet": "Tuit",
    "lb_share": "Compartir",
    "lb_trackers": "Rastreadores",
    "lb_ads": "Anuncios",
    "lb_trackers_blocked_this_page": "<span class=\"txt--orange-dark\">Rastreadores</span> bloqueados en este sitio web.",
    "lb_ads_blocked_this_page": "<span class=\"txt--orange\">Anuncios</span> bloqueados en este sitio web.",
    "lb_blocked_total": "<strong>{{ countTotal }}</strong><br>Total de anuncios y rastreadores bloqueados",
    "lb_adblocking_credits": "Anuncios bloqueados por <a href=\"https://adguard.com/?aid=27248\" target=\"_blank\">Adguard</a>"
}

},{}],73:[function(require,module,exports){
module.exports={
    "lb_safe_website": "Site Internet sécurisé",
    "lb_unsafe_website": "Site Internet non sécurisé",
    "lb_unsafe_content_website": "Contenu dangereux",
    "lb_mse_website": "Moteur de recherche désapprouvé",
    "lb_trackers_blocked": "{{ count }} annonces et dispositifs de suivi <span class=\"txt--green\">bloqués</span> sur {{ domain }}",
    "lb_trackers_blocked_short": "{{ count }} annonces et dispositifs de suivi bloqués",
    "lb_trackers_block_all": "Bloquer sur ce site Internet",
    "lb_trackers_allow_all": "Débloquer toutes les annonces et les dispositifs de suivi",
    "msg_no_trackers": "Aucun dispositif de suivi ne vous suit sur la page actuelle. Si vous ouvrez un site Internet avec des dispositifs de suivi actifs, la liste complète s'affichera ici.",
    "msg_trackers_tooltip": "Voici tous les dispositifs de suivi recensés sur le site Internet que vous consultez. Pour bloquer un dispositif de suivi, cliquez sur le curseur adjacent. Lorsque le curseur est vert, le dispositif de suivi est bloqué et ne peut pas suivre vos activités de navigation. Notez que certains dispositifs de suivi sont autorisés par défaut. Leur blocage peut alors entraver le bon fonctionnement de la page Web.",
    "lb_settings": "Paramètres",
    "lb_setting_offers": "Afficher les comparaisons de prix",
    "lb_setting_tooltip_offers": "Afficher les meilleures affaires pour les articles que vous recherchez – sur des sites Internet sécurisés.",
    "lb_setting_dnt_header": "Envoyer l'en-tête Ne pas suivre",
    "lb_setting_tooltip_dnt_header": "Intimez aux sites Internet de ne pas vous suivre. S'ils ignorent cette requête, PNA bloquera tout dispositif de suivi.",
    "lb_setting_top_bar": "Afficher l’indicateur de sécurité",
    "lb_setting_block_trackers": "Bloquer les dispositifs de suivi par défaut",
    "lb_setting_tooltip_block_trackers": "Protégez votre sphère privée en bloquant les dispositifs de suivi par défaut.",
    "lb_setting_cliqz": "Recherche CLIQZ",
    "lb_setting_tooltip_cliqz": "La Recherche CLIQZ vous suggère des sites Internet et des informations pertinentes en temps réel lors de la saisie dans la barre de navigation, tout en accélérant et sécurisant votre recherche.",
    "lb_setting_privacy_badger": "Privacy Badger",
    "lb_setting_tooltip_privacy_badger": "Privacy Badger bloque les pubs espionnes et empêche les mouchards invisibles de vous suivre secrètement sans votre autorisation.",
    "lb_setting_https_everywhere": "HTTPS Everywhere",
    "lb_setting_tooltip_https_everywhere": "HTTPS Everywhere chiffre vos communications et sécurise votre navigation plus avant.",
    "lb_setting_inAppTracking": "Statistiques anonymes",
    "lb_setting_tooltip_inAppTracking": "Aidez-nous à améliorer le produit en partageant des données anonymes.",
    "lb_setting_show_advanced_controls": "Contrôles supp. de navigation",
    "lb_setting_tooltip_show_advanced_controls": "Affiche les icônes Privacy Badger et HTTPS Everywhere dans la barre d'outils.",
    "lb_setting_google_services": "Services Google",
    "lb_setting_adguard": "Bloquez les annonces et le suivi sur Internet",
    "lb_setting_tooltip_adguard": "Protège votre vie privée en bloquant toute possibilité de surveillance de vos activités en ligne. Bloque également les fenêtres intempestives intrusives, les bannières web, les annonces vidéo, etc.",
    "lb_setting_adguard_social_media": "Bloquez le suivi sur les médias sociaux",
    "lb_setting_tooltip_adguard_social_media": "Désactive les boutons et widgets liés aux médias sociaux sur les sites Internet afin d'empêcher le suivi de vos activités par les réseaux sociaux.",
    "lb_setting_adguard_useful_ads": "Ne bloquez pas les publicités utiles",
    "lb_setting_tooltip_adguard_useful_ads": "Autorise l'affichage d'annonces ciblées et non intrusives dans vos résultats de recherche.",
    "lb_setting_extension_scan": "Analyse des extensions",
    "lb_setting_tooltip_extension_scan": "Activez cette option pour envoyer un rapport anonyme à Avira en cas d'activité suspecte détectée au cours de la navigation.",
    "lb_setting_dark_mode": "Mode sombre",
    "lb_setting_tooltip_dark_mode": "Activer/désactiver le mode sombre",
    "btn_blocking_back": "Quiter !",
    "lb_blocking_options": "Autres options",
    "lb_blocking_add_exception": "Ne jamais bloquer ce site Internet",
    "btn_blocking_continue": "Continuer quand même",
    "btn_dash_classification_cb_exception": "Ne jamais bloquer ce site Internet",
    "lb_dash_classification_exception_info_add": "Ajout d'une exception",
    "msg_dash_classification_exception_info_add": "Ce site n'est actuellement PAS repris dans votre liste d'exceptions. Lorsque vous ajoutez une exception, l'adresse concernée n'est pas bloquée lorsque vous tentez d'y accéder. L'avertissement continue toutefois de s'afficher dans la partie supérieure de l'écran.",
    "lb_dash_classification_exception_info_remove": "Suppression d'une exception",
    "msg_dash_classification_exception_info_remove": "Ce site est actuellement repris dans votre liste d'exceptions. Si vous supprimez l'exception, l'adresse sera bloquée à chaque fois que vous tenterez d'y accéder.",
    "lb_privacy": "Politique de confidentialité",
    "lnk_privacy": "https://www.avira.com/fr/general-privacy",
    "lb_eula": "Contrat de licence de l''utilisateur final",
    "lnk_eula": "https://www.avira.com/fr/license-agreement-terms-of-use",
    "lb_discover_mode": "En savoir plus",
    "lb_feedback": "Commentaire",
    "lb_rate": "Évaluer l'application",
    "lb_dash_pua_action_cancel": "Annuler le téléchargement",
    "msg_mse_bar_warning": "Les paramètres de votre moteur de recherche ont peut-être été altérés.",
    "lb_mse_take_me_away": "Quiter !",
    "lb_mse_hide_warning": "Je fais confiance à ce moteur de recherche",
    "lnk_avira": "http://www.avira.com/fr/",
    "msg_blocked_iframe_replacement": "Contenu dangereux",
    "lb_unsafe_content_bar_warning": "Protection de navigateur Avira a empêché le chargement de contenu dangereux sur cette page Web.",
    "lb_unsafe_content_bar_ignore": "Ne plus afficher ce message",
    "lb_extension_permission_notification_extension_description": "L'extension Protection de navigateur Avira requiert votre autorisation pour envoyer un rapport concernant les activités suspectes à Avira.",
    "lb_extension_permission_notification_extension_permission_title": "Activez cette option pour envoyer un rapport anonyme à Avira en cas d'activité suspecte détectée au cours de la navigation.",
    "lb_extension_permission_notification_extension_permission_button": "Autoriser",
    "lb_extension_permission_notification_extension_permission_no_title": "Vous pouvez activer cette fonctionnalité à tout moment dans les paramètres.",
    "lb_extension_permission_notification_extension_permission_no_button": "Ne plus demander",
    "lb_unsafe_content": "Contenu dangereux",
    "msg_dash_unsafe_content_details_no_exception": "Contenu dangereux bloqué :",
    "msg_dash_unsafe_content_details_exception": "Contenu dangereux bloqué",
    "msg_dash_unsafe_content_risk_no_exception": "Pour votre sécurité, il est recommandé de bloquer ce contenu.",
    "msg_dash_unsafe_content_risk_exception": "Pour votre sécurité, il est recommandé de bloquer le contenu non sécurisé en supprimant l'exception existante.",
    "lb_dash_unsafe_content_show_details": "Détails techniques",
    "lb_dash_unsafe_content_hide_details": "Masquer",
    "msg_category_unknown": "Aucune information trouvée pour le site Internet.",
    "msg_category_safe": "Aucune menace connue.",
    "msg_category_malware": "Ce site est un site Internet malveillant",
    "msg_category_malware_sub": "Les sites Internet malveillants infectent votre appareil et peuvent inclure des virus, des vers, des logiciels espions et des chevaux de Troie.",
    "msg_category_phishing": "Ce site est un site Internet de hameçonnage",
    "msg_category_phishing_sub": "Les sites Internet de hameçonnage vous incitent à révéler vos informations personnelles, telles que vos mots de passe et coordonnées bancaires.",
    "msg_category_spam": "Ce site est un site Internet de spam",
    "msg_category_spam_sub": "Les sites Internet de spam capturent votre adresse électronique afin de vous envoyer des publicités indésirables par e-mail.",
    "msg_category_pua": "Le téléchargement contient des applications potentiellement indésirables",
    "msg_category_pua2": "Ce site Internet distribue des PUA",
    "msg_category_pua2_sub": "Les PUA, ou applications potentiellement indésirables, présentent un comportement ou intègrent des fonctionnalités indésirables pour les utilisateurs.",
    "msg_category_mse": "Moteur de recherche désapprouvé",
    "msg_category_mse_sub": "Ce moteur de recherche n'est pas fiable : son trafic est alimenté par des logiciels malveillants et des applications potentiellement indésirables.",
    "msg_category_unsafe_content": "Contenu dangereux bloqué",
    "msg_category_unsafe_content_sub": "Les pages Web chargent des contenus dangereux lorsqu'elles sont compromises, c'est-à-dire lorsque leur contenu a été piraté ou conçu dans un but malveillant.",
    "msg_what_is_pua": "Qu'est-ce que les applications potentiellement indésirables (PUA) ?",
    "lnk_what_is_pua": "https://www.avira.com/fr-fr/potentially-unwanted-applications",
    "lb_tab_privacy": "Confidentialité",
    "lb_tab_security": "Sécurité",
    "lb_my_modes": "Modes",
    "msg_mode_select": "Sélectionnez le mode qui répond<br/>le mieux à vos besoins",
    "lb_mode_safe-surfing": "Navigation sécurisée",
    "lb_mode_safe-private": "Sécurisé et privé",
    "lb_mode_custom": "Personnalisé",
    "lb_powered_by_avira": "Une solution Avira",
    "lb_help": "Aide",
    "lnk_abs_landing": "http://www.avira.com/abs-ftu",
    "lb_trackers_twitter_share": "{{ threshold }} annonces et #trackers bloqués par Protection de navigateur #Avira. Profitez-en, c'est #gratuit !",
    "lb_trackers_facebook_share": "{{ threshold }} - voilà le nombre d'annonces et dispositifs de suivi indiscrets déjà bloqués par la Protection de navigateur Avira lors de mes activités en ligne. Un outil gratuit et vivement recommandable !",
    "lb_congratulations": "Félicitations !",
    "lb_trackers_blocked_count": "{{ threshold }} annonces et dispositifs de suivi bloqués !",
    "lb_trackers_milestone_subtitle": "Aidez votre famille et vos amis à se protéger eux aussi.",
    "lb_tracker_notification_share_url_twitter": "http://www.avira.com/fr/avira-browser-safety?x-a-source=ABSSocial&x-a-medium=Twitter",
    "lb_tracker_notification_share_url_facebook": "http://www.avira.com/fr/avira-browser-safety?x-a-source=ABSSocial&x-a-medium=Facebook",
    "lb_tweet": "Twitter",
    "lb_share": "Partager",
    "lb_trackers": "Dispositifs de suivi",
    "lb_ads": "Annonces",
    "lb_trackers_blocked_this_page": "<span class=\"txt--orange-dark\">Dispositifs de suivi</span> bloqués sur ce site Internet",
    "lb_ads_blocked_this_page": "<span class=\"txt--orange\">Annonces</span> bloquées sur ce site Internet",
    "lb_blocked_total": "<strong>{{ countTotal }}</strong><br>Blocage total des pubs et dispositifs de suivi",
    "lb_adblocking_credits": "Blocage des annonces publicitaires par <a href=\"https://adguard.com/?aid=27248\" target=\"_blank\">Adguard</a>"
}

},{}],74:[function(require,module,exports){
module.exports={
    "lb_safe_website": "Sito web sicuro",
    "lb_unsafe_website": "Sito web non sicuro",
    "lb_unsafe_content_website": "Contenuto non sicuro",
    "lb_mse_website": "Motore di ricerca non affidabile",
    "lb_trackers_blocked": "{{ count }} pubblicità e tracker <span class=\"txt--green\">bloccati</span> su {{ domain }}",
    "lb_trackers_blocked_short": "{{ count }} pubblicità e tracker bloccati",
    "lb_trackers_block_all": "Blocca su questo sito web",
    "lb_trackers_allow_all": "Sblocca le pubblicità e i tracker",
    "msg_no_trackers": "Sulla pagina non sono presenti tracker che potrebbero seguirla. Se apre un sito Web con i tracker attivi, l'elenco completo viene visualizzato qui.",
    "msg_trackers_tooltip": "Questi sono tutti i tracker presenti sul sito Web che sta visualizzando. Può bloccare un tracker facendo clic sul dispositivo di scorrimento accanto al tracker stesso. Quando un dispositivo di scorrimento è verde, il tracker è bloccato e non può eseguire il tracking della sua attività di navigazione. Alcuni tracker sono autorizzati per default e bloccarli potrebbe causare un funzionamento non corretto della pagina Web.",
    "lb_settings": "Impostazioni",
    "lb_setting_offers": "Mostra il confronto prezzi",
    "lb_setting_tooltip_offers": "Mostra le offerte migliori per gli articoli che stai acquistando: solo da siti web sicuri.",
    "lb_setting_dnt_header": "Invia l'intestazione Do not track",
    "lb_setting_tooltip_dnt_header": "Informa i siti web che non desideri che tengano traccia delle tue attività. Se ignorano la richiesta, SBA bloccherà ugualmente eventuali tracker.",
    "lb_setting_top_bar": "Mostra indicatore di sicurezza",
    "lb_setting_block_trackers": "Blocca i tracker in modo predefinito",
    "lb_setting_tooltip_block_trackers": "Proteggi la tua privacy bloccando i tracker in modo predefinito.",
    "lb_setting_cliqz": "CLIQZ Search",
    "lb_setting_tooltip_cliqz": "CLIQZ Search ti suggerisce siti web e informazioni pertinenti in tempo reale mentre digiti i termini di ricerca nella barra del browser, rendendo la ricerca più rapida e sicura.",
    "lb_setting_privacy_badger": "Privacy Badger",
    "lb_setting_tooltip_privacy_badger": "Privacy Badger blocca gli annunci spia e impedisce a tracker invisibili di tracciare segretamente le tue attività senza il tuo permesso.",
    "lb_setting_https_everywhere": "HTTPS Everywhere",
    "lb_setting_tooltip_https_everywhere": "HTTPS Everywhere crittografa le comunicazioni e ti permette di navigare in modo più sicuro.",
    "lb_setting_inAppTracking": "Statistiche anonime",
    "lb_setting_tooltip_inAppTracking": "Aiutaci a migliorare il prodotto condividendo dati anonimi.",
    "lb_setting_show_advanced_controls": "Controlli di navigazione addiz.",
    "lb_setting_tooltip_show_advanced_controls": "Mostra le icone di Privacy Badger e HTTPS Everywhere nella barra degli strumenti.",
    "lb_setting_google_services": "Servizi di Google",
    "lb_setting_adguard": "Blocca le pubblicità e il web tracking",
    "lb_setting_tooltip_adguard": "Protegge la tua privacy impedendo a chiunque di monitorare le tue attività online. Blocca anche popup, banner, video pubblicitari invadenti e molto altro ancora.",
    "lb_setting_adguard_social_media": "Blocca il tracking dei social media",
    "lb_setting_tooltip_adguard_social_media": "Disattiva i pulsanti e i widget dei social media presenti nei siti web per evitare che il social network possa tenere traccia dei siti visitati.",
    "lb_setting_adguard_useful_ads": "Non bloccare le pubblicità utili",
    "lb_setting_tooltip_adguard_useful_ads": "Consente la visualizzazione di pubblicità rilevanti e non invadenti nei risultati della ricerca.",
    "lb_setting_extension_scan": "Analisi delle estensioni",
    "lb_setting_tooltip_extension_scan": "Consenti l'invio di report anonimi ad Avira se vengono rilevate attività sospette durante la navigazione.",
    "lb_setting_dark_mode": "Modalità scura",
    "lb_setting_tooltip_dark_mode": "Attiva/disattiva la modalità scura",
    "btn_blocking_back": "Non voglio più accedere",
    "lb_blocking_options": "Altre opzioni",
    "lb_blocking_add_exception": "Non bloccare mai questo sito web",
    "btn_blocking_continue": "Continua comunque",
    "btn_dash_classification_cb_exception": "Non bloccare mai questo sito web",
    "lb_dash_classification_exception_info_add": "Aggiunta di un'eccezione",
    "msg_dash_classification_exception_info_add": "Questo sito NON è al momento incluso nell'elenco delle eccezioni. Se aggiungi un'eccezione, l'indirizzo non verrà bloccato quanto tenti di accedere al sito. Verrà comunque visualizzata un'avvertenza nella parte superiore della schermata.",
    "lb_dash_classification_exception_info_remove": "Rimuovi un'eccezione",
    "msg_dash_classification_exception_info_remove": "Questo sito è attualmente incluso nell'elenco delle eccezioni. Se rimuovi l'eccezione, l'indirizzo verrà bloccato ogni volta che tenti di accedere al sito.",
    "lb_privacy": "Policy sulla privacy",
    "lnk_privacy": "https://www.avira.com/it/general-privacy",
    "lb_eula": "Contratto di licenza con l''utente finale",
    "lnk_eula": "https://www.avira.com/it/license-agreement-terms-of-use",
    "lb_discover_mode": "Scopri di più",
    "lb_feedback": "Feedback",
    "lb_rate": "Valuta l’app",
    "lb_dash_pua_action_cancel": "Annulla download",
    "msg_mse_bar_warning": "Le impostazioni di ricerca potrebbero essere state manomesse.",
    "lb_mse_take_me_away": "Non voglio più accedere",
    "lb_mse_hide_warning": "Questo motore di ricerca è affidabile",
    "lnk_avira": "http://www.avira.com/it/",
    "msg_blocked_iframe_replacement": "Contenuto non sicuro",
    "lb_unsafe_content_bar_warning": "Sicurezza browser Avira ha impedito il caricamento di contenuto non sicuro su questa pagina web.",
    "lb_unsafe_content_bar_ignore": "Non mostrare il messaggio in futuro",
    "lb_extension_permission_notification_extension_description": "L'estensione Sicurezza browser Avira richiede il tuo consenso per inviare ad Avira un report sulle attività sospette.",
    "lb_extension_permission_notification_extension_permission_title": "Consenti l'invio di report anonimi ad Avira se vengono rilevate attività sospette durante la navigazione.",
    "lb_extension_permission_notification_extension_permission_button": "Consenti",
    "lb_extension_permission_notification_extension_permission_no_title": "Puoi attivare in ogni momento questa funzione nelle impostazioni.",
    "lb_extension_permission_notification_extension_permission_no_button": "Non chiedere più in futuro",
    "lb_unsafe_content": "Contenuto non sicuro",
    "msg_dash_unsafe_content_details_no_exception": "Contenuto bloccato perchè non sicuro:",
    "msg_dash_unsafe_content_details_exception": "Contenuto bloccato perchè non sicuro",
    "msg_dash_unsafe_content_risk_no_exception": "Per motivi di sicurezza ti consigliamo di mantenere il contenuto bloccato.",
    "msg_dash_unsafe_content_risk_exception": "Per motivi di sicurezza ti consigliamo di bloccare il contenuto non sicuro, rimuovendo l'eccezione.",
    "lb_dash_unsafe_content_show_details": "Dettagli tecnici",
    "lb_dash_unsafe_content_hide_details": "Nascondi",
    "msg_category_unknown": "Impossibile trovare informazioni per questo sito web.",
    "msg_category_safe": "Nessuna minaccia conosciuta.",
    "msg_category_malware": "Questo è un sito di malware",
    "msg_category_malware_sub": "I siti di malware infettano il tuo dispositivo e possono contenere virus, worm, spyware e trojan.",
    "msg_category_phishing": "Questo è un sito di phishing",
    "msg_category_phishing_sub": "I siti di phishing ingannano l'utente portandolo a rivelare le informazioni personali come le password e informazioni relative al conto bancario.",
    "msg_category_spam": "Questo è un sito di spam",
    "msg_category_spam_sub": "I siti di spam ottengono l'indirizzo email dell'utente in modo da poter inviare materiale pubblicitario non richiesto.",
    "msg_category_pua": "Il download contiene applicazioni potenzialmente indesiderate",
    "msg_category_pua2": "Questo sito web distribuisce PUA",
    "msg_category_pua2_sub": "Le applicazioni potenzialmente indesiderate (PUA) contengono funzionalità o hanno effetti indesiderati dagli utenti.",
    "msg_category_mse": "Motore di ricerca non affidabile",
    "msg_category_mse_sub": "Questo motore di ricerca è sospetto poiché è risaputo che malware e applicazioni potenzialmente indesiderate vi reindirizzano il traffico.",
    "msg_category_unsafe_content": "Contenuto bloccato perchè non sicuro",
    "msg_category_unsafe_content_sub": "Le pagine web caricano un contenuto non sicuro se sono state compromesse o se il contenuto di terze parti ha subito attacchi o è intenzionalmente dannoso.",
    "msg_what_is_pua": "Cosa sono le PUA?",
    "lnk_what_is_pua": "https://www.avira.com/it-it/potentially-unwanted-applications",
    "lb_tab_privacy": "Privacy",
    "lb_tab_security": "Sicurezza",
    "lb_my_modes": "Modalità",
    "msg_mode_select": "Seleziona la modalità più adatta alle<br/>tue esigenze",
    "lb_mode_safe-surfing": "Navigazione sicura",
    "lb_mode_safe-private": "Sicura e privata",
    "lb_mode_custom": "Personalizzata",
    "lb_powered_by_avira": "Powered by Avira",
    "lb_help": "Guida",
    "lnk_abs_landing": "http://www.avira.com/abs-ftu",
    "lb_trackers_twitter_share": "{{ threshold }} pubblicità e #tracker sono stati bloccati da #Sicurezza browser Avira. Scaricalo ora #gratis!",
    "lb_trackers_facebook_share": "{{ threshold }} - ecco il numero di pubblicità e tracker a cui finora Sicurezza browser Avira ha impedito di spiare le mie attività online. È gratuito e lo raccomando caldamente.",
    "lb_congratulations": "Congratulazioni!",
    "lb_trackers_blocked_count": "{{ threshold }} pubblicità e tracker bloccati!",
    "lb_trackers_milestone_subtitle": "Aiuta anche parenti e amici a proteggersi.",
    "lb_tracker_notification_share_url_twitter": "http://www.avira.com/it/avira-browser-safety?x-a-source=ABSSocial&x-a-medium=Twitter",
    "lb_tracker_notification_share_url_facebook": "http://www.avira.com/it/avira-browser-safety?x-a-source=ABSSocial&x-a-medium=Facebook",
    "lb_tweet": "Tweet",
    "lb_share": "Condividi",
    "lb_trackers": "Tracker",
    "lb_ads": "Pubblicità",
    "lb_trackers_blocked_this_page": "<span class=\"txt--orange-dark\">Tracker</span> bloccati su questo sito web",
    "lb_ads_blocked_this_page": "<span class=\"txt--orange\">Pubblicità</span> bloccate su questo sito web",
    "lb_blocked_total": "<strong>{{ countTotal }}</strong><br>pubblicità e tracker bloccati in totale",
    "lb_adblocking_credits": "Blocco della pubblicità tramite <a href=\"https://adguard.com/?aid=27248\" target=\"_blank\">Adguard</a>"
}

},{}],75:[function(require,module,exports){
module.exports={
    "lb_safe_website": "安全なウェブサイト",
    "lb_unsafe_website": "安全でないウェブサイト",
    "lb_unsafe_content_website": "安全でないコンテンツ",
    "lb_mse_website": "信頼できない検索エンジン",
    "lb_trackers_blocked": "{{ domain }} の {{ count }} 件の広告およびトラッカーが<span class=\"txt--green\">ブロック</span>されました",
    "lb_trackers_blocked_short": "{{ count }} 件の広告およびトラッカーがブロックされました",
    "lb_trackers_block_all": "このウェブサイトでブロック",
    "lb_trackers_allow_all": "広告およびトラッカーのブロックを解除",
    "msg_no_trackers": "現在のページでは、ユーザーを追跡するトラッカーはありません。アクティブ トラッカーのあるウェブサイトを開くと、完全なリストがここに表示されます。",
    "msg_trackers_tooltip": "これらが、閲覧しているウェブサイトのトラッカーすべてです。隣のスライダーをクリックすることでトラッカーをブロックできます。スライダーが緑になると、トラッカーはブロックされ、ブラウジング アクティビティを追跡できなくなります。一部のトラッカーはデフォルトで許可されていることに注意してください。これらをブロックすると、ウェブページが正しく動作しなくなることがあります。",
    "lb_settings": "設定",
    "lb_setting_offers": "価格比較を表示",
    "lb_setting_tooltip_offers": "安全なウェブサイトのみから、ショッピングしているアイテムの、より優れたセールを表示します。",
    "lb_setting_dnt_header": "「ヘッダーを追跡しない」を送信",
    "lb_setting_tooltip_dnt_header": "ユーザーを追跡しないようにウェブサイトに通知します。要求を無視すると、ABS は依然としてトラッカーをブロックします。",
    "lb_setting_top_bar": "安全サインを表示",
    "lb_setting_block_trackers": "デフォルトでトラッカーをブロック",
    "lb_setting_tooltip_block_trackers": "デフォルトでトラッカーをブロックしてプライバシーを保護します。",
    "lb_setting_cliqz": "CLIQZ 検索",
    "lb_setting_tooltip_cliqz": "CLIQZ 検索は、ブラウザ バーの検索に移動する際にリアルタイムでウェブサイトおよび関連情報を提案します。これにより、検索が安全かつ高速になります。",
    "lb_setting_privacy_badger": "Privacy Badger",
    "lb_setting_tooltip_privacy_badger": "Privacy Badger は、スパイ広告をブロックし、隠れたトラッカーがユーザーの許可なしに秘密で追跡を行えないようにします。",
    "lb_setting_https_everywhere": "HTTPS Everywhere",
    "lb_setting_tooltip_https_everywhere": "HTTPS Everywhere は、通信を暗号化し、ブラウジングをより安全にします。",
    "lb_setting_inAppTracking": "匿名統計",
    "lb_setting_tooltip_inAppTracking": "匿名データを共有することで、製品向上に貢献します。",
    "lb_setting_show_advanced_controls": "その他のブラウジング コントロールを表示",
    "lb_setting_tooltip_show_advanced_controls": "Privacy Badger および HTTPS Everywhere アイコンをツールバーに表示します。",
    "lb_setting_google_services": "Google サービス",
    "lb_setting_adguard": "広告およびウェブ追跡をブロック",
    "lb_setting_tooltip_adguard": "ユーザーがオンラインで監視されないようにすることでプライバシーを保護します。また、迷惑なポップアップ、ウェブ バナー、ビデオ広告などもブロックします。",
    "lb_setting_adguard_social_media": "ソーシャル メディア追跡のブロック",
    "lb_setting_tooltip_adguard_social_media": "ソーシャル メディア ボタンおよびウィジェットをウェブサイトから無効にします。そうすることで、ソーシャル ネットワークは、ユーザーがアクセスしたサイトを追跡できなくなります。",
    "lb_setting_adguard_useful_ads": "有用な広告をブロックしないでください",
    "lb_setting_tooltip_adguard_useful_ads": "関連性があり、迷惑でない広告が検索結果に表示されるようにします。",
    "lb_setting_extension_scan": "拡張子の分析",
    "lb_setting_tooltip_extension_scan": "ブラウジングの際に疑わしいアクティビティが検出された場合は、匿名レポートを Avira に送信できるようにします。",
    "lb_setting_dark_mode": "ダークモード",
    "lb_setting_tooltip_dark_mode": "ダークモードの有効/無効を切り替える",
    "btn_blocking_back": "解除する",
    "lb_blocking_options": "その他のオプション",
    "lb_blocking_add_exception": "今後、このウェブサイトをブロックしない",
    "btn_blocking_continue": "継続する",
    "btn_dash_classification_cb_exception": "今後、このウェブサイトをブロックしない",
    "lb_dash_classification_exception_info_add": "例外の追加",
    "msg_dash_classification_exception_info_add": "このサイトは現在、例外リストにありません。例外を追加すると、そのアドレスを表示しようとしたときに、アドレスがブロックされなくなります。画面の上部には依然として警告が表示されます。",
    "lb_dash_classification_exception_info_remove": "例外の削除",
    "msg_dash_classification_exception_info_remove": "このサイトは現在、例外リストに記載されています。例外を削除すると、表示しようとするたびに、このアドレスがブロックされるようになります。",
    "lb_privacy": "プライバシー ポリシー",
    "lnk_privacy": "www.avira.com/ja/general-privacy",
    "lb_eula": "エンド ユーザー使用許諾契約書",
    "lnk_eula": "https://www.avira.com/ja/license-agreement-terms-of-use",
    "lb_discover_mode": "詳細を発見",
    "lb_feedback": "フィードバック",
    "lb_rate": "アプリの評価",
    "lb_dash_pua_action_cancel": "ダウンロードのキャンセル",
    "msg_mse_bar_warning": "お使いの検索エンジン設定は、改ざんされている可能性がありました。",
    "lb_mse_take_me_away": "解除する",
    "lb_mse_hide_warning": "この検索エンジンを信用します",
    "lnk_avira": "http://www.avira.com/ja/",
    "msg_blocked_iframe_replacement": "安全でないコンテンツ",
    "lb_unsafe_content_bar_warning": "Avira Browser Safety は、このウェブページでの安全でないコンテンツの読み込みを回避しました。",
    "lb_unsafe_content_bar_ignore": "今後、メッセージを表示しない",
    "lb_extension_permission_notification_extension_description": "Avira Browser Safety 拡張子は、疑わしいアクティビティについてのレポートを Avira に送信するためにユーザーの承諾を必要としています。",
    "lb_extension_permission_notification_extension_permission_title": "ブラウジングの際に疑わしいアクティビティが検出された場合は、匿名レポートを Avira に送信できるようにします。",
    "lb_extension_permission_notification_extension_permission_button": "許可",
    "lb_extension_permission_notification_extension_permission_no_title": "この機能は、設定でいつでも有効化することができます。",
    "lb_extension_permission_notification_extension_permission_no_button": "再度質問しない",
    "lb_unsafe_content": "安全でないコンテンツ",
    "msg_dash_unsafe_content_details_no_exception": "安全でないコンテンツがブロックされました：",
    "msg_dash_unsafe_content_details_exception": "安全でないコンテンツがブロックされました",
    "msg_dash_unsafe_content_risk_no_exception": "安全のためにも、コンテンツのブロックを維持することが推奨されます。",
    "msg_dash_unsafe_content_risk_exception": "安全のためにも、例外を削除して安全でないコンテンツをブロックすることが推奨されます。",
    "lb_dash_unsafe_content_show_details": "技術詳細",
    "lb_dash_unsafe_content_hide_details": "非表示にする",
    "msg_category_unknown": "このウェブサイトに関して見つかった情報はありません。",
    "msg_category_safe": "既知の脅威はありません。",
    "msg_category_malware": "これは、マルウェア ウェブサイトです",
    "msg_category_malware_sub": "マルウェア ウェブサイトはデバイスに感染します。そして、ウイルス、ワーム、スパイウェア、およびトロイの木馬に感染させることができます。",
    "msg_category_phishing": "これはフィッシング ウェブサイトです",
    "msg_category_phishing_sub": "フィッシング ウェブサイトはユーザーを騙して、パスワードおよび銀行口座の情報などのアカウント情報を開示します。",
    "msg_category_spam": "これは、スパム ウェブサイトです",
    "msg_category_spam_sub": "スパム ウェブサイトはユーザーのメール アドレスを取得し、電子メールで広告を送信します。",
    "msg_category_pua": "ダウンロード コンテンツには、潜在的に迷惑なアプリケーションが含まれます",
    "msg_category_pua2": "このウェブサイトは、PUA を配布します",
    "msg_category_pua2_sub": "潜在的に迷惑なアプリケーション（PUA）は、ユーザーが迷惑であると感じる動作を起こしたり、このような機能を含みます。",
    "msg_category_mse": "信頼できない検索エンジン",
    "msg_category_mse_sub": "この検索エンジンは信頼できません。これは、マルウェアおよび潜在的に迷惑なアプリケーションがトラフィックをリダイレクトすることが知られているためです。",
    "msg_category_unsafe_content": "安全でないコンテンツがブロックされました",
    "msg_category_unsafe_content_sub": "危険にされされているコンテンツまたは第三者コンテンツがハッキングされたり、意図的に有害なものである場合、ウェブページは安全でないコンテンツをロードします。",
    "msg_what_is_pua": "PUA とは何か？",
    "lnk_what_is_pua": "https://www.avira.com/ja/potentially-unwanted-applications",
    "lb_tab_privacy": "プライバシー",
    "lb_tab_security": "セキュリティ",
    "lb_my_modes": "モード",
    "msg_mode_select": "ニーズ<br/>に最も適したモードを選択します",
    "lb_mode_safe-surfing": "安全なサーフィン",
    "lb_mode_safe-private": "安全かつプライベート",
    "lb_mode_custom": "カスタム",
    "lb_powered_by_avira": "Powered by Avira",
    "lb_help": "ヘルプ",
    "lnk_abs_landing": "http://www.avira.com/abs-ftu",
    "lb_trackers_twitter_share": "{{ threshold }} 件の広告および #trackers は #Avira Browser Safety によってブロックされました。#forfree で入手しましょう！",
    "lb_trackers_facebook_share": "{{ threshold }} - Avira Browser Safety はこれまで、これほど多くの広告およびトラッカーによる、オンライン アクティビティのスパイ行為をブロックしました。無料ですし、非常にお勧めです。",
    "lb_congratulations": "おめでとうございます!",
    "lb_trackers_blocked_count": "{{ threshold }} 件の広告およびトラッカーがブロックされました！",
    "lb_trackers_milestone_subtitle": "家族や友達も保護します。",
    "lb_tracker_notification_share_url_twitter": "http://www.avira.com/ja/avira-browser-safety?x-a-source=ABSSocial&x-a-medium=Twitter",
    "lb_tracker_notification_share_url_facebook": "http://www.avira.com/ja/avira-browser-safety?x-a-source=ABSSocial&x-a-medium=Facebook",
    "lb_tweet": "ツィート",
    "lb_share": "共有",
    "lb_trackers": "トラッカー",
    "lb_ads": "広告",
    "lb_trackers_blocked_this_page": "このウェブサイトでブロックされた<span class=\"txt--orange-dark\">トラッカー</span>",
    "lb_ads_blocked_this_page": "このウェブサイトでブロックされた<span class=\"txt--orange\">広告</span>",
    "lb_blocked_total": "全体で <strong>{{ countTotal }}</strong><br> 件の広告およびトラッカーがブロックされました",
    "lb_adblocking_credits": "<a href=\"https://adguard.com/?aid=27248\" target=\"_blank\">Adguard</a>による広告ブロック"
}

},{}],76:[function(require,module,exports){
module.exports={
    "lb_safe_website": "Veilige website",
    "lb_unsafe_website": "Onveilige website",
    "lb_unsafe_content_website": "Onveilige inhoud",
    "lb_mse_website": "Niet-vertrouwde zoekmachine",
    "lb_trackers_blocked": "{{ count }} advertenties en trackers <span class=\"txt--green\">geblokkeerd</span> op {{ domain }}",
    "lb_trackers_blocked_short": "{{ count }} advertenties en trackers geblokkeerd",
    "lb_trackers_block_all": "Op deze website blokkeren",
    "lb_trackers_allow_all": "Advertenties en trackers niet meer blokkeren",
    "msg_no_trackers": "Er zijn geen trackers die u volgen op de huidige pagina. Wanneer u een website met actieve trackers opent, wordt de volledige lijst hier weergegeven.",
    "msg_trackers_tooltip": "Dit zijn alle trackers op de website die u bekijkt. U kunt een tracker blokkeren door op de schuifknop ernaast te klikken. Wanneer de schuifknop groen is, is de tracker geblokkeerd en kan deze uw surfgedrag niet traceren. Let op: sommige trackers worden standaard toegelaten. De website werkt misschien niet goed als u deze blokkeert.",
    "lb_settings": "Instellingen",
    "lb_setting_offers": "Prijsvergelijkingen tonen",
    "lb_setting_tooltip_offers": "Toon betere aanbiedingen voor artikelen die u wilt kopen van alleen veilige websites.",
    "lb_setting_dnt_header": "Niet traceren-header versturen",
    "lb_setting_tooltip_dnt_header": "Laat websites weten dat u niet getraceerd wilt worden. Indien zij dit verzoek negeren, zal ABS toch alle trackers blokkeren.",
    "lb_setting_top_bar": "Beveiligingsindicator tonen",
    "lb_setting_block_trackers": "Trackers standaard blokkeren",
    "lb_setting_tooltip_block_trackers": "Bescherm uw privacy door trackers standaard te blokkeren.",
    "lb_setting_cliqz": "CLIQZ Search",
    "lb_setting_tooltip_cliqz": "CLIQZ Search geeft u suggesties voor websites met relevante informatie in realtime terwijl u uw zoekopdracht in de browserzoekbalk intypt, waardoor u veiliger en sneller kunt zoeken.",
    "lb_setting_privacy_badger": "Privacy Badger",
    "lb_setting_tooltip_privacy_badger": "Privacy Badger blokkeert spionerende advertenties en voorkomt dat onzichtbare trackers u onopgemerkt volgen zonder uw toestemming.",
    "lb_setting_https_everywhere": "HTTPS Everywhere",
    "lb_setting_tooltip_https_everywhere": "HTTPS Everyhwere versleutelt uw berichten zodat u veiliger kunt surfen.",
    "lb_setting_inAppTracking": "Anonieme statistieken",
    "lb_setting_tooltip_inAppTracking": "Help ons het product te verbeteren door anonieme data te delen.",
    "lb_setting_show_advanced_controls": "Extra instellingen voor het surfen tonen",
    "lb_setting_tooltip_show_advanced_controls": "Geeft de pictogrammen van Privacy Badger en HTTPS Everywhere weer in de werkbalk.",
    "lb_setting_google_services": "Google-diensten",
    "lb_setting_adguard": "Advertenties & online traceren blokkeren",
    "lb_setting_tooltip_adguard": "Beschermt uw privacy door te voorkomen dat iemand u online kan volgen. Blokkeert ook opdringerige pop-ups, banners, video-advertenties en meer.",
    "lb_setting_adguard_social_media": "Traceren via social media blokkeren",
    "lb_setting_tooltip_adguard_social_media": "Schakelt social media-knoppen en -widgets op websites uit, zodat sociale netwerken niet kunnen bijhouden welke websites u bezoekt.",
    "lb_setting_adguard_useful_ads": "Bruikbare advertenties niet blokkeren",
    "lb_setting_tooltip_adguard_useful_ads": "Hierdoor worden relevante, niet-opdringerige advertenties in uw zoekresultaten getoond.",
    "lb_setting_extension_scan": "Extensie-analyse",
    "lb_setting_tooltip_extension_scan": "Geef toestemming een anoniem rapport naar Avira te versturen wanneer er verdachte activiteiten worden gedetecteerd tijdens het surfen.",
    "lb_setting_dark_mode": "Donkere modus",
    "lb_setting_tooltip_dark_mode": "Donkere modus in-/uitschakelen",
    "btn_blocking_back": "Haal me hier weg!",
    "lb_blocking_options": "Meer opties",
    "lb_blocking_add_exception": "Deze website nooit blokkeren",
    "btn_blocking_continue": "Toch doorgaan",
    "btn_dash_classification_cb_exception": "Deze website nooit blokkeren",
    "lb_dash_classification_exception_info_add": "Een uitzondering toevoegen",
    "msg_dash_classification_exception_info_add": "Deze site staat nu NIET op uw uitzonderingenlijst. Wanneer u een uitzondering toevoegt, wordt het adres niet geblokkeerd wanneer u deze probeert te bekijken. U blijft wel de waarschuwing boven aan het scherm zien.",
    "lb_dash_classification_exception_info_remove": "Een uitzondering verwijderen",
    "msg_dash_classification_exception_info_remove": "Deze site staat nu op uw uitzonderingenlijst. Wanneer u een uitzondering verwijdert, wordt het adres geblokkeerd wanneer u deze probeert te bekijken.",
    "lb_privacy": "Privacybeleid",
    "lnk_privacy": "https://www.avira.com/nl/general-privacy",
    "lb_eula": "Licentieovereenkomst voor eindgebruiker",
    "lnk_eula": "http://www.avira.com/nl/license-agreement-terms-of-use",
    "lb_discover_mode": "Meer ontdekken",
    "lb_feedback": "Feedback",
    "lb_rate": "App beoordelen",
    "lb_dash_pua_action_cancel": "Download annuleren",
    "msg_mse_bar_warning": "De instellingen van uw zoekmachine zijn mogelijk ongewenst veranderd.",
    "lb_mse_take_me_away": "Haal me hier weg!",
    "lb_mse_hide_warning": "Ik vertrouw deze zoekmachine",
    "lnk_avira": "https://www.avira.com/en/",
    "msg_blocked_iframe_replacement": "Onveilige inhoud",
    "lb_unsafe_content_bar_warning": "Avira Browser Safety voorkwam dat er onveilige inhoud op deze webpagina werd geladen.",
    "lb_unsafe_content_bar_ignore": "Dit bericht niet meer tonen",
    "lb_extension_permission_notification_extension_description": "De Avira Browser Safety-extensie heeft uw toestemming nodig om een rapport over verdachte activiteiten naar Avira te versturen.",
    "lb_extension_permission_notification_extension_permission_title": "Geef toestemming een anoniem rapport naar Avira te versturen wanneer er verdachte activiteiten worden gedetecteerd tijdens het surfen.",
    "lb_extension_permission_notification_extension_permission_button": "Toestaan",
    "lb_extension_permission_notification_extension_permission_no_title": "U kunt deze functie op ieder moment inschakelen bij Instellingen.",
    "lb_extension_permission_notification_extension_permission_no_button": "Niet meer vragen",
    "lb_unsafe_content": "Onveilige inhoud",
    "msg_dash_unsafe_content_details_no_exception": "Onveilige inhoud geblokkeerd:",
    "msg_dash_unsafe_content_details_exception": "Onveilige inhoud geblokkeerd",
    "msg_dash_unsafe_content_risk_no_exception": "Voor veiligheidsredenen wordt u aangeraden de inhoud te blijven blokkeren.",
    "msg_dash_unsafe_content_risk_exception": "Voor veiligheidsredenen wordt u aangeraden de onveilige inhoud te blokkeren door de uitzondering te verwijderen.",
    "lb_dash_unsafe_content_show_details": "Technische details",
    "lb_dash_unsafe_content_hide_details": "Verbergen",
    "msg_category_unknown": "Er is geen informatie voor deze website gevonden.",
    "msg_category_safe": "Geen bekende dreigingen.",
    "msg_category_malware": "Dit is een malwarewebsite",
    "msg_category_malware_sub": "Malwarewebsites besmetten uw apparaat en kunnen virussen, wormen, spyware en Trojaanse paarden bevatten.",
    "msg_category_phishing": "Dit is een phishingwebsite",
    "msg_category_phishing_sub": "Phishingwebsites misleiden u om persoonlijke informatie bekend te maken zoals wachtwoorden en bankrekeninginformatie.",
    "msg_category_spam": "Dit is een spamwebsite",
    "msg_category_spam_sub": "Spamwebsites bemachtigen uw e-mailadres om u via e-mail advertenties te sturen.",
    "msg_category_pua": "De download bevat Potentieel Ongewilde Toepassingen",
    "msg_category_pua2": "Deze website verspreidt PUA's",
    "msg_category_pua2_sub": "Potentieel Ongewilde Toepassingen (PUA's) tonen gedrag of bevatten functies die door gebruikers als ongewenst worden beschouwd.",
    "msg_category_mse": "Niet-vertrouwde zoekmachine",
    "msg_category_mse_sub": "Deze zoekmachine is niet vertrouwd omdat het bekend is dat malware en Potentieel Ongewilde Toepassingen er verkeer naar omleiden.",
    "msg_category_unsafe_content": "Onveilige inhoud geblokkeerd",
    "msg_category_unsafe_content_sub": "Webpagina's laden onveilige inhoud als deze gecompromitteerd zijn of inhoud van derden gehackt of doelbewust schadelijk is.",
    "msg_what_is_pua": "Wat is een PUA?",
    "lnk_what_is_pua": "https://www.avira.com/en/potentially-unwanted-applications",
    "lb_tab_privacy": "Privacy",
    "lb_tab_security": "Beveiliging",
    "lb_my_modes": "Modi",
    "msg_mode_select": "Selecteer de modus die het beste past<br/>bij uw behoeften",
    "lb_mode_safe-surfing": "Veilig surfen",
    "lb_mode_safe-private": "Veilig en privé",
    "lb_mode_custom": "Aangepast",
    "lb_powered_by_avira": "Aangeboden door Avira",
    "lb_help": "Help",
    "lnk_abs_landing": "http://www.avira.com/abs-ftu",
    "lb_trackers_twitter_share": "{{ threshold }} advertenties en #trackers werden geblokkeerd door #Avira Browser Safety. Krijg de uwe nu #gratis!",
    "lb_trackers_facebook_share": "{{ threshold }} - Zoveel advertenties en trackers heeft Avira Browser Safety tot nu toe gestopt met het bespioneren van mijn activiteiten online. Het is gratis en ik kan het zeer aanbevelen.",
    "lb_congratulations": "Gefeliciteerd!",
    "lb_trackers_blocked_count": "{{ threshold }} advertenties en trackers geblokkeerd!",
    "lb_trackers_milestone_subtitle": "Help uw familie en vrienden ook te beschermen.",
    "lb_tracker_notification_share_url_twitter": "http://www.avira.com/nl/avira-browser-safety?x-a-source=ABSSocial&x-a-medium=Twitter",
    "lb_tracker_notification_share_url_facebook": "http://www.avira.com/nl/avira-browser-safety?x-a-source=ABSSocial&x-a-medium=Facebook",
    "lb_tweet": "Tweeten",
    "lb_share": "Delen",
    "lb_trackers": "Trackers",
    "lb_ads": "Advertenties",
    "lb_trackers_blocked_this_page": "<span class=\"txt--orange-dark\">Trackers</span> op deze website geblokkeerd",
    "lb_ads_blocked_this_page": "<span class=\"txt--orange\">Advertenties</span> op deze website geblokkeerd",
    "lb_blocked_total": "<strong>{{ countTotal }}</strong><br>Totaal aantal geblokkeerde advertenties en trackers",
    "lb_adblocking_credits": "Advertenties blokkeren met <a href=\"https://adguard.com/?aid=27248\" target=\"_blank\">Adguard</a>"
}

},{}],77:[function(require,module,exports){
module.exports={
    "lb_safe_website": "Site seguro",
    "lb_unsafe_website": "Site inseguro",
    "lb_unsafe_content_website": "Conteúdos inseguros",
    "lb_mse_website": "Mecanismo de pesquisa não confiável",
    "lb_trackers_blocked": "{{ count }} anúncios e rastreadores <span class=\"txt--green\">bloqueados</span> em {{ domain }}",
    "lb_trackers_blocked_short": "{{ count }} anúncios e rastreadores bloqueados",
    "lb_trackers_block_all": "Bloqueios neste site",
    "lb_trackers_allow_all": "Desbloquear anúncios e rastreadores",
    "msg_no_trackers": "Não existem quaisquer rastreadores seguindo você na página atual. Se você abrir um site com rastreadores ativos, a lista completa será exibida aqui.",
    "msg_trackers_tooltip": "Estes são todos os rastreadores no site que você está visualizando. Você pode bloquear um rastreador clicando no controle deslizante que se encontra ao lado. Se um controle deslizante estiver verde, esse rastreador encontra-se bloqueado e não consegue rastrear sua atividade de navegação. Observe que alguns rastreadores são permitidos por padrão. Bloqueá-los poderá prejudicar o funcionamento da página web.",
    "lb_settings": "Configurações",
    "lb_setting_offers": "Exibir comparações de preços",
    "lb_setting_tooltip_offers": "Exibir negócios melhores para os itens que você está comprando somente de sites seguros.",
    "lb_setting_dnt_header": "Enviar cabeçalho Do Not Track",
    "lb_setting_tooltip_dnt_header": "Informe os sites de que não devem rastrear você. Se ignorarem o pedido, a Segurança do navegador Avira ainda bloqueia todos os rastreadores.",
    "lb_setting_top_bar": "Mostrar indicador de segurança",
    "lb_setting_block_trackers": "Bloquear rastreadores por padrão",
    "lb_setting_tooltip_block_trackers": "Proteja sua privacidade bloqueando rastreadores por padrão.",
    "lb_setting_cliqz": "Mecanismo de pesquisa CLIQZ",
    "lb_setting_tooltip_cliqz": "O mecanismo de pesquisa CLIQZ sugere a você sites e informações importantes em tempo real, enquanto você digita sua pesquisa na barra de navegação, permitindo que você pesquise de forma mais segura e rápida.",
    "lb_setting_privacy_badger": "Privacy Badger",
    "lb_setting_tooltip_privacy_badger": "O Privacy Badger bloqueia anúncios de espionagem e previne que rastreadores invisíveis o rastreiem secretamente, sem sua permissão.",
    "lb_setting_https_everywhere": "HTTPS Everywhere",
    "lb_setting_tooltip_https_everywhere": "O HTTPS Everywhere criptografa suas comunicações e torna sua navegação mais segura.",
    "lb_setting_inAppTracking": "Estatísticas anônimas",
    "lb_setting_tooltip_inAppTracking": "Ajude-nos a melhorar o produto, compartilhando dados anônimos.",
    "lb_setting_show_advanced_controls": "Controles de navegação extra",
    "lb_setting_tooltip_show_advanced_controls": "Exibe ícones de Privacy Badger e HTTPS Everywhere na barra de ferramentas.",
    "lb_setting_google_services": "Google Services",
    "lb_setting_adguard": "Bloquear anúncios e rastreamento da web",
    "lb_setting_tooltip_adguard": "Protege sua privacidade impedindo que qualquer pessoa possa monitorá-lo online. Também bloqueia pop-ups intrusivos, banners da web, anúncios em vídeo e outros.",
    "lb_setting_adguard_social_media": "Bloquear rastreamento de mídia social",
    "lb_setting_tooltip_adguard_social_media": "Desativa botões de mídias sociais e widgets de sites, para que as redes sociais não possam fazer o rastreamento dos sites que você visitar.",
    "lb_setting_adguard_useful_ads": "Não bloquear anúncios úteis",
    "lb_setting_tooltip_adguard_useful_ads": "Permite que anúncios relevantes e não intrusivos sejam mostrados nos resultados da pesquisa.",
    "lb_setting_extension_scan": "Análise de extensões",
    "lb_setting_tooltip_extension_scan": "Permite enviar um relatório anônimo à Avira se atividades suspeitas forem detectadas durante a navegação.",
    "lb_setting_dark_mode": "Modo escuro",
    "lb_setting_tooltip_dark_mode": "Desativar/ativar modo escuro",
    "btn_blocking_back": "Tire-me daqui!",
    "lb_blocking_options": "Mais opções",
    "lb_blocking_add_exception": "Nunca bloquear este site",
    "btn_blocking_continue": "Continuar mesmo assim",
    "btn_dash_classification_cb_exception": "Nunca bloquear este site",
    "lb_dash_classification_exception_info_add": "Adicionando uma exceção",
    "msg_dash_classification_exception_info_add": "Este site NÃO está atualmente em sua lista de exceções. Quando você adiciona uma exceção, o endereço não será bloqueado ao tentar visualizá-lo. Você ainda verá a advertência na parte superior da tela.",
    "lb_dash_classification_exception_info_remove": "Removendo uma exceção",
    "msg_dash_classification_exception_info_remove": "Este site está atualmente em sua lista de exceções. Se remover a exceção, o endereço será bloqueado sempre que você tentar exibi-lo.",
    "lb_privacy": "Política de privacidade",
    "lnk_privacy": "https://www.avira.com/pt-br/general-privacy",
    "lb_eula": "Contrato de Licença de Usuário Final",
    "lnk_eula": "https://www.avira.com/pt-br/license-agreement-terms-of-use",
    "lb_discover_mode": "Descubra mais",
    "lb_feedback": "Comentários",
    "lb_rate": "Classificar aplicativo",
    "lb_dash_pua_action_cancel": "Cancelar download",
    "msg_mse_bar_warning": "Suas configurações de motor de busca podem ter sido alteradas.",
    "lb_mse_take_me_away": "Tire-me daqui!",
    "lb_mse_hide_warning": "Eu confio nesse mecanismo de pesquisa",
    "lnk_avira": "http://www.avira.com/pt-br/",
    "msg_blocked_iframe_replacement": "Conteúdos inseguros",
    "lb_unsafe_content_bar_warning": "A Segurança do navegador Avira impediu o carregamento de conteúdos inseguros nessa página da Web.",
    "lb_unsafe_content_bar_ignore": "Não exibir essa mensagem novamente.",
    "lb_extension_permission_notification_extension_description": "A extensão de Segurança do navegador Avira precisa de sua aprovação para enviar-nos um relatório sobre atividades suspeitas.",
    "lb_extension_permission_notification_extension_permission_title": "Permite enviar um relatório anônimo à Avira se atividades suspeitas forem detectadas durante a navegação.",
    "lb_extension_permission_notification_extension_permission_button": "Permitir",
    "lb_extension_permission_notification_extension_permission_no_title": "Você pode ativar este recurso a qualquer momento nas configurações.",
    "lb_extension_permission_notification_extension_permission_no_button": "Não perguntar novamente",
    "lb_unsafe_content": "Conteúdos inseguros",
    "msg_dash_unsafe_content_details_no_exception": "Conteúdos inseguros bloqueados:",
    "msg_dash_unsafe_content_details_exception": "Conteúdos inseguros bloqueados",
    "msg_dash_unsafe_content_risk_no_exception": "Para sua segurança, é recomendável manter os conteúdos bloqueados.",
    "msg_dash_unsafe_content_risk_exception": "Para sua segurança, é recomendável remover a exceção e bloquear os conteúdos inseguros.",
    "lb_dash_unsafe_content_show_details": "Detalhes técnicos",
    "lb_dash_unsafe_content_hide_details": "Ocultar",
    "msg_category_unknown": "Não existem informações sobre este site.",
    "msg_category_safe": "Nenhuma ameaça conhecida.",
    "msg_category_malware": "Esse é um site de malware",
    "msg_category_malware_sub": "Os sites de malware infetam seu dispositivo e podem incluir vírus, worms, spyware e Cavalos de Troia.",
    "msg_category_phishing": "Esse é um site de phishing",
    "msg_category_phishing_sub": "Os sites de phishing induzem o usuário a revelar suas informações pessoais, tais como senhas e informações de contas bancárias.",
    "msg_category_spam": "Esse é um site de spam",
    "msg_category_spam_sub": "Os sites de spam capturam o seu endereço de email para enviar publicidade por email.",
    "msg_category_pua": "O download contém aplicativos potencialmente indesejados",
    "msg_category_pua2": "Esse site distribui PUA",
    "msg_category_pua2_sub": "Os aplicativos potencialmente indesejados (PUA) exibem um comportamento ou contêm recursos considerados indesejados pelos usuários.",
    "msg_category_mse": "Mecanismo de pesquisa não confiável",
    "msg_category_mse_sub": "Esse mecanismo de pesquisa é visto com desconfiança por o malware e os aplicativos potencialmente indesejados serem conhecidos por redirecionar tráfego.",
    "msg_category_unsafe_content": "Conteúdos inseguros bloqueados",
    "msg_category_unsafe_content_sub": "As páginas da Web carregam conteúdos inseguros se os conteúdos comprometidos ou de terceiros forem atacados por hackers ou forem intencionalmente nocivos.",
    "msg_what_is_pua": "O que são PUA?",
    "lnk_what_is_pua": "https://www.avira.com/pt/potentially-unwanted-applications",
    "lb_tab_privacy": "Privacidade",
    "lb_tab_security": "Segurança",
    "lb_my_modes": "Modos",
    "msg_mode_select": "Selecione o modo que melhor atende<br/>suas necessidades",
    "lb_mode_safe-surfing": "Navegação segura",
    "lb_mode_safe-private": "Seguro e privado",
    "lb_mode_custom": "Personalizado",
    "lb_powered_by_avira": "Desenvolvido pela Avira",
    "lb_help": "Ajuda",
    "lnk_abs_landing": "http://www.avira.com/abs-ftu",
    "lb_trackers_twitter_share": "{{ threshold }} anúncios e #rastreadores foram bloqueados pelo Segurança do navegador #Avira. Obtenha o seu agora #gratuitamente!",
    "lb_trackers_facebook_share": "{{ threshold }} - número de anúncios e rastreadores que o Segurança do navegador Avira impediu de espionar minhas atividades online até agora. É gratuito e altamente recomendável.",
    "lb_congratulations": "Parabéns!",
    "lb_trackers_blocked_count": "{{ threshold }} anúncios e rastreadores bloqueados!",
    "lb_trackers_milestone_subtitle": "Ajude a proteger sua família e amigos também.",
    "lb_tracker_notification_share_url_twitter": "http://www.avira.com/pt-br/avira-browser-safety?x-a-source=ABSSocial&x-a-medium=Twitter",
    "lb_tracker_notification_share_url_facebook": "http://www.avira.com/pt-br/avira-browser-safety?x-a-source=ABSSocial&x-a-medium=Facebook",
    "lb_tweet": "Tweet",
    "lb_share": "Compartilhar",
    "lb_trackers": "Rastreadores",
    "lb_ads": "Anúncios",
    "lb_trackers_blocked_this_page": "<span class=\"txt--orange-dark\">Rastreadores</span> bloqueados neste site",
    "lb_ads_blocked_this_page": "<span class=\"txt--orange\">Anúncios</span> bloqueados neste site",
    "lb_blocked_total": "<strong>{{ countTotal }}</strong><br>Anúncios e rastreadores gerais bloqueados",
    "lb_adblocking_credits": "Anúncio bloqueado por <a href=\"https://adguard.com/?aid=27248\" target=\"_blank\">Adguard</a>"
}

},{}],78:[function(require,module,exports){
module.exports={
    "lb_safe_website": "Надежный веб-сайт",
    "lb_unsafe_website": "Ненадежный веб-сайт",
    "lb_unsafe_content_website": "Небезопасное содержимое",
    "lb_mse_website": "Ненадежная поисковая система",
    "lb_trackers_blocked": "<span class=\"txt--green\">Заблокировано</span> рекламных объявлений и программ отслеживания на {{ domain }}: {{ count }}",
    "lb_trackers_blocked_short": "Заблокировано рекламных объявлений и программ отслеживания: {{ count }}",
    "lb_trackers_block_all": "Заблокировать на этом веб-сайте",
    "lb_trackers_allow_all": "Разблокировать все рекламные объявления и программы отслеживания",
    "msg_no_trackers": "На данной странице нет программ отслеживания. При открытии веб-сайта с активными программами отслеживания их полный список будет показан здесь.",
    "msg_trackers_tooltip": "Это все программы отслеживания на текущем веб-сайте. Для блокировки программы отслеживания нажмите на ползунок рядом с ним. Если ползунок отображается зеленым, то программа заблокирована и не может отслеживать ваши действия. Обратите внимание, что по умолчанию некоторые программы отслеживания разблокированы. Их блокировка может привести к некорректной работе веб-страницы.",
    "lb_settings": "Настройки",
    "lb_setting_offers": "Показать сравнение цен",
    "lb_setting_tooltip_offers": "Показывать более выгодные цены на товары, которые вы ищете, только с надежных веб-сайтов.",
    "lb_setting_dnt_header": "Отправить заголовок «Не отслеживать»",
    "lb_setting_tooltip_dnt_header": "Запрашивать отключение отслеживания на веб-сайтах. Если сайты игнорируют запрос, веб-фильтр Avira все равно блокирует все программы отслеживания.",
    "lb_setting_top_bar": "Показать индикатор безопасности",
    "lb_setting_block_trackers": "Блокировать программы отслеживания по умолчанию",
    "lb_setting_tooltip_block_trackers": "Защитите свои персональные данные, блокируя программы отслеживания по умолчанию.",
    "lb_setting_cliqz": "Поиск CLIQZ",
    "lb_setting_tooltip_cliqz": "Поиск CLIQZ предлагает вам веб-сайты и релевантную информацию в реальном времени при введении данных в строку браузера, что делает поиск быстрее и безопаснее.",
    "lb_setting_privacy_badger": "Privacy Badger",
    "lb_setting_tooltip_privacy_badger": "Privacy Badger блокирует шпионскую рекламу и предотвращает отслеживание ваших действий невидимыми программами отслеживания.",
    "lb_setting_https_everywhere": "HTTPS Everywhere",
    "lb_setting_tooltip_https_everywhere": "HTTPS Everywhere обеспечивает шифрование вашей переписки и повышает вашу безопасность онлайн.",
    "lb_setting_inAppTracking": "Анонимная статистика",
    "lb_setting_tooltip_inAppTracking": "Помогите нам улучшить продукт, предоставив анонимные данные.",
    "lb_setting_show_advanced_controls": "Больше возможностей просмотра",
    "lb_setting_tooltip_show_advanced_controls": "Показать на панели значки Privacy Badger и HTTPS Everywhere.",
    "lb_setting_google_services": "Службы Google",
    "lb_setting_adguard": "Заблокировать рекламные объявления и программы отслеживания в Интернете",
    "lb_setting_tooltip_adguard": "Защищает вашу конфиденциальность, предотвращая несанкционированное наблюдение за вашими действиями в Интернете. Кроме того, блокирует назойливые всплывающие окна, веб-баннеры, рекламные видеоролики и другие нежелательные объявления.",
    "lb_setting_adguard_social_media": "Заблокировать программы отслеживания в социальных сетях",
    "lb_setting_tooltip_adguard_social_media": "Отключает кнопки и виджеты социальных сетей на веб-сайтах, благодаря чему социальные сети не могут следить за тем, какие веб-сайты вы посещаете.",
    "lb_setting_adguard_useful_ads": "Не блокировать уместную рекламу",
    "lb_setting_tooltip_adguard_useful_ads": "Отображает релевантные рекламные объявления в результатах поиска.",
    "lb_setting_extension_scan": "Анализ расширений",
    "lb_setting_tooltip_extension_scan": "Включите для отправки специалистам Avira анонимных отчетов при обнаружении подозрительной деятельности в ходе просмотра веб-страниц.",
    "lb_setting_dark_mode": "Темный режим",
    "lb_setting_tooltip_dark_mode": "Включить/отключить темный режим",
    "btn_blocking_back": "Уходим отсюда!",
    "lb_blocking_options": "Дополнительные опции",
    "lb_blocking_add_exception": "Никогда не блокировать этот веб-сайт",
    "btn_blocking_continue": "Все равно продолжить",
    "btn_dash_classification_cb_exception": "Никогда не блокировать этот веб-сайт",
    "lb_dash_classification_exception_info_add": "Добавление исключения",
    "msg_dash_classification_exception_info_add": "Этот сайт НЕ включен в ваш список исключений. После добавления исключения этот веб-сайт не будет блокироваться при попытке перехода на него. В верхней части экрана будет отображаться предупреждение.",
    "lb_dash_classification_exception_info_remove": "Удаление исключения",
    "msg_dash_classification_exception_info_remove": "Этот сайт включен в ваш список исключений. После удаления исключения этот веб-сайт будет блокироваться при попытке перехода на него.",
    "lb_privacy": "Политика конфиденциальности",
    "lnk_privacy": "https://www.avira.com/ru/general-privacy",
    "lb_eula": "Лицензионное соглашение с конечным пользователем",
    "lnk_eula": "https://www.avira.com/ru/license-agreement-terms-of-use",
    "lb_discover_mode": "Узнать больше",
    "lb_feedback": "Обратная связь",
    "lb_rate": "Оценить приложение",
    "lb_dash_pua_action_cancel": "Отменить загрузку",
    "msg_mse_bar_warning": "Возможно, ваши настройки поиска были изменены.",
    "lb_mse_take_me_away": "Уходим отсюда!",
    "lb_mse_hide_warning": "Я доверяю этой поисковой системе",
    "lnk_avira": "http://www.avira.com/ru/",
    "msg_blocked_iframe_replacement": "Небезопасное содержимое",
    "lb_unsafe_content_bar_warning": "Веб-фильтр Avira предотвратил загрузку небезопасного содержимого на этой веб-странице.",
    "lb_unsafe_content_bar_ignore": "Больше не показывать это сообщение",
    "lb_extension_permission_notification_extension_description": "Веб-фильтру Avira требуется разрешение на отправку специалистам Avira отчетов о подозрительной деятельности.",
    "lb_extension_permission_notification_extension_permission_title": "Включите для отправки специалистам Avira анонимных отчетов при обнаружении подозрительной деятельности в ходе просмотра веб-страниц.",
    "lb_extension_permission_notification_extension_permission_button": "Разрешить",
    "lb_extension_permission_notification_extension_permission_no_title": "Эту возможность можно в любой момент включить в разделе настроек.",
    "lb_extension_permission_notification_extension_permission_no_button": "Больше не спрашивать",
    "lb_unsafe_content": "Небезопасное содержимое",
    "msg_dash_unsafe_content_details_no_exception": "Небезопасное содержимое заблокировано:",
    "msg_dash_unsafe_content_details_exception": "Небезопасное содержимое заблокировано",
    "msg_dash_unsafe_content_risk_no_exception": "Рекомендуем для вашей безопасности оставить это содержимое заблокированным.",
    "msg_dash_unsafe_content_risk_exception": "Рекомендуем для вашей безопасности заблокировать небезопасное содержимое, удалив исключение.",
    "lb_dash_unsafe_content_show_details": "Технические подробности",
    "lb_dash_unsafe_content_hide_details": "Скрыть",
    "msg_category_unknown": "Информация об этом веб-сайте не найдена.",
    "msg_category_safe": "Известных угроз нет.",
    "msg_category_malware": "Это вредоносный веб-сайт",
    "msg_category_malware_sub": "Вредоносные веб-сайты могут заразить ваше устройство с помощью вирусов, червей, шпионского ПО и троянов.",
    "msg_category_phishing": "Это фишинговый веб-сайт",
    "msg_category_phishing_sub": "Фишинговые веб-сайты обманом получают от вас конфиденциальную информацию (например, пароли и номера банковских счетов).",
    "msg_category_spam": "Это спам-сайт",
    "msg_category_spam_sub": "Спам-сайты крадут ваш адрес электронной почты и используют его для нежелательных рассылок.",
    "msg_category_pua": "Загрузка содержит потенциально нежелательные приложения",
    "msg_category_pua2": "Этот веб-сайт распространяет потенциально нежелательные приложения",
    "msg_category_pua2_sub": "Потенциально нежелательные приложения выполняют действия или содержат функции, воспринимаемые пользователями как нежелательные.",
    "msg_category_mse": "Ненадежная поисковая система",
    "msg_category_mse_sub": "Эта поисковая система не является надежной, поскольку потенциально нежелательные приложения перенаправляют на нее трафик.",
    "msg_category_unsafe_content": "Небезопасное содержимое заблокировано",
    "msg_category_unsafe_content_sub": "Веб-страницы могут стать небезопасными после взлома или могут содержать вредоносные сторонние материалы.",
    "msg_what_is_pua": "Что такое потенциально нежелательные приложения?",
    "lnk_what_is_pua": "https://www.avira.com/ru/potentially-unwanted-applications",
    "lb_tab_privacy": "Конфиденциальность",
    "lb_tab_security": "Безопасность",
    "lb_my_modes": "Режимы",
    "msg_mode_select": "Выберите наиболее подходящий<br/> режим",
    "lb_mode_safe-surfing": "Безопасный просмотр",
    "lb_mode_safe-private": "Безопасность и конфиденциальность",
    "lb_mode_custom": "Пользователь",
    "lb_powered_by_avira": "Технологии Avira",
    "lb_help": "Справка",
    "lnk_abs_landing": "http://www.avira.com/abs-ftu",
    "lb_trackers_twitter_share": "{{ threshold }} — столько рекламных объявлений и программ #отслеживания заблокировано Веб-фильтром #Avira. Установите #бесплатно прямо сейчас!",
    "lb_trackers_facebook_share": "{{ threshold }} — столько рекламных объявлений и программ отслеживания уже заблокировал Веб-фильтр Avira, предотвратив слежку за моими действиями в Интернете. Это очень эффективное средство — и абсолютно бесплатное.",
    "lb_congratulations": "Поздравляем!",
    "lb_trackers_blocked_count": "Заблокировано рекламных объявлений и программ отслеживания: {{ threshold }}.",
    "lb_trackers_milestone_subtitle": "Помогите друзьям и близким тоже защитить свою конфиденциальность.",
    "lb_tracker_notification_share_url_twitter": "http://www.avira.com/ru/avira-browser-safety?x-a-source=ABSSocial&x-a-medium=Twitter",
    "lb_tracker_notification_share_url_facebook": "http://www.avira.com/ru/avira-browser-safety?x-a-source=ABSSocial&x-a-medium=Facebook",
    "lb_tweet": "Твитнуть",
    "lb_share": "Поделиться",
    "lb_trackers": "Программы отслеживания",
    "lb_ads": "Реклама",
    "lb_trackers_blocked_this_page": "<span class=\"txt--orange-dark\">Программы отслеживания</span>, заблокированные на этом веб-сайте",
    "lb_ads_blocked_this_page": "<span class=\"txt--orange\">Рекламные объявления</span>, заблокированные на этом веб-сайте",
    "lb_blocked_total": "Всего заблокировано рекламных объявлений и программ отслеживания: <strong>{{ countTotal }}</strong><br>",
    "lb_adblocking_credits": "Блокировщик рекламы <a href=\"https://adguard.com/?aid=27248\" target=\"_blank\">Adguard</a>"
}

},{}],79:[function(require,module,exports){
module.exports={
    "lb_safe_website": "Güvenli web sitesi",
    "lb_unsafe_website": "Güvensiz web sitesi",
    "lb_unsafe_content_website": "Güvensiz içerik",
    "lb_mse_website": "Güvenilmez Arama Motoru",
    "lb_trackers_blocked": "{{ count }} reklam ve takipçi {{ domain }} üzerinde <span class=\"txt--green\">engellendi</span>",
    "lb_trackers_blocked_short": "{{ count }} reklam ve takipçi engellendi",
    "lb_trackers_block_all": "Bu web sitesinde engelle",
    "lb_trackers_allow_all": "Reklam ve takipçi engelini kaldır",
    "msg_no_trackers": "Geçerli sayfada sizi izleyen takipçi yok. Etkin takipçilerin olduğu bir web sitesini açarsanız listenin tamamı burada gösterilir.",
    "msg_trackers_tooltip": "Bunlar izlemekte olduğunuz web sitesindeki takipçilerin tümü. Bir takipçiyi yanındaki kaydırıcıya tıklayarak engelleyebilirsiniz. Kaydırıcı yeşilse takipçi engellenmiştir ve tarama etkinliğinizi izleyemez. Not edin, bazı takipçilere varsayılan olarak izin verilir. Bunları engellemek web sitesinin doğru çalışmamasıyla sonuçlanabilir.",
    "lb_settings": "Ayarlar",
    "lb_setting_offers": "Fiyat karşılaştırmaları göster",
    "lb_setting_tooltip_offers": "Alışveriş yaptığınız ürünler için sadece güvenli web sitelerindeki indirimleri göster.",
    "lb_setting_dnt_header": "İzlememe başlığı gönder",
    "lb_setting_tooltip_dnt_header": "Web sitelerine sizi izlememelerini bildirir. Bu isteği yok sayarlarsa, ABS yine de takipçileri engeller.",
    "lb_setting_top_bar": "Güvenlik göstergesini belirt",
    "lb_setting_block_trackers": "Takipçileri varsayılan olarak engelle",
    "lb_setting_tooltip_block_trackers": "Takipçileri varsayılan olarak engelleyin ve gizliliğinizi koruyun.",
    "lb_setting_cliqz": "CLIQZ Arama",
    "lb_setting_tooltip_cliqz": "CLIQZ Arama, siz tarayıcı çubuğuna arama bilgisi girerken gerçek zamanlı olarak web siteleri ve anlamlı bilgi önerir, bu da size daha güvenli ve hızlı arama olanağı verir.",
    "lb_setting_privacy_badger": "Privacy Badger",
    "lb_setting_tooltip_privacy_badger": "Privacy Badger casus reklamların ve görünmez takipçilerin, izniniz olmadan sizi gizlice takip etmesini engeller.",
    "lb_setting_https_everywhere": "HTTPS Everywhere",
    "lb_setting_tooltip_https_everywhere": "HTTPS Everywhere iletişiminizi şifreler ve tarama etkinliğinizi daha güvenli kılar.",
    "lb_setting_inAppTracking": "Anonim İstatistikler",
    "lb_setting_tooltip_inAppTracking": "Bizimle anonim veri paylaşarak ürün geliştirmeye yardımcı olun.",
    "lb_setting_show_advanced_controls": "Ekstra tarama denetimlerini göster",
    "lb_setting_tooltip_show_advanced_controls": "Araç çubuğunda Privacy Badger ve HTTPS Everywhere simgelerini görüntüler.",
    "lb_setting_google_services": "Google Hizmetleri",
    "lb_setting_adguard": "Reklamları ve web izlemeyi engelle",
    "lb_setting_tooltip_adguard": "Sizi çevrimiçi izleyen herkesi durdurarak gizliliğinizi korur. Açılır pencere, web başlıkları, video reklamlar ve diğerlerini de engeller.",
    "lb_setting_adguard_social_media": "Sosyal medya izlemeyi engelle",
    "lb_setting_tooltip_adguard_social_media": "Web sitelerindeki sosyal medya düğmeleri ve pencere öğelerini devre dışı bırakır ve sosyal ağların gittiğiniz siteleri izlemesini engeller.",
    "lb_setting_adguard_useful_ads": "Yararlı reklamları engelleme",
    "lb_setting_tooltip_adguard_useful_ads": "Arama sonuçlarında ilgili ve saldırgan olmayan reklamlara izin verir.",
    "lb_setting_extension_scan": "Uzantı Analizi",
    "lb_setting_tooltip_extension_scan": "Tarama sırasında şüpheli etkinlik algılanırsa Avira'ya anonim rapor göndermek için etkinleştir.",
    "lb_setting_dark_mode": "Koyu Mod",
    "lb_setting_tooltip_dark_mode": "Koyu Mod aç/kapat",
    "btn_blocking_back": "Beni uzaklaştır!",
    "lb_blocking_options": "Daha fazla seçenek",
    "lb_blocking_add_exception": "Bu siteyi asla engelleme",
    "btn_blocking_continue": "Yine de devam et",
    "btn_dash_classification_cb_exception": "Bu siteyi asla engelleme",
    "lb_dash_classification_exception_info_add": "Özel durum ekleniyor",
    "msg_dash_classification_exception_info_add": "Bu web sitesi geçerli özel durum listenizde YOK. Bir özel durum eklediğinizde, adresi görüntülemek istediğinizde adres engellenmez. Uyarıyı ekranın üstünde yine de görürsünüz.",
    "lb_dash_classification_exception_info_remove": "Özel durumu kaldırma",
    "msg_dash_classification_exception_info_remove": "Bu web sitesi geçerli özel durum listenizde var. Özel durumu kaldırdığınızda, adres her görüntülemek istediğinizde engellenir.",
    "lb_privacy": "Gizlilik ilkesi",
    "lnk_privacy": "https://www.avira.com/en/general-privacy",
    "lb_eula": "Son Kullanıcı Lisans Sözleşmesi",
    "lnk_eula": "https://www.avira.com/en/license-agreement-terms-of-use",
    "lb_discover_mode": "Daha fazlasını keşfedin",
    "lb_feedback": "Geribildirim",
    "lb_rate": "Uygulamayı derecelendir",
    "lb_dash_pua_action_cancel": "Karşıdan yüklemeyi iptal et",
    "msg_mse_bar_warning": "Arama motoru ayarlarınız kurcalanmış olabilir.",
    "lb_mse_take_me_away": "Beni uzaklaştır!",
    "lb_mse_hide_warning": "Bu arama motoruna güveniyorum",
    "lnk_avira": "http://www.avira.com/tr/",
    "msg_blocked_iframe_replacement": "Güvensiz içerik",
    "lb_unsafe_content_bar_warning": "Avira Browser Safety bu web sayfasındaki güvenli olmayan içeriğin yüklenmesini önledi.",
    "lb_unsafe_content_bar_ignore": "İletiyi yeniden gösterme",
    "lb_extension_permission_notification_extension_description": "Avira Browser Safety Uzantısı Avira'ya şüpheli etkinlik raporu göndermek için onayınıza gerek duyuyor.",
    "lb_extension_permission_notification_extension_permission_title": "Tarama sırasında şüpheli etkinlik algılanırsa Avira'ya anonim rapor göndermek için etkinleştir.",
    "lb_extension_permission_notification_extension_permission_button": "İzin ver",
    "lb_extension_permission_notification_extension_permission_no_title": "Bu özelliği ayarlardan istediğiniz zaman etkinleştirin.",
    "lb_extension_permission_notification_extension_permission_no_button": "Tekrar sorma",
    "lb_unsafe_content": "Güvensiz İçerik",
    "msg_dash_unsafe_content_details_no_exception": "Güvensiz içerik engellendi:",
    "msg_dash_unsafe_content_details_exception": "Güvensiz içerik engellendi",
    "msg_dash_unsafe_content_risk_no_exception": "Güvenliğiniz için bu içeriği engellemeniz önerilir.",
    "msg_dash_unsafe_content_risk_exception": "Güvenliğiniz için güvenli olmayan içeriği özel durumu kaldırarak engellemeniz önerilir.",
    "lb_dash_unsafe_content_show_details": "Teknik ayrıntılar",
    "lb_dash_unsafe_content_hide_details": "Gizle",
    "msg_category_unknown": "Bu web sitesi için hiçbir bilgi bulunamadı.",
    "msg_category_safe": "Bilinen bir tehdit yok.",
    "msg_category_malware": "Bu bir zararlı yazılım web sitesi",
    "msg_category_malware_sub": "Zararlı yazılım siteleri aygıtınıza bulaşır ve virüs, solucan, casus yazılım ve Truva atı içerebilir.",
    "msg_category_phishing": "Bu bir kimlik avı web sitesi",
    "msg_category_phishing_sub": "Kimlik avı web siteleri parola ve banka bilgileri gibi kişisel bilgilerinizi açıklamanız için sizi kandırır.",
    "msg_category_spam": "Bu bir istenmeyen posta web sitesi",
    "msg_category_spam_sub": "İstenmeyen posta siteleri e-posta adresinizi ele geçirip istemediğiniz reklamlar gönderir.",
    "msg_category_pua": "Karşıdan yükleme İstenmeyebilecek Uygulamalar içeriyor",
    "msg_category_pua2": "Bu web sitesi PUA dağıtıyor",
    "msg_category_pua2_sub": "İstenmeyebilecek Uygulamalar (PUA'lar) kullanıcının istemediği şekilde davranır veya bu türde özellikler içerir.",
    "msg_category_mse": "Güvenilmez arama motoru",
    "msg_category_mse_sub": "Bu arama motoruna güvenilmez çünkü zararlı yazılımların ve İstenmeyebilecek Uygulamaların buraya trafik yönlendirdiği biliniyor.",
    "msg_category_unsafe_content": "Güvensiz içerik engellendi",
    "msg_category_unsafe_content_sub": "Web sayfaları bozuksa veya üçüncü taraf içerik kırıldıysa veya bilerek zararlıysa güvenilmez içerik yükler.",
    "msg_what_is_pua": "PUA nedir?",
    "lnk_what_is_pua": "https://www.avira.com/en/potentially-unwanted-applications",
    "lb_tab_privacy": "Gizlilik",
    "lb_tab_security": "Güvenlik",
    "lb_my_modes": "Modlar",
    "msg_mode_select": "Gereksinimi en iyi karşılayan<br/>modu seçin",
    "lb_mode_safe-surfing": "Güvenli Gezinmeler",
    "lb_mode_safe-private": "Güvenli ve Özel",
    "lb_mode_custom": "Özel",
    "lb_powered_by_avira": "Powered by Avira",
    "lb_help": "Yardım",
    "lnk_abs_landing": "http://www.avira.com/abs-ftu",
    "lb_trackers_twitter_share": "{{ threshold }} reklam ve #takipçi #Avira Browser Safety tarafından engellendi. Siz de #ücretsiz edinin!",
    "lb_trackers_facebook_share": "{{ threshold }} - şimdiye kadar çevrimiçi etkinliğimi izleyen ve Avira Browser Safety'nin engellediği reklam ve takipçi sayısı. Ücretsiz ve heyecanla öneririm.",
    "lb_congratulations": "Tebrikler!",
    "lb_trackers_blocked_count": "{{ threshold }} reklam ve takipçi engellendi!",
    "lb_trackers_milestone_subtitle": "Aile ve arkadaşlarınızı da korumaya yardımcı olun.",
    "lb_tracker_notification_share_url_twitter": "http://www.avira.com/tr/avira-browser-safety?x-a-source=ABSSocial&x-a-medium=Twitter",
    "lb_tracker_notification_share_url_facebook": "http://www.avira.com/tr/avira-browser-safety?x-a-source=ABSSocial&x-a-medium=Facebook",
    "lb_tweet": "Tweet",
    "lb_share": "Paylaş",
    "lb_trackers": "Takipçiler",
    "lb_ads": "Reklamlar",
    "lb_trackers_blocked_this_page": "Bu sitede engellenen <span class=\"txt--orange-dark\">takipçiler</span>",
    "lb_ads_blocked_this_page": "Bu sitede engellenen <span class=\"txt--orange\">reklamlar</span>",
    "lb_blocked_total": "<strong>{{ countTotal }}</strong><br>Tüm reklamlar ve takipçiler engellendi",
    "lb_adblocking_credits": "<a href=\"https://adguard.com/?aid=27248\" target=\"_blank\">Adguard</a> ile reklam engelleme"
}

},{}],80:[function(require,module,exports){
module.exports={
    "lb_safe_website": "安全网站",
    "lb_unsafe_website": "不安全网站",
    "lb_unsafe_content_website": "不安全内容",
    "lb_mse_website": "不受信任的搜索引擎",
    "lb_trackers_blocked": "在 {{ domain }} 上<span class=\"txt--green\">阻止了</span> {{ count }} 个广告和追踪器",
    "lb_trackers_blocked_short": "阻止了 {{ count }} 个广告和追踪器",
    "lb_trackers_block_all": "在此网站上阻止",
    "lb_trackers_allow_all": "解除对广告和追踪器的阻止",
    "msg_no_trackers": "当前页面上没有追踪器对您进行跟踪。如果您打开一个有动态追踪器的网站，则会在此处显示完整列表。",
    "msg_trackers_tooltip": "这些是您正在查看的网站上的所有追踪器。您可以通过点击旁边的滑块来阻止追踪器。当滑块显示为绿色时，该追踪器被阻止，无法跟踪您的浏览活动。请注意，有些追踪器默认为允许使用。阻止它们可能会导致网页无法正常工作。",
    "lb_settings": "设置",
    "lb_setting_offers": "显示价格比较",
    "lb_setting_tooltip_offers": "为您购买的商品仅显示安全网站中的更佳优惠。",
    "lb_setting_dnt_header": "发送“不要跟踪头文件”",
    "lb_setting_tooltip_dnt_header": "通知网站不对您进行跟踪。如果它们忽略这个请求，Avira 浏览器安全仍然会阻止任何追踪器。",
    "lb_setting_top_bar": "显示安全指标",
    "lb_setting_block_trackers": "默认情况下阻止追踪器",
    "lb_setting_tooltip_block_trackers": "通过默认阻止追踪器来保护您的隐私。",
    "lb_setting_cliqz": "CLIQZ 搜索",
    "lb_setting_tooltip_cliqz": "当您在浏览器栏中输入您的搜索时，CLIQZ 搜索会实时显示您的网站和相关信息，这使您可以更安全、更快地搜索。",
    "lb_setting_privacy_badger": "Privacy Badger",
    "lb_setting_tooltip_privacy_badger": "Privacy Badger 阻止间谍广告，并防止隐形追踪器未经您的许可秘密跟踪您。",
    "lb_setting_https_everywhere": "HTTPS Everywhere",
    "lb_setting_tooltip_https_everywhere": "HTTPS Everywhere 对您的通信进行加密，使您更安全地浏览。",
    "lb_setting_inAppTracking": "匿名统计数据",
    "lb_setting_tooltip_inAppTracking": "通过分享匿名数据帮助我们改进产品。",
    "lb_setting_show_advanced_controls": "显示其他浏览控件",
    "lb_setting_tooltip_show_advanced_controls": "在工具栏显示 Privacy Badger 和 HTTPS Everywhere 图标。",
    "lb_setting_google_services": "Google 服务",
    "lb_setting_adguard": "阻止广告和网站跟踪",
    "lb_setting_tooltip_adguard": "通过阻止任何人对您进行在线监视，从而保护您的隐私。也可以阻止入侵式弹出窗口、网页横幅、视频广告等。",
    "lb_setting_adguard_social_media": "阻止社交媒体跟踪",
    "lb_setting_tooltip_adguard_social_media": "禁用网站上的社交媒体按钮和插件，这样社交网络就无法跟踪您访问的网站。",
    "lb_setting_adguard_useful_ads": "不要屏蔽有用的广告",
    "lb_setting_tooltip_adguard_useful_ads": "允许在您的搜索结果中显示相关的非入侵式广告。",
    "lb_setting_extension_scan": "扩展名分析",
    "lb_setting_tooltip_extension_scan": "如果在浏览过程中检测到可疑活动，则可以向 Avira 发送匿名报告。",
    "lb_setting_dark_mode": "深色模式",
    "lb_setting_tooltip_dark_mode": "开启/关闭深色模式",
    "btn_blocking_back": "退出此网页！",
    "lb_blocking_options": "更多选项",
    "lb_blocking_add_exception": "永远不阻止此网站",
    "btn_blocking_continue": "仍然继续",
    "btn_dash_classification_cb_exception": "永远不阻止此网站",
    "lb_dash_classification_exception_info_add": "添加例外",
    "msg_dash_classification_exception_info_add": "该网站目前不在您的例外列表中。添加一个例外后，该地址在您尝试查看时不会被阻止。您仍然会在屏幕上方看到警告。",
    "lb_dash_classification_exception_info_remove": "删除例外",
    "msg_dash_classification_exception_info_remove": "该网站目前在您的例外列表中。如果您删除了这个例外，那么该地址将在每次您试图查看时被阻止。",
    "lb_privacy": "隐私政策",
    "lnk_privacy": "https://www.avira.com/zh-cn/general-privacy",
    "lb_eula": "最终用户许可协议",
    "lnk_eula": "https://www.avira.com/zh-cn/license-agreement-terms-of-use",
    "lb_discover_mode": "发现更多",
    "lb_feedback": "反馈",
    "lb_rate": "评价应用程序",
    "lb_dash_pua_action_cancel": "取消下载",
    "msg_mse_bar_warning": "您的搜索引擎设置可能被篡改。",
    "lb_mse_take_me_away": "退出此网页！",
    "lb_mse_hide_warning": "信任此搜索引擎",
    "lnk_avira": "http://www.avira.com/zh-cn/",
    "msg_blocked_iframe_replacement": "不安全内容",
    "lb_unsafe_content_bar_warning": "Avira 浏览器安全防止在此网页上加载不安全的内容。",
    "lb_unsafe_content_bar_ignore": "不再显示消息",
    "lb_extension_permission_notification_extension_description": "Avira 浏览器安全扩展需要您的批准才能向 Avira 发送有关可疑活动的报告。",
    "lb_extension_permission_notification_extension_permission_title": "如果在浏览过程中检测到可疑活动，则可以向 Avira 发送匿名报告。",
    "lb_extension_permission_notification_extension_permission_button": "允许",
    "lb_extension_permission_notification_extension_permission_no_title": "您可以随时在设置中启用这个功能。",
    "lb_extension_permission_notification_extension_permission_no_button": "不再询问",
    "lb_unsafe_content": "不安全内容",
    "msg_dash_unsafe_content_details_no_exception": "已阻止的不安全内容：",
    "msg_dash_unsafe_content_details_exception": "已阻止的不安全内容",
    "msg_dash_unsafe_content_risk_no_exception": "为了安全起见，建议您阻止此内容。",
    "msg_dash_unsafe_content_risk_exception": "为了安全起见，建议您通过删除例外来阻止不安全内容。",
    "lb_dash_unsafe_content_show_details": "技术详细信息",
    "lb_dash_unsafe_content_hide_details": "隐藏",
    "msg_category_unknown": "未找到有关该网站的信息。",
    "msg_category_safe": "没有已知威胁。",
    "msg_category_malware": "这是一个恶意软件网站",
    "msg_category_malware_sub": "恶意软件网站会感染您的设备并可能包含病毒、蠕虫、间谍软件和特洛伊木马。",
    "msg_category_phishing": "这是一个网络钓鱼网站",
    "msg_category_phishing_sub": "网络钓鱼网站会欺骗您透露个人信息（例如密码和银行帐户信息）。",
    "msg_category_spam": "这是一个垃圾邮件网站",
    "msg_category_spam_sub": "垃圾邮件网站会获取您的电子邮件地址，从而通过电子邮件向您发送广告。",
    "msg_category_pua": "下载包含可能有害的应用程序",
    "msg_category_pua2": "此网站散布着可能有害的应用程序",
    "msg_category_pua2_sub": "可能有害的应用程序 (PUA) 表现出对用户有害的行为或包含对用户有害的功能。",
    "msg_category_mse": "不受信任的搜索引擎",
    "msg_category_mse_sub": "此搜索引擎不可信，因为恶意软件和可能有害的应用程序会将流量重定向到该搜索引擎。",
    "msg_category_unsafe_content": "已阻止的不安全内容",
    "msg_category_unsafe_content_sub": "如果泄漏的内容或第三方内容被非法侵入或有意造成危害，则网页会加载不安全的内容。",
    "msg_what_is_pua": "什么是可能有害的应用程序？",
    "lnk_what_is_pua": "https://www.avira.com/zh-cn/potentially-unwanted-applications",
    "lb_tab_privacy": "隐私",
    "lb_tab_security": "安全性",
    "lb_my_modes": "模式",
    "msg_mode_select": "选择最符合<br/>您需求的模式",
    "lb_mode_safe-surfing": "安全畅游网络世界",
    "lb_mode_safe-private": "安全和个人",
    "lb_mode_custom": "自定义",
    "lb_powered_by_avira": "Avira 提供技术支持",
    "lb_help": "帮助",
    "lnk_abs_landing": "http://www.avira.com/abs-ftu",
    "lb_trackers_twitter_share": "#Avira 浏览器安全阻止了 {{ threshold }} 广告和 #追踪器。现在 #免费获取您的 Avira 浏览器安全！",
    "lb_trackers_facebook_share": "{{ threshold }} - 这就是迄今为止 Avira 浏览器安全已阻止监视我的在线活动的广告和追踪器数量。它是免费的，我强烈推荐它。",
    "lb_congratulations": "祝贺您！",
    "lb_trackers_blocked_count": "阻止了 {{ threshold }} 个广告和追踪器！",
    "lb_trackers_milestone_subtitle": "同样有助于保护你的家人和朋友。",
    "lb_tracker_notification_share_url_twitter": "http://www.avira.com/zh-cn/avira-browser-safety?x-a-source=ABSSocial&x-a-medium=Twitter",
    "lb_tracker_notification_share_url_facebook": "http://www.avira.com/zh-cn/avira-browser-safety?x-a-source=ABSSocial&x-a-medium=Facebook",
    "lb_tweet": "信息",
    "lb_share": "分享",
    "lb_trackers": "追踪器",
    "lb_ads": "广告",
    "lb_trackers_blocked_this_page": "此网站上阻止的<span class=\"txt--orange-dark\">追踪器</span>",
    "lb_ads_blocked_this_page": "此网站上阻止的<span class=\"txt--orange\">广告</span>",
    "lb_blocked_total": "阻止了全部 <strong>{{ countTotal }}</strong><br> 个广告和追踪器",
    "lb_adblocking_credits": "通过 <a href=\"https://adguard.com/?aid=27248\" target=\"_blank\">Adguard</a> 阻止广告"
}

},{}],81:[function(require,module,exports){
module.exports={
    "lb_safe_website": "安全的網站",
    "lb_unsafe_website": "不安全的網站",
    "lb_unsafe_content_website": "不安全的內容",
    "lb_mse_website": "不可信任的搜尋引擎",
    "lb_trackers_blocked": "已在 {{ domain }} <span class=\"txt--green\">封鎖</span> {{ count }} 個廣告和追蹤器",
    "lb_trackers_blocked_short": "已封鎖 {{ count }} 個廣告和追蹤器",
    "lb_trackers_block_all": "在此網站封鎖",
    "lb_trackers_allow_all": "取消封鎖廣告和追蹤器",
    "msg_no_trackers": "目前網頁沒有任何追蹤器追蹤您。如果您開啟有作用中追蹤器的網站，這裡將顯示完整的清單。",
    "msg_trackers_tooltip": "這些是您正在檢視的網頁上全部的追蹤器。您可以按一下追蹤器旁邊的滑桿來封鎖追蹤器。滑桿呈現綠色時，表示已封鎖該追蹤器，無法追蹤您的瀏覽活動。請注意，預設允許部分追蹤器。封鎖這些可能導致網頁無法正常運作。",
    "lb_settings": "設定",
    "lb_setting_offers": "顯示價格比較",
    "lb_setting_tooltip_offers": "對於您要購買的 â€“ 顯示完全來自安全網站的產品優惠價格。",
    "lb_setting_dnt_header": "傳送「不要追蹤」標頭",
    "lb_setting_tooltip_dnt_header": "通知網站不應該追蹤您。如果網站忽視該項要求，Avira 瀏覽器安全性仍會封鎖任何追蹤器。",
    "lb_setting_top_bar": "顯示安全指示器",
    "lb_setting_block_trackers": "預設封鎖追蹤器",
    "lb_setting_tooltip_block_trackers": "預設封鎖追蹤器保護您的隱私權。",
    "lb_setting_cliqz": "CLIQZ Search",
    "lb_setting_tooltip_cliqz": "您在瀏覽器列中輸入搜尋時，CLIQZ Search 會即時建議網站和相關資訊，達到搜尋更快速安全的效果。",
    "lb_setting_privacy_badger": "Privacy Badger",
    "lb_setting_tooltip_privacy_badger": "Privacy Badger 會封鎖間諜廣告，並避免隱藏的追蹤器在未經您許可的情況下秘密追蹤您。",
    "lb_setting_https_everywhere": "HTTPS Everywhere",
    "lb_setting_tooltip_https_everywhere": "HTTPS Everywhere 會將您的通訊加密，讓您的瀏覽更安全。",
    "lb_setting_inAppTracking": "Anonymous Statistics",
    "lb_setting_tooltip_inAppTracking": "透過分享匿名資料的方式協助我們改善產品。",
    "lb_setting_show_advanced_controls": "顯示其他瀏覽控制",
    "lb_setting_tooltip_show_advanced_controls": "在工具列中顯示 Privacy Badger 和 HTTPS Everywhere 圖示。",
    "lb_setting_google_services": "Google 服務",
    "lb_setting_adguard": "封鎖廣告和網站追蹤",
    "lb_setting_tooltip_adguard": "阻止任何人在線上監控您，保護您的隱私權。也封鎖干擾的快顯視窗、網頁橫幅、視訊廣告等等。",
    "lb_setting_adguard_social_media": "封鎖社交媒體追蹤",
    "lb_setting_tooltip_adguard_social_media": "停用網站的社交媒體按鈕和 Widget，以免社交網路追蹤您造訪的網站。",
    "lb_setting_adguard_useful_ads": "不封鎖有用廣告",
    "lb_setting_tooltip_adguard_useful_ads": "允許有關聯、不造成干擾的廣告出現在您的搜尋結果中。",
    "lb_setting_extension_scan": "Extensions Analysis",
    "lb_setting_tooltip_extension_scan": "啟用後若在瀏覽時偵測到可疑的活動，會將匿名報告傳送到 Avira。",
    "lb_setting_dark_mode": "深色模式",
    "lb_setting_tooltip_dark_mode": "開啟/關閉深色模式",
    "btn_blocking_back": "帶我離開",
    "lb_blocking_options": "更多選項",
    "lb_blocking_add_exception": "不封鎖此網站",
    "btn_blocking_continue": "仍然繼續",
    "btn_dash_classification_cb_exception": "不封鎖此網站",
    "lb_dash_classification_exception_info_add": "新增例外",
    "msg_dash_classification_exception_info_add": "此網站目前不在您的例外清單中。您新增例外時，則不會在您檢視網站時封鎖該網址。您仍然會看見畫面頂端出現警告。",
    "lb_dash_classification_exception_info_remove": "移除例外",
    "msg_dash_classification_exception_info_remove": "此網站目前在您的例外清單中。如果您移除例外，則每次您嘗試檢視網站時，將封鎖該網址。",
    "lb_privacy": "隱私權政策",
    "lnk_privacy": "https://www.avira.com/zh-tw/general-privacy",
    "lb_eula": "使用者授權合約",
    "lnk_eula": "https://www.avira.com/zh-tw/license-agreement-terms-of-use",
    "lb_discover_mode": "發現更多",
    "lb_feedback": "意見回應",
    "lb_rate": "評比應用程式",
    "lb_dash_pua_action_cancel": "取消下載",
    "msg_mse_bar_warning": "您的搜尋引擎設定可能遭竄改。",
    "lb_mse_take_me_away": "帶我離開",
    "lb_mse_hide_warning": "信任此搜尋引擎",
    "lnk_avira": "http://www.avira.com/zh-tw/",
    "msg_blocked_iframe_replacement": "不安全的內容",
    "lb_unsafe_content_bar_warning": "Avira 瀏覽器安全性可防止此網頁載入不安全的內容。",
    "lb_unsafe_content_bar_ignore": "不要再顯示訊息",
    "lb_extension_permission_notification_extension_description": "Avira 瀏覽器安全性擴充需要您核准，才會將關於可疑活動的報告傳送到 Avira。",
    "lb_extension_permission_notification_extension_permission_title": "啟用後若在瀏覽時偵測到可疑的活動，會將匿名報告傳送到 Avira。",
    "lb_extension_permission_notification_extension_permission_button": "允許",
    "lb_extension_permission_notification_extension_permission_no_title": "您可以隨時在設定中啟用此功能。",
    "lb_extension_permission_notification_extension_permission_no_button": "不要再詢問",
    "lb_unsafe_content": "不安全的內容",
    "msg_dash_unsafe_content_details_no_exception": "已封鎖不安全的內容：",
    "msg_dash_unsafe_content_details_exception": "已封鎖不安全的內容",
    "msg_dash_unsafe_content_risk_no_exception": "基於安全考量，建議您持續封鎖內容。",
    "msg_dash_unsafe_content_risk_exception": "基於安全考量，建議您移除例外來封鎖不安全的內容。",
    "lb_dash_unsafe_content_show_details": "技術詳細資料",
    "lb_dash_unsafe_content_hide_details": "隱藏",
    "msg_category_unknown": "找不到此網站的資訊。",
    "msg_category_safe": "無已知的威脅。",
    "msg_category_malware": "這是惡意網站",
    "msg_category_malware_sub": "惡意網站將感染您的裝置，而且可能包含病毒、蠕蟲、間諜軟體和特洛伊木馬程式。",
    "msg_category_phishing": "這是網路釣魚網站",
    "msg_category_phishing_sub": "網路釣魚網站會誘騙您透露您的個人資訊，例如密碼和銀行帳戶的資訊。",
    "msg_category_spam": "這是垃圾郵件網站",
    "msg_category_spam_sub": "垃圾郵件網站會擷取您的電子郵件地址，藉以透過電子郵件寄送廣告給您。",
    "msg_category_pua": "下載包含可能不想要的應用程式",
    "msg_category_pua2": "此網站散發可能不想要的應用程式",
    "msg_category_pua2_sub": "這些可能不想要的應用程式 (PUA) 呈現的運作方式或包含的功能是使用者不想要的。",
    "msg_category_mse": "不可信任的搜尋引擎",
    "msg_category_mse_sub": "此搜尋引擎不可信任，因為已知惡意程式碼和可能不想要的應用程式將流量重新導向到此搜尋引擎。",
    "msg_category_unsafe_content": "已封鎖不安全的內容",
    "msg_category_unsafe_content_sub": "如果遭破壞的內容或第三方內容受入侵或可能有害，網頁將載入不安全的內容。",
    "msg_what_is_pua": "什麼是 PUA？",
    "lnk_what_is_pua": "https://www.avira.com/zh-tw/potentially-unwanted-applications",
    "lb_tab_privacy": "隱私權",
    "lb_tab_security": "資訊安全",
    "lb_my_modes": "模式",
    "msg_mode_select": "選取最符合<br/>您需求的模式",
    "lb_mode_safe-surfing": "安全的隨意瀏覽",
    "lb_mode_safe-private": "安全隱密",
    "lb_mode_custom": "自訂",
    "lb_powered_by_avira": "採用 Avira 技術",
    "lb_help": "說明",
    "lnk_abs_landing": "http://www.avira.com/abs-ftu",
    "lb_trackers_twitter_share": "#Avira Browser Safety 已封鎖 {{ threshold }} 個廣告和#追蹤器。立即#免費取得！",
    "lb_trackers_facebook_share": "{{ threshold }} - Avira 瀏覽器安全性到目前為止已經封鎖這麼多廣告和追蹤器以免它們窺視我的線上活動。這完全免費，我強烈推薦使用。",
    "lb_congratulations": "恭喜!",
    "lb_trackers_blocked_count": "已封鎖 {{ threshold }} 個廣告和追蹤器！",
    "lb_trackers_milestone_subtitle": "也保護您的家人和朋友。",
    "lb_tracker_notification_share_url_twitter": "http://www.avira.com/zh-tw/avira-browser-safety?x-a-source=ABSSocial&x-a-medium=Twitter",
    "lb_tracker_notification_share_url_facebook": "http://www.avira.com/zh-tw/avira-browser-safety?x-a-source=ABSSocial&x-a-medium=Facebook",
    "lb_tweet": "推文",
    "lb_share": "分享",
    "lb_trackers": "追蹤器",
    "lb_ads": "廣告",
    "lb_trackers_blocked_this_page": "已在此網站封鎖<span class=\"txt--orange-dark\">追蹤器</span>",
    "lb_ads_blocked_this_page": "已在此網站封鎖<span class=\"txt--orange\">廣告</span>",
    "lb_blocked_total": "已封鎖全部 <strong>{{ countTotal }}</strong><br> 個廣告和追蹤器",
    "lb_adblocking_credits": "<a href=\"https://adguard.com/?aid=27248\" target=\"_blank\">Adguard</a> 的廣告封鎖"
}

},{}],82:[function(require,module,exports){
"use strict";

require("core-js/modules/es6.array.iterator.js");

require("core-js/modules/web.dom.iterable.js");

/**
 * Helperclass to retrieve the browser / local-language settings
 */
class Locale {
  static initClass() {
    this.prototype.KEY = 'LOCALE';
  } // locale can be used in both bg and cs, so parametrized config and messenger is required


  constructor(config, messenger) {
    this.config = config;
    this.messenger = messenger;
  } // retrieves a possible override from "locale.html"


  retrieve(callback) {
    return this.messenger.publish('bgStorage', {
      get: this.KEY
    }, language => callback(this._getFallback(language || this.getBrowserLocale())));
  }

  store(language) {
    return this.messenger.publish('bgStorage', language ? {
      set: this.KEY,
      value: this._getFallback(language)
    } : {
      remove: this.KEY
    });
  }

  getCurrentFallback() {
    return this._getFallback(this.getBrowserLocale());
  } // relies on the following fallback format: "{de: 'de-DE', ...}"


  _getFallback(language) {
    const normalized = this._normalizeCase(language); // not all languages have a fallback
    // e.g. "pt-BR" should be returned straight away


    if (Array.from(this.config.languages).includes(normalized)) {
      return normalized;
    }

    return this.config.language_fallbacks[normalized.slice(0, 2)] || this.config.default_language;
  } // "navigator.userLanguage" for IE<11


  getBrowserLocale() {
    return navigator.language || navigator.userLanguage;
  } // avoids lower/uppercase issues like
  // https://code.google.com/p/chromium/issues/detail?id=454331
  //
  // see "RFC 4646 - Tags for Identifying Languages"
  // http://www.rfc-editor.org/rfc/rfc4646.txt


  _normalizeCase(language) {
    const short = language.slice(0, 2).toLowerCase();

    if (language.length === 2) {
      return short;
    }

    return `${short}-${language.slice(3, 5).toUpperCase()}`;
  }

}

Locale.initClass();
module.exports = Locale;

},{"core-js/modules/es6.array.iterator.js":59,"core-js/modules/web.dom.iterable.js":60}],83:[function(require,module,exports){
"use strict";

/* eslint global-require: 0 */
module.exports = {
  'de-DE': require('i18n/de-DE'),
  'en-US': require('i18n/en-US'),
  'es-ES': require('i18n/es-ES'),
  'fr-FR': require('i18n/fr-FR'),
  'it-IT': require('i18n/it-IT'),
  'ja-JP': require('i18n/ja-JP'),
  'nl-NL': require('i18n/nl-NL'),
  'pt-BR': require('i18n/pt-BR'),
  'ru-RU': require('i18n/ru-RU'),
  'tr-TR': require('i18n/tr-TR'),
  'zh-CN': require('i18n/zh-CN'),
  'zh-TW': require('i18n/zh-TW')
};

},{"i18n/de-DE":70,"i18n/en-US":71,"i18n/es-ES":72,"i18n/fr-FR":73,"i18n/it-IT":74,"i18n/ja-JP":75,"i18n/nl-NL":76,"i18n/pt-BR":77,"i18n/ru-RU":78,"i18n/tr-TR":79,"i18n/zh-CN":80,"i18n/zh-TW":81}],84:[function(require,module,exports){
"use strict";

/* eslint no-param-reassign: 0 */
// Keep configuration values of ABS
const _ = require('underscore');

const localStorage = require('background/localStorage').getInstance();

const CONFIG_OVERRIDES = 'config_overrides'; // eslint-disable-next-line import/no-unresolved

const config = require('configuration');

const merge = (dest, src) => {
  dest = dest || {};

  for (const key in src) {
    if (src.hasOwnProperty(key)) {
      const value = src[key];

      if (typeof dest[key] !== 'undefined' && typeof value === 'object' && !(value instanceof Array)) {
        dest[key] = merge(dest[key], value);
      } else {
        dest[key] = value;
      }
    }
  }

  return dest;
};

_.extend(config, {
  getConfigOverrides() {
    try {
      return JSON.parse(localStorage.getItem(CONFIG_OVERRIDES));
    } catch (e) {
      return {};
    }
  },

  setConfigOverrides(options) {
    const overrides = merge(this.getConfigOverrides(), options);
    localStorage.setItem(CONFIG_OVERRIDES, JSON.stringify(overrides));
  },

  clearConfigOverrides() {
    localStorage.removeItem(CONFIG_OVERRIDES);
  },

  mergeOverrides() {
    merge(this, this.getConfigOverrides());
  }

});

module.exports = config;

},{"background/localStorage":1,"configuration":2,"underscore":67}],85:[function(require,module,exports){
"use strict";

const SettingsModelBase = require('content/Models/base/Settings');

module.exports = SettingsModelBase;

},{"content/Models/base/Settings":86}],86:[function(require,module,exports){
"use strict";

const $ = require('jquery');

const _ = require('underscore');

const Backbone = require('backbone');

const messenger = require('content/messagingInterface');

class SettingsModel extends Backbone.Model {
  initialize() {
    this.changedByAction = {};
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new this();
    }

    return this.instance;
  }

  set(...args) {
    const res = super.set(...args);

    _.extend(this.changedByAction, this.changed);

    return res;
  }

  sync(method) {
    let task = 'get';

    if (['create', 'update', 'patch'].indexOf(method) >= 0) {
      task = 'set';
    }

    if (!this._listeningToBg) {
      messenger.subscribe('Settings:change', data => {
        super.set(data);
      });
      this._listeningToBg = true;
    }

    return new $.Deferred(deferred => {
      messenger.publish(`Settings:${task}`, this.changedByAction, value => {
        super.set(value);
        this.trigger('sync', this);
        deferred.resolve(value);
      });
      this.changedByAction = {};
    });
  }

}

module.exports = SettingsModel;

},{"backbone":13,"content/messagingInterface":88,"jquery":"jquery","underscore":67}],87:[function(require,module,exports){
"use strict";

const _ = require('underscore');

const config = require('config');

const Locale = require('Locale');

const messenger = require('content/messagingInterface');

const LOCALES = require('Locales');

const getLocaleStrings = callback => {
  const locale = new Locale(config, messenger);
  return locale.retrieve(language => {
    const strings = _.extend({}, LOCALES[config.default_language], LOCALES[language]);

    return callback(strings, language);
  });
};

module.exports = {
  getLocaleStrings,
  LOCALES
};

},{"Locale":82,"Locales":83,"config":84,"content/messagingInterface":88,"underscore":67}],88:[function(require,module,exports){
"use strict";

const ContentMessenger = require('messenger/Content');

const contentMessenger = ContentMessenger.getInstance();
module.exports = contentMessenger;

},{"messenger/Content":61}],89:[function(require,module,exports){
"use strict";

const messenger = require('content/messagingInterface');

const Mixpanel = {
  track(event, properties, callback) {
    return messenger.publish('Mixpanel:track', {
      event,
      properties
    }, callback);
  }

};
module.exports = Mixpanel;

},{"content/messagingInterface":88}]},{},[3]);
