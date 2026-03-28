# Authentication

Three ways to authenticate with the Synthesis API.

The Synthesis API uses three authentication methods depending on the type of request:

| Method | Header | Use Case | Routes |
|--------|--------|----------|--------|
| **Project API Key** | `X-PROJECT-API-KEY` | Backend account management | `/api/v1/project/*` |
| **Session Token** | `Authorization: Bearer ...` | Frontend user authentication | `/api/v1/account/*`, `/api/v1/wallet/*` |
| **Account API Key** | `X-API-KEY` | Backend user operations | `/api/v1/account/*`, `/api/v1/wallet/*` |

---

## Project API Key

Authenticate backend requests for account management, sessions, and API keys.

Project API keys are used when your backend server needs to manage accounts, create sessions, or generate account API keys. They are secret and should **never** be exposed to clients.

### Header

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `X-PROJECT-API-KEY` | string | Yes | Your project secret key, formatted as `sk_...` |

### Create an Account

```bash
curl -X POST "https://synthesis.trade/api/v1/project/account" \
  -H "Content-Type: application/json" \
  -H "X-PROJECT-API-KEY: sk_aBcDeFgHiJkLmNoPqRsTuVwXyZ012345678901234=" \
  -d '{"metadata": {"user_id": "123"}}'
```

### Create a Session for an Account

```bash
curl -X POST "https://synthesis.trade/api/v1/project/account/{account_id}/session" \
  -H "X-PROJECT-API-KEY: sk_aBcDeFgHiJkLmNoPqRsTuVwXyZ012345678901234="
```

### Create an Account API Key

```bash
curl -X POST "https://synthesis.trade/api/v1/project/account/{account_id}/api-key" \
  -H "X-PROJECT-API-KEY: sk_aBcDeFgHiJkLmNoPqRsTuVwXyZ012345678901234="
```

The `secret_key` is only returned once when created. Store it securely immediately.

### Available Routes

All routes under `/api/v1/project/*` require the project API key.

| Route | Method | Description |
|-------|--------|-------------|
| `/api/v1/project/account` | GET | List project accounts |
| `/api/v1/project/account` | POST | Create a new account |
| `/api/v1/project/account/{id}` | GET | Get a specific account |
| `/api/v1/project/account/{id}/metadata` | PUT | Update account metadata |
| `/api/v1/project/account/{id}/session` | POST | Create a session |
| `/api/v1/project/account/{id}/session/{sid}/refresh` | POST | Refresh a session |
| `/api/v1/project/account/{id}/session/{sid}/expire` | POST | Expire a session |
| `/api/v1/project/account/{id}/sessions/expire-all` | POST | Expire all sessions |
| `/api/v1/project/account/{id}/api-key` | GET | List account API keys |
| `/api/v1/project/account/{id}/api-key` | POST | Create an account API key |
| `/api/v1/project/account/{id}/api-key/{pk}` | DELETE | Delete an account API key |

---

## Account Session

Authenticate frontend requests using short-lived session tokens.

Session tokens are best for frontend applications where you need to authenticate users in the browser. Sessions are created by your backend using the project API key, then passed to the client.

Sessions expire after a period of inactivity but can be refreshed.

### Header

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token format: `Bearer <session_token>` |

### Flow

1. **Backend creates a session** — Your server calls the session endpoint using the project API key
2. **Pass token to client** — Return the session token to the frontend (e.g., via HTTP-only cookie or secure storage)
3. **Client makes requests** — The frontend sends the token in the Authorization header with each request

### Step 1: Create a Session

This is called from your backend using the project API key:

```bash
curl -X POST "https://synthesis.trade/api/v1/project/account/{account_id}/session" \
  -H "X-PROJECT-API-KEY: sk_aBcDeFgHiJkLmNoPqRsTuVwXyZ012345678901234="
```

### Step 2: Use the Session Token

Pass the token from the response as a Bearer token in your client requests:

```bash
curl -X GET "https://synthesis.trade/api/v1/wallets" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Refresh a Session

Expire the existing session and issue a new one. This extends the user's authenticated session without requiring them to re-authenticate:

```bash
curl -X POST "https://synthesis.trade/api/v1/project/account/{account_id}/session/{session_id}/refresh" \
  -H "X-PROJECT-API-KEY: sk_aBcDeFgHiJkLmNoPqRsTuVwXyZ012345678901234="
