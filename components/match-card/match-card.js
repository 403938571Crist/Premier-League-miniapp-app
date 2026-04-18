const {
  getTeamName,
  getMatchStatusText,
  getMatchStatusStyle,
  isMatchLive,
  isMatchFinished
} = require('../../utils/util');

Component({
  properties: {
    match: {
      type: Object,
      value: {},
      observer(newValue) {
        if (newValue) {
          this.processMatchData(newValue);
        }
      }
    },
    variant: {
      type: String,
      value: 'default'
    },
    isHighlight: {
      type: Boolean,
      value: false
    }
  },

  data: {
    dateText: '',
    time: '',
    matchday: '',
    homeTeam: { name: '', logo: '' },
    awayTeam: { name: '', logo: '' },
    homeScore: 0,
    awayScore: 0,
    status: '',
    statusText: '',
    statusClass: '',
    isLive: false,
    minute: '',
    competition: ''
  },

  methods: {
    processMatchData(match) {
      // 统一按北京时间 (UTC+8) 渲染，避免不同设备/开发者工具时区差异
      const utc = new Date(match.utcDate);
      const bj = new Date(utc.getTime() + 8 * 60 * 60 * 1000);
      const dateText = `${String(bj.getUTCMonth() + 1).padStart(2, '0')}月${String(
        bj.getUTCDate()
      ).padStart(2, '0')}日`;
      const time = `${String(bj.getUTCHours()).padStart(2, '0')}:${String(
        bj.getUTCMinutes()
      ).padStart(2, '0')}`;
      const homeScore = match.score?.fullTime?.home ?? 0;
      const awayScore = match.score?.fullTime?.away ?? 0;
      const status = match.status || '';
      const isLive = isMatchLive(status);
      const isFinished = isMatchFinished(status);
      const minute = match.minute || '';

      this.setData({
        dateText,
        time,
        matchday: match.matchday ? `英超第${match.matchday}轮` : '',
        homeTeam: {
          name: getTeamName(match.homeTeam?.name || ''),
          logo: match.homeTeam?.crest || '/images/default/team.png'
        },
        awayTeam: {
          name: getTeamName(match.awayTeam?.name || ''),
          logo: match.awayTeam?.crest || '/images/default/team.png'
        },
        homeScore,
        awayScore,
        status,
        statusText: getMatchStatusText(status),
        statusClass: getMatchStatusStyle(status),
        isLive,
        minute,
        competition: match.competition?.name || 'Premier League',
        isFinished
      });
    },

    onTap() {
      this.triggerEvent('tap', { match: this.properties.match });
    }
  }
});
