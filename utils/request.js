const { API_BASE_URL, REQUEST_TIMEOUT, REQUEST_RETRY_COUNT, REQUEST_RETRY_DELAY, AUTH_TOKEN_STORAGE_KEYS } = require('./env-config');
const { ERROR_CODES, ERROR_MESSAGES } = require('./constants');

let lastToastAt = 0;
let lastToastMessage = '';

function getAppSafe() {
  try {
    return getApp();
  } catch (error) {
    return null;
  }
}

function normalizeBaseUrl(url) {
  return String(url || '').trim().replace(/\/+$/, '');
}

function normalizePath(path) {
  if (!path) {
    return '';
  }

  return String(path).startsWith('/') ? String(path) : `/${path}`;
}

function resolveBaseUrl() {
  const app = getAppSafe();
  const globalData = app?.globalData || {};

  return normalizeBaseUrl(
    globalData.backendApiBaseUrl
      || globalData.newsApiBaseUrl
      || globalData.apiBaseUrl
      || API_BASE_URL
  );
}

function getStoredToken() {
  const app = getAppSafe();
  if (app?.globalData?.authToken) {
    return app.globalData.authToken;
  }

  for (const key of AUTH_TOKEN_STORAGE_KEYS) {
    try {
      const value = wx.getStorageSync(key);
      if (typeof value === 'string' && value.trim()) {
        if (app?.setAuthToken) {
          app.setAuthToken(value.trim(), false);
        }
        return value.trim();
      }
    } catch (error) {
      // ignore storage read errors
    }
  }

  return '';
}

function buildHeaders(customHeader = {}) {
  const token = getStoredToken();
  const header = {
    'Content-Type': 'application/json',
    ...customHeader
  };

  if (token) {
    if (!header.Authorization) {
      header.Authorization = `Bearer ${token}`;
    }
    if (!header.token) {
      header.token = token;
    }
  }

  return header;
}

function resolveErrorCode(statusCode, errMsg) {
  if (statusCode === 401) {
    return ERROR_CODES.DATA_NOT_FOUND;
  }

  if (statusCode === 408 || /timeout/i.test(errMsg || '')) {
    return ERROR_CODES.TIMEOUT;
  }

  if (statusCode === 429) {
    return ERROR_CODES.API_LIMIT;
  }

  if (statusCode >= 500) {
    return ERROR_CODES.SERVER_ERROR;
  }

  return ERROR_CODES.NETWORK_ERROR;
}

function createRequestError({ message, code, statusCode, raw }) {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode || 0;
  error.raw = raw;
  return error;
}

function showErrorToast(message) {
  const now = Date.now();
  if (!message) {
    return;
  }

  if (message === lastToastMessage && now - lastToastAt < 1500) {
    return;
  }

  lastToastAt = now;
  lastToastMessage = message;
  wx.showToast({
    title: message.length > 12 ? `${message.slice(0, 12)}...` : message,
    icon: 'none'
  });
}

function shouldRetryRequest({ method, statusCode, errMsg, attempt, retry }) {
  if (String(method || 'GET').toUpperCase() !== 'GET') {
    return false;
  }

  if (attempt >= retry) {
    return false;
  }

  if (statusCode >= 500 || statusCode === 408 || statusCode === 429) {
    return true;
  }

  return /timeout|fail|refused|reset/i.test(errMsg || '');
}

function unwrapResponse(res, fallbackMessage) {
  const payload = res?.data;

  if (res.statusCode < 200 || res.statusCode >= 300) {
    const code = resolveErrorCode(res.statusCode);
    const message = payload?.message
      || payload?.msg
      || ERROR_MESSAGES[code]
      || fallbackMessage
      || `HTTP ${res.statusCode}`;

    throw createRequestError({
      message,
      code,
      statusCode: res.statusCode,
      raw: payload
    });
  }

  if (payload && typeof payload === 'object' && !Array.isArray(payload) && Object.prototype.hasOwnProperty.call(payload, 'code')) {
    if (payload.code !== 0) {
      const code = payload.code === 401 ? ERROR_CODES.DATA_NOT_FOUND : ERROR_CODES.SERVER_ERROR;
      throw createRequestError({
        message: payload.message || payload.msg || ERROR_MESSAGES[code] || fallbackMessage || 'Request failed',
        code,
        statusCode: res.statusCode,
        raw: payload
      });
    }

    return Object.prototype.hasOwnProperty.call(payload, 'data') ? payload.data : payload;
  }

  return payload;
}

function request(options = {}) {
  const {
    path,
    method = 'GET',
    data,
    header,
    timeout = REQUEST_TIMEOUT,
    retry = REQUEST_RETRY_COUNT,
    retryDelay = REQUEST_RETRY_DELAY,
    showError = false,
    errorMessage
  } = options;

  const finalMethod = String(method).toUpperCase();
  const url = `${resolveBaseUrl()}${normalizePath(path)}`;

  return new Promise((resolve, reject) => {
    const doRequest = (attempt) => {
      wx.request({
        url,
        method: finalMethod,
        data,
        timeout,
        header: buildHeaders(header),
        success: (res) => {
          try {
            resolve(unwrapResponse(res, errorMessage));
          } catch (error) {
            if (shouldRetryRequest({
              method: finalMethod,
              statusCode: error.statusCode,
              errMsg: error.message,
              attempt,
              retry
            })) {
              setTimeout(() => doRequest(attempt + 1), retryDelay);
              return;
            }

            if (showError) {
              showErrorToast(error.message);
            }
            reject(error);
          }
        },
        fail: (err) => {
          const code = resolveErrorCode(0, err?.errMsg);
          const error = createRequestError({
            message: ERROR_MESSAGES[code] || errorMessage || ERROR_MESSAGES.NETWORK_ERROR,
            code,
            statusCode: 0,
            raw: err
          });

          if (shouldRetryRequest({
            method: finalMethod,
            statusCode: 0,
            errMsg: err?.errMsg,
            attempt,
            retry
          })) {
            setTimeout(() => doRequest(attempt + 1), retryDelay);
            return;
          }

          if (showError) {
            showErrorToast(error.message);
          }
          reject(error);
        }
      });
    };

    doRequest(0);
  });
}

module.exports = {
  request,
  resolveBaseUrl
};
