const { ERROR_CODES, ERROR_MESSAGES } = require('./constants');
const { request } = require('./request');
const {
  TEAM_DEFAULT_IMAGE,
  PLAYER_DEFAULT_IMAGE,
  normalizeImageUrl,
  normalizeImageUrlWithFallback
} = require('./image');

function buildQueryString(params = {}) {
  return Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .sort()
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
}

function buildApiPath(path, params = {}) {
  const queryString = buildQueryString(params);
  return `${path}${queryString ? `?${queryString}` : ''}`;
}

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function normalizeImage(url, fallback) {
  return normalizeImageUrlWithFallback(url, '', fallback);
}

function getCache(cacheKey, useCache) {
  if (!useCache) {
    return null;
  }

  const app = getApp();
  return app?.getCache ? app.getCache(cacheKey) : null;
}

function setCache(cacheKey, data) {
  const app = getApp();
  if (app?.setCache) {
    app.setCache(cacheKey, data);
  }
}

function wrapCachedResult(cache, transform = (data) => data) {
  return {
    ...transform(cloneData(cache.data)),
    isCached: true,
    cachedAt: cache.cachedAt
  };
}

function requestApi(path, options = {}) {
  return request({
    path,
    method: options.method || 'GET',
    data: options.data,
    errorMessage: ERROR_MESSAGES.SERVER_ERROR,
    showError: false
  });
}

function normalizeStatus(status) {
  if (status === 'CANCELLED') {
    return 'CANCELED';
  }
  return status || 'SCHEDULED';
}

function normalizeTeamId(team) {
  return team?.apiId || team?.teamId || team?.id || null;
}

function normalizeTeamName(team) {
  return team?.chineseName || team?.shortName || team?.teamName || team?.name || '';
}

function normalizeTeamDetail(team = {}) {
  const source = team.team || team;

  return {
    id: normalizeTeamId(source),
    dbId: source.id || null,
    apiId: source.apiId || source.teamId || source.id || null,
    name: normalizeTeamName(source),
    shortName: source.shortName || source.teamShortName || source.name || '',
    crest: normalizeImageUrlWithFallback(source.crestUrl, source.crest, TEAM_DEFAULT_IMAGE),
    venue: source.venue || '',
    founded: source.founded || null,
    address: source.address || '',
    website: source.website || '',
    clubColors: source.clubColors || '',
    position: team.position || source.position || null,
    playedGames: team.playedGames || team.played || source.playedGames || 0,
    won: team.won || source.won || 0,
    draw: team.draw || source.draw || 0,
    lost: team.lost || source.lost || 0,
    points: team.points || source.points || 0,
    goalsFor: team.goalsFor || team.goals || source.goalsFor || 0,
    goalsAgainst: team.goalsAgainst || source.goalsAgainst || 0,
    goalDifference: team.goalDifference || source.goalDifference || 0,
    raw: team
  };
}

function normalizeStandingRow(team = {}) {
  const normalizedTeam = normalizeTeamDetail(team);

  return {
    position: normalizedTeam.position || 0,
    team: {
      id: normalizedTeam.id,
      dbId: normalizedTeam.dbId,
      apiId: normalizedTeam.apiId,
      name: normalizedTeam.name,
      crest: normalizedTeam.crest
    },
    playedGames: normalizedTeam.playedGames,
    won: normalizedTeam.won,
    draw: normalizedTeam.draw,
    lost: normalizedTeam.lost,
    points: normalizedTeam.points,
    goalsFor: normalizedTeam.goalsFor,
    goalsAgainst: normalizedTeam.goalsAgainst,
    goalDifference: normalizedTeam.goalDifference
  };
}

function normalizeScoreValue(value) {
  return value === null || value === undefined ? null : value;
}

