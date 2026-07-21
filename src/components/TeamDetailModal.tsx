import React, { useState, useEffect } from 'react';
import { X, Trophy, Shield, CalendarDays, TrendingUp, Info } from 'lucide-react';
import { Match, Team, TeamStatsAggregate } from '../types';
import { motion } from 'motion/react';

interface TeamDetailModalProps {
  teamId: number;
  onClose: () => void;
  onSelectMatch: (matchId: string) => void;
}

interface TeamData {
  team: Team;
  standingPosition: number | null;
  stats: TeamStatsAggregate;
  recentMatches: Match[];
  upcomingMatches: Match[];
}

export const TeamDetailModal: React.FC<TeamDetailModalProps> = ({
  teamId,
  onClose,
  onSelectMatch,
}) => {
  const [data, setData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/teams/${teamId}`)
      .then((res) => res.json())
      .then((resData) => {
        if (active) {
          setData(resData);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error loading team details:', err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [teamId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 font-medium">Cargando detalles del equipo...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
          <p className="text-rose-400 font-semibold mb-2">Error</p>
          <p className="text-slate-400 mb-4">No se pudo cargar la información del equipo.</p>
          <button onClick={onClose} className="bg-slate-800 text-slate-200 px-4 py-2 rounded-lg font-semibold text-xs">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  const { team, standingPosition, stats, recentMatches, upcomingMatches } = data;

  const fmtDecimal = (num: number) => Math.round(num * 100) / 100;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full my-8 overflow-hidden shadow-2xl"
        id="team-detail-modal-card"
      >
        {/* Close Button & Header */}
        <div className="relative bg-slate-950 px-6 py-4 border-b border-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1 h-3.5 bg-emerald-500"></span>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">
              Ficha del Club
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-b from-slate-950 to-slate-900/60 p-6 border-b border-slate-850">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 max-w-xl mx-auto text-center sm:text-left">
            <div className="w-16 h-16 bg-slate-900 rounded border border-slate-800 p-3 flex items-center justify-center">
              <img src={team.crest} alt={team.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <div className="space-y-1.5 mt-2 sm:mt-0">
              <h1 className="text-lg md:text-xl font-bold uppercase tracking-tight text-white font-mono">{team.name}</h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-400">
                  Acrónimo: {team.tla}
                </span>
                {standingPosition !== null && (
                  <span className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-2 py-0.5 rounded">
                    <Trophy className="w-3.5 h-3.5 text-emerald-500" />
                    Posición #{standingPosition}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[500px]">
          
          {/* Season aggregated Statistics (Bento Grid) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-1 h-3 bg-slate-500"></span>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Estadísticas agregadas de la Temporada</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" id="team-bento-grid">
              
              {/* Card: matches */}
              <div className="bg-slate-950 border border-slate-850 p-3.5 rounded text-center">
                <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider font-mono">Partidos Jugados</p>
                <p className="text-lg font-bold font-mono text-slate-200 mt-1">{stats.matchesPlayed}</p>
                <div className="flex items-center justify-center gap-2 text-[9px] text-slate-500 font-bold font-mono uppercase mt-1">
                  <span>{stats.homeMatches} Loc</span>
                  <span>•</span>
                  <span>{stats.awayMatches} Vis</span>
                </div>
              </div>

              {/* Card: goals scored */}
              <div className="bg-slate-950 border border-slate-850 p-3.5 rounded text-center">
                <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider font-mono">Goles a favor</p>
                <p className="text-lg font-bold font-mono text-emerald-400 mt-1">{stats.goalsScoredHome + stats.goalsScoredAway}</p>
                <div className="flex items-center justify-center gap-2 text-[9px] text-slate-500 font-bold font-mono uppercase mt-1">
                  <span>{stats.goalsScoredHome} Loc</span>
                  <span>•</span>
                  <span>{stats.goalsScoredAway} Vis</span>
                </div>
              </div>

              {/* Card: goals conceded */}
              <div className="bg-slate-950 border border-slate-850 p-3.5 rounded text-center">
                <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider font-mono">Goles en contra</p>
                <p className="text-lg font-bold font-mono text-rose-400 mt-1">{stats.goalsConcededHome + stats.goalsConcededAway}</p>
                <div className="flex items-center justify-center gap-2 text-[9px] text-slate-500 font-bold font-mono uppercase mt-1">
                  <span>{stats.goalsConcededHome} Loc</span>
                  <span>•</span>
                  <span>{stats.goalsConcededAway} Vis</span>
                </div>
              </div>

              {/* Card: avg goals per match */}
              <div className="bg-slate-950 border border-slate-850 p-3.5 rounded text-center">
                <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider font-mono">Promedio de Goles</p>
                <p className="text-lg font-bold font-mono text-slate-200 mt-1">
                  {fmtDecimal((stats.goalsScoredHome + stats.goalsScoredAway) / Math.max(1, stats.matchesPlayed))}
                </p>
                <p className="text-[9px] text-slate-500 font-bold font-mono uppercase mt-1">Goles/Partido</p>
              </div>

            </div>

            {/* Averages split details */}
            <div className="bg-slate-950 border border-slate-850 rounded p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono font-bold uppercase tracking-wider">
              <div className="space-y-1.5 border-r border-slate-900 pr-4">
                <h4 className="text-[9px] uppercase text-slate-500 tracking-wider font-bold mb-1">Como Local</h4>
                <div className="flex justify-between items-center py-1 border-b border-slate-900/60 text-slate-400">
                  <span>Goles marcados / part</span>
                  <span className="text-slate-200">{fmtDecimal(stats.avgGoalsScoredHome)}</span>
                </div>
                <div className="flex justify-between items-center py-1 text-slate-400">
                  <span>Goles recibidos / part</span>
                  <span className="text-slate-200">{fmtDecimal(stats.avgGoalsConcededHome)}</span>
                </div>
              </div>
              <div className="space-y-1.5 pl-2">
                <h4 className="text-[9px] uppercase text-slate-500 tracking-wider font-bold mb-1">Como Visitante</h4>
                <div className="flex justify-between items-center py-1 border-b border-slate-900/60 text-slate-400">
                  <span>Goles marcados / part</span>
                  <span className="text-slate-200">{fmtDecimal(stats.avgGoalsScoredAway)}</span>
                </div>
                <div className="flex justify-between items-center py-1 text-slate-400">
                  <span>Goles recibidos / part</span>
                  <span className="text-slate-200">{fmtDecimal(stats.avgGoalsConcededAway)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Matches List split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="team-matches-panel">
            {/* Recent Matches */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-2">
                <span className="w-1 h-3 bg-emerald-500"></span>
                <h4 className="font-bold text-xs uppercase tracking-wider font-mono text-slate-300">Resultados Recientes</h4>
              </div>
              {recentMatches.length === 0 ? (
                <p className="text-xs text-slate-500 font-medium font-mono">No hay registros de partidos recientes.</p>
              ) : (
                <div className="space-y-1.5">
                  {recentMatches.map((m) => {
                    const isHome = m.homeTeamId === teamId;
                    const opponent = isHome ? m.awayTeamName : m.homeTeamName;
                    const scoreText = `${m.scoreHome} - ${m.scoreAway}`;
                    
                    let outcomeBadge = "bg-slate-500/10 text-slate-400 border-slate-500/20";
                    if (m.scoreHome !== null && m.scoreAway !== null) {
                      if (m.scoreHome === m.scoreAway) {
                        outcomeBadge = "bg-slate-500/10 text-slate-400 border-slate-500/25";
                      } else if ((isHome && m.scoreHome > m.scoreAway) || (!isHome && m.scoreAway > m.scoreHome)) {
                        outcomeBadge = "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
                      } else {
                        outcomeBadge = "bg-rose-500/10 text-rose-400 border-rose-500/25";
                      }
                    }

                    return (
                      <div
                        key={m.id}
                        onClick={() => onSelectMatch(m.id)}
                        className="group flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800/80 hover:border-emerald-500/30 rounded cursor-pointer transition-all text-xs"
                      >
                        <div className="truncate pr-2">
                          <p className="font-bold text-slate-300 truncate group-hover:text-emerald-400 transition-colors">
                            {opponent}
                          </p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono mt-0.5">{isHome ? 'Local' : 'Visitante'}</p>
                        </div>
                        <span className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded tracking-wider shrink-0 ${outcomeBadge}`}>
                          {scoreText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Upcoming Matches */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-2">
                <span className="w-1 h-3 bg-emerald-500"></span>
                <h4 className="font-bold text-xs uppercase tracking-wider font-mono text-slate-300">Próximos Partidos</h4>
              </div>
              {upcomingMatches.length === 0 ? (
                <p className="text-xs text-slate-500 font-medium font-mono">No hay partidos próximos programados.</p>
              ) : (
                <div className="space-y-1.5">
                  {upcomingMatches.map((m) => {
                    const isHome = m.homeTeamId === teamId;
                    const opponent = isHome ? m.awayTeamName : m.homeTeamName;
                    const time = new Date(m.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) + ' ' + new Date(m.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div
                        key={m.id}
                        onClick={() => onSelectMatch(m.id)}
                        className="group flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800/80 hover:border-emerald-500/30 rounded cursor-pointer transition-all text-xs"
                      >
                        <div className="truncate pr-2">
                          <p className="font-bold text-slate-300 truncate group-hover:text-emerald-400 transition-colors">
                            {opponent}
                          </p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono mt-0.5">{isHome ? 'Local' : 'Visitante'}</p>
                        </div>
                        <span className="font-mono text-[9px] bg-slate-900 border border-slate-800/80 px-2 py-0.5 rounded text-slate-400 font-bold uppercase shrink-0">
                          {time}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};
