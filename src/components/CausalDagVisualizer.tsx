import React, { useState } from 'react';
import { CausalEdge, CausalNode } from '../types';
import { AlertCircle, ArrowRight, ShieldCheck, Zap, Info } from 'lucide-react';

interface CausalDagVisualizerProps {
  nodes: CausalNode[];
  edges: CausalEdge[];
  rootCauseId: string | null;
  onSelectNode?: (nodeId: string) => void;
  selectedNodeId?: string | null;
}

export const CausalDagVisualizer: React.FC<CausalDagVisualizerProps> = ({
  nodes,
  edges,
  rootCauseId,
  onSelectNode,
  selectedNodeId,
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const activeNodeId = selectedNodeId || hoveredNode;
  const activeNode = nodes.find((n) => n.id === activeNodeId);

  // Calculate in-degree and out-degree causal impact
  const incomingEdges = activeNode ? edges.filter((e) => e.target === activeNode.id) : [];
  const outgoingEdges = activeNode ? edges.filter((e) => e.source === activeNode.id) : [];

  const getSubsystemBadgeColor = (sub: string) => {
    switch (sub) {
      case 'EPS':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'TCS':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'ADCS':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'PROP':
        return 'bg-violet-500/10 text-violet-400 border-violet-500/30';
      case 'PAYLOAD':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/30';
      case 'COMM':
        return 'bg-pink-500/10 text-pink-400 border-pink-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
          <h3 className="text-sm font-semibold text-slate-200">
            Discovered Dynamic Causal Directed Acyclic Graph (DAG)
          </h3>
        </div>
        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-red-400 font-medium">Root-Cause Originator</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-amber-300">Downstream Cascade</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-400">Nominal</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative flex-1 min-h-[360px] bg-slate-950/70 rounded-lg border border-slate-800/80 overflow-hidden flex items-center justify-center">
        {/* Background Grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #38bdf8 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        <svg
          viewBox="0 0 760 400"
          className="w-full h-full select-none"
          style={{ maxHeight: '420px' }}
        >
          <defs>
            {/* Arrowhead markers */}
            <marker
              id="arrow-nominal"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569" />
            </marker>
            <marker
              id="arrow-cascading"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
            </marker>
            <marker
              id="arrow-root"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
            </marker>

            {/* Filter for glowing node effects */}
            <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Render Causal Edges */}
          {edges.map((edge, idx) => {
            const source = nodes.find((n) => n.id === edge.source);
            const target = nodes.find((n) => n.id === edge.target);
            if (!source || !target) return null;

            const isRootEdge = source.id === rootCauseId;
            const strokeColor = isRootEdge
              ? '#ef4444'
              : edge.isCascading
              ? '#f59e0b'
              : '#334155';
            const strokeWidth = edge.isCascading ? 2.5 : Math.max(1.2, edge.weight * 2.0);
            const marker = isRootEdge
              ? 'url(#arrow-root)'
              : edge.isCascading
              ? 'url(#arrow-cascading)'
              : 'url(#arrow-nominal)';

            // Control points for smooth curved path
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const cx1 = source.x + dx * 0.5;
            const cy1 = source.y + dy * 0.1;
            const cx2 = source.x + dx * 0.5;
            const cy2 = target.y - dy * 0.1;

            const pathData = `M ${source.x} ${source.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${target.x} ${target.y}`;
            const midX = (source.x + target.x) / 2;
            const midY = (source.y + target.y) / 2 - 8;

            return (
              <g key={`edge-${idx}`}>
                {/* Main line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  markerEnd={marker}
                  className="transition-all duration-300"
                />

                {/* Animated pulse particles for active cascades */}
                {edge.isCascading && (
                  <path
                    d={pathData}
                    fill="none"
                    stroke={isRootEdge ? '#fca5a5' : '#fde68a'}
                    strokeWidth={strokeWidth + 1}
                    strokeDasharray="6 14"
                    className="animate-[dash_1.5s_linear_infinite]"
                    opacity="0.85"
                  />
                )}

                {/* Causal weight label badge */}
                {(edge.isCascading || edge.weight > 0.5) && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-16"
                      y="-8"
                      width="32"
                      height="16"
                      rx="4"
                      fill="#0f172a"
                      stroke={strokeColor}
                      strokeWidth="1"
                    />
                    <text
                      textAnchor="middle"
                      dy="3.5"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill={isRootEdge ? '#fca5a5' : edge.isCascading ? '#fcd34d' : '#94a3b8'}
                    >
                      {edge.weight.toFixed(2)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Render Causal Subsystem Nodes */}
          {nodes.map((node) => {
            const isRoot = node.id === rootCauseId;
            const isAffected = node.status === 'affected';
            const isSelected = activeNodeId === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer group"
                onClick={() => onSelectNode && onSelectNode(node.id)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Outer Glow / Halo */}
                {isRoot && (
                  <circle
                    r="34"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    className="animate-spin opacity-80"
                    style={{ animationDuration: '6s' }}
                  />
                )}

                {/* Base Node Circle */}
                <circle
                  r="26"
                  fill="#0b1329"
                  stroke={
                    isRoot
                      ? '#ef4444'
                      : isAffected
                      ? '#f59e0b'
                      : isSelected
                      ? '#38bdf8'
                      : '#1e293b'
                  }
                  strokeWidth={isRoot ? 3 : isAffected ? 2.5 : isSelected ? 2.5 : 1.5}
                  filter={isRoot ? 'url(#glow-red)' : isAffected ? 'url(#glow-amber)' : undefined}
                  className="transition-all duration-300"
                />

                {/* Subsystem Abbreviation Badge */}
                <text
                  textAnchor="middle"
                  dy="-8"
                  fontSize="8"
                  fontWeight="bold"
                  fill={
                    node.subsystem === 'EPS'
                      ? '#38bdf8'
                      : node.subsystem === 'TCS'
                      ? '#34d399'
                      : node.subsystem === 'ADCS'
                      ? '#fbbf24'
                      : node.subsystem === 'PROP'
                      ? '#a78bfa'
                      : node.subsystem === 'PAYLOAD'
                      ? '#2dd4bf'
                      : '#f472b6'
                  }
                >
                  {node.subsystem}
                </text>

                {/* Telemetry Metric Value */}
                <text
                  textAnchor="middle"
                  dy="4"
                  fontSize="9.5"
                  fontWeight="bold"
                  fontFamily="monospace"
                  fill={isRoot ? '#fca5a5' : isAffected ? '#fde68a' : '#f8fafc'}
                >
                  {typeof node.currentValue === 'number'
                    ? Math.abs(node.currentValue) >= 100
                      ? node.currentValue.toFixed(0)
                      : node.currentValue.toFixed(1)
                    : node.currentValue}
                </text>

                {/* Unit */}
                <text
                  textAnchor="middle"
                  dy="14"
                  fontSize="7.5"
                  fill="#64748b"
                >
                  {node.unit}
                </text>

                {/* Subsystem Label beneath */}
                <text
                  textAnchor="middle"
                  dy="38"
                  fontSize="9"
                  fontWeight="500"
                  fill={isRoot ? '#ef4444' : isAffected ? '#f59e0b' : '#94a3b8'}
                >
                  {node.label}
                </text>

                {/* Anomaly Badge if Root or Affected */}
                {isRoot && (
                  <g transform="translate(0, -32)">
                    <rect
                      x="-38"
                      y="-9"
                      width="76"
                      height="16"
                      rx="4"
                      fill="#ef4444"
                    />
                    <text
                      textAnchor="middle"
                      dy="2.5"
                      fontSize="8"
                      fontWeight="bold"
                      fill="#ffffff"
                    >
                      ROOT CAUSE
                    </text>
                  </g>
                )}
                {!isRoot && isAffected && (
                  <g transform="translate(0, -30)">
                    <rect
                      x="-32"
                      y="-8"
                      width="64"
                      height="15"
                      rx="4"
                      fill="#d97706"
                    />
                    <text
                      textAnchor="middle"
                      dy="2.5"
                      fontSize="7.5"
                      fontWeight="bold"
                      fill="#ffffff"
                    >
                      CASCADE
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Quick Inspector if node hovered/selected */}
        {activeNode && (
          <div className="absolute bottom-3 left-3 bg-slate-900/95 border border-slate-700/80 rounded-lg p-3 max-w-xs shadow-2xl backdrop-blur text-xs z-10 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-200">{activeNode.label}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] border ${getSubsystemBadgeColor(activeNode.subsystem)}`}>
                {activeNode.subsystem}
              </span>
            </div>
            <p className="text-slate-400 font-mono text-[11px] mb-2">
              ID: {activeNode.id}
            </p>
            <div className="grid grid-cols-2 gap-2 text-slate-300 border-t border-slate-800 pt-1.5">
              <div>
                <span className="text-slate-500 text-[10px] block">Current Value</span>
                <span className="font-mono font-bold text-sky-400">
                  {activeNode.currentValue.toFixed(2)} {activeNode.unit}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Anomaly Residual</span>
                <span className={`font-mono font-bold ${activeNode.anomalySeverity > 2.0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {activeNode.anomalySeverity.toFixed(2)} σ
                </span>
              </div>
            </div>

            {/* Causal couplings */}
            <div className="mt-2 pt-2 border-t border-slate-800 text-[10px]">
              <div className="flex items-center justify-between text-slate-400 mb-0.5">
                <span>Causal In-Degree: {incomingEdges.length}</span>
                <span>Causal Out-Degree: {outgoingEdges.length}</span>
              </div>
              {outgoingEdges.length > 0 && (
                <div className="text-amber-400/90 truncate">
                  → Drives: {outgoingEdges.map((e) => e.target.replace(/^[A-Z]+_/, '')).join(', ')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