function normalizeMatch(match = {}) {
  const homeTeam = match.homeTeam || {};
  const awayTeam = match.awayTeam || {};

  return {
    id: match.apiId || match.matchId || match.id,
    dbId: match.id || null,
    apiId: match.apiId || match.matchId || match.id,
    season: match.season || '',
    matchday: match.matchday || null,
    utcDate: match.utcDate || match.matchDate || match.kickoffTime || '',
    status: normalizeStatus(match.status),
    minute: match.duration || '',
    venue: match.venue || '',
    stage: match.stage || '',
    referee: match.referee || '',
    competition: {
      name: 'Premier League'
    },
    homeTeam: {
      id: match.homeTeamId || homeTeam.id || homeTeam.apiId || null,
      name: match.homeTeamChineseName || match.homeTeamName || homeTeam.chineseName || homeTeam.shortName || homeTeam.name || '',
      crest: normalizeImageUrlWithFallback(match.homeTeamCrest, homeTeam.crestUrl, TEAM_DEFAULT_IMAGE)
    },
    awayTeam: {
      id: match.awayTeamId || awayTeam.id || awayTeam.apiId || null,
      name: match.awayTeamChineseName || match.awayTeamName || awayTeam.chineseName || awayTeam.shortName || awayTeam.name || '',
      crest: normalizeImageUrlWithFallback(match.awayTeamCrest, awayTeam.crestUrl, TEAM_DEFAULT_IMAGE)
    },
    score: {
      fullTime: {
        home: normalizeScoreValue(match.homeScore ?? match.score?.fullTime?.home),
        away: normalizeScoreValue(match.awayScore ?? match.score?.fullTime?.away)
      },
      halfTime: {
        home: normalizeScoreValue(match.homeHalfScore ?? match.score?.halfTime?.home),
        away: normalizeScoreValue(match.awayHalfScore ?? match.score?.halfTime?.away)
      }
    },
    raw: match
  };
}

function normalizeMatches(matches = []) {
  return matches.map(normalizeMatch);
}

function normalizePlayer(player = {}) {
  return {
    id: player.apiId || player.id,
    dbId: player.id || null,
    apiId: player.apiId || player.id || null,
    teamId: player.teamId || null,
    name: player.chineseName || player.name || '',
    firstName: player.firstName || '',
    lastName: player.lastName || '',
    photo: normalizeImage(player.photoUrl, PLAYER_DEFAULT_IMAGE),
    photoUrl: normalizeImageUrl(player.photoUrl, ''),
    shirtNumber: player.shirtNumber || '',
    position: player.position || '',
    chinesePosition: player.chinesePosition || '',
    positionLabel: player.chinesePosition || player.position || '',
    nationality: player.nationality || '',
    chineseNationality: player.chineseNationality || '',
    nationalityLabel: player.chineseNationality || player.nationality || '',
    dateOfBirth: player.dateOfBirth || '',
    age: player.age || null,
    height: player.height || null,
    weight: player.weight || null,
    foot: player.foot || '',
    contractUntil: player.contractUntil || '',
    marketValue: player.marketValue || null,
    raw: player
  };
}

function normalizePlayerStat(stat = {}) {
  const playerName = stat.chineseName || stat.playerName || '';
  const teamName = stat.teamChineseName || stat.teamShortName || stat.teamName || '';

  return {
    rank: stat.rank || 0,
    playerId: stat.playerId || null,
    playerName,
    englishName: stat.playerName || '',
    teamName,
    teamShortName: stat.teamShortName || stat.teamName || '',
    teamCrest: normalizeImage(stat.teamCrest, TEAM_DEFAULT_IMAGE),
    position: stat.chinesePosition || stat.position || '球员',
    goals: stat.goals || 0,
    assists: stat.assists || 0,
    penalties: stat.penalties || 0,
    playedMatches: stat.playedMatches || 0,
    photoUrl: normalizeImage(stat.photoUrl, PLAYER_DEFAULT_IMAGE),
    raw: stat
  };
}

