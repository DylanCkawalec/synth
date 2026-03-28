> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Project Accounts

> Get active accounts for the project.



## OpenAPI

````yaml /openapi.json get /api/v1/project/account
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/project/account:
    get:
      tags:
        - Projects
      summary: Get Project Accounts
      description: Get active accounts for the project.
      operationId: get-project-accounts
      parameters:
        - name: limit
          in: query
          required: false
          description: Maximum accounts to return. Capped at `5000`.
          schema:
            type: integer
            default: 1000
            example: 100
        - name: offset
          in: query
          required: false
          description: Pagination offset.
          schema:
            type: integer
            default: 0
            example: 0
      responses:
        '200':
          description: Project accounts
          content:
            application/json:
              example:
                success: true
                response:
                  - account_id: 01234567-89ab-cdef-0123-456789abcdef
                    metadata: {}
                    created_at: '2026-01-01T00:00:00'
      security:
        - ProjectApiKey: []
components:
  securitySchemes:
    ProjectApiKey:
      type: apiKey
      in: header
      name: X-PROJECT-API-KEY
      description: Project secret API key.

````

Built with [Mintlify](https://mintlify.com).


> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Project Accounts

> Get active accounts for the project.



## OpenAPI

````yaml /openapi.json get /api/v1/project/account
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/project/account:
    get:
      tags:
        - Projects
      summary: Get Project Accounts
      description: Get active accounts for the project.
      operationId: get-project-accounts
      parameters:
        - name: limit
          in: query
          required: false
          description: Maximum accounts to return. Capped at `5000`.
          schema:
            type: integer
            default: 1000
            example: 100
        - name: offset
          in: query
          required: false
          description: Pagination offset.
          schema:
            type: integer
            default: 0
            example: 0
      responses:
        '200':
          description: Project accounts
          content:
            application/json:
              example:
                success: true
                response:
                  - account_id: 01234567-89ab-cdef-0123-456789abcdef
                    metadata: {}
                    created_at: '2026-01-01T00:00:00'
      security:
        - ProjectApiKey: []
components:
  securitySchemes:
    ProjectApiKey:
      type: apiKey
      in: header
      name: X-PROJECT-API-KEY
      description: Project secret API key.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Project Account

> Fetch a single active project account.



## OpenAPI

````yaml /openapi.json get /api/v1/project/account/{account_id}
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/project/account/{account_id}:
    get:
      tags:
        - Projects
      summary: Get Project Account
      description: Fetch a single active project account.
      operationId: get-project-account
      parameters:
        - name: account_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Project account
          content:
            application/json:
              example:
                success: true
                response:
                  account_id: 01234567-89ab-cdef-0123-456789abcdef
                  metadata: {}
                  created_at: '2026-01-01T00:00:00'
        '404':
          description: Account not found
          content:
            application/json:
              example:
                success: false
                response: Account not found
      security:
        - ProjectApiKey: []
components:
  securitySchemes:
    ProjectApiKey:
      type: apiKey
      in: header
      name: X-PROJECT-API-KEY
      description: Project secret API key.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Update Project Account Metadata

> Replace the metadata for a project account.



## OpenAPI

````yaml /openapi.json put /api/v1/project/account/{account_id}/metadata
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/project/account/{account_id}/metadata:
    put:
      tags:
        - Projects
      summary: Update Project Account Metadata
      description: Replace the metadata for a project account.
      operationId: update-project-account-metadata
      parameters:
        - name: account_id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - metadata
              properties:
                metadata:
                  type: object
                  description: >-
                    New metadata payload. Serialized JSON must be at most 8192
                    bytes.
      responses:
        '200':
          description: Project account metadata updated
          content:
            application/json:
              example:
                success: true
                response:
                  account_id: 01234567-89ab-cdef-0123-456789abcdef
                  metadata: {}
                  created_at: '2026-01-01T00:00:00'
      security:
        - ProjectApiKey: []
components:
  securitySchemes:
    ProjectApiKey:
      type: apiKey
      in: header
      name: X-PROJECT-API-KEY
      description: Project secret API key.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Create Account Session

> Create a session for a project account. The returned session is used as `Authorization: Bearer <session>`.



## OpenAPI

````yaml /openapi.json post /api/v1/project/account/{account_id}/session
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/project/account/{account_id}/session:
    post:
      tags:
        - Projects
      summary: Create Account Session
      description: >-
        Create a session for a project account. The returned session is used as
        `Authorization: Bearer <session>`.
      operationId: create-project-account-session
      parameters:
        - name: account_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '201':
          description: Account session created
          content:
            application/json:
              example:
                success: true
                response:
                  account_id: ...
                  session_id: ...
                  created_at: '2026-01-01T00:00:00'
                  expires_at: '2026-01-08T00:00:00'
      security:
        - ProjectApiKey: []
components:
  securitySchemes:
    ProjectApiKey:
      type: apiKey
      in: header
      name: X-PROJECT-API-KEY
      description: Project secret API key.

````

Built with [Mintlify](https://mintlify.com).


> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Refresh Account Session

> Expire the existing session and issue a new one.



## OpenAPI

````yaml /openapi.json post /api/v1/project/account/{account_id}/session/{session_id}/refresh
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/project/account/{account_id}/session/{session_id}/refresh:
    post:
      tags:
        - Projects
      summary: Refresh Account Session
      description: Expire the existing session and issue a new one.
      operationId: refresh-project-account-session
      parameters:
        - name: account_id
          in: path
          required: true
          schema:
            type: string
        - name: session_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Account session refreshed
          content:
            application/json:
              example:
                success: true
                response:
                  account_id: 01234567-89ab-cdef-0123-456789abcdef
                  session_id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
                  created_at: '2026-01-01T00:00:00'
                  expires_at: '2026-01-08T00:00:00'
      security:
        - ProjectApiKey: []
components:
  securitySchemes:
    ProjectApiKey:
      type: apiKey
      in: header
      name: X-PROJECT-API-KEY
      description: Project secret API key.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Expire Account Session

> Expire a specific session for a project account.



## OpenAPI

````yaml /openapi.json post /api/v1/project/account/{account_id}/session/{session_id}/expire
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/project/account/{account_id}/session/{session_id}/expire:
    post:
      tags:
        - Projects
      summary: Expire Account Session
      description: Expire a specific session for a project account.
      operationId: expire-project-account-session
      parameters:
        - name: account_id
          in: path
          required: true
          schema:
            type: string
        - name: session_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Account session expired
          content:
            application/json:
              example:
                success: true
                response:
                  expired: true
      security:
        - ProjectApiKey: []
components:
  securitySchemes:
    ProjectApiKey:
      type: apiKey
      in: header
      name: X-PROJECT-API-KEY
      description: Project secret API key.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Expire All Account Sessions

> Expire every active session for the project account.



## OpenAPI

````yaml /openapi.json post /api/v1/project/account/{account_id}/sessions/expire-all
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/project/account/{account_id}/sessions/expire-all:
    post:
      tags:
        - Projects
      summary: Expire All Account Sessions
      description: Expire every active session for the project account.
      operationId: expire-project-account-sessions
      parameters:
        - name: account_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: All sessions expired
          content:
            application/json:
              example:
                success: true
                response:
                  expired: 2
      security:
        - ProjectApiKey: []
components:
  securitySchemes:
    ProjectApiKey:
      type: apiKey
      in: header
      name: X-PROJECT-API-KEY
      description: Project secret API key.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Account API Keys

> Get account secret API keys for a specific project account.



## OpenAPI

````yaml /openapi.json get /api/v1/project/account/{account_id}/api-key
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/project/account/{account_id}/api-key:
    get:
      tags:
        - Projects
      summary: Get Account API Keys
      description: Get account secret API keys for a specific project account.
      operationId: get-project-account-api-keys
      parameters:
        - name: account_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Account API keys
          content:
            application/json:
              example:
                success: true
                response:
                  - public_key: pk_...
                    name: bot
                    active: true
                    created_at: '2026-01-01T00:00:00'
                    updated_at: '2026-01-01T00:00:00'
      security:
        - ProjectApiKey: []
components:
  securitySchemes:
    ProjectApiKey:
      type: apiKey
      in: header
      name: X-PROJECT-API-KEY
      description: Project secret API key.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Create Account API Key

> Create an account secret API key for a specific project account.



## OpenAPI

````yaml /openapi.json post /api/v1/project/account/{account_id}/api-key
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/project/account/{account_id}/api-key:
    post:
      tags:
        - Projects
      summary: Create Account API Key
      description: Create an account secret API key for a specific project account.
      operationId: create-project-account-api-key
      parameters:
        - name: account_id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                  description: >-
                    Optional key name. Must be at most 64 characters and use
                    only letters, numbers, `-`, or `_`.
                  example: trading-bot
      responses:
        '201':
          description: Account API key created
          content:
            application/json:
              example:
                success: true
                response:
                  public_key: pk_...
                  secret_key: sk_...
                  name: trading-bot
                  active: true
                  created_at: '2026-01-01T00:00:00'
                  updated_at: '2026-01-01T00:00:00'
      security:
        - ProjectApiKey: []
components:
  securitySchemes:
    ProjectApiKey:
      type: apiKey
      in: header
      name: X-PROJECT-API-KEY
      description: Project secret API key.

````

Built with [Mintlify](https://mintlify.com).


> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Delete Account API Key

> Delete a project account API key.



## OpenAPI

````yaml /openapi.json delete /api/v1/project/account/{account_id}/api-key/{public_key}
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/project/account/{account_id}/api-key/{public_key}:
    delete:
      tags:
        - Projects
      summary: Delete Account API Key
      description: Delete a project account API key.
      operationId: delete-project-account-api-key
      parameters:
        - name: account_id
          in: path
          required: true
          schema:
            type: string
        - name: public_key
          in: path
          required: true
          description: Public key to delete.
          schema:
            type: string
      responses:
        '200':
          description: Account API key deleted
          content:
            application/json:
              example:
                success: true
                response:
                  deleted: true
      security:
        - ProjectApiKey: []
components:
  securitySchemes:
    ProjectApiKey:
      type: apiKey
      in: header
      name: X-PROJECT-API-KEY
      description: Project secret API key.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Account Session

> Validate account authentication. This route accepts either a bearer session or an account API key.



## OpenAPI

````yaml /openapi.json get /api/v1/account/session
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/account/session:
    get:
      tags:
        - Accounts
      summary: Get Account Session
      description: >-
        Validate account authentication. This route accepts either a bearer
        session or an account API key.
      operationId: get-account-session
      responses:
        '200':
          description: Account authenticated
          content:
            application/json:
              example:
                success: true
                response:
                  authenticated: true
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Expire Current Session

> Expire the current account session. This route requires a bearer session.



## OpenAPI

````yaml /openapi.json post /api/v1/account/session/expire
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/account/session/expire:
    post:
      tags:
        - Accounts
      summary: Expire Current Session
      description: >-
        Expire the current account session. This route requires a bearer
        session.
      operationId: expire-account-session
      responses:
        '200':
          description: Current session expired
          content:
            application/json:
              examples:
                Current session expired:
                  value:
                    success: true
                    response:
                      expired: true
                No active session remained to expire:
                  value:
                    success: true
                    response:
                      expired: false
      security:
        - AccountSession: []
components:
  securitySchemes:
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Account API Keys

> Get account secret API keys for the authenticated account.



## OpenAPI

````yaml /openapi.json get /api/v1/account/api-key
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/account/api-key:
    get:
      tags:
        - Accounts
      summary: Get Account API Keys
      description: Get account secret API keys for the authenticated account.
      operationId: get-account-api-keys
      responses:
        '200':
          description: Account API keys
          content:
            application/json:
              example:
                success: true
                response:
                  - public_key: pk_...
                    name: bot
                    active: true
                    created_at: '2026-01-01T00:00:00'
                    updated_at: '2026-01-01T00:00:00'
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Create Account API Key

> Create an account secret API key for the authenticated account. This route requires a bearer session.



## OpenAPI

````yaml /openapi.json post /api/v1/account/api-key
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/account/api-key:
    post:
      tags:
        - Accounts
      summary: Create Account API Key
      description: >-
        Create an account secret API key for the authenticated account. This
        route requires a bearer session.
      operationId: create-account-api-key
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                  description: >-
                    Optional key name. Must be at most 64 characters and use
                    only letters, numbers, `-`, or `_`.
                  example: bot
      responses:
        '201':
          description: Account API key created
          content:
            application/json:
              example:
                success: true
                response:
                  public_key: pk_...
                  secret_key: sk_...
                  name: bot
                  active: true
                  created_at: '2026-01-01T00:00:00'
                  updated_at: '2026-01-01T00:00:00'
      security:
        - AccountSession: []
components:
  securitySchemes:
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).


> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Delete Account API Key

> Delete an account secret API key. This route requires a bearer session.



## OpenAPI

````yaml /openapi.json delete /api/v1/account/api-key/{public_key}
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/account/api-key/{public_key}:
    delete:
      tags:
        - Accounts
      summary: Delete Account API Key
      description: Delete an account secret API key. This route requires a bearer session.
      operationId: delete-account-api-key
      parameters:
        - name: public_key
          in: path
          required: true
          description: Public key to delete.
          schema:
            type: string
      responses:
        '200':
          description: Account API key deleted
          content:
            application/json:
              example:
                success: true
                response:
                  deleted: true
      security:
        - AccountSession: []
components:
  securitySchemes:
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Delete Account API Key

> Delete an account secret API key. This route requires a bearer session.



## OpenAPI

````yaml /openapi.json delete /api/v1/account/api-key/{public_key}
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/account/api-key/{public_key}:
    delete:
      tags:
        - Accounts
      summary: Delete Account API Key
      description: Delete an account secret API key. This route requires a bearer session.
      operationId: delete-account-api-key
      parameters:
        - name: public_key
          in: path
          required: true
          description: Public key to delete.
          schema:
            type: string
      responses:
        '200':
          description: Account API key deleted
          content:
            application/json:
              example:
                success: true
                response:
                  deleted: true
      security:
        - AccountSession: []
components:
  securitySchemes:
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Update Account Interests

> Replace the account interest tags used by recommendation flows.



## OpenAPI

````yaml /openapi.json post /api/v1/account/interests
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/account/interests:
    post:
      tags:
        - Accounts
      summary: Update Account Interests
      description: Replace the account interest tags used by recommendation flows.
      operationId: update-account-interests
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - interests
              properties:
                interests:
                  type: array
                  items:
                    type: string
                  description: >-
                    Array of 1-10 interest tags. Each tag must be 2-20
                    characters and use only letters, `_`, or `-`.
                  example:
                    - crypto
                    - politics
      responses:
        '200':
          description: Account interests updated
          content:
            application/json:
              example:
                success: true
                response:
                  - crypto
                  - politics
        '400':
          description: Invalid interests
          content:
            application/json:
              example:
                success: false
                response: Invalid interests
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Markets

> Get markets across venues with filters for venue, price, dates, labels, and sorting.



## OpenAPI

````yaml /openapi.json get /api/v1/markets
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/markets:
    get:
      tags:
        - Markets
      summary: Get Markets
      description: >-
        Get markets across venues with filters for venue, price, dates, labels,
        and sorting.
      operationId: get-markets
      parameters:
        - name: venue
          in: query
          required: false
          description: 'Filter by venue. Supported values: `polymarket` or `kalshi`.'
          schema:
            type: string
            example: polymarket
        - name: sort
          in: query
          required: false
          description: >-
            Sort field. Supported values: `liquidity`, `volume`, `created_at`,
            `ends_at`, or `newest` (alias for `created_at`).
          schema:
            type: string
            default: volume
            example: ends_at
        - name: order
          in: query
          required: false
          description: 'Sort direction. Supported values: `ASC` or `DESC`.'
          schema:
            type: string
            default: DESC
            example: ASC
        - name: limit
          in: query
          required: false
          description: Maximum events to return. Capped at `250`.
          schema:
            type: integer
            default: 100
            example: 50
        - name: offset
          in: query
          required: false
          description: Pagination offset.
          schema:
            type: integer
            default: 0
            example: 0
        - name: min_price
          in: query
          required: false
          description: Minimum market price.
          schema:
            type: number
        - name: max_price
          in: query
          required: false
          description: Maximum market price.
          schema:
            type: number
        - name: min_ends_at
          in: query
          required: false
          description: Minimum end timestamp or ISO 8601 date.
          schema:
            type: string
        - name: max_ends_at
          in: query
          required: false
          description: Maximum end timestamp or ISO 8601 date.
          schema:
            type: string
        - name: rewards
          in: query
          required: false
          description: Only include reward markets.
          schema:
            type: boolean
            default: false
        - name: live
          in: query
          required: false
          description: Only include live markets.
          schema:
            type: boolean
            default: false
        - name: bonds
          in: query
          required: false
          description: Only include bond-like markets.
          schema:
            type: boolean
            default: false
        - name: tags
          in: query
          required: false
          description: Comma-separated label filter.
          schema:
            type: string
            example: crypto,politics
        - name: markets
          in: query
          required: false
          description: Include nested markets in the response.
          schema:
            type: boolean
            default: true
      responses:
        '200':
          description: Unified market list
          content:
            application/json:
              example:
                success: true
                response:
                  - venue: polymarket
                    event:
                      event_id: 12345
                      title: Will Bitcoin reach $100k by end of 2025?
                      slug: will-bitcoin-reach-100k-by-end-of-2025
                      description: >-
                        This market resolves to Yes if spot Bitcoin trades at or
                        above $100,000 before 2025 ends.
                      image: https://example.com/bitcoin.png
                      tags:
                        - crypto
                        - bitcoin
                      labels:
                        - crypto
                        - macro
                      neg_risk: false
                      active: true
                      liquidity: 1500000
                      volume: 5000000
                      volume24hr: 250000
                      volume1wk: 900000
                      volume1mo: 2200000
                      volume1yr: 5000000
                      live:
                        live: false
                        ended: false
                      created_at: '2026-01-01T00:00:00'
                      ends_at: '2026-12-31T23:59:59'
                    markets:
                      - event_id: 12345
                        condition_id: >-
                          0xbd71b43bb47eb60dbcb41fa25df2a0ed4da612873d6e0447a2c730bd4cc25910
                        question: Will Bitcoin reach $100k?
                        outcome: 'Yes'
                        slug: will-bitcoin-reach-100k-yes
                        description: >-
                          Buy Yes if you think Bitcoin will trade at or above
                          $100,000 before market expiry.
                        image: https://example.com/bitcoin-market.png
                        left_outcome: 'Yes'
                        right_outcome: 'No'
                        left_price: '0.65'
                        right_price: '0.35'
                        left_token_id: >-
                          21742633143463906290569050155826241533067272736897614950488156847949938836455
                        right_token_id: >-
                          48572956138472615938471625938471659384716593847165938471659384716593847165938
                        winner_token_id: ''
                        active: true
                        resolved: false
                        fees: true
                        decimals: 6
                        liquidity: '1500000'
                        volume: '5000000'
                        volume24hr: '250000'
                        volume1wk: '900000'
                        volume1mo: '2200000'
                        volume1yr: '5000000'
                        rewards:
                          rewards: false
                        created_at: '2026-01-01T00:00:00'
                        updated_at: '2026-01-01T00:00:00'
                        ends_at: '2026-12-31T23:59:59'
                  - venue: kalshi
                    event:
                      series_id: KXBTC
                      event_id: KXBTC-25
                      title: Bitcoin above $100,000 on Dec 31?
                      sub_title: Expires at year end
                      slug: bitcoin-above-100000-on-dec-31
                      image: https://example.com/kalshi-bitcoin.png
                      tags:
                        - crypto
                        - bitcoin
                      labels:
                        - crypto
                        - macro
                      category: Crypto
                      active: true
                      liquidity: 800000
                      volume: 3000000
                      live:
                        is_active: true
                      created_at: '2026-01-01T00:00:00'
                      ends_at: '2026-12-31T23:59:59'
                    markets:
                      - series_id: KXBTC
                        event_id: KXBTC-25
                        market_id: KXBTC-25-T100000
                        kalshi_id: T100000
                        title: Bitcoin above $100,000?
                        outcome: 'Yes'
                        description: >-
                          Resolves Yes if Bitcoin settles above $100,000 on
                          expiration.
                        image: https://example.com/kalshi-bitcoin-market.png
                        left_outcome: 'Yes'
                        right_outcome: 'No'
                        left_price: '0.58'
                        right_price: '0.42'
                        left_token_id: BRjpCHtyQLeSRWyE1yTdBQbhLkny5oEnveRijBjRoiA
                        right_token_id: F4r2GpoNU8MBMdKqP6MCBzKEHe2Mt8s5qm4GrFcJQnbJ
                        winner_token_id: ''
                        active: true
                        resolved: false
                        claimable: false
                        liquidity: '800000'
                        open_interest: '1200000'
                        volume: '3000000'
                        volume24hr: '175000'
                        dflow:
                          enabled: true
                        created_at: '2026-01-01T00:00:00'
                        updated_at: '2026-01-01T00:00:00'
                        ends_at: '2026-12-31T23:59:59'
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Market Sparklines

> Fetch sparkline history for a batch of market identifiers. The request body is a JSON array of market identifiers.



## OpenAPI

````yaml /openapi.json post /api/v1/markets/sparklines
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/markets/sparklines:
    post:
      tags:
        - Markets
      summary: Get Market Sparklines
      description: >-
        Fetch sparkline history for a batch of market identifiers. The request
        body is a JSON array of market identifiers.
      operationId: get-market-sparklines
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - markets
              properties:
                markets:
                  type: array
                  items:
                    type: string
                  description: >-
                    JSON array body. Accepts both Polymarket token IDs and
                    Kalshi market IDs. Kalshi inputs may be `market_id` or
                    `market_id:Yes` / `market_id:No`; if no outcome is supplied,
                    it defaults to `Yes`.
                  example:
                    - '12345'
                    - KXBTC-25-T100000:Yes
      responses:
        '200':
          description: Sparkline history by market identifier
          content:
            application/json:
              example:
                success: true
                response:
                  '12345':
                    - 0.41
                    - 0.44
                    - 0.48
                  KXBTC-25-T100000:Yes:
                    - 0.52
                    - 0.54
                    - 0.58
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Market Prices

> Fetch current prices for a batch of market identifiers. Accepts both Polymarket token IDs and Kalshi market IDs. Maximum 5000 markets per request.



## OpenAPI

````yaml /openapi.json post /api/v1/markets/prices
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/markets/prices:
    post:
      tags:
        - Markets
      summary: Get Market Prices
      description: >-
        Fetch current prices for a batch of market identifiers. Accepts both
        Polymarket token IDs and Kalshi market IDs. Maximum 5000 markets per
        request.
      operationId: get-market-prices
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - markets
              properties:
                markets:
                  type: array
                  items:
                    type: string
                  description: >-
                    Array of market identifiers. Accepts both Polymarket token
                    IDs and Kalshi market IDs.
                  example:
                    - >-
                      21742633143463906290569050155826241533067272736897614950488156847949938836455
                    - KXBTC-25-T100000
      responses:
        '200':
          description: Current prices by market identifier
          content:
            application/json:
              example:
                success: true
                response:
                  prices:
                    '21742633143463906290569050155826241533067272736897614950488156847949938836455': 0.64
                    KXBTC-25-T100000:
                      'Yes': 0.58
                      'No': 0.42
      security: []

````

Built with [Mintlify](https://mintlify.com).


> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Orderbooks

> Fetch current orderbooks for multiple markets. Accepts both Polymarket token IDs and Kalshi market IDs. The endpoint automatically detects the venue based on the ID format. Returns an array of orderbooks with venue information.



## OpenAPI

````yaml /openapi.json post /api/v1/markets/orderbooks
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/markets/orderbooks:
    post:
      tags:
        - Markets
      summary: Get Orderbooks
      description: >-
        Fetch current orderbooks for multiple markets. Accepts both Polymarket
        token IDs and Kalshi market IDs. The endpoint automatically detects the
        venue based on the ID format. Returns an array of orderbooks with venue
        information.
      operationId: get-market-orderbooks
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - markets
              properties:
                markets:
                  type: array
                  items:
                    type: string
                  description: >-
                    Array of market identifiers. Accepts both Polymarket token
                    IDs and Kalshi market IDs. Maximum 5000 markets per request.
                  example:
                    - >-
                      21742633143463906290569050155826241533067272736897614950488156847949938836455
                    - KXBTC-25-T100000
      responses:
        '200':
          description: Orderbooks array
          content:
            application/json:
              example:
                success: true
                response:
                  - venue: polymarket
                    orderbook:
                      condition_id: >-
                        0xbd71b43bb47eb60dbcb41fa25df2a0ed4da612873d6e0447a2c730bd4cc25910
                      token_id: >-
                        21742633143463906290569050155826241533067272736897614950488156847949938836455
                      bids:
                        '0.61': '1000'
                        '0.60': '800'
                      asks:
                        '0.62': '900'
                        '0.63': '600'
                      best_bid: '0.61'
                      best_ask: '0.62'
                      hash: abc123
                      created_at: '2026-01-01T00:00:00'
                  - venue: kalshi
                    orderbook:
                      market_id: KXBTC-25-T100000
                      'yes':
                        bids:
                          '58': '25'
                        asks:
                          '60': '15'
                        best_bid: '58'
                        best_ask: '60'
                      'no':
                        bids:
                          '40': '15'
                        asks:
                          '42': '20'
                        best_bid: '40'
                        best_ask: '42'
                      sequence: 12345
                      created_at: '2026-01-01T00:00:00'
        '400':
          description: Invalid request
          content:
            application/json:
              example:
                success: false
                response: Invalid markets
      security: []

````

Built with [Mintlify](https://mintlify.com).


> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Historical Orderbooks

> Fetch historical orderbook snapshots for a single market stream. This route is for stored historical orderbooks, not the live websocket feed. The response shape depends on `venue`: Polymarket returns Polymarket orderbook snapshots keyed by `token_id`, while Kalshi returns Kalshi orderbook snapshots keyed by `market_id` with separate `yes` and `no` books.



## OpenAPI

````yaml /openapi.json get /api/v1/markets/orderbooks/historical
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/markets/orderbooks/historical:
    get:
      tags:
        - Markets
      summary: Get Historical Orderbooks
      description: >-
        Fetch historical orderbook snapshots for a single market stream. This
        route is for stored historical orderbooks, not the live websocket feed.
        The response shape depends on `venue`: Polymarket returns Polymarket
        orderbook snapshots keyed by `token_id`, while Kalshi returns Kalshi
        orderbook snapshots keyed by `market_id` with separate `yes` and `no`
        books.
      operationId: get-market-historical-orderbooks
      parameters:
        - name: venue
          in: query
          required: true
          description: >-
            Venue selector. Required. Supported values: `polymarket` or
            `kalshi`.
          schema:
            type: string
            example: polymarket
        - name: token_id
          in: query
          required: false
          description: >-
            Required when `venue=polymarket`. Polymarket token ID whose
            historical orderbook snapshots should be returned. Missing or empty
            values are rejected for Polymarket requests.
          schema:
            type: string
            example: >-
              21742633143463906290569050155826241533067272736897614950488156847949938836455
        - name: market_id
          in: query
          required: false
          description: >-
            Required when `venue=kalshi`. Kalshi market ID whose historical
            orderbook snapshots should be returned. Missing or empty values are
            rejected for Kalshi requests.
          schema:
            type: string
            example: KXBTC-25-T100000
        - name: start
          in: query
          required: false
          description: >-
            Range start. Accepts Unix seconds, Unix milliseconds, or an RFC 3339
            timestamp. If omitted, the earliest stored snapshot for the
            requested `token_id` or `market_id` is used.
          schema:
            type: string
            example: '2026-01-01T00:00:00'
        - name: end
          in: query
          required: false
          description: >-
            Range end. Accepts Unix seconds, Unix milliseconds, or an RFC 3339
            timestamp. If omitted, the latest stored snapshot for the requested
            `token_id` or `market_id` is used.
          schema:
            type: string
            example: '1735776000000'
        - name: order
          in: query
          required: false
          description: >-
            Sort order for returned snapshots. Supported values: `ASC` or
            `DESC`.
          schema:
            type: string
            default: DESC
            example: ASC
        - name: limit
          in: query
          required: false
          description: >-
            Maximum snapshots to return. Must be greater than `0`. Capped at
            `25000`.
          schema:
            type: integer
            default: 1000
            example: 500
        - name: offset
          in: query
          required: false
          description: Pagination offset. Must be `0` or greater.
          schema:
            type: integer
            default: 0
            example: 0
        - name: bucket
          in: query
          required: false
          description: >-
            Optional time bucket used to downsample snapshots. Format is a
            positive integer plus optional unit: seconds by default, or explicit
            `s`, `m`, `h`, `d`. Examples: `30`, `30s`, `5m`, `1h`, `1d`. The
            effective bucket is clamped to between `1` second and `1` day.
          schema:
            type: string
            example: 5m
        - name: points
          in: query
          required: false
          description: >-
            Optional target point count used only when `bucket` is omitted. An
            automatic bucket size is derived from the requested time range, and
            `points` is capped at `25000`.
          schema:
            type: integer
            example: 200
      responses:
        '200':
          description: Historical orderbook snapshots
          content:
            application/json:
              example:
                success: true
                response:
                  - condition_id: >-
                      0xbd71b43bb47eb60dbcb41fa25df2a0ed4da612873d6e0447a2c730bd4cc25910
                    token_id: >-
                      21742633143463906290569050155826241533067272736897614950488156847949938836455
                    bids:
                      '0.61': '1000'
                      '0.60': '800'
                    asks:
                      '0.62': '900'
                      '0.63': '600'
                    best_bid: '0.61'
                    best_ask: '0.62'
                    hash: ''
                    created_at: '2026-01-01T00:00:00'
        '400':
          description: Invalid query parameters
          content:
            application/json:
              example:
                success: false
                response: Invalid venue
      security: []

````

Built with [Mintlify](https://mintlify.com).


> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Search Markets

> Search markets by text query.



## OpenAPI

````yaml /openapi.json get /api/v1/markets/search/{query}
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/markets/search/{query}:
    get:
      tags:
        - Markets
      summary: Search Markets
      description: Search markets by text query.
      operationId: search-markets
      parameters:
        - name: query
          in: path
          required: true
          description: Search text.
          schema:
            type: string
        - name: venue
          in: query
          required: false
          description: >-
            Restrict search to a venue. Supported values: `polymarket` or
            `kalshi`.
          schema:
            type: string
            example: kalshi
        - name: labels
          in: query
          required: false
          description: Comma-separated label filter.
          schema:
            type: string
            example: crypto,politics
        - name: min_price
          in: query
          required: false
          description: Minimum market price filter.
          schema:
            type: number
        - name: max_price
          in: query
          required: false
          description: Maximum market price filter.
          schema:
            type: number
        - name: rewards
          in: query
          required: false
          description: Only include reward markets (Polymarket only).
          schema:
            type: boolean
            default: false
        - name: live
          in: query
          required: false
          description: Only include live markets.
          schema:
            type: boolean
            default: false
        - name: sort
          in: query
          required: false
          description: >-
            Sort field. Supported values: `liquidity`, `volume`, `closes_soon`,
            `probability`, `newest`.
          schema:
            type: string
        - name: limit
          in: query
          required: false
          description: Maximum events to return. Capped at `100`.
          schema:
            type: integer
            default: 25
            example: 25
        - name: offset
          in: query
          required: false
          description: Pagination offset.
          schema:
            type: integer
            default: 0
            example: 0
      responses:
        '200':
          description: Search results
          content:
            application/json:
              example:
                success: true
                response:
                  - venue: kalshi
                    event:
                      series_id: KXBTC
                      event_id: KXBTC-25
                      title: Bitcoin above $100,000 on Dec 31?
                      sub_title: Expires at year end
                      slug: bitcoin-above-100000-on-dec-31
                      image: https://example.com/kalshi-bitcoin.png
                      tags:
                        - crypto
                        - bitcoin
                      labels:
                        - crypto
                        - macro
                      category: Crypto
                      active: true
                      liquidity: '800000'
                      volume: '3000000'
                      live:
                        is_active: true
                      created_at: '2026-01-01T00:00:00'
                      updated_at: '2026-01-01T00:00:00'
                      ends_at: '2026-12-31T23:59:59'
                    markets:
                      - series_id: KXBTC
                        event_id: KXBTC-25
                        market_id: KXBTC-25-T100000
                        kalshi_id: T100000
                        title: Bitcoin above $100,000?
                        outcome: 'Yes'
                        description: >-
                          Resolves Yes if Bitcoin settles above $100,000 on
                          expiration.
                        image: https://example.com/kalshi-bitcoin-market.png
                        left_outcome: 'Yes'
                        right_outcome: 'No'
                        left_price: '0.58'
                        right_price: '0.42'
                        left_token_id: BRjpCHtyQLeSRWyE1yTdBQbhLkny5oEnveRijBjRoiA
                        right_token_id: F4r2GpoNU8MBMdKqP6MCBzKEHe2Mt8s5qm4GrFcJQnbJ
                        winner_token_id: ''
                        active: true
                        resolved: false
                        claimable: false
                        liquidity: '800000'
                        open_interest: '1200000'
                        volume: '3000000'
                        volume24hr: '175000'
                        dflow:
                          enabled: true
                        created_at: '2026-01-01T00:00:00'
                        updated_at: '2026-01-01T00:00:00'
                        ends_at: '2026-12-31T23:59:59'
      security: []

````

Built with [Mintlify](https://mintlify.com).


> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Venue Statistics

> Fetch aggregate market statistics for one or both venues.



## OpenAPI

````yaml /openapi.json get /api/v1/markets/statistics
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/markets/statistics:
    get:
      tags:
        - Markets
      summary: Get Venue Statistics
      description: Fetch aggregate market statistics for one or both venues.
      operationId: get-venue-statistics
      parameters:
        - name: venue
          in: query
          required: false
          description: Restrict to `polymarket` or `kalshi`.
          schema:
            type: string
        - name: interval
          in: query
          required: false
          description: 'Time window. Supported values: `24h`, `1w`, `1m`, `6m`, `1y`.'
          schema:
            type: string
            default: 24h
            example: 1w
      responses:
        '200':
          description: Venue statistics
          content:
            application/json:
              example:
                success: true
                response:
                  polymarket:
                    total_markets: 1500
                    active_markets: 800
                    total_volume: 500000000
                  kalshi:
                    total_markets: 2000
                    active_markets: 1200
                    total_volume: 300000000
                  interval: 24h
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Related Markets

> Fetch related markets for a market, event, or market slug input.



## OpenAPI

````yaml /openapi.json get /api/v1/markets/related/{slug}
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/markets/related/{slug}:
    get:
      tags:
        - Markets
      summary: Get Related Markets
      description: Fetch related markets for a market, event, or market slug input.
      operationId: get-related-markets
      parameters:
        - name: slug
          in: path
          required: true
          description: Market or event identifier used by the related-markets lookup.
          schema:
            type: string
        - name: limit
          in: query
          required: false
          description: Maximum events to return.
          schema:
            type: integer
            default: 20
            example: 20
        - name: offset
          in: query
          required: false
          description: Pagination offset.
          schema:
            type: integer
            default: 0
            example: 0
      responses:
        '200':
          description: Related markets
          content:
            application/json:
              example:
                success: true
                response:
                  - venue: polymarket
                    event:
                      event_id: 12345
                      title: Will Bitcoin reach $100k by end of 2025?
                      slug: will-bitcoin-reach-100k-by-end-of-2025
                      description: >-
                        This market resolves to Yes if spot Bitcoin trades at or
                        above $100,000 before 2025 ends.
                      image: https://example.com/bitcoin.png
                      tags:
                        - crypto
                        - bitcoin
                      labels:
                        - crypto
                        - macro
                      neg_risk: false
                      active: true
                      liquidity: 1500000
                      volume: 5000000
                      volume24hr: 250000
                      volume1wk: 900000
                      volume1mo: 2200000
                      volume1yr: 5000000
                      live:
                        live: false
                        ended: false
                      created_at: '2026-01-01T00:00:00'
                      ends_at: '2026-12-31T23:59:59'
                    markets:
                      - event_id: 12345
                        condition_id: >-
                          0xbd71b43bb47eb60dbcb41fa25df2a0ed4da612873d6e0447a2c730bd4cc25910
                        question: Will Bitcoin reach $100k?
                        outcome: 'Yes'
                        slug: will-bitcoin-reach-100k-yes
                        description: >-
                          Buy Yes if you think Bitcoin will trade at or above
                          $100,000 before market expiry.
                        image: https://example.com/bitcoin-market.png
                        left_outcome: 'Yes'
                        right_outcome: 'No'
                        left_price: '0.65'
                        right_price: '0.35'
                        left_token_id: >-
                          21742633143463906290569050155826241533067272736897614950488156847949938836455
                        right_token_id: >-
                          48572956138472615938471625938471659384716593847165938471659384716593847165938
                        winner_token_id: ''
                        active: true
                        resolved: false
                        fees: true
                        decimals: 6
                        liquidity: '1500000'
                        volume: '5000000'
                        volume24hr: '250000'
                        volume1wk: '900000'
                        volume1mo: '2200000'
                        volume1yr: '5000000'
                        rewards:
                          rewards: false
                        created_at: '2026-01-01T00:00:00'
                        updated_at: '2026-01-01T00:00:00'
                        ends_at: '2026-12-31T23:59:59'
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Similar Markets

> Fetch markets that the similarity index considers close to the supplied market.



## OpenAPI

````yaml /openapi.json get /api/v1/markets/similar
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/markets/similar:
    get:
      tags:
        - Markets
      summary: Get Similar Markets
      description: >-
        Fetch markets that the similarity index considers close to the supplied
        market.
      operationId: get-similar-markets
      parameters:
        - name: market_id
          in: query
          required: true
          description: Condition ID for Polymarket or market ID for Kalshi.
          schema:
            type: string
        - name: venue
          in: query
          required: false
          description: >-
            Optional venue selector when you want to scope the lookup to a
            specific venue.
          schema:
            type: string
            example: polymarket
      responses:
        '200':
          description: Similar markets
          content:
            application/json:
              example:
                success: true
                response:
                  - venue: kalshi
                    event:
                      series_id: KXBTC
                      event_id: KXBTC-25
                      title: Bitcoin above $100,000 on Dec 31?
                      sub_title: Expires at year end
                      slug: bitcoin-above-100000-on-dec-31
                      image: https://example.com/kalshi-bitcoin.png
                      tags:
                        - crypto
                        - bitcoin
                      labels:
                        - crypto
                        - macro
                      category: Crypto
                      active: true
                      liquidity: '800000'
                      volume: '3000000'
                      live:
                        is_active: true
                      created_at: '2026-01-01T00:00:00'
                      updated_at: '2026-01-01T00:00:00'
                      ends_at: '2026-12-31T23:59:59'
                    markets:
                      - series_id: KXBTC
                        event_id: KXBTC-25
                        market_id: KXBTC-25-T100000
                        kalshi_id: T100000
                        title: Bitcoin above $100,000?
                        outcome: 'Yes'
                        description: >-
                          Resolves Yes if Bitcoin settles above $100,000 on
                          expiration.
                        image: https://example.com/kalshi-bitcoin-market.png
                        left_outcome: 'Yes'
                        right_outcome: 'No'
                        left_price: '0.58'
                        right_price: '0.42'
                        left_token_id: BRjpCHtyQLeSRWyE1yTdBQbhLkny5oEnveRijBjRoiA
                        right_token_id: F4r2GpoNU8MBMdKqP6MCBzKEHe2Mt8s5qm4GrFcJQnbJ
                        winner_token_id: ''
                        active: true
                        resolved: false
                        claimable: false
                        liquidity: '800000'
                        open_interest: '1200000'
                        volume: '3000000'
                        volume24hr: '175000'
                        dflow:
                          enabled: true
                        created_at: '2026-01-01T00:00:00'
                        updated_at: '2026-01-01T00:00:00'
                        ends_at: '2026-12-31T23:59:59'
                    distance: 0.42
                    market_id: KXBTC-25-T100000
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Similar Market Pairs

> Fetch cross-venue market pairs surfaced by the similarity index.



## OpenAPI

````yaml /openapi.json get /api/v1/markets/similar-pairs
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/markets/similar-pairs:
    get:
      tags:
        - Markets
      summary: Get Similar Market Pairs
      description: Fetch cross-venue market pairs surfaced by the similarity index.
      operationId: get-similar-market-pairs
      parameters:
        - name: sort
          in: query
          required: false
          description: Sort field.
          schema:
            type: string
            default: arbitrage
            example: ends_at
        - name: order
          in: query
          required: false
          description: Sort direction.
          schema:
            type: string
            default: DESC
            example: ASC
        - name: limit
          in: query
          required: false
          description: Maximum pairs to return.
          schema:
            type: integer
            default: 25
            example: 25
        - name: offset
          in: query
          required: false
          description: Pagination offset.
          schema:
            type: integer
            default: 0
            example: 0
      responses:
        '200':
          description: Similar market pairs
          content:
            application/json:
              example:
                success: true
                response:
                  - source:
                      venue: polymarket
                      event:
                        event_id: 12345
                        title: Will Bitcoin reach $100k by end of 2025?
                        slug: will-bitcoin-reach-100k-by-end-of-2025
                        description: >-
                          This market resolves to Yes if spot Bitcoin trades at
                          or above $100,000 before 2025 ends.
                        image: https://example.com/bitcoin.png
                        tags:
                          - crypto
                          - bitcoin
                        labels:
                          - crypto
                          - macro
                        neg_risk: false
                        active: true
                        liquidity: '1500000'
                        volume: '5000000'
                        volume24hr: '250000'
                        volume1wk: '900000'
                        volume1mo: '2200000'
                        volume1yr: '5000000'
                        live:
                          live: false
                          ended: false
                        created_at: '2026-01-01T00:00:00'
                        updated_at: '2026-01-01T00:00:00'
                        ends_at: '2026-12-31T23:59:59'
                      markets:
                        - event_id: 12345
                          condition_id: >-
                            0xbd71b43bb47eb60dbcb41fa25df2a0ed4da612873d6e0447a2c730bd4cc25910
                          question: Will Bitcoin reach $100k?
                          outcome: 'Yes'
                          slug: will-bitcoin-reach-100k-yes
                          description: >-
                            Buy Yes if you think Bitcoin will trade at or above
                            $100,000 before market expiry.
                          image: https://example.com/bitcoin-market.png
                          left_outcome: 'Yes'
                          right_outcome: 'No'
                          left_price: '0.65'
                          right_price: '0.35'
                          left_token_id: >-
                            21742633143463906290569050155826241533067272736897614950488156847949938836455
                          right_token_id: >-
                            48572956138472615938471625938471659384716593847165938471659384716593847165938
                          winner_token_id: ''
                          active: true
                          resolved: false
                          fees: true
                          decimals: 6
                          liquidity: '1500000'
                          volume: '5000000'
                          volume24hr: '250000'
                          volume1wk: '900000'
                          volume1mo: '2200000'
                          volume1yr: '5000000'
                          rewards:
                            rewards: false
                          created_at: '2026-01-01T00:00:00'
                          updated_at: '2026-01-01T00:00:00'
                          ends_at: '2026-12-31T23:59:59'
                      market_id: >-
                        0xbd71b43bb47eb60dbcb41fa25df2a0ed4da612873d6e0447a2c730bd4cc25910
                    target:
                      venue: kalshi
                      event:
                        series_id: KXBTC
                        event_id: KXBTC-25
                        title: Bitcoin above $100,000 on Dec 31?
                        sub_title: Expires at year end
                        slug: bitcoin-above-100000-on-dec-31
                        image: https://example.com/kalshi-bitcoin.png
                        tags:
                          - crypto
                          - bitcoin
                        labels:
                          - crypto
                          - macro
                        category: Crypto
                        active: true
                        liquidity: '800000'
                        volume: '3000000'
                        live:
                          is_active: true
                        created_at: '2026-01-01T00:00:00'
                        updated_at: '2026-01-01T00:00:00'
                        ends_at: '2026-12-31T23:59:59'
                      markets:
                        - series_id: KXBTC
                          event_id: KXBTC-25
                          market_id: KXBTC-25-T100000
                          kalshi_id: T100000
                          title: Bitcoin above $100,000?
                          outcome: 'Yes'
                          description: >-
                            Resolves Yes if Bitcoin settles above $100,000 on
                            expiration.
                          image: https://example.com/kalshi-bitcoin-market.png
                          left_outcome: 'Yes'
                          right_outcome: 'No'
                          left_price: '0.58'
                          right_price: '0.42'
                          left_token_id: BRjpCHtyQLeSRWyE1yTdBQbhLkny5oEnveRijBjRoiA
                          right_token_id: F4r2GpoNU8MBMdKqP6MCBzKEHe2Mt8s5qm4GrFcJQnbJ
                          winner_token_id: ''
                          active: true
                          resolved: false
                          claimable: false
                          liquidity: '800000'
                          open_interest: '1200000'
                          volume: '3000000'
                          volume24hr: '175000'
                          dflow:
                            enabled: true
                          created_at: '2026-01-01T00:00:00'
                          updated_at: '2026-01-01T00:00:00'
                          ends_at: '2026-12-31T23:59:59'
                      market_id: KXBTC-25-T100000
                    distance: 0.42
                    arbitrage: 0.02
                    volume: 3000000
                    liquidity: 800000
                    ends_at: '2026-12-31T23:59:59'
                    created_at: '2026-01-01T00:00:00'
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Recommendations

> Fetch market recommendations for the authenticated account.



## OpenAPI

````yaml /openapi.json get /api/v1/recommendations
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/recommendations:
    get:
      tags:
        - Markets
      summary: Get Recommendations
      description: Fetch market recommendations for the authenticated account.
      operationId: get-recommendations
      parameters:
        - name: limit
          in: query
          required: false
          description: Maximum events to return.
          schema:
            type: integer
            default: 20
            example: 20
        - name: offset
          in: query
          required: false
          description: Pagination offset.
          schema:
            type: integer
            default: 0
            example: 0
      responses:
        '200':
          description: Recommended markets
          content:
            application/json:
              example:
                success: true
                response:
                  - venue: polymarket
                    event:
                      event_id: 12345
                      title: Will Bitcoin reach $100k by end of 2025?
                      slug: will-bitcoin-reach-100k-by-end-of-2025
                      description: >-
                        This market resolves to Yes if spot Bitcoin trades at or
                        above $100,000 before 2025 ends.
                      image: https://example.com/bitcoin.png
                      tags:
                        - crypto
                        - bitcoin
                      labels:
                        - crypto
                        - macro
                      neg_risk: false
                      active: true
                      liquidity: 1500000
                      volume: 5000000
                      volume24hr: 250000
                      volume1wk: 900000
                      volume1mo: 2200000
                      volume1yr: 5000000
                      live:
                        live: false
                        ended: false
                      created_at: '2026-01-01T00:00:00'
                      ends_at: '2026-12-31T23:59:59'
                    markets:
                      - event_id: 12345
                        condition_id: >-
                          0xbd71b43bb47eb60dbcb41fa25df2a0ed4da612873d6e0447a2c730bd4cc25910
                        question: Will Bitcoin reach $100k?
                        outcome: 'Yes'
                        slug: will-bitcoin-reach-100k-yes
                        description: >-
                          Buy Yes if you think Bitcoin will trade at or above
                          $100,000 before market expiry.
                        image: https://example.com/bitcoin-market.png
                        left_outcome: 'Yes'
                        right_outcome: 'No'
                        left_price: '0.65'
                        right_price: '0.35'
                        left_token_id: >-
                          21742633143463906290569050155826241533067272736897614950488156847949938836455
                        right_token_id: >-
                          48572956138472615938471625938471659384716593847165938471659384716593847165938
                        winner_token_id: ''
                        active: true
                        resolved: false
                        fees: true
                        decimals: 6
                        liquidity: '1500000'
                        volume: '5000000'
                        volume24hr: '250000'
                        volume1wk: '900000'
                        volume1mo: '2200000'
                        volume1yr: '5000000'
                        rewards:
                          rewards: false
                        created_at: '2026-01-01T00:00:00'
                        updated_at: '2026-01-01T00:00:00'
                        ends_at: '2026-12-31T23:59:59'
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).


> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Polymarket Markets

> Get Polymarket events with nested markets.



## OpenAPI

````yaml /openapi.json get /api/v1/polymarket/markets
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/polymarket/markets:
    get:
      tags:
        - Polymarket
      summary: Get Polymarket Markets
      description: Get Polymarket events with nested markets.
      operationId: get-polymarket-markets
      parameters:
        - name: sort
          in: query
          required: false
          description: >-
            Sort field. Supported values: `left_price`, `right_price`,
            `liquidity`, `volume`, `volume24hr`, `volume1wk`, `volume1mo`,
            `volume1yr`, `created_at`, `ends_at`.
          schema:
            type: string
            default: volume1wk
            example: ends_at
        - name: order
          in: query
          required: false
          description: 'Sort direction. Supported values: `ASC` or `DESC`.'
          schema:
            type: string
            default: DESC
            example: ASC
        - name: limit
          in: query
          required: false
          description: Maximum events to return. Capped at `250`.
          schema:
            type: integer
            default: 100
            example: 50
        - name: offset
          in: query
          required: false
          description: Pagination offset.
          schema:
            type: integer
            default: 0
            example: 0
        - name: query
          in: query
          required: false
          description: Full-text search query.
          schema:
            type: string
        - name: title
          in: query
          required: false
          description: Filter by event title (case-insensitive partial match).
          schema:
            type: string
        - name: tags
          in: query
          required: false
          description: Filter by event tags (case-insensitive partial match).
          schema:
            type: string
        - name: markets
          in: query
          required: false
          description: Include nested markets in the response.
          schema:
            type: boolean
            default: true
      responses:
        '200':
          description: Polymarket markets
          content:
            application/json:
              example:
                success: true
                response:
                  - event:
                      event_id: 12345
                      title: Will Bitcoin reach $100k by end of 2025?
                      slug: will-bitcoin-reach-100k-by-end-of-2025
                      description: >-
                        This market resolves to Yes if spot Bitcoin trades at or
                        above $100,000 before 2025 ends.
                      image: https://example.com/bitcoin.png
                      tags:
                        - crypto
                        - bitcoin
                      labels:
                        - crypto
                        - macro
                      neg_risk: false
                      active: true
                      liquidity: '1500000'
                      volume: '5000000'
                      volume24hr: '250000'
                      volume1wk: '900000'
                      volume1mo: '2200000'
                      volume1yr: '5000000'
                      live:
                        live: false
                        ended: false
                      created_at: '2026-01-01T00:00:00'
                      updated_at: '2026-01-01T00:00:00'
                      ends_at: '2026-12-31T23:59:59'
                    markets:
                      - event_id: 12345
                        condition_id: >-
                          0xbd71b43bb47eb60dbcb41fa25df2a0ed4da612873d6e0447a2c730bd4cc25910
                        question: Will Bitcoin reach $100k?
                        outcome: 'Yes'
                        slug: will-bitcoin-reach-100k-yes
                        description: >-
                          Buy Yes if you think Bitcoin will trade at or above
                          $100,000 before market expiry.
                        image: https://example.com/bitcoin-market.png
                        left_outcome: 'Yes'
                        right_outcome: 'No'
                        left_price: '0.65'
                        right_price: '0.35'
                        left_token_id: >-
                          21742633143463906290569050155826241533067272736897614950488156847949938836455
                        right_token_id: >-
                          48572956138472615938471625938471659384716593847165938471659384716593847165938
                        winner_token_id: ''
                        active: true
                        resolved: false
                        fees: true
                        decimals: 6
                        liquidity: '1500000'
                        volume: '5000000'
                        volume24hr: '250000'
                        volume1wk: '900000'
                        volume1mo: '2200000'
                        volume1yr: '5000000'
                        rewards:
                          rewards: false
                        created_at: '2026-01-01T00:00:00'
                        updated_at: '2026-01-01T00:00:00'
                        ends_at: '2026-12-31T23:59:59'
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Polymarket Event

> Get a Polymarket event with all nested markets.



## OpenAPI

````yaml /openapi.json get /api/v1/polymarket/market/event/{event_id}
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/polymarket/market/event/{event_id}:
    get:
      tags:
        - Polymarket
      summary: Get Polymarket Event
      description: Get a Polymarket event with all nested markets.
      operationId: get-polymarket-event
      parameters:
        - name: event_id
          in: path
          required: true
          schema:
            type: string
        - name: sort
          in: query
          required: false
          description: >-
            Sort field for markets. Supported values: `outcomes`, `left_price`,
            `right_price`, `liquidity`, `volume`, `volume24hr`, `volume1wk`,
            `volume1mo`, `volume1yr`, `created_at`, `ends_at`.
          schema:
            type: string
            default: left_price
        - name: order
          in: query
          required: false
          description: 'Sort direction. Supported values: `ASC` or `DESC`.'
          schema:
            type: string
            default: DESC
      responses:
        '200':
          description: Polymarket event
          content:
            application/json:
              example:
                success: true
                response:
                  event:
                    event_id: 12345
                    title: Will Bitcoin reach $100k by end of 2025?
                    slug: will-bitcoin-reach-100k-by-end-of-2025
                    description: >-
                      This market resolves to Yes if spot Bitcoin trades at or
                      above $100,000 before 2025 ends.
                    image: https://example.com/bitcoin.png
                    tags:
                      - crypto
                      - bitcoin
                    labels:
                      - crypto
                      - macro
                    neg_risk: false
                    active: true
                    liquidity: '1500000'
                    volume: '5000000'
                    volume24hr: '250000'
                    volume1wk: '900000'
                    volume1mo: '2200000'
                    volume1yr: '5000000'
                    live:
                      live: false
                      ended: false
                    created_at: '2026-01-01T00:00:00'
                    updated_at: '2026-01-01T00:00:00'
                    ends_at: '2026-12-31T23:59:59'
                  markets:
                    - event_id: 12345
                      condition_id: >-
                        0xbd71b43bb47eb60dbcb41fa25df2a0ed4da612873d6e0447a2c730bd4cc25910
                      question: Will Bitcoin reach $100k?
                      outcome: 'Yes'
                      slug: will-bitcoin-reach-100k-yes
                      description: >-
                        Buy Yes if you think Bitcoin will trade at or above
                        $100,000 before market expiry.
                      image: https://example.com/bitcoin-market.png
                      left_outcome: 'Yes'
                      right_outcome: 'No'
                      left_price: '0.65'
                      right_price: '0.35'
                      left_token_id: >-
                        21742633143463906290569050155826241533067272736897614950488156847949938836455
                      right_token_id: >-
                        48572956138472615938471625938471659384716593847165938471659384716593847165938
                      winner_token_id: ''
                      active: true
                      resolved: false
                      fees: true
                      decimals: 6
                      liquidity: '1500000'
                      volume: '5000000'
                      volume24hr: '250000'
                      volume1wk: '900000'
                      volume1mo: '2200000'
                      volume1yr: '5000000'
                      rewards:
                        rewards: false
                      created_at: '2026-01-01T00:00:00'
                      updated_at: '2026-01-01T00:00:00'
                      ends_at: '2026-12-31T23:59:59'
      security: []

````

Built with [Mintlify](https://mintlify.com).


> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Polymarket Market by Slug

> Get a Polymarket event by slug with nested markets.



## OpenAPI

````yaml /openapi.json get /api/v1/polymarket/market/slug/{slug}
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/polymarket/market/slug/{slug}:
    get:
      tags:
        - Polymarket
      summary: Get Polymarket Market by Slug
      description: Get a Polymarket event by slug with nested markets.
      operationId: get-polymarket-market-slug
      parameters:
        - name: slug
          in: path
          required: true
          description: Event or market slug.
          schema:
            type: string
            example: will-bitcoin-reach-100k
        - name: sort
          in: query
          required: false
          description: >-
            Sort field for markets. Supported values: `outcomes`, `left_price`,
            `right_price`, `liquidity`, `volume`, `volume24hr`, `volume1wk`,
            `volume1mo`, `volume1yr`, `created_at`, `ends_at`.
          schema:
            type: string
            default: left_price
        - name: order
          in: query
          required: false
          description: 'Sort direction. Supported values: `ASC` or `DESC`.'
          schema:
            type: string
            default: DESC
      responses:
        '200':
          description: Polymarket market by slug
          content:
            application/json:
              example:
                success: true
                response:
                  event:
                    event_id: 12345
                    title: Will Bitcoin reach $100k by end of 2025?
                    slug: will-bitcoin-reach-100k-by-end-of-2025
                    description: >-
                      This market resolves to Yes if spot Bitcoin trades at or
                      above $100,000 before 2025 ends.
                    image: https://example.com/bitcoin.png
                    tags:
                      - crypto
                      - bitcoin
                    labels:
                      - crypto
                      - macro
                    neg_risk: false
                    active: true
                    liquidity: '1500000'
                    volume: '5000000'
                    volume24hr: '250000'
                    volume1wk: '900000'
                    volume1mo: '2200000'
                    volume1yr: '5000000'
                    live:
                      live: false
                      ended: false
                    created_at: '2026-01-01T00:00:00'
                    updated_at: '2026-01-01T00:00:00'
                    ends_at: '2026-12-31T23:59:59'
                  markets:
                    - event_id: 12345
                      condition_id: >-
                        0xbd71b43bb47eb60dbcb41fa25df2a0ed4da612873d6e0447a2c730bd4cc25910
                      question: Will Bitcoin reach $100k?
                      outcome: 'Yes'
                      slug: will-bitcoin-reach-100k-yes
                      description: >-
                        Buy Yes if you think Bitcoin will trade at or above
                        $100,000 before market expiry.
                      image: https://example.com/bitcoin-market.png
                      left_outcome: 'Yes'
                      right_outcome: 'No'
                      left_price: '0.65'
                      right_price: '0.35'
                      left_token_id: >-
                        21742633143463906290569050155826241533067272736897614950488156847949938836455
                      right_token_id: >-
                        48572956138472615938471625938471659384716593847165938471659384716593847165938
                      winner_token_id: ''
                      active: true
                      resolved: false
                      fees: true
                      decimals: 6
                      liquidity: '1500000'
                      volume: '5000000'
                      volume24hr: '250000'
                      volume1wk: '900000'
                      volume1mo: '2200000'
                      volume1yr: '5000000'
                      rewards:
                        rewards: false
                      created_at: '2026-01-01T00:00:00'
                      updated_at: '2026-01-01T00:00:00'
                      ends_at: '2026-12-31T23:59:59'
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Polymarket Market by Token

> Get a single Polymarket market by token ID with event details.



## OpenAPI

````yaml /openapi.json get /api/v1/polymarket/market/token/{token_id}
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/polymarket/market/token/{token_id}:
    get:
      tags:
        - Polymarket
      summary: Get Polymarket Market by Token
      description: Get a single Polymarket market by token ID with event details.
      operationId: get-polymarket-market-token
      parameters:
        - name: token_id
          in: path
          required: true
          description: Polymarket token ID.
          schema:
            type: string
            example: >-
              21742633143463906290569050155826241533067272736897614950488156847949938836455
      responses:
        '200':
          description: Polymarket market by token
          content:
            application/json:
              example:
                success: true
                response:
                  event:
                    event_id: 12345
                    title: Will Bitcoin reach $100k by end of 2025?
                    slug: will-bitcoin-reach-100k-by-end-of-2025
                    description: >-
                      This market resolves to Yes if spot Bitcoin trades at or
                      above $100,000 before 2025 ends.
                    image: https://example.com/bitcoin.png
                    tags:
                      - crypto
                      - bitcoin
                    labels:
                      - crypto
                      - macro
                    neg_risk: false
                    active: true
                    liquidity: '1500000'
                    volume: '5000000'
                    volume24hr: '250000'
                    volume1wk: '900000'
                    volume1mo: '2200000'
                    volume1yr: '5000000'
                    live:
                      live: false
                      ended: false
                    created_at: '2026-01-01T00:00:00'
                    updated_at: '2026-01-01T00:00:00'
                    ends_at: '2026-12-31T23:59:59'
                  market:
                    event_id: 12345
                    condition_id: >-
                      0xbd71b43bb47eb60dbcb41fa25df2a0ed4da612873d6e0447a2c730bd4cc25910
                    question: Will Bitcoin reach $100k?
                    outcome: 'Yes'
                    slug: will-bitcoin-reach-100k-yes
                    description: >-
                      Buy Yes if you think Bitcoin will trade at or above
                      $100,000 before market expiry.
                    image: https://example.com/bitcoin-market.png
                    left_outcome: 'Yes'
                    right_outcome: 'No'
                    left_price: '0.65'
                    right_price: '0.35'
                    left_token_id: >-
                      21742633143463906290569050155826241533067272736897614950488156847949938836455
                    right_token_id: >-
                      48572956138472615938471625938471659384716593847165938471659384716593847165938
                    winner_token_id: ''
                    active: true
                    resolved: false
                    fees: true
                    decimals: 6
                    liquidity: '1500000'
                    volume: '5000000'
                    volume24hr: '250000'
                    volume1wk: '900000'
                    volume1mo: '2200000'
                    volume1yr: '5000000'
                    rewards:
                      rewards: false
                    created_at: '2026-01-01T00:00:00'
                    updated_at: '2026-01-01T00:00:00'
                    ends_at: '2026-12-31T23:59:59'
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Polymarket Market

> Get a single Polymarket market with event details.



## OpenAPI

````yaml /openapi.json get /api/v1/polymarket/market/{condition_id}
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/polymarket/market/{condition_id}:
    get:
      tags:
        - Polymarket
      summary: Get Polymarket Market
      description: Get a single Polymarket market with event details.
      operationId: get-polymarket-market
      parameters:
        - name: condition_id
          in: path
          required: true
          schema:
            type: string
            example: '0xbd71b43bb47eb60dbcb41fa25df2a0ed4da612873d6e0447a2c730bd4cc25910'
      responses:
        '200':
          description: Polymarket market
          content:
            application/json:
              example:
                success: true
                response:
                  event:
                    event_id: 12345
                    title: Will Bitcoin reach $100k by end of 2025?
                    slug: will-bitcoin-reach-100k-by-end-of-2025
                    description: >-
                      This market resolves to Yes if spot Bitcoin trades at or
                      above $100,000 before 2025 ends.
                    image: https://example.com/bitcoin.png
                    tags:
                      - crypto
                      - bitcoin
                    labels:
                      - crypto
                      - macro
                    neg_risk: false
                    active: true
                    liquidity: '1500000'
                    volume: '5000000'
                    volume24hr: '250000'
                    volume1wk: '900000'
                    volume1mo: '2200000'
                    volume1yr: '5000000'
                    live:
                      live: false
                      ended: false
                    created_at: '2026-01-01T00:00:00'
                    updated_at: '2026-01-01T00:00:00'
                    ends_at: '2026-12-31T23:59:59'
                  market:
                    event_id: 12345
                    condition_id: >-
                      0xbd71b43bb47eb60dbcb41fa25df2a0ed4da612873d6e0447a2c730bd4cc25910
                    question: Will Bitcoin reach $100k?
                    outcome: 'Yes'
                    slug: will-bitcoin-reach-100k-yes
                    description: >-
                      Buy Yes if you think Bitcoin will trade at or above
                      $100,000 before market expiry.
                    image: https://example.com/bitcoin-market.png
                    left_outcome: 'Yes'
                    right_outcome: 'No'
                    left_price: '0.65'
                    right_price: '0.35'
                    left_token_id: >-
                      21742633143463906290569050155826241533067272736897614950488156847949938836455
                    right_token_id: >-
                      48572956138472615938471625938471659384716593847165938471659384716593847165938
                    winner_token_id: ''
                    active: true
                    resolved: false
                    fees: true
                    decimals: 6
                    liquidity: '1500000'
                    volume: '5000000'
                    volume24hr: '250000'
                    volume1wk: '900000'
                    volume1mo: '2200000'
                    volume1yr: '5000000'
                    rewards:
                      rewards: false
                    created_at: '2026-01-01T00:00:00'
                    updated_at: '2026-01-01T00:00:00'
                    ends_at: '2026-12-31T23:59:59'
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Polymarket Price History

> Get price history for a Polymarket market.



## OpenAPI

````yaml /openapi.json get /api/v1/polymarket/market/{token_id}/price-history
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/polymarket/market/{token_id}/price-history:
    get:
      tags:
        - Polymarket
      summary: Get Polymarket Price History
      description: Get price history for a Polymarket market.
      operationId: get-polymarket-market-price-history
      parameters:
        - name: token_id
          in: path
          required: true
          description: Polymarket token ID.
          schema:
            type: string
            example: >-
              21742633143463906290569050155826241533067272736897614950488156847949938836455
        - name: interval
          in: query
          required: false
          description: >-
            Time interval. Supported values: `1h`, `6h`, `1d`, `1w`, `1m`,
            `all`.
          schema:
            type: string
            default: 1h
            example: 1d
        - name: volume
          in: query
          required: false
          description: Include volume data.
          schema:
            type: boolean
            default: true
      responses:
        '200':
          description: Polymarket price history
          content:
            application/json:
              example:
                success: true
                response:
                  prices: []
                  ohlc:
                    - time: 1736937000
                      open: 0.61
                      high: 0.65
                      low: 0.6
                      close: 0.64
                  volume:
                    - 1250.5
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Polymarket Market Trades

> Get recent trades for a Polymarket market.



## OpenAPI

````yaml /openapi.json get /api/v1/polymarket/market/{condition_id}/trades
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/polymarket/market/{condition_id}/trades:
    get:
      tags:
        - Polymarket
      summary: Get Polymarket Market Trades
      description: Get recent trades for a Polymarket market.
      operationId: get-polymarket-market-trades
      parameters:
        - name: condition_id
          in: path
          required: true
          description: Polymarket condition ID.
          schema:
            type: string
            example: '0xbd71b43bb47eb60dbcb41fa25df2a0ed4da612873d6e0447a2c730bd4cc25910'
        - name: limit
          in: query
          required: false
          description: Maximum trades to return. Capped at `10000`.
          schema:
            type: integer
            default: 100
            example: 100
        - name: offset
          in: query
          required: false
          description: Pagination offset.
          schema:
            type: integer
            default: 0
            example: 0
      responses:
        '200':
          description: Polymarket market trades
          content:
            application/json:
              example:
                success: true
                response:
                  - tx_hash: >-
                      0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2
                    token_id: >-
                      21742633143463906290569050155826241533067272736897614950488156847949938836455
                    address: '0x1234567890abcdef1234567890abcdef12345678'
                    side: true
                    amount: '100.000'
                    shares: '152.300'
                    price: '0.657'
                    username: trader123
                    image: https://example.com/avatar.png
                    created_at: '2026-01-01T00:00:00'
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Polymarket Market Statistics

> Get aggregate statistics for a Polymarket market token.



## OpenAPI

````yaml /openapi.json get /api/v1/polymarket/market/{token_id}/statistics
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/polymarket/market/{token_id}/statistics:
    get:
      tags:
        - Polymarket
      summary: Get Polymarket Market Statistics
      description: Get aggregate statistics for a Polymarket market token.
      operationId: get-polymarket-market-statistics
      parameters:
        - name: token_id
          in: path
          required: true
          schema:
            type: string
            example: >-
              21742633143463906290569050155826241533067272736897614950488156847949938836455
      responses:
        '200':
          description: Polymarket market statistics
          content:
            application/json:
              example:
                success: true
                response:
                  change: '3.5'
                  high: '0.66'
                  low: '0.51'
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Polymarket Market Statistics

> Get aggregate statistics for a Polymarket market token.



## OpenAPI

````yaml /openapi.json get /api/v1/polymarket/market/{token_id}/statistics
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/polymarket/market/{token_id}/statistics:
    get:
      tags:
        - Polymarket
      summary: Get Polymarket Market Statistics
      description: Get aggregate statistics for a Polymarket market token.
      operationId: get-polymarket-market-statistics
      parameters:
        - name: token_id
          in: path
          required: true
          schema:
            type: string
            example: >-
              21742633143463906290569050155826241533067272736897614950488156847949938836455
      responses:
        '200':
          description: Polymarket market statistics
          content:
            application/json:
              example:
                success: true
                response:
                  change: '3.5'
                  high: '0.66'
                  low: '0.51'
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Polymarket Market Statistics

> Get aggregate statistics for a Polymarket market token.



## OpenAPI

````yaml /openapi.json get /api/v1/polymarket/market/{token_id}/statistics
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/polymarket/market/{token_id}/statistics:
    get:
      tags:
        - Polymarket
      summary: Get Polymarket Market Statistics
      description: Get aggregate statistics for a Polymarket market token.
      operationId: get-polymarket-market-statistics
      parameters:
        - name: token_id
          in: path
          required: true
          schema:
            type: string
            example: >-
              21742633143463906290569050155826241533067272736897614950488156847949938836455
      responses:
        '200':
          description: Polymarket market statistics
          content:
            application/json:
              example:
                success: true
                response:
                  change: '3.5'
                  high: '0.66'
                  low: '0.51'
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Polymarket Market Statistics

> Get aggregate statistics for a Polymarket market token.



## OpenAPI

````yaml /openapi.json get /api/v1/polymarket/market/{token_id}/statistics
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/polymarket/market/{token_id}/statistics:
    get:
      tags:
        - Polymarket
      summary: Get Polymarket Market Statistics
      description: Get aggregate statistics for a Polymarket market token.
      operationId: get-polymarket-market-statistics
      parameters:
        - name: token_id
          in: path
          required: true
          schema:
            type: string
            example: >-
              21742633143463906290569050155826241533067272736897614950488156847949938836455
      responses:
        '200':
          description: Polymarket market statistics
          content:
            application/json:
              example:
                success: true
                response:
                  change: '3.5'
                  high: '0.66'
                  low: '0.51'
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Kalshi Markets

> Get Kalshi events with nested markets.



## OpenAPI

````yaml /openapi.json get /api/v1/kalshi/markets
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/kalshi/markets:
    get:
      tags:
        - Kalshi
      summary: Get Kalshi Markets
      description: Get Kalshi events with nested markets.
      operationId: get-kalshi-markets
      parameters:
        - name: sort
          in: query
          required: false
          description: >-
            Sort field. Supported values: `left_price`, `right_price`,
            `liquidity`, `volume`, `created_at`, `ends_at`.
          schema:
            type: string
            default: volume
            example: ends_at
        - name: order
          in: query
          required: false
          description: 'Sort direction. Supported values: `ASC` or `DESC`.'
          schema:
            type: string
            default: DESC
            example: ASC
        - name: limit
          in: query
          required: false
          description: Maximum events to return. Capped at `250`.
          schema:
            type: integer
            default: 100
            example: 50
        - name: offset
          in: query
          required: false
          description: Pagination offset.
          schema:
            type: integer
            default: 0
            example: 0
        - name: query
          in: query
          required: false
          description: Full-text search query.
          schema:
            type: string
        - name: title
          in: query
          required: false
          description: Filter by event title (case-insensitive partial match).
          schema:
            type: string
        - name: category
          in: query
          required: false
          description: Filter by event category (case-insensitive partial match).
          schema:
            type: string
        - name: markets
          in: query
          required: false
          description: Include nested markets in the response.
          schema:
            type: boolean
            default: true
      responses:
        '200':
          description: Kalshi markets
          content:
            application/json:
              example:
                success: true
                response:
                  - event:
                      series_id: KXBTC
                      event_id: KXBTC-25
                      title: Bitcoin above $100,000 on Dec 31?
                      sub_title: Expires at year end
                      slug: bitcoin-above-100000-on-dec-31
                      image: https://example.com/kalshi-bitcoin.png
                      tags:
                        - crypto
                        - bitcoin
                      labels:
                        - crypto
                        - macro
                      category: Crypto
                      active: true
                      liquidity: '800000'
                      volume: '3000000'
                      live:
                        is_active: true
                      created_at: '2026-01-01T00:00:00'
                      updated_at: '2026-01-01T00:00:00'
                      ends_at: '2026-12-31T23:59:59'
                    markets:
                      - series_id: KXBTC
                        event_id: KXBTC-25
                        market_id: KXBTC-25-T100000
                        kalshi_id: T100000
                        title: Bitcoin above $100,000?
                        outcome: 'Yes'
                        description: >-
                          Resolves Yes if Bitcoin settles above $100,000 on
                          expiration.
                        image: https://example.com/kalshi-bitcoin-market.png
                        left_outcome: 'Yes'
                        right_outcome: 'No'
                        left_price: '0.58'
                        right_price: '0.42'
                        left_token_id: BRjpCHtyQLeSRWyE1yTdBQbhLkny5oEnveRijBjRoiA
                        right_token_id: F4r2GpoNU8MBMdKqP6MCBzKEHe2Mt8s5qm4GrFcJQnbJ
                        winner_token_id: ''
                        active: true
                        resolved: false
                        claimable: false
                        liquidity: '800000'
                        open_interest: '1200000'
                        volume: '3000000'
                        volume24hr: '175000'
                        dflow:
                          enabled: true
                        created_at: '2026-01-01T00:00:00'
                        updated_at: '2026-01-01T00:00:00'
                        ends_at: '2026-12-31T23:59:59'
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Kalshi Event

> Get a Kalshi event with all nested markets.



## OpenAPI

````yaml /openapi.json get /api/v1/kalshi/market/event/{event_id}
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/kalshi/market/event/{event_id}:
    get:
      tags:
        - Kalshi
      summary: Get Kalshi Event
      description: Get a Kalshi event with all nested markets.
      operationId: get-kalshi-event
      parameters:
        - name: event_id
          in: path
          required: true
          schema:
            type: string
        - name: sort
          in: query
          required: false
          description: >-
            Sort field for nested markets. Supported values: `outcomes`,
            `left_price`, `right_price`, `liquidity`, `volume`, `volume24hr`,
            `created_at`, `ends_at`.
          schema:
            type: string
            default: left_price
        - name: order
          in: query
          required: false
          description: 'Sort direction. Supported values: `ASC` or `DESC`.'
          schema:
            type: string
            default: DESC
      responses:
        '200':
          description: Kalshi event
          content:
            application/json:
              example:
                success: true
                response:
                  event:
                    series_id: KXBTC
                    event_id: KXBTC-25
                    title: Bitcoin above $100,000 on Dec 31?
                    sub_title: Expires at year end
                    slug: bitcoin-above-100000-on-dec-31
                    image: https://example.com/kalshi-bitcoin.png
                    tags:
                      - crypto
                      - bitcoin
                    labels:
                      - crypto
                      - macro
                    category: Crypto
                    active: true
                    liquidity: '800000'
                    volume: '3000000'
                    live:
                      is_active: true
                    created_at: '2026-01-01T00:00:00'
                    updated_at: '2026-01-01T00:00:00'
                    ends_at: '2026-12-31T23:59:59'
                  markets:
                    - series_id: KXBTC
                      event_id: KXBTC-25
                      market_id: KXBTC-25-T100000
                      kalshi_id: T100000
                      title: Bitcoin above $100,000?
                      outcome: 'Yes'
                      description: >-
                        Resolves Yes if Bitcoin settles above $100,000 on
                        expiration.
                      image: https://example.com/kalshi-bitcoin-market.png
                      left_outcome: 'Yes'
                      right_outcome: 'No'
                      left_price: '0.58'
                      right_price: '0.42'
                      left_token_id: BRjpCHtyQLeSRWyE1yTdBQbhLkny5oEnveRijBjRoiA
                      right_token_id: F4r2GpoNU8MBMdKqP6MCBzKEHe2Mt8s5qm4GrFcJQnbJ
                      winner_token_id: ''
                      active: true
                      resolved: false
                      claimable: false
                      liquidity: '800000'
                      open_interest: '1200000'
                      volume: '3000000'
                      volume24hr: '175000'
                      dflow:
                        enabled: true
                      created_at: '2026-01-01T00:00:00'
                      updated_at: '2026-01-01T00:00:00'
                      ends_at: '2026-12-31T23:59:59'
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Kalshi Market by Slug

> Get a Kalshi event by slug with nested markets.



## OpenAPI

````yaml /openapi.json get /api/v1/kalshi/market/slug/{slug}
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/kalshi/market/slug/{slug}:
    get:
      tags:
        - Kalshi
      summary: Get Kalshi Market by Slug
      description: Get a Kalshi event by slug with nested markets.
      operationId: get-kalshi-market-slug
      parameters:
        - name: slug
          in: path
          required: true
          description: Kalshi event slug.
          schema:
            type: string
        - name: sort
          in: query
          required: false
          description: >-
            Sort field for nested markets. Supported values: `outcomes`,
            `left_price`, `right_price`, `liquidity`, `volume`, `volume24hr`,
            `created_at`, `ends_at`.
          schema:
            type: string
            default: left_price
        - name: order
          in: query
          required: false
          description: 'Sort direction. Supported values: `ASC` or `DESC`.'
          schema:
            type: string
            default: DESC
      responses:
        '200':
          description: Kalshi event by slug
          content:
            application/json:
              example:
                success: true
                response:
                  event:
                    series_id: KXBTC
                    event_id: KXBTC-25
                    title: Bitcoin above $100,000 on Dec 31?
                    sub_title: Expires at year end
                    slug: bitcoin-above-100000-on-dec-31
                    image: https://example.com/kalshi-bitcoin.png
                    tags:
                      - crypto
                      - bitcoin
                    labels:
                      - crypto
                      - macro
                    category: Crypto
                    active: true
                    liquidity: '800000'
                    volume: '3000000'
                    live:
                      is_active: true
                    created_at: '2026-01-01T00:00:00'
                    updated_at: '2026-01-01T00:00:00'
                    ends_at: '2026-12-31T23:59:59'
                  markets:
                    - series_id: KXBTC
                      event_id: KXBTC-25
                      market_id: KXBTC-25-T100000
                      kalshi_id: T100000
                      title: Bitcoin above $100,000?
                      outcome: 'Yes'
                      description: >-
                        Resolves Yes if Bitcoin settles above $100,000 on
                        expiration.
                      image: https://example.com/kalshi-bitcoin-market.png
                      left_outcome: 'Yes'
                      right_outcome: 'No'
                      left_price: '0.58'
                      right_price: '0.42'
                      left_token_id: BRjpCHtyQLeSRWyE1yTdBQbhLkny5oEnveRijBjRoiA
                      right_token_id: F4r2GpoNU8MBMdKqP6MCBzKEHe2Mt8s5qm4GrFcJQnbJ
                      winner_token_id: ''
                      active: true
                      resolved: false
                      claimable: false
                      liquidity: '800000'
                      open_interest: '1200000'
                      volume: '3000000'
                      volume24hr: '175000'
                      dflow:
                        enabled: true
                      created_at: '2026-01-01T00:00:00'
                      updated_at: '2026-01-01T00:00:00'
                      ends_at: '2026-12-31T23:59:59'
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Kalshi Market

> Get a single Kalshi market with its event.



## OpenAPI

````yaml /openapi.json get /api/v1/kalshi/market/{market_id}
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/kalshi/market/{market_id}:
    get:
      tags:
        - Kalshi
      summary: Get Kalshi Market
      description: Get a single Kalshi market with its event.
      operationId: get-kalshi-market
      parameters:
        - name: market_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Kalshi market
          content:
            application/json:
              example:
                success: true
                response:
                  event:
                    series_id: KXBTC
                    event_id: KXBTC-25
                    title: Bitcoin above $100,000 on Dec 31?
                    sub_title: Expires at year end
                    slug: bitcoin-above-100000-on-dec-31
                    image: https://example.com/kalshi-bitcoin.png
                    tags:
                      - crypto
                      - bitcoin
                    labels:
                      - crypto
                      - macro
                    category: Crypto
                    active: true
                    liquidity: '800000'
                    volume: '3000000'
                    live:
                      is_active: true
                    created_at: '2026-01-01T00:00:00'
                    updated_at: '2026-01-01T00:00:00'
                    ends_at: '2026-12-31T23:59:59'
                  market:
                    series_id: KXBTC
                    event_id: KXBTC-25
                    market_id: KXBTC-25-T100000
                    kalshi_id: T100000
                    title: Bitcoin above $100,000?
                    outcome: 'Yes'
                    description: >-
                      Resolves Yes if Bitcoin settles above $100,000 on
                      expiration.
                    image: https://example.com/kalshi-bitcoin-market.png
                    left_outcome: 'Yes'
                    right_outcome: 'No'
                    left_price: '0.58'
                    right_price: '0.42'
                    left_token_id: BRjpCHtyQLeSRWyE1yTdBQbhLkny5oEnveRijBjRoiA
                    right_token_id: F4r2GpoNU8MBMdKqP6MCBzKEHe2Mt8s5qm4GrFcJQnbJ
                    winner_token_id: ''
                    active: true
                    resolved: false
                    claimable: false
                    liquidity: '800000'
                    open_interest: '1200000'
                    volume: '3000000'
                    volume24hr: '175000'
                    dflow:
                      enabled: true
                    created_at: '2026-01-01T00:00:00'
                    updated_at: '2026-01-01T00:00:00'
                    ends_at: '2026-12-31T23:59:59'
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Kalshi Market Trades

> Get recent trades for a Kalshi market.



## OpenAPI

````yaml /openapi.json get /api/v1/kalshi/market/{market_id}/trades
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/kalshi/market/{market_id}/trades:
    get:
      tags:
        - Kalshi
      summary: Get Kalshi Market Trades
      description: Get recent trades for a Kalshi market.
      operationId: get-kalshi-market-trades
      parameters:
        - name: market_id
          in: path
          required: true
          schema:
            type: string
        - name: limit
          in: query
          required: false
          description: Maximum trades to return. Capped at `10000`.
          schema:
            type: integer
            default: 100
            example: 100
        - name: offset
          in: query
          required: false
          description: Pagination offset.
          schema:
            type: integer
            default: 0
            example: 0
      responses:
        '200':
          description: Kalshi market trades
          content:
            application/json:
              example:
                success: true
                response:
                  - trade_id: f6a7b8c9-d0e1-2345-f678-90abcdef1234
                    market_id: KXBTC-25-T100000
                    outcome: 'Yes'
                    side: true
                    amount: '100.000'
                    shares: '175.000'
                    price: '0.570'
                    created_at: '2026-01-01T00:00:00'
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Kalshi Market Trades

> Get recent trades for a Kalshi market.



## OpenAPI

````yaml /openapi.json get /api/v1/kalshi/market/{market_id}/trades
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/kalshi/market/{market_id}/trades:
    get:
      tags:
        - Kalshi
      summary: Get Kalshi Market Trades
      description: Get recent trades for a Kalshi market.
      operationId: get-kalshi-market-trades
      parameters:
        - name: market_id
          in: path
          required: true
          schema:
            type: string
        - name: limit
          in: query
          required: false
          description: Maximum trades to return. Capped at `10000`.
          schema:
            type: integer
            default: 100
            example: 100
        - name: offset
          in: query
          required: false
          description: Pagination offset.
          schema:
            type: integer
            default: 0
            example: 0
      responses:
        '200':
          description: Kalshi market trades
          content:
            application/json:
              example:
                success: true
                response:
                  - trade_id: f6a7b8c9-d0e1-2345-f678-90abcdef1234
                    market_id: KXBTC-25-T100000
                    outcome: 'Yes'
                    side: true
                    amount: '100.000'
                    shares: '175.000'
                    price: '0.570'
                    created_at: '2026-01-01T00:00:00'
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Kalshi Market Statistics

> Get aggregate statistics for a Kalshi market.



## OpenAPI

````yaml /openapi.json get /api/v1/kalshi/market/{market_id}/statistics
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/kalshi/market/{market_id}/statistics:
    get:
      tags:
        - Kalshi
      summary: Get Kalshi Market Statistics
      description: Get aggregate statistics for a Kalshi market.
      operationId: get-kalshi-market-statistics
      parameters:
        - name: market_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Kalshi market statistics
          content:
            application/json:
              example:
                success: true
                response:
                  change: '2.5'
                  high: '0.63'
                  low: '0.41'
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Kalshi Price History

> Get price history for a Kalshi market.



## OpenAPI

````yaml /openapi.json get /api/v1/kalshi/market/{series_id}/{kalshi_id}/price-history
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/kalshi/market/{series_id}/{kalshi_id}/price-history:
    get:
      tags:
        - Kalshi
      summary: Get Kalshi Price History
      description: Get price history for a Kalshi market.
      operationId: get-kalshi-market-price-history
      parameters:
        - name: series_id
          in: path
          required: true
          description: Kalshi series ID.
          schema:
            type: string
        - name: kalshi_id
          in: path
          required: true
          description: Kalshi market slug component.
          schema:
            type: string
        - name: start
          in: query
          required: true
          description: Start timestamp or ISO 8601 date.
          schema:
            type: string
        - name: end
          in: query
          required: false
          description: End timestamp or ISO 8601 date.
          schema:
            type: string
        - name: bucket
          in: query
          required: false
          description: Aggregation bucket.
          schema:
            type: string
        - name: points
          in: query
          required: false
          description: Target point count.
          schema:
            type: integer
        - name: order
          in: query
          required: false
          description: Sort direction.
          schema:
            type: string
        - name: limit
          in: query
          required: false
          description: Maximum points to return.
          schema:
            type: integer
        - name: offset
          in: query
          required: false
          description: Pagination offset.
          schema:
            type: integer
      responses:
        '200':
          description: Kalshi price history
          content:
            application/json:
              example:
                success: true
                response:
                  - yes_price: '0.58'
                    no_price: '0.42'
                    created_at: '2026-01-01T00:00:00'
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Kalshi Candlesticks

> Get candlestick history for a Kalshi market.



## OpenAPI

````yaml /openapi.json get /api/v1/kalshi/market/{series_id}/{kalshi_id}/candlesticks
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/kalshi/market/{series_id}/{kalshi_id}/candlesticks:
    get:
      tags:
        - Kalshi
      summary: Get Kalshi Candlesticks
      description: Get candlestick history for a Kalshi market.
      operationId: get-kalshi-market-candlesticks
      parameters:
        - name: series_id
          in: path
          required: true
          description: Kalshi series ID.
          schema:
            type: string
        - name: kalshi_id
          in: path
          required: true
          description: Kalshi market slug component.
          schema:
            type: string
        - name: start
          in: query
          required: true
          description: Start timestamp or ISO 8601 date.
          schema:
            type: string
        - name: end
          in: query
          required: false
          description: End timestamp or ISO 8601 date.
          schema:
            type: string
        - name: bucket
          in: query
          required: false
          description: Aggregation bucket.
          schema:
            type: string
        - name: points
          in: query
          required: false
          description: Target point count.
          schema:
            type: integer
        - name: order
          in: query
          required: false
          description: Sort direction.
          schema:
            type: string
        - name: limit
          in: query
          required: false
          description: Maximum points to return.
          schema:
            type: integer
        - name: offset
          in: query
          required: false
          description: Pagination offset.
          schema:
            type: integer
      responses:
        '200':
          description: Kalshi candlesticks
          content:
            application/json:
              example:
                success: true
                response:
                  - open: '0.55'
                    high: '0.62'
                    low: '0.53'
                    close: '0.58'
                    volume: '15000'
                    created_at: '2026-01-01T00:00:00'
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Kalshi Leaderboard

> Get the Kalshi leaderboard.



## OpenAPI

````yaml /openapi.json get /api/v1/kalshi/leaderboard
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/kalshi/leaderboard:
    get:
      tags:
        - Kalshi
      summary: Get Kalshi Leaderboard
      description: Get the Kalshi leaderboard.
      operationId: get-kalshi-leaderboard
      parameters:
        - name: metric
          in: query
          required: false
          description: Leaderboard metric.
          schema:
            type: string
            default: volume
            example: profit
        - name: limit
          in: query
          required: false
          description: Maximum entries to return.
          schema:
            type: integer
            default: 100
            example: 25
        - name: since
          in: query
          required: false
          description: Days of history to include.
          schema:
            type: integer
            default: 30
            example: 7
      responses:
        '200':
          description: Kalshi leaderboard
          content:
            application/json:
              example:
                success: true
                response:
                  leaders:
                    - rank: 1
                      username: top_trader
                      volume: 5000000
                      profit: 250000
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Kalshi User Profile

> Get Kalshi profile information for a public username.



## OpenAPI

````yaml /openapi.json get /api/v1/kalshi/user/{username}
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/kalshi/user/{username}:
    get:
      tags:
        - Kalshi
      summary: Get Kalshi User Profile
      description: Get Kalshi profile information for a public username.
      operationId: get-kalshi-profile
      parameters:
        - name: username
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Kalshi user profile
          content:
            application/json:
              example:
                success: true
                response:
                  profile:
                    username: top_trader
                    bio: Macro and crypto trader
                    joined_at: '2026-01-01T00:00:00'
                  metrics:
                    volume: 5000000
                    profit: 250000
                    markets_traded: 420
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Kalshi User Profile

> Get Kalshi profile information for a public username.



## OpenAPI

````yaml /openapi.json get /api/v1/kalshi/user/{username}
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/kalshi/user/{username}:
    get:
      tags:
        - Kalshi
      summary: Get Kalshi User Profile
      description: Get Kalshi profile information for a public username.
      operationId: get-kalshi-profile
      parameters:
        - name: username
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Kalshi user profile
          content:
            application/json:
              example:
                success: true
                response:
                  profile:
                    username: top_trader
                    bio: Macro and crypto trader
                    joined_at: '2026-01-01T00:00:00'
                  metrics:
                    volume: 5000000
                    profit: 250000
                    markets_traded: 420
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Kalshi User Profile

> Get Kalshi profile information for a public username.



## OpenAPI

````yaml /openapi.json get /api/v1/kalshi/user/{username}
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/kalshi/user/{username}:
    get:
      tags:
        - Kalshi
      summary: Get Kalshi User Profile
      description: Get Kalshi profile information for a public username.
      operationId: get-kalshi-profile
      parameters:
        - name: username
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Kalshi user profile
          content:
            application/json:
              example:
                success: true
                response:
                  profile:
                    username: top_trader
                    bio: Macro and crypto trader
                    joined_at: '2026-01-01T00:00:00'
                  metrics:
                    volume: 5000000
                    profit: 250000
                    markets_traded: 420
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Create Wallet

> Create a new wallet. Each wallet supports multiple chains: Polygon and Solana.



## OpenAPI

````yaml /openapi.json post /api/v1/wallet
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet:
    post:
      tags:
        - Wallets
      summary: Create Wallet
      description: >-
        Create a new wallet. Each wallet supports multiple chains: Polygon and
        Solana.
      operationId: create-wallet
      responses:
        '201':
          description: Wallet created
          content:
            application/json:
              example:
                success: true
                response:
                  wallet_id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
                  name: Wallet 1
                  chains:
                    POL:
                      address: '0x1234567890abcdef1234567890abcdef12345678'
                    SOL:
                      address: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
                  position: 0
                  autoredeem: true
                  created_at: '2026-01-01T00:00:00'
        '429':
          description: Rate limit hit
          content:
            application/json:
              example:
                success: false
                response: Rate limit exceeded
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Create Wallet

> Create a new wallet. Each wallet supports multiple chains: Polygon and Solana.



## OpenAPI

````yaml /openapi.json post /api/v1/wallet
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet:
    post:
      tags:
        - Wallets
      summary: Create Wallet
      description: >-
        Create a new wallet. Each wallet supports multiple chains: Polygon and
        Solana.
      operationId: create-wallet
      responses:
        '201':
          description: Wallet created
          content:
            application/json:
              example:
                success: true
                response:
                  wallet_id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
                  name: Wallet 1
                  chains:
                    POL:
                      address: '0x1234567890abcdef1234567890abcdef12345678'
                    SOL:
                      address: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
                  position: 0
                  autoredeem: true
                  created_at: '2026-01-01T00:00:00'
        '429':
          description: Rate limit hit
          content:
            application/json:
              example:
                success: false
                response: Rate limit exceeded
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Create Wallet

> Create a new wallet. Each wallet supports multiple chains: Polygon and Solana.



## OpenAPI

````yaml /openapi.json post /api/v1/wallet
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet:
    post:
      tags:
        - Wallets
      summary: Create Wallet
      description: >-
        Create a new wallet. Each wallet supports multiple chains: Polygon and
        Solana.
      operationId: create-wallet
      responses:
        '201':
          description: Wallet created
          content:
            application/json:
              example:
                success: true
                response:
                  wallet_id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
                  name: Wallet 1
                  chains:
                    POL:
                      address: '0x1234567890abcdef1234567890abcdef12345678'
                    SOL:
                      address: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
                  position: 0
                  autoredeem: true
                  created_at: '2026-01-01T00:00:00'
        '429':
          description: Rate limit hit
          content:
            application/json:
              example:
                success: false
                response: Rate limit exceeded
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Export Wallet

> Export an encrypted wallet secret for a specific chain. Send `public_key` as a non-empty base64-encoded DER/SPKI P-256 public key. The wallet secret is encrypted with HPKE before it leaves the API. For `POL`, the underlying plaintext is the wallet private key as a `0x`-prefixed hex string. For `SOL`, the underlying plaintext is the wallet keypair encoded as a base58 string. The response returns only the HPKE `ciphertext` and `encapsulated_key` needed for client-side decryption.



## OpenAPI

````yaml /openapi.json post /api/v1/wallet/{chain_id}/{wallet_id}/export
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/{chain_id}/{wallet_id}/export:
    post:
      tags:
        - Wallets
      summary: Export Wallet
      description: >-
        Export an encrypted wallet secret for a specific chain. Send
        `public_key` as a non-empty base64-encoded DER/SPKI P-256 public key.
        The wallet secret is encrypted with HPKE before it leaves the API. For
        `POL`, the underlying plaintext is the wallet private key as a
        `0x`-prefixed hex string. For `SOL`, the underlying plaintext is the
        wallet keypair encoded as a base58 string. The response returns only the
        HPKE `ciphertext` and `encapsulated_key` needed for client-side
        decryption.
      operationId: export-wallet
      parameters:
        - name: chain_id
          in: path
          required: true
          description: '`POL` or `SOL`.'
          schema:
            type: string
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - public_key
              properties:
                public_key:
                  type: string
                  description: >-
                    Recipient HPKE public key as a base64-encoded DER/SPKI P-256
                    public key. Empty strings and non-base64 payloads are
                    rejected.
                  example: MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...
      responses:
        '200':
          description: Wallet exported
          content:
            application/json:
              example:
                success: true
                response:
                  ciphertext: base64-encrypted-wallet-secret
                  encapsulated_key: base64-hpke-encapsulated-key
        '400':
          description: Invalid request
          content:
            application/json:
              example:
                success: false
                response: Invalid public key format
        '404':
          description: Wallet not found
          content:
            application/json:
              example:
                success: false
                response: Wallet not found
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Deposit Address

> Get a deposit address for a wallet and destination chain. Supported `chain` values are `EVM`, `SOL`, and `TRON`, but `SOL` is not allowed when `chain_id` is `SOL`.



## OpenAPI

````yaml /openapi.json get /api/v1/wallet/{chain_id}/{wallet_id}/deposit/{chain}
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/{chain_id}/{wallet_id}/deposit/{chain}:
    get:
      tags:
        - Wallets
      summary: Get Deposit Address
      description: >-
        Get a deposit address for a wallet and destination chain. Supported
        `chain` values are `EVM`, `SOL`, and `TRON`, but `SOL` is not allowed
        when `chain_id` is `SOL`.
      operationId: get-deposit-address
      parameters:
        - name: chain_id
          in: path
          required: true
          description: '`POL` or `SOL`.'
          schema:
            type: string
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
        - name: chain
          in: path
          required: true
          description: '`EVM`, `SOL`, or `TRON`.'
          schema:
            type: string
      responses:
        '200':
          description: Deposit address
          content:
            application/json:
              example:
                success: true
                response:
                  - chain: ETHEREUM
                    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
                    tokens:
                      - token: USDC
                        contract: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
                        min: '1'
                        max: '100000'
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Wallet Balance

> Get balance across all chains for a wallet.



## OpenAPI

````yaml /openapi.json get /api/v1/wallet/{wallet_id}/balance
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/{wallet_id}/balance:
    get:
      tags:
        - Wallets
      summary: Get Wallet Balance
      description: Get balance across all chains for a wallet.
      operationId: get-wallet-balance
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Wallet balance
          content:
            application/json:
              example:
                success: true
                response:
                  - wallet_id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
                    chain_id: POL
                    address: '0x1234567890abcdef1234567890abcdef12345678'
                    balance:
                      USDC.e: '1000.000'
                      USDC: '500.000'
                  - wallet_id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
                    chain_id: SOL
                    address: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
                    balance:
                      USDC: '250.000'
        '404':
          description: Wallet not found
          content:
            application/json:
              example:
                success: false
                response: Wallet not found
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Wallet Orders

> Get orders across all chains for a wallet.



## OpenAPI

````yaml /openapi.json get /api/v1/wallet/{wallet_id}/orders
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/{wallet_id}/orders:
    get:
      tags:
        - Wallets
      summary: Get Wallet Orders
      description: Get orders across all chains for a wallet.
      operationId: get-wallet-orders
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
        - name: limit
          in: query
          required: false
          description: Maximum orders to return. Capped at `1000`.
          schema:
            type: integer
            default: 100
            example: 100
        - name: offset
          in: query
          required: false
          description: Pagination offset.
          schema:
            type: integer
            default: 0
            example: 0
      responses:
        '200':
          description: Wallet orders
          content:
            application/json:
              example:
                success: true
                response:
                  - venue: polymarket
                    order:
                      order_id: >-
                        0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2
                      token_id: >-
                        21742633143463906290569050155826241533067272736897614950488156847949938836455
                      side: BUY
                      type: LIMIT
                      amount: '100.000'
                      shares: '152.300'
                      filled: '152.300'
                      price: '0.657'
                      fee: {}
                      units: USDC
                      status: FILLED
                      created_at: '2026-01-01T00:00:00'
                      updated_at: '2026-01-01T00:00:00'
                    event:
                      event_id: 12345
                      title: Will Bitcoin reach $100k by end of 2025?
                      slug: will-bitcoin-reach-100k-by-end-of-2025
                      description: >-
                        This market resolves to Yes if spot Bitcoin trades at or
                        above $100,000 before 2025 ends.
                      image: https://example.com/bitcoin.png
                      tags:
                        - crypto
                        - bitcoin
                      labels:
                        - crypto
                        - macro
                      neg_risk: false
                      active: true
                      liquidity: '1500000'
                      volume: '5000000'
                      volume24hr: '250000'
                      volume1wk: '900000'
                      volume1mo: '2200000'
                      volume1yr: '5000000'
                      live:
                        live: false
                        ended: false
                      created_at: '2026-01-01T00:00:00'
                      updated_at: '2026-01-01T00:00:00'
                      ends_at: '2026-12-31T23:59:59'
                    market:
                      event_id: 12345
                      condition_id: >-
                        0xbd71b43bb47eb60dbcb41fa25df2a0ed4da612873d6e0447a2c730bd4cc25910
                      question: Will Bitcoin reach $100k?
                      outcome: 'Yes'
                      slug: will-bitcoin-reach-100k-yes
                      description: >-
                        Buy Yes if you think Bitcoin will trade at or above
                        $100,000 before market expiry.
                      image: https://example.com/bitcoin-market.png
                      left_outcome: 'Yes'
                      right_outcome: 'No'
                      left_price: '0.65'
                      right_price: '0.35'
                      left_token_id: >-
                        21742633143463906290569050155826241533067272736897614950488156847949938836455
                      right_token_id: >-
                        48572956138472615938471625938471659384716593847165938471659384716593847165938
                      winner_token_id: ''
                      active: true
                      resolved: false
                      fees: true
                      decimals: 6
                      liquidity: '1500000'
                      volume: '5000000'
                      volume24hr: '250000'
                      volume1wk: '900000'
                      volume1mo: '2200000'
                      volume1yr: '5000000'
                      rewards:
                        rewards: false
                      created_at: '2026-01-01T00:00:00'
                      updated_at: '2026-01-01T00:00:00'
                      ends_at: '2026-12-31T23:59:59'
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Wallet Positions

> Get positions across all chains for a wallet.



## OpenAPI

````yaml /openapi.json get /api/v1/wallet/{wallet_id}/positions
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/{wallet_id}/positions:
    get:
      tags:
        - Wallets
      summary: Get Wallet Positions
      description: Get positions across all chains for a wallet.
      operationId: get-wallet-positions
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Wallet positions
          content:
            application/json:
              example:
                success: true
                response:
                  - position:
                      token_id: >-
                        21742633143463906290569050155826241533067272736897614950488156847949938836455
                      outcome: 'Yes'
                      shares: '500.000'
                      avg_price: '0.550'
                      current_price: '0.650'
                      initial_value: '275.000'
                      current_value: '325.000'
                      amount_pnl: '50.000'
                      percent_pnl: '18.18'
                      redeemable: false
                      created_at: '2026-01-01T00:00:00'
                      venue: polymarket
                      wallet_id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
                      chain_id: POL
                    event:
                      event_id: 12345
                      title: Will Bitcoin reach $100k by end of 2025?
                      slug: will-bitcoin-reach-100k-by-end-of-2025
                      description: >-
                        This market resolves to Yes if spot Bitcoin trades at or
                        above $100,000 before 2025 ends.
                      image: https://example.com/bitcoin.png
                      tags:
                        - crypto
                        - bitcoin
                      labels:
                        - crypto
                        - macro
                      neg_risk: false
                      active: true
                      liquidity: '1500000'
                      volume: '5000000'
                      volume24hr: '250000'
                      volume1wk: '900000'
                      volume1mo: '2200000'
                      volume1yr: '5000000'
                      live:
                        live: false
                        ended: false
                      created_at: '2026-01-01T00:00:00'
                      updated_at: '2026-01-01T00:00:00'
                      ends_at: '2026-12-31T23:59:59'
                    market:
                      event_id: 12345
                      condition_id: >-
                        0xbd71b43bb47eb60dbcb41fa25df2a0ed4da612873d6e0447a2c730bd4cc25910
                      question: Will Bitcoin reach $100k?
                      outcome: 'Yes'
                      slug: will-bitcoin-reach-100k-yes
                      description: >-
                        Buy Yes if you think Bitcoin will trade at or above
                        $100,000 before market expiry.
                      image: https://example.com/bitcoin-market.png
                      left_outcome: 'Yes'
                      right_outcome: 'No'
                      left_price: '0.65'
                      right_price: '0.35'
                      left_token_id: >-
                        21742633143463906290569050155826241533067272736897614950488156847949938836455
                      right_token_id: >-
                        48572956138472615938471625938471659384716593847165938471659384716593847165938
                      winner_token_id: ''
                      active: true
                      resolved: false
                      fees: true
                      decimals: 6
                      liquidity: '1500000'
                      volume: '5000000'
                      volume24hr: '250000'
                      volume1wk: '900000'
                      volume1mo: '2200000'
                      volume1yr: '5000000'
                      rewards:
                        rewards: false
                      created_at: '2026-01-01T00:00:00'
                      updated_at: '2026-01-01T00:00:00'
                      ends_at: '2026-12-31T23:59:59'
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Wallet Transfers

> Get transfers across all chains for a wallet.



## OpenAPI

````yaml /openapi.json get /api/v1/wallet/{wallet_id}/transfers
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/{wallet_id}/transfers:
    get:
      tags:
        - Wallets
      summary: Get Wallet Transfers
      description: Get transfers across all chains for a wallet.
      operationId: get-wallet-transfers
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
        - name: limit
          in: query
          required: false
          description: Maximum transfers to return. Capped at `1000`.
          schema:
            type: integer
            default: 100
            example: 100
        - name: offset
          in: query
          required: false
          description: Pagination offset.
          schema:
            type: integer
            default: 0
            example: 0
      responses:
        '200':
          description: Wallet transfers
          content:
            application/json:
              example:
                success: true
                response:
                  - venue: polymarket
                    tx_hash: >-
                      0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2
                    transfer_type: DEPOSIT
                    asset_type: ERC20
                    asset_id: USDC.e
                    address: '0x1234567890abcdef1234567890abcdef12345678'
                    from_address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
                    to_address: '0x1234567890abcdef1234567890abcdef12345678'
                    amount: '100.000'
                    type: DEPOSIT
                    created_at: '2026-01-01T00:00:00'
                  - venue: kalshi
                    tx_hash: 5QqJcC8Rj9o3v7x2Yp4mN6bT1rE8uKzA2sD4fG7hJ9kL
                    transfer_type: DEPOSIT
                    asset_type: SPL_TOKEN
                    asset_id: USDC
                    address: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
                    from_address: ...
                    to_address: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
                    amount: '50.000'
                    type: DEPOSIT
                    created_at: '2025-01-15T11:00:00'
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Wallet PNL

> Get combined PNL history across all chains for a wallet.



## OpenAPI

````yaml /openapi.json get /api/v1/wallet/{wallet_id}/pnl
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/{wallet_id}/pnl:
    get:
      tags:
        - Wallets
      summary: Get Wallet PNL
      description: Get combined PNL history across all chains for a wallet.
      operationId: get-wallet-pnl
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
        - name: interval
          in: query
          required: false
          description: 'PNL interval. Supported values: `1d`, `1w`, `1m`, `3m`, `1y`, `all`.'
          schema:
            type: string
            default: 1m
            example: 1w
      responses:
        '200':
          description: Wallet PNL
          content:
            application/json:
              example:
                success: true
                response:
                  - ts: 1735689600
                    realized: '0'
                    unrealized: '0'
                    total: '0'
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Wallets

> Get Polygon wallets for the authenticated account.



## OpenAPI

````yaml /openapi.json get /api/v1/wallet/pol
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/pol:
    get:
      tags:
        - Polygon
      summary: Get Wallets
      description: Get Polygon wallets for the authenticated account.
      operationId: get-polygon-wallets
      responses:
        '200':
          description: Polygon wallets
          content:
            application/json:
              example:
                success: true
                response:
                  - wallet_id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
                    chain_id: POL
                    name: Wallet 1
                    address: '0x1234567890abcdef1234567890abcdef12345678'
                    position: 0
                    autoredeem: true
                    created_at: '2026-01-01T00:00:00'
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Balance

> Get balances for a Polygon wallet.



## OpenAPI

````yaml /openapi.json get /api/v1/wallet/pol/{wallet_id}/balance
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/pol/{wallet_id}/balance:
    get:
      tags:
        - Polygon
      summary: Get Balance
      description: Get balances for a Polygon wallet.
      operationId: get-polygon-balance
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Polygon balance
          content:
            application/json:
              example:
                success: true
                response:
                  wallet_id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
                  chain_id: POL
                  address: '0x1234567890abcdef1234567890abcdef12345678'
                  balance:
                    USDC.e: '1000.000'
                    USDC: '500.000'
        '404':
          description: Wallet not found
          content:
            application/json:
              example:
                success: false
                response: Wallet not found
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Orders

> Get Polymarket order history for a Polygon wallet.



## OpenAPI

````yaml /openapi.json get /api/v1/wallet/pol/{wallet_id}/orders
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/pol/{wallet_id}/orders:
    get:
      tags:
        - Polygon
      summary: Get Orders
      description: Get Polymarket order history for a Polygon wallet.
      operationId: get-polygon-orders
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
        - name: limit
          in: query
          required: false
          description: Maximum orders to return. Capped at `1000`.
          schema:
            type: integer
            default: 100
            example: 100
        - name: offset
          in: query
          required: false
          description: Pagination offset.
          schema:
            type: integer
            default: 0
            example: 0
      responses:
        '200':
          description: Polygon orders
          content:
            application/json:
              example:
                success: true
                response:
                  - venue: polymarket
                    order:
                      order_id: >-
                        0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2
                      token_id: >-
                        21742633143463906290569050155826241533067272736897614950488156847949938836455
                      side: BUY
                      type: LIMIT
                      amount: '100.000'
                      shares: '152.300'
                      filled: '152.300'
                      price: '0.657'
                      fee: {}
                      units: USDC
                      status: FILLED
                      created_at: '2026-01-01T00:00:00'
                      updated_at: '2026-01-01T00:00:00'
                    event:
                      event_id: 12345
                      title: Will Bitcoin reach $100k by end of 2025?
                      slug: will-bitcoin-reach-100k-by-end-of-2025
                      description: >-
                        This market resolves to Yes if spot Bitcoin trades at or
                        above $100,000 before 2025 ends.
                      image: https://example.com/bitcoin.png
                      tags:
                        - crypto
                        - bitcoin
                      labels:
                        - crypto
                        - macro
                      neg_risk: false
                      active: true
                      liquidity: '1500000'
                      volume: '5000000'
                      volume24hr: '250000'
                      volume1wk: '900000'
                      volume1mo: '2200000'
                      volume1yr: '5000000'
                      live:
                        live: false
                        ended: false
                      created_at: '2026-01-01T00:00:00'
                      updated_at: '2026-01-01T00:00:00'
                      ends_at: '2026-12-31T23:59:59'
                    market:
                      event_id: 12345
                      condition_id: >-
                        0xbd71b43bb47eb60dbcb41fa25df2a0ed4da612873d6e0447a2c730bd4cc25910
                      question: Will Bitcoin reach $100k?
                      outcome: 'Yes'
                      slug: will-bitcoin-reach-100k-yes
                      description: >-
                        Buy Yes if you think Bitcoin will trade at or above
                        $100,000 before market expiry.
                      image: https://example.com/bitcoin-market.png
                      left_outcome: 'Yes'
                      right_outcome: 'No'
                      left_price: '0.65'
                      right_price: '0.35'
                      left_token_id: >-
                        21742633143463906290569050155826241533067272736897614950488156847949938836455
                      right_token_id: >-
                        48572956138472615938471625938471659384716593847165938471659384716593847165938
                      winner_token_id: ''
                      active: true
                      resolved: false
                      fees: true
                      decimals: 6
                      liquidity: '1500000'
                      volume: '5000000'
                      volume24hr: '250000'
                      volume1wk: '900000'
                      volume1mo: '2200000'
                      volume1yr: '5000000'
                      rewards:
                        rewards: false
                      created_at: '2026-01-01T00:00:00'
                      updated_at: '2026-01-01T00:00:00'
                      ends_at: '2026-12-31T23:59:59'
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Cancel All Orders

> Cancel all open Polymarket orders for a Polygon wallet.



## OpenAPI

````yaml /openapi.json delete /api/v1/wallet/pol/{wallet_id}/orders
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/pol/{wallet_id}/orders:
    delete:
      tags:
        - Polygon
      summary: Cancel All Orders
      description: Cancel all open Polymarket orders for a Polygon wallet.
      operationId: cancel-polygon-orders
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Polygon orders cancelled
          content:
            application/json:
              example:
                success: true
                response:
                  order_ids:
                    - >-
                      0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
                    - a1b2c3d4-e5f6-7890-abcd-ef1234567890
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Positions

> Get Polymarket positions for a Polygon wallet.



## OpenAPI

````yaml /openapi.json get /api/v1/wallet/pol/{wallet_id}/positions
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/pol/{wallet_id}/positions:
    get:
      tags:
        - Polygon
      summary: Get Positions
      description: Get Polymarket positions for a Polygon wallet.
      operationId: get-polygon-positions
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Polygon positions
          content:
            application/json:
              example:
                success: true
                response:
                  - position:
                      token_id: >-
                        21742633143463906290569050155826241533067272736897614950488156847949938836455
                      outcome: 'Yes'
                      shares: '500.000'
                      avg_price: '0.550'
                      current_price: '0.650'
                      initial_value: '275.000'
                      current_value: '325.000'
                      amount_pnl: '50.000'
                      percent_pnl: '18.18'
                      redeemable: false
                      created_at: '2026-01-01T00:00:00'
                    event:
                      event_id: 12345
                      title: Will Bitcoin reach $100k by end of 2025?
                      slug: will-bitcoin-reach-100k-by-end-of-2025
                      description: >-
                        This market resolves to Yes if spot Bitcoin trades at or
                        above $100,000 before 2025 ends.
                      image: https://example.com/bitcoin.png
                      tags:
                        - crypto
                        - bitcoin
                      labels:
                        - crypto
                        - macro
                      neg_risk: false
                      active: true
                      liquidity: '1500000'
                      volume: '5000000'
                      volume24hr: '250000'
                      volume1wk: '900000'
                      volume1mo: '2200000'
                      volume1yr: '5000000'
                      live:
                        live: false
                        ended: false
                      created_at: '2026-01-01T00:00:00'
                      updated_at: '2026-01-01T00:00:00'
                      ends_at: '2026-12-31T23:59:59'
                    market:
                      event_id: 12345
                      condition_id: >-
                        0xbd71b43bb47eb60dbcb41fa25df2a0ed4da612873d6e0447a2c730bd4cc25910
                      question: Will Bitcoin reach $100k?
                      outcome: 'Yes'
                      slug: will-bitcoin-reach-100k-yes
                      description: >-
                        Buy Yes if you think Bitcoin will trade at or above
                        $100,000 before market expiry.
                      image: https://example.com/bitcoin-market.png
                      left_outcome: 'Yes'
                      right_outcome: 'No'
                      left_price: '0.65'
                      right_price: '0.35'
                      left_token_id: >-
                        21742633143463906290569050155826241533067272736897614950488156847949938836455
                      right_token_id: >-
                        48572956138472615938471625938471659384716593847165938471659384716593847165938
                      winner_token_id: ''
                      active: true
                      resolved: false
                      fees: true
                      decimals: 6
                      liquidity: '1500000'
                      volume: '5000000'
                      volume24hr: '250000'
                      volume1wk: '900000'
                      volume1mo: '2200000'
                      volume1yr: '5000000'
                      rewards:
                        rewards: false
                      created_at: '2026-01-01T00:00:00'
                      updated_at: '2026-01-01T00:00:00'
                      ends_at: '2026-12-31T23:59:59'
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Positions

> Get Polymarket positions for a Polygon wallet.



## OpenAPI

````yaml /openapi.json get /api/v1/wallet/pol/{wallet_id}/positions
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/pol/{wallet_id}/positions:
    get:
      tags:
        - Polygon
      summary: Get Positions
      description: Get Polymarket positions for a Polygon wallet.
      operationId: get-polygon-positions
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Polygon positions
          content:
            application/json:
              example:
                success: true
                response:
                  - position:
                      token_id: >-
                        21742633143463906290569050155826241533067272736897614950488156847949938836455
                      outcome: 'Yes'
                      shares: '500.000'
                      avg_price: '0.550'
                      current_price: '0.650'
                      initial_value: '275.000'
                      current_value: '325.000'
                      amount_pnl: '50.000'
                      percent_pnl: '18.18'
                      redeemable: false
                      created_at: '2026-01-01T00:00:00'
                    event:
                      event_id: 12345
                      title: Will Bitcoin reach $100k by end of 2025?
                      slug: will-bitcoin-reach-100k-by-end-of-2025
                      description: >-
                        This market resolves to Yes if spot Bitcoin trades at or
                        above $100,000 before 2025 ends.
                      image: https://example.com/bitcoin.png
                      tags:
                        - crypto
                        - bitcoin
                      labels:
                        - crypto
                        - macro
                      neg_risk: false
                      active: true
                      liquidity: '1500000'
                      volume: '5000000'
                      volume24hr: '250000'
                      volume1wk: '900000'
                      volume1mo: '2200000'
                      volume1yr: '5000000'
                      live:
                        live: false
                        ended: false
                      created_at: '2026-01-01T00:00:00'
                      updated_at: '2026-01-01T00:00:00'
                      ends_at: '2026-12-31T23:59:59'
                    market:
                      event_id: 12345
                      condition_id: >-
                        0xbd71b43bb47eb60dbcb41fa25df2a0ed4da612873d6e0447a2c730bd4cc25910
                      question: Will Bitcoin reach $100k?
                      outcome: 'Yes'
                      slug: will-bitcoin-reach-100k-yes
                      description: >-
                        Buy Yes if you think Bitcoin will trade at or above
                        $100,000 before market expiry.
                      image: https://example.com/bitcoin-market.png
                      left_outcome: 'Yes'
                      right_outcome: 'No'
                      left_price: '0.65'
                      right_price: '0.35'
                      left_token_id: >-
                        21742633143463906290569050155826241533067272736897614950488156847949938836455
                      right_token_id: >-
                        48572956138472615938471625938471659384716593847165938471659384716593847165938
                      winner_token_id: ''
                      active: true
                      resolved: false
                      fees: true
                      decimals: 6
                      liquidity: '1500000'
                      volume: '5000000'
                      volume24hr: '250000'
                      volume1wk: '900000'
                      volume1mo: '2200000'
                      volume1yr: '5000000'
                      rewards:
                        rewards: false
                      created_at: '2026-01-01T00:00:00'
                      updated_at: '2026-01-01T00:00:00'
                      ends_at: '2026-12-31T23:59:59'
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get PNL

> Get Polymarket PNL history for a Polygon wallet.



## OpenAPI

````yaml /openapi.json get /api/v1/wallet/pol/{wallet_id}/pnl
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/pol/{wallet_id}/pnl:
    get:
      tags:
        - Polygon
      summary: Get PNL
      description: Get Polymarket PNL history for a Polygon wallet.
      operationId: get-polygon-pnl
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
        - name: interval
          in: query
          required: false
          description: 'PNL interval. Supported values: `1d`, `1w`, `1m`, `3m`, `1y`, `all`.'
          schema:
            type: string
            default: 1m
            example: 1w
      responses:
        '200':
          description: Polygon PNL
          content:
            application/json:
              example:
                success: true
                response:
                  - ts: 1735689600
                    realized: '0'
                    unrealized: '0'
                    total: '0'
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get PNL

> Get Polymarket PNL history for a Polygon wallet.



## OpenAPI

````yaml /openapi.json get /api/v1/wallet/pol/{wallet_id}/pnl
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/pol/{wallet_id}/pnl:
    get:
      tags:
        - Polygon
      summary: Get PNL
      description: Get Polymarket PNL history for a Polygon wallet.
      operationId: get-polygon-pnl
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
        - name: interval
          in: query
          required: false
          description: 'PNL interval. Supported values: `1d`, `1w`, `1m`, `3m`, `1y`, `all`.'
          schema:
            type: string
            default: 1m
            example: 1w
      responses:
        '200':
          description: Polygon PNL
          content:
            application/json:
              example:
                success: true
                response:
                  - ts: 1735689600
                    realized: '0'
                    unrealized: '0'
                    total: '0'
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Create Order

> Create a Polymarket order for a Polygon wallet.



## OpenAPI

````yaml /openapi.json post /api/v1/wallet/pol/{wallet_id}/order
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/pol/{wallet_id}/order:
    post:
      tags:
        - Polygon
      summary: Create Order
      description: Create a Polymarket order for a Polygon wallet.
      operationId: create-polygon-order
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - token_id
                - side
                - type
                - amount
                - units
              properties:
                token_id:
                  type: string
                  description: Polymarket token ID as a numeric string.
                side:
                  type: string
                  description: '`BUY` or `SELL`.'
                type:
                  type: string
                  description: '`MARKET`, `LIMIT`, or `STOPLOSS`.'
                amount:
                  type: string
                  description: Order amount as string or number.
                price:
                  type: string
                  description: >-
                    Required for `LIMIT` and `STOPLOSS`. Must be greater than
                    `0` and less than or equal to `1`.
                units:
                  type: string
                  description: '`USDC` or `SHARES`.'
      responses:
        '201':
          description: Polygon order created | Polygon stoploss created
          content:
            application/json:
              examples:
                Polygon order created:
                  value:
                    success: true
                    response:
                      order_id: >-
                        0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2
                      token_id: >-
                        21742633143463906290569050155826241533067272736897614950488156847949938836455
                      side: BUY
                      type: MARKET
                      amount: '100.000'
                      shares: '152.300'
                      filled: '0.000'
                      price: '0.657'
                      fee: {}
                      units: USDC
                      status: MATCHED
                      created_at: '2026-01-01T00:00:00'
                      updated_at: '2026-01-01T00:00:00'
                Polygon stoploss created:
                  value:
                    success: true
                    response:
                      stoploss_id: ...
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Order

> Get a single Polymarket order.



## OpenAPI

````yaml /openapi.json get /api/v1/wallet/pol/{wallet_id}/order/{order_id}
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/pol/{wallet_id}/order/{order_id}:
    get:
      tags:
        - Polygon
      summary: Get Order
      description: Get a single Polymarket order.
      operationId: get-polygon-order
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
        - name: order_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Polygon order
          content:
            application/json:
              example:
                success: true
                response:
                  order_id: >-
                    0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2
                  token_id: >-
                    21742633143463906290569050155826241533067272736897614950488156847949938836455
                  side: BUY
                  type: LIMIT
                  amount: '100.000'
                  shares: '152.300'
                  filled: '152.300'
                  price: '0.657'
                  fee: {}
                  units: USDC
                  status: FILLED
                  created_at: '2026-01-01T00:00:00'
                  updated_at: '2026-01-01T00:00:00'
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).


> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Update Order

> Update a limit order price or modify an active stoploss order.



## OpenAPI

````yaml /openapi.json put /api/v1/wallet/pol/{wallet_id}/order/{order_id}
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/pol/{wallet_id}/order/{order_id}:
    put:
      tags:
        - Polygon
      summary: Update Order
      description: Update a limit order price or modify an active stoploss order.
      operationId: update-polygon-order
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
        - name: order_id
          in: path
          required: true
          description: Order or stoploss ID.
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - type
              properties:
                type:
                  type: string
                  description: '`LIMIT` or `STOPLOSS`.'
                price:
                  type: string
                  description: Updated price.
                shares:
                  type: string
                  description: Updated stoploss share amount.
      responses:
        '200':
          description: Polygon order updated
          content:
            application/json:
              example:
                success: true
                response:
                  order_id: >-
                    0xf9e8d7c6b5a4f9e8d7c6b5a4f9e8d7c6b5a4f9e8d7c6b5a4f9e8d7c6b5a4f9e8
                  token_id: >-
                    21742633143463906290569050155826241533067272736897614950488156847949938836455
                  side: BUY
                  type: LIMIT
                  amount: '100.000'
                  shares: '152.300'
                  filled: '0.000'
                  price: '0.657'
                  fee: {}
                  units: SHARES
                  status: OPEN
                  created_at: '2026-01-01T00:00:00'
                  updated_at: '2026-01-01T00:00:00'
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Cancel Order

> Cancel a Polymarket order.



## OpenAPI

````yaml /openapi.json delete /api/v1/wallet/pol/{wallet_id}/order/{order_id}
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/pol/{wallet_id}/order/{order_id}:
    delete:
      tags:
        - Polygon
      summary: Cancel Order
      description: Cancel a Polymarket order.
      operationId: cancel-polygon-order
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
        - name: order_id
          in: path
          required: true
          description: Order or stoploss ID.
          schema:
            type: string
      responses:
        '200':
          description: Polygon order cancelled
          content:
            application/json:
              example:
                success: true
                response:
                  order_id: ...
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Cancel Order

> Cancel a Polymarket order.



## OpenAPI

````yaml /openapi.json delete /api/v1/wallet/pol/{wallet_id}/order/{order_id}
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/pol/{wallet_id}/order/{order_id}:
    delete:
      tags:
        - Polygon
      summary: Cancel Order
      description: Cancel a Polymarket order.
      operationId: cancel-polygon-order
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
        - name: order_id
          in: path
          required: true
          description: Order or stoploss ID.
          schema:
            type: string
      responses:
        '200':
          description: Polygon order cancelled
          content:
            application/json:
              example:
                success: true
                response:
                  order_id: ...
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Active Market Orders

> Get active Polymarket orders for a specific market.



## OpenAPI

````yaml /openapi.json get /api/v1/wallet/pol/{wallet_id}/orders/{condition_id}/active
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/pol/{wallet_id}/orders/{condition_id}/active:
    get:
      tags:
        - Polygon
      summary: Get Active Market Orders
      description: Get active Polymarket orders for a specific market.
      operationId: get-polygon-active-market-orders
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
        - name: condition_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Active market orders
          content:
            application/json:
              example:
                success: true
                response:
                  - order_id: >-
                      0xf9e8d7c6b5a4f9e8d7c6b5a4f9e8d7c6b5a4f9e8d7c6b5a4f9e8d7c6b5a4f9e8
                    token_id: >-
                      21742633143463906290569050155826241533067272736897614950488156847949938836455
                    type: LIMIT
                    side: BUY
                    shares: '152.300'
                    filled: '0'
                    price: '0.61'
                    status: ACTIVE
                    created_at: 1736937000
                  - order_id: b2c3d4e5-f6a7-8901-bcde-f23456789012
                    token_id: >-
                      21742633143463906290569050155826241533067272736897614950488156847949938836455
                    type: STOPLOSS
                    side: SELL
                    shares: '152.300'
                    filled: '0'
                    price: '0.45'
                    status: ACTIVE
                    created_at: 1736937100
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Trades

> Get Polymarket trade history for a Polygon wallet.



## OpenAPI

````yaml /openapi.json get /api/v1/wallet/pol/{wallet_id}/trades
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/pol/{wallet_id}/trades:
    get:
      tags:
        - Polygon
      summary: Get Trades
      description: Get Polymarket trade history for a Polygon wallet.
      operationId: get-polygon-trades
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Polygon trades
          content:
            application/json:
              example:
                success: true
                response:
                  - tx_hash: >-
                      0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2
                    side: BUY
                    price: '0.65'
                    shares: '150.0'
                    amount: '97.5'
                    created_at: '2026-01-01T00:00:00'
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Trades

> Get Polymarket trade history for a Polygon wallet.



## OpenAPI

````yaml /openapi.json get /api/v1/wallet/pol/{wallet_id}/trades
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/pol/{wallet_id}/trades:
    get:
      tags:
        - Polygon
      summary: Get Trades
      description: Get Polymarket trade history for a Polygon wallet.
      operationId: get-polygon-trades
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Polygon trades
          content:
            application/json:
              example:
                success: true
                response:
                  - tx_hash: >-
                      0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2
                    side: BUY
                    price: '0.65'
                    shares: '150.0'
                    amount: '97.5'
                    created_at: '2026-01-01T00:00:00'
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Trades

> Get Polymarket trade history for a Polygon wallet.



## OpenAPI

````yaml /openapi.json get /api/v1/wallet/pol/{wallet_id}/trades
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/pol/{wallet_id}/trades:
    get:
      tags:
        - Polygon
      summary: Get Trades
      description: Get Polymarket trade history for a Polygon wallet.
      operationId: get-polygon-trades
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Polygon trades
          content:
            application/json:
              example:
                success: true
                response:
                  - tx_hash: >-
                      0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2
                    side: BUY
                    price: '0.65'
                    shares: '150.0'
                    amount: '97.5'
                    created_at: '2026-01-01T00:00:00'
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Trades

> Get Polymarket trade history for a Polygon wallet.



## OpenAPI

````yaml /openapi.json get /api/v1/wallet/pol/{wallet_id}/trades
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/pol/{wallet_id}/trades:
    get:
      tags:
        - Polygon
      summary: Get Trades
      description: Get Polymarket trade history for a Polygon wallet.
      operationId: get-polygon-trades
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Polygon trades
          content:
            application/json:
              example:
                success: true
                response:
                  - tx_hash: >-
                      0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2
                    side: BUY
                    price: '0.65'
                    shares: '150.0'
                    amount: '97.5'
                    created_at: '2026-01-01T00:00:00'
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Trades

> Get Polymarket trade history for a Polygon wallet.



## OpenAPI

````yaml /openapi.json get /api/v1/wallet/pol/{wallet_id}/trades
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/pol/{wallet_id}/trades:
    get:
      tags:
        - Polygon
      summary: Get Trades
      description: Get Polymarket trade history for a Polygon wallet.
      operationId: get-polygon-trades
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Polygon trades
          content:
            application/json:
              example:
                success: true
                response:
                  - tx_hash: >-
                      0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2
                    side: BUY
                    price: '0.65'
                    shares: '150.0'
                    amount: '97.5'
                    created_at: '2026-01-01T00:00:00'
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Trades

> Get Polymarket trade history for a Polygon wallet.



## OpenAPI

````yaml /openapi.json get /api/v1/wallet/pol/{wallet_id}/trades
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/pol/{wallet_id}/trades:
    get:
      tags:
        - Polygon
      summary: Get Trades
      description: Get Polymarket trade history for a Polygon wallet.
      operationId: get-polygon-trades
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Polygon trades
          content:
            application/json:
              example:
                success: true
                response:
                  - tx_hash: >-
                      0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2
                    side: BUY
                    price: '0.65'
                    shares: '150.0'
                    amount: '97.5'
                    created_at: '2026-01-01T00:00:00'
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Copytrades

> Get Polymarket copytrade configurations for a Polygon wallet.



## OpenAPI

````yaml /openapi.json get /api/v1/wallet/pol/{wallet_id}/copytrade
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/pol/{wallet_id}/copytrade:
    get:
      tags:
        - Polygon Copytrades
      summary: Get Copytrades
      description: Get Polymarket copytrade configurations for a Polygon wallet.
      operationId: get-polygon-copytrades
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Polygon copytrades
          content:
            application/json:
              example:
                success: true
                response:
                  - copytrade_id: 01234567-89ab-cdef-0123-456789abcdef
                    order_ids: []
                    target: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
                    mode: COPY
                    spent: '0'
                    settings:
                      filters:
                        resolution:
                          enabled: false
                          within_seconds: 0
                        price:
                          enabled: false
                          min: null
                          max: null
                        slippage:
                          enabled: true
                          max_cents: '5'
                        labels:
                          enabled: false
                          allow: []
                          deny: []
                        exposure:
                          enabled: false
                          max_market: null
                          max_event: null
                        amount:
                          enabled: false
                          min: null
                          max: null
                      buy:
                        enabled: true
                        insufficient_funds: BUY_MAX
                        sizing:
                          type: FIXED
                          amount: '10'
                        total:
                          type: NONE
                      sell:
                        enabled: true
                        insufficient_shares: SELL_MAX
                        sizing:
                          type: PERCENTAGE
                          percent: '1'
                        take_profit:
                          enabled: false
                          percent: null
                    status: ACTIVE
                    created_at: '2026-01-01T00:00:00'
                    updated_at: '2026-01-01T00:00:00'
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Create Copytrade

> Create a Polymarket copytrade configuration for a Polygon wallet.



## OpenAPI

````yaml /openapi.json post /api/v1/wallet/pol/{wallet_id}/copytrade
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/pol/{wallet_id}/copytrade:
    post:
      tags:
        - Polygon Copytrades
      summary: Create Copytrade
      description: Create a Polymarket copytrade configuration for a Polygon wallet.
      operationId: create-polygon-copytrade
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - target
                - mode
                - settings
              properties:
                target:
                  type: string
                  description: >-
                    Target Polygon address to track. Must be a valid address and
                    cannot equal the wallet address.
                mode:
                  type: string
                  description: '`COPY` or `COUNTER`.'
                settings:
                  type: object
                  required:
                    - filters
                    - buy
                    - sell
                  description: Copytrade settings payload.
                  properties:
                    filters:
                      type: object
                      required:
                        - resolution
                        - price
                        - slippage
                        - labels
                        - exposure
                        - amount
                      properties:
                        resolution:
                          type: object
                          required:
                            - enabled
                            - within_seconds
                          properties:
                            enabled:
                              type: boolean
                            within_seconds:
                              type: integer
                              description: >-
                                Minimum seconds before market resolution. Must
                                be >= 0 when enabled.
                        price:
                          type: object
                          required:
                            - enabled
                          properties:
                            enabled:
                              type: boolean
                            min:
                              type: number
                              nullable: true
                              description: >-
                                Minimum price filter. Range: 0.001–0.999, up to
                                3 decimal places.
                            max:
                              type: number
                              nullable: true
                              description: >-
                                Maximum price filter. Range: 0.001–0.999, up to
                                3 decimal places.
                        slippage:
                          type: object
                          required:
                            - enabled
                            - max_cents
                          properties:
                            enabled:
                              type: boolean
                            max_cents:
                              type: number
                              description: >-
                                Maximum slippage in cents. Range: >0 to 100, up
                                to 1 decimal place.
                        labels:
                          type: object
                          required:
                            - enabled
                            - allow
                            - deny
                          properties:
                            enabled:
                              type: boolean
                            allow:
                              type: array
                              items:
                                type: string
                              description: >-
                                Allowed labels. Values: `crypto`, `sports`,
                                `united_states_politics`, `geopolitics`,
                                `mentions`, `economics`, `companies`, `tech`,
                                `culture`, `science`.
                            deny:
                              type: array
                              items:
                                type: string
                              description: Denied labels. Same allowed values as `allow`.
                        exposure:
                          type: object
                          required:
                            - enabled
                          properties:
                            enabled:
                              type: boolean
                            max_market:
                              type: number
                              nullable: true
                              description: >-
                                Maximum exposure per market in USDC. Must be >
                                0, up to 2 decimal places.
                            max_event:
                              type: number
                              nullable: true
                              description: >-
                                Maximum exposure per event in USDC. Must be > 0,
                                up to 2 decimal places.
                        amount:
                          type: object
                          required:
                            - enabled
                          properties:
                            enabled:
                              type: boolean
                            min:
                              type: number
                              nullable: true
                              description: >-
                                Minimum target trade amount in USDC. Must be >
                                0, up to 2 decimal places.
                            max:
                              type: number
                              nullable: true
                              description: >-
                                Maximum target trade amount in USDC. Must be >
                                0, up to 2 decimal places.
                    buy:
                      type: object
                      required:
                        - enabled
                        - insufficient_funds
                        - sizing
                        - total
                      properties:
                        enabled:
                          type: boolean
                        insufficient_funds:
                          type: string
                          enum:
                            - BUY_MAX
                            - SKIP
                          description: >-
                            `BUY_MAX` to buy with available funds, `SKIP` to
                            skip the trade.
                        sizing:
                          type: object
                          required:
                            - type
                          description: Buy sizing strategy. Discriminated by `type`.
                          oneOf:
                            - title: Fixed Amount
                              type: object
                              required:
                                - type
                                - amount
                              properties:
                                type:
                                  type: string
                                  const: FIXED
                                amount:
                                  type: number
                                  description: >-
                                    Fixed USDC amount per trade. Must be >= 1,
                                    up to 2 decimal places.
                            - title: Percentage of Trade
                              type: object
                              required:
                                - type
                                - percent
                              properties:
                                type:
                                  type: string
                                  const: PERCENTAGE
                                percent:
                                  type: number
                                  description: >-
                                    Fraction of the target's trade size to copy.
                                    Range: 0.01–1.0.
                            - title: Percentage of Balance
                              type: object
                              required:
                                - type
                                - percent
                                - source
                              properties:
                                type:
                                  type: string
                                  const: BALANCE
                                percent:
                                  type: number
                                  description: 'Fraction of balance to use. Range: 0.01–1.0.'
                                source:
                                  type: string
                                  enum:
                                    - WALLET
                                    - TOTAL
                                  description: >-
                                    `WALLET` for wallet balance, `TOTAL` for
                                    total allocation (requires `total.type` =
                                    `FIXED`).
                        total:
                          type: object
                          required:
                            - type
                          description: Total buy budget. Discriminated by `type`.
                          oneOf:
                            - title: No Budget Limit
                              type: object
                              required:
                                - type
                              properties:
                                type:
                                  type: string
                                  const: NONE
                            - title: Fixed Budget
                              type: object
                              required:
                                - type
                                - amount
                              properties:
                                type:
                                  type: string
                                  const: FIXED
                                amount:
                                  type: number
                                  description: >-
                                    Total USDC budget. Must be >= 0.01, up to 2
                                    decimal places.
                    sell:
                      type: object
                      required:
                        - enabled
                        - insufficient_shares
                        - sizing
                        - take_profit
                      properties:
                        enabled:
                          type: boolean
                        insufficient_shares:
                          type: string
                          enum:
                            - SELL_MAX
                            - SKIP
                          description: >-
                            `SELL_MAX` to sell available shares, `SKIP` to skip
                            the trade.
                        sizing:
                          type: object
                          required:
                            - type
                          description: Sell sizing strategy. Discriminated by `type`.
                          oneOf:
                            - title: Fixed Shares
                              type: object
                              required:
                                - type
                                - amount
                              properties:
                                type:
                                  type: string
                                  const: FIXED
                                amount:
                                  type: number
                                  description: >-
                                    Fixed number of shares to sell. Must be >=
                                    0.01, up to 2 decimal places.
                            - title: Percentage of Shares
                              type: object
                              required:
                                - type
                                - percent
                              properties:
                                type:
                                  type: string
                                  const: PERCENTAGE
                                percent:
                                  type: number
                                  description: >-
                                    Fraction of held shares to sell. Range:
                                    0.01–1.0.
                        take_profit:
                          type: object
                          required:
                            - enabled
                          properties:
                            enabled:
                              type: boolean
                            percent:
                              type: number
                              nullable: true
                              description: >-
                                Take profit percentage. Range: 1.0–10000.0, up
                                to 2 decimal places. Required when enabled.
      responses:
        '201':
          description: Polygon copytrade created
          content:
            application/json:
              example:
                success: true
                response:
                  copytrade_id: 01234567-89ab-cdef-0123-456789abcdef
                  target: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
                  mode: COPY
                  status: ACTIVE
                  created_at: '2026-01-01T00:00:00'
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Create Copytrade

> Create a Polymarket copytrade configuration for a Polygon wallet.



## OpenAPI

````yaml /openapi.json post /api/v1/wallet/pol/{wallet_id}/copytrade
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/pol/{wallet_id}/copytrade:
    post:
      tags:
        - Polygon Copytrades
      summary: Create Copytrade
      description: Create a Polymarket copytrade configuration for a Polygon wallet.
      operationId: create-polygon-copytrade
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - target
                - mode
                - settings
              properties:
                target:
                  type: string
                  description: >-
                    Target Polygon address to track. Must be a valid address and
                    cannot equal the wallet address.
                mode:
                  type: string
                  description: '`COPY` or `COUNTER`.'
                settings:
                  type: object
                  required:
                    - filters
                    - buy
                    - sell
                  description: Copytrade settings payload.
                  properties:
                    filters:
                      type: object
                      required:
                        - resolution
                        - price
                        - slippage
                        - labels
                        - exposure
                        - amount
                      properties:
                        resolution:
                          type: object
                          required:
                            - enabled
                            - within_seconds
                          properties:
                            enabled:
                              type: boolean
                            within_seconds:
                              type: integer
                              description: >-
                                Minimum seconds before market resolution. Must
                                be >= 0 when enabled.
                        price:
                          type: object
                          required:
                            - enabled
                          properties:
                            enabled:
                              type: boolean
                            min:
                              type: number
                              nullable: true
                              description: >-
                                Minimum price filter. Range: 0.001–0.999, up to
                                3 decimal places.
                            max:
                              type: number
                              nullable: true
                              description: >-
                                Maximum price filter. Range: 0.001–0.999, up to
                                3 decimal places.
                        slippage:
                          type: object
                          required:
                            - enabled
                            - max_cents
                          properties:
                            enabled:
                              type: boolean
                            max_cents:
                              type: number
                              description: >-
                                Maximum slippage in cents. Range: >0 to 100, up
                                to 1 decimal place.
                        labels:
                          type: object
                          required:
                            - enabled
                            - allow
                            - deny
                          properties:
                            enabled:
                              type: boolean
                            allow:
                              type: array
                              items:
                                type: string
                              description: >-
                                Allowed labels. Values: `crypto`, `sports`,
                                `united_states_politics`, `geopolitics`,
                                `mentions`, `economics`, `companies`, `tech`,
                                `culture`, `science`.
                            deny:
                              type: array
                              items:
                                type: string
                              description: Denied labels. Same allowed values as `allow`.
                        exposure:
                          type: object
                          required:
                            - enabled
                          properties:
                            enabled:
                              type: boolean
                            max_market:
                              type: number
                              nullable: true
                              description: >-
                                Maximum exposure per market in USDC. Must be >
                                0, up to 2 decimal places.
                            max_event:
                              type: number
                              nullable: true
                              description: >-
                                Maximum exposure per event in USDC. Must be > 0,
                                up to 2 decimal places.
                        amount:
                          type: object
                          required:
                            - enabled
                          properties:
                            enabled:
                              type: boolean
                            min:
                              type: number
                              nullable: true
                              description: >-
                                Minimum target trade amount in USDC. Must be >
                                0, up to 2 decimal places.
                            max:
                              type: number
                              nullable: true
                              description: >-
                                Maximum target trade amount in USDC. Must be >
                                0, up to 2 decimal places.
                    buy:
                      type: object
                      required:
                        - enabled
                        - insufficient_funds
                        - sizing
                        - total
                      properties:
                        enabled:
                          type: boolean
                        insufficient_funds:
                          type: string
                          enum:
                            - BUY_MAX
                            - SKIP
                          description: >-
                            `BUY_MAX` to buy with available funds, `SKIP` to
                            skip the trade.
                        sizing:
                          type: object
                          required:
                            - type
                          description: Buy sizing strategy. Discriminated by `type`.
                          oneOf:
                            - title: Fixed Amount
                              type: object
                              required:
                                - type
                                - amount
                              properties:
                                type:
                                  type: string
                                  const: FIXED
                                amount:
                                  type: number
                                  description: >-
                                    Fixed USDC amount per trade. Must be >= 1,
                                    up to 2 decimal places.
                            - title: Percentage of Trade
                              type: object
                              required:
                                - type
                                - percent
                              properties:
                                type:
                                  type: string
                                  const: PERCENTAGE
                                percent:
                                  type: number
                                  description: >-
                                    Fraction of the target's trade size to copy.
                                    Range: 0.01–1.0.
                            - title: Percentage of Balance
                              type: object
                              required:
                                - type
                                - percent
                                - source
                              properties:
                                type:
                                  type: string
                                  const: BALANCE
                                percent:
                                  type: number
                                  description: 'Fraction of balance to use. Range: 0.01–1.0.'
                                source:
                                  type: string
                                  enum:
                                    - WALLET
                                    - TOTAL
                                  description: >-
                                    `WALLET` for wallet balance, `TOTAL` for
                                    total allocation (requires `total.type` =
                                    `FIXED`).
                        total:
                          type: object
                          required:
                            - type
                          description: Total buy budget. Discriminated by `type`.
                          oneOf:
                            - title: No Budget Limit
                              type: object
                              required:
                                - type
                              properties:
                                type:
                                  type: string
                                  const: NONE
                            - title: Fixed Budget
                              type: object
                              required:
                                - type
                                - amount
                              properties:
                                type:
                                  type: string
                                  const: FIXED
                                amount:
                                  type: number
                                  description: >-
                                    Total USDC budget. Must be >= 0.01, up to 2
                                    decimal places.
                    sell:
                      type: object
                      required:
                        - enabled
                        - insufficient_shares
                        - sizing
                        - take_profit
                      properties:
                        enabled:
                          type: boolean
                        insufficient_shares:
                          type: string
                          enum:
                            - SELL_MAX
                            - SKIP
                          description: >-
                            `SELL_MAX` to sell available shares, `SKIP` to skip
                            the trade.
                        sizing:
                          type: object
                          required:
                            - type
                          description: Sell sizing strategy. Discriminated by `type`.
                          oneOf:
                            - title: Fixed Shares
                              type: object
                              required:
                                - type
                                - amount
                              properties:
                                type:
                                  type: string
                                  const: FIXED
                                amount:
                                  type: number
                                  description: >-
                                    Fixed number of shares to sell. Must be >=
                                    0.01, up to 2 decimal places.
                            - title: Percentage of Shares
                              type: object
                              required:
                                - type
                                - percent
                              properties:
                                type:
                                  type: string
                                  const: PERCENTAGE
                                percent:
                                  type: number
                                  description: >-
                                    Fraction of held shares to sell. Range:
                                    0.01–1.0.
                        take_profit:
                          type: object
                          required:
                            - enabled
                          properties:
                            enabled:
                              type: boolean
                            percent:
                              type: number
                              nullable: true
                              description: >-
                                Take profit percentage. Range: 1.0–10000.0, up
                                to 2 decimal places. Required when enabled.
      responses:
        '201':
          description: Polygon copytrade created
          content:
            application/json:
              example:
                success: true
                response:
                  copytrade_id: 01234567-89ab-cdef-0123-456789abcdef
                  target: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
                  mode: COPY
                  status: ACTIVE
                  created_at: '2026-01-01T00:00:00'
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Delete Copytrade

> Delete a Polymarket copytrade configuration for a Polygon wallet.



## OpenAPI

````yaml /openapi.json delete /api/v1/wallet/pol/{wallet_id}/copytrade/{copytrade_id}
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/pol/{wallet_id}/copytrade/{copytrade_id}:
    delete:
      tags:
        - Polygon Copytrades
      summary: Delete Copytrade
      description: Delete a Polymarket copytrade configuration for a Polygon wallet.
      operationId: delete-polygon-copytrade
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
        - name: copytrade_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Polygon copytrade deleted
          content:
            application/json:
              example:
                success: true
                response:
                  copytrade_id: ...
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Pause Copytrade

> Pause a Polymarket copytrade configuration for a Polygon wallet.



## OpenAPI

````yaml /openapi.json post /api/v1/wallet/pol/{wallet_id}/copytrade/{copytrade_id}/pause
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/pol/{wallet_id}/copytrade/{copytrade_id}/pause:
    post:
      tags:
        - Polygon Copytrades
      summary: Pause Copytrade
      description: Pause a Polymarket copytrade configuration for a Polygon wallet.
      operationId: pause-polygon-copytrade
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
        - name: copytrade_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Polygon copytrade paused
          content:
            application/json:
              example:
                success: true
                response:
                  copytrade_id: 01234567-89ab-cdef-0123-456789abcdef
                  status: PAUSED
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Unpause Copytrade

> Unpause a Polymarket copytrade configuration for a Polygon wallet.



## OpenAPI

````yaml /openapi.json post /api/v1/wallet/pol/{wallet_id}/copytrade/{copytrade_id}/unpause
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/pol/{wallet_id}/copytrade/{copytrade_id}/unpause:
    post:
      tags:
        - Polygon Copytrades
      summary: Unpause Copytrade
      description: Unpause a Polymarket copytrade configuration for a Polygon wallet.
      operationId: unpause-polygon-copytrade
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
        - name: copytrade_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Polygon copytrade resumed
          content:
            application/json:
              example:
                success: true
                response:
                  copytrade_id: 01234567-89ab-cdef-0123-456789abcdef
                  status: ACTIVE
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Copytrade Orders

> Get orders associated with a Polymarket copytrade.



## OpenAPI

````yaml /openapi.json get /api/v1/wallet/pol/{wallet_id}/copytrade/{copytrade_id}/orders
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/pol/{wallet_id}/copytrade/{copytrade_id}/orders:
    get:
      tags:
        - Polygon Copytrades
      summary: Get Copytrade Orders
      description: Get orders associated with a Polymarket copytrade.
      operationId: get-polygon-copytrade-orders
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
        - name: copytrade_id
          in: path
          required: true
          schema:
            type: string
        - name: limit
          in: query
          required: false
          description: Maximum orders to return. Capped at `1000`.
          schema:
            type: integer
            default: 100
            example: 100
        - name: offset
          in: query
          required: false
          description: Pagination offset.
          schema:
            type: integer
            default: 0
            example: 0
      responses:
        '200':
          description: Polygon copytrade orders
          content:
            application/json:
              example:
                success: true
                response:
                  - order:
                      order_id: >-
                        0xc3d4e5f6a7b8c3d4e5f6a7b8c3d4e5f6a7b8c3d4e5f6a7b8c3d4e5f6a7b8c3d4
                      token_id: >-
                        21742633143463906290569050155826241533067272736897614950488156847949938836455
                      side: BUY
                      type: MARKET
                      amount: '50.000'
                      shares: '78.125'
                      filled: '78.125'
                      price: '0.640'
                      fee: {}
                      units: USDC
                      status: FILLED
                      created_at: '2026-01-01T00:00:00'
                      updated_at: '2026-01-01T00:00:00'
                    event:
                      event_id: 12345
                      title: Will Bitcoin reach $100k by end of 2025?
                      slug: will-bitcoin-reach-100k-by-end-of-2025
                      description: >-
                        This market resolves to Yes if spot Bitcoin trades at or
                        above $100,000 before 2025 ends.
                      image: https://example.com/bitcoin.png
                      tags:
                        - crypto
                        - bitcoin
                      labels:
                        - crypto
                        - macro
                      neg_risk: false
                      active: true
                      liquidity: '1500000'
                      volume: '5000000'
                      volume24hr: '250000'
                      volume1wk: '900000'
                      volume1mo: '2200000'
                      volume1yr: '5000000'
                      live:
                        live: false
                        ended: false
                      created_at: '2026-01-01T00:00:00'
                      updated_at: '2026-01-01T00:00:00'
                      ends_at: '2026-12-31T23:59:59'
                    market:
                      event_id: 12345
                      condition_id: >-
                        0xbd71b43bb47eb60dbcb41fa25df2a0ed4da612873d6e0447a2c730bd4cc25910
                      question: Will Bitcoin reach $100k?
                      outcome: 'Yes'
                      slug: will-bitcoin-reach-100k-yes
                      description: >-
                        Buy Yes if you think Bitcoin will trade at or above
                        $100,000 before market expiry.
                      image: https://example.com/bitcoin-market.png
                      left_outcome: 'Yes'
                      right_outcome: 'No'
                      left_price: '0.65'
                      right_price: '0.35'
                      left_token_id: >-
                        21742633143463906290569050155826241533067272736897614950488156847949938836455
                      right_token_id: >-
                        48572956138472615938471625938471659384716593847165938471659384716593847165938
                      winner_token_id: ''
                      active: true
                      resolved: false
                      fees: true
                      decimals: 6
                      liquidity: '1500000'
                      volume: '5000000'
                      volume24hr: '250000'
                      volume1wk: '900000'
                      volume1mo: '2200000'
                      volume1yr: '5000000'
                      rewards:
                        rewards: false
                      created_at: '2026-01-01T00:00:00'
                      updated_at: '2026-01-01T00:00:00'
                      ends_at: '2026-12-31T23:59:59'
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Wallets

> Get Solana wallets for the authenticated account.



## OpenAPI

````yaml /openapi.json get /api/v1/wallet/sol
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/sol:
    get:
      tags:
        - Solana
      summary: Get Wallets
      description: Get Solana wallets for the authenticated account.
      operationId: get-solana-wallets
      responses:
        '200':
          description: Solana wallets
          content:
            application/json:
              example:
                success: true
                response:
                  - wallet_id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
                    chain_id: SOL
                    name: Wallet 1
                    address: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
                    position: 0
                    autoredeem: true
                    created_at: '2026-01-01T00:00:00'
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get KYC Status

> Get the DFlow KYC verification status for a Solana wallet.



## OpenAPI

````yaml /openapi.json get /api/v1/wallet/sol/{wallet_id}/kyc
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/sol/{wallet_id}/kyc:
    get:
      tags:
        - Solana
      summary: Get KYC Status
      description: Get the DFlow KYC verification status for a Solana wallet.
      operationId: get-solana-kyc
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Solana KYC status
          content:
            application/json:
              example:
                success: true
                response:
                  verified: true
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Create KYC Link

> Create a DFlow KYC verification link for a Solana wallet.



## OpenAPI

````yaml /openapi.json post /api/v1/wallet/sol/{wallet_id}/kyc
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/sol/{wallet_id}/kyc:
    post:
      tags:
        - Solana
      summary: Create KYC Link
      description: Create a DFlow KYC verification link for a Solana wallet.
      operationId: create-solana-kyc
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
        - name: redirect
          in: query
          required: true
          description: Redirect URI after KYC completion.
          schema:
            type: string
      responses:
        '201':
          description: Solana KYC link created
          content:
            application/json:
              example:
                success: true
                response: https://dflow.net/proof?...
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Balance

> Get balances for a Solana wallet.



## OpenAPI

````yaml /openapi.json get /api/v1/wallet/sol/{wallet_id}/balance
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/sol/{wallet_id}/balance:
    get:
      tags:
        - Solana
      summary: Get Balance
      description: Get balances for a Solana wallet.
      operationId: get-solana-balance
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Solana balance
          content:
            application/json:
              example:
                success: true
                response:
                  wallet_id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
                  chain_id: SOL
                  address: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
                  balance:
                    USDC: '250.000'
        '404':
          description: Wallet not found
          content:
            application/json:
              example:
                success: false
                response: Wallet not found
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Orders

> Get Kalshi order history for a Solana wallet.



## OpenAPI

````yaml /openapi.json get /api/v1/wallet/sol/{wallet_id}/orders
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/sol/{wallet_id}/orders:
    get:
      tags:
        - Solana
      summary: Get Orders
      description: Get Kalshi order history for a Solana wallet.
      operationId: get-solana-orders
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
        - name: limit
          in: query
          required: false
          description: Maximum orders to return. Capped at `1000`.
          schema:
            type: integer
            default: 100
            example: 100
        - name: offset
          in: query
          required: false
          description: Pagination offset.
          schema:
            type: integer
            default: 0
            example: 0
      responses:
        '200':
          description: Solana orders
          content:
            application/json:
              example:
                success: true
                response:
                  - venue: kalshi
                    order:
                      order_id: d4e5f6a7-b8c9-0123-def0-123456789abc
                      token_id: BRjpCHtyQLeSRWyE1yTdBQbhLkny5oEnveRijBjRoiA
                      side: BUY
                      type: LIMIT
                      amount: '50.000'
                      shares: '86.206'
                      filled: '86.206'
                      price: '0.58'
                      fee: {}
                      units: USDC
                      status: FILLED
                      created_at: '2026-01-01T00:00:00'
                      updated_at: '2026-01-01T00:00:00'
                    event:
                      series_id: KXBTC
                      event_id: KXBTC-25
                      title: Bitcoin above $100,000 on Dec 31?
                      sub_title: Expires at year end
                      slug: bitcoin-above-100000-on-dec-31
                      image: https://example.com/kalshi-bitcoin.png
                      tags:
                        - crypto
                        - bitcoin
                      labels:
                        - crypto
                        - macro
                      category: Crypto
                      active: true
                      liquidity: '800000'
                      volume: '3000000'
                      live:
                        is_active: true
                      created_at: '2026-01-01T00:00:00'
                      updated_at: '2026-01-01T00:00:00'
                      ends_at: '2026-12-31T23:59:59'
                    market:
                      series_id: KXBTC
                      event_id: KXBTC-25
                      market_id: KXBTC-25-T100000
                      kalshi_id: T100000
                      title: Bitcoin above $100,000?
                      outcome: 'Yes'
                      description: >-
                        Resolves Yes if Bitcoin settles above $100,000 on
                        expiration.
                      image: https://example.com/kalshi-bitcoin-market.png
                      left_outcome: 'Yes'
                      right_outcome: 'No'
                      left_price: '0.58'
                      right_price: '0.42'
                      left_token_id: BRjpCHtyQLeSRWyE1yTdBQbhLkny5oEnveRijBjRoiA
                      right_token_id: F4r2GpoNU8MBMdKqP6MCBzKEHe2Mt8s5qm4GrFcJQnbJ
                      winner_token_id: ''
                      active: true
                      resolved: false
                      claimable: false
                      liquidity: '800000'
                      open_interest: '1200000'
                      volume: '3000000'
                      volume24hr: '175000'
                      dflow:
                        enabled: true
                      created_at: '2026-01-01T00:00:00'
                      updated_at: '2026-01-01T00:00:00'
                      ends_at: '2026-12-31T23:59:59'
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Orders

> Get Kalshi order history for a Solana wallet.



## OpenAPI

````yaml /openapi.json get /api/v1/wallet/sol/{wallet_id}/orders
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/sol/{wallet_id}/orders:
    get:
      tags:
        - Solana
      summary: Get Orders
      description: Get Kalshi order history for a Solana wallet.
      operationId: get-solana-orders
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
        - name: limit
          in: query
          required: false
          description: Maximum orders to return. Capped at `1000`.
          schema:
            type: integer
            default: 100
            example: 100
        - name: offset
          in: query
          required: false
          description: Pagination offset.
          schema:
            type: integer
            default: 0
            example: 0
      responses:
        '200':
          description: Solana orders
          content:
            application/json:
              example:
                success: true
                response:
                  - venue: kalshi
                    order:
                      order_id: d4e5f6a7-b8c9-0123-def0-123456789abc
                      token_id: BRjpCHtyQLeSRWyE1yTdBQbhLkny5oEnveRijBjRoiA
                      side: BUY
                      type: LIMIT
                      amount: '50.000'
                      shares: '86.206'
                      filled: '86.206'
                      price: '0.58'
                      fee: {}
                      units: USDC
                      status: FILLED
                      created_at: '2026-01-01T00:00:00'
                      updated_at: '2026-01-01T00:00:00'
                    event:
                      series_id: KXBTC
                      event_id: KXBTC-25
                      title: Bitcoin above $100,000 on Dec 31?
                      sub_title: Expires at year end
                      slug: bitcoin-above-100000-on-dec-31
                      image: https://example.com/kalshi-bitcoin.png
                      tags:
                        - crypto
                        - bitcoin
                      labels:
                        - crypto
                        - macro
                      category: Crypto
                      active: true
                      liquidity: '800000'
                      volume: '3000000'
                      live:
                        is_active: true
                      created_at: '2026-01-01T00:00:00'
                      updated_at: '2026-01-01T00:00:00'
                      ends_at: '2026-12-31T23:59:59'
                    market:
                      series_id: KXBTC
                      event_id: KXBTC-25
                      market_id: KXBTC-25-T100000
                      kalshi_id: T100000
                      title: Bitcoin above $100,000?
                      outcome: 'Yes'
                      description: >-
                        Resolves Yes if Bitcoin settles above $100,000 on
                        expiration.
                      image: https://example.com/kalshi-bitcoin-market.png
                      left_outcome: 'Yes'
                      right_outcome: 'No'
                      left_price: '0.58'
                      right_price: '0.42'
                      left_token_id: BRjpCHtyQLeSRWyE1yTdBQbhLkny5oEnveRijBjRoiA
                      right_token_id: F4r2GpoNU8MBMdKqP6MCBzKEHe2Mt8s5qm4GrFcJQnbJ
                      winner_token_id: ''
                      active: true
                      resolved: false
                      claimable: false
                      liquidity: '800000'
                      open_interest: '1200000'
                      volume: '3000000'
                      volume24hr: '175000'
                      dflow:
                        enabled: true
                      created_at: '2026-01-01T00:00:00'
                      updated_at: '2026-01-01T00:00:00'
                      ends_at: '2026-12-31T23:59:59'
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Transfers

> Get transfer history for a Solana wallet.



## OpenAPI

````yaml /openapi.json get /api/v1/wallet/sol/{wallet_id}/transfers
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/sol/{wallet_id}/transfers:
    get:
      tags:
        - Solana
      summary: Get Transfers
      description: Get transfer history for a Solana wallet.
      operationId: get-solana-transfers
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
        - name: limit
          in: query
          required: false
          description: Maximum transfers to return. Capped at `1000`.
          schema:
            type: integer
            default: 100
            example: 100
        - name: offset
          in: query
          required: false
          description: Pagination offset.
          schema:
            type: integer
            default: 0
            example: 0
      responses:
        '200':
          description: Solana transfers
          content:
            application/json:
              example:
                success: true
                response:
                  - tx_hash: 5QqJcC8Rj9o3v7x2Yp4mN6bT1rE8uKzA2sD4fG7hJ9kL
                    transfer_type: DEPOSIT
                    asset_type: SPL_TOKEN
                    asset_id: USDC
                    address: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
                    from_address: ...
                    to_address: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
                    amount: '100.000'
                    type: DEPOSIT
                    created_at: '2026-01-01T00:00:00'
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).


> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Transfers

> Get transfer history for a Solana wallet.



## OpenAPI

````yaml /openapi.json get /api/v1/wallet/sol/{wallet_id}/transfers
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/sol/{wallet_id}/transfers:
    get:
      tags:
        - Solana
      summary: Get Transfers
      description: Get transfer history for a Solana wallet.
      operationId: get-solana-transfers
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
        - name: limit
          in: query
          required: false
          description: Maximum transfers to return. Capped at `1000`.
          schema:
            type: integer
            default: 100
            example: 100
        - name: offset
          in: query
          required: false
          description: Pagination offset.
          schema:
            type: integer
            default: 0
            example: 0
      responses:
        '200':
          description: Solana transfers
          content:
            application/json:
              example:
                success: true
                response:
                  - tx_hash: 5QqJcC8Rj9o3v7x2Yp4mN6bT1rE8uKzA2sD4fG7hJ9kL
                    transfer_type: DEPOSIT
                    asset_type: SPL_TOKEN
                    asset_id: USDC
                    address: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
                    from_address: ...
                    to_address: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
                    amount: '100.000'
                    type: DEPOSIT
                    created_at: '2026-01-01T00:00:00'
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Create Order Quote

> Preview a Kalshi order for a Solana wallet.



## OpenAPI

````yaml /openapi.json post /api/v1/wallet/sol/{wallet_id}/order/quote
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/sol/{wallet_id}/order/quote:
    post:
      tags:
        - Solana
      summary: Create Order Quote
      description: Preview a Kalshi order for a Solana wallet.
      operationId: create-solana-order-quote
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - token_id
                - side
                - amount
              properties:
                token_id:
                  type: string
                side:
                  type: string
                  description: '`BUY` or `SELL`.'
                amount:
                  type: string
                  description: Order amount as string or number.
                slippage:
                  type: integer
                  description: >-
                    Optional slippage in basis points. If provided, it must be
                    greater than `0`; otherwise it uses `auto`.
      responses:
        '200':
          description: Solana order quote
          content:
            application/json:
              example:
                success: true
                response:
                  amount: '50.000'
                  shares: '80.000'
                  min_shares: '78.400'
                  average_price: '0.625'
                  price_impact: '0.12'
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Create Order Quote

> Preview a Kalshi order for a Solana wallet.



## OpenAPI

````yaml /openapi.json post /api/v1/wallet/sol/{wallet_id}/order/quote
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/sol/{wallet_id}/order/quote:
    post:
      tags:
        - Solana
      summary: Create Order Quote
      description: Preview a Kalshi order for a Solana wallet.
      operationId: create-solana-order-quote
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - token_id
                - side
                - amount
              properties:
                token_id:
                  type: string
                side:
                  type: string
                  description: '`BUY` or `SELL`.'
                amount:
                  type: string
                  description: Order amount as string or number.
                slippage:
                  type: integer
                  description: >-
                    Optional slippage in basis points. If provided, it must be
                    greater than `0`; otherwise it uses `auto`.
      responses:
        '200':
          description: Solana order quote
          content:
            application/json:
              example:
                success: true
                response:
                  amount: '50.000'
                  shares: '80.000'
                  min_shares: '78.400'
                  average_price: '0.625'
                  price_impact: '0.12'
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Redeem Position

> Redeem a claimable Kalshi winning position from a Solana wallet.



## OpenAPI

````yaml /openapi.json post /api/v1/wallet/sol/{wallet_id}/redeem/{token_id}
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/sol/{wallet_id}/redeem/{token_id}:
    post:
      tags:
        - Solana
      summary: Redeem Position
      description: Redeem a claimable Kalshi winning position from a Solana wallet.
      operationId: create-solana-redemption
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
        - name: token_id
          in: path
          required: true
          description: Winning Kalshi token ID.
          schema:
            type: string
      responses:
        '201':
          description: Solana redemption created
          content:
            application/json:
              example:
                success: true
                response:
                  tx_hash: ...
                  status: FILLED
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Redeem Position

> Redeem a claimable Kalshi winning position from a Solana wallet.



## OpenAPI

````yaml /openapi.json post /api/v1/wallet/sol/{wallet_id}/redeem/{token_id}
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/wallet/sol/{wallet_id}/redeem/{token_id}:
    post:
      tags:
        - Solana
      summary: Redeem Position
      description: Redeem a claimable Kalshi winning position from a Solana wallet.
      operationId: create-solana-redemption
      parameters:
        - name: wallet_id
          in: path
          required: true
          schema:
            type: string
        - name: token_id
          in: path
          required: true
          description: Winning Kalshi token ID.
          schema:
            type: string
      responses:
        '201':
          description: Solana redemption created
          content:
            application/json:
              example:
                success: true
                response:
                  tx_hash: ...
                  status: FILLED
      security:
        - AccountApiKey: []
        - AccountSession: []
components:
  securitySchemes:
    AccountApiKey:
      type: apiKey
      in: header
      name: X-API-KEY
      description: Account secret API key.
    AccountSession:
      type: http
      scheme: bearer
      description: Account session token.

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get News

> Get recent news with matched prediction market context.



## OpenAPI

````yaml /openapi.json get /api/v1/news
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/news:
    get:
      tags:
        - News
      summary: Get News
      description: Get recent news with matched prediction market context.
      operationId: get-news
      parameters:
        - name: limit
          in: query
          required: false
          description: Maximum articles to return.
          schema:
            type: integer
            default: 10
            example: 10
        - name: offset
          in: query
          required: false
          description: Pagination offset.
          schema:
            type: integer
            default: 0
            example: 0
      responses:
        '200':
          description: News feed
          content:
            application/json:
              example:
                success: true
                response:
                  - news:
                      news_id: c3d4e5f6-a7b8-9012-cdef-0123456789ab
                      title: Federal Reserve announces rate decision
                      source: Reuters
                      description: >-
                        Officials held rates steady while signaling ongoing
                        inflation monitoring.
                      url: https://example.com/news/fed-rate-decision
                      matches:
                        - venue: polymarket
                          event_id: '12345'
                          score: 0.92
                      published_at: '2026-01-01T00:00:00'
                      created_at: '2026-01-01T00:00:00'
                    events:
                      - venue: polymarket
                        score: 0.92
                        event:
                          event_id: 12345
                          title: Will the Fed cut rates by June?
                          slug: will-the-fed-cut-rates-by-june
                          description: >-
                            This market resolves to Yes if the Federal Reserve
                            cuts rates before July 2026.
                          image: https://example.com/fed-rates.png
                          tags:
                            - economics
                            - fed
                          labels:
                            - macro
                            - rates
                          neg_risk: false
                          active: true
                          liquidity: '2000000'
                          volume: '8000000'
                          volume24hr: '400000'
                          volume1wk: '1500000'
                          volume1mo: '3500000'
                          volume1yr: '8000000'
                          live:
                            live: false
                            ended: false
                          created_at: '2026-01-01T00:00:00'
                          updated_at: '2026-01-01T00:00:00'
                          ends_at: '2026-06-30T23:59:59'
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Event News

> Get news for a specific event ID.



## OpenAPI

````yaml /openapi.json get /api/v1/news/event/{event_id}
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/news/event/{event_id}:
    get:
      tags:
        - News
      summary: Get Event News
      description: Get news for a specific event ID.
      operationId: get-event-news
      parameters:
        - name: event_id
          in: path
          required: true
          schema:
            type: string
        - name: limit
          in: query
          required: false
          description: Maximum articles to return.
          schema:
            type: integer
            default: 10
            example: 10
        - name: offset
          in: query
          required: false
          description: Pagination offset.
          schema:
            type: integer
            default: 0
            example: 0
      responses:
        '200':
          description: Event news
          content:
            application/json:
              example:
                success: true
                response:
                  - news_id: c3d4e5f6-a7b8-9012-cdef-0123456789ab
                    title: Federal Reserve announces rate decision
                    source: Reuters
                    description: >-
                      Officials held rates steady while signaling ongoing
                      inflation monitoring.
                    url: https://example.com/news/fed-rate-decision
                    matches:
                      - event_id: '12345'
                        venue: polymarket
                        score: 0.92
                    published_at: '2026-01-01T00:00:00'
                    created_at: '2026-01-01T00:00:00'
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Event News

> Get news for a specific event ID.



## OpenAPI

````yaml /openapi.json get /api/v1/news/event/{event_id}
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/news/event/{event_id}:
    get:
      tags:
        - News
      summary: Get Event News
      description: Get news for a specific event ID.
      operationId: get-event-news
      parameters:
        - name: event_id
          in: path
          required: true
          schema:
            type: string
        - name: limit
          in: query
          required: false
          description: Maximum articles to return.
          schema:
            type: integer
            default: 10
            example: 10
        - name: offset
          in: query
          required: false
          description: Pagination offset.
          schema:
            type: integer
            default: 0
            example: 0
      responses:
        '200':
          description: Event news
          content:
            application/json:
              example:
                success: true
                response:
                  - news_id: c3d4e5f6-a7b8-9012-cdef-0123456789ab
                    title: Federal Reserve announces rate decision
                    source: Reuters
                    description: >-
                      Officials held rates steady while signaling ongoing
                      inflation monitoring.
                    url: https://example.com/news/fed-rate-decision
                    matches:
                      - event_id: '12345'
                        venue: polymarket
                        score: 0.92
                    published_at: '2026-01-01T00:00:00'
                    created_at: '2026-01-01T00:00:00'
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Orderbook WebSocket

> Connect to `wss://synthesis.trade/api/v1/orderbook/ws` and send JSON messages over the socket.

Subscription behavior:
- If you send `markets`, an initial snapshot is returned and then live deltas are streamed.
- If you send `venue` without `markets`, the socket subscribes to that venue.
- If you send only `{ "type": "subscribe" }`, the socket subscribes to all venues.



## OpenAPI

````yaml /openapi.json get /api/v1/orderbook/ws
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/orderbook/ws:
    get:
      tags:
        - WebSockets
      summary: Orderbook WebSocket
      description: >-
        Connect to `wss://synthesis.trade/api/v1/orderbook/ws` and send JSON
        messages over the socket.


        Subscription behavior:

        - If you send `markets`, an initial snapshot is returned and then live
        deltas are streamed.

        - If you send `venue` without `markets`, the socket subscribes to that
        venue.

        - If you send only `{ "type": "subscribe" }`, the socket subscribes to
        all venues.
      operationId: orderbook-ws
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - type
              properties:
                type:
                  type: string
                  description: >-
                    WebSocket message type. Supported values: `subscribe` or
                    `unsubscribe`.
                venue:
                  type: string
                  description: >-
                    Optional venue filter when subscribing without explicit
                    markets. Supported values: `polymarket` or `kalshi`.
                markets:
                  type: array
                  items:
                    type: string
                  description: >-
                    Optional market list. Maximum `5000` items. Accepts both
                    Polymarket token IDs and Kalshi market IDs. Mixed-venue
                    lists are supported in the same subscribe request.
                  example:
                    - '12345'
                    - KXBTC-25-T100000
      responses:
        '101':
          description: WebSocket connection established
          content:
            application/json:
              examples:
                Snapshot:
                  summary: Initial orderbook snapshot returned on subscribe
                  value:
                    success: true
                    response:
                      orderbooks:
                        - venue: polymarket
                          orderbook:
                            condition_id: >-
                              0xbd71b43bb47eb60dbcb41fa25df2a0ed4da612873d6e0447a2c730bd4cc25910
                            token_id: >-
                              21742633143463906290569050155826241533067272736897614950488156847949938836455
                            bids:
                              '0.61': '1000'
                              '0.60': '800'
                            asks:
                              '0.62': '900'
                              '0.63': '600'
                            best_bid: '0.61'
                            best_ask: '0.62'
                            hash: abc123
                            created_at: '2026-01-01T00:00:00'
                        - venue: kalshi
                          orderbook:
                            market_id: KXBTC-25-T100000
                            'yes':
                              bids:
                                '58': '25'
                              asks:
                                '60': '15'
                              best_bid: '58'
                              best_ask: '60'
                            'no':
                              bids:
                                '40': '15'
                              asks:
                                '42': '20'
                              best_bid: '40'
                              best_ask: '42'
                            sequence: 12345
                            created_at: '2026-01-01T00:00:00'
                Polymarket Delta:
                  summary: Live Polymarket orderbook delta streamed after subscribe
                  value:
                    success: true
                    response:
                      venue: polymarket
                      delta:
                        condition_id: >-
                          0xbd71b43bb47eb60dbcb41fa25df2a0ed4da612873d6e0447a2c730bd4cc25910
                        token_id: >-
                          21742633143463906290569050155826241533067272736897614950488156847949938836455
                        amount: '500'
                        price: '0.62'
                        side: BUY
                        best_bid: '0.62'
                        best_ask: '0.63'
                        hash: def456
                        created_at: '2026-01-01T00:00:01'
                Kalshi Delta:
                  summary: Live Kalshi orderbook delta streamed after subscribe
                  value:
                    success: true
                    response:
                      venue: kalshi
                      delta:
                        market_id: KXBTC-25-T100000
                        amount: '25'
                        price: '58'
                        side: 'yes'
                        yes_best_bid: '58'
                        yes_best_ask: '60'
                        no_best_bid: '40'
                        no_best_ask: '42'
                        sequence: 12346
                        created_at: '2026-01-01T00:00:01'
                Unsubscribed:
                  summary: Unsubscribe acknowledgment
                  value:
                    success: true
                    response: Unsubscribed
                Error:
                  summary: Error response
                  value:
                    success: false
                    response: Invalid markets
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Trades WebSocket

> Connect to `wss://synthesis.trade/api/v1/trades/ws` and send JSON messages over the socket.

Subscription behavior:
- Returns historical trades ordered by newest first (up to `limit`, default `100`, max `10000`).
- If `offset` is `0` or omitted, the socket stays subscribed for live updates.
- If `offset` is greater than `0`, only that historical page is returned.

Market rules:
- For Polymarket, `markets` should contain condition IDs.
- For Kalshi, `markets` should contain market IDs.



## OpenAPI

````yaml /openapi.json get /api/v1/trades/ws
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/trades/ws:
    get:
      tags:
        - WebSockets
      summary: Trades WebSocket
      description: >-
        Connect to `wss://synthesis.trade/api/v1/trades/ws` and send JSON
        messages over the socket.


        Subscription behavior:

        - Returns historical trades ordered by newest first (up to `limit`,
        default `100`, max `10000`).

        - If `offset` is `0` or omitted, the socket stays subscribed for live
        updates.

        - If `offset` is greater than `0`, only that historical page is
        returned.


        Market rules:

        - For Polymarket, `markets` should contain condition IDs.

        - For Kalshi, `markets` should contain market IDs.
      operationId: trades-ws
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - type
              properties:
                type:
                  type: string
                  description: >-
                    WebSocket message type. Supported values: `subscribe` or
                    `unsubscribe`.
                venue:
                  type: string
                  description: >-
                    Optional venue filter. Supported values: `polymarket` or
                    `kalshi`. If omitted, the all-venues stream is only
                    supported when `markets` is also omitted.
                markets:
                  type: array
                  items:
                    type: string
                  description: >-
                    Optional list of market IDs. Maximum `1000` items. For
                    Polymarket, use condition IDs. For Kalshi, use market IDs.
                    Mixed-venue lists are supported when you provide the
                    matching IDs for each venue.
                  example:
                    - >-
                      0xbd71b43bb47eb60dbcb41fa25df2a0ed4da612873d6e0447a2c730bd4cc25910
                    - KXBTC-25-T100000
                offset:
                  type: integer
                  description: >-
                    Historical pagination offset. Historical queries return
                    trades up to `limit` per venue/query shape. Live
                    subscription is only attached when `offset` is `0` or
                    omitted.
                  default: 0
                  example: 100
                limit:
                  type: integer
                  description: >-
                    Maximum historical trades to return per query. Capped at
                    `10000`.
                  default: 100
                  example: 1000
      responses:
        '101':
          description: WebSocket connection established
          content:
            application/json:
              examples:
                Historical Trades:
                  summary: Initial historical trades returned on subscribe
                  value:
                    success: true
                    response:
                      trades:
                        - venue: polymarket
                          trade:
                            tx_hash: >-
                              0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2
                            token_id: >-
                              21742633143463906290569050155826241533067272736897614950488156847949938836455
                            address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
                            side: true
                            amount: '97.5'
                            shares: '150.0'
                            price: '0.65'
                            username: trader1
                            image: ''
                            created_at: '2026-01-01T00:00:00'
                          event:
                            event_id: 12345
                            title: Will Bitcoin reach $100k by end of 2025?
                            slug: will-bitcoin-reach-100k-by-end-of-2025
                            description: >-
                              This market resolves to Yes if spot Bitcoin trades
                              at or above $100,000 before 2025 ends.
                            image: https://example.com/bitcoin.png
                            tags:
                              - crypto
                              - bitcoin
                            labels:
                              - crypto
                              - macro
                            neg_risk: false
                            active: true
                            liquidity: '1500000'
                            volume: '5000000'
                            volume24hr: '250000'
                            volume1wk: '900000'
                            volume1mo: '2200000'
                            volume1yr: '5000000'
                            live:
                              live: false
                              ended: false
                            created_at: '2026-01-01T00:00:00'
                            updated_at: '2026-01-01T00:00:00'
                            ends_at: '2026-12-31T23:59:59'
                          market:
                            event_id: 12345
                            condition_id: >-
                              0xbd71b43bb47eb60dbcb41fa25df2a0ed4da612873d6e0447a2c730bd4cc25910
                            question_id: '0xabcd'
                            question: Will Bitcoin reach $100k?
                            outcome: 'Yes'
                            slug: will-bitcoin-reach-100k-yes
                            description: >-
                              Buy Yes if you think Bitcoin will trade at or
                              above $100,000 before market expiry.
                            image: https://example.com/bitcoin-market.png
                            left_outcome: 'Yes'
                            right_outcome: 'No'
                            left_price: '0.65'
                            right_price: '0.35'
                            left_token_id: >-
                              21742633143463906290569050155826241533067272736897614950488156847949938836455
                            right_token_id: >-
                              48572956138472615938471625938471659384716593847165938471659384716593847165938
                            winner_token_id: ''
                            active: true
                            resolved: false
                            fees: true
                            decimals: 6
                            liquidity: '1500000'
                            volume: '5000000'
                            volume24hr: '250000'
                            volume1wk: '900000'
                            volume1mo: '2200000'
                            volume1yr: '5000000'
                            rewards:
                              rewards: false
                            created_at: '2026-01-01T00:00:00'
                            updated_at: '2026-01-01T00:00:00'
                            ends_at: '2026-12-31T23:59:59'
                        - venue: kalshi
                          trade:
                            trade_id: t_abc123
                            market_id: KXBTC-25-T100000
                            outcome: 'yes'
                            side: true
                            amount: '50.0'
                            shares: '100.0'
                            price: '0.50'
                            created_at: '2026-01-01T00:00:00'
                          event:
                            event_id: KXBTC-25
                            series_id: KXBTC
                            title: Bitcoin above $100k?
                            category: Crypto
                            status: active
                            yes_price: '0.65'
                            no_price: '0.35'
                            volume: '500000'
                            volume24hr: '25000'
                            open_interest: '150000'
                            created_at: '2026-01-01T00:00:00'
                            ends_at: '2026-12-31T23:59:59'
                          market:
                            market_id: KXBTC-25-T100000
                            event_id: KXBTC-25
                            series_id: KXBTC
                            title: Bitcoin above $100k?
                            category: Crypto
                            status: active
                            yes_price: '0.65'
                            no_price: '0.35'
                            volume: '500000'
                            volume24hr: '25000'
                            open_interest: '150000'
                            created_at: '2026-01-01T00:00:00'
                            ends_at: '2026-12-31T23:59:59'
                Polymarket Trade:
                  summary: Live Polymarket trade streamed after subscribe
                  value:
                    success: true
                    response:
                      venue: polymarket
                      trade:
                        tx_hash: >-
                          0xc3d4e5f6a7b8c3d4e5f6a7b8c3d4e5f6a7b8c3d4e5f6a7b8c3d4e5f6a7b8c3d4
                        token_id: >-
                          21742633143463906290569050155826241533067272736897614950488156847949938836455
                        address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
                        side: true
                        amount: '97.5'
                        shares: '150.0'
                        price: '0.65'
                        username: trader1
                        image: ''
                        created_at: '2026-01-01T00:00:01'
                      event:
                        event_id: 12345
                        title: Will Bitcoin reach $100k by end of 2025?
                        slug: will-bitcoin-reach-100k-by-end-of-2025
                        description: >-
                          This market resolves to Yes if spot Bitcoin trades at
                          or above $100,000 before 2025 ends.
                        image: https://example.com/bitcoin.png
                        tags:
                          - crypto
                          - bitcoin
                        labels:
                          - crypto
                          - macro
                        neg_risk: false
                        active: true
                        liquidity: '1500000'
                        volume: '5000000'
                        volume24hr: '250000'
                        volume1wk: '900000'
                        volume1mo: '2200000'
                        volume1yr: '5000000'
                        live:
                          live: false
                          ended: false
                        created_at: '2026-01-01T00:00:00'
                        updated_at: '2026-01-01T00:00:00'
                        ends_at: '2026-12-31T23:59:59'
                      market:
                        event_id: 12345
                        condition_id: >-
                          0xbd71b43bb47eb60dbcb41fa25df2a0ed4da612873d6e0447a2c730bd4cc25910
                        question_id: '0xabcd'
                        question: Will Bitcoin reach $100k?
                        outcome: 'Yes'
                        slug: will-bitcoin-reach-100k-yes
                        description: >-
                          Buy Yes if you think Bitcoin will trade at or above
                          $100,000 before market expiry.
                        image: https://example.com/bitcoin-market.png
                        left_outcome: 'Yes'
                        right_outcome: 'No'
                        left_price: '0.65'
                        right_price: '0.35'
                        left_token_id: >-
                          21742633143463906290569050155826241533067272736897614950488156847949938836455
                        right_token_id: >-
                          48572956138472615938471625938471659384716593847165938471659384716593847165938
                        winner_token_id: ''
                        active: true
                        resolved: false
                        fees: true
                        decimals: 6
                        liquidity: '1500000'
                        volume: '5000000'
                        volume24hr: '250000'
                        volume1wk: '900000'
                        volume1mo: '2200000'
                        volume1yr: '5000000'
                        rewards:
                          rewards: false
                        created_at: '2026-01-01T00:00:00'
                        updated_at: '2026-01-01T00:00:00'
                        ends_at: '2026-12-31T23:59:59'
                Kalshi Trade:
                  summary: Live Kalshi trade streamed after subscribe
                  value:
                    success: true
                    response:
                      venue: kalshi
                      trade:
                        trade_id: t_def456
                        market_id: KXBTC-25-T100000
                        outcome: 'yes'
                        side: true
                        amount: '50.0'
                        shares: '100.0'
                        price: '0.50'
                        created_at: '2026-01-01T00:00:01'
                      event:
                        event_id: KXBTC-25
                        series_id: KXBTC
                        title: Bitcoin above $100k?
                        category: Crypto
                        status: active
                        yes_price: '0.65'
                        no_price: '0.35'
                        volume: '500000'
                        volume24hr: '25000'
                        open_interest: '150000'
                        created_at: '2026-01-01T00:00:00'
                        ends_at: '2026-12-31T23:59:59'
                      market:
                        market_id: KXBTC-25-T100000
                        event_id: KXBTC-25
                        series_id: KXBTC
                        title: Bitcoin above $100k?
                        category: Crypto
                        status: active
                        yes_price: '0.65'
                        no_price: '0.35'
                        volume: '500000'
                        volume24hr: '25000'
                        open_interest: '150000'
                        created_at: '2026-01-01T00:00:00'
                        ends_at: '2026-12-31T23:59:59'
                Unsubscribed:
                  summary: Unsubscribe acknowledgment
                  value:
                    success: true
                    response: Unsubscribed
                Error:
                  summary: Error response
                  value:
                    success: false
                    response: Invalid markets
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Balance WebSocket

> Connect to `wss://synthesis.trade/api/v1/balance/ws` and send JSON messages over the socket.

Subscription behavior:
- You must send a `wallets` array when subscribing.
- On subscribe, current balances are returned and then live balance and order updates are streamed.
- Polygon and Solana addresses can be mixed in the same subscribe request.

Possible order statuses: `OPEN`, `MATCHED`, `FILLED`, `PARTIAL`, `TRIGGERED`, `CANCELED`, `FAILED`. `MATCHED` indicates the order has been submitted on-chain but fill confirmation has not yet arrived.



## OpenAPI

````yaml /openapi.json get /api/v1/balance/ws
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/balance/ws:
    get:
      tags:
        - WebSockets
      summary: Balance WebSocket
      description: >-
        Connect to `wss://synthesis.trade/api/v1/balance/ws` and send JSON
        messages over the socket.


        Subscription behavior:

        - You must send a `wallets` array when subscribing.

        - On subscribe, current balances are returned and then live balance and
        order updates are streamed.

        - Polygon and Solana addresses can be mixed in the same subscribe
        request.


        Possible order statuses: `OPEN`, `MATCHED`, `FILLED`, `PARTIAL`,
        `TRIGGERED`, `CANCELED`, `FAILED`. `MATCHED` indicates the order has
        been submitted on-chain but fill confirmation has not yet arrived.
      operationId: balance-ws
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - type
                - wallets
              properties:
                type:
                  type: string
                  description: >-
                    WebSocket message type. Supported values: `subscribe` or
                    `unsubscribe`.
                wallets:
                  type: array
                  items:
                    type: object
                    properties:
                      address:
                        type: string
                        description: >-
                          Wallet address. Polygon and Solana addresses are both
                          supported, and mixed-chain subscription lists are
                          supported.
                      assets:
                        type: array
                        items:
                          type: string
                        description: >-
                          Optional asset filter for that wallet. If omitted, all
                          known assets for the wallet are returned.
                  description: >-
                    Wallet subscription list. Maximum `500` wallet entries
                    total, and no more than `500` total requested assets across
                    all entries.
                  example:
                    - address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
                      assets:
                        - USDC
                        - '12345'
                    - address: 7xKXtg2CWz9P8VxP1Wm2G7x5Q8Y9LwYH6a7b8c9d1e2F
      responses:
        '101':
          description: WebSocket connection established
          content:
            application/json:
              examples:
                Initial Balances:
                  summary: Wallet balances snapshot returned on subscribe
                  value:
                    success: true
                    response:
                      wallets:
                        - chain_id: POL
                          address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
                          balances:
                            USDC: '1234.567'
                            '21742633143463906290569050155826241533067272736897614950488156847949938836455': '150.000'
                        - chain_id: SOL
                          address: 7xKXtg2CWz9P8VxP1Wm2G7x5Q8Y9LwYH6a7b8c9d1e2F
                          balances:
                            USDC: '500.000'
                Balance Update:
                  summary: Live balance change streamed after subscribe
                  value:
                    success: true
                    response:
                      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
                      asset: USDC
                      balance: '1200.000'
                Order Update:
                  summary: Live order status change streamed after subscribe
                  value:
                    success: true
                    response:
                      order_id: >-
                        0xc3d4e5f6a7b8c3d4e5f6a7b8c3d4e5f6a7b8c3d4e5f6a7b8c3d4e5f6a7b8c3d4
                      token_id: >-
                        21742633143463906290569050155826241533067272736897614950488156847949938836455
                      side: BUY
                      type: LIMIT
                      amount: '100.000'
                      shares: '152.300'
                      filled: '152.300'
                      price: '0.657'
                      status: FILLED
                Unsubscribed:
                  summary: Unsubscribe acknowledgment
                  value:
                    success: true
                    response: Unsubscribed
                Error:
                  summary: Error response
                  value:
                    success: false
                    response: Invalid wallets
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# UMA WebSocket

> Connect to `wss://synthesis.trade/api/v1/uma/ws` and send JSON messages over the socket.

Subscription behavior:
- On subscribe, current UMA requests matching the optional `statuses` filter are returned as a snapshot, along with participant stats and a leaderboard.
- After the snapshot, live UMA updates are streamed as full objects with event and market data.
- If `statuses` is provided, only updates matching those statuses are delivered.



## OpenAPI

````yaml /openapi.json get /api/v1/uma/ws
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/uma/ws:
    get:
      tags:
        - WebSockets
      summary: UMA WebSocket
      description: >-
        Connect to `wss://synthesis.trade/api/v1/uma/ws` and send JSON messages
        over the socket.


        Subscription behavior:

        - On subscribe, current UMA requests matching the optional `statuses`
        filter are returned as a snapshot, along with participant stats and a
        leaderboard.

        - After the snapshot, live UMA updates are streamed as full objects with
        event and market data.

        - If `statuses` is provided, only updates matching those statuses are
        delivered.
      operationId: uma-ws
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - type
              properties:
                type:
                  type: string
                  description: >-
                    WebSocket message type. Supported values: `subscribe` or
                    `unsubscribe`.
                statuses:
                  type: array
                  items:
                    type: string
                  description: >-
                    Optional status filter. Only UMA requests matching these
                    statuses are returned. Supported values: `INITIALIZED`,
                    `PROPOSED`, `DISPUTED`, `RESET`, `SETTLED`,
                    `EMERGENCY_RESOLVED`, `MANUALLY_RESOLVED`, `CLARIFICATION`.
                  example:
                    - PROPOSED
                    - DISPUTED
                limit:
                  type: integer
                  description: Maximum initial requests to return. Capped at `250`.
                  default: 100
                  example: 100
                offset:
                  type: integer
                  description: Pagination offset for initial requests.
                  default: 0
                  example: 0
      responses:
        '101':
          description: WebSocket connection established
          content:
            application/json:
              examples:
                Initial Requests:
                  summary: >-
                    UMA requests snapshot returned on subscribe with
                    participants and leaderboard
                  value:
                    success: true
                    response:
                      uma:
                        - uma:
                            id: >-
                              0x73756ed441d3c9bb5ce9fff8202cdc9edafd0d4c88323d2c5c7ed7a7b321dac8
                            question_id: >-
                              0x73756ed441d3c9bb5ce9fff8202cdc9edafd0d4c88323d2c5c7ed7a7b321dac8
                            adapter: '0x65070be91477460d8a7aeeb94ef92fe056c2f2a7'
                            requestor: '0x91430cad2d3975766499717fa0d66a78d814e5c5'
                            creator: '0x91430cad2d3975766499717fa0d66a78d814e5c5'
                            proposer: '0x176a56a10b952c4ab1acb234384e97c5574bbdf9'
                            disputer: null
                            paused: false
                            resolved: false
                            settled: false
                            result: []
                            proposed_price: '1000000000000000000'
                            settlement_price: null
                            settlement_payout: null
                            proposal_bond: '500000000'
                            currency: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'
                            reward: '2000000'
                            final_fee: '250000000'
                            neg_risk: null
                            activity:
                              - id: >-
                                  0x73756ed441d3c9bb5ce9fff8202cdc9edafd0d4c88323d2c5c7ed7a7b321dac8-79379792-2
                                admin: '0x0d1b6d489bd3f09e2c29383e33663600c1f1ca0a'
                                content: null
                                status: PROPOSED
                                created_at: '2025-11-23 02:23:37'
                              - id: >-
                                  0x73756ed441d3c9bb5ce9fff8202cdc9edafd0d4c88323d2c5c7ed7a7b321dac8-79374007-6
                                admin: '0x91430cad2d3975766499717fa0d66a78d814e5c5'
                                content: null
                                status: INITIALIZED
                                created_at: '2025-11-22 23:10:47'
                            cycles: []
                            clarifications: []
                            ancillary:
                              title: 'Spread: Hawks (-10.5)'
                              description: >-
                                In the upcoming NBA game, scheduled for November
                                22 at 7:00 PM ET:


                                This market will resolve to "Hawks" if the Hawks
                                win the game by 11 or more points.


                                Otherwise, this market will resolve to
                                "Pelicans". If the game ends in a tie, this
                                market will resolve to "Pelicans".


                                If the game is postponed, this market will
                                remain open until the game has been completed.
                                If the game is canceled entirely, with no
                                make-up game, this market will resolve 50-50.
                              market_id: '697578'
                              p1: '0'
                              p2: '1'
                              p3: >-
                                0.5. Where p1 corresponds to Pelicans, p2 to
                                Hawks, p3 to unknown/50-50. Updates made by the
                                question creator via the bulletin board at
                                0x65070BE91477460D8A7AeEb94ef92fe056C2f2A7 as
                                described by
                                https://polygonscan.com/tx/0xa14f01b115c4913624fc3f508f960f4dea252758e73c28f5f07f8e19d7bca066
                                should be considered.
                              initializer: 91430cad2d3975766499717fa0d66a78d814e5c5
                            status: PROPOSED
                            created_at: '2025-11-22 23:10:47'
                            expires_at: '2025-11-23 04:23:37'
                            flagged_at: null
                          event:
                            event_id: 82811
                            title: Hawks vs. Pelicans
                            slug: nba-atl-nop-2025-11-22
                            description: >-
                              In the upcoming NBA game, scheduled for November
                              22 at 7:00PM ET:

                              If the Hawks win, the market will resolve to
                              "Hawks".

                              If the Pelicans win, the market will resolve to
                              "Pelicans".

                              If the game is postponed, this market will remain
                              open until the game has been completed.

                              If the game is canceled entirely, with no make-up
                              game, this market will resolve 50-50.

                              The result will be determined based on the final
                              score including any overtime periods.
                            image: >-
                              https://polymarket-upload.s3.us-east-2.amazonaws.com/super+cool+basketball+in+red+and+blue+wow.png
                            tags:
                              - Sports
                              - NBA
                              - Games
                              - Basketball
                            labels:
                              - sports
                            neg_risk: false
                            active: false
                            liquidity: '660266.55'
                            volume: '1229287.45'
                            volume24hr: '689710.00'
                            volume1wk: '706600.87'
                            volume1mo: '706600.87'
                            volume1yr: '706600.87'
                            live: {}
                            created_at: '2025-11-16T15:00:17.833684'
                            ends_at: '2025-11-23T00:00:00'
                          market:
                            event_id: 82811
                            condition_id: >-
                              0x5142af0b36a78570754c5be525f824de2b69cf8e0651908825964691b615324b
                            question_id: >-
                              0x73756ed441d3c9bb5ce9fff8202cdc9edafd0d4c88323d2c5c7ed7a7b321dac8
                            question: 'Spread: Hawks (-10.5)'
                            outcome: Spread -10.5
                            slug: nba-atl-nop-2025-11-22-spread-away-10pt5
                            description: >-
                              In the upcoming NBA game, scheduled for November
                              22 at 7:00 PM ET:


                              This market will resolve to "Hawks" if the Hawks
                              win the game by 11 or more points.


                              Otherwise, this market will resolve to "Pelicans".
                              If the game ends in a tie, this market will
                              resolve to "Pelicans".


                              If the game is postponed, this market will remain
                              open until the game has been completed. If the
                              game is canceled entirely, with no make-up game,
                              this market will resolve 50-50.
                            image: >-
                              https://polymarket-upload.s3.us-east-2.amazonaws.com/super+cool+basketball+in+red+and+blue+wow.png
                            left_outcome: Hawks
                            right_outcome: Pelicans
                            left_price: '1.000'
                            right_price: '0.001'
                            left_token_id: >-
                              51363000362609959807464657776721974948318088721103617366498706951833989327973
                            right_token_id: >-
                              8700599864234240104662464466440295671498211095001926806984625502128149442187
                            winner_token_id: >-
                              51363000362609959807464657776721974948318088721103617366498706951833989327973
                            active: false
                            resolved: true
                            fees: false
                            decimals: 3
                            liquidity: '36650.62'
                            volume: '41.69'
                            volume24hr: '26.69'
                            volume1wk: '26.69'
                            volume1mo: '26.69'
                            volume1yr: '26.69'
                            rewards:
                              rate: 0
                              size: 0
                              spread: 0
                              holding: false
                              rewards: false
                            created_at: '2025-11-22T23:10:25.417952'
                            updated_at: '2025-12-28T07:48:40.163465'
                            ends_at: '2025-11-23T00:00:00'
                      participants:
                        '0x176a56a10b952c4ab1acb234384e97c5574bbdf9':
                          address: '0x176a56a10b952c4ab1acb234384e97c5574bbdf9'
                          proposals: 45
                          disputes: 2
                          settled_proposals: 40
                          successful_proposals: 38
                          failed_proposals: 2
                          settled_disputes: 2
                          successful_disputes: 1
                          failed_disputes: 1
                          total_bond: 22500
                          total_payout: 23750
                          net_pnl: 1250
                      leaderboard:
                        - address: '0x176a56a10b952c4ab1acb234384e97c5574bbdf9'
                          proposals: 45
                          disputes: 2
                          settled_proposals: 40
                          successful_proposals: 38
                          failed_proposals: 2
                          settled_disputes: 2
                          successful_disputes: 1
                          failed_disputes: 1
                          total_bond: 22500
                          total_payout: 23750
                          net_pnl: 1250
                Live Update:
                  summary: >-
                    Live UMA update streamed after subscribe with full uma,
                    event, and market data
                  value:
                    success: true
                    response:
                      uma:
                        id: >-
                          0x73756ed441d3c9bb5ce9fff8202cdc9edafd0d4c88323d2c5c7ed7a7b321dac8
                        question_id: >-
                          0x73756ed441d3c9bb5ce9fff8202cdc9edafd0d4c88323d2c5c7ed7a7b321dac8
                        adapter: '0x65070be91477460d8a7aeeb94ef92fe056c2f2a7'
                        requestor: '0x91430cad2d3975766499717fa0d66a78d814e5c5'
                        creator: '0x91430cad2d3975766499717fa0d66a78d814e5c5'
                        proposer: '0x176a56a10b952c4ab1acb234384e97c5574bbdf9'
                        disputer: '0x0db5aea9f41ce8398104e9d4694cfb18f146c493'
                        paused: false
                        resolved: false
                        settled: false
                        result: []
                        proposed_price: '1000000000000000000'
                        settlement_price: null
                        settlement_payout: null
                        proposal_bond: '500000000'
                        currency: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'
                        reward: '2000000'
                        final_fee: '250000000'
                        neg_risk: null
                        activity:
                          - id: >-
                              0x73756ed441d3c9bb5ce9fff8202cdc9edafd0d4c88323d2c5c7ed7a7b321dac8-79381000-5
                            admin: '0x0db5aea9f41ce8398104e9d4694cfb18f146c493'
                            content: null
                            status: DISPUTED
                            created_at: '2025-11-23 03:00:00'
                          - id: >-
                              0x73756ed441d3c9bb5ce9fff8202cdc9edafd0d4c88323d2c5c7ed7a7b321dac8-79379792-2
                            admin: '0x0d1b6d489bd3f09e2c29383e33663600c1f1ca0a'
                            content: null
                            status: PROPOSED
                            created_at: '2025-11-23 02:23:37'
                          - id: >-
                              0x73756ed441d3c9bb5ce9fff8202cdc9edafd0d4c88323d2c5c7ed7a7b321dac8-79374007-6
                            admin: '0x91430cad2d3975766499717fa0d66a78d814e5c5'
                            content: null
                            status: INITIALIZED
                            created_at: '2025-11-22 23:10:47'
                        cycles: []
                        clarifications: []
                        ancillary:
                          title: 'Spread: Hawks (-10.5)'
                          description: >-
                            In the upcoming NBA game, scheduled for November 22
                            at 7:00 PM ET:


                            This market will resolve to "Hawks" if the Hawks win
                            the game by 11 or more points.


                            Otherwise, this market will resolve to "Pelicans".
                            If the game ends in a tie, this market will resolve
                            to "Pelicans".


                            If the game is postponed, this market will remain
                            open until the game has been completed. If the game
                            is canceled entirely, with no make-up game, this
                            market will resolve 50-50.
                          market_id: '697578'
                          p1: '0'
                          p2: '1'
                          p3: >-
                            0.5. Where p1 corresponds to Pelicans, p2 to Hawks,
                            p3 to unknown/50-50. Updates made by the question
                            creator via the bulletin board at
                            0x65070BE91477460D8A7AeEb94ef92fe056C2f2A7 as
                            described by
                            https://polygonscan.com/tx/0xa14f01b115c4913624fc3f508f960f4dea252758e73c28f5f07f8e19d7bca066
                            should be considered.
                          initializer: 91430cad2d3975766499717fa0d66a78d814e5c5
                        status: DISPUTED
                        created_at: '2025-11-22 23:10:47'
                        expires_at: '2025-11-23 04:23:37'
                        flagged_at: null
                      event:
                        event_id: 82811
                        title: Hawks vs. Pelicans
                        slug: nba-atl-nop-2025-11-22
                        description: >-
                          In the upcoming NBA game, scheduled for November 22 at
                          7:00PM ET:

                          If the Hawks win, the market will resolve to "Hawks".

                          If the Pelicans win, the market will resolve to
                          "Pelicans".

                          If the game is postponed, this market will remain open
                          until the game has been completed.

                          If the game is canceled entirely, with no make-up
                          game, this market will resolve 50-50.

                          The result will be determined based on the final score
                          including any overtime periods.
                        image: >-
                          https://polymarket-upload.s3.us-east-2.amazonaws.com/super+cool+basketball+in+red+and+blue+wow.png
                        tags:
                          - Sports
                          - NBA
                          - Games
                          - Basketball
                        labels:
                          - sports
                        neg_risk: false
                        active: false
                        liquidity: '660266.55'
                        volume: '1229287.45'
                        volume24hr: '689710.00'
                        volume1wk: '706600.87'
                        volume1mo: '706600.87'
                        volume1yr: '706600.87'
                        live: {}
                        created_at: '2025-11-16T15:00:17.833684'
                        ends_at: '2025-11-23T00:00:00'
                      market:
                        event_id: 82811
                        condition_id: >-
                          0x5142af0b36a78570754c5be525f824de2b69cf8e0651908825964691b615324b
                        question_id: >-
                          0x73756ed441d3c9bb5ce9fff8202cdc9edafd0d4c88323d2c5c7ed7a7b321dac8
                        question: 'Spread: Hawks (-10.5)'
                        outcome: Spread -10.5
                        slug: nba-atl-nop-2025-11-22-spread-away-10pt5
                        description: >-
                          In the upcoming NBA game, scheduled for November 22 at
                          7:00 PM ET:


                          This market will resolve to "Hawks" if the Hawks win
                          the game by 11 or more points.


                          Otherwise, this market will resolve to "Pelicans". If
                          the game ends in a tie, this market will resolve to
                          "Pelicans".


                          If the game is postponed, this market will remain open
                          until the game has been completed. If the game is
                          canceled entirely, with no make-up game, this market
                          will resolve 50-50.
                        image: >-
                          https://polymarket-upload.s3.us-east-2.amazonaws.com/super+cool+basketball+in+red+and+blue+wow.png
                        left_outcome: Hawks
                        right_outcome: Pelicans
                        left_price: '1.000'
                        right_price: '0.001'
                        left_token_id: >-
                          51363000362609959807464657776721974948318088721103617366498706951833989327973
                        right_token_id: >-
                          8700599864234240104662464466440295671498211095001926806984625502128149442187
                        winner_token_id: >-
                          51363000362609959807464657776721974948318088721103617366498706951833989327973
                        active: false
                        resolved: true
                        fees: false
                        decimals: 3
                        liquidity: '36650.62'
                        volume: '41.69'
                        volume24hr: '26.69'
                        volume1wk: '26.69'
                        volume1mo: '26.69'
                        volume1yr: '26.69'
                        rewards:
                          rate: 0
                          size: 0
                          spread: 0
                          holding: false
                          rewards: false
                        created_at: '2025-11-22T23:10:25.417952'
                        updated_at: '2025-12-28T07:48:40.163465'
                        ends_at: '2025-11-23T00:00:00'
                Unsubscribed:
                  summary: Unsubscribe acknowledgment
                  value:
                    success: true
                    response: Unsubscribed
                Error:
                  summary: Error response
                  value:
                    success: false
                    response: Invalid status
      security: []

````

Built with [Mintlify](https://mintlify.com).

> ## Documentation Index
> Fetch the complete documentation index at: https://api.synthesis.trade/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Data WebSocket

> Connect to `wss://synthesis.trade/api/v1/data/ws` and send JSON messages over the socket.

Subscription behavior:
- Each subscribe request must include a `data_type` to select the feed.
- An initial snapshot is returned, then live updates are streamed.



## OpenAPI

````yaml /openapi.json get /api/v1/data/ws
openapi: 3.1.0
info:
  title: Synthesis API
  version: 1.0.0
  description: Unified prediction market API for Polymarket and Kalshi.
servers:
  - url: https://synthesis.trade
security: []
tags:
  - name: Projects
    description: Create and manage project accounts, sessions, and account API keys.
  - name: Accounts
    description: >-
      Authenticate and manage account-level sessions, account API keys, and
      public account preferences.
  - name: Markets
    description: Unified market discovery and analytics across Polymarket and Kalshi.
  - name: Polymarket
    description: Polymarket market data, prices, orderbooks, trades, and holders endpoints.
  - name: Kalshi
    description: Kalshi market data, events, history, leaderboard, and profile endpoints.
  - name: Wallets
    description: Wallet management routes. Each wallet supports multiple chains.
  - name: Polygon
    description: >-
      Polygon wallet routes for balances, orders, minting, redemption,
      withdrawals, and swaps.
  - name: Polygon Copytrades
    description: Polymarket copytrade configuration and management for Polygon wallets.
  - name: Solana
    description: >-
      Solana wallet routes used for Kalshi balances, KYC, orders, redemption,
      and withdrawals.
  - name: News
    description: News endpoints with market and event matching.
  - name: WebSockets
    description: >-
      Real-time streaming endpoints for orderbooks, trades, balances, and live
      data feeds.
paths:
  /api/v1/data/ws:
    get:
      tags:
        - WebSockets
      summary: Data WebSocket
      description: >-
        Connect to `wss://synthesis.trade/api/v1/data/ws` and send JSON messages
        over the socket.


        Subscription behavior:

        - Each subscribe request must include a `data_type` to select the feed.

        - An initial snapshot is returned, then live updates are streamed.
      operationId: data-ws
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - type
                - data_type
              properties:
                type:
                  type: string
                  description: >-
                    WebSocket message type. Supported values: `subscribe` or
                    `unsubscribe`.
                data_type:
                  type: string
                  description: >-
                    Feed selector. Supported values: `news`, `prices`,
                    `prices_chainlink`, `kalshi_prices`, `holders`,
                    `holder_counts`, `sports`, `espn_match`, `espn_game_stats`,
                    `signals`, `movers`, `fdv`, `elon_tweets`.
                params:
                  type: object
                  description: >-
                    Feed-specific params.


                    `news`

                    - no `params` fields are read

                    - use top-level `limit` and `offset`


                    `prices`

                    - `asset_id` or `symbol`

                    - optional `interval`

                    - optional `open_price`

                    - optional `ends_at`


                    `prices_chainlink`

                    - `asset_id` or `symbol`

                    - optional `interval`

                    - optional `open_price`

                    - optional `ends_at`


                    `kalshi_prices`

                    - `symbol` only

                    - supported values: `btc`, `eth`, `doge`

                    - optional `interval`

                    - optional `open_price`

                    - optional `ends_at`


                    `holders`

                    - `token_id` for token-holder page mode

                    - or `condition_id` for market-holder mode

                    - optional `limit`

                    - optional `offset`

                    - optional `min_shares`

                    - optional `sort` with supported values `shares`,
                    `avg_price`, `pnl`

                    - optional `order` with supported values `ASC`, `DESC`


                    `holder_counts`

                    - `condition_ids` array

                    - maximum `2000` IDs


                    `sports`

                    - `event_id`


                    `espn_match`

                    - `slug` or `title`


                    `espn_game_stats`

                    - `game_id`

                    - optional `sport`

                    - optional `league`


                    `signals`

                    - no `params` fields are read

                    - use top-level `limit` and `offset`


                    `movers`

                    - optional `venue` with effective values `all`,
                    `polymarket`, `kalshi`

                    - optional `direction` with effective values `all`, `up`,
                    `down`

                    - optional `timeframe` with effective values `1h`, `6h`,
                    `24h` or `1d`, `1w` or `7d`

                    - optional `min_volume`

                    - optional `min_delta`

                    - optional `limit`


                    `fdv`

                    - optional `all` boolean

                    - optional `tokens` boolean

                    - optional `token_id`

                    - optional `symbol`

                    - optional `query`

                    - if no `token_id`, `symbol`, or `query` is supplied, the
                    tokens list is returned

                    - if a token is resolved, token, chart, and trades payloads
                    are also returned for that token


                    `elon_tweets`

                    - `event_id`
                limit:
                  type: integer
                  description: |-
                    Top-level limit used by feeds that read it directly.

                    Currently read by:
                    - `news`
                    - `holders`
                    - `signals`
                offset:
                  type: integer
                  description: |-
                    Top-level offset used by feeds that read it directly.

                    Currently read by:
                    - `news`
                    - `holders`
                    - `signals`
      responses:
        '101':
          description: WebSocket connection established
          content:
            application/json:
              examples:
                News Initial:
                  summary: Initial news articles returned on news subscribe
                  value:
                    success: true
                    response:
                      data_type: news
                      news:
                        - news_id: c4d5e6f7-a8b9-0123-cdef-1234567890ab
                          title: Bitcoin surges after ETF inflows accelerate
                          description: ETF demand pushed spot BTC higher.
                          url: https://example.com/news/bitcoin-etf
                          source: Bloomberg
                          matches:
                            - market_id: KXBTC-25-T100000
                              venue: kalshi
                              score: 0.88
                              event:
                                series_id: KXBTC
                                event_id: KXBTC-25
                                title: Bitcoin $100k
                                slug: bitcoin-100k
                                image: ''
                                category: Crypto
                                status: active
                                active: true
                                yes_price: '0.65'
                                no_price: '0.35'
                                volume: '500000'
                                volume24hr: '25000'
                                created_at: '2026-01-01T00:00:00'
                                ends_at: '2026-12-31T23:59:59'
                          created_at: '2026-01-01T09:31:00'
                          published_at: '2026-01-01T09:30:00'
                News Update:
                  summary: Live news article streamed after subscribe
                  value:
                    success: true
                    response:
                      news:
                        news_id: d5e6f7a8-b9c0-1234-def0-234567890abc
                        title: Fed holds rates steady
                        source: Reuters
                        description: The Federal Reserve kept rates unchanged.
                        url: https://example.com/news/fed-rates
                        matches:
                          - market_id: '0xabc123'
                            venue: polymarket
                            score: 0.92
                        published_at: '2026-01-01T10:00:00'
                      events:
                        - venue: polymarket
                          score: 0.92
                          event:
                            event_id: 12345
                            title: Will the Fed cut rates?
                            slug: will-the-fed-cut-rates
                            description: >-
                              This market resolves to Yes if the Federal Reserve
                              announces a rate cut.
                            image: https://example.com/fed.png
                            tags:
                              - economics
                              - fed
                            labels:
                              - economics
                              - macro
                            neg_risk: false
                            active: true
                            liquidity: '2000000'
                            volume: '8000000'
                            volume24hr: '400000'
                            volume1wk: '1200000'
                            volume1mo: '3500000'
                            volume1yr: '8000000'
                            live:
                              live: false
                              ended: false
                            created_at: '2026-01-01T00:00:00'
                            updated_at: '2026-01-01T00:00:00'
                            ends_at: '2026-12-31T23:59:59'
                Prices Initial:
                  summary: Initial price history returned on prices subscribe
                  value:
                    success: true
                    response:
                      type: initial
                      data_type: prices
                      asset_id: btcusdt
                      interval: 15M
                      open_price: 97500
                      data:
                        prices:
                          - 97000
                          - 97250.5
                          - 97500
                        timestamps:
                          - 1735689600000
                          - 1735690500000
                          - 1735691400000
                        current_price: 97500
                        price_history_len: 3
                        volatility: 0.012
                        fair_value:
                          'yes': 0.62
                          'no': 0.38
                          time_remaining: 0.75
                Prices Update:
                  summary: Live price tick streamed after prices subscribe
                  value:
                    success: true
                    response:
                      type: update
                      data_type: prices
                      symbol: btcusdt
                      data:
                        price: 97550
                        timestamp: 1735691500000
                        volatility: 0.012
                        fair_value:
                          'yes': 0.63
                          'no': 0.37
                          time_remaining: 0.74
                Prices Chainlink Initial:
                  summary: Initial Chainlink price history
                  value:
                    success: true
                    response:
                      type: initial
                      data_type: prices_chainlink
                      asset_id: btc/usd
                      interval: 15M
                      open_price: 97500
                      data:
                        prices:
                          - 97000
                          - 97250.5
                          - 97500
                        timestamps:
                          - 1735689600000
                          - 1735690500000
                          - 1735691400000
                        current_price: 97500
                        price_history_len: 3
                        volatility: 0.012
                        fair_value:
                          'yes': 0.62
                          'no': 0.38
                          time_remaining: 0.75
                Kalshi Prices Initial:
                  summary: Initial Kalshi price history
                  value:
                    success: true
                    response:
                      type: initial
                      data_type: kalshi_prices
                      symbol: btc
                      interval: 15M
                      open_price: 97500
                      data:
                        prices:
                          - 97000
                          - 97250.5
                          - 97500
                        timestamps:
                          - 1735689600000
                          - 1735690500000
                          - 1735691400000
                        current_price: 97500
                        price_history_len: 3
                        volatility: 0.012
                        fair_value:
                          'yes': 0.62
                          'no': 0.38
                          time_remaining: 0.75
                Holders (Token) Initial:
                  summary: Holders page for a single token_id
                  value:
                    success: true
                    response:
                      type: holders_page
                      data_type: holders
                      token_id: >-
                        21742633143463906290569050155826241533067272736897614950488156847949938836455
                      holders:
                        - address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
                          shares: '1500.000000'
                          avg_price: '0.450000'
                          pnl: '225.000000'
                          realized_pnl: '50.000000'
                      holder_count: 1842
                      stats:
                        total_pnl: '125000.000000'
                        weighted_pnl: '68.250000'
                        average_pnl: '67.860000'
                        median_pnl: '12.500000'
                        profitable_count: 1200
                        profitable_over_10k: 15
                        total_shares: '500000.000000'
                        total_cash_value: '325000.000000'
                      offset: 0
                      limit: 100
                      updated_at: '2026-01-01T00:00:00'
                Holders (Market) Initial:
                  summary: Holders for a condition_id with left/right token sides
                  value:
                    success: true
                    response:
                      type: initial
                      data_type: holders
                      condition_id: >-
                        0xbd71b43bb47eb60dbcb41fa25df2a0ed4da612873d6e0447a2c730bd4cc25910
                      data:
                        condition_id: >-
                          0xbd71b43bb47eb60dbcb41fa25df2a0ed4da612873d6e0447a2c730bd4cc25910
                        left:
                          token_id: >-
                            21742633143463906290569050155826241533067272736897614950488156847949938836455
                          holders:
                            - address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
                              shares: '1500.000000'
                              avg_price: '0.450000'
                              pnl: '225.000000'
                              realized_pnl: '50.000000'
                          holder_count: 1842
                          total_holders: 1842
                          stats:
                            total_pnl: '125000.000000'
                            weighted_pnl: '68.250000'
                            average_pnl: '67.860000'
                            median_pnl: '12.500000'
                            profitable_count: 1200
                            profitable_over_10k: 15
                            total_shares: '500000.000000'
                            total_cash_value: '325000.000000'
                        right:
                          token_id: >-
                            48388511015034828942276390714400011328125921609370079927799812281319682069004
                          holders: []
                          holder_count: 950
                          total_holders: 950
                          stats:
                            total_pnl: '0.000000'
                            weighted_pnl: '0.000000'
                            average_pnl: '0.000000'
                            median_pnl: '0.000000'
                            profitable_count: 0
                            profitable_over_10k: 0
                            total_shares: '0.000000'
                            total_cash_value: '0.000000'
                        updated_at: '2026-01-01T00:00:00'
                Holders Delta:
                  summary: >-
                    Live holders delta streamed after subscribe (not
                    WSResponse-wrapped)
                  value:
                    type: holders_delta
                    data_type: holders
                    condition_id: >-
                      0xbd71b43bb47eb60dbcb41fa25df2a0ed4da612873d6e0447a2c730bd4cc25910
                    token_id: >-
                      21742633143463906290569050155826241533067272736897614950488156847949938836455
                    version: 42
                    upserts:
                      - address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
                        shares: '1600.000000'
                        avg_price: '0.460000'
                        realized_pnl: '50.000000'
                    deletes:
                      - '0x1111111111111111111111111111111111111111'
                    holder_count: 1843
                    updated_at: '2026-01-01T00:01:00'
                Holder Counts Initial:
                  summary: Batch holder counts for multiple condition_ids
                  value:
                    success: true
                    response:
                      type: initial
                      data_type: holder_counts
                      data:
                        '0xbd71b43bb47eb60dbcb41fa25df2a0ed4da612873d6e0447a2c730bd4cc25910':
                          left: 1842
                          right: 950
                          left_token_id: >-
                            21742633143463906290569050155826241533067272736897614950488156847949938836455
                          right_token_id: >-
                            48388511015034828942276390714400011328125921609370079927799812281319682069004
                        '0xabc123':
                          left: 0
                          right: 0
                      updated_at: '2026-01-01T00:00:00'
                Sports Initial:
                  summary: Live sports event data returned on sports subscribe
                  value:
                    success: true
                    response:
                      type: initial
                      data_type: sports
                      event:
                        venue: polymarket
                        event_id: '12345'
                        title: Lakers vs Celtics
                        slug: lakers-vs-celtics
                        image: https://example.com/image.png
                        live:
                          live: true
                          ended: false
                          score:
                            home: '98'
                            away: '95'
                          period: 4th
                          clock: '2:30'
                Sports Update:
                  summary: Live sports event update streamed after subscribe
                  value:
                    success: true
                    response:
                      type: update
                      data_type: sports
                      event:
                        venue: polymarket
                        event_id: '12345'
                        title: Lakers vs Celtics
                        slug: lakers-vs-celtics
                        image: https://example.com/image.png
                        live:
                          live: true
                          ended: false
                          score:
                            home: '100'
                            away: '95'
                          period: 4th
                          clock: '1:45'
                ESPN Match Initial:
                  summary: ESPN game match returned on espn_match subscribe
                  value:
                    success: true
                    response:
                      type: initial
                      data_type: espn_match
                      slug: lakers-celtics
                      game:
                        game_id: '401585601'
                        sport: basketball
                        league: nba
                        period: 4th Quarter
                        clock: '2:30'
                        home_team:
                          team_id: '13'
                          name: Los Angeles Lakers
                          abbreviation: LAL
                          logo: https://a.espncdn.com/i/teamlogos/nba/500/lal.png
                          score: '98'
                          color: '552583'
                          record: 30-15
                        away_team:
                          team_id: '2'
                          name: Boston Celtics
                          abbreviation: BOS
                          logo: https://a.espncdn.com/i/teamlogos/nba/500/bos.png
                          score: '95'
                          color: 007A33
                          record: 35-10
                        start_time: '2026-01-01T00:00:00'
                        venue: Crypto.com Arena
                        broadcast: ESPN
                        status: in
                ESPN Game Stats Initial:
                  summary: ESPN game stats returned on espn_game_stats subscribe
                  value:
                    success: true
                    response:
                      type: initial
                      data_type: espn_game_stats
                      game_id: '401585601'
                      stats:
                        leaders:
                          - name: passingYards
                            displayName: Passing Yards
                            leaders:
                              - displayValue: 285 YDS, 2 TD
                                athlete:
                                  displayName: P. Mahomes
                                  headshot: https://a.espncdn.com/combiner/i?img=...
                                  team:
                                    abbreviation: KC
                        boxscore:
                          teams:
                            - name: Kansas City Chiefs
                              logo: https://a.espncdn.com/i/teamlogos/nfl/500/kc.png
                              statistics:
                                - label: Total Yards
                                  displayValue: '350'
                        plays:
                          - id: '1'
                            text: P. Mahomes pass complete to T. Kelce for 15 yards
                            clock: '2:30'
                            period: '4'
                            team: KC
                            scoreValue: null
                        situation:
                          possession: KC
                          down: 2
                          distance: 7
                          yardLine: 35
                          isRedZone: false
                        linescores:
                          - team: KC
                            score: '21'
                            periods:
                              - '7'
                              - '7'
                              - '0'
                              - '7'
                          - team: SF
                            score: '17'
                            periods:
                              - '3'
                              - '7'
                              - '7'
                              - '0'
                Signals Initial:
                  summary: Whale trade signals returned on signals subscribe
                  value:
                    success: true
                    response:
                      type: initial
                      data_type: signals
                      signals:
                        - venue: polymarket
                          tx_hash: >-
                            0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2
                          token_id: >-
                            21742633143463906290569050155826241533067272736897614950488156847949938836455
                          side: BUY
                          amount: '5000.000'
                          shares: '7692.307'
                          price: '0.650'
                          trader:
                            address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
                            username: whale1
                            image: ''
                            verified: true
                          context:
                            position_shares: '15000.000'
                            position_avg_price: '0.500'
                            position_pnl: '2250.000'
                            total_volume: 1500000
                            total_pnl: 250000
                            trade_count: 5000
                            join_date: '2022-06-15'
                          event:
                            event_id: 12345
                            title: Will Bitcoin reach $100k by end of 2025?
                            slug: will-bitcoin-reach-100k-by-end-of-2025
                            description: >-
                              This market resolves to Yes if spot Bitcoin trades
                              at or above $100,000 before 2025 ends.
                            image: https://example.com/bitcoin.png
                            tags:
                              - crypto
                              - bitcoin
                            labels:
                              - crypto
                              - macro
                            neg_risk: false
                            active: true
                            liquidity: '1500000'
                            volume: '5000000'
                            volume24hr: '250000'
                            volume1wk: '900000'
                            volume1mo: '2200000'
                            volume1yr: '5000000'
                            live:
                              live: false
                              ended: false
                            created_at: '2026-01-01T00:00:00'
                            updated_at: '2026-01-01T00:00:00'
                            ends_at: '2026-12-31T23:59:59'
                          market:
                            event_id: 12345
                            condition_id: >-
                              0xbd71b43bb47eb60dbcb41fa25df2a0ed4da612873d6e0447a2c730bd4cc25910
                            question_id: '0xabcd'
                            question: Will Bitcoin reach $100k?
                            outcome: 'Yes'
                            slug: will-bitcoin-reach-100k-yes
                            description: >-
                              Buy Yes if you think Bitcoin will trade at or
                              above $100,000 before market expiry.
                            image: https://example.com/bitcoin-market.png
                            left_outcome: 'Yes'
                            right_outcome: 'No'
                            left_price: '0.65'
                            right_price: '0.35'
                            left_token_id: >-
                              21742633143463906290569050155826241533067272736897614950488156847949938836455
                            right_token_id: >-
                              48572956138472615938471625938471659384716593847165938471659384716593847165938
                            winner_token_id: ''
                            active: true
                            resolved: false
                            fees: true
                            decimals: 6
                            liquidity: '1500000'
                            volume: '5000000'
                            volume24hr: '250000'
                            volume1wk: '900000'
                            volume1mo: '2200000'
                            volume1yr: '5000000'
                            rewards:
                              rewards: false
                            created_at: '2026-01-01T00:00:00'
                            updated_at: '2026-01-01T00:00:00'
                            ends_at: '2026-12-31T23:59:59'
                          created_at: '2026-01-01T00:00:00Z'
                      has_more: true
                      offset: 0
                      limit: 50
                Signals Update:
                  summary: Live whale trade signal streamed after subscribe
                  value:
                    success: true
                    response:
                      type: update
                      data_type: signals
                      signals:
                        venue: polymarket
                        tx_hash: >-
                          0xc3d4e5f6a7b8c3d4e5f6a7b8c3d4e5f6a7b8c3d4e5f6a7b8c3d4e5f6a7b8c3d4
                        token_id: >-
                          21742633143463906290569050155826241533067272736897614950488156847949938836455
                        side: SELL
                        amount: '3000.000'
                        shares: '4615.384'
                        price: '0.650'
                        trader:
                          address: '0x1234567890abcdef1234567890abcdef12345678'
                          username: whale2
                          image: ''
                          verified: false
                        context:
                          position_shares: '0'
                          position_avg_price: '0'
                          position_pnl: '0'
                          total_volume: 500000
                          total_pnl: 75000
                          trade_count: 1200
                          join_date: '2023-01-01'
                        event:
                          event_id: 12345
                          title: Will Bitcoin reach $100k by end of 2025?
                          slug: will-bitcoin-reach-100k-by-end-of-2025
                          description: >-
                            This market resolves to Yes if spot Bitcoin trades
                            at or above $100,000 before 2025 ends.
                          image: https://example.com/bitcoin.png
                          tags:
                            - crypto
                            - bitcoin
                          labels:
                            - crypto
                            - macro
                          neg_risk: false
                          active: true
                          liquidity: '1500000'
                          volume: '5000000'
                          volume24hr: '250000'
                          volume1wk: '900000'
                          volume1mo: '2200000'
                          volume1yr: '5000000'
                          live:
                            live: false
                            ended: false
                          created_at: '2026-01-01T00:00:00'
                          updated_at: '2026-01-01T00:00:00'
                          ends_at: '2026-12-31T23:59:59'
                        market:
                          event_id: 12345
                          condition_id: >-
                            0xbd71b43bb47eb60dbcb41fa25df2a0ed4da612873d6e0447a2c730bd4cc25910
                          question_id: '0xabcd'
                          question: Will Bitcoin reach $100k?
                          outcome: 'Yes'
                          slug: will-bitcoin-reach-100k-yes
                          description: >-
                            Buy Yes if you think Bitcoin will trade at or above
                            $100,000 before market expiry.
                          image: https://example.com/bitcoin-market.png
                          left_outcome: 'Yes'
                          right_outcome: 'No'
                          left_price: '0.65'
                          right_price: '0.35'
                          left_token_id: >-
                            21742633143463906290569050155826241533067272736897614950488156847949938836455
                          right_token_id: >-
                            48572956138472615938471625938471659384716593847165938471659384716593847165938
                          winner_token_id: ''
                          active: true
                          resolved: false
                          fees: true
                          decimals: 6
                          liquidity: '1500000'
                          volume: '5000000'
                          volume24hr: '250000'
                          volume1wk: '900000'
                          volume1mo: '2200000'
                          volume1yr: '5000000'
                          rewards:
                            rewards: false
                          created_at: '2026-01-01T00:00:00'
                          updated_at: '2026-01-01T00:00:00'
                          ends_at: '2026-12-31T23:59:59'
                        created_at: '2026-01-01T00:01:00Z'
                Movers Initial:
                  summary: Market movers returned on movers subscribe
                  value:
                    success: true
                    response:
                      type: initial
                      data_type: movers
                      venue: all
                      direction: all
                      timeframe: 1h
                      movers:
                        - venue: polymarket
                          market_id: >-
                            0xbd71b43bb47eb60dbcb41fa25df2a0ed4da612873d6e0447a2c730bd4cc25910
                          token_id: >-
                            21742633143463906290569050155826241533067272736897614950488156847949938836455
                          title: Will Bitcoin reach $100k by end of 2025?
                          slug: will-bitcoin-reach-100k-by-end-of-2025
                          image: https://example.com/image.png
                          price: 0.65
                          price_old: 0.55
                          delta_pct: 18.18
                          delta_abs: 18.18
                          direction: up
                          volume24hr: 125000
                      updated_at: '2026-01-01T00:00:00'
                FDV Tokens Initial:
                  summary: FDV token list returned on fdv subscribe
                  value:
                    success: true
                    response:
                      type: initial
                      data_type: fdv
                      update_type: tokens
                      tokens:
                        - token_id: abc123
                          symbol: HYPE
                          name: Hyperliquid
                          icon: https://example.com/hype.png
                          chain_id: 1
                          status: active
                          last_price: 0.025
                          total_supply: '1000000000'
                          fdv: 25000000
                          volume24hr: 500000
                          updated_at: '2026-01-01T00:00:00'
                      updated_at: '2026-01-01T00:00:00Z'
                FDV Token Detail:
                  summary: >-
                    Single FDV token detail returned on fdv subscribe with
                    token_id or symbol
                  value:
                    success: true
                    response:
                      type: initial
                      data_type: fdv
                      update_type: token
                      token_id: abc123
                      token:
                        token_id: abc123
                        symbol: HYPE
                        name: Hyperliquid
                        icon: https://example.com/hype.png
                        chain_id: 1
                        status: active
                        last_price: 0.025
                        total_supply: '1000000000'
                        fdv: 25000000
                        volume24hr: 500000
                        updated_at: '2026-01-01T00:00:00'
                FDV Chart:
                  summary: FDV price chart data returned after token detail
                  value:
                    success: true
                    response:
                      type: initial
                      data_type: fdv
                      update_type: chart
                      token_id: abc123
                      chart:
                        - timestamp: '2026-01-01T00:00:00'
                          price: 0.024
                        - timestamp: '2026-01-01T01:00:00'
                          price: 0.025
                FDV Trades:
                  summary: FDV recent trades returned after token detail
                  value:
                    success: true
                    response:
                      type: initial
                      data_type: fdv
                      update_type: trades
                      token_id: abc123
                      trades:
                        - id: t_001
                          symbol: HYPE
                          side: buy
                          amount: '100.00'
                          price: '0.025'
                          timestamp: '2026-01-01T00:00:00'
                FDV Token Update:
                  summary: Live FDV token update streamed after subscribe
                  value:
                    success: true
                    response:
                      type: update
                      data_type: fdv
                      update_type: token
                      token_id: abc123
                      token:
                        token_id: abc123
                        symbol: HYPE
                        name: Hyperliquid
                        icon: https://example.com/hype.png
                        chain_id: 1
                        status: active
                        last_price: 0.026
                        total_supply: '1000000000'
                        fdv: 26000000
                        volume24hr: 520000
                        updated_at: '2026-01-01T00:30:00'
                Elon Tweets Initial:
                  summary: Tweet count returned on elon_tweets subscribe
                  value:
                    success: true
                    response:
                      type: initial
                      data_type: elon_tweets
                      event_id: '12345'
                      tweet_count: 42
                Elon Tweets Update:
                  summary: Live tweet count update streamed after subscribe
                  value:
                    success: true
                    response:
                      type: update
                      data_type: elon_tweets
                      event_id: '12345'
                      tweet_count: 43
                Unsubscribed:
                  summary: Unsubscribe acknowledgment
                  value:
                    success: true
                    response: Unsubscribed
                Error:
                  summary: Error response
                  value:
                    success: false
                    response: Invalid type.
      security: []

````

Built with [Mintlify](https://mintlify.com).