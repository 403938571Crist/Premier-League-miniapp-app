Page({
  data: {
    url: ''
  },

  onLoad(options) {
    const url = decodeURIComponent(options.url || '');
    if (url) {
      this.setData({ url });
      // 设置导航栏标题
      wx.setNavigationBarTitle({
        title: options.title ? decodeURIComponent(options.title) : '文章详情'
      });
    } else {
      wx.navigateBack();
    }
  }
});
