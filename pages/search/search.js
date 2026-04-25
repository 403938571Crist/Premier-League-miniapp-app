const { search } = require('../../utils/api');
const logger = require('../../utils/logger');

const DEBOUNCE_DELAY = 400;

Page({
  data: {
    keyword: '',
    searching: false,
    hasSearched: false,
    teams: [],
    players: []
  },

  debounceTimer: null,

  onLoad() {
    // 自动聚焦搜索框
  },

  onKeywordInput(e) {
    const keyword = e.detail.value || '';
    this.setData({ keyword });

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    if (!keyword.trim()) {
      this.setData({ hasSearched: false, teams: [], players: [] });
      return;
    }

    this.debounceTimer = setTimeout(() => {
      this.doSearch(keyword.trim());
    }, DEBOUNCE_DELAY);
  },

  onClear() {
    this.setData({ keyword: '', hasSearched: false, teams: [], players: [] });
  },

  async doSearch(keyword) {
    this.setData({ searching: true });

    try {
      const result = await search(keyword);
      this.setData({
        searching: false,
        hasSearched: true,
        teams: result.teams || [],
        players: result.players || []
      });
    } catch (error) {
      logger.error('搜索失败:', error);
      this.setData({
        searching: false,
        hasSearched: true,
        teams: [],
        players: []
      });
    }
  },

  onTeamTap(e) {
    const { id, name } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/team-detail/team-detail?id=${id}&name=${encodeURIComponent(name)}`
    });
  },

  onPlayerTap(e) {
    const { id, name } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/player-detail/player-detail?id=${id}&name=${encodeURIComponent(name)}`
    });
  }
});
