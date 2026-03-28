# WebSockets — Real-Time Data

Stream live data via WebSockets for balances, orderbooks, and trades.

Synthesis provides three WebSocket endpoints for real-time updates. All connections use the same pattern: connect, subscribe, receive initial state, then receive live updates.

| Endpoint | Max Subscriptions | Description |
|----------|-------------------|-------------|
| `wss://synthesis.trade/ws/balance` | 500 wallets | Wallet balances and order status |
| `wss://synthesis.trade/ws/orderbook` | 5,000 markets | Orderbook snapshots and deltas |
| `wss://synthesis.trade/ws/trades` | 1,000 markets | Trade executions |

---

## Connection Basics

All WebSocket connections follow the same pattern:

```javascript
const ws = new WebSocket("wss://synthesis.trade/ws/{endpoint}");

ws.onopen = () => {
    ws.send(JSON.stringify({
        type: "subscribe",
        // ... subscription parameters
    }));
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.success) {
        console.log(data.response);
    }
};
```

The server sends ping frames every 30 seconds to keep connections alive. Your client should respond with pong frames automatically (most WebSocket libraries handle this).

---

## Balance WebSocket

Stream real-time wallet balances, order fills, and position changes.

**Endpoint:** `wss://synthesis.trade/ws/balance`

The Balance WebSocket provides real-time updates for wallet balances, including USDC.e and all position token balances. It also streams order status updates, making it the primary channel for monitoring trading activity.

### Use Cases

| Use Case | Description |
|----------|-------------|
| Live portfolio display | Show users their USDC.e balance and position values updating in real-time as trades execute |
| Order fill notifications | Get instant notifications when limit orders are filled, partially filled, or cancelled |
| Position tracking | Monitor position size changes as orders fill, including partial fills on large orders |
| Deposit confirmation | Detect when deposits arrive without polling, providing instant feedback to users |

### Subscribe

Subscribe by providing an array of wallet addresses. You can subscribe to multiple wallets at once (up to 500). The server automatically detects the chain based on address format (0x for Polygon, base58 for Solana).

```javascript
const ws = new WebSocket("wss://synthesis.trade/ws/balance");

ws.onopen = () => {
    ws.send(JSON.stringify({
        type: "subscribe",
        wallets: [
            { address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" },
            { address: "0x1234567890abcdef1234567890abcdef12345678" }
        ]
    }));
};
```

Optionally filter to specific assets. This is useful when you only care about certain positions or just USDC.e:

```javascript
ws.send(JSON.stringify({
    type: "subscribe",
    wallets: [
        {
            address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
            assets: ["USDC.e", "21742633143463906290569050155826241533067272736897614950488156847949938836455"]
        }
    ]
}));
```

### Initial Response

Upon subscribing, you receive the current balances for all subscribed wallets:

```json
{
    "success": true,
    "response": {
        "wallets": [
            {
                "chain_id": "POL",
                "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                "balances": {
                    "USDC.e": "1250.5",
                    "21742633143463906290569050155826241533067272736897614950488156847949938836455": "25.384",
                    "48572956138472615938471625938471659384716593847165938471659384716593847165938": "100"
                }
            }
        ]
    }
}
```

### Real-Time Updates

After the initial snapshot, you receive updates whenever balances change:

```json
{
    "success": true,
    "response": {
        "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        "asset": "21742633143463906290569050155826241533067272736897614950488156847949938836455",
        "balance": "35.384"
    }
}
```

Order status updates are also streamed through this channel:

```json
{
    "success": true,
    "response": {
        "order_id": "0x1234567890abcdef...",
        "token_id": "21742633143463906290569050155826241533067272736897614950488156847949938836455",
        "filled": "15.384",
        "status": "PARTIAL"
    }
}
```

### Complete Example

```javascript
const response = await fetch("https://synthesis.trade/api/v1/wallet", {
    headers: { "Authorization": "Bearer " + sessionToken }
});
const { response: wallets } = await response.json();

const ws = new WebSocket("wss://synthesis.trade/ws/balance");

ws.onopen = () => {
    ws.send(JSON.stringify({
        type: "subscribe",
        wallets: wallets.map(w => ({ address: w.address }))
    }));
};

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    
    if (!message.success) {
        console.error("WebSocket error:", message.response);
        return;
    }
    
    const data = message.response;
    
    if (data.wallets) {
        // Initial snapshot
        data.wallets.forEach(wallet => {
            console.log(`Wallet ${wallet.address} balances:`, wallet.balances);
        });
        return;
    }
    
    if (data.order_id) {
        // Order status update
        console.log(`Order ${data.order_id} status: ${data.status}, filled: ${data.filled}`);
        return;
    }
    
    if (data.asset) {
        // Balance change
        console.log(`${data.asset} balance changed to ${data.balance}`);
    }
};
```

