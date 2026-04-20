/**
 * Common constants used by the miniapp.
 */

const PREMIER_LEAGUE_TEAMS = {
  57: { name: '阿森纳', shortName: '阿森纳', color: '#EF0107' },
  58: { name: '阿斯顿维拉', shortName: '维拉', color: '#95BFE5' },
  402: { name: '布伦特福德', shortName: '布伦特福德', color: '#E30613' },
  397: { name: '布莱顿', shortName: '布莱顿', color: '#0057B8' },
  328: { name: '伯恩利', shortName: '伯恩利', color: '#6C1D45' },
  61: { name: '切尔西', shortName: '切尔西', color: '#034694' },
  354: { name: '水晶宫', shortName: '水晶宫', color: '#1B458F' },
  62: { name: '埃弗顿', shortName: '埃弗顿', color: '#003399' },
  63: { name: '富勒姆', shortName: '富勒姆', color: '#000000' },
  64: { name: '利物浦', shortName: '利物浦', color: '#C8102E' },
  389: { name: '卢顿镇', shortName: '卢顿', color: '#F78F1E' },
  65: { name: '曼彻斯特城', shortName: '曼城', color: '#6CABDD' },
  66: { name: '曼彻斯特联', shortName: '曼联', color: '#DA291C' },
  67: { name: '纽卡斯尔联', shortName: '纽卡斯尔', color: '#241F20' },
  351: { name: '诺丁汉森林', shortName: '森林', color: '#DD0000' },
  356: { name: '谢菲尔德联', shortName: '谢菲联', color: '#EE2737' },
  73: { name: '托特纳姆热刺', shortName: '热刺', color: '#132257' },
  563: { name: '西汉姆联', shortName: '西汉姆', color: '#7A263A' },
  76: { name: '伍尔弗汉普顿', shortName: '狼队', color: '#FDB913' }
};

const TEAM_SHORT_NAMES = {
  'Arsenal FC': '阿森纳',
  'Arsenal': '阿森纳',
  'Aston Villa FC': '维拉',
  'Aston Villa': '维拉',
  'Brentford FC': '布伦特福德',
  'Brentford': '布伦特福德',
  'Brighton & Hove Albion FC': '布莱顿',
  'Brighton & Hove Albion': '布莱顿',
  'Brighton': '布莱顿',
  'Burnley FC': '伯恩利',
  'Burnley': '伯恩利',
  'Chelsea FC': '切尔西',
  'Chelsea': '切尔西',
  'Crystal Palace FC': '水晶宫',
  'Crystal Palace': '水晶宫',
  'Everton FC': '埃弗顿',
  'Everton': '埃弗顿',
  'Fulham FC': '富勒姆',
  'Fulham': '富勒姆',
  'Liverpool FC': '利物浦',
  'Liverpool': '利物浦',
  'Luton Town FC': '卢顿',
  'Luton Town': '卢顿',
  'Luton': '卢顿',
  'Manchester City FC': '曼城',
  'Manchester City': '曼城',
  'Man City': '曼城',
  'Manchester United FC': '曼联',
  'Manchester United': '曼联',
  'Man United': '曼联',
  'Newcastle United FC': '纽卡斯尔',
  'Newcastle United': '纽卡斯尔',
  'Newcastle': '纽卡斯尔',
  'Nottingham Forest FC': '森林',
  'Nottingham Forest': '森林',
  'Nott\'m Forest': '森林',
  'Sheffield United FC': '谢菲联',
  'Sheffield United': '谢菲联',
  'Sheffield': '谢菲联',
  'Sunderland AFC': '桑德兰',
  'Sunderland': '桑德兰',
  'Tottenham Hotspur FC': '热刺',
  'Tottenham Hotspur': '热刺',
  'Spurs': '热刺',
  'West Ham United FC': '西汉姆',
  'West Ham United': '西汉姆',
  'West Ham': '西汉姆',
  'Wolverhampton Wanderers FC': '狼队',
  'Wolverhampton Wanderers': '狼队',
  'Wolves': '狼队',
  'Wolverhampton': '狼队'
};

const MATCH_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  SCHEDULED: 'SCHEDULED',
  TIMED: 'TIMED',
  LIVE: 'LIVE',
  IN_PLAY: 'IN_PLAY',
  PAUSED: 'PAUSED',
  FINISHED: 'FINISHED',
  AWARDED: 'AWARDED',
  POSTPONED: 'POSTPONED',
  SUSPENDED: 'SUSPENDED',
  CANCELED: 'CANCELED'
};

const MATCH_STATUS_TEXT = {
  NOT_STARTED: '未开始',
  SCHEDULED: '未开始',
  TIMED: '待开始',
  LIVE: '进行中',
  IN_PLAY: '进行中',
  PAUSED: '暂停',
  FINISHED: '已结束',
  AWARDED: '加时判定',
  POSTPONED: '推迟',
  SUSPENDED: '中止',
  CANCELED: '取消'
};

const MATCH_STATUS_STYLE = {
  NOT_STARTED: 'status-pending',
  SCHEDULED: 'status-pending',
  TIMED: 'status-pending',
  LIVE: 'status-live',
  IN_PLAY: 'status-live',
  PAUSED: 'status-pending',
  FINISHED: 'status-finished',
  AWARDED: 'status-finished',
  POSTPONED: 'status-delayed',
  SUSPENDED: 'status-delayed',
  CANCELED: 'status-delayed'
};

const STANDING_ZONES = {
  CHAMPION: { min: 1, max: 1, color: '#FFD700', name: '冠军' },
  CHAMPIONS_LEAGUE: { min: 2, max: 4, color: '#38003C', name: '欧冠区' },
  EUROPA_LEAGUE: { min: 5, max: 5, color: '#00FF85', name: '欧联区' },
  MIDDLE: { min: 6, max: 17, color: null, name: '中游区' },
  RELEGATION: { min: 18, max: 20, color: '#FF5252', name: '降级区' }
};

const PLAYER_POSITIONS = {
  'Goalkeeper': '门将',
  'Defence': '后卫',
  'Defender': '后卫',
  'Midfield': '中场',
  'Midfielder': '中场',
  'Offence': '前锋',
  'Offender': '前锋',
  'Forward': '前锋'
};

const CACHE_DURATION = {
  STANDINGS: 5 * 60 * 1000,      // 5分钟
  FIXTURES: 60 * 1000,           // 1分钟
  TEAMS: 60 * 60 * 1000,         // 1小时
  TEAM_DETAIL: 10 * 60 * 1000,   // 10分钟
  PLAYER_DETAIL: 10 * 60 * 1000   // 10分钟
};

const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_LIMIT: 'API_LIMIT',
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  DATA_NOT_FOUND: 'DATA_NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT: 'TIMEOUT'
};

const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络异常，请稍后重试',
  API_LIMIT: '请求过于频繁，请稍后再试',
  AUTH_REQUIRED: '请先登录',
  DATA_NOT_FOUND: '未找到对应数据',
  SERVER_ERROR: '服务器异常，请稍后再试',
  TIMEOUT: '请求超时，请稍后再试'
};

module.exports = {
  PREMIER_LEAGUE_TEAMS,
  TEAM_SHORT_NAMES,
  MATCH_STATUS,
  MATCH_STATUS_TEXT,
  MATCH_STATUS_STYLE,
  STANDING_ZONES,
  PLAYER_POSITIONS,
  CACHE_DURATION,
  ERROR_CODES,
  ERROR_MESSAGES
};
