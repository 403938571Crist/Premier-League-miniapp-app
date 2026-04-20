const INVALID_IMAGE_VALUES = new Set(['null', 'undefined', 'none', 'nan', 'N/A', 'na']);

const TEAM_DEFAULT_IMAGE = '/images/default/team.png';
const PLAYER_DEFAULT_IMAGE = '/images/default/player.png';
const AVATAR_DEFAULT_IMAGE = '/images/default/avatar.png';

function isValidImageValue(url) {
  if (typeof url !== 'string') {
    return false;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return false;
  }

  return !INVALID_IMAGE_VALUES.has(trimmed.toLowerCase());
}

function normalizeImageUrl(url, fallback = '') {
  if (!isValidImageValue(url)) {
    return fallback;
  }

  const trimmed = String(url).trim();
  if (!/^(https?:\/\/|data:image\/|\/)/i.test(trimmed)) {
    return fallback;
  }

  return trimmed;
}

function normalizeImageUrlList(urls = [], fallback = '') {
  const normalized = [];
  const seen = new Set();

  if (!Array.isArray(urls)) {
    return normalized;
  }

  urls.forEach((url) => {
    const value = normalizeImageUrl(url, fallback);
    if (!value || seen.has(value)) {
      return;
    }
    seen.add(value);
    normalized.push(value);
  });

  return normalized;
}

function normalizeImageUrlWithFallback(primaryUrl, fallbackUrl = '', fallback = '') {
  return normalizeImageUrl(primaryUrl, fallback) || normalizeImageUrl(fallbackUrl, fallback);
}

module.exports = {
  TEAM_DEFAULT_IMAGE,
  PLAYER_DEFAULT_IMAGE,
  AVATAR_DEFAULT_IMAGE,
  normalizeImageUrl,
  normalizeImageUrlList,
  normalizeImageUrlWithFallback
};
