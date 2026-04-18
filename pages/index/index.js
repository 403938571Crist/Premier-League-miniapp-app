const { getFixtures } = require('../../utils/api');
const { formatDate } = require('../../utils/util');
const { getNewsList } = require('../../utils/news-api');

const SHOW_REFRESH_INTERVAL = 2 * 60 * 1000;
const NEWS_PAGE_SIZE = 10;
const FEATURED_LOOKAHEAD_DAYS = 10;
const NEWS_PLACEHOLDER_THEME = 'media';
const LIVE_STATUSES = ['LIVE', 'IN_PLAY', 'PAUSED'];
const UPCOMING_STATUSES = ['SCHEDULED', 'TIMED', 'NOT_STARTED'];
const EXCLUDED_STATUSES = ['FINISHED', 'AWARDED', 'POSTPONED', 'SUSPENDED', 'CANCELED', 'CANCELLED'];
const FEATURED_TEAM_WEIGHTS = {
  57: 10,
  58: 8,
  61: 10,
  64: 10,
  65: 10,
  66: 10,
  67: 8,
  73: 9
};
const FEATURED_PAIR_BONUS = {
  '57-61': 8,
  '57-64': 10,
  '57-65': 10,
  '57-66': 9,
  '57-73': 10,
  '58-67': 6,
  '61-64': 9,
  '61-65': 9,
  '61-66': 10,
  '61-73': 9,
  '64-65': 10,
  '64-66': 10,
  '64-67': 7,
  '64-73': 9,
  '65-66': 10,
  '65-67': 7,
  '65-73': 8,
  '66-67': 7,
  '66-73': 8,
  '67-73': 6
};

