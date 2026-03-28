# Getting Started

Complete walkthrough from account creation to placing your first Polymarket order.

This guide walks you through the complete flow of integrating Synthesis into your application. By the end, you'll have created a user account, set up authentication, created a wallet, and placed your first Polymarket order.

## What You'll Learn

1. Create a user account
2. Create a session or API key
3. Get or create a wallet
4. Get wallet deposit address
5. Place a Polymarket order
6. View orders and positions
7. Redeem and withdraw

## Prerequisites

Before you begin, make sure you have:
- A Synthesis project with your `X-PROJECT-API-KEY`
- Basic familiarity with REST APIs and HTTP requests

---

## Step 1: Create a User Account

The first step is to create a user account for your end user. This is done from your backend using your project secret API key. Each account represents a unique user in your application and can have multiple wallets, sessions, and API keys.

The metadata field is optional and can store any JSON data you want to associate with the account, such as your internal user ID, email, or other identifiers.

```bash
curl -X POST "https://synthesis.trade/api/v1/project/account" \
  -H "Content-Type: application/json" \
  -H "X-PROJECT-API-KEY: YOUR_PROJECT_API_KEY" \
  -d '{
      "metadata": {
          "user_id": "your-internal-user-id",
          "email": "user@example.com"
      }
  }'
```

Save the `account_id` from the response. You'll need it to create sessions and API keys for this user. Alternatively, you can retrieve existing accounts by calling `GET /api/v1/project/accounts`.

---

## Step 2: Create a Session or API Key

Now you need to authenticate the user. There are two approaches depending on your use case:

### Option A: Session Token

Best for frontend applications. Create a session and store the token in the user's browser. Sessions expire after a period of inactivity but can be refreshed.

Create a session for the account:

```bash
curl -X POST "https://synthesis.trade/api/v1/project/account/{account_id}/session" \
  -H "Content-Type: application/json" \
  -H "X-PROJECT-API-KEY: YOUR_PROJECT_API_KEY"
```

Use the session token in the Authorization header for all subsequent account requests:

```bash
curl -X GET "https://synthesis.trade/api/v1/account/session" \
  -H "Authorization: Bearer aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789..."
```

### Option B: Account API Key

Best for backend services. Create a long-lived API key that your server can use to make requests on behalf of the user. API keys don't expire unless revoked.

```bash
curl -X POST "https://synthesis.trade/api/v1/project/account/{account_id}/api-key" \
  -H "Content-Type: application/json" \
  -H "X-PROJECT-API-KEY: YOUR_PROJECT_API_KEY"
```

The `secret_key` is only shown once. Store it securely immediately after creation.

Use the secret key in the `X-API-KEY` header for all subsequent account requests:

```bash
curl -X GET "https://synthesis.trade/api/v1/account/session" \
  -H "X-API-KEY: sk_aBcDeFgHiJkLmNoPqRsTuVwXyZ012345678901234"
```

---

## Step 3: Get or Create a Wallet

Each account can have multiple wallets for trading. The easiest way to get started is to call the `GET /api/v1/wallets` endpoint, which will automatically create a Polygon wallet if one doesn't exist.

```bash
curl -X GET "https://synthesis.trade/api/v1/wallets" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

Alternatively, you can explicitly create a wallet:

```bash
curl -X POST "https://synthesis.trade/api/v1/wallet/pol" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

Save the `wallet_id` from the response. You'll use it for deposits, orders, and other wallet operations. You can always retrieve your wallets later by calling `GET /api/v1/wallet`.

---

## Step 4: Get Wallet Deposit Address

Before placing orders, the wallet needs USDC. There are two ways to get deposit addresses.

### Option A: Native Polygon Deposit

The wallet's Polygon address can receive USDC directly on the Polygon network:

