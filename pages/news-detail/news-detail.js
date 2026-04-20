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

const DENSE_PARAGRAPH_SOFT_LIMIT = 88;
const DENSE_PARAGRAPH_HARD_LIMIT = 140;
const MAX_SENTENCES_PER_PARAGRAPH = 3;

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

function splitSentences(text) {
  if (!text) return [];
  const matches = String(text).match(/[^。！？!?；;]+[。！？!?；;]?/g);
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
  return /^[\-·•●○]\s+/.test(line) || /[（(][^）)]{2,}[）)]\s*[:：]/.test(line);
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
          bulletGroup.push(p.replace(/^[\-·•●○]\s+/, ''));
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
    // image 块不再出现在 blocks 里（由 contentImages 单独承载），直接跳过
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
  const blocks = summaryInBlocks ? removeLeadingRepeatedText(normalizedBlocks, summary) : normalizedBlocks;
  const showLede = !!lede;

  // contentImages：过滤空值，确保是干净的字符串数组
  const contentImages = Array.isArray(article.contentImages)
    ? article.contentImages.filter((u) => typeof u === 'string' && u.trim())
    : [];

  return {
    ...article,
    blocks,
    mediaTypeLabel: mapMediaType(article.mediaType),
    lede,
    showLede,
    hasImage: !!article.coverImage,
    contentImages,
    hasContentImages: contentImages.length > 0
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
