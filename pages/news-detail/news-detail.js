const { getNewsDetail } = require('../../utils/news-api');

const SOURCE_LABEL_MAP = {
  official: '官方资讯',
  dongqiudi: '懂球帝',
  romano: '罗马诺',
  x: 'X',
  media: '媒体报道'
};

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
      const article = await getNewsDetail(id);

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
        // 降级：复制链接
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
  }
});
