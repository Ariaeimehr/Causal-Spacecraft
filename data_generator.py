"""
Causal-Spacecraft: Predictive Maintenance & Anomaly Detection via Causal Transformers
Module: data_generator.py
Author: Principal Aerospace AI Research Team
Purpose: High-fidelity Spacecraft Telemetry Simulator with Cascading Anomaly Injection
"""

from typing import Dict, List, Optional, Tuple
import json
import numpy as np
import pandas as pd


class SpacecraftTelemetrySimulator:
    """
    Physical simulation of a Low-Earth-Orbit (LEO) satellite telemetry stream.
    Simulates coupled physical dynamics across:
      - EPS (Electrical Power Subsystem)
      - TCS (Thermal Control Subsystem)
      - ADCS (Attitude Determination & Control Subsystem)
      - PROP (Propulsion Subsystem)
      - COMM (RF Communication Subsystem)
      - PAYLOAD (High-Resolution Optical/Infrared Camera)
    """

    CHANNELS = [
        "EPS_SolarVoltage",       # Volts (nominal: 48-52V during sunlit, 0V in eclipse)
        "EPS_BatteryCurrent",     # Amperes (charge: +5 to +15A, discharge: -10 to -25A)
        "EPS_BusVoltage",         # Volts (regulated bus: 28.0V ± 0.4V)
        "TCS_RadiatorTemp",       # Celsius (-40 to +65C depending on solar aspect)
        "TCS_BatteryPackTemp",    # Celsius (nominal: 15 to 25C)
        "ADCS_WheelSpeedX",       # RPM (reaction wheel momentum: 1500-4500 RPM)
        "ADCS_BodyRateJitter",    # deg/s (jitter noise: 0.002 to 0.025 deg/s)
        "PROP_ManifoldPressure",  # bar (hydrazine / cold gas pressure: 18.0 - 22.0 bar)
        "PAYLOAD_OpticalIRTemp",  # Kelvin (cryo-cooled focal plane: 95K ± 2K)
        "COMM_TransceiverPower",  # dBm (RF downlink power: 33.0 ± 0.5 dBm)
    ]

    def __init__(
        self,
        orbit_period_seconds: float = 5400.0,  # 90-minute LEO orbit
        sample_rate_hz: float = 1.0,           # 1 Hz sampling
        random_seed: int = 42,
    ):
        self.orbit_period = orbit_period_seconds
        self.sample_rate = sample_rate_hz
        self.rng = np.random.RandomState(random_seed)
        self.num_channels = len(self.CHANNELS)
        self.channel_to_idx = {name: i for i, name in enumerate(self.CHANNELS)}

    def generate_nominal_orbit(self, total_seconds: int = 3600) -> np.ndarray:
        """
        Generates nominal physical time-series with orbital eclipse cycles and white noise.
        Shape: [total_seconds, num_channels]
        """
        time = np.arange(0, total_seconds, 1.0 / self.sample_rate)
        n_steps = len(time)
        data = np.zeros((n_steps, self.num_channels))

        # Solar phase angle (0 to 2*pi per orbit)
        orbital_phase = 2 * np.pi * (time % self.orbit_period) / self.orbit_period
        in_sunlight = (np.sin(orbital_phase) > -0.2).astype(float)  # ~60% sunlit, ~40% eclipse

        # 1. EPS Solar Voltage
        base_solar = 50.0 * in_sunlight + 0.5 * np.cos(orbital_phase) * in_sunlight
        solar_noise = self.rng.normal(0, 0.4, n_steps)
        data[:, self.channel_to_idx["EPS_SolarVoltage"]] = np.clip(base_solar + solar_noise, 0.0, 55.0)

        # 2. EPS Battery Current (positive = charging during sun, negative = discharging in eclipse)
        base_batt_current = np.where(in_sunlight > 0.5, 8.5 + 2.0 * np.sin(orbital_phase), -14.0 - 2.5 * np.cos(orbital_phase))
        batt_current_noise = self.rng.normal(0, 0.3, n_steps)
        data[:, self.channel_to_idx["EPS_BatteryCurrent"]] = base_batt_current + batt_current_noise

        # 3. EPS Regulated Bus Voltage (28.0V ± 0.1V, slight drop in heavy discharge)
        bus_sag = np.where(in_sunlight > 0.5, 0.0, -0.25)
        bus_noise = self.rng.normal(0, 0.05, n_steps)
        data[:, self.channel_to_idx["EPS_BusVoltage"]] = 28.0 + bus_sag + bus_noise

        # 4. TCS Radiator Temp (tracks thermal radiation in sun vs deep space)
        rad_temp = 15.0 + 40.0 * np.sin(orbital_phase) + self.rng.normal(0, 0.5, n_steps)
        data[:, self.channel_to_idx["TCS_RadiatorTemp"]] = rad_temp

        # 5. TCS Battery Pack Temp (thermal inertia, heats during high current discharge & charge)
        batt_temp = 20.0 + 3.0 * np.sin(orbital_phase - np.pi / 4) + self.rng.normal(0, 0.2, n_steps)
        data[:, self.channel_to_idx["TCS_BatteryPackTemp"]] = batt_temp

        # 6. ADCS Wheel Speed X (periodic attitude momentum unloading)
        wheel_rpm = 3000.0 + 1200.0 * np.sin(2 * orbital_phase) + self.rng.normal(0, 15.0, n_steps)
        data[:, self.channel_to_idx["ADCS_WheelSpeedX"]] = wheel_rpm

        # 7. ADCS Body Rate Jitter (very low nominal jitter)
        jitter = 0.008 + 0.004 * np.abs(np.cos(orbital_phase)) + np.abs(self.rng.normal(0, 0.002, n_steps))
        data[:, self.channel_to_idx["ADCS_BodyRateJitter"]] = jitter

        # 8. PROP Manifold Pressure (gradual blowdown, small thermal expansion fluctuation)
        prop_press = 20.0 + 0.3 * np.sin(orbital_phase) - (time / 86400.0) * 0.1 + self.rng.normal(0, 0.02, n_steps)
        data[:, self.channel_to_idx["PROP_ManifoldPressure"]] = prop_press

        # 9. PAYLOAD Optical IR Temp (active cryo-cooler keeps sensor at 95.0 K ± 0.2K)
        cryo_temp = 95.0 + 0.15 * np.sin(orbital_phase) + self.rng.normal(0, 0.08, n_steps)
        data[:, self.channel_to_idx["PAYLOAD_OpticalIRTemp"]] = cryo_temp

        # 10. COMM Transceiver Power (33 dBm nominal downlink)
        rf_pwr = 33.0 + self.rng.normal(0, 0.1, n_steps)
        data[:, self.channel_to_idx["COMM_TransceiverPower"]] = rf_pwr

        return data

    def inject_cascading_anomaly(
        self,
        base_data: np.ndarray,
        scenario: str = "solar_shunt_cascade",
        start_time: int = 1200,
        duration: int = 400,
    ) -> Tuple[np.ndarray, Dict[str, any]]:
        """
        Injects a realistic physical cascade of failures where Subsystem A fails,
        causing a physical propagation to Subsystem B, which causes failure in Subsystem C.

        Returns:
          anomalous_data: np.ndarray
          metadata: Dict containing ground-truth causal DAG and timeline
        """
        data = base_data.copy()
        end_time = min(len(data), start_time + duration)
        t_span = np.arange(start_time, end_time)
        t_rel = t_span - start_time

        idx = self.channel_to_idx
        gt_dag = np.zeros((self.num_channels, self.num_channels))  # [target, source]

        if scenario == "solar_shunt_cascade":
            # Scenario: Solar Array Sequential Shunt Unit (SSU) Mosfet breakdown
            # Cascade:
            # 1. EPS_SolarVoltage short-circuits (t=0s) [ROOT CAUSE]
            # 2. EPS_BusVoltage collapses / sags (t=15s)
            # 3. EPS_BatteryCurrent dumps excessive power to maintain bus (t=18s)
            # 4. TCS_BatteryPackTemp rises due to severe ohmic heating I^2*R (t=45s)
            # 5. ADCS_WheelSpeedX cuts out as power-shedding safety trips (t=75s)
            # 6. ADCS_BodyRateJitter spikes 10x due to loss of reaction wheel stabilization (t=90s)

            # Ground truth causal edges [target, source]
            gt_dag[idx["EPS_BusVoltage"], idx["EPS_SolarVoltage"]] = 1.0
            gt_dag[idx["EPS_BatteryCurrent"], idx["EPS_BusVoltage"]] = 1.0
            gt_dag[idx["TCS_BatteryPackTemp"], idx["EPS_BatteryCurrent"]] = 1.0
            gt_dag[idx["ADCS_WheelSpeedX"], idx["EPS_BusVoltage"]] = 1.0
            gt_dag[idx["ADCS_BodyRateJitter"], idx["ADCS_WheelSpeedX"]] = 1.0

            # 1. Root cause: Solar Voltage drops immediately
            data[start_time:end_time, idx["EPS_SolarVoltage"]] *= 0.25
            data[start_time:end_time, idx["EPS_SolarVoltage"]] += self.rng.normal(0, 1.2, len(t_span))

            # 2. Bus Voltage drops after 12s
            mask_bus = t_rel >= 12
            data[start_time + 12:end_time, idx["EPS_BusVoltage"]] -= 4.5 + 0.5 * np.exp(
                -(t_rel[mask_bus] - 12) / 100.0
            )

            # 3. Battery discharge current spikes to -38A
            mask_batt = t_rel >= 16
            data[start_time + 16:end_time, idx["EPS_BatteryCurrent"]] = -35.0 - 5.0 * np.sin(
                (t_rel[mask_batt] - 16) * 0.1
            )

            # 4. Battery pack temperature rises from 20C to 48C
            mask_temp = t_rel >= 40
            temp_rise = 28.0 * (1 - np.exp(-(t_rel[mask_temp] - 40) / 70.0))
            data[start_time + 40:end_time, idx["TCS_BatteryPackTemp"]] += temp_rise

            # 5. ADCS Reaction wheel forced into emergency low-power hold (RPM drops from 3500 to 400)
            mask_wheel = t_rel >= 70
            wheel_drop = 3000.0 * (1 - np.exp(-(t_rel[mask_wheel] - 70) / 30.0))
            data[start_time + 70:end_time, idx["ADCS_WheelSpeedX"]] -= wheel_drop

            # 6. Attitude jitter violently destabilizes
            mask_jitter = t_rel >= 85
            jitter_spike = 0.15 + 0.08 * np.abs(np.sin((t_rel[mask_jitter] - 85) * 0.2))
            data[start_time + 85:end_time, idx["ADCS_BodyRateJitter"]] += jitter_spike

            description = "Sequential Shunt Unit (SSU) failure in Solar Array causing Bus Voltage collapse, thermal battery runaway, and loss of attitude control authority."
            root_cause = "EPS_SolarVoltage"

        elif scenario == "cryo_radiator_degradation":
            # Scenario: Micrometeoroid impacts thermal radiator louvers
            # Cascade:
            # 1. TCS_RadiatorTemp spikes (+40C) [ROOT CAUSE]
            # 2. PAYLOAD_OpticalIRTemp warms up (+18K)
            # 3. PROP_ManifoldPressure valve thermal expansion leak
            # 4. ADCS_BodyRateJitter disturbed by uncommanded cold gas venting

            gt_dag[idx["PAYLOAD_OpticalIRTemp"], idx["TCS_RadiatorTemp"]] = 1.0
            gt_dag[idx["PROP_ManifoldPressure"], idx["TCS_RadiatorTemp"]] = 1.0
            gt_dag[idx["ADCS_BodyRateJitter"], idx["PROP_ManifoldPressure"]] = 1.0

            # 1. Radiator temp rises
            data[start_time:end_time, idx["TCS_RadiatorTemp"]] += 38.0

            # 2. Cryo focal plane heats up
            mask_ir = t_rel >= 25
            data[start_time + 25:end_time, idx["PAYLOAD_OpticalIRTemp"]] += 16.5 * (
                1 - np.exp(-(t_rel[mask_ir] - 25) / 50.0)
            )

            # 3. Manifold pressure drops due to thermal relief valve pop
            mask_prop = t_rel >= 50
            data[start_time + 50:end_time, idx["PROP_ManifoldPressure"]] -= 4.2 * (
                1 - np.exp(-(t_rel[mask_prop] - 50) / 40.0)
            )

            # 4. Uncommanded venting causes attitude body jitter
            mask_jit = t_rel >= 60
            data[start_time + 60:end_time, idx["ADCS_BodyRateJitter"]] += 0.09

            description = "Micrometeoroid strike on thermal louvers causing radiator failure, payload detector overheating, and attitude disturbance via thruster venting."
            root_cause = "TCS_RadiatorTemp"

        else:
            # Scenario: Reaction Wheel Bearing Friction Lock
            # Cascade:
            # 1. ADCS_WheelSpeedX sudden erratic friction resistance [ROOT CAUSE]
            # 2. ADCS_BodyRateJitter high frequency vibration
            # 3. COMM_TransceiverPower antenna pointing misalignment link degradation

            gt_dag[idx["ADCS_BodyRateJitter"], idx["ADCS_WheelSpeedX"]] = 1.0
            gt_dag[idx["COMM_TransceiverPower"], idx["ADCS_BodyRateJitter"]] = 1.0

            # 1. Wheel speed fluctuations & stall
            data[start_time:end_time, idx["ADCS_WheelSpeedX"]] *= 0.3
            data[start_time:end_time, idx["ADCS_WheelSpeedX"]] += self.rng.normal(0, 400.0, len(t_span))

            # 2. Body rate jitter
            mask_j = t_rel >= 15
            data[start_time + 15:end_time, idx["ADCS_BodyRateJitter"]] += 0.18 + self.rng.normal(0, 0.04, len(t_span) - 15)

            # 3. RF link degradation
            mask_rf = t_rel >= 30
            data[start_time + 30:end_time, idx["COMM_TransceiverPower"]] -= 8.5

            description = "Reaction Wheel Flywheel Bearing mechanical seizure causing spacecraft jitter and RF ground station link drop."
            root_cause = "ADCS_WheelSpeedX"

        metadata = {
            "scenario": scenario,
            "description": description,
            "root_cause_channel": root_cause,
            "anomaly_start_timestep": start_time,
            "anomaly_end_timestep": end_time,
            "ground_truth_causal_dag": gt_dag.tolist(),
            "channels": self.CHANNELS,
        }

        return data, metadata

    def export_dataset(
        self,
        output_csv_path: str = "spacecraft_telemetry_cascade.csv",
        output_metadata_path: str = "spacecraft_metadata.json",
        total_seconds: int = 3600,
    ) -> pd.DataFrame:
        """
        Generates full simulated mission orbit and writes CSV + ground-truth DAG JSON.
        """
        nominal = self.generate_nominal_orbit(total_seconds=total_seconds)
        anomalous, meta = self.inject_cascading_anomaly(
            nominal,
            scenario="solar_shunt_cascade",
            start_time=int(total_seconds * 0.4),
            duration=600,
        )

        df = pd.DataFrame(anomalous, columns=self.CHANNELS)
        df["timestamp_sec"] = np.arange(len(df))
        df["is_anomalous"] = (
            (df["timestamp_sec"] >= meta["anomaly_start_timestep"])
            & (df["timestamp_sec"] < meta["anomaly_end_timestep"])
        ).astype(int)

        df.to_csv(output_csv_path, index=False)
        with open(output_metadata_path, "w") as f:
            json.dump(meta, f, indent=2)

        print(f"Generated {len(df)} telemetry frames -> saved to {output_csv_path}")
        print(f"Saved ground truth causal metadata -> {output_metadata_path}")
        return df


if __name__ == "__main__":
    sim = SpacecraftTelemetrySimulator()
    df = sim.export_dataset()
    print("Telemetry generation test complete.")