Position token IDs are numeric strings. USDC.e is always keyed as `"USDC.e"`. When a position balance reaches zero, you'll receive an update with balance `"0"`.

---

## Orderbook WebSocket

Stream real-time orderbook snapshots and delta updates for prediction markets.

**Endpoint:** `wss://synthesis.trade/ws/orderbook`

The Orderbook WebSocket streams real-time orderbook updates for prediction markets. Subscribe to multiple markets at once to build live trading interfaces with accurate bid/ask spreads and depth visualization.

### Use Cases

| Use Case | Description |
|----------|-------------|
| Live price display | Show real-time best bid/ask prices derived from the top of the orderbook |
| Event pages | Subscribe to all markets in an event to show live prices for each outcome |
| Depth charts | Build orderbook depth visualizations showing liquidity at each price level |
| Spread monitoring | Track bid-ask spreads to identify trading opportunities or market inefficiencies |

### Subscribe

Subscribe using token IDs (for Polymarket) or market IDs (for Kalshi). You can subscribe to up to 5,000 markets at once:

```javascript
const ws = new WebSocket("wss://synthesis.trade/ws/orderbook");

ws.onopen = () => {
    ws.send(JSON.stringify({
        type: "subscribe",
        venue: "polymarket",
        markets: [
            "21742633143463906290569050155826241533067272736897614950488156847949938836455",
            "48572956138472615938471625938471659384716593847165938471659384716593847165938"
        ]
    }));
};
```

### Initial Response

Upon subscribing, you receive the full orderbook for each market:

```json
{
    "success": true,
    "response": {
        "orderbooks": [
            {
                "venue": "polymarket",
                "orderbook": {
                    "condition_id": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
                    "token_id": "21742633143463906290569050155826241533067272736897614950488156847949938836455",
                    "bids": {
                        "0.65": "1500",
                        "0.64": "3200",
                        "0.63": "5000"
                    },
                    "asks": {
                        "0.66": "1200",
                        "0.67": "2800",
                        "0.68": "4500"
                    },
                    "best_bid": "0.65",
                    "best_ask": "0.66",
                    "hash": "a1b2c3d4e5f6",
                    "created_at": "2026-01-01T12:00:00"
                }
            }
        ]
    }
}
```

### Real-Time Updates

After the initial snapshot, you receive delta updates whenever the orderbook changes:

```json
{
    "success": true,
    "response": {
        "venue": "polymarket",
        "delta": {
            "condition_id": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
            "token_id": "21742633143463906290569050155826241533067272736897614950488156847949938836455",
            "amount": "800",
            "price": "0.66",
            "side": "BUY",
            "best_bid": "0.66",
            "best_ask": "0.67",
            "hash": "f6e5d4c3b2a1",
            "created_at": "2026-01-01T12:00:05"
        }
    }
}
```

### Complete Example: Event Page

Build a live event page that shows prices for all markets in an event:

```javascript
const eventResponse = await fetch(
    "https://synthesis.trade/api/v1/polymarket/market/event/democratic-presidential-nominee-2028"
);
const { response: event } = await eventResponse.json();

const tokenIds = event.markets.flatMap(market => [
    market.left_token_id,
    market.right_token_id
]);

const ws = new WebSocket("wss://synthesis.trade/ws/orderbook");
const orderbooks = new Map();

ws.onopen = () => {
    ws.send(JSON.stringify({
        type: "subscribe",
        venue: "polymarket",
        markets: tokenIds
    }));
};

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (!message.success) return;
    
    const data = message.response;
    
    if (data.orderbooks) {
        // Initial snapshot
        data.orderbooks.forEach(({ orderbook }) => {
            orderbooks.set(orderbook.token_id, orderbook);
        });
        updateUI();
        return;
    }
    
    if (data.delta) {
        // Delta update
        const existing = orderbooks.get(data.delta.token_id);
        if (existing) {
            existing.best_bid = data.delta.best_bid;
            existing.best_ask = data.delta.best_ask;
        }
        updateUI();
    }
};

function updateUI() {
    event.markets.forEach(market => {
        const yesBook = orderbooks.get(market.left_token_id);
        if (yesBook) {
            const yesPrice = yesBook.best_ask || "0";
            document.getElementById(`price-${market.condition_id}`).textContent = yesPrice;
        }
    });
}
```

