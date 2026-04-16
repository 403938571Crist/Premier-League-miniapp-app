const { getTeamName, getStandingZoneStyle } = require('../../utils/util');

Component({
  properties: {
    team: {
      type: Object,
      value: {},
      observer(newVal) {
        if (newVal) {
          this.processTeamData(newVal);
        }
      }
    }
  },

  data: {
    position: 0,
    name: '',
    logo: '',
    played: 0,
    goalDiff: 0,
    points: 0,
    zoneColor: null
  },

  methods: {
    processTeamData(team) {
      const { position, team: teamInfo, playedGames, goalDifference, points } = team;
      
      // 获取排名区间样式
      const zoneStyle = getStandingZoneStyle(position);
      
      this.setData({
        position,
        name: getTeamName(teamInfo.name),
        logo: teamInfo.crest || '/images/default/team.png',
        played: playedGames,
        goalDiff: goalDifference,
        points,
        zoneColor: zoneStyle?.color || null
      });
    },

    onTap() {
      this.triggerEvent('tap', { team: this.properties.team });
    }
  }
});
