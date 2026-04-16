const {
  getTeamDetail,
  getTeamFixtures,
  getTeamSquad,
  getTeamStats
} = require('../../utils/api');
const { getTeamName } = require('../../utils/util');

Page({
  data: {
    loading: true,
    error: null,
    teamId: '',
    team: {},
    teamStats: {},
    recentMatches: [],
    squad: {
      goalkeepers: [],
      defenders: [],
      midfielders: [],
      forwards: []
    },
    teamFixtures: [],
    activeTab: 'overview'
  },

  onLoad(options) {
    const { id } = options || {};
    if (!id) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      wx.navigateBack();
      return;
    }

    this.setData({ teamId: id });
    this.loadData(id);
  },

  async loadData(teamId) {
    this.setData({ loading: true, error: null });

    try {
      const [teamDetail, fixturesResult, squadResult, statsResult] = await Promise.all([
        getTeamDetail(teamId),
        getTeamFixtures(teamId, 10).catch(() => ({ matches: [] })),
        getTeamSquad(teamId).catch(() => ({
          goalkeepers: [],
          defenders: [],
          midfielders: [],
          forwards: []
        })),
        getTeamStats(teamId).catch(() => ({}))
      ]);

      const teamFixtures = fixturesResult.matches || [];
      const recentMatches = this.processRecentMatches(teamFixtures, Number(teamId));

      this.setData({
        loading: false,
        team: {
          id: teamDetail.id,
          name: getTeamName(teamDetail.name),
          logo: teamDetail.crest || '/images/default/team.png',
          venue: teamDetail.venue,
          founded: teamDetail.founded,
          address: teamDetail.address,
          website: teamDetail.website
        },
        teamStats: {
          position: statsResult.position || null,
          points: statsResult.points || 0,
          played: statsResult.played || 0,
          goalsFor: statsResult.goalsFor || 0,
          goalsAgainst: statsResult.goalsAgainst || 0
        },
        squad: {
          goalkeepers: squadResult.goalkeepers || [],
          defenders: squadResult.defenders || [],
          midfielders: squadResult.midfielders || [],
          forwards: squadResult.forwards || []
        },
        teamFixtures,
        recentMatches
      });
    } catch (error) {
      console.error('Failed to load team detail:', error);
      this.setData({
        loading: false,
        error: {
          title: '加载失败',
          description: error.message || '请检查网络连接后重试'
        }
      });
    }
  },

  processRecentMatches(matches, teamId) {
    return matches
      .filter((match) => {
        return ['FINISHED', 'LIVE', 'IN_PLAY', 'PAUSED'].includes(match.status)
          && match.score
          && match.score.fullTime;
      })
      .slice(0, 5)
      .map((match) => {
        const isHome = Number(match.homeTeam.id) === teamId;
        const teamScore = isHome ? match.score.fullTime.home : match.score.fullTime.away;
        const opponentScore = isHome ? match.score.fullTime.away : match.score.fullTime.home;
        const opponent = isHome ? match.awayTeam : match.homeTeam;

        let result = 'draw';
        let resultText = '平';

        if ((teamScore || 0) > (opponentScore || 0)) {
          result = 'win';
          resultText = '胜';
        } else if ((teamScore || 0) < (opponentScore || 0)) {
          result = 'loss';
          resultText = '负';
        }

        return {
          result,
          resultText,
          score: `${teamScore ?? '-'}:${opponentScore ?? '-'}`,
          opponent: getTeamName(opponent.name)
        };
      });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  onPlayerTap(e) {
    const player = e.detail.player;
    wx.navigateTo({
      url: `/pages/player-detail/player-detail?id=${player.id}&name=${encodeURIComponent(player.name)}`
    });
  },

  onFollowChange(e) {
    console.log('Follow state changed:', e.detail);
  }
});
