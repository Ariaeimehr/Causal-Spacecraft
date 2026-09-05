export interface TelemetryChannel {
  id: string;
  name: string;
  subsystem: 'EPS' | 'TCS' | 'ADCS' | 'PROP' | 'PAYLOAD' | 'COMM';
  unit: string;
  nominalMin: number;
  nominalMax: number;
  color: string;
  description: string;
}

export interface TelemetryDataPoint {
  t: number; // seconds
  values: Record<string, number>;
  anomalyScores: Record<string, number>;
  isAnomaly: boolean;
}

export interface CausalNode {
  id: string;
  label: string;
  subsystem: 'EPS' | 'TCS' | 'ADCS' | 'PROP' | 'PAYLOAD' | 'COMM';
  x: number;
  y: number;
  currentValue: number;
  unit: string;
  status: 'nominal' | 'affected' | 'root-cause';
  anomalySeverity: number;
}

export interface CausalEdge {
  source: string;
  target: string;
  weight: number;
  isCascading: boolean;
  pulsePhase?: number;
}

export interface CascadeStep {
  subsystem: string;
  channelId: string;
  onsetLagSeconds: number;
  description: string;
  causalCoupling: number;
  severityScore: number;
}

export interface AnomalyScenario {
  id: string;
  title: string;
  rootCauseSubsystem: string;
  rootCauseChannel: string;
  description: string;
  severity: 'CRITICAL' | 'WARNING' | 'NOMINAL';
  cascadeTimeline: CascadeStep[];
  startSec: number;
  durationSec: number;
}

export interface RepositoryFile {
  filename: string;
  language: 'python' | 'dockerfile' | 'yaml' | 'markdown' | 'text';
  category: 'Model' | 'Simulation' | 'Infrastructure' | 'Documentation';
  description: string;
  content: string;
}
