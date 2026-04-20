Page({
  data: {
    url: '',
    unsupported: false,
    unsupportedSource: '',
    unsupportedMessage: ''
  },

  onLoad(options) {
    const url = decodeURIComponent(options.url || '');
    if (url) {
      const unsupportedSource = this.getUnsupportedSource(url);
      this.setData({
        url,
        unsupported: !!unsupportedSource,
        unsupportedSource,
        unsupportedMessage: unsupportedSource
          ? `微信内无法稳定播放 ${unsupportedSource} 站内视频，请复制链接后在浏览器或对应 App 中打开。`
          : ''
      });
      // 设置导航栏标题
      wx.setNavigationBarTitle({
        title: unsupportedSource ? '打开原文' : (options.title ? decodeURIComponent(options.title) : '文章详情')
      });
    } else {
      wx.navigateBack();
    }
  },

  getUnsupportedSource(url) {
    const value = String(url || '').trim();
    if (!value) {
      return '';
    }

    let hostname = '';
    try {
      hostname = new URL(value).hostname.toLowerCase();
    } catch (error) {
      const matched = value.match(/^https?:\/\/([^/?#]+)/i);
      hostname = matched ? matched[1].toLowerCase() : '';
    }

    if (/(^|\.)bilibili\.com$/i.test(hostname) || /(^|\.)b23\.tv$/i.test(hostname)) {
      return 'B站';
    }

    if (/(^|\.)douyin\.com$/i.test(hostname) || /(^|\.)iesdouyin\.com$/i.test(hostname)) {
      return '抖音';
    }

    return '';
  },

  onCopyLink() {
    if (!this.data.url) {
      return;
    }

    wx.setClipboardData({
      data: this.data.url,
      success: () => {
        wx.showToast({ title: '链接已复制', icon: 'success' });
      }
    });
  },

  onBack() {
    wx.navigateBack();
  }
});
