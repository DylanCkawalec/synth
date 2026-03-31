---
name: synth-mcp-bridge
description: Use when building, extending, or debugging the Synth MCP server that exposes trading desk tools to Opseeq and other MCP clients.
---

# Synth MCP Bridge

The Synth MCP server (`synthesis-mcp`) exposes the trading desk as structured tools for agent consumption.

## Files
- `src/synthesis/mcp_server/server.py` — FastMCP tool definitions
- `src/synthesis/mcp_server/__init__.py` — stdio entry point
- `run.sh mcp` — starts the MCP server

## Tool Categories

### READ (no approval)
- `search_markets` — find prediction markets by query
- `get_portfolio` — current portfolio state
- `get_predictions_history` — recent prediction log
- `get_risk_config` — active risk limits
- `get_audit_log` — action audit trail

### PREDICT (no approval)
- `generate_prediction` — run ensemble AI prediction on a market question
- `kelly_size` — compute Kelly criterion position size

### EXECUTE (requires approval gate)
- `place_order` — submit a trade
- `cancel_order` — cancel pending order
- `approve_trade` — approve a gated trade

### ADMIN
- `update_risk_config` — change risk limits
- `get_approval_queue` — pending approvals

## Extending
When a new API route is added to `app/server/index.ts`, add a matching `@mcp.tool()` in `server.py`. Keep HTTP transport in the island modules; keep tool definitions in `server.py`.
