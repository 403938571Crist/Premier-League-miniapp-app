/**
 * 通用工具函数
 */

const { TEAM_SHORT_NAMES, MATCH_STATUS_TEXT, MATCH_STATUS_STYLE, STANDING_ZONES, PLAYER_POSITIONS } = require('./constants');

/**
 * 格式化日期
 * @param {string|Date} date - 日期
 * @param {string} format - 格式
 * @returns {string}
 */
/**
 * 将任意 Date/日期字符串转为北京时区 (UTC+8) 的"伪 UTC" Date，
 * 之后用 getUTC* 系列读取即为北京时间的字段。
 * 这样无论运行时所在时区（微信开发者工具常为 UTC），显示都统一按北京时间。
 */
function toBeijing(date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getTime() + 8 * 60 * 60 * 1000);
}

function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return '';

  const d = toBeijing(date);
  if (!d) return '';

  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hour = String(d.getUTCHours()).padStart(2, '0');
  const minute = String(d.getUTCMinutes()).padStart(2, '0');
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekDay = weekDays[d.getUTCDay()];

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ddd', weekDay);
}

/**
 * 格式化时间（北京时间）
 * @param {string} time - 时间字符串
 * @returns {string}
 */
function formatTime(time) {
  if (!time) return '';
  const d = toBeijing(time);
  if (!d) return '';

  const hour = String(d.getUTCHours()).padStart(2, '0');
  const minute = String(d.getUTCMinutes()).padStart(2, '0');
  return `${hour}:${minute}`;
}

/**
 * 获取球队中文名
 * @param {string} name - 球队英文名
 * @returns {string}
 */
function getTeamName(name) {
  return TEAM_SHORT_NAMES[name] || name;
}

/**
 * 获取比赛状态中文
 * @param {string} status - 状态码
 * @returns {string}
 */
function getMatchStatusText(status) {
  return MATCH_STATUS_TEXT[status] || '未知';
}

/**
 * 获取比赛状态样式类
 * @param {string} status - 状态码
 * @returns {string}
 */
function getMatchStatusStyle(status) {
  return MATCH_STATUS_STYLE[status] || 'status-pending';
}

/**
 * 检查比赛是否进行中
 * @param {string} status - 状态码
 * @returns {boolean}
 */
function isMatchLive(status) {
  return status === 'LIVE' || status === 'IN_PLAY';
}

/**
 * 检查比赛是否已结束
 * @param {string} status - 状态码
 * @returns {boolean}
 */
function isMatchFinished(status) {
  return status === 'FINISHED';
}

/**
 * 获取排名区间样式
 * @param {number} position - 排名
 * @returns {Object|null}
 */
function getStandingZoneStyle(position) {
  for (const [key, zone] of Object.entries(STANDING_ZONES)) {
    if (position >= zone.min && position <= zone.max && zone.color) {
      return {
        color: zone.color,
        name: zone.name,
        key
      };
    }
  }
  return null;
}

/**
 * 获取球员位置中文
 * @param {string} position - 位置英文名
 * @returns {string}
 */
function getPlayerPosition(position) {
  return PLAYER_POSITIONS[position] || position;
}

/**
 * 计算年龄
 * @param {string} birthDate - 出生日期
 * @returns {number}
 */
function calculateAge(birthDate) {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * 防抖函数
 * @param {Function} func - 目标函数
 * @param {number} wait - 延迟毫秒数
 * @returns {Function}
 */
function debounce(func, wait = 300) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * 节流函数
 * @param {Function} func - 目标函数
 * @param {number} limit - 限制毫秒数
 * @returns {Function}
 */
function throttle(func, limit = 300) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 显示加载提示
 * @param {string} title - 提示文字
 */
function showLoading(title = '加载中...') {
  wx.showLoading({
    title,
    mask: true
  });
}

/**
 * 隐藏加载提示
 */
function hideLoading() {
  wx.hideLoading();
}

/**
 * 显示成功提示
 * @param {string} title - 提示文字
 * @param {Function} callback - 回调函数
 */
function showSuccess(title = '操作成功', callback) {
  wx.showToast({
    title,
    icon: 'success',
    duration: 1500,
    success: callback
  });
}

/**
 * 显示错误提示
 * @param {string} title - 提示文字
 */
function showError(title = '操作失败') {
  wx.showToast({
    title,
    icon: 'none',
    duration: 2000
  });
}

/**
 * 显示确认对话框
 * @param {string} title - 标题
 * @param {string} content - 内容
 * @returns {Promise<boolean>}
 */
function showConfirm(title = '提示', content = '') {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      success: (res) => {
        resolve(res.confirm);
      }
    });
  });
}

/**
 * 页面跳转
 * @param {string} url - 目标页面
 * @param {Object} params - 参数
 */
function navigateTo(url, params = {}) {
  const queryString = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  const fullUrl = queryString ? `${url}?${queryString}` : url;
  
  wx.navigateTo({
    url: fullUrl,
    fail: () => {
      wx.switchTab({ url });
    }
  });
}

/**
 * 深拷贝
 * @param {*} obj - 目标对象
 * @returns {*}
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone(obj[key]);
    });
    return cloned;
  }
  return obj;
}

module.exports = {
  formatDate,
  formatTime,
  getTeamName,
  getMatchStatusText,
  getMatchStatusStyle,
  isMatchLive,
  isMatchFinished,
  getStandingZoneStyle,
  getPlayerPosition,
  calculateAge,
  debounce,
  throttle,
  showLoading,
  hideLoading,
  showSuccess,
  showError,
  showConfirm,
  navigateTo,
  deepClone
};