async function getStandings(type = 'TOTAL', useCache = true) {
  const cacheKey = type === 'TOTAL' ? 'standings' : `standings:${type}`;
  const cache = getCache(cacheKey, useCache);

  if (cache) {
    return wrapCachedResult(cache);
  }

  const data = await requestApi(buildApiPath('/teams/standings', { type }));
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.table)
      ? data.table
      : Array.isArray(data?.standings)
        ? data.standings
        : [];
  const result = {
    standings: [
      {
        type,
        table: list.map(normalizeStandingRow)
      }
    ]
  };

  setCache(cacheKey, result);
  return {
    ...cloneData(result),
    isCached: false
  };
}

async function getFixtures(params = {}, useCache = true) {
  let path = '/matches/current';
  const queryParams = {};

  if (params.matchday) {
    path = '/matches';
    queryParams.matchday = params.matchday;
  } else if (params.date) {
    path = '/matches';
    queryParams.date = params.date;
  } else if (params.dateFrom && params.dateTo && params.dateFrom === params.dateTo) {
    path = '/matches';
    queryParams.date = params.dateFrom;
  } else if (params.dateFrom && params.dateTo) {
    path = '/matches/range';
    queryParams.start = params.dateFrom;
    queryParams.end = params.dateTo;
  }

  const cacheKey = `fixtures:${path}:${buildQueryString(queryParams) || 'default'}`;
  const cache = getCache(cacheKey, useCache);

  if (cache) {
    return wrapCachedResult(cache);
  }

  const data = await requestApi(buildApiPath(path, queryParams));
  const list = Array.isArray(data) ? data : Array.isArray(data?.matches) ? data.matches : [];
  const result = {
    matches: normalizeMatches(list)
  };

  setCache(cacheKey, result);
  return {
    ...cloneData(result),
    isCached: false
  };
}

async function getTeams(useCache = true) {
  const cacheKey = 'teams';
  const cache = getCache(cacheKey, useCache);

  if (cache) {
    return wrapCachedResult(cache);
  }

  const data = await requestApi('/teams');
  const list = Array.isArray(data) ? data : Array.isArray(data?.teams) ? data.teams : [];
  const result = {
    teams: list.map(normalizeTeamDetail)
  };

  setCache(cacheKey, result);
  return {
    ...cloneData(result),
    isCached: false
  };
}

async function getTeamDetail(teamId, useCache = true) {
  const cacheKey = `team_${teamId}`;
  const cache = getCache(cacheKey, useCache);

  if (cache) {
    return wrapCachedResult(cache);
  }

  const data = await requestApi(`/teams/${teamId}`);
  const result = normalizeTeamDetail(data);

  setCache(cacheKey, result);
  return {
    ...cloneData(result),
    isCached: false
  };
}

async function getTeamFixtures(teamId, limit = 10, useCache = true) {
  const cacheKey = `team_${teamId}_matches_${limit}`;
  const cache = getCache(cacheKey, useCache);

  if (cache) {
    return wrapCachedResult(cache);
  }

  const data = await requestApi(`/teams/${teamId}/matches`);
  const list = Array.isArray(data) ? data : Array.isArray(data?.matches) ? data.matches : [];
  const result = {
    matches: normalizeMatches(list).slice(0, limit)
  };

  setCache(cacheKey, result);
  return {
    ...cloneData(result),
    isCached: false
  };
}

async function getTeamSquad(teamId, useCache = true) {
  const cacheKey = `team_${teamId}_squad`;
  const cache = getCache(cacheKey, useCache);

  if (cache) {
    return wrapCachedResult(cache);
  }

  const data = await requestApi(`/teams/${teamId}/squad`);
  const result = {
    goalkeepers: (data.goalkeepers || []).map(normalizePlayer),
    defenders: (data.defenders || []).map(normalizePlayer),
    midfielders: (data.midfielders || []).map(normalizePlayer),
    forwards: (data.attackers || data.forwards || []).map(normalizePlayer),
    all: (data.all || []).map(normalizePlayer),
    totalCount: data.totalCount || data.total || 0
  };

  setCache(cacheKey, result);
  return {
    ...cloneData(result),
    isCached: false
  };
}

