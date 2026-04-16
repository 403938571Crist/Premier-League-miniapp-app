const { getTeams, getStandings } = require('../../utils/api');

Page({
  data: {
    loading: true,
    error: null,
    teams: []
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    if (!this.data.loading && !this.data.teams.length && !this.data.error) {
      this.loadData();
    }
  },

  onPullDownRefresh() {
    this.loadData(false).finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  async loadData(useCache = true) {
    this.setData({ loading: true, error: null });

    try {
      const [teamsResult, standingsResult] = await Promise.allSettled([
        getTeams(useCache),
        getStandings('TOTAL', useCache)
      ]);

      const teamsData = teamsResult.status === 'fulfilled' ? teamsResult.value : { teams: [] };
      const standingsData = standingsResult.status === 'fulfilled' ? standingsResult.value : null;

      const standingsMap = {};
      if (standingsData) {
        const table = standingsData.standings?.[0]?.table || [];
        table.forEach((row) => {
          standingsMap[row.team.id] = row;
        });
      }

      const teams = (teamsData.teams || []).map((team) => {
        const row = standingsMap[team.id] || {};
        return {
          id: team.id,
          name: team.name,
          crest: team.crest,
          position: row.position || null,
          points: row.points != null ? row.points : null
        };
      }).sort((a, b) => {
        if (a.position && b.position) return a.position - b.position;
        if (a.position) return -1;
        if (b.position) return 1;
        return a.name.localeCompare(b.name);
      });

      this.setData({ loading: false, teams });
    } catch (error) {
      console.error('加载球队列表失败:', error);
      this.setData({
        loading: false,
        error: {
          title: '加载失败',
          description: error.message || '请检查网络连接后重试'
        }
      });
    }
  },

  onTeamTap(e) {
    const { id, name } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/team-detail/team-detail?id=${id}&name=${encodeURIComponent(name)}`
    });
  }
});
