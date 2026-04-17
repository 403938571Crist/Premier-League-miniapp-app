/**
 * 常量定义
 */

// 英超球队信息（中文映射）
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
  389: { name: '卢顿', shortName: '卢顿', color: '#F78F1E' },
  65: { name: '曼城', shortName: '曼城', color: '#6CABDD' },
  66: { name: '曼联', shortName: '曼联', color: '#DA291C' },
  67: { name: '纽卡斯尔', shortName: '纽卡斯尔', color: '#241F20' },
  351: { name: '诺丁汉森林', shortName: '森林', color: '#DD0000' },
  356: { name: '谢菲联', shortName: '谢菲联', color: '#EE2737' },
  73: { name: '热刺', shortName: '热刺', color: '#132257' },
  563: { name: '西汉姆', shortName: '西汉姆', color: '#7A263A' },
  76: { name: '狼队', shortName: '狼队', color: '#FDB913' }
};

// 球队简称映射（用于战绩显示）
const TEAM_SHORT_NAMES = {
  'Arsenal FC': '阿森纳',
  'Aston Villa FC': '维拉',
  'Brentford FC': '布伦特福德',
  'Brighton & Hove Albion FC': '布莱顿',
  'Burnley FC': '伯恩利',
  'Chelsea FC': '切尔西',
  'Crystal Palace FC': '水晶宫',
  'Everton FC': '埃弗顿',
  'Fulham FC': '富勒姆',
  'Liverpool FC': '利物浦',
  'Luton Town FC': '卢顿',
  'Manchester City FC': '曼城',
  'Manchester United FC': '曼联',
  'Newcastle United FC': '纽卡斯尔',
  'Nottingham Forest FC': '森林',
  'Sheffield United FC': '谢菲联',
  'Sunderland AFC': '桑德兰',
  'Tottenham Hotspur FC': '热刺',
  'West Ham United FC': '西汉姆',
  'Wolverhampton Wanderers FC': '狼队'
};

// 比赛状态
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

// 比赛状态中文映射
const MATCH_STATUS_TEXT = {
  'NOT_STARTED': '未开始',
  'SCHEDULED': '未开始',
  'TIMED': '未开始',
  'LIVE': '直播中',
  'IN_PLAY': '进行中',
  'PAUSED': '暂停',
  'FINISHED': '已结束',
  'AWARDED': '已判定',
  'POSTPONED': '延期',
  'SUSPENDED': '中断',
  'CANCELED': '取消'
};

// 比赛状态样式
const MATCH_STATUS_STYLE = {
  'NOT_STARTED': 'status-pending',
  'SCHEDULED': 'status-pending',
  'TIMED': 'status-pending',
  'LIVE': 'status-live',
  'IN_PLAY': 'status-live',
  'PAUSED': 'status-pending',
  'FINISHED': 'status-finished',
  'AWARDED': 'status-finished',
  'POSTPONED': 'status-delayed',
  'SUSPENDED': 'status-delayed',
  'CANCELED': 'status-delayed'
};

// 排名区间
const STANDING_ZONES = {
  CHAMPION: { min: 1, max: 1, color: '#FFD700', name: '冠军' },
  CHAMPIONS_LEAGUE: { min: 2, max: 4, color: '#38003C', name: '欧冠区' },
  EUROPA_LEAGUE: { min: 5, max: 5, color: '#00FF85', name: '欧联区' },
  MIDDLE: { min: 6, max: 17, color: null, name: '常规区' },
  RELEGATION: { min: 18, max: 20, color: '#FF5252', name: '降级区' }
};

// 球员位置
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

// 缓存时长配置（毫秒）
const CACHE_DURATION = {
  STANDINGS: 5 * 60 * 1000,      // 5分钟
  FIXTURES: 60 * 1000,            // 1分钟
  TEAMS: 60 * 60 * 1000,          // 1小时
  TEAM_DETAIL: 10 * 60 * 1000,    // 10分钟
  PLAYER_DETAIL: 10 * 60 * 1000   // 10分钟
};

// 错误码
const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_LIMIT: 'API_LIMIT',
  DATA_NOT_FOUND: 'DATA_NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT: 'TIMEOUT'
};

// 错误信息
const ERROR_MESSAGES = {
  'NETWORK_ERROR': '网络开小差了，请检查网络连接',
  'API_LIMIT': '请求过于频繁，请稍后再试',
  'DATA_NOT_FOUND': '暂无相关数据',
  'SERVER_ERROR': '服务器繁忙，请稍后重试',
  'TIMEOUT': '请求超时，请稍后重试'
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
