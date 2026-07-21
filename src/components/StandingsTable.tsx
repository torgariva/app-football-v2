import React from 'react';
import { StandingItem } from '../types';
import { Shield, TrendingUp, HelpCircle } from 'lucide-react';

interface StandingsTableProps {
  standings: StandingItem[];
  selectedTeamId: number | null;
  onSelectTeam: (teamId: number) => void;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({
  standings,
  selectedTeamId,
  onSelectTeam,
}) => {
  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 md:p-6 shadow-sm" id="standings-table">
      {/* Table Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 bg-emerald-500"></span>
          <h2 className="font-bold text-sm uppercase tracking-wider font-mono text-white">Clasificación de la Liga</h2>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Data
        </div>
      </div>

      {/* Responsive Table Wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[650px] text-[11px] font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
              <th className="py-2.5 px-2 text-center w-12">Pos</th>
              <th className="py-2.5 px-4 font-sans text-xs">Club</th>
              <th className="py-2.5 px-3 text-center w-12">PJ</th>
              <th className="py-2.5 px-3 text-center w-10">G</th>
              <th className="py-2.5 px-3 text-center w-10">E</th>
              <th className="py-2.5 px-3 text-center w-10">P</th>
              <th className="py-2.5 px-3 text-center w-14">GF</th>
              <th className="py-2.5 px-3 text-center w-14">GC</th>
              <th className="py-2.5 px-3 text-center w-14">DG</th>
              <th className="py-2.5 px-4 text-center w-16 text-emerald-400 font-bold">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {standings.map((item, idx) => {
              const isSelected = selectedTeamId === item.teamId;
              
              // Zone Highlights
              let zoneStyle = "border-l-2 border-l-transparent";
              if (item.position <= 4) {
                zoneStyle = "border-l-2 border-l-cyan-500 bg-cyan-500/5"; // Champions League Zone
              } else if (item.position === 5) {
                zoneStyle = "border-l-2 border-l-indigo-500 bg-indigo-500/5"; // Europa League Zone
              } else if (item.position >= standings.length - 2) {
                zoneStyle = "border-l-2 border-l-rose-500/80 bg-rose-500/5"; // Relegation Zone
              }

              return (
                <tr
                  key={item.teamId}
                  id={`standing-row-${item.teamId}`}
                  onClick={() => onSelectTeam(item.teamId)}
                  className={`group hover:bg-slate-800/30 cursor-pointer transition-colors duration-150 ${zoneStyle} ${
                    isSelected ? 'bg-emerald-500/5 font-bold text-emerald-400' : 'text-slate-300'
                  }`}
                >
                  {/* Position */}
                  <td className="py-3 px-2 text-center font-mono font-bold text-xs">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md ${
                      item.position <= 4 
                        ? 'bg-cyan-500/10 text-cyan-400' 
                        : item.position >= standings.length - 2
                        ? 'bg-rose-500/10 text-rose-400'
                        : 'bg-slate-950 text-slate-400'
                    }`}>
                      {item.position}
                    </span>
                  </td>

                  {/* Club details */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.teamCrest}
                        alt={item.teamName}
                        className="w-6 h-6 object-contain shrink-0"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.opacity = '0.5';
                        }}
                      />
                      <span className="font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors truncate">
                        {item.teamName}
                      </span>
                    </div>
                  </td>

                  {/* PJ */}
                  <td className="py-3 px-3 text-center font-mono font-medium text-slate-400">{item.playedGames}</td>

                  {/* G, E, P */}
                  <td className="py-3 px-3 text-center font-mono font-medium text-slate-300">{item.won}</td>
                  <td className="py-3 px-3 text-center font-mono font-medium text-slate-300">{item.draw}</td>
                  <td className="py-3 px-3 text-center font-mono font-medium text-slate-300">{item.lost}</td>

                  {/* Goals For, Against */}
                  <td className="py-3 px-3 text-center font-mono font-medium text-slate-400">{item.goalsFor}</td>
                  <td className="py-3 px-3 text-center font-mono font-medium text-slate-400">{item.goalsAgainst}</td>

                  {/* GD */}
                  <td className={`py-3 px-3 text-center font-mono font-semibold ${
                    item.goalDifference > 0 
                      ? 'text-emerald-500/85' 
                      : item.goalDifference < 0 
                      ? 'text-rose-500/85' 
                      : 'text-slate-500'
                  }`}>
                    {item.goalDifference > 0 ? `+${item.goalDifference}` : item.goalDifference}
                  </td>

                  {/* Points */}
                  <td className="py-3 px-4 text-center font-mono font-bold text-sm text-emerald-400">{item.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-slate-800/80 text-[10px] text-slate-500 font-bold uppercase tracking-wide font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-cyan-500"></span>
          Fase de grupos Champions League
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-indigo-500"></span>
          Fase de grupos Europa League
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-rose-500"></span>
          Descenso
        </span>
      </div>
    </div>
  );
};
