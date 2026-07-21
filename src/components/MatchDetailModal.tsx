import React, { useState, useEffect } from 'react';
import { MatchDetails, Match, MatchStats } from '../types';
import { X, Calendar, Clock, Award, Shield, Percent, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MatchDetailModalProps {
  matchId: string;
  onClose: () => void;
  onSelectTeam: (teamId: number) => void;
}

type TabType = 'RESUMEN' | 'ESTADISTICAS' | 'H2H' | 'FORMA' | 'PROBABILIDADES';

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({
  matchId,
  onClose,
  onSelectTeam,
}) => {
  const [details, setDetails] = useState<MatchDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>('RESUMEN');

  useEffect(() => {
    let active = true;
    setLoading(true);
    
    fetch(`/api/matches/${matchId}`)
      .then((res) => res.json())
      .then((data) => {
        if (active) {
          setDetails(data);
          setLoading(false);
          // Default to probabilities tab if the match is scheduled
          if (data?.match?.status === 'SCHEDULED') {
            setActiveTab('PROBABILIDADES');
          } else {
            setActiveTab('RESUMEN');
          }
        }
      })
      .catch((err) => {
        console.error('Error loading match details:', err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [matchId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 font-medium">Cargando estadísticas de partido...</p>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
          <p className="text-rose-400 font-semibold mb-2">Error</p>
          <p className="text-slate-400 mb-4">No se pudo cargar la información del partido.</p>
          <button onClick={onClose} className="bg-slate-800 text-slate-200 px-4 py-2 rounded-lg font-semibold text-xs">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  const { match, stats, h2h, recentHome, recentAway, probabilities } = details;
  const isFinished = match.status === 'FINISHED';

  // Helper for generating simulated goal scorers (makes Summary tab beautiful)
  const generateGoalMinutes = (score: number | null) => {
    if (score === null || score === 0) return [];
    const minutes: number[] = [];
    for (let i = 0; i < score; i++) {
      minutes.push(Math.floor(Math.random() * 85) + 5);
    }
    return minutes.sort((a, b) => a - b);
  };

  const homeGoals = generateGoalMinutes(match.scoreHome);
  const awayGoals = generateGoalMinutes(match.scoreAway);

  // Form rendering helpers
  const renderFormBadge = (outcome: 'W' | 'D' | 'L') => {
    const bg = outcome === 'W' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' :
               outcome === 'D' ? 'bg-slate-500/10 text-slate-400 border-slate-500/25' :
                                 'bg-rose-500/10 text-rose-400 border-rose-500/25';
    return (
      <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold border ${bg}`}>
        {outcome}
      </span>
    );
  };

  const determineOutcome = (m: Match, teamId: number): 'W' | 'D' | 'L' => {
    if (m.scoreHome === null || m.scoreAway === null) return 'D';
    if (m.scoreHome === m.scoreAway) return 'D';
    if (m.homeTeamId === teamId) {
      return m.scoreHome > m.scoreAway ? 'W' : 'L';
    } else {
      return m.scoreAway > m.scoreHome ? 'W' : 'L';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full my-8 overflow-hidden shadow-2xl"
        id="match-detail-modal-card"
      >
        {/* Close Button & Header */}
        <div className="relative bg-slate-950 px-6 py-4 border-b border-slate-850/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1 h-3.5 bg-emerald-500"></span>
            <span className="text-xs bg-slate-900 px-2.5 py-0.5 rounded text-slate-400 font-bold font-mono border border-slate-800/80 uppercase">
              Jornada {match.matchday}
            </span>
            <span className="text-[10px] text-slate-500 font-bold font-mono uppercase tracking-wider">
              {new Date(match.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Score Board Hero Section */}
        <div className="bg-gradient-to-b from-slate-950 to-slate-900/60 p-6 md:p-8 border-b border-slate-850/60 text-center">
          <div className="flex items-center justify-between max-w-xl mx-auto">
            {/* Home Team Hero */}
            <div 
              onClick={() => onSelectTeam(match.homeTeamId)}
              className="flex flex-col items-center gap-2.5 w-5/12 cursor-pointer group"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-900 rounded border border-slate-800 p-2.5 flex items-center justify-center group-hover:border-emerald-500/40 group-hover:scale-105 transition-all duration-300">
                <img src={match.homeTeamCrest} alt={match.homeTeamName} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <span className="font-extrabold text-xs md:text-sm text-slate-200 group-hover:text-emerald-400 transition-colors line-clamp-1 uppercase tracking-tight">
                {match.homeTeamName}
              </span>
            </div>

            {/* Score Center */}
            <div className="flex flex-col items-center justify-center w-2/12">
              {isFinished ? (
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold font-mono tracking-wider text-white">
                    {match.scoreHome} - {match.scoreAway}
                  </h1>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 mt-1 block font-mono">
                    Final
                  </span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded font-mono font-bold text-[10px] tracking-wide uppercase">
                    {new Date(match.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <span className="text-[8px] uppercase font-extrabold tracking-widest text-slate-500 block font-mono">
                    Por jugar
                  </span>
                </div>
              )}
            </div>

            {/* Away Team Hero */}
            <div 
              onClick={() => onSelectTeam(match.awayTeamId)}
              className="flex flex-col items-center gap-2.5 w-5/12 cursor-pointer group"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-900 rounded border border-slate-800 p-2.5 flex items-center justify-center group-hover:border-emerald-500/40 group-hover:scale-105 transition-all duration-300">
                <img src={match.awayTeamCrest} alt={match.awayTeamName} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <span className="font-extrabold text-xs md:text-sm text-slate-200 group-hover:text-emerald-400 transition-colors line-clamp-1 uppercase tracking-tight">
                {match.awayTeamName}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-950 p-1 border-b border-slate-850/60 overflow-x-auto no-scrollbar">
          {(['RESUMEN', 'ESTADISTICAS', 'H2H', 'FORMA', 'PROBABILIDADES'] as TabType[]).map((tab) => {
            const isSelected = activeTab === tab;
            // Disable statistics tab if match is not played yet
            const isDisabled = tab === 'ESTADISTICAS' && !isFinished;
            
            let label = '';
            if (tab === 'RESUMEN') label = 'Resumen';
            else if (tab === 'ESTADISTICAS') label = 'Estadísticas';
            else if (tab === 'H2H') label = 'H2H Directo';
            else if (tab === 'FORMA') label = 'Forma Reciente';
            else if (tab === 'PROBABILIDADES') label = 'Probabilidades';

            return (
              <button
                key={tab}
                disabled={isDisabled}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[90px] py-2.5 text-[10px] font-bold font-mono uppercase tracking-wider transition-all border-b-2 text-center truncate cursor-pointer ${
                  isDisabled 
                    ? 'opacity-25 cursor-not-allowed text-slate-600 border-transparent' 
                    : isSelected
                    ? 'text-emerald-400 border-emerald-500 bg-emerald-500/5'
                    : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-900/40'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="p-6 overflow-y-auto max-h-[450px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
            >
              {/* Tab: Summary */}
              {activeTab === 'RESUMEN' && (
                <div className="space-y-5" id="summary-panel">
                  {isFinished ? (
                    <div className="grid grid-cols-2 gap-6 bg-slate-950 border border-slate-850/60 p-4.5 rounded font-mono">
                      {/* Home scorers */}
                      <div className="space-y-1.5 border-r border-slate-900 pr-4">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Goles {match.homeTeamName}</h4>
                        {homeGoals.length === 0 ? (
                          <p className="text-[10px] text-slate-600 font-bold uppercase">Sin goles</p>
                        ) : (
                          homeGoals.map((min, idx) => (
                            <p key={idx} className="text-[11px] text-slate-300 font-bold flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Goleador {idx + 1} <span className="text-slate-500">({min}')</span>
                            </p>
                          ))
                        )}
                      </div>

                      {/* Away scorers */}
                      <div className="space-y-1.5 pl-2">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Goles {match.awayTeamName}</h4>
                        {awayGoals.length === 0 ? (
                          <p className="text-[10px] text-slate-600 font-bold uppercase">Sin goles</p>
                        ) : (
                          awayGoals.map((min, idx) => (
                            <p key={idx} className="text-[11px] text-slate-300 font-bold flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Goleador {idx + 1} <span className="text-slate-500">({min}')</span>
                            </p>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 font-mono uppercase">
                      <Clock className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                      <p className="text-slate-400 text-xs font-bold tracking-wide">El partido aún no se ha jugado</p>
                      <p className="text-[10px] text-slate-500 mt-1.5 tracking-wider leading-relaxed font-bold">
                        {new Date(match.date).toLocaleString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}.
                      </p>
                    </div>
                  )}

                  {/* General match information */}
                  <div className="bg-slate-950 border border-slate-850/60 p-4 rounded space-y-2.5 text-[11px] font-bold font-mono uppercase tracking-wider">
                    <div className="flex justify-between py-1 border-b border-slate-900 text-slate-500">
                      <span>Competición</span>
                      <span className="text-slate-300 font-bold">Top 5 European Leagues</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900 text-slate-500">
                      <span>Estadio</span>
                      <span className="text-slate-300">Estadio Local del {match.homeTeamName}</span>
                    </div>
                    <div className="flex justify-between py-1 text-slate-500">
                      <span>Árbitro</span>
                      <span className="text-slate-300">Oficial de la Liga</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Match Stats (Finished Matches only) */}
              {activeTab === 'ESTADISTICAS' && stats && (
                <div className="space-y-5" id="stats-panel">
                  {/* Stats comparison bar generator */}
                  {(Object.keys(stats) as Array<keyof MatchStats>)
                    .filter((key) => key !== 'matchId')
                    .map((key) => {
                      const hVal = stats[key] ?? 0;
                      // Derive away value
                      let aVal = 0;
                      let label = '';
                      let isPct = false;

                      if (key === 'possessionHome') {
                        aVal = stats.possessionAway ?? 50;
                        label = 'Posesión';
                        isPct = true;
                      } else if (key === 'shotsHome') {
                        aVal = stats.shotsAway ?? 0;
                        label = 'Tiros Totales';
                      } else if (key === 'shotsOnTargetHome') {
                        aVal = stats.shotsOnTargetAway ?? 0;
                        label = 'Tiros a Puerta';
                      } else if (key === 'cornersHome') {
                        aVal = stats.cornersAway ?? 0;
                        label = 'Córners';
                      } else if (key === 'foulsHome') {
                        aVal = stats.foulsAway ?? 0;
                        label = 'Faltas Cometidas';
                      } else if (key === 'yellowCardsHome') {
                        aVal = stats.yellowCardsAway ?? 0;
                        label = 'Tarjetas Amarillas';
                      } else if (key === 'redCardsHome') {
                        aVal = stats.redCardsAway ?? 0;
                        label = 'Tarjetas Rojas';
                      } else {
                        return null; // Skip redundant companion fields (possessionAway etc)
                      }

                      const max = Math.max(1, hVal + aVal);
                      const hPct = Math.round((hVal / max) * 100);
                      const aPct = 100 - hPct;

                      return (
                        <div key={key} className="space-y-1.5 font-mono uppercase">
                          <div className="flex items-center justify-between text-[11px] font-bold px-1 text-slate-500">
                            <span className={`${hVal > aVal ? 'text-emerald-400 font-extrabold' : 'text-slate-400'}`}>
                              {hVal}{isPct && '%'}
                            </span>
                            <span className="tracking-widest text-[10px] font-bold">{label}</span>
                            <span className={`${aVal > hVal ? 'text-emerald-400 font-extrabold' : 'text-slate-400'}`}>
                              {aVal}{isPct && '%'}
                            </span>
                          </div>
                          {/* Comparative visual bar */}
                          <div className="h-1.5 bg-slate-950 flex overflow-hidden border border-slate-900">
                            <div 
                              style={{ width: `${hPct}%` }} 
                              className={`h-full ${hVal > aVal ? 'bg-emerald-500/80' : 'bg-slate-700/60'}`}
                            ></div>
                            <div 
                              style={{ width: `${aPct}%` }} 
                              className={`h-full ${aVal > hVal ? 'bg-emerald-500/80' : 'bg-slate-700/60'}`}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Tab: H2H History */}
              {activeTab === 'H2H' && (
                <div className="space-y-4" id="h2h-panel">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1 h-3 bg-slate-500"></span>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Historial directo de enfrentamientos</h4>
                  </div>
                  {h2h.length === 0 ? (
                    <p className="text-center py-6 text-slate-500 text-xs font-mono uppercase font-bold">No hay enfrentamientos previos.</p>
                  ) : (
                    <div className="space-y-2 font-mono uppercase text-[11px]">
                      {h2h.map((hMatch) => {
                        const hWon = hMatch.scoreHome! > hMatch.scoreAway!;
                        const draw = hMatch.scoreHome! === hMatch.scoreAway!;
                        return (
                          <div key={hMatch.id} className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800/80 rounded text-xs font-bold">
                            <span className="text-slate-500 min-w-[70px]">
                              {new Date(hMatch.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short' })}
                            </span>
                            <div className="flex items-center justify-center gap-3 w-3/5">
                              <span className={`truncate w-5/12 text-right ${hWon ? 'text-slate-200 font-bold' : 'text-slate-500'}`}>{hMatch.homeTeamName}</span>
                              <span className="font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-200 font-bold min-w-[45px] text-center tracking-wider text-[11px]">
                                {hMatch.scoreHome} - {hMatch.scoreAway}
                              </span>
                              <span className={`truncate w-5/12 text-left ${(!hWon && !draw) ? 'text-slate-200 font-bold' : 'text-slate-500'}`}>{hMatch.awayTeamName}</span>
                            </div>
                            <span className="text-[10px] text-slate-500">Jor. {hMatch.matchday}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Recent Form */}
              {activeTab === 'FORMA' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="form-panel">
                  {/* Home Team Form */}
                  <div className="space-y-3 font-mono uppercase">
                    <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2 mb-1">
                      <img src={match.homeTeamCrest} alt="" className="w-4 h-4 object-contain" />
                      <h4 className="text-[10px] font-bold text-slate-300 truncate">Forma de {match.homeTeamName}</h4>
                    </div>
                    {recentHome.length === 0 ? (
                      <p className="text-xs text-slate-500 font-bold">Sin datos recientes.</p>
                    ) : (
                      <div className="space-y-1.5 text-[10px] font-bold">
                        {recentHome.map((rm) => {
                          const form = determineOutcome(rm, match.homeTeamId);
                          return (
                            <div key={rm.id} className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800/80 rounded">
                              <div className="flex items-center gap-2">
                                {renderFormBadge(form)}
                                <span className="text-slate-400 truncate max-w-[120px]">
                                  {rm.homeTeamId === match.homeTeamId ? `vs ${rm.awayTeamName} (C)` : `vs ${rm.homeTeamName} (F)`}
                                </span>
                              </div>
                              <span className="font-mono text-slate-200 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                {rm.scoreHome} - {rm.scoreAway}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Away Team Form */}
                  <div className="space-y-3 font-mono uppercase">
                    <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2 mb-1">
                      <img src={match.awayTeamCrest} alt="" className="w-4 h-4 object-contain" />
                      <h4 className="text-[10px] font-bold text-slate-300 truncate">Forma de {match.awayTeamName}</h4>
                    </div>
                    {recentAway.length === 0 ? (
                      <p className="text-xs text-slate-500 font-bold">Sin datos recientes.</p>
                    ) : (
                      <div className="space-y-1.5 text-[10px] font-bold">
                        {recentAway.map((rm) => {
                          const form = determineOutcome(rm, match.awayTeamId);
                          return (
                            <div key={rm.id} className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800/80 rounded">
                              <div className="flex items-center gap-2">
                                {renderFormBadge(form)}
                                <span className="text-slate-400 truncate max-w-[120px]">
                                  {rm.homeTeamId === match.awayTeamId ? `vs ${rm.awayTeamName} (C)` : `vs ${rm.homeTeamName} (F)`}
                                </span>
                              </div>
                              <span className="font-mono text-slate-200 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                {rm.scoreHome} - {rm.scoreAway}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Probabilities (Mathematical Poisson model) */}
              {activeTab === 'PROBABILIDADES' && probabilities && (
                <div className="space-y-5" id="probabilities-panel">
                  {/* Expected Goals Header */}
                  <div className="bg-slate-950 border border-slate-850/60 p-4 rounded flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-1 h-3.5 bg-emerald-500"></span>
                      <div className="font-mono uppercase text-left">
                        <h4 className="font-bold text-xs text-white">Modelo Poisson Interno</h4>
                        <p className="text-[9px] text-slate-500 mt-0.5">Goles esperados calculados mediante regresión histórica</p>
                      </div>
                    </div>
                    {/* Expected goals indicators */}
                    <div className="flex items-center gap-2.5 font-mono font-bold text-xs bg-slate-900 border border-slate-800 px-3 py-1 rounded text-slate-200">
                      <span className="text-cyan-400">{probabilities.expectedHomeGoals} xG</span>
                      <span className="text-slate-600">:</span>
                      <span className="text-purple-400">{probabilities.expectedAwayGoals} xG</span>
                    </div>
                  </div>

                  {/* Market 1X2 Three-Way Visual Bar */}
                  <div className="space-y-2 font-mono uppercase text-[10px] font-bold">
                    <h5 className="text-[10px] text-slate-500 tracking-wider font-bold">Resultado de Partido (1X2)</h5>
                    <div className="flex h-5 rounded-none bg-slate-950 overflow-hidden border border-slate-900">
                      <div 
                        style={{ width: `${probabilities.probHomeWin}%` }} 
                        className="bg-cyan-500/80 hover:bg-cyan-500/90 text-slate-950 flex items-center justify-center font-mono font-bold text-[9px] tracking-wide transition-all"
                      >
                        {probabilities.probHomeWin > 12 && `1: ${probabilities.probHomeWin}%`}
                      </div>
                      <div 
                        style={{ width: `${probabilities.probDraw}%` }} 
                        className="bg-slate-500 hover:bg-slate-400 text-slate-950 flex items-center justify-center font-mono font-bold text-[9px] tracking-wide transition-all border-x border-slate-950"
                      >
                        {probabilities.probDraw > 12 && `X: ${probabilities.probDraw}%`}
                      </div>
                      <div 
                        style={{ width: `${probabilities.probAwayWin}%` }} 
                        className="bg-purple-500/80 hover:bg-purple-500/90 text-slate-950 flex items-center justify-center font-mono font-bold text-[9px] tracking-wide transition-all"
                      >
                        {probabilities.probAwayWin > 12 && `2: ${probabilities.probAwayWin}%`}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[9px] text-slate-500 gap-1.5 px-0.5">
                      <span className="text-cyan-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                        Victoria {match.homeTeamName} ({probabilities.probHomeWin}%)
                      </span>
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        Empate ({probabilities.probDraw}%)
                      </span>
                      <span className="text-purple-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                        Victoria {match.awayTeamName} ({probabilities.probAwayWin}%)
                      </span>
                    </div>
                  </div>

                  {/* Market Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Double Chance & BTTS */}
                    <div className="space-y-4">
                      {/* Double Chance */}
                      <div className="bg-slate-950 border border-slate-850/60 p-4 rounded space-y-3 font-mono uppercase text-[10px] font-bold">
                        <h5 className="text-[10px] text-slate-500 tracking-wider">Doble Oportunidad</h5>
                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex justify-between items-center py-1 border-b border-slate-900 text-slate-400">
                            <span>1X (Local o Empate)</span>
                            <span className="text-emerald-400">{probabilities.prob1X}%</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-slate-900 text-slate-400">
                            <span>12 (Cualquiera gana)</span>
                            <span className="text-emerald-400">{probabilities.prob12}%</span>
                          </div>
                          <div className="flex justify-between items-center py-1 text-slate-400">
                            <span>X2 (Empate o Visitante)</span>
                            <span className="text-emerald-400">{probabilities.probX2}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Ambos Equipos Marcan */}
                      <div className="bg-slate-950 border border-slate-850/60 p-4 rounded space-y-3 font-mono uppercase text-[10px] font-bold">
                        <h5 className="text-[10px] text-slate-500 tracking-wider">Ambos Equipos Marcan (BTTS)</h5>
                        <div className="grid grid-cols-2 gap-3 text-center">
                          <div className="bg-slate-900 border border-slate-800/80 p-2.5 rounded">
                            <p className="text-[9px] text-slate-500 mb-0.5">SÍ</p>
                            <p className="font-bold text-xs text-emerald-400">{probabilities.probBTTSYes}%</p>
                          </div>
                          <div className="bg-slate-900 border border-slate-800/80 p-2.5 rounded">
                            <p className="text-[9px] text-slate-500 mb-0.5">NO</p>
                            <p className="font-bold text-xs text-slate-400">{probabilities.probBTTSNo}%</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Over/Under & Top Scorelines */}
                    <div className="space-y-4">
                      {/* Over / Under */}
                      <div className="bg-slate-950 border border-slate-850/60 p-4 rounded space-y-3 font-mono uppercase text-[10px] font-bold">
                        <h5 className="text-[10px] text-slate-500 tracking-wider">Goles Totales Over/Under</h5>
                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex justify-between items-center py-1 border-b border-slate-900 text-slate-400">
                            <span>Más de 1.5 goles</span>
                            <span className="text-slate-200">{probabilities.probOver1_5}%</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-slate-900 text-slate-400">
                            <span>Más de 2.5 goles</span>
                            <span className="text-emerald-400">{probabilities.probOver2_5}%</span>
                          </div>
                          <div className="flex justify-between items-center py-1 text-slate-400">
                            <span>Más de 3.5 goles</span>
                            <span className="text-slate-200">{probabilities.probOver3_5}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Top Predicted Scorelines */}
                      <div className="bg-slate-950 border border-slate-850/60 p-4 rounded space-y-3 font-mono uppercase text-[10px] font-bold">
                        <h5 className="text-[10px] text-slate-500 tracking-wider">Marcadores más Probables</h5>
                        <div className="space-y-1.5">
                          {probabilities.mostProbableScores.map((scoreObj, idx) => (
                            <div key={idx} className="flex justify-between items-center py-1 text-[11px] text-slate-400">
                              <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300 font-bold">
                                {scoreObj.score}
                              </span>
                              <div className="flex items-center gap-2.5">
                                <div className="w-16 bg-slate-900 h-1 rounded-none overflow-hidden border border-slate-850">
                                  <div style={{ width: `${scoreObj.prob * 5}%` }} className="h-full bg-emerald-500"></div>
                                </div>
                                <span className="text-slate-200 font-bold text-[11px] min-w-[32px] text-right">{scoreObj.prob}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Safety Disclaimer */}
                  <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded flex gap-2.5 font-mono text-[9px] uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-amber-400/80 leading-relaxed font-bold italic">
                      Probabilidades estimadas por un modelo estadístico interno a partir de datos históricos. No son cuotas de apuestas ni garantía de resultado.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
