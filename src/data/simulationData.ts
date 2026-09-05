import { AnomalyScenario, CascadeStep, CausalEdge, CausalNode, TelemetryChannel } from '../types';

export const TELEMETRY_CHANNELS: TelemetryChannel[] = [
  {
    id: 'EPS_SolarVoltage',
    name: 'Solar Array Voltage',
    subsystem: 'EPS',
    unit: 'V',
    nominalMin: 45.0,
    nominalMax: 54.0,
    color: '#38bdf8', // sky-400
    description: 'Direct output voltage from photovoltaic solar arrays',
  },
  {
    id: 'EPS_BatteryCurrent',
    name: 'Battery Charge/Discharge',
    subsystem: 'EPS',
    unit: 'A',
    nominalMin: -18.0,
    nominalMax: 15.0,
    color: '#60a5fa', // blue-400
    description: 'Net current into (+charge) or out of (-discharge) Li-Ion battery banks',
  },
  {
    id: 'EPS_BusVoltage',
    name: 'Regulated Main Bus',
    subsystem: 'EPS',
    unit: 'V',
    nominalMin: 27.6,
    nominalMax: 28.4,
    color: '#818cf8', // indigo-400
    description: 'Precision regulated 28V spacecraft power distribution bus',
  },
  {
    id: 'TCS_RadiatorTemp',
    name: 'Thermal Radiator Plate',
    subsystem: 'TCS',
    unit: '°C',
    nominalMin: -25.0,
    nominalMax: 45.0,
    color: '#34d399', // emerald-400
    description: 'External space-facing thermal dissipation radiator louver temperature',
  },
  {
    id: 'TCS_BatteryPackTemp',
    name: 'Battery Core Temp',
    subsystem: 'TCS',
    unit: '°C',
    nominalMin: 16.0,
    nominalMax: 28.0,
    color: '#4ade80', // green-400
    description: 'Core internal cell temperature of main electrical storage pack',
  },
  {
    id: 'ADCS_WheelSpeedX',
    name: 'Reaction Wheel Flywheel',
    subsystem: 'ADCS',
    unit: 'RPM',
    nominalMin: 1800.0,
    nominalMax: 4200.0,
    color: '#fbbf24', // amber-400
    description: 'Primary momentum wheel spin rate for 3-axis attitude stabilization',
  },
  {
    id: 'ADCS_BodyRateJitter',
    name: 'Spacecraft Angular Jitter',
    subsystem: 'ADCS',
    unit: '°/s',
    nominalMin: 0.002,
    nominalMax: 0.025,
    color: '#f87171', // red-400
    description: 'High-frequency micro-vibration gyroscope rate jitter',
  },
  {
    id: 'PROP_ManifoldPressure',
    name: 'Propellant Manifold',
    subsystem: 'PROP',
    unit: 'bar',
    nominalMin: 18.5,
    nominalMax: 21.5,
    color: '#a78bfa', // violet-400
    description: 'Cold-gas / monopropellant reaction control manifold line pressure',
  },
  {
    id: 'PAYLOAD_OpticalIRTemp',
    name: 'Cryo Focal Plane',
    subsystem: 'PAYLOAD',
    unit: 'K',
    nominalMin: 93.5,
    nominalMax: 96.5,
    color: '#2dd4bf', // teal-400
    description: 'Active Stirling cryo-cooled optical detector array temperature',
  },
  {
    id: 'COMM_TransceiverPower',
    name: 'S-Band Downlink RF',
    subsystem: 'COMM',
    unit: 'dBm',
    nominalMin: 32.2,
    nominalMax: 33.8,
    color: '#f472b6', // pink-400
    description: 'High-gain directional RF antenna transmitter power output',
  },
];

