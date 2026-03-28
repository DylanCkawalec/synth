Getting Started
Getting started

Copy page

Complete walkthrough from account creation to placing your first Polymarket order

This guide walks you through the complete flow of integrating Synthesis into your application. By the end, you’ll have created a user account, set up authentication, created a wallet, and placed your first Polymarket order.
​
What you’ll learn
1
Create a user account

2
Create a session or API key

3
Get or create a wallet

4
Get wallet deposit address

5
Place a Polymarket order

6
View orders and positions

7
Redeem and withdraw

​
Prerequisites
Before you begin, make sure you have:
A Synthesis project with your X-PROJECT-API-KEY
Basic familiarity with REST APIs and HTTP requests
​
Step 1: Create a user account
The first step is to create a user account for your end user. This is done from your backend using your project secret API key. Each account represents a unique user in your application and can have multiple wallets, sessions, and API keys.
The metadata field is optional and can store any JSON data you want to associate with the account, such as your internal user ID, email, or other identifiers.

Request

Response
curl -X POST "https://synthesis.trade/api/v1/project/account" \
  -H "Content-Type: application/json" \
  -H "X-PROJECT-API-KEY: YOUR_PROJECT_API_KEY" \
  -d '{
      "metadata": {
          "user_id": "your-internal-user-id",
          "email": "user@example.com"
      }
  }'
Save the account_id from the response. You’ll need it to create sessions and API keys for this user. Alternatively, you can retrieve existing accounts by calling GET /api/v1/project/accounts.
​
Step 2: Create a session or API key
Now you need to authenticate the user. There are two approaches depending on your use case:
Option A: Session token
Best for frontend applications. Create a session and store the token in the user’s browser. Sessions expire after a period of inactivity but can be refreshed.
Option B: Account API key
Best for backend services. Create a long-lived API key that your server can use to make requests on behalf of the user. API keys don’t expire unless revoked.
​
Option A: Create a session
Create a session for the account. The session token should be stored securely in the user’s browser (e.g., in an HTTP-only cookie or secure storage) and sent with each request.

Request

Response
curl -X POST "https://synthesis.trade/api/v1/project/account/{account_id}/session" \
  -H "Content-Type: application/json" \
  -H "X-PROJECT-API-KEY: YOUR_PROJECT_API_KEY"
Use the session token in the Authorization header for all subsequent account requests:
curl -X GET "https://synthesis.trade/api/v1/account/session" \
  -H "Authorization: Bearer aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789..."
​
Option B: Create an account API key
Create a long-lived API key for the account. Store this securely on your backend server. Never expose account API keys to the frontend.

Request

Response
curl -X POST "https://synthesis.trade/api/v1/project/account/{account_id}/api-key" \
  -H "Content-Type: application/json" \
  -H "X-PROJECT-API-KEY: YOUR_PROJECT_API_KEY"
The secret_key is only shown once. Store it securely immediately after creation.
Use the secret key in the X-API-KEY header for all subsequent account requests:
curl -X GET "https://synthesis.trade/api/v1/account/session" \
  -H "X-API-KEY: sk_aBcDeFgHiJkLmNoPqRsTuVwXyZ012345678901234"
​
Step 3: Get or create a wallet
Each account can have multiple wallets for trading. The easiest way to get started is to call the GET /api/v1/wallets endpoint, which will automatically create a Polygon wallet if one doesn’t exist.

Request

Response
curl -X GET "https://synthesis.trade/api/v1/wallets" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
Alternatively, you can explicitly create a wallet using the create wallet endpoint:
curl -X POST "https://synthesis.trade/api/v1/wallet/pol" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
Save the wallet_id from the response. You’ll use it for deposits, orders, and other wallet operations. You can always retrieve your wallets later by calling GET /api/v1/wallet.
​
Step 4: Get wallet deposit address
Before placing orders, the wallet needs USDC. There are two ways to get deposit addresses.
​
Option A: Native Polygon deposit
The wallet’s Polygon address can receive USDC directly on the Polygon network:

Request

Response
curl -X GET "https://synthesis.trade/api/v1/wallet/pol" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
Display the address to your user so they can deposit USDC (on Polygon) to fund their trading wallet.
​
Option B: Cross-chain deposit
Users can also deposit from other chains (Ethereum, Base, Arbitrum, Solana, etc.) using the cross-chain deposit endpoint. This generates a unique deposit address that automatically bridges funds to the Polygon wallet:

