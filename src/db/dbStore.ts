import fs from 'fs';
import path from 'path';
import { League, Team, Match, MatchStats, StandingItem, TeamStatsAggregate, MatchProbabilities } from '../types';
import { calculatePoissonProbabilities } from '../lib/poisson';
import { leaguesSeed, teamsSeed, getSeededMatches } from './seedData';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Automatic seed if database files are empty
const leaguesFile = path.join(DATA_DIR, 'leagues.json');
const teamsFile = path.join(DATA_DIR, 'teams.json');
const matchesFile = path.join(DATA_DIR, 'matches.json');
const matchStatsFile = path.join(DATA_DIR, 'match_stats.json');

if (!fs.existsSync(leaguesFile) || fs.readFileSync(leaguesFile, 'utf-8').trim() === '[]' || fs.readFileSync(leaguesFile, 'utf-8').trim() === '') {
  fs.writeFileSync(leaguesFile, JSON.stringify(leaguesSeed, null, 2), 'utf-8');
}

if (!fs.existsSync(teamsFile) || fs.readFileSync(teamsFile, 'utf-8').trim() === '[]' || fs.readFileSync(teamsFile, 'utf-8').trim() === '') {
  fs.writeFileSync(teamsFile, JSON.stringify(teamsSeed, null, 2), 'utf-8');
}

if (!fs.existsSync(matchesFile) || fs.readFileSync(matchesFile, 'utf-8').trim() === '[]' || !fs.existsSync(matchStatsFile) || fs.readFileSync(matchStatsFile, 'utf-8').trim() === '[]') {
  const seeded = getSeededMatches();
  fs.writeFileSync(matchesFile, JSON.stringify(seeded.matches, null, 2), 'utf-8');
  fs.writeFileSync(matchStatsFile, JSON.stringify(seeded.matchStats, null, 2), 'utf-8');
}

function readJsonFile<T>(filename: string, defaultValue: T): T {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
    return defaultValue;
  }
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (e) {
    console.error(`Error reading database file ${filename}:`, e);
    return defaultValue;
  }
}

function writeJsonFile<T>(filename: string, data: T): void {
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error(`Error writing database file ${filename}:`, e);
  }
}

// Low-level database collections
export const db = {
  getLeagues: () => readJsonFile<League[]>('leagues.json', []),
  saveLeagues: (data: League[]) => writeJsonFile('leagues.json', data),

  getTeams: () => readJsonFile<Team[]>('teams.json', []),
  saveTeams: (data: Team[]) => writeJsonFile('teams.json', data),

  getMatches: () => readJsonFile<Match[]>('matches.json', []),
  saveMatches: (data: Match[]) => writeJsonFile('matches.json', data),

  getMatchStats: () => readJsonFile<MatchStats[]>('match_stats.json', []),
  saveMatchStats: (data: MatchStats[]) => writeJsonFile('match_stats.json', data),

  getStandings: () => readJsonFile<Record<string, StandingItem[]>>('standings.json', {}),
  saveStandings: (data: Record<string, StandingItem[]>) => writeJsonFile('standings.json', data),
};

/**
 * Compiles aggregated statistics for a specific team over a season.
 */
export function getTeamSeasonStats(teamId: number, matches: Match[]): TeamStatsAggregate {
  const teamMatches = matches.filter(
    (m) => (m.homeTeamId === teamId || m.awayTeamId === teamId) && m.status === 'FINISHED'
  );

  let homeMatches = 0;
  let awayMatches = 0;
  let goalsScoredHome = 0;
  let goalsConcededHome = 0;
  let goalsScoredAway = 0;
  let goalsConcededAway = 0;

  teamMatches.forEach((m) => {
    if (m.homeTeamId === teamId) {
      homeMatches++;
      goalsScoredHome += m.scoreHome || 0;
      goalsConcededHome += m.scoreAway || 0;
    } else {
      awayMatches++;
      goalsScoredAway += m.scoreAway || 0;
      goalsConcededAway += m.scoreHome || 0;
    }
  });

  const matchesPlayed = homeMatches + awayMatches;

  return {
    teamId,
    teamName: '', // Will be populated by caller
    matchesPlayed,
    homeMatches,
    awayMatches,
    goalsScoredHome,
    goalsConcededHome,
    goalsScoredAway,
    goalsConcededAway,
    avgGoalsScoredHome: homeMatches > 0 ? goalsScoredHome / homeMatches : 0,
    avgGoalsConcededHome: homeMatches > 0 ? goalsConcededHome / homeMatches : 0,
    avgGoalsScoredAway: awayMatches > 0 ? goalsScoredAway / awayMatches : 0,
    avgGoalsConcededAway: awayMatches > 0 ? goalsConcededAway / awayMatches : 0,
  };
}

/**
 * Calculates league averages for goals scored per match (local and away)
 */
export function getLeagueAverages(leagueId: string, matches: Match[]) {
  const leagueFinishedMatches = matches.filter(
    (m) => m.leagueId === leagueId && m.status === 'FINISHED'
  );

  if (leagueFinishedMatches.length === 0) {
    return { avgHomeGoals: 1.4, avgAwayGoals: 1.15 }; // Realistic defaults
  }

  let totalHomeGoals = 0;
  let totalAwayGoals = 0;

  leagueFinishedMatches.forEach((m) => {
    totalHomeGoals += m.scoreHome || 0;
    totalAwayGoals += m.scoreAway || 0;
  });

  return {
    avgHomeGoals: totalHomeGoals / leagueFinishedMatches.length,
    avgAwayGoals: totalAwayGoals / leagueFinishedMatches.length,
  };
}

