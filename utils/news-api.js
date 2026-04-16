const { formatDate } = require('./util');

const DEFAULT_API_BASE_URL = 'http://localhost:8080/api';
const FILTERED_SOURCE_TYPES = ['bilibili', 'douyin'];

const SOURCE_META = {
  official: {
    label: '官方资讯',
    coverLabel: '官方焦点',
    coverTheme: 'official',
    coverAccent: '#00FF85'
  },
  dongqiudi: {
    label: '懂球帝',
    coverLabel: '图文快讯',
    coverTheme: 'dongqiudi',
    coverAccent: '#5B6CFF'
  },
  romano: {
    label: '罗马诺',
    coverLabel: '转会快讯',
    coverTheme: 'romano',
    coverAccent: '#F5C542'
  },
  x: {
    label: 'X',
    coverLabel: '社媒快讯',
    coverTheme: 'x',
    coverAccent: '#FFFFFF'
  },
  sky: {
    label: 'Sky Sports',
    coverLabel: '天空体育',
    coverTheme: 'sky',
    coverAccent: '#0099CC'
  },
  guardian: {
    label: 'The Guardian',
    coverLabel: '卫报深度',
    coverTheme: 'guardian',
    coverAccent: '#052962'
  },
  reddit: {
    label: 'Reddit 社区',
    coverLabel: '球迷热议',
    coverTheme: 'reddit',
    coverAccent: '#FF4500'
  },
  media: {
    label: '媒体报道',
    coverLabel: '媒体报道',
    coverTheme: 'media',
    coverAccent: '#7A5CFF'
  }
};

function getApiBaseUrl() {
  const app = getApp();
  return app?.globalData?.backendApiBaseUrl
    || app?.globalData?.newsApiBaseUrl
    || app?.globalData?.apiBaseUrl
    || DEFAULT_API_BASE_URL;
}

function buildQueryString(params = {}) {
  return Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .sort()
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
}

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function getCache(cacheKey, useCache) {
  if (!useCache) {
    return null;
  }

  const app = getApp();
  return app?.getCache ? app.getCache(cacheKey) : null;
}

function setCache(cacheKey, data) {
  const app = getApp();
  if (app?.setCache) {
    app.setCache(cacheKey, data);
  }
}

function wrapCachedResult(cache, transform = (data) => data) {
  return {
    ...transform(cloneData(cache.data)),
    isCached: true,
    cachedAt: cache.cachedAt
  };
}

function request(path) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${getApiBaseUrl()}${path}`,
      method: 'GET',
      header: {
        'Content-Type': 'application/json'
      },
      timeout: 10000,
      success: (res) => {
        const response = res.data || {};

        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }

        if (response.code !== 0) {
          reject(new Error(response.message || 'News request failed'));
          return;
        }

        resolve(response.data);
      },
      fail: (err) => {
        console.error('News request failed:', err);
        reject(new Error('Network request failed'));
      }
    });
  });
}

function getSourceMeta(sourceType) {
  return SOURCE_META[sourceType] || {
    label: '英超资讯',
    coverLabel: '精选资讯',
    coverTheme: 'media',
    coverAccent: '#38003C'
  };
}

function formatPublishedAt(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return formatDate(date, 'MM-DD HH:mm');
}

function normalizeBlocks(blocks = [], summary = '') {
  if (Array.isArray(blocks) && blocks.length) {
    return blocks;
  }

  if (!summary) {
    return [];
  }

  return [
    {
      type: 'paragraph',
      text: summary
    }
  ];
}

function normalizeNewsItem(item = {}) {
  const meta = getSourceMeta(item.sourceType);
  const tags = Array.isArray(item.tags) ? item.tags.filter(Boolean) : [];

  return {
    id: item.id,
    title: item.title || '',
    summary: item.summary || '',
    source: item.source || meta.label,
    sourceType: item.sourceType || 'media',
    mediaType: item.mediaType || '图文',
    publishedAt: formatPublishedAt(item.publishedAt),
    publishedAtRaw: item.publishedAt || '',
    coverImage: item.coverImage || '',
    tags,
    tag: tags[0] || meta.label,
    hotScore: item.hotScore || 0,
    author: item.author || '',
    url: item.url || '',
    coverLabel: meta.coverLabel,
    coverTheme: meta.coverTheme,
    coverAccent: meta.coverAccent
  };
}

function normalizeNewsArticle(article = {}) {
  const item = normalizeNewsItem(article);

  return {
    ...item,
    sourceNote: article.sourceNote || '',
    relatedTeamIds: Array.isArray(article.relatedTeamIds) ? article.relatedTeamIds : [],
    relatedPlayerIds: Array.isArray(article.relatedPlayerIds) ? article.relatedPlayerIds : [],
    blocks: normalizeBlocks(article.blocks, item.summary)
  };
}

function filterNewsItems(list = []) {
  return list.filter((item) => !FILTERED_SOURCE_TYPES.includes(item.sourceType));
}

function getNewsList(params = {}, useCache = true) {
  const query = buildQueryString(params);
  const cacheKey = `news:list:${query || 'default'}`;
  const cache = getCache(cacheKey, useCache);

  if (cache) {
    return Promise.resolve(wrapCachedResult(cache));
  }

  return request(`/news${query ? `?${query}` : ''}`).then((data) => {
    const result = {
      list: filterNewsItems((data.list || []).map(normalizeNewsItem)),
      page: data.page || 1,
      pageSize: data.pageSize || params.pageSize || 10,
      total: data.total || 0
    };

    setCache(cacheKey, result);
    return {
      ...cloneData(result),
      isCached: false
    };
  });
}

function getNewsDetail(id, useCache = true) {
  const cacheKey = `news:detail:${id}`;
  const cache = getCache(cacheKey, useCache);

  if (cache) {
    return Promise.resolve(wrapCachedResult(cache));
  }

  return request(`/news/${id}`).then((data) => {
    const result = normalizeNewsArticle(data);
    setCache(cacheKey, result);
    return {
      ...cloneData(result),
      isCached: false
    };
  });
}

function getTransferNews(params = {}, useCache = true) {
  const query = buildQueryString(params);
  const cacheKey = `news:transfers:${query || 'default'}`;
  const cache = getCache(cacheKey, useCache);

  if (cache) {
    return Promise.resolve(wrapCachedResult(cache));
  }

  return request(`/news/transfers${query ? `?${query}` : ''}`).then((data) => {
    const result = {
      list: filterNewsItems((data || []).map(normalizeNewsItem))
    };

    setCache(cacheKey, result);
    return {
      ...cloneData(result),
      isCached: false
    };
  });
}

function getPlayerSocial(params = {}) {
  const query = buildQueryString(params);
  return request(`/social/players${query ? `?${query}` : ''}`);
}

module.exports = {
  getNewsList,
  getNewsDetail,
  getTransferNews,
  getPlayerSocial
};
