const { getStandings } = require('../../utils/api');

const SHOW_REFRESH_INTERVAL = 5 * 60 * 1000;

Page({
  data: {
    loading: true,
    error: null,
    activeTab: 'TOTAL',
    standings: [],
    allStandings: {},
    isCached: false,
    cacheTime: '',
    lastLoadedAt: 0,
    isFallbackTab: false
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    if (this.data.loading) {
      return;
    }

    if (!this.data.standings.length && !this.data.error) {
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

  normalizeStandings(result) {
    const allStandings = {};

    (result.standings || []).forEach((standing) => {
      allStandings[standing.type] = standing.table || [];
    });

    const totalTable = allStandings.TOTAL || [];

    return {
      TOTAL: totalTable,
      HOME: Array.isArray(allStandings.HOME) && allStandings.HOME.length ? allStandings.HOME : totalTable,
      AWAY: Array.isArray(allStandings.AWAY) && allStandings.AWAY.length ? allStandings.AWAY : totalTable
    };
  },

  getCacheInfo(result) {
    if (!result.isCached || !result.cachedAt) {
      return {
        isCached: false,
        cacheTime: ''
      };
    }

    const minutesAgo = Math.floor((Date.now() - result.cachedAt) / 60000);

    return {
      isCached: true,
      cacheTime: minutesAgo < 1 ? '刚刚' : `${minutesAgo} 分钟前`
    };
  },

  getStandingsForTab(allStandings, activeTab) {
    const currentTable = allStandings[activeTab] || [];
    const totalTable = allStandings.TOTAL || [];

    if (currentTable.length > 0) {
      return {
        standings: currentTable,
        isFallbackTab: false
      };
    }

    return {
      standings: totalTable,
      isFallbackTab: activeTab !== 'TOTAL' && totalTable.length > 0
    };
  },

  async loadData(useCache = true) {
    this.setData({ loading: true, error: null });

    try {
      const result = await getStandings('TOTAL', useCache);
      const allStandings = this.normalizeStandings(result);
      const currentData = this.getStandingsForTab(allStandings, this.data.activeTab);

      this.setData({
        loading: false,
        allStandings,
        standings: currentData.standings,
        isFallbackTab: currentData.isFallbackTab,
        lastLoadedAt: Date.now(),
        ...this.getCacheInfo(result)
      });
    } catch (error) {
      console.error('加载积分榜失败:', error);
      this.setData({
        loading: false,
        error: {
          title: '加载失败',
          description: error.message || '请检查网络连接后重试'
        }
      });
    }
  },

  switchTab(e) {
    const type = e.currentTarget.dataset.type;
    const currentData = this.getStandingsForTab(this.data.allStandings, type);

    this.setData({
      activeTab: type,
      standings: currentData.standings,
      isFallbackTab: currentData.isFallbackTab
    });
  },

  onTeamTap(e) {
    const team = e.detail.team;

    wx.navigateTo({
      url: `/pages/team-detail/team-detail?id=${team.team.id}&name=${encodeURIComponent(team.team.name)}`
    });
  }
});