export const INITIAL_CAUSAL_NODES: CausalNode[] = [
  { id: 'EPS_SolarVoltage', label: 'Solar Voltage', subsystem: 'EPS', x: 80, y: 120, currentValue: 50.4, unit: 'V', status: 'nominal', anomalySeverity: 0.1 },
  { id: 'EPS_BusVoltage', label: 'Main Bus 28V', subsystem: 'EPS', x: 220, y: 160, currentValue: 28.0, unit: 'V', status: 'nominal', anomalySeverity: 0.1 },
  { id: 'EPS_BatteryCurrent', label: 'Battery Current', subsystem: 'EPS', x: 220, y: 280, currentValue: 8.2, unit: 'A', status: 'nominal', anomalySeverity: 0.1 },
  { id: 'TCS_BatteryPackTemp', label: 'Battery Temp', subsystem: 'TCS', x: 380, y: 310, currentValue: 21.4, unit: '°C', status: 'nominal', anomalySeverity: 0.1 },
  { id: 'TCS_RadiatorTemp', label: 'Radiator Louver', subsystem: 'TCS', x: 340, y: 80, currentValue: 18.5, unit: '°C', status: 'nominal', anomalySeverity: 0.1 },
  { id: 'PAYLOAD_OpticalIRTemp', label: 'Cryo Focal Array', subsystem: 'PAYLOAD', x: 500, y: 90, currentValue: 94.8, unit: 'K', status: 'nominal', anomalySeverity: 0.1 },
  { id: 'ADCS_WheelSpeedX', label: 'Reaction Wheel', subsystem: 'ADCS', x: 420, y: 210, currentValue: 3240, unit: 'RPM', status: 'nominal', anomalySeverity: 0.1 },
  { id: 'ADCS_BodyRateJitter', label: 'Attitude Jitter', subsystem: 'ADCS', x: 580, y: 230, currentValue: 0.009, unit: '°/s', status: 'nominal', anomalySeverity: 0.1 },
  { id: 'PROP_ManifoldPressure', label: 'Propellant Line', subsystem: 'PROP', x: 490, y: 330, currentValue: 19.8, unit: 'bar', status: 'nominal', anomalySeverity: 0.1 },
  { id: 'COMM_TransceiverPower', label: 'RF Transceiver', subsystem: 'COMM', x: 670, y: 310, currentValue: 33.1, unit: 'dBm', status: 'nominal', anomalySeverity: 0.1 },
];

