"""
Causal-Spacecraft: Predictive Maintenance & Anomaly Detection via Causal Transformers
Module: train_and_evaluate.py
Author: Principal Aerospace AI Research Team
Purpose: Training loop, Causal DAG structural validation, and Root-Cause Attribution evaluation
"""

import argparse
import json
import time
import numpy as np
import torch
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

from data_generator import SpacecraftTelemetrySimulator
from model import CausalSpacecraftTransformer


def compute_graph_metrics(learned_adj: np.ndarray, gt_adj: np.ndarray, threshold: float = 0.2):
    """
    Computes Precision, Recall, F1-Score, and Structural Hamming Distance (SHD)
    between learned attention adjacency and ground-truth causal DAG.
    """
    learned_bin = (learned_adj >= threshold).astype(int)
    np.fill_diagonal(learned_bin, 0)
    np.fill_diagonal(gt_adj, 0)

    tp = np.sum((learned_bin == 1) & (gt_adj == 1))
    fp = np.sum((learned_bin == 1) & (gt_adj == 0))
    fn = np.sum((learned_bin == 0) & (gt_adj == 1))

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0
    shd = np.sum(np.abs(learned_bin - gt_adj))

    return {
        "precision": float(precision),
        "recall": float(recall),
        "f1": float(f1),
        "shd": int(shd),
    }


def train_and_evaluate(
    epochs: int = 15,
    batch_size: int = 32,
    seq_len: int = 64,
    forecast_horizon: int = 12,
    lr: float = 1e-3,
    lambda_dag: float = 0.05,
):
    print("=" * 70)
    print(" CAUSAL-SPACECRAFT: MODEL TRAINING & CAUSAL DISCOVERY BENCHMARK ")
    print("=" * 70)

    # 1. Generate physical telemetry
    sim = SpacecraftTelemetrySimulator(random_seed=42)
    print("Generating simulated LEO mission telemetry (7,200s @ 1 Hz)...")
    raw_data, meta = sim.inject_cascading_anomaly(
        sim.generate_nominal_orbit(total_seconds=7200),
        scenario="solar_shunt_cascade",
        start_time=3600,
        duration=600,
    )

    # Standardize data
    means = np.mean(raw_data[:3000], axis=0)
    stds = np.std(raw_data[:3000], axis=0) + 1e-6
    norm_data = (raw_data - means) / stds

    # Create sliding windows
    X_list, Y_forecast = [], []
    for i in range(len(norm_data) - seq_len - forecast_horizon):
        X_list.append(norm_data[i : i + seq_len])
        Y_forecast.append(norm_data[i + seq_len : i + seq_len + forecast_horizon])

    X_arr = np.array(X_list, dtype=np.float32)
    Y_arr = np.array(Y_forecast, dtype=np.float32)

    # Train/val split
    split = int(0.75 * len(X_arr))
    train_ds = TensorDataset(torch.from_numpy(X_arr[:split]), torch.from_numpy(Y_arr[:split]))
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device: {device}")

    # 2. Instantiate Model
    model = CausalSpacecraftTransformer(
        num_channels=len(sim.CHANNELS),
        channel_names=sim.CHANNELS,
        seq_len=seq_len,
        forecast_horizon=forecast_horizon,
        d_model=64,
        n_layers=3,
        n_heads=4,
        d_ff=256,
        dropout=0.1,
    ).to(device)

    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)

    # 3. Training Loop with NOTEARS continuous acyclicity constraint
    print(f"Beginning training for {epochs} epochs...")
    for epoch in range(1, epochs + 1):
        model.train()
        total_loss = 0.0
        recon_loss_accum = 0.0
        fore_loss_accum = 0.0
        dag_loss_accum = 0.0

        for batch_x, batch_y in train_loader:
            batch_x, batch_y = batch_x.to(device), batch_y.to(device)
            optimizer.zero_grad()

            outputs = model(batch_x)
            recon_loss = outputs["anomaly_score"].mean()
            fore_loss = torch.mean((outputs["forecast"] - batch_y) ** 2)
            dag_loss = model.compute_dag_loss(outputs["causal_adj"])

            loss = recon_loss + 1.2 * fore_loss + lambda_dag * dag_loss
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()

            total_loss += loss.item() * len(batch_x)
            recon_loss_accum += recon_loss.item() * len(batch_x)
            fore_loss_accum += fore_loss.item() * len(batch_x)
            dag_loss_accum += dag_loss.item() * len(batch_x)

        n_samples = len(train_loader.dataset)
        print(
            f"Epoch {epoch:02d}/{epochs:02d} | "
            f"Loss: {total_loss/n_samples:.4f} | "
            f"Recon: {recon_loss_accum/n_samples:.4f} | "
            f"Fore: {fore_loss_accum/n_samples:.4f} | "
            f"DAG: {dag_loss_accum/n_samples:.4f}"
        )

    # 4. Evaluation & Causal Graph Recovery Assessment
    print("\n" + "=" * 70)
    print(" EVALUATION: CAUSAL GRAPH EXTRACTION & ROOT-CAUSE ATTRIBUTION ")
    print("=" * 70)
    model.eval()

    test_slice = torch.from_numpy(norm_data[3580 : 3580 + seq_len]).unsqueeze(0).to(device)
    graph_res = model.extract_causal_graph(test_slice, threshold=0.12)
    learned_adj = np.array(graph_res["adjacency_matrix"])
    gt_adj = np.array(meta["ground_truth_causal_dag"])

    metrics = compute_graph_metrics(learned_adj, gt_adj, threshold=0.12)
    print("--- Causal Discovery Metrics against Ground Truth Cascade ---")
    print(f"Precision:                     {metrics['precision'] * 100:.2f}%")
    print(f"Recall:                        {metrics['recall'] * 100:.2f}%")
    print(f"F1-Score:                      {metrics['f1'] * 100:.2f}%")
    print(f"Structural Hamming Dist (SHD): {metrics['shd']}")

    print("\n--- Discovered Causal Directed Edges ---")
    for edge in graph_res["causal_edges"]:
        print(f"  {edge['source']:22s} ---> {edge['target']:22s} (Coupling: {edge['weight']:.3f})")

    # 5. Root Cause Attribution Test
    anomaly_window = torch.from_numpy(norm_data[3590 : 3590 + seq_len]).unsqueeze(0).to(device)
    attribution = model.attribute_root_cause(anomaly_window, anomaly_timestep=25, threshold=1.8)

    print("\n--- Root Cause Attribution Diagnostic ---")
    print(f"Predicted Root Cause:  {attribution['root_cause_channel']}")
    print(f"Ground Truth Root:     {meta['root_cause_channel']}")
    print(f"Root Confidence:       {attribution['confidence_score'] * 100:.1f}%")
    print(f"Cascade Path Length:   {len(attribution['cascade_path'])} downstream subsystems")
    print("\nDownstream Cascade Sequence:")
    for step in attribution["cascade_path"]:
        print(
            f"  + {step['onset_lag_steps']:02d}s | {step['subsystem']:22s} "
            f"(Coupling: {step['causal_coupling']:.3f}, Severity: {step['anomaly_severity']:.1f})"
        )

    # Save model artifact
    torch.save(model.state_dict(), "causal_transformer_spacecraft.pt")
    print("\n✓ Model weights successfully saved to 'causal_transformer_spacecraft.pt'")


if __name__ == "__main__":
    train_and_evaluate(epochs=5)
