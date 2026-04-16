const { getFixtures } = require('../../utils/api');
const { formatDate } = require('../../utils/util');
const { getNewsList } = require('../../utils/news-api');
const socialItems = require('../../utils/social-data');

const SHOW_REFRESH_INTERVAL = 2 * 60 * 1000;

Page({
  data: {
    loading: true,
    error: null,
    featuredMatches: [],
    newsItems: [],
    socialItems: [],
    todayDate: '',
    isCached: false,
    cacheTime: '',
    lastLoadedAt: 0
  },

  onLoad() {
    this.setData({
      todayDate: formatDate(new Date(), 'MM月DD日')
    });
    this.loadData();
  },

  onShow() {
    if (this.data.loading) {
      return;
    }

    if (!this.data.featuredMatches.length && !this.data.error) {
      this.loadData(true);
      return;
    }

    if (Date.now() - this.data.lastLoadedAt > SHOW_REFRESH_INTERVAL) {
      this.loadData(true);
    }
  },

  onPullDownRefresh() {
    this.loadData(false).finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  async loadData(useCache = true) {
    this.setData({ loading: true, error: null });

    const [fixturesResult, newsResult] = await Promise.allSettled([
      getFixtures(
        {
          dateFrom: this.getTodayDate(),
          dateTo: this.getTodayDate()
        },
        useCache
      ),
      getNewsList(
        {
          page: 1,
          pageSize: 6
        },
        useCache
      )
    ]);

    const fixturesData = fixturesResult.status === 'fulfilled' ? fixturesResult.value : null;
    const newsData = newsResult.status === 'fulfilled' ? newsResult.value : null;

    if (!fixturesData && !newsData) {
      const error = fixturesResult.reason || newsResult.reason || new Error('Load failed');
      console.error('Failed to load home page data:', error);
      this.setData({
        loading: false,
        error: {
          title: '加载失败',
          description: error.message || '请检查网络连接后重试'
        }
      });
      return;
    }

    if (fixturesResult.status === 'rejected') {
      console.error('Failed to load fixtures:', fixturesResult.reason);
    }

    if (newsResult.status === 'rejected') {
      console.error('Failed to load news:', newsResult.reason);
    }

    this.setData({
      loading: false,
      featuredMatches: this.selectFeaturedMatches(fixturesData?.matches || []),
      newsItems: newsData?.list || [],
      socialItems,
      lastLoadedAt: Date.now(),
      ...this.getCacheInfo(fixturesData, newsData)
    });
  },

  getCacheInfo(fixturesResult, newsResult) {
    const cacheSource = [newsResult, fixturesResult].find((result) => result?.isCached && result?.cachedAt);

    if (!cacheSource) {
      return {
        isCached: false,
        cacheTime: ''
      };
    }

    const minutesAgo = Math.floor((Date.now() - cacheSource.cachedAt) / 60000);
    return {
      isCached: true,
      cacheTime: minutesAgo < 1 ? '刚刚更新' : `${minutesAgo} 分钟前`
    };
  },

  getTodayDate() {
    return formatDate(new Date(), 'YYYY-MM-DD');
  },

  selectFeaturedMatches(matches) {
    const sorted = [...matches].sort((a, b) => {
      const statusOrder = {
        LIVE: 0,
        IN_PLAY: 0,
        PAUSED: 0,
        SCHEDULED: 1,
        TIMED: 1,
        FINISHED: 2
      };
      return (statusOrder[a.status] || 3) - (statusOrder[b.status] || 3);
    });

    return sorted.slice(0, 3);
  },

  onSearchTap() {
    wx.showToast({
      title: '搜索功能开发中',
      icon: 'none'
    });
  },

  onDatePick() {
    wx.showToast({
      title: '日期选择功能开发中',
      icon: 'none'
    });
  },

  onMatchTap(e) {
    console.log('Match tapped:', e.detail.match);
  },

  onNewsTap(e) {
    const { id } = e.currentTarget.dataset;
    if (!id) return;

    wx.navigateTo({
      url: `/pages/news-detail/news-detail?id=${id}`
    });
  },

  onSocialTap(e) {
    const { id } = e.currentTarget.dataset;
    const item = this.data.socialItems.find((social) => social.id === id);
    if (!item) return;

    wx.showActionSheet({
      itemList: ['查看简介', '复制主页链接'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.showModal({
            title: `${item.playerName} ${item.handle}`,
            content: `${item.team} / ${item.platform}\n\n${item.summary}\n\n${item.note}`,
            showCancel: false
          });
        } else if (res.tapIndex === 1) {
          wx.setClipboardData({
            data: item.url
          });
        }
      }
    });
  },

  goToStandings() {
    wx.switchTab({
      url: '/pages/standings/standings'
    });
  },

  goToFixtures() {
    wx.switchTab({
      url: '/pages/fixtures/fixtures'
    });
  },

  goToTeams() {
    wx.showToast({
      title: '球队列表功能开发中',
      icon: 'none'
    });
  }
});
