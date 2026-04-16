const teams = [
  { id: 57, name: 'Arsenal FC', shortName: 'Arsenal', crest: '' },
  { id: 64, name: 'Liverpool FC', shortName: 'Liverpool', crest: '' },
  { id: 65, name: 'Manchester City FC', shortName: 'Man City', crest: '' },
  { id: 66, name: 'Manchester United FC', shortName: 'Man Utd', crest: '' },
  { id: 61, name: 'Chelsea FC', shortName: 'Chelsea', crest: '' },
  { id: 73, name: 'Tottenham Hotspur FC', shortName: 'Tottenham', crest: '' }
];

const standingsTable = [
  { position: 1, team: teams[0], playedGames: 32, won: 23, draw: 5, lost: 4, goalsFor: 68, goalsAgainst: 29, goalDifference: 39, points: 74 },
  { position: 2, team: teams[2], playedGames: 32, won: 22, draw: 6, lost: 4, goalsFor: 72, goalsAgainst: 31, goalDifference: 41, points: 72 },
  { position: 3, team: teams[1], playedGames: 32, won: 21, draw: 7, lost: 4, goalsFor: 70, goalsAgainst: 33, goalDifference: 37, points: 70 },
  { position: 4, team: teams[5], playedGames: 32, won: 18, draw: 7, lost: 7, goalsFor: 60, goalsAgainst: 39, goalDifference: 21, points: 61 },
  { position: 5, team: teams[4], playedGames: 32, won: 16, draw: 8, lost: 8, goalsFor: 54, goalsAgainst: 38, goalDifference: 16, points: 56 },
  { position: 6, team: teams[3], playedGames: 32, won: 15, draw: 7, lost: 10, goalsFor: 52, goalsAgainst: 41, goalDifference: 11, points: 52 }
];

const matches = [
  {
    id: 1001,
    utcDate: '2026-04-11T11:30:00Z',
    status: 'FINISHED',
    matchday: 32,
    competition: { name: 'Premier League' },
    homeTeam: teams[0],
    awayTeam: teams[5],
    score: { fullTime: { home: 3, away: 1 } }
  },
  {
    id: 1002,
    utcDate: '2026-04-11T14:00:00Z',
    status: 'IN_PLAY',
    minute: '78',
    matchday: 32,
    competition: { name: 'Premier League' },
    homeTeam: teams[1],
    awayTeam: teams[2],
    score: { fullTime: { home: 1, away: 1 } }
  },
  {
    id: 1003,
    utcDate: '2026-04-11T17:30:00Z',
    status: 'SCHEDULED',
    matchday: 32,
    competition: { name: 'Premier League' },
    homeTeam: teams[4],
    awayTeam: teams[3],
    score: { fullTime: { home: 0, away: 0 } }
  }
];

