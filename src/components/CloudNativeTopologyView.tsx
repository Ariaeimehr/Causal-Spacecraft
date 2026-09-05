import React, { useState } from 'react';
import {
  Cpu,
  Server,
  Layers,
  Activity,
  Send,
  CheckCircle2,
  RefreshCw,
  Zap,
  Radio,
  Sliders,
  Terminal,
  ShieldCheck,
  BarChart3,
} from 'lucide-react';

export const CloudNativeTopologyView: React.FC = () => {
  // Interactive HPA packet load slider
  const [telemetryLoad, setTelemetryLoad] = useState<number>(1800); // packets/sec
  const [isSendingRequest, setIsSendingRequest] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<any | null>({
    is_anomaly: true,
    max_anomaly_score: 8.84,
    root_cause_subsystem: 'EPS_SolarVoltage',
    root_cause_confidence: 0.948,
    downstream_cascade: [
      { subsystem: 'EPS_BusVoltage', onset_lag_steps: 6, causal_coupling: 0.89, anomaly_severity: 8.6 },
      { subsystem: 'EPS_BatteryCurrent', onset_lag_steps: 10, causal_coupling: 0.85, anomaly_severity: 8.2 },
      { subsystem: 'TCS_BatteryPackTemp', onset_lag_steps: 22, causal_coupling: 0.78, anomaly_severity: 7.9 },
      { subsystem: 'ADCS_WheelSpeedX', onset_lag_steps: 38, causal_coupling: 0.74, anomaly_severity: 7.5 },
      { subsystem: 'ADCS_BodyRateJitter', onset_lag_steps: 48, causal_coupling: 0.71, anomaly_severity: 8.9 },
    ],
    causal_edges: [
      { source: 'EPS_SolarVoltage', target: 'EPS_BusVoltage', weight: 0.94 },
      { source: 'EPS_BusVoltage', target: 'EPS_BatteryCurrent', weight: 0.89 },
      { source: 'EPS_BatteryCurrent', target: 'TCS_BatteryPackTemp', weight: 0.84 },
      { source: 'EPS_BusVoltage', target: 'ADCS_WheelSpeedX', weight: 0.77 },
      { source: 'ADCS_WheelSpeedX', target: 'ADCS_BodyRateJitter', weight: 0.91 },
    ],
    processing_latency_ms: 7.82,
    cluster_node: 'node-us-central1-c-aerospace-908',
  });

  // Calculate simulated HPA replicas based on telemetry packets per second
  const cpuUtilization = Math.min(95, Math.round((telemetryLoad / 2200) * 65));
  const activeReplicas = Math.min(16, Math.max(3, Math.ceil(telemetryLoad / 1200)));

  const handleSendTestPayload = () => {
    setIsSendingRequest(true);
    setTimeout(() => {
      setIsSendingRequest(false);
      setApiResponse({
        is_anomaly: true,
        max_anomaly_score: 8.92,
        root_cause_subsystem: 'EPS_SolarVoltage',
        root_cause_confidence: 0.952,
        downstream_cascade: [
          { subsystem: 'EPS_BusVoltage', onset_lag_steps: 6, causal_coupling: 0.91, anomaly_severity: 8.7 },
          { subsystem: 'EPS_BatteryCurrent', onset_lag_steps: 11, causal_coupling: 0.86, anomaly_severity: 8.3 },
          { subsystem: 'TCS_BatteryPackTemp', onset_lag_steps: 24, causal_coupling: 0.79, anomaly_severity: 7.8 },
          { subsystem: 'ADCS_WheelSpeedX', onset_lag_steps: 39, causal_coupling: 0.75, anomaly_severity: 7.6 },
          { subsystem: 'ADCS_BodyRateJitter', onset_lag_steps: 49, causal_coupling: 0.72, anomaly_severity: 9.0 },
        ],
        causal_edges: [
          { source: 'EPS_SolarVoltage', target: 'EPS_BusVoltage', weight: 0.95 },
          { source: 'EPS_BusVoltage', target: 'EPS_BatteryCurrent', weight: 0.91 },
          { source: 'EPS_BatteryCurrent', target: 'TCS_BatteryPackTemp', weight: 0.86 },
          { source: 'EPS_BusVoltage', target: 'ADCS_WheelSpeedX', weight: 0.79 },
          { source: 'ADCS_WheelSpeedX', target: 'ADCS_BodyRateJitter', weight: 0.93 },
        ],
        processing_latency_ms: (6.5 + Math.random() * 2.5).toFixed(2),
        cluster_node: `node-us-central1-c-aerospace-${Math.floor(100 + Math.random() * 900)}`,
      });
    }, 450);
  };

  return (
    <div className="space-y-6">
      {/* Top Architecture Overview Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Cpu className="w-5 h-5 text-sky-400" />
              <h2 className="text-base font-bold text-white">
                Cloud-Native Ground Station Inference Topology
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Kubernetes v1.29+
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Scalable ground-segment streaming pipeline: S-Band Telemetry Ingestion → Distributed Kafka Topic
              → Autoscaling Causal Transformer Pods (HPA) → Real-Time Causal DAG Isolation & Prometheus Monitoring.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono">
            <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg">
              <span className="text-slate-500 block text-[10px]">Active HPA Replicas</span>
              <span className="text-sky-400 font-bold text-sm">{activeReplicas} / 16 Pods</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg">
              <span className="text-slate-500 block text-[10px]">p99 Inference Latency</span>
              <span className="text-emerald-400 font-bold text-sm">7.82 ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Visual Topology Flow */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <span>Ground Data System (GDS) End-to-End Pipeline</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Stage 1 */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
            <div className="w-1.5 h-full bg-sky-500 absolute left-0 top-0" />
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  STAGE 1: DOWNLINK
                </span>
                <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Ground Station Antennas</h4>
              <p className="text-[11px] text-slate-400">
                S-Band RF receiver tracking LEO satellite pass. Demodulates CCSDS telemetry packets.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-900 text-[10px] font-mono text-slate-500">
              Throughput: {telemetryLoad} pkts/sec
            </div>
          </div>

          {/* Stage 2 */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
            <div className="w-1.5 h-full bg-indigo-500 absolute left-0 top-0" />
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  STAGE 2: STREAM BUFFER
                </span>
                <Server className="w-4 h-4 text-indigo-400" />
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Apache Kafka Ingestion</h4>
              <p className="text-[11px] text-slate-400">
                Topic: <code className="text-sky-300">spacecraft.flight-ops.raw-telemetry</code>. Partitioned across 8 brokers.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-900 text-[10px] font-mono text-slate-500">
              Lag: 0.2ms | 0 packet loss
            </div>
          </div>

          {/* Stage 3 */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
            <div className="w-1.5 h-full bg-emerald-500 absolute left-0 top-0" />
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  STAGE 3: INFERENCE
                </span>
                <Cpu className="w-4 h-4 text-emerald-400" />
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Causal Transformer Engine</h4>
              <p className="text-[11px] text-slate-400">
                Kubernetes Pods running PyTorch ST-CT with NOTEARS continuous DAG regularizer.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-900 text-[10px] font-mono text-emerald-400">
              {activeReplicas} Replicas Active (HPA)
            </div>
          </div>

          {/* Stage 4 */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
            <div className="w-1.5 h-full bg-amber-500 absolute left-0 top-0" />
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  STAGE 4: FLIGHT OPS
                </span>
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              </div>
              <h4 className="text-xs font-bold text-white mb-1">RCA & Safe-Hold Trigger</h4>
              <p className="text-[11px] text-slate-400">
                Alerts flight controllers with root-cause attribution & triggers automated ground safe commands.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-900 text-[10px] font-mono text-slate-500">
              MTTRC: &lt; 12.5 ms
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Left = HPA Autoscaler Simulator, Right = Live REST API Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (6 cols): Horizontal Pod Autoscaler Interactive Test */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-semibold text-slate-200">
                  HPA (Horizontal Pod Autoscaler) Stress Simulator
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Target CPU: 70%
              </span>
            </div>

            {/* Slider Control */}
            <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 mb-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-400">Simulated Ground Ingestion Throughput:</span>
                <span className="font-mono font-bold text-sky-400 text-sm">
                  {telemetryLoad.toLocaleString()} packets / sec
                </span>
              </div>
              <input
                type="range"
                min={400}
                max={10000}
                step={200}
                value={telemetryLoad}
                onChange={(e) => setTelemetryLoad(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-600 font-mono mt-1">
                <span>Single Pass (500 pkts/s)</span>
                <span>Constellation Peak (10,000 pkts/s)</span>
              </div>
            </div>

            {/* Simulated Pods Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Kubernetes Namespace: aerospace-ground-segment</span>
                <span className="text-emerald-400">{activeReplicas} / 16 Pods Running</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Array.from({ length: activeReplicas }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex items-center space-x-2 transition-all animate-in fade-in"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <div className="truncate">
                      <div className="text-[11px] font-mono text-slate-300 truncate">
                        pod-causal-{idx + 1}
                      </div>
                      <div className="text-[9px] font-mono text-slate-500">
                        CPU: {Math.min(92, Math.round(cpuUtilization + (idx % 3) * 4))}% | 2.1Gi
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>HPA Scaling Policy: RollingUpdate (maxSurge: 1, maxUnavailable: 0)</span>
              <span className="text-sky-400 font-mono">PDB: MinAvailable = 2</span>
            </div>
          </div>
        </div>

        {/* Right (6 cols): Live REST Inference API Tester */}
        <div className="lg:col-span-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col h-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-slate-200">
                  Live REST API Inference Sandbox
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                POST /v1/telemetry/infer
              </span>
            </div>

            {/* Test Payload Bar */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 mb-3 text-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="font-mono text-sky-400">Request: Telemetry Window (10 Channels × 64 Timesteps)</span>
                <span className="text-[10px] text-slate-500">Format: JSON</span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono truncate">
                {"{ \"timestamp\": 1714589200.0, \"telemetry_window\": [[50.0, 8.5, 28.0, ...]] }"}
              </p>
            </div>

            {/* Send Request Button */}
            <button
              onClick={handleSendTestPayload}
              disabled={isSendingRequest}
              className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 text-white rounded-lg py-2 text-xs font-semibold flex items-center justify-center space-x-2 transition mb-4 shadow-md shadow-sky-600/20"
            >
              {isSendingRequest ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Computing Spatio-Temporal Causal Attention...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Telemetry Frame to Inference Engine</span>
                </>
              )}
            </button>

            {/* JSON Response Display */}
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[11px] overflow-auto max-h-72">
              <div className="flex items-center justify-between text-[10px] text-slate-500 pb-1 mb-2 border-b border-slate-900">
                <span>Response: HTTP 200 OK</span>
                <span className="text-emerald-400 font-bold">
                  Latency: {apiResponse?.processing_latency_ms || 7.8} ms
                </span>
              </div>
              <pre className="text-slate-300 whitespace-pre leading-relaxed">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
