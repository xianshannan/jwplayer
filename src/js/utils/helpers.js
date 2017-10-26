/* eslint-disable no-console */

import * as playerutils from 'utils/playerutils';
import * as validator from 'utils/validator';
import * as parser from 'utils/parser';
import {
  trim,
  pad,
  extension,
  hms,
  seconds,
  prefix,
  suffix,
} from 'utils/strings';
import Timer from 'api/timer';
import { tryCatch, JwError as Error } from 'utils/trycatch';
import _ from 'utils/underscore';
import { isIframe, flashVersion } from 'utils/browser';
import {
  addClass,
  hasClass,
  removeClass,
  replaceClass,
  toggleClass,
  classList,
  styleDimension,
  createElement,
  emptyElement,
  addStyleSheet,
  bounds,
} from 'utils/dom';
import { css, clearCss, style, transform, getRgba } from 'utils/css';
import { ajax, crossdomain } from 'utils/ajax';

export const log =
  typeof console.log === 'function' ? console.log.bind(console) : function() {};

/**
* 将 Date 转化为指定格式的String
* 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
* 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
* @example
* (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
* (new Date()).Format("yyyy-M-d h:m:s.S")    ==> 2006-7-2 8:9:4.18
*/
const dateFormat = function(date, fmt) {
  var o = {
    'M+': date.getMonth() + 1, // 月份
    'D+': date.getDate(), // 日
    'H+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds(), // 毫秒
  };
  if (/(Y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + '').substr(4 - RegExp.$1.length)
    );
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      );
    }
  }
  return fmt;
};

const between = function(num, min, max) {
  return Math.max(Math.min(num, max), min);
};

// The predicate received the arguments (key, value) instead of (value, key)
const foreach = function(aData, fnEach) {
  for (let key in aData) {
    if (Object.prototype.hasOwnProperty.call(aData, key)) {
      fnEach(key, aData[key]);
    }
  }
};

const indexOf = _.indexOf;

const noop = function() {};

const helpers = Object.assign({}, parser, validator, playerutils, {
  addClass,
  hasClass,
  removeClass,
  replaceClass,
  toggleClass,
  classList,
  styleDimension,
  createElement,
  emptyElement,
  addStyleSheet,
  bounds,
  css,
  clearCss,
  style,
  transform,
  getRgba,
  ajax,
  crossdomain,
  tryCatch,
  Error,
  Timer,
  log,
  between,
  foreach,
  flashVersion,
  isIframe,
  indexOf,
  trim,
  pad,
  extension,
  hms,
  seconds,
  prefix,
  suffix,
  dateFormat,
  noop,
});

export default helpers;