export const SCENARIOS: AnomalyScenario[] = [
  {
    id: 'solar_shunt_cascade',
    title: 'Solar Shunt MOSFET Short → Bus Collapse → Reaction Wheel Safe-Hold',
    rootCauseSubsystem: 'EPS (Electrical Power Subsystem)',
    rootCauseChannel: 'EPS_SolarVoltage',
    description: 'Cascading failure where a solar array sequential shunt breakdown collapses the 28V bus, forcing battery thermal runaway and reaction wheel power throttling, culminating in loss of attitude stabilization.',
    severity: 'CRITICAL',
    startSec: 40,
    durationSec: 80,
    cascadeTimeline: [
      {
        subsystem: 'EPS (Solar Array)',
        channelId: 'EPS_SolarVoltage',
        onsetLagSeconds: 0,
        description: 'SSU Mosfet short-circuit: Solar voltage drops immediately from 51V to 14V.',
        causalCoupling: 0.94,
        severityScore: 9.8,
      },
      {
        subsystem: 'EPS (Power Bus)',
        channelId: 'EPS_BusVoltage',
        onsetLagSeconds: 6,
        description: 'Main 28V bus sags to 23.4V due to power supply shortfall.',
        causalCoupling: 0.89,
        severityScore: 8.6,
      },
      {
        subsystem: 'EPS (Battery Bank)',
        channelId: 'EPS_BatteryCurrent',
        onsetLagSeconds: 10,
        description: 'Battery discharge spikes to -36A dumping reserve power into bus.',
        causalCoupling: 0.85,
        severityScore: 8.2,
      },
      {
        subsystem: 'TCS (Thermal Core)',
        channelId: 'TCS_BatteryPackTemp',
        onsetLagSeconds: 22,
        description: 'Ohmic I²R heating drives battery pack temperature to 44.5°C.',
        causalCoupling: 0.78,
        severityScore: 7.9,
      },
      {
        subsystem: 'ADCS (Momentum Control)',
        channelId: 'ADCS_WheelSpeedX',
        onsetLagSeconds: 38,
        description: 'Spacecraft power manager sheds load: Reaction Wheel throttled from 3200 RPM to 600 RPM.',
        causalCoupling: 0.74,
        severityScore: 7.5,
      },
      {
        subsystem: 'ADCS (Attitude Stability)',
        channelId: 'ADCS_BodyRateJitter',
        onsetLagSeconds: 48,
        description: 'Loss of momentum authority results in angular jitter spike (0.18°/s).',
        causalCoupling: 0.71,
        severityScore: 8.9,
      },
    ],
  },
  {
    id: 'cryo_radiator_degradation',
    title: 'Radiator Micro-Meteorite Impact → Cryo Warming → Thruster Leak',
    rootCauseSubsystem: 'TCS (Thermal Control Subsystem)',
    rootCauseChannel: 'TCS_RadiatorTemp',
    description: 'Hypervelocity particle impact damages heat-pipe radiator louvers, raising focal plane detector temperature and causing uncommanded propellant boiloff venting.',
    severity: 'WARNING',
    startSec: 40,
    durationSec: 80,
    cascadeTimeline: [
      {
        subsystem: 'TCS (Radiator Louvers)',
        channelId: 'TCS_RadiatorTemp',
        onsetLagSeconds: 0,
        description: 'Cooling fluid rupture: Radiator plate temperature spikes +35°C.',
        causalCoupling: 0.91,
        severityScore: 9.1,
      },
      {
        subsystem: 'PAYLOAD (Optical Cryo)',
        channelId: 'PAYLOAD_OpticalIRTemp',
        onsetLagSeconds: 12,
        description: 'Heat rejection shortfall drives optical focal plane from 95K to 114K.',
        causalCoupling: 0.86,
        severityScore: 8.4,
      },
      {
        subsystem: 'PROP (Reaction Manifold)',
        channelId: 'PROP_ManifoldPressure',
        onsetLagSeconds: 24,
        description: 'Thermal relief valve actuates; manifold pressure drops 4.2 bar.',
        causalCoupling: 0.79,
        severityScore: 7.2,
      },
      {
        subsystem: 'ADCS (Rate Gyros)',
        channelId: 'ADCS_BodyRateJitter',
        onsetLagSeconds: 32,
        description: 'Asymmetric venting creates angular disturbance torque and jitter.',
        causalCoupling: 0.68,
        severityScore: 6.8,
      },
    ],
  },
  {
    id: 'reaction_wheel_bearing_friction',
    title: 'Reaction Wheel Bearing Friction Lock → Jitter → RF Pointing Loss',
    rootCauseSubsystem: 'ADCS (Attitude Determination & Control Subsystem)',
    rootCauseChannel: 'ADCS_WheelSpeedX',
    description: 'Flywheel mechanical bearing wear induces severe micro-vibration, degrading high-gain antenna tracking pointing accuracy and corrupting downlink SNR.',
    severity: 'WARNING',
    startSec: 40,
    durationSec: 80,
    cascadeTimeline: [
      {
        subsystem: 'ADCS (Reaction Flywheel)',
        channelId: 'ADCS_WheelSpeedX',
        onsetLagSeconds: 0,
        description: 'Bearing friction lockup causes sudden motor speed deceleration and torque ripple.',
        causalCoupling: 0.93,
        severityScore: 9.4,
      },
      {
        subsystem: 'ADCS (Body Rate)',
        channelId: 'ADCS_BodyRateJitter',
        onsetLagSeconds: 8,
        description: 'Bearing chatter transmits high-frequency structural vibration (0.21°/s).',
        causalCoupling: 0.88,
        severityScore: 8.7,
      },
      {
        subsystem: 'COMM (Downlink Antenna)',
        channelId: 'COMM_TransceiverPower',
        onsetLagSeconds: 18,
        description: 'Fine pointing error degrades ground station RF link margin by -8.5 dBm.',
        causalCoupling: 0.77,
        severityScore: 7.9,
      },
    ],
  },
  {
    id: 'nominal_leo_orbit',
    title: 'Nominal LEO Orbit (Sunlight / Eclipse Day-Night Cycle)',
    rootCauseSubsystem: 'None (All subsystems nominal)',
    rootCauseChannel: 'None',
    description: 'Baseline 90-minute Low-Earth-Orbit flight telemetry with natural solar eclipse transitions and normal thermal oscillations. No cascading anomalies.',
    severity: 'NOMINAL',
    startSec: 9999,
    durationSec: 0,
    cascadeTimeline: [],
  },
];

