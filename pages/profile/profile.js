const { showConfirm, showSuccess } = require('../../utils/util');

Page({
  data: {
    followedTeams: [],
    cacheSize: '0KB',
    userInfo: {
      nickName: '',
      avatarUrl: ''
    }
  },

  onLoad() {
    this.loadUserInfo();
    this.loadFollowedTeams();
    this.calculateCacheSize();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
    this.loadFollowedTeams();
  },

  loadUserInfo() {
    try {
      const stored = wx.getStorageSync('userInfo');
      if (stored) {
        this.setData({ userInfo: stored });
      }
    } catch (e) {
      console.error('读取用户信息失败:', e);
    }
  },

  onChooseAvatar(e) {
    const avatarUrl = e.detail.avatarUrl;
    const userInfo = { ...this.data.userInfo, avatarUrl };
    this.setData({ userInfo });
    try {
      wx.setStorageSync('userInfo', userInfo);
    } catch (e) {
      console.error('保存用户头像失败:', e);
    }
  },

  onGetUserInfo() {},

  loadFollowedTeams() {
    const app = getApp();
    const followedTeams = (app.globalData.followedTeams || []).map((team) => ({ ...team }));

    const standingsCache = app.getCache('standings');
    if (standingsCache?.data?.standings) {
      const table = standingsCache.data.standings[0]?.table || [];

      followedTeams.forEach((team) => {
        const standing = table.find((item) => item.team.id === team.id);
        if (standing) {
          team.rank = `英超第 ${standing.position} 名 · ${standing.points} 分`;
        }
      });
    }

    this.setData({ followedTeams });
  },

  calculateCacheSize() {
    try {
      const keys = wx.getStorageInfoSync().keys;
      let size = 0;

      keys.forEach((key) => {
        const value = wx.getStorageSync(key);
        if (value !== undefined && value !== null && value !== '') {
          size += JSON.stringify(value).length;
        }
      });

      let sizeText = '';
      if (size < 1024) {
        sizeText = `${size}B`;
      } else if (size < 1024 * 1024) {
        sizeText = `${(size / 1024).toFixed(1)}KB`;
      } else {
        sizeText = `${(size / (1024 * 1024)).toFixed(1)}MB`;
      }

      this.setData({ cacheSize: sizeText });
    } catch (e) {
      console.error('计算缓存大小失败:', e);
    }
  },

  goToFollowedTeams() {
    console.log('查看所有关注球队');
  },

  goToTeamDetail(e) {
    const { id, name } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/team-detail/team-detail?id=${id}&name=${encodeURIComponent(name)}`
    });
  },

  async clearCache() {
    const confirmed = await showConfirm('清除缓存', '确定要清除所有缓存数据吗？');

    if (confirmed) {
      const app = getApp();
      app.clearCache();

      this.setData({ cacheSize: '0KB', followedTeams: [] });
      showSuccess('清除成功');
    }
  },

  showAbout() {
    wx.showModal({
      title: '关于我们',
      content: '英超资讯小程序\n\n一个专注于英超联赛的微信小程序，提供积分榜、赛程、球队、球员与资讯查询服务。\n\n结构化数据与资讯内容均通过后端 /api 服务统一聚合。',
      showCancel: false
    });
  },

  showFeedback() {
    wx.showModal({
      title: '意见反馈',
      content: '如有问题或建议，请联系我们。\n\n邮箱：feedback@example.com',
      showCancel: false
    });
  }
});