Request

Response
curl -X GET "https://synthesis.trade/api/v1/wallet/POL/{wallet_id}/deposit/EVM" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
Supported chain parameter values: EVM (Ethereum, Arbitrum, Base, Optimism, Binance), SOL, TRON.
​
Check wallet balance
You can check the wallet balance at any time:

Request

Response
curl -X GET "https://synthesis.trade/api/v1/wallet/pol/{wallet_id}/balance" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
​
Step 5: Place a Polymarket order
Now you’re ready to place your first order. You’ll need the token_id of the market outcome you want to trade. You can get this from the market endpoints.
First, find a market and get its token IDs:
curl -X GET "https://synthesis.trade/api/v1/markets/search/bitcoin?venue=polymarket"
Then place a market order. This example buys $10 worth of YES shares at market price:

Request

Response
curl -X POST "https://synthesis.trade/api/v1/wallet/pol/{wallet_id}/order" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
      "token_id": "21742633143463906290569050155826241533067272736897614950488156847949938836455",
      "side": "BUY",
      "type": "MARKET",
      "amount": "10",
      "units": "USDC"
  }'
​
Order types
Type	Description
MARKET	Execute immediately at best available price
LIMIT	Execute only at specified price or better
STOPLOSS	Trigger a market sell when price drops to threshold
​
Order parameters
Parameter	Description
token_id	The Polymarket token ID for the outcome you want to trade
side	BUY or SELL
type	MARKET, LIMIT, or STOPLOSS
amount	Order amount as a string
units	USDC (dollar amount) or SHARES (number of shares)
price	Required for LIMIT and STOPLOSS orders (0.001 to 0.999)
​
Step 6: View orders and positions
After placing orders, you can track their status and view your positions. Orders can be in various states: OPEN (active on the orderbook), PARTIAL (partially filled), FILLED (fully filled), CANCELED, or FAILED.
​
Get orders
Retrieve all orders for a wallet, including historical and active orders:

Request

Response
curl -X GET "https://synthesis.trade/api/v1/wallet/pol/{wallet_id}/orders" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
To get only active orders (orders currently on the orderbook):
curl -X GET "https://synthesis.trade/api/v1/wallet/pol/{wallet_id}/orders/active" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
​
Get positions
View all positions (shares) held by the wallet. Positions represent ownership of outcome tokens in prediction markets:

Request

Response
curl -X GET "https://synthesis.trade/api/v1/wallet/pol/{wallet_id}/positions" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
For real-time order and position updates, use the Balance WebSocket which streams live balance changes including position updates and order fills.
​
Step 7: Redeem and withdraw
When a market resolves, you can redeem your winning positions for USDC.e. After redemption, you can withdraw funds to any external wallet.
​
Redeem a position
After a market resolves, redeem your winning shares for USDC.e. You need the condition_id from your position:

Request

Response
curl -X POST "https://synthesis.trade/api/v1/wallet/pol/{wallet_id}/redeem/{condition_id}" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
​
Withdraw funds
Withdraw USDC.e from your Synthesis wallet to any external Polygon address:

Request

Response
curl -X POST "https://synthesis.trade/api/v1/wallet/pol/{wallet_id}/withdraw" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
      "token": "USDC.e",
      "amount": "50",
      "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
  }'
Withdrawals are processed on the Polygon network. Make sure the destination address is a valid Polygon address that can receive USDC.e tokens.
​


Authentication

Copy page

Three ways to authenticate with the Synthesis API

