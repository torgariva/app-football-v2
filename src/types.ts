export interface League {
  id: string; // e.g., 'PD', 'PL', 'SA', 'BL1', 'FL1'
  name: string;
  code: string;
  emblem: string;
  country: string;
}

export interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  leagueId: string;
}

export interface Match {
  id: string; // UUID or football-data.org ID
  leagueId: string;
  homeTeamId: number;
  homeTeamName: string;
  homeTeamCrest: string;
  awayTeamId: number;
  awayTeamName: string;
  awayTeamCrest: string;
  date: string; // ISO string
  status: 'SCHEDULED' | 'FINISHED' | 'LIVE' | 'POSTPONED';
  scoreHome: number | null;
  scoreAway: number | null;
  halfTimeHome?: number | null;
  halfTimeAway?: number | null;
  matchday: number;
}

export interface MatchStats {
  matchId: string;
  possessionHome: number | null;
  possessionAway: number | null;
  shotsHome: number | null;
  shotsAway: number | null;
  shotsOnTargetHome: number | null;
  shotsOnTargetAway: number | null;
  cornersHome: number | null;
  cornersAway: number | null;
  foulsHome: number | null;
  foulsAway: number | null;
  yellowCardsHome: number | null;
  yellowCardsAway: number | null;
  redCardsHome: number | null;
  redCardsAway: number | null;
}

export interface StandingItem {
  position: number;
  teamId: number;
  teamName: string;
  teamCrest: string;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface LeagueStandings {
  leagueId: string;
  season: number;
  standings: StandingItem[];
}

export interface TeamStatsAggregate {
  teamId: number;
  teamName: string;
  matchesPlayed: number;
  homeMatches: number;
  awayMatches: number;
  goalsScoredHome: number;
  goalsConcededHome: number;
  goalsScoredAway: number;
  goalsConcededAway: number;
  avgGoalsScoredHome: number;
  avgGoalsConcededHome: number;
  avgGoalsScoredAway: number;
  avgGoalsConcededAway: number;
}

export interface ScoreProbability {
  score: string; // e.g. "2-1"
  prob: number; // 0 to 100
}

export interface MatchProbabilities {
  matchId: string;
  probHomeWin: number; // 0 to 100
  probDraw: number;
  probAwayWin: number;
  prob1X: number;
  prob12: number;
  probX2: number;
  probOver1_5: number;
  probUnder1_5: number;
  probOver2_5: number;
  probUnder2_5: number;
  probOver3_5: number;
  probUnder3_5: number;
  probBTTSYes: number;
  probBTTSNo: number;
  expectedHomeGoals: number;
  expectedAwayGoals: number;
  mostProbableScores: ScoreProbability[];
}

export interface MatchDetails {
  match: Match;
  stats: MatchStats | null;
  h2h: Match[];
  recentHome: Match[];
  recentAway: Match[];
  probabilities: MatchProbabilities | null;
}
