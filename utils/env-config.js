/**
 * Environment config
 *
 * Rules:
 * - release mini program -> production domain
 * - devtools -> localhost for desktop debugging
 * - real device / trial -> LAN address for device debugging
 */

const MANUAL_PROD = null;

const PROD_BASE_URL = 'https://your-domain.example.com/api';
const DEVTOOLS_BASE_URL = 'http://localhost:8080/api';
const DEVICE_BASE_URL = 'http://192.168.0.24:8080/api';
const REQUEST_TIMEOUT = 12000;
const REQUEST_RETRY_COUNT = 1;
const REQUEST_RETRY_DELAY = 350;
const AUTH_TOKEN_STORAGE_KEYS = ['authToken', 'token', 'accessToken'];

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
  DEVICE_BASE_URL,
  REQUEST_TIMEOUT,
  REQUEST_RETRY_COUNT,
  REQUEST_RETRY_DELAY,
  AUTH_TOKEN_STORAGE_KEYS
};
