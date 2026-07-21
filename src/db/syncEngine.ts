import { db, computeStandings } from './dbStore';
import { Match, MatchStats } from '../types';

let isSyncing = false;
let lastSyncTime: number | null = null;

export function getLastSyncInfo() {
  return {
    isSyncing,
    lastSyncTime
  };
}

/**
 * Syncs match data for Top 5 leagues from football-data.org.
 * Falls back to simulation mode if API key is not present.
 */
export async function runSync(apiKey?: string): Promise<{ success: boolean; message: string; syncedCount: number }> {
  if (isSyncing) {
    return { success: false, message: 'Sync already in progress', syncedCount: 0 };
  }

  isSyncing = true;
  console.log('Starting data sync...');

  try {
    if (!apiKey) {
      console.log('No football-data.org API key provided. Running mock dynamic simulation...');
      const syncedCount = await simulateSync();
      lastSyncTime = Date.now();
      isSyncing = false;
      return {
        success: true,
        message: 'Sync completed in simulation/offline mode. Random scores updated for scheduled matches.',
        syncedCount
      };
    }

    // Real API fetch logic for football-data.org
    // Top 5 Competitions: PD (LaLiga), PL (Premier League), SA (Serie A), BL1 (Bundesliga), FL1 (Ligue 1)
    const competitions = ['PD', 'PL', 'SA', 'BL1', 'FL1'];
    let syncedCount = 0;

    for (const compId of competitions) {
      try {
        console.log(`Fetching matches for competition ${compId} from football-data.org...`);
        const url = `https://api.football-data.org/v4/competitions/${compId}/matches`;
        
        // Wait 6 seconds between requests to respect the rate limit (10 reqs/min)
        await new Promise(resolve => setTimeout(resolve, 6000));

        const res = await fetch(url, {
          headers: {
            'X-Auth-Token': apiKey
          }
        });

        if (!res.ok) {
          console.warn(`Failed to fetch ${compId}: status ${res.status}`);
          continue;
        }

        const data = await res.json();
        if (data && Array.isArray(data.matches)) {
          const apiMatches = data.matches;
          const currentMatches = db.getMatches();
          const currentStats = db.getMatchStats();

          apiMatches.forEach((apiMatch: any) => {
            // Translate football-data.org match schema to our match schema
            const matchId = `fd-${apiMatch.id}`;
            const existingMatchIdx = currentMatches.findIndex(m => m.id === matchId);

            const scoreHome = apiMatch.score?.fullTime?.home ?? null;
            const scoreAway = apiMatch.score?.fullTime?.away ?? null;
            const halfTimeHome = apiMatch.score?.halfTime?.home ?? null;
            const halfTimeAway = apiMatch.score?.halfTime?.away ?? null;

            const translated: Match = {
              id: matchId,
              leagueId: compId,
              homeTeamId: apiMatch.homeTeam.id,
              homeTeamName: apiMatch.homeTeam.name,
              homeTeamCrest: apiMatch.homeTeam.crest,
              awayTeamId: apiMatch.awayTeam.id,
              awayTeamName: apiMatch.awayTeam.name,
              awayTeamCrest: apiMatch.awayTeam.crest,
              date: apiMatch.utcDate,
              status: apiMatch.status === 'FINISHED' ? 'FINISHED' : 
                      apiMatch.status === 'LIVE' || apiMatch.status === 'IN_PLAY' ? 'LIVE' : 'SCHEDULED',
              scoreHome,
              scoreAway,
              halfTimeHome,
              halfTimeAway,
              matchday: apiMatch.matchday
            };

            if (existingMatchIdx >= 0) {
              currentMatches[existingMatchIdx] = translated;
            } else {
              currentMatches.push(translated);
            }

            // Create or update mock stats for newly imported finished matches
            if (translated.status === 'FINISHED') {
              const existingStatIdx = currentStats.findIndex(s => s.matchId === matchId);
              if (existingStatIdx < 0) {
                const posH = Math.floor(Math.random() * 25) + 38; // 38% to 63%
                currentStats.push({
                  matchId,
                  possessionHome: posH,
                  possessionAway: 100 - posH,
                  shotsHome: Math.floor(Math.random() * 12) + 6,
                  shotsAway: Math.floor(Math.random() * 10) + 5,
                  shotsOnTargetHome: Math.floor(Math.random() * 6) + 2,
                  shotsOnTargetAway: Math.floor(Math.random() * 5) + 1,
                  cornersHome: Math.floor(Math.random() * 7) + 2,
                  cornersAway: Math.floor(Math.random() * 6) + 1,
                  foulsHome: Math.floor(Math.random() * 10) + 5,
                  foulsAway: Math.floor(Math.random() * 10) + 5,
                  yellowCardsHome: Math.floor(Math.random() * 4),
                  yellowCardsAway: Math.floor(Math.random() * 4),
                  redCardsHome: Math.random() > 0.95 ? 1 : 0,
                  redCardsAway: Math.random() > 0.95 ? 1 : 0,
                });
              }
            }

            syncedCount++;
          });

          db.saveMatches(currentMatches);
          db.saveMatchStats(currentStats);
        }
      } catch (e) {
        console.error(`Error syncing competition ${compId}:`, e);
      }
    }

    lastSyncTime = Date.now();
    isSyncing = false;
    return { success: true, message: `Successfully synced ${syncedCount} matches from football-data.org.`, syncedCount };

  } catch (err) {
    console.error('Fatal sync error:', err);
    isSyncing = false;
    return { success: false, message: 'Sync failed due to an internal error.', syncedCount: 0 };
  }
}

