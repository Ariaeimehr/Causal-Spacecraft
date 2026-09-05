import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  AlertTriangle,
  CheckCircle2,
  Zap,
  ArrowRight,
  Flame,
  Clock,
  ShieldAlert,
  Terminal,
  Activity,
  Maximize2,
} from 'lucide-react';
import { AnomalyScenario, TelemetryDataPoint } from '../types';
import {
  SCENARIOS,
  TELEMETRY_CHANNELS,
  computeTelemetryFrame,
} from '../data/simulationData';
import { CausalDagVisualizer } from './CausalDagVisualizer';
import { AttentionHeatmap } from './AttentionHeatmap';

export const MissionControlView: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<AnomalyScenario>(SCENARIOS[0]);
  const [currentTime, setCurrentTime] = useState<number>(30); // start slightly before anomaly at 40s
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [history, setHistory] = useState<TelemetryDataPoint[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Re-initialize history on scenario switch
  useEffect(() => {
    const initHistory: TelemetryDataPoint[] = [];
    const startT = Math.max(0, currentTime - 45);
    for (let t = startT; t <= currentTime; t++) {
      const frame = computeTelemetryFrame(t, selectedScenario);
      initHistory.push({
        t,
        values: frame.values,
        anomalyScores: frame.anomalyScores,
        isAnomaly: frame.isAnomaly,
      });
    }
    setHistory(initHistory);
  }, [selectedScenario]);

  // Main playback timer tick
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.max(200, 1000 / playbackSpeed);
      timerRef.current = setInterval(() => {
        setCurrentTime((prevT) => {
          const nextT = prevT >= 120 ? 0 : prevT + 1;
          const frame = computeTelemetryFrame(nextT, selectedScenario);

          setHistory((prevH) => {
            const updated = [
              ...prevH,
              {
                t: nextT,
                values: frame.values,
                anomalyScores: frame.anomalyScores,
                isAnomaly: frame.isAnomaly,
              },
            ];
            // Keep window of last 50 seconds
            return updated.slice(-50);
          });

          return nextT;
        });
      }, intervalMs);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, selectedScenario]);

  const currentFrame = computeTelemetryFrame(currentTime, selectedScenario);

  const triggerManualFault = () => {
    setCurrentTime(selectedScenario.startSec);
    setIsPlaying(true);
  };

  const handleReset = () => {
    setCurrentTime(0);
    setHistory([]);
    setIsPlaying(true);
  };

  // SVG Multi-channel Oscilloscope calculation
  const primaryChannels = [
    'EPS_SolarVoltage',
    'EPS_BusVoltage',
    'EPS_BatteryCurrent',
    'TCS_BatteryPackTemp',
    'ADCS_WheelSpeedX',
    'ADCS_BodyRateJitter',
  ];

  const getChannelColor = (id: string) => {
    const ch = TELEMETRY_CHANNELS.find((c) => c.id === id);
    return ch ? ch.color : '#38bdf8';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Scenario Selector & Live Flight Control Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Scenario Picker */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                Mission Flight Scenario
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                (LEO Orbit: 90min / 500km Altitude)
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => {
                    setSelectedScenario(sc);
                    setCurrentTime(32);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-left flex items-center space-x-2 ${
                    selectedScenario.id === sc.id
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 shadow-sm'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      sc.severity === 'CRITICAL'
                        ? 'bg-red-500'
                        : sc.severity === 'WARNING'
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <span>{sc.title.split('→')[0].trim()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Transport Controls */}
          <div className="flex items-center space-x-3 bg-slate-950/80 border border-slate-800 p-2 rounded-xl">
            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 bg-sky-500 hover:bg-sky-400 text-white rounded-lg transition shadow-md shadow-sky-500/20"
              title={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
              title="Reset Timeline to t=0s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Speed Multipliers */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
              {[1, 2, 4].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2 py-1 rounded transition ${
                    playbackSpeed === speed
                      ? 'bg-sky-500 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Timeline Scrub */}
            <div className="flex items-center space-x-2 pl-2">
              <span className="text-xs font-mono text-slate-400 min-w-[54px]">
                t = {currentTime}s
              </span>
              <input
                type="range"
                min={0}
                max={120}
                value={currentTime}
                onChange={(e) => setCurrentTime(Number(e.target.value))}
                className="w-24 sm:w-32 accent-sky-400 cursor-pointer"
              />
            </div>

            {/* Anomaly Jump Button */}
            {selectedScenario.id !== 'nominal_leo_orbit' && (
              <button
                onClick={triggerManualFault}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-lg text-xs font-medium transition"
              >
                <Flame className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">Jump to Fault</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Left Column = Multi-Channel Oscilloscope & Attention Heatmap, Right Column = Causal DAG & RCA Diagnostic */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Oscilloscope + Heatmap */}
        <div className="lg:col-span-6 space-y-6 flex flex-col">
          {/* Multi-Channel Telemetry Oscilloscope */}
          <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 shadow-xl flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-semibold text-slate-200">
                  Real-Time Multi-Channel Telemetry Oscilloscope
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Window: 50s @ 1 Hz
              </span>
            </div>

            {/* Channel Legends */}
            <div className="flex flex-wrap gap-3 mb-2">
              {primaryChannels.map((chId) => {
                const ch = TELEMETRY_CHANNELS.find((c) => c.id === chId);
                const val = currentFrame.values[chId];
                return (
                  <div key={chId} className="flex items-center space-x-1.5 text-[11px]">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: ch?.color }}
                    />
                    <span className="text-slate-400 font-mono">
                      {chId.replace(/^[A-Z]+_/, '')}:
                    </span>
                    <span className="font-mono font-bold text-slate-200">
                      {val !== undefined ? val.toFixed(1) : '-'} {ch?.unit}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* SVG Waveform Chart */}
            <div className="relative h-48 bg-slate-950/90 rounded-lg border border-slate-800/80 p-2 overflow-hidden">
              {/* Fault onset reference line */}
              {selectedScenario.id !== 'nominal_leo_orbit' && (
                <div
                  className="absolute top-0 bottom-0 border-r-2 border-dashed border-red-500/60 z-10 pointer-events-none"
                  style={{
                    left: `${Math.min(
                      98,
                      Math.max(
                        2,
                        ((selectedScenario.startSec - (currentTime - 45)) / 45) * 100
                      )
                    )}%`,
                  }}
                >
                  <span className="bg-red-950 text-red-400 text-[9px] font-mono px-1 py-0.5 rounded border border-red-800/60 ml-1">
                    Fault Onset t={selectedScenario.startSec}s
                  </span>
                </div>
              )}

              {/* Threshold Warning Band */}
              <div className="absolute inset-x-0 top-3 h-6 bg-red-500/5 border-b border-red-500/20 pointer-events-none flex items-center px-2">
                <span className="text-[9px] font-mono text-red-400/80">
                  Residual Threshold Limit (γ = 2.2 σ)
                </span>
              </div>

              <svg viewBox="0 0 500 160" className="w-full h-full preserve-3d">
                {/* Horizontal Gridlines */}
                <line x1="0" y1="40" x2="500" y2="40" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="#1e293b" strokeDasharray="3 3" />

                {/* Render Normalized Curves */}
                {history.length > 2 &&
                  primaryChannels.map((chId) => {
                    const ch = TELEMETRY_CHANNELS.find((c) => c.id === chId);
                    if (!ch) return null;

                    const points = history.map((pt, idx) => {
                      const x = (idx / (history.length - 1)) * 500;
                      // Normalize between min and max range for clean visual oscilloscope display
                      const raw = pt.values[chId] || 0;
                      const span = ch.nominalMax - ch.nominalMin || 1;
                      const norm = (raw - ch.nominalMin) / span;
                      // Invert for SVG y-axis
                      const y = Math.max(5, Math.min(155, 140 - norm * 100));
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                    });

                    return (
                      <polyline
                        key={chId}
                        fill="none"
                        stroke={ch.color}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points.join(' ')}
                      />
                    );
                  })}
              </svg>
            </div>
          </div>

          {/* Attention Heatmap Component */}
          <AttentionHeatmap
            rootCauseId={currentFrame.rootCauseAttributed}
            isAnomaly={currentFrame.isAnomaly}
          />
        </div>

        {/* Right Column (6 Cols): Causal DAG + Flight Ops Root Cause Attribution Card */}
        <div className="lg:col-span-6 space-y-6 flex flex-col">
          {/* Causal DAG Visualizer */}
          <div className="flex-1">
            <CausalDagVisualizer
              nodes={currentFrame.nodes}
              edges={currentFrame.edges}
              rootCauseId={currentFrame.rootCauseAttributed}
              selectedNodeId={selectedNodeId}
              onSelectNode={(id) => setSelectedNodeId(id === selectedNodeId ? null : id)}
            />
          </div>

          {/* Flight Controller Root-Cause Attribution (RCA) Diagnostic Card */}
          <div
            className={`rounded-xl border p-4 shadow-xl transition-all ${
              currentFrame.isAnomaly
                ? 'bg-red-950/30 border-red-700/80 shadow-red-950/20'
                : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            {/* Header Status */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                {currentFrame.isAnomaly ? (
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <span>
                      {currentFrame.isAnomaly
                        ? 'Cascading Anomaly Isolated: RCA Active'
                        : 'Spacecraft Systems Nominal'}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    {currentFrame.isAnomaly
                      ? 'Out-degree causal gradient has localized origin failure'
                      : 'All telemetry channels within statistical 3σ boundaries'}
                  </p>
                </div>
              </div>

              {currentFrame.isAnomaly && (
                <div className="text-right">
                  <span className="text-[10px] text-red-400 font-mono block">
                    Causal Confidence
                  </span>
                  <span className="text-sm font-extrabold text-red-400 font-mono">
                    94.8%
                  </span>
                </div>
              )}
            </div>

            {/* Diagnostic Details if Anomaly */}
            {currentFrame.isAnomaly ? (
              <div className="mt-3 space-y-3">
                {/* Root Cause Card */}
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-red-300 font-semibold flex items-center space-x-1.5">
                      <ShieldAlert className="w-4 h-4 text-red-400" />
                      <span>Originating Root-Cause Subsystem:</span>
                    </span>
                    <span className="font-mono text-red-200 bg-red-950 px-2 py-0.5 rounded border border-red-800">
                      {selectedScenario.rootCauseSubsystem}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 font-mono">
                    Primary Trigger Channel:{' '}
                    <strong className="text-white">
                      {selectedScenario.rootCauseChannel}
                    </strong>{' '}
                    at t={selectedScenario.startSec}s
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {selectedScenario.description}
                  </p>
                </div>

                {/* Cascade Sequence Timeline */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span className="font-semibold text-slate-300 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                      <span>Physical Propagation Chain (Causal Cascade):</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Inference Latency: 8.4 ms
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {selectedScenario.cascadeTimeline.map((step, sIdx) => {
                      const isActive =
                        currentTime >= selectedScenario.startSec + step.onsetLagSeconds;
                      return (
                        <div
                          key={sIdx}
                          className={`p-2 rounded-lg text-xs border transition-all flex items-center justify-between ${
                            isActive
                              ? sIdx === 0
                                ? 'bg-red-950/40 border-red-800 text-red-200'
                                : 'bg-amber-950/30 border-amber-800/80 text-amber-200'
                              : 'bg-slate-900/40 border-slate-800 text-slate-500'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-[11px] w-10">
                              +{step.onsetLagSeconds}s
                            </span>
                            <div>
                              <span className="font-semibold">{step.subsystem}: </span>
                              <span className="text-[11px] text-slate-300">
                                {step.description}
                              </span>
                            </div>
                          </div>
                          <div className="text-right pl-2 font-mono text-[10px]">
                            <span className="text-slate-400 block">
                              Coupling: {step.causalCoupling.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Automated Flight Command Recommendation */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 flex items-start space-x-2 text-xs">
                  <Terminal className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-0.5">
                    <span className="font-semibold text-emerald-400 block">
                      Recommended Ground Control Remediation:
                    </span>
                    <p className="text-slate-300 font-mono text-[11px]">
                      {selectedScenario.id === 'solar_shunt_cascade' &&
                        'CMD_EPS_ISOLATE_SSU_STRING_4 --bypass-regulated-bus; CMD_ADCS_HOLD_MAG_TORQUE --shed-reaction-wheels'}
                      {selectedScenario.id === 'cryo_radiator_degradation' &&
                        'CMD_TCS_DEPLOY_BACKUP_LOUVER_B; CMD_PAYLOAD_STANDBY_CRYO; CMD_PROP_ISOLATE_VENT_VALVE_3'}
                      {selectedScenario.id === 'reaction_wheel_bearing_friction' &&
                        'CMD_ADCS_DEACTIVATE_WHEEL_X; CMD_ADCS_TRANSFER_MOMENTUM_WHEEL_Y_Z; CMD_COMM_RF_ANTENNA_SLEW_SAFE'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-500 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
                <p>Spacecraft operating within normal orbital flight envelopes.</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Select a cascading anomaly scenario above or press "Jump to Fault" to observe dynamic Causal Graph extraction.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
