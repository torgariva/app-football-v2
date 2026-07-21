import React from 'react';
import { League } from '../types';

interface LeagueSelectorProps {
  leagues: League[];
  selectedLeagueId: string;
  onSelectLeague: (id: string) => void;
}

export const LeagueSelector: React.FC<LeagueSelectorProps> = ({
  leagues,
  selectedLeagueId,
  onSelectLeague,
}) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3" id="league-selector-grid">
        {leagues.map((league) => {
          const isSelected = league.id === selectedLeagueId;
          return (
            <button
              key={league.id}
              id={`league-btn-${league.id}`}
              onClick={() => onSelectLeague(league.id)}
              className={`flex items-center justify-between p-3.5 rounded-lg border text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-slate-900/90 border-emerald-500/70 text-emerald-400 shadow-[0_0_15px_-3px_rgba(16,185,129,0.15)]'
                  : 'bg-slate-900/30 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <div className="w-8 h-8 rounded bg-slate-950 border border-slate-850/60 flex items-center justify-center p-1.5 overflow-hidden shrink-0">
                  <img
                    src={league.emblem}
                    alt={league.name}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="truncate">
                  <p className="font-bold text-xs uppercase tracking-tight leading-tight font-mono">{league.name}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 font-mono">{league.country}</p>
                </div>
              </div>
              {isSelected && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 ml-2 animate-pulse"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
