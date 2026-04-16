const { getFixtures } = require('../../utils/api');
const { formatDate } = require('../../utils/util');

const SWIPE_THRESHOLD = 50;
const SWITCH_OUT_DURATION = 70;
const SWITCH_IN_DURATION = 140;
const SHOW_REFRESH_INTERVAL = 2 * 60 * 1000;

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
    filterWeek: '周六',
    filterDate: '04月11日',
    matches: [],
    allMatches: [],
    hasMatches: false,
    isCached: false,
    cacheTime: '',
    activeTab: TABS.ALL,
    isDateSwitching: false,
    contentTransitionClass: '',
    heroTransitionClass: '',
    lastLoadedAt: 0
  },

  selectedDate: null,
  touchStartX: 0,
  touchStartY: 0,
  touchEndX: 0,
  touchEndY: 0,
  isTouchTracking: false,

  onLoad() {
    this.selectedDate = new Date();
    this.updateDateDisplay();
    this.loadData();
  },

  onShow() {
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

  updateDateDisplay() {
    const date = this.selectedDate;
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    this.setData({
      filterWeek: WEEKDAY_ZH[date.getDay()],
      filterDate: `${month}月${day}日`
    });
  },

  getCacheInfo(result) {
    if (!result.isCached || !result.cachedAt) {
      return { isCached: false, cacheTime: '' };
    }

    const minutesAgo = Math.floor((Date.now() - result.cachedAt) / 60000);
    return {
      isCached: true,
      cacheTime: minutesAgo < 1 ? '刚刚更新' : `${minutesAgo}分钟前更新`
    };
  },

  getMatchdayText(matches) {
    if (!matches.length || !matches[0].matchday) {
      return '';
    }

    return `英超第${matches[0].matchday}轮`;
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

  applyTabFilter(matches = this.data.allMatches, activeTab = this.data.activeTab) {
    if (activeTab === TABS.LIVE) {
      return matches.filter((match) => this.isLiveStatus(match.status));
    }

    if (activeTab === TABS.RESULTS) {
      return matches.filter((match) => this.isFinishedStatus(match.status));
    }

    return matches;
  },

  async loadData(useCache = true, options = {}) {
    const { silent = false, preserveContent = false } = options;

    this.setData({
      loading: silent ? this.data.loading : true,
      error: null,
      matches: preserveContent ? this.data.matches : [],
      hasMatches: preserveContent ? this.data.hasMatches : false
    });

    try {
      const dateStr = formatDate(this.selectedDate, 'YYYY-MM-DD');
      const result = await getFixtures(
        {
          dateFrom: dateStr,
          dateTo: dateStr
        },
        useCache
      );

      const allMatches = result.matches || [];
      const filteredMatches = this.applyTabFilter(allMatches, this.data.activeTab);

      this.setData({
        loading: false,
        allMatches,
        matches: filteredMatches,
        hasMatches: filteredMatches.length > 0,
        currentMatchday: this.getMatchdayText(allMatches),
        heroEyebrow: this.getHeroEyebrow(allMatches),
        lastLoadedAt: Date.now(),
        ...this.getCacheInfo(result)
      });
    } catch (error) {
      console.error('加载赛程失败:', error);
      this.setData({
        loading: false,
        allMatches: preserveContent ? this.data.allMatches : [],
        matches: preserveContent ? this.data.matches : [],
        hasMatches: preserveContent ? this.data.hasMatches : false,
        currentMatchday: preserveContent ? this.data.currentMatchday : '',
        heroEyebrow: preserveContent ? this.data.heroEyebrow : '比赛日',
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

    const nextMatches = this.applyTabFilter(this.data.allMatches, nextTab);

    this.setData({
      activeTab: nextTab,
      matches: nextMatches,
      hasMatches: nextMatches.length > 0
    });
  },

  prevDate() {
    return this.changeDateBy(-1);
  },

  nextDate() {
    return this.changeDateBy(1);
  },

  async changeDateBy(offset) {
    if (this.data.isDateSwitching) {
      return;
    }

    const exitClass = offset > 0 ? 'slide-next-out' : 'slide-prev-out';
    const enterClass = offset > 0 ? 'slide-next-in' : 'slide-prev-in';
    const nextDate = new Date(this.selectedDate);
    nextDate.setDate(nextDate.getDate() + offset);

    this.setData({
      isDateSwitching: true,
      heroTransitionClass: exitClass,
      contentTransitionClass: exitClass
    });

    await this.wait(SWITCH_OUT_DURATION);

    this.selectedDate = nextDate;
    this.updateDateDisplay();
    await this.loadData(true, {
      silent: true,
      preserveContent: true
    });

    this.setData({
      heroTransitionClass: enterClass,
      contentTransitionClass: enterClass
    });

    await this.wait(SWITCH_IN_DURATION);

    this.setData({
      isDateSwitching: false,
      heroTransitionClass: '',
      contentTransitionClass: ''
    });
  },

  handleTouchStart(e) {
    const touch = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
    if (!touch) {
      return;
    }

    this.isTouchTracking = true;
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchEndX = touch.clientX;
    this.touchEndY = touch.clientY;
  },

  handleTouchMove(e) {
    if (!this.isTouchTracking) {
      return;
    }

    const touch = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
    if (!touch) {
      return;
    }

    this.touchEndX = touch.clientX;
    this.touchEndY = touch.clientY;
  },

  handleTouchEnd(e) {
    if (!this.isTouchTracking) {
      return;
    }

    const touch = e && ((e.changedTouches && e.changedTouches[0]) || (e.touches && e.touches[0]));
    if (touch) {
      this.touchEndX = touch.clientX;
      this.touchEndY = touch.clientY;
    }

    this.isTouchTracking = false;

    if (this.data.isDateSwitching) {
      this.resetTouchTracking();
      return;
    }

    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = this.touchEndY - this.touchStartY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX < SWIPE_THRESHOLD || absX <= absY) {
      this.resetTouchTracking();
      return;
    }

    if (deltaX > 0) {
      this.prevDate();
      this.resetTouchTracking();
      return;
    }

    this.nextDate();
    this.resetTouchTracking();
  },

  handleTouchCancel() {
    this.isTouchTracking = false;
    this.resetTouchTracking();
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
      itemList: ['全部比赛', '直播中', '已结束'],
      success: (res) => {
        const tabMap = [TABS.ALL, TABS.LIVE, TABS.RESULTS];
        const nextTab = tabMap[res.tapIndex];
        const nextMatches = this.applyTabFilter(this.data.allMatches, nextTab);
        this.setData({
          activeTab: nextTab,
          matches: nextMatches,
          hasMatches: nextMatches.length > 0
        });
      }
    });
  },

  onMatchTap(e) {
    const match = e.detail.match;
    console.log('点击比赛:', match);
  },

  wait(duration) {
    return new Promise((resolve) => {
      setTimeout(resolve, duration);
    });
  },

  resetTouchTracking() {
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.touchEndY = 0;
  }
});
