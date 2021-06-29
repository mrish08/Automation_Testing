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

const config = require('config');

const localStorage = require('background/localStorage').getInstance();

const INSTALLATION_SOURCE = 'installationSource';
module.exports = {
  isBeta() {
    return Boolean(config.beta && chrome.runtime.id === config.beta.gc_id);
  },

  isNightly() {
    return Boolean(config.nightly && chrome.runtime.id === config.nightly.gc_id);
  },

  isWebExt() {
    return false;
  },

  getProduct() {
    return 'Browser Safety';
  },

  getInstallationSource() {
    const cached = localStorage.getItem(INSTALLATION_SOURCE);

    if (cached) {
      return Promise.resolve(cached);
    }

    return new Promise(resolve => {
      chrome.management.getSelf(ext => {
        const {
          NORMAL,
          SIDELOAD
        } = chrome.management.ExtensionInstallType;

        if (ext.installType === SIDELOAD) {
          resolve('Connect Client');
        } else if (ext.installType === NORMAL) {
          this._getInstallationSourceFromActiveTab().then(resolve);
        } else {
          resolve('Other');
        }
      });
    }).then(source => {
      localStorage.setItem(INSTALLATION_SOURCE, source);
      return source;
    });
  },

  _getInstallationSourceFromActiveTab() {
    return new Promise(resolve => {
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, tabs => {
        const url = tabs && tabs[0] && tabs[0].url || '';

        if (url.indexOf('https://chrome.google.com/webstore/') === 0) {
          resolve('Chrome Store');
        } else if (/^https?:\/\/www.avira.com\/.*\/avira-(browser-safety|safe-shopping)/.test(url)) {
          resolve('Product Page');
        } else if (/https?:\/\/my.avira.com/.test(url)) {
          resolve('Connect Dashboard');
        } else {
          resolve('Other');
        }
      });
    });
  }

};

},{"background/localStorage":2,"config":188}],2:[function(require,module,exports){
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

},{"core-js/modules/es6.array.iterator.js":124,"core-js/modules/web.dom.iterable.js":126}],3:[function(require,module,exports){
"use strict";

const customLocalStorage = require('background/localStorage').getInstance(); // Prevents "mixpanel_install" from being removed because we use it
// to check if localStorage was in some way lost (see bg/base/Mixpanel)


const deleteExceptions = ['mixpanel_install'];
const MIGRATION_KEY = 'storageMigrated';
module.exports = {
  run() {
    try {
      // migrate from native localStorage to the chrome.storage.local
      if (localStorage.length > 0 && !customLocalStorage.getItem(MIGRATION_KEY)) {
        const l = localStorage.length;

        for (let i = l - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          customLocalStorage.setItem(key, localStorage.getItem(key));

          if (deleteExceptions.indexOf(key) === -1) {
            localStorage.removeItem(key);
          }
        }

        customLocalStorage.setItem(MIGRATION_KEY, true);
      }
    } catch (error) {} // eslint-disable-line no-empty

  }

};

},{"background/localStorage":2}],4:[function(require,module,exports){
"use strict";

const messenger = require('messenger/Background').getInstance();

class TabAccessor {
  constructor() {
    this._onTabCreated = this._onTabCreated.bind(this);
    this._onTabReplaced = this._onTabReplaced.bind(this);
    this._onTabRemoved = this._onTabRemoved.bind(this);
    this._onTabActivated = this._onTabActivated.bind(this);
    this._incognitoTabs = {};

    this._checkOpenTabs();

    chrome.tabs.onCreated.addListener(this._onTabCreated);
    chrome.tabs.onReplaced.addListener(this._onTabReplaced);
    chrome.tabs.onRemoved.addListener(this._onTabRemoved);
    chrome.tabs.onUpdated.addListener(this._onTabUpdated);
    chrome.tabs.onActivated.addListener(this._onTabActivated);
  }

  getCurrentTabId(callback) {
    return this._getCurrentTab(tab => callback(tab != null ? tab.id : undefined));
  }

  getCurrentTabUrl(callback) {
    return this._getCurrentTab(tab => callback(tab != null ? tab.url : undefined));
  }

  navigate(url, asSeparate, tabId, callback) {
    if (asSeparate == null) {
      asSeparate = false; // eslint-disable-line no-param-reassign
    }

    if (url == null) {
      url = 'chrome://newtab/#noredirect'; // eslint-disable-line no-param-reassign
    }

    if (!asSeparate) {
      return chrome.tabs.update(tabId, {
        url
      });
    }

    return chrome.windows.getCurrent(null, window => chrome.tabs.create({
      windowId: window.id,
      url
    }, tab => {
      if (callback) {
        callback(tab.id);
      }
    }));
  }

  close(tabId) {
    return chrome.tabs.remove(tabId);
  }

  reload(tabId) {
    return chrome.tabs.reload(tabId);
  }

  _getCurrentTab(callback) {
    return chrome.tabs.query({
      currentWindow: true,
      active: true
    }, tabs => // might be undefined if developer
    // tools have focus
    callback(tabs[0]));
  }

  _getTabById(tabId, callback) {
    return chrome.tabs.get(tabId, callback);
  }

  isIncognitoTab(tabId) {
    // Sometimes tabs can be created before the extension is loaded.
    // These should be treated as incognito tabs
    return this._incognitoTabs[tabId] !== false;
  }

  _checkOpenTabs() {
    return chrome.tabs.query({}, tabs => tabs.forEach(this._onTabCreated));
  }

  _onTabCreated(tab) {
    this._incognitoTabs[tab.id] = tab.incognito && tab.id > 0;
    return this._incognitoTabs[tab.id];
  }

  _onTabReplaced(addedTabId, removedTabId) {
    this._incognitoTabs[addedTabId] = this._incognitoTabs[removedTabId];
    return delete this._incognitoTabs[removedTabId];
  }

  _onTabRemoved(tabId) {
    return delete this._incognitoTabs[tabId];
  }

  _onTabUpdated(tabId, changeInfo, tab) {
    return messenger.publish('tabAccessor:updated', {
      tab
    });
  }

  _onTabActivated(activeInfo) {
    return this._getTabById(activeInfo.tabId, tab => {
      if (!chrome.runtime.lastError && tab) {
        messenger.publish('tabAccessor:select', {
          tab
        });
      }
    });
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new this();
    }

    return this.instance;
  }

}

module.exports = TabAccessor;

},{"messenger/Background":127}],5:[function(require,module,exports){
"use strict";

module.exports = {
  get(url, name, callback) {
    return chrome.cookies.get({
      url,
      name
    }, callback);
  },

  remove(url, name, callback) {
    return chrome.cookies.remove({
      url,
      name
    }, callback);
  }

};

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
"use strict";

const offersSupport = require('background/offersSupport');

const Offers = require('modules/offers/background/Offers');

const config = require('config');

const ErrorCollector = require('background/ErrorCollector');

const backgroundMessenger = require('messenger/Background').getInstance();
/**
 * @type import('background/offersInit');
 */


module.exports = function init({
  aims,
  distributionPartner,
  mixpanel
}) {
  return new Promise(resolve => {
    const errorCollector = new ErrorCollector(mixpanel);
    let offers = null;
    distributionPartner.getPartnerId(partnerId => {
      const supported = offersSupport.isSupported();
      backgroundMessenger.subscribe('offersSupported', (msg, response) => {
        response(supported);
      });

      if (supported) {
        offers = new Offers(config.ao.api_url, config.ao.api_client, config.ao.api_key, aims.getUserId(), partnerId, errorCollector);
        offers.init();
      }

      resolve(undefined);
    });
  });
};

},{"background/ErrorCollector":173,"background/offersSupport":184,"config":188,"messenger/Background":127,"modules/offers/background/Offers":189}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
"use strict";

const _ = require('underscore');

const appInfo = require('background/base/appInfo');

module.exports = _.extend(appInfo, {
  getProduct() {
    return 'Safe Shopping';
  }

});

},{"background/base/appInfo":1,"underscore":156}],10:[function(require,module,exports){
"use strict";

// Disable ExtensionOnboarding for Safe Shopping Chrome
module.exports = class ExtensionOnboarding {
  initialize() {}

};

},{}],11:[function(require,module,exports){
"use strict";

const config = require('config');

const NewInstallCheck = require('background/NewInstallCheck');

const jsonStorage = require('background/jsonStorage');

const ogOffersInit = require('../../../offers/js/background/offersInit');

const SAFE_SHOPPING_OFFERS_MIGRATION_KEY = 'SAFE_SHOPPING_OFFERS_MIGRATION';
/**
 * @type import('background/offersInit');
 */

module.exports = async function init(initConfig) {
  await ogOffersInit(initConfig);
  const wasMigrated = jsonStorage.getItem(SAFE_SHOPPING_OFFERS_MIGRATION_KEY);
  const isUpdated = NewInstallCheck.isUpdated(initConfig.installReason);
  const isNewInstall = NewInstallCheck.isNewInstall(initConfig.installReason);

  if (isNewInstall) {
    jsonStorage.setItem(SAFE_SHOPPING_OFFERS_MIGRATION_KEY, true);
  } else if (!wasMigrated && isUpdated) {
    chrome.tabs.create({
      url: `${config.extensionOnboarding.onboardingWebsite}/get-abs`
    });
    jsonStorage.setItem(SAFE_SHOPPING_OFFERS_MIGRATION_KEY, true);
  }
};

},{"../../../offers/js/background/offersInit":7,"background/NewInstallCheck":177,"background/jsonStorage":183,"config":188}],12:[function(require,module,exports){
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

module.exports = _assertThisInitialized;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],13:[function(require,module,exports){
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],14:[function(require,module,exports){
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
},{}],15:[function(require,module,exports){
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

module.exports = _defineProperty;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],16:[function(require,module,exports){
function _getPrototypeOf(o) {
  module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  module.exports["default"] = module.exports, module.exports.__esModule = true;
  return _getPrototypeOf(o);
}

module.exports = _getPrototypeOf;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],17:[function(require,module,exports){
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
},{"./setPrototypeOf.js":20}],18:[function(require,module,exports){
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],19:[function(require,module,exports){
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
},{"./assertThisInitialized.js":12,"@babel/runtime/helpers/typeof":21}],20:[function(require,module,exports){
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
},{}],21:[function(require,module,exports){
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
},{}],22:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var core_1 = require("@sentry/core");
var types_1 = require("@sentry/types");
var utils_1 = require("@sentry/utils");
var eventbuilder_1 = require("./eventbuilder");
var transports_1 = require("./transports");
/**
 * The Sentry Browser SDK Backend.
 * @hidden
 */
var BrowserBackend = /** @class */ (function (_super) {
    tslib_1.__extends(BrowserBackend, _super);
    function BrowserBackend() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @inheritDoc
     */
    BrowserBackend.prototype._setupTransport = function () {
        if (!this._options.dsn) {
            // We return the noop transport here in case there is no Dsn.
            return _super.prototype._setupTransport.call(this);
        }
        var transportOptions = tslib_1.__assign({}, this._options.transportOptions, { dsn: this._options.dsn });
        if (this._options.transport) {
            return new this._options.transport(transportOptions);
        }
        if (utils_1.supportsFetch()) {
            return new transports_1.FetchTransport(transportOptions);
        }
        return new transports_1.XHRTransport(transportOptions);
    };
    /**
     * @inheritDoc
     */
    BrowserBackend.prototype.eventFromException = function (exception, hint) {
        var syntheticException = (hint && hint.syntheticException) || undefined;
        var event = eventbuilder_1.eventFromUnknownInput(exception, syntheticException, {
            attachStacktrace: this._options.attachStacktrace,
        });
        utils_1.addExceptionMechanism(event, {
            handled: true,
            type: 'generic',
        });
        event.level = types_1.Severity.Error;
        if (hint && hint.event_id) {
            event.event_id = hint.event_id;
        }
        return utils_1.SyncPromise.resolve(event);
    };
    /**
     * @inheritDoc
     */
    BrowserBackend.prototype.eventFromMessage = function (message, level, hint) {
        if (level === void 0) { level = types_1.Severity.Info; }
        var syntheticException = (hint && hint.syntheticException) || undefined;
        var event = eventbuilder_1.eventFromString(message, syntheticException, {
            attachStacktrace: this._options.attachStacktrace,
        });
        event.level = level;
        if (hint && hint.event_id) {
            event.event_id = hint.event_id;
        }
        return utils_1.SyncPromise.resolve(event);
    };
    return BrowserBackend;
}(core_1.BaseBackend));
exports.BrowserBackend = BrowserBackend;

},{"./eventbuilder":24,"./transports":38,"@sentry/core":44,"@sentry/types":55,"@sentry/utils":63,"tslib":154}],23:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var core_1 = require("@sentry/core");
var utils_1 = require("@sentry/utils");
var backend_1 = require("./backend");
var version_1 = require("./version");
/**
 * The Sentry Browser SDK Client.
 *
 * @see BrowserOptions for documentation on configuration options.
 * @see SentryClient for usage documentation.
 */
var BrowserClient = /** @class */ (function (_super) {
    tslib_1.__extends(BrowserClient, _super);
    /**
     * Creates a new Browser SDK instance.
     *
     * @param options Configuration options for this SDK.
     */
    function BrowserClient(options) {
        if (options === void 0) { options = {}; }
        return _super.call(this, backend_1.BrowserBackend, options) || this;
    }
    /**
     * @inheritDoc
     */
    BrowserClient.prototype._prepareEvent = function (event, scope, hint) {
        event.platform = event.platform || 'javascript';
        event.sdk = tslib_1.__assign({}, event.sdk, { name: version_1.SDK_NAME, packages: tslib_1.__spread(((event.sdk && event.sdk.packages) || []), [
                {
                    name: 'npm:@sentry/browser',
                    version: version_1.SDK_VERSION,
                },
            ]), version: version_1.SDK_VERSION });
        return _super.prototype._prepareEvent.call(this, event, scope, hint);
    };
    /**
     * Show a report dialog to the user to send feedback to a specific event.
     *
     * @param options Set individual options for the dialog
     */
    BrowserClient.prototype.showReportDialog = function (options) {
        if (options === void 0) { options = {}; }
        // doesn't work without a document (React Native)
        var document = utils_1.getGlobalObject().document;
        if (!document) {
            return;
        }
        if (!this._isEnabled()) {
            utils_1.logger.error('Trying to call showReportDialog with Sentry Client is disabled');
            return;
        }
        var dsn = options.dsn || this.getDsn();
        if (!options.eventId) {
            utils_1.logger.error('Missing `eventId` option in showReportDialog call');
            return;
        }
        if (!dsn) {
            utils_1.logger.error('Missing `Dsn` option in showReportDialog call');
            return;
        }
        var script = document.createElement('script');
        script.async = true;
        script.src = new core_1.API(dsn).getReportDialogEndpoint(options);
        if (options.onLoad) {
            script.onload = options.onLoad;
        }
        (document.head || document.body).appendChild(script);
    };
    return BrowserClient;
}(core_1.BaseClient));
exports.BrowserClient = BrowserClient;

},{"./backend":22,"./version":40,"@sentry/core":44,"@sentry/utils":63,"tslib":154}],24:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("@sentry/utils");
var parsers_1 = require("./parsers");
var tracekit_1 = require("./tracekit");
/** JSDoc */
function eventFromUnknownInput(exception, syntheticException, options) {
    if (options === void 0) { options = {}; }
    var event;
    if (utils_1.isErrorEvent(exception) && exception.error) {
        // If it is an ErrorEvent with `error` property, extract it to get actual Error
        var errorEvent = exception;
        exception = errorEvent.error; // tslint:disable-line:no-parameter-reassignment
        event = parsers_1.eventFromStacktrace(tracekit_1.computeStackTrace(exception));
        return event;
    }
    if (utils_1.isDOMError(exception) || utils_1.isDOMException(exception)) {
        // If it is a DOMError or DOMException (which are legacy APIs, but still supported in some browsers)
        // then we just extract the name and message, as they don't provide anything else
        // https://developer.mozilla.org/en-US/docs/Web/API/DOMError
        // https://developer.mozilla.org/en-US/docs/Web/API/DOMException
        var domException = exception;
        var name_1 = domException.name || (utils_1.isDOMError(domException) ? 'DOMError' : 'DOMException');
        var message = domException.message ? name_1 + ": " + domException.message : name_1;
        event = eventFromString(message, syntheticException, options);
        utils_1.addExceptionTypeValue(event, message);
        return event;
    }
    if (utils_1.isError(exception)) {
        // we have a real Error object, do nothing
        event = parsers_1.eventFromStacktrace(tracekit_1.computeStackTrace(exception));
        return event;
    }
    if (utils_1.isPlainObject(exception) || utils_1.isEvent(exception)) {
        // If it is plain Object or Event, serialize it manually and extract options
        // This will allow us to group events based on top-level keys
        // which is much better than creating new group when any key/value change
        var objectException = exception;
        event = parsers_1.eventFromPlainObject(objectException, syntheticException, options.rejection);
        utils_1.addExceptionMechanism(event, {
            synthetic: true,
        });
        return event;
    }
    // If none of previous checks were valid, then it means that it's not:
    // - an instance of DOMError
    // - an instance of DOMException
    // - an instance of Event
    // - an instance of Error
    // - a valid ErrorEvent (one with an error property)
    // - a plain Object
    //
    // So bail out and capture it as a simple message:
    event = eventFromString(exception, syntheticException, options);
    utils_1.addExceptionTypeValue(event, "" + exception, undefined);
    utils_1.addExceptionMechanism(event, {
        synthetic: true,
    });
    return event;
}
exports.eventFromUnknownInput = eventFromUnknownInput;
// this._options.attachStacktrace
/** JSDoc */
function eventFromString(input, syntheticException, options) {
    if (options === void 0) { options = {}; }
    var event = {
        message: input,
    };
    if (options.attachStacktrace && syntheticException) {
        var stacktrace = tracekit_1.computeStackTrace(syntheticException);
        var frames_1 = parsers_1.prepareFramesForEvent(stacktrace.stack);
        event.stacktrace = {
            frames: frames_1,
        };
    }
    return event;
}
exports.eventFromString = eventFromString;

},{"./parsers":33,"./tracekit":35,"@sentry/utils":63}],25:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var core_1 = require("@sentry/core");
var utils_1 = require("@sentry/utils");
var ignoreOnError = 0;
/**
 * @hidden
 */
function shouldIgnoreOnError() {
    return ignoreOnError > 0;
}
exports.shouldIgnoreOnError = shouldIgnoreOnError;
/**
 * @hidden
 */
function ignoreNextOnError() {
    // onerror should trigger before setTimeout
    ignoreOnError += 1;
    setTimeout(function () {
        ignoreOnError -= 1;
    });
}
exports.ignoreNextOnError = ignoreNextOnError;
/**
 * Instruments the given function and sends an event to Sentry every time the
 * function throws an exception.
 *
 * @param fn A function to wrap.
 * @returns The wrapped function.
 * @hidden
 */
function wrap(fn, options, before) {
    if (options === void 0) { options = {}; }
    // tslint:disable-next-line:strict-type-predicates
    if (typeof fn !== 'function') {
        return fn;
    }
    try {
        // We don't wanna wrap it twice
        if (fn.__sentry__) {
            return fn;
        }
        // If this has already been wrapped in the past, return that wrapped function
        if (fn.__sentry_wrapped__) {
            return fn.__sentry_wrapped__;
        }
    }
    catch (e) {
        // Just accessing custom props in some Selenium environments
        // can cause a "Permission denied" exception (see raven-js#495).
        // Bail on wrapping and return the function as-is (defers to window.onerror).
        return fn;
    }
    var sentryWrapped = function () {
        var args = Array.prototype.slice.call(arguments);
        // tslint:disable:no-unsafe-any
        try {
            // tslint:disable-next-line:strict-type-predicates
            if (before && typeof before === 'function') {
                before.apply(this, arguments);
            }
            var wrappedArguments = args.map(function (arg) { return wrap(arg, options); });
            if (fn.handleEvent) {
                // Attempt to invoke user-land function
                // NOTE: If you are a Sentry user, and you are seeing this stack frame, it
                //       means the sentry.javascript SDK caught an error invoking your application code. This
                //       is expected behavior and NOT indicative of a bug with sentry.javascript.
                return fn.handleEvent.apply(this, wrappedArguments);
            }
            // Attempt to invoke user-land function
            // NOTE: If you are a Sentry user, and you are seeing this stack frame, it
            //       means the sentry.javascript SDK caught an error invoking your application code. This
            //       is expected behavior and NOT indicative of a bug with sentry.javascript.
            return fn.apply(this, wrappedArguments);
            // tslint:enable:no-unsafe-any
        }
        catch (ex) {
            ignoreNextOnError();
            core_1.withScope(function (scope) {
                scope.addEventProcessor(function (event) {
                    var processedEvent = tslib_1.__assign({}, event);
                    if (options.mechanism) {
                        utils_1.addExceptionTypeValue(processedEvent, undefined, undefined);
                        utils_1.addExceptionMechanism(processedEvent, options.mechanism);
                    }
                    processedEvent.extra = tslib_1.__assign({}, processedEvent.extra, { arguments: utils_1.normalize(args, 3) });
                    return processedEvent;
                });
                core_1.captureException(ex);
            });
            throw ex;
        }
    };
    // Accessing some objects may throw
    // ref: https://github.com/getsentry/sentry-javascript/issues/1168
    try {
        for (var property in fn) {
            if (Object.prototype.hasOwnProperty.call(fn, property)) {
                sentryWrapped[property] = fn[property];
            }
        }
    }
    catch (_oO) { } // tslint:disable-line:no-empty
    fn.prototype = fn.prototype || {};
    sentryWrapped.prototype = fn.prototype;
    Object.defineProperty(fn, '__sentry_wrapped__', {
        enumerable: false,
        value: sentryWrapped,
    });
    // Signal that this function has been wrapped/filled already
    // for both debugging and to prevent it to being wrapped/filled twice
    Object.defineProperties(sentryWrapped, {
        __sentry__: {
            enumerable: false,
            value: true,
        },
        __sentry_original__: {
            enumerable: false,
            value: fn,
        },
    });
    // Restore original function name (not all browsers allow that)
    try {
        var descriptor = Object.getOwnPropertyDescriptor(sentryWrapped, 'name');
        if (descriptor.configurable) {
            Object.defineProperty(sentryWrapped, 'name', {
                get: function () {
                    return fn.name;
                },
            });
        }
    }
    catch (_oO) {
        /*no-empty*/
    }
    return sentryWrapped;
}
exports.wrap = wrap;

},{"@sentry/core":44,"@sentry/utils":63,"tslib":154}],26:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var types_1 = require("@sentry/types");
exports.Severity = types_1.Severity;
exports.Status = types_1.Status;
var core_1 = require("@sentry/core");
exports.addGlobalEventProcessor = core_1.addGlobalEventProcessor;
exports.addBreadcrumb = core_1.addBreadcrumb;
exports.captureException = core_1.captureException;
exports.captureEvent = core_1.captureEvent;
exports.captureMessage = core_1.captureMessage;
exports.configureScope = core_1.configureScope;
exports.getHubFromCarrier = core_1.getHubFromCarrier;
exports.getCurrentHub = core_1.getCurrentHub;
exports.Hub = core_1.Hub;
exports.Scope = core_1.Scope;
exports.setContext = core_1.setContext;
exports.setExtra = core_1.setExtra;
exports.setExtras = core_1.setExtras;
exports.setTag = core_1.setTag;
exports.setTags = core_1.setTags;
exports.setUser = core_1.setUser;
exports.withScope = core_1.withScope;
var client_1 = require("./client");
exports.BrowserClient = client_1.BrowserClient;
var sdk_1 = require("./sdk");
exports.defaultIntegrations = sdk_1.defaultIntegrations;
exports.forceLoad = sdk_1.forceLoad;
exports.init = sdk_1.init;
exports.lastEventId = sdk_1.lastEventId;
exports.onLoad = sdk_1.onLoad;
exports.showReportDialog = sdk_1.showReportDialog;
exports.flush = sdk_1.flush;
exports.close = sdk_1.close;
exports.wrap = sdk_1.wrap;
var version_1 = require("./version");
exports.SDK_NAME = version_1.SDK_NAME;
exports.SDK_VERSION = version_1.SDK_VERSION;
var core_2 = require("@sentry/core");
var utils_1 = require("@sentry/utils");
var BrowserIntegrations = require("./integrations");
var Transports = require("./transports");
exports.Transports = Transports;
var windowIntegrations = {};
// This block is needed to add compatibility with the integrations packages when used with a CDN
// tslint:disable: no-unsafe-any
var _window = utils_1.getGlobalObject();
if (_window.Sentry && _window.Sentry.Integrations) {
    windowIntegrations = _window.Sentry.Integrations;
}
// tslint:enable: no-unsafe-any
var INTEGRATIONS = tslib_1.__assign({}, windowIntegrations, core_2.Integrations, BrowserIntegrations);
exports.Integrations = INTEGRATIONS;

},{"./client":23,"./integrations":29,"./sdk":34,"./transports":38,"./version":40,"@sentry/core":44,"@sentry/types":55,"@sentry/utils":63,"tslib":154}],27:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var core_1 = require("@sentry/core");
var types_1 = require("@sentry/types");
var utils_1 = require("@sentry/utils");
/**
 * Default Breadcrumbs instrumentations
 * TODO: Deprecated - with v6, this will be renamed to `Instrument`
 */
var Breadcrumbs = /** @class */ (function () {
    /**
     * @inheritDoc
     */
    function Breadcrumbs(options) {
        /**
         * @inheritDoc
         */
        this.name = Breadcrumbs.id;
        this._options = tslib_1.__assign({ console: true, dom: true, fetch: true, history: true, sentry: true, xhr: true }, options);
    }
    /**
     * Creates breadcrumbs from console API calls
     */
    Breadcrumbs.prototype._consoleBreadcrumb = function (handlerData) {
        var breadcrumb = {
            category: 'console',
            data: {
                extra: {
                    arguments: utils_1.normalize(handlerData.args, 3),
                },
                logger: 'console',
            },
            level: types_1.Severity.fromString(handlerData.level),
            message: utils_1.safeJoin(handlerData.args, ' '),
        };
        if (handlerData.level === 'assert') {
            if (handlerData.args[0] === false) {
                breadcrumb.message = "Assertion failed: " + (utils_1.safeJoin(handlerData.args.slice(1), ' ') || 'console.assert');
                breadcrumb.data.extra.arguments = utils_1.normalize(handlerData.args.slice(1), 3);
            }
            else {
                // Don't capture a breadcrumb for passed assertions
                return;
            }
        }
        core_1.getCurrentHub().addBreadcrumb(breadcrumb, {
            input: handlerData.args,
            level: handlerData.level,
        });
    };
    /**
     * Creates breadcrumbs from DOM API calls
     */
    Breadcrumbs.prototype._domBreadcrumb = function (handlerData) {
        var target;
        // Accessing event.target can throw (see getsentry/raven-js#838, #768)
        try {
            target = handlerData.event.target
                ? utils_1.htmlTreeAsString(handlerData.event.target)
                : utils_1.htmlTreeAsString(handlerData.event);
        }
        catch (e) {
            target = '<unknown>';
        }
        if (target.length === 0) {
            return;
        }
        core_1.getCurrentHub().addBreadcrumb({
            category: "ui." + handlerData.name,
            message: target,
        }, {
            event: event,
            name: handlerData.name,
        });
    };
    /**
     * Creates breadcrumbs from XHR API calls
     */
    Breadcrumbs.prototype._xhrBreadcrumb = function (handlerData) {
        if (handlerData.endTimestamp) {
            // We only capture complete, non-sentry requests
            if (handlerData.xhr.__sentry_own_request__) {
                return;
            }
            core_1.getCurrentHub().addBreadcrumb({
                category: 'xhr',
                data: handlerData.xhr.__sentry_xhr__,
                type: 'http',
            }, {
                xhr: handlerData.xhr,
            });
            return;
        }
        // We only capture issued sentry requests
        if (handlerData.xhr.__sentry_own_request__) {
            addSentryBreadcrumb(handlerData.args[0]);
        }
    };
    /**
     * Creates breadcrumbs from fetch API calls
     */
    Breadcrumbs.prototype._fetchBreadcrumb = function (handlerData) {
        // We only capture complete fetch requests
        if (!handlerData.endTimestamp) {
            return;
        }
        var client = core_1.getCurrentHub().getClient();
        var dsn = client && client.getDsn();
        if (dsn) {
            var filterUrl = new core_1.API(dsn).getStoreEndpoint();
            // if Sentry key appears in URL, don't capture it as a request
            // but rather as our own 'sentry' type breadcrumb
            if (filterUrl &&
                handlerData.fetchData.url.indexOf(filterUrl) !== -1 &&
                handlerData.fetchData.method === 'POST' &&
                handlerData.args[1] &&
                handlerData.args[1].body) {
                addSentryBreadcrumb(handlerData.args[1].body);
                return;
            }
        }
        if (handlerData.error) {
            core_1.getCurrentHub().addBreadcrumb({
                category: 'fetch',
                data: tslib_1.__assign({}, handlerData.fetchData, { status_code: handlerData.response.status }),
                level: types_1.Severity.Error,
                type: 'http',
            }, {
                data: handlerData.error,
                input: handlerData.args,
            });
        }
        else {
            core_1.getCurrentHub().addBreadcrumb({
                category: 'fetch',
                data: tslib_1.__assign({}, handlerData.fetchData, { status_code: handlerData.response.status }),
                type: 'http',
            }, {
                input: handlerData.args,
                response: handlerData.response,
            });
        }
    };
    /**
     * Creates breadcrumbs from history API calls
     */
    Breadcrumbs.prototype._historyBreadcrumb = function (handlerData) {
        var global = utils_1.getGlobalObject();
        var from = handlerData.from;
        var to = handlerData.to;
        var parsedLoc = utils_1.parseUrl(global.location.href);
        var parsedFrom = utils_1.parseUrl(from);
        var parsedTo = utils_1.parseUrl(to);
        // Initial pushState doesn't provide `from` information
        if (!parsedFrom.path) {
            parsedFrom = parsedLoc;
        }
        // Use only the path component of the URL if the URL matches the current
        // document (almost all the time when using pushState)
        if (parsedLoc.protocol === parsedTo.protocol && parsedLoc.host === parsedTo.host) {
            // tslint:disable-next-line:no-parameter-reassignment
            to = parsedTo.relative;
        }
        if (parsedLoc.protocol === parsedFrom.protocol && parsedLoc.host === parsedFrom.host) {
            // tslint:disable-next-line:no-parameter-reassignment
            from = parsedFrom.relative;
        }
        core_1.getCurrentHub().addBreadcrumb({
            category: 'navigation',
            data: {
                from: from,
                to: to,
            },
        });
    };
    /**
     * Instrument browser built-ins w/ breadcrumb capturing
     *  - Console API
     *  - DOM API (click/typing)
     *  - XMLHttpRequest API
     *  - Fetch API
     *  - History API
     */
    Breadcrumbs.prototype.setupOnce = function () {
        var _this = this;
        if (this._options.console) {
            utils_1.addInstrumentationHandler({
                callback: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    _this._consoleBreadcrumb.apply(_this, tslib_1.__spread(args));
                },
                type: 'console',
            });
        }
        if (this._options.dom) {
            utils_1.addInstrumentationHandler({
                callback: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    _this._domBreadcrumb.apply(_this, tslib_1.__spread(args));
                },
                type: 'dom',
            });
        }
        if (this._options.xhr) {
            utils_1.addInstrumentationHandler({
                callback: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    _this._xhrBreadcrumb.apply(_this, tslib_1.__spread(args));
                },
                type: 'xhr',
            });
        }
        if (this._options.fetch) {
            utils_1.addInstrumentationHandler({
                callback: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    _this._fetchBreadcrumb.apply(_this, tslib_1.__spread(args));
                },
                type: 'fetch',
            });
        }
        if (this._options.history) {
            utils_1.addInstrumentationHandler({
                callback: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    _this._historyBreadcrumb.apply(_this, tslib_1.__spread(args));
                },
                type: 'history',
            });
        }
    };
    /**
     * @inheritDoc
     */
    Breadcrumbs.id = 'Breadcrumbs';
    return Breadcrumbs;
}());
exports.Breadcrumbs = Breadcrumbs;
/**
 * Create a breadcrumb of `sentry` from the events themselves
 */
function addSentryBreadcrumb(serializedData) {
    // There's always something that can go wrong with deserialization...
    try {
        var event_1 = JSON.parse(serializedData);
        core_1.getCurrentHub().addBreadcrumb({
            category: 'sentry',
            event_id: event_1.event_id,
            level: event_1.level || types_1.Severity.fromString('error'),
            message: utils_1.getEventDescription(event_1),
        }, {
            event: event_1,
        });
    }
    catch (_oO) {
        utils_1.logger.error('Error while adding sentry type breadcrumb');
    }
}

},{"@sentry/core":44,"@sentry/types":55,"@sentry/utils":63,"tslib":154}],28:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var core_1 = require("@sentry/core");
var types_1 = require("@sentry/types");
var utils_1 = require("@sentry/utils");
var eventbuilder_1 = require("../eventbuilder");
var helpers_1 = require("../helpers");
/** Global handlers */
var GlobalHandlers = /** @class */ (function () {
    /** JSDoc */
    function GlobalHandlers(options) {
        /**
         * @inheritDoc
         */
        this.name = GlobalHandlers.id;
        /** JSDoc */
        this._global = utils_1.getGlobalObject();
        /** JSDoc */
        this._oldOnErrorHandler = null;
        /** JSDoc */
        this._oldOnUnhandledRejectionHandler = null;
        /** JSDoc */
        this._onErrorHandlerInstalled = false;
        /** JSDoc */
        this._onUnhandledRejectionHandlerInstalled = false;
        this._options = tslib_1.__assign({ onerror: true, onunhandledrejection: true }, options);
    }
    /**
     * @inheritDoc
     */
    GlobalHandlers.prototype.setupOnce = function () {
        Error.stackTraceLimit = 50;
        if (this._options.onerror) {
            utils_1.logger.log('Global Handler attached: onerror');
            this._installGlobalOnErrorHandler();
        }
        if (this._options.onunhandledrejection) {
            utils_1.logger.log('Global Handler attached: onunhandledrejection');
            this._installGlobalOnUnhandledRejectionHandler();
        }
    };
    /** JSDoc */
    GlobalHandlers.prototype._installGlobalOnErrorHandler = function () {
        if (this._onErrorHandlerInstalled) {
            return;
        }
        var self = this; // tslint:disable-line:no-this-assignment
        this._oldOnErrorHandler = this._global.onerror;
        this._global.onerror = function (msg, url, line, column, error) {
            var currentHub = core_1.getCurrentHub();
            var hasIntegration = currentHub.getIntegration(GlobalHandlers);
            var isFailedOwnDelivery = error && error.__sentry_own_request__ === true;
            if (!hasIntegration || helpers_1.shouldIgnoreOnError() || isFailedOwnDelivery) {
                if (self._oldOnErrorHandler) {
                    return self._oldOnErrorHandler.apply(this, arguments);
                }
                return false;
            }
            var client = currentHub.getClient();
            var event = utils_1.isPrimitive(error)
                ? self._eventFromIncompleteOnError(msg, url, line, column)
                : self._enhanceEventWithInitialFrame(eventbuilder_1.eventFromUnknownInput(error, undefined, {
                    attachStacktrace: client && client.getOptions().attachStacktrace,
                    rejection: false,
                }), url, line, column);
            utils_1.addExceptionMechanism(event, {
                handled: false,
                type: 'onerror',
            });
            currentHub.captureEvent(event, {
                originalException: error,
            });
            if (self._oldOnErrorHandler) {
                return self._oldOnErrorHandler.apply(this, arguments);
            }
            return false;
        };
        this._onErrorHandlerInstalled = true;
    };
    /** JSDoc */
    GlobalHandlers.prototype._installGlobalOnUnhandledRejectionHandler = function () {
        if (this._onUnhandledRejectionHandlerInstalled) {
            return;
        }
        var self = this; // tslint:disable-line:no-this-assignment
        this._oldOnUnhandledRejectionHandler = this._global.onunhandledrejection;
        this._global.onunhandledrejection = function (e) {
            var error = e;
            try {
                error = e && 'reason' in e ? e.reason : e;
            }
            catch (_oO) {
                // no-empty
            }
            var currentHub = core_1.getCurrentHub();
            var hasIntegration = currentHub.getIntegration(GlobalHandlers);
            var isFailedOwnDelivery = error && error.__sentry_own_request__ === true;
            if (!hasIntegration || helpers_1.shouldIgnoreOnError() || isFailedOwnDelivery) {
                if (self._oldOnUnhandledRejectionHandler) {
                    return self._oldOnUnhandledRejectionHandler.apply(this, arguments);
                }
                return true;
            }
            var client = currentHub.getClient();
            var event = utils_1.isPrimitive(error)
                ? self._eventFromIncompleteRejection(error)
                : eventbuilder_1.eventFromUnknownInput(error, undefined, {
                    attachStacktrace: client && client.getOptions().attachStacktrace,
                    rejection: true,
                });
            event.level = types_1.Severity.Error;
            utils_1.addExceptionMechanism(event, {
                handled: false,
                type: 'onunhandledrejection',
            });
            currentHub.captureEvent(event, {
                originalException: error,
            });
            if (self._oldOnUnhandledRejectionHandler) {
                return self._oldOnUnhandledRejectionHandler.apply(this, arguments);
            }
            return true;
        };
        this._onUnhandledRejectionHandlerInstalled = true;
    };
    /**
     * This function creates a stack from an old, error-less onerror handler.
     */
    GlobalHandlers.prototype._eventFromIncompleteOnError = function (msg, url, line, column) {
        var ERROR_TYPES_RE = /^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?(.*)$/i;
        // If 'message' is ErrorEvent, get real message from inside
        var message = utils_1.isErrorEvent(msg) ? msg.message : msg;
        var name;
        if (utils_1.isString(message)) {
            var groups = message.match(ERROR_TYPES_RE);
            if (groups) {
                name = groups[1];
                message = groups[2];
            }
        }
        var event = {
            exception: {
                values: [
                    {
                        type: name || 'Error',
                        value: message,
                    },
                ],
            },
        };
        return this._enhanceEventWithInitialFrame(event, url, line, column);
    };
    /**
     * This function creates an Event from an TraceKitStackTrace that has part of it missing.
     */
    GlobalHandlers.prototype._eventFromIncompleteRejection = function (error) {
        return {
            exception: {
                values: [
                    {
                        type: 'UnhandledRejection',
                        value: "Non-Error promise rejection captured with value: " + error,
                    },
                ],
            },
        };
    };
    /** JSDoc */
    GlobalHandlers.prototype._enhanceEventWithInitialFrame = function (event, url, line, column) {
        event.exception = event.exception || {};
        event.exception.values = event.exception.values || [];
        event.exception.values[0] = event.exception.values[0] || {};
        event.exception.values[0].stacktrace = event.exception.values[0].stacktrace || {};
        event.exception.values[0].stacktrace.frames = event.exception.values[0].stacktrace.frames || [];
        var colno = isNaN(parseInt(column, 10)) ? undefined : column;
        var lineno = isNaN(parseInt(line, 10)) ? undefined : line;
        var filename = utils_1.isString(url) && url.length > 0 ? url : utils_1.getLocationHref();
        if (event.exception.values[0].stacktrace.frames.length === 0) {
            event.exception.values[0].stacktrace.frames.push({
                colno: colno,
                filename: filename,
                function: '?',
                in_app: true,
                lineno: lineno,
            });
        }
        return event;
    };
    /**
     * @inheritDoc
     */
    GlobalHandlers.id = 'GlobalHandlers';
    return GlobalHandlers;
}());
exports.GlobalHandlers = GlobalHandlers;

},{"../eventbuilder":24,"../helpers":25,"@sentry/core":44,"@sentry/types":55,"@sentry/utils":63,"tslib":154}],29:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var globalhandlers_1 = require("./globalhandlers");
exports.GlobalHandlers = globalhandlers_1.GlobalHandlers;
var trycatch_1 = require("./trycatch");
exports.TryCatch = trycatch_1.TryCatch;
var breadcrumbs_1 = require("./breadcrumbs");
exports.Breadcrumbs = breadcrumbs_1.Breadcrumbs;
var linkederrors_1 = require("./linkederrors");
exports.LinkedErrors = linkederrors_1.LinkedErrors;
var useragent_1 = require("./useragent");
exports.UserAgent = useragent_1.UserAgent;

},{"./breadcrumbs":27,"./globalhandlers":28,"./linkederrors":30,"./trycatch":31,"./useragent":32}],30:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var core_1 = require("@sentry/core");
var utils_1 = require("@sentry/utils");
var parsers_1 = require("../parsers");
var tracekit_1 = require("../tracekit");
var DEFAULT_KEY = 'cause';
var DEFAULT_LIMIT = 5;
/** Adds SDK info to an event. */
var LinkedErrors = /** @class */ (function () {
    /**
     * @inheritDoc
     */
    function LinkedErrors(options) {
        if (options === void 0) { options = {}; }
        /**
         * @inheritDoc
         */
        this.name = LinkedErrors.id;
        this._key = options.key || DEFAULT_KEY;
        this._limit = options.limit || DEFAULT_LIMIT;
    }
    /**
     * @inheritDoc
     */
    LinkedErrors.prototype.setupOnce = function () {
        core_1.addGlobalEventProcessor(function (event, hint) {
            var self = core_1.getCurrentHub().getIntegration(LinkedErrors);
            if (self) {
                return self._handler(event, hint);
            }
            return event;
        });
    };
    /**
     * @inheritDoc
     */
    LinkedErrors.prototype._handler = function (event, hint) {
        if (!event.exception || !event.exception.values || !hint || !utils_1.isInstanceOf(hint.originalException, Error)) {
            return event;
        }
        var linkedErrors = this._walkErrorTree(hint.originalException, this._key);
        event.exception.values = tslib_1.__spread(linkedErrors, event.exception.values);
        return event;
    };
    /**
     * @inheritDoc
     */
    LinkedErrors.prototype._walkErrorTree = function (error, key, stack) {
        if (stack === void 0) { stack = []; }
        if (!utils_1.isInstanceOf(error[key], Error) || stack.length + 1 >= this._limit) {
            return stack;
        }
        var stacktrace = tracekit_1.computeStackTrace(error[key]);
        var exception = parsers_1.exceptionFromStacktrace(stacktrace);
        return this._walkErrorTree(error[key], key, tslib_1.__spread([exception], stack));
    };
    /**
     * @inheritDoc
     */
    LinkedErrors.id = 'LinkedErrors';
    return LinkedErrors;
}());
exports.LinkedErrors = LinkedErrors;

},{"../parsers":33,"../tracekit":35,"@sentry/core":44,"@sentry/utils":63,"tslib":154}],31:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("@sentry/utils");
var helpers_1 = require("../helpers");
/** Wrap timer functions and event targets to catch errors and provide better meta data */
var TryCatch = /** @class */ (function () {
    function TryCatch() {
        /** JSDoc */
        this._ignoreOnError = 0;
        /**
         * @inheritDoc
         */
        this.name = TryCatch.id;
    }
    /** JSDoc */
    TryCatch.prototype._wrapTimeFunction = function (original) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var originalCallback = args[0];
            args[0] = helpers_1.wrap(originalCallback, {
                mechanism: {
                    data: { function: utils_1.getFunctionName(original) },
                    handled: true,
                    type: 'instrument',
                },
            });
            return original.apply(this, args);
        };
    };
    /** JSDoc */
    TryCatch.prototype._wrapRAF = function (original) {
        return function (callback) {
            return original(helpers_1.wrap(callback, {
                mechanism: {
                    data: {
                        function: 'requestAnimationFrame',
                        handler: utils_1.getFunctionName(original),
                    },
                    handled: true,
                    type: 'instrument',
                },
            }));
        };
    };
    /** JSDoc */
    TryCatch.prototype._wrapEventTarget = function (target) {
        var global = utils_1.getGlobalObject();
        var proto = global[target] && global[target].prototype;
        if (!proto || !proto.hasOwnProperty || !proto.hasOwnProperty('addEventListener')) {
            return;
        }
        utils_1.fill(proto, 'addEventListener', function (original) {
            return function (eventName, fn, options) {
                try {
                    // tslint:disable-next-line:no-unbound-method strict-type-predicates
                    if (typeof fn.handleEvent === 'function') {
                        fn.handleEvent = helpers_1.wrap(fn.handleEvent.bind(fn), {
                            mechanism: {
                                data: {
                                    function: 'handleEvent',
                                    handler: utils_1.getFunctionName(fn),
                                    target: target,
                                },
                                handled: true,
                                type: 'instrument',
                            },
                        });
                    }
                }
                catch (err) {
                    // can sometimes get 'Permission denied to access property "handle Event'
                }
                return original.call(this, eventName, helpers_1.wrap(fn, {
                    mechanism: {
                        data: {
                            function: 'addEventListener',
                            handler: utils_1.getFunctionName(fn),
                            target: target,
                        },
                        handled: true,
                        type: 'instrument',
                    },
                }), options);
            };
        });
        utils_1.fill(proto, 'removeEventListener', function (original) {
            return function (eventName, fn, options) {
                var callback = fn;
                try {
                    callback = callback && (callback.__sentry_wrapped__ || callback);
                }
                catch (e) {
                    // ignore, accessing __sentry_wrapped__ will throw in some Selenium environments
                }
                return original.call(this, eventName, callback, options);
            };
        });
    };
    /** JSDoc */
    TryCatch.prototype._wrapXHR = function (originalSend) {
        return function () {
            var _this = this;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var xhr = this; // tslint:disable-line:no-this-assignment
            var xmlHttpRequestProps = ['onload', 'onerror', 'onprogress'];
            xmlHttpRequestProps.forEach(function (prop) {
                if (prop in _this && typeof _this[prop] === 'function') {
                    utils_1.fill(_this, prop, function (original) {
                        return helpers_1.wrap(original, {
                            mechanism: {
                                data: {
                                    function: prop,
                                    handler: utils_1.getFunctionName(original),
                                },
                                handled: true,
                                type: 'instrument',
                            },
                        });
                    });
                }
            });
            if ('onreadystatechange' in xhr && typeof xhr.onreadystatechange === 'function') {
                utils_1.fill(xhr, 'onreadystatechange', function (original) {
                    var wrapOptions = {
                        mechanism: {
                            data: {
                                function: 'onreadystatechange',
                                handler: utils_1.getFunctionName(original),
                            },
                            handled: true,
                            type: 'instrument',
                        },
                    };
                    // If Instrument integration has been called before TryCatch, get the name of original function
                    if (original.__sentry_original__) {
                        wrapOptions.mechanism.data.handler = utils_1.getFunctionName(original.__sentry_original__);
                    }
                    // Otherwise wrap directly
                    return helpers_1.wrap(original, wrapOptions);
                });
            }
            return originalSend.apply(this, args);
        };
    };
    /**
     * Wrap timer functions and event targets to catch errors
     * and provide better metadata.
     */
    TryCatch.prototype.setupOnce = function () {
        this._ignoreOnError = this._ignoreOnError;
        var global = utils_1.getGlobalObject();
        utils_1.fill(global, 'setTimeout', this._wrapTimeFunction.bind(this));
        utils_1.fill(global, 'setInterval', this._wrapTimeFunction.bind(this));
        utils_1.fill(global, 'requestAnimationFrame', this._wrapRAF.bind(this));
        if ('XMLHttpRequest' in global) {
            utils_1.fill(XMLHttpRequest.prototype, 'send', this._wrapXHR.bind(this));
        }
        [
            'EventTarget',
            'Window',
            'Node',
            'ApplicationCache',
            'AudioTrackList',
            'ChannelMergerNode',
            'CryptoOperation',
            'EventSource',
            'FileReader',
            'HTMLUnknownElement',
            'IDBDatabase',
            'IDBRequest',
            'IDBTransaction',
            'KeyOperation',
            'MediaController',
            'MessagePort',
            'ModalWindow',
            'Notification',
            'SVGElementInstance',
            'Screen',
            'TextTrack',
            'TextTrackCue',
            'TextTrackList',
            'WebSocket',
            'WebSocketWorker',
            'Worker',
            'XMLHttpRequest',
            'XMLHttpRequestEventTarget',
            'XMLHttpRequestUpload',
        ].forEach(this._wrapEventTarget.bind(this));
    };
    /**
     * @inheritDoc
     */
    TryCatch.id = 'TryCatch';
    return TryCatch;
}());
exports.TryCatch = TryCatch;

},{"../helpers":25,"@sentry/utils":63}],32:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var core_1 = require("@sentry/core");
var utils_1 = require("@sentry/utils");
var global = utils_1.getGlobalObject();
/** UserAgent */
var UserAgent = /** @class */ (function () {
    function UserAgent() {
        /**
         * @inheritDoc
         */
        this.name = UserAgent.id;
    }
    /**
     * @inheritDoc
     */
    UserAgent.prototype.setupOnce = function () {
        core_1.addGlobalEventProcessor(function (event) {
            if (core_1.getCurrentHub().getIntegration(UserAgent)) {
                if (!global.navigator || !global.location) {
                    return event;
                }
                // Request Interface: https://docs.sentry.io/development/sdk-dev/event-payloads/request/
                var request = event.request || {};
                request.url = request.url || global.location.href;
                request.headers = request.headers || {};
                request.headers['User-Agent'] = global.navigator.userAgent;
                return tslib_1.__assign({}, event, { request: request });
            }
            return event;
        });
    };
    /**
     * @inheritDoc
     */
    UserAgent.id = 'UserAgent';
    return UserAgent;
}());
exports.UserAgent = UserAgent;

},{"@sentry/core":44,"@sentry/utils":63,"tslib":154}],33:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("@sentry/utils");
var tracekit_1 = require("./tracekit");
var STACKTRACE_LIMIT = 50;
/**
 * This function creates an exception from an TraceKitStackTrace
 * @param stacktrace TraceKitStackTrace that will be converted to an exception
 * @hidden
 */
function exceptionFromStacktrace(stacktrace) {
    var frames = prepareFramesForEvent(stacktrace.stack);
    var exception = {
        type: stacktrace.name,
        value: stacktrace.message,
    };
    if (frames && frames.length) {
        exception.stacktrace = { frames: frames };
    }
    // tslint:disable-next-line:strict-type-predicates
    if (exception.type === undefined && exception.value === '') {
        exception.value = 'Unrecoverable error caught';
    }
    return exception;
}
exports.exceptionFromStacktrace = exceptionFromStacktrace;
/**
 * @hidden
 */
function eventFromPlainObject(exception, syntheticException, rejection) {
    var event = {
        exception: {
            values: [
                {
                    type: utils_1.isEvent(exception) ? exception.constructor.name : rejection ? 'UnhandledRejection' : 'Error',
                    value: "Non-Error " + (rejection ? 'promise rejection' : 'exception') + " captured with keys: " + utils_1.extractExceptionKeysForMessage(exception),
                },
            ],
        },
        extra: {
            __serialized__: utils_1.normalizeToSize(exception),
        },
    };
    if (syntheticException) {
        var stacktrace = tracekit_1.computeStackTrace(syntheticException);
        var frames_1 = prepareFramesForEvent(stacktrace.stack);
        event.stacktrace = {
            frames: frames_1,
        };
    }
    return event;
}
exports.eventFromPlainObject = eventFromPlainObject;
/**
 * @hidden
 */
function eventFromStacktrace(stacktrace) {
    var exception = exceptionFromStacktrace(stacktrace);
    return {
        exception: {
            values: [exception],
        },
    };
}
exports.eventFromStacktrace = eventFromStacktrace;
/**
 * @hidden
 */
function prepareFramesForEvent(stack) {
    if (!stack || !stack.length) {
        return [];
    }
    var localStack = stack;
    var firstFrameFunction = localStack[0].func || '';
    var lastFrameFunction = localStack[localStack.length - 1].func || '';
    // If stack starts with one of our API calls, remove it (starts, meaning it's the top of the stack - aka last call)
    if (firstFrameFunction.indexOf('captureMessage') !== -1 || firstFrameFunction.indexOf('captureException') !== -1) {
        localStack = localStack.slice(1);
    }
    // If stack ends with one of our internal API calls, remove it (ends, meaning it's the bottom of the stack - aka top-most call)
    if (lastFrameFunction.indexOf('sentryWrapped') !== -1) {
        localStack = localStack.slice(0, -1);
    }
    // The frame where the crash happened, should be the last entry in the array
    return localStack
        .map(function (frame) { return ({
        colno: frame.column === null ? undefined : frame.column,
        filename: frame.url || localStack[0].url,
        function: frame.func || '?',
        in_app: true,
        lineno: frame.line === null ? undefined : frame.line,
    }); })
        .slice(0, STACKTRACE_LIMIT)
        .reverse();
}
exports.prepareFramesForEvent = prepareFramesForEvent;

},{"./tracekit":35,"@sentry/utils":63}],34:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@sentry/core");
var utils_1 = require("@sentry/utils");
var client_1 = require("./client");
var helpers_1 = require("./helpers");
var integrations_1 = require("./integrations");
exports.defaultIntegrations = [
    new core_1.Integrations.InboundFilters(),
    new core_1.Integrations.FunctionToString(),
    new integrations_1.TryCatch(),
    new integrations_1.Breadcrumbs(),
    new integrations_1.GlobalHandlers(),
    new integrations_1.LinkedErrors(),
    new integrations_1.UserAgent(),
];
/**
 * The Sentry Browser SDK Client.
 *
 * To use this SDK, call the {@link init} function as early as possible when
 * loading the web page. To set context information or send manual events, use
 * the provided methods.
 *
 * @example
 *
 * ```
 *
 * import { init } from '@sentry/browser';
 *
 * init({
 *   dsn: '__DSN__',
 *   // ...
 * });
 * ```
 *
 * @example
 * ```
 *
 * import { configureScope } from '@sentry/browser';
 * configureScope((scope: Scope) => {
 *   scope.setExtra({ battery: 0.7 });
 *   scope.setTag({ user_mode: 'admin' });
 *   scope.setUser({ id: '4711' });
 * });
 * ```
 *
 * @example
 * ```
 *
 * import { addBreadcrumb } from '@sentry/browser';
 * addBreadcrumb({
 *   message: 'My Breadcrumb',
 *   // ...
 * });
 * ```
 *
 * @example
 *
 * ```
 *
 * import * as Sentry from '@sentry/browser';
 * Sentry.captureMessage('Hello, world!');
 * Sentry.captureException(new Error('Good bye'));
 * Sentry.captureEvent({
 *   message: 'Manual',
 *   stacktrace: [
 *     // ...
 *   ],
 * });
 * ```
 *
 * @see {@link BrowserOptions} for documentation on configuration options.
 */
function init(options) {
    if (options === void 0) { options = {}; }
    if (options.defaultIntegrations === undefined) {
        options.defaultIntegrations = exports.defaultIntegrations;
    }
    if (options.release === undefined) {
        var window_1 = utils_1.getGlobalObject();
        // This supports the variable that sentry-webpack-plugin injects
        if (window_1.SENTRY_RELEASE && window_1.SENTRY_RELEASE.id) {
            options.release = window_1.SENTRY_RELEASE.id;
        }
    }
    core_1.initAndBind(client_1.BrowserClient, options);
}
exports.init = init;
/**
 * Present the user with a report dialog.
 *
 * @param options Everything is optional, we try to fetch all info need from the global scope.
 */
function showReportDialog(options) {
    if (options === void 0) { options = {}; }
    if (!options.eventId) {
        options.eventId = core_1.getCurrentHub().lastEventId();
    }
    var client = core_1.getCurrentHub().getClient();
    if (client) {
        client.showReportDialog(options);
    }
}
exports.showReportDialog = showReportDialog;
/**
 * This is the getter for lastEventId.
 *
 * @returns The last event id of a captured event.
 */
function lastEventId() {
    return core_1.getCurrentHub().lastEventId();
}
exports.lastEventId = lastEventId;
/**
 * This function is here to be API compatible with the loader.
 * @hidden
 */
function forceLoad() {
    // Noop
}
exports.forceLoad = forceLoad;
/**
 * This function is here to be API compatible with the loader.
 * @hidden
 */
function onLoad(callback) {
    callback();
}
exports.onLoad = onLoad;
/**
 * A promise that resolves when all current events have been sent.
 * If you provide a timeout and the queue takes longer to drain the promise returns false.
 *
 * @param timeout Maximum time in ms the client should wait.
 */
function flush(timeout) {
    var client = core_1.getCurrentHub().getClient();
    if (client) {
        return client.flush(timeout);
    }
    return utils_1.SyncPromise.reject(false);
}
exports.flush = flush;
/**
 * A promise that resolves when all current events have been sent.
 * If you provide a timeout and the queue takes longer to drain the promise returns false.
 *
 * @param timeout Maximum time in ms the client should wait.
 */
function close(timeout) {
    var client = core_1.getCurrentHub().getClient();
    if (client) {
        return client.close(timeout);
    }
    return utils_1.SyncPromise.reject(false);
}
exports.close = close;
/**
 * Wrap code within a try/catch block so the SDK is able to capture errors.
 *
 * @param fn A function to wrap.
 *
 * @returns The result of wrapped function call.
 */
function wrap(fn) {
    return helpers_1.wrap(fn)(); // tslint:disable-line:no-unsafe-any
}
exports.wrap = wrap;

},{"./client":23,"./helpers":25,"./integrations":29,"@sentry/core":44,"@sentry/utils":63}],35:[function(require,module,exports){
// tslint:disable:object-literal-sort-keys
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
// global reference to slice
var UNKNOWN_FUNCTION = '?';
// Chromium based browsers: Chrome, Brave, new Opera, new Edge
var chrome = /^\s*at (?:(.*?) ?\()?((?:file|https?|blob|chrome-extension|native|eval|webpack|<anonymous>|[-a-z]+:|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
// gecko regex: `(?:bundle|\d+\.js)`: `bundle` is for react native, `\d+\.js` also but specifically for ram bundles because it
// generates filenames without a prefix like `file://` the filenames in the stacktrace are just 42.js
// We need this specific case for now because we want no other regex to match.
var gecko = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:file|https?|blob|chrome|webpack|resource|moz-extension).*?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js))(?::(\d+))?(?::(\d+))?\s*$/i;
var winjs = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i;
var geckoEval = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;
var chromeEval = /\((\S*)(?::(\d+))(?::(\d+))\)/;
/** JSDoc */
function computeStackTrace(ex) {
    // tslint:disable:no-unsafe-any
    var stack = null;
    var popSize = ex && ex.framesToPop;
    try {
        // This must be tried first because Opera 10 *destroys*
        // its stacktrace property if you try to access the stack
        // property first!!
        stack = computeStackTraceFromStacktraceProp(ex);
        if (stack) {
            return popFrames(stack, popSize);
        }
    }
    catch (e) {
        // no-empty
    }
    try {
        stack = computeStackTraceFromStackProp(ex);
        if (stack) {
            return popFrames(stack, popSize);
        }
    }
    catch (e) {
        // no-empty
    }
    return {
        message: extractMessage(ex),
        name: ex && ex.name,
        stack: [],
        failed: true,
    };
}
exports.computeStackTrace = computeStackTrace;
/** JSDoc */
// tslint:disable-next-line:cyclomatic-complexity
function computeStackTraceFromStackProp(ex) {
    // tslint:disable:no-conditional-assignment
    if (!ex || !ex.stack) {
        return null;
    }
    var stack = [];
    var lines = ex.stack.split('\n');
    var isEval;
    var submatch;
    var parts;
    var element;
    for (var i = 0; i < lines.length; ++i) {
        if ((parts = chrome.exec(lines[i]))) {
            var isNative = parts[2] && parts[2].indexOf('native') === 0; // start of line
            isEval = parts[2] && parts[2].indexOf('eval') === 0; // start of line
            if (isEval && (submatch = chromeEval.exec(parts[2]))) {
                // throw out eval line/column and use top-most line/column number
                parts[2] = submatch[1]; // url
                parts[3] = submatch[2]; // line
                parts[4] = submatch[3]; // column
            }
            element = {
                url: parts[2],
                func: parts[1] || UNKNOWN_FUNCTION,
                args: isNative ? [parts[2]] : [],
                line: parts[3] ? +parts[3] : null,
                column: parts[4] ? +parts[4] : null,
            };
        }
        else if ((parts = winjs.exec(lines[i]))) {
            element = {
                url: parts[2],
                func: parts[1] || UNKNOWN_FUNCTION,
                args: [],
                line: +parts[3],
                column: parts[4] ? +parts[4] : null,
            };
        }
        else if ((parts = gecko.exec(lines[i]))) {
            isEval = parts[3] && parts[3].indexOf(' > eval') > -1;
            if (isEval && (submatch = geckoEval.exec(parts[3]))) {
                // throw out eval line/column and use top-most line number
                parts[1] = parts[1] || "eval";
                parts[3] = submatch[1];
                parts[4] = submatch[2];
                parts[5] = ''; // no column when eval
            }
            else if (i === 0 && !parts[5] && ex.columnNumber !== void 0) {
                // FireFox uses this awesome columnNumber property for its top frame
                // Also note, Firefox's column number is 0-based and everything else expects 1-based,
                // so adding 1
                // NOTE: this hack doesn't work if top-most frame is eval
                stack[0].column = ex.columnNumber + 1;
            }
            element = {
                url: parts[3],
                func: parts[1] || UNKNOWN_FUNCTION,
                args: parts[2] ? parts[2].split(',') : [],
                line: parts[4] ? +parts[4] : null,
                column: parts[5] ? +parts[5] : null,
            };
        }
        else {
            continue;
        }
        if (!element.func && element.line) {
            element.func = UNKNOWN_FUNCTION;
        }
        stack.push(element);
    }
    if (!stack.length) {
        return null;
    }
    return {
        message: extractMessage(ex),
        name: ex.name,
        stack: stack,
    };
}
/** JSDoc */
function computeStackTraceFromStacktraceProp(ex) {
    if (!ex || !ex.stacktrace) {
        return null;
    }
    // Access and store the stacktrace property before doing ANYTHING
    // else to it because Opera is not very good at providing it
    // reliably in other circumstances.
    var stacktrace = ex.stacktrace;
    var opera10Regex = / line (\d+).*script (?:in )?(\S+)(?:: in function (\S+))?$/i;
    var opera11Regex = / line (\d+), column (\d+)\s*(?:in (?:<anonymous function: ([^>]+)>|([^\)]+))\((.*)\))? in (.*):\s*$/i;
    var lines = stacktrace.split('\n');
    var stack = [];
    var parts;
    for (var line = 0; line < lines.length; line += 2) {
        // tslint:disable:no-conditional-assignment
        var element = null;
        if ((parts = opera10Regex.exec(lines[line]))) {
            element = {
                url: parts[2],
                func: parts[3],
                args: [],
                line: +parts[1],
                column: null,
            };
        }
        else if ((parts = opera11Regex.exec(lines[line]))) {
            element = {
                url: parts[6],
                func: parts[3] || parts[4],
                args: parts[5] ? parts[5].split(',') : [],
                line: +parts[1],
                column: +parts[2],
            };
        }
        if (element) {
            if (!element.func && element.line) {
                element.func = UNKNOWN_FUNCTION;
            }
            stack.push(element);
        }
    }
    if (!stack.length) {
        return null;
    }
    return {
        message: extractMessage(ex),
        name: ex.name,
        stack: stack,
    };
}
/** Remove N number of frames from the stack */
function popFrames(stacktrace, popSize) {
    try {
        return tslib_1.__assign({}, stacktrace, { stack: stacktrace.stack.slice(popSize) });
    }
    catch (e) {
        return stacktrace;
    }
}
/**
 * There are cases where stacktrace.message is an Event object
 * https://github.com/getsentry/sentry-javascript/issues/1949
 * In this specific case we try to extract stacktrace.message.error.message
 */
function extractMessage(ex) {
    var message = ex && ex.message;
    if (!message) {
        return 'No error message';
    }
    if (message.error && typeof message.error.message === 'string') {
        return message.error.message;
    }
    return message;
}

},{"tslib":154}],36:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@sentry/core");
var utils_1 = require("@sentry/utils");
/** Base Transport class implementation */
var BaseTransport = /** @class */ (function () {
    function BaseTransport(options) {
        this.options = options;
        /** A simple buffer holding all requests. */
        this._buffer = new utils_1.PromiseBuffer(30);
        this.url = new core_1.API(this.options.dsn).getStoreEndpointWithUrlEncodedAuth();
    }
    /**
     * @inheritDoc
     */
    BaseTransport.prototype.sendEvent = function (_) {
        throw new utils_1.SentryError('Transport Class has to implement `sendEvent` method');
    };
    /**
     * @inheritDoc
     */
    BaseTransport.prototype.close = function (timeout) {
        return this._buffer.drain(timeout);
    };
    return BaseTransport;
}());
exports.BaseTransport = BaseTransport;

},{"@sentry/core":44,"@sentry/utils":63}],37:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var types_1 = require("@sentry/types");
var utils_1 = require("@sentry/utils");
var base_1 = require("./base");
var global = utils_1.getGlobalObject();
/** `fetch` based transport */
var FetchTransport = /** @class */ (function (_super) {
    tslib_1.__extends(FetchTransport, _super);
    function FetchTransport() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /** Locks transport after receiving 429 response */
        _this._disabledUntil = new Date(Date.now());
        return _this;
    }
    /**
     * @inheritDoc
     */
    FetchTransport.prototype.sendEvent = function (event) {
        var _this = this;
        if (new Date(Date.now()) < this._disabledUntil) {
            return Promise.reject({
                event: event,
                reason: "Transport locked till " + this._disabledUntil + " due to too many requests.",
                status: 429,
            });
        }
        var defaultOptions = {
            body: JSON.stringify(event),
            method: 'POST',
            // Despite all stars in the sky saying that Edge supports old draft syntax, aka 'never', 'always', 'origin' and 'default
            // https://caniuse.com/#feat=referrer-policy
            // It doesn't. And it throw exception instead of ignoring this parameter...
            // REF: https://github.com/getsentry/raven-js/issues/1233
            referrerPolicy: (utils_1.supportsReferrerPolicy() ? 'origin' : ''),
        };
        return this._buffer.add(new utils_1.SyncPromise(function (resolve, reject) {
            global
                .fetch(_this.url, defaultOptions)
                .then(function (response) {
                var status = types_1.Status.fromHttpCode(response.status);
                if (status === types_1.Status.Success) {
                    resolve({ status: status });
                    return;
                }
                if (status === types_1.Status.RateLimit) {
                    var now = Date.now();
                    _this._disabledUntil = new Date(now + utils_1.parseRetryAfterHeader(now, response.headers.get('Retry-After')));
                    utils_1.logger.warn("Too many requests, backing off till: " + _this._disabledUntil);
                }
                reject(response);
            })
                .catch(reject);
        }));
    };
    return FetchTransport;
}(base_1.BaseTransport));
exports.FetchTransport = FetchTransport;

},{"./base":36,"@sentry/types":55,"@sentry/utils":63,"tslib":154}],38:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var base_1 = require("./base");
exports.BaseTransport = base_1.BaseTransport;
var fetch_1 = require("./fetch");
exports.FetchTransport = fetch_1.FetchTransport;
var xhr_1 = require("./xhr");
exports.XHRTransport = xhr_1.XHRTransport;

},{"./base":36,"./fetch":37,"./xhr":39}],39:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var types_1 = require("@sentry/types");
var utils_1 = require("@sentry/utils");
var base_1 = require("./base");
/** `XHR` based transport */
var XHRTransport = /** @class */ (function (_super) {
    tslib_1.__extends(XHRTransport, _super);
    function XHRTransport() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /** Locks transport after receiving 429 response */
        _this._disabledUntil = new Date(Date.now());
        return _this;
    }
    /**
     * @inheritDoc
     */
    XHRTransport.prototype.sendEvent = function (event) {
        var _this = this;
        if (new Date(Date.now()) < this._disabledUntil) {
            return Promise.reject({
                event: event,
                reason: "Transport locked till " + this._disabledUntil + " due to too many requests.",
                status: 429,
            });
        }
        return this._buffer.add(new utils_1.SyncPromise(function (resolve, reject) {
            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (request.readyState !== 4) {
                    return;
                }
                var status = types_1.Status.fromHttpCode(request.status);
                if (status === types_1.Status.Success) {
                    resolve({ status: status });
                    return;
                }
                if (status === types_1.Status.RateLimit) {
                    var now = Date.now();
                    _this._disabledUntil = new Date(now + utils_1.parseRetryAfterHeader(now, request.getResponseHeader('Retry-After')));
                    utils_1.logger.warn("Too many requests, backing off till: " + _this._disabledUntil);
                }
                reject(request);
            };
            request.open('POST', _this.url);
            request.send(JSON.stringify(event));
        }));
    };
    return XHRTransport;
}(base_1.BaseTransport));
exports.XHRTransport = XHRTransport;

},{"./base":36,"@sentry/types":55,"@sentry/utils":63,"tslib":154}],40:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.SDK_NAME = 'sentry.javascript.browser';
exports.SDK_VERSION = '5.10.2';

},{}],41:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("@sentry/utils");
var SENTRY_API_VERSION = '7';
/** Helper class to provide urls to different Sentry endpoints. */
var API = /** @class */ (function () {
    /** Create a new instance of API */
    function API(dsn) {
        this.dsn = dsn;
        this._dsnObject = new utils_1.Dsn(dsn);
    }
    /** Returns the Dsn object. */
    API.prototype.getDsn = function () {
        return this._dsnObject;
    };
    /** Returns a string with auth headers in the url to the store endpoint. */
    API.prototype.getStoreEndpoint = function () {
        return "" + this._getBaseUrl() + this.getStoreEndpointPath();
    };
    /** Returns the store endpoint with auth added in url encoded. */
    API.prototype.getStoreEndpointWithUrlEncodedAuth = function () {
        var dsn = this._dsnObject;
        var auth = {
            sentry_key: dsn.user,
            sentry_version: SENTRY_API_VERSION,
        };
        // Auth is intentionally sent as part of query string (NOT as custom HTTP header)
        // to avoid preflight CORS requests
        return this.getStoreEndpoint() + "?" + utils_1.urlEncode(auth);
    };
    /** Returns the base path of the url including the port. */
    API.prototype._getBaseUrl = function () {
        var dsn = this._dsnObject;
        var protocol = dsn.protocol ? dsn.protocol + ":" : '';
        var port = dsn.port ? ":" + dsn.port : '';
        return protocol + "//" + dsn.host + port;
    };
    /** Returns only the path component for the store endpoint. */
    API.prototype.getStoreEndpointPath = function () {
        var dsn = this._dsnObject;
        return (dsn.path ? "/" + dsn.path : '') + "/api/" + dsn.projectId + "/store/";
    };
    /** Returns an object that can be used in request headers. */
    API.prototype.getRequestHeaders = function (clientName, clientVersion) {
        var dsn = this._dsnObject;
        var header = ["Sentry sentry_version=" + SENTRY_API_VERSION];
        header.push("sentry_timestamp=" + utils_1.timestampWithMs()); // TODO: This can be removed
        header.push("sentry_client=" + clientName + "/" + clientVersion);
        header.push("sentry_key=" + dsn.user);
        if (dsn.pass) {
            header.push("sentry_secret=" + dsn.pass);
        }
        return {
            'Content-Type': 'application/json',
            'X-Sentry-Auth': header.join(', '),
        };
    };
    /** Returns the url to the report dialog endpoint. */
    API.prototype.getReportDialogEndpoint = function (dialogOptions) {
        if (dialogOptions === void 0) { dialogOptions = {}; }
        var dsn = this._dsnObject;
        var endpoint = "" + this._getBaseUrl() + (dsn.path ? "/" + dsn.path : '') + "/api/embed/error-page/";
        var encodedOptions = [];
        encodedOptions.push("dsn=" + dsn.toString());
        for (var key in dialogOptions) {
            if (key === 'user') {
                if (!dialogOptions.user) {
                    continue;
                }
                if (dialogOptions.user.name) {
                    encodedOptions.push("name=" + encodeURIComponent(dialogOptions.user.name));
                }
                if (dialogOptions.user.email) {
                    encodedOptions.push("email=" + encodeURIComponent(dialogOptions.user.email));
                }
            }
            else {
                encodedOptions.push(encodeURIComponent(key) + "=" + encodeURIComponent(dialogOptions[key]));
            }
        }
        if (encodedOptions.length) {
            return endpoint + "?" + encodedOptions.join('&');
        }
        return endpoint;
    };
    return API;
}());
exports.API = API;

},{"@sentry/utils":63}],42:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("@sentry/utils");
var noop_1 = require("./transports/noop");
/**
 * This is the base implemention of a Backend.
 * @hidden
 */
var BaseBackend = /** @class */ (function () {
    /** Creates a new backend instance. */
    function BaseBackend(options) {
        this._options = options;
        if (!this._options.dsn) {
            utils_1.logger.warn('No DSN provided, backend will not do anything.');
        }
        this._transport = this._setupTransport();
    }
    /**
     * Sets up the transport so it can be used later to send requests.
     */
    BaseBackend.prototype._setupTransport = function () {
        return new noop_1.NoopTransport();
    };
    /**
     * @inheritDoc
     */
    BaseBackend.prototype.eventFromException = function (_exception, _hint) {
        throw new utils_1.SentryError('Backend has to implement `eventFromException` method');
    };
    /**
     * @inheritDoc
     */
    BaseBackend.prototype.eventFromMessage = function (_message, _level, _hint) {
        throw new utils_1.SentryError('Backend has to implement `eventFromMessage` method');
    };
    /**
     * @inheritDoc
     */
    BaseBackend.prototype.sendEvent = function (event) {
        this._transport.sendEvent(event).then(null, function (reason) {
            utils_1.logger.error("Error while sending event: " + reason);
        });
    };
    /**
     * @inheritDoc
     */
    BaseBackend.prototype.getTransport = function () {
        return this._transport;
    };
    return BaseBackend;
}());
exports.BaseBackend = BaseBackend;

},{"./transports/noop":50,"@sentry/utils":63}],43:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var utils_1 = require("@sentry/utils");
var integration_1 = require("./integration");
/**
 * Base implementation for all JavaScript SDK clients.
 *
 * Call the constructor with the corresponding backend constructor and options
 * specific to the client subclass. To access these options later, use
 * {@link Client.getOptions}. Also, the Backend instance is available via
 * {@link Client.getBackend}.
 *
 * If a Dsn is specified in the options, it will be parsed and stored. Use
 * {@link Client.getDsn} to retrieve the Dsn at any moment. In case the Dsn is
 * invalid, the constructor will throw a {@link SentryException}. Note that
 * without a valid Dsn, the SDK will not send any events to Sentry.
 *
 * Before sending an event via the backend, it is passed through
 * {@link BaseClient.prepareEvent} to add SDK information and scope data
 * (breadcrumbs and context). To add more custom information, override this
 * method and extend the resulting prepared event.
 *
 * To issue automatically created events (e.g. via instrumentation), use
 * {@link Client.captureEvent}. It will prepare the event and pass it through
 * the callback lifecycle. To issue auto-breadcrumbs, use
 * {@link Client.addBreadcrumb}.
 *
 * @example
 * class NodeClient extends BaseClient<NodeBackend, NodeOptions> {
 *   public constructor(options: NodeOptions) {
 *     super(NodeBackend, options);
 *   }
 *
 *   // ...
 * }
 */
var BaseClient = /** @class */ (function () {
    /**
     * Initializes this client instance.
     *
     * @param backendClass A constructor function to create the backend.
     * @param options Options for the client.
     */
    function BaseClient(backendClass, options) {
        /** Array of used integrations. */
        this._integrations = {};
        /** Is the client still processing a call? */
        this._processing = false;
        this._backend = new backendClass(options);
        this._options = options;
        if (options.dsn) {
            this._dsn = new utils_1.Dsn(options.dsn);
        }
        if (this._isEnabled()) {
            this._integrations = integration_1.setupIntegrations(this._options);
        }
    }
    /**
     * @inheritDoc
     */
    BaseClient.prototype.captureException = function (exception, hint, scope) {
        var _this = this;
        var eventId = hint && hint.event_id;
        this._processing = true;
        this._getBackend()
            .eventFromException(exception, hint)
            .then(function (event) { return _this._processEvent(event, hint, scope); })
            .then(function (finalEvent) {
            // We need to check for finalEvent in case beforeSend returned null
            eventId = finalEvent && finalEvent.event_id;
            _this._processing = false;
        })
            .then(null, function (reason) {
            utils_1.logger.error(reason);
            _this._processing = false;
        });
        return eventId;
    };
    /**
     * @inheritDoc
     */
    BaseClient.prototype.captureMessage = function (message, level, hint, scope) {
        var _this = this;
        var eventId = hint && hint.event_id;
        this._processing = true;
        var promisedEvent = utils_1.isPrimitive(message)
            ? this._getBackend().eventFromMessage("" + message, level, hint)
            : this._getBackend().eventFromException(message, hint);
        promisedEvent
            .then(function (event) { return _this._processEvent(event, hint, scope); })
            .then(function (finalEvent) {
            // We need to check for finalEvent in case beforeSend returned null
            eventId = finalEvent && finalEvent.event_id;
            _this._processing = false;
        })
            .then(null, function (reason) {
            utils_1.logger.error(reason);
            _this._processing = false;
        });
        return eventId;
    };
    /**
     * @inheritDoc
     */
    BaseClient.prototype.captureEvent = function (event, hint, scope) {
        var _this = this;
        var eventId = hint && hint.event_id;
        this._processing = true;
        this._processEvent(event, hint, scope)
            .then(function (finalEvent) {
            // We need to check for finalEvent in case beforeSend returned null
            eventId = finalEvent && finalEvent.event_id;
            _this._processing = false;
        })
            .then(null, function (reason) {
            utils_1.logger.error(reason);
            _this._processing = false;
        });
        return eventId;
    };
    /**
     * @inheritDoc
     */
    BaseClient.prototype.getDsn = function () {
        return this._dsn;
    };
    /**
     * @inheritDoc
     */
    BaseClient.prototype.getOptions = function () {
        return this._options;
    };
    /**
     * @inheritDoc
     */
    BaseClient.prototype.flush = function (timeout) {
        var _this = this;
        return this._isClientProcessing(timeout).then(function (status) {
            clearInterval(status.interval);
            return _this._getBackend()
                .getTransport()
                .close(timeout)
                .then(function (transportFlushed) { return status.ready && transportFlushed; });
        });
    };
    /**
     * @inheritDoc
     */
    BaseClient.prototype.close = function (timeout) {
        var _this = this;
        return this.flush(timeout).then(function (result) {
            _this.getOptions().enabled = false;
            return result;
        });
    };
    /**
     * @inheritDoc
     */
    BaseClient.prototype.getIntegrations = function () {
        return this._integrations || {};
    };
    /**
     * @inheritDoc
     */
    BaseClient.prototype.getIntegration = function (integration) {
        try {
            return this._integrations[integration.id] || null;
        }
        catch (_oO) {
            utils_1.logger.warn("Cannot retrieve integration " + integration.id + " from the current Client");
            return null;
        }
    };
    /** Waits for the client to be done with processing. */
    BaseClient.prototype._isClientProcessing = function (timeout) {
        var _this = this;
        return new utils_1.SyncPromise(function (resolve) {
            var ticked = 0;
            var tick = 1;
            var interval = 0;
            clearInterval(interval);
            interval = setInterval(function () {
                if (!_this._processing) {
                    resolve({
                        interval: interval,
                        ready: true,
                    });
                }
                else {
                    ticked += tick;
                    if (timeout && ticked >= timeout) {
                        resolve({
                            interval: interval,
                            ready: false,
                        });
                    }
                }
            }, tick);
        });
    };
    /** Returns the current backend. */
    BaseClient.prototype._getBackend = function () {
        return this._backend;
    };
    /** Determines whether this SDK is enabled and a valid Dsn is present. */
    BaseClient.prototype._isEnabled = function () {
        return this.getOptions().enabled !== false && this._dsn !== undefined;
    };
    /**
     * Adds common information to events.
     *
     * The information includes release and environment from `options`,
     * breadcrumbs and context (extra, tags and user) from the scope.
     *
     * Information that is already present in the event is never overwritten. For
     * nested objects, such as the context, keys are merged.
     *
     * @param event The original event.
     * @param hint May contain additional informartion about the original exception.
     * @param scope A scope containing event metadata.
     * @returns A new event with more information.
     */
    BaseClient.prototype._prepareEvent = function (event, scope, hint) {
        var _a = this.getOptions(), environment = _a.environment, release = _a.release, dist = _a.dist, _b = _a.maxValueLength, maxValueLength = _b === void 0 ? 250 : _b;
        var prepared = tslib_1.__assign({}, event);
        if (prepared.environment === undefined && environment !== undefined) {
            prepared.environment = environment;
        }
        if (prepared.release === undefined && release !== undefined) {
            prepared.release = release;
        }
        if (prepared.dist === undefined && dist !== undefined) {
            prepared.dist = dist;
        }
        if (prepared.message) {
            prepared.message = utils_1.truncate(prepared.message, maxValueLength);
        }
        var exception = prepared.exception && prepared.exception.values && prepared.exception.values[0];
        if (exception && exception.value) {
            exception.value = utils_1.truncate(exception.value, maxValueLength);
        }
        var request = prepared.request;
        if (request && request.url) {
            request.url = utils_1.truncate(request.url, maxValueLength);
        }
        if (prepared.event_id === undefined) {
            prepared.event_id = utils_1.uuid4();
        }
        this._addIntegrations(prepared.sdk);
        // We prepare the result here with a resolved Event.
        var result = utils_1.SyncPromise.resolve(prepared);
        // This should be the last thing called, since we want that
        // {@link Hub.addEventProcessor} gets the finished prepared event.
        if (scope) {
            // In case we have a hub we reassign it.
            result = scope.applyToEvent(prepared, hint);
        }
        return result;
    };
    /**
     * This function adds all used integrations to the SDK info in the event.
     * @param sdkInfo The sdkInfo of the event that will be filled with all integrations.
     */
    BaseClient.prototype._addIntegrations = function (sdkInfo) {
        var integrationsArray = Object.keys(this._integrations);
        if (sdkInfo && integrationsArray.length > 0) {
            sdkInfo.integrations = integrationsArray;
        }
    };
    /**
     * Processes an event (either error or message) and sends it to Sentry.
     *
     * This also adds breadcrumbs and context information to the event. However,
     * platform specific meta data (such as the User's IP address) must be added
     * by the SDK implementor.
     *
     *
     * @param event The event to send to Sentry.
     * @param hint May contain additional informartion about the original exception.
     * @param scope A scope containing event metadata.
     * @returns A SyncPromise that resolves with the event or rejects in case event was/will not be send.
     */
    BaseClient.prototype._processEvent = function (event, hint, scope) {
        var _this = this;
        var _a = this.getOptions(), beforeSend = _a.beforeSend, sampleRate = _a.sampleRate;
        if (!this._isEnabled()) {
            return utils_1.SyncPromise.reject('SDK not enabled, will not send event.');
        }
        // 1.0 === 100% events are sent
        // 0.0 === 0% events are sent
        if (typeof sampleRate === 'number' && Math.random() > sampleRate) {
            return utils_1.SyncPromise.reject('This event has been sampled, will not send event.');
        }
        return new utils_1.SyncPromise(function (resolve, reject) {
            _this._prepareEvent(event, scope, hint)
                .then(function (prepared) {
                if (prepared === null) {
                    reject('An event processor returned null, will not send event.');
                    return;
                }
                var finalEvent = prepared;
                try {
                    var isInternalException = hint && hint.data && hint.data.__sentry__ === true;
                    if (isInternalException || !beforeSend) {
                        _this._getBackend().sendEvent(finalEvent);
                        resolve(finalEvent);
                        return;
                    }
                    var beforeSendResult = beforeSend(prepared, hint);
                    // tslint:disable-next-line:strict-type-predicates
                    if (typeof beforeSendResult === 'undefined') {
                        utils_1.logger.error('`beforeSend` method has to return `null` or a valid event.');
                    }
                    else if (utils_1.isThenable(beforeSendResult)) {
                        _this._handleAsyncBeforeSend(beforeSendResult, resolve, reject);
                    }
                    else {
                        finalEvent = beforeSendResult;
                        if (finalEvent === null) {
                            utils_1.logger.log('`beforeSend` returned `null`, will not send event.');
                            resolve(null);
                            return;
                        }
                        // From here on we are really async
                        _this._getBackend().sendEvent(finalEvent);
                        resolve(finalEvent);
                    }
                }
                catch (exception) {
                    _this.captureException(exception, {
                        data: {
                            __sentry__: true,
                        },
                        originalException: exception,
                    });
                    reject('`beforeSend` threw an error, will not send event.');
                }
            })
                .then(null, function () {
                reject('`beforeSend` threw an error, will not send event.');
            });
        });
    };
    /**
     * Resolves before send Promise and calls resolve/reject on parent SyncPromise.
     */
    BaseClient.prototype._handleAsyncBeforeSend = function (beforeSend, resolve, reject) {
        var _this = this;
        beforeSend
            .then(function (processedEvent) {
            if (processedEvent === null) {
                reject('`beforeSend` returned `null`, will not send event.');
                return;
            }
            // From here on we are really async
            _this._getBackend().sendEvent(processedEvent);
            resolve(processedEvent);
        })
            .then(null, function (e) {
            reject("beforeSend rejected with " + e);
        });
    };
    return BaseClient;
}());
exports.BaseClient = BaseClient;

},{"./integration":45,"@sentry/utils":63,"tslib":154}],44:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var minimal_1 = require("@sentry/minimal");
exports.addBreadcrumb = minimal_1.addBreadcrumb;
exports.captureException = minimal_1.captureException;
exports.captureEvent = minimal_1.captureEvent;
exports.captureMessage = minimal_1.captureMessage;
exports.configureScope = minimal_1.configureScope;
exports.setContext = minimal_1.setContext;
exports.setExtra = minimal_1.setExtra;
exports.setExtras = minimal_1.setExtras;
exports.setTag = minimal_1.setTag;
exports.setTags = minimal_1.setTags;
exports.setUser = minimal_1.setUser;
exports.withScope = minimal_1.withScope;
var hub_1 = require("@sentry/hub");
exports.addGlobalEventProcessor = hub_1.addGlobalEventProcessor;
exports.getCurrentHub = hub_1.getCurrentHub;
exports.getHubFromCarrier = hub_1.getHubFromCarrier;
exports.Hub = hub_1.Hub;
exports.Scope = hub_1.Scope;
var api_1 = require("./api");
exports.API = api_1.API;
var baseclient_1 = require("./baseclient");
exports.BaseClient = baseclient_1.BaseClient;
var basebackend_1 = require("./basebackend");
exports.BaseBackend = basebackend_1.BaseBackend;
var sdk_1 = require("./sdk");
exports.initAndBind = sdk_1.initAndBind;
var noop_1 = require("./transports/noop");
exports.NoopTransport = noop_1.NoopTransport;
var Integrations = require("./integrations");
exports.Integrations = Integrations;

},{"./api":41,"./basebackend":42,"./baseclient":43,"./integrations":48,"./sdk":49,"./transports/noop":50,"@sentry/hub":52,"@sentry/minimal":54}],45:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var hub_1 = require("@sentry/hub");
var utils_1 = require("@sentry/utils");
exports.installedIntegrations = [];
/** Gets integration to install */
function getIntegrationsToSetup(options) {
    var defaultIntegrations = (options.defaultIntegrations && tslib_1.__spread(options.defaultIntegrations)) || [];
    var userIntegrations = options.integrations;
    var integrations = [];
    if (Array.isArray(userIntegrations)) {
        var userIntegrationsNames_1 = userIntegrations.map(function (i) { return i.name; });
        var pickedIntegrationsNames_1 = [];
        // Leave only unique default integrations, that were not overridden with provided user integrations
        defaultIntegrations.forEach(function (defaultIntegration) {
            if (userIntegrationsNames_1.indexOf(defaultIntegration.name) === -1 &&
                pickedIntegrationsNames_1.indexOf(defaultIntegration.name) === -1) {
                integrations.push(defaultIntegration);
                pickedIntegrationsNames_1.push(defaultIntegration.name);
            }
        });
        // Don't add same user integration twice
        userIntegrations.forEach(function (userIntegration) {
            if (pickedIntegrationsNames_1.indexOf(userIntegration.name) === -1) {
                integrations.push(userIntegration);
                pickedIntegrationsNames_1.push(userIntegration.name);
            }
        });
    }
    else if (typeof userIntegrations === 'function') {
        integrations = userIntegrations(defaultIntegrations);
        integrations = Array.isArray(integrations) ? integrations : [integrations];
    }
    else {
        integrations = tslib_1.__spread(defaultIntegrations);
    }
    // Make sure that if present, `Debug` integration will always run last
    var integrationsNames = integrations.map(function (i) { return i.name; });
    var alwaysLastToRun = 'Debug';
    if (integrationsNames.indexOf(alwaysLastToRun) !== -1) {
        integrations.push.apply(integrations, tslib_1.__spread(integrations.splice(integrationsNames.indexOf(alwaysLastToRun), 1)));
    }
    return integrations;
}
exports.getIntegrationsToSetup = getIntegrationsToSetup;
/** Setup given integration */
function setupIntegration(integration) {
    if (exports.installedIntegrations.indexOf(integration.name) !== -1) {
        return;
    }
    integration.setupOnce(hub_1.addGlobalEventProcessor, hub_1.getCurrentHub);
    exports.installedIntegrations.push(integration.name);
    utils_1.logger.log("Integration installed: " + integration.name);
}
exports.setupIntegration = setupIntegration;
/**
 * Given a list of integration instances this installs them all. When `withDefaults` is set to `true` then all default
 * integrations are added unless they were already provided before.
 * @param integrations array of integration instances
 * @param withDefault should enable default integrations
 */
function setupIntegrations(options) {
    var integrations = {};
    getIntegrationsToSetup(options).forEach(function (integration) {
        integrations[integration.name] = integration;
        setupIntegration(integration);
    });
    return integrations;
}
exports.setupIntegrations = setupIntegrations;

},{"@sentry/hub":52,"@sentry/utils":63,"tslib":154}],46:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var originalFunctionToString;
/** Patch toString calls to return proper name for wrapped functions */
var FunctionToString = /** @class */ (function () {
    function FunctionToString() {
        /**
         * @inheritDoc
         */
        this.name = FunctionToString.id;
    }
    /**
     * @inheritDoc
     */
    FunctionToString.prototype.setupOnce = function () {
        originalFunctionToString = Function.prototype.toString;
        Function.prototype.toString = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var context = this.__sentry_original__ || this;
            // tslint:disable-next-line:no-unsafe-any
            return originalFunctionToString.apply(context, args);
        };
    };
    /**
     * @inheritDoc
     */
    FunctionToString.id = 'FunctionToString';
    return FunctionToString;
}());
exports.FunctionToString = FunctionToString;

},{}],47:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var hub_1 = require("@sentry/hub");
var utils_1 = require("@sentry/utils");
// "Script error." is hard coded into browsers for errors that it can't read.
// this is the result of a script being pulled in from an external domain and CORS.
var DEFAULT_IGNORE_ERRORS = [/^Script error\.?$/, /^Javascript error: Script error\.? on line 0$/];
/** Inbound filters configurable by the user */
var InboundFilters = /** @class */ (function () {
    function InboundFilters(_options) {
        if (_options === void 0) { _options = {}; }
        this._options = _options;
        /**
         * @inheritDoc
         */
        this.name = InboundFilters.id;
    }
    /**
     * @inheritDoc
     */
    InboundFilters.prototype.setupOnce = function () {
        hub_1.addGlobalEventProcessor(function (event) {
            var hub = hub_1.getCurrentHub();
            if (!hub) {
                return event;
            }
            var self = hub.getIntegration(InboundFilters);
            if (self) {
                var client = hub.getClient();
                var clientOptions = client ? client.getOptions() : {};
                var options = self._mergeOptions(clientOptions);
                if (self._shouldDropEvent(event, options)) {
                    return null;
                }
            }
            return event;
        });
    };
    /** JSDoc */
    InboundFilters.prototype._shouldDropEvent = function (event, options) {
        if (this._isSentryError(event, options)) {
            utils_1.logger.warn("Event dropped due to being internal Sentry Error.\nEvent: " + utils_1.getEventDescription(event));
            return true;
        }
        if (this._isIgnoredError(event, options)) {
            utils_1.logger.warn("Event dropped due to being matched by `ignoreErrors` option.\nEvent: " + utils_1.getEventDescription(event));
            return true;
        }
        if (this._isBlacklistedUrl(event, options)) {
            utils_1.logger.warn("Event dropped due to being matched by `blacklistUrls` option.\nEvent: " + utils_1.getEventDescription(event) + ".\nUrl: " + this._getEventFilterUrl(event));
            return true;
        }
        if (!this._isWhitelistedUrl(event, options)) {
            utils_1.logger.warn("Event dropped due to not being matched by `whitelistUrls` option.\nEvent: " + utils_1.getEventDescription(event) + ".\nUrl: " + this._getEventFilterUrl(event));
            return true;
        }
        return false;
    };
    /** JSDoc */
    InboundFilters.prototype._isSentryError = function (event, options) {
        if (options === void 0) { options = {}; }
        if (!options.ignoreInternal) {
            return false;
        }
        try {
            return ((event &&
                event.exception &&
                event.exception.values &&
                event.exception.values[0] &&
                event.exception.values[0].type === 'SentryError') ||
                false);
        }
        catch (_oO) {
            return false;
        }
    };
    /** JSDoc */
    InboundFilters.prototype._isIgnoredError = function (event, options) {
        if (options === void 0) { options = {}; }
        if (!options.ignoreErrors || !options.ignoreErrors.length) {
            return false;
        }
        return this._getPossibleEventMessages(event).some(function (message) {
            // Not sure why TypeScript complains here...
            return options.ignoreErrors.some(function (pattern) { return utils_1.isMatchingPattern(message, pattern); });
        });
    };
    /** JSDoc */
    InboundFilters.prototype._isBlacklistedUrl = function (event, options) {
        if (options === void 0) { options = {}; }
        // TODO: Use Glob instead?
        if (!options.blacklistUrls || !options.blacklistUrls.length) {
            return false;
        }
        var url = this._getEventFilterUrl(event);
        return !url ? false : options.blacklistUrls.some(function (pattern) { return utils_1.isMatchingPattern(url, pattern); });
    };
    /** JSDoc */
    InboundFilters.prototype._isWhitelistedUrl = function (event, options) {
        if (options === void 0) { options = {}; }
        // TODO: Use Glob instead?
        if (!options.whitelistUrls || !options.whitelistUrls.length) {
            return true;
        }
        var url = this._getEventFilterUrl(event);
        return !url ? true : options.whitelistUrls.some(function (pattern) { return utils_1.isMatchingPattern(url, pattern); });
    };
    /** JSDoc */
    InboundFilters.prototype._mergeOptions = function (clientOptions) {
        if (clientOptions === void 0) { clientOptions = {}; }
        return {
            blacklistUrls: tslib_1.__spread((this._options.blacklistUrls || []), (clientOptions.blacklistUrls || [])),
            ignoreErrors: tslib_1.__spread((this._options.ignoreErrors || []), (clientOptions.ignoreErrors || []), DEFAULT_IGNORE_ERRORS),
            ignoreInternal: typeof this._options.ignoreInternal !== 'undefined' ? this._options.ignoreInternal : true,
            whitelistUrls: tslib_1.__spread((this._options.whitelistUrls || []), (clientOptions.whitelistUrls || [])),
        };
    };
    /** JSDoc */
    InboundFilters.prototype._getPossibleEventMessages = function (event) {
        if (event.message) {
            return [event.message];
        }
        if (event.exception) {
            try {
                var _a = (event.exception.values && event.exception.values[0]) || {}, _b = _a.type, type = _b === void 0 ? '' : _b, _c = _a.value, value = _c === void 0 ? '' : _c;
                return ["" + value, type + ": " + value];
            }
            catch (oO) {
                utils_1.logger.error("Cannot extract message for event " + utils_1.getEventDescription(event));
                return [];
            }
        }
        return [];
    };
    /** JSDoc */
    InboundFilters.prototype._getEventFilterUrl = function (event) {
        try {
            if (event.stacktrace) {
                var frames_1 = event.stacktrace.frames;
                return (frames_1 && frames_1[frames_1.length - 1].filename) || null;
            }
            if (event.exception) {
                var frames_2 = event.exception.values && event.exception.values[0].stacktrace && event.exception.values[0].stacktrace.frames;
                return (frames_2 && frames_2[frames_2.length - 1].filename) || null;
            }
            return null;
        }
        catch (oO) {
            utils_1.logger.error("Cannot extract url for event " + utils_1.getEventDescription(event));
            return null;
        }
    };
    /**
     * @inheritDoc
     */
    InboundFilters.id = 'InboundFilters';
    return InboundFilters;
}());
exports.InboundFilters = InboundFilters;

},{"@sentry/hub":52,"@sentry/utils":63,"tslib":154}],48:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var functiontostring_1 = require("./functiontostring");
exports.FunctionToString = functiontostring_1.FunctionToString;
var inboundfilters_1 = require("./inboundfilters");
exports.InboundFilters = inboundfilters_1.InboundFilters;

},{"./functiontostring":46,"./inboundfilters":47}],49:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var hub_1 = require("@sentry/hub");
var utils_1 = require("@sentry/utils");
/**
 * Internal function to create a new SDK client instance. The client is
 * installed and then bound to the current scope.
 *
 * @param clientClass The client class to instanciate.
 * @param options Options to pass to the client.
 */
function initAndBind(clientClass, options) {
    if (options.debug === true) {
        utils_1.logger.enable();
    }
    hub_1.getCurrentHub().bindClient(new clientClass(options));
}
exports.initAndBind = initAndBind;

},{"@sentry/hub":52,"@sentry/utils":63}],50:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("@sentry/types");
var utils_1 = require("@sentry/utils");
/** Noop transport */
var NoopTransport = /** @class */ (function () {
    function NoopTransport() {
    }
    /**
     * @inheritDoc
     */
    NoopTransport.prototype.sendEvent = function (_) {
        return utils_1.SyncPromise.resolve({
            reason: "NoopTransport: Event has been skipped because no Dsn is configured.",
            status: types_1.Status.Skipped,
        });
    };
    /**
     * @inheritDoc
     */
    NoopTransport.prototype.close = function (_) {
        return utils_1.SyncPromise.resolve(true);
    };
    return NoopTransport;
}());
exports.NoopTransport = NoopTransport;

},{"@sentry/types":55,"@sentry/utils":63}],51:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var utils_1 = require("@sentry/utils");
var scope_1 = require("./scope");
/**
 * API compatibility version of this hub.
 *
 * WARNING: This number should only be incresed when the global interface
 * changes a and new methods are introduced.
 *
 * @hidden
 */
exports.API_VERSION = 3;
/**
 * Default maximum number of breadcrumbs added to an event. Can be overwritten
 * with {@link Options.maxBreadcrumbs}.
 */
var DEFAULT_BREADCRUMBS = 30;
/**
 * Absolute maximum number of breadcrumbs added to an event. The
 * `maxBreadcrumbs` option cannot be higher than this value.
 */
var MAX_BREADCRUMBS = 100;
/**
 * @inheritDoc
 */
var Hub = /** @class */ (function () {
    /**
     * Creates a new instance of the hub, will push one {@link Layer} into the
     * internal stack on creation.
     *
     * @param client bound to the hub.
     * @param scope bound to the hub.
     * @param version number, higher number means higher priority.
     */
    function Hub(client, scope, _version) {
        if (scope === void 0) { scope = new scope_1.Scope(); }
        if (_version === void 0) { _version = exports.API_VERSION; }
        this._version = _version;
        /** Is a {@link Layer}[] containing the client and scope */
        this._stack = [];
        this._stack.push({ client: client, scope: scope });
    }
    /**
     * Internal helper function to call a method on the top client if it exists.
     *
     * @param method The method to call on the client.
     * @param args Arguments to pass to the client function.
     */
    Hub.prototype._invokeClient = function (method) {
        var _a;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var top = this.getStackTop();
        if (top && top.client && top.client[method]) {
            (_a = top.client)[method].apply(_a, tslib_1.__spread(args, [top.scope]));
        }
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.isOlderThan = function (version) {
        return this._version < version;
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.bindClient = function (client) {
        var top = this.getStackTop();
        top.client = client;
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.pushScope = function () {
        // We want to clone the content of prev scope
        var stack = this.getStack();
        var parentScope = stack.length > 0 ? stack[stack.length - 1].scope : undefined;
        var scope = scope_1.Scope.clone(parentScope);
        this.getStack().push({
            client: this.getClient(),
            scope: scope,
        });
        return scope;
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.popScope = function () {
        return this.getStack().pop() !== undefined;
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.withScope = function (callback) {
        var scope = this.pushScope();
        try {
            callback(scope);
        }
        finally {
            this.popScope();
        }
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.getClient = function () {
        return this.getStackTop().client;
    };
    /** Returns the scope of the top stack. */
    Hub.prototype.getScope = function () {
        return this.getStackTop().scope;
    };
    /** Returns the scope stack for domains or the process. */
    Hub.prototype.getStack = function () {
        return this._stack;
    };
    /** Returns the topmost scope layer in the order domain > local > process. */
    Hub.prototype.getStackTop = function () {
        return this._stack[this._stack.length - 1];
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.captureException = function (exception, hint) {
        var eventId = (this._lastEventId = utils_1.uuid4());
        var finalHint = hint;
        // If there's no explicit hint provided, mimick the same thing that would happen
        // in the minimal itself to create a consistent behavior.
        // We don't do this in the client, as it's the lowest level API, and doing this,
        // would prevent user from having full control over direct calls.
        if (!hint) {
            var syntheticException = void 0;
            try {
                throw new Error('Sentry syntheticException');
            }
            catch (exception) {
                syntheticException = exception;
            }
            finalHint = {
                originalException: exception,
                syntheticException: syntheticException,
            };
        }
        this._invokeClient('captureException', exception, tslib_1.__assign({}, finalHint, { event_id: eventId }));
        return eventId;
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.captureMessage = function (message, level, hint) {
        var eventId = (this._lastEventId = utils_1.uuid4());
        var finalHint = hint;
        // If there's no explicit hint provided, mimick the same thing that would happen
        // in the minimal itself to create a consistent behavior.
        // We don't do this in the client, as it's the lowest level API, and doing this,
        // would prevent user from having full control over direct calls.
        if (!hint) {
            var syntheticException = void 0;
            try {
                throw new Error(message);
            }
            catch (exception) {
                syntheticException = exception;
            }
            finalHint = {
                originalException: message,
                syntheticException: syntheticException,
            };
        }
        this._invokeClient('captureMessage', message, level, tslib_1.__assign({}, finalHint, { event_id: eventId }));
        return eventId;
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.captureEvent = function (event, hint) {
        var eventId = (this._lastEventId = utils_1.uuid4());
        this._invokeClient('captureEvent', event, tslib_1.__assign({}, hint, { event_id: eventId }));
        return eventId;
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.lastEventId = function () {
        return this._lastEventId;
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.addBreadcrumb = function (breadcrumb, hint) {
        var top = this.getStackTop();
        if (!top.scope || !top.client) {
            return;
        }
        var _a = (top.client.getOptions && top.client.getOptions()) || {}, _b = _a.beforeBreadcrumb, beforeBreadcrumb = _b === void 0 ? null : _b, _c = _a.maxBreadcrumbs, maxBreadcrumbs = _c === void 0 ? DEFAULT_BREADCRUMBS : _c;
        if (maxBreadcrumbs <= 0) {
            return;
        }
        var timestamp = utils_1.timestampWithMs();
        var mergedBreadcrumb = tslib_1.__assign({ timestamp: timestamp }, breadcrumb);
        var finalBreadcrumb = beforeBreadcrumb
            ? utils_1.consoleSandbox(function () { return beforeBreadcrumb(mergedBreadcrumb, hint); })
            : mergedBreadcrumb;
        if (finalBreadcrumb === null) {
            return;
        }
        top.scope.addBreadcrumb(finalBreadcrumb, Math.min(maxBreadcrumbs, MAX_BREADCRUMBS));
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.setUser = function (user) {
        var top = this.getStackTop();
        if (!top.scope) {
            return;
        }
        top.scope.setUser(user);
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.setTags = function (tags) {
        var top = this.getStackTop();
        if (!top.scope) {
            return;
        }
        top.scope.setTags(tags);
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.setExtras = function (extras) {
        var top = this.getStackTop();
        if (!top.scope) {
            return;
        }
        top.scope.setExtras(extras);
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.setTag = function (key, value) {
        var top = this.getStackTop();
        if (!top.scope) {
            return;
        }
        top.scope.setTag(key, value);
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.setExtra = function (key, extra) {
        var top = this.getStackTop();
        if (!top.scope) {
            return;
        }
        top.scope.setExtra(key, extra);
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.setContext = function (name, context) {
        var top = this.getStackTop();
        if (!top.scope) {
            return;
        }
        top.scope.setContext(name, context);
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.configureScope = function (callback) {
        var top = this.getStackTop();
        if (top.scope && top.client) {
            callback(top.scope);
        }
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.run = function (callback) {
        var oldHub = makeMain(this);
        try {
            callback(this);
        }
        finally {
            makeMain(oldHub);
        }
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.getIntegration = function (integration) {
        var client = this.getClient();
        if (!client) {
            return null;
        }
        try {
            return client.getIntegration(integration);
        }
        catch (_oO) {
            utils_1.logger.warn("Cannot retrieve integration " + integration.id + " from the current Hub");
            return null;
        }
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.startSpan = function (spanOrSpanContext, forceNoChild) {
        if (forceNoChild === void 0) { forceNoChild = false; }
        return this._callExtensionMethod('startSpan', spanOrSpanContext, forceNoChild);
    };
    /**
     * @inheritDoc
     */
    Hub.prototype.traceHeaders = function () {
        return this._callExtensionMethod('traceHeaders');
    };
    /**
     * Calls global extension method and binding current instance to the function call
     */
    // @ts-ignore
    Hub.prototype._callExtensionMethod = function (method) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var carrier = getMainCarrier();
        var sentry = carrier.__SENTRY__;
        // tslint:disable-next-line: strict-type-predicates
        if (sentry && sentry.extensions && typeof sentry.extensions[method] === 'function') {
            return sentry.extensions[method].apply(this, args);
        }
        utils_1.logger.warn("Extension method " + method + " couldn't be found, doing nothing.");
    };
    return Hub;
}());
exports.Hub = Hub;
/** Returns the global shim registry. */
function getMainCarrier() {
    var carrier = utils_1.getGlobalObject();
    carrier.__SENTRY__ = carrier.__SENTRY__ || {
        extensions: {},
        hub: undefined,
    };
    return carrier;
}
exports.getMainCarrier = getMainCarrier;
/**
 * Replaces the current main hub with the passed one on the global object
 *
 * @returns The old replaced hub
 */
function makeMain(hub) {
    var registry = getMainCarrier();
    var oldHub = getHubFromCarrier(registry);
    setHubOnCarrier(registry, hub);
    return oldHub;
}
exports.makeMain = makeMain;
/**
 * Returns the default hub instance.
 *
 * If a hub is already registered in the global carrier but this module
 * contains a more recent version, it replaces the registered version.
 * Otherwise, the currently registered hub will be returned.
 */
function getCurrentHub() {
    // Get main carrier (global for every environment)
    var registry = getMainCarrier();
    // If there's no hub, or its an old API, assign a new one
    if (!hasHubOnCarrier(registry) || getHubFromCarrier(registry).isOlderThan(exports.API_VERSION)) {
        setHubOnCarrier(registry, new Hub());
    }
    // Prefer domains over global if they are there (applicable only to Node environment)
    if (utils_1.isNodeEnv()) {
        return getHubFromActiveDomain(registry);
    }
    // Return hub that lives on a global object
    return getHubFromCarrier(registry);
}
exports.getCurrentHub = getCurrentHub;
/**
 * Try to read the hub from an active domain, fallback to the registry if one doesnt exist
 * @returns discovered hub
 */
function getHubFromActiveDomain(registry) {
    try {
        // We need to use `dynamicRequire` because `require` on it's own will be optimized by webpack.
        // We do not want this to happen, we need to try to `require` the domain node module and fail if we are in browser
        // for example so we do not have to shim it and use `getCurrentHub` universally.
        var domain = utils_1.dynamicRequire(module, 'domain');
        var activeDomain = domain.active;
        // If there no active domain, just return global hub
        if (!activeDomain) {
            return getHubFromCarrier(registry);
        }
        // If there's no hub on current domain, or its an old API, assign a new one
        if (!hasHubOnCarrier(activeDomain) || getHubFromCarrier(activeDomain).isOlderThan(exports.API_VERSION)) {
            var registryHubTopStack = getHubFromCarrier(registry).getStackTop();
            setHubOnCarrier(activeDomain, new Hub(registryHubTopStack.client, scope_1.Scope.clone(registryHubTopStack.scope)));
        }
        // Return hub that lives on a domain
        return getHubFromCarrier(activeDomain);
    }
    catch (_Oo) {
        // Return hub that lives on a global object
        return getHubFromCarrier(registry);
    }
}
/**
 * This will tell whether a carrier has a hub on it or not
 * @param carrier object
 */
function hasHubOnCarrier(carrier) {
    if (carrier && carrier.__SENTRY__ && carrier.__SENTRY__.hub) {
        return true;
    }
    return false;
}
/**
 * This will create a new {@link Hub} and add to the passed object on
 * __SENTRY__.hub.
 * @param carrier object
 * @hidden
 */
function getHubFromCarrier(carrier) {
    if (carrier && carrier.__SENTRY__ && carrier.__SENTRY__.hub) {
        return carrier.__SENTRY__.hub;
    }
    carrier.__SENTRY__ = carrier.__SENTRY__ || {};
    carrier.__SENTRY__.hub = new Hub();
    return carrier.__SENTRY__.hub;
}
exports.getHubFromCarrier = getHubFromCarrier;
/**
 * This will set passed {@link Hub} on the passed object's __SENTRY__.hub attribute
 * @param carrier object
 * @param hub Hub
 */
function setHubOnCarrier(carrier, hub) {
    if (!carrier) {
        return false;
    }
    carrier.__SENTRY__ = carrier.__SENTRY__ || {};
    carrier.__SENTRY__.hub = hub;
    return true;
}
exports.setHubOnCarrier = setHubOnCarrier;

},{"./scope":53,"@sentry/utils":63,"tslib":154}],52:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var scope_1 = require("./scope");
exports.addGlobalEventProcessor = scope_1.addGlobalEventProcessor;
exports.Scope = scope_1.Scope;
var hub_1 = require("./hub");
exports.getCurrentHub = hub_1.getCurrentHub;
exports.getHubFromCarrier = hub_1.getHubFromCarrier;
exports.getMainCarrier = hub_1.getMainCarrier;
exports.Hub = hub_1.Hub;
exports.makeMain = hub_1.makeMain;
exports.setHubOnCarrier = hub_1.setHubOnCarrier;

},{"./hub":51,"./scope":53}],53:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var utils_1 = require("@sentry/utils");
/**
 * Holds additional event information. {@link Scope.applyToEvent} will be
 * called by the client before an event will be sent.
 */
var Scope = /** @class */ (function () {
    function Scope() {
        /** Flag if notifiying is happening. */
        this._notifyingListeners = false;
        /** Callback for client to receive scope changes. */
        this._scopeListeners = [];
        /** Callback list that will be called after {@link applyToEvent}. */
        this._eventProcessors = [];
        /** Array of breadcrumbs. */
        this._breadcrumbs = [];
        /** User */
        this._user = {};
        /** Tags */
        this._tags = {};
        /** Extra */
        this._extra = {};
        /** Contexts */
        this._context = {};
    }
    /**
     * Add internal on change listener. Used for sub SDKs that need to store the scope.
     * @hidden
     */
    Scope.prototype.addScopeListener = function (callback) {
        this._scopeListeners.push(callback);
    };
    /**
     * @inheritDoc
     */
    Scope.prototype.addEventProcessor = function (callback) {
        this._eventProcessors.push(callback);
        return this;
    };
    /**
     * This will be called on every set call.
     */
    Scope.prototype._notifyScopeListeners = function () {
        var _this = this;
        if (!this._notifyingListeners) {
            this._notifyingListeners = true;
            setTimeout(function () {
                _this._scopeListeners.forEach(function (callback) {
                    callback(_this);
                });
                _this._notifyingListeners = false;
            });
        }
    };
    /**
     * This will be called after {@link applyToEvent} is finished.
     */
    Scope.prototype._notifyEventProcessors = function (processors, event, hint, index) {
        var _this = this;
        if (index === void 0) { index = 0; }
        return new utils_1.SyncPromise(function (resolve, reject) {
            var processor = processors[index];
            // tslint:disable-next-line:strict-type-predicates
            if (event === null || typeof processor !== 'function') {
                resolve(event);
            }
            else {
                var result = processor(tslib_1.__assign({}, event), hint);
                if (utils_1.isThenable(result)) {
                    result
                        .then(function (final) { return _this._notifyEventProcessors(processors, final, hint, index + 1).then(resolve); })
                        .then(null, reject);
                }
                else {
                    _this._notifyEventProcessors(processors, result, hint, index + 1)
                        .then(resolve)
                        .then(null, reject);
                }
            }
        });
    };
    /**
     * @inheritDoc
     */
    Scope.prototype.setUser = function (user) {
        this._user = utils_1.normalize(user);
        this._notifyScopeListeners();
        return this;
    };
    /**
     * @inheritDoc
     */
    Scope.prototype.setTags = function (tags) {
        this._tags = tslib_1.__assign({}, this._tags, utils_1.normalize(tags));
        this._notifyScopeListeners();
        return this;
    };
    /**
     * @inheritDoc
     */
    Scope.prototype.setTag = function (key, value) {
        var _a;
        this._tags = tslib_1.__assign({}, this._tags, (_a = {}, _a[key] = utils_1.normalize(value), _a));
        this._notifyScopeListeners();
        return this;
    };
    /**
     * @inheritDoc
     */
    Scope.prototype.setExtras = function (extra) {
        this._extra = tslib_1.__assign({}, this._extra, utils_1.normalize(extra));
        this._notifyScopeListeners();
        return this;
    };
    /**
     * @inheritDoc
     */
    Scope.prototype.setExtra = function (key, extra) {
        var _a;
        this._extra = tslib_1.__assign({}, this._extra, (_a = {}, _a[key] = utils_1.normalize(extra), _a));
        this._notifyScopeListeners();
        return this;
    };
    /**
     * @inheritDoc
     */
    Scope.prototype.setFingerprint = function (fingerprint) {
        this._fingerprint = utils_1.normalize(fingerprint);
        this._notifyScopeListeners();
        return this;
    };
    /**
     * @inheritDoc
     */
    Scope.prototype.setLevel = function (level) {
        this._level = utils_1.normalize(level);
        this._notifyScopeListeners();
        return this;
    };
    /**
     * @inheritDoc
     */
    Scope.prototype.setTransaction = function (transaction) {
        this._transaction = transaction;
        this._notifyScopeListeners();
        return this;
    };
    /**
     * @inheritDoc
     */
    Scope.prototype.setContext = function (name, context) {
        this._context[name] = context ? utils_1.normalize(context) : undefined;
        this._notifyScopeListeners();
        return this;
    };
    /**
     * @inheritDoc
     */
    Scope.prototype.setSpan = function (span) {
        this._span = span;
        this._notifyScopeListeners();
        return this;
    };
    /**
     * Internal getter for Span, used in Hub.
     * @hidden
     */
    Scope.prototype.getSpan = function () {
        return this._span;
    };
    /**
     * Inherit values from the parent scope.
     * @param scope to clone.
     */
    Scope.clone = function (scope) {
        var newScope = new Scope();
        if (scope) {
            newScope._breadcrumbs = tslib_1.__spread(scope._breadcrumbs);
            newScope._tags = tslib_1.__assign({}, scope._tags);
            newScope._extra = tslib_1.__assign({}, scope._extra);
            newScope._context = tslib_1.__assign({}, scope._context);
            newScope._user = scope._user;
            newScope._level = scope._level;
            newScope._span = scope._span;
            newScope._transaction = scope._transaction;
            newScope._fingerprint = scope._fingerprint;
            newScope._eventProcessors = tslib_1.__spread(scope._eventProcessors);
        }
        return newScope;
    };
    /**
     * @inheritDoc
     */
    Scope.prototype.clear = function () {
        this._breadcrumbs = [];
        this._tags = {};
        this._extra = {};
        this._user = {};
        this._context = {};
        this._level = undefined;
        this._transaction = undefined;
        this._fingerprint = undefined;
        this._span = undefined;
        this._notifyScopeListeners();
        return this;
    };
    /**
     * @inheritDoc
     */
    Scope.prototype.addBreadcrumb = function (breadcrumb, maxBreadcrumbs) {
        var timestamp = utils_1.timestampWithMs();
        var mergedBreadcrumb = tslib_1.__assign({ timestamp: timestamp }, breadcrumb);
        this._breadcrumbs =
            maxBreadcrumbs !== undefined && maxBreadcrumbs >= 0
                ? tslib_1.__spread(this._breadcrumbs, [utils_1.normalize(mergedBreadcrumb)]).slice(-maxBreadcrumbs)
                : tslib_1.__spread(this._breadcrumbs, [utils_1.normalize(mergedBreadcrumb)]);
        this._notifyScopeListeners();
        return this;
    };
    /**
     * @inheritDoc
     */
    Scope.prototype.clearBreadcrumbs = function () {
        this._breadcrumbs = [];
        this._notifyScopeListeners();
        return this;
    };
    /**
     * Applies fingerprint from the scope to the event if there's one,
     * uses message if there's one instead or get rid of empty fingerprint
     */
    Scope.prototype._applyFingerprint = function (event) {
        // Make sure it's an array first and we actually have something in place
        event.fingerprint = event.fingerprint
            ? Array.isArray(event.fingerprint)
                ? event.fingerprint
                : [event.fingerprint]
            : [];
        // If we have something on the scope, then merge it with event
        if (this._fingerprint) {
            event.fingerprint = event.fingerprint.concat(this._fingerprint);
        }
        // If we have no data at all, remove empty array default
        if (event.fingerprint && !event.fingerprint.length) {
            delete event.fingerprint;
        }
    };
    /**
     * Applies the current context and fingerprint to the event.
     * Note that breadcrumbs will be added by the client.
     * Also if the event has already breadcrumbs on it, we do not merge them.
     * @param event Event
     * @param hint May contain additional informartion about the original exception.
     * @hidden
     */
    Scope.prototype.applyToEvent = function (event, hint) {
        if (this._extra && Object.keys(this._extra).length) {
            event.extra = tslib_1.__assign({}, this._extra, event.extra);
        }
        if (this._tags && Object.keys(this._tags).length) {
            event.tags = tslib_1.__assign({}, this._tags, event.tags);
        }
        if (this._user && Object.keys(this._user).length) {
            event.user = tslib_1.__assign({}, this._user, event.user);
        }
        if (this._context && Object.keys(this._context).length) {
            event.contexts = tslib_1.__assign({}, this._context, event.contexts);
        }
        if (this._level) {
            event.level = this._level;
        }
        if (this._transaction) {
            event.transaction = this._transaction;
        }
        if (this._span) {
            event.contexts = event.contexts || {};
            event.contexts.trace = this._span.getTraceContext();
        }
        this._applyFingerprint(event);
        event.breadcrumbs = tslib_1.__spread((event.breadcrumbs || []), this._breadcrumbs);
        event.breadcrumbs = event.breadcrumbs.length > 0 ? event.breadcrumbs : undefined;
        return this._notifyEventProcessors(tslib_1.__spread(getGlobalEventProcessors(), this._eventProcessors), event, hint);
    };
    return Scope;
}());
exports.Scope = Scope;
/**
 * Retruns the global event processors.
 */
function getGlobalEventProcessors() {
    var global = utils_1.getGlobalObject();
    global.__SENTRY__ = global.__SENTRY__ || {};
    global.__SENTRY__.globalEventProcessors = global.__SENTRY__.globalEventProcessors || [];
    return global.__SENTRY__.globalEventProcessors;
}
/**
 * Add a EventProcessor to be kept globally.
 * @param callback EventProcessor to add
 */
function addGlobalEventProcessor(callback) {
    getGlobalEventProcessors().push(callback);
}
exports.addGlobalEventProcessor = addGlobalEventProcessor;

},{"@sentry/utils":63,"tslib":154}],54:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var hub_1 = require("@sentry/hub");
/**
 * This calls a function on the current hub.
 * @param method function to call on hub.
 * @param args to pass to function.
 */
function callOnHub(method) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var hub = hub_1.getCurrentHub();
    if (hub && hub[method]) {
        // tslint:disable-next-line:no-unsafe-any
        return hub[method].apply(hub, tslib_1.__spread(args));
    }
    throw new Error("No hub defined or " + method + " was not found on the hub, please open a bug report.");
}
/**
 * Captures an exception event and sends it to Sentry.
 *
 * @param exception An exception-like object.
 * @returns The generated eventId.
 */
function captureException(exception) {
    var syntheticException;
    try {
        throw new Error('Sentry syntheticException');
    }
    catch (exception) {
        syntheticException = exception;
    }
    return callOnHub('captureException', exception, {
        originalException: exception,
        syntheticException: syntheticException,
    });
}
exports.captureException = captureException;
/**
 * Captures a message event and sends it to Sentry.
 *
 * @param message The message to send to Sentry.
 * @param level Define the level of the message.
 * @returns The generated eventId.
 */
function captureMessage(message, level) {
    var syntheticException;
    try {
        throw new Error(message);
    }
    catch (exception) {
        syntheticException = exception;
    }
    return callOnHub('captureMessage', message, level, {
        originalException: message,
        syntheticException: syntheticException,
    });
}
exports.captureMessage = captureMessage;
/**
 * Captures a manually created event and sends it to Sentry.
 *
 * @param event The event to send to Sentry.
 * @returns The generated eventId.
 */
function captureEvent(event) {
    return callOnHub('captureEvent', event);
}
exports.captureEvent = captureEvent;
/**
 * Callback to set context information onto the scope.
 * @param callback Callback function that receives Scope.
 */
function configureScope(callback) {
    callOnHub('configureScope', callback);
}
exports.configureScope = configureScope;
/**
 * Records a new breadcrumb which will be attached to future events.
 *
 * Breadcrumbs will be added to subsequent events to provide more context on
 * user's actions prior to an error or crash.
 *
 * @param breadcrumb The breadcrumb to record.
 */
function addBreadcrumb(breadcrumb) {
    callOnHub('addBreadcrumb', breadcrumb);
}
exports.addBreadcrumb = addBreadcrumb;
/**
 * Sets context data with the given name.
 * @param name of the context
 * @param context Any kind of data. This data will be normailzed.
 */
function setContext(name, context) {
    callOnHub('setContext', name, context);
}
exports.setContext = setContext;
/**
 * Set an object that will be merged sent as extra data with the event.
 * @param extras Extras object to merge into current context.
 */
function setExtras(extras) {
    callOnHub('setExtras', extras);
}
exports.setExtras = setExtras;
/**
 * Set an object that will be merged sent as tags data with the event.
 * @param tags Tags context object to merge into current context.
 */
function setTags(tags) {
    callOnHub('setTags', tags);
}
exports.setTags = setTags;
/**
 * Set key:value that will be sent as extra data with the event.
 * @param key String of extra
 * @param extra Any kind of data. This data will be normailzed.
 */
function setExtra(key, extra) {
    callOnHub('setExtra', key, extra);
}
exports.setExtra = setExtra;
/**
 * Set key:value that will be sent as tags data with the event.
 * @param key String key of tag
 * @param value String value of tag
 */
function setTag(key, value) {
    callOnHub('setTag', key, value);
}
exports.setTag = setTag;
/**
 * Updates user context information for future events.
 *
 * @param user User context object to be set in the current context. Pass `null` to unset the user.
 */
function setUser(user) {
    callOnHub('setUser', user);
}
exports.setUser = setUser;
/**
 * Creates a new scope with and executes the given operation within.
 * The scope is automatically removed once the operation
 * finishes or throws.
 *
 * This is essentially a convenience function for:
 *
 *     pushScope();
 *     callback();
 *     popScope();
 *
 * @param callback that will be enclosed into push/popScope.
 */
function withScope(callback) {
    callOnHub('withScope', callback);
}
exports.withScope = withScope;
/**
 * Calls a function on the latest client. Use this with caution, it's meant as
 * in "internal" helper so we don't need to expose every possible function in
 * the shim. It is not guaranteed that the client actually implements the
 * function.
 *
 * @param method The method to call on the client/client.
 * @param args Arguments to pass to the client/fontend.
 * @hidden
 */
function _callOnClient(method) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    callOnHub.apply(void 0, tslib_1.__spread(['_invokeClient', method], args));
}
exports._callOnClient = _callOnClient;

},{"@sentry/hub":52,"tslib":154}],55:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var loglevel_1 = require("./loglevel");
exports.LogLevel = loglevel_1.LogLevel;
var severity_1 = require("./severity");
exports.Severity = severity_1.Severity;
var span_1 = require("./span");
exports.SpanStatus = span_1.SpanStatus;
var status_1 = require("./status");
exports.Status = status_1.Status;

},{"./loglevel":56,"./severity":57,"./span":58,"./status":59}],56:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
/** Console logging verbosity for the SDK. */
var LogLevel;
(function (LogLevel) {
    /** No logs will be generated. */
    LogLevel[LogLevel["None"] = 0] = "None";
    /** Only SDK internal errors will be logged. */
    LogLevel[LogLevel["Error"] = 1] = "Error";
    /** Information useful for debugging the SDK will be logged. */
    LogLevel[LogLevel["Debug"] = 2] = "Debug";
    /** All SDK actions will be logged. */
    LogLevel[LogLevel["Verbose"] = 3] = "Verbose";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));

},{}],57:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
/** JSDoc */
var Severity;
(function (Severity) {
    /** JSDoc */
    Severity["Fatal"] = "fatal";
    /** JSDoc */
    Severity["Error"] = "error";
    /** JSDoc */
    Severity["Warning"] = "warning";
    /** JSDoc */
    Severity["Log"] = "log";
    /** JSDoc */
    Severity["Info"] = "info";
    /** JSDoc */
    Severity["Debug"] = "debug";
    /** JSDoc */
    Severity["Critical"] = "critical";
})(Severity = exports.Severity || (exports.Severity = {}));
// tslint:disable:completed-docs
// tslint:disable:no-unnecessary-qualifier no-namespace
(function (Severity) {
    /**
     * Converts a string-based level into a {@link Severity}.
     *
     * @param level string representation of Severity
     * @returns Severity
     */
    function fromString(level) {
        switch (level) {
            case 'debug':
                return Severity.Debug;
            case 'info':
                return Severity.Info;
            case 'warn':
            case 'warning':
                return Severity.Warning;
            case 'error':
                return Severity.Error;
            case 'fatal':
                return Severity.Fatal;
            case 'critical':
                return Severity.Critical;
            case 'log':
            default:
                return Severity.Log;
        }
    }
    Severity.fromString = fromString;
})(Severity = exports.Severity || (exports.Severity = {}));

},{}],58:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
/** The status of an Span. */
var SpanStatus;
(function (SpanStatus) {
    /** The operation completed successfully. */
    SpanStatus["Ok"] = "ok";
    /** Deadline expired before operation could complete. */
    SpanStatus["DealineExceeded"] = "deadline_exceeded";
    /** 401 Unauthorized (actually does mean unauthenticated according to RFC 7235) */
    SpanStatus["Unauthenticated"] = "unauthenticated";
    /** 403 Forbidden */
    SpanStatus["PermissionDenied"] = "permission_denied";
    /** 404 Not Found. Some requested entity (file or directory) was not found. */
    SpanStatus["NotFound"] = "not_found";
    /** 429 Too Many Requests */
    SpanStatus["ResourceExhausted"] = "resource_exhausted";
    /** Client specified an invalid argument. 4xx. */
    SpanStatus["InvalidArgument"] = "invalid_argument";
    /** 501 Not Implemented */
    SpanStatus["Unimplemented"] = "unimplemented";
    /** 503 Service Unavailable */
    SpanStatus["Unavailable"] = "unavailable";
    /** Other/generic 5xx. */
    SpanStatus["InternalError"] = "internal_error";
    /** Unknown. Any non-standard HTTP status code. */
    SpanStatus["UnknownError"] = "unknown_error";
    /** The operation was cancelled (typically by the user). */
    SpanStatus["Cancelled"] = "cancelled";
    /** Already exists (409) */
    SpanStatus["AlreadyExists"] = "already_exists";
    /** Operation was rejected because the system is not in a state required for the operation's */
    SpanStatus["FailedPrecondition"] = "failed_precondition";
    /** The operation was aborted, typically due to a concurrency issue. */
    SpanStatus["Aborted"] = "aborted";
    /** Operation was attempted past the valid range. */
    SpanStatus["OutOfRange"] = "out_of_range";
    /** Unrecoverable data loss or corruption */
    SpanStatus["DataLoss"] = "data_loss";
})(SpanStatus = exports.SpanStatus || (exports.SpanStatus = {}));
// tslint:disable:no-unnecessary-qualifier no-namespace
(function (SpanStatus) {
    /**
     * Converts a HTTP status code into a {@link SpanStatus}.
     *
     * @param httpStatus The HTTP response status code.
     * @returns The span status or {@link SpanStatus.UnknownError}.
     */
    // tslint:disable-next-line:completed-docs
    function fromHttpCode(httpStatus) {
        if (httpStatus < 400) {
            return SpanStatus.Ok;
        }
        if (httpStatus >= 400 && httpStatus < 500) {
            switch (httpStatus) {
                case 401:
                    return SpanStatus.Unauthenticated;
                case 403:
                    return SpanStatus.PermissionDenied;
                case 404:
                    return SpanStatus.NotFound;
                case 409:
                    return SpanStatus.AlreadyExists;
                case 413:
                    return SpanStatus.FailedPrecondition;
                case 429:
                    return SpanStatus.ResourceExhausted;
                default:
                    return SpanStatus.InvalidArgument;
            }
        }
        if (httpStatus >= 500 && httpStatus < 600) {
            switch (httpStatus) {
                case 501:
                    return SpanStatus.Unimplemented;
                case 503:
                    return SpanStatus.Unavailable;
                case 504:
                    return SpanStatus.DealineExceeded;
                default:
                    return SpanStatus.InternalError;
            }
        }
        return SpanStatus.UnknownError;
    }
    SpanStatus.fromHttpCode = fromHttpCode;
})(SpanStatus = exports.SpanStatus || (exports.SpanStatus = {}));

},{}],59:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
/** The status of an event. */
var Status;
(function (Status) {
    /** The status could not be determined. */
    Status["Unknown"] = "unknown";
    /** The event was skipped due to configuration or callbacks. */
    Status["Skipped"] = "skipped";
    /** The event was sent to Sentry successfully. */
    Status["Success"] = "success";
    /** The client is currently rate limited and will try again later. */
    Status["RateLimit"] = "rate_limit";
    /** The event could not be processed. */
    Status["Invalid"] = "invalid";
    /** A server-side error ocurred during submission. */
    Status["Failed"] = "failed";
})(Status = exports.Status || (exports.Status = {}));
// tslint:disable:completed-docs
// tslint:disable:no-unnecessary-qualifier no-namespace
(function (Status) {
    /**
     * Converts a HTTP status code into a {@link Status}.
     *
     * @param code The HTTP response status code.
     * @returns The send status or {@link Status.Unknown}.
     */
    function fromHttpCode(code) {
        if (code >= 200 && code < 300) {
            return Status.Success;
        }
        if (code === 429) {
            return Status.RateLimit;
        }
        if (code >= 400 && code < 500) {
            return Status.Invalid;
        }
        if (code >= 500) {
            return Status.Failed;
        }
        return Status.Unknown;
    }
    Status.fromHttpCode = fromHttpCode;
})(Status = exports.Status || (exports.Status = {}));

},{}],60:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Consumes the promise and logs the error when it rejects.
 * @param promise A promise to forget.
 */
function forget(promise) {
    promise.then(null, function (e) {
        // TODO: Use a better logging mechanism
        console.error(e);
    });
}
exports.forget = forget;

},{}],61:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var error_1 = require("./error");
/** Regular expression used to parse a Dsn. */
var DSN_REGEX = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+))?@)([\w\.-]+)(?::(\d+))?\/(.+)/;
/** Error message */
var ERROR_MESSAGE = 'Invalid Dsn';
/** The Sentry Dsn, identifying a Sentry instance and project. */
var Dsn = /** @class */ (function () {
    /** Creates a new Dsn component */
    function Dsn(from) {
        if (typeof from === 'string') {
            this._fromString(from);
        }
        else {
            this._fromComponents(from);
        }
        this._validate();
    }
    /**
     * Renders the string representation of this Dsn.
     *
     * By default, this will render the public representation without the password
     * component. To get the deprecated private _representation, set `withPassword`
     * to true.
     *
     * @param withPassword When set to true, the password will be included.
     */
    Dsn.prototype.toString = function (withPassword) {
        if (withPassword === void 0) { withPassword = false; }
        // tslint:disable-next-line:no-this-assignment
        var _a = this, host = _a.host, path = _a.path, pass = _a.pass, port = _a.port, projectId = _a.projectId, protocol = _a.protocol, user = _a.user;
        return (protocol + "://" + user + (withPassword && pass ? ":" + pass : '') +
            ("@" + host + (port ? ":" + port : '') + "/" + (path ? path + "/" : path) + projectId));
    };
    /** Parses a string into this Dsn. */
    Dsn.prototype._fromString = function (str) {
        var match = DSN_REGEX.exec(str);
        if (!match) {
            throw new error_1.SentryError(ERROR_MESSAGE);
        }
        var _a = tslib_1.__read(match.slice(1), 6), protocol = _a[0], user = _a[1], _b = _a[2], pass = _b === void 0 ? '' : _b, host = _a[3], _c = _a[4], port = _c === void 0 ? '' : _c, lastPath = _a[5];
        var path = '';
        var projectId = lastPath;
        var split = projectId.split('/');
        if (split.length > 1) {
            path = split.slice(0, -1).join('/');
            projectId = split.pop();
        }
        this._fromComponents({ host: host, pass: pass, path: path, projectId: projectId, port: port, protocol: protocol, user: user });
    };
    /** Maps Dsn components into this instance. */
    Dsn.prototype._fromComponents = function (components) {
        this.protocol = components.protocol;
        this.user = components.user;
        this.pass = components.pass || '';
        this.host = components.host;
        this.port = components.port || '';
        this.path = components.path || '';
        this.projectId = components.projectId;
    };
    /** Validates this Dsn and throws on error. */
    Dsn.prototype._validate = function () {
        var _this = this;
        ['protocol', 'user', 'host', 'projectId'].forEach(function (component) {
            if (!_this[component]) {
                throw new error_1.SentryError(ERROR_MESSAGE);
            }
        });
        if (this.protocol !== 'http' && this.protocol !== 'https') {
            throw new error_1.SentryError(ERROR_MESSAGE);
        }
        if (this.port && isNaN(parseInt(this.port, 10))) {
            throw new error_1.SentryError(ERROR_MESSAGE);
        }
    };
    return Dsn;
}());
exports.Dsn = Dsn;

},{"./error":62,"tslib":154}],62:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var polyfill_1 = require("./polyfill");
/** An error emitted by Sentry SDKs and related utilities. */
var SentryError = /** @class */ (function (_super) {
    tslib_1.__extends(SentryError, _super);
    function SentryError(message) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, message) || this;
        _this.message = message;
        // tslint:disable:no-unsafe-any
        _this.name = _newTarget.prototype.constructor.name;
        polyfill_1.setPrototypeOf(_this, _newTarget.prototype);
        return _this;
    }
    return SentryError;
}(Error));
exports.SentryError = SentryError;

},{"./polyfill":71,"tslib":154}],63:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
tslib_1.__exportStar(require("./async"), exports);
tslib_1.__exportStar(require("./error"), exports);
tslib_1.__exportStar(require("./is"), exports);
tslib_1.__exportStar(require("./logger"), exports);
tslib_1.__exportStar(require("./memo"), exports);
tslib_1.__exportStar(require("./misc"), exports);
tslib_1.__exportStar(require("./object"), exports);
tslib_1.__exportStar(require("./path"), exports);
tslib_1.__exportStar(require("./promisebuffer"), exports);
tslib_1.__exportStar(require("./string"), exports);
tslib_1.__exportStar(require("./supports"), exports);
tslib_1.__exportStar(require("./syncpromise"), exports);
tslib_1.__exportStar(require("./instrument"), exports);
tslib_1.__exportStar(require("./dsn"), exports);

},{"./async":60,"./dsn":61,"./error":62,"./instrument":64,"./is":65,"./logger":66,"./memo":67,"./misc":68,"./object":69,"./path":70,"./promisebuffer":72,"./string":73,"./supports":74,"./syncpromise":75,"tslib":154}],64:[function(require,module,exports){
/* tslint:disable:only-arrow-functions no-unsafe-any */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var is_1 = require("./is");
var logger_1 = require("./logger");
var misc_1 = require("./misc");
var object_1 = require("./object");
var supports_1 = require("./supports");
var global = misc_1.getGlobalObject();
/**
 * Instrument native APIs to call handlers that can be used to create breadcrumbs, APM spans etc.
 *  - Console API
 *  - Fetch API
 *  - XHR API
 *  - History API
 *  - DOM API (click/typing)
 */
var handlers = {};
var instrumented = {};
/** Instruments given API */
function instrument(type) {
    if (instrumented[type]) {
        return;
    }
    instrumented[type] = true;
    switch (type) {
        case 'console':
            instrumentConsole();
            break;
        case 'dom':
            instrumentDOM();
            break;
        case 'xhr':
            instrumentXHR();
            break;
        case 'fetch':
            instrumentFetch();
            break;
        case 'history':
            instrumentHistory();
            break;
        default:
            logger_1.logger.warn('unknown instrumentation type:', type);
    }
}
/**
 * Add handler that will be called when given type of instrumentation triggers.
 * Use at your own risk, this might break without changelog notice, only used internally.
 * @hidden
 */
function addInstrumentationHandler(handler) {
    // tslint:disable-next-line:strict-type-predicates
    if (!handler || typeof handler.type !== 'string' || typeof handler.callback !== 'function') {
        return;
    }
    handlers[handler.type] = handlers[handler.type] || [];
    handlers[handler.type].push(handler.callback);
    instrument(handler.type);
}
exports.addInstrumentationHandler = addInstrumentationHandler;
/** JSDoc */
function triggerHandlers(type, data) {
    var e_1, _a;
    if (!type || !handlers[type]) {
        return;
    }
    try {
        for (var _b = tslib_1.__values(handlers[type] || []), _c = _b.next(); !_c.done; _c = _b.next()) {
            var handler = _c.value;
            try {
                handler(data);
            }
            catch (e) {
                logger_1.logger.error("Error while triggering instrumentation handler.\nType: " + type + "\nName: " + misc_1.getFunctionName(handler) + "\nError: " + e);
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
}
/** JSDoc */
function instrumentConsole() {
    if (!('console' in global)) {
        return;
    }
    ['debug', 'info', 'warn', 'error', 'log', 'assert'].forEach(function (level) {
        if (!(level in global.console)) {
            return;
        }
        object_1.fill(global.console, level, function (originalConsoleLevel) {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                triggerHandlers('console', { args: args, level: level });
                // this fails for some browsers. :(
                if (originalConsoleLevel) {
                    Function.prototype.apply.call(originalConsoleLevel, global.console, args);
                }
            };
        });
    });
}
/** JSDoc */
function instrumentFetch() {
    if (!supports_1.supportsNativeFetch()) {
        return;
    }
    object_1.fill(global, 'fetch', function (originalFetch) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var commonHandlerData = {
                args: args,
                fetchData: {
                    method: getFetchMethod(args),
                    url: getFetchUrl(args),
                },
                startTimestamp: Date.now(),
            };
            triggerHandlers('fetch', tslib_1.__assign({}, commonHandlerData));
            return originalFetch.apply(global, args).then(function (response) {
                triggerHandlers('fetch', tslib_1.__assign({}, commonHandlerData, { endTimestamp: Date.now(), response: response }));
                return response;
            }, function (error) {
                triggerHandlers('fetch', tslib_1.__assign({}, commonHandlerData, { endTimestamp: Date.now(), error: error }));
                throw error;
            });
        };
    });
}
/** Extract `method` from fetch call arguments */
function getFetchMethod(fetchArgs) {
    if (fetchArgs === void 0) { fetchArgs = []; }
    if ('Request' in global && is_1.isInstanceOf(fetchArgs[0], Request) && fetchArgs[0].method) {
        return String(fetchArgs[0].method).toUpperCase();
    }
    if (fetchArgs[1] && fetchArgs[1].method) {
        return String(fetchArgs[1].method).toUpperCase();
    }
    return 'GET';
}
/** Extract `url` from fetch call arguments */
function getFetchUrl(fetchArgs) {
    if (fetchArgs === void 0) { fetchArgs = []; }
    if (typeof fetchArgs[0] === 'string') {
        return fetchArgs[0];
    }
    if ('Request' in global && is_1.isInstanceOf(fetchArgs[0], Request)) {
        return fetchArgs[0].url;
    }
    return String(fetchArgs[0]);
}
/** JSDoc */
function instrumentXHR() {
    if (!('XMLHttpRequest' in global)) {
        return;
    }
    var xhrproto = XMLHttpRequest.prototype;
    object_1.fill(xhrproto, 'open', function (originalOpen) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var url = args[1];
            this.__sentry_xhr__ = {
                method: is_1.isString(args[0]) ? args[0].toUpperCase() : args[0],
                url: args[1],
            };
            // if Sentry key appears in URL, don't capture it as a request
            if (is_1.isString(url) && this.__sentry_xhr__.method === 'POST' && url.match(/sentry_key/)) {
                this.__sentry_own_request__ = true;
            }
            return originalOpen.apply(this, args);
        };
    });
    object_1.fill(xhrproto, 'send', function (originalSend) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var xhr = this; // tslint:disable-line:no-this-assignment
            var commonHandlerData = {
                args: args,
                startTimestamp: Date.now(),
                xhr: xhr,
            };
            triggerHandlers('xhr', tslib_1.__assign({}, commonHandlerData));
            /**
             * @hidden
             */
            function onreadystatechangeHandler() {
                if (xhr.readyState === 4) {
                    try {
                        // touching statusCode in some platforms throws
                        // an exception
                        if (xhr.__sentry_xhr__) {
                            xhr.__sentry_xhr__.status_code = xhr.status;
                        }
                    }
                    catch (e) {
                        /* do nothing */
                    }
                    triggerHandlers('xhr', tslib_1.__assign({}, commonHandlerData, { endTimestamp: Date.now() }));
                }
            }
            if ('onreadystatechange' in xhr && typeof xhr.onreadystatechange === 'function') {
                object_1.fill(xhr, 'onreadystatechange', function (original) {
                    return function () {
                        var readyStateArgs = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            readyStateArgs[_i] = arguments[_i];
                        }
                        onreadystatechangeHandler();
                        return original.apply(xhr, readyStateArgs);
                    };
                });
            }
            else {
                // if onreadystatechange wasn't actually set by the page on this xhr, we
                // are free to set our own and capture the breadcrumb
                xhr.onreadystatechange = onreadystatechangeHandler;
            }
            return originalSend.apply(this, args);
        };
    });
}
var lastHref;
/** JSDoc */
function instrumentHistory() {
    if (!supports_1.supportsHistory()) {
        return;
    }
    var oldOnPopState = global.onpopstate;
    global.onpopstate = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var to = global.location.href;
        // keep track of the current URL state, as we always receive only the updated state
        var from = lastHref;
        lastHref = to;
        triggerHandlers('history', {
            from: from,
            to: to,
        });
        if (oldOnPopState) {
            return oldOnPopState.apply(this, args);
        }
    };
    /** @hidden */
    function historyReplacementFunction(originalHistoryFunction) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var url = args.length > 2 ? args[2] : undefined;
            if (url) {
                // coerce to string (this is what pushState does)
                var from = lastHref;
                var to = String(url);
                // keep track of the current URL state, as we always receive only the updated state
                lastHref = to;
                triggerHandlers('history', {
                    from: from,
                    to: to,
                });
            }
            return originalHistoryFunction.apply(this, args);
        };
    }
    object_1.fill(global.history, 'pushState', historyReplacementFunction);
    object_1.fill(global.history, 'replaceState', historyReplacementFunction);
}
/** JSDoc */
function instrumentDOM() {
    if (!('document' in global)) {
        return;
    }
    // Capture breadcrumbs from any click that is unhandled / bubbled up all the way
    // to the document. Do this before we instrument addEventListener.
    global.document.addEventListener('click', domEventHandler('click', triggerHandlers.bind(null, 'dom')), false);
    global.document.addEventListener('keypress', keypressEventHandler(triggerHandlers.bind(null, 'dom')), false);
    // After hooking into document bubbled up click and keypresses events, we also hook into user handled click & keypresses.
    ['EventTarget', 'Node'].forEach(function (target) {
        var proto = global[target] && global[target].prototype;
        if (!proto || !proto.hasOwnProperty || !proto.hasOwnProperty('addEventListener')) {
            return;
        }
        object_1.fill(proto, 'addEventListener', function (original) {
            return function (eventName, fn, options) {
                if (fn && fn.handleEvent) {
                    if (eventName === 'click') {
                        object_1.fill(fn, 'handleEvent', function (innerOriginal) {
                            return function (event) {
                                domEventHandler('click', triggerHandlers.bind(null, 'dom'))(event);
                                return innerOriginal.call(this, event);
                            };
                        });
                    }
                    if (eventName === 'keypress') {
                        object_1.fill(fn, 'handleEvent', function (innerOriginal) {
                            return function (event) {
                                keypressEventHandler(triggerHandlers.bind(null, 'dom'))(event);
                                return innerOriginal.call(this, event);
                            };
                        });
                    }
                }
                else {
                    if (eventName === 'click') {
                        domEventHandler('click', triggerHandlers.bind(null, 'dom'), true)(this);
                    }
                    if (eventName === 'keypress') {
                        keypressEventHandler(triggerHandlers.bind(null, 'dom'))(this);
                    }
                }
                return original.call(this, eventName, fn, options);
            };
        });
        object_1.fill(proto, 'removeEventListener', function (original) {
            return function (eventName, fn, options) {
                var callback = fn;
                try {
                    callback = callback && (callback.__sentry_wrapped__ || callback);
                }
                catch (e) {
                    // ignore, accessing __sentry_wrapped__ will throw in some Selenium environments
                }
                return original.call(this, eventName, callback, options);
            };
        });
    });
}
var debounceDuration = 1000;
var debounceTimer = 0;
var keypressTimeout;
var lastCapturedEvent;
/**
 * Wraps addEventListener to capture UI breadcrumbs
 * @param name the event name (e.g. "click")
 * @param handler function that will be triggered
 * @param debounce decides whether it should wait till another event loop
 * @returns wrapped breadcrumb events handler
 * @hidden
 */
function domEventHandler(name, handler, debounce) {
    if (debounce === void 0) { debounce = false; }
    return function (event) {
        // reset keypress timeout; e.g. triggering a 'click' after
        // a 'keypress' will reset the keypress debounce so that a new
        // set of keypresses can be recorded
        keypressTimeout = undefined;
        // It's possible this handler might trigger multiple times for the same
        // event (e.g. event propagation through node ancestors). Ignore if we've
        // already captured the event.
        if (!event || lastCapturedEvent === event) {
            return;
        }
        lastCapturedEvent = event;
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        if (debounce) {
            debounceTimer = setTimeout(function () {
                handler({ event: event, name: name });
            });
        }
        else {
            handler({ event: event, name: name });
        }
    };
}
/**
 * Wraps addEventListener to capture keypress UI events
 * @param handler function that will be triggered
 * @returns wrapped keypress events handler
 * @hidden
 */
function keypressEventHandler(handler) {
    // TODO: if somehow user switches keypress target before
    //       debounce timeout is triggered, we will only capture
    //       a single breadcrumb from the FIRST target (acceptable?)
    return function (event) {
        var target;
        try {
            target = event.target;
        }
        catch (e) {
            // just accessing event properties can throw an exception in some rare circumstances
            // see: https://github.com/getsentry/raven-js/issues/838
            return;
        }
        var tagName = target && target.tagName;
        // only consider keypress events on actual input elements
        // this will disregard keypresses targeting body (e.g. tabbing
        // through elements, hotkeys, etc)
        if (!tagName || (tagName !== 'INPUT' && tagName !== 'TEXTAREA' && !target.isContentEditable)) {
            return;
        }
        // record first keypress in a series, but ignore subsequent
        // keypresses until debounce clears
        if (!keypressTimeout) {
            domEventHandler('input', handler)(event);
        }
        clearTimeout(keypressTimeout);
        keypressTimeout = setTimeout(function () {
            keypressTimeout = undefined;
        }, debounceDuration);
    };
}

},{"./is":65,"./logger":66,"./misc":68,"./object":69,"./supports":74,"tslib":154}],65:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Checks whether given value's type is one of a few Error or Error-like
 * {@link isError}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isError(wat) {
    switch (Object.prototype.toString.call(wat)) {
        case '[object Error]':
            return true;
        case '[object Exception]':
            return true;
        case '[object DOMException]':
            return true;
        default:
            return isInstanceOf(wat, Error);
    }
}
exports.isError = isError;
/**
 * Checks whether given value's type is ErrorEvent
 * {@link isErrorEvent}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isErrorEvent(wat) {
    return Object.prototype.toString.call(wat) === '[object ErrorEvent]';
}
exports.isErrorEvent = isErrorEvent;
/**
 * Checks whether given value's type is DOMError
 * {@link isDOMError}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isDOMError(wat) {
    return Object.prototype.toString.call(wat) === '[object DOMError]';
}
exports.isDOMError = isDOMError;
/**
 * Checks whether given value's type is DOMException
 * {@link isDOMException}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isDOMException(wat) {
    return Object.prototype.toString.call(wat) === '[object DOMException]';
}
exports.isDOMException = isDOMException;
/**
 * Checks whether given value's type is a string
 * {@link isString}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isString(wat) {
    return Object.prototype.toString.call(wat) === '[object String]';
}
exports.isString = isString;
/**
 * Checks whether given value's is a primitive (undefined, null, number, boolean, string)
 * {@link isPrimitive}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isPrimitive(wat) {
    return wat === null || (typeof wat !== 'object' && typeof wat !== 'function');
}
exports.isPrimitive = isPrimitive;
/**
 * Checks whether given value's type is an object literal
 * {@link isPlainObject}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isPlainObject(wat) {
    return Object.prototype.toString.call(wat) === '[object Object]';
}
exports.isPlainObject = isPlainObject;
/**
 * Checks whether given value's type is an Event instance
 * {@link isEvent}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isEvent(wat) {
    // tslint:disable-next-line:strict-type-predicates
    return typeof Event !== 'undefined' && isInstanceOf(wat, Event);
}
exports.isEvent = isEvent;
/**
 * Checks whether given value's type is an Element instance
 * {@link isElement}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isElement(wat) {
    // tslint:disable-next-line:strict-type-predicates
    return typeof Element !== 'undefined' && isInstanceOf(wat, Element);
}
exports.isElement = isElement;
/**
 * Checks whether given value's type is an regexp
 * {@link isRegExp}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isRegExp(wat) {
    return Object.prototype.toString.call(wat) === '[object RegExp]';
}
exports.isRegExp = isRegExp;
/**
 * Checks whether given value has a then function.
 * @param wat A value to be checked.
 */
function isThenable(wat) {
    // tslint:disable:no-unsafe-any
    return Boolean(wat && wat.then && typeof wat.then === 'function');
    // tslint:enable:no-unsafe-any
}
exports.isThenable = isThenable;
/**
 * Checks whether given value's type is a SyntheticEvent
 * {@link isSyntheticEvent}.
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
function isSyntheticEvent(wat) {
    // tslint:disable-next-line:no-unsafe-any
    return isPlainObject(wat) && 'nativeEvent' in wat && 'preventDefault' in wat && 'stopPropagation' in wat;
}
exports.isSyntheticEvent = isSyntheticEvent;
/**
 * Checks whether given value's type is an instance of provided constructor.
 * {@link isInstanceOf}.
 *
 * @param wat A value to be checked.
 * @param base A constructor to be used in a check.
 * @returns A boolean representing the result.
 */
function isInstanceOf(wat, base) {
    try {
        // tslint:disable-next-line:no-unsafe-any
        return wat instanceof base;
    }
    catch (_e) {
        return false;
    }
}
exports.isInstanceOf = isInstanceOf;

},{}],66:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var misc_1 = require("./misc");
// TODO: Implement different loggers for different environments
var global = misc_1.getGlobalObject();
/** Prefix for logging strings */
var PREFIX = 'Sentry Logger ';
/** JSDoc */
var Logger = /** @class */ (function () {
    /** JSDoc */
    function Logger() {
        this._enabled = false;
    }
    /** JSDoc */
    Logger.prototype.disable = function () {
        this._enabled = false;
    };
    /** JSDoc */
    Logger.prototype.enable = function () {
        this._enabled = true;
    };
    /** JSDoc */
    Logger.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this._enabled) {
            return;
        }
        misc_1.consoleSandbox(function () {
            global.console.log(PREFIX + "[Log]: " + args.join(' ')); // tslint:disable-line:no-console
        });
    };
    /** JSDoc */
    Logger.prototype.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this._enabled) {
            return;
        }
        misc_1.consoleSandbox(function () {
            global.console.warn(PREFIX + "[Warn]: " + args.join(' ')); // tslint:disable-line:no-console
        });
    };
    /** JSDoc */
    Logger.prototype.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this._enabled) {
            return;
        }
        misc_1.consoleSandbox(function () {
            global.console.error(PREFIX + "[Error]: " + args.join(' ')); // tslint:disable-line:no-console
        });
    };
    return Logger;
}());
// Ensure we only have a single logger instance, even if multiple versions of @sentry/utils are being used
global.__SENTRY__ = global.__SENTRY__ || {};
var logger = global.__SENTRY__.logger || (global.__SENTRY__.logger = new Logger());
exports.logger = logger;

},{"./misc":68}],67:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-unsafe-any
/**
 * Memo class used for decycle json objects. Uses WeakSet if available otherwise array.
 */
var Memo = /** @class */ (function () {
    function Memo() {
        // tslint:disable-next-line
        this._hasWeakSet = typeof WeakSet === 'function';
        this._inner = this._hasWeakSet ? new WeakSet() : [];
    }
    /**
     * Sets obj to remember.
     * @param obj Object to remember
     */
    Memo.prototype.memoize = function (obj) {
        if (this._hasWeakSet) {
            if (this._inner.has(obj)) {
                return true;
            }
            this._inner.add(obj);
            return false;
        }
        // tslint:disable-next-line:prefer-for-of
        for (var i = 0; i < this._inner.length; i++) {
            var value = this._inner[i];
            if (value === obj) {
                return true;
            }
        }
        this._inner.push(obj);
        return false;
    };
    /**
     * Removes object from internal storage.
     * @param obj Object to forget
     */
    Memo.prototype.unmemoize = function (obj) {
        if (this._hasWeakSet) {
            this._inner.delete(obj);
        }
        else {
            for (var i = 0; i < this._inner.length; i++) {
                if (this._inner[i] === obj) {
                    this._inner.splice(i, 1);
                    break;
                }
            }
        }
    };
    return Memo;
}());
exports.Memo = Memo;

},{}],68:[function(require,module,exports){
(function (process,global){(function (){
Object.defineProperty(exports, "__esModule", { value: true });
var is_1 = require("./is");
/**
 * Requires a module which is protected _against bundler minification.
 *
 * @param request The module path to resolve
 */
function dynamicRequire(mod, request) {
    // tslint:disable-next-line: no-unsafe-any
    return mod.require(request);
}
exports.dynamicRequire = dynamicRequire;
/**
 * Checks whether we're in the Node.js or Browser environment
 *
 * @returns Answer to given question
 */
function isNodeEnv() {
    // tslint:disable:strict-type-predicates
    return Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]';
}
exports.isNodeEnv = isNodeEnv;
var fallbackGlobalObject = {};
/**
 * Safely get global scope object
 *
 * @returns Global scope object
 */
function getGlobalObject() {
    return (isNodeEnv()
        ? global
        : typeof window !== 'undefined'
            ? window
            : typeof self !== 'undefined'
                ? self
                : fallbackGlobalObject);
}
exports.getGlobalObject = getGlobalObject;
/**
 * UUID4 generator
 *
 * @returns string Generated UUID4.
 */
function uuid4() {
    var global = getGlobalObject();
    var crypto = global.crypto || global.msCrypto;
    if (!(crypto === void 0) && crypto.getRandomValues) {
        // Use window.crypto API if available
        var arr = new Uint16Array(8);
        crypto.getRandomValues(arr);
        // set 4 in byte 7
        // tslint:disable-next-line:no-bitwise
        arr[3] = (arr[3] & 0xfff) | 0x4000;
        // set 2 most significant bits of byte 9 to '10'
        // tslint:disable-next-line:no-bitwise
        arr[4] = (arr[4] & 0x3fff) | 0x8000;
        var pad = function (num) {
            var v = num.toString(16);
            while (v.length < 4) {
                v = "0" + v;
            }
            return v;
        };
        return (pad(arr[0]) + pad(arr[1]) + pad(arr[2]) + pad(arr[3]) + pad(arr[4]) + pad(arr[5]) + pad(arr[6]) + pad(arr[7]));
    }
    // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#2117523
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        // tslint:disable-next-line:no-bitwise
        var r = (Math.random() * 16) | 0;
        // tslint:disable-next-line:no-bitwise
        var v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
exports.uuid4 = uuid4;
/**
 * Parses string form of URL into an object
 * // borrowed from https://tools.ietf.org/html/rfc3986#appendix-B
 * // intentionally using regex and not <a/> href parsing trick because React Native and other
 * // environments where DOM might not be available
 * @returns parsed URL object
 */
function parseUrl(url) {
    if (!url) {
        return {};
    }
    var match = url.match(/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/);
    if (!match) {
        return {};
    }
    // coerce to undefined values to empty string so we don't get 'undefined'
    var query = match[6] || '';
    var fragment = match[8] || '';
    return {
        host: match[4],
        path: match[5],
        protocol: match[2],
        relative: match[5] + query + fragment,
    };
}
exports.parseUrl = parseUrl;
/**
 * Extracts either message or type+value from an event that can be used for user-facing logs
 * @returns event's description
 */
function getEventDescription(event) {
    if (event.message) {
        return event.message;
    }
    if (event.exception && event.exception.values && event.exception.values[0]) {
        var exception = event.exception.values[0];
        if (exception.type && exception.value) {
            return exception.type + ": " + exception.value;
        }
        return exception.type || exception.value || event.event_id || '<unknown>';
    }
    return event.event_id || '<unknown>';
}
exports.getEventDescription = getEventDescription;
/** JSDoc */
function consoleSandbox(callback) {
    var global = getGlobalObject();
    var levels = ['debug', 'info', 'warn', 'error', 'log', 'assert'];
    if (!('console' in global)) {
        return callback();
    }
    var originalConsole = global.console;
    var wrappedLevels = {};
    // Restore all wrapped console methods
    levels.forEach(function (level) {
        if (level in global.console && originalConsole[level].__sentry_original__) {
            wrappedLevels[level] = originalConsole[level];
            originalConsole[level] = originalConsole[level].__sentry_original__;
        }
    });
    // Perform callback manipulations
    var result = callback();
    // Revert restoration to wrapped state
    Object.keys(wrappedLevels).forEach(function (level) {
        originalConsole[level] = wrappedLevels[level];
    });
    return result;
}
exports.consoleSandbox = consoleSandbox;
/**
 * Adds exception values, type and value to an synthetic Exception.
 * @param event The event to modify.
 * @param value Value of the exception.
 * @param type Type of the exception.
 * @hidden
 */
function addExceptionTypeValue(event, value, type) {
    event.exception = event.exception || {};
    event.exception.values = event.exception.values || [];
    event.exception.values[0] = event.exception.values[0] || {};
    event.exception.values[0].value = event.exception.values[0].value || value || '';
    event.exception.values[0].type = event.exception.values[0].type || type || 'Error';
}
exports.addExceptionTypeValue = addExceptionTypeValue;
/**
 * Adds exception mechanism to a given event.
 * @param event The event to modify.
 * @param mechanism Mechanism of the mechanism.
 * @hidden
 */
function addExceptionMechanism(event, mechanism) {
    if (mechanism === void 0) { mechanism = {}; }
    // TODO: Use real type with `keyof Mechanism` thingy and maybe make it better?
    try {
        // @ts-ignore
        // tslint:disable:no-non-null-assertion
        event.exception.values[0].mechanism = event.exception.values[0].mechanism || {};
        Object.keys(mechanism).forEach(function (key) {
            // @ts-ignore
            event.exception.values[0].mechanism[key] = mechanism[key];
        });
    }
    catch (_oO) {
        // no-empty
    }
}
exports.addExceptionMechanism = addExceptionMechanism;
/**
 * A safe form of location.href
 */
function getLocationHref() {
    try {
        return document.location.href;
    }
    catch (oO) {
        return '';
    }
}
exports.getLocationHref = getLocationHref;
/**
 * Given a child DOM element, returns a query-selector statement describing that
 * and its ancestors
 * e.g. [HTMLElement] => body > div > input#foo.btn[name=baz]
 * @returns generated DOM path
 */
function htmlTreeAsString(elem) {
    // try/catch both:
    // - accessing event.target (see getsentry/raven-js#838, #768)
    // - `htmlTreeAsString` because it's complex, and just accessing the DOM incorrectly
    // - can throw an exception in some circumstances.
    try {
        var currentElem = elem;
        var MAX_TRAVERSE_HEIGHT = 5;
        var MAX_OUTPUT_LEN = 80;
        var out = [];
        var height = 0;
        var len = 0;
        var separator = ' > ';
        var sepLength = separator.length;
        var nextStr = void 0;
        while (currentElem && height++ < MAX_TRAVERSE_HEIGHT) {
            nextStr = _htmlElementAsString(currentElem);
            // bail out if
            // - nextStr is the 'html' element
            // - the length of the string that would be created exceeds MAX_OUTPUT_LEN
            //   (ignore this limit if we are on the first iteration)
            if (nextStr === 'html' || (height > 1 && len + out.length * sepLength + nextStr.length >= MAX_OUTPUT_LEN)) {
                break;
            }
            out.push(nextStr);
            len += nextStr.length;
            currentElem = currentElem.parentNode;
        }
        return out.reverse().join(separator);
    }
    catch (_oO) {
        return '<unknown>';
    }
}
exports.htmlTreeAsString = htmlTreeAsString;
/**
 * Returns a simple, query-selector representation of a DOM element
 * e.g. [HTMLElement] => input#foo.btn[name=baz]
 * @returns generated DOM path
 */
function _htmlElementAsString(el) {
    var elem = el;
    var out = [];
    var className;
    var classes;
    var key;
    var attr;
    var i;
    if (!elem || !elem.tagName) {
        return '';
    }
    out.push(elem.tagName.toLowerCase());
    if (elem.id) {
        out.push("#" + elem.id);
    }
    className = elem.className;
    if (className && is_1.isString(className)) {
        classes = className.split(/\s+/);
        for (i = 0; i < classes.length; i++) {
            out.push("." + classes[i]);
        }
    }
    var attrWhitelist = ['type', 'name', 'title', 'alt'];
    for (i = 0; i < attrWhitelist.length; i++) {
        key = attrWhitelist[i];
        attr = elem.getAttribute(key);
        if (attr) {
            out.push("[" + key + "=\"" + attr + "\"]");
        }
    }
    return out.join('');
}
/**
 * Returns a timestamp in seconds with milliseconds precision.
 */
function timestampWithMs() {
    return new Date().getTime() / 1000;
}
exports.timestampWithMs = timestampWithMs;
// https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
var SEMVER_REGEXP = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
/**
 * Parses input into a SemVer interface
 * @param input string representation of a semver version
 */
function parseSemver(input) {
    var match = input.match(SEMVER_REGEXP) || [];
    var major = parseInt(match[1], 10);
    var minor = parseInt(match[2], 10);
    var patch = parseInt(match[3], 10);
    return {
        buildmetadata: match[5],
        major: isNaN(major) ? undefined : major,
        minor: isNaN(minor) ? undefined : minor,
        patch: isNaN(patch) ? undefined : patch,
        prerelease: match[4],
    };
}
exports.parseSemver = parseSemver;
var defaultRetryAfter = 60 * 1000; // 60 seconds
/**
 * Extracts Retry-After value from the request header or returns default value
 * @param now current unix timestamp
 * @param header string representation of 'Retry-After' header
 */
function parseRetryAfterHeader(now, header) {
    if (!header) {
        return defaultRetryAfter;
    }
    var headerDelay = parseInt("" + header, 10);
    if (!isNaN(headerDelay)) {
        return headerDelay * 1000;
    }
    var headerDate = Date.parse("" + header);
    if (!isNaN(headerDate)) {
        return headerDate - now;
    }
    return defaultRetryAfter;
}
exports.parseRetryAfterHeader = parseRetryAfterHeader;
var defaultFunctionName = '<anonymous>';
/**
 * Safely extract function name from itself
 */
function getFunctionName(fn) {
    try {
        if (!fn || typeof fn !== 'function') {
            return defaultFunctionName;
        }
        return fn.name || defaultFunctionName;
    }
    catch (e) {
        // Just accessing custom props in some Selenium environments
        // can cause a "Permission denied" exception (see raven-js#495).
        return defaultFunctionName;
    }
}
exports.getFunctionName = getFunctionName;

}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./is":65,"_process":138}],69:[function(require,module,exports){
(function (global){(function (){
Object.defineProperty(exports, "__esModule", { value: true });
var is_1 = require("./is");
var memo_1 = require("./memo");
var misc_1 = require("./misc");
var string_1 = require("./string");
/**
 * Wrap a given object method with a higher-order function
 *
 * @param source An object that contains a method to be wrapped.
 * @param name A name of method to be wrapped.
 * @param replacement A function that should be used to wrap a given method.
 * @returns void
 */
function fill(source, name, replacement) {
    if (!(name in source)) {
        return;
    }
    var original = source[name];
    var wrapped = replacement(original);
    // Make sure it's a function first, as we need to attach an empty prototype for `defineProperties` to work
    // otherwise it'll throw "TypeError: Object.defineProperties called on non-object"
    // tslint:disable-next-line:strict-type-predicates
    if (typeof wrapped === 'function') {
        try {
            wrapped.prototype = wrapped.prototype || {};
            Object.defineProperties(wrapped, {
                __sentry_original__: {
                    enumerable: false,
                    value: original,
                },
            });
        }
        catch (_Oo) {
            // This can throw if multiple fill happens on a global object like XMLHttpRequest
            // Fixes https://github.com/getsentry/sentry-javascript/issues/2043
        }
    }
    source[name] = wrapped;
}
exports.fill = fill;
/**
 * Encodes given object into url-friendly format
 *
 * @param object An object that contains serializable values
 * @returns string Encoded
 */
function urlEncode(object) {
    return Object.keys(object)
        .map(
    // tslint:disable-next-line:no-unsafe-any
    function (key) { return encodeURIComponent(key) + "=" + encodeURIComponent(object[key]); })
        .join('&');
}
exports.urlEncode = urlEncode;
/**
 * Transforms any object into an object literal with all it's attributes
 * attached to it.
 *
 * @param value Initial source that we have to transform in order to be usable by the serializer
 */
function getWalkSource(value) {
    if (is_1.isError(value)) {
        var error = value;
        var err = {
            message: error.message,
            name: error.name,
            stack: error.stack,
        };
        for (var i in error) {
            if (Object.prototype.hasOwnProperty.call(error, i)) {
                err[i] = error[i];
            }
        }
        return err;
    }
    if (is_1.isEvent(value)) {
        var event_1 = value;
        var source = {};
        source.type = event_1.type;
        // Accessing event.target can throw (see getsentry/raven-js#838, #768)
        try {
            source.target = is_1.isElement(event_1.target)
                ? misc_1.htmlTreeAsString(event_1.target)
                : Object.prototype.toString.call(event_1.target);
        }
        catch (_oO) {
            source.target = '<unknown>';
        }
        try {
            source.currentTarget = is_1.isElement(event_1.currentTarget)
                ? misc_1.htmlTreeAsString(event_1.currentTarget)
                : Object.prototype.toString.call(event_1.currentTarget);
        }
        catch (_oO) {
            source.currentTarget = '<unknown>';
        }
        // tslint:disable-next-line:strict-type-predicates
        if (typeof CustomEvent !== 'undefined' && is_1.isInstanceOf(value, CustomEvent)) {
            source.detail = event_1.detail;
        }
        for (var i in event_1) {
            if (Object.prototype.hasOwnProperty.call(event_1, i)) {
                source[i] = event_1;
            }
        }
        return source;
    }
    return value;
}
/** Calculates bytes size of input string */
function utf8Length(value) {
    // tslint:disable-next-line:no-bitwise
    return ~-encodeURI(value).split(/%..|./).length;
}
/** Calculates bytes size of input object */
function jsonSize(value) {
    return utf8Length(JSON.stringify(value));
}
/** JSDoc */
function normalizeToSize(object, 
// Default Node.js REPL depth
depth, 
// 100kB, as 200kB is max payload size, so half sounds reasonable
maxSize) {
    if (depth === void 0) { depth = 3; }
    if (maxSize === void 0) { maxSize = 100 * 1024; }
    var serialized = normalize(object, depth);
    if (jsonSize(serialized) > maxSize) {
        return normalizeToSize(object, depth - 1, maxSize);
    }
    return serialized;
}
exports.normalizeToSize = normalizeToSize;
/** Transforms any input value into a string form, either primitive value or a type of the input */
function serializeValue(value) {
    var type = Object.prototype.toString.call(value);
    // Node.js REPL notation
    if (typeof value === 'string') {
        return value;
    }
    if (type === '[object Object]') {
        return '[Object]';
    }
    if (type === '[object Array]') {
        return '[Array]';
    }
    var normalized = normalizeValue(value);
    return is_1.isPrimitive(normalized) ? normalized : type;
}
/**
 * normalizeValue()
 *
 * Takes unserializable input and make it serializable friendly
 *
 * - translates undefined/NaN values to "[undefined]"/"[NaN]" respectively,
 * - serializes Error objects
 * - filter global objects
 */
// tslint:disable-next-line:cyclomatic-complexity
function normalizeValue(value, key) {
    if (key === 'domain' && value && typeof value === 'object' && value._events) {
        return '[Domain]';
    }
    if (key === 'domainEmitter') {
        return '[DomainEmitter]';
    }
    if (typeof global !== 'undefined' && value === global) {
        return '[Global]';
    }
    if (typeof window !== 'undefined' && value === window) {
        return '[Window]';
    }
    if (typeof document !== 'undefined' && value === document) {
        return '[Document]';
    }
    // React's SyntheticEvent thingy
    if (is_1.isSyntheticEvent(value)) {
        return '[SyntheticEvent]';
    }
    // tslint:disable-next-line:no-tautology-expression
    if (typeof value === 'number' && value !== value) {
        return '[NaN]';
    }
    if (value === void 0) {
        return '[undefined]';
    }
    if (typeof value === 'function') {
        return "[Function: " + misc_1.getFunctionName(value) + "]";
    }
    return value;
}
/**
 * Walks an object to perform a normalization on it
 *
 * @param key of object that's walked in current iteration
 * @param value object to be walked
 * @param depth Optional number indicating how deep should walking be performed
 * @param memo Optional Memo class handling decycling
 */
function walk(key, value, depth, memo) {
    if (depth === void 0) { depth = +Infinity; }
    if (memo === void 0) { memo = new memo_1.Memo(); }
    // If we reach the maximum depth, serialize whatever has left
    if (depth === 0) {
        return serializeValue(value);
    }
    // If value implements `toJSON` method, call it and return early
    // tslint:disable:no-unsafe-any
    if (value !== null && value !== undefined && typeof value.toJSON === 'function') {
        return value.toJSON();
    }
    // tslint:enable:no-unsafe-any
    // If normalized value is a primitive, there are no branches left to walk, so we can just bail out, as theres no point in going down that branch any further
    var normalized = normalizeValue(value, key);
    if (is_1.isPrimitive(normalized)) {
        return normalized;
    }
    // Create source that we will use for next itterations, either objectified error object (Error type with extracted keys:value pairs) or the input itself
    var source = getWalkSource(value);
    // Create an accumulator that will act as a parent for all future itterations of that branch
    var acc = Array.isArray(value) ? [] : {};
    // If we already walked that branch, bail out, as it's circular reference
    if (memo.memoize(value)) {
        return '[Circular ~]';
    }
    // Walk all keys of the source
    for (var innerKey in source) {
        // Avoid iterating over fields in the prototype if they've somehow been exposed to enumeration.
        if (!Object.prototype.hasOwnProperty.call(source, innerKey)) {
            continue;
        }
        // Recursively walk through all the child nodes
        acc[innerKey] = walk(innerKey, source[innerKey], depth - 1, memo);
    }
    // Once walked through all the branches, remove the parent from memo storage
    memo.unmemoize(value);
    // Return accumulated values
    return acc;
}
exports.walk = walk;
/**
 * normalize()
 *
 * - Creates a copy to prevent original input mutation
 * - Skip non-enumerablers
 * - Calls `toJSON` if implemented
 * - Removes circular references
 * - Translates non-serializeable values (undefined/NaN/Functions) to serializable format
 * - Translates known global objects/Classes to a string representations
 * - Takes care of Error objects serialization
 * - Optionally limit depth of final output
 */
function normalize(input, depth) {
    try {
        // tslint:disable-next-line:no-unsafe-any
        return JSON.parse(JSON.stringify(input, function (key, value) { return walk(key, value, depth); }));
    }
    catch (_oO) {
        return '**non-serializable**';
    }
}
exports.normalize = normalize;
/**
 * Given any captured exception, extract its keys and create a sorted
 * and truncated list that will be used inside the event message.
 * eg. `Non-error exception captured with keys: foo, bar, baz`
 */
function extractExceptionKeysForMessage(exception, maxLength) {
    if (maxLength === void 0) { maxLength = 40; }
    // tslint:disable:strict-type-predicates
    var keys = Object.keys(getWalkSource(exception));
    keys.sort();
    if (!keys.length) {
        return '[object has no keys]';
    }
    if (keys[0].length >= maxLength) {
        return string_1.truncate(keys[0], maxLength);
    }
    for (var includedKeys = keys.length; includedKeys > 0; includedKeys--) {
        var serialized = keys.slice(0, includedKeys).join(', ');
        if (serialized.length > maxLength) {
            continue;
        }
        if (includedKeys === keys.length) {
            return serialized;
        }
        return string_1.truncate(serialized, maxLength);
    }
    return '';
}
exports.extractExceptionKeysForMessage = extractExceptionKeysForMessage;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./is":65,"./memo":67,"./misc":68,"./string":73}],70:[function(require,module,exports){
// Slightly modified (no IE8 support, ES6) and transcribed to TypeScript
// https://raw.githubusercontent.com/calvinmetcalf/rollup-plugin-node-builtins/master/src/es6/path.js
Object.defineProperty(exports, "__esModule", { value: true });
/** JSDoc */
function normalizeArray(parts, allowAboveRoot) {
    // if the path tries to go above the root, `up` ends up > 0
    var up = 0;
    for (var i = parts.length - 1; i >= 0; i--) {
        var last = parts[i];
        if (last === '.') {
            parts.splice(i, 1);
        }
        else if (last === '..') {
            parts.splice(i, 1);
            up++;
        }
        else if (up) {
            parts.splice(i, 1);
            up--;
        }
    }
    // if the path is allowed to go above the root, restore leading ..s
    if (allowAboveRoot) {
        for (; up--; up) {
            parts.unshift('..');
        }
    }
    return parts;
}
// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
/** JSDoc */
function splitPath(filename) {
    var parts = splitPathRe.exec(filename);
    return parts ? parts.slice(1) : [];
}
// path.resolve([from ...], to)
// posix version
/** JSDoc */
function resolve() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var resolvedPath = '';
    var resolvedAbsolute = false;
    for (var i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
        var path = i >= 0 ? args[i] : '/';
        // Skip empty entries
        if (!path) {
            continue;
        }
        resolvedPath = path + "/" + resolvedPath;
        resolvedAbsolute = path.charAt(0) === '/';
    }
    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)
    // Normalize the path
    resolvedPath = normalizeArray(resolvedPath.split('/').filter(function (p) { return !!p; }), !resolvedAbsolute).join('/');
    return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
}
exports.resolve = resolve;
/** JSDoc */
function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
        if (arr[start] !== '') {
            break;
        }
    }
    var end = arr.length - 1;
    for (; end >= 0; end--) {
        if (arr[end] !== '') {
            break;
        }
    }
    if (start > end) {
        return [];
    }
    return arr.slice(start, end - start + 1);
}
// path.relative(from, to)
// posix version
/** JSDoc */
function relative(from, to) {
    // tslint:disable:no-parameter-reassignment
    from = resolve(from).substr(1);
    to = resolve(to).substr(1);
    var fromParts = trim(from.split('/'));
    var toParts = trim(to.split('/'));
    var length = Math.min(fromParts.length, toParts.length);
    var samePartsLength = length;
    for (var i = 0; i < length; i++) {
        if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
        }
    }
    var outputParts = [];
    for (var i = samePartsLength; i < fromParts.length; i++) {
        outputParts.push('..');
    }
    outputParts = outputParts.concat(toParts.slice(samePartsLength));
    return outputParts.join('/');
}
exports.relative = relative;
// path.normalize(path)
// posix version
/** JSDoc */
function normalizePath(path) {
    var isPathAbsolute = isAbsolute(path);
    var trailingSlash = path.substr(-1) === '/';
    // Normalize the path
    var normalizedPath = normalizeArray(path.split('/').filter(function (p) { return !!p; }), !isPathAbsolute).join('/');
    if (!normalizedPath && !isPathAbsolute) {
        normalizedPath = '.';
    }
    if (normalizedPath && trailingSlash) {
        normalizedPath += '/';
    }
    return (isPathAbsolute ? '/' : '') + normalizedPath;
}
exports.normalizePath = normalizePath;
// posix version
/** JSDoc */
function isAbsolute(path) {
    return path.charAt(0) === '/';
}
exports.isAbsolute = isAbsolute;
// posix version
/** JSDoc */
function join() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return normalizePath(args.join('/'));
}
exports.join = join;
/** JSDoc */
function dirname(path) {
    var result = splitPath(path);
    var root = result[0];
    var dir = result[1];
    if (!root && !dir) {
        // No dirname whatsoever
        return '.';
    }
    if (dir) {
        // It has a dirname, strip trailing slash
        dir = dir.substr(0, dir.length - 1);
    }
    return root + dir;
}
exports.dirname = dirname;
/** JSDoc */
function basename(path, ext) {
    var f = splitPath(path)[2];
    if (ext && f.substr(ext.length * -1) === ext) {
        f = f.substr(0, f.length - ext.length);
    }
    return f;
}
exports.basename = basename;

},{}],71:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPrototypeOf = Object.setPrototypeOf || ({ __proto__: [] } instanceof Array ? setProtoOf : mixinProperties); // tslint:disable-line:no-unbound-method
/**
 * setPrototypeOf polyfill using __proto__
 */
function setProtoOf(obj, proto) {
    // @ts-ignore
    obj.__proto__ = proto;
    return obj;
}
/**
 * setPrototypeOf polyfill using mixin
 */
function mixinProperties(obj, proto) {
    for (var prop in proto) {
        if (!obj.hasOwnProperty(prop)) {
            // @ts-ignore
            obj[prop] = proto[prop];
        }
    }
    return obj;
}

},{}],72:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var error_1 = require("./error");
var syncpromise_1 = require("./syncpromise");
/** A simple queue that holds promises. */
var PromiseBuffer = /** @class */ (function () {
    function PromiseBuffer(_limit) {
        this._limit = _limit;
        /** Internal set of queued Promises */
        this._buffer = [];
    }
    /**
     * Says if the buffer is ready to take more requests
     */
    PromiseBuffer.prototype.isReady = function () {
        return this._limit === undefined || this.length() < this._limit;
    };
    /**
     * Add a promise to the queue.
     *
     * @param task Can be any PromiseLike<T>
     * @returns The original promise.
     */
    PromiseBuffer.prototype.add = function (task) {
        var _this = this;
        if (!this.isReady()) {
            return syncpromise_1.SyncPromise.reject(new error_1.SentryError('Not adding Promise due to buffer limit reached.'));
        }
        if (this._buffer.indexOf(task) === -1) {
            this._buffer.push(task);
        }
        task
            .then(function () { return _this.remove(task); })
            .then(null, function () {
            return _this.remove(task).then(null, function () {
                // We have to add this catch here otherwise we have an unhandledPromiseRejection
                // because it's a new Promise chain.
            });
        });
        return task;
    };
    /**
     * Remove a promise to the queue.
     *
     * @param task Can be any PromiseLike<T>
     * @returns Removed promise.
     */
    PromiseBuffer.prototype.remove = function (task) {
        var removedTask = this._buffer.splice(this._buffer.indexOf(task), 1)[0];
        return removedTask;
    };
    /**
     * This function returns the number of unresolved promises in the queue.
     */
    PromiseBuffer.prototype.length = function () {
        return this._buffer.length;
    };
    /**
     * This will drain the whole queue, returns true if queue is empty or drained.
     * If timeout is provided and the queue takes longer to drain, the promise still resolves but with false.
     *
     * @param timeout Number in ms to wait until it resolves with false.
     */
    PromiseBuffer.prototype.drain = function (timeout) {
        var _this = this;
        return new syncpromise_1.SyncPromise(function (resolve) {
            var capturedSetTimeout = setTimeout(function () {
                if (timeout && timeout > 0) {
                    resolve(false);
                }
            }, timeout);
            syncpromise_1.SyncPromise.all(_this._buffer)
                .then(function () {
                clearTimeout(capturedSetTimeout);
                resolve(true);
            })
                .then(null, function () {
                resolve(true);
            });
        });
    };
    return PromiseBuffer;
}());
exports.PromiseBuffer = PromiseBuffer;

},{"./error":62,"./syncpromise":75}],73:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var is_1 = require("./is");
/**
 * Truncates given string to the maximum characters count
 *
 * @param str An object that contains serializable values
 * @param max Maximum number of characters in truncated string
 * @returns string Encoded
 */
function truncate(str, max) {
    if (max === void 0) { max = 0; }
    // tslint:disable-next-line:strict-type-predicates
    if (typeof str !== 'string' || max === 0) {
        return str;
    }
    return str.length <= max ? str : str.substr(0, max) + "...";
}
exports.truncate = truncate;
/**
 * This is basically just `trim_line` from
 * https://github.com/getsentry/sentry/blob/master/src/sentry/lang/javascript/processor.py#L67
 *
 * @param str An object that contains serializable values
 * @param max Maximum number of characters in truncated string
 * @returns string Encoded
 */
function snipLine(line, colno) {
    var newLine = line;
    var ll = newLine.length;
    if (ll <= 150) {
        return newLine;
    }
    if (colno > ll) {
        colno = ll; // tslint:disable-line:no-parameter-reassignment
    }
    var start = Math.max(colno - 60, 0);
    if (start < 5) {
        start = 0;
    }
    var end = Math.min(start + 140, ll);
    if (end > ll - 5) {
        end = ll;
    }
    if (end === ll) {
        start = Math.max(end - 140, 0);
    }
    newLine = newLine.slice(start, end);
    if (start > 0) {
        newLine = "'{snip} " + newLine;
    }
    if (end < ll) {
        newLine += ' {snip}';
    }
    return newLine;
}
exports.snipLine = snipLine;
/**
 * Join values in array
 * @param input array of values to be joined together
 * @param delimiter string to be placed in-between values
 * @returns Joined values
 */
function safeJoin(input, delimiter) {
    if (!Array.isArray(input)) {
        return '';
    }
    var output = [];
    // tslint:disable-next-line:prefer-for-of
    for (var i = 0; i < input.length; i++) {
        var value = input[i];
        try {
            output.push(String(value));
        }
        catch (e) {
            output.push('[value cannot be serialized]');
        }
    }
    return output.join(delimiter);
}
exports.safeJoin = safeJoin;
/**
 * Checks if the value matches a regex or includes the string
 * @param value The string value to be checked against
 * @param pattern Either a regex or a string that must be contained in value
 */
function isMatchingPattern(value, pattern) {
    if (is_1.isRegExp(pattern)) {
        return pattern.test(value);
    }
    if (typeof pattern === 'string') {
        return value.indexOf(pattern) !== -1;
    }
    return false;
}
exports.isMatchingPattern = isMatchingPattern;

},{"./is":65}],74:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("./logger");
var misc_1 = require("./misc");
/**
 * Tells whether current environment supports ErrorEvent objects
 * {@link supportsErrorEvent}.
 *
 * @returns Answer to the given question.
 */
function supportsErrorEvent() {
    try {
        // tslint:disable:no-unused-expression
        new ErrorEvent('');
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.supportsErrorEvent = supportsErrorEvent;
/**
 * Tells whether current environment supports DOMError objects
 * {@link supportsDOMError}.
 *
 * @returns Answer to the given question.
 */
function supportsDOMError() {
    try {
        // It really needs 1 argument, not 0.
        // Chrome: VM89:1 Uncaught TypeError: Failed to construct 'DOMError':
        // 1 argument required, but only 0 present.
        // @ts-ignore
        // tslint:disable:no-unused-expression
        new DOMError('');
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.supportsDOMError = supportsDOMError;
/**
 * Tells whether current environment supports DOMException objects
 * {@link supportsDOMException}.
 *
 * @returns Answer to the given question.
 */
function supportsDOMException() {
    try {
        // tslint:disable:no-unused-expression
        new DOMException('');
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.supportsDOMException = supportsDOMException;
/**
 * Tells whether current environment supports Fetch API
 * {@link supportsFetch}.
 *
 * @returns Answer to the given question.
 */
function supportsFetch() {
    if (!('fetch' in misc_1.getGlobalObject())) {
        return false;
    }
    try {
        // tslint:disable-next-line:no-unused-expression
        new Headers();
        // tslint:disable-next-line:no-unused-expression
        new Request('');
        // tslint:disable-next-line:no-unused-expression
        new Response();
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.supportsFetch = supportsFetch;
/**
 * isNativeFetch checks if the given function is a native implementation of fetch()
 */
function isNativeFetch(func) {
    return func && /^function fetch\(\)\s+\{\s+\[native code\]\s+\}$/.test(func.toString());
}
/**
 * Tells whether current environment supports Fetch API natively
 * {@link supportsNativeFetch}.
 *
 * @returns true if `window.fetch` is natively implemented, false otherwise
 */
function supportsNativeFetch() {
    if (!supportsFetch()) {
        return false;
    }
    var global = misc_1.getGlobalObject();
    // Fast path to avoid DOM I/O
    // tslint:disable-next-line:no-unbound-method
    if (isNativeFetch(global.fetch)) {
        return true;
    }
    // window.fetch is implemented, but is polyfilled or already wrapped (e.g: by a chrome extension)
    // so create a "pure" iframe to see if that has native fetch
    var result = false;
    var doc = global.document;
    if (doc) {
        var sandbox = doc.createElement('iframe');
        sandbox.hidden = true;
        try {
            doc.head.appendChild(sandbox);
            if (sandbox.contentWindow && sandbox.contentWindow.fetch) {
                // tslint:disable-next-line:no-unbound-method
                result = isNativeFetch(sandbox.contentWindow.fetch);
            }
            doc.head.removeChild(sandbox);
        }
        catch (err) {
            logger_1.logger.warn('Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ', err);
        }
    }
    return result;
}
exports.supportsNativeFetch = supportsNativeFetch;
/**
 * Tells whether current environment supports ReportingObserver API
 * {@link supportsReportingObserver}.
 *
 * @returns Answer to the given question.
 */
function supportsReportingObserver() {
    // tslint:disable-next-line: no-unsafe-any
    return 'ReportingObserver' in misc_1.getGlobalObject();
}
exports.supportsReportingObserver = supportsReportingObserver;
/**
 * Tells whether current environment supports Referrer Policy API
 * {@link supportsReferrerPolicy}.
 *
 * @returns Answer to the given question.
 */
function supportsReferrerPolicy() {
    // Despite all stars in the sky saying that Edge supports old draft syntax, aka 'never', 'always', 'origin' and 'default
    // https://caniuse.com/#feat=referrer-policy
    // It doesn't. And it throw exception instead of ignoring this parameter...
    // REF: https://github.com/getsentry/raven-js/issues/1233
    if (!supportsFetch()) {
        return false;
    }
    try {
        // tslint:disable:no-unused-expression
        new Request('_', {
            referrerPolicy: 'origin',
        });
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.supportsReferrerPolicy = supportsReferrerPolicy;
/**
 * Tells whether current environment supports History API
 * {@link supportsHistory}.
 *
 * @returns Answer to the given question.
 */
function supportsHistory() {
    // NOTE: in Chrome App environment, touching history.pushState, *even inside
    //       a try/catch block*, will cause Chrome to output an error to console.error
    // borrowed from: https://github.com/angular/angular.js/pull/13945/files
    var global = misc_1.getGlobalObject();
    var chrome = global.chrome;
    // tslint:disable-next-line:no-unsafe-any
    var isChromePackagedApp = chrome && chrome.app && chrome.app.runtime;
    var hasHistoryApi = 'history' in global && !!global.history.pushState && !!global.history.replaceState;
    return !isChromePackagedApp && hasHistoryApi;
}
exports.supportsHistory = supportsHistory;

},{"./logger":66,"./misc":68}],75:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
var is_1 = require("./is");
/** SyncPromise internal states */
var States;
(function (States) {
    /** Pending */
    States["PENDING"] = "PENDING";
    /** Resolved / OK */
    States["RESOLVED"] = "RESOLVED";
    /** Rejected / Error */
    States["REJECTED"] = "REJECTED";
})(States || (States = {}));
/**
 * Thenable class that behaves like a Promise and follows it's interface
 * but is not async internally
 */
var SyncPromise = /** @class */ (function () {
    function SyncPromise(executor) {
        var _this = this;
        this._state = States.PENDING;
        this._handlers = [];
        /** JSDoc */
        this._resolve = function (value) {
            _this._setResult(States.RESOLVED, value);
        };
        /** JSDoc */
        this._reject = function (reason) {
            _this._setResult(States.REJECTED, reason);
        };
        /** JSDoc */
        this._setResult = function (state, value) {
            if (_this._state !== States.PENDING) {
                return;
            }
            if (is_1.isThenable(value)) {
                value.then(_this._resolve, _this._reject);
                return;
            }
            _this._state = state;
            _this._value = value;
            _this._executeHandlers();
        };
        // TODO: FIXME
        /** JSDoc */
        this._attachHandler = function (handler) {
            _this._handlers = _this._handlers.concat(handler);
            _this._executeHandlers();
        };
        /** JSDoc */
        this._executeHandlers = function () {
            if (_this._state === States.PENDING) {
                return;
            }
            if (_this._state === States.REJECTED) {
                _this._handlers.forEach(function (handler) {
                    if (handler.onrejected) {
                        handler.onrejected(_this._value);
                    }
                });
            }
            else {
                _this._handlers.forEach(function (handler) {
                    if (handler.onfulfilled) {
                        // tslint:disable-next-line:no-unsafe-any
                        handler.onfulfilled(_this._value);
                    }
                });
            }
            _this._handlers = [];
        };
        try {
            executor(this._resolve, this._reject);
        }
        catch (e) {
            this._reject(e);
        }
    }
    /** JSDoc */
    SyncPromise.prototype.toString = function () {
        return '[object SyncPromise]';
    };
    /** JSDoc */
    SyncPromise.resolve = function (value) {
        return new SyncPromise(function (resolve) {
            resolve(value);
        });
    };
    /** JSDoc */
    SyncPromise.reject = function (reason) {
        return new SyncPromise(function (_, reject) {
            reject(reason);
        });
    };
    /** JSDoc */
    SyncPromise.all = function (collection) {
        return new SyncPromise(function (resolve, reject) {
            if (!Array.isArray(collection)) {
                reject(new TypeError("Promise.all requires an array as input."));
                return;
            }
            if (collection.length === 0) {
                resolve([]);
                return;
            }
            var counter = collection.length;
            var resolvedCollection = [];
            collection.forEach(function (item, index) {
                SyncPromise.resolve(item)
                    .then(function (value) {
                    resolvedCollection[index] = value;
                    counter -= 1;
                    if (counter !== 0) {
                        return;
                    }
                    resolve(resolvedCollection);
                })
                    .then(null, reject);
            });
        });
    };
    /** JSDoc */
    SyncPromise.prototype.then = function (onfulfilled, onrejected) {
        var _this = this;
        return new SyncPromise(function (resolve, reject) {
            _this._attachHandler({
                onfulfilled: function (result) {
                    if (!onfulfilled) {
                        // TODO: ¯\_(ツ)_/¯
                        // TODO: FIXME
                        resolve(result);
                        return;
                    }
                    try {
                        resolve(onfulfilled(result));
                        return;
                    }
                    catch (e) {
                        reject(e);
                        return;
                    }
                },
                onrejected: function (reason) {
                    if (!onrejected) {
                        reject(reason);
                        return;
                    }
                    try {
                        resolve(onrejected(reason));
                        return;
                    }
                    catch (e) {
                        reject(e);
                        return;
                    }
                },
            });
        });
    };
    /** JSDoc */
    SyncPromise.prototype.catch = function (onrejected) {
        return this.then(function (val) { return val; }, onrejected);
    };
    /** JSDoc */
    SyncPromise.prototype.finally = function (onfinally) {
        var _this = this;
        return new SyncPromise(function (resolve, reject) {
            var val;
            var isRejected;
            return _this.then(function (value) {
                isRejected = false;
                val = value;
                if (onfinally) {
                    onfinally();
                }
            }, function (reason) {
                isRejected = true;
                val = reason;
                if (onfinally) {
                    onfinally();
                }
            }).then(function () {
                if (isRejected) {
                    reject(val);
                    return;
                }
                // tslint:disable-next-line:no-unsafe-any
                resolve(val);
            });
        });
    };
    return SyncPromise;
}());
exports.SyncPromise = SyncPromise;

},{"./is":65}],76:[function(require,module,exports){
(function (global){(function (){
/*! http://mths.be/base64 v0.1.0 by @mathias | MIT license */
;(function(root) {

	// Detect free variables `exports`.
	var freeExports = typeof exports == 'object' && exports;

	// Detect free variable `module`.
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code, and use
	// it as `root`.
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	var InvalidCharacterError = function(message) {
		this.message = message;
	};
	InvalidCharacterError.prototype = new Error;
	InvalidCharacterError.prototype.name = 'InvalidCharacterError';

	var error = function(message) {
		// Note: the error messages used throughout this file match those used by
		// the native `atob`/`btoa` implementation in Chromium.
		throw new InvalidCharacterError(message);
	};

	var TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	// http://whatwg.org/html/common-microsyntaxes.html#space-character
	var REGEX_SPACE_CHARACTERS = /[\t\n\f\r ]/g;

	// `decode` is designed to be fully compatible with `atob` as described in the
	// HTML Standard. http://whatwg.org/html/webappapis.html#dom-windowbase64-atob
	// The optimized base64-decoding algorithm used is based on @atk’s excellent
	// implementation. https://gist.github.com/atk/1020396
	var decode = function(input) {
		input = String(input)
			.replace(REGEX_SPACE_CHARACTERS, '');
		var length = input.length;
		if (length % 4 == 0) {
			input = input.replace(/==?$/, '');
			length = input.length;
		}
		if (
			length % 4 == 1 ||
			// http://whatwg.org/C#alphanumeric-ascii-characters
			/[^+a-zA-Z0-9/]/.test(input)
		) {
			error(
				'Invalid character: the string to be decoded is not correctly encoded.'
			);
		}
		var bitCounter = 0;
		var bitStorage;
		var buffer;
		var output = '';
		var position = -1;
		while (++position < length) {
			buffer = TABLE.indexOf(input.charAt(position));
			bitStorage = bitCounter % 4 ? bitStorage * 64 + buffer : buffer;
			// Unless this is the first of a group of 4 characters…
			if (bitCounter++ % 4) {
				// …convert the first 8 bits to a single ASCII character.
				output += String.fromCharCode(
					0xFF & bitStorage >> (-2 * bitCounter & 6)
				);
			}
		}
		return output;
	};

	// `encode` is designed to be fully compatible with `btoa` as described in the
	// HTML Standard: http://whatwg.org/html/webappapis.html#dom-windowbase64-btoa
	var encode = function(input) {
		input = String(input);
		if (/[^\0-\xFF]/.test(input)) {
			// Note: no need to special-case astral symbols here, as surrogates are
			// matched, and the input is supposed to only contain ASCII anyway.
			error(
				'The string to be encoded contains characters outside of the ' +
				'Latin1 range.'
			);
		}
		var padding = input.length % 3;
		var output = '';
		var position = -1;
		var a;
		var b;
		var c;
		var d;
		var buffer;
		// Make sure any padding is handled outside of the loop.
		var length = input.length - padding;

		while (++position < length) {
			// Read three bytes, i.e. 24 bits.
			a = input.charCodeAt(position) << 16;
			b = input.charCodeAt(++position) << 8;
			c = input.charCodeAt(++position);
			buffer = a + b + c;
			// Turn the 24 bits into four chunks of 6 bits each, and append the
			// matching character for each of them to the output.
			output += (
				TABLE.charAt(buffer >> 18 & 0x3F) +
				TABLE.charAt(buffer >> 12 & 0x3F) +
				TABLE.charAt(buffer >> 6 & 0x3F) +
				TABLE.charAt(buffer & 0x3F)
			);
		}

		if (padding == 2) {
			a = input.charCodeAt(position) << 8;
			b = input.charCodeAt(++position);
			buffer = a + b;
			output += (
				TABLE.charAt(buffer >> 10) +
				TABLE.charAt((buffer >> 4) & 0x3F) +
				TABLE.charAt((buffer << 2) & 0x3F) +
				'='
			);
		} else if (padding == 1) {
			buffer = input.charCodeAt(position);
			output += (
				TABLE.charAt(buffer >> 2) +
				TABLE.charAt((buffer << 4) & 0x3F) +
				'=='
			);
		}

		return output;
	};

	var base64 = {
		'encode': encode,
		'decode': decode,
		'version': '0.1.0'
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define(function() {
			return base64;
		});
	}	else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = base64;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (var key in base64) {
				base64.hasOwnProperty(key) && (freeExports[key] = base64[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.base64 = base64;
	}

}(this));

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],77:[function(require,module,exports){
/** @suppress {duplicate} */
if (!com)
    var com = {};
if (!com.ciuvo)
    com.ciuvo = {};

// Added by Avira since the SDK isn't loaded in the background script
com.ciuvo.get_afsrc_threshold = function () {
    return 800;
};

/**
 * Helper object for detecting if the user came from a affiliate source and that
 * the extension should stand down completely. This affiliate sources are
 * usually marked by the "afsrc=1" query parameter, but one might also pass the
 * constructor a list of RegExp objects.
 *
 * NOTE: for Google-Chrome (and other Webkit-derivates) you need to add the
 * "webRequest" permission to the manifest.
 *
 */
com.ciuvo.ASDetector = (function() {

    var SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour
    var TAB_EVENT_EXPIRATION_TIME = SESSION_TIMEOUT + 10 * 1000; // 10 seconds

    /**
     * @constructor
     */
    var ASDetector = function(blockref) {
        this.pastEvents = {};

        this.listeners = [];
        this.blockref = blockref || [ new RegExp('\.*&afsrc=1|\\?afsrc=1'),
                new RegExp('.*jdoqocy.com'),
                new RegExp('.*tkqlhce.com'),
                new RegExp('.*dpbolvw.net'),
                new RegExp('.*anrdoezrs.net'),
                new RegExp('.*kqzyfj.com'),
                new RegExp('.*linksynergy\.com'),
                new RegExp('.*linksynergy\.onlineshoes\.com'),
                new RegExp('.*linksynergy\.walmart\.com'),
                new RegExp('.*savings\.com'),
                new RegExp('.*affiliate\.rakuten\.com'),
                ];
        this.ciuvo_rex = [new RegExp('.*ciuvo\.com'), new RegExp('.*localhost:8002')];
    };

    ASDetector.prototype = {
        /**
         * Add a new navigation event of the tab's main frame.
         *
         * @param tabId
         *            the tabId for this navigation event (required)
         * @param url
         *            the url for this navigation event (required)
         * @param requestId
         *            the request-id if available. It helps recognizing multiple
         *            urls which actually belong to one navigation event because
         *            of redirects. (optional)
         * @param timestamp
         *            the timestamp in ms of the navigation event. It is usefull
         *            for recognizing events which belong together (optional).
         * @param main_page_changed
         *            only used in firefox because there a workaround to recognize main-page changes
         *            is needed
         * @returns true if the current chain of navigation events has been
         *          marked as affiliate source. False otherwise.
         */
        onNavigationEvent : function(tabId, url, requestId, timestamp, main_page_changed) {
            timestamp = timestamp || Date.now();

            var lastEvent = this.getLastEvent(tabId);
            var newEvent = this.isNewEvent(lastEvent, url, requestId, timestamp, main_page_changed);

            // update timestamp & hostname
            lastEvent.timestamp = timestamp;
            lastEvent.hostname = this.hostnameFromUrl(url);

            if (newEvent || !lastEvent.isFromCiuvo) {
                lastEvent.isFromCiuvo = this.isCiuvoEvent(url);
            }

            if (lastEvent.isFromCiuvo) {
                // ignore afsrc if ciuvo itself triggered the coupon-click
                lastEvent.isAfsrc = false;
            } else if (!lastEvent.isAfsrc) {
                lastEvent.isAfsrc = this.ifAfsrcEvent(url);
            }

            return lastEvent.isAfsrc;
        },

        /**
         * extract hostname from url
         * @param url
         * @returns {string}
         */
        hostnameFromUrl : function(url) {
            var hostname = new URL(url).hostname,
                domain = hostname.match(/([^.]+.\w+)$/)[0];
            return domain
        },

        /**
         * Whether the event originated with an clickout from ciuvo
         */
        isCiuvoEvent: function(url) {
            for (var i = 0; i < this.ciuvo_rex.length; ++i) {
                if (this.ciuvo_rex[i].exec(url)) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Whether the event originated with an clickout from another affiliate source
         */
        ifAfsrcEvent: function(url) {
            for (var i = 0; i < this.blockref.length; i++) {
                if (this.blockref[i].exec(url)) {
                    return true;
                }
            }
            return false;
        },

        /**
         * @returns dictionary
         */
        getSessionBlockList: function() {
            var sbl = window.localStorage.getItem("__ciuvo__afsrc__sbl");

            if (sbl && typeof sbl === "string") {
                sbl = JSON.parse(sbl);
            }

            if (!sbl || typeof sbl !== "object") {
                // recover gracefully
                sbl = {};
                this.storeSessionBlockList(sbl);
            }

            return sbl;
        },

        /**
         * @param sbl
         *          dictionary
         */
        storeSessionBlockList: function(sbl) {
            window.localStorage.setItem("__ciuvo__afsrc__sbl", JSON.stringify(sbl));
        },

        /**
         * @param hostname
         *          the hostname of the request
         */
        addToSessionBlockList: function(hostname) {
            var blockList = this.getSessionBlockList();
            blockList[hostname] = Date.now();
            this.storeSessionBlockList(blockList);
        },

        /**
         * @param hostname
         *          the hostname of the request
         * @returns true
         *         if it is on the blocklist
         **/
        isOnSessionBlockList: function(hostname) {
            var blockList = this.getSessionBlockList(),
                timestamp = blockList[hostname];

            if (!timestamp) {
                // "The host <" + hostname + "> is not on session block list."
                return false;
            }

            var now_ts = Date.now();

            if (timestamp + SESSION_TIMEOUT > now_ts) {
                // "The host <" + hostname + "> is on session block list."
                return true;
            }

            // cleanup expired timestamp
            delete blockList[hostname];
            this.storeSessionBlockList(blockList);
            return false;
        },

        /**
         * decide whether it is a new event or not
         * @param lastEvent
         *            the last Event recorded for this tab
         * @param url
         *            the url for this navigation event (required)
         * @param requestId
         *            the request-id if available. It helps recognizing multiple
         *            urls which actually belong to one navigation event because
         *            of redirects. (optional)
         * @param timestamp
         *            the timestamp in ms of the navigation event. It is usefull
         *            for recognizing events which belong together (optional).
         * @param main_page_changed
         *            only used in firefox because there a workaround to recognize main-page changes
         *            is needed
         * @returns true if this is a new navigation event or part of the same clickout
         **/
        isNewEvent: function(lastEvent, url, requestId, timestamp, main_page_changed) {

            // try to detect if this is a new navigation event
            if (typeof requestId !== 'undefined') {
                if (requestId == lastEvent.requestId) {
                    return false;
                }
            }

            // those damn JS redirects make requestId unreliable
            var delta = timestamp - lastEvent.timestamp;
            if ((delta < com.ciuvo.get_afsrc_threshold())) {
                return false;
            }

            if (lastEvent.isAfsrc)  {
                if (main_page_changed !== undefined)  {
                    if (!main_page_changed) {
                        return false;
                    }
                } else if (this.hostnameFromUrl(url) === lastEvent.hostname) {
                    // still on the same event
                    return false;
                }
            }

            // create a new event if one has been detected
            lastEvent.isAfsrc = false;
            lastEvent.isFromCiuvo = false;
            lastEvent.requestId = requestId;

            return true;
        },

        /**
         * be nice, clean up a bit after ourselves
         */
        cleanupExpiredTabs : function() {
            now = Date.now();
            for ( var tabId in this.pastEvents) {
                if (this.pastEvents.hasOwnProperty(tabId)) {
                    var event = this.pastEvents[tabId];
                    if ((now - event.timestamp) > TAB_EVENT_EXPIRATION_TIME) {
                        delete this.pastEvents[tabId];
                    }
                }
            }
        },

        /**
         * @param tabId
         *            the tab's id
         * @returns the last navigation event or an empty one
         */
        getLastEvent : function(tabId) {
            var lastEvent = this.pastEvents[tabId];
            if (typeof lastEvent === 'undefined') {
                lastEvent = {
                    isAfsrc : false,
                    requestId : undefined,
                    isFromCiuvo : false,
                    timestamp : 0,
                    hostname: undefined
                };
                this.pastEvents[tabId] = lastEvent;
            }
            return lastEvent;
        },

        /**
         * @param tabId the id of the tab to be checked for the affiliate source
         * @param cleanup will clear the affiliate source flag since displays are allowed
         *          on subsequent requests
         * @returns true if the current chain of navigation events has been
         *          marked as affiliate source. False otherwise.
         */
        isAffiliateSource : function(tabId, cleanup) {

            var lastEvent = this.getLastEvent(tabId),
                isAfsrc = lastEvent.isAfsrc; // just for clarity

            if (this.isOnSessionBlockList(lastEvent.hostname)) {
                isAfsrc = true;
            } else if (isAfsrc) {
                this.addToSessionBlockList(lastEvent.hostname);
            }

            if (cleanup) {
                this.cleanupExpiredTabs();
            }

            return isAfsrc;
        }
    };

    return ASDetector;
})();

module.exports = com.ciuvo.ASDetector;

},{}],78:[function(require,module,exports){
module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

},{}],79:[function(require,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = require('./_wks')('unscopables');
var ArrayProto = Array.prototype;
if (ArrayProto[UNSCOPABLES] == undefined) require('./_hide')(ArrayProto, UNSCOPABLES, {});
module.exports = function (key) {
  ArrayProto[UNSCOPABLES][key] = true;
};

},{"./_hide":94,"./_wks":123}],80:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

},{"./_is-object":98}],81:[function(require,module,exports){
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

},{"./_to-absolute-index":116,"./_to-iobject":118,"./_to-length":119}],82:[function(require,module,exports){
var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};

},{}],83:[function(require,module,exports){
var core = module.exports = { version: '2.6.12' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

},{}],84:[function(require,module,exports){
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

},{"./_a-function":78}],85:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

},{}],86:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_fails":90}],87:[function(require,module,exports){
var isObject = require('./_is-object');
var document = require('./_global').document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};

},{"./_global":92,"./_is-object":98}],88:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');

},{}],89:[function(require,module,exports){
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

},{"./_core":83,"./_ctx":84,"./_global":92,"./_hide":94,"./_redefine":111}],90:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

},{}],91:[function(require,module,exports){
module.exports = require('./_shared')('native-function-to-string', Function.toString);

},{"./_shared":114}],92:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

},{}],93:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};

},{}],94:[function(require,module,exports){
var dP = require('./_object-dp');
var createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

},{"./_descriptors":86,"./_object-dp":105,"./_property-desc":110}],95:[function(require,module,exports){
var document = require('./_global').document;
module.exports = document && document.documentElement;

},{"./_global":92}],96:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function () {
  return Object.defineProperty(require('./_dom-create')('div'), 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_descriptors":86,"./_dom-create":87,"./_fails":90}],97:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};

},{"./_cof":82}],98:[function(require,module,exports){
module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

},{}],99:[function(require,module,exports){
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

},{"./_hide":94,"./_object-create":104,"./_property-desc":110,"./_set-to-string-tag":112,"./_wks":123}],100:[function(require,module,exports){
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

},{"./_export":89,"./_hide":94,"./_iter-create":99,"./_iterators":102,"./_library":103,"./_object-gpo":107,"./_redefine":111,"./_set-to-string-tag":112,"./_wks":123}],101:[function(require,module,exports){
module.exports = function (done, value) {
  return { value: value, done: !!done };
};

},{}],102:[function(require,module,exports){
module.exports = {};

},{}],103:[function(require,module,exports){
module.exports = false;

},{}],104:[function(require,module,exports){
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

},{"./_an-object":80,"./_dom-create":87,"./_enum-bug-keys":88,"./_html":95,"./_object-dps":106,"./_shared-key":113}],105:[function(require,module,exports){
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

},{"./_an-object":80,"./_descriptors":86,"./_ie8-dom-define":96,"./_to-primitive":121}],106:[function(require,module,exports){
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

},{"./_an-object":80,"./_descriptors":86,"./_object-dp":105,"./_object-keys":109}],107:[function(require,module,exports){
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

},{"./_has":93,"./_shared-key":113,"./_to-object":120}],108:[function(require,module,exports){
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

},{"./_array-includes":81,"./_has":93,"./_shared-key":113,"./_to-iobject":118}],109:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = require('./_object-keys-internal');
var enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};

},{"./_enum-bug-keys":88,"./_object-keys-internal":108}],110:[function(require,module,exports){
module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

},{}],111:[function(require,module,exports){
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

},{"./_core":83,"./_function-to-string":91,"./_global":92,"./_has":93,"./_hide":94,"./_uid":122}],112:[function(require,module,exports){
var def = require('./_object-dp').f;
var has = require('./_has');
var TAG = require('./_wks')('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};

},{"./_has":93,"./_object-dp":105,"./_wks":123}],113:[function(require,module,exports){
var shared = require('./_shared')('keys');
var uid = require('./_uid');
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};

},{"./_shared":114,"./_uid":122}],114:[function(require,module,exports){
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

},{"./_core":83,"./_global":92,"./_library":103}],115:[function(require,module,exports){
'use strict';
var fails = require('./_fails');

module.exports = function (method, arg) {
  return !!method && fails(function () {
    // eslint-disable-next-line no-useless-call
    arg ? method.call(null, function () { /* empty */ }, 1) : method.call(null);
  });
};

},{"./_fails":90}],116:[function(require,module,exports){
var toInteger = require('./_to-integer');
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};

},{"./_to-integer":117}],117:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

},{}],118:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject');
var defined = require('./_defined');
module.exports = function (it) {
  return IObject(defined(it));
};

},{"./_defined":85,"./_iobject":97}],119:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer');
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

},{"./_to-integer":117}],120:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function (it) {
  return Object(defined(it));
};

},{"./_defined":85}],121:[function(require,module,exports){
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

},{"./_is-object":98}],122:[function(require,module,exports){
var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

},{}],123:[function(require,module,exports){
var store = require('./_shared')('wks');
var uid = require('./_uid');
var Symbol = require('./_global').Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;

},{"./_global":92,"./_shared":114,"./_uid":122}],124:[function(require,module,exports){
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

},{"./_add-to-unscopables":79,"./_iter-define":100,"./_iter-step":101,"./_iterators":102,"./_to-iobject":118}],125:[function(require,module,exports){
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

},{"./_a-function":78,"./_export":89,"./_fails":90,"./_strict-method":115,"./_to-object":120}],126:[function(require,module,exports){
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

},{"./_global":92,"./_hide":94,"./_iterators":102,"./_object-keys":109,"./_redefine":111,"./_wks":123,"./es6.array.iterator":124}],127:[function(require,module,exports){
"use strict";

module.exports = require('./src/BackgroundMessenger');

},{"./src/BackgroundMessenger":128}],128:[function(require,module,exports){
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

var BackgroundTopic = require('./BackgroundTopic');

var chrome = require('./chrome');

var BackgroundMessenger = /*#__PURE__*/function (_Messenger) {
  (0, _inherits2["default"])(BackgroundMessenger, _Messenger);

  var _super = _createSuper(BackgroundMessenger);

  function BackgroundMessenger() {
    var _this;

    (0, _classCallCheck2["default"])(this, BackgroundMessenger);
    _this = _super.call(this, BackgroundTopic);
    _this._popupTabId = null;
    chrome.runtime.onMessage.addListener(_this._onMessage.bind((0, _assertThisInitialized2["default"])(_this)));
    chrome.runtime.onConnect.addListener(_this._onConnect.bind((0, _assertThisInitialized2["default"])(_this)));
    return _this;
  }

  (0, _createClass2["default"])(BackgroundMessenger, [{
    key: "_onMessage",
    value: function _onMessage(message, sender, callback) {
      if (message.subscribe) {
        var topic = this._getTopic(message.subscribe, true);

        if (!sender.tab) {
          this._getCurrentTabId(function (tabId) {
            topic.subscribePopup(tabId);
          });
        } else if (sender.tab.id !== -1) {
          topic.subscribeTab(sender.tab.id);
        }
      } else if (message.publish) {
        var _topic = this._getTopic(message.publish);

        if (_topic) {
          _topic.publish(message.message, callback, sender);
        }
      }

      return true; // Allows callbacks to be called asynchronos
    }
  }, {
    key: "_onConnect",
    value: function _onConnect(port) {
      var _this2 = this;

      /* Accepting this port has two purposes.
       * For content scripts the port is used to detect that the extension was unloaded.
       * For the the background messenger it is used to detect when the extension popup closes.
       */
      if (port.name === 'ContentMessenger' && !port.sender.tab) {
        port.onDisconnect.addListener(function () {
          _this2._unsubscribePopup(); // @todo Should this really be part of the messenger in this way?


          _this2.publish('Popup:closed', {
            tabId: _this2._popupTabId
          });

          _this2._popupTabId = null;
        });

        this._getCurrentTabId(function (tabId) {
          _this2._popupTabId = tabId;
        });
      }
    }
  }, {
    key: "_unsubscribePopup",
    value: function _unsubscribePopup() {
      for (var topicName in this._topics) {
        if (this._topics.hasOwnProperty(topicName)) {
          this._topics[topicName].unsubscribePopup();
        }
      }
    }
  }, {
    key: "_getCurrentTabId",
    value: function _getCurrentTabId(callback) {
      chrome.tabs.query({
        currentWindow: true,
        active: true
      }, function (tabs) {
        callback(tabs[0] && tabs[0].id);
      });
    }
  }]);
  return BackgroundMessenger;
}(Messenger);

module.exports = BackgroundMessenger;

},{"./BackgroundTopic":129,"./Messenger":130,"./chrome":132,"@babel/runtime/helpers/assertThisInitialized":12,"@babel/runtime/helpers/classCallCheck":13,"@babel/runtime/helpers/createClass":14,"@babel/runtime/helpers/getPrototypeOf":16,"@babel/runtime/helpers/inherits":17,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/possibleConstructorReturn":19}],129:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var chrome = require('./chrome');

var Topic = require('./Topic');

var BackgroundTopic = /*#__PURE__*/function (_Topic) {
  (0, _inherits2["default"])(BackgroundTopic, _Topic);

  var _super = _createSuper(BackgroundTopic);

  function BackgroundTopic(name) {
    var _this;

    (0, _classCallCheck2["default"])(this, BackgroundTopic);
    _this = _super.call(this, name); // Subscribers in tabs (tabIds)

    _this._tabIds = [];
    _this._popupTabId = null;
    chrome.tabs.onRemoved.addListener(function (tabId) {
      return _this._unsubscribeTab(tabId);
    });
    return _this;
  }

  (0, _createClass2["default"])(BackgroundTopic, [{
    key: "publish",
    value: function publish(message, callback, sender) {
      var cb = this._wrapCallback(callback);

      this._callbacks.forEach(function (fn) {
        return fn(message, cb, sender);
      });

      this._publishToTabs(message, callback, sender);

      this._publishToPopup(message, callback, sender);
    }
  }, {
    key: "_publishToTabs",
    value: function _publishToTabs(message, callback, sender) {
      var _this2 = this;

      // If sender is specified only send to that tab, otherwise to all tabs
      var senderTabId = sender && sender.tab && sender.tab.id;

      var publishToTab = function publishToTab(tabId) {
        chrome.tabs.sendMessage(tabId, {
          publish: _this2._name,
          message: message
        }, function (response) {
          if (!chrome.runtime.lastError && typeof callback === 'function') {
            callback(response);
          }
        });
      };

      if (senderTabId) {
        if (this._tabIds.indexOf(senderTabId) !== -1) {
          publishToTab(senderTabId);
        }
      } else {
        this._tabIds.forEach(publishToTab);
      }
    }
  }, {
    key: "_publishToPopup",
    value: function _publishToPopup(message, callback, sender) {
      if (this._popupTabId) {
        if (!sender || !sender.tab || sender.tab.id === this._popupTabId) {
          chrome.runtime.sendMessage({
            publish: this._name,
            message: message
          }, function (response) {
            if (!chrome.runtime.lastError && typeof callback === 'function') {
              callback(response);
            }
          });
        }
      }
    }
  }, {
    key: "subscribeTab",
    value: function subscribeTab(tabId) {
      if (this._tabIds.indexOf(tabId) === -1) {
        this._tabIds.push(tabId);
      }
    }
  }, {
    key: "_unsubscribeTab",
    value: function _unsubscribeTab(tabId) {
      var i = this._tabIds.indexOf(tabId);

      if (i !== -1) {
        this._tabIds.splice(i, 1);
      }
    }
  }, {
    key: "subscribePopup",
    value: function subscribePopup(tabId) {
      this._popupTabId = tabId;
    }
  }, {
    key: "unsubscribePopup",
    value: function unsubscribePopup() {
      this._popupTabId = null;
    }
  }]);
  return BackgroundTopic;
}(Topic);

module.exports = BackgroundTopic;

},{"./Topic":131,"./chrome":132,"@babel/runtime/helpers/classCallCheck":13,"@babel/runtime/helpers/createClass":14,"@babel/runtime/helpers/getPrototypeOf":16,"@babel/runtime/helpers/inherits":17,"@babel/runtime/helpers/interopRequireDefault":18,"@babel/runtime/helpers/possibleConstructorReturn":19}],130:[function(require,module,exports){
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

},{"@babel/runtime/helpers/classCallCheck":13,"@babel/runtime/helpers/createClass":14,"@babel/runtime/helpers/interopRequireDefault":18}],131:[function(require,module,exports){
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

},{"@babel/runtime/helpers/classCallCheck":13,"@babel/runtime/helpers/createClass":14,"@babel/runtime/helpers/interopRequireDefault":18}],132:[function(require,module,exports){
"use strict";

/* globals chrome, browser */
if (typeof browser !== 'undefined' && browser.runtime) {
  module.exports = browser;
} else {
  module.exports = chrome;
}

},{}],133:[function(require,module,exports){
const base64 = require('base-64');
const utf8 = require('utf8');

/**
 * Mixpanel allows tracking events on mixpanel.com
 */
function Mixpanel(xhrService, environmentService) {
  this._xhrService = xhrService;
  this._environmentService = environmentService;

  this._apiUrl = 'https://api.mixpanel.com';
  this._superProperties = {};
}

/**
 * Set the API Token supplied by mixpanel
 * @param {String} token
 */
Mixpanel.prototype.init = function (token) {
  this._token = token;
};

/**
 * Set the distinct_id for mixpanel
 * @param {String} distinctId identifing the user
 */
Mixpanel.prototype.identify = function (distinctId) {
  this._distinctId = distinctId;
};

Mixpanel.prototype.getDistinctId = function() {
  return this._distinctId;
};

/**
 * Track an event
 * @param {String} event name of the event
 * @param {Object} [properties] additional properties to send with the event
 * @param {Mixpanel~trackCallback} callback
 */
Mixpanel.prototype.track = function (event, properties, callback) {
  if (callback && typeof callback !== 'function') {
    throw 'Mixpanel.track: callback must be a function';
  }

  var url = this._apiUrl + '/track/';
  var data = this.createEvent(event, properties);
  var params = {
    data: this._encodeData(data),
    ip: 1 // Geolocate based on ip address
  };
  this._xhrService.get(url, params, callback);
};

Mixpanel.prototype.createEvent = function (event, properties) {
  if (!event) {
    throw 'Mixpanel.track: event must be specified';
  }

  var data = {
    event: event,
    properties: this.getData(properties),
  };

  return data;
};

Mixpanel.prototype.getData = function (properties) {
  if (properties) {
    if(typeof properties !== 'object') {
      throw 'Mixpanel.track: properties must be a dictionary';
    }
  } else {
    properties = {};
  }

  if (!this._token) {
    throw 'Mixpanel.track: Mixpanel.init must be called before Mixpanel.track';
  }
  if (!this._distinctId) {
    throw 'Mixpanel.track: Mixpanel.identify must be called before Mixpanel.track';
  }

  properties.distinct_id = this._distinctId;
  properties.token = this._token;
  var browser = this._environmentService.getBrowser();
  var os = this._environmentService.getOS();
  var majorversion = this._environmentService.getMajorVersion();
  var minorversion = this._environmentService.getMinorVersion();
  var patchversion = this._environmentService.getPatchVersion();
  var buildversion = this._environmentService.getBuildVersion();
  if (browser) {
    properties.$browser = browser;
  }
  if (os) {
    properties.$os = os;
  }
  if (majorversion) {
    properties["Browser Version"] = majorversion;
  }
  if (minorversion) {
    properties["Browser Version (Minor)"] = minorversion;
  }
  if (patchversion) {
    properties["Browser Version (Patch)"] = patchversion;
  }
  if (buildversion) {
    // Scout uses a build time stamp instead of the version. The best version we have there as major.minor.patch is the Chrome version it is based on.
    properties["Browser Version (Build)"] = buildversion;
  }

  for (var key in this._superProperties) {
    properties[key] = this._superProperties[key];
  }

  return properties;
};

/**
 * Add properties send with all events
 * @param {Object} properties
 */
Mixpanel.prototype.register = function(properties) {
  for (var key in properties) {
    this._superProperties[key] = properties[key];
  }
};

Mixpanel.prototype._encodeData = function(properties) {
  return base64.encode(utf8.encode(JSON.stringify(properties)));
};

module.exports = Mixpanel;

/**
 * Mixpanel track callback
 * @callback Mixpanel~trackCallback
 * @param {String} err error message
 */

},{"base-64":76,"utf8":159}],134:[function(require,module,exports){
var UaParser = require('ua-parser-js');

/**
 * UserAgentParser provides informtion about the used browser, os and version
 */
function UserAgentParser(userAgent) {
  this._userAgent = userAgent;
  this._parsedUa = UaParser(this._userAgent);

  this._versionParsed = (this._parsedUa.browser.version || this._parsedUa.engine.version).split('.');
}

var MAJOR = 1;
var MINOR = 2;
var PATCH = 3;
var BUILD = 4;

UserAgentParser.prototype.getBrowser = function() {
  if (this._parsedUa.browser.name === 'IE') {
    return 'Internet Explorer'
  } else {
    return this._parsedUa.browser.name
  }
};

UserAgentParser.prototype.getOS = function() {
  return this._parsedUa.os.name;
};

UserAgentParser.prototype.getMinorVersion = function() {
  return this._versionParsed.slice(0, MINOR).join('.');
};

UserAgentParser.prototype.getPatchVersion = function() {
  return this._versionParsed.slice(0, PATCH).join('.');
};

UserAgentParser.prototype.getMajorVersion = function () {
  return this._versionParsed.slice(0, MAJOR).join('.');
};

UserAgentParser.prototype.getBuildVersion = function () {
  return this._versionParsed.slice(0, BUILD).join('.');
};

module.exports = UserAgentParser;

},{"ua-parser-js":155}],135:[function(require,module,exports){
function XHRTransport(XMLHttpRequest) {
  this._XMLHttpRequest = XMLHttpRequest;
}

XHRTransport.prototype.get = function(url, params, callback) {
  var xhr = new this._XMLHttpRequest();
  if (typeof(callback) == 'function') {
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          callback(null, xhr.responseText);
        } else {
          callback("Request failed");
        }
      }
    };
  }
  url = url + this.getQueryString(params);

  xhr.open('GET', url, true);
  xhr.send();
};

XHRTransport.prototype.getQueryString = function (params) {
  var query = [];
  for (var key in params) {
    var param = encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
    query.push(param);
  }
  var queryString = query.join('&');
  if (queryString) {
    queryString = '?' + queryString;
  }
  return queryString;
};

module.exports = XHRTransport;

},{}],136:[function(require,module,exports){
(function (global){(function (){
var Mixpanel = require('./Mixpanel')
var XHRTransport = require('./XHRTransport')
var UserAgentParser = require('./UserAgentParser')

module.exports = function(options) {
  var xhr = options.XMLHttpRequest || global.XMLHttpRequest;
  var ua = options.userAgent || global.navigator.userAgent;

  return new Mixpanel(new XHRTransport(xhr), new UserAgentParser(ua));
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Mixpanel":133,"./UserAgentParser":134,"./XHRTransport":135}],137:[function(require,module,exports){
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

},{}],138:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],139:[function(require,module,exports){
(function (global){(function (){
/*! https://mths.be/punycode v1.4.1 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.4.1',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],140:[function(require,module,exports){
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

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],141:[function(require,module,exports){
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

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],142:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":140,"./encode":141}],143:[function(require,module,exports){
'use strict';


// Load rules
var Trie = require('./lib/suffix-trie.js');
var allRules = Trie.fromJson(require('./rules.json'));

// Internals
var extractHostname = require('./lib/clean-host.js');
var getDomain = require('./lib/domain.js');
var getPublicSuffix = require('./lib/public-suffix.js');
var getSubdomain = require('./lib/subdomain.js');
var isValid = require('./lib/is-valid.js');
var isIp = require('./lib/is-ip.js');
var tldExists = require('./lib/tld-exists.js');


// Flags representing steps in the `parse` function. They are used to implement
// a early stop mechanism (simulating some form of laziness) to avoid doing more
// work than necessary to perform a given action (e.g.: we don't need to extract
// the domain and subdomain if we are only interested in public suffix).
var TLD_EXISTS = 1;
var PUBLIC_SUFFIX = 2;
var DOMAIN = 3;
var SUB_DOMAIN = 4;
var ALL = 5;


/**
 * Creates a new instance of tldjs
 * @param  {Object.<rules,validHosts>} options [description]
 * @return {tldjs|Object}                      [description]
 */
function factory(options) {
  var rules = options.rules || allRules || {};
  var validHosts = options.validHosts || [];
  var _extractHostname = options.extractHostname || extractHostname;

  /**
   * Process a given url and extract all information. This is a higher level API
   * around private functions of `tld.js`. It allows to remove duplication (only
   * extract hostname from url once for all operations) and implement some early
   * termination mechanism to not pay the price of what we don't need (this
   * simulates laziness at a lower cost).
   *
   * @param {string} url
   * @param {number|undefined} _step - where should we stop processing
   * @return {object}
   */
  function parse(url, _step) {
    var step = _step || ALL;
    var result = {
      hostname: _extractHostname(url),
      isValid: null,
      isIp: null,
      tldExists: false,
      publicSuffix: null,
      domain: null,
      subdomain: null,
    };

    if (result.hostname === null) {
      result.isIp = false;
      result.isValid = false;
      return result;
    }

    // Check if `hostname` is a valid ip address
    result.isIp = isIp(result.hostname);
    if (result.isIp) {
      result.isValid = true;
      return result;
    }

    // Check if `hostname` is valid
    result.isValid = isValid(result.hostname);
    if (result.isValid === false) return result;

    // Check if tld exists
    if (step === ALL || step === TLD_EXISTS) {
      result.tldExists = tldExists(rules, result.hostname);
    }
    if (step === TLD_EXISTS) return result;

    // Extract public suffix
    result.publicSuffix = getPublicSuffix(rules, result.hostname);
    if (step === PUBLIC_SUFFIX) return result;

    // Extract domain
    result.domain = getDomain(validHosts, result.publicSuffix, result.hostname);
    if (step === DOMAIN) return result;

    // Extract subdomain
    result.subdomain = getSubdomain(result.hostname, result.domain);

    return result;
  }


  return {
    extractHostname: _extractHostname,
    isValid: isValid,
    parse: parse,
    tldExists: function (url) {
      return parse(url, TLD_EXISTS).tldExists;
    },
    getPublicSuffix: function (url) {
      return parse(url, PUBLIC_SUFFIX).publicSuffix;
    },
    getDomain: function (url) {
      return parse(url, DOMAIN).domain;
    },
    getSubdomain: function (url) {
      return parse(url, SUB_DOMAIN).subdomain;
    },
    fromUserSettings: factory
  };
}


module.exports = factory({});

},{"./lib/clean-host.js":144,"./lib/domain.js":145,"./lib/is-ip.js":147,"./lib/is-valid.js":148,"./lib/public-suffix.js":149,"./lib/subdomain.js":150,"./lib/suffix-trie.js":151,"./lib/tld-exists.js":152,"./rules.json":153}],144:[function(require,module,exports){

var URL = require('url');
var isValid = require('./is-valid.js');


/**
 * Utility to cleanup the base host value. Also removes url fragments.
 *
 * Works for:
 * - hostname
 * - //hostname
 * - scheme://hostname
 * - scheme+scheme://hostname
 *
 * @param {string} value
 * @return {String}
 */

// scheme      = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
var hasPrefixRE = /^(([a-z][a-z0-9+.-]*)?:)?\/\//;


/**
 * @see https://github.com/oncletom/tld.js/issues/95
 *
 * @param {string} value
 */
function trimTrailingDots(value) {
  if (value[value.length - 1] === '.') {
    return value.substr(0, value.length - 1);
  }
  return value;
}


/**
 * Fast check to avoid calling `trim` when not needed.
 *
 * @param {string} value
 */
function checkTrimmingNeeded(value) {
  return (
    value.length > 0 && (
      value.charCodeAt(0) <= 32 ||
      value.charCodeAt(value.length - 1) <= 32
    )
  );
}


/**
 * Fast check to avoid calling `toLowerCase` when not needed.
 *
 * @param {string} value
 */
function checkLowerCaseNeeded(value) {
  for (var i = 0; i < value.length; i += 1) {
    var code = value.charCodeAt(i);
    if (code >= 65 && code <= 90) { // [A-Z]
      return true;
    }
  }

  return false;
}


module.exports = function extractHostname(value) {
  // First check if `value` is already a valid hostname.
  if (isValid(value)) {
    return trimTrailingDots(value);
  }

  var url = value;

  if (typeof url !== 'string') {
    url = '' + url;
  }

  var needsTrimming = checkTrimmingNeeded(url);
  if (needsTrimming) {
    url = url.trim();
  }

  var needsLowerCase = checkLowerCaseNeeded(url);
  if (needsLowerCase) {
    url = url.toLowerCase();
  }

  // Try again after `url` has been transformed to lowercase and trimmed.
  if ((needsLowerCase || needsTrimming) && isValid(url)) {
    return trimTrailingDots(url);
  }

  // Proceed with heavier url parsing to extract the hostname.
  if (!hasPrefixRE.test(url)) {
    url = '//' + url;
  }

  var parts = URL.parse(url, null, true);

  if (parts.hostname) {
    return trimTrailingDots(parts.hostname);
  }

  return null;
};

},{"./is-valid.js":148,"url":157}],145:[function(require,module,exports){
'use strict';


/**
 * Polyfill for `endsWith`
 *
 * @param {string} str
 * @param {string} pattern
 * @return {boolean}
 */
function endsWith(str, pattern) {
  return (
    str.lastIndexOf(pattern) === (str.length - pattern.length)
  );
}


/**
 * Check if `vhost` is a valid suffix of `hostname` (top-domain)
 *
 * It means that `vhost` needs to be a suffix of `hostname` and we then need to
 * make sure that: either they are equal, or the character preceding `vhost` in
 * `hostname` is a '.' (it should not be a partial label).
 *
 * * hostname = 'not.evil.com' and vhost = 'vil.com'      => not ok
 * * hostname = 'not.evil.com' and vhost = 'evil.com'     => ok
 * * hostname = 'not.evil.com' and vhost = 'not.evil.com' => ok
 *
 * @param {string} hostname
 * @param {string} vhost
 * @return {boolean}
 */
function shareSameDomainSuffix(hostname, vhost) {
  if (endsWith(hostname, vhost)) {
    return (
      hostname.length === vhost.length ||
      hostname[hostname.length - vhost.length - 1] === '.'
    );
  }

  return false;
}


/**
 * Given a hostname and its public suffix, extract the general domain.
 *
 *  @param {string} hostname
 *  @param {string} publicSuffix
 *  @return {string}
 */
function extractDomainWithSuffix(hostname, publicSuffix) {
  // Locate the index of the last '.' in the part of the `hostname` preceding
  // the public suffix.
  //
  // examples:
  //   1. not.evil.co.uk  => evil.co.uk
  //         ^    ^
  //         |    | start of public suffix
  //         | index of the last dot
  //
  //   2. example.co.uk   => example.co.uk
  //     ^       ^
  //     |       | start of public suffix
  //     |
  //     | (-1) no dot found before the public suffix
  var publicSuffixIndex = hostname.length - publicSuffix.length - 2;
  var lastDotBeforeSuffixIndex = hostname.lastIndexOf('.', publicSuffixIndex);

  // No '.' found, then `hostname` is the general domain (no sub-domain)
  if (lastDotBeforeSuffixIndex === -1) {
    return hostname;
  }

  // Extract the part between the last '.'
  return hostname.substr(lastDotBeforeSuffixIndex + 1);
}


/**
 * Detects the domain based on rules and upon and a host string
 *
 * @api
 * @param {string} host
 * @return {String}
 */
module.exports = function getDomain(validHosts, suffix, hostname) {
  // Check if `hostname` ends with a member of `validHosts`.
  for (var i = 0; i < validHosts.length; i += 1) {
    var vhost = validHosts[i];
    if (shareSameDomainSuffix(hostname, vhost)) {
      return vhost;
    }
  }

  // If there is no suffix, there is no hostname
  if (suffix === null) {
    return null;
  }

  // If `hostname` is a valid public suffix, then there is no domain to return.
  // Since we already know that `getPublicSuffix` returns a suffix of `hostname`
  // there is no need to perform a string comparison and we only compare the
  // size.
  if (suffix.length === hostname.length) {
    return null;
  }

  // To extract the general domain, we start by identifying the public suffix
  // (if any), then consider the domain to be the public suffix with one added
  // level of depth. (e.g.: if hostname is `not.evil.co.uk` and public suffix:
  // `co.uk`, then we take one more level: `evil`, giving the final result:
  // `evil.co.uk`).
  return extractDomainWithSuffix(hostname, suffix);
};

},{}],146:[function(require,module,exports){
"use strict";

/**
 * Utility to extract the TLD from a hostname string
 *
 * @param {string} host
 * @return {String}
 */
module.exports = function extractTldFromHost(hostname) {
  var lastDotIndex = hostname.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return null;
  }

  return hostname.substr(lastDotIndex + 1);
};

},{}],147:[function(require,module,exports){
'use strict';


/**
 * Check if a hostname is an IP. You should be aware that this only works
 * because `hostname` is already garanteed to be a valid hostname!
 *
 * @param {string} hostname
 * @return {boolean}
 */
function isProbablyIpv4(hostname) {
  var numberOfDots = 0;

  for (var i = 0; i < hostname.length; i += 1) {
    var code = hostname.charCodeAt(i);

    if (code === 46) { // '.'
      numberOfDots += 1;
    } else if (code < 48 || code > 57) {
      // 48 => '0'
      // 57 => '9'
      return false;
    }
  }

  return (
    numberOfDots === 3  &&
    hostname[0] !== '.' &&
    hostname[hostname.length - 1] !== '.'
  );
}


/**
 * Similar to isProbablyIpv4.
 *
 * @param {string} hostname
 * @return {boolean}
 */
function isProbablyIpv6(hostname) {
  var hasColon = false;

  for (var i = 0; i < hostname.length; i += 1) {
    var code = hostname.charCodeAt(i);

    if (code === 58) { // ':'
      hasColon = true;
    } else if (!(
      (code >= 48 && code <= 57) || // 0-9
      (code >= 97 && code <= 102)   // a-f
    )) {
      return false;
    }
  }

  return hasColon;
}


/**
 * Check if `hostname` is *probably* a valid ip addr (either ipv6 or ipv4).
 * This *will not* work on any string. We need `hostname` to be a valid
 * hostname.
 *
 * @param {string} hostname
 * @return {boolean}
 */
module.exports = function isIp(hostname) {
  if (typeof hostname !== 'string') {
    return false;
  }

  if (hostname.length === 0) {
    return false;
  }

  return (isProbablyIpv6(hostname) || isProbablyIpv4(hostname));
};

},{}],148:[function(require,module,exports){
"use strict";


/**
 * Check if the code point is a digit [0-9]
 *
 * @param {number} code
 * @return boolean
 */
function isDigit(code) {
  // 48 == '0'
  // 57 == '9'
  return code >= 48 && code <= 57;
}


/**
 * Check if the code point is a letter [a-zA-Z]
 *
 * @param {number} code
 * @return boolean
 */
function isAlpha(code) {
  // 97 === 'a'
  // 122 == 'z'
  return code >= 97 && code <= 122;
}


/**
 * Check if a hostname string is valid (according to RFC). It's usually a
 * preliminary check before trying to use getDomain or anything else.
 *
 * Beware: it does not check if the TLD exists.
 *
 * @api
 * @param {string} hostname
 * @return {boolean}
 */
module.exports = function isValid(hostname) {
  if (typeof hostname !== 'string') {
    return false;
  }

  if (hostname.length > 255) {
    return false;
  }

  if (hostname.length === 0) {
    return false;
  }

  // Check first character: [a-zA-Z0-9]
  var firstCharCode = hostname.charCodeAt(0);
  if (!(isAlpha(firstCharCode) || isDigit(firstCharCode))) {
    return false;
  }

  // Validate hostname according to RFC
  var lastDotIndex = -1;
  var lastCharCode;
  var code;
  var len = hostname.length;

  for (var i = 0; i < len; i += 1) {
    code = hostname.charCodeAt(i);

    if (code === 46) { // '.'
      if (
        // Check that previous label is < 63 bytes long (64 = 63 + '.')
        (i - lastDotIndex) > 64 ||
        // Check that previous character was not already a '.'
        lastCharCode === 46 ||
        // Check that the previous label does not end with a '-'
        lastCharCode === 45
      ) {
        return false;
      }

      lastDotIndex = i;
    } else if (!(isAlpha(code) || isDigit(code) || code === 45)) {
      // Check if there is a forbidden character in the label: [^a-zA-Z0-9-]
      return false;
    }

    lastCharCode = code;
  }

  return (
    // Check that last label is shorter than 63 chars
    (len - lastDotIndex - 1) <= 63 &&
    // Check that the last character is an allowed trailing label character.
    // Since we already checked that the char is a valid hostname character,
    // we only need to check that it's different from '-'.
    lastCharCode !== 45
  );
};

},{}],149:[function(require,module,exports){
'use strict';


var extractTldFromHost = require('./from-host.js');


/**
 * Returns the public suffix (including exact matches)
 *
 * @api
 * @since 1.5
 * @param {string} hostname
 * @return {string}
 */
module.exports = function getPublicSuffix(rules, hostname) {
  // First check if `hostname` is already a valid top-level Domain.
  if (rules.hasTld(hostname)) {
    return hostname;
  }

  var candidate = rules.suffixLookup(hostname);
  if (candidate === null) {
    // Prevailing rule is '*' so we consider the top-level domain to be the
    // public suffix of `hostname` (e.g.: 'example.org' => 'org').
    return extractTldFromHost(hostname);
  }

  return candidate;
};

},{"./from-host.js":146}],150:[function(require,module,exports){
'use strict';


/**
 * Returns the subdomain of a hostname string
 *
 * @api
 * @param {string} hostname
 * @param {string} domain - the root domain of the hostname
 * @return {string|null} a subdomain string if any, blank string if subdomain
 *  is empty, otherwise null.
 */
module.exports = function getSubdomain(hostname, domain) {
  // No domain found? Just abort, abort!
  if (domain === null) {
    return null;
  }

  return hostname.substr(0, hostname.length - domain.length - 1);
};

},{}],151:[function(require,module,exports){
"use strict";

var VALID_HOSTNAME_VALUE = 0;


/**
 * Return min(a, b), handling possible `null` values.
 *
 * @param {number|null} a
 * @param {number|null} b
 * @return {number|null}
 */
function minIndex(a, b) {
  if (a === null) {
    return b;
  } else if (b === null) {
    return a;
  }

  return a < b ? a : b;
}


/**
 * Insert a public suffix rule in the `trie`.
 *
 * @param {object} rule
 * @param {object} trie
 * @return {object} trie (updated)
 */
function insertInTrie(rule, trie) {
  var parts = rule.parts;
  var node = trie;

  for (var i = 0; i < parts.length; i += 1) {
    var part = parts[i];
    var nextNode = node[part];
    if (nextNode === undefined) {
      nextNode = Object.create(null);
      node[part] = nextNode;
    }

    node = nextNode;
  }

  node.$ = VALID_HOSTNAME_VALUE;

  return trie;
}


/**
 * Recursive lookup of `parts` (starting at `index`) in the tree.
 *
 * @param {array} parts
 * @param {object} trie
 * @param {number} index - when to start in `parts` (initially: length - 1)
 * @return {number} size of the suffix found (in number of parts matched)
 */
function lookupInTrie(parts, trie, index) {
  var part;
  var nextNode;
  var publicSuffixIndex = null;

  // We have a match!
  if (trie.$ !== undefined) {
    publicSuffixIndex = index + 1;
  }

  // No more `parts` to look for
  if (index === -1) {
    return publicSuffixIndex;
  }

  part = parts[index];

  // Check branch corresponding to next part of hostname
  nextNode = trie[part];
  if (nextNode !== undefined) {
    publicSuffixIndex = minIndex(
      publicSuffixIndex,
      lookupInTrie(parts, nextNode, index - 1)
    );
  }

  // Check wildcard branch
  nextNode = trie['*'];
  if (nextNode !== undefined) {
    publicSuffixIndex = minIndex(
      publicSuffixIndex,
      lookupInTrie(parts, nextNode, index - 1)
    );
  }

  return publicSuffixIndex;
}


/**
 * Contains the public suffix ruleset as a Trie for efficient look-up.
 *
 * @constructor
 */
function SuffixTrie(rules) {
  this.exceptions = Object.create(null);
  this.rules = Object.create(null);

  if (rules) {
    for (var i = 0; i < rules.length; i += 1) {
      var rule = rules[i];
      if (rule.exception) {
        insertInTrie(rule, this.exceptions);
      } else {
        insertInTrie(rule, this.rules);
      }
    }
  }
}


/**
 * Load the trie from JSON (as serialized by JSON.stringify).
 */
SuffixTrie.fromJson = function (json) {
  var trie = new SuffixTrie();

  trie.exceptions = json.exceptions;
  trie.rules = json.rules;

  return trie;
};


/**
 * Check if `value` is a valid TLD.
 */
SuffixTrie.prototype.hasTld = function (value) {
  // All TLDs are at the root of the Trie.
  return this.rules[value] !== undefined;
};


/**
 * Check if `hostname` has a valid public suffix in `trie`.
 *
 * @param {string} hostname
 * @return {string|null} public suffix
 */
SuffixTrie.prototype.suffixLookup = function (hostname) {
  var parts = hostname.split('.');

  // Look for a match in rules
  var publicSuffixIndex = lookupInTrie(
    parts,
    this.rules,
    parts.length - 1
  );

  if (publicSuffixIndex === null) {
    return null;
  }

  // Look for exceptions
  var exceptionIndex = lookupInTrie(
    parts,
    this.exceptions,
    parts.length - 1
  );

  if (exceptionIndex !== null) {
    return parts.slice(exceptionIndex + 1).join('.');
  }

  return parts.slice(publicSuffixIndex).join('.');
};


module.exports = SuffixTrie;

},{}],152:[function(require,module,exports){
'use strict';


var extractTldFromHost = require('./from-host.js');


/**
 * Checks if the TLD exists for a given hostname
 *
 * @api
 * @param {string} rules
 * @param {string} hostname
 * @return {boolean}
 */
module.exports = function tldExists(rules, hostname) {
  // Easy case, it's a TLD
  if (rules.hasTld(hostname)) {
    return true;
  }

  // Popping only the TLD of the hostname
  var hostTld = extractTldFromHost(hostname);
  if (hostTld === null) {
    return false;
  }

  return rules.hasTld(hostTld);
};

},{"./from-host.js":146}],153:[function(require,module,exports){
module.exports={"exceptions":{"ck":{"www":{"$":0}},"jp":{"kawasaki":{"city":{"$":0}},"kitakyushu":{"city":{"$":0}},"kobe":{"city":{"$":0}},"nagoya":{"city":{"$":0}},"sapporo":{"city":{"$":0}},"sendai":{"city":{"$":0}},"yokohama":{"city":{"$":0}}}},"rules":{"ac":{"$":0,"com":{"$":0},"edu":{"$":0},"gov":{"$":0},"net":{"$":0},"mil":{"$":0},"org":{"$":0}},"ad":{"$":0,"nom":{"$":0}},"ae":{"$":0,"co":{"$":0},"net":{"$":0},"org":{"$":0},"sch":{"$":0},"ac":{"$":0},"gov":{"$":0},"mil":{"$":0},"blogspot":{"$":0},"nom":{"$":0}},"aero":{"$":0,"accident-investigation":{"$":0},"accident-prevention":{"$":0},"aerobatic":{"$":0},"aeroclub":{"$":0},"aerodrome":{"$":0},"agents":{"$":0},"aircraft":{"$":0},"airline":{"$":0},"airport":{"$":0},"air-surveillance":{"$":0},"airtraffic":{"$":0},"air-traffic-control":{"$":0},"ambulance":{"$":0},"amusement":{"$":0},"association":{"$":0},"author":{"$":0},"ballooning":{"$":0},"broker":{"$":0},"caa":{"$":0},"cargo":{"$":0},"catering":{"$":0},"certification":{"$":0},"championship":{"$":0},"charter":{"$":0},"civilaviation":{"$":0},"club":{"$":0},"conference":{"$":0},"consultant":{"$":0},"consulting":{"$":0},"control":{"$":0},"council":{"$":0},"crew":{"$":0},"design":{"$":0},"dgca":{"$":0},"educator":{"$":0},"emergency":{"$":0},"engine":{"$":0},"engineer":{"$":0},"entertainment":{"$":0},"equipment":{"$":0},"exchange":{"$":0},"express":{"$":0},"federation":{"$":0},"flight":{"$":0},"fuel":{"$":0},"gliding":{"$":0},"government":{"$":0},"groundhandling":{"$":0},"group":{"$":0},"hanggliding":{"$":0},"homebuilt":{"$":0},"insurance":{"$":0},"journal":{"$":0},"journalist":{"$":0},"leasing":{"$":0},"logistics":{"$":0},"magazine":{"$":0},"maintenance":{"$":0},"media":{"$":0},"microlight":{"$":0},"modelling":{"$":0},"navigation":{"$":0},"parachuting":{"$":0},"paragliding":{"$":0},"passenger-association":{"$":0},"pilot":{"$":0},"press":{"$":0},"production":{"$":0},"recreation":{"$":0},"repbody":{"$":0},"res":{"$":0},"research":{"$":0},"rotorcraft":{"$":0},"safety":{"$":0},"scientist":{"$":0},"services":{"$":0},"show":{"$":0},"skydiving":{"$":0},"software":{"$":0},"student":{"$":0},"trader":{"$":0},"trading":{"$":0},"trainer":{"$":0},"union":{"$":0},"workinggroup":{"$":0},"works":{"$":0}},"af":{"$":0,"gov":{"$":0},"com":{"$":0},"org":{"$":0},"net":{"$":0},"edu":{"$":0},"nom":{"$":0}},"ag":{"$":0,"com":{"$":0},"org":{"$":0},"net":{"$":0},"co":{"$":0},"nom":{"$":0}},"ai":{"$":0,"off":{"$":0},"com":{"$":0},"net":{"$":0},"org":{"$":0},"uwu":{"$":0},"nom":{"$":0}},"al":{"$":0,"com":{"$":0},"edu":{"$":0},"gov":{"$":0},"mil":{"$":0},"net":{"$":0},"org":{"$":0},"blogspot":{"$":0},"nom":{"$":0}},"am":{"$":0,"co":{"$":0},"com":{"$":0},"commune":{"$":0},"net":{"$":0},"org":{"$":0},"radio":{"$":0},"blogspot":{"$":0},"neko":{"$":0},"nyaa":{"$":0}},"ao":{"$":0,"ed":{"$":0},"gv":{"$":0},"og":{"$":0},"co":{"$":0},"pb":{"$":0},"it":{"$":0}},"aq":{"$":0},"ar":{"$":0,"com":{"$":0,"blogspot":{"$":0}},"edu":{"$":0},"gob":{"$":0},"gov":{"$":0},"int":{"$":0},"mil":{"$":0},"musica":{"$":0},"net":{"$":0},"org":{"$":0},"tur":{"$":0}},"arpa":{"$":0,"e164":{"$":0},"in-addr":{"$":0},"ip6":{"$":0},"iris":{"$":0},"uri":{"$":0},"urn":{"$":0}},"as":{"$":0,"gov":{"$":0}},"asia":{"$":0,"cloudns":{"$":0}},"at":{"$":0,"ac":{"$":0,"sth":{"$":0}},"co":{"$":0,"blogspot":{"$":0}},"gv":{"$":0},"or":{"$":0},"funkfeuer":{"wien":{"$":0}},"futurecms":{"*":{"$":0},"ex":{"*":{"$":0}},"in":{"*":{"$":0}}},"futurehosting":{"$":0},"futuremailing":{"$":0},"ortsinfo":{"ex":{"*":{"$":0}},"kunden":{"*":{"$":0}}},"biz":{"$":0},"info":{"$":0},"priv":{"$":0},"12hp":{"$":0},"2ix":{"$":0},"4lima":{"$":0},"lima-city":{"$":0}},"au":{"$":0,"com":{"$":0,"blogspot":{"$":0},"cloudlets":{"mel":{"$":0}}},"net":{"$":0},"org":{"$":0},"edu":{"$":0,"act":{"$":0},"catholic":{"$":0},"nsw":{"$":0,"schools":{"$":0}},"nt":{"$":0},"qld":{"$":0},"sa":{"$":0},"tas":{"$":0},"vic":{"$":0},"wa":{"$":0}},"gov":{"$":0,"qld":{"$":0},"sa":{"$":0},"tas":{"$":0},"vic":{"$":0},"wa":{"$":0}},"asn":{"$":0},"id":{"$":0},"info":{"$":0},"conf":{"$":0},"oz":{"$":0},"act":{"$":0},"nsw":{"$":0},"nt":{"$":0},"qld":{"$":0},"sa":{"$":0},"tas":{"$":0},"vic":{"$":0},"wa":{"$":0}},"aw":{"$":0,"com":{"$":0}},"ax":{"$":0,"be":{"$":0},"cat":{"$":0},"es":{"$":0},"eu":{"$":0},"gg":{"$":0},"mc":{"$":0},"us":{"$":0},"xy":{"$":0}},"az":{"$":0,"com":{"$":0},"net":{"$":0},"int":{"$":0},"gov":{"$":0},"org":{"$":0},"edu":{"$":0},"info":{"$":0},"pp":{"$":0},"mil":{"$":0},"name":{"$":0},"pro":{"$":0},"biz":{"$":0}},"ba":{"$":0,"com":{"$":0},"edu":{"$":0},"gov":{"$":0},"mil":{"$":0},"net":{"$":0},"org":{"$":0},"blogspot":{"$":0}},"bb":{"$":0,"biz":{"$":0},"co":{"$":0},"com":{"$":0},"edu":{"$":0},"gov":{"$":0},"info":{"$":0},"net":{"$":0},"org":{"$":0},"store":{"$":0},"tv":{"$":0}},"bd":{"*":{"$":0}},"be":{"$":0,"ac":{"$":0},"webhosting":{"$":0},"blogspot":{"$":0},"interhostsolutions":{"cloud":{"$":0}},"kuleuven":{"ezproxy":{"$":0}},"transurl":{"*":{"$":0}}},"bf":{"$":0,"gov":{"$":0}},"bg":{"0":{"$":0},"1":{"$":0},"2":{"$":0},"3":{"$":0},"4":{"$":0},"5":{"$":0},"6":{"$":0},"7":{"$":0},"8":{"$":0},"9":{"$":0},"$":0,"a":{"$":0},"b":{"$":0},"c":{"$":0},"d":{"$":0},"e":{"$":0},"f":{"$":0},"g":{"$":0},"h":{"$":0},"i":{"$":0},"j":{"$":0},"k":{"$":0},"l":{"$":0},"m":{"$":0},"n":{"$":0},"o":{"$":0},"p":{"$":0},"q":{"$":0},"r":{"$":0},"s":{"$":0},"t":{"$":0},"u":{"$":0},"v":{"$":0},"w":{"$":0},"x":{"$":0},"y":{"$":0},"z":{"$":0},"blogspot":{"$":0},"barsy":{"$":0}},"bh":{"$":0,"com":{"$":0},"edu":{"$":0},"net":{"$":0},"org":{"$":0},"gov":{"$":0}},"bi":{"$":0,"co":{"$":0},"com":{"$":0},"edu":{"$":0},"or":{"$":0},"org":{"$":0}},"biz":{"$":0,"cloudns":{"$":0},"jozi":{"$":0},"dyndns":{"$":0},"for-better":{"$":0},"for-more":{"$":0},"for-some":{"$":0},"for-the":{"$":0},"selfip":{"$":0},"webhop":{"$":0},"orx":{"$":0},"mmafan":{"$":0},"myftp":{"$":0},"no-ip":{"$":0},"dscloud":{"$":0}},"bj":{"$":0,"asso":{"$":0},"barreau":{"$":0},"gouv":{"$":0},"blogspot":{"$":0}},"bm":{"$":0,"com":{"$":0},"edu":{"$":0},"gov":{"$":0},"net":{"$":0},"org":{"$":0}},"bn":{"$":0,"com":{"$":0},"edu":{"$":0},"gov":{"$":0},"net":{"$":0},"org":{"$":0},"co":{"$":0}},"bo":{"$":0,"com":{"$":0},"edu":{"$":0},"gob":{"$":0},"int":{"$":0},"org":{"$":0},"net":{"$":0},"mil":{"$":0},"tv":{"$":0},"web":{"$":0},"academia":{"$":0},"agro":{"$":0},"arte":{"$":0},"blog":{"$":0},"bolivia":{"$":0},"ciencia":{"$":0},"cooperativa":{"$":0},"democracia":{"$":0},"deporte":{"$":0},"ecologia":{"$":0},"economia":{"$":0},"empresa":{"$":0},"indigena":{"$":0},"industria":{"$":0},"info":{"$":0},"medicina":{"$":0},"movimiento":{"$":0},"musica":{"$":0},"natural":{"$":0},"nombre":{"$":0},"noticias":{"$":0},"patria":{"$":0},"politica":{"$":0},"profesional":{"$":0},"plurinacional":{"$":0},"pueblo":{"$":0},"revista":{"$":0},"salud":{"$":0},"tecnologia":{"$":0},"tksat":{"$":0},"transporte":{"$":0},"wiki":{"$":0}},"br":{"$":0,"9guacu":{"$":0},"abc":{"$":0},"adm":{"$":0},"adv":{"$":0},"agr":{"$":0},"aju":{"$":0},"am":{"$":0},"anani":{"$":0},"aparecida":{"$":0},"app":{"$":0},"arq":{"$":0},"art":{"$":0},"ato":{"$":0},"b":{"$":0},"barueri":{"$":0},"belem":{"$":0},"bhz":{"$":0},"bib":{"$":0},"bio":{"$":0},"blog":{"$":0},"bmd":{"$":0},"boavista":{"$":0},"bsb":{"$":0},"campinagrande":{"$":0},"campinas":{"$":0},"caxias":{"$":0},"cim":{"$":0},"cng":{"$":0},"cnt":{"$":0},"com":{"$":0,"blogspot":{"$":0},"virtualcloud":{"scale":{"users":{"$":0}}}},"contagem":{"$":0},"coop":{"$":0},"coz":{"$":0},"cri":{"$":0},"cuiaba":{"$":0},"curitiba":{"$":0},"def":{"$":0},"des":{"$":0},"det":{"$":0},"dev":{"$":0},"ecn":{"$":0},"eco":{"$":0},"edu":{"$":0},"emp":{"$":0},"enf":{"$":0},"eng":{"$":0},"esp":{"$":0},"etc":{"$":0},"eti":{"$":0},"far":{"$":0},"feira":{"$":0},"flog":{"$":0},"floripa":{"$":0},"fm":{"$":0},"fnd":{"$":0},"fortal":{"$":0},"fot":{"$":0},"foz":{"$":0},"fst":{"$":0},"g12":{"$":0},"geo":{"$":0},"ggf":{"$":0},"goiania":{"$":0},"gov":{"$":0,"ac":{"$":0},"al":{"$":0},"am":{"$":0},"ap":{"$":0},"ba":{"$":0},"ce":{"$":0},"df":{"$":0},"es":{"$":0},"go":{"$":0},"ma":{"$":0},"mg":{"$":0},"ms":{"$":0},"mt":{"$":0},"pa":{"$":0},"pb":{"$":0},"pe":{"$":0},"pi":{"$":0},"pr":{"$":0},"rj":{"$":0},"rn":{"$":0},"ro":{"$":0},"rr":{"$":0},"rs":{"$":0},"sc":{"$":0},"se":{"$":0},"sp":{"$":0},"to":{"$":0}},"gru":{"$":0},"imb":{"$":0},"ind":{"$":0},"inf":{"$":0},"jab":{"$":0},"jampa":{"$":0},"jdf":{"$":0},"joinville":{"$":0},"jor":{"$":0},"jus":{"$":0},"leg":{"$":0,"ac":{"$":0},"al":{"$":0},"am":{"$":0},"ap":{"$":0},"ba":{"$":0},"ce":{"$":0},"df":{"$":0},"es":{"$":0},"go":{"$":0},"ma":{"$":0},"mg":{"$":0},"ms":{"$":0},"mt":{"$":0},"pa":{"$":0},"pb":{"$":0},"pe":{"$":0},"pi":{"$":0},"pr":{"$":0},"rj":{"$":0},"rn":{"$":0},"ro":{"$":0},"rr":{"$":0},"rs":{"$":0},"sc":{"$":0},"se":{"$":0},"sp":{"$":0},"to":{"$":0}},"lel":{"$":0},"log":{"$":0},"londrina":{"$":0},"macapa":{"$":0},"maceio":{"$":0},"manaus":{"$":0},"maringa":{"$":0},"mat":{"$":0},"med":{"$":0},"mil":{"$":0},"morena":{"$":0},"mp":{"$":0},"mus":{"$":0},"natal":{"$":0},"net":{"$":0},"niteroi":{"$":0},"nom":{"*":{"$":0}},"not":{"$":0},"ntr":{"$":0},"odo":{"$":0},"ong":{"$":0},"org":{"$":0},"osasco":{"$":0},"palmas":{"$":0},"poa":{"$":0},"ppg":{"$":0},"pro":{"$":0},"psc":{"$":0},"psi":{"$":0},"pvh":{"$":0},"qsl":{"$":0},"radio":{"$":0},"rec":{"$":0},"recife":{"$":0},"rep":{"$":0},"ribeirao":{"$":0},"rio":{"$":0},"riobranco":{"$":0},"riopreto":{"$":0},"salvador":{"$":0},"sampa":{"$":0},"santamaria":{"$":0},"santoandre":{"$":0},"saobernardo":{"$":0},"saogonca":{"$":0},"seg":{"$":0},"sjc":{"$":0},"slg":{"$":0},"slz":{"$":0},"sorocaba":{"$":0},"srv":{"$":0},"taxi":{"$":0},"tc":{"$":0},"tec":{"$":0},"teo":{"$":0},"the":{"$":0},"tmp":{"$":0},"trd":{"$":0},"tur":{"$":0},"tv":{"$":0},"udi":{"$":0},"vet":{"$":0},"vix":{"$":0},"vlog":{"$":0},"wiki":{"$":0},"zlg":{"$":0}},"bs":{"$":0,"com":{"$":0},"net":{"$":0},"org":{"$":0},"edu":{"$":0},"gov":{"$":0},"we":{"$":0}},"bt":{"$":0,"com":{"$":0},"edu":{"$":0},"gov":{"$":0},"net":{"$":0},"org":{"$":0}},"bv":{"$":0},"bw":{"$":0,"co":{"$":0},"org":{"$":0}},"by":{"$":0,"gov":{"$":0},"mil":{"$":0},"com":{"$":0,"blogspot":{"$":0}},"of":{"$":0},"mycloud":{"$":0},"mediatech":{"$":0},"nym":{"$":0}},"bz":{"$":0,"com":{"$":0},"net":{"$":0},"org":{"$":0},"edu":{"$":0},"gov":{"$":0},"za":{"$":0},"gsj":{"$":0},"nom":{"$":0},"nym":{"$":0}},"ca":{"$":0,"ab":{"$":0},"bc":{"$":0},"mb":{"$":0},"nb":{"$":0},"nf":{"$":0},"nl":{"$":0},"ns":{"$":0},"nt":{"$":0},"nu":{"$":0},"on":{"$":0},"pe":{"$":0},"qc":{"$":0},"sk":{"$":0},"yk":{"$":0},"gc":{"$":0},"barsy":{"$":0},"awdev":{"*":{"$":0}},"co":{"$":0},"blogspot":{"$":0},"no-ip":{"$":0}},"cat":{"$":0},"cc":{"$":0,"cloudns":{"$":0},"ftpaccess":{"$":0},"game-server":{"$":0},"myphotos":{"$":0},"scrapping":{"$":0},"twmail":{"$":0},"csx":{"$":0},"fantasyleague":{"$":0}},"cd":{"$":0,"gov":{"$":0}},"cf":{"$":0,"blogspot":{"$":0}},"cg":{"$":0},"ch":{"$":0,"square7":{"$":0},"blogspot":{"$":0},"flow":{"ae":{"alp1":{"$":0}},"appengine":{"$":0}},"linkyard-cloud":{"$":0},"dnsking":{"$":0},"gotdns":{"$":0},"firenet":{"*":{"$":0},"svc":{"*":{"$":0}}},"12hp":{"$":0},"2ix":{"$":0},"4lima":{"$":0},"lima-city":{"$":0}},"ci":{"$":0,"org":{"$":0},"or":{"$":0},"com":{"$":0},"co":{"$":0},"edu":{"$":0},"ed":{"$":0},"ac":{"$":0},"net":{"$":0},"go":{"$":0},"asso":{"$":0},"xn--aroport-bya":{"$":0},"int":{"$":0},"presse":{"$":0},"md":{"$":0},"gouv":{"$":0},"fin":{"$":0},"nl":{"$":0}},"ck":{"*":{"$":0}},"cl":{"$":0,"co":{"$":0},"gob":{"$":0},"gov":{"$":0},"mil":{"$":0},"blogspot":{"$":0},"nom":{"$":0}},"cm":{"$":0,"co":{"$":0},"com":{"$":0},"gov":{"$":0},"net":{"$":0}},"cn":{"$":0,"ac":{"$":0},"com":{"$":0,"amazonaws":{"compute":{"*":{"$":0}},"eb":{"cn-north-1":{"$":0},"cn-northwest-1":{"$":0}},"elb":{"*":{"$":0}},"cn-north-1":{"s3":{"$":0}}}},"edu":{"$":0},"gov":{"$":0},"net":{"$":0},"org":{"$":0},"mil":{"$":0},"xn--55qx5d":{"$":0},"xn--io0a7i":{"$":0},"xn--od0alg":{"$":0},"ah":{"$":0},"bj":{"$":0},"cq":{"$":0},"fj":{"$":0},"gd":{"$":0},"gs":{"$":0},"gz":{"$":0},"gx":{"$":0},"ha":{"$":0},"hb":{"$":0},"he":{"$":0},"hi":{"$":0},"hl":{"$":0},"hn":{"$":0},"jl":{"$":0},"js":{"$":0},"jx":{"$":0},"ln":{"$":0},"nm":{"$":0},"nx":{"$":0},"qh":{"$":0},"sc":{"$":0},"sd":{"$":0},"sh":{"$":0},"sn":{"$":0},"sx":{"$":0},"tj":{"$":0},"xj":{"$":0},"xz":{"$":0},"yn":{"$":0},"zj":{"$":0},"hk":{"$":0},"mo":{"$":0},"tw":{"$":0},"instantcloud":{"$":0}},"co":{"$":0,"arts":{"$":0},"com":{"$":0,"blogspot":{"$":0}},"edu":{"$":0},"firm":{"$":0},"gov":{"$":0},"info":{"$":0},"int":{"$":0},"mil":{"$":0},"net":{"$":0},"nom":{"$":0},"org":{"$":0},"rec":{"$":0},"web":{"$":0},"carrd":{"$":0},"crd":{"$":0},"otap":{"*":{"$":0}},"leadpages":{"$":0},"lpages":{"$":0},"mypi":{"$":0},"n4t":{"$":0},"nodum":{"$":0},"repl":{"$":0,"id":{"$":0}}},"com":{"$":0,"devcdnaccesso":{"*":{"$":0}},"adobeaemcloud":{"$":0,"dev":{"*":{"$":0}}},"kasserver":{"$":0},"amazonaws":{"compute":{"*":{"$":0}},"compute-1":{"*":{"$":0}},"us-east-1":{"$":0,"dualstack":{"s3":{"$":0}}},"elb":{"*":{"$":0}},"s3":{"$":0},"s3-ap-northeast-1":{"$":0},"s3-ap-northeast-2":{"$":0},"s3-ap-south-1":{"$":0},"s3-ap-southeast-1":{"$":0},"s3-ap-southeast-2":{"$":0},"s3-ca-central-1":{"$":0},"s3-eu-central-1":{"$":0},"s3-eu-west-1":{"$":0},"s3-eu-west-2":{"$":0},"s3-eu-west-3":{"$":0},"s3-external-1":{"$":0},"s3-fips-us-gov-west-1":{"$":0},"s3-sa-east-1":{"$":0},"s3-us-gov-west-1":{"$":0},"s3-us-east-2":{"$":0},"s3-us-west-1":{"$":0},"s3-us-west-2":{"$":0},"ap-northeast-2":{"s3":{"$":0},"dualstack":{"s3":{"$":0}},"s3-website":{"$":0}},"ap-south-1":{"s3":{"$":0},"dualstack":{"s3":{"$":0}},"s3-website":{"$":0}},"ca-central-1":{"s3":{"$":0},"dualstack":{"s3":{"$":0}},"s3-website":{"$":0}},"eu-central-1":{"s3":{"$":0},"dualstack":{"s3":{"$":0}},"s3-website":{"$":0}},"eu-west-2":{"s3":{"$":0},"dualstack":{"s3":{"$":0}},"s3-website":{"$":0}},"eu-west-3":{"s3":{"$":0},"dualstack":{"s3":{"$":0}},"s3-website":{"$":0}},"us-east-2":{"s3":{"$":0},"dualstack":{"s3":{"$":0}},"s3-website":{"$":0}},"ap-northeast-1":{"dualstack":{"s3":{"$":0}}},"ap-southeast-1":{"dualstack":{"s3":{"$":0}}},"ap-southeast-2":{"dualstack":{"s3":{"$":0}}},"eu-west-1":{"dualstack":{"s3":{"$":0}}},"sa-east-1":{"dualstack":{"s3":{"$":0}}},"s3-website-us-east-1":{"$":0},"s3-website-us-west-1":{"$":0},"s3-website-us-west-2":{"$":0},"s3-website-ap-northeast-1":{"$":0},"s3-website-ap-southeast-1":{"$":0},"s3-website-ap-southeast-2":{"$":0},"s3-website-eu-west-1":{"$":0},"s3-website-sa-east-1":{"$":0}},"elasticbeanstalk":{"$":0,"ap-northeast-1":{"$":0},"ap-northeast-2":{"$":0},"ap-northeast-3":{"$":0},"ap-south-1":{"$":0},"ap-southeast-1":{"$":0},"ap-southeast-2":{"$":0},"ca-central-1":{"$":0},"eu-central-1":{"$":0},"eu-west-1":{"$":0},"eu-west-2":{"$":0},"eu-west-3":{"$":0},"sa-east-1":{"$":0},"us-east-1":{"$":0},"us-east-2":{"$":0},"us-gov-west-1":{"$":0},"us-west-1":{"$":0},"us-west-2":{"$":0}},"awsglobalaccelerator":{"$":0},"appspacehosted":{"$":0},"appspaceusercontent":{"$":0},"on-aptible":{"$":0},"myasustor":{"$":0},"balena-devices":{"$":0},"betainabox":{"$":0},"boutir":{"$":0},"bplaced":{"$":0},"cafjs":{"$":0},"br":{"$":0},"cn":{"$":0},"de":{"$":0},"eu":{"$":0},"jpn":{"$":0},"mex":{"$":0},"ru":{"$":0},"sa":{"$":0},"uk":{"$":0},"us":{"$":0},"za":{"$":0},"ar":{"$":0},"gb":{"$":0},"hu":{"$":0},"kr":{"$":0},"no":{"$":0},"qc":{"$":0},"uy":{"$":0},"africa":{"$":0},"gr":{"$":0},"co":{"$":0},"jdevcloud":{"$":0},"wpdevcloud":{"$":0},"cloudcontrolled":{"$":0},"cloudcontrolapp":{"$":0},"trycloudflare":{"$":0},"customer-oci":{"*":{"$":0},"oci":{"*":{"$":0}},"ocp":{"*":{"$":0}},"ocs":{"*":{"$":0}}},"dattolocal":{"$":0},"dattorelay":{"$":0},"dattoweb":{"$":0},"mydatto":{"$":0},"builtwithdark":{"$":0},"ddns5":{"$":0},"drayddns":{"$":0},"dreamhosters":{"$":0},"mydrobo":{"$":0},"dyndns-at-home":{"$":0},"dyndns-at-work":{"$":0},"dyndns-blog":{"$":0},"dyndns-free":{"$":0},"dyndns-home":{"$":0},"dyndns-ip":{"$":0},"dyndns-mail":{"$":0},"dyndns-office":{"$":0},"dyndns-pics":{"$":0},"dyndns-remote":{"$":0},"dyndns-server":{"$":0},"dyndns-web":{"$":0},"dyndns-wiki":{"$":0},"dyndns-work":{"$":0},"blogdns":{"$":0},"cechire":{"$":0},"dnsalias":{"$":0},"dnsdojo":{"$":0},"doesntexist":{"$":0},"dontexist":{"$":0},"doomdns":{"$":0},"dyn-o-saur":{"$":0},"dynalias":{"$":0},"est-a-la-maison":{"$":0},"est-a-la-masion":{"$":0},"est-le-patron":{"$":0},"est-mon-blogueur":{"$":0},"from-ak":{"$":0},"from-al":{"$":0},"from-ar":{"$":0},"from-ca":{"$":0},"from-ct":{"$":0},"from-dc":{"$":0},"from-de":{"$":0},"from-fl":{"$":0},"from-ga":{"$":0},"from-hi":{"$":0},"from-ia":{"$":0},"from-id":{"$":0},"from-il":{"$":0},"from-in":{"$":0},"from-ks":{"$":0},"from-ky":{"$":0},"from-ma":{"$":0},"from-md":{"$":0},"from-mi":{"$":0},"from-mn":{"$":0},"from-mo":{"$":0},"from-ms":{"$":0},"from-mt":{"$":0},"from-nc":{"$":0},"from-nd":{"$":0},"from-ne":{"$":0},"from-nh":{"$":0},"from-nj":{"$":0},"from-nm":{"$":0},"from-nv":{"$":0},"from-oh":{"$":0},"from-ok":{"$":0},"from-or":{"$":0},"from-pa":{"$":0},"from-pr":{"$":0},"from-ri":{"$":0},"from-sc":{"$":0},"from-sd":{"$":0},"from-tn":{"$":0},"from-tx":{"$":0},"from-ut":{"$":0},"from-va":{"$":0},"from-vt":{"$":0},"from-wa":{"$":0},"from-wi":{"$":0},"from-wv":{"$":0},"from-wy":{"$":0},"getmyip":{"$":0},"gotdns":{"$":0},"hobby-site":{"$":0},"homelinux":{"$":0},"homeunix":{"$":0},"iamallama":{"$":0},"is-a-anarchist":{"$":0},"is-a-blogger":{"$":0},"is-a-bookkeeper":{"$":0},"is-a-bulls-fan":{"$":0},"is-a-caterer":{"$":0},"is-a-chef":{"$":0},"is-a-conservative":{"$":0},"is-a-cpa":{"$":0},"is-a-cubicle-slave":{"$":0},"is-a-democrat":{"$":0},"is-a-designer":{"$":0},"is-a-doctor":{"$":0},"is-a-financialadvisor":{"$":0},"is-a-geek":{"$":0},"is-a-green":{"$":0},"is-a-guru":{"$":0},"is-a-hard-worker":{"$":0},"is-a-hunter":{"$":0},"is-a-landscaper":{"$":0},"is-a-lawyer":{"$":0},"is-a-liberal":{"$":0},"is-a-libertarian":{"$":0},"is-a-llama":{"$":0},"is-a-musician":{"$":0},"is-a-nascarfan":{"$":0},"is-a-nurse":{"$":0},"is-a-painter":{"$":0},"is-a-personaltrainer":{"$":0},"is-a-photographer":{"$":0},"is-a-player":{"$":0},"is-a-republican":{"$":0},"is-a-rockstar":{"$":0},"is-a-socialist":{"$":0},"is-a-student":{"$":0},"is-a-teacher":{"$":0},"is-a-techie":{"$":0},"is-a-therapist":{"$":0},"is-an-accountant":{"$":0},"is-an-actor":{"$":0},"is-an-actress":{"$":0},"is-an-anarchist":{"$":0},"is-an-artist":{"$":0},"is-an-engineer":{"$":0},"is-an-entertainer":{"$":0},"is-certified":{"$":0},"is-gone":{"$":0},"is-into-anime":{"$":0},"is-into-cars":{"$":0},"is-into-cartoons":{"$":0},"is-into-games":{"$":0},"is-leet":{"$":0},"is-not-certified":{"$":0},"is-slick":{"$":0},"is-uberleet":{"$":0},"is-with-theband":{"$":0},"isa-geek":{"$":0},"isa-hockeynut":{"$":0},"issmarterthanyou":{"$":0},"likes-pie":{"$":0},"likescandy":{"$":0},"neat-url":{"$":0},"saves-the-whales":{"$":0},"selfip":{"$":0},"sells-for-less":{"$":0},"sells-for-u":{"$":0},"servebbs":{"$":0},"simple-url":{"$":0},"space-to-rent":{"$":0},"teaches-yoga":{"$":0},"writesthisblog":{"$":0},"ddnsfree":{"$":0},"ddnsgeek":{"$":0},"giize":{"$":0},"gleeze":{"$":0},"kozow":{"$":0},"loseyourip":{"$":0},"ooguy":{"$":0},"theworkpc":{"$":0},"mytuleap":{"$":0},"evennode":{"eu-1":{"$":0},"eu-2":{"$":0},"eu-3":{"$":0},"eu-4":{"$":0},"us-1":{"$":0},"us-2":{"$":0},"us-3":{"$":0},"us-4":{"$":0}},"onfabrica":{"$":0},"fbsbx":{"apps":{"$":0}},"fastly-terrarium":{"$":0},"fastvps-server":{"$":0},"mydobiss":{"$":0},"firebaseapp":{"$":0},"forgeblocks":{"$":0},"framercanvas":{"$":0},"freebox-os":{"$":0},"freeboxos":{"$":0},"freemyip":{"$":0},"gentapps":{"$":0},"gentlentapis":{"$":0},"githubusercontent":{"$":0},"0emm":{"*":{"$":0}},"appspot":{"$":0,"r":{"*":{"$":0}}},"codespot":{"$":0},"googleapis":{"$":0},"googlecode":{"$":0},"pagespeedmobilizer":{"$":0},"publishproxy":{"$":0},"withgoogle":{"$":0},"withyoutube":{"$":0},"blogspot":{"$":0},"awsmppl":{"$":0},"herokuapp":{"$":0},"herokussl":{"$":0},"myravendb":{"$":0},"impertrixcdn":{"$":0},"impertrix":{"$":0},"smushcdn":{"$":0},"wphostedmail":{"$":0},"wpmucdn":{"$":0},"pixolino":{"$":0},"amscompute":{"$":0},"clicketcloud":{"$":0},"dopaas":{"$":0},"hidora":{"$":0},"hosted-by-previder":{"paas":{"$":0}},"hosteur":{"rag-cloud":{"$":0},"rag-cloud-ch":{"$":0}},"ik-server":{"jcloud":{"$":0},"jcloud-ver-jpc":{"$":0}},"jelastic":{"demo":{"$":0}},"kilatiron":{"$":0},"massivegrid":{"paas":{"$":0}},"wafaicloud":{"jed":{"$":0},"lon":{"$":0},"ryd":{"$":0}},"joyent":{"cns":{"*":{"$":0}}},"lpusercontent":{"$":0},"lmpm":{"app":{"$":0}},"linode":{"members":{"$":0},"nodebalancer":{"*":{"$":0}}},"linodeobjects":{"*":{"$":0}},"barsycenter":{"$":0},"barsyonline":{"$":0},"mazeplay":{"$":0},"miniserver":{"$":0},"meteorapp":{"$":0,"eu":{"$":0}},"hostedpi":{"$":0},"mythic-beasts":{"customer":{"$":0},"caracal":{"$":0},"fentiger":{"$":0},"lynx":{"$":0},"ocelot":{"$":0},"oncilla":{"$":0},"onza":{"$":0},"sphinx":{"$":0},"vs":{"$":0},"x":{"$":0},"yali":{"$":0}},"4u":{"$":0},"nfshost":{"$":0},"001www":{"$":0},"ddnslive":{"$":0},"myiphost":{"$":0},"blogsyte":{"$":0},"ciscofreak":{"$":0},"damnserver":{"$":0},"ditchyourip":{"$":0},"dnsiskinky":{"$":0},"dynns":{"$":0},"geekgalaxy":{"$":0},"health-carereform":{"$":0},"homesecuritymac":{"$":0},"homesecuritypc":{"$":0},"myactivedirectory":{"$":0},"mysecuritycamera":{"$":0},"net-freaks":{"$":0},"onthewifi":{"$":0},"point2this":{"$":0},"quicksytes":{"$":0},"securitytactics":{"$":0},"serveexchange":{"$":0},"servehumour":{"$":0},"servep2p":{"$":0},"servesarcasm":{"$":0},"stufftoread":{"$":0},"unusualperson":{"$":0},"workisboring":{"$":0},"3utilities":{"$":0},"ddnsking":{"$":0},"myvnc":{"$":0},"servebeer":{"$":0},"servecounterstrike":{"$":0},"serveftp":{"$":0},"servegame":{"$":0},"servehalflife":{"$":0},"servehttp":{"$":0},"serveirc":{"$":0},"servemp3":{"$":0},"servepics":{"$":0},"servequake":{"$":0},"observableusercontent":{"static":{"$":0}},"orsites":{"$":0},"operaunite":{"$":0},"authgear-staging":{"$":0},"authgearapps":{"$":0},"skygearapp":{"$":0},"outsystemscloud":{"$":0},"ownprovider":{"$":0},"pgfog":{"$":0},"pagefrontapp":{"$":0},"pagexl":{"$":0},"paywhirl":{"*":{"$":0}},"gotpantheon":{"$":0},"platter-app":{"$":0},"pleskns":{"$":0},"postman-echo":{"$":0},"prgmr":{"xen":{"$":0}},"pythonanywhere":{"$":0,"eu":{"$":0}},"qualifioapp":{"$":0},"qbuser":{"$":0},"qa2":{"$":0},"dev-myqnapcloud":{"$":0},"alpha-myqnapcloud":{"$":0},"myqnapcloud":{"$":0},"quipelements":{"*":{"$":0}},"rackmaze":{"$":0},"rhcloud":{"$":0},"render":{"app":{"$":0}},"onrender":{"$":0},"logoip":{"$":0},"scrysec":{"$":0},"firewall-gateway":{"$":0},"myshopblocks":{"$":0},"myshopify":{"$":0},"shopitsite":{"$":0},"1kapp":{"$":0},"appchizi":{"$":0},"applinzi":{"$":0},"sinaapp":{"$":0},"vipsinaapp":{"$":0},"bounty-full":{"$":0,"alpha":{"$":0},"beta":{"$":0}},"try-snowplow":{"$":0},"stackhero-network":{"$":0},"playstation-cloud":{"$":0},"stdlib":{"api":{"$":0}},"temp-dns":{"$":0},"dsmynas":{"$":0},"familyds":{"$":0},"thingdustdata":{"$":0},"bloxcms":{"$":0},"townnews-staging":{"$":0},"hk":{"$":0},"wafflecell":{"$":0},"idnblogger":{"$":0},"indowapblog":{"$":0},"reserve-online":{"$":0},"hotelwithflight":{"$":0},"remotewd":{"$":0},"wiardweb":{"pages":{"$":0}},"woltlab-demo":{"$":0},"wpenginepowered":{"$":0,"js":{"$":0}},"wixsite":{"$":0},"xnbay":{"$":0,"u2":{"$":0},"u2-local":{"$":0}},"yolasite":{"$":0}},"coop":{"$":0},"cr":{"$":0,"ac":{"$":0},"co":{"$":0},"ed":{"$":0},"fi":{"$":0},"go":{"$":0},"or":{"$":0},"sa":{"$":0}},"cu":{"$":0,"com":{"$":0},"edu":{"$":0},"org":{"$":0},"net":{"$":0},"gov":{"$":0},"inf":{"$":0}},"cv":{"$":0,"blogspot":{"$":0}},"cw":{"$":0,"com":{"$":0},"edu":{"$":0},"net":{"$":0},"org":{"$":0}},"cx":{"$":0,"gov":{"$":0},"ath":{"$":0},"info":{"$":0}},"cy":{"$":0,"ac":{"$":0},"biz":{"$":0},"com":{"$":0,"blogspot":{"$":0},"scaleforce":{"j":{"$":0}}},"ekloges":{"$":0},"gov":{"$":0},"ltd":{"$":0},"name":{"$":0},"net":{"$":0},"org":{"$":0},"parliament":{"$":0},"press":{"$":0},"pro":{"$":0},"tm":{"$":0}},"cz":{"$":0,"co":{"$":0},"realm":{"$":0},"e4":{"$":0},"blogspot":{"$":0},"metacentrum":{"cloud":{"*":{"$":0}},"custom":{"$":0}},"muni":{"cloud":{"flt":{"$":0},"usr":{"$":0}}}},"de":{"$":0,"bplaced":{"$":0},"square7":{"$":0},"com":{"$":0},"cosidns":{"dyn":{"$":0}},"dynamisches-dns":{"$":0},"dnsupdater":{"$":0},"internet-dns":{"$":0},"l-o-g-i-n":{"$":0},"dnshome":{"$":0},"fuettertdasnetz":{"$":0},"isteingeek":{"$":0},"istmein":{"$":0},"lebtimnetz":{"$":0},"leitungsen":{"$":0},"traeumtgerade":{"$":0},"ddnss":{"$":0,"dyn":{"$":0},"dyndns":{"$":0}},"dyndns1":{"$":0},"dyn-ip24":{"$":0},"home-webserver":{"$":0,"dyn":{"$":0}},"myhome-server":{"$":0},"frusky":{"*":{"$":0}},"goip":{"$":0},"blogspot":{"$":0},"xn--gnstigbestellen-zvb":{"$":0},"xn--gnstigliefern-wob":{"$":0},"dyn-berlin":{"$":0},"in-berlin":{"$":0},"in-brb":{"$":0},"in-butter":{"$":0},"in-dsl":{"$":0},"in-vpn":{"$":0},"mein-iserv":{"$":0},"schulserver":{"$":0},"test-iserv":{"$":0},"keymachine":{"$":0},"git-repos":{"$":0},"lcube-server":{"$":0},"svn-repos":{"$":0},"barsy":{"$":0},"logoip":{"$":0},"firewall-gateway":{"$":0},"my-gateway":{"$":0},"my-router":{"$":0},"spdns":{"$":0},"speedpartner":{"customer":{"$":0}},"taifun-dns":{"$":0},"12hp":{"$":0},"2ix":{"$":0},"4lima":{"$":0},"lima-city":{"$":0},"dd-dns":{"$":0},"dray-dns":{"$":0},"draydns":{"$":0},"dyn-vpn":{"$":0},"dynvpn":{"$":0},"mein-vigor":{"$":0},"my-vigor":{"$":0},"my-wan":{"$":0},"syno-ds":{"$":0},"synology-diskstation":{"$":0},"synology-ds":{"$":0},"uberspace":{"*":{"$":0}},"virtualuser":{"$":0},"virtual-user":{"$":0},"community-pro":{"$":0},"diskussionsbereich":{"$":0}},"dj":{"$":0},"dk":{"$":0,"biz":{"$":0},"co":{"$":0},"firm":{"$":0},"reg":{"$":0},"store":{"$":0},"blogspot":{"$":0}},"dm":{"$":0,"com":{"$":0},"net":{"$":0},"org":{"$":0},"edu":{"$":0},"gov":{"$":0}},"do":{"$":0,"art":{"$":0},"com":{"$":0},"edu":{"$":0},"gob":{"$":0},"gov":{"$":0},"mil":{"$":0},"net":{"$":0},"org":{"$":0},"sld":{"$":0},"web":{"$":0}},"dz":{"$":0,"art":{"$":0},"asso":{"$":0},"com":{"$":0},"edu":{"$":0},"gov":{"$":0},"org":{"$":0},"net":{"$":0},"pol":{"$":0},"soc":{"$":0},"tm":{"$":0}},"ec":{"$":0,"com":{"$":0},"info":{"$":0},"net":{"$":0},"fin":{"$":0},"k12":{"$":0},"med":{"$":0},"pro":{"$":0},"org":{"$":0},"edu":{"$":0},"gov":{"$":0},"gob":{"$":0},"mil":{"$":0},"nym":{"$":0}},"edu":{"$":0,"rit":{"git-pages":{"$":0}}},"ee":{"$":0,"edu":{"$":0},"gov":{"$":0},"riik":{"$":0},"lib":{"$":0},"med":{"$":0},"com":{"$":0,"blogspot":{"$":0}},"pri":{"$":0},"aip":{"$":0},"org":{"$":0},"fie":{"$":0}},"eg":{"$":0,"com":{"$":0,"blogspot":{"$":0}},"edu":{"$":0},"eun":{"$":0},"gov":{"$":0},"mil":{"$":0},"name":{"$":0},"net":{"$":0},"org":{"$":0},"sci":{"$":0}},"er":{"*":{"$":0}},"es":{"$":0,"com":{"$":0,"blogspot":{"$":0}},"nom":{"$":0},"org":{"$":0},"gob":{"$":0},"edu":{"$":0}},"et":{"$":0,"com":{"$":0},"gov":{"$":0},"org":{"$":0},"edu":{"$":0},"biz":{"$":0},"name":{"$":0},"info":{"$":0},"net":{"$":0}},"eu":{"$":0,"mycd":{"$":0},"cloudns":{"$":0},"dogado":{"jelastic":{"$":0}},"barsy":{"$":0},"wellbeingzone":{"$":0},"spdns":{"$":0},"transurl":{"*":{"$":0}},"diskstation":{"$":0}},"fi":{"$":0,"aland":{"$":0},"dy":{"$":0},"blogspot":{"$":0},"xn--hkkinen-5wa":{"$":0},"iki":{"$":0},"cloudplatform":{"fi":{"$":0}},"datacenter":{"demo":{"$":0},"paas":{"$":0}}},"fj":{"$":0,"ac":{"$":0},"biz":{"$":0},"com":{"$":0},"gov":{"$":0},"info":{"$":0},"mil":{"$":0},"name":{"$":0},"net":{"$":0},"org":{"$":0},"pro":{"$":0}},"fk":{"*":{"$":0}},"fm":{"com":{"$":0},"edu":{"$":0},"net":{"$":0},"org":{"$":0},"$":0,"radio":{"$":0}},"fo":{"$":0},"fr":{"$":0,"asso":{"$":0},"com":{"$":0},"gouv":{"$":0},"nom":{"$":0},"prd":{"$":0},"tm":{"$":0},"aeroport":{"$":0},"avocat":{"$":0},"avoues":{"$":0},"cci":{"$":0},"chambagri":{"$":0},"chirurgiens-dentistes":{"$":0},"experts-comptables":{"$":0},"geometre-expert":{"$":0},"greta":{"$":0},"huissier-justice":{"$":0},"medecin":{"$":0},"notaires":{"$":0},"pharmacien":{"$":0},"port":{"$":0},"veterinaire":{"$":0},"en-root":{"$":0},"fbx-os":{"$":0},"fbxos":{"$":0},"freebox-os":{"$":0},"freeboxos":{"$":0},"blogspot":{"$":0},"goupile":{"$":0},"on-web":{"$":0},"chirurgiens-dentistes-en-france":{"$":0}},"ga":{"$":0},"gb":{"$":0},"gd":{"edu":{"$":0},"gov":{"$":0},"$":0,"nom":{"$":0}},"ge":{"$":0,"com":{"$":0},"edu":{"$":0},"gov":{"$":0},"org":{"$":0},"mil":{"$":0},"net":{"$":0},"pvt":{"$":0},"nom":{"$":0}},"gf":{"$":0},"gg":{"$":0,"co":{"$":0},"net":{"$":0},"org":{"$":0},"kaas":{"$":0},"cya":{"$":0},"panel":{"$":0,"daemon":{"$":0}}},"gh":{"$":0,"com":{"$":0},"edu":{"$":0},"gov":{"$":0},"org":{"$":0},"mil":{"$":0}},"gi":{"$":0,"com":{"$":0},"ltd":{"$":0},"gov":{"$":0},"mod":{"$":0},"edu":{"$":0},"org":{"$":0}},"gl":{"$":0,"co":{"$":0},"com":{"$":0},"edu":{"$":0},"net":{"$":0},"org":{"$":0},"biz":{"$":0},"nom":{"$":0},"xx":{"$":0}},"gm":{"$":0},"gn":{"$":0,"ac":{"$":0},"com":{"$":0},"edu":{"$":0},"gov":{"$":0},"org":{"$":0},"net":{"$":0}},"gov":{"$":0},"gp":{"$":0,"com":{"$":0},"net":{"$":0},"mobi":{"$":0},"edu":{"$":0},"org":{"$":0},"asso":{"$":0},"app":{"$":0}},"gq":{"$":0},"gr":{"$":0,"com":{"$":0},"edu":{"$":0},"net":{"$":0},"org":{"$":0},"gov":{"$":0},"blogspot":{"$":0},"nym":{"$":0}},"gs":{"$":0},"gt":{"$":0,"com":{"$":0},"edu":{"$":0},"gob":{"$":0},"ind":{"$":0},"mil":{"$":0},"net":{"$":0},"org":{"$":0},"nom":{"$":0},"blog":{"$":0},"de":{"$":0},"to":{"$":0}},"gu":{"$":0,"com":{"$":0},"edu":{"$":0},"gov":{"$":0},"guam":{"$":0},"info":{"$":0},"net":{"$":0},"org":{"$":0},"web":{"$":0}},"gw":{"$":0},"gy":{"$":0,"co":{"$":0},"com":{"$":0},"edu":{"$":0},"gov":{"$":0},"net":{"$":0},"org":{"$":0},"nym":{"$":0},"be":{"$":0}},"hk":{"$":0,"com":{"$":0},"edu":{"$":0},"gov":{"$":0},"idv":{"$":0},"net":{"$":0},"org":{"$":0},"xn--55qx5d":{"$":0},"xn--wcvs22d":{"$":0},"xn--lcvr32d":{"$":0},"xn--mxtq1m":{"$":0},"xn--gmqw5a":{"$":0},"xn--ciqpn":{"$":0},"xn--gmq050i":{"$":0},"xn--zf0avx":{"$":0},"xn--io0a7i":{"$":0},"xn--mk0axi":{"$":0},"xn--od0alg":{"$":0},"xn--od0aq3b":{"$":0},"xn--tn0ag":{"$":0},"xn--uc0atv":{"$":0},"xn--uc0ay4a":{"$":0},"blogspot":{"$":0},"secaas":{"$":0},"nym":{"$":0},"ltd":{"$":0},"inc":{"$":0}},"hm":{"$":0},"hn":{"$":0,"com":{"$":0},"edu":{"$":0},"org":{"$":0},"net":{"$":0},"mil":{"$":0},"gob":{"$":0},"nom":{"$":0},"cc":{"$":0}},"hr":{"$":0,"iz":{"$":0},"from":{"$":0},"name":{"$":0},"com":{"$":0},"blogspot":{"$":0},"free":{"$":0}},"ht":{"$":0,"com":{"$":0},"shop":{"$":0},"firm":{"$":0},"info":{"$":0},"adult":{"$":0},"net":{"$":0},"pro":{"$":0},"org":{"$":0},"med":{"$":0},"art":{"$":0},"coop":{"$":0},"pol":{"$":0},"asso":{"$":0},"edu":{"$":0},"rel":{"$":0},"gouv":{"$":0},"perso":{"$":0}},"hu":{"2000":{"$":0},"$":0,"co":{"$":0},"info":{"$":0},"org":{"$":0},"priv":{"$":0},"sport":{"$":0},"tm":{"$":0},"agrar":{"$":0},"bolt":{"$":0},"casino":{"$":0},"city":{"$":0},"erotica":{"$":0},"erotika":{"$":0},"film":{"$":0},"forum":{"$":0},"games":{"$":0},"hotel":{"$":0},"ingatlan":{"$":0},"jogasz":{"$":0},"konyvelo":{"$":0},"lakas":{"$":0},"media":{"$":0},"news":{"$":0},"reklam":{"$":0},"sex":{"$":0},"shop":{"$":0},"suli":{"$":0},"szex":{"$":0},"tozsde":{"$":0},"utazas":{"$":0},"video":{"$":0},"blogspot":{"$":0}},"id":{"$":0,"ac":{"$":0},"biz":{"$":0},"co":{"$":0,"blogspot":{"$":0}},"desa":{"$":0},"go":{"$":0},"mil":{"$":0},"my":{"$":0},"net":{"$":0},"or":{"$":0},"ponpes":{"$":0},"sch":{"$":0},"web":{"$":0},"flap":{"$":0},"forte":{"$":0},"bloger":{"$":0},"wblog":{"$":0}},"ie":{"$":0,"gov":{"$":0},"blogspot":{"$":0},"nym":{"$":0}},"il":{"$":0,"ac":{"$":0},"co":{"$":0,"ravpage":{"$":0},"blogspot":{"$":0}},"gov":{"$":0},"idf":{"$":0},"k12":{"$":0},"muni":{"$":0},"net":{"$":0},"org":{"$":0}},"im":{"$":0,"ac":{"$":0},"co":{"$":0,"ltd":{"$":0},"plc":{"$":0}},"com":{"$":0},"net":{"$":0},"org":{"$":0},"tt":{"$":0},"tv":{"$":0},"ro":{"$":0},"nom":{"$":0}},"in":{"$":0,"co":{"$":0},"firm":{"$":0},"net":{"$":0},"org":{"$":0},"gen":{"$":0},"ind":{"$":0},"nic":{"$":0},"ac":{"$":0},"edu":{"$":0},"res":{"$":0},"gov":{"$":0},"mil":{"$":0},"web":{"$":0},"cloudns":{"$":0},"blogspot":{"$":0},"barsy":{"$":0}},"info":{"$":0,"cloudns":{"$":0},"dynamic-dns":{"$":0},"dyndns":{"$":0},"barrel-of-knowledge":{"$":0},"barrell-of-knowledge":{"$":0},"for-our":{"$":0},"groks-the":{"$":0},"groks-this":{"$":0},"here-for-more":{"$":0},"knowsitall":{"$":0},"selfip":{"$":0},"webhop":{"$":0},"barsy":{"$":0},"mayfirst":{"$":0},"forumz":{"$":0},"nsupdate":{"$":0},"dvrcam":{"$":0},"ilovecollege":{"$":0},"no-ip":{"$":0},"dnsupdate":{"$":0},"v-info":{"$":0}},"int":{"$":0,"eu":{"$":0}},"io":{"2038":{"$":0},"$":0,"com":{"$":0},"apigee":{"$":0},"b-data":{"$":0},"backplaneapp":{"$":0},"banzaicloud":{"app":{"$":0},"backyards":{"*":{"$":0}}},"bluebite":{"$":0},"boxfuse":{"$":0},"browsersafetymark":{"$":0},"bigv":{"uk0":{"$":0}},"cleverapps":{"$":0},"dappnode":{"dyndns":{"$":0}},"dedyn":{"$":0},"drud":{"$":0},"definima":{"$":0},"enonic":{"$":0,"customer":{"$":0}},"fh-muenster":{"$":0},"shw":{"$":0},"forgerock":{"id":{"$":0}},"ghost":{"$":0},"github":{"$":0},"gitlab":{"$":0},"lolipop":{"$":0},"hasura-app":{"$":0},"hostyhosting":{"$":0},"moonscale":{"*":{"$":0}},"beebyte":{"paas":{"$":0}},"beebyteapp":{"sekd1":{"$":0}},"jele":{"$":0},"unispace":{"cloud-fr1":{"$":0}},"webthings":{"$":0},"loginline":{"$":0},"barsy":{"$":0},"azurecontainer":{"*":{"$":0}},"ngrok":{"$":0},"nodeart":{"stage":{"$":0}},"nodum":{"$":0},"nid":{"$":0},"pantheonsite":{"$":0},"dyn53":{"$":0},"pstmn":{"$":0,"mock":{"$":0}},"protonet":{"$":0},"qoto":{"$":0},"qcx":{"$":0,"sys":{"*":{"$":0}}},"vaporcloud":{"$":0},"vbrplsbx":{"g":{"$":0}},"on-k3s":{"*":{"$":0}},"on-rio":{"*":{"$":0}},"readthedocs":{"$":0},"resindevice":{"$":0},"resinstaging":{"devices":{"$":0}},"hzc":{"$":0},"sandcats":{"$":0},"shiftcrypto":{"$":0},"shiftedit":{"$":0},"mo-siemens":{"$":0},"lair":{"apps":{"$":0}},"stolos":{"*":{"$":0}},"spacekit":{"$":0},"utwente":{"$":0},"s5y":{"*":{"$":0}},"telebit":{"$":0},"thingdust":{"dev":{"cust":{"$":0}},"disrec":{"cust":{"$":0}},"prod":{"cust":{"$":0}},"testing":{"cust":{"$":0}}},"wedeploy":{"$":0},"editorx":{"$":0},"basicserver":{"$":0},"virtualserver":{"$":0}},"iq":{"$":0,"gov":{"$":0},"edu":{"$":0},"mil":{"$":0},"com":{"$":0},"org":{"$":0},"net":{"$":0}},"ir":{"$":0,"ac":{"$":0},"co":{"$":0},"gov":{"$":0},"id":{"$":0},"net":{"$":0},"org":{"$":0},"sch":{"$":0},"xn--mgba3a4f16a":{"$":0},"xn--mgba3a4fra":{"$":0}},"is":{"$":0,"net":{"$":0},"com":{"$":0},"edu":{"$":0},"gov":{"$":0},"org":{"$":0},"int":{"$":0},"cupcake":{"$":0},"blogspot":{"$":0}},"it":{"$":0,"gov":{"$":0},"edu":{"$":0},"abr":{"$":0},"abruzzo":{"$":0},"aosta-valley":{"$":0},"aostavalley":{"$":0},"bas":{"$":0},"basilicata":{"$":0},"cal":{"$":0},"calabria":{"$":0},"cam":{"$":0},"campania":{"$":0},"emilia-romagna":{"$":0},"emiliaromagna":{"$":0},"emr":{"$":0},"friuli-v-giulia":{"$":0},"friuli-ve-giulia":{"$":0},"friuli-vegiulia":{"$":0},"friuli-venezia-giulia":{"$":0},"friuli-veneziagiulia":{"$":0},"friuli-vgiulia":{"$":0},"friuliv-giulia":{"$":0},"friulive-giulia":{"$":0},"friulivegiulia":{"$":0},"friulivenezia-giulia":{"$":0},"friuliveneziagiulia":{"$":0},"friulivgiulia":{"$":0},"fvg":{"$":0},"laz":{"$":0},"lazio":{"$":0},"lig":{"$":0},"liguria":{"$":0},"lom":{"$":0},"lombardia":{"$":0},"lombardy":{"$":0},"lucania":{"$":0},"mar":{"$":0},"marche":{"$":0},"mol":{"$":0},"molise":{"$":0},"piedmont":{"$":0},"piemonte":{"$":0},"pmn":{"$":0},"pug":{"$":0},"puglia":{"$":0},"sar":{"$":0},"sardegna":{"$":0},"sardinia":{"$":0},"sic":{"$":0},"sicilia":{"$":0},"sicily":{"$":0},"taa":{"$":0},"tos":{"$":0},"toscana":{"$":0},"trentin-sud-tirol":{"$":0},"xn--trentin-sd-tirol-rzb":{"$":0},"trentin-sudtirol":{"$":0},"xn--trentin-sdtirol-7vb":{"$":0},"trentin-sued-tirol":{"$":0},"trentin-suedtirol":{"$":0},"trentino-a-adige":{"$":0},"trentino-aadige":{"$":0},"trentino-alto-adige":{"$":0},"trentino-altoadige":{"$":0},"trentino-s-tirol":{"$":0},"trentino-stirol":{"$":0},"trentino-sud-tirol":{"$":0},"xn--trentino-sd-tirol-c3b":{"$":0},"trentino-sudtirol":{"$":0},"xn--trentino-sdtirol-szb":{"$":0},"trentino-sued-tirol":{"$":0},"trentino-suedtirol":{"$":0},"trentino":{"$":0},"trentinoa-adige":{"$":0},"trentinoaadige":{"$":0},"trentinoalto-adige":{"$":0},"trentinoaltoadige":{"$":0},"trentinos-tirol":{"$":0},"trentinostirol":{"$":0},"trentinosud-tirol":{"$":0},"xn--trentinosd-tirol-rzb":{"$":0},"trentinosudtirol":{"$":0},"xn--trentinosdtirol-7vb":{"$":0},"trentinosued-tirol":{"$":0},"trentinosuedtirol":{"$":0},"trentinsud-tirol":{"$":0},"xn--trentinsd-tirol-6vb":{"$":0},"trentinsudtirol":{"$":0},"xn--trentinsdtirol-nsb":{"$":0},"trentinsued-tirol":{"$":0},"trentinsuedtirol":{"$":0},"tuscany":{"$":0},"umb":{"$":0},"umbria":{"$":0},"val-d-aosta":{"$":0},"val-daosta":{"$":0},"vald-aosta":{"$":0},"valdaosta":{"$":0},"valle-aosta":{"$":0},"valle-d-aosta":{"$":0},"valle-daosta":{"$":0},"valleaosta":{"$":0},"valled-aosta":{"$":0},"valledaosta":{"$":0},"vallee-aoste":{"$":0},"xn--valle-aoste-ebb":{"$":0},"vallee-d-aoste":{"$":0},"xn--valle-d-aoste-ehb":{"$":0},"valleeaoste":{"$":0},"xn--valleaoste-e7a":{"$":0},"valleedaoste":{"$":0},"xn--valledaoste-ebb":{"$":0},"vao":{"$":0},"vda":{"$":0},"ven":{"$":0},"veneto":{"$":0},"ag":{"$":0},"agrigento":{"$":0},"al":{"$":0},"alessandria":{"$":0},"alto-adige":{"$":0},"altoadige":{"$":0},"an":{"$":0},"ancona":{"$":0},"andria-barletta-trani":{"$":0},"andria-trani-barletta":{"$":0},"andriabarlettatrani":{"$":0},"andriatranibarletta":{"$":0},"ao":{"$":0},"aosta":{"$":0},"aoste":{"$":0},"ap":{"$":0},"aq":{"$":0},"aquila":{"$":0},"ar":{"$":0},"arezzo":{"$":0},"ascoli-piceno":{"$":0},"ascolipiceno":{"$":0},"asti":{"$":0},"at":{"$":0},"av":{"$":0},"avellino":{"$":0},"ba":{"$":0},"balsan-sudtirol":{"$":0},"xn--balsan-sdtirol-nsb":{"$":0},"balsan-suedtirol":{"$":0},"balsan":{"$":0},"bari":{"$":0},"barletta-trani-andria":{"$":0},"barlettatraniandria":{"$":0},"belluno":{"$":0},"benevento":{"$":0},"bergamo":{"$":0},"bg":{"$":0},"bi":{"$":0},"biella":{"$":0},"bl":{"$":0},"bn":{"$":0},"bo":{"$":0},"bologna":{"$":0},"bolzano-altoadige":{"$":0},"bolzano":{"$":0},"bozen-sudtirol":{"$":0},"xn--bozen-sdtirol-2ob":{"$":0},"bozen-suedtirol":{"$":0},"bozen":{"$":0},"br":{"$":0},"brescia":{"$":0},"brindisi":{"$":0},"bs":{"$":0},"bt":{"$":0},"bulsan-sudtirol":{"$":0},"xn--bulsan-sdtirol-nsb":{"$":0},"bulsan-suedtirol":{"$":0},"bulsan":{"$":0},"bz":{"$":0},"ca":{"$":0},"cagliari":{"$":0},"caltanissetta":{"$":0},"campidano-medio":{"$":0},"campidanomedio":{"$":0},"campobasso":{"$":0},"carbonia-iglesias":{"$":0},"carboniaiglesias":{"$":0},"carrara-massa":{"$":0},"carraramassa":{"$":0},"caserta":{"$":0},"catania":{"$":0},"catanzaro":{"$":0},"cb":{"$":0},"ce":{"$":0},"cesena-forli":{"$":0},"xn--cesena-forl-mcb":{"$":0},"cesenaforli":{"$":0},"xn--cesenaforl-i8a":{"$":0},"ch":{"$":0},"chieti":{"$":0},"ci":{"$":0},"cl":{"$":0},"cn":{"$":0},"co":{"$":0},"como":{"$":0},"cosenza":{"$":0},"cr":{"$":0},"cremona":{"$":0},"crotone":{"$":0},"cs":{"$":0},"ct":{"$":0},"cuneo":{"$":0},"cz":{"$":0},"dell-ogliastra":{"$":0},"dellogliastra":{"$":0},"en":{"$":0},"enna":{"$":0},"fc":{"$":0},"fe":{"$":0},"fermo":{"$":0},"ferrara":{"$":0},"fg":{"$":0},"fi":{"$":0},"firenze":{"$":0},"florence":{"$":0},"fm":{"$":0},"foggia":{"$":0},"forli-cesena":{"$":0},"xn--forl-cesena-fcb":{"$":0},"forlicesena":{"$":0},"xn--forlcesena-c8a":{"$":0},"fr":{"$":0},"frosinone":{"$":0},"ge":{"$":0},"genoa":{"$":0},"genova":{"$":0},"go":{"$":0},"gorizia":{"$":0},"gr":{"$":0},"grosseto":{"$":0},"iglesias-carbonia":{"$":0},"iglesiascarbonia":{"$":0},"im":{"$":0},"imperia":{"$":0},"is":{"$":0},"isernia":{"$":0},"kr":{"$":0},"la-spezia":{"$":0},"laquila":{"$":0},"laspezia":{"$":0},"latina":{"$":0},"lc":{"$":0},"le":{"$":0},"lecce":{"$":0},"lecco":{"$":0},"li":{"$":0},"livorno":{"$":0},"lo":{"$":0},"lodi":{"$":0},"lt":{"$":0},"lu":{"$":0},"lucca":{"$":0},"macerata":{"$":0},"mantova":{"$":0},"massa-carrara":{"$":0},"massacarrara":{"$":0},"matera":{"$":0},"mb":{"$":0},"mc":{"$":0},"me":{"$":0},"medio-campidano":{"$":0},"mediocampidano":{"$":0},"messina":{"$":0},"mi":{"$":0},"milan":{"$":0},"milano":{"$":0},"mn":{"$":0},"mo":{"$":0},"modena":{"$":0},"monza-brianza":{"$":0},"monza-e-della-brianza":{"$":0},"monza":{"$":0},"monzabrianza":{"$":0},"monzaebrianza":{"$":0},"monzaedellabrianza":{"$":0},"ms":{"$":0},"mt":{"$":0},"na":{"$":0},"naples":{"$":0},"napoli":{"$":0},"no":{"$":0},"novara":{"$":0},"nu":{"$":0},"nuoro":{"$":0},"og":{"$":0},"ogliastra":{"$":0},"olbia-tempio":{"$":0},"olbiatempio":{"$":0},"or":{"$":0},"oristano":{"$":0},"ot":{"$":0},"pa":{"$":0},"padova":{"$":0},"padua":{"$":0},"palermo":{"$":0},"parma":{"$":0},"pavia":{"$":0},"pc":{"$":0},"pd":{"$":0},"pe":{"$":0},"perugia":{"$":0},"pesaro-urbino":{"$":0},"pesarourbino":{"$":0},"pescara":{"$":0},"pg":{"$":0},"pi":{"$":0},"piacenza":{"$":0},"pisa":{"$":0},"pistoia":{"$":0},"pn":{"$":0},"po":{"$":0},"pordenone":{"$":0},"potenza":{"$":0},"pr":{"$":0},"prato":{"$":0},"pt":{"$":0},"pu":{"$":0},"pv":{"$":0},"pz":{"$":0},"ra":{"$":0},"ragusa":{"$":0},"ravenna":{"$":0},"rc":{"$":0},"re":{"$":0},"reggio-calabria":{"$":0},"reggio-emilia":{"$":0},"reggiocalabria":{"$":0},"reggioemilia":{"$":0},"rg":{"$":0},"ri":{"$":0},"rieti":{"$":0},"rimini":{"$":0},"rm":{"$":0},"rn":{"$":0},"ro":{"$":0},"roma":{"$":0},"rome":{"$":0},"rovigo":{"$":0},"sa":{"$":0},"salerno":{"$":0},"sassari":{"$":0},"savona":{"$":0},"si":{"$":0},"siena":{"$":0},"siracusa":{"$":0},"so":{"$":0},"sondrio":{"$":0},"sp":{"$":0},"sr":{"$":0},"ss":{"$":0},"suedtirol":{"$":0},"xn--sdtirol-n2a":{"$":0},"sv":{"$":0},"ta":{"$":0},"taranto":{"$":0},"te":{"$":0},"tempio-olbia":{"$":0},"tempioolbia":{"$":0},"teramo":{"$":0},"terni":{"$":0},"tn":{"$":0},"to":{"$":0},"torino":{"$":0},"tp":{"$":0},"tr":{"$":0},"trani-andria-barletta":{"$":0},"trani-barletta-andria":{"$":0},"traniandriabarletta":{"$":0},"tranibarlettaandria":{"$":0},"trapani":{"$":0},"trento":{"$":0},"treviso":{"$":0},"trieste":{"$":0},"ts":{"$":0},"turin":{"$":0},"tv":{"$":0},"ud":{"$":0},"udine":{"$":0},"urbino-pesaro":{"$":0},"urbinopesaro":{"$":0},"va":{"$":0},"varese":{"$":0},"vb":{"$":0},"vc":{"$":0},"ve":{"$":0},"venezia":{"$":0},"venice":{"$":0},"verbania":{"$":0},"vercelli":{"$":0},"verona":{"$":0},"vi":{"$":0},"vibo-valentia":{"$":0},"vibovalentia":{"$":0},"vicenza":{"$":0},"viterbo":{"$":0},"vr":{"$":0},"vs":{"$":0},"vt":{"$":0},"vv":{"$":0},"blogspot":{"$":0},"neen":{"jc":{"$":0}},"tim":{"open":{"jelastic":{"cloud":{"$":0}}}},"16-b":{"$":0},"32-b":{"$":0},"64-b":{"$":0},"syncloud":{"$":0}},"je":{"$":0,"co":{"$":0},"net":{"$":0},"org":{"$":0},"of":{"$":0}},"jm":{"*":{"$":0}},"jo":{"$":0,"com":{"$":0},"org":{"$":0},"net":{"$":0},"edu":{"$":0},"sch":{"$":0},"gov":{"$":0},"mil":{"$":0},"name":{"$":0}},"jobs":{"$":0},"jp":{"$":0,"ac":{"$":0},"ad":{"$":0},"co":{"$":0},"ed":{"$":0},"go":{"$":0},"gr":{"$":0},"lg":{"$":0},"ne":{"$":0,"aseinet":{"user":{"$":0}},"gehirn":{"$":0}},"or":{"$":0},"aichi":{"$":0,"aisai":{"$":0},"ama":{"$":0},"anjo":{"$":0},"asuke":{"$":0},"chiryu":{"$":0},"chita":{"$":0},"fuso":{"$":0},"gamagori":{"$":0},"handa":{"$":0},"hazu":{"$":0},"hekinan":{"$":0},"higashiura":{"$":0},"ichinomiya":{"$":0},"inazawa":{"$":0},"inuyama":{"$":0},"isshiki":{"$":0},"iwakura":{"$":0},"kanie":{"$":0},"kariya":{"$":0},"kasugai":{"$":0},"kira":{"$":0},"kiyosu":{"$":0},"komaki":{"$":0},"konan":{"$":0},"kota":{"$":0},"mihama":{"$":0},"miyoshi":{"$":0},"nishio":{"$":0},"nisshin":{"$":0},"obu":{"$":0},"oguchi":{"$":0},"oharu":{"$":0},"okazaki":{"$":0},"owariasahi":{"$":0},"seto":{"$":0},"shikatsu":{"$":0},"shinshiro":{"$":0},"shitara":{"$":0},"tahara":{"$":0},"takahama":{"$":0},"tobishima":{"$":0},"toei":{"$":0},"togo":{"$":0},"tokai":{"$":0},"tokoname":{"$":0},"toyoake":{"$":0},"toyohashi":{"$":0},"toyokawa":{"$":0},"toyone":{"$":0},"toyota":{"$":0},"tsushima":{"$":0},"yatomi":{"$":0}},"akita":{"$":0,"akita":{"$":0},"daisen":{"$":0},"fujisato":{"$":0},"gojome":{"$":0},"hachirogata":{"$":0},"happou":{"$":0},"higashinaruse":{"$":0},"honjo":{"$":0},"honjyo":{"$":0},"ikawa":{"$":0},"kamikoani":{"$":0},"kamioka":{"$":0},"katagami":{"$":0},"kazuno":{"$":0},"kitaakita":{"$":0},"kosaka":{"$":0},"kyowa":{"$":0},"misato":{"$":0},"mitane":{"$":0},"moriyoshi":{"$":0},"nikaho":{"$":0},"noshiro":{"$":0},"odate":{"$":0},"oga":{"$":0},"ogata":{"$":0},"semboku":{"$":0},"yokote":{"$":0},"yurihonjo":{"$":0}},"aomori":{"$":0,"aomori":{"$":0},"gonohe":{"$":0},"hachinohe":{"$":0},"hashikami":{"$":0},"hiranai":{"$":0},"hirosaki":{"$":0},"itayanagi":{"$":0},"kuroishi":{"$":0},"misawa":{"$":0},"mutsu":{"$":0},"nakadomari":{"$":0},"noheji":{"$":0},"oirase":{"$":0},"owani":{"$":0},"rokunohe":{"$":0},"sannohe":{"$":0},"shichinohe":{"$":0},"shingo":{"$":0},"takko":{"$":0},"towada":{"$":0},"tsugaru":{"$":0},"tsuruta":{"$":0}},"chiba":{"$":0,"abiko":{"$":0},"asahi":{"$":0},"chonan":{"$":0},"chosei":{"$":0},"choshi":{"$":0},"chuo":{"$":0},"funabashi":{"$":0},"futtsu":{"$":0},"hanamigawa":{"$":0},"ichihara":{"$":0},"ichikawa":{"$":0},"ichinomiya":{"$":0},"inzai":{"$":0},"isumi":{"$":0},"kamagaya":{"$":0},"kamogawa":{"$":0},"kashiwa":{"$":0},"katori":{"$":0},"katsuura":{"$":0},"kimitsu":{"$":0},"kisarazu":{"$":0},"kozaki":{"$":0},"kujukuri":{"$":0},"kyonan":{"$":0},"matsudo":{"$":0},"midori":{"$":0},"mihama":{"$":0},"minamiboso":{"$":0},"mobara":{"$":0},"mutsuzawa":{"$":0},"nagara":{"$":0},"nagareyama":{"$":0},"narashino":{"$":0},"narita":{"$":0},"noda":{"$":0},"oamishirasato":{"$":0},"omigawa":{"$":0},"onjuku":{"$":0},"otaki":{"$":0},"sakae":{"$":0},"sakura":{"$":0},"shimofusa":{"$":0},"shirako":{"$":0},"shiroi":{"$":0},"shisui":{"$":0},"sodegaura":{"$":0},"sosa":{"$":0},"tako":{"$":0},"tateyama":{"$":0},"togane":{"$":0},"tohnosho":{"$":0},"tomisato":{"$":0},"urayasu":{"$":0},"yachimata":{"$":0},"yachiyo":{"$":0},"yokaichiba":{"$":0},"yokoshibahikari":{"$":0},"yotsukaido":{"$":0}},"ehime":{"$":0,"ainan":{"$":0},"honai":{"$":0},"ikata":{"$":0},"imabari":{"$":0},"iyo":{"$":0},"kamijima":{"$":0},"kihoku":{"$":0},"kumakogen":{"$":0},"masaki":{"$":0},"matsuno":{"$":0},"matsuyama":{"$":0},"namikata":{"$":0},"niihama":{"$":0},"ozu":{"$":0},"saijo":{"$":0},"seiyo":{"$":0},"shikokuchuo":{"$":0},"tobe":{"$":0},"toon":{"$":0},"uchiko":{"$":0},"uwajima":{"$":0},"yawatahama":{"$":0}},"fukui":{"$":0,"echizen":{"$":0},"eiheiji":{"$":0},"fukui":{"$":0},"ikeda":{"$":0},"katsuyama":{"$":0},"mihama":{"$":0},"minamiechizen":{"$":0},"obama":{"$":0},"ohi":{"$":0},"ono":{"$":0},"sabae":{"$":0},"sakai":{"$":0},"takahama":{"$":0},"tsuruga":{"$":0},"wakasa":{"$":0}},"fukuoka":{"$":0,"ashiya":{"$":0},"buzen":{"$":0},"chikugo":{"$":0},"chikuho":{"$":0},"chikujo":{"$":0},"chikushino":{"$":0},"chikuzen":{"$":0},"chuo":{"$":0},"dazaifu":{"$":0},"fukuchi":{"$":0},"hakata":{"$":0},"higashi":{"$":0},"hirokawa":{"$":0},"hisayama":{"$":0},"iizuka":{"$":0},"inatsuki":{"$":0},"kaho":{"$":0},"kasuga":{"$":0},"kasuya":{"$":0},"kawara":{"$":0},"keisen":{"$":0},"koga":{"$":0},"kurate":{"$":0},"kurogi":{"$":0},"kurume":{"$":0},"minami":{"$":0},"miyako":{"$":0},"miyama":{"$":0},"miyawaka":{"$":0},"mizumaki":{"$":0},"munakata":{"$":0},"nakagawa":{"$":0},"nakama":{"$":0},"nishi":{"$":0},"nogata":{"$":0},"ogori":{"$":0},"okagaki":{"$":0},"okawa":{"$":0},"oki":{"$":0},"omuta":{"$":0},"onga":{"$":0},"onojo":{"$":0},"oto":{"$":0},"saigawa":{"$":0},"sasaguri":{"$":0},"shingu":{"$":0},"shinyoshitomi":{"$":0},"shonai":{"$":0},"soeda":{"$":0},"sue":{"$":0},"tachiarai":{"$":0},"tagawa":{"$":0},"takata":{"$":0},"toho":{"$":0},"toyotsu":{"$":0},"tsuiki":{"$":0},"ukiha":{"$":0},"umi":{"$":0},"usui":{"$":0},"yamada":{"$":0},"yame":{"$":0},"yanagawa":{"$":0},"yukuhashi":{"$":0}},"fukushima":{"$":0,"aizubange":{"$":0},"aizumisato":{"$":0},"aizuwakamatsu":{"$":0},"asakawa":{"$":0},"bandai":{"$":0},"date":{"$":0},"fukushima":{"$":0},"furudono":{"$":0},"futaba":{"$":0},"hanawa":{"$":0},"higashi":{"$":0},"hirata":{"$":0},"hirono":{"$":0},"iitate":{"$":0},"inawashiro":{"$":0},"ishikawa":{"$":0},"iwaki":{"$":0},"izumizaki":{"$":0},"kagamiishi":{"$":0},"kaneyama":{"$":0},"kawamata":{"$":0},"kitakata":{"$":0},"kitashiobara":{"$":0},"koori":{"$":0},"koriyama":{"$":0},"kunimi":{"$":0},"miharu":{"$":0},"mishima":{"$":0},"namie":{"$":0},"nango":{"$":0},"nishiaizu":{"$":0},"nishigo":{"$":0},"okuma":{"$":0},"omotego":{"$":0},"ono":{"$":0},"otama":{"$":0},"samegawa":{"$":0},"shimogo":{"$":0},"shirakawa":{"$":0},"showa":{"$":0},"soma":{"$":0},"sukagawa":{"$":0},"taishin":{"$":0},"tamakawa":{"$":0},"tanagura":{"$":0},"tenei":{"$":0},"yabuki":{"$":0},"yamato":{"$":0},"yamatsuri":{"$":0},"yanaizu":{"$":0},"yugawa":{"$":0}},"gifu":{"$":0,"anpachi":{"$":0},"ena":{"$":0},"gifu":{"$":0},"ginan":{"$":0},"godo":{"$":0},"gujo":{"$":0},"hashima":{"$":0},"hichiso":{"$":0},"hida":{"$":0},"higashishirakawa":{"$":0},"ibigawa":{"$":0},"ikeda":{"$":0},"kakamigahara":{"$":0},"kani":{"$":0},"kasahara":{"$":0},"kasamatsu":{"$":0},"kawaue":{"$":0},"kitagata":{"$":0},"mino":{"$":0},"minokamo":{"$":0},"mitake":{"$":0},"mizunami":{"$":0},"motosu":{"$":0},"nakatsugawa":{"$":0},"ogaki":{"$":0},"sakahogi":{"$":0},"seki":{"$":0},"sekigahara":{"$":0},"shirakawa":{"$":0},"tajimi":{"$":0},"takayama":{"$":0},"tarui":{"$":0},"toki":{"$":0},"tomika":{"$":0},"wanouchi":{"$":0},"yamagata":{"$":0},"yaotsu":{"$":0},"yoro":{"$":0}},"gunma":{"$":0,"annaka":{"$":0},"chiyoda":{"$":0},"fujioka":{"$":0},"higashiagatsuma":{"$":0},"isesaki":{"$":0},"itakura":{"$":0},"kanna":{"$":0},"kanra":{"$":0},"katashina":{"$":0},"kawaba":{"$":0},"kiryu":{"$":0},"kusatsu":{"$":0},"maebashi":{"$":0},"meiwa":{"$":0},"midori":{"$":0},"minakami":{"$":0},"naganohara":{"$":0},"nakanojo":{"$":0},"nanmoku":{"$":0},"numata":{"$":0},"oizumi":{"$":0},"ora":{"$":0},"ota":{"$":0},"shibukawa":{"$":0},"shimonita":{"$":0},"shinto":{"$":0},"showa":{"$":0},"takasaki":{"$":0},"takayama":{"$":0},"tamamura":{"$":0},"tatebayashi":{"$":0},"tomioka":{"$":0},"tsukiyono":{"$":0},"tsumagoi":{"$":0},"ueno":{"$":0},"yoshioka":{"$":0}},"hiroshima":{"$":0,"asaminami":{"$":0},"daiwa":{"$":0},"etajima":{"$":0},"fuchu":{"$":0},"fukuyama":{"$":0},"hatsukaichi":{"$":0},"higashihiroshima":{"$":0},"hongo":{"$":0},"jinsekikogen":{"$":0},"kaita":{"$":0},"kui":{"$":0},"kumano":{"$":0},"kure":{"$":0},"mihara":{"$":0},"miyoshi":{"$":0},"naka":{"$":0},"onomichi":{"$":0},"osakikamijima":{"$":0},"otake":{"$":0},"saka":{"$":0},"sera":{"$":0},"seranishi":{"$":0},"shinichi":{"$":0},"shobara":{"$":0},"takehara":{"$":0}},"hokkaido":{"$":0,"abashiri":{"$":0},"abira":{"$":0},"aibetsu":{"$":0},"akabira":{"$":0},"akkeshi":{"$":0},"asahikawa":{"$":0},"ashibetsu":{"$":0},"ashoro":{"$":0},"assabu":{"$":0},"atsuma":{"$":0},"bibai":{"$":0},"biei":{"$":0},"bifuka":{"$":0},"bihoro":{"$":0},"biratori":{"$":0},"chippubetsu":{"$":0},"chitose":{"$":0},"date":{"$":0},"ebetsu":{"$":0},"embetsu":{"$":0},"eniwa":{"$":0},"erimo":{"$":0},"esan":{"$":0},"esashi":{"$":0},"fukagawa":{"$":0},"fukushima":{"$":0},"furano":{"$":0},"furubira":{"$":0},"haboro":{"$":0},"hakodate":{"$":0},"hamatonbetsu":{"$":0},"hidaka":{"$":0},"higashikagura":{"$":0},"higashikawa":{"$":0},"hiroo":{"$":0},"hokuryu":{"$":0},"hokuto":{"$":0},"honbetsu":{"$":0},"horokanai":{"$":0},"horonobe":{"$":0},"ikeda":{"$":0},"imakane":{"$":0},"ishikari":{"$":0},"iwamizawa":{"$":0},"iwanai":{"$":0},"kamifurano":{"$":0},"kamikawa":{"$":0},"kamishihoro":{"$":0},"kamisunagawa":{"$":0},"kamoenai":{"$":0},"kayabe":{"$":0},"kembuchi":{"$":0},"kikonai":{"$":0},"kimobetsu":{"$":0},"kitahiroshima":{"$":0},"kitami":{"$":0},"kiyosato":{"$":0},"koshimizu":{"$":0},"kunneppu":{"$":0},"kuriyama":{"$":0},"kuromatsunai":{"$":0},"kushiro":{"$":0},"kutchan":{"$":0},"kyowa":{"$":0},"mashike":{"$":0},"matsumae":{"$":0},"mikasa":{"$":0},"minamifurano":{"$":0},"mombetsu":{"$":0},"moseushi":{"$":0},"mukawa":{"$":0},"muroran":{"$":0},"naie":{"$":0},"nakagawa":{"$":0},"nakasatsunai":{"$":0},"nakatombetsu":{"$":0},"nanae":{"$":0},"nanporo":{"$":0},"nayoro":{"$":0},"nemuro":{"$":0},"niikappu":{"$":0},"niki":{"$":0},"nishiokoppe":{"$":0},"noboribetsu":{"$":0},"numata":{"$":0},"obihiro":{"$":0},"obira":{"$":0},"oketo":{"$":0},"okoppe":{"$":0},"otaru":{"$":0},"otobe":{"$":0},"otofuke":{"$":0},"otoineppu":{"$":0},"oumu":{"$":0},"ozora":{"$":0},"pippu":{"$":0},"rankoshi":{"$":0},"rebun":{"$":0},"rikubetsu":{"$":0},"rishiri":{"$":0},"rishirifuji":{"$":0},"saroma":{"$":0},"sarufutsu":{"$":0},"shakotan":{"$":0},"shari":{"$":0},"shibecha":{"$":0},"shibetsu":{"$":0},"shikabe":{"$":0},"shikaoi":{"$":0},"shimamaki":{"$":0},"shimizu":{"$":0},"shimokawa":{"$":0},"shinshinotsu":{"$":0},"shintoku":{"$":0},"shiranuka":{"$":0},"shiraoi":{"$":0},"shiriuchi":{"$":0},"sobetsu":{"$":0},"sunagawa":{"$":0},"taiki":{"$":0},"takasu":{"$":0},"takikawa":{"$":0},"takinoue":{"$":0},"teshikaga":{"$":0},"tobetsu":{"$":0},"tohma":{"$":0},"tomakomai":{"$":0},"tomari":{"$":0},"toya":{"$":0},"toyako":{"$":0},"toyotomi":{"$":0},"toyoura":{"$":0},"tsubetsu":{"$":0},"tsukigata":{"$":0},"urakawa":{"$":0},"urausu":{"$":0},"uryu":{"$":0},"utashinai":{"$":0},"wakkanai":{"$":0},"wassamu":{"$":0},"yakumo":{"$":0},"yoichi":{"$":0}},"hyogo":{"$":0,"aioi":{"$":0},"akashi":{"$":0},"ako":{"$":0},"amagasaki":{"$":0},"aogaki":{"$":0},"asago":{"$":0},"ashiya":{"$":0},"awaji":{"$":0},"fukusaki":{"$":0},"goshiki":{"$":0},"harima":{"$":0},"himeji":{"$":0},"ichikawa":{"$":0},"inagawa":{"$":0},"itami":{"$":0},"kakogawa":{"$":0},"kamigori":{"$":0},"kamikawa":{"$":0},"kasai":{"$":0},"kasuga":{"$":0},"kawanishi":{"$":0},"miki":{"$":0},"minamiawaji":{"$":0},"nishinomiya":{"$":0},"nishiwaki":{"$":0},"ono":{"$":0},"sanda":{"$":0},"sannan":{"$":0},"sasayama":{"$":0},"sayo":{"$":0},"shingu":{"$":0},"shinonsen":{"$":0},"shiso":{"$":0},"sumoto":{"$":0},"taishi":{"$":0},"taka":{"$":0},"takarazuka":{"$":0},"takasago":{"$":0},"takino":{"$":0},"tamba":{"$":0},"tatsuno":{"$":0},"toyooka":{"$":0},"yabu":{"$":0},"yashiro":{"$":0},"yoka":{"$":0},"yokawa":{"$":0}},"ibaraki":{"$":0,"ami":{"$":0},"asahi":{"$":0},"bando":{"$":0},"chikusei":{"$":0},"daigo":{"$":0},"fujishiro":{"$":0},"hitachi":{"$":0},"hitachinaka":{"$":0},"hitachiomiya":{"$":0},"hitachiota":{"$":0},"ibaraki":{"$":0},"ina":{"$":0},"inashiki":{"$":0},"itako":{"$":0},"iwama":{"$":0},"joso":{"$":0},"kamisu":{"$":0},"kasama":{"$":0},"kashima":{"$":0},"kasumigaura":{"$":0},"koga":{"$":0},"miho":{"$":0},"mito":{"$":0},"moriya":{"$":0},"naka":{"$":0},"namegata":{"$":0},"oarai":{"$":0},"ogawa":{"$":0},"omitama":{"$":0},"ryugasaki":{"$":0},"sakai":{"$":0},"sakuragawa":{"$":0},"shimodate":{"$":0},"shimotsuma":{"$":0},"shirosato":{"$":0},"sowa":{"$":0},"suifu":{"$":0},"takahagi":{"$":0},"tamatsukuri":{"$":0},"tokai":{"$":0},"tomobe":{"$":0},"tone":{"$":0},"toride":{"$":0},"tsuchiura":{"$":0},"tsukuba":{"$":0},"uchihara":{"$":0},"ushiku":{"$":0},"yachiyo":{"$":0},"yamagata":{"$":0},"yawara":{"$":0},"yuki":{"$":0}},"ishikawa":{"$":0,"anamizu":{"$":0},"hakui":{"$":0},"hakusan":{"$":0},"kaga":{"$":0},"kahoku":{"$":0},"kanazawa":{"$":0},"kawakita":{"$":0},"komatsu":{"$":0},"nakanoto":{"$":0},"nanao":{"$":0},"nomi":{"$":0},"nonoichi":{"$":0},"noto":{"$":0},"shika":{"$":0},"suzu":{"$":0},"tsubata":{"$":0},"tsurugi":{"$":0},"uchinada":{"$":0},"wajima":{"$":0}},"iwate":{"$":0,"fudai":{"$":0},"fujisawa":{"$":0},"hanamaki":{"$":0},"hiraizumi":{"$":0},"hirono":{"$":0},"ichinohe":{"$":0},"ichinoseki":{"$":0},"iwaizumi":{"$":0},"iwate":{"$":0},"joboji":{"$":0},"kamaishi":{"$":0},"kanegasaki":{"$":0},"karumai":{"$":0},"kawai":{"$":0},"kitakami":{"$":0},"kuji":{"$":0},"kunohe":{"$":0},"kuzumaki":{"$":0},"miyako":{"$":0},"mizusawa":{"$":0},"morioka":{"$":0},"ninohe":{"$":0},"noda":{"$":0},"ofunato":{"$":0},"oshu":{"$":0},"otsuchi":{"$":0},"rikuzentakata":{"$":0},"shiwa":{"$":0},"shizukuishi":{"$":0},"sumita":{"$":0},"tanohata":{"$":0},"tono":{"$":0},"yahaba":{"$":0},"yamada":{"$":0}},"kagawa":{"$":0,"ayagawa":{"$":0},"higashikagawa":{"$":0},"kanonji":{"$":0},"kotohira":{"$":0},"manno":{"$":0},"marugame":{"$":0},"mitoyo":{"$":0},"naoshima":{"$":0},"sanuki":{"$":0},"tadotsu":{"$":0},"takamatsu":{"$":0},"tonosho":{"$":0},"uchinomi":{"$":0},"utazu":{"$":0},"zentsuji":{"$":0}},"kagoshima":{"$":0,"akune":{"$":0},"amami":{"$":0},"hioki":{"$":0},"isa":{"$":0},"isen":{"$":0},"izumi":{"$":0},"kagoshima":{"$":0},"kanoya":{"$":0},"kawanabe":{"$":0},"kinko":{"$":0},"kouyama":{"$":0},"makurazaki":{"$":0},"matsumoto":{"$":0},"minamitane":{"$":0},"nakatane":{"$":0},"nishinoomote":{"$":0},"satsumasendai":{"$":0},"soo":{"$":0},"tarumizu":{"$":0},"yusui":{"$":0}},"kanagawa":{"$":0,"aikawa":{"$":0},"atsugi":{"$":0},"ayase":{"$":0},"chigasaki":{"$":0},"ebina":{"$":0},"fujisawa":{"$":0},"hadano":{"$":0},"hakone":{"$":0},"hiratsuka":{"$":0},"isehara":{"$":0},"kaisei":{"$":0},"kamakura":{"$":0},"kiyokawa":{"$":0},"matsuda":{"$":0},"minamiashigara":{"$":0},"miura":{"$":0},"nakai":{"$":0},"ninomiya":{"$":0},"odawara":{"$":0},"oi":{"$":0},"oiso":{"$":0},"sagamihara":{"$":0},"samukawa":{"$":0},"tsukui":{"$":0},"yamakita":{"$":0},"yamato":{"$":0},"yokosuka":{"$":0},"yugawara":{"$":0},"zama":{"$":0},"zushi":{"$":0}},"kochi":{"$":0,"aki":{"$":0},"geisei":{"$":0},"hidaka":{"$":0},"higashitsuno":{"$":0},"ino":{"$":0},"kagami":{"$":0},"kami":{"$":0},"kitagawa":{"$":0},"kochi":{"$":0},"mihara":{"$":0},"motoyama":{"$":0},"muroto":{"$":0},"nahari":{"$":0},"nakamura":{"$":0},"nankoku":{"$":0},"nishitosa":{"$":0},"niyodogawa":{"$":0},"ochi":{"$":0},"okawa":{"$":0},"otoyo":{"$":0},"otsuki":{"$":0},"sakawa":{"$":0},"sukumo":{"$":0},"susaki":{"$":0},"tosa":{"$":0},"tosashimizu":{"$":0},"toyo":{"$":0},"tsuno":{"$":0},"umaji":{"$":0},"yasuda":{"$":0},"yusuhara":{"$":0}},"kumamoto":{"$":0,"amakusa":{"$":0},"arao":{"$":0},"aso":{"$":0},"choyo":{"$":0},"gyokuto":{"$":0},"kamiamakusa":{"$":0},"kikuchi":{"$":0},"kumamoto":{"$":0},"mashiki":{"$":0},"mifune":{"$":0},"minamata":{"$":0},"minamioguni":{"$":0},"nagasu":{"$":0},"nishihara":{"$":0},"oguni":{"$":0},"ozu":{"$":0},"sumoto":{"$":0},"takamori":{"$":0},"uki":{"$":0},"uto":{"$":0},"yamaga":{"$":0},"yamato":{"$":0},"yatsushiro":{"$":0}},"kyoto":{"$":0,"ayabe":{"$":0},"fukuchiyama":{"$":0},"higashiyama":{"$":0},"ide":{"$":0},"ine":{"$":0},"joyo":{"$":0},"kameoka":{"$":0},"kamo":{"$":0},"kita":{"$":0},"kizu":{"$":0},"kumiyama":{"$":0},"kyotamba":{"$":0},"kyotanabe":{"$":0},"kyotango":{"$":0},"maizuru":{"$":0},"minami":{"$":0},"minamiyamashiro":{"$":0},"miyazu":{"$":0},"muko":{"$":0},"nagaokakyo":{"$":0},"nakagyo":{"$":0},"nantan":{"$":0},"oyamazaki":{"$":0},"sakyo":{"$":0},"seika":{"$":0},"tanabe":{"$":0},"uji":{"$":0},"ujitawara":{"$":0},"wazuka":{"$":0},"yamashina":{"$":0},"yawata":{"$":0}},"mie":{"$":0,"asahi":{"$":0},"inabe":{"$":0},"ise":{"$":0},"kameyama":{"$":0},"kawagoe":{"$":0},"kiho":{"$":0},"kisosaki":{"$":0},"kiwa":{"$":0},"komono":{"$":0},"kumano":{"$":0},"kuwana":{"$":0},"matsusaka":{"$":0},"meiwa":{"$":0},"mihama":{"$":0},"minamiise":{"$":0},"misugi":{"$":0},"miyama":{"$":0},"nabari":{"$":0},"shima":{"$":0},"suzuka":{"$":0},"tado":{"$":0},"taiki":{"$":0},"taki":{"$":0},"tamaki":{"$":0},"toba":{"$":0},"tsu":{"$":0},"udono":{"$":0},"ureshino":{"$":0},"watarai":{"$":0},"yokkaichi":{"$":0}},"miyagi":{"$":0,"furukawa":{"$":0},"higashimatsushima":{"$":0},"ishinomaki":{"$":0},"iwanuma":{"$":0},"kakuda":{"$":0},"kami":{"$":0},"kawasaki":{"$":0},"marumori":{"$":0},"matsushima":{"$":0},"minamisanriku":{"$":0},"misato":{"$":0},"murata":{"$":0},"natori":{"$":0},"ogawara":{"$":0},"ohira":{"$":0},"onagawa":{"$":0},"osaki":{"$":0},"rifu":{"$":0},"semine":{"$":0},"shibata":{"$":0},"shichikashuku":{"$":0},"shikama":{"$":0},"shiogama":{"$":0},"shiroishi":{"$":0},"tagajo":{"$":0},"taiwa":{"$":0},"tome":{"$":0},"tomiya":{"$":0},"wakuya":{"$":0},"watari":{"$":0},"yamamoto":{"$":0},"zao":{"$":0}},"miyazaki":{"$":0,"aya":{"$":0},"ebino":{"$":0},"gokase":{"$":0},"hyuga":{"$":0},"kadogawa":{"$":0},"kawaminami":{"$":0},"kijo":{"$":0},"kitagawa":{"$":0},"kitakata":{"$":0},"kitaura":{"$":0},"kobayashi":{"$":0},"kunitomi":{"$":0},"kushima":{"$":0},"mimata":{"$":0},"miyakonojo":{"$":0},"miyazaki":{"$":0},"morotsuka":{"$":0},"nichinan":{"$":0},"nishimera":{"$":0},"nobeoka":{"$":0},"saito":{"$":0},"shiiba":{"$":0},"shintomi":{"$":0},"takaharu":{"$":0},"takanabe":{"$":0},"takazaki":{"$":0},"tsuno":{"$":0}},"nagano":{"$":0,"achi":{"$":0},"agematsu":{"$":0},"anan":{"$":0},"aoki":{"$":0},"asahi":{"$":0},"azumino":{"$":0},"chikuhoku":{"$":0},"chikuma":{"$":0},"chino":{"$":0},"fujimi":{"$":0},"hakuba":{"$":0},"hara":{"$":0},"hiraya":{"$":0},"iida":{"$":0},"iijima":{"$":0},"iiyama":{"$":0},"iizuna":{"$":0},"ikeda":{"$":0},"ikusaka":{"$":0},"ina":{"$":0},"karuizawa":{"$":0},"kawakami":{"$":0},"kiso":{"$":0},"kisofukushima":{"$":0},"kitaaiki":{"$":0},"komagane":{"$":0},"komoro":{"$":0},"matsukawa":{"$":0},"matsumoto":{"$":0},"miasa":{"$":0},"minamiaiki":{"$":0},"minamimaki":{"$":0},"minamiminowa":{"$":0},"minowa":{"$":0},"miyada":{"$":0},"miyota":{"$":0},"mochizuki":{"$":0},"nagano":{"$":0},"nagawa":{"$":0},"nagiso":{"$":0},"nakagawa":{"$":0},"nakano":{"$":0},"nozawaonsen":{"$":0},"obuse":{"$":0},"ogawa":{"$":0},"okaya":{"$":0},"omachi":{"$":0},"omi":{"$":0},"ookuwa":{"$":0},"ooshika":{"$":0},"otaki":{"$":0},"otari":{"$":0},"sakae":{"$":0},"sakaki":{"$":0},"saku":{"$":0},"sakuho":{"$":0},"shimosuwa":{"$":0},"shinanomachi":{"$":0},"shiojiri":{"$":0},"suwa":{"$":0},"suzaka":{"$":0},"takagi":{"$":0},"takamori":{"$":0},"takayama":{"$":0},"tateshina":{"$":0},"tatsuno":{"$":0},"togakushi":{"$":0},"togura":{"$":0},"tomi":{"$":0},"ueda":{"$":0},"wada":{"$":0},"yamagata":{"$":0},"yamanouchi":{"$":0},"yasaka":{"$":0},"yasuoka":{"$":0}},"nagasaki":{"$":0,"chijiwa":{"$":0},"futsu":{"$":0},"goto":{"$":0},"hasami":{"$":0},"hirado":{"$":0},"iki":{"$":0},"isahaya":{"$":0},"kawatana":{"$":0},"kuchinotsu":{"$":0},"matsuura":{"$":0},"nagasaki":{"$":0},"obama":{"$":0},"omura":{"$":0},"oseto":{"$":0},"saikai":{"$":0},"sasebo":{"$":0},"seihi":{"$":0},"shimabara":{"$":0},"shinkamigoto":{"$":0},"togitsu":{"$":0},"tsushima":{"$":0},"unzen":{"$":0}},"nara":{"$":0,"ando":{"$":0},"gose":{"$":0},"heguri":{"$":0},"higashiyoshino":{"$":0},"ikaruga":{"$":0},"ikoma":{"$":0},"kamikitayama":{"$":0},"kanmaki":{"$":0},"kashiba":{"$":0},"kashihara":{"$":0},"katsuragi":{"$":0},"kawai":{"$":0},"kawakami":{"$":0},"kawanishi":{"$":0},"koryo":{"$":0},"kurotaki":{"$":0},"mitsue":{"$":0},"miyake":{"$":0},"nara":{"$":0},"nosegawa":{"$":0},"oji":{"$":0},"ouda":{"$":0},"oyodo":{"$":0},"sakurai":{"$":0},"sango":{"$":0},"shimoichi":{"$":0},"shimokitayama":{"$":0},"shinjo":{"$":0},"soni":{"$":0},"takatori":{"$":0},"tawaramoto":{"$":0},"tenkawa":{"$":0},"tenri":{"$":0},"uda":{"$":0},"yamatokoriyama":{"$":0},"yamatotakada":{"$":0},"yamazoe":{"$":0},"yoshino":{"$":0}},"niigata":{"$":0,"aga":{"$":0},"agano":{"$":0},"gosen":{"$":0},"itoigawa":{"$":0},"izumozaki":{"$":0},"joetsu":{"$":0},"kamo":{"$":0},"kariwa":{"$":0},"kashiwazaki":{"$":0},"minamiuonuma":{"$":0},"mitsuke":{"$":0},"muika":{"$":0},"murakami":{"$":0},"myoko":{"$":0},"nagaoka":{"$":0},"niigata":{"$":0},"ojiya":{"$":0},"omi":{"$":0},"sado":{"$":0},"sanjo":{"$":0},"seiro":{"$":0},"seirou":{"$":0},"sekikawa":{"$":0},"shibata":{"$":0},"tagami":{"$":0},"tainai":{"$":0},"tochio":{"$":0},"tokamachi":{"$":0},"tsubame":{"$":0},"tsunan":{"$":0},"uonuma":{"$":0},"yahiko":{"$":0},"yoita":{"$":0},"yuzawa":{"$":0}},"oita":{"$":0,"beppu":{"$":0},"bungoono":{"$":0},"bungotakada":{"$":0},"hasama":{"$":0},"hiji":{"$":0},"himeshima":{"$":0},"hita":{"$":0},"kamitsue":{"$":0},"kokonoe":{"$":0},"kuju":{"$":0},"kunisaki":{"$":0},"kusu":{"$":0},"oita":{"$":0},"saiki":{"$":0},"taketa":{"$":0},"tsukumi":{"$":0},"usa":{"$":0},"usuki":{"$":0},"yufu":{"$":0}},"okayama":{"$":0,"akaiwa":{"$":0},"asakuchi":{"$":0},"bizen":{"$":0},"hayashima":{"$":0},"ibara":{"$":0},"kagamino":{"$":0},"kasaoka":{"$":0},"kibichuo":{"$":0},"kumenan":{"$":0},"kurashiki":{"$":0},"maniwa":{"$":0},"misaki":{"$":0},"nagi":{"$":0},"niimi":{"$":0},"nishiawakura":{"$":0},"okayama":{"$":0},"satosho":{"$":0},"setouchi":{"$":0},"shinjo":{"$":0},"shoo":{"$":0},"soja":{"$":0},"takahashi":{"$":0},"tamano":{"$":0},"tsuyama":{"$":0},"wake":{"$":0},"yakage":{"$":0}},"okinawa":{"$":0,"aguni":{"$":0},"ginowan":{"$":0},"ginoza":{"$":0},"gushikami":{"$":0},"haebaru":{"$":0},"higashi":{"$":0},"hirara":{"$":0},"iheya":{"$":0},"ishigaki":{"$":0},"ishikawa":{"$":0},"itoman":{"$":0},"izena":{"$":0},"kadena":{"$":0},"kin":{"$":0},"kitadaito":{"$":0},"kitanakagusuku":{"$":0},"kumejima":{"$":0},"kunigami":{"$":0},"minamidaito":{"$":0},"motobu":{"$":0},"nago":{"$":0},"naha":{"$":0},"nakagusuku":{"$":0},"nakijin":{"$":0},"nanjo":{"$":0},"nishihara":{"$":0},"ogimi":{"$":0},"okinawa":{"$":0},"onna":{"$":0},"shimoji":{"$":0},"taketomi":{"$":0},"tarama":{"$":0},"tokashiki":{"$":0},"tomigusuku":{"$":0},"tonaki":{"$":0},"urasoe":{"$":0},"uruma":{"$":0},"yaese":{"$":0},"yomitan":{"$":0},"yonabaru":{"$":0},"yonaguni":{"$":0},"zamami":{"$":0}},"osaka":{"$":0,"abeno":{"$":0},"chihayaakasaka":{"$":0},"chuo":{"$":0},"daito":{"$":0},"fujiidera":{"$":0},"habikino":{"$":0},"hannan":{"$":0},"higashiosaka":{"$":0},"higashisumiyoshi":{"$":0},"higashiyodogawa":{"$":0},"hirakata":{"$":0},"ibaraki":{"$":0},"ikeda":{"$":0},"izumi":{"$":0},"izumiotsu":{"$":0},"izumisano":{"$":0},"kadoma":{"$":0},"kaizuka":{"$":0},"kanan":{"$":0},"kashiwara":{"$":0},"katano":{"$":0},"kawachinagano":{"$":0},"kishiwada":{"$":0},"kita":{"$":0},"kumatori":{"$":0},"matsubara":{"$":0},"minato":{"$":0},"minoh":{"$":0},"misaki":{"$":0},"moriguchi":{"$":0},"neyagawa":{"$":0},"nishi":{"$":0},"nose":{"$":0},"osakasayama":{"$":0},"sakai":{"$":0},"sayama":{"$":0},"sennan":{"$":0},"settsu":{"$":0},"shijonawate":{"$":0},"shimamoto":{"$":0},"suita":{"$":0},"tadaoka":{"$":0},"taishi":{"$":0},"tajiri":{"$":0},"takaishi":{"$":0},"takatsuki":{"$":0},"tondabayashi":{"$":0},"toyonaka":{"$":0},"toyono":{"$":0},"yao":{"$":0}},"saga":{"$":0,"ariake":{"$":0},"arita":{"$":0},"fukudomi":{"$":0},"genkai":{"$":0},"hamatama":{"$":0},"hizen":{"$":0},"imari":{"$":0},"kamimine":{"$":0},"kanzaki":{"$":0},"karatsu":{"$":0},"kashima":{"$":0},"kitagata":{"$":0},"kitahata":{"$":0},"kiyama":{"$":0},"kouhoku":{"$":0},"kyuragi":{"$":0},"nishiarita":{"$":0},"ogi":{"$":0},"omachi":{"$":0},"ouchi":{"$":0},"saga":{"$":0},"shiroishi":{"$":0},"taku":{"$":0},"tara":{"$":0},"tosu":{"$":0},"yoshinogari":{"$":0}},"saitama":{"$":0,"arakawa":{"$":0},"asaka":{"$":0},"chichibu":{"$":0},"fujimi":{"$":0},"fujimino":{"$":0},"fukaya":{"$":0},"hanno":{"$":0},"hanyu":{"$":0},"hasuda":{"$":0},"hatogaya":{"$":0},"hatoyama":{"$":0},"hidaka":{"$":0},"higashichichibu":{"$":0},"higashimatsuyama":{"$":0},"honjo":{"$":0},"ina":{"$":0},"iruma":{"$":0},"iwatsuki":{"$":0},"kamiizumi":{"$":0},"kamikawa":{"$":0},"kamisato":{"$":0},"kasukabe":{"$":0},"kawagoe":{"$":0},"kawaguchi":{"$":0},"kawajima":{"$":0},"kazo":{"$":0},"kitamoto":{"$":0},"koshigaya":{"$":0},"kounosu":{"$":0},"kuki":{"$":0},"kumagaya":{"$":0},"matsubushi":{"$":0},"minano":{"$":0},"misato":{"$":0},"miyashiro":{"$":0},"miyoshi":{"$":0},"moroyama":{"$":0},"nagatoro":{"$":0},"namegawa":{"$":0},"niiza":{"$":0},"ogano":{"$":0},"ogawa":{"$":0},"ogose":{"$":0},"okegawa":{"$":0},"omiya":{"$":0},"otaki":{"$":0},"ranzan":{"$":0},"ryokami":{"$":0},"saitama":{"$":0},"sakado":{"$":0},"satte":{"$":0},"sayama":{"$":0},"shiki":{"$":0},"shiraoka":{"$":0},"soka":{"$":0},"sugito":{"$":0},"toda":{"$":0},"tokigawa":{"$":0},"tokorozawa":{"$":0},"tsurugashima":{"$":0},"urawa":{"$":0},"warabi":{"$":0},"yashio":{"$":0},"yokoze":{"$":0},"yono":{"$":0},"yorii":{"$":0},"yoshida":{"$":0},"yoshikawa":{"$":0},"yoshimi":{"$":0}},"shiga":{"$":0,"aisho":{"$":0},"gamo":{"$":0},"higashiomi":{"$":0},"hikone":{"$":0},"koka":{"$":0},"konan":{"$":0},"kosei":{"$":0},"koto":{"$":0},"kusatsu":{"$":0},"maibara":{"$":0},"moriyama":{"$":0},"nagahama":{"$":0},"nishiazai":{"$":0},"notogawa":{"$":0},"omihachiman":{"$":0},"otsu":{"$":0},"ritto":{"$":0},"ryuoh":{"$":0},"takashima":{"$":0},"takatsuki":{"$":0},"torahime":{"$":0},"toyosato":{"$":0},"yasu":{"$":0}},"shimane":{"$":0,"akagi":{"$":0},"ama":{"$":0},"gotsu":{"$":0},"hamada":{"$":0},"higashiizumo":{"$":0},"hikawa":{"$":0},"hikimi":{"$":0},"izumo":{"$":0},"kakinoki":{"$":0},"masuda":{"$":0},"matsue":{"$":0},"misato":{"$":0},"nishinoshima":{"$":0},"ohda":{"$":0},"okinoshima":{"$":0},"okuizumo":{"$":0},"shimane":{"$":0},"tamayu":{"$":0},"tsuwano":{"$":0},"unnan":{"$":0},"yakumo":{"$":0},"yasugi":{"$":0},"yatsuka":{"$":0}},"shizuoka":{"$":0,"arai":{"$":0},"atami":{"$":0},"fuji":{"$":0},"fujieda":{"$":0},"fujikawa":{"$":0},"fujinomiya":{"$":0},"fukuroi":{"$":0},"gotemba":{"$":0},"haibara":{"$":0},"hamamatsu":{"$":0},"higashiizu":{"$":0},"ito":{"$":0},"iwata":{"$":0},"izu":{"$":0},"izunokuni":{"$":0},"kakegawa":{"$":0},"kannami":{"$":0},"kawanehon":{"$":0},"kawazu":{"$":0},"kikugawa":{"$":0},"kosai":{"$":0},"makinohara":{"$":0},"matsuzaki":{"$":0},"minamiizu":{"$":0},"mishima":{"$":0},"morimachi":{"$":0},"nishiizu":{"$":0},"numazu":{"$":0},"omaezaki":{"$":0},"shimada":{"$":0},"shimizu":{"$":0},"shimoda":{"$":0},"shizuoka":{"$":0},"susono":{"$":0},"yaizu":{"$":0},"yoshida":{"$":0}},"tochigi":{"$":0,"ashikaga":{"$":0},"bato":{"$":0},"haga":{"$":0},"ichikai":{"$":0},"iwafune":{"$":0},"kaminokawa":{"$":0},"kanuma":{"$":0},"karasuyama":{"$":0},"kuroiso":{"$":0},"mashiko":{"$":0},"mibu":{"$":0},"moka":{"$":0},"motegi":{"$":0},"nasu":{"$":0},"nasushiobara":{"$":0},"nikko":{"$":0},"nishikata":{"$":0},"nogi":{"$":0},"ohira":{"$":0},"ohtawara":{"$":0},"oyama":{"$":0},"sakura":{"$":0},"sano":{"$":0},"shimotsuke":{"$":0},"shioya":{"$":0},"takanezawa":{"$":0},"tochigi":{"$":0},"tsuga":{"$":0},"ujiie":{"$":0},"utsunomiya":{"$":0},"yaita":{"$":0}},"tokushima":{"$":0,"aizumi":{"$":0},"anan":{"$":0},"ichiba":{"$":0},"itano":{"$":0},"kainan":{"$":0},"komatsushima":{"$":0},"matsushige":{"$":0},"mima":{"$":0},"minami":{"$":0},"miyoshi":{"$":0},"mugi":{"$":0},"nakagawa":{"$":0},"naruto":{"$":0},"sanagochi":{"$":0},"shishikui":{"$":0},"tokushima":{"$":0},"wajiki":{"$":0}},"tokyo":{"$":0,"adachi":{"$":0},"akiruno":{"$":0},"akishima":{"$":0},"aogashima":{"$":0},"arakawa":{"$":0},"bunkyo":{"$":0},"chiyoda":{"$":0},"chofu":{"$":0},"chuo":{"$":0},"edogawa":{"$":0},"fuchu":{"$":0},"fussa":{"$":0},"hachijo":{"$":0},"hachioji":{"$":0},"hamura":{"$":0},"higashikurume":{"$":0},"higashimurayama":{"$":0},"higashiyamato":{"$":0},"hino":{"$":0},"hinode":{"$":0},"hinohara":{"$":0},"inagi":{"$":0},"itabashi":{"$":0},"katsushika":{"$":0},"kita":{"$":0},"kiyose":{"$":0},"kodaira":{"$":0},"koganei":{"$":0},"kokubunji":{"$":0},"komae":{"$":0},"koto":{"$":0},"kouzushima":{"$":0},"kunitachi":{"$":0},"machida":{"$":0},"meguro":{"$":0},"minato":{"$":0},"mitaka":{"$":0},"mizuho":{"$":0},"musashimurayama":{"$":0},"musashino":{"$":0},"nakano":{"$":0},"nerima":{"$":0},"ogasawara":{"$":0},"okutama":{"$":0},"ome":{"$":0},"oshima":{"$":0},"ota":{"$":0},"setagaya":{"$":0},"shibuya":{"$":0},"shinagawa":{"$":0},"shinjuku":{"$":0},"suginami":{"$":0},"sumida":{"$":0},"tachikawa":{"$":0},"taito":{"$":0},"tama":{"$":0},"toshima":{"$":0}},"tottori":{"$":0,"chizu":{"$":0},"hino":{"$":0},"kawahara":{"$":0},"koge":{"$":0},"kotoura":{"$":0},"misasa":{"$":0},"nanbu":{"$":0},"nichinan":{"$":0},"sakaiminato":{"$":0},"tottori":{"$":0},"wakasa":{"$":0},"yazu":{"$":0},"yonago":{"$":0}},"toyama":{"$":0,"asahi":{"$":0},"fuchu":{"$":0},"fukumitsu":{"$":0},"funahashi":{"$":0},"himi":{"$":0},"imizu":{"$":0},"inami":{"$":0},"johana":{"$":0},"kamiichi":{"$":0},"kurobe":{"$":0},"nakaniikawa":{"$":0},"namerikawa":{"$":0},"nanto":{"$":0},"nyuzen":{"$":0},"oyabe":{"$":0},"taira":{"$":0},"takaoka":{"$":0},"tateyama":{"$":0},"toga":{"$":0},"tonami":{"$":0},"toyama":{"$":0},"unazuki":{"$":0},"uozu":{"$":0},"yamada":{"$":0}},"wakayama":{"$":0,"arida":{"$":0},"aridagawa":{"$":0},"gobo":{"$":0},"hashimoto":{"$":0},"hidaka":{"$":0},"hirogawa":{"$":0},"inami":{"$":0},"iwade":{"$":0},"kainan":{"$":0},"kamitonda":{"$":0},"katsuragi":{"$":0},"kimino":{"$":0},"kinokawa":{"$":0},"kitayama":{"$":0},"koya":{"$":0},"koza":{"$":0},"kozagawa":{"$":0},"kudoyama":{"$":0},"kushimoto":{"$":0},"mihama":{"$":0},"misato":{"$":0},"nachikatsuura":{"$":0},"shingu":{"$":0},"shirahama":{"$":0},"taiji":{"$":0},"tanabe":{"$":0},"wakayama":{"$":0},"yuasa":{"$":0},"yura":{"$":0}},"yamagata":{"$":0,"asahi":{"$":0},"funagata":{"$":0},"higashine":{"$":0},"iide":{"$":0},"kahoku":{"$":0},"kaminoyama":{"$":0},"kaneyama":{"$":0},"kawanishi":{"$":0},"mamurogawa":{"$":0},"mikawa":{"$":0},"murayama":{"$":0},"nagai":{"$":0},"nakayama":{"$":0},"nanyo":{"$":0},"nishikawa":{"$":0},"obanazawa":{"$":0},"oe":{"$":0},"oguni":{"$":0},"ohkura":{"$":0},"oishida":{"$":0},"sagae":{"$":0},"sakata":{"$":0},"sakegawa":{"$":0},"shinjo":{"$":0},"shirataka":{"$":0},"shonai":{"$":0},"takahata":{"$":0},"tendo":{"$":0},"tozawa":{"$":0},"tsuruoka":{"$":0},"yamagata":{"$":0},"yamanobe":{"$":0},"yonezawa":{"$":0},"yuza":{"$":0}},"yamaguchi":{"$":0,"abu":{"$":0},"hagi":{"$":0},"hikari":{"$":0},"hofu":{"$":0},"iwakuni":{"$":0},"kudamatsu":{"$":0},"mitou":{"$":0},"nagato":{"$":0},"oshima":{"$":0},"shimonoseki":{"$":0},"shunan":{"$":0},"tabuse":{"$":0},"tokuyama":{"$":0},"toyota":{"$":0},"ube":{"$":0},"yuu":{"$":0}},"yamanashi":{"$":0,"chuo":{"$":0},"doshi":{"$":0},"fuefuki":{"$":0},"fujikawa":{"$":0},"fujikawaguchiko":{"$":0},"fujiyoshida":{"$":0},"hayakawa":{"$":0},"hokuto":{"$":0},"ichikawamisato":{"$":0},"kai":{"$":0},"kofu":{"$":0},"koshu":{"$":0},"kosuge":{"$":0},"minami-alps":{"$":0},"minobu":{"$":0},"nakamichi":{"$":0},"nanbu":{"$":0},"narusawa":{"$":0},"nirasaki":{"$":0},"nishikatsura":{"$":0},"oshino":{"$":0},"otsuki":{"$":0},"showa":{"$":0},"tabayama":{"$":0},"tsuru":{"$":0},"uenohara":{"$":0},"yamanakako":{"$":0},"yamanashi":{"$":0}},"xn--4pvxs":{"$":0},"xn--vgu402c":{"$":0},"xn--c3s14m":{"$":0},"xn--f6qx53a":{"$":0},"xn--8pvr4u":{"$":0},"xn--uist22h":{"$":0},"xn--djrs72d6uy":{"$":0},"xn--mkru45i":{"$":0},"xn--0trq7p7nn":{"$":0},"xn--8ltr62k":{"$":0},"xn--2m4a15e":{"$":0},"xn--efvn9s":{"$":0},"xn--32vp30h":{"$":0},"xn--4it797k":{"$":0},"xn--1lqs71d":{"$":0},"xn--5rtp49c":{"$":0},"xn--5js045d":{"$":0},"xn--ehqz56n":{"$":0},"xn--1lqs03n":{"$":0},"xn--qqqt11m":{"$":0},"xn--kbrq7o":{"$":0},"xn--pssu33l":{"$":0},"xn--ntsq17g":{"$":0},"xn--uisz3g":{"$":0},"xn--6btw5a":{"$":0},"xn--1ctwo":{"$":0},"xn--6orx2r":{"$":0},"xn--rht61e":{"$":0},"xn--rht27z":{"$":0},"xn--djty4k":{"$":0},"xn--nit225k":{"$":0},"xn--rht3d":{"$":0},"xn--klty5x":{"$":0},"xn--kltx9a":{"$":0},"xn--kltp7d":{"$":0},"xn--uuwu58a":{"$":0},"xn--zbx025d":{"$":0},"xn--ntso0iqx3a":{"$":0},"xn--elqq16h":{"$":0},"xn--4it168d":{"$":0},"xn--klt787d":{"$":0},"xn--rny31h":{"$":0},"xn--7t0a264c":{"$":0},"xn--5rtq34k":{"$":0},"xn--k7yn95e":{"$":0},"xn--tor131o":{"$":0},"xn--d5qv7z876c":{"$":0},"kawasaki":{"*":{"$":0}},"kitakyushu":{"*":{"$":0}},"kobe":{"*":{"$":0}},"nagoya":{"*":{"$":0}},"sapporo":{"*":{"$":0}},"sendai":{"*":{"$":0}},"yokohama":{"*":{"$":0}},"usercontent":{"$":0},"blogspot":{"$":0}},"ke":{"$":0,"ac":{"$":0},"co":{"$":0,"blogspot":{"$":0}},"go":{"$":0},"info":{"$":0},"me":{"$":0},"mobi":{"$":0},"ne":{"$":0},"or":{"$":0},"sc":{"$":0},"nom":{"$":0}},"kg":{"$":0,"org":{"$":0},"net":{"$":0},"com":{"$":0},"edu":{"$":0},"gov":{"$":0},"mil":{"$":0},"blog":{"$":0},"io":{"$":0},"jp":{"$":0},"tv":{"$":0},"uk":{"$":0},"us":{"$":0}},"kh":{"*":{"$":0}},"ki":{"$":0,"edu":{"$":0},"biz":{"$":0},"net":{"$":0},"org":{"$":0},"gov":{"$":0},"info":{"$":0},"com":{"$":0}},"km":{"$":0,"org":{"$":0},"nom":{"$":0},"gov":{"$":0},"prd":{"$":0},"tm":{"$":0},"edu":{"$":0},"mil":{"$":0},"ass":{"$":0},"com":{"$":0},"coop":{"$":0},"asso":{"$":0},"presse":{"$":0},"medecin":{"$":0},"notaires":{"$":0},"pharmaciens":{"$":0},"veterinaire":{"$":0},"gouv":{"$":0}},"kn":{"$":0,"net":{"$":0},"org":{"$":0},"edu":{"$":0},"gov":{"$":0}},"kp":{"$":0,"com":{"$":0},"edu":{"$":0},"gov":{"$":0},"org":{"$":0},"rep":{"$":0},"tra":{"$":0}},"kr":{"$":0,"ac":{"$":0},"co":{"$":0},"es":{"$":0},"go":{"$":0},"hs":{"$":0},"kg":{"$":0},"mil":{"$":0},"ms":{"$":0},"ne":{"$":0},"or":{"$":0},"pe":{"$":0},"re":{"$":0},"sc":{"$":0},"busan":{"$":0},"chungbuk":{"$":0},"chungnam":{"$":0},"daegu":{"$":0},"daejeon":{"$":0},"gangwon":{"$":0},"gwangju":{"$":0},"gyeongbuk":{"$":0},"gyeonggi":{"$":0},"gyeongnam":{"$":0},"incheon":{"$":0},"jeju":{"$":0},"jeonbuk":{"$":0},"jeonnam":{"$":0},"seoul":{"$":0},"ulsan":{"$":0},"blogspot":{"$":0}},"kw":{"$":0,"com":{"$":0},"edu":{"$":0},"emb":{"$":0},"gov":{"$":0},"ind":{"$":0},"net":{"$":0},"org":{"$":0}},"ky":{"$":0,"edu":{"$":0},"gov":{"$":0},"com":{"$":0},"org":{"$":0},"net":{"$":0}},"kz":{"$":0,"org":{"$":0},"edu":{"$":0},"net":{"$":0},"gov":{"$":0},"mil":{"$":0},"com":{"$":0},"jcloud":{"$":0},"kazteleport":{"upaas":{"$":0}},"nym":{"$":0}},"la":{"$":0,"int":{"$":0},"net":{"$":0},"info":{"$":0},"edu":{"$":0},"gov":{"$":0},"per":{"$":0},"com":{"$":0},"org":{"$":0},"bnr":{"$":0},"c":{"$":0},"nym":{"$":0}},"lb":{"$":0,"com":{"$":0},"edu":{"$":0},"gov":{"$":0},"net":{"$":0},"org":{"$":0}},"lc":{"$":0,"com":{"$":0},"net":{"$":0},"co":{"$":0},"org":{"$":0},"edu":{"$":0},"gov":{"$":0},"nym":{"$":0},"oy":{"$":0}},"li":{"$":0,"blogspot":{"$":0},"caa":{"$":0},"nom":{"$":0},"nym":{"$":0}},"lk":{"$":0,"gov":{"$":0},"sch":{"$":0},"net":{"$":0},"int":{"$":0},"com":{"$":0},"org":{"$":0},"edu":{"$":0},"ngo":{"$":0},"soc":{"$":0},"web":{"$":0},"ltd":{"$":0},"assn":{"$":0},"grp":{"$":0},"hotel":{"$":0},"ac":{"$":0}},"lr":{"$":0,"com":{"$":0},"edu":{"$":0},"gov":{"$":0},"org":{"$":0},"net":{"$":0}},"ls":{"$":0,"ac":{"$":0},"biz":{"$":0},"co":{"$":0},"edu":{"$":0},"gov":{"$":0},"info":{"$":0},"net":{"$":0},"org":{"$":0},"sc":{"$":0},"de":{"$":0}},"lt":{"$":0,"gov":{"$":0},"blogspot":{"$":0},"nym":{"$":0}},"lu":{"$":0,"blogspot":{"$":0},"nym":{"$":0}},"lv":{"$":0,"com":{"$":0},"edu":{"$":0},"gov":{"$":0},"org":{"$":0},"mil":{"$":0},"id":{"$":0},"net":{"$":0},"asn":{"$":0},"conf":{"$":0},"nom":{"$":0}},"ly":{"$":0,"com":{"$":0},"net":{"$":0},"gov":{"$":0},"plc":{"$":0},"edu":{"$":0},"sch":{"$":0},"med":{"$":0},"org":{"$":0},"id":{"$":0}},"ma":{"$":0,"co":{"$":0},"net":{"$":0},"gov":{"$":0},"org":{"$":0},"ac":{"$":0},"press":{"$":0}},"mc":{"$":0,"tm":{"$":0},"asso":{"$":0}},"md":{"$":0,"blogspot":{"$":0},"at":{"$":0},"de":{"$":0},"jp":{"$":0},"to":{"$":0}},"me":{"$":0,"co":{"$":0},"net":{"$":0},"org":{"$":0},"edu":{"$":0},"ac":{"$":0},"gov":{"$":0},"its":{"$":0},"priv":{"$":0},"c66":{"$":0},"daplie":{"$":0,"localhost":{"$":0}},"edgestack":{"$":0},"couk":{"$":0},"ukco":{"$":0},"filegear":{"$":0},"filegear-au":{"$":0},"filegear-de":{"$":0},"filegear-gb":{"$":0},"filegear-ie":{"$":0},"filegear-jp":{"$":0},"filegear-sg":{"$":0},"glitch":{"$":0},"ravendb":{"$":0},"lohmus":{"$":0},"barsy":{"$":0},"mcpe":{"$":0},"mcdir":{"$":0},"nctu":{"$":0},"soundcast":{"$":0},"tcp4":{"$":0},"brasilia":{"$":0},"ddns":{"$":0},"dnsfor":{"$":0},"hopto":{"$":0},"loginto":{"$":0},"noip":{"$":0},"webhop":{"$":0},"nym":{"$":0},"diskstation":{"$":0},"dscloud":{"$":0},"i234":{"$":0},"myds":{"$":0},"synology":{"$":0},"tbits":{"$":0},"wbq":{"$":0},"wedeploy":{"$":0},"yombo":{"$":0},"nohost":{"$":0}},"mg":{"$":0,"org":{"$":0},"nom":{"$":0},"gov":{"$":0},"prd":{"$":0},"tm":{"$":0},"edu":{"$":0},"mil":{"$":0},"com":{"$":0},"co":{"$":0}},"mh":{"$":0},"mil":{"$":0},"mk":{"$":0,"com":{"$":0},"org":{"$":0},"net":{"$":0},"edu":{"$":0},"gov":{"$":0},"inf":{"$":0},"name":{"$":0},"blogspot":{"$":0},"nom":{"$":0}},"ml":{"$":0,"com":{"$":0},"edu":{"$":0},"gouv":{"$":0},"gov":{"$":0},"net":{"$":0},"org":{"$":0},"presse":{"$":0}},"mm":{"*":{"$":0}},"mn":{"$":0,"gov":{"$":0},"edu":{"$":0},"org":{"$":0},"nyc":{"$":0},"nym":{"$":0}},"mo":{"$":0,"com":{"$":0},"net":{"$":0},"org":{"$":0},"edu":{"$":0},"gov":{"$":0}},"mobi":{"$":0,"barsy":{"$":0},"dscloud":{"$":0}},"mp":{"$":0},"mq":{"$":0},"mr":{"$":0,"gov":{"$":0},"blogspot":{"$":0}},"ms":{"$":0,"com":{"$":0},"edu":{"$":0},"gov":{"$":0},"net":{"$":0},"org":{"$":0},"lab":{"$":0},"minisite":{"$":0}},"mt":{"$":0,"com":{"$":0,"blogspot":{"$":0}},"edu":{"$":0},"net":{"$":0},"org":{"$":0}},"mu":{"$":0,"com":{"$":0},"net":{"$":0},"org":{"$":0},"gov":{"$":0},"ac":{"$":0},"co":{"$":0},"or":{"$":0}},"museum":{"$":0,"academy":{"$":0},"agriculture":{"$":0},"air":{"$":0},"airguard":{"$":0},"alabama":{"$":0},"alaska":{"$":0},"amber":{"$":0},"ambulance":{"$":0},"american":{"$":0},"americana":{"$":0},"americanantiques":{"$":0},"americanart":{"$":0},"amsterdam":{"$":0},"and":{"$":0},"annefrank":{"$":0},"anthro":{"$":0},"anthropology":{"$":0},"antiques":{"$":0},"aquarium":{"$":0},"arboretum":{"$":0},"archaeological":{"$":0},"archaeology":{"$":0},"architecture":{"$":0},"art":{"$":0},"artanddesign":{"$":0},"artcenter":{"$":0},"artdeco":{"$":0},"arteducation":{"$":0},"artgallery":{"$":0},"arts":{"$":0},"artsandcrafts":{"$":0},"asmatart":{"$":0},"assassination":{"$":0},"assisi":{"$":0},"association":{"$":0},"astronomy":{"$":0},"atlanta":{"$":0},"austin":{"$":0},"australia":{"$":0},"automotive":{"$":0},"aviation":{"$":0},"axis":{"$":0},"badajoz":{"$":0},"baghdad":{"$":0},"bahn":{"$":0},"bale":{"$":0},"baltimore":{"$":0},"barcelona":{"$":0},"baseball":{"$":0},"basel":{"$":0},"baths":{"$":0},"bauern":{"$":0},"beauxarts":{"$":0},"beeldengeluid":{"$":0},"bellevue":{"$":0},"bergbau":{"$":0},"berkeley":{"$":0},"berlin":{"$":0},"bern":{"$":0},"bible":{"$":0},"bilbao":{"$":0},"bill":{"$":0},"birdart":{"$":0},"birthplace":{"$":0},"bonn":{"$":0},"boston":{"$":0},"botanical":{"$":0},"botanicalgarden":{"$":0},"botanicgarden":{"$":0},"botany":{"$":0},"brandywinevalley":{"$":0},"brasil":{"$":0},"bristol":{"$":0},"british":{"$":0},"britishcolumbia":{"$":0},"broadcast":{"$":0},"brunel":{"$":0},"brussel":{"$":0},"brussels":{"$":0},"bruxelles":{"$":0},"building":{"$":0},"burghof":{"$":0},"bus":{"$":0},"bushey":{"$":0},"cadaques":{"$":0},"california":{"$":0},"cambridge":{"$":0},"can":{"$":0},"canada":{"$":0},"capebreton":{"$":0},"carrier":{"$":0},"cartoonart":{"$":0},"casadelamoneda":{"$":0},"castle":{"$":0},"castres":{"$":0},"celtic":{"$":0},"center":{"$":0},"chattanooga":{"$":0},"cheltenham":{"$":0},"chesapeakebay":{"$":0},"chicago":{"$":0},"children":{"$":0},"childrens":{"$":0},"childrensgarden":{"$":0},"chiropractic":{"$":0},"chocolate":{"$":0},"christiansburg":{"$":0},"cincinnati":{"$":0},"cinema":{"$":0},"circus":{"$":0},"civilisation":{"$":0},"civilization":{"$":0},"civilwar":{"$":0},"clinton":{"$":0},"clock":{"$":0},"coal":{"$":0},"coastaldefence":{"$":0},"cody":{"$":0},"coldwar":{"$":0},"collection":{"$":0},"colonialwilliamsburg":{"$":0},"coloradoplateau":{"$":0},"columbia":{"$":0},"columbus":{"$":0},"communication":{"$":0},"communications":{"$":0},"community":{"$":0},"computer":{"$":0},"computerhistory":{"$":0},"xn--comunicaes-v6a2o":{"$":0},"contemporary":{"$":0},"contemporaryart":{"$":0},"convent":{"$":0},"copenhagen":{"$":0},"corporation":{"$":0},"xn--correios-e-telecomunicaes-ghc29a":{"$":0},"corvette":{"$":0},"costume":{"$":0},"countryestate":{"$":0},"county":{"$":0},"crafts":{"$":0},"cranbrook":{"$":0},"creation":{"$":0},"cultural":{"$":0},"culturalcenter":{"$":0},"culture":{"$":0},"cyber":{"$":0},"cymru":{"$":0},"dali":{"$":0},"dallas":{"$":0},"database":{"$":0},"ddr":{"$":0},"decorativearts":{"$":0},"delaware":{"$":0},"delmenhorst":{"$":0},"denmark":{"$":0},"depot":{"$":0},"design":{"$":0},"detroit":{"$":0},"dinosaur":{"$":0},"discovery":{"$":0},"dolls":{"$":0},"donostia":{"$":0},"durham":{"$":0},"eastafrica":{"$":0},"eastcoast":{"$":0},"education":{"$":0},"educational":{"$":0},"egyptian":{"$":0},"eisenbahn":{"$":0},"elburg":{"$":0},"elvendrell":{"$":0},"embroidery":{"$":0},"encyclopedic":{"$":0},"england":{"$":0},"entomology":{"$":0},"environment":{"$":0},"environmentalconservation":{"$":0},"epilepsy":{"$":0},"essex":{"$":0},"estate":{"$":0},"ethnology":{"$":0},"exeter":{"$":0},"exhibition":{"$":0},"family":{"$":0},"farm":{"$":0},"farmequipment":{"$":0},"farmers":{"$":0},"farmstead":{"$":0},"field":{"$":0},"figueres":{"$":0},"filatelia":{"$":0},"film":{"$":0},"fineart":{"$":0},"finearts":{"$":0},"finland":{"$":0},"flanders":{"$":0},"florida":{"$":0},"force":{"$":0},"fortmissoula":{"$":0},"fortworth":{"$":0},"foundation":{"$":0},"francaise":{"$":0},"frankfurt":{"$":0},"franziskaner":{"$":0},"freemasonry":{"$":0},"freiburg":{"$":0},"fribourg":{"$":0},"frog":{"$":0},"fundacio":{"$":0},"furniture":{"$":0},"gallery":{"$":0},"garden":{"$":0},"gateway":{"$":0},"geelvinck":{"$":0},"gemological":{"$":0},"geology":{"$":0},"georgia":{"$":0},"giessen":{"$":0},"glas":{"$":0},"glass":{"$":0},"gorge":{"$":0},"grandrapids":{"$":0},"graz":{"$":0},"guernsey":{"$":0},"halloffame":{"$":0},"hamburg":{"$":0},"handson":{"$":0},"harvestcelebration":{"$":0},"hawaii":{"$":0},"health":{"$":0},"heimatunduhren":{"$":0},"hellas":{"$":0},"helsinki":{"$":0},"hembygdsforbund":{"$":0},"heritage":{"$":0},"histoire":{"$":0},"historical":{"$":0},"historicalsociety":{"$":0},"historichouses":{"$":0},"historisch":{"$":0},"historisches":{"$":0},"history":{"$":0},"historyofscience":{"$":0},"horology":{"$":0},"house":{"$":0},"humanities":{"$":0},"illustration":{"$":0},"imageandsound":{"$":0},"indian":{"$":0},"indiana":{"$":0},"indianapolis":{"$":0},"indianmarket":{"$":0},"intelligence":{"$":0},"interactive":{"$":0},"iraq":{"$":0},"iron":{"$":0},"isleofman":{"$":0},"jamison":{"$":0},"jefferson":{"$":0},"jerusalem":{"$":0},"jewelry":{"$":0},"jewish":{"$":0},"jewishart":{"$":0},"jfk":{"$":0},"journalism":{"$":0},"judaica":{"$":0},"judygarland":{"$":0},"juedisches":{"$":0},"juif":{"$":0},"karate":{"$":0},"karikatur":{"$":0},"kids":{"$":0},"koebenhavn":{"$":0},"koeln":{"$":0},"kunst":{"$":0},"kunstsammlung":{"$":0},"kunstunddesign":{"$":0},"labor":{"$":0},"labour":{"$":0},"lajolla":{"$":0},"lancashire":{"$":0},"landes":{"$":0},"lans":{"$":0},"xn--lns-qla":{"$":0},"larsson":{"$":0},"lewismiller":{"$":0},"lincoln":{"$":0},"linz":{"$":0},"living":{"$":0},"livinghistory":{"$":0},"localhistory":{"$":0},"london":{"$":0},"losangeles":{"$":0},"louvre":{"$":0},"loyalist":{"$":0},"lucerne":{"$":0},"luxembourg":{"$":0},"luzern":{"$":0},"mad":{"$":0},"madrid":{"$":0},"mallorca":{"$":0},"manchester":{"$":0},"mansion":{"$":0},"mansions":{"$":0},"manx":{"$":0},"marburg":{"$":0},"maritime":{"$":0},"maritimo":{"$":0},"maryland":{"$":0},"marylhurst":{"$":0},"media":{"$":0},"medical":{"$":0},"medizinhistorisches":{"$":0},"meeres":{"$":0},"memorial":{"$":0},"mesaverde":{"$":0},"michigan":{"$":0},"midatlantic":{"$":0},"military":{"$":0},"mill":{"$":0},"miners":{"$":0},"mining":{"$":0},"minnesota":{"$":0},"missile":{"$":0},"missoula":{"$":0},"modern":{"$":0},"moma":{"$":0},"money":{"$":0},"monmouth":{"$":0},"monticello":{"$":0},"montreal":{"$":0},"moscow":{"$":0},"motorcycle":{"$":0},"muenchen":{"$":0},"muenster":{"$":0},"mulhouse":{"$":0},"muncie":{"$":0},"museet":{"$":0},"museumcenter":{"$":0},"museumvereniging":{"$":0},"music":{"$":0},"national":{"$":0},"nationalfirearms":{"$":0},"nationalheritage":{"$":0},"nativeamerican":{"$":0},"naturalhistory":{"$":0},"naturalhistorymuseum":{"$":0},"naturalsciences":{"$":0},"nature":{"$":0},"naturhistorisches":{"$":0},"natuurwetenschappen":{"$":0},"naumburg":{"$":0},"naval":{"$":0},"nebraska":{"$":0},"neues":{"$":0},"newhampshire":{"$":0},"newjersey":{"$":0},"newmexico":{"$":0},"newport":{"$":0},"newspaper":{"$":0},"newyork":{"$":0},"niepce":{"$":0},"norfolk":{"$":0},"north":{"$":0},"nrw":{"$":0},"nyc":{"$":0},"nyny":{"$":0},"oceanographic":{"$":0},"oceanographique":{"$":0},"omaha":{"$":0},"online":{"$":0},"ontario":{"$":0},"openair":{"$":0},"oregon":{"$":0},"oregontrail":{"$":0},"otago":{"$":0},"oxford":{"$":0},"pacific":{"$":0},"paderborn":{"$":0},"palace":{"$":0},"paleo":{"$":0},"palmsprings":{"$":0},"panama":{"$":0},"paris":{"$":0},"pasadena":{"$":0},"pharmacy":{"$":0},"philadelphia":{"$":0},"philadelphiaarea":{"$":0},"philately":{"$":0},"phoenix":{"$":0},"photography":{"$":0},"pilots":{"$":0},"pittsburgh":{"$":0},"planetarium":{"$":0},"plantation":{"$":0},"plants":{"$":0},"plaza":{"$":0},"portal":{"$":0},"portland":{"$":0},"portlligat":{"$":0},"posts-and-telecommunications":{"$":0},"preservation":{"$":0},"presidio":{"$":0},"press":{"$":0},"project":{"$":0},"public":{"$":0},"pubol":{"$":0},"quebec":{"$":0},"railroad":{"$":0},"railway":{"$":0},"research":{"$":0},"resistance":{"$":0},"riodejaneiro":{"$":0},"rochester":{"$":0},"rockart":{"$":0},"roma":{"$":0},"russia":{"$":0},"saintlouis":{"$":0},"salem":{"$":0},"salvadordali":{"$":0},"salzburg":{"$":0},"sandiego":{"$":0},"sanfrancisco":{"$":0},"santabarbara":{"$":0},"santacruz":{"$":0},"santafe":{"$":0},"saskatchewan":{"$":0},"satx":{"$":0},"savannahga":{"$":0},"schlesisches":{"$":0},"schoenbrunn":{"$":0},"schokoladen":{"$":0},"school":{"$":0},"schweiz":{"$":0},"science":{"$":0},"scienceandhistory":{"$":0},"scienceandindustry":{"$":0},"sciencecenter":{"$":0},"sciencecenters":{"$":0},"science-fiction":{"$":0},"sciencehistory":{"$":0},"sciences":{"$":0},"sciencesnaturelles":{"$":0},"scotland":{"$":0},"seaport":{"$":0},"settlement":{"$":0},"settlers":{"$":0},"shell":{"$":0},"sherbrooke":{"$":0},"sibenik":{"$":0},"silk":{"$":0},"ski":{"$":0},"skole":{"$":0},"society":{"$":0},"sologne":{"$":0},"soundandvision":{"$":0},"southcarolina":{"$":0},"southwest":{"$":0},"space":{"$":0},"spy":{"$":0},"square":{"$":0},"stadt":{"$":0},"stalbans":{"$":0},"starnberg":{"$":0},"state":{"$":0},"stateofdelaware":{"$":0},"station":{"$":0},"steam":{"$":0},"steiermark":{"$":0},"stjohn":{"$":0},"stockholm":{"$":0},"stpetersburg":{"$":0},"stuttgart":{"$":0},"suisse":{"$":0},"surgeonshall":{"$":0},"surrey":{"$":0},"svizzera":{"$":0},"sweden":{"$":0},"sydney":{"$":0},"tank":{"$":0},"tcm":{"$":0},"technology":{"$":0},"telekommunikation":{"$":0},"television":{"$":0},"texas":{"$":0},"textile":{"$":0},"theater":{"$":0},"time":{"$":0},"timekeeping":{"$":0},"topology":{"$":0},"torino":{"$":0},"touch":{"$":0},"town":{"$":0},"transport":{"$":0},"tree":{"$":0},"trolley":{"$":0},"trust":{"$":0},"trustee":{"$":0},"uhren":{"$":0},"ulm":{"$":0},"undersea":{"$":0},"university":{"$":0},"usa":{"$":0},"usantiques":{"$":0},"usarts":{"$":0},"uscountryestate":{"$":0},"usculture":{"$":0},"usdecorativearts":{"$":0},"usgarden":{"$":0},"ushistory":{"$":0},"ushuaia":{"$":0},"uslivinghistory":{"$":0},"utah":{"$":0},"uvic":{"$":0},"valley":{"$":0},"vantaa":{"$":0},"versailles":{"$":0},"viking":{"$":0},"village":{"$":0},"virginia":{"$":0},"virtual":{"$":0},"virtuel":{"$":0},"vlaanderen":{"$":0},"volkenkunde":{"$":0},"wales":{"$":0},"wallonie":{"$":0},"war":{"$":0},"washingtondc":{"$":0},"watchandclock":{"$":0},"watch-and-clock":{"$":0},"western":{"$":0},"westfalen":{"$":0},"whaling":{"$":0},"wildlife":{"$":0},"williamsburg":{"$":0},"windmill":{"$":0},"workshop":{"$":0},"york":{"$":0},"yorkshire":{"$":0},"yosemite":{"$":0},"youth":{"$":0},"zoological":{"$":0},"zoology":{"$":0},"xn--9dbhblg6di":{"$":0},"xn--h1aegh":{"$":0}},"mv":{"$":0,"aero":{"$":0},"biz":{"$":0},"com":{"$":0},"coop":{"$":0},"edu":{"$":0},"gov":{"$":0},"info":{"$":0},"int":{"$":0},"mil":{"$":0},"museum":{"$":0},"name":{"$":0},"net":{"$":0},"org":{"$":0},"pro":{"$":0}},"mw":{"$":0,"ac":{"$":0},"biz":{"$":0},"co":{"$":0},"com":{"$":0},"coop":{"$":0},"edu":{"$":0},"gov":{"$":0},"int":{"$":0},"museum":{"$":0},"net":{"$":0},"org":{"$":0}},"mx":{"$":0,"com":{"$":0},"org":{"$":0},"gob":{"$":0},"edu":{"$":0},"net":{"$":0},"blogspot":{"$":0},"nym":{"$":0}},"my":{"$":0,"biz":{"$":0},"com":{"$":0},"edu":{"$":0},"gov":{"$":0},"mil":{"$":0},"name":{"$":0},"net":{"$":0},"org":{"$":0},"blogspot":{"$":0}},"mz":{"$":0,"ac":{"$":0},"adv":{"$":0},"co":{"$":0},"edu":{"$":0},"gov":{"$":0},"mil":{"$":0},"net":{"$":0},"org":{"$":0}},"na":{"$":0,"info":{"$":0},"pro":{"$":0},"name":{"$":0},"school":{"$":0},"or":{"$":0},"dr":{"$":0},"us":{"$":0},"mx":{"$":0},"ca":{"$":0},"in":{"$":0},"cc":{"$":0},"tv":{"$":0},"ws":{"$":0},"mobi":{"$":0},"co":{"$":0},"com":{"$":0},"org":{"$":0}},"name":{"$":0,"her":{"forgot":{"$":0}},"his":{"forgot":{"$":0}}},"nc":{"$":0,"asso":{"$":0},"nom":{"$":0}},"ne":{"$":0},"net":{"$":0,"adobeaemcloud":{"$":0},"alwaysdata":{"$":0},"cloudfront":{"$":0},"t3l3p0rt":{"$":0},"appudo":{"$":0},"myfritz":{"$":0},"onavstack":{"$":0},"blackbaudcdn":{"$":0},"boomla":{"$":0},"bplaced":{"$":0},"square7":{"$":0},"gb":{"$":0},"hu":{"$":0},"jp":{"$":0},"se":{"$":0},"uk":{"$":0},"in":{"$":0},"clic2000":{"$":0},"clickrising":{"$":0},"cloudaccess":{"$":0},"cdn77-ssl":{"$":0},"cdn77":{"r":{"$":0}},"feste-ip":{"$":0},"knx-server":{"$":0},"static-access":{"$":0},"cryptonomic":{"*":{"$":0}},"dattolocal":{"$":0},"mydatto":{"$":0},"debian":{"$":0},"bitbridge":{"$":0},"at-band-camp":{"$":0},"blogdns":{"$":0},"broke-it":{"$":0},"buyshouses":{"$":0},"dnsalias":{"$":0},"dnsdojo":{"$":0},"does-it":{"$":0},"dontexist":{"$":0},"dynalias":{"$":0},"dynathome":{"$":0},"endofinternet":{"$":0},"from-az":{"$":0},"from-co":{"$":0},"from-la":{"$":0},"from-ny":{"$":0},"gets-it":{"$":0},"ham-radio-op":{"$":0},"homeftp":{"$":0},"homeip":{"$":0},"homelinux":{"$":0},"homeunix":{"$":0},"in-the-band":{"$":0},"is-a-chef":{"$":0},"is-a-geek":{"$":0},"isa-geek":{"$":0},"kicks-ass":{"$":0},"office-on-the":{"$":0},"podzone":{"$":0},"scrapper-site":{"$":0},"selfip":{"$":0},"sells-it":{"$":0},"servebbs":{"$":0},"serveftp":{"$":0},"thruhere":{"$":0},"webhop":{"$":0},"definima":{"$":0},"casacam":{"$":0},"dynu":{"$":0},"dynv6":{"$":0},"twmail":{"$":0},"ru":{"$":0},"channelsdvr":{"$":0,"u":{"$":0}},"fastlylb":{"$":0,"map":{"$":0}},"fastly":{"freetls":{"$":0},"map":{"$":0},"prod":{"a":{"$":0},"global":{"$":0}},"ssl":{"a":{"$":0},"b":{"$":0},"global":{"$":0}}},"edgeapp":{"$":0},"flynnhosting":{"$":0},"cdn-edges":{"$":0},"cloudfunctions":{"$":0},"moonscale":{"$":0},"in-dsl":{"$":0},"in-vpn":{"$":0},"ipifony":{"$":0},"iobb":{"$":0},"cloudjiffy":{"$":0,"fra1-de":{"$":0},"west1-us":{"$":0}},"elastx":{"jls-sto1":{"$":0},"jls-sto2":{"$":0},"jls-sto3":{"$":0}},"faststacks":{"$":0},"massivegrid":{"paas":{"fr-1":{"$":0},"lon-1":{"$":0},"lon-2":{"$":0},"ny-1":{"$":0},"ny-2":{"$":0},"sg-1":{"$":0}}},"saveincloud":{"jelastic":{"$":0},"nordeste-idc":{"$":0}},"scaleforce":{"j":{"$":0}},"tsukaeru":{"jelastic":{"$":0}},"kinghost":{"$":0},"uni5":{"$":0},"krellian":{"$":0},"barsy":{"$":0},"memset":{"$":0},"azurewebsites":{"$":0},"azure-mobile":{"$":0},"cloudapp":{"$":0},"azurestaticapps":{"$":0,"centralus":{"$":0},"eastasia":{"$":0},"eastus2":{"$":0},"westeurope":{"$":0},"westus2":{"$":0}},"dnsup":{"$":0},"hicam":{"$":0},"now-dns":{"$":0},"ownip":{"$":0},"vpndns":{"$":0},"eating-organic":{"$":0},"mydissent":{"$":0},"myeffect":{"$":0},"mymediapc":{"$":0},"mypsx":{"$":0},"mysecuritycamera":{"$":0},"nhlfan":{"$":0},"no-ip":{"$":0},"pgafan":{"$":0},"privatizehealthinsurance":{"$":0},"bounceme":{"$":0},"ddns":{"$":0},"redirectme":{"$":0},"serveblog":{"$":0},"serveminecraft":{"$":0},"sytes":{"$":0},"cloudycluster":{"$":0},"ovh":{"webpaas":{"*":{"$":0}},"hosting":{"*":{"$":0}}},"bar0":{"$":0},"bar1":{"$":0},"bar2":{"$":0},"rackmaze":{"$":0},"schokokeks":{"$":0},"firewall-gateway":{"$":0},"seidat":{"$":0},"senseering":{"$":0},"siteleaf":{"$":0},"vps-host":{"$":0,"jelastic":{"atl":{"$":0},"njs":{"$":0},"ric":{"$":0}}},"srcf":{"soc":{"$":0},"user":{"$":0}},"dsmynas":{"$":0},"familyds":{"$":0},"torproject":{"$":0,"pages":{"$":0}},"fastblog":{"$":0},"reserve-online":{"$":0},"community-pro":{"$":0},"meinforum":{"$":0},"yandexcloud":{"$":0,"storage":{"$":0},"website":{"$":0}},"za":{"$":0}},"nf":{"$":0,"com":{"$":0},"net":{"$":0},"per":{"$":0},"rec":{"$":0},"web":{"$":0},"arts":{"$":0},"firm":{"$":0},"info":{"$":0},"other":{"$":0},"store":{"$":0}},"ng":{"$":0,"com":{"$":0,"blogspot":{"$":0}},"edu":{"$":0},"gov":{"$":0},"i":{"$":0},"mil":{"$":0},"mobi":{"$":0},"name":{"$":0},"net":{"$":0},"org":{"$":0},"sch":{"$":0},"col":{"$":0},"firm":{"$":0},"gen":{"$":0},"ltd":{"$":0},"ngo":{"$":0}},"ni":{"$":0,"ac":{"$":0},"biz":{"$":0},"co":{"$":0},"com":{"$":0},"edu":{"$":0},"gob":{"$":0},"in":{"$":0},"info":{"$":0},"int":{"$":0},"mil":{"$":0},"net":{"$":0},"nom":{"$":0},"org":{"$":0},"web":{"$":0}},"nl":{"$":0,"amsw":{"$":0},"virtueeldomein":{"$":0},"co":{"$":0},"hosting-cluster":{"$":0},"blogspot":{"$":0},"khplay":{"$":0},"transurl":{"*":{"$":0}},"cistron":{"$":0},"demon":{"$":0}},"no":{"$":0,"fhs":{"$":0},"vgs":{"$":0},"fylkesbibl":{"$":0},"folkebibl":{"$":0},"museum":{"$":0},"idrett":{"$":0},"priv":{"$":0},"mil":{"$":0},"stat":{"$":0},"dep":{"$":0},"kommune":{"$":0},"herad":{"$":0},"aa":{"$":0,"gs":{"$":0}},"ah":{"$":0,"gs":{"$":0}},"bu":{"$":0,"gs":{"$":0}},"fm":{"$":0,"gs":{"$":0}},"hl":{"$":0,"gs":{"$":0}},"hm":{"$":0,"gs":{"$":0}},"jan-mayen":{"$":0,"gs":{"$":0}},"mr":{"$":0,"gs":{"$":0}},"nl":{"$":0,"gs":{"$":0}},"nt":{"$":0,"gs":{"$":0}},"of":{"$":0,"gs":{"$":0}},"ol":{"$":0,"gs":{"$":0}},"oslo":{"$":0,"gs":{"$":0}},"rl":{"$":0,"gs":{"$":0}},"sf":{"$":0,"gs":{"$":0}},"st":{"$":0,"gs":{"$":0}},"svalbard":{"$":0,"gs":{"$":0}},"tm":{"$":0,"gs":{"$":0}},"tr":{"$":0,"gs":{"$":0}},"va":{"$":0,"gs":{"$":0}},"vf":{"$":0,"gs":{"$":0}},"akrehamn":{"$":0},"xn--krehamn-dxa":{"$":0},"algard":{"$":0},"xn--lgrd-poac":{"$":0},"arna":{"$":0},"brumunddal":{"$":0},"bryne":{"$":0},"bronnoysund":{"$":0},"xn--brnnysund-m8ac":{"$":0},"drobak":{"$":0},"xn--drbak-wua":{"$":0},"egersund":{"$":0},"fetsund":{"$":0},"floro":{"$":0},"xn--flor-jra":{"$":0},"fredrikstad":{"$":0},"hokksund":{"$":0},"honefoss":{"$":0},"xn--hnefoss-q1a":{"$":0},"jessheim":{"$":0},"jorpeland":{"$":0},"xn--jrpeland-54a":{"$":0},"kirkenes":{"$":0},"kopervik":{"$":0},"krokstadelva":{"$":0},"langevag":{"$":0},"xn--langevg-jxa":{"$":0},"leirvik":{"$":0},"mjondalen":{"$":0},"xn--mjndalen-64a":{"$":0},"mo-i-rana":{"$":0},"mosjoen":{"$":0},"xn--mosjen-eya":{"$":0},"nesoddtangen":{"$":0},"orkanger":{"$":0},"osoyro":{"$":0},"xn--osyro-wua":{"$":0},"raholt":{"$":0},"xn--rholt-mra":{"$":0},"sandnessjoen":{"$":0},"xn--sandnessjen-ogb":{"$":0},"skedsmokorset":{"$":0},"slattum":{"$":0},"spjelkavik":{"$":0},"stathelle":{"$":0},"stavern":{"$":0},"stjordalshalsen":{"$":0},"xn--stjrdalshalsen-sqb":{"$":0},"tananger":{"$":0},"tranby":{"$":0},"vossevangen":{"$":0},"afjord":{"$":0},"xn--fjord-lra":{"$":0},"agdenes":{"$":0},"al":{"$":0},"xn--l-1fa":{"$":0},"alesund":{"$":0},"xn--lesund-hua":{"$":0},"alstahaug":{"$":0},"alta":{"$":0},"xn--lt-liac":{"$":0},"alaheadju":{"$":0},"xn--laheadju-7ya":{"$":0},"alvdal":{"$":0},"amli":{"$":0},"xn--mli-tla":{"$":0},"amot":{"$":0},"xn--mot-tla":{"$":0},"andebu":{"$":0},"andoy":{"$":0},"xn--andy-ira":{"$":0},"andasuolo":{"$":0},"ardal":{"$":0},"xn--rdal-poa":{"$":0},"aremark":{"$":0},"arendal":{"$":0},"xn--s-1fa":{"$":0},"aseral":{"$":0},"xn--seral-lra":{"$":0},"asker":{"$":0},"askim":{"$":0},"askvoll":{"$":0},"askoy":{"$":0},"xn--asky-ira":{"$":0},"asnes":{"$":0},"xn--snes-poa":{"$":0},"audnedaln":{"$":0},"aukra":{"$":0},"aure":{"$":0},"aurland":{"$":0},"aurskog-holand":{"$":0},"xn--aurskog-hland-jnb":{"$":0},"austevoll":{"$":0},"austrheim":{"$":0},"averoy":{"$":0},"xn--avery-yua":{"$":0},"balestrand":{"$":0},"ballangen":{"$":0},"balat":{"$":0},"xn--blt-elab":{"$":0},"balsfjord":{"$":0},"bahccavuotna":{"$":0},"xn--bhccavuotna-k7a":{"$":0},"bamble":{"$":0},"bardu":{"$":0},"beardu":{"$":0},"beiarn":{"$":0},"bajddar":{"$":0},"xn--bjddar-pta":{"$":0},"baidar":{"$":0},"xn--bidr-5nac":{"$":0},"berg":{"$":0},"bergen":{"$":0},"berlevag":{"$":0},"xn--berlevg-jxa":{"$":0},"bearalvahki":{"$":0},"xn--bearalvhki-y4a":{"$":0},"bindal":{"$":0},"birkenes":{"$":0},"bjarkoy":{"$":0},"xn--bjarky-fya":{"$":0},"bjerkreim":{"$":0},"bjugn":{"$":0},"bodo":{"$":0},"xn--bod-2na":{"$":0},"badaddja":{"$":0},"xn--bdddj-mrabd":{"$":0},"budejju":{"$":0},"bokn":{"$":0},"bremanger":{"$":0},"bronnoy":{"$":0},"xn--brnny-wuac":{"$":0},"bygland":{"$":0},"bykle":{"$":0},"barum":{"$":0},"xn--brum-voa":{"$":0},"telemark":{"bo":{"$":0},"xn--b-5ga":{"$":0}},"nordland":{"bo":{"$":0},"xn--b-5ga":{"$":0},"heroy":{"$":0},"xn--hery-ira":{"$":0}},"bievat":{"$":0},"xn--bievt-0qa":{"$":0},"bomlo":{"$":0},"xn--bmlo-gra":{"$":0},"batsfjord":{"$":0},"xn--btsfjord-9za":{"$":0},"bahcavuotna":{"$":0},"xn--bhcavuotna-s4a":{"$":0},"dovre":{"$":0},"drammen":{"$":0},"drangedal":{"$":0},"dyroy":{"$":0},"xn--dyry-ira":{"$":0},"donna":{"$":0},"xn--dnna-gra":{"$":0},"eid":{"$":0},"eidfjord":{"$":0},"eidsberg":{"$":0},"eidskog":{"$":0},"eidsvoll":{"$":0},"eigersund":{"$":0},"elverum":{"$":0},"enebakk":{"$":0},"engerdal":{"$":0},"etne":{"$":0},"etnedal":{"$":0},"evenes":{"$":0},"evenassi":{"$":0},"xn--eveni-0qa01ga":{"$":0},"evje-og-hornnes":{"$":0},"farsund":{"$":0},"fauske":{"$":0},"fuossko":{"$":0},"fuoisku":{"$":0},"fedje":{"$":0},"fet":{"$":0},"finnoy":{"$":0},"xn--finny-yua":{"$":0},"fitjar":{"$":0},"fjaler":{"$":0},"fjell":{"$":0},"flakstad":{"$":0},"flatanger":{"$":0},"flekkefjord":{"$":0},"flesberg":{"$":0},"flora":{"$":0},"fla":{"$":0},"xn--fl-zia":{"$":0},"folldal":{"$":0},"forsand":{"$":0},"fosnes":{"$":0},"frei":{"$":0},"frogn":{"$":0},"froland":{"$":0},"frosta":{"$":0},"frana":{"$":0},"xn--frna-woa":{"$":0},"froya":{"$":0},"xn--frya-hra":{"$":0},"fusa":{"$":0},"fyresdal":{"$":0},"forde":{"$":0},"xn--frde-gra":{"$":0},"gamvik":{"$":0},"gangaviika":{"$":0},"xn--ggaviika-8ya47h":{"$":0},"gaular":{"$":0},"gausdal":{"$":0},"gildeskal":{"$":0},"xn--gildeskl-g0a":{"$":0},"giske":{"$":0},"gjemnes":{"$":0},"gjerdrum":{"$":0},"gjerstad":{"$":0},"gjesdal":{"$":0},"gjovik":{"$":0},"xn--gjvik-wua":{"$":0},"gloppen":{"$":0},"gol":{"$":0},"gran":{"$":0},"grane":{"$":0},"granvin":{"$":0},"gratangen":{"$":0},"grimstad":{"$":0},"grong":{"$":0},"kraanghke":{"$":0},"xn--kranghke-b0a":{"$":0},"grue":{"$":0},"gulen":{"$":0},"hadsel":{"$":0},"halden":{"$":0},"halsa":{"$":0},"hamar":{"$":0},"hamaroy":{"$":0},"habmer":{"$":0},"xn--hbmer-xqa":{"$":0},"hapmir":{"$":0},"xn--hpmir-xqa":{"$":0},"hammerfest":{"$":0},"hammarfeasta":{"$":0},"xn--hmmrfeasta-s4ac":{"$":0},"haram":{"$":0},"hareid":{"$":0},"harstad":{"$":0},"hasvik":{"$":0},"aknoluokta":{"$":0},"xn--koluokta-7ya57h":{"$":0},"hattfjelldal":{"$":0},"aarborte":{"$":0},"haugesund":{"$":0},"hemne":{"$":0},"hemnes":{"$":0},"hemsedal":{"$":0},"more-og-romsdal":{"heroy":{"$":0},"sande":{"$":0}},"xn--mre-og-romsdal-qqb":{"xn--hery-ira":{"$":0},"sande":{"$":0}},"hitra":{"$":0},"hjartdal":{"$":0},"hjelmeland":{"$":0},"hobol":{"$":0},"xn--hobl-ira":{"$":0},"hof":{"$":0},"hol":{"$":0},"hole":{"$":0},"holmestrand":{"$":0},"holtalen":{"$":0},"xn--holtlen-hxa":{"$":0},"hornindal":{"$":0},"horten":{"$":0},"hurdal":{"$":0},"hurum":{"$":0},"hvaler":{"$":0},"hyllestad":{"$":0},"hagebostad":{"$":0},"xn--hgebostad-g3a":{"$":0},"hoyanger":{"$":0},"xn--hyanger-q1a":{"$":0},"hoylandet":{"$":0},"xn--hylandet-54a":{"$":0},"ha":{"$":0},"xn--h-2fa":{"$":0},"ibestad":{"$":0},"inderoy":{"$":0},"xn--indery-fya":{"$":0},"iveland":{"$":0},"jevnaker":{"$":0},"jondal":{"$":0},"jolster":{"$":0},"xn--jlster-bya":{"$":0},"karasjok":{"$":0},"karasjohka":{"$":0},"xn--krjohka-hwab49j":{"$":0},"karlsoy":{"$":0},"galsa":{"$":0},"xn--gls-elac":{"$":0},"karmoy":{"$":0},"xn--karmy-yua":{"$":0},"kautokeino":{"$":0},"guovdageaidnu":{"$":0},"klepp":{"$":0},"klabu":{"$":0},"xn--klbu-woa":{"$":0},"kongsberg":{"$":0},"kongsvinger":{"$":0},"kragero":{"$":0},"xn--krager-gya":{"$":0},"kristiansand":{"$":0},"kristiansund":{"$":0},"krodsherad":{"$":0},"xn--krdsherad-m8a":{"$":0},"kvalsund":{"$":0},"rahkkeravju":{"$":0},"xn--rhkkervju-01af":{"$":0},"kvam":{"$":0},"kvinesdal":{"$":0},"kvinnherad":{"$":0},"kviteseid":{"$":0},"kvitsoy":{"$":0},"xn--kvitsy-fya":{"$":0},"kvafjord":{"$":0},"xn--kvfjord-nxa":{"$":0},"giehtavuoatna":{"$":0},"kvanangen":{"$":0},"xn--kvnangen-k0a":{"$":0},"navuotna":{"$":0},"xn--nvuotna-hwa":{"$":0},"kafjord":{"$":0},"xn--kfjord-iua":{"$":0},"gaivuotna":{"$":0},"xn--givuotna-8ya":{"$":0},"larvik":{"$":0},"lavangen":{"$":0},"lavagis":{"$":0},"loabat":{"$":0},"xn--loabt-0qa":{"$":0},"lebesby":{"$":0},"davvesiida":{"$":0},"leikanger":{"$":0},"leirfjord":{"$":0},"leka":{"$":0},"leksvik":{"$":0},"lenvik":{"$":0},"leangaviika":{"$":0},"xn--leagaviika-52b":{"$":0},"lesja":{"$":0},"levanger":{"$":0},"lier":{"$":0},"lierne":{"$":0},"lillehammer":{"$":0},"lillesand":{"$":0},"lindesnes":{"$":0},"lindas":{"$":0},"xn--linds-pra":{"$":0},"lom":{"$":0},"loppa":{"$":0},"lahppi":{"$":0},"xn--lhppi-xqa":{"$":0},"lund":{"$":0},"lunner":{"$":0},"luroy":{"$":0},"xn--lury-ira":{"$":0},"luster":{"$":0},"lyngdal":{"$":0},"lyngen":{"$":0},"ivgu":{"$":0},"lardal":{"$":0},"lerdal":{"$":0},"xn--lrdal-sra":{"$":0},"lodingen":{"$":0},"xn--ldingen-q1a":{"$":0},"lorenskog":{"$":0},"xn--lrenskog-54a":{"$":0},"loten":{"$":0},"xn--lten-gra":{"$":0},"malvik":{"$":0},"masoy":{"$":0},"xn--msy-ula0h":{"$":0},"muosat":{"$":0},"xn--muost-0qa":{"$":0},"mandal":{"$":0},"marker":{"$":0},"marnardal":{"$":0},"masfjorden":{"$":0},"meland":{"$":0},"meldal":{"$":0},"melhus":{"$":0},"meloy":{"$":0},"xn--mely-ira":{"$":0},"meraker":{"$":0},"xn--merker-kua":{"$":0},"moareke":{"$":0},"xn--moreke-jua":{"$":0},"midsund":{"$":0},"midtre-gauldal":{"$":0},"modalen":{"$":0},"modum":{"$":0},"molde":{"$":0},"moskenes":{"$":0},"moss":{"$":0},"mosvik":{"$":0},"malselv":{"$":0},"xn--mlselv-iua":{"$":0},"malatvuopmi":{"$":0},"xn--mlatvuopmi-s4a":{"$":0},"namdalseid":{"$":0},"aejrie":{"$":0},"namsos":{"$":0},"namsskogan":{"$":0},"naamesjevuemie":{"$":0},"xn--nmesjevuemie-tcba":{"$":0},"laakesvuemie":{"$":0},"nannestad":{"$":0},"narvik":{"$":0},"narviika":{"$":0},"naustdal":{"$":0},"nedre-eiker":{"$":0},"akershus":{"nes":{"$":0}},"buskerud":{"nes":{"$":0}},"nesna":{"$":0},"nesodden":{"$":0},"nesseby":{"$":0},"unjarga":{"$":0},"xn--unjrga-rta":{"$":0},"nesset":{"$":0},"nissedal":{"$":0},"nittedal":{"$":0},"nord-aurdal":{"$":0},"nord-fron":{"$":0},"nord-odal":{"$":0},"norddal":{"$":0},"nordkapp":{"$":0},"davvenjarga":{"$":0},"xn--davvenjrga-y4a":{"$":0},"nordre-land":{"$":0},"nordreisa":{"$":0},"raisa":{"$":0},"xn--risa-5na":{"$":0},"nore-og-uvdal":{"$":0},"notodden":{"$":0},"naroy":{"$":0},"xn--nry-yla5g":{"$":0},"notteroy":{"$":0},"xn--nttery-byae":{"$":0},"odda":{"$":0},"oksnes":{"$":0},"xn--ksnes-uua":{"$":0},"oppdal":{"$":0},"oppegard":{"$":0},"xn--oppegrd-ixa":{"$":0},"orkdal":{"$":0},"orland":{"$":0},"xn--rland-uua":{"$":0},"orskog":{"$":0},"xn--rskog-uua":{"$":0},"orsta":{"$":0},"xn--rsta-fra":{"$":0},"hedmark":{"os":{"$":0},"valer":{"$":0},"xn--vler-qoa":{"$":0}},"hordaland":{"os":{"$":0}},"osen":{"$":0},"osteroy":{"$":0},"xn--ostery-fya":{"$":0},"ostre-toten":{"$":0},"xn--stre-toten-zcb":{"$":0},"overhalla":{"$":0},"ovre-eiker":{"$":0},"xn--vre-eiker-k8a":{"$":0},"oyer":{"$":0},"xn--yer-zna":{"$":0},"oygarden":{"$":0},"xn--ygarden-p1a":{"$":0},"oystre-slidre":{"$":0},"xn--ystre-slidre-ujb":{"$":0},"porsanger":{"$":0},"porsangu":{"$":0},"xn--porsgu-sta26f":{"$":0},"porsgrunn":{"$":0},"radoy":{"$":0},"xn--rady-ira":{"$":0},"rakkestad":{"$":0},"rana":{"$":0},"ruovat":{"$":0},"randaberg":{"$":0},"rauma":{"$":0},"rendalen":{"$":0},"rennebu":{"$":0},"rennesoy":{"$":0},"xn--rennesy-v1a":{"$":0},"rindal":{"$":0},"ringebu":{"$":0},"ringerike":{"$":0},"ringsaker":{"$":0},"rissa":{"$":0},"risor":{"$":0},"xn--risr-ira":{"$":0},"roan":{"$":0},"rollag":{"$":0},"rygge":{"$":0},"ralingen":{"$":0},"xn--rlingen-mxa":{"$":0},"rodoy":{"$":0},"xn--rdy-0nab":{"$":0},"romskog":{"$":0},"xn--rmskog-bya":{"$":0},"roros":{"$":0},"xn--rros-gra":{"$":0},"rost":{"$":0},"xn--rst-0na":{"$":0},"royken":{"$":0},"xn--ryken-vua":{"$":0},"royrvik":{"$":0},"xn--ryrvik-bya":{"$":0},"rade":{"$":0},"xn--rde-ula":{"$":0},"salangen":{"$":0},"siellak":{"$":0},"saltdal":{"$":0},"salat":{"$":0},"xn--slt-elab":{"$":0},"xn--slat-5na":{"$":0},"samnanger":{"$":0},"vestfold":{"sande":{"$":0}},"sandefjord":{"$":0},"sandnes":{"$":0},"sandoy":{"$":0},"xn--sandy-yua":{"$":0},"sarpsborg":{"$":0},"sauda":{"$":0},"sauherad":{"$":0},"sel":{"$":0},"selbu":{"$":0},"selje":{"$":0},"seljord":{"$":0},"sigdal":{"$":0},"siljan":{"$":0},"sirdal":{"$":0},"skaun":{"$":0},"skedsmo":{"$":0},"ski":{"$":0},"skien":{"$":0},"skiptvet":{"$":0},"skjervoy":{"$":0},"xn--skjervy-v1a":{"$":0},"skierva":{"$":0},"xn--skierv-uta":{"$":0},"skjak":{"$":0},"xn--skjk-soa":{"$":0},"skodje":{"$":0},"skanland":{"$":0},"xn--sknland-fxa":{"$":0},"skanit":{"$":0},"xn--sknit-yqa":{"$":0},"smola":{"$":0},"xn--smla-hra":{"$":0},"snillfjord":{"$":0},"snasa":{"$":0},"xn--snsa-roa":{"$":0},"snoasa":{"$":0},"snaase":{"$":0},"xn--snase-nra":{"$":0},"sogndal":{"$":0},"sokndal":{"$":0},"sola":{"$":0},"solund":{"$":0},"songdalen":{"$":0},"sortland":{"$":0},"spydeberg":{"$":0},"stange":{"$":0},"stavanger":{"$":0},"steigen":{"$":0},"steinkjer":{"$":0},"stjordal":{"$":0},"xn--stjrdal-s1a":{"$":0},"stokke":{"$":0},"stor-elvdal":{"$":0},"stord":{"$":0},"stordal":{"$":0},"storfjord":{"$":0},"omasvuotna":{"$":0},"strand":{"$":0},"stranda":{"$":0},"stryn":{"$":0},"sula":{"$":0},"suldal":{"$":0},"sund":{"$":0},"sunndal":{"$":0},"surnadal":{"$":0},"sveio":{"$":0},"svelvik":{"$":0},"sykkylven":{"$":0},"sogne":{"$":0},"xn--sgne-gra":{"$":0},"somna":{"$":0},"xn--smna-gra":{"$":0},"sondre-land":{"$":0},"xn--sndre-land-0cb":{"$":0},"sor-aurdal":{"$":0},"xn--sr-aurdal-l8a":{"$":0},"sor-fron":{"$":0},"xn--sr-fron-q1a":{"$":0},"sor-odal":{"$":0},"xn--sr-odal-q1a":{"$":0},"sor-varanger":{"$":0},"xn--sr-varanger-ggb":{"$":0},"matta-varjjat":{"$":0},"xn--mtta-vrjjat-k7af":{"$":0},"sorfold":{"$":0},"xn--srfold-bya":{"$":0},"sorreisa":{"$":0},"xn--srreisa-q1a":{"$":0},"sorum":{"$":0},"xn--srum-gra":{"$":0},"tana":{"$":0},"deatnu":{"$":0},"time":{"$":0},"tingvoll":{"$":0},"tinn":{"$":0},"tjeldsund":{"$":0},"dielddanuorri":{"$":0},"tjome":{"$":0},"xn--tjme-hra":{"$":0},"tokke":{"$":0},"tolga":{"$":0},"torsken":{"$":0},"tranoy":{"$":0},"xn--trany-yua":{"$":0},"tromso":{"$":0},"xn--troms-zua":{"$":0},"tromsa":{"$":0},"romsa":{"$":0},"trondheim":{"$":0},"troandin":{"$":0},"trysil":{"$":0},"trana":{"$":0},"xn--trna-woa":{"$":0},"trogstad":{"$":0},"xn--trgstad-r1a":{"$":0},"tvedestrand":{"$":0},"tydal":{"$":0},"tynset":{"$":0},"tysfjord":{"$":0},"divtasvuodna":{"$":0},"divttasvuotna":{"$":0},"tysnes":{"$":0},"tysvar":{"$":0},"xn--tysvr-vra":{"$":0},"tonsberg":{"$":0},"xn--tnsberg-q1a":{"$":0},"ullensaker":{"$":0},"ullensvang":{"$":0},"ulvik":{"$":0},"utsira":{"$":0},"vadso":{"$":0},"xn--vads-jra":{"$":0},"cahcesuolo":{"$":0},"xn--hcesuolo-7ya35b":{"$":0},"vaksdal":{"$":0},"valle":{"$":0},"vang":{"$":0},"vanylven":{"$":0},"vardo":{"$":0},"xn--vard-jra":{"$":0},"varggat":{"$":0},"xn--vrggt-xqad":{"$":0},"vefsn":{"$":0},"vaapste":{"$":0},"vega":{"$":0},"vegarshei":{"$":0},"xn--vegrshei-c0a":{"$":0},"vennesla":{"$":0},"verdal":{"$":0},"verran":{"$":0},"vestby":{"$":0},"vestnes":{"$":0},"vestre-slidre":{"$":0},"vestre-toten":{"$":0},"vestvagoy":{"$":0},"xn--vestvgy-ixa6o":{"$":0},"vevelstad":{"$":0},"vik":{"$":0},"vikna":{"$":0},"vindafjord":{"$":0},"volda":{"$":0},"voss":{"$":0},"varoy":{"$":0},"xn--vry-yla5g":{"$":0},"vagan":{"$":0},"xn--vgan-qoa":{"$":0},"voagat":{"$":0},"vagsoy":{"$":0},"xn--vgsy-qoa0j":{"$":0},"vaga":{"$":0},"xn--vg-yiab":{"$":0},"ostfold":{"valer":{"$":0}},"xn--stfold-9xa":{"xn--vler-qoa":{"$":0}},"co":{"$":0},"blogspot":{"$":0}},"np":{"*":{"$":0}},"nr":{"$":0,"biz":{"$":0},"info":{"$":0},"gov":{"$":0},"edu":{"$":0},"org":{"$":0},"net":{"$":0},"com":{"$":0}},"nu":{"$":0,"merseine":{"$":0},"mine":{"$":0},"shacknet":{"$":0},"nom":{"$":0},"uwu":{"$":0},"enterprisecloud":{"$":0}},"nz":{"$":0,"ac":{"$":0},"co":{"$":0,"blogspot":{"$":0}},"cri":{"$":0},"geek":{"$":0},"gen":{"$":0},"govt":{"$":0},"health":{"$":0},"iwi":{"$":0},"kiwi":{"$":0},"maori":{"$":0},"mil":{"$":0},"xn--mori-qsa":{"$":0},"net":{"$":0},"org":{"$":0},"parliament":{"$":0},"school":{"$":0},"nym":{"$":0}},"om":{"$":0,"co":{"$":0},"com":{"$":0},"edu":{"$":0},"gov":{"$":0},"med":{"$":0},"museum":{"$":0},"net":{"$":0},"org":{"$":0},"pro":{"$":0}},"onion":{"$":0},"org":{"$":0,"altervista":{"$":0},"amune":{"tele":{"$":0}},"pimienta":{"$":0},"poivron":{"$":0},"potager":{"$":0},"sweetpepper":{"$":0},"ae":{"$":0},"us":{"$":0},"certmgr":{"$":0},"cdn77":{"c":{"$":0},"rsc":{"$":0}},"cdn77-secure":{"origin":{"ssl":{"$":0}}},"cloudns":{"$":0},"duckdns":{"$":0},"tunk":{"$":0},"dyndns":{"$":0,"go":{"$":0},"home":{"$":0}},"blogdns":{"$":0},"blogsite":{"$":0},"boldlygoingnowhere":{"$":0},"dnsalias":{"$":0},"dnsdojo":{"$":0},"doesntexist":{"$":0},"dontexist":{"$":0},"doomdns":{"$":0},"dvrdns":{"$":0},"dynalias":{"$":0},"endofinternet":{"$":0},"endoftheinternet":{"$":0},"from-me":{"$":0},"game-host":{"$":0},"gotdns":{"$":0},"hobby-site":{"$":0},"homedns":{"$":0},"homeftp":{"$":0},"homelinux":{"$":0},"homeunix":{"$":0},"is-a-bruinsfan":{"$":0},"is-a-candidate":{"$":0},"is-a-celticsfan":{"$":0},"is-a-chef":{"$":0},"is-a-geek":{"$":0},"is-a-knight":{"$":0},"is-a-linux-user":{"$":0},"is-a-patsfan":{"$":0},"is-a-soxfan":{"$":0},"is-found":{"$":0},"is-lost":{"$":0},"is-saved":{"$":0},"is-very-bad":{"$":0},"is-very-evil":{"$":0},"is-very-good":{"$":0},"is-very-nice":{"$":0},"is-very-sweet":{"$":0},"isa-geek":{"$":0},"kicks-ass":{"$":0},"misconfused":{"$":0},"podzone":{"$":0},"readmyblog":{"$":0},"selfip":{"$":0},"sellsyourhome":{"$":0},"servebbs":{"$":0},"serveftp":{"$":0},"servegame":{"$":0},"stuff-4-sale":{"$":0},"webhop":{"$":0},"ddnss":{"$":0},"accesscam":{"$":0},"camdvr":{"$":0},"freeddns":{"$":0},"mywire":{"$":0},"webredirect":{"$":0},"eu":{"$":0,"al":{"$":0},"asso":{"$":0},"at":{"$":0},"au":{"$":0},"be":{"$":0},"bg":{"$":0},"ca":{"$":0},"cd":{"$":0},"ch":{"$":0},"cn":{"$":0},"cy":{"$":0},"cz":{"$":0},"de":{"$":0},"dk":{"$":0},"edu":{"$":0},"ee":{"$":0},"es":{"$":0},"fi":{"$":0},"fr":{"$":0},"gr":{"$":0},"hr":{"$":0},"hu":{"$":0},"ie":{"$":0},"il":{"$":0},"in":{"$":0},"int":{"$":0},"is":{"$":0},"it":{"$":0},"jp":{"$":0},"kr":{"$":0},"lt":{"$":0},"lu":{"$":0},"lv":{"$":0},"mc":{"$":0},"me":{"$":0},"mk":{"$":0},"mt":{"$":0},"my":{"$":0},"net":{"$":0},"ng":{"$":0},"nl":{"$":0},"no":{"$":0},"nz":{"$":0},"paris":{"$":0},"pl":{"$":0},"pt":{"$":0},"q-a":{"$":0},"ro":{"$":0},"ru":{"$":0},"se":{"$":0},"si":{"$":0},"sk":{"$":0},"tr":{"$":0},"uk":{"$":0},"us":{"$":0}},"twmail":{"$":0},"fedorainfracloud":{"$":0},"fedorapeople":{"$":0},"fedoraproject":{"cloud":{"$":0},"os":{"app":{"$":0}},"stg":{"os":{"app":{"$":0}}}},"freedesktop":{"$":0},"hepforge":{"$":0},"in-dsl":{"$":0},"in-vpn":{"$":0},"js":{"$":0},"barsy":{"$":0},"mayfirst":{"$":0},"mozilla-iot":{"$":0},"bmoattachments":{"$":0},"dynserv":{"$":0},"now-dns":{"$":0},"cable-modem":{"$":0},"collegefan":{"$":0},"couchpotatofries":{"$":0},"mlbfan":{"$":0},"mysecuritycamera":{"$":0},"nflfan":{"$":0},"read-books":{"$":0},"ufcfan":{"$":0},"hopto":{"$":0},"myftp":{"$":0},"no-ip":{"$":0},"zapto":{"$":0},"httpbin":{"$":0},"pubtls":{"$":0},"my-firewall":{"$":0},"myfirewall":{"$":0},"spdns":{"$":0},"small-web":{"$":0},"dsmynas":{"$":0},"familyds":{"$":0},"edugit":{"$":0},"tuxfamily":{"$":0},"diskstation":{"$":0},"hk":{"$":0},"wmflabs":{"$":0},"toolforge":{"$":0},"wmcloud":{"$":0},"za":{"$":0}},"pa":{"$":0,"ac":{"$":0},"gob":{"$":0},"com":{"$":0},"org":{"$":0},"sld":{"$":0},"edu":{"$":0},"net":{"$":0},"ing":{"$":0},"abo":{"$":0},"med":{"$":0},"nom":{"$":0}},"pe":{"$":0,"edu":{"$":0},"gob":{"$":0},"nom":{"$":0},"mil":{"$":0},"org":{"$":0},"com":{"$":0},"net":{"$":0},"blogspot":{"$":0},"nym":{"$":0}},"pf":{"$":0,"com":{"$":0},"org":{"$":0},"edu":{"$":0}},"pg":{"*":{"$":0}},"ph":{"$":0,"com":{"$":0},"net":{"$":0},"org":{"$":0},"gov":{"$":0},"edu":{"$":0},"ngo":{"$":0},"mil":{"$":0},"i":{"$":0}},"pk":{"$":0,"com":{"$":0},"net":{"$":0},"edu":{"$":0},"org":{"$":0},"fam":{"$":0},"biz":{"$":0},"web":{"$":0},"gov":{"$":0},"gob":{"$":0},"gok":{"$":0},"gon":{"$":0},"gop":{"$":0},"gos":{"$":0},"info":{"$":0}},"pl":{"$":0,"com":{"$":0},"net":{"$":0},"org":{"$":0},"aid":{"$":0},"agro":{"$":0},"atm":{"$":0},"auto":{"$":0},"biz":{"$":0},"edu":{"$":0},"gmina":{"$":0},"gsm":{"$":0},"info":{"$":0},"mail":{"$":0},"miasta":{"$":0},"media":{"$":0},"mil":{"$":0},"nieruchomosci":{"$":0},"nom":{"$":0},"pc":{"$":0},"powiat":{"$":0},"priv":{"$":0},"realestate":{"$":0},"rel":{"$":0},"sex":{"$":0},"shop":{"$":0},"sklep":{"$":0},"sos":{"$":0},"szkola":{"$":0},"targi":{"$":0},"tm":{"$":0},"tourism":{"$":0},"travel":{"$":0},"turystyka":{"$":0},"gov":{"$":0,"ap":{"$":0},"ic":{"$":0},"is":{"$":0},"us":{"$":0},"kmpsp":{"$":0},"kppsp":{"$":0},"kwpsp":{"$":0},"psp":{"$":0},"wskr":{"$":0},"kwp":{"$":0},"mw":{"$":0},"ug":{"$":0},"um":{"$":0},"umig":{"$":0},"ugim":{"$":0},"upow":{"$":0},"uw":{"$":0},"starostwo":{"$":0},"pa":{"$":0},"po":{"$":0},"psse":{"$":0},"pup":{"$":0},"rzgw":{"$":0},"sa":{"$":0},"so":{"$":0},"sr":{"$":0},"wsa":{"$":0},"sko":{"$":0},"uzs":{"$":0},"wiih":{"$":0},"winb":{"$":0},"pinb":{"$":0},"wios":{"$":0},"witd":{"$":0},"wzmiuw":{"$":0},"piw":{"$":0},"wiw":{"$":0},"griw":{"$":0},"wif":{"$":0},"oum":{"$":0},"sdn":{"$":0},"zp":{"$":0},"uppo":{"$":0},"mup":{"$":0},"wuoz":{"$":0},"konsulat":{"$":0},"oirm":{"$":0}},"augustow":{"$":0},"babia-gora":{"$":0},"bedzin":{"$":0},"beskidy":{"$":0},"bialowieza":{"$":0},"bialystok":{"$":0},"bielawa":{"$":0},"bieszczady":{"$":0},"boleslawiec":{"$":0},"bydgoszcz":{"$":0},"bytom":{"$":0},"cieszyn":{"$":0},"czeladz":{"$":0},"czest":{"$":0},"dlugoleka":{"$":0},"elblag":{"$":0},"elk":{"$":0},"glogow":{"$":0},"gniezno":{"$":0},"gorlice":{"$":0},"grajewo":{"$":0},"ilawa":{"$":0},"jaworzno":{"$":0},"jelenia-gora":{"$":0},"jgora":{"$":0},"kalisz":{"$":0},"kazimierz-dolny":{"$":0},"karpacz":{"$":0},"kartuzy":{"$":0},"kaszuby":{"$":0},"katowice":{"$":0},"kepno":{"$":0},"ketrzyn":{"$":0},"klodzko":{"$":0},"kobierzyce":{"$":0},"kolobrzeg":{"$":0},"konin":{"$":0},"konskowola":{"$":0},"kutno":{"$":0},"lapy":{"$":0},"lebork":{"$":0},"legnica":{"$":0},"lezajsk":{"$":0},"limanowa":{"$":0},"lomza":{"$":0},"lowicz":{"$":0},"lubin":{"$":0},"lukow":{"$":0},"malbork":{"$":0},"malopolska":{"$":0},"mazowsze":{"$":0},"mazury":{"$":0},"mielec":{"$":0},"mielno":{"$":0},"mragowo":{"$":0},"naklo":{"$":0},"nowaruda":{"$":0},"nysa":{"$":0},"olawa":{"$":0},"olecko":{"$":0},"olkusz":{"$":0},"olsztyn":{"$":0},"opoczno":{"$":0},"opole":{"$":0},"ostroda":{"$":0},"ostroleka":{"$":0},"ostrowiec":{"$":0},"ostrowwlkp":{"$":0},"pila":{"$":0},"pisz":{"$":0},"podhale":{"$":0},"podlasie":{"$":0},"polkowice":{"$":0},"pomorze":{"$":0},"pomorskie":{"$":0},"prochowice":{"$":0},"pruszkow":{"$":0},"przeworsk":{"$":0},"pulawy":{"$":0},"radom":{"$":0},"rawa-maz":{"$":0},"rybnik":{"$":0},"rzeszow":{"$":0},"sanok":{"$":0},"sejny":{"$":0},"slask":{"$":0},"slupsk":{"$":0},"sosnowiec":{"$":0},"stalowa-wola":{"$":0},"skoczow":{"$":0},"starachowice":{"$":0},"stargard":{"$":0},"suwalki":{"$":0},"swidnica":{"$":0},"swiebodzin":{"$":0},"swinoujscie":{"$":0},"szczecin":{"$":0},"szczytno":{"$":0},"tarnobrzeg":{"$":0},"tgory":{"$":0},"turek":{"$":0},"tychy":{"$":0},"ustka":{"$":0},"walbrzych":{"$":0},"warmia":{"$":0},"warszawa":{"$":0},"waw":{"$":0},"wegrow":{"$":0},"wielun":{"$":0},"wlocl":{"$":0},"wloclawek":{"$":0},"wodzislaw":{"$":0},"wolomin":{"$":0},"wroclaw":{"$":0},"zachpomor":{"$":0},"zagan":{"$":0},"zarow":{"$":0},"zgora":{"$":0},"zgorzelec":{"$":0},"beep":{"$":0},"shoparena":{"$":0},"sdscloud":{"$":0},"unicloud":{"$":0},"krasnik":{"$":0},"leczna":{"$":0},"lubartow":{"$":0},"lublin":{"$":0},"poniatowa":{"$":0},"swidnik":{"$":0},"co":{"$":0},"art":{"$":0},"gliwice":{"$":0},"krakow":{"$":0},"poznan":{"$":0},"wroc":{"$":0},"zakopane":{"$":0},"gda":{"$":0},"gdansk":{"$":0},"gdynia":{"$":0},"med":{"$":0},"sopot":{"$":0}},"pm":{"$":0,"own":{"$":0}},"pn":{"$":0,"gov":{"$":0},"co":{"$":0},"org":{"$":0},"edu":{"$":0},"net":{"$":0}},"post":{"$":0},"pr":{"$":0,"com":{"$":0},"net":{"$":0},"org":{"$":0},"gov":{"$":0},"edu":{"$":0},"isla":{"$":0},"pro":{"$":0},"biz":{"$":0},"info":{"$":0},"name":{"$":0},"est":{"$":0},"prof":{"$":0},"ac":{"$":0}},"pro":{"$":0,"aaa":{"$":0},"aca":{"$":0},"acct":{"$":0},"avocat":{"$":0},"bar":{"$":0},"cpa":{"$":0},"eng":{"$":0},"jur":{"$":0},"law":{"$":0},"med":{"$":0},"recht":{"$":0},"cloudns":{"$":0},"dnstrace":{"bci":{"$":0}},"barsy":{"$":0}},"ps":{"$":0,"edu":{"$":0},"gov":{"$":0},"sec":{"$":0},"plo":{"$":0},"com":{"$":0},"org":{"$":0},"net":{"$":0}},"pt":{"$":0,"net":{"$":0},"gov":{"$":0},"org":{"$":0},"edu":{"$":0},"int":{"$":0},"publ":{"$":0},"com":{"$":0},"nome":{"$":0},"blogspot":{"$":0},"nym":{"$":0}},"pw":{"$":0,"co":{"$":0},"ne":{"$":0},"or":{"$":0},"ed":{"$":0},"go":{"$":0},"belau":{"$":0},"cloudns":{"$":0},"x443":{"$":0},"nom":{"$":0}},"py":{"$":0,"com":{"$":0},"coop":{"$":0},"edu":{"$":0},"gov":{"$":0},"mil":{"$":0},"net":{"$":0},"org":{"$":0}},"qa":{"$":0,"com":{"$":0},"edu":{"$":0},"gov":{"$":0},"mil":{"$":0},"name":{"$":0},"net":{"$":0},"org":{"$":0},"sch":{"$":0},"blogspot":{"$":0},"nom":{"$":0}},"re":{"$":0,"asso":{"$":0},"com":{"$":0},"nom":{"$":0},"blogspot":{"$":0}},"ro":{"$":0,"arts":{"$":0},"com":{"$":0},"firm":{"$":0},"info":{"$":0},"nom":{"$":0},"nt":{"$":0},"org":{"$":0},"rec":{"$":0},"store":{"$":0},"tm":{"$":0},"www":{"$":0},"co":{"$":0},"shop":{"$":0},"blogspot":{"$":0},"nym":{"$":0}},"rs":{"$":0,"ac":{"$":0},"co":{"$":0},"edu":{"$":0},"gov":{"$":0},"in":{"$":0},"org":{"$":0},"brendly":{"shop":{"$":0}},"blogspot":{"$":0},"ua":{"$":0},"nom":{"$":0},"ox":{"$":0}},"ru":{"$":0,"ac":{"$":0},"edu":{"$":0},"gov":{"$":0},"int":{"$":0},"mil":{"$":0},"test":{"$":0},"eurodir":{"$":0},"adygeya":{"$":0},"bashkiria":{"$":0},"bir":{"$":0},"cbg":{"$":0},"com":{"$":0},"dagestan":{"$":0},"grozny":{"$":0},"kalmykia":{"$":0},"kustanai":{"$":0},"marine":{"$":0},"mordovia":{"$":0},"msk":{"$":0},"mytis":{"$":0},"nalchik":{"$":0},"nov":{"$":0},"pyatigorsk":{"$":0},"spb":{"$":0},"vladikavkaz":{"$":0},"vladimir":{"$":0},"blogspot":{"$":0},"na4u":{"$":0},"mircloud":{"$":0},"regruhosting":{"jelastic":{"$":0}},"myjino":{"$":0,"hosting":{"*":{"$":0}},"landing":{"*":{"$":0}},"spectrum":{"*":{"$":0}},"vps":{"*":{"$":0}}},"cldmail":{"hb":{"$":0}},"mcdir":{"$":0,"vps":{"$":0}},"mcpre":{"$":0},"net":{"$":0},"org":{"$":0},"pp":{"$":0},"lk3":{"$":0},"ras":{"$":0}},"rw":{"$":0,"ac":{"$":0},"co":{"$":0},"coop":{"$":0},"gov":{"$":0},"mil":{"$":0},"net":{"$":0},"org":{"$":0}},"sa":{"$":0,"com":{"$":0},"net":{"$":0},"org":{"$":0},"gov":{"$":0},"med":{"$":0},"pub":{"$":0},"edu":{"$":0},"sch":{"$":0}},"sb":{"$":0,"com":{"$":0},"edu":{"$":0},"gov":{"$":0},"net":{"$":0},"org":{"$":0}},"sc":{"$":0,"com":{"$":0},"gov":{"$":0},"net":{"$":0},"org":{"$":0},"edu":{"$":0}},"sd":{"$":0,"com":{"$":0},"net":{"$":0},"org":{"$":0},"edu":{"$":0},"med":{"$":0},"tv":{"$":0},"gov":{"$":0},"info":{"$":0}},"se":{"$":0,"a":{"$":0},"ac":{"$":0},"b":{"$":0},"bd":{"$":0},"brand":{"$":0},"c":{"$":0},"d":{"$":0},"e":{"$":0},"f":{"$":0},"fh":{"$":0},"fhsk":{"$":0},"fhv":{"$":0},"g":{"$":0},"h":{"$":0},"i":{"$":0},"k":{"$":0},"komforb":{"$":0},"kommunalforbund":{"$":0},"komvux":{"$":0},"l":{"$":0},"lanbib":{"$":0},"m":{"$":0},"n":{"$":0},"naturbruksgymn":{"$":0},"o":{"$":0},"org":{"$":0},"p":{"$":0},"parti":{"$":0},"pp":{"$":0},"press":{"$":0},"r":{"$":0},"s":{"$":0},"t":{"$":0},"tm":{"$":0},"u":{"$":0},"w":{"$":0},"x":{"$":0},"y":{"$":0},"z":{"$":0},"com":{"$":0},"blogspot":{"$":0},"conf":{"$":0},"iopsys":{"$":0}},"sg":{"$":0,"com":{"$":0},"net":{"$":0},"org":{"$":0},"gov":{"$":0},"edu":{"$":0},"per":{"$":0},"blogspot":{"$":0},"enscaled":{"$":0}},"sh":{"$":0,"com":{"$":0},"net":{"$":0},"gov":{"$":0},"org":{"$":0},"mil":{"$":0},"bip":{"$":0},"hashbang":{"$":0},"platform":{"bc":{"$":0},"ent":{"$":0},"eu":{"$":0},"us":{"$":0}},"now":{"$":0},"vxl":{"$":0},"wedeploy":{"$":0}},"si":{"$":0,"gitapp":{"$":0},"gitpage":{"$":0},"blogspot":{"$":0},"nom":{"$":0}},"sj":{"$":0},"sk":{"$":0,"blogspot":{"$":0},"nym":{"$":0}},"sl":{"$":0,"com":{"$":0},"net":{"$":0},"edu":{"$":0},"gov":{"$":0},"org":{"$":0}},"sm":{"$":0},"sn":{"$":0,"art":{"$":0},"com":{"$":0},"edu":{"$":0},"gouv":{"$":0},"org":{"$":0},"perso":{"$":0},"univ":{"$":0},"blogspot":{"$":0}},"so":{"$":0,"com":{"$":0},"edu":{"$":0},"gov":{"$":0},"me":{"$":0},"net":{"$":0},"org":{"$":0},"sch":{"$":0}},"sr":{"$":0},"ss":{"$":0,"biz":{"$":0},"com":{"$":0},"edu":{"$":0},"gov":{"$":0},"me":{"$":0},"net":{"$":0},"org":{"$":0},"sch":{"$":0}},"st":{"$":0,"co":{"$":0},"com":{"$":0},"consulado":{"$":0},"edu":{"$":0},"embaixada":{"$":0},"mil":{"$":0},"net":{"$":0},"org":{"$":0},"principe":{"$":0},"saotome":{"$":0},"store":{"$":0},"nom":{"$":0},"noho":{"$":0}},"su":{"$":0,"abkhazia":{"$":0},"adygeya":{"$":0},"aktyubinsk":{"$":0},"arkhangelsk":{"$":0},"armenia":{"$":0},"ashgabad":{"$":0},"azerbaijan":{"$":0},"balashov":{"$":0},"bashkiria":{"$":0},"bryansk":{"$":0},"bukhara":{"$":0},"chimkent":{"$":0},"dagestan":{"$":0},"east-kazakhstan":{"$":0},"exnet":{"$":0},"georgia":{"$":0},"grozny":{"$":0},"ivanovo":{"$":0},"jambyl":{"$":0},"kalmykia":{"$":0},"kaluga":{"$":0},"karacol":{"$":0},"karaganda":{"$":0},"karelia":{"$":0},"khakassia":{"$":0},"krasnodar":{"$":0},"kurgan":{"$":0},"kustanai":{"$":0},"lenug":{"$":0},"mangyshlak":{"$":0},"mordovia":{"$":0},"msk":{"$":0},"murmansk":{"$":0},"nalchik":{"$":0},"navoi":{"$":0},"north-kazakhstan":{"$":0},"nov":{"$":0},"obninsk":{"$":0},"penza":{"$":0},"pokrovsk":{"$":0},"sochi":{"$":0},"spb":{"$":0},"tashkent":{"$":0},"termez":{"$":0},"togliatti":{"$":0},"troitsk":{"$":0},"tselinograd":{"$":0},"tula":{"$":0},"tuva":{"$":0},"vladikavkaz":{"$":0},"vladimir":{"$":0},"vologda":{"$":0},"nym":{"$":0}},"sv":{"$":0,"com":{"$":0},"edu":{"$":0},"gob":{"$":0},"org":{"$":0},"red":{"$":0}},"sx":{"$":0,"gov":{"$":0},"nym":{"$":0}},"sy":{"$":0,"edu":{"$":0},"gov":{"$":0},"net":{"$":0},"mil":{"$":0},"com":{"$":0},"org":{"$":0}},"sz":{"$":0,"co":{"$":0},"ac":{"$":0},"org":{"$":0}},"tc":{"$":0,"ch":{"$":0},"me":{"$":0},"we":{"$":0}},"td":{"$":0,"blogspot":{"$":0}},"tel":{"$":0},"tf":{"$":0},"tg":{"$":0},"th":{"$":0,"ac":{"$":0},"co":{"$":0},"go":{"$":0},"in":{"$":0},"mi":{"$":0},"net":{"$":0},"or":{"$":0},"online":{"$":0},"shop":{"$":0}},"tj":{"$":0,"ac":{"$":0},"biz":{"$":0},"co":{"$":0},"com":{"$":0},"edu":{"$":0},"go":{"$":0},"gov":{"$":0},"int":{"$":0},"mil":{"$":0},"name":{"$":0},"net":{"$":0},"nic":{"$":0},"org":{"$":0},"test":{"$":0},"web":{"$":0},"nom":{"$":0}},"tk":{"$":0},"tl":{"$":0,"gov":{"$":0}},"tm":{"$":0,"com":{"$":0},"co":{"$":0},"org":{"$":0},"net":{"$":0},"nom":{"$":0},"gov":{"$":0},"mil":{"$":0},"edu":{"$":0}},"tn":{"$":0,"com":{"$":0},"ens":{"$":0},"fin":{"$":0},"gov":{"$":0},"ind":{"$":0},"intl":{"$":0},"nat":{"$":0},"net":{"$":0},"org":{"$":0},"info":{"$":0},"perso":{"$":0},"tourism":{"$":0},"edunet":{"$":0},"rnrt":{"$":0},"rns":{"$":0},"rnu":{"$":0},"mincom":{"$":0},"agrinet":{"$":0},"defense":{"$":0},"turen":{"$":0},"orangecloud":{"$":0}},"to":{"611":{"$":0},"$":0,"com":{"$":0},"gov":{"$":0},"net":{"$":0},"org":{"$":0},"edu":{"$":0},"mil":{"$":0},"oya":{"$":0},"rdv":{"$":0},"vpnplus":{"$":0},"quickconnect":{"direct":{"$":0}},"nyan":{"$":0}},"tr":{"$":0,"av":{"$":0},"bbs":{"$":0},"bel":{"$":0},"biz":{"$":0},"com":{"$":0,"blogspot":{"$":0}},"dr":{"$":0},"edu":{"$":0},"gen":{"$":0},"gov":{"$":0},"info":{"$":0},"mil":{"$":0},"k12":{"$":0},"kep":{"$":0},"name":{"$":0},"net":{"$":0},"org":{"$":0},"pol":{"$":0},"tel":{"$":0},"tsk":{"$":0},"tv":{"$":0},"web":{"$":0},"nc":{"$":0,"gov":{"$":0}}},"tt":{"$":0,"co":{"$":0},"com":{"$":0},"org":{"$":0},"net":{"$":0},"biz":{"$":0},"info":{"$":0},"pro":{"$":0},"int":{"$":0},"coop":{"$":0},"jobs":{"$":0},"mobi":{"$":0},"travel":{"$":0},"museum":{"$":0},"aero":{"$":0},"name":{"$":0},"gov":{"$":0},"edu":{"$":0}},"tv":{"$":0,"dyndns":{"$":0},"better-than":{"$":0},"on-the-web":{"$":0},"worse-than":{"$":0}},"tw":{"$":0,"edu":{"$":0},"gov":{"$":0},"mil":{"$":0},"com":{"$":0,"mymailer":{"$":0}},"net":{"$":0},"org":{"$":0},"idv":{"$":0},"game":{"$":0},"ebiz":{"$":0},"club":{"$":0},"xn--zf0ao64a":{"$":0},"xn--uc0atv":{"$":0},"xn--czrw28b":{"$":0},"url":{"$":0},"blogspot":{"$":0},"nym":{"$":0}},"tz":{"$":0,"ac":{"$":0},"co":{"$":0},"go":{"$":0},"hotel":{"$":0},"info":{"$":0},"me":{"$":0},"mil":{"$":0},"mobi":{"$":0},"ne":{"$":0},"or":{"$":0},"sc":{"$":0},"tv":{"$":0}},"ua":{"$":0,"com":{"$":0},"edu":{"$":0},"gov":{"$":0},"in":{"$":0},"net":{"$":0},"org":{"$":0},"cherkassy":{"$":0},"cherkasy":{"$":0},"chernigov":{"$":0},"chernihiv":{"$":0},"chernivtsi":{"$":0},"chernovtsy":{"$":0},"ck":{"$":0},"cn":{"$":0},"cr":{"$":0},"crimea":{"$":0},"cv":{"$":0},"dn":{"$":0},"dnepropetrovsk":{"$":0},"dnipropetrovsk":{"$":0},"donetsk":{"$":0},"dp":{"$":0},"if":{"$":0},"ivano-frankivsk":{"$":0},"kh":{"$":0},"kharkiv":{"$":0},"kharkov":{"$":0},"kherson":{"$":0},"khmelnitskiy":{"$":0},"khmelnytskyi":{"$":0},"kiev":{"$":0},"kirovograd":{"$":0},"km":{"$":0},"kr":{"$":0},"krym":{"$":0},"ks":{"$":0},"kv":{"$":0},"kyiv":{"$":0},"lg":{"$":0},"lt":{"$":0},"lugansk":{"$":0},"lutsk":{"$":0},"lv":{"$":0},"lviv":{"$":0},"mk":{"$":0},"mykolaiv":{"$":0},"nikolaev":{"$":0},"od":{"$":0},"odesa":{"$":0},"odessa":{"$":0},"pl":{"$":0},"poltava":{"$":0},"rivne":{"$":0},"rovno":{"$":0},"rv":{"$":0},"sb":{"$":0},"sebastopol":{"$":0},"sevastopol":{"$":0},"sm":{"$":0},"sumy":{"$":0},"te":{"$":0},"ternopil":{"$":0},"uz":{"$":0},"uzhgorod":{"$":0},"vinnica":{"$":0},"vinnytsia":{"$":0},"vn":{"$":0},"volyn":{"$":0},"yalta":{"$":0},"zaporizhzhe":{"$":0},"zaporizhzhia":{"$":0},"zhitomir":{"$":0},"zhytomyr":{"$":0},"zp":{"$":0},"zt":{"$":0},"cc":{"$":0},"inf":{"$":0},"ltd":{"$":0},"cx":{"$":0},"biz":{"$":0},"co":{"$":0},"pp":{"$":0},"v":{"$":0}},"ug":{"$":0,"co":{"$":0},"or":{"$":0},"ac":{"$":0},"sc":{"$":0},"go":{"$":0},"ne":{"$":0},"com":{"$":0},"org":{"$":0},"blogspot":{"$":0},"nom":{"$":0}},"uk":{"$":0,"ac":{"$":0},"co":{"$":0,"bytemark":{"dh":{"$":0},"vm":{"$":0}},"blogspot":{"$":0},"layershift":{"j":{"$":0}},"barsy":{"$":0},"barsyonline":{"$":0},"retrosnub":{"cust":{"$":0}},"nh-serv":{"$":0},"no-ip":{"$":0},"wellbeingzone":{"$":0},"adimo":{"$":0},"gwiddle":{"$":0}},"gov":{"$":0,"service":{"$":0},"homeoffice":{"$":0}},"ltd":{"$":0},"me":{"$":0},"net":{"$":0},"nhs":{"$":0},"org":{"$":0,"glug":{"$":0},"lug":{"$":0},"lugs":{"$":0}},"plc":{"$":0},"police":{"$":0},"sch":{"*":{"$":0}},"conn":{"$":0},"copro":{"$":0},"hosp":{"$":0},"pymnt":{"$":0},"barsy":{"$":0}},"us":{"$":0,"dni":{"$":0},"fed":{"$":0},"isa":{"$":0},"kids":{"$":0},"nsn":{"$":0},"ak":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"al":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"ar":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"as":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"az":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"ca":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"co":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"ct":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"dc":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"de":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"fl":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"ga":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"gu":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"hi":{"$":0,"cc":{"$":0},"lib":{"$":0}},"ia":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"id":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"il":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"in":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"ks":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"ky":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"la":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"ma":{"$":0,"k12":{"$":0,"pvt":{"$":0},"chtr":{"$":0},"paroch":{"$":0}},"cc":{"$":0},"lib":{"$":0}},"md":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"me":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"mi":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0},"ann-arbor":{"$":0},"cog":{"$":0},"dst":{"$":0},"eaton":{"$":0},"gen":{"$":0},"mus":{"$":0},"tec":{"$":0},"washtenaw":{"$":0}},"mn":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"mo":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"ms":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"mt":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"nc":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"nd":{"$":0,"cc":{"$":0},"lib":{"$":0}},"ne":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"nh":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"nj":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"nm":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"nv":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"ny":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"oh":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"ok":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"or":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"pa":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"pr":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"ri":{"$":0,"cc":{"$":0},"lib":{"$":0}},"sc":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"sd":{"$":0,"cc":{"$":0},"lib":{"$":0}},"tn":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"tx":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"ut":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"vi":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"vt":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"va":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"wa":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"wi":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"wv":{"$":0,"cc":{"$":0}},"wy":{"$":0,"k12":{"$":0},"cc":{"$":0},"lib":{"$":0}},"graphox":{"$":0},"cloudns":{"$":0},"drud":{"$":0},"is-by":{"$":0},"land-4-sale":{"$":0},"stuff-4-sale":{"$":0},"enscaled":{"phx":{"$":0}},"mircloud":{"$":0},"freeddns":{"$":0},"golffan":{"$":0},"noip":{"$":0},"pointto":{"$":0},"platterp":{"$":0}},"uy":{"$":0,"com":{"$":0,"blogspot":{"$":0}},"edu":{"$":0},"gub":{"$":0},"mil":{"$":0},"net":{"$":0},"org":{"$":0},"nom":{"$":0}},"uz":{"$":0,"co":{"$":0},"com":{"$":0},"net":{"$":0},"org":{"$":0}},"va":{"$":0},"vc":{"$":0,"com":{"$":0},"net":{"$":0},"org":{"$":0},"gov":{"$":0},"mil":{"$":0},"edu":{"$":0},"gv":{"$":0,"d":{"$":0}},"0e":{"$":0},"nom":{"$":0}},"ve":{"$":0,"arts":{"$":0},"co":{"$":0},"com":{"$":0},"e12":{"$":0},"edu":{"$":0},"firm":{"$":0},"gob":{"$":0},"gov":{"$":0},"info":{"$":0},"int":{"$":0},"mil":{"$":0},"net":{"$":0},"org":{"$":0},"rec":{"$":0},"store":{"$":0},"tec":{"$":0},"web":{"$":0}},"vg":{"$":0,"nom":{"$":0},"at":{"$":0}},"vi":{"$":0,"co":{"$":0},"com":{"$":0},"k12":{"$":0},"net":{"$":0},"org":{"$":0}},"vn":{"$":0,"com":{"$":0},"net":{"$":0},"org":{"$":0},"edu":{"$":0},"gov":{"$":0},"int":{"$":0},"ac":{"$":0},"biz":{"$":0},"info":{"$":0},"name":{"$":0},"pro":{"$":0},"health":{"$":0},"blogspot":{"$":0}},"vu":{"$":0,"com":{"$":0},"edu":{"$":0},"net":{"$":0},"org":{"$":0},"cn":{"$":0},"blog":{"$":0},"dev":{"$":0},"me":{"$":0}},"wf":{"$":0},"ws":{"$":0,"com":{"$":0},"net":{"$":0},"org":{"$":0},"gov":{"$":0},"edu":{"$":0},"advisor":{"*":{"$":0}},"cloud66":{"$":0},"dyndns":{"$":0},"mypets":{"$":0}},"yt":{"$":0,"org":{"$":0}},"xn--mgbaam7a8h":{"$":0},"xn--y9a3aq":{"$":0},"xn--54b7fta0cc":{"$":0},"xn--90ae":{"$":0},"xn--mgbcpq6gpa1a":{"$":0},"xn--90ais":{"$":0},"xn--fiqs8s":{"$":0},"xn--fiqz9s":{"$":0},"xn--lgbbat1ad8j":{"$":0},"xn--wgbh1c":{"$":0},"xn--e1a4c":{"$":0},"xn--qxa6a":{"$":0},"xn--mgbah1a3hjkrd":{"$":0},"xn--node":{"$":0},"xn--qxam":{"$":0},"xn--j6w193g":{"$":0,"xn--55qx5d":{"$":0},"xn--wcvs22d":{"$":0},"xn--mxtq1m":{"$":0},"xn--gmqw5a":{"$":0},"xn--od0alg":{"$":0},"xn--uc0atv":{"$":0}},"xn--2scrj9c":{"$":0},"xn--3hcrj9c":{"$":0},"xn--45br5cyl":{"$":0},"xn--h2breg3eve":{"$":0},"xn--h2brj9c8c":{"$":0},"xn--mgbgu82a":{"$":0},"xn--rvc1e0am3e":{"$":0},"xn--h2brj9c":{"$":0},"xn--mgbbh1a":{"$":0},"xn--mgbbh1a71e":{"$":0},"xn--fpcrj9c3d":{"$":0},"xn--gecrj9c":{"$":0},"xn--s9brj9c":{"$":0},"xn--45brj9c":{"$":0},"xn--xkc2dl3a5ee0h":{"$":0},"xn--mgba3a4f16a":{"$":0},"xn--mgba3a4fra":{"$":0},"xn--mgbtx2b":{"$":0},"xn--mgbayh7gpa":{"$":0},"xn--3e0b707e":{"$":0},"xn--80ao21a":{"$":0},"xn--q7ce6a":{"$":0},"xn--fzc2c9e2c":{"$":0},"xn--xkc2al3hye2a":{"$":0},"xn--mgbc0a9azcg":{"$":0},"xn--d1alf":{"$":0},"xn--l1acc":{"$":0},"xn--mix891f":{"$":0},"xn--mix082f":{"$":0},"xn--mgbx4cd0ab":{"$":0},"xn--mgb9awbf":{"$":0},"xn--mgbai9azgqp6j":{"$":0},"xn--mgbai9a5eva00b":{"$":0},"xn--ygbi2ammx":{"$":0},"xn--90a3ac":{"$":0,"xn--o1ac":{"$":0},"xn--c1avg":{"$":0},"xn--90azh":{"$":0},"xn--d1at":{"$":0},"xn--o1ach":{"$":0},"xn--80au":{"$":0}},"xn--p1ai":{"$":0},"xn--wgbl6a":{"$":0},"xn--mgberp4a5d4ar":{"$":0},"xn--mgberp4a5d4a87g":{"$":0},"xn--mgbqly7c0a67fbc":{"$":0},"xn--mgbqly7cvafr":{"$":0},"xn--mgbpl2fh":{"$":0},"xn--yfro4i67o":{"$":0},"xn--clchc0ea0b2g2a9gcd":{"$":0},"xn--ogbpf8fl":{"$":0},"xn--mgbtf8fl":{"$":0},"xn--o3cw4h":{"$":0,"xn--12c1fe0br":{"$":0},"xn--12co0c3b4eva":{"$":0},"xn--h3cuzk1di":{"$":0},"xn--o3cyx2a":{"$":0},"xn--m3ch0j3a":{"$":0},"xn--12cfi8ixb8l":{"$":0}},"xn--pgbs0dh":{"$":0},"xn--kpry57d":{"$":0},"xn--kprw13d":{"$":0},"xn--nnx388a":{"$":0},"xn--j1amh":{"$":0},"xn--mgb2ddes":{"$":0},"xxx":{"$":0},"ye":{"$":0,"com":{"$":0},"edu":{"$":0},"gov":{"$":0},"net":{"$":0},"mil":{"$":0},"org":{"$":0}},"za":{"ac":{"$":0},"agric":{"$":0},"alt":{"$":0},"co":{"$":0,"blogspot":{"$":0}},"edu":{"$":0},"gov":{"$":0},"grondar":{"$":0},"law":{"$":0},"mil":{"$":0},"net":{"$":0},"ngo":{"$":0},"nic":{"$":0},"nis":{"$":0},"nom":{"$":0},"org":{"$":0},"school":{"$":0},"tm":{"$":0},"web":{"$":0}},"zm":{"$":0,"ac":{"$":0},"biz":{"$":0},"co":{"$":0},"com":{"$":0},"edu":{"$":0},"gov":{"$":0},"info":{"$":0},"mil":{"$":0},"net":{"$":0},"org":{"$":0},"sch":{"$":0}},"zw":{"$":0,"ac":{"$":0},"co":{"$":0},"gov":{"$":0},"mil":{"$":0},"org":{"$":0}},"aaa":{"$":0},"aarp":{"$":0},"abarth":{"$":0},"abb":{"$":0},"abbott":{"$":0},"abbvie":{"$":0},"abc":{"$":0},"able":{"$":0},"abogado":{"$":0},"abudhabi":{"$":0},"academy":{"$":0,"official":{"$":0}},"accenture":{"$":0},"accountant":{"$":0},"accountants":{"$":0},"aco":{"$":0},"actor":{"$":0},"adac":{"$":0},"ads":{"$":0},"adult":{"$":0},"aeg":{"$":0},"aetna":{"$":0},"afamilycompany":{"$":0},"afl":{"$":0},"africa":{"$":0},"agakhan":{"$":0},"agency":{"$":0},"aig":{"$":0},"airbus":{"$":0},"airforce":{"$":0},"airtel":{"$":0},"akdn":{"$":0},"alfaromeo":{"$":0},"alibaba":{"$":0},"alipay":{"$":0},"allfinanz":{"$":0},"allstate":{"$":0},"ally":{"$":0},"alsace":{"$":0},"alstom":{"$":0},"amazon":{"$":0},"americanexpress":{"$":0},"americanfamily":{"$":0},"amex":{"$":0},"amfam":{"$":0},"amica":{"$":0},"amsterdam":{"$":0},"analytics":{"$":0},"android":{"$":0},"anquan":{"$":0},"anz":{"$":0},"aol":{"$":0},"apartments":{"$":0},"app":{"$":0,"wnext":{"$":0},"platform0":{"$":0},"ondigitalocean":{"$":0},"edgecompute":{"$":0},"fireweb":{"$":0},"framer":{"$":0},"run":{"$":0,"a":{"$":0}},"web":{"$":0},"hasura":{"$":0},"loginline":{"$":0},"netlify":{"$":0},"developer":{"*":{"$":0}},"noop":{"$":0},"northflank":{"*":{"$":0}},"telebit":{"$":0},"vercel":{"$":0},"bookonline":{"$":0}},"apple":{"$":0},"aquarelle":{"$":0},"arab":{"$":0},"aramco":{"$":0},"archi":{"$":0},"army":{"$":0},"art":{"$":0},"arte":{"$":0},"asda":{"$":0},"associates":{"$":0},"athleta":{"$":0},"attorney":{"$":0},"auction":{"$":0},"audi":{"$":0},"audible":{"$":0},"audio":{"$":0},"auspost":{"$":0},"author":{"$":0},"auto":{"$":0},"autos":{"$":0},"avianca":{"$":0},"aws":{"$":0},"axa":{"$":0},"azure":{"$":0},"baby":{"$":0},"baidu":{"$":0},"banamex":{"$":0},"bananarepublic":{"$":0},"band":{"$":0},"bank":{"$":0},"bar":{"$":0},"barcelona":{"$":0},"barclaycard":{"$":0},"barclays":{"$":0},"barefoot":{"$":0},"bargains":{"$":0},"baseball":{"$":0},"basketball":{"$":0,"aus":{"$":0},"nz":{"$":0}},"bauhaus":{"$":0},"bayern":{"$":0},"bbc":{"$":0},"bbt":{"$":0},"bbva":{"$":0},"bcg":{"$":0},"bcn":{"$":0},"beats":{"$":0},"beauty":{"$":0},"beer":{"$":0},"bentley":{"$":0},"berlin":{"$":0},"best":{"$":0},"bestbuy":{"$":0},"bet":{"$":0},"bharti":{"$":0},"bible":{"$":0},"bid":{"$":0},"bike":{"$":0},"bing":{"$":0},"bingo":{"$":0},"bio":{"$":0},"black":{"$":0},"blackfriday":{"$":0},"blockbuster":{"$":0},"blog":{"$":0},"bloomberg":{"$":0},"blue":{"$":0},"bms":{"$":0},"bmw":{"$":0},"bnpparibas":{"$":0},"boats":{"$":0},"boehringer":{"$":0},"bofa":{"$":0},"bom":{"$":0},"bond":{"$":0},"boo":{"$":0},"book":{"$":0},"booking":{"$":0},"bosch":{"$":0},"bostik":{"$":0},"boston":{"$":0},"bot":{"$":0},"boutique":{"$":0},"box":{"$":0},"bradesco":{"$":0},"bridgestone":{"$":0},"broadway":{"$":0},"broker":{"$":0},"brother":{"$":0},"brussels":{"$":0},"budapest":{"$":0},"bugatti":{"$":0},"build":{"$":0},"builders":{"$":0,"cloudsite":{"$":0}},"business":{"$":0,"co":{"$":0}},"buy":{"$":0},"buzz":{"$":0},"bzh":{"$":0},"cab":{"$":0},"cafe":{"$":0},"cal":{"$":0},"call":{"$":0},"calvinklein":{"$":0},"cam":{"$":0},"camera":{"$":0},"camp":{"$":0},"cancerresearch":{"$":0},"canon":{"$":0},"capetown":{"$":0},"capital":{"$":0},"capitalone":{"$":0},"car":{"$":0},"caravan":{"$":0},"cards":{"$":0},"care":{"$":0},"career":{"$":0},"careers":{"$":0},"cars":{"$":0},"casa":{"$":0,"nabu":{"ui":{"$":0}}},"case":{"$":0},"cash":{"$":0},"casino":{"$":0},"catering":{"$":0},"catholic":{"$":0},"cba":{"$":0},"cbn":{"$":0},"cbre":{"$":0},"cbs":{"$":0},"center":{"$":0},"ceo":{"$":0},"cern":{"$":0},"cfa":{"$":0},"cfd":{"$":0},"chanel":{"$":0},"channel":{"$":0},"charity":{"$":0},"chase":{"$":0},"chat":{"$":0},"cheap":{"$":0},"chintai":{"$":0},"christmas":{"$":0},"chrome":{"$":0},"church":{"$":0},"cipriani":{"$":0},"circle":{"$":0},"cisco":{"$":0},"citadel":{"$":0},"citi":{"$":0},"citic":{"$":0},"city":{"$":0},"cityeats":{"$":0},"claims":{"$":0},"cleaning":{"$":0},"click":{"$":0},"clinic":{"$":0},"clinique":{"$":0},"clothing":{"$":0},"cloud":{"$":0,"banzai":{"*":{"$":0}},"statics":{"*":{"$":0}},"axarnet":{"es-1":{"$":0}},"diadem":{"$":0},"jelastic":{"vip":{"$":0}},"jele":{"$":0},"jenv-aruba":{"aruba":{"eur":{"it1":{"$":0}}},"it1":{"$":0}},"keliweb":{"$":0,"cs":{"$":0}},"oxa":{"$":0,"tn":{"$":0},"uk":{"$":0}},"primetel":{"$":0,"uk":{"$":0}},"reclaim":{"ca":{"$":0},"uk":{"$":0},"us":{"$":0}},"trendhosting":{"ch":{"$":0},"de":{"$":0}},"jotelulu":{"$":0},"kuleuven":{"$":0},"linkyard":{"$":0},"magentosite":{"*":{"$":0}},"perspecta":{"$":0},"vapor":{"$":0},"on-rancher":{"*":{"$":0}},"sensiosite":{"*":{"$":0}},"trafficplex":{"$":0},"urown":{"$":0},"voorloper":{"$":0}},"club":{"$":0,"cloudns":{"$":0},"jele":{"$":0},"barsy":{"$":0},"pony":{"$":0}},"clubmed":{"$":0},"coach":{"$":0},"codes":{"$":0,"owo":{"*":{"$":0}}},"coffee":{"$":0},"college":{"$":0},"cologne":{"$":0},"comcast":{"$":0},"commbank":{"$":0},"community":{"$":0,"ravendb":{"$":0},"myforum":{"$":0}},"company":{"$":0},"compare":{"$":0},"computer":{"$":0},"comsec":{"$":0},"condos":{"$":0},"construction":{"$":0},"consulting":{"$":0},"contact":{"$":0},"contractors":{"$":0},"cooking":{"$":0},"cookingchannel":{"$":0},"cool":{"$":0,"de":{"$":0}},"corsica":{"$":0},"country":{"$":0},"coupon":{"$":0},"coupons":{"$":0},"courses":{"$":0},"cpa":{"$":0},"credit":{"$":0},"creditcard":{"$":0},"creditunion":{"$":0},"cricket":{"$":0},"crown":{"$":0},"crs":{"$":0},"cruise":{"$":0},"cruises":{"$":0},"csc":{"$":0},"cuisinella":{"$":0},"cymru":{"$":0},"cyou":{"$":0},"dabur":{"$":0},"dad":{"$":0},"dance":{"$":0},"data":{"$":0},"date":{"$":0},"dating":{"$":0},"datsun":{"$":0},"day":{"$":0},"dclk":{"$":0},"dds":{"$":0},"deal":{"$":0},"dealer":{"$":0},"deals":{"$":0},"degree":{"$":0},"delivery":{"$":0},"dell":{"$":0},"deloitte":{"$":0},"delta":{"$":0},"democrat":{"$":0},"dental":{"$":0},"dentist":{"$":0},"desi":{"$":0},"design":{"$":0,"bss":{"$":0}},"dev":{"$":0,"lcl":{"*":{"$":0}},"lclstage":{"*":{"$":0}},"stg":{"*":{"$":0}},"stgstage":{"*":{"$":0}},"pages":{"$":0},"workers":{"$":0},"curv":{"$":0},"deno":{"$":0},"deno-staging":{"$":0},"fly":{"$":0},"githubpreview":{"$":0},"gateway":{"*":{"$":0}},"iserv":{"$":0},"loginline":{"$":0},"mediatech":{"$":0},"platter-app":{"$":0},"shiftcrypto":{"$":0},"vercel":{"$":0},"webhare":{"*":{"$":0}}},"dhl":{"$":0},"diamonds":{"$":0},"diet":{"$":0},"digital":{"$":0,"cloudapps":{"$":0,"london":{"$":0}}},"direct":{"$":0},"directory":{"$":0},"discount":{"$":0},"discover":{"$":0},"dish":{"$":0},"diy":{"$":0},"dnp":{"$":0},"docs":{"$":0},"doctor":{"$":0},"dog":{"$":0},"domains":{"$":0},"dot":{"$":0},"download":{"$":0},"drive":{"$":0},"dtv":{"$":0},"dubai":{"$":0},"duck":{"$":0},"dunlop":{"$":0},"dupont":{"$":0},"durban":{"$":0},"dvag":{"$":0},"dvr":{"$":0},"earth":{"$":0,"dapps":{"*":{"$":0},"bzz":{"*":{"$":0}}}},"eat":{"$":0},"eco":{"$":0},"edeka":{"$":0},"education":{"$":0,"co":{"$":0}},"email":{"$":0},"emerck":{"$":0},"energy":{"$":0},"engineer":{"$":0},"engineering":{"$":0},"enterprises":{"$":0},"epson":{"$":0},"equipment":{"$":0},"ericsson":{"$":0},"erni":{"$":0},"esq":{"$":0},"estate":{"$":0,"compute":{"*":{"$":0}}},"etisalat":{"$":0},"eurovision":{"$":0},"eus":{"$":0,"party":{"user":{"$":0}}},"events":{"$":0,"co":{"$":0}},"exchange":{"$":0},"expert":{"$":0},"exposed":{"$":0},"express":{"$":0},"extraspace":{"$":0},"fage":{"$":0},"fail":{"$":0},"fairwinds":{"$":0},"faith":{"$":0,"ybo":{"$":0}},"family":{"$":0},"fan":{"$":0},"fans":{"$":0},"farm":{"$":0,"storj":{"$":0}},"farmers":{"$":0},"fashion":{"$":0,"of":{"$":0}},"fast":{"$":0},"fedex":{"$":0},"feedback":{"$":0},"ferrari":{"$":0},"ferrero":{"$":0},"fiat":{"$":0},"fidelity":{"$":0},"fido":{"$":0},"film":{"$":0},"final":{"$":0},"finance":{"$":0},"financial":{"$":0,"co":{"$":0}},"fire":{"$":0},"firestone":{"$":0},"firmdale":{"$":0},"fish":{"$":0},"fishing":{"$":0},"fit":{"$":0},"fitness":{"$":0},"flickr":{"$":0},"flights":{"$":0},"flir":{"$":0},"florist":{"$":0},"flowers":{"$":0},"fly":{"$":0},"foo":{"$":0},"food":{"$":0},"foodnetwork":{"$":0},"football":{"$":0},"ford":{"$":0},"forex":{"$":0},"forsale":{"$":0},"forum":{"$":0},"foundation":{"$":0},"fox":{"$":0},"free":{"$":0},"fresenius":{"$":0},"frl":{"$":0},"frogans":{"$":0},"frontdoor":{"$":0},"frontier":{"$":0},"ftr":{"$":0},"fujitsu":{"$":0},"fun":{"$":0},"fund":{"$":0},"furniture":{"$":0},"futbol":{"$":0},"fyi":{"$":0},"gal":{"$":0},"gallery":{"$":0},"gallo":{"$":0},"gallup":{"$":0},"game":{"$":0},"games":{"$":0},"gap":{"$":0},"garden":{"$":0},"gay":{"$":0},"gbiz":{"$":0},"gdn":{"$":0,"cnpy":{"$":0}},"gea":{"$":0},"gent":{"$":0},"genting":{"$":0},"george":{"$":0},"ggee":{"$":0},"gift":{"$":0},"gifts":{"$":0},"gives":{"$":0},"giving":{"$":0},"glade":{"$":0},"glass":{"$":0},"gle":{"$":0},"global":{"$":0},"globo":{"$":0},"gmail":{"$":0},"gmbh":{"$":0},"gmo":{"$":0},"gmx":{"$":0},"godaddy":{"$":0},"gold":{"$":0},"goldpoint":{"$":0},"golf":{"$":0},"goo":{"$":0},"goodyear":{"$":0},"goog":{"$":0,"cloud":{"$":0},"translate":{"$":0}},"google":{"$":0},"gop":{"$":0},"got":{"$":0},"grainger":{"$":0},"graphics":{"$":0},"gratis":{"$":0},"green":{"$":0},"gripe":{"$":0},"grocery":{"$":0},"group":{"$":0,"discourse":{"$":0}},"guardian":{"$":0},"gucci":{"$":0},"guge":{"$":0},"guide":{"$":0},"guitars":{"$":0},"guru":{"$":0},"hair":{"$":0},"hamburg":{"$":0},"hangout":{"$":0},"haus":{"$":0},"hbo":{"$":0},"hdfc":{"$":0},"hdfcbank":{"$":0},"health":{"$":0,"hra":{"$":0}},"healthcare":{"$":0},"help":{"$":0},"helsinki":{"$":0},"here":{"$":0},"hermes":{"$":0},"hgtv":{"$":0},"hiphop":{"$":0},"hisamitsu":{"$":0},"hitachi":{"$":0},"hiv":{"$":0},"hkt":{"$":0},"hockey":{"$":0},"holdings":{"$":0},"holiday":{"$":0},"homedepot":{"$":0},"homegoods":{"$":0},"homes":{"$":0},"homesense":{"$":0},"honda":{"$":0},"horse":{"$":0},"hospital":{"$":0},"host":{"$":0,"cloudaccess":{"$":0},"freesite":{"$":0},"fastvps":{"$":0},"myfast":{"$":0},"tempurl":{"$":0},"wpmudev":{"$":0},"jele":{"$":0},"mircloud":{"$":0},"pcloud":{"$":0},"half":{"$":0}},"hosting":{"$":0,"opencraft":{"$":0}},"hot":{"$":0},"hoteles":{"$":0},"hotels":{"$":0},"hotmail":{"$":0},"house":{"$":0},"how":{"$":0},"hsbc":{"$":0},"hughes":{"$":0},"hyatt":{"$":0},"hyundai":{"$":0},"ibm":{"$":0},"icbc":{"$":0},"ice":{"$":0},"icu":{"$":0},"ieee":{"$":0},"ifm":{"$":0},"ikano":{"$":0},"imamat":{"$":0},"imdb":{"$":0},"immo":{"$":0},"immobilien":{"$":0},"inc":{"$":0},"industries":{"$":0},"infiniti":{"$":0},"ing":{"$":0},"ink":{"$":0},"institute":{"$":0},"insurance":{"$":0},"insure":{"$":0},"international":{"$":0},"intuit":{"$":0},"investments":{"$":0},"ipiranga":{"$":0},"irish":{"$":0},"ismaili":{"$":0},"ist":{"$":0},"istanbul":{"$":0},"itau":{"$":0},"itv":{"$":0},"jaguar":{"$":0},"java":{"$":0},"jcb":{"$":0},"jeep":{"$":0},"jetzt":{"$":0},"jewelry":{"$":0},"jio":{"$":0},"jll":{"$":0},"jmp":{"$":0},"jnj":{"$":0},"joburg":{"$":0},"jot":{"$":0},"joy":{"$":0},"jpmorgan":{"$":0},"jprs":{"$":0},"juegos":{"$":0},"juniper":{"$":0},"kaufen":{"$":0},"kddi":{"$":0},"kerryhotels":{"$":0},"kerrylogistics":{"$":0},"kerryproperties":{"$":0},"kfh":{"$":0},"kia":{"$":0},"kim":{"$":0},"kinder":{"$":0},"kindle":{"$":0},"kitchen":{"$":0},"kiwi":{"$":0},"koeln":{"$":0},"komatsu":{"$":0},"kosher":{"$":0},"kpmg":{"$":0},"kpn":{"$":0},"krd":{"$":0,"co":{"$":0},"edu":{"$":0}},"kred":{"$":0},"kuokgroup":{"$":0},"kyoto":{"$":0},"lacaixa":{"$":0},"lamborghini":{"$":0},"lamer":{"$":0},"lancaster":{"$":0},"lancia":{"$":0},"land":{"$":0,"static":{"$":0,"dev":{"$":0},"sites":{"$":0}}},"landrover":{"$":0},"lanxess":{"$":0},"lasalle":{"$":0},"lat":{"$":0},"latino":{"$":0},"latrobe":{"$":0},"law":{"$":0},"lawyer":{"$":0},"lds":{"$":0},"lease":{"$":0},"leclerc":{"$":0},"lefrak":{"$":0},"legal":{"$":0},"lego":{"$":0},"lexus":{"$":0},"lgbt":{"$":0},"lidl":{"$":0},"life":{"$":0},"lifeinsurance":{"$":0},"lifestyle":{"$":0},"lighting":{"$":0},"like":{"$":0},"lilly":{"$":0},"limited":{"$":0},"limo":{"$":0},"lincoln":{"$":0},"linde":{"$":0},"link":{"$":0,"cyon":{"$":0},"mypep":{"$":0},"dweb":{"*":{"$":0}}},"lipsy":{"$":0},"live":{"$":0},"living":{"$":0},"lixil":{"$":0},"llc":{"$":0},"llp":{"$":0},"loan":{"$":0},"loans":{"$":0},"locker":{"$":0},"locus":{"$":0},"loft":{"$":0},"lol":{"$":0,"omg":{"$":0}},"london":{"$":0,"in":{"$":0},"of":{"$":0}},"lotte":{"$":0},"lotto":{"$":0},"love":{"$":0},"lpl":{"$":0},"lplfinancial":{"$":0},"ltd":{"$":0},"ltda":{"$":0},"lundbeck":{"$":0},"luxe":{"$":0},"luxury":{"$":0},"macys":{"$":0},"madrid":{"$":0},"maif":{"$":0},"maison":{"$":0},"makeup":{"$":0},"man":{"$":0},"management":{"$":0,"router":{"$":0}},"mango":{"$":0},"map":{"$":0},"market":{"$":0},"marketing":{"$":0,"from":{"$":0},"with":{"$":0}},"markets":{"$":0},"marriott":{"$":0},"marshalls":{"$":0},"maserati":{"$":0},"mattel":{"$":0},"mba":{"$":0},"mckinsey":{"$":0},"med":{"$":0},"media":{"$":0},"meet":{"$":0},"melbourne":{"$":0},"meme":{"$":0},"memorial":{"$":0},"men":{"$":0,"for":{"$":0},"repair":{"$":0}},"menu":{"$":0,"barsy":{"$":0}},"merckmsd":{"$":0},"miami":{"$":0},"microsoft":{"$":0},"mini":{"$":0},"mint":{"$":0},"mit":{"$":0},"mitsubishi":{"$":0},"mlb":{"$":0},"mls":{"$":0},"mma":{"$":0},"mobile":{"$":0},"moda":{"$":0},"moe":{"$":0},"moi":{"$":0},"mom":{"$":0,"and":{"$":0},"for":{"$":0}},"monash":{"$":0},"money":{"$":0},"monster":{"$":0},"mormon":{"$":0},"mortgage":{"$":0},"moscow":{"$":0},"moto":{"$":0},"motorcycles":{"$":0},"mov":{"$":0},"movie":{"$":0},"msd":{"$":0},"mtn":{"$":0},"mtr":{"$":0},"music":{"$":0},"mutual":{"$":0},"nab":{"$":0},"nagoya":{"$":0},"natura":{"$":0},"navy":{"$":0},"nba":{"$":0},"nec":{"$":0},"netbank":{"$":0},"netflix":{"$":0},"network":{"$":0,"alces":{"*":{"$":0}},"co":{"$":0},"arvo":{"$":0},"azimuth":{"$":0},"tlon":{"$":0}},"neustar":{"$":0},"new":{"$":0},"news":{"$":0,"noticeable":{"$":0}},"next":{"$":0},"nextdirect":{"$":0},"nexus":{"$":0},"nfl":{"$":0},"ngo":{"$":0},"nhk":{"$":0},"nico":{"$":0},"nike":{"$":0},"nikon":{"$":0},"ninja":{"$":0},"nissan":{"$":0},"nissay":{"$":0},"nokia":{"$":0},"northwesternmutual":{"$":0},"norton":{"$":0},"now":{"$":0},"nowruz":{"$":0},"nowtv":{"$":0},"nra":{"$":0},"nrw":{"$":0},"ntt":{"$":0},"nyc":{"$":0},"obi":{"$":0},"observer":{"$":0},"off":{"$":0},"office":{"$":0},"okinawa":{"$":0},"olayan":{"$":0},"olayangroup":{"$":0},"oldnavy":{"$":0},"ollo":{"$":0},"omega":{"$":0},"one":{"$":0,"onred":{"$":0,"staging":{"$":0}},"service":{"$":0},"for":{"$":0},"under":{"$":0},"homelink":{"$":0}},"ong":{"$":0},"onl":{"$":0},"online":{"$":0,"barsy":{"$":0}},"ooo":{"$":0},"open":{"$":0},"oracle":{"$":0},"orange":{"$":0},"organic":{"$":0},"origins":{"$":0},"osaka":{"$":0},"otsuka":{"$":0},"ott":{"$":0},"ovh":{"$":0,"nerdpol":{"$":0}},"page":{"$":0,"pdns":{"$":0},"plesk":{"$":0},"prvcy":{"$":0},"magnet":{"$":0}},"panasonic":{"$":0},"paris":{"$":0},"pars":{"$":0},"partners":{"$":0},"parts":{"$":0},"party":{"$":0,"ybo":{"$":0}},"passagens":{"$":0},"pay":{"$":0},"pccw":{"$":0},"pet":{"$":0},"pfizer":{"$":0},"pharmacy":{"$":0},"phd":{"$":0},"philips":{"$":0},"phone":{"$":0},"photo":{"$":0},"photography":{"$":0},"photos":{"$":0},"physio":{"$":0},"pics":{"$":0},"pictet":{"$":0},"pictures":{"1337":{"$":0},"$":0},"pid":{"$":0},"pin":{"$":0},"ping":{"$":0},"pink":{"$":0},"pioneer":{"$":0},"pizza":{"$":0},"place":{"$":0,"co":{"$":0}},"play":{"$":0},"playstation":{"$":0},"plumbing":{"$":0},"plus":{"$":0},"pnc":{"$":0},"pohl":{"$":0},"poker":{"$":0},"politie":{"$":0},"porn":{"$":0,"indie":{"$":0}},"pramerica":{"$":0},"praxi":{"$":0},"press":{"$":0},"prime":{"$":0},"prod":{"$":0},"productions":{"$":0},"prof":{"$":0},"progressive":{"$":0},"promo":{"$":0},"properties":{"$":0},"property":{"$":0},"protection":{"$":0},"pru":{"$":0},"prudential":{"$":0},"pub":{"$":0,"barsy":{"$":0}},"pwc":{"$":0},"qpon":{"$":0},"quebec":{"$":0},"quest":{"$":0},"qvc":{"$":0},"racing":{"$":0},"radio":{"$":0},"raid":{"$":0},"read":{"$":0},"realestate":{"$":0},"realtor":{"$":0},"realty":{"$":0},"recipes":{"$":0},"red":{"$":0},"redstone":{"$":0},"redumbrella":{"$":0},"rehab":{"$":0},"reise":{"$":0},"reisen":{"$":0},"reit":{"$":0},"reliance":{"$":0},"ren":{"$":0},"rent":{"$":0},"rentals":{"$":0},"repair":{"$":0},"report":{"$":0},"republican":{"$":0},"rest":{"$":0},"restaurant":{"$":0},"review":{"$":0,"ybo":{"$":0}},"reviews":{"$":0},"rexroth":{"$":0},"rich":{"$":0},"richardli":{"$":0},"ricoh":{"$":0},"ril":{"$":0},"rio":{"$":0},"rip":{"$":0,"clan":{"$":0}},"rmit":{"$":0},"rocher":{"$":0},"rocks":{"$":0,"myddns":{"$":0},"lima-city":{"$":0},"webspace":{"$":0}},"rodeo":{"$":0},"rogers":{"$":0},"room":{"$":0},"rsvp":{"$":0},"rugby":{"$":0},"ruhr":{"$":0},"run":{"$":0,"hs":{"$":0},"development":{"$":0},"ravendb":{"$":0},"code":{"*":{"$":0}},"repl":{"$":0}},"rwe":{"$":0},"ryukyu":{"$":0},"saarland":{"$":0},"safe":{"$":0},"safety":{"$":0},"sakura":{"$":0},"sale":{"$":0,"for":{"$":0}},"salon":{"$":0},"samsclub":{"$":0},"samsung":{"$":0},"sandvik":{"$":0},"sandvikcoromant":{"$":0},"sanofi":{"$":0},"sap":{"$":0},"sarl":{"$":0},"sas":{"$":0},"save":{"$":0},"saxo":{"$":0},"sbi":{"$":0},"sbs":{"$":0},"sca":{"$":0},"scb":{"$":0},"schaeffler":{"$":0},"schmidt":{"$":0},"scholarships":{"$":0},"school":{"$":0},"schule":{"$":0},"schwarz":{"$":0},"science":{"$":0,"ybo":{"$":0}},"scjohnson":{"$":0},"scot":{"$":0,"edu":{"$":0},"gov":{"$":0,"service":{"$":0}}},"search":{"$":0},"seat":{"$":0},"secure":{"$":0},"security":{"$":0},"seek":{"$":0},"select":{"$":0},"sener":{"$":0},"services":{"$":0,"loginline":{"$":0}},"ses":{"$":0},"seven":{"$":0},"sew":{"$":0},"sex":{"$":0},"sexy":{"$":0},"sfr":{"$":0},"shangrila":{"$":0},"sharp":{"$":0},"shaw":{"$":0},"shell":{"$":0},"shia":{"$":0},"shiksha":{"$":0},"shoes":{"$":0},"shop":{"$":0,"barsy":{"$":0}},"shopping":{"$":0},"shouji":{"$":0},"show":{"$":0},"showtime":{"$":0},"silk":{"$":0},"sina":{"$":0},"singles":{"$":0},"site":{"$":0,"cloudera":{"$":0},"cyon":{"$":0},"fnwk":{"$":0},"folionetwork":{"$":0},"fastvps":{"$":0},"jele":{"$":0},"lelux":{"$":0},"loginline":{"$":0},"barsy":{"$":0},"mintere":{"$":0},"omniwe":{"$":0},"opensocial":{"$":0},"platformsh":{"*":{"$":0}},"tst":{"*":{"$":0}},"byen":{"$":0},"srht":{"$":0},"novecore":{"$":0}},"ski":{"$":0},"skin":{"$":0},"sky":{"$":0},"skype":{"$":0},"sling":{"$":0},"smart":{"$":0},"smile":{"$":0},"sncf":{"$":0},"soccer":{"$":0},"social":{"$":0},"softbank":{"$":0},"software":{"$":0},"sohu":{"$":0},"solar":{"$":0},"solutions":{"$":0},"song":{"$":0},"sony":{"$":0},"soy":{"$":0},"spa":{"$":0},"space":{"$":0,"myfast":{"$":0},"uber":{"$":0},"xs4all":{"$":0}},"sport":{"$":0},"spot":{"$":0},"srl":{"$":0},"stada":{"$":0},"staples":{"$":0},"star":{"$":0},"statebank":{"$":0},"statefarm":{"$":0},"stc":{"$":0},"stcgroup":{"$":0},"stockholm":{"$":0},"storage":{"$":0},"store":{"$":0,"shopware":{"$":0},"storebase":{"$":0}},"stream":{"$":0},"studio":{"$":0},"study":{"$":0},"style":{"$":0},"sucks":{"$":0},"supplies":{"$":0},"supply":{"$":0},"support":{"$":0,"barsy":{"$":0}},"surf":{"$":0},"surgery":{"$":0},"suzuki":{"$":0},"swatch":{"$":0},"swiftcover":{"$":0},"swiss":{"$":0},"sydney":{"$":0},"systems":{"$":0,"knightpoint":{"$":0}},"tab":{"$":0},"taipei":{"$":0},"talk":{"$":0},"taobao":{"$":0},"target":{"$":0},"tatamotors":{"$":0},"tatar":{"$":0},"tattoo":{"$":0},"tax":{"$":0},"taxi":{"$":0},"tci":{"$":0},"tdk":{"$":0},"team":{"$":0,"discourse":{"$":0},"jelastic":{"$":0}},"tech":{"$":0},"technology":{"$":0,"co":{"$":0}},"temasek":{"$":0},"tennis":{"$":0},"teva":{"$":0},"thd":{"$":0},"theater":{"$":0},"theatre":{"$":0},"tiaa":{"$":0},"tickets":{"$":0},"tienda":{"$":0},"tiffany":{"$":0},"tips":{"$":0},"tires":{"$":0},"tirol":{"$":0},"tjmaxx":{"$":0},"tjx":{"$":0},"tkmaxx":{"$":0},"tmall":{"$":0},"today":{"$":0},"tokyo":{"$":0},"tools":{"$":0},"top":{"$":0,"now-dns":{"$":0},"ntdll":{"$":0}},"toray":{"$":0},"toshiba":{"$":0},"total":{"$":0},"tours":{"$":0},"town":{"$":0},"toyota":{"$":0},"toys":{"$":0},"trade":{"$":0,"ybo":{"$":0}},"trading":{"$":0},"training":{"$":0},"travel":{"$":0},"travelchannel":{"$":0},"travelers":{"$":0},"travelersinsurance":{"$":0},"trust":{"$":0},"trv":{"$":0},"tube":{"$":0},"tui":{"$":0},"tunes":{"$":0},"tushu":{"$":0},"tvs":{"$":0},"ubank":{"$":0},"ubs":{"$":0},"unicom":{"$":0},"university":{"$":0},"uno":{"$":0},"uol":{"$":0},"ups":{"$":0},"vacations":{"$":0},"vana":{"$":0},"vanguard":{"$":0},"vegas":{"$":0},"ventures":{"$":0},"verisign":{"$":0},"versicherung":{"$":0},"vet":{"$":0},"viajes":{"$":0},"video":{"$":0},"vig":{"$":0},"viking":{"$":0},"villas":{"$":0},"vin":{"$":0},"vip":{"$":0},"virgin":{"$":0},"visa":{"$":0},"vision":{"$":0},"viva":{"$":0},"vivo":{"$":0},"vlaanderen":{"$":0},"vodka":{"$":0},"volkswagen":{"$":0},"volvo":{"$":0},"vote":{"$":0},"voting":{"$":0},"voto":{"$":0},"voyage":{"$":0},"vuelos":{"$":0},"wales":{"$":0},"walmart":{"$":0},"walter":{"$":0},"wang":{"$":0},"wanggou":{"$":0},"watch":{"$":0},"watches":{"$":0},"weather":{"$":0},"weatherchannel":{"$":0},"webcam":{"$":0},"weber":{"$":0},"website":{"$":0},"wedding":{"$":0},"weibo":{"$":0},"weir":{"$":0},"whoswho":{"$":0},"wien":{"$":0},"wiki":{"$":0},"williamhill":{"$":0},"win":{"$":0,"that":{"$":0}},"windows":{"$":0},"wine":{"$":0},"winners":{"$":0},"wme":{"$":0},"wolterskluwer":{"$":0},"woodside":{"$":0},"work":{"$":0,"from":{"$":0},"to":{"$":0}},"works":{"$":0},"world":{"$":0},"wow":{"$":0},"wtc":{"$":0},"wtf":{"$":0},"xbox":{"$":0},"xerox":{"$":0},"xfinity":{"$":0},"xihuan":{"$":0},"xin":{"$":0},"xn--11b4c3d":{"$":0},"xn--1ck2e1b":{"$":0},"xn--1qqw23a":{"$":0},"xn--30rr7y":{"$":0},"xn--3bst00m":{"$":0},"xn--3ds443g":{"$":0},"xn--3oq18vl8pn36a":{"$":0},"xn--3pxu8k":{"$":0},"xn--42c2d9a":{"$":0},"xn--45q11c":{"$":0},"xn--4gbrim":{"$":0},"xn--55qw42g":{"$":0},"xn--55qx5d":{"$":0},"xn--5su34j936bgsg":{"$":0},"xn--5tzm5g":{"$":0},"xn--6frz82g":{"$":0},"xn--6qq986b3xl":{"$":0},"xn--80adxhks":{"$":0},"xn--80aqecdr1a":{"$":0},"xn--80asehdb":{"$":0},"xn--80aswg":{"$":0},"xn--8y0a063a":{"$":0},"xn--9dbq2a":{"$":0},"xn--9et52u":{"$":0},"xn--9krt00a":{"$":0},"xn--b4w605ferd":{"$":0},"xn--bck1b9a5dre4c":{"$":0},"xn--c1avg":{"$":0},"xn--c2br7g":{"$":0},"xn--cck2b3b":{"$":0},"xn--cckwcxetd":{"$":0},"xn--cg4bki":{"$":0},"xn--czr694b":{"$":0},"xn--czrs0t":{"$":0},"xn--czru2d":{"$":0},"xn--d1acj3b":{"$":0},"xn--eckvdtc9d":{"$":0},"xn--efvy88h":{"$":0},"xn--fct429k":{"$":0},"xn--fhbei":{"$":0},"xn--fiq228c5hs":{"$":0},"xn--fiq64b":{"$":0},"xn--fjq720a":{"$":0},"xn--flw351e":{"$":0},"xn--fzys8d69uvgm":{"$":0},"xn--g2xx48c":{"$":0},"xn--gckr3f0f":{"$":0},"xn--gk3at1e":{"$":0},"xn--hxt814e":{"$":0},"xn--i1b6b1a6a2e":{"$":0},"xn--imr513n":{"$":0},"xn--io0a7i":{"$":0},"xn--j1aef":{"$":0},"xn--jlq480n2rg":{"$":0},"xn--jlq61u9w7b":{"$":0},"xn--jvr189m":{"$":0},"xn--kcrx77d1x4a":{"$":0},"xn--kput3i":{"$":0},"xn--mgba3a3ejt":{"$":0},"xn--mgba7c0bbn0a":{"$":0},"xn--mgbaakc7dvf":{"$":0},"xn--mgbab2bd":{"$":0},"xn--mgbca7dzdo":{"$":0},"xn--mgbi4ecexp":{"$":0},"xn--mgbt3dhd":{"$":0},"xn--mk1bu44c":{"$":0},"xn--mxtq1m":{"$":0},"xn--ngbc5azd":{"$":0},"xn--ngbe9e0a":{"$":0},"xn--ngbrx":{"$":0},"xn--nqv7f":{"$":0},"xn--nqv7fs00ema":{"$":0},"xn--nyqy26a":{"$":0},"xn--otu796d":{"$":0},"xn--p1acf":{"$":0,"xn--90amc":{"$":0},"xn--j1aef":{"$":0},"xn--j1ael8b":{"$":0},"xn--h1ahn":{"$":0},"xn--j1adp":{"$":0},"xn--c1avg":{"$":0},"xn--80aaa0cvac":{"$":0},"xn--h1aliz":{"$":0},"xn--90a1af":{"$":0},"xn--41a":{"$":0}},"xn--pssy2u":{"$":0},"xn--q9jyb4c":{"$":0},"xn--qcka1pmc":{"$":0},"xn--rhqv96g":{"$":0},"xn--rovu88b":{"$":0},"xn--ses554g":{"$":0},"xn--t60b56a":{"$":0},"xn--tckwe":{"$":0},"xn--tiq49xqyj":{"$":0},"xn--unup4y":{"$":0},"xn--vermgensberater-ctb":{"$":0},"xn--vermgensberatung-pwb":{"$":0},"xn--vhquv":{"$":0},"xn--vuq861b":{"$":0},"xn--w4r85el8fhu5dnra":{"$":0},"xn--w4rs40l":{"$":0},"xn--xhq521b":{"$":0},"xn--zfr164b":{"$":0},"xyz":{"$":0,"blogsite":{"$":0},"localzone":{"$":0},"crafting":{"$":0},"zapto":{"$":0},"telebit":{"*":{"$":0}}},"yachts":{"$":0},"yahoo":{"$":0},"yamaxun":{"$":0},"yandex":{"$":0},"yodobashi":{"$":0},"yoga":{"$":0},"yokohama":{"$":0},"you":{"$":0},"youtube":{"$":0},"yun":{"$":0},"zappos":{"$":0},"zara":{"$":0},"zero":{"$":0},"zip":{"$":0},"zone":{"$":0,"cloud66":{"$":0},"hs":{"$":0},"triton":{"*":{"$":0}},"lima":{"$":0}},"zuerich":{"$":0}}}
},{}],154:[function(require,module,exports){
(function (global){(function (){
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global global, define, System, Reflect, Promise */
var __extends;
var __assign;
var __rest;
var __decorate;
var __param;
var __metadata;
var __awaiter;
var __generator;
var __exportStar;
var __values;
var __read;
var __spread;
var __spreadArrays;
var __await;
var __asyncGenerator;
var __asyncDelegator;
var __asyncValues;
var __makeTemplateObject;
var __importStar;
var __importDefault;
(function (factory) {
    var root = typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : {};
    if (typeof define === "function" && define.amd) {
        define("tslib", ["exports"], function (exports) { factory(createExporter(root, createExporter(exports))); });
    }
    else if (typeof module === "object" && typeof module.exports === "object") {
        factory(createExporter(root, createExporter(module.exports)));
    }
    else {
        factory(createExporter(root));
    }
    function createExporter(exports, previous) {
        if (exports !== root) {
            if (typeof Object.create === "function") {
                Object.defineProperty(exports, "__esModule", { value: true });
            }
            else {
                exports.__esModule = true;
            }
        }
        return function (id, v) { return exports[id] = previous ? previous(id, v) : v; };
    }
})
(function (exporter) {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

    __extends = function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };

    __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };

    __rest = function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    };

    __decorate = function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };

    __param = function (paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    };

    __metadata = function (metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    };

    __awaiter = function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };

    __generator = function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };

    __exportStar = function (m, exports) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    };

    __values = function (o) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m) return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    };

    __read = function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };

    __spread = function () {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    };

    __spreadArrays = function () {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };

    __await = function (v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    };

    __asyncGenerator = function (thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);  }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    };

    __asyncDelegator = function (o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    };

    __asyncValues = function (o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
    };

    __makeTemplateObject = function (cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    };

    __importStar = function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };

    __importDefault = function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };

    exporter("__extends", __extends);
    exporter("__assign", __assign);
    exporter("__rest", __rest);
    exporter("__decorate", __decorate);
    exporter("__param", __param);
    exporter("__metadata", __metadata);
    exporter("__awaiter", __awaiter);
    exporter("__generator", __generator);
    exporter("__exportStar", __exportStar);
    exporter("__values", __values);
    exporter("__read", __read);
    exporter("__spread", __spread);
    exporter("__spreadArrays", __spreadArrays);
    exporter("__await", __await);
    exporter("__asyncGenerator", __asyncGenerator);
    exporter("__asyncDelegator", __asyncDelegator);
    exporter("__asyncValues", __asyncValues);
    exporter("__makeTemplateObject", __makeTemplateObject);
    exporter("__importStar", __importStar);
    exporter("__importDefault", __importDefault);
});

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],155:[function(require,module,exports){
/*!
 * UAParser.js v0.7.20
 * Lightweight JavaScript-based User-Agent string parser
 * https://github.com/faisalman/ua-parser-js
 *
 * Copyright © 2012-2019 Faisal Salman <f@faisalman.com>
 * Licensed under MIT License
 */

(function (window, undefined) {

    'use strict';

    //////////////
    // Constants
    /////////////


    var LIBVERSION  = '0.7.20',
        EMPTY       = '',
        UNKNOWN     = '?',
        FUNC_TYPE   = 'function',
        UNDEF_TYPE  = 'undefined',
        OBJ_TYPE    = 'object',
        STR_TYPE    = 'string',
        MAJOR       = 'major', // deprecated
        MODEL       = 'model',
        NAME        = 'name',
        TYPE        = 'type',
        VENDOR      = 'vendor',
        VERSION     = 'version',
        ARCHITECTURE= 'architecture',
        CONSOLE     = 'console',
        MOBILE      = 'mobile',
        TABLET      = 'tablet',
        SMARTTV     = 'smarttv',
        WEARABLE    = 'wearable',
        EMBEDDED    = 'embedded';


    ///////////
    // Helper
    //////////


    var util = {
        extend : function (regexes, extensions) {
            var mergedRegexes = {};
            for (var i in regexes) {
                if (extensions[i] && extensions[i].length % 2 === 0) {
                    mergedRegexes[i] = extensions[i].concat(regexes[i]);
                } else {
                    mergedRegexes[i] = regexes[i];
                }
            }
            return mergedRegexes;
        },
        has : function (str1, str2) {
          if (typeof str1 === "string") {
            return str2.toLowerCase().indexOf(str1.toLowerCase()) !== -1;
          } else {
            return false;
          }
        },
        lowerize : function (str) {
            return str.toLowerCase();
        },
        major : function (version) {
            return typeof(version) === STR_TYPE ? version.replace(/[^\d\.]/g,'').split(".")[0] : undefined;
        },
        trim : function (str) {
          return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        }
    };


    ///////////////
    // Map helper
    //////////////


    var mapper = {

        rgx : function (ua, arrays) {

            var i = 0, j, k, p, q, matches, match;

            // loop through all regexes maps
            while (i < arrays.length && !matches) {

                var regex = arrays[i],       // even sequence (0,2,4,..)
                    props = arrays[i + 1];   // odd sequence (1,3,5,..)
                j = k = 0;

                // try matching uastring with regexes
                while (j < regex.length && !matches) {

                    matches = regex[j++].exec(ua);

                    if (!!matches) {
                        for (p = 0; p < props.length; p++) {
                            match = matches[++k];
                            q = props[p];
                            // check if given property is actually array
                            if (typeof q === OBJ_TYPE && q.length > 0) {
                                if (q.length == 2) {
                                    if (typeof q[1] == FUNC_TYPE) {
                                        // assign modified match
                                        this[q[0]] = q[1].call(this, match);
                                    } else {
                                        // assign given value, ignore regex match
                                        this[q[0]] = q[1];
                                    }
                                } else if (q.length == 3) {
                                    // check whether function or regex
                                    if (typeof q[1] === FUNC_TYPE && !(q[1].exec && q[1].test)) {
                                        // call function (usually string mapper)
                                        this[q[0]] = match ? q[1].call(this, match, q[2]) : undefined;
                                    } else {
                                        // sanitize match using given regex
                                        this[q[0]] = match ? match.replace(q[1], q[2]) : undefined;
                                    }
                                } else if (q.length == 4) {
                                        this[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined;
                                }
                            } else {
                                this[q] = match ? match : undefined;
                            }
                        }
                    }
                }
                i += 2;
            }
        },

        str : function (str, map) {

            for (var i in map) {
                // check if array
                if (typeof map[i] === OBJ_TYPE && map[i].length > 0) {
                    for (var j = 0; j < map[i].length; j++) {
                        if (util.has(map[i][j], str)) {
                            return (i === UNKNOWN) ? undefined : i;
                        }
                    }
                } else if (util.has(map[i], str)) {
                    return (i === UNKNOWN) ? undefined : i;
                }
            }
            return str;
        }
    };


    ///////////////
    // String map
    //////////////


    var maps = {

        browser : {
            oldsafari : {
                version : {
                    '1.0'   : '/8',
                    '1.2'   : '/1',
                    '1.3'   : '/3',
                    '2.0'   : '/412',
                    '2.0.2' : '/416',
                    '2.0.3' : '/417',
                    '2.0.4' : '/419',
                    '?'     : '/'
                }
            }
        },

        device : {
            amazon : {
                model : {
                    'Fire Phone' : ['SD', 'KF']
                }
            },
            sprint : {
                model : {
                    'Evo Shift 4G' : '7373KT'
                },
                vendor : {
                    'HTC'       : 'APA',
                    'Sprint'    : 'Sprint'
                }
            }
        },

        os : {
            windows : {
                version : {
                    'ME'        : '4.90',
                    'NT 3.11'   : 'NT3.51',
                    'NT 4.0'    : 'NT4.0',
                    '2000'      : 'NT 5.0',
                    'XP'        : ['NT 5.1', 'NT 5.2'],
                    'Vista'     : 'NT 6.0',
                    '7'         : 'NT 6.1',
                    '8'         : 'NT 6.2',
                    '8.1'       : 'NT 6.3',
                    '10'        : ['NT 6.4', 'NT 10.0'],
                    'RT'        : 'ARM'
                }
            }
        }
    };


    //////////////
    // Regex map
    /////////////


    var regexes = {

        browser : [[

            // Presto based
            /(opera\smini)\/([\w\.-]+)/i,                                       // Opera Mini
            /(opera\s[mobiletab]+).+version\/([\w\.-]+)/i,                      // Opera Mobi/Tablet
            /(opera).+version\/([\w\.]+)/i,                                     // Opera > 9.80
            /(opera)[\/\s]+([\w\.]+)/i                                          // Opera < 9.80
            ], [NAME, VERSION], [

            /(opios)[\/\s]+([\w\.]+)/i                                          // Opera mini on iphone >= 8.0
            ], [[NAME, 'Opera Mini'], VERSION], [

            /\s(opr)\/([\w\.]+)/i                                               // Opera Webkit
            ], [[NAME, 'Opera'], VERSION], [

            // Mixed
            /(kindle)\/([\w\.]+)/i,                                             // Kindle
            /(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?([\w\.]*)/i,
                                                                                // Lunascape/Maxthon/Netfront/Jasmine/Blazer

            // Trident based
            /(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?([\w\.]*)/i,
                                                                                // Avant/IEMobile/SlimBrowser/Baidu
            /(?:ms|\()(ie)\s([\w\.]+)/i,                                        // Internet Explorer

            // Webkit/KHTML based
            /(rekonq)\/([\w\.]*)/i,                                             // Rekonq
            /(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon)\/([\w\.-]+)/i
                                                                                // Chromium/Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron/Iridium/PhantomJS/Bowser/QupZilla/Falkon
            ], [NAME, VERSION], [

            /(konqueror)\/([\w\.]+)/i                                           // Konqueror
            ], [[NAME, 'Konqueror'], VERSION], [

            /(trident).+rv[:\s]([\w\.]+).+like\sgecko/i                         // IE11
            ], [[NAME, 'IE'], VERSION], [

            /(edge|edgios|edga|edg)\/((\d+)?[\w\.]+)/i                          // Microsoft Edge
            ], [[NAME, 'Edge'], VERSION], [

            /(yabrowser)\/([\w\.]+)/i                                           // Yandex
            ], [[NAME, 'Yandex'], VERSION], [

            /(puffin)\/([\w\.]+)/i                                              // Puffin
            ], [[NAME, 'Puffin'], VERSION], [

            /(focus)\/([\w\.]+)/i                                               // Firefox Focus
            ], [[NAME, 'Firefox Focus'], VERSION], [

            /(opt)\/([\w\.]+)/i                                                 // Opera Touch
            ], [[NAME, 'Opera Touch'], VERSION], [

            /((?:[\s\/])uc?\s?browser|(?:juc.+)ucweb)[\/\s]?([\w\.]+)/i         // UCBrowser
            ], [[NAME, 'UCBrowser'], VERSION], [

            /(comodo_dragon)\/([\w\.]+)/i                                       // Comodo Dragon
            ], [[NAME, /_/g, ' '], VERSION], [

            /(windowswechat qbcore)\/([\w\.]+)/i                                // WeChat Desktop for Windows Built-in Browser
            ], [[NAME, 'WeChat(Win) Desktop'], VERSION], [

            /(micromessenger)\/([\w\.]+)/i                                      // WeChat
            ], [[NAME, 'WeChat'], VERSION], [

            /(brave)\/([\w\.]+)/i                                              // Brave browser
            ], [[NAME, 'Brave'], VERSION], [

            /(qqbrowserlite)\/([\w\.]+)/i                                       // QQBrowserLite
            ], [NAME, VERSION], [

            /(QQ)\/([\d\.]+)/i                                                  // QQ, aka ShouQ
            ], [NAME, VERSION], [

            /m?(qqbrowser)[\/\s]?([\w\.]+)/i                                    // QQBrowser
            ], [NAME, VERSION], [

            /(BIDUBrowser)[\/\s]?([\w\.]+)/i                                    // Baidu Browser
            ], [NAME, VERSION], [

            /(2345Explorer)[\/\s]?([\w\.]+)/i                                   // 2345 Browser
            ], [NAME, VERSION], [

            /(MetaSr)[\/\s]?([\w\.]+)/i                                         // SouGouBrowser
            ], [NAME], [

            /(LBBROWSER)/i                                      // LieBao Browser
            ], [NAME], [

            /xiaomi\/miuibrowser\/([\w\.]+)/i                                   // MIUI Browser
            ], [VERSION, [NAME, 'MIUI Browser']], [

            /;fbav\/([\w\.]+);/i                                                // Facebook App for iOS & Android
            ], [VERSION, [NAME, 'Facebook']], [

            /safari\s(line)\/([\w\.]+)/i,                                       // Line App for iOS
            /android.+(line)\/([\w\.]+)\/iab/i                                  // Line App for Android
            ], [NAME, VERSION], [

            /headlesschrome(?:\/([\w\.]+)|\s)/i                                 // Chrome Headless
            ], [VERSION, [NAME, 'Chrome Headless']], [

            /\swv\).+(chrome)\/([\w\.]+)/i                                      // Chrome WebView
            ], [[NAME, /(.+)/, '$1 WebView'], VERSION], [

            /((?:oculus|samsung)browser)\/([\w\.]+)/i
            ], [[NAME, /(.+(?:g|us))(.+)/, '$1 $2'], VERSION], [                // Oculus / Samsung Browser

            /android.+version\/([\w\.]+)\s+(?:mobile\s?safari|safari)*/i        // Android Browser
            ], [VERSION, [NAME, 'Android Browser']], [

            /(sailfishbrowser)\/([\w\.]+)/i                                     // Sailfish Browser
            ], [[NAME, 'Sailfish Browser'], VERSION], [

            /(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?([\w\.]+)/i
                                                                                // Chrome/OmniWeb/Arora/Tizen/Nokia
            ], [NAME, VERSION], [

            /(dolfin)\/([\w\.]+)/i                                              // Dolphin
            ], [[NAME, 'Dolphin'], VERSION], [

            /((?:android.+)crmo|crios)\/([\w\.]+)/i                             // Chrome for Android/iOS
            ], [[NAME, 'Chrome'], VERSION], [

            /(coast)\/([\w\.]+)/i                                               // Opera Coast
            ], [[NAME, 'Opera Coast'], VERSION], [

            /fxios\/([\w\.-]+)/i                                                // Firefox for iOS
            ], [VERSION, [NAME, 'Firefox']], [

            /version\/([\w\.]+).+?mobile\/\w+\s(safari)/i                       // Mobile Safari
            ], [VERSION, [NAME, 'Mobile Safari']], [

            /version\/([\w\.]+).+?(mobile\s?safari|safari)/i                    // Safari & Safari Mobile
            ], [VERSION, NAME], [

            /webkit.+?(gsa)\/([\w\.]+).+?(mobile\s?safari|safari)(\/[\w\.]+)/i  // Google Search Appliance on iOS
            ], [[NAME, 'GSA'], VERSION], [

            /webkit.+?(mobile\s?safari|safari)(\/[\w\.]+)/i                     // Safari < 3.0
            ], [NAME, [VERSION, mapper.str, maps.browser.oldsafari.version]], [

            /(webkit|khtml)\/([\w\.]+)/i
            ], [NAME, VERSION], [

            // Gecko based
            /(navigator|netscape)\/([\w\.-]+)/i                                 // Netscape
            ], [[NAME, 'Netscape'], VERSION], [
            /(swiftfox)/i,                                                      // Swiftfox
            /(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?([\w\.\+]+)/i,
                                                                                // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror
            /(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([\w\.-]+)$/i,

                                                                                // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
            /(mozilla)\/([\w\.]+).+rv\:.+gecko\/\d+/i,                          // Mozilla

            // Other
            /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir)[\/\s]?([\w\.]+)/i,
                                                                                // Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf/Sleipnir
            /(links)\s\(([\w\.]+)/i,                                            // Links
            /(gobrowser)\/?([\w\.]*)/i,                                         // GoBrowser
            /(ice\s?browser)\/v?([\w\._]+)/i,                                   // ICE Browser
            /(mosaic)[\/\s]([\w\.]+)/i                                          // Mosaic
            ], [NAME, VERSION]
        ],

        cpu : [[

            /(?:(amd|x(?:(?:86|64)[_-])?|wow|win)64)[;\)]/i                     // AMD64
            ], [[ARCHITECTURE, 'amd64']], [

            /(ia32(?=;))/i                                                      // IA32 (quicktime)
            ], [[ARCHITECTURE, util.lowerize]], [

            /((?:i[346]|x)86)[;\)]/i                                            // IA32
            ], [[ARCHITECTURE, 'ia32']], [

            // PocketPC mistakenly identified as PowerPC
            /windows\s(ce|mobile);\sppc;/i
            ], [[ARCHITECTURE, 'arm']], [

            /((?:ppc|powerpc)(?:64)?)(?:\smac|;|\))/i                           // PowerPC
            ], [[ARCHITECTURE, /ower/, '', util.lowerize]], [

            /(sun4\w)[;\)]/i                                                    // SPARC
            ], [[ARCHITECTURE, 'sparc']], [

            /((?:avr32|ia64(?=;))|68k(?=\))|arm(?:64|(?=v\d+[;l]))|(?=atmel\s)avr|(?:irix|mips|sparc)(?:64)?(?=;)|pa-risc)/i
                                                                                // IA64, 68K, ARM/64, AVR/32, IRIX/64, MIPS/64, SPARC/64, PA-RISC
            ], [[ARCHITECTURE, util.lowerize]]
        ],

        device : [[

            /\((ipad|playbook);[\w\s\),;-]+(rim|apple)/i                        // iPad/PlayBook
            ], [MODEL, VENDOR, [TYPE, TABLET]], [

            /applecoremedia\/[\w\.]+ \((ipad)/                                  // iPad
            ], [MODEL, [VENDOR, 'Apple'], [TYPE, TABLET]], [

            /(apple\s{0,1}tv)/i                                                 // Apple TV
            ], [[MODEL, 'Apple TV'], [VENDOR, 'Apple']], [

            /(archos)\s(gamepad2?)/i,                                           // Archos
            /(hp).+(touchpad)/i,                                                // HP TouchPad
            /(hp).+(tablet)/i,                                                  // HP Tablet
            /(kindle)\/([\w\.]+)/i,                                             // Kindle
            /\s(nook)[\w\s]+build\/(\w+)/i,                                     // Nook
            /(dell)\s(strea[kpr\s\d]*[\dko])/i                                  // Dell Streak
            ], [VENDOR, MODEL, [TYPE, TABLET]], [

            /(kf[A-z]+)\sbuild\/.+silk\//i                                      // Kindle Fire HD
            ], [MODEL, [VENDOR, 'Amazon'], [TYPE, TABLET]], [
            /(sd|kf)[0349hijorstuw]+\sbuild\/.+silk\//i                         // Fire Phone
            ], [[MODEL, mapper.str, maps.device.amazon.model], [VENDOR, 'Amazon'], [TYPE, MOBILE]], [
            /android.+aft([bms])\sbuild/i                                       // Fire TV
            ], [MODEL, [VENDOR, 'Amazon'], [TYPE, SMARTTV]], [

            /\((ip[honed|\s\w*]+);.+(apple)/i                                   // iPod/iPhone
            ], [MODEL, VENDOR, [TYPE, MOBILE]], [
            /\((ip[honed|\s\w*]+);/i                                            // iPod/iPhone
            ], [MODEL, [VENDOR, 'Apple'], [TYPE, MOBILE]], [

            /(blackberry)[\s-]?(\w+)/i,                                         // BlackBerry
            /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron)[\s_-]?([\w-]*)/i,
                                                                                // BenQ/Palm/Sony-Ericsson/Acer/Asus/Dell/Meizu/Motorola/Polytron
            /(hp)\s([\w\s]+\w)/i,                                               // HP iPAQ
            /(asus)-?(\w+)/i                                                    // Asus
            ], [VENDOR, MODEL, [TYPE, MOBILE]], [
            /\(bb10;\s(\w+)/i                                                   // BlackBerry 10
            ], [MODEL, [VENDOR, 'BlackBerry'], [TYPE, MOBILE]], [
                                                                                // Asus Tablets
            /android.+(transfo[prime\s]{4,10}\s\w+|eeepc|slider\s\w+|nexus 7|padfone|p00c)/i
            ], [MODEL, [VENDOR, 'Asus'], [TYPE, TABLET]], [

            /(sony)\s(tablet\s[ps])\sbuild\//i,                                  // Sony
            /(sony)?(?:sgp.+)\sbuild\//i
            ], [[VENDOR, 'Sony'], [MODEL, 'Xperia Tablet'], [TYPE, TABLET]], [
            /android.+\s([c-g]\d{4}|so[-l]\w+)(?=\sbuild\/|\).+chrome\/(?![1-6]{0,1}\d\.))/i
            ], [MODEL, [VENDOR, 'Sony'], [TYPE, MOBILE]], [

            /\s(ouya)\s/i,                                                      // Ouya
            /(nintendo)\s([wids3u]+)/i                                          // Nintendo
            ], [VENDOR, MODEL, [TYPE, CONSOLE]], [

            /android.+;\s(shield)\sbuild/i                                      // Nvidia
            ], [MODEL, [VENDOR, 'Nvidia'], [TYPE, CONSOLE]], [

            /(playstation\s[34portablevi]+)/i                                   // Playstation
            ], [MODEL, [VENDOR, 'Sony'], [TYPE, CONSOLE]], [

            /(sprint\s(\w+))/i                                                  // Sprint Phones
            ], [[VENDOR, mapper.str, maps.device.sprint.vendor], [MODEL, mapper.str, maps.device.sprint.model], [TYPE, MOBILE]], [

            /(htc)[;_\s-]+([\w\s]+(?=\)|\sbuild)|\w+)/i,                        // HTC
            /(zte)-(\w*)/i,                                                     // ZTE
            /(alcatel|geeksphone|nexian|panasonic|(?=;\s)sony)[_\s-]?([\w-]*)/i
                                                                                // Alcatel/GeeksPhone/Nexian/Panasonic/Sony
            ], [VENDOR, [MODEL, /_/g, ' '], [TYPE, MOBILE]], [

            /(nexus\s9)/i                                                       // HTC Nexus 9
            ], [MODEL, [VENDOR, 'HTC'], [TYPE, TABLET]], [

            /d\/huawei([\w\s-]+)[;\)]/i,
            /(nexus\s6p)/i                                                      // Huawei
            ], [MODEL, [VENDOR, 'Huawei'], [TYPE, MOBILE]], [

            /(microsoft);\s(lumia[\s\w]+)/i                                     // Microsoft Lumia
            ], [VENDOR, MODEL, [TYPE, MOBILE]], [

            /[\s\(;](xbox(?:\sone)?)[\s\);]/i                                   // Microsoft Xbox
            ], [MODEL, [VENDOR, 'Microsoft'], [TYPE, CONSOLE]], [
            /(kin\.[onetw]{3})/i                                                // Microsoft Kin
            ], [[MODEL, /\./g, ' '], [VENDOR, 'Microsoft'], [TYPE, MOBILE]], [

                                                                                // Motorola
            /\s(milestone|droid(?:[2-4x]|\s(?:bionic|x2|pro|razr))?:?(\s4g)?)[\w\s]+build\//i,
            /mot[\s-]?(\w*)/i,
            /(XT\d{3,4}) build\//i,
            /(nexus\s6)/i
            ], [MODEL, [VENDOR, 'Motorola'], [TYPE, MOBILE]], [
            /android.+\s(mz60\d|xoom[\s2]{0,2})\sbuild\//i
            ], [MODEL, [VENDOR, 'Motorola'], [TYPE, TABLET]], [

            /hbbtv\/\d+\.\d+\.\d+\s+\([\w\s]*;\s*(\w[^;]*);([^;]*)/i            // HbbTV devices
            ], [[VENDOR, util.trim], [MODEL, util.trim], [TYPE, SMARTTV]], [

            /hbbtv.+maple;(\d+)/i
            ], [[MODEL, /^/, 'SmartTV'], [VENDOR, 'Samsung'], [TYPE, SMARTTV]], [

            /\(dtv[\);].+(aquos)/i                                              // Sharp
            ], [MODEL, [VENDOR, 'Sharp'], [TYPE, SMARTTV]], [

            /android.+((sch-i[89]0\d|shw-m380s|gt-p\d{4}|gt-n\d+|sgh-t8[56]9|nexus 10))/i,
            /((SM-T\w+))/i
            ], [[VENDOR, 'Samsung'], MODEL, [TYPE, TABLET]], [                  // Samsung
            /smart-tv.+(samsung)/i
            ], [VENDOR, [TYPE, SMARTTV], MODEL], [
            /((s[cgp]h-\w+|gt-\w+|galaxy\snexus|sm-\w[\w\d]+))/i,
            /(sam[sung]*)[\s-]*(\w+-?[\w-]*)/i,
            /sec-((sgh\w+))/i
            ], [[VENDOR, 'Samsung'], MODEL, [TYPE, MOBILE]], [

            /sie-(\w*)/i                                                        // Siemens
            ], [MODEL, [VENDOR, 'Siemens'], [TYPE, MOBILE]], [

            /(maemo|nokia).*(n900|lumia\s\d+)/i,                                // Nokia
            /(nokia)[\s_-]?([\w-]*)/i
            ], [[VENDOR, 'Nokia'], MODEL, [TYPE, MOBILE]], [

            /android[x\d\.\s;]+\s([ab][1-7]\-?[0178a]\d\d?)/i                   // Acer
            ], [MODEL, [VENDOR, 'Acer'], [TYPE, TABLET]], [

            /android.+([vl]k\-?\d{3})\s+build/i                                 // LG Tablet
            ], [MODEL, [VENDOR, 'LG'], [TYPE, TABLET]], [
            /android\s3\.[\s\w;-]{10}(lg?)-([06cv9]{3,4})/i                     // LG Tablet
            ], [[VENDOR, 'LG'], MODEL, [TYPE, TABLET]], [
            /(lg) netcast\.tv/i                                                 // LG SmartTV
            ], [VENDOR, MODEL, [TYPE, SMARTTV]], [
            /(nexus\s[45])/i,                                                   // LG
            /lg[e;\s\/-]+(\w*)/i,
            /android.+lg(\-?[\d\w]+)\s+build/i
            ], [MODEL, [VENDOR, 'LG'], [TYPE, MOBILE]], [

            /(lenovo)\s?(s(?:5000|6000)(?:[\w-]+)|tab(?:[\s\w]+))/i             // Lenovo tablets
            ], [VENDOR, MODEL, [TYPE, TABLET]], [
            /android.+(ideatab[a-z0-9\-\s]+)/i                                  // Lenovo
            ], [MODEL, [VENDOR, 'Lenovo'], [TYPE, TABLET]], [
            /(lenovo)[_\s-]?([\w-]+)/i
            ], [VENDOR, MODEL, [TYPE, MOBILE]], [

            /linux;.+((jolla));/i                                               // Jolla
            ], [VENDOR, MODEL, [TYPE, MOBILE]], [

            /((pebble))app\/[\d\.]+\s/i                                         // Pebble
            ], [VENDOR, MODEL, [TYPE, WEARABLE]], [

            /android.+;\s(oppo)\s?([\w\s]+)\sbuild/i                            // OPPO
            ], [VENDOR, MODEL, [TYPE, MOBILE]], [

            /crkey/i                                                            // Google Chromecast
            ], [[MODEL, 'Chromecast'], [VENDOR, 'Google']], [

            /android.+;\s(glass)\s\d/i                                          // Google Glass
            ], [MODEL, [VENDOR, 'Google'], [TYPE, WEARABLE]], [

            /android.+;\s(pixel c)[\s)]/i                                       // Google Pixel C
            ], [MODEL, [VENDOR, 'Google'], [TYPE, TABLET]], [

            /android.+;\s(pixel( [23])?( xl)?)[\s)]/i                              // Google Pixel
            ], [MODEL, [VENDOR, 'Google'], [TYPE, MOBILE]], [

            /android.+;\s(\w+)\s+build\/hm\1/i,                                 // Xiaomi Hongmi 'numeric' models
            /android.+(hm[\s\-_]*note?[\s_]*(?:\d\w)?)\s+build/i,               // Xiaomi Hongmi
            /android.+(mi[\s\-_]*(?:a\d|one|one[\s_]plus|note lte)?[\s_]*(?:\d?\w?)[\s_]*(?:plus)?)\s+build/i,    
                                                                                // Xiaomi Mi
            /android.+(redmi[\s\-_]*(?:note)?(?:[\s_]*[\w\s]+))\s+build/i       // Redmi Phones
            ], [[MODEL, /_/g, ' '], [VENDOR, 'Xiaomi'], [TYPE, MOBILE]], [
            /android.+(mi[\s\-_]*(?:pad)(?:[\s_]*[\w\s]+))\s+build/i            // Mi Pad tablets
            ],[[MODEL, /_/g, ' '], [VENDOR, 'Xiaomi'], [TYPE, TABLET]], [
            /android.+;\s(m[1-5]\snote)\sbuild/i                                // Meizu
            ], [MODEL, [VENDOR, 'Meizu'], [TYPE, MOBILE]], [
            /(mz)-([\w-]{2,})/i
            ], [[VENDOR, 'Meizu'], MODEL, [TYPE, MOBILE]], [

            /android.+a000(1)\s+build/i,                                        // OnePlus
            /android.+oneplus\s(a\d{4})\s+build/i
            ], [MODEL, [VENDOR, 'OnePlus'], [TYPE, MOBILE]], [

            /android.+[;\/]\s*(RCT[\d\w]+)\s+build/i                            // RCA Tablets
            ], [MODEL, [VENDOR, 'RCA'], [TYPE, TABLET]], [

            /android.+[;\/\s]+(Venue[\d\s]{2,7})\s+build/i                      // Dell Venue Tablets
            ], [MODEL, [VENDOR, 'Dell'], [TYPE, TABLET]], [

            /android.+[;\/]\s*(Q[T|M][\d\w]+)\s+build/i                         // Verizon Tablet
            ], [MODEL, [VENDOR, 'Verizon'], [TYPE, TABLET]], [

            /android.+[;\/]\s+(Barnes[&\s]+Noble\s+|BN[RT])(V?.*)\s+build/i     // Barnes & Noble Tablet
            ], [[VENDOR, 'Barnes & Noble'], MODEL, [TYPE, TABLET]], [

            /android.+[;\/]\s+(TM\d{3}.*\b)\s+build/i                           // Barnes & Noble Tablet
            ], [MODEL, [VENDOR, 'NuVision'], [TYPE, TABLET]], [

            /android.+;\s(k88)\sbuild/i                                         // ZTE K Series Tablet
            ], [MODEL, [VENDOR, 'ZTE'], [TYPE, TABLET]], [

            /android.+[;\/]\s*(gen\d{3})\s+build.*49h/i                         // Swiss GEN Mobile
            ], [MODEL, [VENDOR, 'Swiss'], [TYPE, MOBILE]], [

            /android.+[;\/]\s*(zur\d{3})\s+build/i                              // Swiss ZUR Tablet
            ], [MODEL, [VENDOR, 'Swiss'], [TYPE, TABLET]], [

            /android.+[;\/]\s*((Zeki)?TB.*\b)\s+build/i                         // Zeki Tablets
            ], [MODEL, [VENDOR, 'Zeki'], [TYPE, TABLET]], [

            /(android).+[;\/]\s+([YR]\d{2})\s+build/i,
            /android.+[;\/]\s+(Dragon[\-\s]+Touch\s+|DT)(\w{5})\sbuild/i        // Dragon Touch Tablet
            ], [[VENDOR, 'Dragon Touch'], MODEL, [TYPE, TABLET]], [

            /android.+[;\/]\s*(NS-?\w{0,9})\sbuild/i                            // Insignia Tablets
            ], [MODEL, [VENDOR, 'Insignia'], [TYPE, TABLET]], [

            /android.+[;\/]\s*((NX|Next)-?\w{0,9})\s+build/i                    // NextBook Tablets
            ], [MODEL, [VENDOR, 'NextBook'], [TYPE, TABLET]], [

            /android.+[;\/]\s*(Xtreme\_)?(V(1[045]|2[015]|30|40|60|7[05]|90))\s+build/i
            ], [[VENDOR, 'Voice'], MODEL, [TYPE, MOBILE]], [                    // Voice Xtreme Phones

            /android.+[;\/]\s*(LVTEL\-)?(V1[12])\s+build/i                     // LvTel Phones
            ], [[VENDOR, 'LvTel'], MODEL, [TYPE, MOBILE]], [

            /android.+;\s(PH-1)\s/i
            ], [MODEL, [VENDOR, 'Essential'], [TYPE, MOBILE]], [                // Essential PH-1

            /android.+[;\/]\s*(V(100MD|700NA|7011|917G).*\b)\s+build/i          // Envizen Tablets
            ], [MODEL, [VENDOR, 'Envizen'], [TYPE, TABLET]], [

            /android.+[;\/]\s*(Le[\s\-]+Pan)[\s\-]+(\w{1,9})\s+build/i          // Le Pan Tablets
            ], [VENDOR, MODEL, [TYPE, TABLET]], [

            /android.+[;\/]\s*(Trio[\s\-]*.*)\s+build/i                         // MachSpeed Tablets
            ], [MODEL, [VENDOR, 'MachSpeed'], [TYPE, TABLET]], [

            /android.+[;\/]\s*(Trinity)[\-\s]*(T\d{3})\s+build/i                // Trinity Tablets
            ], [VENDOR, MODEL, [TYPE, TABLET]], [

            /android.+[;\/]\s*TU_(1491)\s+build/i                               // Rotor Tablets
            ], [MODEL, [VENDOR, 'Rotor'], [TYPE, TABLET]], [

            /android.+(KS(.+))\s+build/i                                        // Amazon Kindle Tablets
            ], [MODEL, [VENDOR, 'Amazon'], [TYPE, TABLET]], [

            /android.+(Gigaset)[\s\-]+(Q\w{1,9})\s+build/i                      // Gigaset Tablets
            ], [VENDOR, MODEL, [TYPE, TABLET]], [

            /\s(tablet|tab)[;\/]/i,                                             // Unidentifiable Tablet
            /\s(mobile)(?:[;\/]|\ssafari)/i                                     // Unidentifiable Mobile
            ], [[TYPE, util.lowerize], VENDOR, MODEL], [

            /[\s\/\(](smart-?tv)[;\)]/i                                         // SmartTV
            ], [[TYPE, SMARTTV]], [

            /(android[\w\.\s\-]{0,9});.+build/i                                 // Generic Android Device
            ], [MODEL, [VENDOR, 'Generic']]
        ],

        engine : [[

            /windows.+\sedge\/([\w\.]+)/i                                       // EdgeHTML
            ], [VERSION, [NAME, 'EdgeHTML']], [

            /webkit\/537\.36.+chrome\/(?!27)/i                                  // Blink
            ], [[NAME, 'Blink']], [

            /(presto)\/([\w\.]+)/i,                                             // Presto
            /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i,     
                                                                                // WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m/Goanna
            /(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i,                          // KHTML/Tasman/Links
            /(icab)[\/\s]([23]\.[\d\.]+)/i                                      // iCab
            ], [NAME, VERSION], [

            /rv\:([\w\.]{1,9}).+(gecko)/i                                       // Gecko
            ], [VERSION, NAME]
        ],

        os : [[

            // Windows based
            /microsoft\s(windows)\s(vista|xp)/i                                 // Windows (iTunes)
            ], [NAME, VERSION], [
            /(windows)\snt\s6\.2;\s(arm)/i,                                     // Windows RT
            /(windows\sphone(?:\sos)*)[\s\/]?([\d\.\s\w]*)/i,                   // Windows Phone
            /(windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i
            ], [NAME, [VERSION, mapper.str, maps.os.windows.version]], [
            /(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i
            ], [[NAME, 'Windows'], [VERSION, mapper.str, maps.os.windows.version]], [

            // Mobile/Embedded OS
            /\((bb)(10);/i                                                      // BlackBerry 10
            ], [[NAME, 'BlackBerry'], VERSION], [
            /(blackberry)\w*\/?([\w\.]*)/i,                                     // Blackberry
            /(tizen)[\/\s]([\w\.]+)/i,                                          // Tizen
            /(android|webos|palm\sos|qnx|bada|rim\stablet\sos|meego|sailfish|contiki)[\/\s-]?([\w\.]*)/i
                                                                                // Android/WebOS/Palm/QNX/Bada/RIM/MeeGo/Contiki/Sailfish OS
            ], [NAME, VERSION], [
            /(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]*)/i                  // Symbian
            ], [[NAME, 'Symbian'], VERSION], [
            /\((series40);/i                                                    // Series 40
            ], [NAME], [
            /mozilla.+\(mobile;.+gecko.+firefox/i                               // Firefox OS
            ], [[NAME, 'Firefox OS'], VERSION], [

            // Console
            /(nintendo|playstation)\s([wids34portablevu]+)/i,                   // Nintendo/Playstation

            // GNU/Linux based
            /(mint)[\/\s\(]?(\w*)/i,                                            // Mint
            /(mageia|vectorlinux)[;\s]/i,                                       // Mageia/VectorLinux
            /(joli|[kxln]?ubuntu|debian|suse|opensuse|gentoo|(?=\s)arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk|linpus)[\/\s-]?(?!chrom)([\w\.-]*)/i,
                                                                                // Joli/Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware
                                                                                // Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk/Linpus
            /(hurd|linux)\s?([\w\.]*)/i,                                        // Hurd/Linux
            /(gnu)\s?([\w\.]*)/i                                                // GNU
            ], [NAME, VERSION], [

            /(cros)\s[\w]+\s([\w\.]+\w)/i                                       // Chromium OS
            ], [[NAME, 'Chromium OS'], VERSION],[

            // Solaris
            /(sunos)\s?([\w\.\d]*)/i                                            // Solaris
            ], [[NAME, 'Solaris'], VERSION], [

            // BSD based
            /\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]*)/i                    // FreeBSD/NetBSD/OpenBSD/PC-BSD/DragonFly
            ], [NAME, VERSION],[

            /(haiku)\s(\w+)/i                                                   // Haiku
            ], [NAME, VERSION],[

            /cfnetwork\/.+darwin/i,
            /ip[honead]{2,4}(?:.*os\s([\w]+)\slike\smac|;\sopera)/i             // iOS
            ], [[VERSION, /_/g, '.'], [NAME, 'iOS']], [

            /(mac\sos\sx)\s?([\w\s\.]*)/i,
            /(macintosh|mac(?=_powerpc)\s)/i                                    // Mac OS
            ], [[NAME, 'Mac OS'], [VERSION, /_/g, '.']], [

            // Other
            /((?:open)?solaris)[\/\s-]?([\w\.]*)/i,                             // Solaris
            /(aix)\s((\d)(?=\.|\)|\s)[\w\.])*/i,                                // AIX
            /(plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos|openvms|fuchsia)/i,
                                                                                // Plan9/Minix/BeOS/OS2/AmigaOS/MorphOS/RISCOS/OpenVMS/Fuchsia
            /(unix)\s?([\w\.]*)/i                                               // UNIX
            ], [NAME, VERSION]
        ]
    };


    /////////////////
    // Constructor
    ////////////////
    var UAParser = function (uastring, extensions) {

        if (typeof uastring === 'object') {
            extensions = uastring;
            uastring = undefined;
        }

        if (!(this instanceof UAParser)) {
            return new UAParser(uastring, extensions).getResult();
        }

        var ua = uastring || ((window && window.navigator && window.navigator.userAgent) ? window.navigator.userAgent : EMPTY);
        var rgxmap = extensions ? util.extend(regexes, extensions) : regexes;

        this.getBrowser = function () {
            var browser = { name: undefined, version: undefined };
            mapper.rgx.call(browser, ua, rgxmap.browser);
            browser.major = util.major(browser.version); // deprecated
            return browser;
        };
        this.getCPU = function () {
            var cpu = { architecture: undefined };
            mapper.rgx.call(cpu, ua, rgxmap.cpu);
            return cpu;
        };
        this.getDevice = function () {
            var device = { vendor: undefined, model: undefined, type: undefined };
            mapper.rgx.call(device, ua, rgxmap.device);
            return device;
        };
        this.getEngine = function () {
            var engine = { name: undefined, version: undefined };
            mapper.rgx.call(engine, ua, rgxmap.engine);
            return engine;
        };
        this.getOS = function () {
            var os = { name: undefined, version: undefined };
            mapper.rgx.call(os, ua, rgxmap.os);
            return os;
        };
        this.getResult = function () {
            return {
                ua      : this.getUA(),
                browser : this.getBrowser(),
                engine  : this.getEngine(),
                os      : this.getOS(),
                device  : this.getDevice(),
                cpu     : this.getCPU()
            };
        };
        this.getUA = function () {
            return ua;
        };
        this.setUA = function (uastring) {
            ua = uastring;
            return this;
        };
        return this;
    };

    UAParser.VERSION = LIBVERSION;
    UAParser.BROWSER = {
        NAME    : NAME,
        MAJOR   : MAJOR, // deprecated
        VERSION : VERSION
    };
    UAParser.CPU = {
        ARCHITECTURE : ARCHITECTURE
    };
    UAParser.DEVICE = {
        MODEL   : MODEL,
        VENDOR  : VENDOR,
        TYPE    : TYPE,
        CONSOLE : CONSOLE,
        MOBILE  : MOBILE,
        SMARTTV : SMARTTV,
        TABLET  : TABLET,
        WEARABLE: WEARABLE,
        EMBEDDED: EMBEDDED
    };
    UAParser.ENGINE = {
        NAME    : NAME,
        VERSION : VERSION
    };
    UAParser.OS = {
        NAME    : NAME,
        VERSION : VERSION
    };

    ///////////
    // Export
    //////////


    // check js environment
    if (typeof(exports) !== UNDEF_TYPE) {
        // nodejs env
        if (typeof module !== UNDEF_TYPE && module.exports) {
            exports = module.exports = UAParser;
        }
        exports.UAParser = UAParser;
    } else {
        // requirejs env (optional)
        if (typeof(define) === 'function' && define.amd) {
            define(function () {
                return UAParser;
            });
        } else if (window) {
            // browser env
            window.UAParser = UAParser;
        }
    }

    // jQuery/Zepto specific (optional)
    // Note:
    //   In AMD env the global scope should be kept clean, but jQuery is an exception.
    //   jQuery always exports to global scope, unless jQuery.noConflict(true) is used,
    //   and we should catch that.
    var $ = window && (window.jQuery || window.Zepto);
    if (typeof $ !== UNDEF_TYPE && !$.ua) {
        var parser = new UAParser();
        $.ua = parser.getResult();
        $.ua.get = function () {
            return parser.getUA();
        };
        $.ua.set = function (uastring) {
            parser.setUA(uastring);
            var result = parser.getResult();
            for (var prop in result) {
                $.ua[prop] = result[prop];
            }
        };
    }

})(typeof window === 'object' ? window : this);

},{}],156:[function(require,module,exports){
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

},{}],157:[function(require,module,exports){
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

var punycode = require('punycode');
var util = require('./util');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter =
          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      util.isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol')
        result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

},{"./util":158,"punycode":139,"querystring":142}],158:[function(require,module,exports){
'use strict';

module.exports = {
  isString: function(arg) {
    return typeof(arg) === 'string';
  },
  isObject: function(arg) {
    return typeof(arg) === 'object' && arg !== null;
  },
  isNull: function(arg) {
    return arg === null;
  },
  isNullOrUndefined: function(arg) {
    return arg == null;
  }
};

},{}],159:[function(require,module,exports){
/*! https://mths.be/utf8js v3.0.0 by @mathias */
;(function(root) {

	var stringFromCharCode = String.fromCharCode;

	// Taken from https://mths.be/punycode
	function ucs2decode(string) {
		var output = [];
		var counter = 0;
		var length = string.length;
		var value;
		var extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	// Taken from https://mths.be/punycode
	function ucs2encode(array) {
		var length = array.length;
		var index = -1;
		var value;
		var output = '';
		while (++index < length) {
			value = array[index];
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
		}
		return output;
	}

	function checkScalarValue(codePoint) {
		if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
			throw Error(
				'Lone surrogate U+' + codePoint.toString(16).toUpperCase() +
				' is not a scalar value'
			);
		}
	}
	/*--------------------------------------------------------------------------*/

	function createByte(codePoint, shift) {
		return stringFromCharCode(((codePoint >> shift) & 0x3F) | 0x80);
	}

	function encodeCodePoint(codePoint) {
		if ((codePoint & 0xFFFFFF80) == 0) { // 1-byte sequence
			return stringFromCharCode(codePoint);
		}
		var symbol = '';
		if ((codePoint & 0xFFFFF800) == 0) { // 2-byte sequence
			symbol = stringFromCharCode(((codePoint >> 6) & 0x1F) | 0xC0);
		}
		else if ((codePoint & 0xFFFF0000) == 0) { // 3-byte sequence
			checkScalarValue(codePoint);
			symbol = stringFromCharCode(((codePoint >> 12) & 0x0F) | 0xE0);
			symbol += createByte(codePoint, 6);
		}
		else if ((codePoint & 0xFFE00000) == 0) { // 4-byte sequence
			symbol = stringFromCharCode(((codePoint >> 18) & 0x07) | 0xF0);
			symbol += createByte(codePoint, 12);
			symbol += createByte(codePoint, 6);
		}
		symbol += stringFromCharCode((codePoint & 0x3F) | 0x80);
		return symbol;
	}

	function utf8encode(string) {
		var codePoints = ucs2decode(string);
		var length = codePoints.length;
		var index = -1;
		var codePoint;
		var byteString = '';
		while (++index < length) {
			codePoint = codePoints[index];
			byteString += encodeCodePoint(codePoint);
		}
		return byteString;
	}

	/*--------------------------------------------------------------------------*/

	function readContinuationByte() {
		if (byteIndex >= byteCount) {
			throw Error('Invalid byte index');
		}

		var continuationByte = byteArray[byteIndex] & 0xFF;
		byteIndex++;

		if ((continuationByte & 0xC0) == 0x80) {
			return continuationByte & 0x3F;
		}

		// If we end up here, it’s not a continuation byte
		throw Error('Invalid continuation byte');
	}

	function decodeSymbol() {
		var byte1;
		var byte2;
		var byte3;
		var byte4;
		var codePoint;

		if (byteIndex > byteCount) {
			throw Error('Invalid byte index');
		}

		if (byteIndex == byteCount) {
			return false;
		}

		// Read first byte
		byte1 = byteArray[byteIndex] & 0xFF;
		byteIndex++;

		// 1-byte sequence (no continuation bytes)
		if ((byte1 & 0x80) == 0) {
			return byte1;
		}

		// 2-byte sequence
		if ((byte1 & 0xE0) == 0xC0) {
			byte2 = readContinuationByte();
			codePoint = ((byte1 & 0x1F) << 6) | byte2;
			if (codePoint >= 0x80) {
				return codePoint;
			} else {
				throw Error('Invalid continuation byte');
			}
		}

		// 3-byte sequence (may include unpaired surrogates)
		if ((byte1 & 0xF0) == 0xE0) {
			byte2 = readContinuationByte();
			byte3 = readContinuationByte();
			codePoint = ((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3;
			if (codePoint >= 0x0800) {
				checkScalarValue(codePoint);
				return codePoint;
			} else {
				throw Error('Invalid continuation byte');
			}
		}

		// 4-byte sequence
		if ((byte1 & 0xF8) == 0xF0) {
			byte2 = readContinuationByte();
			byte3 = readContinuationByte();
			byte4 = readContinuationByte();
			codePoint = ((byte1 & 0x07) << 0x12) | (byte2 << 0x0C) |
				(byte3 << 0x06) | byte4;
			if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
				return codePoint;
			}
		}

		throw Error('Invalid UTF-8 detected');
	}

	var byteArray;
	var byteCount;
	var byteIndex;
	function utf8decode(byteString) {
		byteArray = ucs2decode(byteString);
		byteCount = byteArray.length;
		byteIndex = 0;
		var codePoints = [];
		var tmp;
		while ((tmp = decodeSymbol()) !== false) {
			codePoints.push(tmp);
		}
		return ucs2encode(codePoints);
	}

	/*--------------------------------------------------------------------------*/

	root.version = '3.0.0';
	root.encode = utf8encode;
	root.decode = utf8decode;

}(typeof exports === 'undefined' ? this.utf8 = {} : exports));

},{}],160:[function(require,module,exports){
/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
  return ([bth[buf[i++]], bth[buf[i++]], 
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]],
	bth[buf[i++]], bth[buf[i++]],
	bth[buf[i++]], bth[buf[i++]]]).join('');
}

module.exports = bytesToUuid;

},{}],161:[function(require,module,exports){
// Unique ID creation requires a high quality random # generator.  In the
// browser this is a little complicated due to unknown quality of Math.random()
// and inconsistent support for the `crypto` API.  We do the best we can via
// feature-detection

// getRandomValues needs to be invoked in a context where "this" is a Crypto
// implementation. Also, find the complete implementation of crypto on IE11.
var getRandomValues = (typeof(crypto) != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)) ||
                      (typeof(msCrypto) != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto));

if (getRandomValues) {
  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
  var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

  module.exports = function whatwgRNG() {
    getRandomValues(rnds8);
    return rnds8;
  };
} else {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var rnds = new Array(16);

  module.exports = function mathRNG() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return rnds;
  };
}

},{}],162:[function(require,module,exports){
var rng = require('./lib/rng');
var bytesToUuid = require('./lib/bytesToUuid');

function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options === 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || bytesToUuid(rnds);
}

module.exports = v4;

},{"./lib/bytesToUuid":160,"./lib/rng":161}],163:[function(require,module,exports){
(function(self) {
  'use strict';

  if (self.fetch) {
    return
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob()
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ]

    var isDataView = function(obj) {
      return obj && DataView.prototype.isPrototypeOf(obj)
    }

    var isArrayBufferView = ArrayBuffer.isView || function(obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
    }
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift()
        return {done: value === undefined, value: value}
      }
    }

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      }
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1])
      }, this)
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var oldValue = this.map[name]
    this.map[name] = oldValue ? oldValue+','+value : value
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    name = normalizeName(name)
    return this.has(name) ? this.map[name] : null
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value)
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this)
      }
    }
  }

  Headers.prototype.keys = function() {
    var items = []
    this.forEach(function(value, name) { items.push(name) })
    return iteratorFor(items)
  }

  Headers.prototype.values = function() {
    var items = []
    this.forEach(function(value) { items.push(value) })
    return iteratorFor(items)
  }

  Headers.prototype.entries = function() {
    var items = []
    this.forEach(function(value, name) { items.push([name, value]) })
    return iteratorFor(items)
  }

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsArrayBuffer(blob)
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsText(blob)
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf)
    var chars = new Array(view.length)

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i])
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength)
      view.set(new Uint8Array(buf))
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false

    this._initBody = function(body) {
      this._bodyInit = body
      if (!body) {
        this._bodyText = ''
      } else if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString()
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer)
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer])
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body)
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8')
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type)
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
        }
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      }
    }

    this.text = function() {
      var rejected = consumed(this)
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body && input._bodyInit != null) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = String(input)
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this, { body: this._bodyInit })
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers()
    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2
    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ')
    preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':')
      var key = parts.shift().trim()
      if (key) {
        var value = parts.join(':').trim()
        headers.append(key, value)
      }
    })
    return headers
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = options.status === undefined ? 200 : options.status
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = 'statusText' in options ? options.statusText : 'OK'
    this.headers = new Headers(options.headers)
    this.url = options.url || ''
    this._initBody(bodyInit)
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers
  self.Request = Request
  self.Response = Response

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init)
      var xhr = new XMLHttpRequest()

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        }
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')
        var body = 'response' in xhr ? xhr.response : xhr.responseText
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})(typeof self !== 'undefined' ? self : this);

},{}],164:[function(require,module,exports){
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

},{"core-js/modules/es6.array.iterator.js":124,"core-js/modules/web.dom.iterable.js":126}],165:[function(require,module,exports){
module.exports={
	"dark_mode": false,
	"offers": true,
	"dnt_header": true,
	"inAppTracking": true,
	"adguard": true,
	"adguard_social_media": false,
	"adguard_useful_ads": true,
	"extension_scan": false
}
},{}],166:[function(require,module,exports){
"use strict";

const DEPENDENCIES = {
  adguard_social_media: 'adguard',
  adguard_useful_ads: 'adguard'
};
module.exports = DEPENDENCIES;

},{}],167:[function(require,module,exports){
"use strict";

require("core-js/modules/es6.array.iterator.js");

require("core-js/modules/web.dom.iterable.js");

const jsonStorage = require('background/jsonStorage');

const config = require('config');

const manifest = require('manifest.json');

const _ = require('underscore');

let instance = null;

class ABTestDecider {
  static initClass() {
    this.INSTALL = 'mixpanel_install';
    this.prototype._PARAMETERS = 'abTestParameters';
    this.prototype._PARAMETERS_TIMESTAMP = 'abTestParametersTimestamp';
    this.prototype._DEFAULT_PARAMETERS = {};
  }

  static getInstance() {
    if (instance == null) {
      instance = new this();
    }

    return instance;
  }

  constructor() {
    this._loadPromise = null;
    this._transformations = [];
    this._requiredParams = [];
    this._ttls = {};
    this._lastRequested = jsonStorage.getItem(this._PARAMETERS_TIMESTAMP) || {};

    this._getUserAgentParams(); // Only new installs are supposed to participate in AB tests.
    //
    // Relying on the fact that the tracking module hasn't set the install property
    // is not ideal, but atm we don't have another option to determine that it is
    // an existing installation.


    if (!this._get() && jsonStorage.getItem(ABTestDecider.INSTALL)) {
      this._set(this._DEFAULT_PARAMETERS);
    }
  }

  _get() {
    return JSON.parse(jsonStorage.getItem(this._PARAMETERS) || 'null');
  }

  _set(value) {
    return jsonStorage.setItem(this._PARAMETERS, JSON.stringify(value));
  }

  _load(firstLoad, missingParams, outdatedParams) {
    if (!this._loadPromise) {
      this._loadPromise = new Promise(resolve => {
        let params;
        const req = new XMLHttpRequest();
        req.open('POST', config.update_bridge.api_url, true);
        req.setRequestHeader('Content-Type', 'application/json'); // eslint-disable-next-line max-statements

        req.onreadystatechange = () => {
          let response;

          if (req.readyState !== 4) {
            return;
          }

          if (req.status !== 200) {
            resolve(this._DEFAULT_PARAMETERS);
            return;
          }

          try {
            response = JSON.parse(req.responseText);
          } catch (error) {
            response = {
              error: 'Parsing parsing JSON'
            };
          }

          params = response.error ? this._DEFAULT_PARAMETERS : response.result;

          this._transformations.forEach(transformation => transformation(params));

          if (!firstLoad) {
            const currentParams = this._get();

            const toUpdate = missingParams.concat(outdatedParams);
            params = _.extend(currentParams, _.pick(params, toUpdate));
            toUpdate.forEach(param => {
              this._lastRequested[param] = Date.now();
            });
          } else {
            _.forEach(params, (val, param) => {
              this._lastRequested[param] = Date.now();
            });
          }

          jsonStorage.setItem(this._PARAMETERS_TIMESTAMP, this._lastRequested);

          this._set(params);

          this._loadPromise = null;
          resolve(params);
        };

        return req.send(JSON.stringify({
          method: 'getUpdateUrl',
          ApiVersion: 1,
          params: {
            productId: config.update_bridge.product_id,
            productVersion: manifest.version,
            productLanguage: 'int'
          }
        }));
      });
    }

    return this._loadPromise;
  }

  _getMissingParams(params) {
    const paramsNames = _.keys(params);

    return _.difference(this._requiredParams, paramsNames);
  }

  _getOutdatedParams() {
    const now = Date.now();
    return _(this._ttls).keys().filter(param => this._lastRequested[param] + this._ttls[param] < now);
  }

  _getUserAgentParams() {
    const regex = /\(abTestOverride=(.*)?\)/;
    const {
      userAgent
    } = navigator;
    const params = regex.exec(userAgent);

    if (!params || !params[1]) {
      return;
    }

    this._set(JSON.parse(params[1]));
  }

  getParameters() {
    const params = this._get();

    const firstLoad = !params;

    const missingParams = this._getMissingParams(params);

    const outdatedParams = this._getOutdatedParams();

    if (firstLoad || missingParams.length || outdatedParams.length) {
      return this._load(firstLoad, missingParams, outdatedParams);
    }

    return Promise.resolve(params);
  }

  getUserNumber() {
    let userNumber = jsonStorage.getItem('abTestUserNumber');

    if (!userNumber) {
      userNumber = Math.random();
      jsonStorage.setItem('abTestUserNumber', userNumber);
    }

    return userNumber;
  }

  register(transformation) {
    if (typeof transformation !== 'function') {
      throw new Error('Transformation is not a function');
    }

    return this._transformations.push(transformation);
  }

  setRequired(requiredParams) {
    this._requiredParams = this._requiredParams.concat(requiredParams);
    return this._requiredParams;
  }

  setTTL(ttlsObject) {
    return _.extend(this._ttls, ttlsObject);
  }

}

ABTestDecider.initClass();
module.exports = ABTestDecider;

},{"background/jsonStorage":183,"config":188,"core-js/modules/es6.array.iterator.js":124,"core-js/modules/web.dom.iterable.js":126,"manifest.json":192,"underscore":156}],168:[function(require,module,exports){
"use strict";

const _ = require('underscore');

const INSTALLED = 'aims_installed';
const USER_ID = 'aims_user_id';
const USER_ID_PREFIX = 'aims_user_id_'; // AIMS does not send anything anymore but is used to store installation date and user_id

class AIMS {
  constructor(storage, options) {
    this.INSTALLED = INSTALLED;
    this.USER_ID = USER_ID;
    this.USER_ID_PREFIX = USER_ID_PREFIX;
    this._storage = storage;
    this._productid = options.productid;
  }

  initialize() {
    if (!this.getInstalled()) {
      this._setInstalled();
    }
  }

  getUserId() {
    let id = this._storage.getItem(this.USER_ID);

    if (!id) {
      id = this._gernerateUserId();

      this._storage.setItem(this.USER_ID, id);
    } // since the launcher can only read the keys and not the values of the
    // localStorage, we store the "id" also as prefixed key


    const idKey = `${this.USER_ID_PREFIX}${id}`;

    if (!this._storage.getItem(idKey)) {
      this._storage.setItem(idKey, id);
    }

    return id;
  }

  getInstalled() {
    return Number(this._storage.getItem(this.INSTALLED));
  }

  _getInstalledFormated() {
    return new Date(this.getInstalled()).toISOString().slice(0, 10).replace(/-/g, '');
  }

  _gernerateUserId() {
    return _.times(40, () => _.random(15).toString(16)).join('');
  }

  _setInstalled() {
    const now = Date.now();

    this._storage.setItem(this.INSTALLED, now);
  }

}

module.exports = AIMS;

},{"underscore":156}],169:[function(require,module,exports){
"use strict";

const CiuvoASDetector = require('ciuvo/ASDetector');

const ciuvoASDetector = new CiuvoASDetector();

class ASDetector {
  static getInstance() {
    if (!this.instance) {
      this.instance = new this();
    }

    return this.instance;
  }

  constructor() {
    this.isEnabled = false;
    this._onBeforeRequest = this._onBeforeRequest.bind(this);
  }

  enable() {
    if (!this.isEnabled) {
      this._enable();

      this.isEnabled = true;
    }
  }

  disable() {
    if (this.isEnabled) {
      this._disable();

      this.isEnabled = false;
    }
  }

  _enable() {
    chrome.webRequest.onBeforeRequest.addListener(this._onBeforeRequest, {
      urls: ['http://*/*', 'https://*/*'],
      types: ['main_frame']
    });
  }

  _disable() {
    chrome.webRequest.onBeforeRequest.removeListener(this._onBeforeRequest);
  }

  _onBeforeRequest(details) {
    ciuvoASDetector.onNavigationEvent(details.tabId, details.url, details.requestId, details.timeStamp);
  }

  isAffiliateSource(tabId) {
    return ciuvoASDetector.isAffiliateSource(tabId);
  }

}

module.exports = ASDetector;

},{"ciuvo/ASDetector":77}],170:[function(require,module,exports){
"use strict";

const _ = require('underscore');

const jsonStorage = require('background/jsonStorage');

const ADGUARD_COMPARISON_REPORT = 'ADGUARD_COMPARISON_REPORT';

class AdguardDNTAnalyser {
  static getInstance() {
    if (!this.instance) {
      this.instance = new this();
    }

    return this.instance;
  }

  constructor() {
    this._onDNTFound = this._onDNTFound.bind(this);
    this._onAdguardFound = this._onAdguardFound.bind(this);
    this._storeReport = _.debounce(this._storeReport.bind(this), 1000);
    this._dntHistory = {};
    this._ruleStorage = {};
    this._adguardHistory = {};
    this._overallHistory = {};
  }

  initialize(dnt, adguard) {
    dnt.addEventListener('trackerFound', this._onDNTFound);
    adguard.onRequestBlocked.addListener(this._onAdguardFound);
  }

  getReport() {
    let lastReport;

    try {
      lastReport = jsonStorage.getItem(ADGUARD_COMPARISON_REPORT);
    } catch (e) {
      lastReport = null;
    }

    const currentReport = {
      countTotal: Object.keys(this._overallHistory).length,
      countAdguard: Object.keys(this._adguardHistory).length,
      countDNT: Object.keys(this._dntHistory).length,
      rulesDNT: this._getRulesCount()
    };
    return this._mergeReports(currentReport, lastReport);
  }

  getAndReset() {
    const report = this.getReport();

    this._resetData();

    this._resetReport();

    return report;
  }

  getActiveReport() {
    const report = this.getAndReset();
    return Object.keys(report).reduce((obj, key) => _.extend(obj, {
      [`AdguardDNTAnalyser:${key}`]: report[key]
    }), {});
  }

  _mergeReports(newReport, oldReport) {
    if (!oldReport) return newReport;
    return {
      countTotal: newReport.countTotal + oldReport.countTotal,
      countAdguard: newReport.countAdguard + oldReport.countAdguard,
      countDNT: newReport.countDNT + oldReport.countDNT,
      rulesDNT: this._mergeRulesArrays(newReport.rulesDNT, oldReport.rulesDNT)
    };
  }

  _mergeRulesArrays(newArray, oldArray) {
    const rulesIndex = {};
    return newArray.concat(oldArray).filter(rule => {
      const ruleKey = `${rule.props.provider}:${rule.props.pattern}`;
      const alreadyAdded = !!rulesIndex[ruleKey];

      if (alreadyAdded) {
        rulesIndex[ruleKey].count += rule.count;
      } else {
        rulesIndex[ruleKey] = rule;
      }

      return !alreadyAdded;
    });
  }

  _getRulesCount() {
    const dntAdguardDiff = _.omit(this._dntHistory, this._adguardHistory);

    return _.reduce(dntAdguardDiff, (rulesArray, rule, url) => {
      const ruleKey = `${rule.provider}:${rule.pattern}`;

      if (this._ruleStorage[ruleKey]) {
        this._ruleStorage[ruleKey].count += 1;
      } else {
        this._ruleStorage[ruleKey] = {
          props: rule,
          exampleUrl: url,
          count: 1
        };
      }

      if (!rulesArray.includes(this._ruleStorage[ruleKey])) {
        rulesArray.push(this._ruleStorage[ruleKey]);
      }

      return rulesArray;
    }, []);
  }

  _resetData() {
    this._dntHistory = {};
    this._adguardHistory = {};
    this._overallHistory = {};
    this._ruleStorage = {};
  }

  _resetReport() {
    jsonStorage.setItem(ADGUARD_COMPARISON_REPORT, null);
  }

  _storeReport() {
    const report = this.getReport();
    jsonStorage.setItem(ADGUARD_COMPARISON_REPORT, report);

    this._resetData();
  }

  _onAdguardFound(details) {
    if (!this._adguardHistory[details.requestUrl]) {
      this._adguardHistory[details.requestUrl] = true;
    }

    if (!this._overallHistory[details.requestUrl]) {
      this._overallHistory[details.requestUrl] = true;
    }

    this._storeReport();
  } // eslint-disable-next-line max-params


  _onDNTFound(details, id, rule, request) {
    if (!this._overallHistory[request.url]) {
      this._overallHistory[request.url] = true;
    }

    if (!this._dntHistory[request.url]) {
      this._dntHistory[request.url] = rule;
    }

    this._storeReport();
  }

}

module.exports = AdguardDNTAnalyser;

},{"background/jsonStorage":183,"underscore":156}],171:[function(require,module,exports){
"use strict";

const messenger = require('messenger/Background').getInstance();

const jsonStorage = require('background/jsonStorage');

class BGStorage {
  constructor() {
    this._onMessage = this._onMessage.bind(this);
    messenger.subscribe('bgStorage', this._onMessage);
  }

  _onMessage(command, response = () => {}) {
    if (command.get) {
      response(jsonStorage.getItem(command.get));
    }

    if (command.set) {
      jsonStorage.setItem(command.set, typeof command.value === 'undefined' ? null : command.value);
      response(true);
    }

    if (command.remove) {
      jsonStorage.removeItem(command.remove);
      response(true);
    }
  }

}

module.exports = BGStorage;

},{"background/jsonStorage":183,"messenger/Background":127}],172:[function(require,module,exports){
"use strict";

class DistributionPartner {
  static initClass() {
    this.prototype.PARTNER_ID = 'SAUTH_partner_id'; // SAUTH due to legacy name in previous implementation

    this.prototype.NO_PARTNER = 'no_partner';
    this.prototype.COOKIE_URL_PARTNER_ID = 'https://www.avira.com';
    this.prototype.COOKIE_NAME_PARTNER_ID = 'av_abs_partner_id';
  }

  constructor(_storage, _navigator, _cookieAccessor) {
    this._storage = _storage;
    this._navigator = _navigator;
    this._cookieAccessor = _cookieAccessor;
  }

  getPartnerId(callback) {
    // expected format for Avira-branded Opera: "OPR/<version> (Edition Avira)"
    // e.g. "OPR/28.0.1750.51 (Edition Avira)"
    if (/^OPR.*Avira/.test(this._navigator.userAgent)) {
      return callback('Opera cobranded');
    }

    if (/AviraScout/.test(this._navigator.userAgent)) {
      return callback('Scout');
    }

    const partnerId = this._storage.getItem(this.PARTNER_ID);

    if (partnerId === this.NO_PARTNER) {
      return callback(null);
    }

    if (partnerId) {
      return callback(partnerId);
    }

    return this._getPartnerIdFromCookie(id => {
      this._storage.setItem(this.PARTNER_ID, id || this.NO_PARTNER);

      callback(id);
    });
  }

  _getPartnerIdFromCookie(callback) {
    return this._cookieAccessor.get(this.COOKIE_URL_PARTNER_ID, this.COOKIE_NAME_PARTNER_ID, cookie => callback(cookie != null && cookie.value || null));
  }

}

DistributionPartner.initClass();
module.exports = DistributionPartner;

},{}],173:[function(require,module,exports){
"use strict";

/* eslint-disable no-param-reassign */
const _ = require('underscore');

class ErrorCollector {
  constructor(mixpanel) {
    this.mixpanel = mixpanel;
  }

  addError(msg, category, params) {
    if (category == null) {
      category = '';
    }

    if (params == null) {
      params = {};
    }

    if (!this._filterError(msg, category, params)) {
      return;
    }

    let error = {
      message: msg.message || msg
    };

    if (category) {
      error.category = category;
    }

    error.timestamp = new Date().toISOString(); // Beware that true does not necessarly mean an established internet connection

    error.online = navigator.onLine;
    error = _.extend(error, params);
    this.mixpanel.track('Error', error);
  }

  _filterError(msg, category) {
    if (['Offers - whitelist'].includes(category)) {
      return Math.random() < 0.01;
    }

    return true;
  }

}

module.exports = ErrorCollector;

},{"underscore":156}],174:[function(require,module,exports){
"use strict";

class ExtensionLandingPage {
  constructor({
    landingPage,
    chrome,
    locale
  }) {
    if (!landingPage || !chrome) {
      throw new Error('Argument mismatch');
    }

    this.landingPage = landingPage;
    this.chrome = chrome;
    this.locale = locale;
  }

  openLandingPageTab(navLanguage) {
    const {
      url,
      path
    } = this.landingPage;
    return new Promise(resolve => {
      const languageCode = navLanguage.substring(0, 2);
      this.chrome.tabs.create({
        url: `${url}/${languageCode}/${path}`
      }, tabs => {
        resolve(tabs[0] || null);
      });
    });
  }

  initialize(newInstall) {
    const navLanguage = this.locale.getCurrentFallback();

    if (newInstall) {
      this.openLandingPageTab(navLanguage);
    }
  }

}

module.exports = ExtensionLandingPage;

},{}],175:[function(require,module,exports){
"use strict";

require("core-js/modules/es6.array.iterator.js");

require("core-js/modules/web.dom.iterable.js");

class ResourceVerifier {
  constructor() {
    this._requests = [];
    this._error = null;
  }

  _abortPendingRequests() {
    return Array.from(this._requests).forEach(request => {
      request.onreadystatechange = function callback() {};

      request.abort();
    });
  }

  _flushRequests() {
    this._requests = [];
  }

  _allRequestsFinished() {
    for (const request of Array.from(this._requests)) {
      if (request.readyState !== 4) {
        return false;
      }
    }

    return true;
  }

  verify(resources, resultCallback) {
    let currentReq;

    if (resources == null) {
      // eslint-disable-next-line no-param-reassign
      resources = [];
    }

    if (resultCallback == null) {
      // eslint-disable-next-line no-param-reassign
      resultCallback = () => {};
    }

    Array.from(resources).forEach((resourceUrl, resourceIdx) => {
      if (this._skipResourceUrl(resourceUrl)) {
        return;
      }

      this._requests[resourceIdx] = new XMLHttpRequest();
      currentReq = this._requests[resourceIdx];
      currentReq.resource_url = resourceUrl;
      currentReq.resource_verifier = this;

      currentReq.onreadystatechange = function callback() {
        // got headers back, but failed to start loading the resource
        if (this.readyState === 4 && this.status !== 200) {
          this.resource_verifier._error = {
            message: `At least one resource is unavailable: Failed to load ${this.resource_url} [${this.status}]`,
            code: this.status
          }; // eslint-disable-next-line no-console

          console.warn(this.resource_verifier._error.message);

          this.resource_verifier._abortPendingRequests();

          this.resource_verifier._flushRequests();

          resultCallback(this.resource_verifier._error);
          return;
        }

        if (this.resource_verifier._allRequestsFinished()) {
          this.resource_verifier._flushRequests();

          resultCallback();
        }
      };

      currentReq.open('GET', resourceUrl, true);
      currentReq.send();
    });
  }

  _skipResourceUrl(resourceUrl) {
    // see more details here: https://project.avira.org/browse/ABSTI-20
    const isFirefox = typeof chrome !== 'undefined' && typeof browser !== 'undefined' && typeof browser.runtime !== 'undefined' // eslint-disable-line no-undef
    && typeof browser.runtime.getBrowserInfo !== 'undefined'; // eslint-disable-line no-undef

    const parts = resourceUrl.split('/');
    const fileName = parts[parts.length - 1];
    const validFileNames = ['cms_ao2.js', 'cms_aon.js', 'cms_ass.js', 'cms_ss2.js', 'external-splashoffer.js', 'safeshopping.js'];
    return isFirefox && validFileNames.indexOf(fileName) !== -1;
  }

}

module.exports = ResourceVerifier;

},{"core-js/modules/es6.array.iterator.js":124,"core-js/modules/web.dom.iterable.js":126}],176:[function(require,module,exports){
"use strict";

const MixpanelBase = require('background/base/Mixpanel');

module.exports = MixpanelBase;

},{"background/base/Mixpanel":180}],177:[function(require,module,exports){
"use strict";

module.exports = {
  /**
   * @returns {Promise<string | null>}
   */
  run() {
    if (!chrome.runtime.onInstalled) {
      return Promise.resolve(null);
    }

    return new Promise(resolve => {
      // chrome.runtime.onInstalled is only called on install, update etc.
      // but not on browser or extension load. Resolve to false if it's not triggered
      const timeout = setTimeout(() => {
        resolve(null);
      }, 200);
      chrome.runtime.onInstalled.addListener(({
        reason
      }) => {
        clearTimeout(timeout);
        resolve(reason);
      });
    });
  },

  /**
   * @param {string | null} reason
   * @returns {boolean}
   */
  isNewInstall(reason) {
    return reason === 'install';
  },

  /**
   * @param {string | null} reason
   * @returns {boolean}
   */
  isUpdated(reason) {
    return reason === 'update';
  }

};

},{}],178:[function(require,module,exports){
"use strict";

module.exports = require('background/base/Settings');

},{"background/base/Settings":181}],179:[function(require,module,exports){
(function (global){(function (){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const sentry = require('sentry');

sentry.initialize();

require('whatwg-fetch');

const backgroundMessenger = require('messenger/Background').getInstance();

const tabAccessor = require('browser_accessors/TabAccessor').getInstance();

const config = require('config');

const guid = require('background/guid');

const Locale = require('Locale');

const AIMS = require('background/AIMS');

const DistributionPartner = require('background/DistributionPartner');

const appInfo = require('background/appInfo');

const Mixpanel = require('background/Mixpanel');

const cookieAccessor = require('browser_accessors/cookieAccessor');

const localStorage = require('background/localStorage').getInstance();

const BGStorage = require('background/BGStorage');

const migrations = require('background/migrations');

const settings = require('background/Settings').getInstance();

const ExtensionOnboarding = require('background/ExtensionOnboarding');

const NewInstallCheck = require('background/NewInstallCheck');

const ExtensionLandingPage = require('background/ExtensionLandingPage');

const offersInit = require('background/offersInit');

const safetyInit = require('background/safetyInit'); // NewInstallCheck.run needs to be run here because it needs to run
// right on the initalization of the background script and shouldn't be put in the event queue
// otherwise it won't work


const installReasonPromise = NewInstallCheck.run();

function initGlobals() {
  // needs to be accessible from outside
  global.ABS = {
    setConfigOverrides: config.setConfigOverrides,
    getConfigOverrides: config.getConfigOverrides,
    clearConfigOverrides: config.clearConfigOverrides
  };
}

localStorage.initialize().then(migrations.run).then(guid.load) // eslint-disable-next-line max-statements
.then(async () => {
  // PWM-9405 - remove uninstall survey
  try {
    chrome.runtime.setUninstallURL(config.storeURLs.uninstall, () => {
      // eslint-disable-next-line no-unused-expressions
      chrome.runtime.lastError;
    });
  } catch (e) {
    /** */
  }

  const installReason = await installReasonPromise;
  const newInstall = NewInstallCheck.isNewInstall(installReason);
  config.mergeOverrides();
  new BGStorage();
  settings.initialize();
  initGlobals();
  const aims = new AIMS(localStorage, config.aims);

  if (config.aims) {
    aims.initialize();
  }

  backgroundMessenger.subscribe('closeTab', (_, __, sender) => tabAccessor.close(sender.tab.id));
  backgroundMessenger.subscribe('reloadTab', (_, __, sender) => tabAccessor.reload(sender.tab.id));
  backgroundMessenger.subscribe('navigate', (request, __, sender) => tabAccessor.navigate(request.url, request.as_separate, request.tabId || sender.tab.id));
  backgroundMessenger.subscribe('getCurrentTab', (_, response) => {
    tabAccessor.getCurrentTabId(id => tabAccessor.getCurrentTabUrl(url => response({
      id,
      url
    })));
  }); // "sender" is passed due to IE-specific implementation of "TabAccessor.getCurrentTabUrl()"
  // (which proxies it to "getTopWindowLocationHref" event)

  backgroundMessenger.subscribe('TabAccessor:getCurrentUrl', (_, response, sender) => {
    tabAccessor.getCurrentTabUrl(url => response(url), sender);
  });
  const distributionPartner = new DistributionPartner(localStorage, navigator, cookieAccessor);
  const locale = new Locale(config, backgroundMessenger);
  const mixpanel = Mixpanel.getInstance({
    _config: config.mixpanel,
    _aims: aims,
    _partnerDistribution: distributionPartner,
    _newInstall: newInstall,
    _locale: locale,
    _appInfo: appInfo,
    _performanceStats: null
  });
  const mixpanelInitPromise = mixpanel.initialize();
  mixpanelInitPromise.catch(sentry.getUnhandledRejectionHandler('mixpanel'));
  offersInit({
    installReason,
    distributionPartner,
    aims,
    mixpanel
  });
  safetyInit({
    installReason,
    locale,
    mixpanel,
    aims
  });

  if (config.extensionLandingPage) {
    const extensionLandingPage = new ExtensionLandingPage(_objectSpread(_objectSpread({}, config.extensionLandingPage), {}, {
      chrome,
      locale
    }));
    extensionLandingPage.initialize(newInstall);
  }

  const extensionOnboarding = new ExtensionOnboarding(_objectSpread(_objectSpread({}, config.extensionOnboarding), {}, {
    chrome
  }));
  extensionOnboarding.initialize();
}).catch(sentry.getUnhandledRejectionHandler('global'));

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"@babel/runtime/helpers/defineProperty":15,"@babel/runtime/helpers/interopRequireDefault":18,"Locale":164,"background/AIMS":168,"background/BGStorage":171,"background/DistributionPartner":172,"background/ExtensionLandingPage":174,"background/ExtensionOnboarding":10,"background/Mixpanel":176,"background/NewInstallCheck":177,"background/Settings":178,"background/appInfo":9,"background/guid":182,"background/localStorage":2,"background/migrations":3,"background/offersInit":11,"background/safetyInit":185,"browser_accessors/TabAccessor":186,"browser_accessors/cookieAccessor":5,"config":188,"messenger/Background":127,"sentry":190,"whatwg-fetch":163}],180:[function(require,module,exports){
"use strict";

require("core-js/modules/es6.array.iterator.js");

require("core-js/modules/web.dom.iterable.js");

const mixpanelLibrary = require('mixpanel-lib');

const messenger = require('messenger/Background').getInstance();

const manifest = require('manifest.json');

const _ = require('underscore');

const ABTestDecider = require('background/ABTestDecider');

const AdguardDNTAnalyser = require('background/AdguardDNTAnalyser');

const settingsModel = require('background/Settings').getInstance();

const config = require('config');

const jsonStorage = require('background/jsonStorage');

const {
  captureException
} = require('sentry'); // this is here to avoid confusion with our custom localStorage module


const originalLocalStorage = localStorage;

class Mixpanel {
  static getInstance({
    _config,
    _aims,
    _partnerDistribution,
    _newInstall,
    _locale,
    _appInfo,
    _performanceStats
  } = {}) {
    if (!this.instance) {
      this.instance = new this(_config, _aims, _partnerDistribution, _newInstall, _locale, _appInfo, _performanceStats);
    }

    return this.instance;
  } // eslint-disable-next-line max-params


  constructor(_config, _aims, _partnerDistribution, _newInstall, _locale, _appInfo, _performanceStats = null) {
    this._scheduleActive = this._scheduleActive.bind(this);
    this._trackActive = this._trackActive.bind(this);
    this._getPerformanceProperties = this._getPerformanceProperties.bind(this);
    this._config = _config;
    this._aims = _aims;
    this._newInstall = _newInstall;
    this._partnerDistribution = _partnerDistribution;
    this._locale = _locale;
    this._appInfo = _appInfo;
    this._performanceStats = _performanceStats;
    this.disabled = settingsModel.get('inAppTracking') === false;
    this._gatedTracks = [];
    this._mixpanel = mixpanelLibrary({
      btoa: b => {
        // Remove after unhandled btoa promise rejections are figured out
        try {
          return btoa(b);
        } catch (e) {
          captureException(e, {
            extra: {
              context: 'Mixpanel',
              btoaInput: b
            }
          });
          throw e;
        }
      }
    });

    this._mixpanel.init(this._config.token);

    this._mixpanel.identify(this._aims.getUserId());
  }

  initialize() {
    this.gateOn();
    messenger.subscribe('Mixpanel:track', (request, response) => this.track(request.event, request.properties, response));
    return Promise.all(this.getPromises()).then(() => {
      this.gateOff();
      return this._trackInstall();
    }).then(installInfo => {
      this._scheduleActive();

      return installInfo;
    });
  }

  getPromises() {
    const pLocale = new Promise(resolve => this._locale.retrieve(resolve));
    const pPartner = new Promise(resolve => this._partnerDistribution.getPartnerId(resolve));
    const pTestParams = ABTestDecider.getInstance().getParameters().then(params => this._mixpanel.register(params));

    this._mixpanel.register({
      Version: manifest.version,
      Beta: this._appInfo.isBeta(),
      Nightly: this._appInfo.isNightly(),
      Product: this._appInfo.getProduct(),
      'Web Extension': this._appInfo.isWebExt(),
      'Language Navigator': this._locale.getBrowserLocale()
    });

    pLocale.then(absLocale => this._mixpanel.register({
      'Language ABS': absLocale
    }));
    pPartner.then(partnerId => this._mixpanel.register({
      'Partner Id': partnerId
    }));
    return [pLocale, pPartner, pTestParams];
  }

  disable() {
    this.disabled = true;
  }

  enable() {
    this.disabled = false;
  }

  gateOn() {
    this.gated = true;
  }

  gateOff() {
    this.gated = false;
    return this._flushGated();
  }

  _flushGated() {
    return (() => {
      let argList;
      const result = []; // eslint-disable-next-line no-cond-assign

      while (argList = this._gatedTracks.pop()) {
        result.push(this.track(...argList));
      }

      return result;
    })();
  }

  register(...args) {
    return this._mixpanel.register(...args);
  }

  track(event, properties, callback = () => {}) {
    if (this.disabled) {
      return callback();
    }

    if (this.gated) {
      return this._gatedTracks.push([event, properties, callback]);
    }

    return this._mixpanel.track(event, properties, callback);
  }

  getData(event, properties) {
    return this._mixpanel.getData(properties);
  }

  _writeInstall() {
    messenger.publish('bgStorage', {
      set: Mixpanel.INSTALL,
      value: true
    });
  }

  async _trackInstall() {
    const mixpanelInstall = jsonStorage.getItem(Mixpanel.INSTALL);

    const installTime = this._aims.getInstalled();

    if (mixpanelInstall) {
      return {
        newInstall: false,
        installTime
      };
    }

    originalLocalStorage.setItem(Mixpanel.INSTALL, 'true');
    const Source = await this._appInfo.getInstallationSource();

    const props = _.extend({}, this._getTrackingProperties(), {
      Source,
      'API Install Event': this._newInstall
    });

    this.track('Install', props, () => jsonStorage.setItem(Mixpanel.INSTALL, true));
    return {
      newInstall: true,
      installTime
    };
  }

  _scheduleActive() {
    const lastActiveEvent = jsonStorage.getItem(Mixpanel.ACTIVE);
    const active = parseInt(lastActiveEvent, 10) || 0;
    const cycle = this._config.active_cycle * 1000;
    const now = Date.now();
    const delta = active - now + cycle;

    if (delta > 0) {
      setTimeout(this._trackActive, delta);
    } else {
      this._trackActive();
    }
  }

  _getTrackingProperties() {
    return _.extend({
      'Has Offers': config.supportedSettings.offers
    }, settingsModel.toJSON(), this._getPerformanceProperties());
  }

  _trackActive() {
    const mixpanelLocalStorageValue = originalLocalStorage.getItem(Mixpanel.INSTALL);

    if (!mixpanelLocalStorageValue) {
      originalLocalStorage.setItem(Mixpanel.INSTALL, 'true');
    }

    const adguardDNTAnalyser = AdguardDNTAnalyser.getInstance();

    const properties = _.extend({
      'Lost localStorage': !mixpanelLocalStorageValue
    }, this._getTrackingProperties(), adguardDNTAnalyser.getActiveReport());

    this.track('Active', properties, () => {
      var _this$_performanceSta;

      (_this$_performanceSta = this._performanceStats) === null || _this$_performanceSta === void 0 ? void 0 : _this$_performanceSta.clear();
      jsonStorage.setItem(Mixpanel.ACTIVE, Date.now());

      this._scheduleActive();
    });
  }

  _getPerformanceProperties() {
    let i;
    const properties = {};

    if (!this._performanceStats) {
      return properties;
    }

    const iterable = this._performanceStats.getTotals();

    for (i = 0; i < iterable.length; i++) {
      const total = iterable[i];
      properties[`AUC Perf T${i}`] = total;
    }

    const iterable1 = this._performanceStats.getPercentages();

    for (i = 0; i < iterable1.length; i++) {
      const percentage = iterable1[i];
      properties[`AUC Perf P${i}`] = percentage;
    }

    return properties;
  }

}

Mixpanel.INSTALL = 'mixpanel_install';
Mixpanel.ACTIVE = 'mixpanel_active';
module.exports = Mixpanel;

},{"background/ABTestDecider":167,"background/AdguardDNTAnalyser":170,"background/Settings":178,"background/jsonStorage":183,"config":188,"core-js/modules/es6.array.iterator.js":124,"core-js/modules/web.dom.iterable.js":126,"manifest.json":192,"messenger/Background":127,"mixpanel-lib":136,"sentry":190,"underscore":156}],181:[function(require,module,exports){
"use strict";

require("core-js/modules/es6.array.iterator.js");

require("core-js/modules/web.dom.iterable.js");

const _ = require('underscore');

const messenger = require('messenger/Background').getInstance();

const jsonStorage = require('background/jsonStorage');

const DEFAULTS = require('SettingDefaults.json');

const DEPENDENCIES = require('Subsettings');

class Settings {
  static getInstance() {
    if (!this.instance) {
      this.instance = new this();
    }

    return this.instance;
  }

  constructor() {
    this.settingsKey = 'settings';
    this.attributes = {};

    this._initializeListeners();
  }

  _getStorage(key) {
    try {
      return jsonStorage.getItem(key) || {};
    } catch (e) {
      return {};
    }
  }

  _getSettingsStorage() {
    return this._getStorage(this.settingsKey);
  }

  _setStorage(key, value) {
    jsonStorage.setItem(key, value);
  }

  _setSettingsStorage(value) {
    this._setStorage(this.settingsKey, value);
  }

  _initializeListeners() {
    messenger.subscribe('Settings:get', (payload, response = () => {}) => {
      response(this._getSettings());
    });
    messenger.subscribe('Settings:set', (payload, response = () => {}) => {
      this.set(payload);
      response(this._getSettings());
    });
  }

  _getUpdatedSettings(currentSettings, newSettings) {
    return _.extend({}, currentSettings, newSettings);
  }

  _getChangedSettings(currentSettings, updatedSettings) {
    const equalKeys = _.reduce(currentSettings, (arr, val, prop) => {
      if (val === updatedSettings[prop]) {
        arr.push(prop);
      }

      return arr;
    }, []);

    return _.omit(updatedSettings, equalKeys);
  }

  _getSettings() {
    return _.mapObject(this.attributes, (val, key) => this.get(key));
  }

  _set(props) {
    const previousSettings = this._getSettings();

    this.attributes = this._getUpdatedSettings(this.attributes, props);

    const updatedSettings = this._getSettings();

    const changedSettings = this._getChangedSettings(previousSettings, updatedSettings);

    this._setSettingsStorage(this.attributes);

    if (this._initialized) {
      if (_.keys(changedSettings).length) {
        messenger.publish('Settings:change', changedSettings);
      }
    }

    return this;
  }

  initialize() {
    const existingSettings = this._getSettingsStorage();

    const setDefaultSettings = _.pick(DEFAULTS, _.difference(Object.keys(DEFAULTS), Object.keys(existingSettings)));

    if (!_.isEmpty(setDefaultSettings)) {
      messenger.publish('Settings:setDefaults', setDefaultSettings);
    }

    this.attributes = _.extend({}, DEFAULTS, existingSettings);

    this._setSettingsStorage(this.attributes);

    this._initialized = true;
  }

  get(key) {
    if (!this._initialized) {
      throw new Error('Trying to access settings without initializing');
    }

    const parentKey = DEPENDENCIES[key];
    return (!parentKey || this.get(parentKey)) && this.attributes[key];
  }

  set(...args) {
    if (!this._initialized) {
      throw new Error('Trying to access settings without initializing');
    }

    let props;

    if (args.length === 1 && _.isObject(args[0])) {
      props = args[0]; // eslint-disable-line prefer-destructuring
    } else if (typeof args[0] === 'string' && typeof args[1] !== 'undefined') {
      props = {
        [args[0]]: args[1]
      };
    } else {
      throw new Error('Incorrect arguments, expected object or key, value');
    }

    return this._set(props);
  }

  toJSON() {
    return _.clone(this.attributes);
  }

}

module.exports = Settings;

},{"SettingDefaults.json":165,"Subsettings":166,"background/jsonStorage":183,"core-js/modules/es6.array.iterator.js":124,"core-js/modules/web.dom.iterable.js":126,"messenger/Background":127,"underscore":156}],182:[function(require,module,exports){
"use strict";

const GUID_KEY = 'GUID_KEY';

const storage = require('chrome_emulation/storage').local;

const uuidv4 = require('uuid/v4');

let data = null;

function generate() {
  return uuidv4();
}

function checkLoaded() {
  if (!data) {
    throw new Error('GUID: not loaded');
  }
}

const load = function load() {
  return new Promise(resolve => {
    if (data) {
      return resolve(data);
    }

    return storage.get(GUID_KEY, items => {
      const rawData = items[GUID_KEY];

      if (typeof rawData === 'string') {
        try {
          data = JSON.parse(rawData);
        } catch (e) {
          data = {};
        }
      } else {
        data = rawData || {};
      }

      resolve(data);
    });
  });
};

const save = function save() {
  const items = {};
  items[GUID_KEY] = data;
  return storage.set(items);
};

const set = function set(key, guid) {
  data[key] = guid;
  return save();
};

const get = function get(key) {
  checkLoaded();
  let guid = data[key];

  if (!guid) {
    guid = generate();
    set(key, guid);
  }

  return guid;
};

module.exports = {
  load,
  get
};

},{"chrome_emulation/storage":187,"uuid/v4":162}],183:[function(require,module,exports){
"use strict";

const localStorage = require('background/localStorage').getInstance();

const jsonStorage = {
  getItem(key) {
    const val = localStorage.getItem(key);

    if (val != null) {
      return JSON.parse(val);
    }

    return val;
  },

  setItem(key, value) {
    return localStorage.setItem(key, JSON.stringify(value));
  },

  removeItem(key) {
    return localStorage.removeItem(key);
  },

  clear() {
    return localStorage.clear();
  }

};
module.exports = jsonStorage;

},{"background/localStorage":2}],184:[function(require,module,exports){
"use strict";

const config = require('config');

function isSupported() {
  return config.supportedSettings.offers;
}

module.exports = {
  isSupported
};

},{"config":188}],185:[function(require,module,exports){
"use strict";

module.exports = function init() {
  return Promise.resolve();
};

},{}],186:[function(require,module,exports){
"use strict";

module.exports = require('browser_accessors/base/TabAccessor');

},{"browser_accessors/base/TabAccessor":4}],187:[function(require,module,exports){
"use strict";

module.exports = chrome && chrome.storage;

},{}],188:[function(require,module,exports){
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

},{"background/localStorage":2,"configuration":8,"underscore":156}],189:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

require("core-js/modules/es6.array.iterator.js");

require("core-js/modules/web.dom.iterable.js");

require("core-js/modules/es6.array.sort.js");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/*
 * DS206: Consider reworking classes to avoid initClass
 */
const utils = require('utils');

const tld = require('tldjs');

const Locale = require('Locale');

const ResourceVerifierHelper = require('background/Helpers/ResourceVerifier');

const messenger = require('messenger/Background').getInstance();

const config = require('config');

const localStorage = require('background/localStorage').getInstance();

const tabAccessor = require('browser_accessors/TabAccessor').getInstance();

const extensionAccessor = require('browser_accessors/extensionAccessor');

const _ = require('underscore');

const asDetector = require('background/ASDetector').getInstance();

const ms = require('ms');

class Offers {
  static initClass() {
    this.prototype.WHITELIST_KEY = 'com.ciuvo.whitelist';
    this.prototype.WHITELIST_RETRY_INTERVAL = ms('5m') * (1 + Math.random()); // 5-10m

    this.prototype.WHITELIST_RETRY_INTERVAL_MAX = ms('1h');
    this.prototype.WHITELIST_RELOAD_INTERVAL = ms('1d');
    this.prototype.CURRENCY_FORMATS = {
      EUR: ['€', ',', true],
      USD: ['$', '.', false]
    };
    this.prototype.COUPON_TYPE = 'coupon';
    this.prototype.COUPON_SINGLE_TYPE = 'singleCoupon';
    this.prototype._tab_data = {};
    this.prototype._tab_request_data = {};
    this.prototype._tab_ready = {};
    this.prototype._tab_external_ready = {};
    this.prototype._tab_coupons = {};
    this.prototype._scraping_cache = {};
    this.prototype._browserStartOfferShown = false;
    this.prototype._darkMode = false;
  } // eslint-disable-next-line max-params


  constructor(apiURL, apiClient, apiKey, _rndsnr, instSrc, errorCollector) {
    this._onWhitelistLoaded = this._onWhitelistLoaded.bind(this);
    this._onContentReady = this._onContentReady.bind(this);
    this._onPageScraped = this._onPageScraped.bind(this);
    this._openCoupon = this._openCoupon.bind(this);
    this._sendCouponFeedback = this._sendCouponFeedback.bind(this);
    this._onReady = this._onReady.bind(this);
    this._onExternalReady = this._onExternalReady.bind(this);
    this._onGetData = this._onGetData.bind(this);
    this._getWhitelist = this._getWhitelist.bind(this);
    this._makeGetRequest = this._makeGetRequest.bind(this);
    this._makePostRequest = this._makePostRequest.bind(this);
    this._api_url = apiURL;
    this._api_client = apiClient;
    this._api_key = apiKey;
    this._rndsnr = _rndsnr;
    this._inst_src = instSrc;
    this._error_collector = errorCollector;
  }

  init() {
    utils.retry(this._getWhitelist, this._onWhitelistLoaded, this.WHITELIST_RETRY_INTERVAL, this.WHITELIST_RETRY_INTERVAL_MAX);
    asDetector.enable();
    messenger.subscribe('PUA:getData', this._onGetData);
    messenger.publish('Settings:get', 'dark_mode', value => {
      this._darkMode = value.dark_mode;
    });
    messenger.subscribe('Settings:change', changed => {
      if (changed.dark_mode != null) {
        this._darkMode = changed.dark_mode;
      }
    });
  }

  disable() {
    asDetector.disable();
  }

  _onWhitelistLoaded(err, data) {
    if (err) {
      return;
    }

    this._updateWhitelist(data);

    messenger.subscribe('AO:contentReady', this._onContentReady);
    messenger.subscribe('AO:pageScraped', this._onPageScraped);
    messenger.subscribe('AO:ready', this._onReady);
    messenger.subscribe('AO:externalReady', this._onExternalReady);
    messenger.subscribe('AO:openCoupon', this._openCoupon);
    messenger.subscribe('AO:couponFeedback', this._sendCouponFeedback);
    setInterval(() => this._getWhitelist((err1, data1) => {
      if (!err1) this._updateWhitelist(data1);
    }), this.WHITELIST_RELOAD_INTERVAL);
  }

  _onContentReady(request, response, sender) {
    // reset ready state and data for this tab,
    // otherwise if there was no data to publish tabReady could stay true
    this._tabReady(sender.tab.id, false);

    this._tabExternalReady(sender.tab.id, false);

    const {
      url
    } = request;

    if (asDetector.isAffiliateSource(sender.tab.id)) {
      response(null);
      return;
    }

    if (this._tabContainsCoupon(sender.tab.id)) {
      const data = this._tab_data[sender.tab.id];
      data.currentDomain = tld.getDomain(url);
      messenger.publish('AO:hasOffers', {
        external: this._isExternal(data),
        data
      }, null, sender);
      response(null);
      return;
    }

    this._tabData(sender.tab.id, null);

    this._tabRequestData(sender.tab.id, null);

    if (this._isWhitelisted(url)) {
      this._getScraping(url, (err, data) => response(err ? null : data));
    }

    if (!this._browserStartOfferShown) {
      this._onPageScraped(request, null, sender);
    }
  }

  _onPageScraped(request, response, sender) {
    let {
      data
    } = request;
    const {
      js_data
    } = request; // eslint-disable-line camelcase

    const {
      xpath_data
    } = request; // eslint-disable-line camelcase

    this._tabRequestData(sender.tab.id, data);

    if (!this._browserStartOfferShown) {
      this._browserStartOfferShown = true;
      data = _.extend({
        browserStartOffer: true
      }, data);
    }

    if (_.isEmpty(data) && _.isEmpty(js_data) && _.isEmpty(xpath_data)) {
      this._clearCurrentOffers(sender);

      return;
    }

    this._getOffers(request.url, data, js_data, xpath_data, (err, offersData) => {
      if (err) {
        return;
      }

      this._processOffers(sender, _objectSpread(_objectSpread({}, offersData), {}, {
        // added for whitelist feature
        // be careful on how to use this data as it is scared and not to be trusted
        // take care to properly escape it when introducing it to the DOM
        scrapedData: {
          data,
          js_data,
          xpath_data
        },
        meta: _objectSpread(_objectSpread({}, offersData.meta), {}, {
          domain: tld.getDomain(request.url)
        })
      }));
    });
  }

  _tabContainsCoupon(tabId) {
    const tabData = this._tabData(tabId);

    const offerType = tabData && tabData.items[0].offers[0].type;
    return offerType === this.COUPON_SINGLE_TYPE;
  }

  _couponMatchesDomain(data) {
    if (!data.couponDomain) {
      return true;
    }

    return data.couponDomain === data.currentDomain;
  }

  _openCoupon(coupon, response, sender) {
    const tabId = sender.tab.id;
    const url = coupon.url ? coupon.url : coupon.deep_link;
    tabAccessor.navigate(url, true, tabId, newTabId => {
      coupon.type = this.COUPON_SINGLE_TYPE; // use data from current tab for new tab, but replace items with single opened coupon

      const newTabData = _.extend({}, this._tab_coupons[tabId], {
        items: [{
          offers: [coupon]
        }],
        couponDomain: coupon.affiliate_domain ? tld.getDomain(coupon.affiliate_domain) : tld.getDomain(sender.tab.url)
      });

      this._tabData(newTabId, newTabData);
    });
  }

  _sendCouponFeedback({
    vote,
    slug
  }, response, sender) {
    this._makePostRequest('feedback', {}, {
      category: 'coupons',
      vote,
      slug,
      url: sender.tab.url
    }, (err, data) => {
      if (!err) {
        response(data);
      }
    });
  }

  _onReady(request, response, sender) {
    this._tabReady(sender.tab.id, true);

    this._tryPublishData(sender.tab.id);
  }

  _onExternalReady(request, response, sender) {
    this._tabExternalReady(sender.tab.id, request);

    this._tryPublishData(sender.tab.id);
  }

  _onGetData(request, response) {
    this._makeGetRequest('pua', {
      url: request.url
    }, (err, data) => {
      if (!err) {
        response(data);
      }
    });
  }

  _processOffers(sender, data) {
    if (!data.items[0] || !data.items[0].offers.length) {
      this._clearCurrentOffers(sender);

      return;
    }

    this._getTemplates(data.render.templates, (err, templates) => {
      if (err) {
        console.warn('Templates loading error'); // eslint-disable-line no-console

        return;
      }

      const {
        render: {
          html: {
            js: javascript,
            css: stylesheet
          },
          templates: template_ids // eslint-disable-line camelcase

        }
      } = data;

      const tabData = _objectSpread(_objectSpread({}, data), {}, {
        templates,
        template_ids,
        javascript,
        stylesheet
      });

      const mandatoryAssets = [tabData.stylesheet];

      if (!this._isExternal(tabData) || tabData.javascript) {
        mandatoryAssets.push(tabData.javascript);
      }

      new ResourceVerifierHelper().verify(mandatoryAssets, error => {
        if (error) {
          this._error_collector.addError(error.message, 'Offers - Resources');

          return;
        }

        this._tabData(sender.tab.id, tabData);

        this._tryPublishData(sender.tab.id);
      });
    });
  }

  _clearCurrentOffers(sender) {
    this._tabData(sender.tab.id, null);

    this._tabRequestData(sender.tab.id, null);

    messenger.publish('AO:data', {
      products: []
    }, null, sender);
  }

  _getWhitelist(callback) {
    this._makeGetRequest('whitelist', null, callback);
  }

  _updateWhitelist(data) {
    this._whitelist = _.map(data[this.WHITELIST_KEY], this._prepareWhitelistEntry);
  }

  _prepareWhitelistEntry(entry) {
    const prefix = '^';
    const postfix = entry.replace('://', '').indexOf('/') === -1 ? '/' : '';
    return new RegExp(`${prefix}${entry}${postfix}`);
  } // having "url.origin" as a key is sufficient to cache the scraping logic
  // (the same value is returned in "data.match")


  _getScraping(url, callback) {
    const cacheKey = new URL(url).origin; // check if the scraper exists and it's not expired

    if (typeof this._scraping_cache[cacheKey] === 'object') {
      const isValid = this._scraping_cache[cacheKey].expiration && this._scraping_cache[cacheKey].expiration > Date.now();

      if (isValid) {
        return callback(null, this._scraping_cache[cacheKey]);
      }
    }

    return this._makeGetRequest('analyze', {
      url,
      abs_version: extensionAccessor.getManifest().version
    }, (err, data) => {
      if (err) {
        return callback(err);
      } // set expiration date


      data.expiration = Date.now() + ms(`${data.expiration}s`);
      this._scraping_cache[cacheKey] = data;
      return callback(null, data);
    });
  } // eslint-disable-next-line max-params


  _getOffers(url, data, jsData, xpathData, callback) {
    const params = {
      url,
      abs_version: extensionAccessor.getManifest().version,
      dark_mode: this._darkMode
    };

    if (data) {
      params.data = JSON.stringify(data);
    }

    if (jsData) {
      params.js_data = JSON.stringify(jsData);
    }

    if (xpathData) {
      params.xpath_data = JSON.stringify(xpathData);
    }

    this._makeGetRequest('offers', params, callback);
  }

  _getCachedTemplates() {
    let templatesCached;

    try {
      templatesCached = JSON.parse(localStorage.getItem('templates_cached'));
    } catch (e) {
      templatesCached = {};
    }

    if (!templatesCached || typeof templatesCached !== 'object') {
      templatesCached = {};
    }

    return templatesCached;
  }

  _getTemplates(ids, callback) {
    let templatesCached;
    let idsFiltered = {};
    const ignoreCache = JSON.parse(localStorage.getItem('ignore_templates_cache'));

    if (ignoreCache) {
      templatesCached = {};
      idsFiltered = ids;
      console.log('templates caching is disabled'); // eslint-disable-line no-console
    } else {
      templatesCached = this._getCachedTemplates();
      idsFiltered = Object.entries(ids).reduce((p, [name, id]) => templatesCached[id] ? p : _objectSpread(_objectSpread({}, p), {}, {
        [name]: id
      }), {});
      const everythingCached = Object.keys(idsFiltered).length === 0;

      if (everythingCached) {
        this._passCachedTemplatesToCallback(templatesCached, ids, null, callback);

        return;
      }
    }

    new Locale(config, messenger).retrieve(language => this._makeGetRequest('template', {
      lng: language,
      renderer: JSON.stringify({
        templates: idsFiltered
      }),
      abs_version: extensionAccessor.getManifest().version
    }, (err, templates) => {
      Object.entries(templates).forEach(([name, template]) => {
        templatesCached[idsFiltered[name]] = template;
      });

      if (!ignoreCache) {
        localStorage.setItem('templates_cached', JSON.stringify(templatesCached));
      }

      this._passCachedTemplatesToCallback(templatesCached, ids, err, callback);
    }));
  } // eslint-disable-next-line max-params


  _passCachedTemplatesToCallback(templatesCached, index, err, callback) {
    const templates = Object.entries(index).reduce((p, [name, id]) => _objectSpread(_objectSpread({}, p), {}, {
      [name]: templatesCached[id]
    }), {});
    callback(err, templates);
  }

  _isWhitelisted(url) {
    return !!this._whitelist && this._whitelist.some(pattern => pattern.test(url));
  }

  _isExternal(data) {
    // condition to write an external iframe
    // the only (for now) case is GEMA block on youtube pages
    return data.render.external;
  }

  _tabRequestData(tabId, data) {
    if (data !== undefined) {
      this._tab_request_data[tabId] = data;
    }

    return this._tab_request_data[tabId] || null;
  }

  _tabData(tabId, data) {
    if (data !== undefined) {
      this._tab_data[tabId] = data;

      if (data && data.items[0].offers.some(prod => prod.type === this.COUPON_TYPE)) {
        this._tab_coupons[tabId] = data;
      }
    }

    return this._tab_data[tabId];
  }

  _tabReady(tabId, value) {
    if (value !== undefined) {
      this._tab_ready[tabId] = value;
    }

    return this._tab_ready[tabId];
  }

  _tabExternalReady(tabId, value) {
    if (value !== undefined) {
      this._tab_external_ready[tabId] = value;
    }

    return this._tab_external_ready[tabId];
  }

  _tryPublishData(tabId) {
    // eslint-disable-line complexity
    const data = this._tabData(tabId);

    const requestData = this._tabRequestData(tabId);

    const externalReady = this._tabExternalReady(tabId);

    const ready = this._tabReady(tabId);

    if (data) {
      const external = this._isExternal(data);

      messenger.publish('AO:hasOffers', {
        external,
        data
      }, null, {
        tab: {
          id: tabId
        }
      });
      messenger.publish('Iframe:showShadow', {
        property: 'box-shadow',
        value: '0px 10px 20px -10px rgba(0,0,0,0.3)'
      });

      if (external && !externalReady) {
        return;
      }

      if (!external && !ready) {
        return;
      }
    }

    if (!data) {
      return;
    }

    if (this._tabContainsCoupon(tabId) && !this._couponMatchesDomain(data)) {
      return;
    }

    this._publishData(tabId, data, requestData);
  }

  _publishData(tabId, data, requestData) {
    const products = data.items[0].offers.sort((a, b) => a.sortorder - b.sortorder);

    if (data.original_price && products.length) {
      products[0].total_saving = this._formatPrice(data.original_price - products[0].price, products[0].currency);
    }

    const channel = this._isExternal(data) ? 'AO:data#external' : 'AO:data';
    messenger.publish(channel, _.extend({
      products,
      requestData
    }, data), null, {
      tab: {
        id: tabId
      }
    });

    this._tabData(tabId, null);

    this._tabRequestData(tabId, null);
  }

  _normalizePrice(price) {
    if (price && typeof price.join === 'function') {
      price = price.join('');
    } // eslint-disable-line no-param-reassign


    if (typeof price !== 'string') {
      return null;
    }

    price = price.replace(/\s/g, ''); // eslint-disable-line no-param-reassign

    const m = /(\d+([.,]\d\d\d)*)([.,](\d\d))?/.exec(price);

    if (!m) {
      return null;
    }

    const full = parseInt(m[1].replace(/[.,]/g, ''), 10);
    const cents = m[4] ? parseInt(m[4], 10) : 0;
    return full * 100 + cents;
  }

  _formatPrice(price, currency) {
    const format = this.CURRENCY_FORMATS[currency] || [currency, '.', false];
    const full = Math.floor(price / 100);
    let cents = price % 100;

    if (cents < 10) {
      cents = `0${cents}`;
    }

    price = full + format[1] + cents; // eslint-disable-line no-param-reassign

    if (format[2]) {
      return `${price} ${format[0]}`;
    }

    return `${format[0]} ${price}`;
  }

  _makeGetRequest(type, queryParams, callback) {
    return this._makeRequest('GET', type, queryParams, null, callback);
  } // eslint-disable-next-line max-params


  _makePostRequest(type, queryParams, postData, callback) {
    return this._makeRequest('POST', type, queryParams, postData, callback);
  } // eslint-disable-next-line max-params


  _makeRequest(method, type, queryParams, postData, callback) {
    queryParams = _.extend({
      // eslint-disable-line no-param-reassign
      apiclient: this._api_client,
      apikey: this._api_key,
      rndsnr: this._rndsnr
    }, queryParams);

    if (this._inst_src) {
      queryParams.inst_src = this._inst_src;
    }

    const query = Object.keys(queryParams).reduce((a, k) => {
      a.push(`${k}=${encodeURIComponent(queryParams[k])}`);
      return a;
    }, []).join('&');
    const url = `${this._api_url}/${type}?${query}`;
    let body = null;
    const req = new XMLHttpRequest();
    req.open(method, url, true);

    if (method === 'POST') {
      req.setRequestHeader('Content-type', 'application/json;charset=UTF-8');
      body = JSON.stringify(postData);
    }

    req.onreadystatechange = () => {
      let responseData;

      if (req.readyState !== 4) {
        return;
      }

      if (req.status !== 200) {
        let params;
        callback(`Loading error ${type}:${req.status} - ${req.statusText}`, null);

        if (queryParams.url) {
          params = {
            domain: tld.getDomain(url)
          };
        } else {
          params = null;
        }

        if (this._error_collector) {
          this._error_collector.addError(`${req.status} - ${req.statusText}`, `Offers - ${type}`, params);
        }

        return;
      }

      try {
        responseData = JSON.parse(req.responseText);
      } catch (e) {
        callback('Response evaluation error', null);

        if (this._error_collector) {
          this._error_collector.addError(req.responseText, `Offers - ${type}`);
        }

        return;
      }

      callback(null, responseData);
    };

    req.send(body);
  }

}

Offers.initClass();
module.exports = Offers;

},{"@babel/runtime/helpers/defineProperty":15,"@babel/runtime/helpers/interopRequireDefault":18,"Locale":164,"background/ASDetector":169,"background/Helpers/ResourceVerifier":175,"background/localStorage":2,"browser_accessors/TabAccessor":186,"browser_accessors/extensionAccessor":6,"config":188,"core-js/modules/es6.array.iterator.js":124,"core-js/modules/es6.array.sort.js":125,"core-js/modules/web.dom.iterable.js":126,"messenger/Background":127,"ms":137,"tldjs":143,"underscore":156,"utils":191}],190:[function(require,module,exports){
"use strict";

const Sentry = require('@sentry/browser');

const config = require('config');

let initialized = false;

function initialize() {
  if (!config.sentry_dsn) return; // Exluding older browser versions we don't support

  try {
    // This also catches older Opera versions.
    if (parseInt(navigator.userAgent.match(/Chrome\/(\d*)/)[1], 10) <= 40) return;
  } catch (e) {// pass
  }

  initialized = true;
  Sentry.init({
    dsn: config.sentry_dsn,
    release: chrome.runtime.getManifest().version
  }); // only works on chrome

  window.addEventListener('unhandledrejection', err => {
    Sentry.captureException(err.reason);
  });
}

function getUnhandledRejectionHandler(context) {
  return e => {
    // eslint-disable-next-line no-console
    console.error(e);

    if (initialized) {
      Sentry.captureException(e, {
        extra: {
          context
        }
      });
    }

    return e;
  };
}

function captureException(...args) {
  if (initialized) {
    Sentry.captureException(...args);
  }
}

module.exports = {
  initialize,
  getUnhandledRejectionHandler,
  captureException
};

},{"@sentry/browser":26,"config":188}],191:[function(require,module,exports){
"use strict";

const _ = require('underscore'); // eslint-disable-next-line max-params


const retry = function retry(func, callback, delay, maxDelay, delayFactor) {
  // eslint-disable-next-line no-param-reassign
  if (delayFactor == null) {
    delayFactor = 2;
  }

  return func((err, data) => {
    if (err) {
      return _.delay(retry, delay, func, callback, Math.min(delayFactor * delay, maxDelay), maxDelay, delayFactor);
    }

    return callback(null, data);
  });
};

module.exports = {
  retry
};

},{"underscore":156}],192:[function(require,module,exports){
module.exports={
  "manifest_version": 2,
  "author": "Avira Operations GmbH & Co. KG",
  "default_locale": "en",
  "name": "__MSG_extName__",
  "description": "__MSG_extDescription__",
  "version": "4.1.0",
  "content_scripts": [
    {
      "matches": [
        "*://*/*"
      ],
      "js": [
        "js/content/common.js",
        "js/content/content.js"
      ],
      "css": [
        "css/content/content.css",
        "css/content/search.css"
      ]
    },
    {
      "js": [
        "js/content/jquery.js",
        "js/content/landingPage.js"
      ],
      "matches": [
        "http://*.avira.com/*",
        "https://*.avira.com/*"
      ]
    }
  ],
  "icons": {
    "16": "img/avira_icon16.png",
    "48": "img/avira_icon48.png",
    "128": "img/avira_icon128.png"
  },
  "background": {
    "scripts": [
      "js/background/background.js"
    ]
  },
  "browser_action": {
    "default_title": "__MSG_extName__",
    "default_icon": {
      "16": "img/avira_icon16.png",
      "19": "img/avira_icon19.png",
      "24": "img/avira_icon24.png",
      "32": "img/avira_icon32.png",
      "38": "img/avira_icon38.png"
    }
  },
  "permissions": [
    "tabs",
    "storage",
    "webRequest",
    "cookies",
    "unlimitedStorage",
    "http://*/*",
    "https://*/*"
  ],
  "web_accessible_resources": [
    "html/top.html",
    "html/external.html",
    "html/blocked.html",
    "html/blockedIFrame.html",
    "html/trackerNotification.html",
    "html/ExtPermNotification.html",
    "img/serp_info_safe.svg",
    "img/serp_info_unsafe.svg",
    "img/serp_info_warning.svg",
    "img/logo-avira-antivirus.png"
  ],
  "content_security_policy": "script-src 'self' http://localhost:4000 https://www.avira.com https://www.tt.avira.com https://*.offers.avira.com; object-src 'self'"
}

},{}]},{},[179]);
