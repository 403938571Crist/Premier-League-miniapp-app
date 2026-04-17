/**
 * Environment config
 *
 * Rules:
 * - release mini program -> production domain
 * - devtools -> localhost for desktop debugging
 * - real device / trial -> LAN address for device debugging
 */

const MANUAL_PROD = null;

const PROD_BASE_URL = 'https://你的云托管域名/api';
const DEVTOOLS_BASE_URL = 'http://localhost:8080/api';
const DEVICE_BASE_URL = 'http://192.168.0.24:8080/api';

function getMiniProgramEnvVersion() {
  try {
    const accountInfo = wx.getAccountInfoSync();
    return accountInfo?.miniProgram?.envVersion || 'develop';
  } catch (error) {
    return 'develop';
  }
}

function isDevtoolsPlatform() {
  try {
    const systemInfo = wx.getSystemInfoSync();
    return systemInfo?.platform === 'devtools';
  } catch (error) {
    return false;
  }
}

function getDevelopmentBaseUrl() {
  return isDevtoolsPlatform() ? DEVTOOLS_BASE_URL : DEVICE_BASE_URL;
}

const autoProd = getMiniProgramEnvVersion() === 'release';
const isProduction = MANUAL_PROD === null ? autoProd : MANUAL_PROD;

module.exports = {
  API_BASE_URL: isProduction ? PROD_BASE_URL : getDevelopmentBaseUrl(),
  isProduction,
  PROD_BASE_URL,
  DEVTOOLS_BASE_URL,
  DEVICE_BASE_URL
};