const squadByTeamId = {
  57: [
    { id: 2001, name: 'David Raya', position: 'Goalkeeper', nationality: 'Spain', shirtNumber: 22, currentTeam: teams[0] },
    { id: 2002, name: 'William Saliba', position: 'Defender', nationality: 'France', shirtNumber: 2, currentTeam: teams[0] },
    { id: 2003, name: 'Declan Rice', position: 'Midfielder', nationality: 'England', shirtNumber: 41, currentTeam: teams[0] },
    { id: 2004, name: 'Bukayo Saka', position: 'Forward', nationality: 'England', shirtNumber: 7, currentTeam: teams[0] }
  ],
  64: [
    { id: 2101, name: 'Alisson Becker', position: 'Goalkeeper', nationality: 'Brazil', shirtNumber: 1, currentTeam: teams[1] },
    { id: 2102, name: 'Virgil van Dijk', position: 'Defender', nationality: 'Netherlands', shirtNumber: 4, currentTeam: teams[1] },
    { id: 2103, name: 'Alexis Mac Allister', position: 'Midfielder', nationality: 'Argentina', shirtNumber: 10, currentTeam: teams[1] },
    { id: 2104, name: 'Mohamed Salah', position: 'Forward', nationality: 'Egypt', shirtNumber: 11, currentTeam: teams[1] }
  ],
  65: [
    { id: 2201, name: 'Ederson', position: 'Goalkeeper', nationality: 'Brazil', shirtNumber: 31, currentTeam: teams[2] },
    { id: 2202, name: 'Ruben Dias', position: 'Defender', nationality: 'Portugal', shirtNumber: 3, currentTeam: teams[2] },
    { id: 2203, name: 'Rodri', position: 'Midfielder', nationality: 'Spain', shirtNumber: 16, currentTeam: teams[2] },
    { id: 2204, name: 'Erling Haaland', position: 'Forward', nationality: 'Norway', shirtNumber: 9, currentTeam: teams[2] }
  ],
  66: [
    { id: 2301, name: 'Andre Onana', position: 'Goalkeeper', nationality: 'Cameroon', shirtNumber: 24, currentTeam: teams[3] },
    { id: 2302, name: 'Lisandro Martinez', position: 'Defender', nationality: 'Argentina', shirtNumber: 6, currentTeam: teams[3] },
    { id: 2303, name: 'Bruno Fernandes', position: 'Midfielder', nationality: 'Portugal', shirtNumber: 8, currentTeam: teams[3] },
    { id: 2304, name: 'Rasmus Hojlund', position: 'Forward', nationality: 'Denmark', shirtNumber: 11, currentTeam: teams[3] }
  ],
  61: [
    { id: 2401, name: 'Robert Sanchez', position: 'Goalkeeper', nationality: 'Spain', shirtNumber: 1, currentTeam: teams[4] },
    { id: 2402, name: 'Levi Colwill', position: 'Defender', nationality: 'England', shirtNumber: 26, currentTeam: teams[4] },
    { id: 2403, name: 'Enzo Fernandez', position: 'Midfielder', nationality: 'Argentina', shirtNumber: 8, currentTeam: teams[4] },
    { id: 2404, name: 'Cole Palmer', position: 'Forward', nationality: 'England', shirtNumber: 20, currentTeam: teams[4] }
  ],
  73: [
    { id: 2501, name: 'Guglielmo Vicario', position: 'Goalkeeper', nationality: 'Italy', shirtNumber: 13, currentTeam: teams[5] },
    { id: 2502, name: 'Cristian Romero', position: 'Defender', nationality: 'Argentina', shirtNumber: 17, currentTeam: teams[5] },
    { id: 2503, name: 'James Maddison', position: 'Midfielder', nationality: 'England', shirtNumber: 10, currentTeam: teams[5] },
    { id: 2504, name: 'Son Heung-min', position: 'Forward', nationality: 'South Korea', shirtNumber: 7, currentTeam: teams[5] }
  ]
};

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function getMockStandingsData() {
  return clone({
    competition: { code: 'PL', name: 'Premier League' },
    season: { startDate: '2025-08-01', endDate: '2026-05-31', currentMatchday: 32 },
    standings: [
      { type: 'TOTAL', table: standingsTable },
      { type: 'HOME', table: standingsTable },
      { type: 'AWAY', table: standingsTable }
    ]
  });
}

function getMockFixturesData(params = {}) {
  let filteredMatches = matches;

  if (params.dateFrom && params.dateTo) {
    filteredMatches = matches.filter((match) => {
      const matchDate = match.utcDate.slice(0, 10);
      return matchDate >= params.dateFrom && matchDate <= params.dateTo;
    });
  }

  return clone({
    competition: { code: 'PL', name: 'Premier League' },
    matches: filteredMatches
  });
}

function getMockTeamsData() {
  return clone({ teams });
}

function getMockTeamDetail(teamId) {
  const id = Number(teamId);
  const team = teams.find((item) => item.id === id) || teams[0];
  return clone({
    id: team.id,
    name: team.name,
    shortName: team.shortName,
    crest: team.crest,
    venue: `${team.shortName} 主场`,
    founded: 1886,
    address: `${team.shortName} Football Centre`,
    website: 'https://www.premierleague.com/',
    squad: squadByTeamId[id] || []
  });
}

function getMockTeamFixtures(teamId, limit = 10) {
  const id = Number(teamId);
  const filteredMatches = matches.filter(
    (match) => match.homeTeam.id === id || match.awayTeam.id === id
  );
  return clone({ matches: filteredMatches.slice(0, limit) });
}

function getMockPlayerDetail(playerId) {
  const allPlayers = Object.values(squadByTeamId).flat();
  const player = allPlayers.find((item) => item.id === Number(playerId)) || allPlayers[0];
  return clone({
    id: player.id,
    name: player.name,
    position: player.position,
    nationality: player.nationality,
    dateOfBirth: '1998-01-01',
    height: 180,
    shirtNumber: player.shirtNumber,
    currentTeam: player.currentTeam
  });
}

module.exports = {
  getMockStandingsData,
  getMockFixturesData,
  getMockTeamsData,
  getMockTeamDetail,
  getMockTeamFixtures,
  getMockPlayerDetail
};
