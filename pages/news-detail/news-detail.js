const { getNewsDetail } = require('../../utils/news-api');
const logger = require('../../utils/logger');

const SOURCE_LABEL_MAP = {
  official: '官方资讯',
  dongqiudi: '懂球帝',
  romano: '罗马诺',
  x: 'X',
  media: '媒体报道',
  zhibo8: '直播吧',
  sky: '天空体育',
  guardian: '卫报',
  reddit: 'Reddit 社区'
};

const MEDIA_TYPE_LABEL_MAP = {
  article: '图文',
  video: '视频',
  gallery: '图集',
  image: '图片',
  audio: '音频',
  podcast: '播客',
  text: '文字',
  live: '直播'
};

const DENSE_PARAGRAPH_SOFT_LIMIT = 88;
const DENSE_PARAGRAPH_HARD_LIMIT = 140;
const MAX_SENTENCES_PER_PARAGRAPH = 3;
const UNSUPPORTED_WEBVIEW_HOST_RULES = [
  { pattern: /(^|\.)bilibili\.com$/i, label: 'B站' },
  { pattern: /(^|\.)b23\.tv$/i, label: 'B站' },
  { pattern: /(^|\.)douyin\.com$/i, label: '抖音' },
  { pattern: /(^|\.)iesdouyin\.com$/i, label: '抖音' }
];

function mapMediaType(type) {
  if (!type) return '图文';
  const key = String(type).toLowerCase();
  return MEDIA_TYPE_LABEL_MAP[key] || type;
}

