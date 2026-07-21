import { useState, useEffect } from 'react';
import { League, StandingItem, Match } from './types';
import { LeagueSelector } from './components/LeagueSelector';
import { StandingsTable } from './components/StandingsTable';
import { CalendarView } from './components/CalendarView';
import { MatchDetailModal } from './components/MatchDetailModal';
import { TeamDetailModal } from './components/TeamDetailModal';
import { Shield, RefreshCw, Key, HelpCircle, Check, AlertCircle } from 'lucide-react';
import { AnimatePresence } from 'motion/react';

export default function App() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('PD'); // Default to LaLiga
  const [standings, setStandings] = useState<StandingItem[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  
  // Modal states
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  // Calendar filter team state (when user clicks team inside calendar)
  const [calendarFilterTeamId, setCalendarFilterTeamId] = useState<number | null>(null);

  // Syncing states
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [syncFeedback, setSyncFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load leagues on boot
  useEffect(() => {
    fetch('/api/leagues')
      .then((res) => res.json())
      .then((data) => {
        setLeagues(data);
        if (data.length > 0 && !selectedLeagueId) {
          setSelectedLeagueId(data[0].id);
        }
      })
      .catch((err) => console.error('Error fetching leagues:', err));
  }, []);

  // Fetch standings and matches whenever the selected league changes
  useEffect(() => {
    if (!selectedLeagueId) return;

    // Reset calendar filter when league changes
    setCalendarFilterTeamId(null);

    // Fetch standings
    fetch(`/api/leagues/${selectedLeagueId}/standings`)
      .then((res) => res.json())
      .then((data) => {
        setStandings(data.standings || []);
      })
      .catch((err) => console.error(`Error fetching standings for ${selectedLeagueId}:`, err));

    // Fetch matches
    fetch(`/api/leagues/${selectedLeagueId}/matches`)
      .then((res) => res.json())
      .then((data) => {
        setMatches(data || []);
      })
      .catch((err) => console.error(`Error fetching matches for ${selectedLeagueId}:`, err));
  }, [selectedLeagueId]);

  // Check initial sync status
  useEffect(() => {
    fetch('/api/sync/status')
      .then((res) => res.json())
      .then((data) => {
        setIsSyncing(data.isSyncing);
      })
      .catch((err) => console.error('Error checking sync status:', err));
  }, []);

  // Sync function handler
  const handleSync = () => {
    setIsSyncing(true);
    setSyncFeedback(null);

    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey: apiKey.trim() || undefined }),
    })
      .then((res) => res.json())
      .then((data) => {
        setIsSyncing(false);
        if (data.success) {
          setSyncFeedback({
            type: 'success',
            message: data.message,
          });
          // Refresh current page data
          setSelectedLeagueId((prev) => prev); // re-trigger fetch
        } else {
          setSyncFeedback({
            type: 'error',
            message: data.message || 'Error al ejecutar la sincronización.',
          });
        }
      })
      .catch((err) => {
        console.error('Error executing sync:', err);
        setIsSyncing(false);
        setSyncFeedback({
          type: 'error',
          message: 'Error de red al intentar sincronizar con el backend.',
        });
      });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" id="app-root">
      {/* Top Premium Navigation Header */}
      <header className="bg-slate-900/60 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* App Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/10 shrink-0">
              <Shield className="w-5.5 h-5.5 text-slate-950 font-black" />
            </div>
            <div>
              <h1 className="font-extrabold text-base md:text-lg tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                Fútbol Stats & Probabilidades
              </h1>
              <p className="text-[10px] text-emerald-400 font-mono tracking-wider font-semibold uppercase mt-0.5">
                Modelos de Predicción Poisson
              </p>
            </div>
          </div>

          {/* Sync Controls Panel */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 w-full sm:w-auto">
            {/* API Key Box */}
            <div className="relative flex items-center bg-slate-950 border border-slate-850 rounded-lg py-1 px-2 text-xs w-full max-w-[210px] sm:max-w-[240px]">
              <Key className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
              <input
                type="password"
                placeholder="Token de football-data.org (Opcional)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-transparent text-slate-300 focus:outline-none w-full text-[11px]"
              />
            </div>

            {/* Sync trigger button */}
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
                isSyncing
                  ? 'bg-slate-800 text-slate-500 border border-slate-800 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black hover:shadow-lg hover:shadow-emerald-500/15 cursor-pointer'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-slate-500' : 'text-slate-950 font-black'}`} />
              {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* Sync Feedback Message Overlay banner */}
        {syncFeedback && (
          <div
            id="sync-feedback-banner"
            className={`flex items-start gap-3 p-4 rounded-xl border text-xs font-semibold ${
              syncFeedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}
          >
            {syncFeedback.type === 'success' ? (
              <Check className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            )}
            <div className="space-y-1">
              <p className="font-bold">{syncFeedback.type === 'success' ? 'Sincronización Exitosa' : 'Aviso / Error'}</p>
              <p className="opacity-90 font-medium">{syncFeedback.message}</p>
            </div>
            <button
              onClick={() => setSyncFeedback(null)}
              className="ml-auto text-[10px] uppercase font-bold opacity-75 hover:opacity-100"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* League Selector */}
        <LeagueSelector
          leagues={leagues}
          selectedLeagueId={selectedLeagueId}
          onSelectLeague={setSelectedLeagueId}
        />

        {/* Bento Dashboard Grid layout (Table & Calendar side-by-side) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-bento-layout">
          
          {/* Classification Standings (5 Columns of Bento) */}
          <div className="lg:col-span-5">
            <StandingsTable
              standings={standings}
              selectedTeamId={calendarFilterTeamId}
              onSelectTeam={(tid) => {
                // If clicked, we open the Team Detail Dashboard Modal!
                setSelectedTeamId(tid);
              }}
            />
          </div>

          {/* Calendar list (7 Columns of Bento) */}
          <div className="lg:col-span-7">
            <CalendarView
              matches={matches}
              selectedTeamId={calendarFilterTeamId}
              onSelectTeamId={setCalendarFilterTeamId}
              onSelectMatch={setSelectedMatchId}
            />
          </div>

        </div>

      </main>

      {/* Footer Disclaimer & Branding */}
      <footer className="bg-slate-900 border-t border-slate-850 py-6 px-4 text-center text-xs text-slate-500 font-semibold mt-12">
        <div className="max-w-7xl mx-auto space-y-2">
          <p className="text-slate-400">Fútbol Stats & Probabilidades © 2026</p>
          <p className="text-[10px] leading-relaxed max-w-xl mx-auto font-medium opacity-75">
            Todos los cálculos de probabilidades se realizan localmente utilizando fórmulas de distribución de Poisson aplicadas sobre promedios e históricos de goles. No recopilamos datos personales ni ofrecemos cuotas reales de apuestas.
          </p>
        </div>
      </footer>

      {/* Overlays / Modals */}
      <AnimatePresence>
        {/* Match Detail Modal Overlay */}
        {selectedMatchId && (
          <MatchDetailModal
            matchId={selectedMatchId}
            onClose={() => setSelectedMatchId(null)}
            onSelectTeam={(tid) => {
              setSelectedMatchId(null); // Close match modal
              setSelectedTeamId(tid); // Open team modal
            }}
          />
        )}

        {/* Team Detail Modal Overlay */}
        {selectedTeamId && (
          <TeamDetailModal
            teamId={selectedTeamId}
            onClose={() => setSelectedTeamId(null)}
            onSelectMatch={(mid) => {
              setSelectedTeamId(null); // Close team modal
              setSelectedMatchId(mid); // Open match modal
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
