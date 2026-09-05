import React, { useState } from 'react';
import { TELEMETRY_CHANNELS } from '../data/simulationData';

interface AttentionHeatmapProps {
  rootCauseId: string | null;
  isAnomaly: boolean;
}

export const AttentionHeatmap: React.FC<AttentionHeatmapProps> = ({
  rootCauseId,
  isAnomaly,
}) => {
  const channels = TELEMETRY_CHANNELS.slice(0, 8); // 8x8 primary subsystems
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  // Generate synthetic attention matrix based on physical couplings and current anomaly
  const matrix = channels.map((target, rowIdx) => {
    return channels.map((source, colIdx) => {
      if (rowIdx === colIdx) return 0.05; // self-loop suppressed
      // Check physical pairs
      let weight = 0.08 + 0.05 * Math.sin(rowIdx * 3 + colIdx * 7);

      if (source.id === 'EPS_SolarVoltage' && target.id === 'EPS_BusVoltage') weight = isAnomaly ? 0.94 : 0.81;
      if (source.id === 'EPS_BusVoltage' && target.id === 'EPS_BatteryCurrent') weight = isAnomaly ? 0.89 : 0.76;
      if (source.id === 'EPS_BatteryCurrent' && target.id === 'TCS_BatteryPackTemp') weight = isAnomaly ? 0.84 : 0.62;
      if (source.id === 'EPS_BusVoltage' && target.id === 'ADCS_WheelSpeedX') weight = isAnomaly ? 0.77 : 0.45;
      if (source.id === 'ADCS_WheelSpeedX' && target.id === 'ADCS_BodyRateJitter') weight = isAnomaly ? 0.91 : 0.69;
      if (source.id === 'TCS_RadiatorTemp' && target.id === 'TCS_BatteryPackTemp') weight = 0.58;

      return Math.min(0.99, Math.max(0.02, weight));
    });
  });

  const getHeatmapColor = (val: number, isRootCoupling: boolean) => {
    if (isRootCoupling) return 'bg-red-500/90 text-white';
    if (val > 0.8) return 'bg-amber-500/80 text-white';
    if (val > 0.6) return 'bg-sky-500/70 text-slate-100';
    if (val > 0.4) return 'bg-sky-700/50 text-slate-300';
    if (val > 0.2) return 'bg-slate-800 text-slate-400';
    return 'bg-slate-900/60 text-slate-600';
  };

  return (
    <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">
            Learned Inter-Variable Causal Attention Matrix (A<sub>i ← j</sub>)
          </h3>
          <p className="text-[11px] text-slate-400">
            Directed dependency: Row = Target Subsystem (Victim), Column = Source Subsystem (Driver)
          </p>
        </div>
        <div className="text-[10px] text-slate-400 font-mono bg-slate-800/80 px-2 py-1 rounded">
          NOTEARS DAG Reg: <span className="text-emerald-400 font-bold">h(W) = 0.0024</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto flex-1 flex flex-col justify-center">
        <div className="inline-block min-w-full">
          {/* Column Headers (Sources) */}
          <div className="flex pl-24 mb-1">
            {channels.map((ch, cIdx) => (
              <div
                key={ch.id}
                className="w-10 text-[9px] text-center font-mono font-medium text-slate-400 truncate rotate-[-45deg] origin-bottom-left h-12"
                title={ch.name}
              >
                {ch.id.replace(/^[A-Z]+_/, '')}
              </div>
            ))}
          </div>

          {/* Matrix Rows */}
          <div className="space-y-1">
            {channels.map((targetCh, rIdx) => (
              <div key={targetCh.id} className="flex items-center">
                {/* Row Header (Target) */}
                <div
                  className="w-24 text-[10px] font-mono text-right pr-2 text-slate-300 truncate font-medium"
                  title={targetCh.name}
                >
                  {targetCh.id.replace(/^[A-Z]+_/, '')}
                </div>

                {/* Cells */}
                <div className="flex space-x-1">
                  {channels.map((sourceCh, cIdx) => {
                    const weight = matrix[rIdx][cIdx];
                    const isRoot = isAnomaly && sourceCh.id === rootCauseId && weight > 0.6;
                    const isHovered = hoveredCell?.row === rIdx && hoveredCell?.col === cIdx;

                    return (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        onMouseEnter={() => setHoveredCell({ row: rIdx, col: cIdx })}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`w-10 h-7 rounded text-[10px] font-mono font-semibold flex items-center justify-center transition-all cursor-pointer ${
                          getHeatmapColor(weight, isRoot)
                        } ${isHovered ? 'ring-2 ring-white scale-110 z-20' : ''}`}
                        title={`${sourceCh.name} → ${targetCh.name} coupling: ${weight.toFixed(3)}`}
                      >
                        {weight >= 0.1 ? weight.toFixed(2) : '-'}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Hover Detail Bar */}
      <div className="mt-3 pt-2 border-t border-slate-800 text-xs flex items-center justify-between min-h-[28px]">
        {hoveredCell ? (
          <div className="text-slate-300 flex items-center space-x-2">
            <span className="font-mono text-sky-400">
              {channels[hoveredCell.col].name}
            </span>
            <span className="text-slate-500">───[Causal Drive]───►</span>
            <span className="font-mono text-amber-300">
              {channels[hoveredCell.row].name}
            </span>
            <span className="font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded font-mono">
              Coupling: {matrix[hoveredCell.row][hoveredCell.col].toFixed(3)}
            </span>
          </div>
        ) : (
          <span className="text-slate-500 text-[11px]">
            Hover over matrix cells to inspect causal cross-attention weight and physical transmission path.
          </span>
        )}
      </div>
    </div>
  );
};
