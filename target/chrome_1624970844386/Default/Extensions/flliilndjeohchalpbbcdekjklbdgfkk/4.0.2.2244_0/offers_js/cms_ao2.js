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

// Main JS
ABS.run(function (offers_config) {
  offers_config.templates = {
    tpl_notification_001: {
      beforeRender: function (data) {
        return data;
      },
      afterRender: function (elem) {}
    },
    tpl_listing_001: {
      beforeRender: function (data) {
        best = data.products[0];

        if (best) {
          best.best = true;
        }

        return data;
      },
      afterRender: function (el) {
        visualizeRating(el);

        function visualizeRating(el) {
          var $el = $(el),
              $rating_bar = $el.find('.rating-bar');
          $rating_bar.each(function (i, rating_bar) {
            var $bar = $(rating_bar),
                rating,
                rating_percent;
            rating = parseFloat($bar.data('rating'));
            rating_percent = rating / 5 * 100;
            $bar.find('.offer-affiliate-rating-slider').css('width', rating_percent + '%');
          });
        }
      },
      onShow: function (el) {
        pushOffersTogether(el);

        function pushOffersTogether(el) {
          // from CoffeeScript
          var $offers,
              cols,
              get_item_offset,
              i,
              items_in_last_row,
              last_item_index,
              shift_item,
              space_between,
              __slice = [].slice,
              $el = $(el);
          $offers = $el.find('.offer').slice(1).css('top', 'initial');

          if ($offers.length > 2 && $offers.eq(0).position().top === $offers.eq(2).position().top) {
            cols = 3;
          } else {
            cols = 2;
          }

          space_between = 40;

          shift_item = function () {
            var $offer, index, min_offset, over, x;
            index = arguments[0], over = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
            $offer = $($offers[index]);
            min_offset = Math.min.apply(Math, function () {
              var _i, _len, _results;

              _results = [];

              for (_i = 0, _len = over.length; _i < _len; _i++) {
                x = over[_i];

                _results.push(get_item_offset($offer, $($offers[x])));
              }

              return _results;
            }());
            return $offer.css('top', "-" + min_offset + "px");
          };

          get_item_offset = function ($offer, $over) {
            return $offer.offset().top - $over.outerHeight() - $over.offset().top - space_between;
          };

          items_in_last_row = $offers.length % cols;
          i = cols;

          while (i < $offers.length - items_in_last_row) {
            shift_item(i, i - cols);
            i++;
          }

          if ($offers.length > cols) {
            last_item_index = $offers.length - 1;

            if (items_in_last_row === 1) {
              shift_item(last_item_index, last_item_index - 2);
            }

            if (items_in_last_row === 2) {
              shift_item(last_item_index, last_item_index - 2, last_item_index - 3);
              return shift_item(last_item_index - 1, last_item_index - 3, last_item_index - 4);
            }
          }
        }
      }
    },
    // New design templates
    tpl_listing_002: {
      beforeRender: function (data) {
        return data;
      },
      afterRender: function (elem) {
        visualizeRating(elem);

        function visualizeRating(elem) {
          var $el = $(elem),
              $rating_bar = $el.find('.rating-bar');
          $rating_bar.each(function (i, rating_bar) {
            var $bar = $(rating_bar),
                rating,
                rating_percent;
            rating = parseFloat($bar.data('rating'));
            rating_percent = rating / 5 * 100;
            $bar.find('.offer-affiliate-rating-slider').css('width', rating_percent + '%');
          });
        }
      }
    },
    tpl_notification_002: {
      beforeRender: function (data) {
        productsLength = data.products.length;
        return data;
      },
      afterRender: function (elem) {
        $(elem).find('.products-length').text(productsLength);
      }
    },
    tpl_best_002: {
      beforeRender: function (data) {
        best = data.products[0];

        if (best) {
          best.best = true;
        }

        return data;
      },
      afterRender: function (el) {
        visualizeRating(el);

        function visualizeRating(el) {
          var $el = $(el),
              $rating_bar = $el.find('.rating-bar');
          $rating_bar.each(function (i, rating_bar) {
            var $bar = $(rating_bar),
                rating,
                rating_percent;
            rating = parseFloat($bar.data('rating'));
            rating_percent = rating / 5 * 100;
            $bar.find('.offer-affiliate-rating-slider').css('width', rating_percent + '%');
          });
        }
      }
    },
    tpl_listing_003: {
      beforeRender: function (data) {
        return data;
      },
      afterRender: function (elem) {
        visualizeRating(elem);

        function visualizeRating(elem) {
          var $el = $(elem),
              $rating_bar = $el.find('.rating-bar');
          $rating_bar.each(function (i, rating_bar) {
            var $bar = $(rating_bar),
                rating,
                rating_percent;
            rating = parseFloat($bar.data('rating'));
            rating_percent = rating / 5 * 100;
            $bar.find('.offer-affiliate-rating-slider').css('width', rating_percent + '%');
          });
        }
      }
    },
    tpl_notification_003: {
      beforeRender: function (data) {
        productsLength = data.products.length;
        return data;
      },
      afterRender: function (elem) {
        $(elem).find('.products-length').text(productsLength);
      }
    },
    tpl_best_003: {
      beforeRender: function (data) {
        best = data.products[0];

        if (best) {
          best.best = true;
        }

        return data;
      },
      afterRender: function (el) {
        visualizeRating(el);

        function visualizeRating(el) {
          var $el = $(el),
              $rating_bar = $el.find('.rating-bar');
          $rating_bar.each(function (i, rating_bar) {
            var $bar = $(rating_bar),
                rating,
                rating_percent;
            rating = parseFloat($bar.data('rating'));
            rating_percent = rating / 5 * 100;
            $bar.find('.offer-affiliate-rating-slider').css('width', rating_percent + '%');
          });
        }
      }
    },
    // New templates with Top Seller
    // and In Stock icons
    // + coupons
    tpl_listing_004: {
      beforeRender: function (data) {
        hasOffers = data.products[0].hasOffers;
        hasCoupons = data.products[0].hasCoupons;
        return data;
      },
      afterRender: function (elem) {
        visualizeRating(elem);
        offersItems = $(elem).find('.offers-item');
        offersItems.each(function (i) {
          item_availability = $(this).find('.availability_code').text();
          item_rating = parseInt($(this).find('.item-rating').data('rating'));
          item_isCoupon = $(this).find('.templateref').text();

          if (item_availability == 'green') {
            $(this).find('.tag-stock').show();
          }

          if (item_rating >= 4 && item_availability != 'green') {
            $(this).find('.tag-stock').hide();
            $(this).find('.tag-topseller').show();
          }

          if (item_isCoupon === 'voucher') {
            $(this).find('.tag-stock').hide();
            $(this).find('.tag-topseller').hide();
            $(this).find('.tag-coupon').show();
          } // Hide vouchers if we have both vouchers and offers


          if ($(this).hasClass('voucher') && hasOffers !== undefined) {
            $(this).hide();
          }
        }); // If we only have coupons, hide all other offers

        if ((!hasOffers || hasOffers === undefined) && hasCoupons) {
          $(elem).find('.offers-item:not(".voucher")').hide();
        } // Offers sort by offers/coupons


        $('.offers-tabs > li a').on('click', function (e) {
          $('.offers-tabs li').removeClass('offers-tabs-li-selected');
          $(this).parent().addClass('offers-tabs-li-selected');
          e.preventDefault();
        });
        $('a[href="#offers-all"]').on('click', function (e) {
          $(elem).find('.offers-item').show();
          $(elem).find('.voucher').show();
        });
        $('a[href="#offers-coupons"]').on('click', function (e) {
          $(elem).find('.offers-item').hide();
          $(elem).find('.voucher').show();
        });
        $('a[href="#offers-offers"]').on('click', function (e) {
          $(elem).find('.offers-item').show();
          $(elem).find('.voucher').hide();
        });

        function visualizeRating(elem) {
          var $el = $(elem),
              $rating_bar = $el.find('.rating-bar');
          $rating_bar.each(function (i, rating_bar) {
            var $bar = $(rating_bar),
                rating,
                rating_percent;
            rating = parseFloat($bar.data('rating'));
            rating_percent = rating / 5 * 100;
            $bar.find('.offer-affiliate-rating-slider').css('width', rating_percent + '%');
          });
        }
      }
    },
    tpl_notification_004: {
      beforeRender: function (data) {
        shopRating = parseInt(data.products[0].rating);
        productAvailability = data.products[0].availability_code;
        productsLength = data.products.length;
        hasOffers = data.products[0].hasOffers;
        hasCoupons = data.products[0].hasCoupons;
        return data;
      },
      afterRender: function (elem) {
        $(elem).find('.products-length').text(productsLength);

        if (productAvailability == 'green') {
          $(elem).find('.label-stock-seller').show();
          $(elem).find('.tag-stock').show();
        }

        if (shopRating >= 4 && productAvailability != 'green') {
          $(elem).find('.label-stock-seller').show();
          $(elem).find('.tag-stock').hide();
          $(elem).find('.tag-topseller').show();
        }
      }
    },
    tpl_best_004: {
      beforeRender: function (data) {
        best = data.products[0];

        if (best) {
          best.best = true;
        }

        return data;
      },
      afterRender: function (el) {
        visualizeRating(el);

        function visualizeRating(el) {
          var $el = $(el),
              $rating_bar = $el.find('.rating-bar');
          $rating_bar.each(function (i, rating_bar) {
            var $bar = $(rating_bar),
                rating,
                rating_percent;
            rating = parseFloat($bar.data('rating'));
            rating_percent = rating / 5 * 100;
            $bar.find('.offer-affiliate-rating-slider').css('width', rating_percent + '%');
          });
        }
      }
    },
    // New Template for Travel
    tpl_listing_005: {
      beforeRender: function (data) {
        return data;
      },
      afterRender: function (elem) {
        visualizeRating(elem);

        function visualizeRating(elem) {
          var $el = $(elem),
              $rating_bar = $el.find('.rating-bar');
          $rating_bar.each(function (i, rating_bar) {
            var $bar = $(rating_bar),
                rating,
                rating_percent;
            rating = parseFloat($bar.data('rating'));
            rating_percent = rating / 5 * 100;
            $bar.find('.offer-affiliate-rating-slider').css('width', rating_percent + '%');
          });
        }
      }
    },
    tpl_notification_005: {
      beforeRender: function (data) {
        productsLength = data.products.length;
        return data;
      },
      afterRender: function (elem) {
        $(elem).find('.products-length').text(productsLength);
      }
    },
    tpl_best_005: {
      beforeRender: function (data) {
        best = data.products[0];

        if (best) {
          best.best = true;
        }

        return data;
      },
      afterRender: function (el) {
        visualizeRating(el);

        function visualizeRating(el) {
          var $el = $(el),
              $rating_bar = $el.find('.rating-bar');
          $rating_bar.each(function (i, rating_bar) {
            var $bar = $(rating_bar),
                rating,
                rating_percent;
            rating = parseFloat($bar.data('rating'));
            rating_percent = rating / 5 * 100;
            $bar.find('.offer-affiliate-rating-slider').css('width', rating_percent + '%');
          });
        }
      }
    },
    // New templates with Top Seller
    // and In Stock icons
    // + coupons
    // + sorting by rating when there is no saving
    tpl_listing_006: {
      beforeRender: function (data) {
        hasOffers = data.products[0].hasOffers;
        hasCoupons = data.products[0].hasCoupons;
        /*	function f() {
        }
        f.prototype = data;
        data = new f();
        data.products = data.products.slice(0);
        function sortOffers(objArray, prop, direction){
        if (arguments.length<2) throw new Error("sortOffers requires 2 arguments");
        var direct = arguments.length>2 ? arguments[2] : 1; //Default to ascending
        if (objArray && objArray.constructor===Array){
        var propPath = (prop.constructor===Array) ? prop : prop.split(".");
        objArray.sort(function(a,b){
        for (var p in propPath){
        if (a[propPath[p]] && b[propPath[p]]){
        a = a[propPath[p]];
        b = b[propPath[p]];
        }
        }
        // convert numeric strings to integers
        a = a.match(/^\d+$/) ? +a : a;
        b = b.match(/^\d+$/) ? +b : b;
        return ( (a < b) ? -1*direct : ((a > b) ? 1*direct : 0) );
        });
        }
        }
        */

        /*if ( !data.products[0].saving ) {
        sortOffers(data.products, 'rating', -1);
        }*/

        return data;
      },
      afterRender: function (elem) {
        visualizeRating(elem);
        offersItems = $(elem).find('.offers-item');
        offersItems.each(function (i) {
          item_availability = $(this).find('.availability_code').text();
          item_rating = parseInt($(this).find('.item-rating').data('rating'));
          item_isCoupon = $(this).find('.templateref').text();

          if (item_availability == 'green') {
            $(this).find('.tag-stock').show();
          }

          if (item_rating >= 4 && item_availability != 'green') {
            $(this).find('.tag-stock').hide();
            $(this).find('.tag-topseller').show();
          }

          if (item_isCoupon === 'voucher') {
            $(this).find('.tag-stock').hide();
            $(this).find('.tag-topseller').hide();
            $(this).find('.tag-coupon').show();
          } // Hide vouchers if we have both vouchers and offers


          if ($(this).hasClass('voucher') && hasOffers !== undefined) {
            $(this).hide();
          }
        }); // If we only have coupons, hide all other offers

        if ((!hasOffers || hasOffers === undefined) && hasCoupons) {
          $(elem).find('.offers-item:not(".voucher")').hide();
        } // Offers sort by offers/coupons


        $('.offers-tabs > li a').on('click', function (e) {
          $('.offers-tabs li').removeClass('offers-tabs-li-selected');
          $(this).parent().addClass('offers-tabs-li-selected');
          e.preventDefault();
        });
        $('a[href="#offers-all"]').on('click', function (e) {
          $(elem).find('.offers-item').show();
          $(elem).find('.voucher').show();
        });
        $('a[href="#offers-coupons"]').on('click', function (e) {
          $(elem).find('.offers-item').hide();
          $(elem).find('.voucher').show();
        });
        $('a[href="#offers-offers"]').on('click', function (e) {
          $(elem).find('.offers-item').show();
          $(elem).find('.voucher').hide();
        });

        function visualizeRating(elem) {
          var $el = $(elem),
              $rating_bar = $el.find('.rating-bar');
          $rating_bar.each(function (i, rating_bar) {
            var $bar = $(rating_bar),
                rating,
                rating_percent;
            rating = parseFloat($bar.data('rating'));
            rating_percent = rating / 5 * 100;
            $bar.find('.offer-affiliate-rating-slider').css('width', rating_percent + '%');
          });
        }
      }
    },
    tpl_notification_006: {
      beforeRender: function (data) {
        shopRating = parseInt(data.products[0].rating);
        productAvailability = data.products[0].availability_code;
        productsLength = data.products.length;
        hasOffers = data.products[0].hasOffers;
        hasCoupons = data.products[0].hasCoupons;
        return data;
      },
      afterRender: function (elem) {
        $(elem).find('.products-length').text(productsLength);

        if (productAvailability == 'green') {
          $(elem).find('.label-stock-seller').show();
          $(elem).find('.tag-stock').show();
        }

        if (shopRating >= 4 && productAvailability != 'green') {
          $(elem).find('.label-stock-seller').show();
          $(elem).find('.tag-stock').hide();
          $(elem).find('.tag-topseller').show();
        }
      }
    },
    tpl_best_006: {
      beforeRender: function (data) {
        best = data.products[0];

        if (best) {
          best.best = true;
        }

        return data;
      },
      afterRender: function (el) {
        visualizeRating(el);

        function visualizeRating(el) {
          var $el = $(el),
              $rating_bar = $el.find('.rating-bar');
          $rating_bar.each(function (i, rating_bar) {
            var $bar = $(rating_bar),
                rating,
                rating_percent;
            rating = parseFloat($bar.data('rating'));
            rating_percent = rating / 5 * 100;
            $bar.find('.offer-affiliate-rating-slider').css('width', rating_percent + '%');
          });
        }
      }
    },
    // New templates with Simillar Products
    // and Products Image
    // + coupons
    // + sorting by rating when there is no saving
    tpl_listing_007: {
      beforeRender: function (data) {
        hasOffers = data.products[0].hasOffers;
        hasCoupons = data.products[0].hasCoupons;
        /*function f() {
        }
        f.prototype = data;
        data = new f();
        data.products = data.products.slice(0);*/

        /*	function sortOffers(objArray, prop, direction){k
        if (arguments.length<2) throw new Error("sortOffers requires 2 arguments");
        var direct = arguments.length>2 ? arguments[2] : 1; //Default to ascending
        if (objArray && objArray.constructor===Array){
        var propPath = (prop.constructor===Array) ? prop : prop.split(".");
        objArray.sort(function(a,b){
        for (var p in propPath){
        if (a[propPath[p]] && b[propPath[p]]){
        a = a[propPath[p]];
        b = b[propPath[p]];
        }
        }
        // convert numeric strings to integers
        a = a.match(/^\d+$/) ? +a : a;
        b = b.match(/^\d+$/) ? +b : b;
        return ( (a < b) ? -1*direct : ((a > b) ? 1*direct : 0) );
        });
        }
        }*/

        /*if ( !data.products[0].saving ) {
        sortOffers(data.products, 'rating', -1);
        }*/

        return data;
      },
      afterRender: function (elem) {
        visualizeRating(elem);
        offersItems = $(elem).find('.offers-item');
        offersItems.each(function (i) {
          item_availability = $(this).find('.availability_code').text();
          item_rating = parseInt($(this).find('.item-rating').data('rating'));
          item_isCoupon = $(this).find('.templateref').text();

          if (item_availability == 'green') {
            $(this).find('.tag-stock').show();
          }

          if (item_rating >= 4 && item_availability != 'green') {
            $(this).find('.tag-stock').hide();
            $(this).find('.tag-topseller').show();
          }

          if (item_isCoupon === 'voucher') {
            $(this).find('.tag-stock').hide();
            $(this).find('.tag-topseller').hide();
            $(this).find('.tag-coupon').show();
          } // Hide vouchers if we have both vouchers and offers


          if ($(this).hasClass('voucher') && hasOffers !== undefined) {
            $(this).hide();
          }
        }); // If we only have coupons, hide all other offers

        if ((!hasOffers || hasOffers === undefined) && hasCoupons) {
          $(elem).find('.offers-item:not(".voucher")').hide();
        } //Get template name and show product from that template


        function getTabType(e) {
          var dataType = e.attr("data-type");
          $('#listing-holder').removeClass();
          $('#listing-holder').addClass("show-" + dataType);
        }

        var similarNo = $('#listing-holder').find(".Similar").length;
        var relatedNo = $('#listing-holder').find(".Mutation").length;
        var productNo = $('#listing-holder').find(".Product").length; //Check if we have lists and show tab for list

        if (similarNo > 0) {
          $(".offers-tabs-li-Similar").addClass("show-tab");
        }

        if (relatedNo > 0) {
          $(".offers-tabs-li-Mutation").addClass("show-tab");
        }

        if (productNo > 0) {
          $(".offers-tabs-li-Product").addClass("show-tab");
        } //Select first LI from List


        $(".offers-tabs").find(".show-tab:first").addClass("offers-tabs-li-selected"); //Load first show-tab list

        getTabType($(".offers-tabs").find(".show-tab:first a")); // Offers sort by offers/coupons

        $('.offers-tabs > li a').on('click', function (e) {
          $('.offers-tabs li').removeClass('offers-tabs-li-selected');
          $(this).parent().addClass('offers-tabs-li-selected');
          e.preventDefault();
          getTabType($(this));
        });

        function visualizeRating(elem) {
          var $el = $(elem),
              $rating_bar = $el.find('.rating-bar');
          $rating_bar.each(function (i, rating_bar) {
            var $bar = $(rating_bar),
                rating,
                rating_percent;
            rating = parseFloat($bar.data('rating'));
            rating_percent = rating / 5 * 100;
            $bar.find('.offer-affiliate-rating-slider').css('width', rating_percent + '%');
          });
        }
      }
    },
    tpl_notification_007: {
      beforeRender: function (data) {
        shopRating = parseInt(data.products[0].rating);
        productAvailability = data.products[0].availability_code;
        productsLength = data.products.length;
        hasOffers = data.products[0].hasOffers;
        hasCoupons = data.products[0].hasCoupons;
        catalog = data.products[0].catalog;
        return data;
      },
      afterRender: function (elem) {
        $(elem).find('.products-length').text(productsLength);

        if (productAvailability == 'green') {
          $(elem).find('.label-stock-seller').show();
          $(elem).find('.tag-stock').show();
        }

        if (shopRating >= 4 && productAvailability != 'green') {
          $(elem).find('.label-stock-seller').show();
          $(elem).find('.tag-stock').hide();
          $(elem).find('.tag-topseller').show();
        }
      }
    },
    tpl_best_007: {
      beforeRender: function (data) {
        best = data.products[0];

        if (best) {
          best.best = true;
        }

        return data;
      },
      afterRender: function (el) {
        visualizeRating(el);

        function visualizeRating(el) {
          var $el = $(el),
              $rating_bar = $el.find('.rating-bar');
          $rating_bar.each(function (i, rating_bar) {
            var $bar = $(rating_bar),
                rating,
                rating_percent;
            rating = parseFloat($bar.data('rating'));
            rating_percent = rating / 5 * 100;
            $bar.find('.offer-affiliate-rating-slider').css('width', rating_percent + '%');
          });
        }
      }
    },
    // New templates with Simillar Products
    // and Products Image
    // + coupons
    // + sorting by rating when there is no saving
    tpl_listing_008: {
      beforeRender: function (data) {
        hasOffers = data.products[0].hasOffers;
        hasCoupons = data.products[0].hasCoupons;
        catalog = data.products[0].catalog; //Clone json data

        var filteredData = _.clone(data);

        var vouchersList = _.filter(filteredData.products, function (item) {
          return item.category === "Voucher";
        });

        var sorted = _.sortBy(filteredData.products, "price");

        var firstVoucher = _.first(_.filter(filteredData.products, function (item) {
          return item.category === "Voucher";
        }), 1);

        var offers = _.filter(filteredData.products, function (item) {
          return item.category !== "Voucher";
        });

        if (firstVoucher.length > 0) {
          hasCoupons = true;
        } else {
          hasCoupons = false;
        }

        if (offers.length > 0) {
          hasOffers = true;
        } else {
          hasOffers = false;
        }

        console.log(sorted);
        filteredData.products = sorted;
        return filteredData;
      },
      afterRender: function (elem) {
        visualizeRating(elem);
        offersItems = $(elem).find('.offers-item');
        offersItems.each(function (i) {
          item_availability = $(this).find('.availability_code').text();
          item_rating = parseInt($(this).find('.item-rating').data('rating'));
          item_isCoupon = $(this).find('.templateref').text();

          if (item_availability == 'green') {
            $(this).find('.tag-stock').show();
          }

          if (item_rating >= 4 && item_availability != 'green') {
            $(this).find('.tag-stock').hide();
            $(this).find('.tag-topseller').show();
          }

          if (item_isCoupon === 'voucher') {
            $(this).find('.tag-stock').hide();
            $(this).find('.tag-topseller').hide();
            $(this).find('.tag-coupon').show();
          }

          function getTabType(e) {
            var dataType = e.attr("data-type");
            $('#list-wrapper').removeClass();
            $('#list-wrapper').addClass("show-" + dataType);
          }
          /*=== Add notification-class ===*/


          if (hasCoupons) {
            $(".dash-offers").addClass("has-coupons");

            if (!hasOffers) {
              $(".dash-offers").addClass("only-coupons");
            }
          }

          $(".toggle-button").click(function () {
            getTabType($(this));
          });
        }); //Get template name and show product from that template

        function getTab(e) {
          var dataType = e.attr("data-type");
          $('#listing-holder').removeClass();
          $('#listing-holder').addClass("show-" + dataType);
        }

        if (catalog == "imdb" || catalog == "hcgame" || catalog == "youtube" || catalog == "pinterest" || catalog == "googleshop") {
          $("#listing-holder").addClass("show-Similar isCatalog");
        } else {
          var similarNo = $('#listing-holder').find(".Similar").length;
          var productNo = $('#listing-holder').find(".Product").length; //Check if we have lists and show tab for list

          if (similarNo > 0) {
            $(".offers-tabs-li-Similar").addClass("show-tab");
          }

          if (productNo > 0) {
            $(".offers-tabs-li-Product").addClass("show-tab");
          }

          if (similarNo == 0 || productNo == 0) {
            $(".offers-tabs-holder").hide();
          } //Select first LI from List


          $(".offers-tabs").find(".show-tab:first").addClass("offers-tabs-li-selected"); //Load first show-tab list

          getTab($(".offers-tabs").find(".show-tab:first a")); // Offers sort by offers/coupons

          $('.offers-tabs > li a').on('click', function (e) {
            $('.offers-tabs li').removeClass('offers-tabs-li-selected');
            $(this).parent().addClass('offers-tabs-li-selected');
            e.preventDefault();
            getTab($(this));
          });
        }

        function visualizeRating(elem) {
          var $el = $(elem),
              $rating_bar = $el.find('.rating-bar');
          $rating_bar.each(function (i, rating_bar) {
            var $bar = $(rating_bar),
                rating,
                rating_percent;
            rating = parseFloat($bar.data('rating'));
            rating_percent = rating / 5 * 100;
            $bar.find('.offer-affiliate-rating-slider').css('width', rating_percent + '%');
          });
        }
      }
    },
    tpl_notification_008: {
      beforeRender: function (data) {
        shopRating = parseInt(data.products[0].rating);
        productAvailability = data.products[0].availability_code;
        productsLength = data.products.length;
        hasOffers = data.products[0].hasOffers;
        hasCoupons = data.products[0].hasCoupons; //Clone json data

        var filteredData = _.clone(data);

        var products = filteredData.products;

        var sorted = _.sortBy(products, "price");

        filteredData.products = sorted;

        var first = _.first(_.filter(filteredData.products, function (item) {
          return item.category === "Product";
        }), 1);

        var firstSimilar = _.first(_.filter(filteredData.products, function (item) {
          return item.category === "Similar";
        }), 1);

        var firstVoucher = _.first(_.filter(filteredData.products, function (item) {
          return item.category === "Voucher";
        }), 1);

        if (firstVoucher.length > 0) {
          hasCoupons = true;
        } else {
          hasCoupons = false;
        }

        if (_.isEmpty(first)) {
          first = firstSimilar;

          if (_.isEmpty(first)) {
            first = firstVoucher;
          }
        } //Get Coupons total number


        voucherNo = _.filter(products, function (item) {
          return item.category === "Voucher";
        }).length; //Get Offers total number

        offersNo = _.filter(products, function (item) {
          return item.category !== "Voucher";
        }).length;

        if (offersNo.length > 0) {
          hasOffers = true;
        } else {
          hasOffers = false;
        } //Get Total Items Number


        itemsNo = products.length;
        filteredData.notification.firstProduct = first[0]; //Add voucher number to Notifications Object

        filteredData.notification.voucherNo = voucherNo;
        filteredData.notification.offersNo = offersNo;
        return filteredData;
      },
      afterRender: function (elem) {
        //elem).find('.products-length').text(productsLength);
        if (productAvailability == 'green') {
          $(elem).find('.label-stock-seller').show();
          $(elem).find('.tag-stock').show();
        }

        if (shopRating >= 4 && productAvailability != 'green') {
          $(elem).find('.label-stock-seller').show();
          $(elem).find('.tag-stock').hide();
          $(elem).find('.tag-topseller').show();
        }
        /*=== Show Coupons Tab ===*/


        if (hasCoupons) {
          $(".notification-coupons").addClass("has-coupons");
          $(".dash-offers").addClass("has-coupons");

          if (itemsNo == voucherNo) {
            $(".has-coupons").addClass("only-coupons");
          }
        }
      }
    },
    tpl_best_008: {
      beforeRender: function (data) {
        best = data.products[0];

        if (best) {
          best.best = true;
        }

        return data;
      },
      afterRender: function (el) {
        visualizeRating(el);

        function visualizeRating(el) {
          var $el = $(el),
              $rating_bar = $el.find('.rating-bar');
          $rating_bar.each(function (i, rating_bar) {
            var $bar = $(rating_bar),
                rating,
                rating_percent;
            rating = parseFloat($bar.data('rating'));
            rating_percent = rating / 5 * 100;
            $bar.find('.offer-affiliate-rating-slider').css('width', rating_percent + '%');
          });
        }
      }
    },
    tpl_listing_0081: {
      beforeRender: function (data) {
        hasOffers = data.products[0].hasOffers;
        hasCoupons = data.products[0].hasCoupons;
        catalog = data.products[0].catalog; //Clone json data

        var filteredData = _.clone(data);

        var vouchersList = _.filter(filteredData.products, function (item) {
          return item.category === "Voucher";
        });

        var sorted = _.sortBy(filteredData.products, "price");

        var firstVoucher = _.first(_.filter(filteredData.products, function (item) {
          return item.category === "Voucher";
        }), 1);

        var offers = _.filter(filteredData.products, function (item) {
          return item.category !== "Voucher";
        });

        if (firstVoucher.length > 0) {
          hasCoupons = true;
        } else {
          hasCoupons = false;
        }

        if (offers.length > 0) {
          hasOffers = true;
        } else {
          hasOffers = false;
        }

        console.log(sorted);
        filteredData.products = sorted;
        return filteredData;
      },
      afterRender: function (elem) {
        visualizeRating(elem);
        offersItems = $(elem).find('.offers-item');
        offersItems.each(function (i) {
          item_availability = $(this).find('.availability_code').text();
          item_rating = parseInt($(this).find('.item-rating').data('rating'));
          item_isCoupon = $(this).find('.templateref').text();

          if (item_availability == 'green') {
            $(this).find('.tag-stock').show();
          }

          if (item_rating >= 4 && item_availability != 'green') {
            $(this).find('.tag-stock').hide();
            $(this).find('.tag-topseller').show();
          }

          if (item_isCoupon === 'voucher') {
            $(this).find('.tag-stock').hide();
            $(this).find('.tag-topseller').hide();
            $(this).find('.tag-coupon').show();
          }

          function getTabType(e) {
            var dataType = e.attr("data-type");
            $('#list-wrapper').removeClass();
            $('#list-wrapper').addClass("show-" + dataType);
          }
          /*=== Add notification-class ===*/


          if (hasCoupons) {
            $(".dash-offers").addClass("has-coupons");

            if (!hasOffers) {
              $(".dash-offers").addClass("only-coupons");
            }
          }

          $(".toggle-button").click(function () {
            getTabType($(this));
          });
        }); //Get template name and show product from that template

        function getTab(e) {
          var dataType = e.attr("data-type");
          $('#listing-holder').removeClass();
          $('#listing-holder').addClass("show-" + dataType);
        }

        if (catalog == "imdb" || catalog == "hcgame" || catalog == "youtube" || catalog == "pinterest" || catalog == "googleshop") {
          $("#listing-holder").addClass("show-Similar isCatalog");
        } else {
          var similarNo = $('#listing-holder').find(".Similar").length;
          var productNo = $('#listing-holder').find(".Product").length; //Check if we have lists and show tab for list

          if (similarNo > 0) {
            $(".offers-tabs-li-Similar").addClass("show-tab");
          }

          if (productNo > 0) {
            $(".offers-tabs-li-Product").addClass("show-tab");
          }

          if (similarNo == 0 || productNo == 0) {
            $(".offers-tabs-holder").hide();
          } //Select first LI from List


          $(".offers-tabs").find(".show-tab:first").addClass("offers-tabs-li-selected"); //Load first show-tab list

          getTab($(".offers-tabs").find(".show-tab:first a")); // Offers sort by offers/coupons

          $('.offers-tabs > li a').on('click', function (e) {
            $('.offers-tabs li').removeClass('offers-tabs-li-selected');
            $(this).parent().addClass('offers-tabs-li-selected');
            e.preventDefault();
            getTab($(this));
          });
        }

        function visualizeRating(elem) {
          var $el = $(elem),
              $rating_bar = $el.find('.rating-bar');
          $rating_bar.each(function (i, rating_bar) {
            var $bar = $(rating_bar),
                rating,
                rating_percent;
            rating = parseFloat($bar.data('rating'));
            rating_percent = rating / 5 * 100;
            $bar.find('.offer-affiliate-rating-slider').css('width', rating_percent + '%');
          });
        }
      }
    },
    tpl_notification_0081: {
      beforeRender: function (data) {
        shopRating = parseInt(data.products[0].rating);
        productAvailability = data.products[0].availability_code;
        productsLength = data.products.length;
        hasOffers = data.products[0].hasOffers;
        hasCoupons = data.products[0].hasCoupons; //Clone json data

        var filteredData = _.clone(data);

        var products = filteredData.products;

        var sorted = _.sortBy(products, "price");

        filteredData.products = sorted;

        var first = _.first(_.filter(filteredData.products, function (item) {
          return item.category === "Product";
        }), 1);

        var firstSimilar = _.first(_.filter(filteredData.products, function (item) {
          return item.category === "Similar";
        }), 1);

        var firstVoucher = _.first(_.filter(filteredData.products, function (item) {
          return item.category === "Voucher";
        }), 1);

        if (firstVoucher.length > 0) {
          hasCoupons = true;
        } else {
          hasCoupons = false;
        }

        if (_.isEmpty(first)) {
          first = firstSimilar;

          if (_.isEmpty(first)) {
            first = firstVoucher;
          }
        } //Get Coupons total number


        voucherNo = _.filter(products, function (item) {
          return item.category === "Voucher";
        }).length; //Get Offers total number

        offersNo = _.filter(products, function (item) {
          return item.category !== "Voucher";
        }).length;

        if (offersNo.length > 0) {
          hasOffers = true;
        } else {
          hasOffers = false;
        } //Get Total Items Number


        itemsNo = products.length;
        filteredData.notification.firstProduct = first[0]; //Add voucher number to Notifications Object

        filteredData.notification.voucherNo = voucherNo;
        filteredData.notification.offersNo = offersNo;
        return filteredData;
      },
      afterRender: function (elem) {
        //elem).find('.products-length').text(productsLength);
        if (productAvailability == 'green') {
          $(elem).find('.label-stock-seller').show();
          $(elem).find('.tag-stock').show();
        }

        if (shopRating >= 4 && productAvailability != 'green') {
          $(elem).find('.label-stock-seller').show();
          $(elem).find('.tag-stock').hide();
          $(elem).find('.tag-topseller').show();
        }
        /*=== Show Coupons Tab ===*/


        if (hasCoupons) {
          $(".notification-coupons").addClass("has-coupons");
          $(".dash-offers").addClass("has-coupons");

          if (itemsNo == voucherNo) {
            $(".has-coupons").addClass("only-coupons");
          }
        }
      }
    },
    tpl_best_0081: {
      beforeRender: function (data) {
        best = data.products[0];

        if (best) {
          best.best = true;
        }

        return data;
      },
      afterRender: function (el) {
        visualizeRating(el);

        function visualizeRating(el) {
          var $el = $(el),
              $rating_bar = $el.find('.rating-bar');
          $rating_bar.each(function (i, rating_bar) {
            var $bar = $(rating_bar),
                rating,
                rating_percent;
            rating = parseFloat($bar.data('rating'));
            rating_percent = rating / 5 * 100;
            $bar.find('.offer-affiliate-rating-slider').css('width', rating_percent + '%');
          });
        }
      }
    },
    // New templates with Simillar Products
    // and Products Image
    // + coupons
    // + sorting by rating when there is no saving
    tpl_listing_009: {
      beforeRender: function (data) {
        hasOffers = data.products[0].hasOffers;
        hasCoupons = data.products[0].hasCoupons;
        catalog = data.products[0].catalog;
        return data;
      },
      afterRender: function (elem) {
        visualizeRating(elem);
        offersItems = $(elem).find('.offers-item');
        offersItems.each(function (i) {
          item_availability = $(this).find('.availability_code').text();
          item_rating = parseInt($(this).find('.item-rating').data('rating'));
          item_isCoupon = $(this).find('.templateref').text();

          if (item_availability == 'green') {
            $(this).find('.tag-stock').show();
          }

          if (item_rating >= 4 && item_availability != 'green') {
            $(this).find('.tag-stock').hide();
            $(this).find('.tag-topseller').show();
          }

          if (item_isCoupon === 'voucher') {
            $(this).find('.tag-stock').hide();
            $(this).find('.tag-topseller').hide();
            $(this).find('.tag-coupon').show();
          } // Hide vouchers if we have both vouchers and offers


          if ($(this).hasClass('voucher') && hasOffers !== undefined) {
            $(this).hide();
          }
        }); // If we only have coupons, hide all other offers

        if ((!hasOffers || hasOffers === undefined) && hasCoupons) {
          $(elem).find('.offers-item:not(".voucher")').hide();
        } //Get template name and show product from that template


        function getTabType(e) {
          var dataType = e.attr("data-type");
          $('#listing-holder').removeClass();
          $('#listing-holder').addClass("show-" + dataType);
        }

        if (catalog == "imdb" || catalog == "hcgame" || catalog == "youtube" || catalog == "pinterest" || catalog == "googleshop") {
          $(".offers-tabs-holder").hide();
          $("#listing-holder").addClass("show-Similar isCatalog");
        } else {
          var similarNo = $('#listing-holder').find(".Similar").length;
          var relatedNo = $('#listing-holder').find(".Mutation").length;
          var productNo = $('#listing-holder').find(".Product").length; //Check if we have lists and show tab for list

          if (similarNo > 0) {
            $(".offers-tabs-li-Mutation").addClass("show-tab");
          }

          if (relatedNo > 0) {
            $(".offers-tabs-li-Similar").addClass("show-tab");
          }

          if (productNo > 0) {
            $(".offers-tabs-li-Product").addClass("show-tab");
          } //Select first LI from List


          $(".offers-tabs").find(".show-tab:first").addClass("offers-tabs-li-selected"); //Load first show-tab list

          getTabType($(".offers-tabs").find(".show-tab:first a")); // Offers sort by offers/coupons

          $('.offers-tabs > li a').on('click', function (e) {
            $('.offers-tabs li').removeClass('offers-tabs-li-selected');
            $(this).parent().addClass('offers-tabs-li-selected');
            e.preventDefault();
            getTabType($(this));
          }); //======= Coupons tab functionality - Binded with Notifications Template ========
          //==== Coupons Active ====

          $(".has-coupons .offers-more").click(function () {
            $(".has-coupons .offers-more").removeClass("active-list");
            $(this).addClass("active-list");
          });
        }

        function visualizeRating(elem) {
          var $el = $(elem),
              $rating_bar = $el.find('.rating-bar');
          $rating_bar.each(function (i, rating_bar) {
            var $bar = $(rating_bar),
                rating,
                rating_percent;
            rating = parseFloat($bar.data('rating'));
            rating_percent = rating / 5 * 100;
            $bar.find('.offer-affiliate-rating-slider').css('width', rating_percent + '%');
          });
        }
      }
    },
    tpl_notification_009: {
      beforeRender: function (data) {
        shopRating = parseInt(data.products[0].rating);
        productAvailability = data.products[0].availability_code;
        productsLength = data.products.length;
        hasOffers = data.products[0].hasOffers;
        hasCoupons = data.products[0].hasCoupons;
        return data;
      },
      afterRender: function (elem) {
        $(elem).find('.products-length').text(productsLength);

        if (productAvailability == 'green') {
          $(elem).find('.label-stock-seller').show();
          $(elem).find('.tag-stock').show();
        }

        if (shopRating >= 4 && productAvailability != 'green') {
          $(elem).find('.label-stock-seller').show();
          $(elem).find('.tag-stock').hide();
          $(elem).find('.tag-topseller').show();
        }
        /*=== Show Coupons Tab ===*/


        if (hasCoupons) {
          $(".coupons-trigger").addClass("show-coupons");
          $(".with-coupons").addClass("has-coupons");
        }
      }
    },
    tpl_best_009: {
      beforeRender: function (data) {
        best = data.products[0];

        if (best) {
          best.best = true;
        }

        return data;
      },
      afterRender: function (el) {
        visualizeRating(el);

        function visualizeRating(el) {
          var $el = $(el),
              $rating_bar = $el.find('.rating-bar');
          $rating_bar.each(function (i, rating_bar) {
            var $bar = $(rating_bar),
                rating,
                rating_percent;
            rating = parseFloat($bar.data('rating'));
            rating_percent = rating / 5 * 100;
            $bar.find('.offer-affiliate-rating-slider').css('width', rating_percent + '%');
          });
        }
      }
    }
  };
});

},{}]},{},[1]);
