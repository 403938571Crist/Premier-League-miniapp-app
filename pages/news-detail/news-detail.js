const { getNewsDetail } = require('../../utils/news-api');

const SOURCE_LABEL_MAP = {
  official: '官方资讯',
  dongqiudi: '懂球帝',
  romano: '罗马诺',
  x: 'X',
  media: '媒体报道',
  zhibo8: '直播吧',
  sky: '天空体育',
  guardian: '卫报',
  reddit: '球迷热议'
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

function mapMediaType(type) {
  if (!type) return '图文';
  const key = String(type).toLowerCase();
  return MEDIA_TYPE_LABEL_MAP[key] || type;
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

function extractLede(summary) {
  if (!summary) return '';
  const trimmed = summary.trim();
  const match = trimmed.match(/^[^。！？!?\n]{8,120}[。！？!?]?/);
  const lede = match ? match[0].trim() : trimmed.slice(0, 100);
  return lede;
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

function looksLikeBulletLine(line) {
  if (!line) return false;
  return /^[\-·•●○]\s+/.test(line) || /[（(][^）)]{2,}[）)]\s*[:：]/.test(line);
}

function normalizeBlocks(blocks) {
  if (!Array.isArray(blocks)) return [];
  const out = [];
  blocks.forEach((b) => {
    if (!b) return;
    if (b.type === 'paragraph') {
      const parts = splitParagraph(b.text);
      const bulletGroup = [];
      const flushBullets = () => {
        if (bulletGroup.length) {
          out.push({ type: 'bullet', items: bulletGroup.slice() });
          bulletGroup.length = 0;
        }
      };
      parts.forEach((p) => {
        if (looksLikeBulletLine(p)) {
          bulletGroup.push(p.replace(/^[\-·•●○]\s+/, ''));
        } else {
          flushBullets();
          out.push({ type: 'paragraph', text: p });
        }
      });
      flushBullets();
    } else if (b.type === 'bullet' && Array.isArray(b.items)) {
      out.push({ type: 'bullet', items: b.items.filter(Boolean) });
    } else {
      out.push(b);
    }
  });
  return out;
}

function buildViewModel(article) {
  if (!article) return null;
  const normalizedBlocks = normalizeBlocks(article.blocks);
  const blocksText = blocksFullText(normalizedBlocks);
  const summary = article.summary || '';
  const hasBlocks = normalizedBlocks.length > 0;
  const summaryInBlocks = hasBlocks && summary && blocksText.replace(/\s+/g, '').includes(summary.replace(/\s+/g, '').slice(0, 40));

  const lede = summaryInBlocks ? extractLede(summary) : summary;
  const showLede = !!lede;

  return {
    ...article,
    blocks: normalizedBlocks,
    mediaTypeLabel: mapMediaType(article.mediaType),
    lede,
    showLede,
    hasImage: !!article.coverImage
  };
}

Page({
  data: {
    loading: true,
    article: null,
    sourceLabel: '',
    notFound: false
  },

  async onLoad(options) {
    const { id } = options || {};

    if (!id) {
      this.setData({
        loading: false,
        notFound: true
      });
      return;
    }

    try {
      const raw = await getNewsDetail(id);
      const article = buildViewModel(raw);

      this.setData({
        loading: false,
        article,
        sourceLabel: SOURCE_LABEL_MAP[article.sourceType] || article.source,
        notFound: false
      });
    } catch (error) {
      console.error('Failed to load news detail:', error);
      this.setData({
        loading: false,
        notFound: true
      });
    }
  },

  onOpenWebview() {
    const { article } = this.data;
    if (!article || !article.url) return;

    wx.navigateTo({
      url: `/pages/webview/webview?url=${encodeURIComponent(article.url)}&title=${encodeURIComponent(article.title || '')}`,
      fail: () => {
        wx.setClipboardData({ data: article.url });
        wx.showToast({ title: '链接已复制', icon: 'success' });
      }
    });
  },

  onCopyLink() {
    const { article } = this.data;
    if (!article || !article.url) {
      wx.showToast({ title: '暂无原文链接', icon: 'none' });
      return;
    }
    wx.setClipboardData({ data: article.url });
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
