const { getPlayerDetail, getPlayerMatches, getTeamDetail } = require('../../utils/api');
const { calculateAge, getTeamName } = require('../../utils/util');
const logger = require('../../utils/logger');

Page({
  data: {
    loading: true,
    error: null,
    playerId: '',
    player: {},
    playerStats: {}
  },

  onLoad(options) {
    const { id } = options || {};
    if (!id) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      wx.navigateBack();
      return;
    }

    this.setData({ playerId: id });
    this.loadData(id);
  },

  async loadData(playerId) {
    this.setData({ loading: true, error: null });

    try {
      const [playerData, matchesResult] = await Promise.all([
        getPlayerDetail(playerId),
        getPlayerMatches(playerId, 10).catch(() => ({ matches: [] }))
      ]);

      let currentTeam = null;
      if (playerData.teamId) {
        try {
          const teamData = await getTeamDetail(playerData.teamId);
          currentTeam = {
            id: teamData.id,
            name: getTeamName(teamData.name)
          };
        } catch (teamError) {
          logger.error('Failed to load player team:', teamError);
        }
      }

      const appearances = (matchesResult.matches || []).length;
      const goals = 0;

      this.setData({
        loading: false,
        player: {
          id: playerData.id,
          name: playerData.name,
          photo: playerData.photo || playerData.photoUrl || '/images/default/player.png',
          position: playerData.positionLabel || playerData.chinesePosition || playerData.position || '未知',
          nationality: playerData.nationalityLabel || playerData.chineseNationality || playerData.nationality || '',
          dateOfBirth: playerData.dateOfBirth,
          age: playerData.age || calculateAge(playerData.dateOfBirth),
          height: playerData.height,
          shirtNumber: playerData.shirtNumber,
          currentTeam
        },
        playerStats: {
          appearances,
          goals,
          assists: 0,
          goalsPerMatch: appearances > 0 ? (goals / appearances).toFixed(2) : '0.00',
          yellowCards: 0,
          redCards: 0
        }
      });
    } catch (error) {
      logger.error('Failed to load player detail:', error);
      this.setData({
        loading: false,
        error: {
          title: '加载失败',
          description: error.message || '请检查网络连接后重试'
        }
      });
    }
  },

  goToTeam() {
    const team = this.data.player.currentTeam;
    if (team) {
      wx.navigateTo({
        url: `/pages/team-detail/team-detail?id=${team.id}&name=${encodeURIComponent(team.name)}`
      });
    }
  },

  onShareAppMessage() {
    const player = this.data.player || {};
    const name = player.name || '英超球员';
    const id = this.data.playerId || player.id || '';
    return {
      title: `${name} · 英超球员资料`,
      path: id ? `/pages/player-detail/player-detail?id=${id}&name=${encodeURIComponent(name)}` : '/pages/index/index'
    };
  },

  onShareTimeline() {
    const player = this.data.player || {};
    const name = player.name || '英超球员';
    return {
      title: `${name} · 英超球员资料`,
      query: this.data.playerId ? `id=${this.data.playerId}&name=${encodeURIComponent(name)}` : ''
    };
  }
});
