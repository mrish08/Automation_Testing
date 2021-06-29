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

// AviraOffersNew Main JS
(function () {
  // Common methods for Ciuvo, Billiger and Ovisto
  var common = {
    notification: {},
    listing: {}
  };

  common.notification.beforeRender = function (data) {
    var product = data.products[0];
    var absVersion = data.meta.abs_version;
    var absRebrand = parseInt(absVersion) === 2;
    return {
      product: product,
      notification: data.notification,
      inStock: isInStock(product),
      isTopSeller: isTopSeller(product),
      productsLength: data.products.length,
      absRebrand: absRebrand,
      meta: data.meta
    };
  };

  common.notification.afterRender = function () {
    var showAklamio = $('.offers-share-earn').length === 1;

    if (showAklamio) {
      $('.pop-up-trigger').on('click', function () {
        setTimeout(function () {
          $('.indicator-group.offers a').removeClass('active');
        }, 80);
      });
      $('.offers-full-bar-container, .dash-offers').addClass('aklamio');
    }
  };

  function isInStock(product) {
    return product.availability_code === 'green';
  }

  function isTopSeller(product) {
    return parseInt(product.rating, 10) >= 4;
  }

  function containsCategory(products, category) {
    return _.some(products, function (item) {
      return item.category === category;
    });
  }

  function isCoupon(product) {
    return product.category === 'Coupon';
  }

  function isSpecialCoupon(product) {
    return product.category === 'SpecialCoupon'; // used for the Utility feed
  }
  /**
   * Returns a ordered list of the categories contained in products
   */


  function getCategories(products) {
    var CATEGORIES_ORDERED = ['Product', 'Similar', 'Auction', 'Coupon', 'SpecialCoupon'];
    return _.filter(CATEGORIES_ORDERED, function (category) {
      return containsCategory(products, category);
    });
  }

  function getIsCatalog(products) {
    var BILLIGER_CATALOG = ['imdb', 'hcgame', 'youtube', 'wiki', 'pinterest'];
    return _.some(products, function (item) {
      return _.contains(BILLIGER_CATALOG, item.catalog);
    });
  }

  function getCategoriesToShow(products, auction, showCoupons) {
    var categories = getCategories(products);
    var isCatalog = getIsCatalog(products);

    if (_.contains(categories, 'Coupon')) {
      if (showCoupons) {
        return ['Coupon'];
      } else if (_.contains(categories, 'Product')) {
        return ['Product'];
      } else if (_.contains(categories, 'Similar')) {
        return ['Similar'];
      }
    } else if (categories.length == 3) {
      categories = auction ? ['Product', 'Auction'] : ['Product', 'Similar'];
    } else if (categories[0] == 'Similar' && categories[1] == 'Auction') {
      categories = ['Similar'];
    }

    if (isCatalog && !_.contains(categories, 'Similar')) {
      categories.push('Similar');
    }

    return categories;
  }

  ;

  common.listing.beforeRender = function (data) {
    var data = _.clone(data);

    var products = _.sortBy(data.products, 'price');

    var showCoupons = location.hash == '#offers/coupons';
    var categoriesToShow = getCategoriesToShow(data.products, data.meta.auction, showCoupons);
    var hasCoupons = data.meta.coupons == 'true';
    var showAklamio = location.hash == '#offers/aklamio';
    var aklamioUrl = data.meta.aklamio_url;

    if (showAklamio) {
      $('#dashItemArea').removeClass('dash').addClass('overlay-wrapper');
    }

    var initialCategory = categoriesToShow[0];
    products = products.map(function (product) {
      product = _.clone(product);
      product.inStock = isInStock(product);
      product.isTopSeller = isTopSeller(product);
      product.isCoupon = isCoupon(product);
      product.isSpecialCoupon = isSpecialCoupon(product);
      product.ratingPercent = parseInt(product.rating, 10) / 5 * 100;

      if (product.isCoupon) {
        product.saving = product.value;
        product.label = product.name;
      }

      return product;
    });

    var firstProduct = _.filter(products, function (item) {
      return item.category === initialCategory;
    })[0];

    data.products = products;
    var isCatalog = getIsCatalog(products);

    _.extend(data, {
      showTabs: categoriesToShow.length > 1,
      showProducts: _.contains(categoriesToShow, 'Product'),
      showSimilar: _.contains(categoriesToShow, 'Similar'),
      showAuctions: _.contains(categoriesToShow, 'Auction'),
      showCoupons: _.contains(categoriesToShow, 'Coupon'),
      showSpecialCoupon: _.contains(categoriesToShow, 'SpecialCoupon'),
      initialCategory: categoriesToShow[0] + (isCatalog ? ' isCatalog' : ''),
      firstProduct: firstProduct,
      hasCoupons: hasCoupons,
      showAklamio: showAklamio,
      aklamioUrl: aklamioUrl
    });

    return data;
  };

  var feedbackGiven = false;

  common.listing.afterRender = function (elem) {
    var firstCategory = $('.offers-tabs-li:first a').attr('data-type');

    if (firstCategory) {
      showCategory(firstCategory);
    }

    $('.offers-tabs-li a').on('click', function (e) {
      e.preventDefault();
      var category = $(this).attr('data-type');
      showCategory(category);
    });

    if (feedbackGiven) {
      $('.oneclick-fdbk-form').hide();
      $('.oneclick-fdbk-success').show();
    }

    $('.oneclick-feedback button').on('click', function (e) {
      $('.oneclick-fdbk-form').fadeOut('fast', function () {
        $('.oneclick-fdbk-success').fadeIn('slow');
      });
      feedbackGiven = true;
    });
    var showAklamio = $('.offers-share-earn').length === 1;

    if (showAklamio) {
      $('.dash-offers').addClass('aklamio');
    }
  };

  function showCategory(category) {
    $('.offers-tabs-li').removeClass('offers-tabs-li-selected');
    $('#listing-holder').removeClass();
    $('.offers-tabs-li-' + category).addClass('offers-tabs-li-selected');
    $('#listing-holder').addClass('show-' + category);
  } // Ciuvo


  var ciuvo = {
    notification: {},
    listing: {}
  };

  ciuvo.notification.beforeRender = function (data) {
    var categoriesToShow = getCategoriesToShow(data.products, data.meta.auction);
    var initialCategory = categoriesToShow[0];

    var products = _.sortBy(_.filter(data.products, function (item) {
      return _.contains(categoriesToShow, item.category);
    }), 'price');

    var firstProduct = _.filter(products, function (item) {
      return item.category === initialCategory;
    })[0];

    var absVersion = data.meta.abs_version;
    var absRebrand = parseInt(absVersion) === 2;
    return {
      firstProduct: firstProduct,
      inStock: isInStock(firstProduct),
      isTopSeller: isTopSeller(firstProduct),
      offersNo: products.length,
      onlySimilar: initialCategory == 'Similar',
      absRebrand: absRebrand,
      meta: data.meta
    };
  };

  ciuvo.notification.afterRender = common.notification.afterRender;
  ciuvo.listing.beforeRender = common.listing.beforeRender;
  ciuvo.listing.afterRender = common.listing.afterRender;
  var coupons = {
    notification: {},
    listing: {},
    coupon: {},
    ftu: {}
  };

  coupons.notification.beforeRender = function (data) {
    var filteredData = _.clone(data),
        products = filteredData.products,
        sorted = _.sortBy(products, 'rating');

    var categoriesToShow = getCategoriesToShow(data.products);
    var category = categoriesToShow[0];
    filteredData.products = sorted;

    var first = _.first(filteredData.products, 1);

    var absVersion = data.meta.abs_version;
    var absRebrand = parseInt(absVersion) === 2; // Get Total Items Number

    var itemsNo = products.length;
    filteredData.notification.firstProduct = first[0];
    filteredData.notification.offersNo = itemsNo;
    filteredData.notification.category = category;
    filteredData.notification.absRebrand = absRebrand;
    return filteredData;
  };

  var singleCoupon = false;

  coupons.coupon.beforeRender = function (data) {
    singleCoupon = true;
    return data;
  };

  var copysuccess;

  coupons.coupon.afterRender = function () {
    function selectElementText(el) {
      var range = document.createRange(); // create new range object

      range.selectNodeContents(el); // set range to encompass desired element text

      var selection = window.getSelection(); // get Selection object from currently user selected text

      selection.removeAllRanges(); // unselect any user selected text (if any)

      selection.addRange(range); // add range to Selection object to select it
    }

    function copySelectionText() {
      try {
        copysuccess = document.execCommand("copy"); // run command to copy selected text to clipboard
      } catch (e) {
        copysuccess = false;
      }

      return copysuccess;
    }

    $('.copy-callback').on('click', function (e) {
      var para = document.getElementById('code');
      selectElementText(para); // select the element's text we wish to read

      copysuccess = copySelectionText(); // copy user selected text to clipboard

      $('.copy-callback span').fadeOut('slow', function (e) {
        $('.copy-success').delay(900).fadeIn('fast');
      });
    });

    if (copysuccess) {
      $('.copy-callback span').hide();
      $('.copy-success').show();
    }
  };

  coupons.ftu.beforeRender = function (data) {
    return _.extend({
      singleCoupon: singleCoupon
    }, data);
  };

  coupons.notification.afterRender = common.notification.afterRender;
  coupons.listing.beforeRender = common.listing.beforeRender;
  coupons.listing.afterRender = common.listing.afterRender; // Billiger

  var billiger = {
    notification: {},
    listing: {}
  };
  billiger.notification.beforeRender = common.notification.beforeRender;
  billiger.listing.beforeRender = common.listing.beforeRender;
  billiger.listing.afterRender = common.listing.afterRender; // Ovisto

  var ovisto = {
    notification: {},
    listing: {}
  };
  ovisto.notification.beforeRender = common.notification.beforeRender;
  ovisto.listing.beforeRender = common.listing.beforeRender;
  ovisto.listing.afterRender = common.listing.afterRender; // Coupons with Offers

  var couponsWithOffers = {
    notification: {},
    listing: {},
    coupon: {},
    ftu: {}
  };

  couponsWithOffers.notification.beforeRender = function (data) {
    var categoriesToShow = getCategoriesToShow(data.products);
    var initialCategory = categoriesToShow[0];

    var products = _.sortBy(_.filter(data.products, function (item) {
      return _.contains(categoriesToShow, item.category);
    }), 'price');

    var productItems = _.filter(products, function (item) {
      return item.category === initialCategory;
    });

    var firstProduct = productItems[0];
    var hasCoupons, offersNo;

    if (data.meta.coupons == 'true') {
      hasCoupons = true;
      offersNo = productItems.length;
    } else {
      hasCoupons = false;
      offersNo = products.length;
    }

    var absVersion = data.meta.abs_version;
    var absRebrand = parseInt(absVersion) === 2;
    var aklamioUrl = data.meta.aklamio_url;
    var logoAbTest = data.meta.icon_animation;
    /*if (AbTestVersion == 'animate') {
      logoAbTest = true;
    } else {
      logoAbTest = false;
    }*/

    return {
      firstProduct: firstProduct,
      inStock: isInStock(firstProduct),
      isTopSeller: isTopSeller(firstProduct),
      hasCoupons: hasCoupons,
      offersNo: offersNo,
      absRebrand: absRebrand,
      aklamioUrl: aklamioUrl,
      logoAbTest: logoAbTest,
      meta: data.meta
    };
  };

  couponsWithOffers.notification.afterRender = function () {
    $('.triggers').on('hover', function () {
      $(this).addClass('active');
    });
  };

  couponsWithOffers.ftu.beforeRender = function (data) {
    return {
      hasCoupons: data.meta.coupons == 'true',
      singleCoupon: singleCoupon,
      meta: data.meta
    };
  };

  couponsWithOffers.notification.beforeRender = couponsWithOffers.notification.beforeRender;
  couponsWithOffers.notification.afterRender = common.notification.afterRender;
  couponsWithOffers.listing.beforeRender = common.listing.beforeRender;
  couponsWithOffers.listing.afterRender = common.listing.afterRender;
  ABS.run(function (offers_config) {
    offers_config.templates = {
      // Keeping these for fallback
      tpl_notification_0081: ciuvo.notification,
      tpl_listing_0081: ciuvo.listing,
      tpl_notification_0082: ciuvo.notification,
      tpl_listing_0082: ciuvo.listing,
      tpl_notification_009: billiger.notification,
      tpl_listing_009: billiger.listing,
      tpl_notification_003: ovisto.notification,
      tpl_listing_003: ovisto.listing,
      tpl_notification_0031: ovisto.notification,
      tpl_listing_0031: ovisto.listing,
      tpl_notification_0032: ovisto.notification,
      tpl_listing_0032: ovisto.listing,
      tpl_notification_full_ciuvo: ciuvo.notification,
      tpl_listing_full_ciuvo: ciuvo.listing,
      tpl_notification_full_billiger: billiger.notification,
      tpl_listing_full_billiger: billiger.listing,
      tpl_notification_full_ovisto: ovisto.notification,
      tpl_listing_full_ovisto: ovisto.listing,
      // New templates
      tpl_notification_ciuvo: ciuvo.notification,
      tpl_notification_coupons: coupons.notification,
      tpl_notification_coupons_and_offers: couponsWithOffers.notification,
      tpl_notification_billiger: common.notification,
      tpl_notification_ovisto: common.notification,
      tpl_notification_splashoffer: common.notification,
      tpl_notification_utilities: common.notification,
      tpl_listing: common.listing,
      tpl_listing_coupons: common.listing,
      tpl_listing_coupons_and_offers: common.listing,
      tpl_coupon_single: coupons.coupon,
      tpl_ftu_coupons: coupons.ftu,
      tpl_ftu_coupons_and_offers: couponsWithOffers.ftu
    };
  });
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
    if (m && parseInt(m[1], 10) < 53) return; // Make sure we are in webext

    if (!(chrome && chrome.runtime && chrome.runtime.sendMessage)) return;
    $(root).on('click', 'a[target=_blank][href]', function (e) {
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

  fixBrokenFirefoxLinks(document.body);
})();

},{}]},{},[1]);
