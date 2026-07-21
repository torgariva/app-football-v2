import { League, Team, Match, MatchStats } from '../types';

export const leaguesSeed: League[] = [
  { id: 'PD', name: 'LaLiga', code: 'PD', emblem: 'https://crests.football-data.org/PD.png', country: 'Spain' },
  { id: 'PL', name: 'Premier League', code: 'PL', emblem: 'https://crests.football-data.org/PL.png', country: 'England' },
  { id: 'SA', name: 'Serie A', code: 'SA', emblem: 'https://crests.football-data.org/SA.png', country: 'Italy' },
  { id: 'BL1', name: 'Bundesliga', code: 'BL1', emblem: 'https://crests.football-data.org/BL1.png', country: 'Germany' },
  { id: 'FL1', name: 'Ligue 1', code: 'FL1', emblem: 'https://crests.football-data.org/FL1.png', country: 'France' }
];

export const teamsSeed: Team[] = [
  // LaLiga (PD)
  { id: 86, name: 'Real Madrid CF', shortName: 'Real Madrid', tla: 'RMA', crest: 'https://crests.football-data.org/86.png', leagueId: 'PD' },
  { id: 81, name: 'FC Barcelona', shortName: 'Barcelona', tla: 'FCB', crest: 'https://crests.football-data.org/81.png', leagueId: 'PD' },
  { id: 78, name: 'Club Atlético de Madrid', shortName: 'Atleti', tla: 'ATM', crest: 'https://crests.football-data.org/78.png', leagueId: 'PD' },
  { id: 92, name: 'Real Sociedad de Fútbol', shortName: 'Real Sociedad', tla: 'RSO', crest: 'https://crests.football-data.org/92.png', leagueId: 'PD' },
  { id: 90, name: 'Real Betis Balompié', shortName: 'Real Betis', tla: 'BET', crest: 'https://crests.football-data.org/90.png', leagueId: 'PD' },
  { id: 77, name: 'Athletic Club', shortName: 'Athletic', tla: 'ATH', crest: 'https://crests.football-data.org/77.png', leagueId: 'PD' },
  { id: 94, name: 'Villarreal CF', shortName: 'Villarreal', tla: 'VIL', crest: 'https://crests.football-data.org/94.png', leagueId: 'PD' },
  { id: 559, name: 'Sevilla FC', shortName: 'Sevilla', tla: 'SEV', crest: 'https://crests.football-data.org/559.png', leagueId: 'PD' },

  // Premier League (PL)
  { id: 65, name: 'Manchester City FC', shortName: 'Man City', tla: 'MCI', crest: 'https://crests.football-data.org/65.png', leagueId: 'PL' },
  { id: 57, name: 'Arsenal FC', shortName: 'Arsenal', tla: 'ARS', crest: 'https://crests.football-data.org/57.png', leagueId: 'PL' },
  { id: 64, name: 'Liverpool FC', shortName: 'Liverpool', tla: 'LIV', crest: 'https://crests.football-data.org/64.png', leagueId: 'PL' },
  { id: 58, name: 'Aston Villa FC', shortName: 'Aston Villa', tla: 'AVL', crest: 'https://crests.football-data.org/58.png', leagueId: 'PL' },
  { id: 73, name: 'Tottenham Hotspur FC', shortName: 'Tottenham', tla: 'TOT', crest: 'https://crests.football-data.org/73.png', leagueId: 'PL' },
  { id: 66, name: 'Manchester United FC', shortName: 'Man United', tla: 'MUN', crest: 'https://crests.football-data.org/66.png', leagueId: 'PL' },
  { id: 61, name: 'Chelsea FC', shortName: 'Chelsea', tla: 'CHE', crest: 'https://crests.football-data.org/61.png', leagueId: 'PL' },
  { id: 67, name: 'Newcastle United FC', shortName: 'Newcastle', tla: 'NEW', crest: 'https://crests.football-data.org/67.png', leagueId: 'PL' },

  // Serie A (SA)
  { id: 108, name: 'FC Internazionale Milano', shortName: 'Inter', tla: 'INT', crest: 'https://crests.football-data.org/108.png', leagueId: 'SA' },
  { id: 98, name: 'AC Milan', shortName: 'Milan', tla: 'MIL', crest: 'https://crests.football-data.org/98.png', leagueId: 'SA' },
  { id: 109, name: 'Juventus FC', shortName: 'Juventus', tla: 'JUV', crest: 'https://crests.football-data.org/109.png', leagueId: 'SA' },
  { id: 100, name: 'AS Roma', shortName: 'Roma', tla: 'ROM', crest: 'https://crests.football-data.org/100.png', leagueId: 'SA' },
  { id: 110, name: 'SS Lazio', shortName: 'Lazio', tla: 'LAZ', crest: 'https://crests.football-data.org/110.png', leagueId: 'SA' },
  { id: 102, name: 'Atalanta BC', shortName: 'Atalanta', tla: 'ATA', crest: 'https://crests.football-data.org/102.png', leagueId: 'SA' },
  { id: 113, name: 'SSC Napoli', shortName: 'Napoli', tla: 'NAP', crest: 'https://crests.football-data.org/113.png', leagueId: 'SA' },
  { id: 99, name: 'ACF Fiorentina', shortName: 'Fiorentina', tla: 'FIO', crest: 'https://crests.football-data.org/99.png', leagueId: 'SA' },

  // Bundesliga (BL1)
  { id: 5, name: 'FC Bayern München', shortName: 'Bayern', tla: 'FCB', crest: 'https://crests.football-data.org/5.png', leagueId: 'BL1' },
  { id: 4, name: 'Borussia Dortmund', shortName: 'Dortmund', tla: 'BVB', crest: 'https://crests.football-data.org/4.png', leagueId: 'BL1' },
  { id: 3, name: 'Bayer 04 Leverkusen', shortName: 'Leverkusen', tla: 'B04', crest: 'https://crests.football-data.org/3.png', leagueId: 'BL1' },
  { id: 507, name: 'RB Leipzig', shortName: 'RB Leipzig', tla: 'RBL', crest: 'https://crests.football-data.org/507.png', leagueId: 'BL1' },
  { id: 19, name: 'Eintracht Frankfurt', shortName: 'Frankfurt', tla: 'SGE', crest: 'https://crests.football-data.org/19.png', leagueId: 'BL1' },
  { id: 10, name: 'VfB Stuttgart', shortName: 'Stuttgart', tla: 'VFB', crest: 'https://crests.football-data.org/10.png', leagueId: 'BL1' },
  { id: 18, name: 'Borussia Mönchengladbach', shortName: 'Gladbach', tla: 'BMG', crest: 'https://crests.football-data.org/18.png', leagueId: 'BL1' },
  { id: 11, name: 'VfL Wolfsburg', shortName: 'Wolfsburg', tla: 'WOB', crest: 'https://crests.football-data.org/11.png', leagueId: 'BL1' },

  // Ligue 1 (FL1)
  { id: 524, name: 'Paris Saint-Germain FC', shortName: 'PSG', tla: 'PSG', crest: 'https://crests.football-data.org/524.png', leagueId: 'FL1' },
  { id: 516, name: 'Olympique de Marseille', shortName: 'Marseille', tla: 'OM', crest: 'https://crests.football-data.org/516.png', leagueId: 'FL1' },
  { id: 548, name: 'AS Monaco FC', shortName: 'Monaco', tla: 'ASM', crest: 'https://crests.football-data.org/548.png', leagueId: 'FL1' },
  { id: 523, name: 'Olympique Lyonnais', shortName: 'Lyon', tla: 'OL', crest: 'https://crests.football-data.org/523.png', leagueId: 'FL1' },
  { id: 521, name: 'LOSC Lille', shortName: 'Lille', tla: 'LOSC', crest: 'https://crests.football-data.org/521.png', leagueId: 'FL1' },
  { id: 546, name: 'RC Lens', shortName: 'Lens', tla: 'RCL', crest: 'https://crests.football-data.org/546.png', leagueId: 'FL1' },
  { id: 522, name: 'OGC Nice', shortName: 'Nice', tla: 'OGC', crest: 'https://crests.football-data.org/522.png', leagueId: 'FL1' },
  { id: 529, name: 'Stade Rennais FC 1901', shortName: 'Rennes', tla: 'SRFC', crest: 'https://crests.football-data.org/529.png', leagueId: 'FL1' }
];

