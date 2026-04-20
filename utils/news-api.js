const { formatDate } = require('./util');
const { request } = require('./request');

const FILTERED_SOURCE_TYPES = ['bilibili', 'douyin'];

const SOURCE_META = {
  official: {
    label: 'Official',
    coverLabel: 'Official News',
    coverTheme: 'official',
    coverAccent: '#00FF85'
  },
  dongqiudi: {
    label: 'Dongqiudi',
    coverLabel: 'Headline',
    coverTheme: 'dongqiudi',
    coverAccent: '#5B6CFF'
  },
  romano: {
    label: 'Romano',
    coverLabel: 'Digest',
    coverTheme: 'romano',
    coverAccent: '#F5C542'
  },
  x: {
    label: 'X',
    coverLabel: 'Social',
    coverTheme: 'x',
    coverAccent: '#FFFFFF'
  },
  sky: {
    label: 'Sky Sports',
    coverLabel: 'Sports',
    coverTheme: 'sky',
    coverAccent: '#0099CC'
  },
  guardian: {
    label: 'The Guardian',
    coverLabel: 'Guardian',
    coverTheme: 'guardian',
    coverAccent: '#052962'
  },
  reddit: {
    label: 'Reddit 社区',
    coverLabel: '球迷热议',
    coverTheme: 'reddit',
    coverAccent: '#FF4500'
  },
  zhibo8: {
    label: 'Zhibo8',
    coverLabel: 'Sports',
    coverTheme: 'zhibo8',
    coverAccent: '#E8380D'
  },
  media: {
    label: 'Media',
    coverLabel: 'News',
    coverTheme: 'media',
    coverAccent: '#7A5CFF'
  }
};

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

function requestNews(path) {
  return request({
    path,
    method: 'GET',
    errorMessage: 'News request failed',
    showError: false
  });
}

function getSourceMeta(sourceType) {
  return SOURCE_META[sourceType] || {
    label: 'Soccer',
    coverLabel: 'News',
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

function normalizeBlocks(blocks = [], summary = '', body = '') {
  if (Array.isArray(blocks) && blocks.length) {
    return blocks;
  }

  const content = String(summary || body || '').trim();
  if (!content) {
    return [];
  }

  return content
    .split(/\n{2,}/)
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text) => ({ type: 'paragraph', text }));
}

function normalizeContentImages(article = {}) {
  const candidates = [
    article.contentImages,
    article.images,
    article.imageList,
    article.gallery,
    article.media?.images
  ];

  const list = candidates.find((item) => Array.isArray(item)) || [];
  return list
    .map((item) => {
      if (typeof item === 'string') return item;
      return item?.url || item?.src || item?.imageUrl || '';
    })
    .filter(Boolean);
}

function normalizeSourceType(item = {}) {
  return item.sourceType || item.sourceCode || item.source_key || 'media';
}

function normalizeTags(item = {}) {
  if (Array.isArray(item.tags)) {
    return item.tags.filter(Boolean);
  }
  if (Array.isArray(item.tagList)) {
    return item.tagList.filter(Boolean);
  }
  if (typeof item.tag === 'string' && item.tag.trim()) {
    return [item.tag.trim()];
  }
  return [];
}

function normalizeNewsItem(item = {}) {
  const sourceType = normalizeSourceType(item);
  const meta = getSourceMeta(sourceType);
  const tags = normalizeTags(item);

  return {
    id: item.id || item.newsId || item.articleId || '',
    title: item.title || item.headline || item.name || '',
    summary: item.summary || item.description || item.excerpt || item.brief || '',
    source: item.source || item.sourceName || meta.label,
    sourceType,
    mediaType: item.mediaType || item.contentType || '图文',
    publishedAt: formatPublishedAt(item.publishedAt || item.publishTime || item.createdAt || item.updatedAt),
    publishedAtRaw: item.publishedAt || item.publishTime || item.createdAt || item.updatedAt || '',
    coverImage: item.coverImage || item.imageUrl || item.cover || item.thumbnail || item.poster || '',
    tags,
    tag: tags[0] || meta.label,
    hotScore: item.hotScore || item.score || 0,
    author: item.author || item.authorName || '',
    url: item.url || item.link || item.sourceUrl || '',
    coverLabel: meta.coverLabel,
    coverTheme: meta.coverTheme,
    coverAccent: meta.coverAccent
  };
}

function normalizeNewsArticle(article = {}) {
  const item = normalizeNewsItem(article);
  const body = article.body || article.content || article.text || '';

  return {
    ...item,
    sourceNote: article.sourceNote || article.note || '',
    relatedTeamIds: Array.isArray(article.relatedTeamIds) ? article.relatedTeamIds : [],
    relatedPlayerIds: Array.isArray(article.relatedPlayerIds) ? article.relatedPlayerIds : [],
    blocks: normalizeBlocks(article.blocks || article.contentBlocks, item.summary, body),
    contentImages: normalizeContentImages(article)
  };
}

function filterNewsItems(list = []) {
  return list.filter((item) => !FILTERED_SOURCE_TYPES.includes(item.sourceType));
}

function normalizeListResponse(data, params = {}) {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.list)
      ? data.list
      : Array.isArray(data?.records)
        ? data.records
        : Array.isArray(data?.items)
          ? data.items
          : [];

  return {
    list: filterNewsItems(list.map(normalizeNewsItem)),
    page: data?.page || data?.current || params.page || 1,
    pageSize: data?.pageSize || data?.size || params.pageSize || list.length || 10,
    total: data?.total || data?.count || list.length || 0
  };
}

function getNewsList(params = {}, useCache = true) {
  const query = buildQueryString(params);
  const cacheKey = `news:list:${query || 'default'}`;
  const cache = getCache(cacheKey, useCache);

  if (cache) {
    return Promise.resolve(wrapCachedResult(cache));
  }

  return requestNews(`/news${query ? `?${query}` : ''}`).then((data) => {
    const result = normalizeListResponse(data, params);
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

  return requestNews(`/news/${id}`).then((data) => {
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

  return requestNews(`/news/transfers${query ? `?${query}` : ''}`).then((data) => {
    const result = normalizeListResponse(data, params);
    setCache(cacheKey, result);
    return {
      ...cloneData(result),
      isCached: false
    };
  });
}

function getPlayerSocial(params = {}) {
  const query = buildQueryString(params);
  return requestNews(`/social/players${query ? `?${query}` : ''}`);
}

module.exports = {
  getNewsList,
  getNewsDetail,
  getTransferNews,
  getPlayerSocial
};