For Polymarket, each market has two token IDs (left/right or YES/NO). Subscribe to both to show complete pricing. The best bid on YES roughly equals 1 minus the best ask on NO.

---

## Trades WebSocket

Stream real-time trade executions and build live trade feeds.

**Endpoint:** `wss://synthesis.trade/ws/trades`

The Trades WebSocket streams real-time trade executions for markets. Use this to show live trade feeds, calculate volume, and track market activity.

### Use Cases

| Use Case | Description |
|----------|-------------|
| Trade feed | Display a live stream of trades showing price, size, side, and trader info |
| Volume tracking | Calculate real-time trading volume by aggregating trade amounts |
| Last trade price | Show the most recent execution price as an alternative to mid-market |
| Whale alerts | Monitor for large trades and alert users to significant market activity |

### Subscribe

Subscribe using condition IDs (market identifiers). You can subscribe to up to 1,000 markets:

```javascript
const ws = new WebSocket("wss://synthesis.trade/ws/trades");

ws.onopen = () => {
    ws.send(JSON.stringify({
        type: "subscribe",
        venue: "polymarket",
        markets: [
            "0xabcdef1234567890abcdef1234567890abcdef12",
            "0x1234567890abcdef1234567890abcdef12345678"
        ]
    }));
};
```

### Initial Response

Upon subscribing, you receive recent historical trades:

```json
{
    "success": true,
    "response": {
        "trades": [
            {
                "venue": "polymarket",
                "trade": {
                    "tx_hash": "0x9876543210fedcba...",
                    "token_id": "21742633143463906290569050155826241533067272736897614950488156847949938836455",
                    "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                    "side": true,
                    "amount": "100",
                    "shares": "153.846",
                    "price": "0.65",
                    "username": "trader123",
                    "image": "https://...",
                    "created_at": "2026-01-01T12:00:00"
                },
                "event": { "..." },
                "market": { "..." }
            }
        ]
    }
}
```

### Real-Time Updates

New trades are streamed as they occur:

```json
{
    "success": true,
    "response": {
        "venue": "polymarket",
        "trade": {
            "tx_hash": "0xfedcba9876543210...",
            "token_id": "21742633143463906290569050155826241533067272736897614950488156847949938836455",
            "address": "0x1234567890abcdef1234567890abcdef12345678",
            "side": false,
            "amount": "500",
            "shares": "714.285",
            "price": "0.70",
            "username": "whale_trader",
            "image": "https://...",
            "created_at": "2026-01-01T12:05:30"
        },
        "market": { "..." }
    }
}
```

### Complete Example: Trade Feed

```javascript
const ws = new WebSocket("wss://synthesis.trade/ws/trades");
const trades = [];
const MAX_TRADES = 50;

ws.onopen = () => {
    ws.send(JSON.stringify({
        type: "subscribe",
        venue: "polymarket",
        markets: ["0xabcdef1234567890abcdef1234567890abcdef12"]
    }));
};

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (!message.success) return;
    
    const data = message.response;
    
    if (data.trades) {
        // Historical trades on subscribe
        trades.push(...data.trades.map(t => t.trade));
        renderTrades();
        return;
    }
    
    // New trade
    trades.unshift(data.trade);
    if (trades.length > MAX_TRADES) {
        trades.pop();
    }
    renderTrades();
};

function renderTrades() {
    const container = document.getElementById("trade-feed");
    container.innerHTML = trades.map(trade => `
        <div class="trade ${trade.side ? 'buy' : 'sell'}">
            <span class="price">${trade.price}</span>
            <span class="size">${trade.shares} shares</span>
            <span class="user">${trade.username || trade.address.slice(0, 8)}</span>
        </div>
    `).join("");
}
```

Trades include Polymarket profile info (username, image) when available. For anonymous traders, you can display a truncated address instead.

---

## WebSocket Best Practices

1. **Reconnect on disconnect** — Implement exponential backoff for reconnection
2. **Handle ping/pong** — Most libraries handle this automatically
3. **Validate messages** — Always check `data.success` before processing
4. **Batch subscriptions** — Subscribe to multiple markets/wallets in one message
5. **Unsubscribe when done** — Clean up subscriptions to free server resources
6. **Use the right endpoint** — Balance for portfolio, Orderbook for prices, Trades for activity