/**
 * Simulates a data sync by resolving some SCHEDULED matches as FINISHED, 
 * updating their scorelines, and creating realistic match statistics.
 * This makes the dashboard feel alive and interactive instantly.
 */
async function simulateSync(): Promise<number> {
  const matches = db.getMatches();
  const stats = db.getMatchStats();

  let count = 0;

  // Let's find any SCHEDULED matches that are past their scheduled date, or just select a few random scheduled ones
  const scheduled = matches.filter(m => m.status === 'SCHEDULED');
  if (scheduled.length === 0) return 0;

  // Pick up to 3 random scheduled matches to "play"
  const countToPlay = Math.min(3, scheduled.length);
  const shuffled = [...scheduled].sort(() => 0.5 - Math.random());

  for (let i = 0; i < countToPlay; i++) {
    const m = shuffled[i];
    const matchIdx = matches.findIndex(item => item.id === m.id);
    if (matchIdx >= 0) {
      // Simulate scoreline
      const scoreHome = Math.floor(Math.random() * 4); // 0 to 3
      const scoreAway = Math.floor(Math.random() * 3); // 0 to 2

      matches[matchIdx] = {
        ...m,
        status: 'FINISHED',
        scoreHome,
        scoreAway,
        halfTimeHome: Math.floor(Math.random() * (scoreHome + 1)),
        halfTimeAway: Math.floor(Math.random() * (scoreAway + 1)),
      };

      // Generate statistics
      const posH = Math.floor(Math.random() * 20) + 40; // 40 to 60
      stats.push({
        matchId: m.id,
        possessionHome: posH,
        possessionAway: 100 - posH,
        shotsHome: Math.floor(Math.random() * 10) + 8,
        shotsAway: Math.floor(Math.random() * 8) + 6,
        shotsOnTargetHome: Math.floor(Math.random() * 5) + 3,
        shotsOnTargetAway: Math.floor(Math.random() * 4) + 2,
        cornersHome: Math.floor(Math.random() * 6) + 2,
        cornersAway: Math.floor(Math.random() * 5) + 1,
        foulsHome: Math.floor(Math.random() * 9) + 6,
        foulsAway: Math.floor(Math.random() * 9) + 6,
        yellowCardsHome: Math.floor(Math.random() * 3),
        yellowCardsAway: Math.floor(Math.random() * 4),
        redCardsHome: Math.random() > 0.9 ? 1 : 0,
        redCardsAway: Math.random() > 0.9 ? 1 : 0,
      });

      count++;
    }
  }

  db.saveMatches(matches);
  db.saveMatchStats(stats);

  return count;
}
