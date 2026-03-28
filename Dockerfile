FROM ghcr.io/nvidia/openshell/cluster:0.0.15@sha256:fa87623ed13daf2a3cfe0fad387e4c586b68a008943a7f4f82e627fd024093a0

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv curl && \
    rm -rf /var/lib/apt/lists/*

COPY pyproject.toml requirements.txt ./
COPY src/ src/

RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1

COPY scripts/ scripts/
COPY run.sh .

RUN mkdir -p /app/data && chmod +x run.sh

EXPOSE 8420

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:8420/health || exit 1

ENTRYPOINT ["/opt/venv/bin/python", "-m", "synthesis.server"]
