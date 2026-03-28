# synth

AI trading desk for [Synthesis.trade](https://synthesis.trade) — unified prediction market trading across Polymarket and Kalshi.

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e ".[all]"
cp .env.example .env
```

Edit `.env` with your credentials.

## Run

```bash
synthesis-server
```

More detail: `docs.md`.