```bash
curl -X GET "https://synthesis.trade/api/v1/wallet/pol" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

Display the address to your user so they can deposit USDC (on Polygon) to fund their trading wallet.

### Option B: Cross-chain Deposit

Users can also deposit from other chains (Ethereum, Base, Arbitrum, Solana, etc.) using the cross-chain deposit endpoint. This generates a unique deposit address that automatically bridges funds to the Polygon wallet:

```bash
curl -X GET "https://synthesis.trade/api/v1/wallet/POL/{wallet_id}/deposit/EVM" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

Supported chain parameter values: `EVM` (Ethereum, Arbitrum, Base, Optimism, Binance), `SOL`, `TRON`.

### Check Wallet Balance

You can check the wallet balance at any time:

```bash
curl -X GET "https://synthesis.trade/api/v1/wallet/pol/{wallet_id}/balance" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

---

## Step 5: Place a Polymarket Order

Now you're ready to place your first order. You'll need the `token_id` of the market outcome you want to trade. You can get this from the market endpoints.

First, find a market and get its token IDs:

```bash
curl -X GET "https://synthesis.trade/api/v1/markets/search/bitcoin?venue=polymarket"
```

Then place a market order. This example buys $10 worth of YES shares at market price:

```bash
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
```

### Order Types

| Type | Description |
|------|-------------|
| `MARKET` | Execute immediately at best available price |
| `LIMIT` | Execute only at specified price or better |
| `STOPLOSS` | Trigger a market sell when price drops to threshold |

### Order Parameters

| Parameter | Description |
|-----------|-------------|
| `token_id` | The Polymarket token ID for the outcome you want to trade |
| `side` | `BUY` or `SELL` |
| `type` | `MARKET`, `LIMIT`, or `STOPLOSS` |
| `amount` | Order amount as a string |
| `units` | `USDC` (dollar amount) or `SHARES` (number of shares) |
| `price` | Required for `LIMIT` and `STOPLOSS` orders (0.001 to 0.999) |

---

## Step 6: View Orders and Positions

After placing orders, you can track their status and view your positions. Orders can be in various states: `OPEN` (active on the orderbook), `PARTIAL` (partially filled), `FILLED` (fully filled), `CANCELED`, or `FAILED`.

### Get Orders

Retrieve all orders for a wallet, including historical and active orders:

```bash
curl -X GET "https://synthesis.trade/api/v1/wallet/pol/{wallet_id}/orders" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

To get only active orders (orders currently on the orderbook):

```bash
curl -X GET "https://synthesis.trade/api/v1/wallet/pol/{wallet_id}/orders/active" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

### Get Positions

View all positions (shares) held by the wallet. Positions represent ownership of outcome tokens in prediction markets:

```bash
curl -X GET "https://synthesis.trade/api/v1/wallet/pol/{wallet_id}/positions" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

For real-time order and position updates, use the [Balance WebSocket](./websockets.md#balance-websocket) which streams live balance changes including position updates and order fills.

---

## Step 7: Redeem and Withdraw

When a market resolves, you can redeem your winning positions for USDC.e. After redemption, you can withdraw funds to any external wallet.

### Redeem a Position

After a market resolves, redeem your winning shares for USDC.e. You need the `condition_id` from your position:

```bash
curl -X POST "https://synthesis.trade/api/v1/wallet/pol/{wallet_id}/redeem/{condition_id}" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

### Withdraw Funds

Withdraw USDC.e from your Synthesis wallet to any external Polygon address:

```bash
curl -X POST "https://synthesis.trade/api/v1/wallet/pol/{wallet_id}/withdraw" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
      "token": "USDC.e",
      "amount": "50",
      "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
  }'
```

Withdrawals are processed on the Polygon network. Make sure the destination address is a valid Polygon address that can receive USDC.e tokens.

---

## Next Steps

- Learn about the three [authentication methods](./authentication.md)
- Set up [real-time data streaming](./websockets.md) with WebSockets
- Explore the complete [API reference](../api/reference.md)