export function computeTelemetryFrame(
  t: number,
  scenario: AnomalyScenario
): {
  values: Record<string, number>;
  anomalyScores: Record<string, number>;
  nodes: CausalNode[];
  edges: CausalEdge[];
  isAnomaly: boolean;
  rootCauseAttributed: string | null;
  cascadeStepActive: CascadeStep[];
} {
  // Base orbital cycle: period of 120s in the simulator for rapid evaluation
  const orbitPeriod = 120.0;
  const phase = (2 * Math.PI * (t % orbitPeriod)) / orbitPeriod;
  const inSunlight = Math.sin(phase) > -0.2 ? 1 : 0;

  // Gaussian-like pseudo-random noise seeded by timestamp
  const noise = (chIdx: number, scale: number = 1.0) => {
    const s = Math.sin(t * 12.9898 + chIdx * 78.233);
    return (s - Math.floor(s) - 0.5) * 2.0 * scale;
  };

  const values: Record<string, number> = {
    EPS_SolarVoltage: inSunlight ? 50.5 + 0.8 * Math.cos(phase) + noise(1, 0.3) : noise(1, 0.1),
    EPS_BatteryCurrent: inSunlight ? 8.5 + 1.8 * Math.sin(phase) + noise(2, 0.25) : -13.5 - 2.0 * Math.cos(phase) + noise(2, 0.3),
    EPS_BusVoltage: 28.0 + (inSunlight ? 0 : -0.2) + noise(3, 0.04),
    TCS_RadiatorTemp: 15.0 + 35.0 * Math.sin(phase) + noise(4, 0.4),
    TCS_BatteryPackTemp: 20.0 + 2.8 * Math.sin(phase - 0.8) + noise(5, 0.2),
    ADCS_WheelSpeedX: 3100.0 + 900.0 * Math.sin(2 * phase) + noise(6, 12.0),
    ADCS_BodyRateJitter: 0.009 + 0.003 * Math.abs(Math.cos(phase)) + Math.abs(noise(7, 0.0015)),
    PROP_ManifoldPressure: 20.0 + 0.2 * Math.sin(phase) + noise(8, 0.02),
    PAYLOAD_OpticalIRTemp: 94.8 + 0.15 * Math.sin(phase) + noise(9, 0.05),
    COMM_TransceiverPower: 33.1 + noise(10, 0.08),
  };

  const anomalyScores: Record<string, number> = {};
  for (const ch of TELEMETRY_CHANNELS) {
    anomalyScores[ch.id] = 0.15 + Math.abs(noise(ch.name.length, 0.1));
  }

  let isAnomaly = false;
  let rootCauseAttributed: string | null = null;
  const cascadeStepActive: CascadeStep[] = [];

  const inScenario = t >= scenario.startSec && t < scenario.startSec + scenario.durationSec;
  const relTime = t - scenario.startSec;

  if (inScenario && scenario.id !== 'nominal_leo_orbit') {
    isAnomaly = true;
    rootCauseAttributed = scenario.rootCauseChannel;

    for (const step of scenario.cascadeTimeline) {
      if (relTime >= step.onsetLagSeconds) {
        cascadeStepActive.push(step);
        const effectFactor = Math.min(1.0, (relTime - step.onsetLagSeconds) / 8.0);

        if (step.channelId === 'EPS_SolarVoltage') {
          values.EPS_SolarVoltage = 12.4 + noise(1, 1.2);
          anomalyScores.EPS_SolarVoltage = 8.5 + effectFactor * 2.0;
        } else if (step.channelId === 'EPS_BusVoltage') {
          values.EPS_BusVoltage = 28.0 - 4.6 * effectFactor + noise(3, 0.1);
          anomalyScores.EPS_BusVoltage = 7.4 + effectFactor * 2.1;
        } else if (step.channelId === 'EPS_BatteryCurrent') {
          values.EPS_BatteryCurrent = -34.5 - 3.0 * Math.sin(relTime * 0.4) + noise(2, 0.5);
          anomalyScores.EPS_BatteryCurrent = 7.8 + effectFactor * 1.5;
        } else if (step.channelId === 'TCS_BatteryPackTemp') {
          values.TCS_BatteryPackTemp = 20.0 + 24.0 * effectFactor + noise(5, 0.3);
          anomalyScores.TCS_BatteryPackTemp = 6.9 + effectFactor * 2.2;
        } else if (step.channelId === 'ADCS_WheelSpeedX') {
          values.ADCS_WheelSpeedX = Math.max(350, 3100.0 - 2500.0 * effectFactor + noise(6, 40.0));
          anomalyScores.ADCS_WheelSpeedX = 7.1 + effectFactor * 1.9;
        } else if (step.channelId === 'ADCS_BodyRateJitter') {
          values.ADCS_BodyRateJitter = 0.009 + 0.16 * effectFactor + Math.abs(noise(7, 0.02));
          anomalyScores.ADCS_BodyRateJitter = 8.8 + effectFactor * 1.8;
        } else if (step.channelId === 'TCS_RadiatorTemp') {
          values.TCS_RadiatorTemp = 15.0 + 38.0 * effectFactor + noise(4, 0.8);
          anomalyScores.TCS_RadiatorTemp = 8.9 + effectFactor * 1.8;
        } else if (step.channelId === 'PAYLOAD_OpticalIRTemp') {
          values.PAYLOAD_OpticalIRTemp = 94.8 + 18.2 * effectFactor + noise(9, 0.2);
          anomalyScores.PAYLOAD_OpticalIRTemp = 8.1 + effectFactor * 1.6;
        } else if (step.channelId === 'PROP_ManifoldPressure') {
          values.PROP_ManifoldPressure = Math.max(14.0, 20.0 - 4.8 * effectFactor + noise(8, 0.05));
          anomalyScores.PROP_ManifoldPressure = 6.8 + effectFactor * 1.4;
        } else if (step.channelId === 'COMM_TransceiverPower') {
          values.COMM_TransceiverPower = 33.1 - 8.2 * effectFactor + noise(10, 0.3);
          anomalyScores.COMM_TransceiverPower = 7.5 + effectFactor * 1.6;
        }
      }
    }
  }

  // Update nodes
  const nodes: CausalNode[] = INITIAL_CAUSAL_NODES.map((node) => {
    const score = anomalyScores[node.id] || 0.1;
    let status: 'nominal' | 'affected' | 'root-cause' = 'nominal';
    if (node.id === rootCauseAttributed) {
      status = 'root-cause';
    } else if (score > 2.0) {
      status = 'affected';
    }

    return {
      ...node,
      currentValue: values[node.id] !== undefined ? values[node.id] : node.currentValue,
      status,
      anomalySeverity: score,
    };
  });

  // Directed edges based on scenario & baseline physical coupling
  const edges: CausalEdge[] = [
    { source: 'EPS_SolarVoltage', target: 'EPS_BusVoltage', weight: isAnomaly && scenario.id === 'solar_shunt_cascade' ? 0.94 : 0.82, isCascading: isAnomaly && scenario.id === 'solar_shunt_cascade' },
    { source: 'EPS_BusVoltage', target: 'EPS_BatteryCurrent', weight: isAnomaly && scenario.id === 'solar_shunt_cascade' ? 0.89 : 0.74, isCascading: isAnomaly && scenario.id === 'solar_shunt_cascade' },
    { source: 'EPS_BatteryCurrent', target: 'TCS_BatteryPackTemp', weight: isAnomaly && scenario.id === 'solar_shunt_cascade' ? 0.84 : 0.65, isCascading: isAnomaly && scenario.id === 'solar_shunt_cascade' },
    { source: 'EPS_BusVoltage', target: 'ADCS_WheelSpeedX', weight: isAnomaly && scenario.id === 'solar_shunt_cascade' ? 0.76 : 0.42, isCascading: isAnomaly && scenario.id === 'solar_shunt_cascade' },
    { source: 'ADCS_WheelSpeedX', target: 'ADCS_BodyRateJitter', weight: (isAnomaly && (scenario.id === 'solar_shunt_cascade' || scenario.id === 'reaction_wheel_bearing_friction')) ? 0.91 : 0.71, isCascading: isAnomaly && (scenario.id === 'solar_shunt_cascade' || scenario.id === 'reaction_wheel_bearing_friction') },
    { source: 'TCS_RadiatorTemp', target: 'PAYLOAD_OpticalIRTemp', weight: isAnomaly && scenario.id === 'cryo_radiator_degradation' ? 0.92 : 0.79, isCascading: isAnomaly && scenario.id === 'cryo_radiator_degradation' },
    { source: 'TCS_RadiatorTemp', target: 'PROP_ManifoldPressure', weight: isAnomaly && scenario.id === 'cryo_radiator_degradation' ? 0.81 : 0.35, isCascading: isAnomaly && scenario.id === 'cryo_radiator_degradation' },
    { source: 'PROP_ManifoldPressure', target: 'ADCS_BodyRateJitter', weight: isAnomaly && scenario.id === 'cryo_radiator_degradation' ? 0.73 : 0.28, isCascading: isAnomaly && scenario.id === 'cryo_radiator_degradation' },
    { source: 'ADCS_BodyRateJitter', target: 'COMM_TransceiverPower', weight: isAnomaly && scenario.id === 'reaction_wheel_bearing_friction' ? 0.85 : 0.31, isCascading: isAnomaly && scenario.id === 'reaction_wheel_bearing_friction' },
  ];

  return {
    values,
    anomalyScores,
    nodes,
    edges,
    isAnomaly,
    rootCauseAttributed,
    cascadeStepActive,
  };
}
