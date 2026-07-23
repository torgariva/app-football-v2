import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db, computeStandings, getMatchProbabilities, getTeamSeasonStats } from './src/db/dbStore';
import { runSync, getLastSyncInfo } from './src/db/syncEngine';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API Endpoints

/**
 * GET /api/leagues
 * Returns all monitored leagues.
 */
app.get('/api/leagues', (req: Request, res: Response) => {
  try {
    const leagues = db.getLeagues();
    res.json(leagues);
  } catch (error) {
    console.error('Error fetching leagues:', error);
    res.status(500).json({ error: 'Internal server error fetching leagues' });
  }
});

/**
 * GET /api/leagues/:leagueId/standings
 * Returns the computed standings for a specific league.
 */
app.get('/api/leagues/:leagueId/standings', (req: Request, res: Response) => {
  const { leagueId } = req.params;
  try {
    const standings = computeStandings(leagueId);
    res.json({
      leagueId,
      standings
    });
  } catch (error) {
    console.error(`Error computing standings for league ${leagueId}:`, error);
    res.status(500).json({ error: `Internal server error computing standings for league ${leagueId}` });
  }
});

/**
 * GET /api/leagues/:leagueId/matches
 * Returns matches for a specific league, with optional filters for teamId, status, and date.
 */
app.get('/api/leagues/:leagueId/matches', (req: Request, res: Response) => {
  const { leagueId } = req.params;
  const { teamId, status, date } = req.query;

  try {
    let matches = db.getMatches().filter(m => m.leagueId === leagueId);

    if (teamId) {
      const tid = parseInt(teamId as string, 10);
      matches = matches.filter(m => m.homeTeamId === tid || m.awayTeamId === tid);
    }

    if (status) {
      matches = matches.filter(m => m.status === status);
    }

    if (date) {
      // Filter by match date (YYYY-MM-DD format)
      const dateStr = date as string;
      matches = matches.filter(m => m.date.startsWith(dateStr));
    }

    // Sort: finished descending, scheduled ascending
    matches.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    res.json(matches);
  } catch (error) {
    console.error(`Error fetching matches for league ${leagueId}:`, error);
    res.status(500).json({ error: 'Internal server error fetching matches' });
  }
});

/**
 * GET /api/teams/:teamId
 * Returns metadata, standings position, season aggregates, and matches for a team.
 */
app.get('/api/teams/:teamId', (req: Request, res: Response) => {
  const teamId = parseInt(req.params.teamId, 10);
  if (isNaN(teamId)) {
    return res.status(400).json({ error: 'Invalid team ID' });
  }

  try {
    const teams = db.getTeams();
    const team = teams.find(t => t.id === teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const allMatches = db.getMatches();
    const teamMatches = allMatches.filter(m => m.homeTeamId === teamId || m.awayTeamId === teamId);

    // Compute season statistics aggregate
    const stats = getTeamSeasonStats(teamId, allMatches);
    stats.teamName = team.name;

    // Get standing position
    const standings = computeStandings(team.leagueId);
    const positionItem = standings.find(s => s.teamId === teamId);
    const standingPosition = positionItem ? positionItem.position : null;

    // Separate into recent and upcoming
    const finished = teamMatches
      .filter(m => m.status === 'FINISHED')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10); // last 10 finished

    const scheduled = teamMatches
      .filter(m => m.status === 'SCHEDULED')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 10); // next 10 scheduled

    res.json({
      team,
      standingPosition,
      stats,
      recentMatches: finished,
      upcomingMatches: scheduled
    });
  } catch (error) {
    console.error(`Error fetching team ${teamId}:`, error);
    res.status(500).json({ error: 'Internal server error fetching team details' });
  }
});

/**
 * GET /api/matches/:matchId
 * Returns rich detailed match screen info: metadata, stats, H2H history, recent form, and Poisson probabilities.
 */
app.get('/api/matches/:matchId', (req: Request, res: Response) => {
  const { matchId } = req.params;

  try {
    const matches = db.getMatches();
    const match = matches.find(m => m.id === matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // 1. Fetch match stats
    const statsList = db.getMatchStats();
    const stats = statsList.find(s => s.matchId === matchId) || null;

    // 2. Fetch H2H direct confrontations (max 6 matches)
    const h2h = matches
      .filter(m => 
        (m.homeTeamId === match.homeTeamId && m.awayTeamId === match.awayTeamId) ||
        (m.homeTeamId === match.awayTeamId && m.awayTeamId === match.homeTeamId)
      )
      .filter(m => m.status === 'FINISHED' && m.id !== matchId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);

    // 3. Fetch recent form (last 5 matches) for each team separately
    const recentHome = matches
      .filter(m => m.status === 'FINISHED' && m.id !== matchId && (m.homeTeamId === match.homeTeamId || m.awayTeamId === match.homeTeamId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    const recentAway = matches
      .filter(m => m.status === 'FINISHED' && m.id !== matchId && (m.homeTeamId === match.awayTeamId || m.awayTeamId === match.awayTeamId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // 4. Calculate Poisson probabilities
    let probabilities = null;
    try {
      probabilities = getMatchProbabilities(matchId);
    } catch (e) {
      console.error(`Poisson calculation failed for match ${matchId}:`, e);
    }

    res.json({
      match,
      stats,
      h2h,
      recentHome,
      recentAway,
      probabilities
    });
  } catch (error) {
    console.error(`Error fetching match details for match ${matchId}:`, error);
    res.status(500).json({ error: 'Internal server error fetching match details' });
  }
});

/**
 * POST /api/sync
 * Manually triggers sync or dynamic simulation of football-data.org.
 */
app.post('/api/sync', async (req: Request, res: Response) => {
  const apiKey = req.body.apiKey;
  try {
    const result = await runSync(apiKey);
    res.json(result);
  } catch (error) {
    console.error('API sync execution error:', error);
    res.status(500).json({ success: false, message: 'Internal server error running sync' });
  }
});

/**
 * GET /api/sync/status
 * Returns current syncing state.
 */
app.get('/api/sync/status', (req: Request, res: Response) => {
  res.json(getLastSyncInfo());
});


// Serve Front-End SPA Assets
async function initServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development mode: integration with Vite dev server
    console.log('Booting in DEVELOPMENT mode. Initializing Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    
    app.use(vite.middlewares);
  } else {
    // Production mode: serving pre-built files from dist
    console.log('Booting in PRODUCTION mode. Serving static assets...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`🚀 Full-stack Football Stats Server running on:`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`====================================================`);
  });
}

initServer().catch(err => {
  console.error('Failed to start full-stack server:', err);
});