function getUrlHostname(url) {
  const value = String(url || '').trim();
  if (!value) {
    return '';
  }

  try {
    return new URL(value).hostname.toLowerCase();
  } catch (error) {
    const matched = value.match(/^https?:\/\/([^/?#]+)/i);
    return matched ? matched[1].toLowerCase() : '';
  }
}

function getUnsupportedWebviewSource(url) {
  const hostname = getUrlHostname(url);
  if (!hostname) {
    return '';
  }

  const matchedRule = UNSUPPORTED_WEBVIEW_HOST_RULES.find((rule) => rule.pattern.test(hostname));
  return matchedRule ? matchedRule.label : '';
}

function getCacheTimeText(cachedAt) {
  if (!cachedAt) {
    return '';
  }

  const minutesAgo = Math.floor((Date.now() - cachedAt) / 60000);
  return minutesAgo < 1 ? '刚刚更新' : `${minutesAgo} 分钟前`;
}

function blocksFullText(blocks) {
  if (!Array.isArray(blocks)) return '';
  return blocks.map((b) => {
    if (!b) return '';
    if (b.type === 'paragraph' || b.type === 'quote') return b.text || '';
    if (b.type === 'bullet' && Array.isArray(b.items)) return b.items.join(' ');
    return '';
  }).join(' ');
}

function removeLeadingRepeatedText(blocks, repeatedText) {
  if (!Array.isArray(blocks) || !blocks.length || !repeatedText) {
    return blocks;
  }

  const firstBlock = blocks[0];
  if (!firstBlock || firstBlock.type !== 'paragraph' || !firstBlock.text) {
    return blocks;
  }

  const repeated = String(repeatedText).trim();
  const firstText = String(firstBlock.text).trim();
  if (!repeated || !firstText.startsWith(repeated)) {
    return blocks;
  }

  const remainingText = firstText.slice(repeated.length).trim();
  if (!remainingText) {
    return blocks.slice(1);
  }

  return [{ ...firstBlock, text: remainingText }, ...blocks.slice(1)];
}

function extractLede(summary) {
  if (!summary) return '';
  const trimmed = summary.trim();
  const match = trimmed.match(/^[^。！？!?\n]{8,120}[。！？!?]?/);
  return match ? match[0].trim() : trimmed.slice(0, 100);
}

function splitParagraph(text) {
  if (!text) return [];
  const parts = String(text)
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}|\n(?=\S)/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : [String(text).trim()];
}

function splitSentences(text) {
  if (!text) return [];
  const matches = String(text).match(/[^。！？!?]+[。！？!?]?/g);
  return (matches || [String(text)])
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitDenseParagraph(text) {
  const normalized = String(text || '').trim();
  if (!normalized) return [];
  if (normalized.length <= DENSE_PARAGRAPH_HARD_LIMIT) {
    return [normalized];
  }

  const sentences = splitSentences(normalized);
  if (sentences.length <= 1) {
    return [normalized];
  }

  const chunks = [];
  let current = [];
  let currentLength = 0;

  const flush = () => {
    if (!current.length) {
      return;
    }
    chunks.push(current.join(''));
    current = [];
    currentLength = 0;
  };

  sentences.forEach((sentence) => {
    const nextLength = currentLength + sentence.length;
    const shouldFlushBeforeAppend = current.length > 0 && (
      nextLength > DENSE_PARAGRAPH_HARD_LIMIT
      || (current.length >= 2 && currentLength >= DENSE_PARAGRAPH_SOFT_LIMIT)
    );

    if (shouldFlushBeforeAppend) {
      flush();
    }

    current.push(sentence);
    currentLength += sentence.length;

    const shouldFlushAfterAppend = currentLength >= DENSE_PARAGRAPH_HARD_LIMIT
      || (current.length >= MAX_SENTENCES_PER_PARAGRAPH && currentLength >= DENSE_PARAGRAPH_SOFT_LIMIT);

    if (shouldFlushAfterAppend) {
      flush();
    }
  });

  flush();
  return chunks.length ? chunks : [normalized];
}

function looksLikeBulletLine(line) {
  if (!line) return false;
  return /^[\-•●■]\s+/.test(line) || /[（(][^）)]{2,}[）)]\s*[:：]/.test(line);
}

function normalizeBlocks(blocks) {
  if (!Array.isArray(blocks)) return [];
  const out = [];
  blocks.forEach((b) => {
    if (!b) return;
    if (b.type === 'paragraph') {
      const parts = splitParagraph(b.text).flatMap((part) => splitDenseParagraph(part));
      const bulletGroup = [];
      const flushBullets = () => {
        if (bulletGroup.length) {
          out.push({ type: 'bullet', items: bulletGroup.slice() });
          bulletGroup.length = 0;
        }
      };
      parts.forEach((p) => {
        if (looksLikeBulletLine(p)) {
          bulletGroup.push(p.replace(/^[\-•●■]\s+/, ''));
        } else {
          flushBullets();
          out.push({ type: 'paragraph', text: p });
        }
      });
      flushBullets();
    } else if (b.type === 'bullet' && Array.isArray(b.items)) {
      out.push({ type: 'bullet', items: b.items.filter(Boolean) });
    } else if (b.type === 'quote') {
      out.push(b);
    }
  });
  return out;
}

function dedupeImageUrls(urls = []) {
  if (!Array.isArray(urls)) {
    return [];
  }

  const seen = new Set();
  return urls.filter((imageUrl) => {
    if (typeof imageUrl !== 'string') {
      return false;
    }

    const url = imageUrl.trim();
    if (!url || seen.has(url)) {
      return false;
    }

    seen.add(url);
    return true;
  });
}

function buildViewModel(article) {
  if (!article) return null;
  const normalizedBlocks = normalizeBlocks(article.blocks);
  const blocksText = blocksFullText(normalizedBlocks);
  const summary = article.summary || '';
  const hasBlocks = normalizedBlocks.length > 0;
  const summaryInBlocks = hasBlocks && summary && blocksText.replace(/\s+/g, '').includes(summary.replace(/\s+/g, '').slice(0, 40));

  const lede = summaryInBlocks ? extractLede(summary) : summary;
  const blocks = summaryInBlocks ? removeLeadingRepeatedText(normalizedBlocks, summary) : normalizedBlocks;
  const contentImages = dedupeImageUrls(
    Array.isArray(article.contentImages)
      ? article.contentImages.filter((u) => typeof u === 'string' && u.trim())
      : []
  );
  const unsupportedWebviewSource = getUnsupportedWebviewSource(article.url);

  return {
    ...article,
    blocks,
    mediaTypeLabel: mapMediaType(article.mediaType),
    lede,
    showLede: !!lede,
    hasImage: !!article.coverImage,
    contentImages,
    hasContentImages: contentImages.length > 0,
    cacheTimeText: article.cachedAt ? getCacheTimeText(article.cachedAt) : '',
    unsupportedWebviewSource,
    openActionText: unsupportedWebviewSource ? '复制原文链接' : '查看完整文章'
  };
}

function copyLinkWithToast(url, title = '链接已复制') {
  wx.setClipboardData({
    data: url,
    success: () => {
      wx.showToast({ title, icon: 'success' });
    }
  });
}

Page({
  data: {
    loading: true,
    article: null,
    sourceLabel: '',
    notFound: false,
    errorMessage: ''
  },

  onLoad(options) {
    const { id } = options || {};

    if (!id) {
      this.setData({
        loading: false,
        notFound: true,
        errorMessage: '缺少资讯 ID'
      });
      wx.showToast({ title: '缺少资讯 ID', icon: 'none' });
      return;
    }

    this.articleId = id;
    this.loadArticle(id, true);
  },

  onPullDownRefresh() {
    if (!this.articleId) {
      wx.stopPullDownRefresh();
      return;
    }

    this.loadArticle(this.articleId, false).finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  async loadArticle(id, useCache = true) {
    this.setData({
      loading: true,
      notFound: false,
      errorMessage: ''
    });

    try {
      const raw = await getNewsDetail(id, useCache);
      const article = buildViewModel(raw);

      if (!article || !article.title) {
        throw new Error('资讯内容为空');
      }

      this.setData({
        loading: false,
        article,
        sourceLabel: SOURCE_LABEL_MAP[article.sourceType] || article.source || '英超资讯',
        notFound: false,
        errorMessage: ''
      });
    } catch (error) {
      logger.error('Failed to load news detail:', error);
      this.setData({
        loading: false,
        article: null,
        notFound: true,
        errorMessage: error.message || '资讯加载失败'
      });
      wx.showToast({ title: '资讯加载失败', icon: 'none' });
    }
  },

  onHeroImageError() {
    this.setData({ 'article.coverImage': '' });
  },

  onContentImageError(e) {
    const index = Number(e?.currentTarget?.dataset?.index);
    if (!Number.isInteger(index) || index < 0 || !this.data.article?.contentImages?.[index]) {
      return;
    }

    this.setData({ [`article.contentImages[${index}]`]: '' });
  },

  onOpenWebview() {
    const { article } = this.data;
    if (!article || !article.url) return;

    if (article.unsupportedWebviewSource) {
      wx.showModal({
        title: `${article.unsupportedWebviewSource} 视频暂不支持`,
        content: `微信内无法稳定播放 ${article.unsupportedWebviewSource} 站内视频，已为你提供复制链接入口。请在浏览器或对应 App 中打开。`,
        confirmText: '复制链接',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            copyLinkWithToast(article.url);
          }
        }
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/webview/webview?url=${encodeURIComponent(article.url)}&title=${encodeURIComponent(article.title || '')}`,
      fail: () => {
        copyLinkWithToast(article.url);
      }
    });
  },

  onCopyLink() {
    const { article } = this.data;
    if (!article || !article.url) {
      wx.showToast({ title: '暂无原文链接', icon: 'none' });
      return;
    }
    copyLinkWithToast(article.url);
  },

  onShare() {
    const { article } = this.data;
    if (!article) return;
    wx.showShareMenu({ withShareTicket: true, menus: ['shareAppMessage', 'shareTimeline'] });
  },

  onShareAppMessage() {
    const { article } = this.data;
    if (!article) return {};
    return {
      title: article.title || '英超资讯',
      path: `/pages/news-detail/news-detail?id=${article.id || ''}`
    };
  }
});
