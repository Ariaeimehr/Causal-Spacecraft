# ==============================================================================
# Causal-Spacecraft: Predictive Maintenance & Anomaly Detection
# Multi-stage Containerfile for Aerospace Ground Station Edge/Cloud Inference
# ==============================================================================

# --- Stage 1: Build & Dependency Resolution ---
FROM python:3.11-slim AS builder

WORKDIR /build

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --user --no-warn-script-location -r requirements.txt

# --- Stage 2: Final Distroless-inspired Minimal Runtime ---
FROM python:3.11-slim AS runner

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/home/appuser/.local/bin:$PATH" \
    PYTHONPATH="/app" \
    PORT=8000 \
    SEQ_LEN=64 \
    ANOMALY_THRESHOLD=2.2

# Create non-privileged system user for mission-critical security compliance
RUN groupadd -r appuser && useradd -r -g appuser -d /home/appuser -s /sbin/nologin -c "Telemetry Service User" appuser \
    && mkdir -p /home/appuser /app \
    && chown -R appuser:appuser /home/appuser /app

# Copy dependencies from builder
COPY --from=builder /root/.local /home/appuser/.local

# Copy application source code
COPY --chown=appuser:appuser model.py data_generator.py inference_service.py ./

# Switch to non-root user
USER appuser

# Healthcheck for container orchestration (Kubernetes / Docker Swarm)
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
    CMD python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/healthz')" || exit 1

EXPOSE 8000

# Execute high-throughput ASGI server with production worker configuration
CMD ["uvicorn", "inference_service:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2", "--access-log"]
