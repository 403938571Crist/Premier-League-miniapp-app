/**
 * 环境配置中心
 * 
 * 部署到微信云托管后，只需修改 PROD_BASE_URL 为云托管分配的 HTTPS 域名，
 * 并将 isProduction 设为 true 即可切换至生产环境。
 * 
 * 推荐做法（自动判断）：
 * 发布正式版小程序时，envVersion === 'release' 会自动切到生产环境，
 * 开发工具和体验版则自动使用本地开发地址。
 */

// ============================================
// 1. 手动切换开关（最简单，适合首次部署验证）
// ============================================
const MANUAL_PROD = false;

// ============================================
// 2. 自动判断（推荐长期维护使用）
// ============================================
let autoProd = false;
try {
  const accountInfo = wx.getAccountInfoSync();
  // envVersion 取值: develop(开发版) / trial(体验版) / release(正式版)
  autoProd = accountInfo.miniProgram.envVersion === 'release';
} catch (e) {
  autoProd = false;
}

// ============================================
// 切换策略：默认手动开关优先，后续可改为 autoProd
// ============================================
const isProduction = MANUAL_PROD; // 或改为 autoProd

// ============================================
// 域名配置
// ============================================
const PROD_BASE_URL = 'https://你的云托管域名/api';
const DEV_BASE_URL = 'http://localhost:8080/api';

module.exports = {
  API_BASE_URL: isProduction ? PROD_BASE_URL : DEV_BASE_URL,
  isProduction
};
