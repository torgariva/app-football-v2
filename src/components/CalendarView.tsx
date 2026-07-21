import React, { useState } from 'react';
import { Match } from '../types';
import { Calendar, CheckCircle2, Clock, CalendarDays, Award } from 'lucide-react';

interface CalendarViewProps {
  matches: Match[];
  selectedTeamId: number | null;
  onSelectTeamId: (id: number | null) => void;
  onSelectMatch: (matchId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  matches,
  selectedTeamId,
  onSelectTeamId,
  onSelectMatch,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'FINISHED' | 'SCHEDULED'>('ALL');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('ALL');

  // Filter matches based on state
  let filteredMatches = matches;

  if (selectedTeamId !== null) {
    filteredMatches = filteredMatches.filter(
      (m) => m.homeTeamId === selectedTeamId || m.awayTeamId === selectedTeamId
    );
  }

  if (statusFilter !== 'ALL') {
    filteredMatches = filteredMatches.filter((m) => m.status === statusFilter);
  }

  // Extract unique match dates for date filter
  const uniqueDates: string[] = Array.from(
    new Set(matches.map((m) => m.date.substring(0, 10)))
  ).sort() as string[];

  if (selectedDateFilter !== 'ALL') {
    filteredMatches = filteredMatches.filter((m) => m.date.startsWith(selectedDateFilter));
  }

  // Group by date
  const groupedMatches: Record<string, Match[]> = {};
  filteredMatches.forEach((m) => {
    const dStr = m.date.substring(0, 10);
    if (!groupedMatches[dStr]) {
      groupedMatches[dStr] = [];
    }
    groupedMatches[dStr].push(m);
  });

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 md:p-6 shadow-sm" id="calendar-view">
      {/* Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 bg-emerald-500"></span>
          <h2 className="font-bold text-sm uppercase tracking-wider font-mono text-white">Calendario de Partidos</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter buttons */}
          <div className="inline-flex rounded bg-slate-950 p-1 border border-slate-850/80">
            {(['ALL', 'FINISHED', 'SCHEDULED'] as const).map((filter) => {
              const label = filter === 'ALL' ? 'Todos' : filter === 'FINISHED' ? 'Resultados' : 'Próximos';
              return (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1 rounded text-xs font-bold font-mono tracking-wide uppercase transition-all cursor-pointer ${
                    statusFilter === filter
                      ? 'bg-slate-900 text-emerald-400 border border-slate-800/80'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Quick Date Select */}
          <select
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value)}
            className="bg-slate-950 border border-slate-850/80 rounded text-[11px] font-bold font-mono uppercase tracking-wider px-3 py-1.5 text-slate-300 focus:outline-none focus:border-emerald-500/70"
          >
            <option value="ALL">TODAS LAS FECHAS</option>
            {uniqueDates.map((date) => (
              <option key={date} value={date}>
                {formatDateLabel(date).toUpperCase()}
              </option>
            ))}
          </select>

          {/* Reset team filter if selected */}
          {selectedTeamId !== null && (
            <button
              onClick={() => onSelectTeamId(null)}
              className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold px-3 py-1.5 rounded-lg border border-red-500/20 transition-all"
            >
              Quitar filtro equipo
            </button>
          )}
        </div>
      </div>

      {/* Match list */}
      {Object.keys(groupedMatches).length === 0 ? (
        <div className="text-center py-12 text-slate-500 font-medium">
          <CalendarDays className="w-10 h-10 mx-auto text-slate-700 mb-3" />
          No se encontraron partidos para los filtros seleccionados.
        </div>
      ) : (
        <div className="space-y-6" id="grouped-matches-container">
          {Object.keys(groupedMatches)
            .sort()
            .map((dateStr) => (
              <div key={dateStr} className="space-y-3">
                {/* Group Date Header */}
                <div className="flex items-center gap-2 pl-1">
                  <span className="w-1 h-3.5 bg-emerald-500"></span>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                    {formatDateLabel(dateStr)}
                  </h3>
                </div>

                {/* Match Cards */}
                <div className="grid grid-cols-1 gap-2.5">
                  {groupedMatches[dateStr].map((match) => {
                    const isFinished = match.status === 'FINISHED';
                    const hasWinner = isFinished && match.scoreHome !== null && match.scoreAway !== null;

                    return (
                      <div
                        key={match.id}
                        id={`match-card-${match.id}`}
                        onClick={() => onSelectMatch(match.id)}
                        className="group flex flex-col md:flex-row items-center justify-between p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-lg hover:border-emerald-500/40 hover:bg-slate-900/10 cursor-pointer transition-all duration-200"
                      >
                        {/* Time or Finished Icon */}
                        <div className="flex items-center gap-2 shrink-0 mb-3 md:mb-0">
                          {isFinished ? (
                            <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold bg-slate-900/60 border border-slate-800/60 text-slate-500 px-2 py-0.5 rounded font-mono">
                              Finalizado
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">
                              <Clock className="w-3 h-3" />
                              {formatTime(match.date)}
                            </span>
                          )}
                          <span className="text-[10px] uppercase font-mono font-bold text-slate-500">Jornada {match.matchday}</span>
                        </div>

                        {/* Match Teams & Score */}
                        <div className="flex items-center justify-center gap-4 w-full md:max-w-xl mx-auto py-1">
                          {/* Home Team */}
                          <div className="flex items-center justify-end gap-3 w-5/12 text-right">
                            <span className="font-bold text-xs text-slate-200 group-hover:text-emerald-400 transition-colors truncate">
                              {match.homeTeamName}
                            </span>
                            <img
                              src={match.homeTeamCrest}
                              alt={match.homeTeamName}
                              className="w-6 h-6 object-contain shrink-0"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                  (e.target as HTMLElement).style.opacity = '0.5';
                              }}
                            />
                          </div>

                          {/* Score Board */}
                          <div className="flex items-center justify-center bg-slate-900/80 border border-slate-800/60 px-3 py-1 rounded text-center font-mono min-w-[65px] shrink-0">
                            {isFinished ? (
                              <span className="text-slate-100 font-extrabold text-xs tracking-wider">
                                {match.scoreHome} - {match.scoreAway}
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[10px] font-bold tracking-widest">
                                VS
                              </span>
                            )}
                          </div>

                          {/* Away Team */}
                          <div className="flex items-center justify-start gap-3 w-5/12 text-left">
                            <img
                              src={match.awayTeamCrest}
                              alt={match.awayTeamName}
                              className="w-6 h-6 object-contain shrink-0"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLElement).style.opacity = '0.5';
                              }}
                            />
                            <span className="font-bold text-xs text-slate-200 group-hover:text-emerald-400 transition-colors truncate">
                              {match.awayTeamName}
                            </span>
                          </div>
                        </div>

                        {/* Quick internal probability badge for Scheduled Match */}
                        <div className="shrink-0 mt-3 md:mt-0 pt-2 border-t border-slate-900 md:border-0 w-full md:w-auto flex justify-center">
                          {!isFinished ? (
                            <span className="flex items-center gap-1 text-[10px] uppercase bg-emerald-500/5 text-emerald-400/80 px-2 py-1 rounded border border-emerald-500/10 font-mono font-bold tracking-wider">
                              <Award className="w-3 h-3 text-emerald-500 shrink-0" />
                              Probabilidades
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase font-mono font-bold text-slate-500 group-hover:text-slate-400 transition-colors">
                              Ficha Técnica
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