The Synthesis API uses three authentication methods depending on the type of request.
Project API key
Backend account management via X-PROJECT-API-KEY header. Create accounts, sessions, and API keys.
Account session
Frontend user auth via Authorization: Bearer header. Short-lived, refreshable tokens.
Account API key
Backend user operations via X-API-KEY header. Long-lived, revocable keys.
​
Quick reference
Auth Method	Header	Use Case	Routes
Project API Key	X-PROJECT-API-KEY	Backend account management	/api/v1/project/*
Session Token	Authorization: Bearer ...	Frontend user authentication	/api/v1/account/*, /api/v1/wallet/*
Account API Key	X-API-KEY	Backend user operations	/api/v1/account/*, /api/v1/wallet/*


Authentication
Project API key

Copy page

Authenticate backend requests for account management, sessions, and API keys

Project API keys are used when your backend server needs to manage accounts, create sessions, or generate account API keys. They are secret and should never be exposed to clients.
​
Header
Name	Type	Required	Description
X-PROJECT-API-KEY	string	Yes	Your project secret key, formatted as sk_...
​
Create an account

Request

Response
curl -X POST "https://synthesis.trade/api/v1/project/account" \
  -H "Content-Type: application/json" \
  -H "X-PROJECT-API-KEY: sk_aBcDeFgHiJkLmNoPqRsTuVwXyZ012345678901234=" \
  -d '{"metadata": {"user_id": "123"}}'
​
Create a session for an account

Request

Response
curl -X POST "https://synthesis.trade/api/v1/project/account/{account_id}/session" \
  -H "X-PROJECT-API-KEY: sk_aBcDeFgHiJkLmNoPqRsTuVwXyZ012345678901234="
​
Create an account API key

Request

Response
curl -X POST "https://synthesis.trade/api/v1/project/account/{account_id}/api-key" \
  -H "X-PROJECT-API-KEY: sk_aBcDeFgHiJkLmNoPqRsTuVwXyZ012345678901234="
The secret_key is only returned once when created. Store it securely immediately.
​
Available routes
All routes under /api/v1/project/* require the project API key.
Route	Method	Description
/api/v1/project/account	GET	List project accounts
/api/v1/project/account	POST	Create a new account
/api/v1/project/account/{id}	GET	Get a specific account
/api/v1/project/account/{id}/metadata	PUT	Update account metadata
/api/v1/project/account/{id}/session	POST	Create a session
/api/v1/project/account/{id}/session/{sid}/refresh	POST	Refresh a session
/api/v1/project/account/{id}/session/{sid}/expire	POST	Expire a session
/api/v1/project/account/{id}/sessions/expire-all	POST	Expire all sessions
/api/v1/project/account/{id}/api-key	GET	List account API keys
/api/v1/project/account/{id}/api-key	POST	Create an account API key
/api/v1/project/account/{id}/api-key/{pk}	DELETE	Delete an account API key



Authentication
Account session

Copy page

Authenticate frontend requests using short-lived session tokens

Session tokens are best for frontend applications where you need to authenticate users in the browser. Sessions are created by your backend using the project API key, then passed to the client.
Sessions expire after a period of inactivity but can be refreshed.
​
Header
Name	Type	Required	Description
Authorization	string	Yes	Bearer token format: Bearer <session_token>
​
Flow
1
Backend creates a session

Your server calls the session endpoint using the project API key.
2
Pass token to client

Return the session token to the frontend (e.g., via HTTP-only cookie or secure storage).
3
Client makes requests

The frontend sends the token in the Authorization header with each request.
​
Step 1: Create a session
This is called from your backend using the project API key.

Request

Response
curl -X POST "https://synthesis.trade/api/v1/project/account/{account_id}/session" \
  -H "X-PROJECT-API-KEY: sk_aBcDeFgHiJkLmNoPqRsTuVwXyZ012345678901234="
​
Step 2: Use the session token
Pass the token from the response as a Bearer token in your client requests.
curl -X GET "https://synthesis.trade/api/v1/wallets" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
​
Refresh a session
Expire the existing session and issue a new one. This extends the user’s authenticated session without requiring them to re-authenticate.

Request

Response
curl -X POST "https://synthesis.trade/api/v1/project/account/{account_id}/session/{session_id}/refresh" \
  -H "X-PROJECT-API-KEY: sk_aBcDeFgHiJkLmNoPqRsTuVwXyZ012345678901234="
​
Expire a session
Manually expire a specific session or all sessions for an account.

Expire one

Expire all
curl -X POST "https://synthesis.trade/api/v1/project/account/{account_id}/session/{session_id}/expire" \
  -H "X-PROJECT-API-KEY: sk_aBcDeFgHiJkLmNoPqRsTuVwXyZ012345678901234="
​
Available routes
All routes under /api/v1/account/* and /api/v1/wallet/* accept session tokens.
Route	Method	Description
/api/v1/account/session	GET	Get current session info
/api/v1/wallets	GET	List wallets
/api/v1/wallet/pol/{id}/order	POST	Place an order
/api/v1/wallet/pol/{id}/balance	GET	Get wallet balance
/api/v1/wallet/pol/{id}/positions	GET	Get positions
…		All wallet and account endpoints


Authentication
Account API key

Copy page

Authenticate backend requests on behalf of a specific user

Account API keys are best for backend services that need to make requests on behalf of a specific user without managing session tokens. They are long-lived and don’t expire unless revoked.
Store account API keys securely on your server. Never expose them to clients.
​
Header
Name	Type	Required	Description
X-API-KEY	string	Yes	Account secret key, formatted as sk_...
​
Create an account API key
This is called from your backend using the project API key.

Request

Response
curl -X POST "https://synthesis.trade/api/v1/project/account/{account_id}/api-key" \
  -H "Content-Type: application/json" \
  -H "X-PROJECT-API-KEY: sk_aBcDeFgHiJkLmNoPqRsTuVwXyZ012345678901234=" \
  -d '{"name": "trading-bot"}'
The secret_key is only shown once. Store it securely immediately after creation.
​
Use the API key
Pass the secret key in the X-API-KEY header for all account and wallet requests.
curl -X GET "https://synthesis.trade/api/v1/wallets" \
  -H "X-API-KEY: sk_xYzAbCdEfGhIjKlMnOpQrStUvWxYz987654321098="
​
List API keys
Retrieve all API keys for an account. Note that secret keys are not returned — only public keys and metadata.

Request

Response
curl -X GET "https://synthesis.trade/api/v1/project/account/{account_id}/api-key" \
  -H "X-PROJECT-API-KEY: sk_aBcDeFgHiJkLmNoPqRsTuVwXyZ012345678901234="
​
Delete an API key
Permanently revoke an API key. This cannot be undone.
curl -X DELETE "https://synthesis.trade/api/v1/project/account/{account_id}/api-key/{public_key}" \
  -H "X-PROJECT-API-KEY: sk_aBcDeFgHiJkLmNoPqRsTuVwXyZ012345678901234="
​
Available routes
All routes under /api/v1/account/* and /api/v1/wallet/* accept account API keys — the same routes that accept session tokens.
Route	Method	Description
/api/v1/account/session	GET	Get current session info
/api/v1/wallets	GET	List wallets
/api/v1/wallet/pol/{id}/order	POST	Place an order
/api/v1/wallet/pol/{id}/balance	GET	Get wallet balance
/api/v1/wallet/pol/{id}/positions	GET	Get positions
…		All wallet and account endpoints
​
Comparison with session tokens
Session Token	Account API Key
Best for	Frontend apps	Backend services
Lifetime	Expires after inactivity	Permanent until revoked
Security	Can be stored in browser	Must stay on server
Creation	Per-session via project key	One-time via project key




Real-time Data
Real-time data

Copy page

Stream live data via WebSockets for balances, orderbooks, and trades

Synthesis provides three WebSocket endpoints for real-time updates. All connections use the same pattern: connect, subscribe, receive initial state, then receive live updates.
Balance
Stream wallet balances, order fills, and position changes in real-time.
Orderbook
Live orderbook snapshots and delta updates for prediction markets.
Trades
Real-time trade executions, volume tracking, and whale alerts.
​
Connection basics
All WebSocket connections follow the same pattern:
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
The server sends ping frames every 30 seconds to keep connections alive. Your client should respond with pong frames automatically (most WebSocket libraries handle this).
​
Endpoints
Endpoint	Max Subscriptions	Description
wss://synthesis.trade/ws/balance	500 wallets	Wallet balances and order status
wss://synthesis.trade/ws/orderbook	5,000 markets	Orderbook snapshots and deltas
wss://synthesis.trade/ws/trades	1,000 markets	Trade executions


Real-time Data
Balance

Copy page

Stream real-time wallet balances, order fills, and position changes

The Balance WebSocket provides real-time updates for wallet balances, including USDC.e and all position token balances. It also streams order status updates, making it the primary channel for monitoring trading activity.
Endpoint: wss://synthesis.trade/ws/balance
​
Use cases
Use Case	Description
Live portfolio display	Show users their USDC.e balance and position values updating in real-time as trades execute
Order fill notifications	Get instant notifications when limit orders are filled, partially filled, or cancelled
Position tracking	Monitor position size changes as orders fill, including partial fills on large orders
Deposit confirmation	Detect when deposits arrive without polling, providing instant feedback to users
​
Subscribe
Subscribe by providing an array of wallet addresses. You can subscribe to multiple wallets at once (up to 500). The server automatically detects the chain based on address format (0x for Polygon, base58 for Solana).
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
Optionally filter to specific assets. This is useful when you only care about certain positions or just USDC.e:
ws.send(JSON.stringify({
    type: "subscribe",
    wallets: [
        {
            address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
            assets: ["USDC.e", "21742633143463906290569050155826241533067272736897614950488156847949938836455"]
        }
    ]
}));
​
Initial response
Upon subscribing, you receive the current balances for all subscribed wallets:
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
​
Real-time updates
After the initial snapshot, you receive updates whenever balances change:
{
    "success": true,
    "response": {
        "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        "asset": "21742633143463906290569050155826241533067272736897614950488156847949938836455",
        "balance": "35.384"
    }
}
Order status updates are also streamed through this channel:
{
    "success": true,
    "response": {
        "order_id": "0x1234567890abcdef...",
        "token_id": "21742633143463906290569050155826241533067272736897614950488156847949938836455",
        "filled": "15.384",
        "status": "PARTIAL"
    }
}
​
Complete example
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
        data.wallets.forEach(wallet => {
            console.log(`Wallet ${wallet.address} balances:`, wallet.balances);
        });
        return;
    }
    
    if (data.order_id) {
        console.log(`Order ${data.order_id} status: ${data.status}, filled: ${data.filled}`);
        return;
    }
    
    if (data.asset) {
        console.log(`${data.asset} balance changed to ${data.balance}`);
    }
};
Position token IDs are numeric strings. USDC.e is always keyed as "USDC.e". When a position balance reaches zero, you’ll receive an update with balance "0".



Real-time Data
Orderbook

Copy page

Stream real-time orderbook snapshots and delta updates for prediction markets

The Orderbook WebSocket streams real-time orderbook updates for prediction markets. Subscribe to multiple markets at once to build live trading interfaces with accurate bid/ask spreads and depth visualization.
Endpoint: wss://synthesis.trade/ws/orderbook
​
Use cases
Use Case	Description
Live price display	Show real-time best bid/ask prices derived from the top of the orderbook
Event pages	Subscribe to all markets in an event to show live prices for each outcome
Depth charts	Build orderbook depth visualizations showing liquidity at each price level
Spread monitoring	Track bid-ask spreads to identify trading opportunities or market inefficiencies
​
Subscribe
Subscribe using token IDs (for Polymarket) or market IDs (for Kalshi). You can subscribe to up to 5,000 markets at once:
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
​
Initial response
Upon subscribing, you receive the full orderbook for each market:
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
​
Real-time updates
After the initial snapshot, you receive delta updates whenever the orderbook changes:
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
​
Complete example: Event page
Build a live event page that shows prices for all markets in an event:
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
        data.orderbooks.forEach(({ orderbook }) => {
            orderbooks.set(orderbook.token_id, orderbook);
        });
        updateUI();
        return;
    }
    
    if (data.delta) {
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
For Polymarket, each market has two token IDs (left/right or YES/NO). Subscribe to both to show complete pricing. The best bid on YES roughly equals 1 minus the best ask on NO.



Real-time Data
Trades

Copy page

Stream real-time trade executions and build live trade feeds

The Trades WebSocket streams real-time trade executions for markets. Use this to show live trade feeds, calculate volume, and track market activity.
Endpoint: wss://synthesis.trade/ws/trades
​
Use cases
Use Case	Description
Trade feed	Display a live stream of trades showing price, size, side, and trader info
Volume tracking	Calculate real-time trading volume by aggregating trade amounts
Last trade price	Show the most recent execution price as an alternative to mid-market
Whale alerts	Monitor for large trades and alert users to significant market activity
​
Subscribe
Subscribe using condition IDs (market identifiers). You can subscribe to up to 1,000 markets:
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
​
Initial response
Upon subscribing, you receive recent historical trades:
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
​
Real-time updates
New trades are streamed as they occur:
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
​
Complete example: Trade feed
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
        trades.push(...data.trades.map(t => t.trade));
        renderTrades();
        return;
    }
    
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
Trades include Polymarket profile info (username, image) when available. For anonymous traders, you can display a truncated address instead.
Orderbook
Previous
