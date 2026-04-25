/**
 * 统一日志出口
 *
 * release 版本(正式版小程序)下全部静默,避免线上泄露调试信息。
 * develop / trial / 真机调试 / 开发者工具 都会正常输出。
 *
 * 用法:
 *   const logger = require('../../utils/logger');
 *   logger.log('hello', payload);
 *   logger.error('failed:', err);
 *
 * 如需强制打开正式版日志排查线上问题,临时把 env-config.js 里的
 * MANUAL_PROD 设为 false 即可(记得改回来再上传)。
 */

const { isProduction } = require('./env-config');

const noop = () => {};

const logger = isProduction
  ? {
      log: noop,
      info: noop,
      warn: noop,
      error: noop,
      debug: noop
    }
  : {
      log: console.log.bind(console),
      info: (console.info || console.log).bind(console),
      warn: (console.warn || console.log).bind(console),
      error: (console.error || console.log).bind(console),
      debug: (console.debug || console.log).bind(console)
    };

module.exports = logger;
