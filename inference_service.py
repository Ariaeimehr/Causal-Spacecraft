"""
Causal-Spacecraft: Predictive Maintenance & Anomaly Detection via Causal Transformers
Module: inference_service.py
Purpose: Production-grade FastAPI Ground Station Telemetry Ingestion & Causal Inference Service
"""

import os
import time
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
import numpy as np
import torch

from model import CausalSpacecraftTransformer

app = FastAPI(
    title="Causal-Spacecraft Ground Control Inference Engine",
    description="Real-time multivariate telemetry streaming inference, causal graph extraction, and cascading root-cause analysis.",
    version="1.0.0",
)

CHANNELS = [
    "EPS_SolarVoltage",
    "EPS_BatteryCurrent",
    "EPS_BusVoltage",
    "TCS_RadiatorTemp",
    "TCS_BatteryPackTemp",
    "ADCS_WheelSpeedX",
    "ADCS_BodyRateJitter",
    "PROP_ManifoldPressure",
    "PAYLOAD_OpticalIRTemp",
    "COMM_TransceiverPower",
]

SEQ_LEN = int(os.getenv("SEQ_LEN", "64"))
ANOMALY_THRESHOLD = float(os.getenv("ANOMALY_THRESHOLD", "2.2"))

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Initialize model
model = CausalSpacecraftTransformer(
    num_channels=len(CHANNELS),
    channel_names=CHANNELS,
    seq_len=SEQ_LEN,
    forecast_horizon=12,
    d_model=64,
    n_layers=3,
    n_heads=4,
).to(device)

model_weights_path = os.getenv("MODEL_PATH", "causal_transformer_spacecraft.pt")
if os.path.exists(model_weights_path):
    model.load_state_dict(torch.load(model_weights_path, map_location=device))
    print(f"Loaded model weights from {model_weights_path}")
else:
    print("Warning: Pretrained weights not found; running with initialized weights.")
model.eval()


class TelemetryFrame(BaseModel):
    timestamp: float = Field(..., description="Unix timestamp or mission elapsed seconds")
    telemetry_window: List[List[float]] = Field(
        ...,
        description=f"2D float array of shape [seq_len={SEQ_LEN}, channels={len(CHANNELS)}]",
    )


class InferenceResponse(BaseModel):
    is_anomaly: bool
    max_anomaly_score: float
    root_cause_subsystem: Optional[str]
    root_cause_confidence: Optional[float]
    downstream_cascade: List[Dict[str, any]]
    causal_edges: List[Dict[str, any]]
    processing_latency_ms: float


@app.get("/healthz", status_code=status.HTTP_200_OK)
def healthz():
    return {
        "status": "HEALTHY",
        "service": "causal-spacecraft-inference",
        "device": str(device),
        "num_channels": len(CHANNELS),
    }


@app.get("/readyz", status_code=status.HTTP_200_OK)
def readyz():
    return {"status": "READY"}


@app.post("/v1/telemetry/infer", response_model=InferenceResponse)
def infer_telemetry(payload: TelemetryFrame):
    t_start = time.perf_counter()
    arr = np.array(payload.telemetry_window, dtype=np.float32)

    if arr.ndim != 2 or arr.shape[1] != len(CHANNELS):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid telemetry shape {arr.shape}. Required: [T, {len(CHANNELS)}]",
        )

    # Pad or truncate to SEQ_LEN
    if arr.shape[0] < SEQ_LEN:
        pad_len = SEQ_LEN - arr.shape[0]
        arr = np.pad(arr, ((pad_len, 0), (0, 0)), mode="edge")
    elif arr.shape[0] > SEQ_LEN:
        arr = arr[-SEQ_LEN:]

    tensor_in = torch.from_numpy(arr).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(tensor_in)
        scores = outputs["anomaly_score"][0].cpu().numpy()  # [T, N]
        max_score = float(np.max(scores[-1]))
        is_anomaly = max_score > ANOMALY_THRESHOLD

        graph_info = model.extract_causal_graph(tensor_in, threshold=0.15)

        root_cause = None
        confidence = None
        cascade = []

        if is_anomaly:
            attr = model.attribute_root_cause(tensor_in, anomaly_timestep=SEQ_LEN - 1, threshold=ANOMALY_THRESHOLD)
            root_cause = attr["root_cause_channel"]
            confidence = attr["confidence_score"]
            cascade = attr["cascade_path"]

    latency = (time.perf_counter() - t_start) * 1000.0

    return InferenceResponse(
        is_anomaly=is_anomaly,
        max_anomaly_score=round(max_score, 3),
        root_cause_subsystem=root_cause,
        root_cause_confidence=confidence,
        downstream_cascade=cascade,
        causal_edges=graph_info["causal_edges"],
        processing_latency_ms=round(latency, 2),
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
