---
name: synth-opseeq-connect
description: Use when configuring, troubleshooting, or verifying the connection between Synth and the Opseeq runtime gateway.
---

# Synth-Opseeq Connection

## Required Configuration

### .env
```
OPENAI_BASE_URL=http://localhost:9090/v1
OPSEEQ_URL=http://localhost:9090
```

### .mcp.json
```json
{
  "mcpServers": {
    "opseeq": { "url": "http://localhost:9090/mcp", "transport": "sse" },
    "mermate": { "url": "http://localhost:3333/mcp", "transport": "sse" }
  }
}
```

## Docker Networking

In `docker-compose.yml`, Synth connects to Opseeq via Docker service name:
```
OPENAI_BASE_URL=http://opseeq:9090/v1
```

Build and run: `docker compose up --build -d`

Image tags: `opseeq:v5`, `synth:v5`

## Health Verification

1. Opseeq gateway: `curl http://localhost:9090/health`
2. Synth desk: `curl http://localhost:8420/api/health`
3. Cross-check: `curl http://localhost:9090/api/status` — verify `synthesisTrade.reachable = true`

## Opseeq MCP Tools for Synth

Available via Opseeq MCP at `http://localhost:9090/mcp`:
- `synth_status` — deep health check
- `synth_predict` — generate prediction
- `synth_predictions` — list recent predictions
- `synth_markets` — search markets
- `synth_portfolio` — portfolio summary