/**
 * Calculates match probabilities using the Poisson model based on historical matches
 */
export function getMatchProbabilities(matchId: string): MatchProbabilities | null {
  const matches = db.getMatches();
  const match = matches.find((m) => m.id === matchId);
  if (!match) return null;

  // Find historical matches to build statistics (e.g. current season)
  const leagueId = match.leagueId;

  // Let's compute average stats for both teams
  const homeStats = getTeamSeasonStats(match.homeTeamId, matches);
  const awayStats = getTeamSeasonStats(match.awayTeamId, matches);
  const leagueAvg = getLeagueAverages(leagueId, matches);

  // If teams haven't played enough matches yet, default their averages to realistic values
  const homeScoredAvg = homeStats.homeMatches >= 2 ? homeStats.avgGoalsScoredHome : 1.5;
  const homeConcededAvg = homeStats.homeMatches >= 2 ? homeStats.avgGoalsConcededHome : 1.1;
  const awayScoredAvg = awayStats.awayMatches >= 2 ? awayStats.avgGoalsScoredAway : 1.1;
  const awayConcededAvg = awayStats.awayMatches >= 2 ? awayStats.avgGoalsConcededAway : 1.4;

  // Calculate H2H weight
  const h2hMatches = matches.filter(
    (m) =>
      m.status === 'FINISHED' &&
      ((m.homeTeamId === match.homeTeamId && m.awayTeamId === match.awayTeamId) ||
        (m.homeTeamId === match.awayTeamId && m.awayTeamId === match.homeTeamId))
  );

  let h2hHomeGolesSum = 0;
  let h2hAwayGolesSum = 0;
  let h2hFinishedCount = 0;

  h2hMatches.forEach((m) => {
    if (m.homeTeamId === match.homeTeamId) {
      h2hHomeGolesSum += m.scoreHome || 0;
      h2hAwayGolesSum += m.scoreAway || 0;
      h2hFinishedCount++;
    } else {
      h2hHomeGolesSum += m.scoreAway || 0;
      h2hAwayGolesSum += m.scoreHome || 0;
      h2hFinishedCount++;
    }
  });

  const h2hHomeAvg = h2hFinishedCount > 0 ? h2hHomeGolesSum / h2hFinishedCount : undefined;
  const h2hAwayAvg = h2hFinishedCount > 0 ? h2hAwayGolesSum / h2hFinishedCount : undefined;

  return calculatePoissonProbabilities(
    homeScoredAvg,
    homeConcededAvg,
    awayScoredAvg,
    awayConcededAvg,
    leagueAvg.avgHomeGoals,
    leagueAvg.avgAwayGoals,
    matchId,
    h2hFinishedCount > 0 ? 0.25 : 0, // give 25% weight to H2H if matches exist
    h2hHomeAvg,
    h2hAwayAvg
  );
}

/**
 * Computes standings for a league based on finished matches.
 */
export function computeStandings(leagueId: string): StandingItem[] {
  const matches = db.getMatches().filter((m) => m.leagueId === leagueId && m.status === 'FINISHED');
  const teams = db.getTeams().filter((t) => t.leagueId === leagueId);

  const teamRecords: Record<number, StandingItem> = {};

  teams.forEach((t) => {
    teamRecords[t.id] = {
      position: 0,
      teamId: t.id,
      teamName: t.name,
      teamCrest: t.crest,
      playedGames: 0,
      won: 0,
      draw: 0,
      lost: 0,
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
    };
  });

  matches.forEach((m) => {
    const homeId = m.homeTeamId;
    const awayId = m.awayTeamId;

    // Ensure they exist in our records
    if (!teamRecords[homeId]) {
      teamRecords[homeId] = {
        position: 0, teamId: homeId, teamName: m.homeTeamName, teamCrest: m.homeTeamCrest,
        playedGames: 0, won: 0, draw: 0, lost: 0, points: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0
      };
    }
    if (!teamRecords[awayId]) {
      teamRecords[awayId] = {
        position: 0, teamId: awayId, teamName: m.awayTeamName, teamCrest: m.awayTeamCrest,
        playedGames: 0, won: 0, draw: 0, lost: 0, points: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0
      };
    }

    const home = teamRecords[homeId];
    const away = teamRecords[awayId];

    const hGoals = m.scoreHome ?? 0;
    const aGoals = m.scoreAway ?? 0;

    home.playedGames++;
    away.playedGames++;

    home.goalsFor += hGoals;
    home.goalsAgainst += aGoals;
    away.goalsFor += aGoals;
    away.goalsAgainst += hGoals;

    if (hGoals > aGoals) {
      home.won++;
      home.points += 3;
      away.lost++;
    } else if (hGoals === aGoals) {
      home.draw++;
      home.points += 1;
      away.draw++;
      away.points += 1;
    } else {
      away.won++;
      away.points += 3;
      home.lost++;
    }
  });

  const standingsList = Object.values(teamRecords);

  // Compute Goal Difference
  standingsList.forEach((r) => {
    r.goalDifference = r.goalsFor - r.goalsAgainst;
  });

  // Sort: points desc, gd desc, goalsFor desc, teamName asc
  standingsList.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamName.localeCompare(b.teamName);
  });

  // Populate positions
  standingsList.forEach((r, idx) => {
    r.position = idx + 1;
  });

  return standingsList;
}
