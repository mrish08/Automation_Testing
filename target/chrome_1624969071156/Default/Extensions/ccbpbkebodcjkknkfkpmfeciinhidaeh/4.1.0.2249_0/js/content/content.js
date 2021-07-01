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

},{"core-js/modules/es6.array.iterator.js":60,"core-js/modules/web.dom.iterable.js":61}],2:[function(require,module,exports){
"use strict";

const extensionAccessor = {
  getManifest() {
    return chrome.runtime.getManifest();
  },

  getURL(path) {
    return chrome.extension.getURL(path);
  }

};
module.exports = extensionAccessor;

},{}],3:[function(require,module,exports){
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
		"api_client": "ass",
		"api_key": "HXBzevxRAqvWRppPXnGRYKRZEUcrCHGT",
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
	},
	"storeURLs": {
		"abs_firefox": "https://addons.mozilla.org/firefox/addon/avira-browser-safety/",
		"abs_chrome": "https://chrome.google.com/webstore/detail/avira-browser-safety/flliilndjeohchalpbbcdekjklbdgfkk",
		"ss_chrome": "https://chrome.google.com/webstore/detail/avira-safe-shopping/ccbpbkebodcjkknkfkpmfeciinhidaeh",
		"ss_edge": "https://microsoftedge.microsoft.com/addons/detail/avira-safe-shopping/caiblelclndcckfafdaggpephhgfpoip",
		"ss_opera": "https://addons.opera.com/extensions/details/avira-browser-safety/",
		"uninstall": "https://extensions.avira.com/abs/uninstall"
	}
}
},{}],4:[function(require,module,exports){
"use strict";

const messenger = require('messenger/Content').getInstance();

const Offers = require('modules/offers/content/Offers');
/**
 * @type import('content/offersInit');
 */


module.exports = function init({
  events
}) {
  events.on('iframe-external:removed', () => {
    messenger.publish('AO:externalReady', false);
  });
  events.on('iframe-external:loaded', () => {
    messenger.publish('AO:externalReady', true);
  });
  messenger.subscribe('AO:hasOffers', req => {
    if (req.external) {
      events.emit('iframe-external:include', req.data);
      return;
    }

    events.emit('iframe:include');
  });
  messenger.subscribe('AO:data', ({
    products
  }) => {
    if (products.length === 0) {
      events.emit('iframe-external:remove');
    }
  });
  messenger.publish('bgStorage', {
    get: 'settings'
  }, settings => {
    // explicit boolean comparison is applied
    // because unset value is considered as "true"
    // (we show offers by default)
    if (settings && settings.offers !== false) {
      const offers = new Offers();
      offers.start();
    }
  });
};

},{"messenger/Content":63,"modules/offers/content/Offers":91}],5:[function(require,module,exports){
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

module.exports = _assertThisInitialized;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],6:[function(require,module,exports){
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
function _getPrototypeOf(o) {
  module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  module.exports["default"] = module.exports, module.exports.__esModule = true;
  return _getPrototypeOf(o);
}

module.exports = _getPrototypeOf;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],9:[function(require,module,exports){
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
},{"./setPrototypeOf.js":12}],10:[function(require,module,exports){
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],11:[function(require,module,exports){
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
},{"./assertThisInitialized.js":5,"@babel/runtime/helpers/typeof":13}],12:[function(require,module,exports){
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
},{}],13:[function(require,module,exports){
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
},{}],14:[function(require,module,exports){
/* Ciuvo Addon SDK 2.1.3 | (c) 2011-2017 Ciuvo GmbH CIUVO CONFIDENTIAL All Rights Reserved.
NOTICE: All information contained herein is, and remains the property of  Ciuvo GmbH and its suppliers, if any. The intellectual and technical  concepts contained herein are proprietary to Ciuvo GmbH and its suppliers  and may be covered by U.S. and Foreign Patents, patents in process, and are  protected by trade secret or copyright law. Dissemination of this information  or reproduction of this material is strictly forbidden unless prior written  permission is obtained from Ciuvo GmbH.
Copyright 2011-2017 Ciuvo GmbH. Contact support@ciuvo.com for more details.

Includes Sizzle | (c) JS Foundation and other contributors | https://js.foundation/
Includes requirejs/almond | (c) jQuery Foundation and other contributors  | https://github.com/requirejs/almond/blob/master/LICENSE
Includes json2.js | http://www.JSON.org/js.html */
!function(t,e){t.ciuvoSDK=e()}(this,function(){var t,e,r;return function(n){function i(t,e){return b.call(t,e)}function o(t,e){var r,n,i,o,u,s,a,c,l,f,p,h,d=e&&e.split("/"),v=y.map,g=v&&v["*"]||{};if(t){for(t=t.split("/"),u=t.length-1,y.nodeIdCompat&&x.test(t[u])&&(t[u]=t[u].replace(x,"")),"."===t[0].charAt(0)&&d&&(h=d.slice(0,d.length-1),t=h.concat(t)),l=0;l<t.length;l++)if(p=t[l],"."===p)t.splice(l,1),l-=1;else if(".."===p){if(0===l||1===l&&".."===t[2]||".."===t[l-1])continue;l>0&&(t.splice(l-1,2),l-=2)}t=t.join("/")}if((d||g)&&v){for(r=t.split("/"),l=r.length;l>0;l-=1){if(n=r.slice(0,l).join("/"),d)for(f=d.length;f>0;f-=1)if(i=v[d.slice(0,f).join("/")],i&&(i=i[n])){o=i,s=l;break}if(o)break;!a&&g&&g[n]&&(a=g[n],c=l)}!o&&a&&(o=a,s=c),o&&(r.splice(0,s,o),t=r.join("/"))}return t}function u(t,e){return function(){var r=A.call(arguments,0);return"string"!=typeof r[0]&&1===r.length&&r.push(null),h.apply(n,r.concat([t,e]))}}function s(t){return function(e){return o(e,t)}}function a(t){return function(e){g[t]=e}}function c(t){if(i(m,t)){var e=m[t];delete m[t],w[t]=!0,p.apply(n,e)}if(!i(g,t)&&!i(w,t))throw new Error("No "+t);return g[t]}function l(t){var e,r=t?t.indexOf("!"):-1;return r>-1&&(e=t.substring(0,r),t=t.substring(r+1,t.length)),[e,t]}function f(t){return function(){return y&&y.config&&y.config[t]||{}}}var p,h,d,v,g={},m={},y={},w={},b=Object.prototype.hasOwnProperty,A=[].slice,x=/\.js$/;d=function(t,e){var r,n=l(t),i=n[0];return t=n[1],i&&(i=o(i,e),r=c(i)),i?t=r&&r.normalize?r.normalize(t,s(e)):o(t,e):(t=o(t,e),n=l(t),i=n[0],t=n[1],i&&(r=c(i))),{f:i?i+"!"+t:t,n:t,pr:i,p:r}},v={require:function(t){return u(t)},exports:function(t){var e=g[t];return"undefined"!=typeof e?e:g[t]={}},module:function(t){return{id:t,uri:"",exports:g[t],config:f(t)}}},p=function(t,e,r,o){var s,l,f,p,h,y,b=[],A=typeof r;if(o=o||t,"undefined"===A||"function"===A){for(e=!e.length&&r.length?["require","exports","module"]:e,h=0;h<e.length;h+=1)if(p=d(e[h],o),l=p.f,"require"===l)b[h]=v.require(t);else if("exports"===l)b[h]=v.exports(t),y=!0;else if("module"===l)s=b[h]=v.module(t);else if(i(g,l)||i(m,l)||i(w,l))b[h]=c(l);else{if(!p.p)throw new Error(t+" missing "+l);p.p.load(p.n,u(o,!0),a(l),{}),b[h]=g[l]}f=r?r.apply(g[t],b):void 0,t&&(s&&s.exports!==n&&s.exports!==g[t]?g[t]=s.exports:f===n&&y||(g[t]=f))}else t&&(g[t]=r)},t=e=h=function(t,e,r,i,o){if("string"==typeof t)return v[t]?v[t](e):c(d(t,e).f);if(!t.splice){if(y=t,y.deps&&h(y.deps,y.callback),!e)return;e.splice?(t=e,e=r,r=null):t=n}return e=e||function(){},"function"==typeof r&&(r=i,i=o),i?p(n,t,e,r):setTimeout(function(){p(n,t,e,r)},4),h},h.config=function(t){return h(t)},t._defined=g,r=function(t,e,r){if("string"!=typeof t)throw new Error("See almond README: incorrect module build, no module name");e.splice||(r=e,e=[]),i(g,t)||i(m,t)||(m[t]=[t,e,r])},r.amd={jQuery:!0}}(),r("constants",{version:"2.1.3",base_url:"https://api.ciuvo.com/api/",media_host_url:"https://ciuvo.com/",get_url:function(t,e){switch(t){case"api":return e.base_url||this.base_url;case"storage":return(e.media_host_url||this.media_host_url)+"ciuvo/globalstorage";case"bundle":return(e.media_host_url||this.media_host_url)+"ciuvo/templates/";case"media":return e.media_host_url||this.media_host_url;case"analyze":return(e.base_url||this.base_url)+"analyze";case"voucher":return(e.base_url||this.base_url)+"voucher";case"whitelist":return(e.base_url||this.base_url)+"whitelist";default:throw"invalid url specifier"}}}),r("cslparser",[],function(){"use strict";function t(t,e){function r(){this.constructor=t}r.prototype=e.prototype,t.prototype=new r}function e(t,r,n,i){this.message=t,this.expected=r,this.found=n,this.location=i,this.name="SyntaxError","function"==typeof Error.captureStackTrace&&Error.captureStackTrace(this,e)}function r(t){function r(e){var r,n,i=Hi[e];if(i)return i;for(r=e-1;!Hi[r];)r--;for(i=Hi[r],i={line:i.line,column:i.column,seenCR:i.seenCR};e>r;)n=t.charAt(r),"\n"===n?(i.seenCR||i.line++,i.column=1,i.seenCR=!1):"\r"===n||"\u2028"===n||"\u2029"===n?(i.line++,i.column=1,i.seenCR=!0):(i.column++,i.seenCR=!1),r++;return Hi[e]=i,i}function n(t,e){var n=r(t),i=r(e);return{start:{offset:t,line:n.line,column:n.column},end:{offset:e,line:i.line,column:i.column}}}function i(t){zi>Pi||(Pi>zi&&(zi=Pi,$i=[]),$i.push(t))}function o(t,r,n,i){function o(t){var e=1;for(t.sort(function(t,e){return t.description<e.description?-1:t.description>e.description?1:0});e<t.length;)t[e-1]===t[e]?t.splice(e,1):e++}function u(t,e){function r(t){function e(t){return t.charCodeAt(0).toString(16).toUpperCase()}return t.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\x08/g,"\\b").replace(/\t/g,"\\t").replace(/\n/g,"\\n").replace(/\f/g,"\\f").replace(/\r/g,"\\r").replace(/[\x00-\x07\x0B\x0E\x0F]/g,function(t){return"\\x0"+e(t)}).replace(/[\x10-\x1F\x80-\xFF]/g,function(t){return"\\x"+e(t)}).replace(/[\u0100-\u0FFF]/g,function(t){return"\\u0"+e(t)}).replace(/[\u1000-\uFFFF]/g,function(t){return"\\u"+e(t)})}var n,i,o,u=new Array(t.length);for(o=0;o<t.length;o++)u[o]=t[o].description;return n=t.length>1?u.slice(0,-1).join(", ")+" or "+u[t.length-1]:u[0],i=e?'"'+r(e)+'"':"end of input","Expected "+n+" but "+i+" found."}return null!==r&&o(r),new e(null!==t?t:u(r,n),r,n,i)}function u(){var t,e,r,n;return t=Pi,e=b(),e!==Xt?(r=Mt(),r!==Xt?(n=b(),n!==Xt?(Mi=t,e=Wt(r),t=e):(Pi=t,t=Xt)):(Pi=t,t=Xt)):(Pi=t,t=Xt),t}function s(){var e;return t.length>Pi?(e=t.charAt(Pi),Pi++):(e=Xt,0===Vi&&i(Qt)),e}function a(){var e,r;return Vi++,te.test(t.charAt(Pi))?(e=t.charAt(Pi),Pi++):(e=Xt,0===Vi&&i(ee)),e===Xt&&(e=g()),Vi--,e===Xt&&(r=Xt,0===Vi&&i(Yt)),e}function c(){var e;return re.test(t.charAt(Pi))?(e=t.charAt(Pi),Pi++):(e=Xt,0===Vi&&i(ne)),e}function l(){var e,r;return Vi++,10===t.charCodeAt(Pi)?(e=oe,Pi++):(e=Xt,0===Vi&&i(ue)),e===Xt&&(t.substr(Pi,2)===se?(e=se,Pi+=2):(e=Xt,0===Vi&&i(ae)),e===Xt&&(13===t.charCodeAt(Pi)?(e=ce,Pi++):(e=Xt,0===Vi&&i(le)),e===Xt&&(8232===t.charCodeAt(Pi)?(e=fe,Pi++):(e=Xt,0===Vi&&i(pe)),e===Xt&&(8233===t.charCodeAt(Pi)?(e=he,
Pi++):(e=Xt,0===Vi&&i(de)))))),Vi--,e===Xt&&(r=Xt,0===Vi&&i(ie)),e}function f(){var t,e;return Vi++,t=p(),t===Xt&&(t=d()),Vi--,t===Xt&&(e=Xt,0===Vi&&i(ve)),t}function p(){var e,r,n,o,u,a;if(e=Pi,t.substr(Pi,2)===ge?(r=ge,Pi+=2):(r=Xt,0===Vi&&i(me)),r!==Xt){for(n=[],o=Pi,u=Pi,Vi++,t.substr(Pi,2)===ye?(a=ye,Pi+=2):(a=Xt,0===Vi&&i(we)),Vi--,a===Xt?u=void 0:(Pi=u,u=Xt),u!==Xt?(a=s(),a!==Xt?(u=[u,a],o=u):(Pi=o,o=Xt)):(Pi=o,o=Xt);o!==Xt;)n.push(o),o=Pi,u=Pi,Vi++,t.substr(Pi,2)===ye?(a=ye,Pi+=2):(a=Xt,0===Vi&&i(we)),Vi--,a===Xt?u=void 0:(Pi=u,u=Xt),u!==Xt?(a=s(),a!==Xt?(u=[u,a],o=u):(Pi=o,o=Xt)):(Pi=o,o=Xt);n!==Xt?(t.substr(Pi,2)===ye?(o=ye,Pi+=2):(o=Xt,0===Vi&&i(we)),o!==Xt?(r=[r,n,o],e=r):(Pi=e,e=Xt)):(Pi=e,e=Xt)}else Pi=e,e=Xt;return e}function h(){var e,r,n,o,u,a;if(e=Pi,t.substr(Pi,2)===ge?(r=ge,Pi+=2):(r=Xt,0===Vi&&i(me)),r!==Xt){for(n=[],o=Pi,u=Pi,Vi++,t.substr(Pi,2)===ye?(a=ye,Pi+=2):(a=Xt,0===Vi&&i(we)),a===Xt&&(a=c()),Vi--,a===Xt?u=void 0:(Pi=u,u=Xt),u!==Xt?(a=s(),a!==Xt?(u=[u,a],o=u):(Pi=o,o=Xt)):(Pi=o,o=Xt);o!==Xt;)n.push(o),o=Pi,u=Pi,Vi++,t.substr(Pi,2)===ye?(a=ye,Pi+=2):(a=Xt,0===Vi&&i(we)),a===Xt&&(a=c()),Vi--,a===Xt?u=void 0:(Pi=u,u=Xt),u!==Xt?(a=s(),a!==Xt?(u=[u,a],o=u):(Pi=o,o=Xt)):(Pi=o,o=Xt);n!==Xt?(t.substr(Pi,2)===ye?(o=ye,Pi+=2):(o=Xt,0===Vi&&i(we)),o!==Xt?(r=[r,n,o],e=r):(Pi=e,e=Xt)):(Pi=e,e=Xt)}else Pi=e,e=Xt;return e}function d(){var e,r,n,o,u,a;if(e=Pi,t.substr(Pi,2)===be?(r=be,Pi+=2):(r=Xt,0===Vi&&i(Ae)),r!==Xt){for(n=[],o=Pi,u=Pi,Vi++,a=c(),Vi--,a===Xt?u=void 0:(Pi=u,u=Xt),u!==Xt?(a=s(),a!==Xt?(u=[u,a],o=u):(Pi=o,o=Xt)):(Pi=o,o=Xt);o!==Xt;)n.push(o),o=Pi,u=Pi,Vi++,a=c(),Vi--,a===Xt?u=void 0:(Pi=u,u=Xt),u!==Xt?(a=s(),a!==Xt?(u=[u,a],o=u):(Pi=o,o=Xt)):(Pi=o,o=Xt);n!==Xt?(r=[r,n],e=r):(Pi=e,e=Xt)}else Pi=e,e=Xt;return e}function v(){var e;return 36===t.charCodeAt(Pi)?(e=xe,Pi++):(e=Xt,0===Vi&&i(Ce)),e}function g(){var e;return _e.test(t.charAt(Pi))?(e=t.charAt(Pi),Pi++):(e=Xt,0===Vi&&i(Ee)),e}function m(){var e,r,n,o;return e=Pi,r=w(),r!==Xt?(n=l(),n!==Xt?(r=[r,n],e=r):(Pi=e,e=Xt)):(Pi=e,e=Xt),e===Xt&&(e=Pi,r=w(),r!==Xt?(n=Pi,Vi++,125===t.charCodeAt(Pi)?(o=Se,Pi++):(o=Xt,0===Vi&&i(Ne)),Vi--,o!==Xt?(Pi=n,n=void 0):n=Xt,n!==Xt?(r=[r,n],e=r):(Pi=e,e=Xt)):(Pi=e,e=Xt),e===Xt&&(e=Pi,r=b(),r!==Xt?(n=y(),n!==Xt?(r=[r,n],e=r):(Pi=e,e=Xt)):(Pi=e,e=Xt))),e}function y(){var e,r;return e=Pi,Vi++,t.length>Pi?(r=t.charAt(Pi),Pi++):(r=Xt,0===Vi&&i(Qt)),Vi--,r===Xt?e=void 0:(Pi=e,e=Xt),e}function w(){var t,e;for(t=[],e=a(),e===Xt&&(e=h(),e===Xt&&(e=d()));e!==Xt;)t.push(e),e=a(),e===Xt&&(e=h(),e===Xt&&(e=d()));return t}function b(){var t,e;for(t=[],e=a(),e===Xt&&(e=l(),e===Xt&&(e=f()));e!==Xt;)t.push(e),e=a(),e===Xt&&(e=l(),e===Xt&&(e=f()));return t}function A(){var t,e;return Vi++,t=x(),t===Xt&&(t=T(),t===Xt&&(t=L(),t===Xt&&(t=O(),t===Xt&&(t=S(),t===Xt&&(t=R()))))),Vi--,t===Xt&&(e=Xt,0===Vi&&i(qe)),t}function x(){var t,e,r,n,o,u,s,a,c;return Vi++,t=Pi,e=_(),e!==Xt?(r=b(),r!==Xt?(n=B(),n===Xt&&(n=null),n!==Xt?(o=b(),o!==Xt?(u=C(),u!==Xt?(s=b(),s!==Xt?(a=W(),a!==Xt?(c=m(),c!==Xt?(Mi=t,e=Te(e,n,u,a),t=e):(Pi=t,t=Xt)):(Pi=t,t=Xt)):(Pi=t,t=Xt)):(Pi=t,t=Xt)):(Pi=t,t=Xt)):(Pi=t,t=Xt)):(Pi=t,t=Xt)):(Pi=t,t=Xt),Vi--,t===Xt&&(e=Xt,0===Vi&&i(Re)),t}function C(){var e,r,n,o;return Vi++,e=Pi,61===t.charCodeAt(Pi)?(r=Oe,Pi++):(r=Xt,0===Vi&&i(ke)),r!==Xt?(n=Pi,Vi++,61===t.charCodeAt(Pi)?(o=Oe,Pi++):(o=Xt,0===Vi&&i(ke)),Vi--,o===Xt?n=void 0:(Pi=n,n=Xt),n!==Xt?(Mi=e,r=De(),e=r):(Pi=e,e=Xt)):(Pi=e,e=Xt),e===Xt&&(t.substr(Pi,2)===Ie?(e=Ie,Pi+=2):(e=Xt,0===Vi&&i(Fe)),e===Xt&&(t.substr(Pi,2)===je?(e=je,Pi+=2):(e=Xt,0===Vi&&i(Be)),e===Xt&&(t.substr(Pi,2)===Pe?(e=Pe,Pi+=2):(e=Xt,0===Vi&&i(Me)),e===Xt&&(t.substr(Pi,2)===He?(e=He,Pi+=2):(e=Xt,0===Vi&&i(ze)),e===Xt&&(t.substr(Pi,2)===$e?(e=$e,Pi+=2):(e=Xt,0===Vi&&i(Ve))))))),Vi--,e===Xt&&(r=Xt,0===Vi&&i(Le)),e}function _(){var e,r,n,o;if(e=Pi,r=v(),r!==Xt){if(n=[],Ue.test(t.charAt(Pi))?(o=t.charAt(Pi),Pi++):(o=Xt,0===Vi&&i(Ge)),o!==Xt)for(;o!==Xt;)n.push(o),Ue.test(t.charAt(Pi))?(o=t.charAt(Pi),Pi++):(o=Xt,0===Vi&&i(Ge));else n=Xt;n!==Xt?(Mi=e,r=Je(r,n),e=r):(Pi=e,e=Xt)}else Pi=e,e=Xt;return e}function E(){var e,r,n,o,u,s,a,c;if(e=Pi,r=_(),r!==Xt){for(n=[],o=Pi,u=b(),u!==Xt?(44===t.charCodeAt(Pi)?(s=Xe,Pi++):(s=Xt,0===Vi&&i(Ze)),s!==Xt?(a=b(),a!==Xt?(c=_(),c!==Xt?(u=[u,s,a,c],o=u):(Pi=o,o=Xt)):(Pi=o,o=Xt)):(Pi=o,o=Xt)):(Pi=o,o=Xt);o!==Xt;)n.push(o),o=Pi,u=b(),u!==Xt?(44===t.charCodeAt(Pi)?(s=Xe,Pi++):(s=Xt,0===Vi&&i(Ze)),s!==Xt?(a=b(),a!==Xt?(c=_(),c!==Xt?(u=[u,s,a,c],o=u):(Pi=o,o=Xt)):(Pi=o,o=Xt)):(Pi=o,o=Xt)):(Pi=o,o=Xt);n!==Xt?(Mi=e,r=Ke(r,n),e=r):(Pi=e,e=Xt)}else Pi=e,e=Xt;return e}function S(){var t,e;return t=Pi,e=F(),e!==Xt&&(Mi=t,e=We(e)),t=e}function N(){var e,r,n,o,u,s;return Vi++,e=Pi,123===t.charCodeAt(Pi)?(r=Ye,Pi++):(r=Xt,0===Vi&&i(tr)),r!==Xt?(n=b(),n!==Xt?(o=Pi,u=q(),u!==Xt?(s=b(),s!==Xt?(u=[u,s],o=u):(Pi=o,o=Xt)):(Pi=o,o=Xt),o===Xt&&(o=null),o!==Xt?(125===t.charCodeAt(Pi)?(u=Se,Pi++):(u=Xt,0===Vi&&i(Ne)),u!==Xt?(Mi=e,r=er(o),e=r):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt),Vi--,e===Xt&&(r=Xt,0===Vi&&i(Qe)),e}function q(){var t,e,r,n,i,o;if(t=Pi,e=A(),e!==Xt){for(r=[],n=Pi,i=b(),i!==Xt?(o=A(),o!==Xt?(i=[i,o],n=i):(Pi=n,n=Xt)):(Pi=n,n=Xt);n!==Xt;)r.push(n),n=Pi,i=b(),i!==Xt?(o=A(),o!==Xt?(i=[i,o],n=i):(Pi=n,n=Xt)):(Pi=n,n=Xt);r!==Xt?(Mi=t,e=rr(e,r),t=e):(Pi=t,t=Xt)}else Pi=t,t=Xt;return t}function R(){var e,r;return Vi++,e=Pi,59===t.charCodeAt(Pi)?(r=ir,Pi++):(r=Xt,0===Vi&&i(or)),r!==Xt&&(Mi=e,r=ur()),e=r,Vi--,e===Xt&&(r=Xt,0===Vi&&i(nr)),e}function T(){var e,r,n,o,u,s,a,c,l,f,p,h,d,v;return Vi++,e=Pi,r=kt(),r!==Xt?(n=b(),n!==Xt?(40===t.charCodeAt(Pi)?(o=ar,Pi++):(o=Xt,0===Vi&&i(cr)),o!==Xt?(u=b(),u!==Xt?(s=_(),s!==Xt?(a=b(),a!==Xt?(c=Dt(),c!==Xt?(l=b(),l!==Xt?(f=D(),f===Xt&&(f=_()),f!==Xt?(p=b(),p!==Xt?(41===t.charCodeAt(Pi)?(h=lr,Pi++):(h=Xt,0===Vi&&i(fr)),h!==Xt?(d=b(),d!==Xt?(v=A(),v===Xt&&(v=N()),v!==Xt?(Mi=e,r=pr(s,f,v),e=r):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,
e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt),Vi--,e===Xt&&(r=Xt,0===Vi&&i(sr)),e}function L(){var e,r,n,o,u,s,a,c,l,f,p,h,d,v,g;return Vi++,e=Pi,r=It(),r!==Xt?(n=b(),n!==Xt?(40===t.charCodeAt(Pi)?(o=ar,Pi++):(o=Xt,0===Vi&&i(cr)),o!==Xt?(u=b(),u!==Xt?(s=W(),s!==Xt?(a=b(),a!==Xt?(41===t.charCodeAt(Pi)?(c=lr,Pi++):(c=Xt,0===Vi&&i(fr)),c!==Xt?(l=b(),l!==Xt?(f=A(),f===Xt&&(f=N()),f!==Xt?(p=b(),p!==Xt?(h=Pi,d=Lt(),d!==Xt?(v=b(),v!==Xt?(g=A(),g===Xt&&(g=N()),g!==Xt?(d=[d,v,g],h=d):(Pi=h,h=Xt)):(Pi=h,h=Xt)):(Pi=h,h=Xt),h===Xt&&(h=null),h!==Xt?(Mi=e,r=dr(s,f,h),e=r):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt),Vi--,e===Xt&&(r=Xt,0===Vi&&i(hr)),e}function O(){var t,e,r,n,o;return Vi++,t=Pi,e=Pt(),e!==Xt?(r=b(),r!==Xt?(n=E(),n!==Xt?(o=m(),o!==Xt?(Mi=t,e=gr(n),t=e):(Pi=t,t=Xt)):(Pi=t,t=Xt)):(Pi=t,t=Xt)):(Pi=t,t=Xt),Vi--,t===Xt&&(e=Xt,0===Vi&&i(vr)),t}function k(){var t,e,r,n,o;return Vi++,t=Pi,e=jt(),e!==Xt?(r=b(),r!==Xt?(n=E(),n!==Xt?(o=m(),o!==Xt?(Mi=t,e=yr(n),t=e):(Pi=t,t=Xt)):(Pi=t,t=Xt)):(Pi=t,t=Xt)):(Pi=t,t=Xt),Vi--,t===Xt&&(e=Xt,0===Vi&&i(mr)),t}function D(){var e,r,n,o,u,s;return e=F(),e===Xt&&(e=_(),e===Xt&&(e=Q(),e===Xt&&(e=Pi,40===t.charCodeAt(Pi)?(r=ar,Pi++):(r=Xt,0===Vi&&i(cr)),r!==Xt?(n=b(),n!==Xt?(o=W(),o!==Xt?(u=b(),u!==Xt?(41===t.charCodeAt(Pi)?(s=lr,Pi++):(s=Xt,0===Vi&&i(fr)),s!==Xt?(Mi=e,r=wr(o),e=r):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt)))),e}function I(){var e,r,n;if(e=Pi,r=[],br.test(t.charAt(Pi))?(n=t.charAt(Pi),Pi++):(n=Xt,0===Vi&&i(Ar)),n!==Xt)for(;n!==Xt;)r.push(n),br.test(t.charAt(Pi))?(n=t.charAt(Pi),Pi++):(n=Xt,0===Vi&&i(Ar));else r=Xt;return r!==Xt&&(Mi=e,r=xr(r)),e=r}function F(){var e,r,n,o,u,s,a,c;return e=Pi,r=I(),r!==Xt?(n=b(),n!==Xt?(40===t.charCodeAt(Pi)?(o=ar,Pi++):(o=Xt,0===Vi&&i(cr)),o!==Xt?(u=b(),u!==Xt?(s=j(),s===Xt&&(s=null),s!==Xt?(a=b(),a!==Xt?(41===t.charCodeAt(Pi)?(c=lr,Pi++):(c=Xt,0===Vi&&i(fr)),c!==Xt?(Mi=e,r=Cr(r,s),e=r):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt),e}function j(){var e,r,n,o,u,s,a,c;if(e=Pi,r=D(),r!==Xt){for(n=[],o=Pi,u=b(),u!==Xt?(44===t.charCodeAt(Pi)?(s=Xe,Pi++):(s=Xt,0===Vi&&i(Ze)),s!==Xt?(a=b(),a!==Xt?(c=D(),c!==Xt?(u=[u,s,a,c],o=u):(Pi=o,o=Xt)):(Pi=o,o=Xt)):(Pi=o,o=Xt)):(Pi=o,o=Xt);o!==Xt;)n.push(o),o=Pi,u=b(),u!==Xt?(44===t.charCodeAt(Pi)?(s=Xe,Pi++):(s=Xt,0===Vi&&i(Ze)),s!==Xt?(a=b(),a!==Xt?(c=D(),c!==Xt?(u=[u,s,a,c],o=u):(Pi=o,o=Xt)):(Pi=o,o=Xt)):(Pi=o,o=Xt)):(Pi=o,o=Xt);n!==Xt?(Mi=e,r=_r(r,n),e=r):(Pi=e,e=Xt)}else Pi=e,e=Xt;return e}function B(){var e,r,n,o,u,s;return e=Pi,91===t.charCodeAt(Pi)?(r=Er,Pi++):(r=Xt,0===Vi&&i(Sr)),r!==Xt?(n=b(),n!==Xt?(o=W(),o!==Xt?(u=b(),u!==Xt?(93===t.charCodeAt(Pi)?(s=Nr,Pi++):(s=Xt,0===Vi&&i(qr)),s!==Xt?(Mi=e,r=Rr(o),e=r):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt),e}function P(){var t,e,r,n;return t=Pi,e=D(),e!==Xt?(r=b(),r!==Xt?(n=B(),n!==Xt?(Mi=t,e=Tr(e,n),t=e):(Pi=t,t=Xt)):(Pi=t,t=Xt)):(Pi=t,t=Xt),t}function M(){var t,e,r,n;return t=P(),t===Xt&&(t=D(),t===Xt&&(t=Pi,e=H(),e!==Xt?(r=b(),r!==Xt?(n=D(),n!==Xt?(Mi=t,e=Lr(e,n),t=e):(Pi=t,t=Xt)):(Pi=t,t=Xt)):(Pi=t,t=Xt))),t}function H(){var e;return 43===t.charCodeAt(Pi)?(e=Or,Pi++):(e=Xt,0===Vi&&i(kr)),e===Xt&&(45===t.charCodeAt(Pi)?(e=Dr,Pi++):(e=Xt,0===Vi&&i(Ir)),e===Xt&&(126===t.charCodeAt(Pi)?(e=Fr,Pi++):(e=Xt,0===Vi&&i(jr)),e===Xt&&(t.substr(Pi,3)===Br?(e=Br,Pi+=3):(e=Xt,0===Vi&&i(Pr))))),e}function z(){var t,e,r,n,i,o,u,s;if(t=Pi,e=M(),e!==Xt){for(r=[],n=Pi,i=b(),i!==Xt?(o=$(),o!==Xt?(u=b(),u!==Xt?(s=M(),s!==Xt?(i=[i,o,u,s],n=i):(Pi=n,n=Xt)):(Pi=n,n=Xt)):(Pi=n,n=Xt)):(Pi=n,n=Xt);n!==Xt;)r.push(n),n=Pi,i=b(),i!==Xt?(o=$(),o!==Xt?(u=b(),u!==Xt?(s=M(),s!==Xt?(i=[i,o,u,s],n=i):(Pi=n,n=Xt)):(Pi=n,n=Xt)):(Pi=n,n=Xt)):(Pi=n,n=Xt);r!==Xt?(Mi=t,e=Mr(e,r),t=e):(Pi=t,t=Xt)}else Pi=t,t=Xt;return t}function $(){var e,r,n,o;return e=Pi,42===t.charCodeAt(Pi)?(r=Hr,Pi++):(r=Xt,0===Vi&&i(zr)),r===Xt&&(47===t.charCodeAt(Pi)?(r=$r,Pi++):(r=Xt,0===Vi&&i(Vr)),r===Xt&&(37===t.charCodeAt(Pi)?(r=Ur,Pi++):(r=Xt,0===Vi&&i(Gr)))),r!==Xt?(n=Pi,Vi++,61===t.charCodeAt(Pi)?(o=Oe,Pi++):(o=Xt,0===Vi&&i(ke)),Vi--,o===Xt?n=void 0:(Pi=n,n=Xt),n!==Xt?(Mi=e,r=Jr(r),e=r):(Pi=e,e=Xt)):(Pi=e,e=Xt),e}function V(){var t,e,r,n,i,o,u,s;if(t=Pi,e=z(),e!==Xt){for(r=[],n=Pi,i=b(),i!==Xt?(o=U(),o!==Xt?(u=b(),u!==Xt?(s=z(),s!==Xt?(i=[i,o,u,s],n=i):(Pi=n,n=Xt)):(Pi=n,n=Xt)):(Pi=n,n=Xt)):(Pi=n,n=Xt);n!==Xt;)r.push(n),n=Pi,i=b(),i!==Xt?(o=U(),o!==Xt?(u=b(),u!==Xt?(s=z(),s!==Xt?(i=[i,o,u,s],n=i):(Pi=n,n=Xt)):(Pi=n,n=Xt)):(Pi=n,n=Xt)):(Pi=n,n=Xt);r!==Xt?(Mi=t,e=Xr(e,r),t=e):(Pi=t,t=Xt)}else Pi=t,t=Xt;return t}function U(){var e,r,n,o;return e=Pi,43===t.charCodeAt(Pi)?(r=Or,Pi++):(r=Xt,0===Vi&&i(kr)),r!==Xt?(n=Pi,Vi++,43===t.charCodeAt(Pi)?(o=Or,Pi++):(o=Xt,0===Vi&&i(kr)),o===Xt&&(61===t.charCodeAt(Pi)?(o=Oe,Pi++):(o=Xt,0===Vi&&i(ke))),Vi--,o===Xt?n=void 0:(Pi=n,n=Xt),n!==Xt?(Mi=e,r=Zr(),e=r):(Pi=e,e=Xt)):(Pi=e,e=Xt),e===Xt&&(e=Pi,45===t.charCodeAt(Pi)?(r=Dr,Pi++):(r=Xt,0===Vi&&i(Ir)),r!==Xt?(n=Pi,Vi++,45===t.charCodeAt(Pi)?(o=Dr,Pi++):(o=Xt,0===Vi&&i(Ir)),o===Xt&&(61===t.charCodeAt(Pi)?(o=Oe,Pi++):(o=Xt,0===Vi&&i(ke))),Vi--,o===Xt?n=void 0:(Pi=n,n=Xt),n!==Xt?(Mi=e,r=Kr(),e=r):(Pi=e,e=Xt)):(Pi=e,e=Xt)),e}function G(){var t,e,r,n,i,o,u,s;if(t=Pi,e=V(),e!==Xt){for(r=[],n=Pi,i=b(),i!==Xt?(o=J(),o!==Xt?(u=b(),u!==Xt?(s=V(),s!==Xt?(i=[i,o,u,s],n=i):(Pi=n,n=Xt)):(Pi=n,n=Xt)):(Pi=n,n=Xt)):(Pi=n,n=Xt);n!==Xt;)r.push(n),n=Pi,i=b(),i!==Xt?(o=J(),o!==Xt?(u=b(),u!==Xt?(s=V(),s!==Xt?(i=[i,o,u,s],n=i):(Pi=n,n=Xt)):(Pi=n,n=Xt)):(Pi=n,n=Xt)):(Pi=n,n=Xt);r!==Xt?(Mi=t,e=Wr(e,r),t=e):(Pi=t,t=Xt)}else Pi=t,t=Xt;return t}function J(){var e;return t.substr(Pi,2)===Qr?(e=Qr,Pi+=2):(e=Xt,0===Vi&&i(Yr)),e===Xt&&(t.substr(Pi,2)===tn?(e=tn,Pi+=2):(e=Xt,0===Vi&&i(en)),e===Xt&&(60===t.charCodeAt(Pi)?(e=rn,Pi++):(e=Xt,0===Vi&&i(nn)),e===Xt&&(62===t.charCodeAt(Pi)?(e=on,Pi++):(e=Xt,0===Vi&&i(un))))),e}function X(){var t,e,r,n,i,o,u,s;if(t=Pi,
e=G(),e!==Xt){for(r=[],n=Pi,i=b(),i!==Xt?(o=Z(),o!==Xt?(u=b(),u!==Xt?(s=G(),s!==Xt?(i=[i,o,u,s],n=i):(Pi=n,n=Xt)):(Pi=n,n=Xt)):(Pi=n,n=Xt)):(Pi=n,n=Xt);n!==Xt;)r.push(n),n=Pi,i=b(),i!==Xt?(o=Z(),o!==Xt?(u=b(),u!==Xt?(s=G(),s!==Xt?(i=[i,o,u,s],n=i):(Pi=n,n=Xt)):(Pi=n,n=Xt)):(Pi=n,n=Xt)):(Pi=n,n=Xt);r!==Xt?(Mi=t,e=sn(e,r),t=e):(Pi=t,t=Xt)}else Pi=t,t=Xt;return t}function Z(){var e,r;return e=Pi,t.substr(Pi,2)===an?(r=an,Pi+=2):(r=Xt,0===Vi&&i(cn)),r!==Xt&&(Mi=e,r=ln()),e=r}function K(){var t,e,r,n,i,o,u,s;if(t=Pi,e=X(),e!==Xt){for(r=[],n=Pi,i=b(),i!==Xt?(o=Rt(),o!==Xt?(u=b(),u!==Xt?(s=X(),s!==Xt?(i=[i,o,u,s],n=i):(Pi=n,n=Xt)):(Pi=n,n=Xt)):(Pi=n,n=Xt)):(Pi=n,n=Xt);n!==Xt;)r.push(n),n=Pi,i=b(),i!==Xt?(o=Rt(),o!==Xt?(u=b(),u!==Xt?(s=X(),s!==Xt?(i=[i,o,u,s],n=i):(Pi=n,n=Xt)):(Pi=n,n=Xt)):(Pi=n,n=Xt)):(Pi=n,n=Xt);r!==Xt?(Mi=t,e=fn(e,r),t=e):(Pi=t,t=Xt)}else Pi=t,t=Xt;return t}function W(){var t,e,r,n,i,o,u,s;if(t=Pi,e=K(),e!==Xt){for(r=[],n=Pi,i=b(),i!==Xt?(o=Tt(),o!==Xt?(u=b(),u!==Xt?(s=K(),s!==Xt?(i=[i,o,u,s],n=i):(Pi=n,n=Xt)):(Pi=n,n=Xt)):(Pi=n,n=Xt)):(Pi=n,n=Xt);n!==Xt;)r.push(n),n=Pi,i=b(),i!==Xt?(o=Tt(),o!==Xt?(u=b(),u!==Xt?(s=K(),s!==Xt?(i=[i,o,u,s],n=i):(Pi=n,n=Xt)):(Pi=n,n=Xt)):(Pi=n,n=Xt)):(Pi=n,n=Xt);r!==Xt?(Mi=t,e=pn(e,r),t=e):(Pi=t,t=Xt)}else Pi=t,t=Xt;return t}function Q(){var t;return t=et(),t===Xt&&(t=rt(),t===Xt&&(t=nt(),t===Xt&&(t=dt(),t===Xt&&(t=tt(),t===Xt&&(t=Y()))))),t}function Y(){var e,r,n,o,u,s;return e=Pi,91===t.charCodeAt(Pi)?(r=Er,Pi++):(r=Xt,0===Vi&&i(Sr)),r!==Xt?(n=b(),n!==Xt?(o=j(),o===Xt&&(o=null),o!==Xt?(u=b(),u!==Xt?(93===t.charCodeAt(Pi)?(s=Nr,Pi++):(s=Xt,0===Vi&&i(qr)),s!==Xt?(Mi=e,r=hn(o),e=r):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt),e}function tt(){var e,r,n,o;return Vi++,e=Pi,47===t.charCodeAt(Pi)?(r=$r,Pi++):(r=Xt,0===Vi&&i(Vr)),r!==Xt?(n=mt(),n!==Xt?(47===t.charCodeAt(Pi)?(o=$r,Pi++):(o=Xt,0===Vi&&i(Vr)),o!==Xt?(Mi=e,r=vn(n),e=r):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt),Vi--,e===Xt&&(r=Xt,0===Vi&&i(dn)),e}function et(){var t,e;return t=Pi,e=Ft(),e!==Xt&&(Mi=t,e=gn()),t=e}function rt(){var t,e;return t=Pi,e=Bt(),e!==Xt&&(Mi=t,e=mn()),t=e,t===Xt&&(t=Pi,e=Ot(),e!==Xt&&(Mi=t,e=yn()),t=e),t}function nt(){var t,e,r,n;return Vi++,t=Pi,e=pt(),e===Xt&&(e=it()),e!==Xt?(r=Pi,Vi++,n=v(),Vi--,n===Xt?r=void 0:(Pi=r,r=Xt),r!==Xt?(Mi=t,e=bn(e),t=e):(Pi=t,t=Xt)):(Pi=t,t=Xt),Vi--,t===Xt&&(e=Xt,0===Vi&&i(wn)),t}function it(){var e,r,n,o,u;return e=Pi,r=ot(),r!==Xt?(46===t.charCodeAt(Pi)?(n=An,Pi++):(n=Xt,0===Vi&&i(xn)),n!==Xt?(o=ut(),o===Xt&&(o=null),o!==Xt?(u=ct(),u===Xt&&(u=null),u!==Xt?(Mi=e,r=Cn(r,o,u),e=r):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt),e===Xt&&(e=Pi,46===t.charCodeAt(Pi)?(r=An,Pi++):(r=Xt,0===Vi&&i(xn)),r!==Xt?(n=ut(),n!==Xt?(o=ct(),o===Xt&&(o=null),o!==Xt?(Mi=e,r=_n(n,o),e=r):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt),e===Xt&&(e=Pi,r=ot(),r!==Xt?(n=ct(),n===Xt&&(n=null),n!==Xt?(Mi=e,r=En(r,n),e=r):(Pi=e,e=Xt)):(Pi=e,e=Xt))),e}function ot(){var e,r,n;return 48===t.charCodeAt(Pi)?(e=Sn,Pi++):(e=Xt,0===Vi&&i(Nn)),e===Xt&&(e=Pi,r=at(),r!==Xt?(n=ut(),n===Xt&&(n=null),n!==Xt?(Mi=e,r=qn(r,n),e=r):(Pi=e,e=Xt)):(Pi=e,e=Xt)),e}function ut(){var t,e,r;if(t=Pi,e=[],r=st(),r!==Xt)for(;r!==Xt;)e.push(r),r=st();else e=Xt;return e!==Xt&&(Mi=t,e=Rn(e)),t=e}function st(){var e;return Tn.test(t.charAt(Pi))?(e=t.charAt(Pi),Pi++):(e=Xt,0===Vi&&i(Ln)),e}function at(){var e;return On.test(t.charAt(Pi))?(e=t.charAt(Pi),Pi++):(e=Xt,0===Vi&&i(kn)),e}function ct(){var t,e,r;return t=Pi,e=lt(),e!==Xt?(r=ft(),r!==Xt?(Mi=t,e=Dn(e,r),t=e):(Pi=t,t=Xt)):(Pi=t,t=Xt),t}function lt(){var e;return In.test(t.charAt(Pi))?(e=t.charAt(Pi),Pi++):(e=Xt,0===Vi&&i(Fn)),e}function ft(){var e,r,n;return e=Pi,jn.test(t.charAt(Pi))?(r=t.charAt(Pi),Pi++):(r=Xt,0===Vi&&i(Bn)),r===Xt&&(r=null),r!==Xt?(n=ut(),n!==Xt?(Mi=e,r=Pn(r,n),e=r):(Pi=e,e=Xt)):(Pi=e,e=Xt),e}function pt(){var e,r,n,o,u;if(e=Pi,48===t.charCodeAt(Pi)?(r=Sn,Pi++):(r=Xt,0===Vi&&i(Nn)),r!==Xt)if(Mn.test(t.charAt(Pi))?(n=t.charAt(Pi),Pi++):(n=Xt,0===Vi&&i(Hn)),n!==Xt){if(o=[],u=ht(),u!==Xt)for(;u!==Xt;)o.push(u),u=ht();else o=Xt;o!==Xt?(Mi=e,r=zn(o),e=r):(Pi=e,e=Xt)}else Pi=e,e=Xt;else Pi=e,e=Xt;return e}function ht(){var e;return $n.test(t.charAt(Pi))?(e=t.charAt(Pi),Pi++):(e=Xt,0===Vi&&i(Vn)),e}function dt(){var e,r,n,o,u;return Vi++,e=Pi,r=Pi,34===t.charCodeAt(Pi)?(n=Gn,Pi++):(n=Xt,0===Vi&&i(Jn)),n!==Xt?(o=vt(),o===Xt&&(o=null),o!==Xt?(34===t.charCodeAt(Pi)?(u=Gn,Pi++):(u=Xt,0===Vi&&i(Jn)),u!==Xt?(n=[n,o,u],r=n):(Pi=r,r=Xt)):(Pi=r,r=Xt)):(Pi=r,r=Xt),r===Xt&&(r=Pi,39===t.charCodeAt(Pi)?(n=Xn,Pi++):(n=Xt,0===Vi&&i(Zn)),n!==Xt?(o=gt(),o===Xt&&(o=null),o!==Xt?(39===t.charCodeAt(Pi)?(u=Xn,Pi++):(u=Xt,0===Vi&&i(Zn)),u!==Xt?(n=[n,o,u],r=n):(Pi=r,r=Xt)):(Pi=r,r=Xt)):(Pi=r,r=Xt)),r!==Xt&&(Mi=e,r=Kn(r)),e=r,Vi--,e===Xt&&(r=Xt,0===Vi&&i(Un)),e}function vt(){var t,e,r;if(t=Pi,e=[],r=yt(),r!==Xt)for(;r!==Xt;)e.push(r),r=yt();else e=Xt;return e!==Xt&&(Mi=t,e=Wn(e)),t=e}function gt(){var t,e,r;if(t=Pi,e=[],r=wt(),r!==Xt)for(;r!==Xt;)e.push(r),r=wt();else e=Xt;return e!==Xt&&(Mi=t,e=Wn(e)),t=e}function mt(){var t,e,r;if(t=Pi,e=[],r=bt(),r!==Xt)for(;r!==Xt;)e.push(r),r=bt();else e=Xt;return e!==Xt&&(Mi=t,e=Wn(e)),t=e}function yt(){var e,r,n;return e=Pi,r=Pi,Vi++,34===t.charCodeAt(Pi)?(n=Gn,Pi++):(n=Xt,0===Vi&&i(Jn)),n===Xt&&(92===t.charCodeAt(Pi)?(n=Qn,Pi++):(n=Xt,0===Vi&&i(Yn)),n===Xt&&(n=c())),Vi--,n===Xt?r=void 0:(Pi=r,r=Xt),r!==Xt?(n=s(),n!==Xt?(Mi=e,r=ti(n),e=r):(Pi=e,e=Xt)):(Pi=e,e=Xt),e===Xt&&(e=Pi,92===t.charCodeAt(Pi)?(r=Qn,Pi++):(r=Xt,0===Vi&&i(Yn)),r!==Xt?(n=xt(),n!==Xt?(Mi=e,r=ei(n),e=r):(Pi=e,e=Xt)):(Pi=e,e=Xt),e===Xt&&(e=At())),e}function wt(){var e,r,n;return e=Pi,r=Pi,Vi++,39===t.charCodeAt(Pi)?(n=Xn,Pi++):(n=Xt,0===Vi&&i(Zn)),n===Xt&&(92===t.charCodeAt(Pi)?(n=Qn,Pi++):(n=Xt,0===Vi&&i(Yn)),n===Xt&&(n=c())),Vi--,n===Xt?r=void 0:(Pi=r,r=Xt),r!==Xt?(n=s(),n!==Xt?(Mi=e,r=ti(n),e=r):(Pi=e,e=Xt)):(Pi=e,e=Xt),e===Xt&&(e=Pi,92===t.charCodeAt(Pi)?(r=Qn,Pi++):(r=Xt,0===Vi&&i(Yn)),r!==Xt?(n=xt(),n!==Xt?(Mi=e,r=ei(n),e=r):(Pi=e,
e=Xt)):(Pi=e,e=Xt),e===Xt&&(e=At())),e}function bt(){var e,r,n;return e=Pi,92===t.charCodeAt(Pi)?(r=Qn,Pi++):(r=Xt,0===Vi&&i(Yn)),r!==Xt?(47===t.charCodeAt(Pi)?(n=$r,Pi++):(n=Xt,0===Vi&&i(Vr)),n!==Xt?(Mi=e,r=ri(n),e=r):(Pi=e,e=Xt)):(Pi=e,e=Xt),e===Xt&&(e=Pi,r=Pi,Vi++,47===t.charCodeAt(Pi)?(n=$r,Pi++):(n=Xt,0===Vi&&i(Vr)),n===Xt&&(n=c()),Vi--,n===Xt?r=void 0:(Pi=r,r=Xt),r!==Xt?(n=s(),n!==Xt?(Mi=e,r=ti(n),e=r):(Pi=e,e=Xt)):(Pi=e,e=Xt),e===Xt&&(e=At())),e}function At(){var e,r,n;return e=Pi,92===t.charCodeAt(Pi)?(r=Qn,Pi++):(r=Xt,0===Vi&&i(Yn)),r!==Xt?(n=l(),n!==Xt?(Mi=e,r=ni(n),e=r):(Pi=e,e=Xt)):(Pi=e,e=Xt),e}function xt(){var e,r,n,o;return e=Ct(),e===Xt&&(e=Pi,48===t.charCodeAt(Pi)?(r=Sn,Pi++):(r=Xt,0===Vi&&i(Nn)),r!==Xt?(n=Pi,Vi++,o=st(),Vi--,o===Xt?n=void 0:(Pi=n,n=Xt),n!==Xt?(Mi=e,r=ii(),e=r):(Pi=e,e=Xt)):(Pi=e,e=Xt),e===Xt&&(e=Nt(),e===Xt&&(e=qt()))),e}function Ct(){var t;return t=_t(),t===Xt&&(t=Et()),t}function _t(){var e,r;return e=Pi,oi.test(t.charAt(Pi))?(r=t.charAt(Pi),Pi++):(r=Xt,0===Vi&&i(ui)),r!==Xt&&(Mi=e,r=si(r)),e=r}function Et(){var t,e,r;return t=Pi,e=Pi,Vi++,r=St(),Vi--,r===Xt?e=void 0:(Pi=e,e=Xt),e===Xt&&(e=c()),e!==Xt?(r=s(),r!==Xt?(Mi=t,e=ai(r),t=e):(Pi=t,t=Xt)):(Pi=t,t=Xt),t}function St(){var e;return e=_t(),e===Xt&&(e=st(),e===Xt&&(120===t.charCodeAt(Pi)?(e=ci,Pi++):(e=Xt,0===Vi&&i(li)),e===Xt&&(117===t.charCodeAt(Pi)?(e=fi,Pi++):(e=Xt,0===Vi&&i(pi))))),e}function Nt(){var e,r,n,o;return e=Pi,120===t.charCodeAt(Pi)?(r=ci,Pi++):(r=Xt,0===Vi&&i(li)),r!==Xt?(n=ht(),n!==Xt?(o=ht(),o!==Xt?(Mi=e,r=hi(n,o),e=r):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt),e}function qt(){var e,r,n,o,u,s;return e=Pi,117===t.charCodeAt(Pi)?(r=fi,Pi++):(r=Xt,0===Vi&&i(pi)),r!==Xt?(n=ht(),n!==Xt?(o=ht(),o!==Xt?(u=ht(),u!==Xt?(s=ht(),s!==Xt?(Mi=e,r=di(n,o,u,s),e=r):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt)):(Pi=e,e=Xt),e}function Rt(){var e;return t.substr(Pi,3)===vi?(e=vi,Pi+=3):(e=Xt,0===Vi&&i(gi)),e}function Tt(){var e;return t.substr(Pi,2)===mi?(e=mi,Pi+=2):(e=Xt,0===Vi&&i(yi)),e}function Z(){var e;return t.substr(Pi,2)===an?(e=an,Pi+=2):(e=Xt,0===Vi&&i(cn)),e}function Lt(){var e;return t.substr(Pi,4)===wi?(e=wi,Pi+=4):(e=Xt,0===Vi&&i(bi)),e}function Ot(){var e;return t.substr(Pi,5)===Ai?(e=Ai,Pi+=5):(e=Xt,0===Vi&&i(xi)),e}function kt(){var e;return t.substr(Pi,3)===Ci?(e=Ci,Pi+=3):(e=Xt,0===Vi&&i(_i)),e}function Dt(){var e;return t.substr(Pi,2)===Ei?(e=Ei,Pi+=2):(e=Xt,0===Vi&&i(Si)),e}function It(){var e;return t.substr(Pi,2)===Ni?(e=Ni,Pi+=2):(e=Xt,0===Vi&&i(qi)),e}function Ft(){var e;return t.substr(Pi,4)===Ri?(e=Ri,Pi+=4):(e=Xt,0===Vi&&i(Ti)),e}function jt(){var e;return t.substr(Pi,6)===Li?(e=Li,Pi+=6):(e=Xt,0===Vi&&i(Oi)),e}function Bt(){var e;return t.substr(Pi,4)===ki?(e=ki,Pi+=4):(e=Xt,0===Vi&&i(Di)),e}function Pt(){var e;return t.substr(Pi,7)===Ii?(e=Ii,Pi+=7):(e=Xt,0===Vi&&i(Fi)),e}function Mt(){var t,e;return t=Pi,e=Ht(),e===Xt&&(e=null),e!==Xt&&(Mi=t,e=ji(e)),t=e}function Ht(){var t,e,r,n,i,o;if(t=Pi,e=A(),e!==Xt){for(r=[],n=Pi,i=b(),i!==Xt?(o=A(),o!==Xt?(i=[i,o],n=i):(Pi=n,n=Xt)):(Pi=n,n=Xt);n!==Xt;)r.push(n),n=Pi,i=b(),i!==Xt?(o=A(),o!==Xt?(i=[i,o],n=i):(Pi=n,n=Xt)):(Pi=n,n=Xt);r!==Xt?(n=b(),n!==Xt?(i=k(),i!==Xt?(Mi=t,e=Bi(e,r,i),t=e):(Pi=t,t=Xt)):(Pi=t,t=Xt)):(Pi=t,t=Xt)}else Pi=t,t=Xt;return t}function zt(t,e,r){switch(e){case"+":return t+r;case"-":return t-r;case"*":return t*r;case"/":return t/r;case"%":return t%r;case"<":return r>t;case">":return t>r;case"<=":return r>=t;case">=":return t>=r;case"==":return t==r;case"!=":return t!=r;default:return void 0}}function $t(t,e){switch(t){case"+":return+e;case"-":return-e;case"~":return~e;case"not":return!e;default:return void 0}}function Vt(t,e){if(t instanceof Array&&e instanceof Array){if(t.length!==e.length)return!1;for(var r=0;r<t.length;r++)if(t[r]!=e[r])return!1;return!0}return t==e}function Ut(t,e){return void 0===e||void 0===t?void 0:(t=parseInt(t),isNaN(t)?void 0:(0>t&&e.hasOwnProperty("length")&&(t=e.length+t,0>t&&(t=0)),t))}var Gt,Jt=arguments.length>1?arguments[1]:{},Xt={},Zt={start:u},Kt=u,Wt=function(t){return t},Qt={type:"any",description:"any character"},Yt={type:"other",description:"whitespace"},te=/^[\t\x0B\f \xA0\uFEFF]/,ee={type:"class",value:"[\\t\\v\\f \\u00A0\\uFEFF]",description:"[\\t\\v\\f \\u00A0\\uFEFF]"},re=/^[\n\r\u2028\u2029]/,ne={type:"class",value:"[\\n\\r\\u2028\\u2029]",description:"[\\n\\r\\u2028\\u2029]"},ie={type:"other",description:"end of line"},oe="\n",ue={type:"literal",value:"\n",description:'"\\n"'},se="\r\n",ae={type:"literal",value:"\r\n",description:'"\\r\\n"'},ce="\r",le={type:"literal",value:"\r",description:'"\\r"'},fe="\u2028",pe={type:"literal",value:"\u2028",description:'"\\u2028"'},he="\u2029",de={type:"literal",value:"\u2029",description:'"\\u2029"'},ve={type:"other",description:"comment"},ge="/*",me={type:"literal",value:"/*",description:'"/*"'},ye="*/",we={type:"literal",value:"*/",description:'"*/"'},be="//",Ae={type:"literal",value:"//",description:'"//"'},xe="$",Ce={type:"literal",value:"$",description:'"$"'},_e=/^[ \xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000]/,Ee={type:"class",value:"[\\u0020\\u00A0\\u1680\\u180E\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200A\\u202F\\u205F\\u3000]",description:"[\\u0020\\u00A0\\u1680\\u180E\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200A\\u202F\\u205F\\u3000]"},Se="}",Ne={type:"literal",value:"}",description:'"}"'},qe={type:"other",description:"Statement"},Re={type:"other",description:"Assignment Statement"},Te=function(t,e,r,n){return{type:"AssignmentStatement",variable:t,accessor:e,operator:r,value:n,interpret:function(t){var r=this.value.interpret(t);if("="!=this.operator){var n=this.variable.interpret(t);r=zt(n,this.operator.substring(0,1),r)}if(null!==this.accessor){var i=e.interpret(t),n=this.variable.interpret(t);i=Ut(i,n),t.variables[this.variable.identifier][i]=r}else t.variables[this.variable.identifier]=r},accept:function(t){
t.visitAssignmentStatement(this)}}},Le={type:"other",description:"Assignment Operator"},Oe="=",ke={type:"literal",value:"=",description:'"="'},De=function(){return"="},Ie="*=",Fe={type:"literal",value:"*=",description:'"*="'},je="/=",Be={type:"literal",value:"/=",description:'"/="'},Pe="%=",Me={type:"literal",value:"%=",description:'"%="'},He="+=",ze={type:"literal",value:"+=",description:'"+="'},$e="-=",Ve={type:"literal",value:"-=",description:'"-="'},Ue=/^[a-zA-Z0-9_]/,Ge={type:"class",value:"[a-zA-Z0-9_]",description:"[a-zA-Z0-9_]"},Je=function(t,e){return{type:"VariableExpression",identifier:t+e.join(""),interpret:function(t){if(!(this.identifier in t.variables))throw new t.InterpreterError("Variable "+this.identifier+" not defined.");var e=t.variables[this.identifier];return e},accept:function(t){return t.visitVariableExpression(this)}}},Xe=",",Ze={type:"literal",value:",",description:'","'},Ke=function(t,e){for(var r=[t],n=0;n<e.length;n++)r.push(e[n][3]);return r},We=function(t){return{type:"StatementExpression",expr:t,interpret:function(t){this.expr.interpret(t)},accept:function(t){return t.visitStatementExpression(this)}}},Qe={type:"other",description:"Block"},Ye="{",tr={type:"literal",value:"{",description:'"{"'},er=function(t){return{type:"Block",statements:null!==t?t[0]:[],interpret:function(t){for(var e=this.statements.length-1;e>=0;e--)t.stmt_stack.push(this.statements[e])},accept:function(t){t.visitBlock(this)}}},rr=function(t,e){for(var r=[t],n=0;n<e.length;n++)r.push(e[n][1]);return r},nr={type:"other",description:"No-op Statement"},ir=";",or={type:"literal",value:";",description:'";"'},ur=function(){return{type:"EmptyStatement",interpret:function(){},accept:function(t){t.visitEmptyStatement(this)}}},sr={type:"other",description:"For-In Loop"},ar="(",cr={type:"literal",value:"(",description:'"("'},lr=")",fr={type:"literal",value:")",description:'")"'},pr=function(t,e,r){return{type:"ForInStatement",iterator:t,collection:e,statement:r,interpret:function(t){function e(){this.type="LoopClosure"}var r=this.collection.interpret(t),n=this.statement;if(!r.hasOwnProperty("length"))throw new t.InterpreterError("ForIn Loop only on Arrays or Strings.");var i=0,o=this.iterator.identifier;e.prototype.interpret=function(t){i<r.length&&(t.variables[o]=r[i],i+=1,t.stmt_stack.push(this),t.stmt_stack.push(n))},t.stmt_stack.push(new e)},accept:function(t){t.visitForInStatement(this)}}},hr={type:"other",description:"If Statement"},dr=function(t,e,r){return{type:"IfStatement",condition:t,if_statement:e,else_statement:r,interpret:function(t){this.condition.interpret(t)?t.stmt_stack.push(this.if_statement):null!==this.else_statement&&t.stmt_stack.push(this.else_statement[2])},accept:function(t){t.visitIfStatement(this)}}},vr={type:"other",description:"Require Statement"},gr=function(t){return{type:"RequireStatement",vars:t,interpret:function(t){for(var e=0;e<this.vars.length;e++){var r=this.vars[e].identifier,n=this.vars[e].interpret(t);if(!n){for(t.error_callback.call(this,new t.RequireError("Variable "+r+" required."));t.stmt_stack.length>0;)t.stmt_stack.pop();t.ret=void 0;break}}},accept:function(t){t.visitRequireStatement(this)}}},mr={type:"other",description:"Return Statement"},yr=function(t){return{type:"ReturnStatement",vars:t,interpret:function(t){for(var e=!1,r={},n=this.vars.length-1;n>=0;)r[this.vars[n].identifier]=!0,n-=1;void 0===t.ret&&(t.ret={});for(var n=this.vars.length-1;n>=0;){var i=this.vars[n],o=i.interpret(t),u=i.identifier.substring(1);u in t.ret&&Vt(t.ret[u],o)||(e=!0,t.ret[u]=o),n-=1}var s=0;for(var a in t.ret)s+=1;var c=0;for(var a in r)c+=1;c!=s&&(e=!0),e&&t.return_callback.call(t.return_callback,t.ret)},accept:function(t){t.visitReturnStatement(this)}}},wr=function(t){return t},br=/^[a-zA-Z_]/,Ar={type:"class",value:"[a-zA-Z_]",description:"[a-zA-Z_]"},xr=function(t){return t.join("")},Cr=function(t,e){return{type:"CallExpression",func_name:t,arg_exprs:null!==e?e:[],interpret:function(t){for(var e=[],r=0;r<this.arg_exprs.length;r++){var n=this.arg_exprs[r].interpret(t);e.push(n)}var i=t.function_table[this.func_name];return i?i.apply(t,e):void 0},accept:function(t){return t.visitCallExpression(this)}}},_r=function(t,e){for(var r=[t],n=0;n<e.length;n++)r.push(e[n][3]);return r},Er="[",Sr={type:"literal",value:"[",description:'"["'},Nr="]",qr={type:"literal",value:"]",description:'"]"'},Rr=function(t){return t},Tr=function(t,e){return{type:"AccessorExpression",value:t,index:e,interpret:function(t){var e=this.value.interpret(t),r=this.index.interpret(t);return r=Ut(r,e),e[r]},accept:function(t){return t.visitAccessorExpression(this)}}},Lr=function(t,e){return{type:"UnaryExpression",operator:t,expression:e,interpret:function(t){var e=this.expression.interpret(t);return $t(this.operator,e)},accept:function(t){return t.visitUnaryExpression(this)}}},Or="+",kr={type:"literal",value:"+",description:'"+"'},Dr="-",Ir={type:"literal",value:"-",description:'"-"'},Fr="~",jr={type:"literal",value:"~",description:'"~"'},Br="not",Pr={type:"literal",value:"not",description:'"not"'},Mr=function(t,e){for(var r=t,n=0;n<e.length;n++)r={type:"MultiplicativeExpression",operator:e[n][1],left:r,right:e[n][3],interpret:function(t){var e=this.left.interpret(t),r=this.right.interpret(t);return zt(e,this.operator,r)},accept:function(t){return t.visitMultiplicativeExpression(this)}};return r},Hr="*",zr={type:"literal",value:"*",description:'"*"'},$r="/",Vr={type:"literal",value:"/",description:'"/"'},Ur="%",Gr={type:"literal",value:"%",description:'"%"'},Jr=function(t){return t},Xr=function(t,e){for(var r=t,n=0;n<e.length;n++)r={type:"AdditiveExpression",operator:e[n][1],left:r,right:e[n][3],interpret:function(t){var e=this.left.interpret(t),r=this.right.interpret(t);return zt(e,this.operator,r)},accept:function(t){return t.visitAdditiveExpression(this)}};return r},Zr=function(){return"+"},Kr=function(){return"-"},Wr=function(t,e){for(var r=t,n=0;n<e.length;n++)r={type:"RelationalExpression",operator:e[n][1],
left:r,right:e[n][3],interpret:function(t){var e=this.left.interpret(t),r=this.right.interpret(t);return zt(e,this.operator,r)},accept:function(t){return t.visitRelationalExpression(this)}};return r},Qr="<=",Yr={type:"literal",value:"<=",description:'"<="'},tn=">=",en={type:"literal",value:">=",description:'">="'},rn="<",nn={type:"literal",value:"<",description:'"<"'},on=">",un={type:"literal",value:">",description:'">"'},sn=function(t,e){for(var r=t,n=0;n<e.length;n++)r={type:"EqualsExpression",operator:e[n][1],left:r,right:e[n][3],interpret:function(t){var e=this.left.interpret(t),r=this.right.interpret(t);return e==r},accept:function(t){return t.visitEqualsExpression(this)}};return r},an="==",cn={type:"literal",value:"==",description:'"=="'},ln=function(){return"=="},fn=function(t,e){for(var r=t,n=0;n<e.length;n++)r={type:"LogicalANDExpression",operator:e[n][1],left:r,right:e[n][3],interpret:function(t){var e=this.left.interpret(t);return e?this.right.interpret(t):!1},accept:function(t){return t.visitLogicalANDExpression(this)}};return r},pn=function(t,e){for(var r=t,n=0;n<e.length;n++)r={type:"LogicalORExpression",operator:e[n][1],left:r,right:e[n][3],interpret:function(t){var e=this.left.interpret(t);return e?e:this.right.interpret(t)},accept:function(t){return t.visitLogicalORExpression(this)}};return r},hn=function(t){return{type:"ArrayLiteral",elements:null!==t?t:[],interpret:function(t){for(var e=new Array,r=0;r<this.elements.length;r++)e.push(this.elements[r].interpret(t));return e},accept:function(t){return t.visitArrayLiteral(this)}}},dn={type:"other",description:"regex"},vn=function(t){return{type:"RegexLiteral",value:t,interpret:function(){return this.value},accept:function(t){return t.visitRegularExpressionLiteral(this)}}},gn=function(){return{type:"NullLiteral",value:null,interpret:function(){return this.value},accept:function(t){return t.visitNullLiteral(this)}}},mn=function(){return{type:"BooleanLiteral",value:!0,interpret:function(){return this.value},accept:function(t){return t.visitBooleanLiteral(this)}}},yn=function(){return{type:"BooleanLiteral",value:!1,interpret:function(){return this.value},accept:function(t){return t.visitBooleanLiteral(this)}}},wn={type:"other",description:"number"},bn=function(t){return{type:"NumericLiteral",value:t,interpret:function(){return this.value},accept:function(t){return t.visitNumericLiteral(this)}}},An=".",xn={type:"literal",value:".",description:'"."'},Cn=function(t,e,r){return parseFloat(t+"."+e+r)},_n=function(t,e){return parseFloat("."+t+e)},En=function(t,e){return parseFloat(t+e)},Sn="0",Nn={type:"literal",value:"0",description:'"0"'},qn=function(t,e){return t+e},Rn=function(t){return t.join("")},Tn=/^[0-9]/,Ln={type:"class",value:"[0-9]",description:"[0-9]"},On=/^[1-9]/,kn={type:"class",value:"[1-9]",description:"[1-9]"},Dn=function(t,e){return t+e},In=/^[eE]/,Fn={type:"class",value:"[eE]",description:"[eE]"},jn=/^[\-+]/,Bn={type:"class",value:"[-+]",description:"[-+]"},Pn=function(t,e){return t+e},Mn=/^[xX]/,Hn={type:"class",value:"[xX]",description:"[xX]"},zn=function(){return parseInt("0x"+dgits.join(""))},$n=/^[0-9a-fA-F]/,Vn={type:"class",value:"[0-9a-fA-F]",description:"[0-9a-fA-F]"},Un={type:"other",description:"string"},Gn='"',Jn={type:"literal",value:'"',description:'"\\""'},Xn="'",Zn={type:"literal",value:"'",description:'"\'"'},Kn=function(t){return{type:"StringLiteral",value:t[1]||"",quote:t[0],interpret:function(){return this.value},accept:function(t){return t.visitStringLiteral(this)}}},Wn=function(t){return t.join("")},Qn="\\",Yn={type:"literal",value:"\\",description:'"\\\\"'},ti=function(t){return t},ei=function(t){return t},ri=function(t){return t},ni=function(t){return t},ii=function(){return"\x00"},oi=/^['"\\bfnrtv]/,ui={type:"class",value:"['\"\\\\bfnrtv]",description:"['\"\\\\bfnrtv]"},si=function(t){return t.replace("b","\b").replace("f","\f").replace("n","\n").replace("r","\r").replace("t","	").replace("v","")},ai=function(t){return t},ci="x",li={type:"literal",value:"x",description:'"x"'},fi="u",pi={type:"literal",value:"u",description:'"u"'},hi=function(t,e){return String.fromCharCode(parseInt("0x"+t+e))},di=function(t,e,r,n){return String.fromCharCode(parseInt("0x"+t+e+r+n))},vi="and",gi={type:"literal",value:"and",description:'"and"'},mi="or",yi={type:"literal",value:"or",description:'"or"'},wi="else",bi={type:"literal",value:"else",description:'"else"'},Ai="false",xi={type:"literal",value:"false",description:'"false"'},Ci="for",_i={type:"literal",value:"for",description:'"for"'},Ei="in",Si={type:"literal",value:"in",description:'"in"'},Ni="if",qi={type:"literal",value:"if",description:'"if"'},Ri="null",Ti={type:"literal",value:"null",description:'"null"'},Li="return",Oi={type:"literal",value:"return",description:'"return"'},ki="true",Di={type:"literal",value:"true",description:'"true"'},Ii="require",Fi={type:"literal",value:"require",description:'"require"'},ji=function(t){return{type:"Program",statements:null!==t?t:[],interpret:function(t){for(var e=(this.statements,this.statements.length-1);e>=0;e--)t.stmt_stack.push(this.statements[e]);t.interpretNext()},accept:function(t){t.visitProgram(this)}}},Bi=function(t,e,r){for(var n=[t],i=0;i<e.length;i++)n.push(e[i][1]);return n.push(r),n},Pi=0,Mi=0,Hi=[{line:1,column:1,seenCR:!1}],zi=0,$i=[],Vi=0;if("startRule"in Jt){if(!(Jt.startRule in Zt))throw new Error("Can't start parsing from rule \""+Jt.startRule+'".');Kt=Zt[Jt.startRule]}if(this.VERSION="0.2.2",Gt=Kt(),Gt!==Xt&&Pi===t.length)return Gt;throw Gt!==Xt&&Pi<t.length&&i({type:"end",description:"end of input"}),o(null,$i,zi<t.length?t.charAt(zi):null,zi<t.length?n(zi,zi+1):n(zi,zi))}return t(e,Error),{SyntaxError:e,parse:r}}),r("request",[],function(){var t=200,e="XDR",r="XHR",n=function(t,n,i){if(this.method=t,this.url=n,this.requestTimer=void 0,this.type=r,this.rq=new window.XMLHttpRequest,"withCredentials"in this.rq||"undefined"!=typeof window.XDomainRequest&&(this.type=e,this.rq=new window.XDomainRequest,
this.rq.readyState=1),"object"==typeof i){var o=-1===this.url.indexOf("?")?"?":"&";for(var u in i)"undefined"!=typeof i[u]&&(this.url+=o+u+"="+encodeURIComponent(i[u]),o="&")}this.rq.open(t,this.url,!0),this.type===e&&(this.rq.onprogress=function(){},this.rq.ontimeout=function(){},this.rq.onerror=function(){},this.rq.onload=function(){},this.rq.timeout=0)};return n.prototype={wrapCallback:function(t){var e=this;return function(r){e.clearTimeout(),t(e.rq,r)}},onReadyStateChange:function(t){this.type===e?(this.rq.readyState=3,this.rq.status=200,this.rq.onload=this.wrapCallback(t)):this.rq.onreadystatechange=this.wrapCallback(t)},onLoad:function(t){this.type===e&&(this.rq.readyState=3,this.rq.status=200),this.rq.onload=this.wrapCallback(t)},onError:function(t){this.type===e&&(this.rq.readyState=3,this.rq.status=500),this.rq.onerror=this.wrapCallback(t)},setHeader:function(t,e){"setRequestHeader"in this.rq&&this.rq.setRequestHeader(t,e)},setTimeout:function(t,e){this.timeout=t,this.timeoutCallback=e},abort:function(){this.rq&&this.rq.abort()},setupTimeoutTimer:function(t){if("number"==typeof t){var e=this;window.setTimeout(function(){e.rq.abort(),"function"==typeof e.timeoutCallback&&e.timeoutCallback()},t)}},clearTimeout:function(){window.clearTimeout(this.requestTimer),this.requestTimer=void 0},send:function(r){var n=this;this.setupTimeoutTimer(this.timeout),this.type===e?window.setTimeout(function(){n.rq.send(r)},t):this.rq.send(r)}},{AjaxRequest:n}}),!function(t){function e(t,e,r,n){var i,o,u,s,a,c,l,p,d,v;if((e?e.ownerDocument||e:H)!==k&&O(e),e=e||k,r=r||[],s=e.nodeType,"string"!=typeof t||!t||1!==s&&9!==s&&11!==s)return r;if(!n&&I){if(11!==s&&(i=yt.exec(t)))if(u=i[1]){if(9===s){if(o=e.getElementById(u),!o||!o.parentNode)return r;if(o.id===u)return r.push(o),r}else if(e.ownerDocument&&(o=e.ownerDocument.getElementById(u))&&P(e,o)&&o.id===u)return r.push(o),r}else{if(i[2])return Y.apply(r,e.getElementsByTagName(t)),r;if((u=i[3])&&x.getElementsByClassName)return Y.apply(r,e.getElementsByClassName(u)),r}if(x.qsa&&(!F||!F.test(t))){if(p=l=M,d=e,v=1!==s&&t,1===s&&"object"!==e.nodeName.toLowerCase()){for(c=S(t),(l=e.getAttribute("id"))?p=l.replace(bt,"\\$&"):e.setAttribute("id",p),p="[id='"+p+"'] ",a=c.length;a--;)c[a]=p+h(c[a]);d=wt.test(t)&&f(e.parentNode)||e,v=c.join(",")}if(v)try{return Y.apply(r,d.querySelectorAll(v)),r}catch(g){}finally{l||e.removeAttribute("id")}}}return q(t.replace(at,"$1"),e,r,n)}function n(){function t(r,n){return e.push(r+" ")>C.cacheLength&&delete t[e.shift()],t[r+" "]=n}var e=[];return t}function i(t){return t[M]=!0,t}function o(t){var e=k.createElement("div");try{return!!t(e)}catch(r){return!1}finally{e.parentNode&&e.parentNode.removeChild(e),e=null}}function u(t,e){for(var r=t.split("|"),n=t.length;n--;)C.attrHandle[r[n]]=e}function s(t,e){var r=e&&t,n=r&&1===t.nodeType&&1===e.nodeType&&(~e.sourceIndex||X)-(~t.sourceIndex||X);if(n)return n;if(r)for(;r=r.nextSibling;)if(r===e)return-1;return t?1:-1}function a(t){return function(e){var r=e.nodeName.toLowerCase();return"input"===r&&e.type===t}}function c(t){return function(e){var r=e.nodeName.toLowerCase();return("input"===r||"button"===r)&&e.type===t}}function l(t){return i(function(e){return e=+e,i(function(r,n){for(var i,o=t([],r.length,e),u=o.length;u--;)r[i=o[u]]&&(r[i]=!(n[i]=r[i]))})})}function f(t){return t&&"undefined"!=typeof t.getElementsByTagName&&t}function p(){}function h(t){for(var e=0,r=t.length,n="";r>e;e++)n+=t[e].value;return n}function d(t,e,r){var n=e.dir,i=r&&"parentNode"===n,o=$++;return e.first?function(e,r,o){for(;e=e[n];)if(1===e.nodeType||i)return t(e,r,o)}:function(e,r,u){var s,a,c=[z,o];if(u){for(;e=e[n];)if((1===e.nodeType||i)&&t(e,r,u))return!0}else for(;e=e[n];)if(1===e.nodeType||i){if(a=e[M]||(e[M]={}),(s=a[n])&&s[0]===z&&s[1]===o)return c[2]=s[2];if(a[n]=c,c[2]=t(e,r,u))return!0}}}function v(t){return t.length>1?function(e,r,n){for(var i=t.length;i--;)if(!t[i](e,r,n))return!1;return!0}:t[0]}function g(t,r,n){for(var i=0,o=r.length;o>i;i++)e(t,r[i],n);return n}function m(t,e,r,n,i){for(var o,u=[],s=0,a=t.length,c=null!=e;a>s;s++)(o=t[s])&&(!r||r(o,n,i))&&(u.push(o),c&&e.push(s));return u}function y(t,e,r,n,o,u){return n&&!n[M]&&(n=y(n)),o&&!o[M]&&(o=y(o,u)),i(function(i,u,s,a){var c,l,f,p=[],h=[],d=u.length,v=i||g(e||"*",s.nodeType?[s]:s,[]),y=!t||!i&&e?v:m(v,p,t,s,a),w=r?o||(i?t:d||n)?[]:u:y;if(r&&r(y,w,s,a),n)for(c=m(w,h),n(c,[],s,a),l=c.length;l--;)(f=c[l])&&(w[h[l]]=!(y[h[l]]=f));if(i){if(o||t){if(o){for(c=[],l=w.length;l--;)(f=w[l])&&c.push(y[l]=f);o(null,w=[],c,a)}for(l=w.length;l--;)(f=w[l])&&(c=o?et(i,f):p[l])>-1&&(i[c]=!(u[c]=f))}}else w=m(w===u?w.splice(d,w.length):w),o?o(null,u,w,a):Y.apply(u,w)})}function w(t){for(var e,r,n,i=t.length,o=C.relative[t[0].type],u=o||C.relative[" "],s=o?1:0,a=d(function(t){return t===e},u,!0),c=d(function(t){return et(e,t)>-1},u,!0),l=[function(t,r,n){var i=!o&&(n||r!==R)||((e=r).nodeType?a(t,r,n):c(t,r,n));return e=null,i}];i>s;s++)if(r=C.relative[t[s].type])l=[d(v(l),r)];else{if(r=C.filter[t[s].type].apply(null,t[s].matches),r[M]){for(n=++s;i>n&&!C.relative[t[n].type];n++);return y(s>1&&v(l),s>1&&h(t.slice(0,s-1).concat({value:" "===t[s-2].type?"*":""})).replace(at,"$1"),r,n>s&&w(t.slice(s,n)),i>n&&w(t=t.slice(n)),i>n&&h(t))}l.push(r)}return v(l)}function b(t,r){var n=r.length>0,o=t.length>0,u=function(i,u,s,a,c){var l,f,p,h=0,d="0",v=i&&[],g=[],y=R,w=i||o&&C.find.TAG("*",c),b=z+=null==y?1:Math.random()||.1,A=w.length;for(c&&(R=u!==k&&u);d!==A&&null!=(l=w[d]);d++){if(o&&l){for(f=0;p=t[f++];)if(p(l,u,s)){a.push(l);break}c&&(z=b)}n&&((l=!p&&l)&&h--,i&&v.push(l))}if(h+=d,n&&d!==h){for(f=0;p=r[f++];)p(v,g,u,s);if(i){if(h>0)for(;d--;)v[d]||g[d]||(g[d]=W.call(a));g=m(g)}Y.apply(a,g),c&&!i&&g.length>0&&h+r.length>1&&e.uniqueSort(a)}return c&&(z=b,R=y),v};return n?i(u):u}var A,x,C,_,E,S,N,q,R,T,L,O,k,D,I,F,j,B,P,M="sizzle"+1*new Date,H=t.document,z=0,$=0,V=n(),U=n(),G=n(),J=function(t,e){return t===e&&(L=!0),0},X=1<<31,Z={}.hasOwnProperty,K=[],W=K.pop,Q=K.push,Y=K.push,tt=K.slice,et=function(t,e){
for(var r=0,n=t.length;n>r;r++)if(t[r]===e)return r;return-1},rt="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",nt="[\\x20\\t\\r\\n\\f]",it="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",ot="\\["+nt+"*("+it+")(?:"+nt+"*([*^$|!~]?=)"+nt+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+it+"))|)"+nt+"*\\]",ut=":("+it+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+ot+")*)|.*)\\)|)",st=new RegExp(nt+"+","g"),at=new RegExp("^"+nt+"+|((?:^|[^\\\\])(?:\\\\.)*)"+nt+"+$","g"),ct=new RegExp("^"+nt+"*,"+nt+"*"),lt=new RegExp("^"+nt+"*([>+~]|"+nt+")"+nt+"*"),ft=new RegExp("="+nt+"*([^\\]'\"]*?)"+nt+"*\\]","g"),pt=new RegExp(ut),ht=new RegExp("^"+it+"$"),dt={ID:new RegExp("^#("+it+")"),CLASS:new RegExp("^\\.("+it+")"),TAG:new RegExp("^("+it+"|[*])"),ATTR:new RegExp("^"+ot),PSEUDO:new RegExp("^"+ut),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+nt+"*(even|odd|(([+-]|)(\\d*)n|)"+nt+"*(?:([+-]|)"+nt+"*(\\d+)|))"+nt+"*\\)|)","i"),bool:new RegExp("^(?:"+rt+")$","i"),needsContext:new RegExp("^"+nt+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+nt+"*((?:-\\d)?\\d*)"+nt+"*\\)|)(?=[^-]|$)","i")},vt=/^(?:input|select|textarea|button)$/i,gt=/^h\d$/i,mt=/^[^{]+\{\s*\[native \w/,yt=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,wt=/[+~]/,bt=/'|\\/g,At=new RegExp("\\\\([\\da-f]{1,6}"+nt+"?|("+nt+")|.)","ig"),xt=function(t,e,r){var n="0x"+e-65536;return n!==n||r?e:0>n?String.fromCharCode(n+65536):String.fromCharCode(n>>10|55296,1023&n|56320)},Ct=function(){O()};try{Y.apply(K=tt.call(H.childNodes),H.childNodes),K[H.childNodes.length].nodeType}catch(_t){Y={apply:K.length?function(t,e){Q.apply(t,tt.call(e))}:function(t,e){for(var r=t.length,n=0;t[r++]=e[n++];);t.length=r-1}}}x=e.support={},E=e.isXML=function(t){var e=t&&(t.ownerDocument||t).documentElement;return e?"HTML"!==e.nodeName:!1},O=e.setDocument=function(t){var e,r,n=t?t.ownerDocument||t:H;return n!==k&&9===n.nodeType&&n.documentElement?(k=n,D=n.documentElement,r=n.defaultView,r&&r!==r.top&&(r.addEventListener?r.addEventListener("unload",Ct,!1):r.attachEvent&&r.attachEvent("onunload",Ct)),I=!E(n),x.attributes=o(function(t){return t.className="i",!t.getAttribute("className")}),x.getElementsByTagName=o(function(t){return t.appendChild(n.createComment("")),!t.getElementsByTagName("*").length}),x.getElementsByClassName=mt.test(n.getElementsByClassName),x.getById=o(function(t){return D.appendChild(t).id=M,!n.getElementsByName||!n.getElementsByName(M).length}),x.getById?(C.find.ID=function(t,e){if("undefined"!=typeof e.getElementById&&I){var r=e.getElementById(t);return r&&r.parentNode?[r]:[]}},C.filter.ID=function(t){var e=t.replace(At,xt);return function(t){return t.getAttribute("id")===e}}):(delete C.find.ID,C.filter.ID=function(t){var e=t.replace(At,xt);return function(t){var r="undefined"!=typeof t.getAttributeNode&&t.getAttributeNode("id");return r&&r.value===e}}),C.find.TAG=x.getElementsByTagName?function(t,e){return"undefined"!=typeof e.getElementsByTagName?e.getElementsByTagName(t):x.qsa?e.querySelectorAll(t):void 0}:function(t,e){var r,n=[],i=0,o=e.getElementsByTagName(t);if("*"===t){for(;r=o[i++];)1===r.nodeType&&n.push(r);return n}return o},C.find.CLASS=x.getElementsByClassName&&function(t,e){return I?e.getElementsByClassName(t):void 0},j=[],F=[],(x.qsa=mt.test(n.querySelectorAll))&&(o(function(t){D.appendChild(t).innerHTML="<a id='"+M+"'></a><select id='"+M+"-\r\\' msallowcapture=''><option selected=''></option></select>",t.querySelectorAll("[msallowcapture^='']").length&&F.push("[*^$]="+nt+"*(?:''|\"\")"),t.querySelectorAll("[selected]").length||F.push("\\["+nt+"*(?:value|"+rt+")"),t.querySelectorAll("[id~="+M+"-]").length||F.push("~="),t.querySelectorAll(":checked").length||F.push(":checked"),t.querySelectorAll("a#"+M+"+*").length||F.push(".#.+[+~]")}),o(function(t){var e=n.createElement("input");e.setAttribute("type","hidden"),t.appendChild(e).setAttribute("name","D"),t.querySelectorAll("[name=d]").length&&F.push("name"+nt+"*[*^$|!~]?="),t.querySelectorAll(":enabled").length||F.push(":enabled",":disabled"),t.querySelectorAll("*,:x"),F.push(",.*:")})),(x.matchesSelector=mt.test(B=D.matches||D.webkitMatchesSelector||D.mozMatchesSelector||D.oMatchesSelector||D.msMatchesSelector))&&o(function(t){x.disconnectedMatch=B.call(t,"div"),B.call(t,"[s!='']:x"),j.push("!=",ut)}),F=F.length&&new RegExp(F.join("|")),j=j.length&&new RegExp(j.join("|")),e=mt.test(D.compareDocumentPosition),P=e||mt.test(D.contains)?function(t,e){var r=9===t.nodeType?t.documentElement:t,n=e&&e.parentNode;return t===n||!(!n||1!==n.nodeType||!(r.contains?r.contains(n):t.compareDocumentPosition&&16&t.compareDocumentPosition(n)))}:function(t,e){if(e)for(;e=e.parentNode;)if(e===t)return!0;return!1},J=e?function(t,e){if(t===e)return L=!0,0;var r=!t.compareDocumentPosition-!e.compareDocumentPosition;return r?r:(r=(t.ownerDocument||t)===(e.ownerDocument||e)?t.compareDocumentPosition(e):1,1&r||!x.sortDetached&&e.compareDocumentPosition(t)===r?t===n||t.ownerDocument===H&&P(H,t)?-1:e===n||e.ownerDocument===H&&P(H,e)?1:T?et(T,t)-et(T,e):0:4&r?-1:1)}:function(t,e){if(t===e)return L=!0,0;var r,i=0,o=t.parentNode,u=e.parentNode,a=[t],c=[e];if(!o||!u)return t===n?-1:e===n?1:o?-1:u?1:T?et(T,t)-et(T,e):0;if(o===u)return s(t,e);for(r=t;r=r.parentNode;)a.unshift(r);for(r=e;r=r.parentNode;)c.unshift(r);for(;a[i]===c[i];)i++;return i?s(a[i],c[i]):a[i]===H?-1:c[i]===H?1:0},n):k},e.matches=function(t,r){return e(t,null,null,r)},e.matchesSelector=function(t,r){if((t.ownerDocument||t)!==k&&O(t),r=r.replace(ft,"='$1']"),!(!x.matchesSelector||!I||j&&j.test(r)||F&&F.test(r)))try{var n=B.call(t,r);if(n||x.disconnectedMatch||t.document&&11!==t.document.nodeType)return n}catch(i){}return e(r,k,null,[t]).length>0},e.contains=function(t,e){return(t.ownerDocument||t)!==k&&O(t),P(t,e)},e.attr=function(t,e){(t.ownerDocument||t)!==k&&O(t);var r=C.attrHandle[e.toLowerCase()],n=r&&Z.call(C.attrHandle,e.toLowerCase())?r(t,e,!I):void 0;

return void 0!==n?n:x.attributes||!I?t.getAttribute(e):(n=t.getAttributeNode(e))&&n.specified?n.value:null},e.error=function(t){throw new Error("Syntax error, unrecognized expression: "+t)},e.uniqueSort=function(t){var e,r=[],n=0,i=0;if(L=!x.detectDuplicates,T=!x.sortStable&&t.slice(0),t.sort(J),L){for(;e=t[i++];)e===t[i]&&(n=r.push(i));for(;n--;)t.splice(r[n],1)}return T=null,t},_=e.getText=function(t){var e,r="",n=0,i=t.nodeType;if(i){if(1===i||9===i||11===i){if("string"==typeof t.textContent)return t.textContent;for(t=t.firstChild;t;t=t.nextSibling)r+=_(t)}else if(3===i||4===i)return t.nodeValue}else for(;e=t[n++];)r+=_(e);return r},C=e.selectors={cacheLength:50,createPseudo:i,match:dt,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(t){return t[1]=t[1].replace(At,xt),t[3]=(t[3]||t[4]||t[5]||"").replace(At,xt),"~="===t[2]&&(t[3]=" "+t[3]+" "),t.slice(0,4)},CHILD:function(t){return t[1]=t[1].toLowerCase(),"nth"===t[1].slice(0,3)?(t[3]||e.error(t[0]),t[4]=+(t[4]?t[5]+(t[6]||1):2*("even"===t[3]||"odd"===t[3])),t[5]=+(t[7]+t[8]||"odd"===t[3])):t[3]&&e.error(t[0]),t},PSEUDO:function(t){var e,r=!t[6]&&t[2];return dt.CHILD.test(t[0])?null:(t[3]?t[2]=t[4]||t[5]||"":r&&pt.test(r)&&(e=S(r,!0))&&(e=r.indexOf(")",r.length-e)-r.length)&&(t[0]=t[0].slice(0,e),t[2]=r.slice(0,e)),t.slice(0,3))}},filter:{TAG:function(t){var e=t.replace(At,xt).toLowerCase();return"*"===t?function(){return!0}:function(t){return t.nodeName&&t.nodeName.toLowerCase()===e}},CLASS:function(t){var e=V[t+" "];return e||(e=new RegExp("(^|"+nt+")"+t+"("+nt+"|$)"))&&V(t,function(t){return e.test("string"==typeof t.className&&t.className||"undefined"!=typeof t.getAttribute&&t.getAttribute("class")||"")})},ATTR:function(t,r,n){return function(i){var o=e.attr(i,t);return null==o?"!="===r:r?(o+="","="===r?o===n:"!="===r?o!==n:"^="===r?n&&0===o.indexOf(n):"*="===r?n&&o.indexOf(n)>-1:"$="===r?n&&o.slice(-n.length)===n:"~="===r?(" "+o.replace(st," ")+" ").indexOf(n)>-1:"|="===r?o===n||o.slice(0,n.length+1)===n+"-":!1):!0}},CHILD:function(t,e,r,n,i){var o="nth"!==t.slice(0,3),u="last"!==t.slice(-4),s="of-type"===e;return 1===n&&0===i?function(t){return!!t.parentNode}:function(e,r,a){var c,l,f,p,h,d,v=o!==u?"nextSibling":"previousSibling",g=e.parentNode,m=s&&e.nodeName.toLowerCase(),y=!a&&!s;if(g){if(o){for(;v;){for(f=e;f=f[v];)if(s?f.nodeName.toLowerCase()===m:1===f.nodeType)return!1;d=v="only"===t&&!d&&"nextSibling"}return!0}if(d=[u?g.firstChild:g.lastChild],u&&y){for(l=g[M]||(g[M]={}),c=l[t]||[],h=c[0]===z&&c[1],p=c[0]===z&&c[2],f=h&&g.childNodes[h];f=++h&&f&&f[v]||(p=h=0)||d.pop();)if(1===f.nodeType&&++p&&f===e){l[t]=[z,h,p];break}}else if(y&&(c=(e[M]||(e[M]={}))[t])&&c[0]===z)p=c[1];else for(;(f=++h&&f&&f[v]||(p=h=0)||d.pop())&&((s?f.nodeName.toLowerCase()!==m:1!==f.nodeType)||!++p||(y&&((f[M]||(f[M]={}))[t]=[z,p]),f!==e)););return p-=i,p===n||p%n===0&&p/n>=0}}},PSEUDO:function(t,r){var n,o=C.pseudos[t]||C.setFilters[t.toLowerCase()]||e.error("unsupported pseudo: "+t);return o[M]?o(r):o.length>1?(n=[t,t,"",r],C.setFilters.hasOwnProperty(t.toLowerCase())?i(function(t,e){for(var n,i=o(t,r),u=i.length;u--;)n=et(t,i[u]),t[n]=!(e[n]=i[u])}):function(t){return o(t,0,n)}):o}},pseudos:{not:i(function(t){var e=[],r=[],n=N(t.replace(at,"$1"));return n[M]?i(function(t,e,r,i){for(var o,u=n(t,null,i,[]),s=t.length;s--;)(o=u[s])&&(t[s]=!(e[s]=o))}):function(t,i,o){return e[0]=t,n(e,null,o,r),e[0]=null,!r.pop()}}),has:i(function(t){return function(r){return e(t,r).length>0}}),contains:i(function(t){return t=t.replace(At,xt),function(e){return(e.textContent||e.innerText||_(e)).indexOf(t)>-1}}),lang:i(function(t){return ht.test(t||"")||e.error("unsupported lang: "+t),t=t.replace(At,xt).toLowerCase(),function(e){var r;do if(r=I?e.lang:e.getAttribute("xml:lang")||e.getAttribute("lang"))return r=r.toLowerCase(),r===t||0===r.indexOf(t+"-");while((e=e.parentNode)&&1===e.nodeType);return!1}}),target:function(e){var r=t.location&&t.location.hash;return r&&r.slice(1)===e.id},root:function(t){return t===D},focus:function(t){return t===k.activeElement&&(!k.hasFocus||k.hasFocus())&&!!(t.type||t.href||~t.tabIndex)},enabled:function(t){return t.disabled===!1},disabled:function(t){return t.disabled===!0},checked:function(t){var e=t.nodeName.toLowerCase();return"input"===e&&!!t.checked||"option"===e&&!!t.selected},selected:function(t){return t.parentNode&&t.parentNode.selectedIndex,t.selected===!0},empty:function(t){for(t=t.firstChild;t;t=t.nextSibling)if(t.nodeType<6)return!1;return!0},parent:function(t){return!C.pseudos.empty(t)},header:function(t){return gt.test(t.nodeName)},input:function(t){return vt.test(t.nodeName)},button:function(t){var e=t.nodeName.toLowerCase();return"input"===e&&"button"===t.type||"button"===e},text:function(t){var e;return"input"===t.nodeName.toLowerCase()&&"text"===t.type&&(null==(e=t.getAttribute("type"))||"text"===e.toLowerCase())},first:l(function(){return[0]}),last:l(function(t,e){return[e-1]}),eq:l(function(t,e,r){return[0>r?r+e:r]}),even:l(function(t,e){for(var r=0;e>r;r+=2)t.push(r);return t}),odd:l(function(t,e){for(var r=1;e>r;r+=2)t.push(r);return t}),lt:l(function(t,e,r){for(var n=0>r?r+e:r;--n>=0;)t.push(n);return t}),gt:l(function(t,e,r){for(var n=0>r?r+e:r;++n<e;)t.push(n);return t})}},C.pseudos.nth=C.pseudos.eq;for(A in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})C.pseudos[A]=a(A);for(A in{submit:!0,reset:!0})C.pseudos[A]=c(A);p.prototype=C.filters=C.pseudos,C.setFilters=new p,S=e.tokenize=function(t,r){var n,i,o,u,s,a,c,l=U[t+" "];if(l)return r?0:l.slice(0);for(s=t,a=[],c=C.preFilter;s;){(!n||(i=ct.exec(s)))&&(i&&(s=s.slice(i[0].length)||s),a.push(o=[])),n=!1,(i=lt.exec(s))&&(n=i.shift(),o.push({value:n,type:i[0].replace(at," ")}),s=s.slice(n.length));for(u in C.filter)!(i=dt[u].exec(s))||c[u]&&!(i=c[u](i))||(n=i.shift(),o.push({value:n,type:u,matches:i}),s=s.slice(n.length));if(!n)break;

}return r?s.length:s?e.error(t):U(t,a).slice(0)},N=e.compile=function(t,e){var r,n=[],i=[],o=G[t+" "];if(!o){for(e||(e=S(t)),r=e.length;r--;)o=w(e[r]),o[M]?n.push(o):i.push(o);o=G(t,b(i,n)),o.selector=t}return o},q=e.select=function(t,e,r,n){var i,o,u,s,a,c="function"==typeof t&&t,l=!n&&S(t=c.selector||t);if(r=r||[],1===l.length){if(o=l[0]=l[0].slice(0),o.length>2&&"ID"===(u=o[0]).type&&x.getById&&9===e.nodeType&&I&&C.relative[o[1].type]){if(e=(C.find.ID(u.matches[0].replace(At,xt),e)||[])[0],!e)return r;c&&(e=e.parentNode),t=t.slice(o.shift().value.length)}for(i=dt.needsContext.test(t)?0:o.length;i--&&(u=o[i],!C.relative[s=u.type]);)if((a=C.find[s])&&(n=a(u.matches[0].replace(At,xt),wt.test(o[0].type)&&f(e.parentNode)||e))){if(o.splice(i,1),t=n.length&&h(o),!t)return Y.apply(r,n),r;break}}return(c||N(t,l))(n,e,!I,r,wt.test(t)&&f(e.parentNode)||e),r},x.sortStable=M.split("").sort(J).join("")===M,x.detectDuplicates=!!L,O(),x.sortDetached=o(function(t){return 1&t.compareDocumentPosition(k.createElement("div"))}),o(function(t){return t.innerHTML="<a href='#'></a>","#"===t.firstChild.getAttribute("href")})||u("type|href|height|width",function(t,e,r){return r?void 0:t.getAttribute(e,"type"===e.toLowerCase()?1:2)}),x.attributes&&o(function(t){return t.innerHTML="<input/>",t.firstChild.setAttribute("value",""),""===t.firstChild.getAttribute("value")})||u("value",function(t,e,r){return r||"input"!==t.nodeName.toLowerCase()?void 0:t.defaultValue}),o(function(t){return null==t.getAttribute("disabled")})||u(rt,function(t,e,r){var n;return r?void 0:t[e]===!0?e.toLowerCase():(n=t.getAttributeNode(e))&&n.specified?n.value:null}),"function"==typeof r&&r.amd?r("jquery",[],function(){return e}):"undefined"!=typeof module&&module.exports?module.exports=e:t.Sizzle=e}(window),r("interpreter",["cslparser","request","jquery"],function(t,e,r){function n(t,e){var r;if(null===t||null===e)return t===e;if(void 0===t||void 0===e)return t===e;for(r in e)if("_"!==r[0]&&!t.hasOwnProperty(r))return!1;for(r in t)if(t.hasOwnProperty(r)&&"_"!==r[0]){if(!e.hasOwnProperty(r))return!1;if(t[r])switch(typeof t[r]){case"object":if(!n(t[r],e[r]))return!1;break;default:if(t[r]!==e[r])return!1}else if(e[r])return!1}return!0}function i(t,e){var r,n,i=e;this.pause=function(){window.clearTimeout(r),i-=new Date-n},this.resume=function(){n=new Date,r=window.setTimeout(function(){t()},i)},this.cancel=function(){window.clearTimeout(r)},this.resume()}var o=function(t){this.message=t,this.name="TypeError"},u=function(t){this.message=t,this.name="ValueError"},s=function(t){this.message=t,this.name="RequireError"};s.prototype.getMessage=function(){return this.name+": "+this.message};var a=function(t){this.message=t,this.name="InterpreterError"},c=function(){this.name="InterruptException"},l=function(t,e,r,n){this.doc=t.document,this.window=t,this.ret={},this.id=l.id++,this.first_run=!0;var i=this;this.return_callback=function(t){e(t,i.getCurrentContext())},this.error_callback=function(t){var e=i.getCurrentContext();e._modified&&r(t,e)},this.event_callback=function(t){n(t)}};return l.id=0,l.prototype.InterpreterError=a,l.prototype.RequireError=s,l.prototype.interpretNext=function(){var t=this.stmt_stack;if(t.length>0){var e=t.pop();try{e.interpret(this),this.interpretNext()}catch(r){r instanceof c?t.push(e):this.error_callback.call(this,r)}}},l.prototype.getCurrentContext=function(){var t={_refresh:void 0!==this.refresh_timer};for(var e in this.variables)if(this.variables.hasOwnProperty(e)){var r=e.substring(1);t[r]=this.variables[e]}return t._modified=void 0===this.previousContext?!0:!n(this.previousContext,t),t},l.prototype.interpret=function(e){if(this.first_run?(this.previousContext=void 0,this.first_run=!1):this.previousContext=this.getCurrentContext(),"string"==typeof e)try{this.ast=t.parse(e)}catch(r){return void this.error_callback(r)}else this.ast=e;this.variables={},this.temp={},this.stmt_stack=[],this.refresh_timer=void 0,this.wait_timer=void 0,this.ast.interpret(this)},l.prototype.pause_timers=function(){this.refresh_timer&&this.refresh_timer.pause(),this.wait_timer&&this.wait_timer.pause()},l.prototype.resume_timers=function(){this.refresh_timer&&this.refresh_timer.resume(),this.wait_timer&&this.wait_timer.resume()},l.prototype.close=function(){this.refresh_timer&&this.refresh_timer.cancel(),this.wait_timer&&this.wait_timer.cancel()},l.prototype._getNodeList=function(t){if("string"!=typeof t)throw new a("First argument needs to be a selector.");try{return r(t,this.doc)}catch(e){throw new a("CSS Selector - "+e)}},l.prototype.function_table={call:function(){var t=Array.prototype.slice.call(arguments);if(t.length<2)throw new a("Wrong number of arguments.");for(var e=t[0],n=t[1],i=t.slice(2),o=this._getNodeList(e),u=0;u<o.length;u++){var s=r(o[u]);s[n]&&s[n].apply(s,i)}},event:function(){var t=Array.prototype.slice.call(arguments);this.event_callback(t)},json:function(){var t=Array.prototype.slice.call(arguments);if(t.length%2!==0)throw new a("Need even number of arguments.");for(var e=0,r={};e<t.length;r[t[e]]=t[e+1],e+=2);return JSON.stringify(r)},setAttribute:function(){var t=Array.prototype.slice.call(arguments);if(t.length<3)throw new a("Wrong number of arguments.");for(var e=t[0],r=t[1],n=t[2],i=this._getNodeList(e),o=0;o<i.length;o++)i[o][r]=n},"const":function(t){return t},sizzle:function(){var t,e=Array.prototype.slice.call(arguments),r=e[0];e.length>1&&(t=e[1]);var n=this._getNodeList(r);if(0===n.length)return"";for(var i=[],o=0;o<n.length;o++){var u=n[o],s="";s=t?"textContent"===t?u.textContent||u.innerText:u.getAttribute(t):u.innerHTML,i.push(s)}return 1===i.length?i[0]:i},debug:function(){return void 0},httpGet:function(t){var r=this,n=this.temp,i="__httpGet__"+t;if(i in n){var o=n[i];return delete n[i],o}var u=new e.AjaxRequest("GET",t);throw u.onReadyStateChange(function(t){var e=null;4===t.readyState&&(200===t.status&&(e=t.responseText),n[i]=e,r.interpretNext())}),u.onError(function(){n[i]=null,r.interpretNext()}),u.send(null),
new c},join:function(t,e){return t.join(e)},len:function(t){return t.hasOwnProperty("length")?t.length:void 0},re:function(){var t=Array.prototype.slice.call(arguments),e=this.doc.documentElement.innerHTML,r=t[0],n="";if(t.length>=2&&(n=t[1]),3===t.length&&(e=t[2]),t.length>3)throw new u("'re' expression expects 3 arguments at most.");if(!e)return"";if("string"!=typeof e)try{e=e.toString()}catch(i){throw new u("'re' block argument has no 'toString'.")}e=e.replace(/(\r|\n)/gi,""),r instanceof RegExp&&(r=r.source),r=r.replace(/"([^?])/gi,'"?$1'),-1===n.search("i")&&(n+="i"),r=new RegExp(r,n);var o=e.match(r);return o?-1!==n.search("g")?o:1===o.length?!0:o[1]:""},refresh:function(t){var e=this;if(void 0===t)throw new u("refresh interval argument required.");if(t=parseInt(t,10),1e3>t)throw new u("interval must be at least 1000.");this.refresh_timer&&this.refresh_timer.cancel(),this.refresh_timer=new i(function(){e.interpret(e.ast)},t)},replace:function(){var t=Array.prototype.slice.call(arguments),e=t.shift();if("string"!=typeof e)throw new o("First argument must be of type string.");if(0===t.length||t.length%2!==0)throw new u("ReplaceExpression got wrong number of args.");t.reverse();for(var r=2;t.length>0;){var n=t.pop();n instanceof RegExp&&(n=n.source);var i=t.pop();try{n=new RegExp(n,"gi")}catch(s){throw new u("Cannot create RegExp for "+n)}r+=2,e=e.replace(n,i)}return e},trim:function(t){return"string"==typeof t&&(t=t.replace(/\s+/gi," "),t=t.replace(/^\s/i,"").replace(/\s$/i,"")),t},url:function(){var t=this.doc;try{return t.location.href}catch(e){throw new a("'doc' has no property 'location.href'.")}},urlParam:function(t){var e,r=this.doc;try{e=r.location.href}catch(n){throw new a("'doc' has no property 'location.href'.")}for(var i=e.slice(e.indexOf("?")+1).split("&"),o={},u=0,s=i.length;s>u;u++){var c=i[u].split("=");o[c[0]]=c[1]}return o[t]},version:function(){return t?t.VERSION:void 0},at_least_version:function(e){function r(t){if("string"!=typeof t)return!1;var e=t.split("."),r=parseInt(e[0],10)||0,n=parseInt(e[1],10)||0,i=parseInt(e[2],10)||0;return{major:r,minor:n,patch:i}}if(!t)throw new a("CSL Parser not in namespace. ");var n=r(e),i=r(t.VERSION);return i.major!==n.major?i.major>n.major:i.minor!==n.minor?i.minor>n.minor:i.patch!==n.patch?i.patch>n.patch:!0},wait:function(t){var e=this;if(!("wait_token"in this.temp)){if(t=parseInt(t,10),0>t)throw new u("Delay must be larger than 0.");throw window.setTimeout(function(){e.temp.wait_token=null,e.interpretNext()},t),new c}delete this.temp.wait_token},xpath:function(t){var e=this.doc;if(!("evaluate"in e))throw new a("DOM doc object has no 'evaluate' function.");var r=null;try{r=e.evaluate(t,e,null,2,null)}catch(n){throw new a(n)}return r?r.stringValue:""}},{TypeError:o,ValueError:u,InterruptException:c,Interpreter:l}}),r("utils",[],function(){function t(t,e){return t===e?0:e>t?-1:1}function e(e,r){var n=t;return e&&(n=function(r,n){return t(e(r),e(n))}),r?function(t,e){return-1*n(t,e)}:n}function r(){for(var t=[],e="0123456789ABCDEF",r=0;36>r;r++)t[r]=Math.floor(16*Math.random());for(t[14]=4,t[19]=3&t[19]|8,r=0;36>r;r++)t[r]=e[t[r]];return t[8]=t[13]=t[18]=t[23]="-",t.join("")}function n(t){for(var e in t)if(t.hasOwnProperty(e))return!1;return JSON.stringify(t)===JSON.stringify({})}return{getHostname:function(t){return t.match(/^(https?:\/\/.*?(?::\d+)?\/)/)[1]},sort:function(r){for(var n,i,o,u=[],s=1;s<arguments.length;s++)n=arguments[s],"string"==typeof n?(i=n,o=t):(i=n.name,o=e(n.primer,n.reverse)),u.push({name:i,cmp:o});var a=function(t,e){for(var r=0,n=0;n<u.length;n++){var i=u[n];if("undefined"!=typeof t[i.name]&&(r=i.cmp(t[i.name],e[i.name]),0!==r))break}return r};r.sort(a)},makeRandomString:function(t){for(var e="",r="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",n=0;t>n;n++)e+=r.charAt(Math.floor(Math.random()*r.length));return e},settings_sanity_check:function(t){if("object"!=typeof t)throw"settings must be object";if(!t.tag)throw"settings.tag is mandatory";"about:blank"===t.url&&(t.url=void 0)},generateRandomUUID:r,isEmptyObject:n}}),r("debug",[],function(){var t,e;return{setup:function(r){e=r,e.console||(t=e.document.createElement("div"),t.style.position="fixed",t.style.bottom="0",t.style.left="0",t.style.width="100%",t.style.maxHeight="200px",t.style.fontFamily="sans-serif",t.style.fontSize="10px",t.style.border="2px solid red",t.style.padding="2px",t.style.boxShadow="3px 3px 8px #aaa",t.style.background="#fff",t.style.zIndex="2147483647",t.style.overflowY="scroll",e.document.getElementsByTagName("body")[0].appendChild(t)),this.log("Debug enabled.")},log:function(){var r=new Date;if(e.console)try{e.console.log.call(e.console,r,1===arguments.length?arguments[0]:arguments)}catch(n){}else if(t){var i=e.document.createElement("div");i.style.borderBottom="1px",i.style.borderBottomStyle="dotted",i.style.borderBottomColor="#ddd",i.innerHTML="<i>"+r+"</i> "+("string"==typeof arguments[0]&&1===arguments.length?arguments[0]:JSON.stringify(arguments)),t.appendChild(i)}}}}),r("events",["debug"],function(){var t={listeners:{}},e=function(e,r){"undefined"==typeof t.listeners[e]&&(t.listeners[e]=[]),t.listeners[e].push(r)},r=function(e){if("undefined"!=typeof t.listeners[e])for(var r=0;r<t.listeners[e].length;r++)if("function"==typeof t.listeners[e][r]){var n=Array.prototype.slice.call(arguments,1);try{t.listeners[e][r].apply(this,n)}catch(i){}}};return{on:e,trigger:r}}),r("page",["constants","interpreter","request","utils","events"],function(t,e,r,n,i){var o=function(e,r){n.settings_sanity_check(r),this.doc=e,this.referrer=e.location.referer,this.listeners={},this.num_pending_plugins=0,this.api_url_search=t.get_url("analyze",r),this.api_url_coupon=t.get_url("voucher",r),this.settings=r,this.offers={},this.totalOffers=0,this.on=i.on,this.trigger=i.trigger};return o.prototype={load:function(){var e=this,i=new r.AjaxRequest("GET",this.api_url_search,{url:n.getHostname(this.settings.url||this.doc.location.href),version:t.version,
tag:this.settings.tag,campaign:this.settings.campaign,uuid:this.settings.uuid});i.onLoad(function(t){200===t.status?e.domainConfigReceived(t):e.trigger("error",{message:"Could not retrieve domain configuration."})}),i.send()},clearOffers:function(t){this.offers.hasOwnProperty(t)&&(this.totalOffers-=this.offers[t].count),delete this.offers[t]},doCiuvoSearch:function(t,r){var n=this,i=new e.Interpreter(window,function(e){n.callSearchBackend(e,t,r.plugin_name)},function(t){n.trigger("error",t)},function(){});i.interpret(r.csl)},getUrl:function(){return this.settings.url||this.doc.location.href},doVoucherSearch:function(e,i){this.num_pending_plugins++;var o={url:n.getHostname(this.getUrl()),referrer:this.referrer,version:t.version,tag:this.settings.tag,campaign:this.settings.campaign,uuid:this.settings.uuid,limit:this.settings.limit,filter:this.settings.filter,init:this.settings.init};"undefined"!=typeof this.settings.user_preferences&&(o.cfg=this.settings.user_preferences);var u=new r.AjaxRequest("GET",this.api_url_coupon,o),s=this;this.clearOffers(i.plugin_name),u.onLoad(function(t){s.parseResponse(t,e,i.plugin_name)}),u.send()},domainConfigReceived:function(t){var e=JSON.parse(t.responseText),r=this,n=function(t,e){t&&!t.morepending&&r.num_pending_plugins--,r.processResponseChunk(t,e)};if(201===e.status)for(var i=0;i<e.plugins.length;i++){var o=e.plugins[i],u=o[0],s=o[1]||{};if(s.plugin_name=u,s.csl||(s.csl=e.csl),"function"==typeof this["do"+u])try{this["do"+u].apply(this,[n,s])}catch(a){}}else this.trigger("error",{message:"This webpage is not configured."})},callSearchBackend:function(e,n,i){this.num_pending_plugins++,this.clearOffers(i);var o={query:e,url:this.settings.url||this.doc.location.href,tag:this.settings.tag,version:t.version};"undefined"!=typeof this.settings.user_preferences&&(o.cfg=this.settings.user_preferences);for(var u=["campaign","uuid","filter","limit","init"],s=0;s<u.length;s++)this.settings[u[s]]&&(o[u[s]]=this.settings[u[s]]);this.referer&&(o.referer=this.referer);var a=new r.AjaxRequest("POST",this.api_url_search),c=this;a.onLoad(function(t){c.parseResponse(t,n,i)}),a.send(JSON.stringify(o))},parseResponse:function(t,e,r){if(2===t.readyState&&200===t.status&&(t.chunks_read=0),(3===t.readyState||4===t.readyState)&&200===t.status&&"\n"===t.responseText.slice(-1)){var n=t.responseText.split("\n"),i=n.slice(t.chunks_read);t.chunks_read=n.length;for(var o=0,u=i.length;u>o;o++)if(0!==i[o].length){var s=JSON.parse(i[o]);e(s,r)}}},processResponseChunk:function(t,e){this.offers.hasOwnProperty(e)||(this.offers[e]={count:0});for(var r=t.items[0],n=0,i=r.offers.length;i>n;n++){var o=r.offers[n];this.offers[e].hasOwnProperty(o.category)||(this.offers[e][o.category]={category:o.category,priority:o.priority,offers:[]}),this.offers[e][o.category].offers.push(o),this.offers[e].count++,this.totalOffers++,this.trigger("offer",o)}t.morepending||this.num_pending_plugins||(this.trigger("offers",this.sortOffers()),this.trigger("finalize"))},mergeOffers:function(){allOffers={};var t=function(t){return JSON.parse(JSON.stringify(t))};for(var e in this.offers)if(this.offers.hasOwnProperty(e))for(var r in this.offers[e])this.offers[e].hasOwnProperty(r)&&"object"==typeof this.offers[e][r]&&(allOffers.hasOwnProperty(r)?allOffers[r].offers.concat(t(this.offers[e][r].offers)):allOffers[r]=t(this.offers[e][r]));return allOffers},sortOffers:function(){allOffers=this.mergeOffers();for(var t in allOffers)allOffers.hasOwnProperty(t)&&n.sort(allOffers[t].offers,{name:"sortorder",primer:parseInt});return allOffers},close:function(){}},{ConnectedPage:o}}),r("ciuvoSDK",["constants"],function(t){var r={version:t.version};return e(["page","interpreter","cslparser"]),r.ConnectedPage=e("page").ConnectedPage,r.Interpreter=e("interpreter").Interpreter,r.Parser=e("cslparser"),r}),e("ciuvoSDK")});


module.exports = this.ciuvoSDK; // Added for browserify compatibility

},{}],15:[function(require,module,exports){
module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

},{}],16:[function(require,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = require('./_wks')('unscopables');
var ArrayProto = Array.prototype;
if (ArrayProto[UNSCOPABLES] == undefined) require('./_hide')(ArrayProto, UNSCOPABLES, {});
module.exports = function (key) {
  ArrayProto[UNSCOPABLES][key] = true;
};

},{"./_hide":31,"./_wks":59}],17:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

},{"./_is-object":35}],18:[function(require,module,exports){
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

},{"./_to-absolute-index":52,"./_to-iobject":54,"./_to-length":55}],19:[function(require,module,exports){
var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};

},{}],20:[function(require,module,exports){
var core = module.exports = { version: '2.6.12' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

},{}],21:[function(require,module,exports){
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

},{"./_a-function":15}],22:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

},{}],23:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_fails":27}],24:[function(require,module,exports){
var isObject = require('./_is-object');
var document = require('./_global').document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};

},{"./_global":29,"./_is-object":35}],25:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');

},{}],26:[function(require,module,exports){
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

},{"./_core":20,"./_ctx":21,"./_global":29,"./_hide":31,"./_redefine":48}],27:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

},{}],28:[function(require,module,exports){
module.exports = require('./_shared')('native-function-to-string', Function.toString);

},{"./_shared":51}],29:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

},{}],30:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};

},{}],31:[function(require,module,exports){
var dP = require('./_object-dp');
var createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

},{"./_descriptors":23,"./_object-dp":42,"./_property-desc":47}],32:[function(require,module,exports){
var document = require('./_global').document;
module.exports = document && document.documentElement;

},{"./_global":29}],33:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function () {
  return Object.defineProperty(require('./_dom-create')('div'), 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_descriptors":23,"./_dom-create":24,"./_fails":27}],34:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};

},{"./_cof":19}],35:[function(require,module,exports){
module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

},{}],36:[function(require,module,exports){
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

},{"./_hide":31,"./_object-create":41,"./_property-desc":47,"./_set-to-string-tag":49,"./_wks":59}],37:[function(require,module,exports){
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

},{"./_export":26,"./_hide":31,"./_iter-create":36,"./_iterators":39,"./_library":40,"./_object-gpo":44,"./_redefine":48,"./_set-to-string-tag":49,"./_wks":59}],38:[function(require,module,exports){
module.exports = function (done, value) {
  return { value: value, done: !!done };
};

},{}],39:[function(require,module,exports){
module.exports = {};

},{}],40:[function(require,module,exports){
module.exports = false;

},{}],41:[function(require,module,exports){
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

},{"./_an-object":17,"./_dom-create":24,"./_enum-bug-keys":25,"./_html":32,"./_object-dps":43,"./_shared-key":50}],42:[function(require,module,exports){
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

},{"./_an-object":17,"./_descriptors":23,"./_ie8-dom-define":33,"./_to-primitive":57}],43:[function(require,module,exports){
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

},{"./_an-object":17,"./_descriptors":23,"./_object-dp":42,"./_object-keys":46}],44:[function(require,module,exports){
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

},{"./_has":30,"./_shared-key":50,"./_to-object":56}],45:[function(require,module,exports){
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

},{"./_array-includes":18,"./_has":30,"./_shared-key":50,"./_to-iobject":54}],46:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = require('./_object-keys-internal');
var enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};

},{"./_enum-bug-keys":25,"./_object-keys-internal":45}],47:[function(require,module,exports){
module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

},{}],48:[function(require,module,exports){
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

},{"./_core":20,"./_function-to-string":28,"./_global":29,"./_has":30,"./_hide":31,"./_uid":58}],49:[function(require,module,exports){
var def = require('./_object-dp').f;
var has = require('./_has');
var TAG = require('./_wks')('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};

},{"./_has":30,"./_object-dp":42,"./_wks":59}],50:[function(require,module,exports){
var shared = require('./_shared')('keys');
var uid = require('./_uid');
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};

},{"./_shared":51,"./_uid":58}],51:[function(require,module,exports){
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

},{"./_core":20,"./_global":29,"./_library":40}],52:[function(require,module,exports){
var toInteger = require('./_to-integer');
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};

},{"./_to-integer":53}],53:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

},{}],54:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject');
var defined = require('./_defined');
module.exports = function (it) {
  return IObject(defined(it));
};

},{"./_defined":22,"./_iobject":34}],55:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer');
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

},{"./_to-integer":53}],56:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function (it) {
  return Object(defined(it));
};

},{"./_defined":22}],57:[function(require,module,exports){
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

},{"./_is-object":35}],58:[function(require,module,exports){
var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

},{}],59:[function(require,module,exports){
var store = require('./_shared')('wks');
var uid = require('./_uid');
var Symbol = require('./_global').Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;

},{"./_global":29,"./_shared":51,"./_uid":58}],60:[function(require,module,exports){
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

},{"./_add-to-unscopables":16,"./_iter-define":37,"./_iter-step":38,"./_iterators":39,"./_to-iobject":54}],61:[function(require,module,exports){
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

},{"./_global":29,"./_hide":31,"./_iterators":39,"./_object-keys":46,"./_redefine":48,"./_wks":59,"./es6.array.iterator":60}],62:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };

    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}

function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}

},{}],63:[function(require,module,exports){
"use strict";

module.exports = require('./src/ContentMessenger');

},{"./src/ContentMessenger":64}],64:[function(require,module,exports){
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

},{"./ContentTopic":65,"./Messenger":66,"./chrome":68,"@babel/runtime/helpers/assertThisInitialized":5,"@babel/runtime/helpers/classCallCheck":6,"@babel/runtime/helpers/createClass":7,"@babel/runtime/helpers/getPrototypeOf":8,"@babel/runtime/helpers/inherits":9,"@babel/runtime/helpers/interopRequireDefault":10,"@babel/runtime/helpers/possibleConstructorReturn":11}],65:[function(require,module,exports){
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

},{"./Topic":67,"./chrome":68,"@babel/runtime/helpers/classCallCheck":6,"@babel/runtime/helpers/getPrototypeOf":8,"@babel/runtime/helpers/inherits":9,"@babel/runtime/helpers/interopRequireDefault":10,"@babel/runtime/helpers/possibleConstructorReturn":11}],66:[function(require,module,exports){
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

},{"@babel/runtime/helpers/classCallCheck":6,"@babel/runtime/helpers/createClass":7,"@babel/runtime/helpers/interopRequireDefault":10}],67:[function(require,module,exports){
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

},{"@babel/runtime/helpers/classCallCheck":6,"@babel/runtime/helpers/createClass":7,"@babel/runtime/helpers/interopRequireDefault":10}],68:[function(require,module,exports){
"use strict";

/* globals chrome, browser */
if (typeof browser !== 'undefined' && browser.runtime) {
  module.exports = browser;
} else {
  module.exports = chrome;
}

},{}],69:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isFinite(val)) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}

},{}],70:[function(require,module,exports){
/*!
* screenfull
* v3.3.3 - 2018-09-04
* (c) Sindre Sorhus; MIT License
*/
(function () {
	'use strict';

	var document = typeof window !== 'undefined' && typeof window.document !== 'undefined' ? window.document : {};
	var isCommonjs = typeof module !== 'undefined' && module.exports;
	var keyboardAllowed = typeof Element !== 'undefined' && 'ALLOW_KEYBOARD_INPUT' in Element;

	var fn = (function () {
		var val;

		var fnMap = [
			[
				'requestFullscreen',
				'exitFullscreen',
				'fullscreenElement',
				'fullscreenEnabled',
				'fullscreenchange',
				'fullscreenerror'
			],
			// New WebKit
			[
				'webkitRequestFullscreen',
				'webkitExitFullscreen',
				'webkitFullscreenElement',
				'webkitFullscreenEnabled',
				'webkitfullscreenchange',
				'webkitfullscreenerror'

			],
			// Old WebKit (Safari 5.1)
			[
				'webkitRequestFullScreen',
				'webkitCancelFullScreen',
				'webkitCurrentFullScreenElement',
				'webkitCancelFullScreen',
				'webkitfullscreenchange',
				'webkitfullscreenerror'

			],
			[
				'mozRequestFullScreen',
				'mozCancelFullScreen',
				'mozFullScreenElement',
				'mozFullScreenEnabled',
				'mozfullscreenchange',
				'mozfullscreenerror'
			],
			[
				'msRequestFullscreen',
				'msExitFullscreen',
				'msFullscreenElement',
				'msFullscreenEnabled',
				'MSFullscreenChange',
				'MSFullscreenError'
			]
		];

		var i = 0;
		var l = fnMap.length;
		var ret = {};

		for (; i < l; i++) {
			val = fnMap[i];
			if (val && val[1] in document) {
				for (i = 0; i < val.length; i++) {
					ret[fnMap[0][i]] = val[i];
				}
				return ret;
			}
		}

		return false;
	})();

	var eventNameMap = {
		change: fn.fullscreenchange,
		error: fn.fullscreenerror
	};

	var screenfull = {
		request: function (elem) {
			var request = fn.requestFullscreen;

			elem = elem || document.documentElement;

			// Work around Safari 5.1 bug: reports support for
			// keyboard in fullscreen even though it doesn't.
			// Browser sniffing, since the alternative with
			// setTimeout is even worse.
			if (/ Version\/5\.1(?:\.\d+)? Safari\//.test(navigator.userAgent)) {
				elem[request]();
			} else {
				elem[request](keyboardAllowed ? Element.ALLOW_KEYBOARD_INPUT : {});
			}
		},
		exit: function () {
			document[fn.exitFullscreen]();
		},
		toggle: function (elem) {
			if (this.isFullscreen) {
				this.exit();
			} else {
				this.request(elem);
			}
		},
		onchange: function (callback) {
			this.on('change', callback);
		},
		onerror: function (callback) {
			this.on('error', callback);
		},
		on: function (event, callback) {
			var eventName = eventNameMap[event];
			if (eventName) {
				document.addEventListener(eventName, callback, false);
			}
		},
		off: function (event, callback) {
			var eventName = eventNameMap[event];
			if (eventName) {
				document.removeEventListener(eventName, callback, false);
			}
		},
		raw: fn
	};

	if (!fn) {
		if (isCommonjs) {
			module.exports = false;
		} else {
			window.screenfull = false;
		}

		return;
	}

	Object.defineProperties(screenfull, {
		isFullscreen: {
			get: function () {
				return Boolean(document[fn.fullscreenElement]);
			}
		},
		element: {
			enumerable: true,
			get: function () {
				return document[fn.fullscreenElement];
			}
		},
		enabled: {
			enumerable: true,
			get: function () {
				// Coerce to boolean in case of old WebKit
				return Boolean(document[fn.fullscreenEnabled]);
			}
		}
	});

	if (isCommonjs) {
		module.exports = screenfull;
	} else {
		window.screenfull = screenfull;
	}
})();

},{}],71:[function(require,module,exports){
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

},{}],72:[function(require,module,exports){
module.exports = "<div class=\"__avira__search_block_icon\"></div>\n<div class=\"__avira__safetip\">\n    <div class=\"__avira__safetip-content\">\n        <div class=\"__avira__safetip-close\">×</div>\n        <div class=\"__avira__safetip-title\">{{ name }}</div>\n        <div class=\"__avira__safetip-description\">{{ description }}</div>\n        <div class=\"__avira__safetip-copy\"><span>{{ lb_powered_by_avira }}</span></div>\n    </div>\n</div>\n";

},{}],73:[function(require,module,exports){
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

},{"background/localStorage":1,"configuration":3,"underscore":71}],74:[function(require,module,exports){
"use strict";

const IframeTop = require('content/Iframes/base/Iframe_top');

class Iframe extends IframeTop {}

module.exports = Iframe;

},{"content/Iframes/base/Iframe_top":76}],75:[function(require,module,exports){
"use strict";

const _ = require('underscore');

class Iframe {
  static initClass() {
    this.prototype.el = null;
    this.prototype.css = {
      position: 'absolute',
      'z-index': 'auto',
      overflow: 'hidden',
      width: '100%',
      height: '100%',
      'max-height': 'none',
      'min-height': 0,
      margin: '0 auto',
      padding: 0,
      border: 0,
      'box-shadow': 'none',
      'background-color': 'transparent'
    };
  } // eslint-disable-next-line max-params


  constructor(url, id, containerSelector, cssOverride) {
    this.url = url;
    this.css = _.extend({}, this.css);

    if (id) {
      this.id = id;
    }

    if (containerSelector) {
      this.containerSelector = containerSelector;
    }

    if (cssOverride) {
      this._applyCssOverride(cssOverride);
    }
  }

  createEl() {
    this.el = document.createElement('iframe');
    this.el.setAttribute('allowtransparency', true);
    this.el.setAttribute('frameBorder', 0);
    this.el.setAttribute('id', this.id || 'abs-iframe');

    if (this.css) {
      this._applyCss(this.css);
    }
  }

  attach() {
    const container = document.querySelector(this.containerSelector);
    container.appendChild(this.el); // the "src" attr is set after inserting an iframe into DOM
    // so a Backbone Router starts with a correct initial state

    return this.el.setAttribute('src', this.url);
  }

  remove() {
    return this.el.parentNode.removeChild(this.el);
  }

  subscribe() {}

  _applyCssOverride(cssOverride) {
    for (const attr in cssOverride) {
      if (cssOverride.hasOwnProperty(attr)) {
        this.css[attr] = cssOverride[attr];
      }
    }
  }

  _applyCss(css) {
    for (const property in css) {
      if (css.hasOwnProperty(property)) {
        this._applyCssProperty(property, css[property]);
      }
    }
  }

  _applyCssProperty(property, value) {
    return this.el.style.setProperty(property, value, 'important');
  }

}

Iframe.initClass();
module.exports = Iframe;

},{"underscore":71}],76:[function(require,module,exports){
"use strict";

require("core-js/modules/es6.array.iterator.js");

require("core-js/modules/web.dom.iterable.js");

// maps iframe location (see "source/js/content/Routers/App.coffee")
// to a visual state, handling dimensions and stylistic changes
const Iframe = require('content/Iframes/base/Iframe');

const config = require('config');

const messenger = require('content/messagingInterface');

const screenfull = require('screenfull');

class IframeTop extends Iframe {
  static initClass() {
    this.prototype.id = 'abs-top-frame';
    this.prototype.containerSelector = 'html';
    this.prototype.css = {
      position: 'fixed',
      'z-index': 2 ** 32 - 1,
      overflow: 'hidden',
      top: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      'max-height': 'none',
      'min-height': 0,
      margin: '0 auto',
      padding: 0,
      border: 0,
      'background-color': 'transparent'
    }; // 'border': '1px solid red' # useful for testing

    this.prototype.stateCSS = {
      min: {
        width: '0',
        height: '0'
      },
      permanentBar: {
        width: '100%',
        height: '60px'
      },
      permanentBarOffers: {
        width: '100%',
        height: '60px'
      },
      permanentBarAndDash: {
        width: '100%',
        height: '100%'
      },
      dash: {
        width: '100%',
        height: '100%'
      }
    };
    this.prototype.statesWithAdaptingDelays = {
      min: ['bar'],
      popup: ['bar'],
      bar: ['min'],
      permanentBar: ['min'],
      permanentBarAndDash: ['min', 'permanentBar'],
      dash: ['min', 'bar', 'permanentBar']
    };
    this.prototype.stateRoutePatterns = {
      min: [/^minimized/],
      bar: [/^$/, /^serp$/, /^PUA\/.+?\/bar$/],
      permanentBar: [/^offers\/(minimized|coupon)$/, /^maliciousSearchEngine$/, /^unsafeContent\/notification$/],
      permanentBarAndDash: [/^offers\/?.*$/]
    };
    this.prototype.delays = {
      stateChangeAdapting: config.barTransitionDelay,
      fromMinimized: config.barTransitionDelay,
      toMinimized: config.barTransitionDelay * 2
    };
    this.prototype._currentState = null;
    this.prototype._adjustHeightTimeout = null;
    this.prototype._isTopURLUnsafe = false;
    this.prototype._isContentUnsafe = false;
    this.prototype._isPUA = false;
    this.prototype._isMSE = false;
    this.prototype._isMouseIn = false;
    this.prototype._classObservers = {};
  }

  constructor(url) {
    super(url);
    this._adjustWidth = this._adjustWidth.bind(this);
    this._onBeforeRouteChange = this._onBeforeRouteChange.bind(this);
  }

  attach(...args) {
    super.attach(...args);
    return this._changeState('min');
  }

  remove(...args) {
    this._toggleContentPushdown(false);

    return super.remove(...args);
  }

  subscribe() {
    messenger.subscribe('router:beforeRouteChange', this._onBeforeRouteChange);
    messenger.subscribe('indicatorBar:widthChanged', this._adjustWidth);
    messenger.publish('Tabs:getData', {
      classifier: 'AUCClassifier'
    }, aucData => {
      this._isTopURLUnsafe = aucData.unsafe;
      this._isContentUnsafe = aucData.hasUnsafeContent;
      this._isPUA = aucData.isPUA;
      this._isWarning = aucData.isWarning;
      this._isMSE = aucData.isMSE;

      if (this._isTopURLUnsafe || this._isContentUnsafe || this._isPUA || this._isWarning || this._isMSE) {
        this._actualizeCss();
      }
    });
    this.el.addEventListener('mouseover', e => {
      e.stopPropagation();
      this._isMouseIn = true;

      if (this._currentState !== 'min') {
        return;
      }

      this._changeRouteOrPass('', this.delays.fromMinimized, () => this._isMouseIn);
    });
    this.el.addEventListener('mouseout', e => {
      e.stopPropagation();
      this._isMouseIn = false;
      return this._minimizeOrPass();
    }); // http://davidwalsh.name/fullscreen
    // https://github.com/sindresorhus/screenfull.js

    if (screenfull.enabled) {
      document.addEventListener(screenfull.raw.fullscreenchange, () => {
        this.el.style.display = screenfull.isFullscreen ? 'none' : 'block';
      });
    }
  }

  preventMutations() {
    const originalSrc = this.url;
    const observer = new MutationObserver(mutations => (() => {
      const result = [];

      for (const mutation of Array.from(mutations)) {
        let item;

        if (mutation.target.src !== originalSrc) {
          item = originalSrc;
          mutation.target.src = originalSrc;
        }

        result.push(item);
      }

      return result;
    })());
    return observer.observe(this.el, {
      attributes: true,
      attributeFilter: ['src']
    });
  }

  _toShow() {
    if (this._isTopURLUnsafe || this._isContentUnsafe || this._isPUA || this._isWarning || this._isMSE) {
      return true;
    }

    return ['permanentBarAndDash', 'permanentBar'].includes(this._currentState);
  }

  _onBeforeRouteChange(details) {
    for (const state in this.stateRoutePatterns) {
      if (this.stateRoutePatterns.hasOwnProperty(state)) {
        const patterns = this.stateRoutePatterns[state];

        for (const routePattern of Array.from(patterns)) {
          if (routePattern.test(details.route)) {
            this._changeState(state);

            return;
          }
        }
      }
    }
  }

  _changeState(newState) {
    if (newState === this._currentState) {
      return;
    }

    const delay = this._getDelayByState(newState);

    this._toggleContentPushdownByState(newState);

    this._currentState = newState;

    this._actualizeCssWithDelay(delay);

    this._adjustHeightWithDelay(delay);
  }

  _actualizeCssWithDelay(delay) {
    // "display: block;" should be applied synchronously for dash to appear in FF
    if (!delay) {
      return this._actualizeCss();
    }

    return setTimeout(this._actualizeCss.bind(this), delay);
  }

  _actualizeCss() {
    if (!this._toShow()) {
      return this._applyCss({
        display: 'none'
      });
    }

    this._applyCss({
      display: 'block'
    });

    return this._applyCss(this.stateCSS[this._currentState]);
  }

  _getDelayByState(newState) {
    if (!this._currentState) {
      return 0;
    }

    if (!Array.from(this.statesWithAdaptingDelays[this._currentState]).includes(newState)) {
      return 0;
    }

    return this.delays.stateChangeAdapting;
  }

  _toggleContentPushdownByState(newState) {
    if (['min'].includes(this._currentState) && ['permanentBar', 'permanentBarAndDash'].includes(newState)) {
      setTimeout(() => this._toggleContentPushdown(true), this.delays.fromMinimized);
    }

    if (['min'].includes(newState) && ['permanentBar', 'permanentBarAndDash'].includes(this._currentState)) {
      this._toggleContentPushdown(false);
    }
  }

  _toggleContentPushdown(toPush) {
    this._toggleElementPushdown(document.querySelector('html'), 'margin-top', toPush); // if some elements have fixed position, shifting "html" is not enough


    return this._toggleCustomContentPushdown(toPush);
  }

  _toggleCustomContentPushdown(toPush) {
    const customs = {
      '^https?:\\/\\/www\\.youtube\\.com\\/': ['#masthead-positioner', '#masthead-container'],
      '^https?:\\/\\/www\\.pinterest\\.com\\/': '.App .headerBackground, .App .headerContainer',
      '^https?:\\/\\/search\\.yahoo\\.com\\/': [() => this._toggleElementPushdown(document.querySelector('#yucsHead'), 'margin-top', toPush, {
        important: true
      })],
      '^https?:\\/\\/((www\\.|[a-z]{2,3})\\.)?wikipedia\\.(com|org)': this._positionBody,
      '^https?:\\/\\/(www\\.)?google\\.(((com|co)\\.[a-z]{2})|[a-z]{2,3})\\/search\\?': this._positionBody,
      '^https?:\\/\\/(www\\.)?google\\.(((com|co)\\.[a-z]{2})|[a-z]{2,3})\\/': '#viewport',
      '^https?:\\/\\/www\\.apple\\.com\\/': [this._positionBody, this._observeClassToggle('.localnav-wrapper', 'is-sticking', toPush), this._observeClassToggle('sticky.ase-sticky', 'ase-sticky-stuck', toPush, 'margin-top')],
      '^https?:\\/\\/www\\.hse24\\.de\\/': this._positionBody
    };

    for (const pattern in customs) {
      if (customs.hasOwnProperty(pattern) && new RegExp(pattern).test(window.location.href)) {
        const applicants = customs[pattern];
        const applicantsArr = [].concat(applicants);
        applicantsArr.forEach(applicant => {
          // currently, there's no need to pass "toPush"
          // but it should be introduced if some custom "applicant()"
          // would have to restore a DOM state while exiting from pushdown
          if (typeof applicant === 'function') {
            applicant();
            return;
          }

          for (const el of Array.from(document.querySelectorAll(applicant))) {
            this._toggleElementPushdown(el, 'top', toPush);
          }
        });
      }
    }
  } // eslint-disable-next-line complexity, max-params


  _toggleElementPushdown(el, property, toPush, ...rest) {
    if (!el) {
      return;
    }

    const val = rest[0];
    const obj = val != null ? val : {};
    const val1 = obj.bypassTransition;
    const bypassTransition = val1 != null ? val1 : false;
    const val2 = obj.forceTransition;
    const forceTransition = val2 != null ? val2 : false;
    const val3 = obj.important;
    const important = val3 != null ? val3 : false;

    if (toPush && !bypassTransition || forceTransition) {
      el.style.setProperty('transition', `${property} 200ms linear`);
    } // eslint-disable-next-line consistent-return


    return el.style.setProperty(property, toPush ? this.stateCSS.permanentBar.height : `${0}px`, important ? 'important' : '');
  } // only known case is "https://www.google.de/search?q=..."
  // where there's a "#searchform" element being absolutely positioned
  // with an offset of "top: 15px"
  // so it's better to align it to "body" than to memorize and restore that initial offset


  _positionBody() {
    return document.body.style.setProperty('position', 'relative');
  } // eslint-disable-next-line max-params


  _observeClassToggle(selector, className, toPush, property) {
    if (property == null) {
      // eslint-disable-next-line no-param-reassign
      property = 'top';
    }

    return () => {
      const el = document.querySelector(selector);

      if (!el && toPush) {
        return;
      }

      const observerName = `${selector}:${className}`;

      if (!this._classObservers[observerName]) {
        this._classObservers[observerName] = new MutationObserver(mutations => Array.from(mutations).map(mutation => this._toggleElementPushdown(mutation.target, property, mutation.target.classList.contains(className), {
          bypassTransition: true
        })));
      }

      if (toPush) {
        if (el) {
          this._classObservers[observerName].observe(el, {
            attributes: true,
            attributeFilter: ['class']
          });
        }
      } else {
        this._classObservers[observerName].disconnect();

        this._toggleElementPushdown(el, property, false, {
          forceTransition: true
        });
      }
    };
  }

  _adjustWidth(width) {
    if (this._toAdjustWidth()) {
      this._applyCss({
        width: `${width}px`
      });
    }
  }

  _adjustHeightWithDelay(delay) {
    clearTimeout(this._adjustHeightTimeout);

    if (this._toAdjustHeight()) {
      // timeout is needed to respect animation adapting
      this._adjustHeightTimeout = setTimeout(() => {
        // user could be fast enough to change state again
        if (!this._toAdjustHeight()) {
          return;
        }

        messenger.publish('Popup:getHeight', null, height => this._applyCss({
          height: `${height}px`
        }));
      }, delay);
    }
  }

  _toAdjustWidth() {
    return ['bar'].includes(this._currentState);
  }

  _toAdjustHeight() {
    return false;
  }

  _changeRouteOrPass(route, delay, lazyCondition) {
    return setTimeout(() => {
      const toChangeRoute = lazyCondition == null || typeof lazyCondition === 'function' && lazyCondition();

      if (toChangeRoute) {
        messenger.publish('router:navigateTo', {
          route
        });
      }
    }, delay);
  }

  _minimizeOrPass() {
    if (this._currentState !== 'bar') {
      return;
    }

    this._changeRouteOrPass('minimized', this.delays.toMinimized, () => !this._isMouseIn && this._currentState === 'bar');
  }

}

IframeTop.initClass();
module.exports = IframeTop;

},{"config":73,"content/Iframes/base/Iframe":75,"content/messagingInterface":78,"core-js/modules/es6.array.iterator.js":60,"core-js/modules/web.dom.iterable.js":61,"screenfull":70}],77:[function(require,module,exports){
"use strict";

const {
  EventEmitter
} = require('events');

const safetyInit = require('content/safetyInit');

const offersInit = require('content/offersInit');

const Iframe = require('content/Iframes/Iframe');

const IframeExternal = require('content/Iframes/base/Iframe');

const extensionAccessor = require('browser_accessors/extensionAccessor');

const screenfull = require('screenfull');

require('content/search/search');

const messenger = require('messenger/Content').getInstance();

const events = new EventEmitter();

require('content/pushstate_handler')(() => messenger.publish('fragmentUpdated'));

let iframeIncluded = false;

const includeIframe = () => {
  if (iframeIncluded) {
    return;
  }

  iframeIncluded = true;
  const cacheBuster = Date.now();
  const iframe = new Iframe(extensionAccessor.getURL(`html/top.html?${cacheBuster}#minimized`));
  messenger.subscribe('checkIframe', (req, res) => {
    // It is possible to embed ABS iframe in any page, so, to avoid clickjacking, remove any
    // embedded ABS iframe that is not the main ABS iframe
    const docIframes = document.querySelectorAll('iframe');

    if (docIframes.length === 1 && docIframes[0] === iframe.el) {
      return res();
    }

    Array.prototype.forEach.call(docIframes, node => {
      if (node !== iframe.el && node.src && node.src.indexOf(extensionAccessor.getURL('html/top.html')) === 0) {
        node.parentNode.removeChild(node);
      }
    });
    return res();
  });
  iframe.createEl();
  iframe.preventMutations();
  iframe.attach();
  iframe.subscribe();
  messenger.publish('updateIframe', {
    url: iframe.url,
    id: iframe.id
  });
  /* eslint-disable-next-line no-return-assign */

  const toggleIframe = toShow => iframe.el.style.display = toShow ? 'block' : 'none'; // http://davidwalsh.name/fullscreen
  // https://github.com/sindresorhus/screenfull.js


  if (screenfull.enabled) {
    document.addEventListener(screenfull.raw.fullscreenchange, () => toggleIframe(!screenfull.isFullscreen));
  }

  messenger.subscribe('Iframe:showShadow', cssProperty => {
    iframe._applyCssProperty(cssProperty.property, cssProperty.value);
  });
  const isIFrameInserted = document.contains(iframe.el);

  const trackIFrameRemoving = () => {
    if (!document.contains(iframe.el)) {
      events.emit('iframe:removed', {
        isIFrameInserted
      });
    }
  };

  setTimeout(trackIFrameRemoving, 2000);
  messenger.subscribe('Background:closed', () => iframe.remove());
};
/**
 * @type {IframeExternal | null}
 */


let iframeExternal = null;

const removeExternalIframe = () => {
  if (iframeExternal != null) {
    iframeExternal.remove();
  }

  events.emit('iframe-external:removed');
  iframeExternal = null;
};

const includeExternalIframe = data => {
  var _iframeExternal$el;

  if (iframeExternal) {
    return;
  }

  const cacheBuster = Date.now();
  const iframeUrl = extensionAccessor.getURL(`html/external.html?${cacheBuster}`);
  const iframeId = 'abs-iframe-external';
  iframeExternal = new IframeExternal(iframeUrl, iframeId, data.render && data.render.external_container, data.render && data.render.external_css);
  iframeExternal.createEl();
  iframeExternal.attach();
  messenger.publish('updateIframe', {
    url: iframeUrl,
    id: iframeId
  });
  events.emit('iframe-external:inclueded');
  (_iframeExternal$el = iframeExternal.el) === null || _iframeExternal$el === void 0 ? void 0 : _iframeExternal$el.addEventListener('load', () => {
    events.emit('iframe-external:loaded');
  });
};

events.on('iframe:include', includeIframe);
events.on('iframe-external:include', includeExternalIframe);
events.on('iframe-external:remove', removeExternalIframe);
messenger.subscribe('Background:closed', removeExternalIframe);
messenger.subscribe('Iframe:close', () => {
  if (iframeExternal) {
    removeExternalIframe();
  }
});
messenger.subscribe('Iframe:redimension', dimensions => {
  if (iframeExternal) {
    iframeExternal._applyCss(dimensions);
  }
});
safetyInit({
  events
});
offersInit({
  events
});

},{"browser_accessors/extensionAccessor":2,"content/Iframes/Iframe":74,"content/Iframes/base/Iframe":75,"content/offersInit":4,"content/pushstate_handler":79,"content/safetyInit":80,"content/search/search":90,"events":62,"messenger/Content":63,"screenfull":70}],78:[function(require,module,exports){
"use strict";

const ContentMessenger = require('messenger/Content');

const contentMessenger = ContentMessenger.getInstance();
module.exports = contentMessenger;

},{"messenger/Content":63}],79:[function(require,module,exports){
"use strict";

// an empty function, for the sake of compatibility with Firefox
module.exports = () => {};

},{}],80:[function(require,module,exports){
"use strict";

module.exports = function init() {};

},{}],81:[function(require,module,exports){
"use strict";

const Mustache = require('mustache');

const template = require('annotation.mustache');

const ANNOTATION_BLOCK_CLASS = '__avira__search_block';
const TT_OPEN_STATE_CLASS = '__avira__show_tooltip';
const TT_CLOSE_ICON_CLASS = '__avira__safetip-close';
const TT_DANGER_CLASS = '__avira__info-danger';
const TT_WARNING_CLASS = '__avira__info-warning';

class Annotator {
  constructor() {
    document.body.addEventListener('click', this.closeOpenTooltips, false);
  }

  annotateResult(result) {
    const parent = result.link.parentNode;
    let info = parent.getElementsByClassName(ANNOTATION_BLOCK_CLASS)[0];

    if (!info) {
      info = document.createElement('div');
      info.classList.add(ANNOTATION_BLOCK_CLASS);
      info.addEventListener('click', event => {
        event.stopImmediatePropagation();
        const classes = event.currentTarget.classList;

        if (classes.contains(ANNOTATION_BLOCK_CLASS)) {
          if (!classes.contains(TT_OPEN_STATE_CLASS)) {
            this.closeOpenTooltips();
            classes.toggle(TT_OPEN_STATE_CLASS);
          }
        }

        if (event.target.classList.contains(TT_CLOSE_ICON_CLASS)) {
          this.closeOpenTooltips();
        }
      }, false);
      parent.insertBefore(info, parent.childNodes[0]);
      parent.style.position = 'relative';
    }

    if (result.category.unsafe) {
      info.classList.add(TT_DANGER_CLASS);
    }

    if (result.category.isWarning) {
      info.classList.add(TT_WARNING_CLASS);
    }

    info.innerHTML = Mustache.render(template, result.category);
  }

  closeOpenTooltips() {
    const openedTooltips = document.getElementsByClassName(TT_OPEN_STATE_CLASS);
    Array.prototype.forEach.call(openedTooltips, el => el.classList.remove(TT_OPEN_STATE_CLASS));
  }

  static isSearchBlock(className) {
    return className.indexOf('__avira__') === 0;
  }

}

module.exports = Annotator;

},{"annotation.mustache":72,"mustache":"mustache"}],82:[function(require,module,exports){
"use strict";

class Result {
  constructor(element, link, url) {
    this.element = element;
    this.link = link;
    this.url = url;
    this.classified = false;
    this.category = 1;
  }

  setCategory(val) {
    this.category = val;
    this.classified = true;
  }

}

module.exports = Result;

},{}],83:[function(require,module,exports){
"use strict";

const SearchEngine = require('content/search/engines/SearchEngine');

class Ask extends SearchEngine {
  static matches(url) {
    return /^https?:\/\/([\w-]+\.)*ask\.com\//.test(url);
  }

  constructor() {
    super();
    this._resultSelector = '.PartialSearchResults-item';
    this._linkSelector = 'a.PartialSearchResults-item-title-link';
  }

}

module.exports = Ask;

},{"content/search/engines/SearchEngine":87}],84:[function(require,module,exports){
"use strict";

const SearchEngine = require('content/search/engines/SearchEngine');

class Bing extends SearchEngine {
  static matches(url) {
    return /^https?:\/\/([\w-]+\.)*bing\.com\//.test(url);
  }

  constructor() {
    super();
    this._resultSelector = '.b_algo, .b_ad li';
    this._linkSelector = 'h2 a';
    this._observerTargetSelector = '#b_content';
  }

  _getSearchResultUrl(element, link) {
    if (element.classList.contains('b_algo')) {
      return super._getSearchResultUrl(element, link);
    }

    return this._getBingAdDestination(link);
  }

}

module.exports = Bing;

},{"content/search/engines/SearchEngine":87}],85:[function(require,module,exports){
"use strict";

const SearchEngine = require('content/search/engines/SearchEngine');

class DuckDuckGo extends SearchEngine {
  static matches(url) {
    return /^https?:\/\/([\w-]+\.)*duckduckgo\.com\//.test(url);
  }

  constructor() {
    super();
    this._resultSelector = '#links .result';
    this._linkSelector = 'h2 a.result__a';
    this._observerTargetSelector = '#links';
  }

}

module.exports = DuckDuckGo;

},{"content/search/engines/SearchEngine":87}],86:[function(require,module,exports){
"use strict";

const SearchEngine = require('content/search/engines/SearchEngine');

class Google extends SearchEngine {
  static matches(url) {
    return /^https?:\/\/(www\.)?google\.(((com|co)\.[a-z]{2})|[a-z]{2,3})\//.test(url);
  }

  constructor() {
    super();
    this._resultSelector = '#rso .g, #taw [data-hveid], #bottomads [data-hveid]';
    this._linkSelector = '.rc > div > a, div > div > a[data-click]';
    this._observerTargetSelector = '#main';
  }

}

module.exports = Google;

},{"content/search/engines/SearchEngine":87}],87:[function(require,module,exports){
"use strict";

const Result = require('content/search/Result');

const Annotator = require('content/search/Annotator');

const messenger = require('messenger/Content').getInstance();

class SearchEngine {
  static matches() {
    return false;
  }

  constructor() {
    this._resultSelector = null;
    this._linkSelector = null;
    this._observerTargetSelector = null;
    this._results = [];
    this._observer = null;
    this._ignoreMutationsInterval = 200;
    this._annotator = new Annotator();
  }

  initialize() {
    if (document.readyState !== 'complete' && document.readyState !== 'interactive') {
      document.addEventListener('DOMContentLoaded', this.initialize.bind(this));
      return;
    }

    this._processPage();

    this._initalizeObserver();

    window.addEventListener('hashchange', () => {
      this._processPage();

      this._initalizeObserver();
    });
  }

  _processPage() {
    this._results = this._getResults();

    this._classifyResults(this._results).then(this._annotateResults.bind(this));
  }

  _getResults() {
    return this._getSearchResults();
  }

  _getSearchResults() {
    const results = [];
    document.querySelectorAll(this._resultSelector).forEach(element => {
      try {
        results.push(this._getSearchResultFromCache(element) || this._getSearchResult(element));
      } catch (e) {// Skip elements that can't be processed
      }
    });
    return results;
  }

  _getSearchResultFromCache(element) {
    return this._results.find(result => result.element === element);
  }

  _getSearchResult(element) {
    const link = element.querySelector(this._linkSelector);

    const url = this._getSearchResultUrl(element, link);

    return new Result(element, link, url);
  }

  _getSearchResultUrl(element, link) {
    return link.href;
  }

  _getBingAdDestination(link) {
    let url = new URL(link.href).searchParams.get('u');

    if (!/^https?:\/\//.test(url)) {
      url = `http://${url}`;
    }

    new URL(url); // just to make sure it is a parsable URL if not it will be skipped

    return url;
  }

  _classifyResults(results) {
    return new Promise(resolve => {
      const unclassified = results.filter(result => !result.classified);

      if (unclassified.length === 0) {
        resolve(results);
        return;
      }

      const urls = results.map(result => result.url);
      messenger.publish('classifyUrls', {
        urls
      }, response => {
        unclassified.forEach((result, i) => {
          result.setCategory(response[i]);
        });
        resolve(results);
      });
    });
  }

  _annotateResults(results) {
    results.forEach(result => this._annotator.annotateResult(result));
  }

  _initalizeObserver() {
    if (!this._observerTargetSelector) return;
    if (this._observer) this._observer.disconnect();
    const target = document.querySelector(this._observerTargetSelector);
    if (!target) return;
    let ignoreMutations = false;
    this._observer = new MutationObserver(mutations => {
      if (ignoreMutations) return;
      const resultsChanged = mutations.some(mutation => mutation.type === 'childList' && !this._isAnnotationMutation(mutation));

      if (resultsChanged) {
        ignoreMutations = true;
        setTimeout(() => {
          ignoreMutations = false;

          this._processPage();
        }, this._ignoreMutationsInterval);
      }
    });

    this._observer.observe(target, {
      childList: true,
      subtree: true
    });
  }

  _isAnnotationMutation(mutation) {
    try {
      return Annotator.isSearchBlock(mutation.addedNodes[0].className);
    } catch (e) {
      return false;
    }
  }

}

module.exports = SearchEngine;

},{"content/search/Annotator":81,"content/search/Result":82,"messenger/Content":63}],88:[function(require,module,exports){
"use strict";

const SearchEngine = require('content/search/engines/SearchEngine');

class WebDe extends SearchEngine {
  static matches(url) {
    return /^https?:\/\/suche\.web\.de\//.test(url);
  }

  constructor() {
    super();
    this._resultSelector = '.pos-web-result-list .pos-web-result-list__item';
    this._linkSelector = 'a';
    this._observerTargetSelector = 'body';
  }

}

module.exports = WebDe;

},{"content/search/engines/SearchEngine":87}],89:[function(require,module,exports){
"use strict";

const SearchEngine = require('content/search/engines/SearchEngine');

class Yahoo extends SearchEngine {
  static matches(url) {
    return /^https?:\/\/([\w-]+\.)*yahoo\.com\//.test(url);
  }

  constructor() {
    super();
    this._resultSelector = '#main li, #right li';
    this._linkSelector = 'h3 a';
    this._observerTargetSelector = '#web';
  }

  _getSearchResultUrl(element, link) {
    if (link.classList.contains('td-u')) {
      return super._getSearchResultUrl(element, link);
    }

    return this._getBingAdDestination(link);
  }

}

module.exports = Yahoo;

},{"content/search/engines/SearchEngine":87}],90:[function(require,module,exports){
"use strict";

/* eslint global-require: off */
const searchEngines = [require('content/search/engines/Ask'), require('content/search/engines/Bing'), require('content/search/engines/DuckDuckGo'), require('content/search/engines/Google'), require('content/search/engines/Yahoo'), require('content/search/engines/WebDe')];
let searchEngine = null;
searchEngines.forEach(Engine => {
  if (Engine.matches(window.location.href)) {
    searchEngine = new Engine();
    searchEngine.initialize();
  }
});

},{"content/search/engines/Ask":83,"content/search/engines/Bing":84,"content/search/engines/DuckDuckGo":85,"content/search/engines/Google":86,"content/search/engines/WebDe":88,"content/search/engines/Yahoo":89}],91:[function(require,module,exports){
"use strict";

/* eslint no-restricted-globals: 0 */

/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const ms = require('ms');

const messenger = require('content/messagingInterface');

const Scraper = require('modules/offers/content/Scraper');

class Offers {
  constructor() {
    this._onScrapingLoaded = this._onScrapingLoaded.bind(this);
  }

  static initClass() {
    this.prototype._LOCATION_CHECK_INTERVAL = ms('0.5s');
    this.prototype._DELAY_BEFORE_RECHECK = ms('2s');
    this.prototype._JS_SCRIPT_ID = 'avira-offers-js-expressions';
  }

  start() {
    return messenger.publish('AO:contentReady', {
      url: location.href
    }, this._onScrapingLoaded);
  }

  _onScrapingLoaded(data) {
    if (data) {
      this._scrapePage(data);

      if (data.rescrape) {
        this._addLocationListener(() => this._scrapePage(data));
      }
    }
  }

  _addLocationListener(callback) {
    let prevLocation = location.toString(); //

    const checkLocation = () => {
      if (location.toString() !== prevLocation) {
        prevLocation = location.toString();
        setTimeout(callback, this._DELAY_BEFORE_RECHECK);
      }
    };

    setInterval(checkLocation, this._LOCATION_CHECK_INTERVAL);
  }

  _scrapePage(data) {
    const scraper = new Scraper(document, data);
    const scrapingResultData = {
      url: location.href,
      data: null,
      js_data: scraper.scrapeJS(),
      xpath_data: scraper.scrapeXPath()
    };
    let previousDataJSON = null; // csl is async

    const onError = () => {
      // data might be set, if the page has changed and csl has a refresh timer set
      scrapingResultData.data = null;
      messenger.publish('AO:pageScraped', scrapingResultData);
    };

    const onSuccess = cslData => {
      // This should not be necessary but there have been reports that multiple calls are being made
      // with the same data, this might stop it from being send to the backend
      const dataJSON = JSON.stringify(cslData);

      if (previousDataJSON === null || dataJSON !== previousDataJSON) {
        previousDataJSON = dataJSON;
        scrapingResultData.data = cslData;
        messenger.publish('AO:pageScraped', scrapingResultData);
      }
    };

    scraper.scrapeCSL(onSuccess, onError);
  }

  _isEmptyObject(obj) {
    return !obj || Object.keys(obj).length === 0;
  }

}

Offers.initClass();
module.exports = Offers;

},{"content/messagingInterface":78,"modules/offers/content/Scraper":92,"ms":69}],92:[function(require,module,exports){
"use strict";

require("core-js/modules/es6.array.iterator.js");

require("core-js/modules/web.dom.iterable.js");

/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const ciuvoSDK = require('ciuvo/ciuvo-addon-sdk.min');

class Scraper {
  constructor(document, data) {
    this.document = document;

    if (data == null) {
      data = {};
    } // eslint-disable-line no-param-reassign


    this.xpath = data.xpath_expressions;
    this.js_expressions = data.js_expressions;
    this.csl = data.csl;
    this.xpath_required = data.xpath_required != null ? data.xpath_required : [];
    this.js_required = data.js_required != null ? data.js_required : [];
  }

  _parseXPathResult(result) {
    // eslint-disable-line complexity
    let value = null;

    if (result.resultType === 1) {
      value = result.numberValue.toString();
    } else if (result.resultType === 2) {
      value = result.stringValue;
    } else if (result.resultType === 3) {
      value = result.booleanValue.toString();
    } else {
      const currentNode = result.iterateNext();

      if (!currentNode) {
        return false;
      }

      if (currentNode.textContent) {
        value = currentNode.textContent;
      } else if (currentNode.innerText) {
        value = currentNode.innerText;
      } else if (currentNode.value) {
        ({
          value
        } = currentNode);
      } else if (currentNode.text) {
        value = currentNode.text;
      } else {
        return null;
      }
    }

    return value;
  }

  scrapeXPath() {
    if (!this.xpath) {
      return null;
    }

    const result = {};

    try {
      Object.entries(this.xpath).forEach(([key, xpath]) => {
        const xpathResult = this.document.evaluate(xpath, this.document, null, XPathResult.ANY_TYPE, null);
        result[key] = this._parseXPathResult(xpathResult);
      });
    } catch (e) {
      return null;
    }

    if (this._containsKeys(result, this.xpath_required)) {
      return result;
    }

    return null;
  }

  scrapeCSL(success, error) {
    try {
      // If the scraping logic contains a call to the refresh function, the success and
      // error callback might be called multiple times. This happens whenever the scraping
      // returns a different result than the previous one.
      const interpreter = new ciuvoSDK.Interpreter(window, success, error);
      return interpreter.interpret(this.csl);
    } catch (e) {
      return error(e);
    }
  }

  scrapeJS() {
    if (!this.js_expressions) {
      return null;
    }

    const script = this.document.createElement('script');
    const container = this.document.head || this.document.body;
    const id = `offers-${(0 | Math.random() * 9e6).toString(36)}`; // eslint-disable-line no-bitwise

    script.setAttribute('id', id);

    const scriptContent = this._generateScriptContent(this.js_expressions, id);

    const scriptContentNode = this.document.createTextNode(scriptContent);
    script.appendChild(scriptContentNode);
    container.appendChild(script);
    const resultJSON = script.getAttribute('result');
    container.removeChild(script);
    const result = JSON.parse(resultJSON);

    if (this._containsKeys(result, this.js_required)) {
      return result;
    }

    return null;
  }

  _containsKeys(objToInspect, requiredFields) {
    for (const key of Array.from(requiredFields)) {
      if (!objToInspect[key]) {
        return false;
      }
    }

    return true;
  } // phantomJS and IE do not have document.currentScript


  _generateScriptContent(expressions, id) {
    let script = `\
(function() {
   var result = {};\
`;
    Object.entries(expressions).forEach(([key, exp]) => {
      script += `\
try {
result["${key}"] = ${exp};
} catch (e) {
}\
`;
    });
    script += `\
  try {
    document.querySelector("#${id}").setAttribute('result', JSON.stringify(result));
  } catch (e) {
  }
})();\
`;
    return script;
  }

}

module.exports = Scraper;

},{"ciuvo/ciuvo-addon-sdk.min":14,"core-js/modules/es6.array.iterator.js":60,"core-js/modules/web.dom.iterable.js":61}]},{},[77]);
