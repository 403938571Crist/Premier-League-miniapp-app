const { getStandings } = require('../../utils/api');

const SHOW_REFRESH_INTERVAL = 5 * 60 * 1000;

const TAB_CONFIG = {
  TOTAL: {
    key: 'TOTAL',
    label: '总榜',
    title: '英超总积分榜',
    description: '基于后端正式接口展示球队积分、净胜球与胜负数据。',
    emptyTitle: '暂无总榜数据',
    emptyDescription: '稍后再试或下拉刷新'
  },
  SCORERS: {
    key: 'SCORERS',
    label: '射手榜',
    title: '英超射手榜',
    description: '这里后续展示联赛进球排名，目前还未接入正式接口。',
    emptyTitle: '射手榜暂未开放',
    emptyDescription: '当前版本先保留榜单入口，待后端正式接口接入后展示'
  },
  ASSISTS: {
    key: 'ASSISTS',
    label: '助攻榜',
    title: '英超助攻榜',
    description: '这里后续展示联赛助攻排名，目前还未接入正式接口。',
    emptyTitle: '助攻榜暂未开放',
    emptyDescription: '当前版本先保留榜单入口，待后端正式接口接入后展示'
  }
};

const TAB_ORDER = ['TOTAL', 'SCORERS', 'ASSISTS'];

Page({
  data: {
    loading: true,
    error: null,
    activeTab: 'TOTAL',
    currentTabIndex: 0,
    tabs: TAB_ORDER.map((key) => TAB_CONFIG[key]),
    activeTabMeta: TAB_CONFIG.TOTAL,
    standings: [],
    isCached: false,
    cacheTime: '',
    lastLoadedAt: 0
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
    if (this.data.loading) {
      return;
    }

    if (!this.data.standings.length && !this.data.error && this.data.activeTab === 'TOTAL') {
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

  getActiveTabConfig(activeTab = this.data.activeTab) {
    return TAB_CONFIG[activeTab] || TAB_CONFIG.TOTAL;
  },

  getTabIndex(tabKey) {
    const index = TAB_ORDER.indexOf(tabKey);
    return index >= 0 ? index : 0;
  },

  syncActiveTab(tabKey) {
    const activeTab = TAB_CONFIG[tabKey] ? tabKey : 'TOTAL';

    this.setData({
      activeTab,
      currentTabIndex: this.getTabIndex(activeTab),
      activeTabMeta: this.getActiveTabConfig(activeTab),
      error: null,
      loading: false
    });
  },

  async loadData(useCache = true) {
    const shouldShowLoading = this.data.activeTab === 'TOTAL' || !this.data.standings.length;

    this.setData({
      loading: shouldShowLoading,
      error: null
    });

    try {
      const result = await getStandings('TOTAL', useCache);
      const standings = ((result.standings || [])[0] || {}).table || [];

      this.setData({
        loading: false,
        standings,
        activeTabMeta: this.getActiveTabConfig(this.data.activeTab),
        lastLoadedAt: Date.now(),
        ...this.getCacheInfo(result)
      });
    } catch (error) {
      console.error('Failed to load standings:', error);
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
    if (!TAB_CONFIG[type] || type === this.data.activeTab) {
      return;
    }

    this.syncActiveTab(type);
  },

  onSwiperChange(e) {
    const current = e.detail.current;
    const type = TAB_ORDER[current] || 'TOTAL';

    if (type === this.data.activeTab) {
      return;
    }

    this.syncActiveTab(type);
  },

  onTeamTap(e) {
    if (this.data.activeTab !== 'TOTAL') {
      return;
    }

    const team = e.detail.team;

    wx.navigateTo({
      url: `/pages/team-detail/team-detail?id=${team.team.id}&name=${encodeURIComponent(team.team.name)}`
    });
  }
});