async function getTeamStats(teamId, useCache = true) {
  const cacheKey = `team_${teamId}_stats`;
  const cache = getCache(cacheKey, useCache);

  if (cache) {
    return wrapCachedResult(cache);
  }

  const data = await requestApi(`/teams/${teamId}/stats`);
  const result = {
    position: data.position || null,
    points: data.points || 0,
    played: data.played || data.playedGames || 0,
    won: data.won || 0,
    draw: data.draw || 0,
    lost: data.lost || 0,
    goalsFor: data.goalsFor || data.goals || 0,
    goalsAgainst: data.goalsAgainst || 0,
    goalDifference: data.goalDifference || 0,
    winRate: data.winRate || ''
  };

  setCache(cacheKey, result);
  return {
    ...cloneData(result),
    isCached: false
  };
}

async function getPlayerDetail(playerId, useCache = true) {
  const cacheKey = `player_${playerId}`;
  const cache = getCache(cacheKey, useCache);

  if (cache) {
    return wrapCachedResult(cache);
  }

  const data = await requestApi(`/players/${playerId}`);
  const result = normalizePlayer(data);

  setCache(cacheKey, result);
  return {
    ...cloneData(result),
    isCached: false
  };
}

async function getPlayerMatches(playerId, limit = 10, useCache = true) {
  const cacheKey = `player_${playerId}_matches_${limit}`;
  const cache = getCache(cacheKey, useCache);

  if (cache) {
    return wrapCachedResult(cache);
  }

  const data = await requestApi(buildApiPath(`/players/${playerId}/matches`, { limit }));
  const list = Array.isArray(data) ? data : Array.isArray(data?.matches) ? data.matches : [];
  const result = {
    matches: normalizeMatches(list)
  };

  setCache(cacheKey, result);
  return {
    ...cloneData(result),
    isCached: false
  };
}

async function getTopScorers(limit = 20, useCache = true) {
  const cacheKey = `top_scorers_v2_${limit}`;
  const cache = getCache(cacheKey, useCache);

  if (cache) {
    return wrapCachedResult(cache);
  }

  const data = await requestApi(buildApiPath('/players/top-scorers', { limit }));
  const list = Array.isArray(data) ? data : Array.isArray(data?.players) ? data.players : [];
  const result = {
    players: list.map(normalizePlayerStat)
  };

  setCache(cacheKey, result);
  return {
    ...cloneData(result),
    isCached: false
  };
}

async function getTopAssists(limit = 20, useCache = true) {
  const cacheKey = `top_assists_v2_${limit}`;
  const cache = getCache(cacheKey, useCache);

  if (cache) {
    return wrapCachedResult(cache);
  }

  const data = await requestApi(buildApiPath('/players/top-assists', { limit }));
  const list = Array.isArray(data) ? data : Array.isArray(data?.players) ? data.players : [];
  const result = {
    players: list.map(normalizePlayerStat)
  };

  setCache(cacheKey, result);
  return {
    ...cloneData(result),
    isCached: false
  };
}

async function search(keyword) {
  if (!keyword || !keyword.trim()) {
    return { teams: [], players: [] };
  }

  const [teamsData, players] = await Promise.all([
    getTeams(true),
    requestApi(buildApiPath('/players/search', { keyword }))
  ]);

  const normalizedKeyword = keyword.trim().toLowerCase();
  const teams = (teamsData.teams || []).filter((team) => {
    return `${team.name} ${team.shortName}`.toLowerCase().includes(normalizedKeyword);
  });

  return {
    teams,
    players: Array.isArray(players) ? players.map(normalizePlayer) : []
  };
}

module.exports = {
  getStandings,
  getFixtures,
  getTeams,
  getTeamDetail,
  getTeamFixtures,
  getTeamSquad,
  getTeamStats,
  getPlayerDetail,
  getPlayerMatches,
  getTopScorers,
  getTopAssists,
  search,
  ERROR_CODES
};