export function getSeededMatches(): { matches: Match[]; matchStats: MatchStats[] } {
  const matches: Match[] = [];
  const matchStats: MatchStats[] = [];

  const addFinishedMatch = (
    id: string,
    leagueId: string,
    home: Team,
    away: Team,
    scoreH: number,
    scoreA: number,
    date: string,
    matchday: number,
    posH: number,
    shotsH: number,
    shotsA: number,
    sotH: number,
    sotA: number,
    cornH: number,
    cornA: number
  ) => {
    matches.push({
      id,
      leagueId,
      homeTeamId: home.id,
      homeTeamName: home.name,
      homeTeamCrest: home.crest,
      awayTeamId: away.id,
      awayTeamName: away.name,
      awayTeamCrest: away.crest,
      date,
      status: 'FINISHED',
      scoreHome: scoreH,
      scoreAway: scoreA,
      matchday
    });

    matchStats.push({
      matchId: id,
      possessionHome: posH,
      possessionAway: 100 - posH,
      shotsHome: shotsH,
      shotsAway: shotsA,
      shotsOnTargetHome: sotH,
      shotsOnTargetAway: sotA,
      cornersHome: cornH,
      cornersAway: cornA,
      foulsHome: Math.floor(Math.random() * 8) + 6,
      foulsAway: Math.floor(Math.random() * 8) + 6,
      yellowCardsHome: Math.floor(Math.random() * 3),
      yellowCardsAway: Math.floor(Math.random() * 3),
      redCardsHome: Math.random() > 0.92 ? 1 : 0,
      redCardsAway: Math.random() > 0.92 ? 1 : 0,
    });
  };

  const addScheduledMatch = (
    id: string,
    leagueId: string,
    home: Team,
    away: Team,
    date: string,
    matchday: number
  ) => {
    matches.push({
      id,
      leagueId,
      homeTeamId: home.id,
      homeTeamName: home.name,
      homeTeamCrest: home.crest,
      awayTeamId: away.id,
      awayTeamName: away.name,
      awayTeamCrest: away.crest,
      date,
      status: 'SCHEDULED',
      scoreHome: null,
      scoreAway: null,
      matchday
    });
  };

  // ----------------------------------------------------
  // Seed Matches for LaLiga (PD)
  // Teams: 86:Real Madrid, 81:Barcelona, 78:Atleti, 92:Real Sociedad, 90:Betis, 77:Athletic, 94:Villarreal, 559:Sevilla
  const tPD = teamsSeed.filter(t => t.leagueId === 'PD');
  const [rma, fcb, atm, rso, bet, ath, vil, sev] = tPD;

  addFinishedMatch('pd-1', 'PD', rma, fcb, 3, 2, '2026-03-01T20:00:00Z', 1, 52, 16, 12, 7, 5, 6, 4);
  addFinishedMatch('pd-2', 'PD', atm, rso, 1, 0, '2026-03-02T19:00:00Z', 1, 48, 11, 8, 4, 2, 5, 3);
  addFinishedMatch('pd-3', 'PD', bet, ath, 2, 2, '2026-03-05T18:00:00Z', 2, 55, 14, 15, 5, 6, 7, 6);
  addFinishedMatch('pd-4', 'PD', vil, sev, 3, 1, '2026-03-06T20:45:00Z', 2, 50, 18, 10, 8, 3, 8, 4);
  addFinishedMatch('pd-5', 'PD', fcb, atm, 2, 1, '2026-03-10T20:00:00Z', 3, 62, 19, 9, 8, 4, 9, 3);
  addFinishedMatch('pd-6', 'PD', rso, rma, 1, 2, '2026-03-12T19:00:00Z', 3, 44, 10, 15, 3, 6, 4, 5);
  addFinishedMatch('pd-7', 'PD', ath, vil, 1, 0, '2026-03-15T18:00:00Z', 4, 49, 13, 11, 5, 3, 6, 5);
  addFinishedMatch('pd-8', 'PD', sev, bet, 0, 2, '2026-03-16T20:00:00Z', 4, 51, 9, 14, 2, 6, 3, 6);
  addFinishedMatch('pd-9', 'PD', rma, atm, 2, 0, '2026-03-22T20:00:00Z', 5, 58, 15, 8, 6, 2, 7, 2);
  addFinishedMatch('pd-10', 'PD', fcb, vil, 4, 1, '2026-03-23T19:00:00Z', 5, 65, 22, 11, 10, 4, 11, 4);
  addFinishedMatch('pd-11', 'PD', rso, sev, 2, 0, '2026-03-24T18:30:00Z', 5, 53, 12, 7, 5, 2, 6, 3);
  addFinishedMatch('pd-12', 'PD', bet, ath, 1, 0, '2026-03-25T20:00:00Z', 5, 50, 11, 12, 4, 4, 5, 5);
  addFinishedMatch('pd-13', 'PD', ath, rma, 1, 3, '2026-04-01T19:00:00Z', 6, 42, 12, 17, 4, 8, 5, 6);
  addFinishedMatch('pd-14', 'PD', atm, fcb, 1, 1, '2026-04-02T20:00:00Z', 6, 45, 14, 13, 5, 5, 6, 5);

  // Scheduled matches (future matches for calendar)
  addScheduledMatch('pd-fut-1', 'PD', rma, bet, '2026-07-25T19:00:00Z', 7);
  addScheduledMatch('pd-fut-2', 'PD', fcb, rso, '2026-07-25T21:00:00Z', 7);
  addScheduledMatch('pd-fut-3', 'PD', atm, vil, '2026-07-26T17:00:00Z', 7);
  addScheduledMatch('pd-fut-4', 'PD', ath, sev, '2026-07-26T19:00:00Z', 7);
  addScheduledMatch('pd-fut-5', 'PD', fcb, rma, '2026-08-01T20:00:00Z', 8);
  addScheduledMatch('pd-fut-6', 'PD', atm, bet, '2026-08-02T19:00:00Z', 8);

  // ----------------------------------------------------
  // Seed Matches for Premier League (PL)
  // Teams: 65:Man City, 57:Arsenal, 64:Liverpool, 58:Aston Villa, 73:Tottenham, 66:Man United, 61:Chelsea, 67:Newcastle
  const tPL = teamsSeed.filter(t => t.leagueId === 'PL');
  const [mci, ars, liv, avl, tot, mun, che, newc] = tPL;

  addFinishedMatch('pl-1', 'PL', mci, ars, 2, 2, '2026-03-01T16:30:00Z', 1, 64, 21, 8, 9, 3, 11, 2);
  addFinishedMatch('pl-2', 'PL', liv, avl, 3, 0, '2026-03-02T15:00:00Z', 1, 58, 17, 10, 7, 3, 8, 4);
  addFinishedMatch('pl-3', 'PL', tot, mun, 1, 2, '2026-03-05T19:45:00Z', 2, 53, 14, 12, 4, 5, 6, 5);
  addFinishedMatch('pl-4', 'PL', che, newc, 2, 1, '2026-03-06T15:00:00Z', 2, 49, 15, 13, 6, 4, 7, 5);
  addFinishedMatch('pl-5', 'PL', ars, liv, 1, 1, '2026-03-10T19:45:00Z', 3, 46, 11, 14, 4, 5, 5, 6);
  addFinishedMatch('pl-6', 'PL', mun, mci, 1, 3, '2026-03-12T17:30:00Z', 3, 38, 9, 22, 3, 9, 3, 10);
  addFinishedMatch('pl-7', 'PL', avl, che, 2, 2, '2026-03-15T15:00:00Z', 4, 51, 12, 15, 5, 6, 5, 7);
  addFinishedMatch('pl-8', 'PL', newc, tot, 3, 2, '2026-03-16T15:00:00Z', 4, 45, 16, 14, 7, 5, 6, 6);
  addFinishedMatch('pl-9', 'PL', mci, liv, 1, 1, '2026-03-22T16:00:00Z', 5, 60, 18, 12, 6, 4, 8, 4);
  addFinishedMatch('pl-10', 'PL', ars, che, 3, 1, '2026-03-23T19:45:00Z', 5, 55, 16, 9, 7, 3, 7, 4);
  addFinishedMatch('pl-11', 'PL', tot, avl, 2, 1, '2026-03-24T15:00:00Z', 5, 52, 14, 11, 6, 4, 5, 4);
  addFinishedMatch('pl-12', 'PL', mun, newc, 2, 0, '2026-03-25T15:00:00Z', 5, 48, 13, 10, 5, 3, 6, 4);

  // Future matches
  addScheduledMatch('pl-fut-1', 'PL', mci, tot, '2026-07-25T14:00:00Z', 6);
  addScheduledMatch('pl-fut-2', 'PL', ars, avl, '2026-07-25T16:30:00Z', 6);
  addScheduledMatch('pl-fut-3', 'PL', liv, che, '2026-07-26T15:00:00Z', 6);
  addScheduledMatch('pl-fut-4', 'PL', mun, avl, '2026-07-26T17:30:00Z', 6);
  addScheduledMatch('pl-fut-5', 'PL', liv, mci, '2026-08-01T16:30:00Z', 7);
  addScheduledMatch('pl-fut-6', 'PL', ars, tot, '2026-08-02T15:00:00Z', 7);

  // ----------------------------------------------------
  // Seed Matches for Serie A (SA)
  // Teams: 108:Inter, 98:Milan, 109:Juventus, 100:Roma, 110:Lazio, 102:Atalanta, 113:Napoli, 99:Fiorentina
  const tSA = teamsSeed.filter(t => t.leagueId === 'SA');
  const [int, mil, juv, rom, laz, ata, nap, fio] = tSA;

  addFinishedMatch('sa-1', 'SA', int, mil, 2, 1, '2026-03-01T19:45:00Z', 1, 54, 15, 11, 6, 4, 6, 4);
  addFinishedMatch('sa-2', 'SA', juv, rom, 1, 0, '2026-03-02T19:45:00Z', 1, 47, 10, 9, 4, 2, 5, 3);
  addFinishedMatch('sa-3', 'SA', laz, ata, 2, 3, '2026-03-05T19:45:00Z', 2, 50, 13, 16, 5, 7, 5, 6);
  addFinishedMatch('sa-4', 'SA', nap, fio, 2, 0, '2026-03-06T19:45:00Z', 2, 56, 14, 8, 6, 3, 6, 3);
  addFinishedMatch('sa-5', 'SA', mil, juv, 1, 1, '2026-03-10T19:45:00Z', 3, 52, 12, 11, 4, 4, 5, 4);
  addFinishedMatch('sa-6', 'SA', ata, int, 1, 2, '2026-03-12T19:45:00Z', 3, 46, 14, 15, 5, 6, 7, 5);
  addFinishedMatch('sa-7', 'SA', rom, nap, 1, 1, '2026-03-15T19:45:00Z', 4, 49, 11, 13, 4, 5, 4, 6);
  addFinishedMatch('sa-8', 'SA', fio, laz, 2, 1, '2026-03-16T19:45:00Z', 4, 52, 13, 11, 5, 4, 6, 5);
  addFinishedMatch('sa-9', 'SA', int, juv, 1, 0, '2026-03-22T19:45:00Z', 5, 51, 14, 8, 5, 2, 7, 3);
  addFinishedMatch('sa-10', 'SA', mil, nap, 2, 2, '2026-03-23T19:45:00Z', 5, 50, 13, 12, 5, 5, 6, 5);

  // Future matches
  addScheduledMatch('sa-fut-1', 'SA', int, rom, '2026-07-25T19:45:00Z', 6);
  addScheduledMatch('sa-fut-2', 'SA', juv, laz, '2026-07-26T17:00:00Z', 6);
  addScheduledMatch('sa-fut-3', 'SA', mil, ata, '2026-07-26T19:45:00Z', 6);
  addScheduledMatch('sa-fut-4', 'SA', nap, fio, '2026-08-01T19:45:00Z', 7);

  // ----------------------------------------------------
  // Seed Matches for Bundesliga (BL1)
  // Teams: 5:Bayern, 4:Dortmund, 3:Leverkusen, 507:Leipzig, 19:Frankfurt, 10:Stuttgart, 18:Gladbach, 11:Wolfsburg
  const tBL = teamsSeed.filter(t => t.leagueId === 'BL1');
  const [bay, bvb, lev, rbl, sge, vfb, bmg, wob] = tBL;

  addFinishedMatch('bl-1', 'BL1', bay, bvb, 4, 1, '2026-03-01T17:30:00Z', 1, 61, 23, 10, 11, 4, 9, 4);
  addFinishedMatch('bl-2', 'BL1', lev, rbl, 2, 1, '2026-03-02T14:30:00Z', 1, 55, 16, 12, 7, 5, 6, 5);
  addFinishedMatch('bl-3', 'BL1', sge, vfb, 2, 2, '2026-03-05T14:30:00Z', 2, 48, 13, 15, 5, 6, 5, 6);
  addFinishedMatch('bl-4', 'BL1', wob, bmg, 1, 1, '2026-03-06T19:30:00Z', 2, 50, 11, 12, 4, 4, 4, 5);
  addFinishedMatch('bl-5', 'BL1', bvb, lev, 2, 3, '2026-03-10T17:30:00Z', 3, 51, 14, 18, 6, 8, 5, 7);
  addFinishedMatch('bl-6', 'BL1', rbl, bay, 1, 2, '2026-03-12T14:30:00Z', 3, 44, 12, 19, 4, 8, 4, 7);
  addFinishedMatch('bl-7', 'BL1', vfb, wob, 3, 1, '2026-03-15T14:30:00Z', 4, 56, 17, 9, 8, 3, 7, 3);
  addFinishedMatch('bl-8', 'BL1', bmg, sge, 0, 2, '2026-03-16T14:30:00Z', 4, 49, 10, 14, 3, 6, 4, 6);
  addFinishedMatch('bl-9', 'BL1', bay, lev, 2, 2, '2026-03-22T16:30:00Z', 5, 58, 20, 14, 9, 6, 8, 5);
  addFinishedMatch('bl-10', 'BL1', bvb, rbl, 1, 1, '2026-03-23T14:30:00Z', 5, 52, 13, 13, 5, 5, 6, 5);

  // Future matches
  addScheduledMatch('bl-fut-1', 'BL1', bay, lev, '2026-07-25T14:30:00Z', 6);
  addScheduledMatch('bl-fut-2', 'BL1', bvb, sge, '2026-07-25T17:30:00Z', 6);
  addScheduledMatch('bl-fut-3', 'BL1', rbl, vfb, '2026-07-26T14:30:00Z', 6);
  addScheduledMatch('bl-fut-4', 'BL1', lev, wob, '2026-08-01T14:30:00Z', 7);

  // ----------------------------------------------------
  // Seed Matches for Ligue 1 (FL1)
  // Teams: 524:PSG, 516:Marseille, 548:Monaco, 523:Lyon, 521:Lille, 546:Lens, 522:Nice, 529:Rennes
  const tFL = teamsSeed.filter(t => t.leagueId === 'FL1');
  const [psg, om, asm, ol, losc, rcl, ogc, srfc] = tFL;

  addFinishedMatch('fl-1', 'FL1', psg, om, 2, 0, '2026-03-01T20:00:00Z', 1, 63, 18, 8, 8, 2, 8, 3);
  addFinishedMatch('fl-2', 'FL1', asm, ol, 3, 2, '2026-03-02T19:00:00Z', 1, 53, 15, 13, 6, 5, 6, 5);
  addFinishedMatch('fl-3', 'FL1', losc, rcl, 1, 1, '2026-03-05T20:00:00Z', 2, 51, 12, 11, 4, 4, 5, 4);
  addFinishedMatch('fl-4', 'FL1', ogc, srfc, 1, 0, '2026-03-06T19:00:00Z', 2, 47, 9, 10, 3, 2, 4, 4);
  addFinishedMatch('fl-5', 'FL1', om, asm, 2, 2, '2026-03-10T20:00:00Z', 3, 50, 14, 14, 6, 6, 6, 6);
  addFinishedMatch('fl-6', 'FL1', ol, psg, 1, 3, '2026-03-12T19:00:00Z', 3, 41, 10, 19, 4, 9, 4, 8);
  addFinishedMatch('fl-7', 'FL1', rcl, ogc, 2, 0, '2026-03-15T16:00:00Z', 4, 54, 15, 8, 6, 2, 6, 3);
  addFinishedMatch('fl-8', 'FL1', srfc, losc, 2, 1, '2026-03-16T19:00:00Z', 4, 48, 12, 11, 5, 4, 5, 5);
  addFinishedMatch('fl-9', 'FL1', psg, asm, 1, 1, '2026-03-22T20:00:00Z', 5, 61, 17, 10, 6, 4, 8, 3);
  addFinishedMatch('fl-10', 'FL1', om, ol, 2, 1, '2026-03-23T19:00:00Z', 5, 52, 14, 11, 5, 4, 6, 5);

  // Future matches
  addScheduledMatch('fl-fut-1', 'FL1', psg, losc, '2026-07-25T20:00:00Z', 6);
  addScheduledMatch('fl-fut-2', 'FL1', asm, ogc, '2026-07-26T16:00:00Z', 6);
  addScheduledMatch('fl-fut-3', 'FL1', om, rcl, '2026-07-26T20:00:00Z', 6);
  addScheduledMatch('fl-fut-4', 'FL1', ol, srfc, '2026-08-01T20:00:00Z', 7);

  return { matches, matchStats };
}