Page({
  data: {
    loading: true,
    error: null,
    featuredMatches: [],
    currentFeatured: 0,
    newsItems: [],
    todayDate: '',
    isCached: false,
    cacheTime: '',
    lastLoadedAt: 0,
    newsPage: 1,
    newsHasMore: true,
    newsLoadingMore: false
  },

  onLoad() {
    this.setData({
      todayDate: formatDate(new Date(), 'MM月DD日')
    });
    this.loadData();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
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
    this.setData({ loading: true, error: null, newsPage: 1, newsHasMore: true });

    const [fixturesResult, newsResult] = await Promise.allSettled([
      this.loadMatches(useCache),
      getNewsList({ page: 1, pageSize: NEWS_PAGE_SIZE }, useCache)
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

    const newsList = this.prepareNewsItems(newsData?.list || []);
    this.setData({
      loading: false,
      featuredMatches: this.selectFeaturedMatches(fixturesData?.matches || []),
      currentFeatured: 0,
      newsItems: newsList,
      newsHasMore: newsList.length >= NEWS_PAGE_SIZE,
      lastLoadedAt: Date.now(),
      ...this.getCacheInfo(fixturesData, newsData)
    });
  },

  onReachBottom() {
    if (this.data.newsLoadingMore || !this.data.newsHasMore) {
      return;
    }

    this.loadMoreNews();
  },

  async loadMoreNews() {
    this.setData({ newsLoadingMore: true });
    const nextPage = this.data.newsPage + 1;

    try {
      const newsData = await getNewsList({ page: nextPage, pageSize: NEWS_PAGE_SIZE }, false);
      const newItems = this.prepareNewsItems(newsData?.list || []);

      this.setData({
        newsItems: [...this.data.newsItems, ...newItems],
        newsPage: nextPage,
        newsHasMore: newItems.length >= NEWS_PAGE_SIZE,
        newsLoadingMore: false
      });
    } catch (error) {
      console.error('Load more news failed:', error);
      this.setData({ newsLoadingMore: false });
    }
  },

  async loadMatches(useCache) {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + FEATURED_LOOKAHEAD_DAYS);

    return getFixtures(
      {
        dateFrom: formatDate(startDate, 'YYYY-MM-DD'),
        dateTo: formatDate(endDate, 'YYYY-MM-DD')
      },
      useCache
    );
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

  prepareNewsItems(list = []) {
    return list.map((item) => ({
      ...item,
      _coverState: item.coverImage ? 'loading' : 'placeholder',
      _coverThemeResolved: item.coverTheme || NEWS_PLACEHOLDER_THEME
    }));
  },

  getMatchCalendarDate(match) {
    if (!match || !match.utcDate) {
      return '';
    }

    const date = new Date(match.utcDate);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return formatDate(date, 'YYYY-MM-DD');
  },

  isFeaturedCandidate(match) {
    const status = match?.status || '';

    if (LIVE_STATUSES.includes(status) || UPCOMING_STATUSES.includes(status)) {
      return true;
    }

    return !EXCLUDED_STATUSES.includes(status);
  },

  getFeaturedPairKey(match) {
    const ids = [match?.homeTeam?.id, match?.awayTeam?.id]
      .filter(Boolean)
      .map((id) => Number(id))
      .sort((a, b) => a - b);

    return ids.length === 2 ? `${ids[0]}-${ids[1]}` : '';
  },

  getFeaturedPriority(match) {
    const homeId = Number(match?.homeTeam?.id || 0);
    const awayId = Number(match?.awayTeam?.id || 0);
    const pairKey = this.getFeaturedPairKey(match);
    const homeWeight = FEATURED_TEAM_WEIGHTS[homeId] || 0;
    const awayWeight = FEATURED_TEAM_WEIGHTS[awayId] || 0;
    const pairBonus = FEATURED_PAIR_BONUS[pairKey] || 0;
    const featuredTeamsCount = [homeWeight, awayWeight].filter((value) => value > 0).length;
    const liveBonus = LIVE_STATUSES.includes(match?.status) ? 100 : 0;
    const doubleGiantBonus = featuredTeamsCount === 2 ? 12 : 0;
    const singleGiantBonus = featuredTeamsCount === 1 ? 4 : 0;

    return liveBonus + homeWeight + awayWeight + pairBonus + doubleGiantBonus + singleGiantBonus;
  },

  selectFeaturedMatches(matches) {
    const upcomingMatches = [...matches]
      .filter((match) => this.isFeaturedCandidate(match))
      .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());

    if (!upcomingMatches.length) {
      return [];
    }

    const targetDate = this.getMatchCalendarDate(upcomingMatches[0]);

    return upcomingMatches
      .filter((match) => this.getMatchCalendarDate(match) === targetDate)
      .sort((a, b) => {
        const priorityDiff = this.getFeaturedPriority(b) - this.getFeaturedPriority(a);
        if (priorityDiff !== 0) {
          return priorityDiff;
        }

        return new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime();
      })
      .slice(0, 3);
  },

  onMatchTap(e) {
    console.log('Match tapped:', e.detail.match);
  },

  onFeaturedChange(e) {
    const current = e?.detail?.current ?? 0;
    this.setData({ currentFeatured: current });
  },

  onNewsTap(e) {
    const { id } = e.currentTarget.dataset;
    if (!id) {
      return;
    }

    wx.navigateTo({
      url: `/pages/news-detail/news-detail?id=${id}`
    });
  },

  onNewsImageLoad(e) {
    const { index } = e.currentTarget.dataset || {};
    if (index === undefined || index === null) {
      return;
    }

    this.setData({
      [`newsItems[${index}]._coverState`]: 'ready'
    });
  },

  onNewsImageError(e) {
    const { index } = e.currentTarget.dataset || {};
    if (index === undefined || index === null) {
      return;
    }

    const currentItem = this.data.newsItems[index];
    if (!currentItem || !currentItem.coverImage) {
      return;
    }

    this.setData({
      [`newsItems[${index}].coverImage`]: '',
      [`newsItems[${index}]._coverState`]: 'placeholder'
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
    wx.navigateTo({
      url: '/pages/teams/teams'
    });
  }
});