```

### Expire a Session

Manually expire a specific session:

```bash
curl -X POST "https://synthesis.trade/api/v1/project/account/{account_id}/session/{session_id}/expire" \
  -H "X-PROJECT-API-KEY: sk_aBcDeFgHiJkLmNoPqRsTuVwXyZ012345678901234="
```

Expire all sessions for an account:

```bash
curl -X POST "https://synthesis.trade/api/v1/project/account/{account_id}/sessions/expire-all" \
  -H "X-PROJECT-API-KEY: sk_aBcDeFgHiJkLmNoPqRsTuVwXyZ012345678901234="
```

### Available Routes

All routes under `/api/v1/account/*` and `/api/v1/wallet/*` accept session tokens.

| Route | Method | Description |
|-------|--------|-------------|
| `/api/v1/account/session` | GET | Get current session info |
| `/api/v1/wallets` | GET | List wallets |
| `/api/v1/wallet/pol/{id}/order` | POST | Place an order |
| `/api/v1/wallet/pol/{id}/balance` | GET | Get wallet balance |
| `/api/v1/wallet/pol/{id}/positions` | GET | Get positions |
| ... | | All wallet and account endpoints |

---

## Account API Key

Authenticate backend requests on behalf of a specific user.

Account API keys are best for backend services that need to make requests on behalf of a specific user without managing session tokens. They are long-lived and don't expire unless revoked.

Store account API keys securely on your server. **Never** expose them to clients.

### Header

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `X-API-KEY` | string | Yes | Account secret key, formatted as `sk_...` |

### Create an Account API Key

This is called from your backend using the project API key:

```bash
curl -X POST "https://synthesis.trade/api/v1/project/account/{account_id}/api-key" \
  -H "Content-Type: application/json" \
  -H "X-PROJECT-API-KEY: sk_aBcDeFgHiJkLmNoPqRsTuVwXyZ012345678901234=" \
  -d '{"name": "trading-bot"}'
```

The `secret_key` is only shown once. Store it securely immediately after creation.

### Use the API Key

Pass the secret key in the `X-API-KEY` header for all account and wallet requests:

```bash
curl -X GET "https://synthesis.trade/api/v1/wallets" \
  -H "X-API-KEY: sk_xYzAbCdEfGhIjKlMnOpQrStUvWxYz987654321098="
```

### List API Keys

Retrieve all API keys for an account. Note that secret keys are not returned — only public keys and metadata:

```bash
curl -X GET "https://synthesis.trade/api/v1/project/account/{account_id}/api-key" \
  -H "X-PROJECT-API-KEY: sk_aBcDeFgHiJkLmNoPqRsTuVwXyZ012345678901234="
```

### Delete an API Key

Permanently revoke an API key. This cannot be undone:

```bash
curl -X DELETE "https://synthesis.trade/api/v1/project/account/{account_id}/api-key/{public_key}" \
  -H "X-PROJECT-API-KEY: sk_aBcDeFgHiJkLmNoPqRsTuVwXyZ012345678901234="
```

### Available Routes

All routes under `/api/v1/account/*` and `/api/v1/wallet/*` accept account API keys — the same routes that accept session tokens.

| Route | Method | Description |
|-------|--------|-------------|
| `/api/v1/account/session` | GET | Get current session info |
| `/api/v1/wallets` | GET | List wallets |
| `/api/v1/wallet/pol/{id}/order` | POST | Place an order |
| `/api/v1/wallet/pol/{id}/balance` | GET | Get wallet balance |
| `/api/v1/wallet/pol/{id}/positions` | GET | Get positions |
| ... | | All wallet and account endpoints |

---

## Comparison: Session Token vs Account API Key

| | Session Token | Account API Key |
|---|---|---|
| **Best for** | Frontend apps | Backend services |
| **Lifetime** | Expires after inactivity | Permanent until revoked |
| **Security** | Can be stored in browser | Must stay on server |
| **Creation** | Per-session via project key | One-time via project key |
| **Header** | `Authorization: Bearer ...` | `X-API-KEY: sk_...` |

---

## Security Best Practices

1. **Project API keys** — Never expose to clients; only use on your backend
2. **Account API keys** — Store securely on your server; never send to browsers
3. **Session tokens** — Use HTTP-only cookies or secure storage; implement proper expiration handling
4. **HTTPS only** — Always use HTTPS in production
5. **Key rotation** — Regularly rotate API keys and expire old sessions
