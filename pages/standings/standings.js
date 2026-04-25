const { getStandings, getTopScorers, getTopAssists } = require('../../utils/api');
const logger = require('../../utils/logger');

const SHOW_REFRESH_INTERVAL = 5 * 60 * 1000;
const PLAYER_STAT_LIMIT = 20;

const TAB_CONFIG = {
  TOTAL: {
    key: 'TOTAL',
    label: '总榜',
    title: '英超总积分榜',
    description: '球队排名、胜平负、净胜球与积分。',
    emptyTitle: '暂无总榜数据',
    emptyDescription: '稍后再试或下拉刷新'
  },
  SCORERS: {
    key: 'SCORERS',
    label: '射手榜',
    title: '英超射手榜',
    description: '按球员赛季进球数排名，数据由后端聚合接口提供。',
    emptyTitle: '暂无射手榜数据',
    emptyDescription: '后端暂时没有返回射手榜，请稍后重试'
  },
  ASSISTS: {
    key: 'ASSISTS',
    label: '助攻榜',
    title: '英超助攻榜',
    description: '按球员赛季助攻数排名，数据由后端聚合接口提供。',
    emptyTitle: '暂无助攻榜数据',
    emptyDescription: '后端暂时没有返回助攻榜，请稍后重试'
  }
};

const TAB_ORDER = ['TOTAL', 'SCORERS', 'ASSISTS'];
const EMPTY_CACHE_INFO = { isCached: false, cacheTime: '' };

Page({
  data: {
    loading: true,
    error: null,
    activeTab: 'TOTAL',
    currentTabIndex: 0,
    tabs: TAB_ORDER.map((key) => TAB_CONFIG[key]),
    activeTabMeta: TAB_CONFIG.TOTAL,
    standings: [],
    scorers: [],
    assists: [],
    cacheInfoByTab: {
      TOTAL: EMPTY_CACHE_INFO,
      SCORERS: EMPTY_CACHE_INFO,
      ASSISTS: EMPTY_CACHE_INFO
    },
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

    if (!this.getActiveTabItems().length && !this.data.error) {
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
    if (!result?.isCached || !result.cachedAt) {
      return EMPTY_CACHE_INFO;
    }

    const minutesAgo = Math.floor((Date.now() - result.cachedAt) / 60000);
    return {
      isCached: true,
      cacheTime: minutesAgo < 1 ? '刚刚更新' : `${minutesAgo} 分钟前`
    };
  },

  getActiveTabConfig(activeTab = this.data.activeTab) {
    return TAB_CONFIG[activeTab] || TAB_CONFIG.TOTAL;
  },

  getTabIndex(tabKey) {
    const index = TAB_ORDER.indexOf(tabKey);
    return index >= 0 ? index : 0;
  },

  getActiveTabItems(activeTab = this.data.activeTab) {
    if (activeTab === 'SCORERS') {
      return this.data.scorers;
    }
    if (activeTab === 'ASSISTS') {
      return this.data.assists;
    }
    return this.data.standings;
  },

  syncActiveTab(tabKey) {
    const activeTab = TAB_CONFIG[tabKey] ? tabKey : 'TOTAL';
    const cacheInfo = this.data.cacheInfoByTab[activeTab] || EMPTY_CACHE_INFO;

    this.setData({
      activeTab,
      currentTabIndex: this.getTabIndex(activeTab),
      activeTabMeta: this.getActiveTabConfig(activeTab),
      error: null,
      loading: false,
      ...cacheInfo
    });
  },

  async loadData(useCache = true) {
    const shouldShowLoading = !this.getActiveTabItems().length;

    this.setData({
      loading: shouldShowLoading,
      error: null
    });

    const [standingsResult, scorersResult, assistsResult] = await Promise.allSettled([
      getStandings('TOTAL', useCache),
      getTopScorers(PLAYER_STAT_LIMIT, useCache),
      getTopAssists(PLAYER_STAT_LIMIT, useCache)
    ]);

    const standingsData = standingsResult.status === 'fulfilled' ? standingsResult.value : null;
    const scorersData = scorersResult.status === 'fulfilled' ? scorersResult.value : null;
    const assistsData = assistsResult.status === 'fulfilled' ? assistsResult.value : null;

    if (!standingsData && !scorersData && !assistsData) {
      const error = standingsResult.reason || scorersResult.reason || assistsResult.reason || new Error('Load failed');
      logger.error('Failed to load rankings:', error);
      this.setData({
        loading: false,
        error: {
          title: '加载失败',
          description: error.message || '请检查网络连接后重试'
        }
      });
      return;
    }

    if (standingsResult.status === 'rejected') {
      logger.error('Failed to load standings:', standingsResult.reason);
    }
    if (scorersResult.status === 'rejected') {
      logger.error('Failed to load top scorers:', scorersResult.reason);
    }
    if (assistsResult.status === 'rejected') {
      logger.error('Failed to load top assists:', assistsResult.reason);
    }

    const cacheInfoByTab = {
      TOTAL: this.getCacheInfo(standingsData),
      SCORERS: this.getCacheInfo(scorersData),
      ASSISTS: this.getCacheInfo(assistsData)
    };
    const activeCacheInfo = cacheInfoByTab[this.data.activeTab] || EMPTY_CACHE_INFO;

    const nextStandings = ((standingsData?.standings || [])[0] || {}).table || this.data.standings;
    const nextScorers = scorersData?.players || this.data.scorers;
    const nextAssists = assistsData?.players || this.data.assists;

    this.setData({
      loading: false,
      standings: nextStandings,
      scorers: nextScorers,
      assists: nextAssists,
      activeTabMeta: this.getActiveTabConfig(this.data.activeTab),
      cacheInfoByTab,
      lastLoadedAt: Date.now(),
      ...activeCacheInfo
    });
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

  onAvatarError(e) {
    const target = e.currentTarget;
    if (!target) return;

    const dataset = target.dataset || {};
    const list = dataset.list;
    const idx = dataset.idx;
    if (!list || idx === undefined) return;

    const key = `${list}[${idx}].photoUrl`;
    this.setData({ [key]: '' });
  },

  onTeamTap(e) {
    if (this.data.activeTab !== 'TOTAL') {
      return;
    }

    const team = e.detail.team;

    wx.navigateTo({
      url: `/pages/team-detail/team-detail?id=${team.team.id}&name=${encodeURIComponent(team.team.name)}`
    });
  },

  onShareAppMessage() {
    const meta = this.data.activeTabMeta || {};
    return {
      title: meta.title || '英超积分榜',
      path: '/pages/standings/standings'
    };
  },

  onShareTimeline() {
    const meta = this.data.activeTabMeta || {};
    return {
      title: meta.title || '英超积分榜'
    };
  }
});
