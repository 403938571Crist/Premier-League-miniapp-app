const { ERROR_CODES, ERROR_MESSAGES } = require('./constants');

const DEFAULT_API_BASE_URL = 'http://localhost:8080/api';

function getApiBaseUrl() {
  const app = getApp();
  return app?.globalData?.backendApiBaseUrl
    || app?.globalData?.apiBaseUrl
    || DEFAULT_API_BASE_URL;
}

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
  const { method = 'GET', data } = options;

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${getApiBaseUrl()}${path}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json'
      },
      timeout: 10000,
      success: (res) => {
        const response = res.data || {};

        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }

        if (response.code !== 0) {
          reject(new Error(response.message || ERROR_MESSAGES.SERVER_ERROR));
          return;
        }

        resolve(response.data);
      },
      fail: (err) => {
        console.error('Backend request failed:', err);
        reject(new Error(ERROR_MESSAGES.NETWORK_ERROR || 'Network error'));
      }
    });
  });
}

function normalizeStatus(status) {
  if (status === 'CANCELLED') {
    return 'CANCELED';
  }
  return status || 'SCHEDULED';
}

function normalizeTeamId(team) {
  return team?.apiId || team?.id || null;
}

function normalizeTeamName(team) {
  return team?.chineseName || team?.shortName || team?.name || '';
}

function normalizeTeamDetail(team = {}) {
  return {
    id: normalizeTeamId(team),
    dbId: team.id || null,
    apiId: team.apiId || team.id || null,
    name: normalizeTeamName(team),
    shortName: team.shortName || team.name || '',
    crest: team.crestUrl || '/images/default/team.png',
    venue: team.venue || '',
    founded: team.founded || null,
    address: team.address || '',
    website: team.website || '',
    clubColors: team.clubColors || '',
    position: team.position || null,
    playedGames: team.playedGames || 0,
    won: team.won || 0,
    draw: team.draw || 0,
    lost: team.lost || 0,
    points: team.points || 0,
    goalsFor: team.goalsFor || 0,
    goalsAgainst: team.goalsAgainst || 0,
    goalDifference: team.goalDifference || 0,
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
  return {
    id: match.apiId || match.id,
    dbId: match.id || null,
    apiId: match.apiId || match.id,
    season: match.season || '',
    matchday: match.matchday || null,
    utcDate: match.matchDate,
    status: normalizeStatus(match.status),
    minute: match.duration || '',
    venue: match.venue || '',
    stage: match.stage || '',
    referee: match.referee || '',
    competition: {
      name: 'Premier League'
    },
    homeTeam: {
      id: match.homeTeamId || null,
      name: match.homeTeamChineseName || match.homeTeamName || '',
      crest: match.homeTeamCrest || '/images/default/team.png'
    },
    awayTeam: {
      id: match.awayTeamId || null,
      name: match.awayTeamChineseName || match.awayTeamName || '',
      crest: match.awayTeamCrest || '/images/default/team.png'
    },
    score: {
      fullTime: {
        home: normalizeScoreValue(match.homeScore),
        away: normalizeScoreValue(match.awayScore)
      },
      halfTime: {
        home: normalizeScoreValue(match.homeHalfScore),
        away: normalizeScoreValue(match.awayHalfScore)
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
    photo: player.photoUrl || '/images/default/player.png',
    photoUrl: player.photoUrl || '',
    shirtNumber: player.shirtNumber || '',
    position: player.position || '',
    chinesePosition: player.chinesePosition || '',
    nationality: player.nationality || '',
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

async function getStandings(type = 'TOTAL', useCache = true) {
  const cacheKey = type === 'TOTAL' ? 'standings' : `standings:${type}`;
  const cache = getCache(cacheKey, useCache);

  if (cache) {
    return wrapCachedResult(cache);
  }

  const data = await requestApi(buildApiPath('/teams/standings', { type }));
  const result = {
    standings: [
      {
        type,
        table: Array.isArray(data) ? data.map(normalizeStandingRow) : []
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
  const result = {
    matches: normalizeMatches(Array.isArray(data) ? data : [])
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
  const result = {
    teams: Array.isArray(data) ? data.map(normalizeTeamDetail) : []
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
  const result = {
    matches: normalizeMatches(Array.isArray(data) ? data : []).slice(0, limit)
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
    totalCount: data.totalCount || 0
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
    played: data.played || 0,
    won: data.won || 0,
    draw: data.draw || 0,
    lost: data.lost || 0,
    goalsFor: data.goalsFor || 0,
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
  const result = {
    matches: normalizeMatches(Array.isArray(data) ? data : [])
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
  search,
  ERROR_CODES
};
