# Synth Documentation

Complete documentation for the Synth AI trading desk and the Synthesis.trade API.

## Guides

| Guide | Description |
|-------|-------------|
| [Getting Started](./guides/getting-started.md) | Complete walkthrough from account creation to placing your first order |
| [Authentication](./guides/authentication.md) | Three auth methods: Project API keys, Session tokens, and Account API keys |
| [WebSockets](./guides/websockets.md) | Real-time data streams for balances, orderbooks, and trades |

## API Reference

- [Complete API Reference](./api/reference.md) — Full OpenAPI-style reference for all endpoints

## External Resources

- [Synthesis API Documentation](https://api.synthesis.trade/docs/llms.txt) — Official docs index
- [Synthesis Dashboard](https://synthesis.trade/dashboard) — Get your API keys

---

## Quick Links

### Authentication Methods

| Method | Header | Use Case |
|--------|--------|----------|
| Project API Key | `X-PROJECT-API-KEY` | Backend account management |
| Session Token | `Authorization: Bearer ...` | Frontend user authentication |
| Account API Key | `X-API-KEY` | Backend user operations |

### WebSocket Endpoints

| Endpoint | Subscriptions | Purpose |
|----------|---------------|---------|
| `wss://synthesis.trade/ws/balance` | 500 wallets | Wallet balances and order status |
| `wss://synthesis.trade/ws/orderbook` | 5,000 markets | Orderbook snapshots and deltas |
| `wss://synthesis.trade/ws/trades` | 1,000 markets | Trade executions |

### Project Structure

```
docs/
├── README.md                 # This file — navigation hub
├── guides/
│   ├── getting-started.md    # Account → wallet → first order
│   ├── authentication.md     # Auth methods and flows
│   └── websockets.md        # Real-time data streaming
└── api/
    └── reference.md          # Complete endpoint reference
```
