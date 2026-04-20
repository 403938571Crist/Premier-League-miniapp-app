const { getFixtures } = require('../../utils/api');
const { formatDate } = require('../../utils/util');

const SHOW_REFRESH_INTERVAL = 2 * 60 * 1000;
const SWIPER_CENTER_INDEX = 1;
const SWIPER_DURATION = 260;

const TABS = {
  ALL: 'ALL',
  LIVE: 'LIVE',
  RESULTS: 'RESULTS'
};

const WEEKDAY_ZH = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

Page({
  data: {
    loading: true,
    error: null,
    currentMatchday: '',
    heroEyebrow: '比赛日',
    heroTitle: '焦点对决',
    filterWeek: '',
    filterDate: '',
    matches: [],
    allMatches: [],
    hasMatches: false,
    isCached: false,
    cacheTime: '',
    activeTab: TABS.ALL,
    isDateSwitching: false,
    lastLoadedAt: 0,
    swiperCurrent: SWIPER_CENTER_INDEX,
    paneItems: []
  },

  selectedDate: null,
  isResettingSwiper: false,

  onLoad() {
    this.selectedDate = new Date();
    this.updateDateDisplay();
    this.loadData();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
    if (this.data.loading || this.data.isDateSwitching) {
      return;
    }

    if (!this.data.allMatches.length && !this.data.error) {
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

  getDateByOffset(offset, baseDate = this.selectedDate) {
    const nextDate = new Date(baseDate);
    nextDate.setDate(nextDate.getDate() + offset);
    return nextDate;
  },

  formatDateLabel(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}月${day}日`;
  },

  updateDateDisplay() {
    const date = this.selectedDate;
    this.setData({
      filterWeek: WEEKDAY_ZH[date.getDay()],
      filterDate: this.formatDateLabel(date)
    });
  },

  buildDateQuery(date) {
    const dateStr = formatDate(date, 'YYYY-MM-DD');
    return {
      dateFrom: dateStr,
      dateTo: dateStr
    };
  },

  requestDateFixtures(date, useCache = true) {
    return getFixtures(this.buildDateQuery(date), useCache);
  },

  getCacheInfo(result) {
    if (!result?.isCached || !result?.cachedAt) {
      return {
        isCached: false,
        cacheTime: ''
      };
    }

    const minutesAgo = Math.floor((Date.now() - result.cachedAt) / 60000);
    return {
      isCached: true,
      cacheTime: minutesAgo < 1 ? '刚刚更新' : `${minutesAgo} 分钟前`
    };
  },

  getMatchdayText(matches) {
    if (!matches.length || !matches[0].matchday) {
      return '';
    }

    return `英超第 ${matches[0].matchday} 轮`;
  },

  getHeroEyebrow(matches) {
    if (!matches.length || !matches[0].matchday) {
      return '比赛日';
    }

    return `第 ${matches[0].matchday} 轮 / 共 38 轮`;
  },

  isLiveStatus(status) {
    return ['LIVE', 'IN_PLAY', 'PAUSED'].includes(status);
  },

  isFinishedStatus(status) {
    return ['FINISHED', 'AWARDED'].includes(status);
  },

  applyTabFilter(matches = [], activeTab = this.data.activeTab) {
    if (activeTab === TABS.LIVE) {
      return matches.filter((match) => this.isLiveStatus(match.status));
    }

    if (activeTab === TABS.RESULTS) {
      return matches.filter((match) => this.isFinishedStatus(match.status));
    }

    return matches;
  },

  buildPaneItem(date, result) {
    const allMatches = result?.matches || [];
    const matches = this.applyTabFilter(allMatches, this.data.activeTab);
    const cacheInfo = this.getCacheInfo(result);

    return {
      key: formatDate(date, 'YYYY-MM-DD'),
      date: formatDate(date, 'YYYY-MM-DD'),
      weekLabel: WEEKDAY_ZH[date.getDay()],
      dateLabel: this.formatDateLabel(date),
      allMatches,
      matches,
      hasMatches: matches.length > 0,
      currentMatchday: this.getMatchdayText(allMatches),
      heroEyebrow: this.getHeroEyebrow(allMatches),
      isCached: cacheInfo.isCached,
      cacheTime: cacheInfo.cacheTime
    };
  },

  applyCurrentPane(paneItem) {
    this.setData({
      allMatches: paneItem.allMatches,
      matches: paneItem.matches,
      hasMatches: paneItem.hasMatches,
      currentMatchday: paneItem.currentMatchday,
      heroEyebrow: paneItem.heroEyebrow,
      filterWeek: paneItem.weekLabel,
      filterDate: paneItem.dateLabel,
      isCached: paneItem.isCached,
      cacheTime: paneItem.cacheTime
    });
  },

  async loadData(useCache = true, options = {}) {
    const { silent = false } = options;
    const baseDate = this.selectedDate;
    const prevDate = this.getDateByOffset(-1, baseDate);
    const nextDate = this.getDateByOffset(1, baseDate);

    this.setData({
      loading: silent ? this.data.loading : true,
      error: null
    });

    try {
      const [prevResult, currentResult, nextResult] = await Promise.all([
        this.requestDateFixtures(prevDate, useCache),
        this.requestDateFixtures(baseDate, useCache),
        this.requestDateFixtures(nextDate, useCache)
      ]);

      const paneItems = [
        this.buildPaneItem(prevDate, prevResult),
        this.buildPaneItem(baseDate, currentResult),
        this.buildPaneItem(nextDate, nextResult)
      ];

      this.setData({
        loading: false,
        error: null,
        paneItems,
        swiperCurrent: SWIPER_CENTER_INDEX,
        lastLoadedAt: Date.now()
      });

      this.applyCurrentPane(paneItems[SWIPER_CENTER_INDEX]);
    } catch (error) {
      console.error('Failed to load fixtures:', error);
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
    const nextTab = e.currentTarget.dataset.tab;
    if (!nextTab || nextTab === this.data.activeTab) {
      return;
    }

    const paneItems = (this.data.paneItems || []).map((paneItem) => ({
      ...paneItem,
      matches: this.applyTabFilter(paneItem.allMatches, nextTab),
      hasMatches: this.applyTabFilter(paneItem.allMatches, nextTab).length > 0
    }));

    this.setData({
      activeTab: nextTab,
      paneItems
    });

    const currentPane = paneItems[SWIPER_CENTER_INDEX];
    if (currentPane) {
      this.applyCurrentPane(currentPane);
    }
  },

  prevDate() {
    return this.shiftDate(-1);
  },

  nextDate() {
    return this.shiftDate(1);
  },

  async shiftDate(offset) {
    if (this.data.isDateSwitching) {
      return;
    }

    this.setData({ isDateSwitching: true });
    this.selectedDate = this.getDateByOffset(offset);
    this.updateDateDisplay();
    await this.loadData(true, { silent: true });
    this.setData({ isDateSwitching: false });
  },

  async onSwiperChange(e) {
    const current = e.detail.current;

    if (this.isResettingSwiper || current === SWIPER_CENTER_INDEX || this.data.isDateSwitching) {
      return;
    }

    const offset = current < SWIPER_CENTER_INDEX ? -1 : 1;
    const paneItem = this.data.paneItems[current];

    if (!paneItem) {
      this.resetSwiperToCenter();
      return;
    }

    this.setData({ isDateSwitching: true });
    this.selectedDate = new Date(`${paneItem.date}T00:00:00`);
    this.applyCurrentPane(paneItem);

    await this.loadData(true, { silent: true });
    this.setData({ isDateSwitching: false });

    if (offset !== 0) {
      this.resetSwiperToCenter();
    }
  },

  resetSwiperToCenter() {
    this.isResettingSwiper = true;
    this.setData({ swiperCurrent: SWIPER_CENTER_INDEX });
    setTimeout(() => {
      this.isResettingSwiper = false;
    }, SWIPER_DURATION + 20);
  },

  showDatePicker() {
    const page = this;

    wx.showActionSheet({
      itemList: ['今天', '明天', '后天'],
      success(res) {
        const date = new Date();

        if (res.tapIndex === 1) {
          date.setDate(date.getDate() + 1);
        } else if (res.tapIndex === 2) {
          date.setDate(date.getDate() + 2);
        }

        page.selectedDate = date;
        page.updateDateDisplay();
        page.loadData(true);
      }
    });
  },

  showStatusSheet() {
    wx.showActionSheet({
      itemList: ['全部比赛', '进行中', '已结束'],
      success: (res) => {
        const tabMap = [TABS.ALL, TABS.LIVE, TABS.RESULTS];
        const nextTab = tabMap[res.tapIndex];
        const paneItems = (this.data.paneItems || []).map((paneItem) => ({
          ...paneItem,
          matches: this.applyTabFilter(paneItem.allMatches, nextTab),
          hasMatches: this.applyTabFilter(paneItem.allMatches, nextTab).length > 0
        }));

        this.setData({
          activeTab: nextTab,
          paneItems
        });

        const currentPane = paneItems[SWIPER_CENTER_INDEX];
        if (currentPane) {
          this.applyCurrentPane(currentPane);
        }
      }
    });
  },

  onMatchTap(e) {
    console.log('Match tapped:', e.detail.match);
  }
});
