"""Mount the Synth operator console UI on the FastAPI app."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.responses import HTMLResponse


def mount_ui(app: FastAPI) -> None:
    @app.get("/", response_class=HTMLResponse, include_in_schema=False)
    async def synth_ui():
        return SYNTH_HTML


SYNTH_HTML = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Synth — AI Trading Desk</title>
<style>
:root {
  --bg: #0a0e17; --bg2: #111827; --bg3: #1a2332;
  --border: #1e293b; --border2: #334155;
  --text: #e2e8f0; --text2: #94a3b8; --text3: #64748b;
  --accent: #3b82f6; --accent2: #60a5fa;
  --green: #22c55e; --green2: #16a34a;
  --red: #ef4444; --red2: #dc2626;
  --yellow: #eab308; --orange: #f97316;
  --purple: #a855f7;
  --radius: 8px; --radius2: 12px;
  --font: 'SF Mono', 'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: var(--font); background: var(--bg); color: var(--text); font-size: 13px; line-height: 1.5; }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--bg2); }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 3px; }

/* Layout */
.app { display: flex; flex-direction: column; height: 100vh; }
header { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; background: var(--bg2); border-bottom: 1px solid var(--border); flex-shrink: 0; }
header .logo { font-size: 16px; font-weight: 700; color: var(--accent2); letter-spacing: 1px; }
header .logo span { color: var(--text3); font-weight: 400; font-size: 12px; margin-left: 8px; }
.status-bar { display: flex; gap: 16px; align-items: center; }
.status-pill { display: flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px; background: var(--bg3); font-size: 11px; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; }
.dot-green { background: var(--green); box-shadow: 0 0 6px var(--green); }
.dot-yellow { background: var(--yellow); box-shadow: 0 0 6px var(--yellow); }
.dot-red { background: var(--red); box-shadow: 0 0 6px var(--red); }

.main { display: grid; grid-template-columns: 320px 1fr 340px; grid-template-rows: 1fr; flex: 1; overflow: hidden; }
@media (max-width: 1100px) { .main { grid-template-columns: 1fr; grid-template-rows: auto 1fr auto; } }

/* Panels */
.panel { display: flex; flex-direction: column; border-right: 1px solid var(--border); overflow: hidden; }
.panel:last-child { border-right: none; }
.panel-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: var(--bg2); border-bottom: 1px solid var(--border); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text2); flex-shrink: 0; }
.panel-body { flex: 1; overflow-y: auto; padding: 12px; }

/* Controls */
.search-box { display: flex; gap: 8px; padding: 12px; background: var(--bg2); border-bottom: 1px solid var(--border); flex-shrink: 0; }
input, select { font-family: var(--font); font-size: 12px; background: var(--bg); border: 1px solid var(--border2); color: var(--text); padding: 8px 12px; border-radius: var(--radius); outline: none; transition: border 0.2s; }
input:focus, select:focus { border-color: var(--accent); }
input::placeholder { color: var(--text3); }
button { font-family: var(--font); font-size: 12px; cursor: pointer; border: none; border-radius: var(--radius); padding: 8px 16px; font-weight: 600; transition: all 0.15s; }
.btn-primary { background: var(--accent); color: white; }
.btn-primary:hover { background: var(--accent2); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-success { background: var(--green2); color: white; }
.btn-success:hover { background: var(--green); }
.btn-danger { background: var(--red2); color: white; }
.btn-danger:hover { background: var(--red); }
.btn-ghost { background: transparent; color: var(--text2); border: 1px solid var(--border2); }
.btn-ghost:hover { background: var(--bg3); color: var(--text); }

/* Cards */
.card { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--radius2); padding: 12px; margin-bottom: 8px; cursor: pointer; transition: all 0.15s; }
.card:hover { border-color: var(--border2); background: var(--bg3); }
.card.selected { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
.card-title { font-weight: 600; font-size: 12px; margin-bottom: 4px; color: var(--text); }
.card-subtitle { font-size: 11px; color: var(--text2); margin-bottom: 8px; }
.card-row { display: flex; justify-content: space-between; align-items: center; font-size: 11px; margin-bottom: 2px; }
.card-row .label { color: var(--text3); }

/* Price displays */
.price-yes { color: var(--green); font-weight: 600; }
.price-no { color: var(--red); font-weight: 400; }
.badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
.badge-sim { background: rgba(234,179,8,0.15); color: var(--yellow); }
.badge-live { background: rgba(239,68,68,0.15); color: var(--red); }
.badge-venue { background: rgba(59,130,246,0.15); color: var(--accent2); }
.badge-confidence { background: rgba(168,85,247,0.15); color: var(--purple); }

/* Predictions */
.prediction-card { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--radius2); padding: 14px; margin-bottom: 10px; }
.prediction-card.high-edge { border-left: 3px solid var(--green); }
.prediction-card.negative-edge { border-left: 3px solid var(--red); }
.prediction-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.prediction-title { font-weight: 600; font-size: 13px; flex: 1; }
.prediction-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; font-size: 11px; margin-bottom: 8px; }
.prediction-meta .label { color: var(--text3); }
.prediction-meta .value { color: var(--text); font-weight: 500; }
.thesis-text { font-size: 12px; color: var(--text2); line-height: 1.6; margin: 8px 0; padding: 8px; background: var(--bg); border-radius: var(--radius); }
.signals-list { list-style: none; font-size: 11px; color: var(--text2); }
.signals-list li::before { content: "→ "; color: var(--accent); }
.risk-list li::before { content: "⚠ "; color: var(--yellow); }

/* Proposal action bar */
.proposal-actions { display: flex; gap: 8px; margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border); }

/* Right panel */
.info-section { margin-bottom: 16px; }
.info-section h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text3); margin-bottom: 8px; }
.info-row { display: flex; justify-content: space-between; font-size: 12px; padding: 4px 0; }
.info-row .label { color: var(--text3); }

/* Log entries */
.log-entry { font-size: 11px; padding: 4px 0; border-bottom: 1px solid var(--border); color: var(--text2); }
.log-entry .time { color: var(--text3); margin-right: 8px; }
.log-entry.log-success { color: var(--green); }
.log-entry.log-error { color: var(--red); }
.log-entry.log-warn { color: var(--yellow); }

/* Loading */
.spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid var(--border2); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-overlay { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 40px; color: var(--text3); }

/* Empty state */
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; color: var(--text3); text-align: center; }
.empty-state .icon { font-size: 32px; margin-bottom: 12px; opacity: 0.5; }
.empty-state p { font-size: 12px; max-width: 240px; }

/* Tabs */
.tabs { display: flex; gap: 0; background: var(--bg2); border-bottom: 1px solid var(--border); flex-shrink: 0; }
.tab { padding: 8px 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text3); cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.15s; }
.tab:hover { color: var(--text2); }
.tab.active { color: var(--accent2); border-bottom-color: var(--accent); }

/* Edge meter */
.edge-bar { height: 4px; border-radius: 2px; background: var(--border); margin-top: 4px; overflow: hidden; }
.edge-fill { height: 100%; border-radius: 2px; transition: width 0.3s; }
.edge-positive { background: var(--green); }
.edge-negative { background: var(--red); }
</style>
</head>
<body>
<div class="app">
  <header>
    <div class="logo">SYNTH <span>AI Trading Desk</span></div>
    <div class="status-bar">
      <div class="status-pill" id="mode-pill">
        <div class="status-dot dot-yellow"></div>
        <span id="mode-text">SIMULATION</span>
      </div>
      <div class="status-pill" id="ai-pill">
        <div class="status-dot dot-green" id="ai-dot"></div>
        <span id="ai-text">AI: Ready</span>
      </div>
      <div class="status-pill">
        <span id="time-display"></span>
      </div>
    </div>
  </header>

  <div class="main">
    <!-- LEFT: Markets -->
    <div class="panel" id="markets-panel">
      <div class="search-box">
        <input type="text" id="search-input" placeholder="Search markets..." style="flex:1" />
        <select id="venue-select" style="width:100px">
          <option value="">All</option>
          <option value="polymarket">Polymarket</option>
          <option value="kalshi">Kalshi</option>
        </select>
        <button class="btn-primary" id="search-btn">Search</button>
      </div>
      <div class="panel-header">
        <span>Markets</span>
        <span id="market-count" style="color:var(--text3)">0</span>
      </div>
      <div class="panel-body" id="markets-list">
        <div class="empty-state">
          <div class="icon">📊</div>
          <p>Search for prediction markets or click Scan to let AI find opportunities</p>
        </div>
      </div>
      <div style="padding:8px 12px; border-top:1px solid var(--border); background:var(--bg2); display:flex; gap:8px;">
        <button class="btn-primary" id="scan-btn" style="flex:1">AI Scan</button>
        <button class="btn-ghost" id="refresh-btn">Refresh</button>
      </div>
    </div>

    <!-- CENTER: Analysis -->
    <div class="panel" id="analysis-panel">
      <div class="tabs">
        <div class="tab active" data-tab="predictions">Predictions</div>
        <div class="tab" data-tab="proposals">Proposals</div>
        <div class="tab" data-tab="portfolio">Portfolio</div>
      </div>
      <div class="panel-body" id="analysis-body">
        <div class="empty-state">
          <div class="icon">🧠</div>
          <p>Run an AI scan to generate predictions and trade proposals</p>
        </div>
      </div>
    </div>

    <!-- RIGHT: Context -->
    <div class="panel" id="context-panel">
      <div class="panel-header">
        <span>Context</span>
        <button class="btn-ghost" id="refresh-status-btn" style="padding:4px 8px; font-size:10px;">Refresh</button>
      </div>
      <div class="panel-body" id="context-body">
        <div class="info-section">
          <h3>Desk Status</h3>
          <div class="info-row"><span class="label">Mode</span><span id="ctx-mode">—</span></div>
          <div class="info-row"><span class="label">AI Model</span><span id="ctx-model">—</span></div>
          <div class="info-row"><span class="label">Confidence Gate</span><span id="ctx-conf">—</span></div>
          <div class="info-row"><span class="label">Max Order</span><span id="ctx-maxorder">—</span></div>
          <div class="info-row"><span class="label">Max Position</span><span id="ctx-maxpos">—</span></div>
          <div class="info-row"><span class="label">Daily Loss Limit</span><span id="ctx-maxloss">—</span></div>
        </div>
        <div class="info-section">
          <h3>Wallet</h3>
          <div style="display:flex; gap:6px; margin-bottom:8px;">
            <input type="text" id="wallet-input" placeholder="wallet_id" style="flex:1; font-size:11px; padding:6px 8px;" />
            <button class="btn-ghost" id="load-wallet-btn" style="padding:4px 8px; font-size:10px;">Load</button>
          </div>
          <div id="wallet-info">
            <div class="info-row"><span class="label">Balance</span><span id="ctx-balance">—</span></div>
            <div class="info-row"><span class="label">Positions</span><span id="ctx-positions">—</span></div>
            <div class="info-row"><span class="label">P&L</span><span id="ctx-pnl">—</span></div>
          </div>
        </div>
        <div class="info-section">
          <h3>Activity Log</h3>
          <div id="log-container" style="max-height:300px; overflow-y:auto;">
            <div class="log-entry"><span class="time">—</span>Synth initialized</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
const API = '';
let markets = [];
let latestAnalysis = null;
let currentTab = 'predictions';
let selectedWallet = '';

// --- Utilities ---
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }
function fmt(n, d=2) { return Number(n).toFixed(d); }
function fmtUSD(n) { return '$' + fmt(n); }
function pct(n) { return fmt(n*100,1) + '%'; }
function ts() { return new Date().toLocaleTimeString('en-US', {hour12:false}); }

function log(msg, cls='') {
  const c = $('#log-container');
  const el = document.createElement('div');
  el.className = 'log-entry ' + cls;
  el.innerHTML = `<span class="time">${ts()}</span>${msg}`;
  c.prepend(el);
  if (c.children.length > 100) c.lastChild.remove();
}

async function api(path, opts={}) {
  const resp = await fetch(API + path, {
    headers: {'Content-Type': 'application/json'},
    ...opts,
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({error: resp.statusText}));
    throw new Error(err.detail || err.error || JSON.stringify(err));
  }
  return resp.json();
}

// --- Clock ---
setInterval(() => { $('#time-display').textContent = ts(); }, 1000);
$('#time-display').textContent = ts();

// --- Status ---
async function loadStatus() {
  try {
    const s = await api('/synth/status');
    $('#ctx-mode').textContent = s.simulation_mode ? 'SIMULATION' : 'LIVE';
    $('#ctx-mode').style.color = s.simulation_mode ? 'var(--yellow)' : 'var(--red)';
    $('#mode-text').textContent = s.simulation_mode ? 'SIMULATION' : 'LIVE';
    const dot = $('#mode-pill .status-dot');
    dot.className = 'status-dot ' + (s.simulation_mode ? 'dot-yellow' : 'dot-red');
    $('#ctx-model').textContent = s.model;
    $('#ctx-conf').textContent = pct(s.confidence_threshold);
    $('#ctx-maxorder').textContent = fmtUSD(s.risk_limits.max_single_order_usdc);
    $('#ctx-maxpos').textContent = fmtUSD(s.risk_limits.max_position_usdc);
    $('#ctx-maxloss').textContent = fmtUSD(s.risk_limits.max_daily_loss_usdc);
    if (!s.ai_enabled) {
      $('#ai-dot').className = 'status-dot dot-red';
      $('#ai-text').textContent = 'AI: No Key';
    }
  } catch (e) {
    log('Status load failed: ' + e.message, 'log-error');
  }
}
loadStatus();
$('#refresh-status-btn').onclick = loadStatus;

// --- Wallet ---
$('#load-wallet-btn').onclick = async () => {
  selectedWallet = $('#wallet-input').value.trim();
  if (!selectedWallet) return;
  try {
    const [bal, pos, pnl] = await Promise.all([
      api(`/portfolio/wallet/${selectedWallet}/balance`),
      api(`/portfolio/wallet/${selectedWallet}/positions`),
      api(`/portfolio/wallet/${selectedWallet}/pnl`),
    ]);
    $('#ctx-balance').textContent = '$' + (bal.available || bal.total || '0');
    $('#ctx-positions').textContent = (Array.isArray(pos) ? pos.length : 0) + ' open';
    const pnlVal = parseFloat(pnl.total_pnl || 0);
    $('#ctx-pnl').textContent = fmtUSD(pnlVal);
    $('#ctx-pnl').style.color = pnlVal >= 0 ? 'var(--green)' : 'var(--red)';
    log('Wallet loaded: ' + selectedWallet, 'log-success');
  } catch (e) {
    log('Wallet load failed: ' + e.message, 'log-error');
  }
};

// --- Market Search ---
async function searchMarkets() {
  const q = $('#search-input').value.trim();
  const v = $('#venue-select').value;
  const list = $('#markets-list');
  list.innerHTML = '<div class="loading-overlay"><div class="spinner"></div>Searching...</div>';

  try {
    const params = new URLSearchParams();
    if (q) params.set('query', q);
    if (v) params.set('venue', v);
    params.set('limit', '20');
    const data = await api('/markets/search?' + params);
    markets = Array.isArray(data) ? data : (data.markets || data.data || []);

    // Flatten events->markets if needed
    let flat = [];
    for (const item of markets) {
      if (item.markets) {
        for (const m of item.markets) {
          flat.push({...m, event_title: item.event?.title || ''});
        }
      } else {
        flat.push(item);
      }
    }
    markets = flat;
    renderMarkets();
    log(`Found ${markets.length} markets`, 'log-success');
  } catch (e) {
    list.innerHTML = `<div class="empty-state"><p>Search failed: ${e.message}</p></div>`;
    log('Search failed: ' + e.message, 'log-error');
  }
}

function renderMarkets() {
  const list = $('#markets-list');
  $('#market-count').textContent = markets.length;
  if (!markets.length) {
    list.innerHTML = '<div class="empty-state"><div class="icon">📊</div><p>No markets found</p></div>';
    return;
  }
  list.innerHTML = markets.map((m, i) => {
    const name = m.question || m.title || m.market_name || m.event_title || 'Unknown';
    const venue = m.venue || 'unknown';
    const yes = m.left_price || m.yes_price || '—';
    const vol = m.volume || '0';
    return `<div class="card" data-idx="${i}">
      <div class="card-title">${esc(name.slice(0,80))}</div>
      <div class="card-subtitle"><span class="badge badge-venue">${venue}</span></div>
      <div class="card-row"><span class="label">YES</span><span class="price-yes">${yes}</span></div>
      <div class="card-row"><span class="label">Volume</span><span>${formatNum(vol)}</span></div>
    </div>`;
  }).join('');

  list.querySelectorAll('.card').forEach(c => {
    c.onclick = () => analyzeMarket(parseInt(c.dataset.idx));
  });
}

$('#search-btn').onclick = searchMarkets;
$('#search-input').onkeydown = e => { if (e.key === 'Enter') searchMarkets(); };
$('#refresh-btn').onclick = searchMarkets;

// --- AI Scan ---
$('#scan-btn').onclick = async () => {
  const btn = $('#scan-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Scanning...';
  log('Starting AI scan...');

  try {
    const body = {
      query: $('#search-input').value.trim(),
      venue: $('#venue-select').value,
      limit: 15,
      wallet_id: selectedWallet,
    };
    latestAnalysis = await api('/synth/scan', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    log(`AI scan complete: ${latestAnalysis.predictions?.length || 0} predictions`, 'log-success');
    renderAnalysis();
  } catch (e) {
    log('AI scan failed: ' + e.message, 'log-error');
    $('#analysis-body').innerHTML = `<div class="empty-state"><p>Scan failed: ${esc(e.message)}</p></div>`;
  } finally {
    btn.disabled = false;
    btn.textContent = 'AI Scan';
  }
};

// --- Single market analysis ---
async function analyzeMarket(idx) {
  const m = markets[idx];
  if (!m) return;
  const body = $('#analysis-body');
  body.innerHTML = '<div class="loading-overlay"><div class="spinner"></div>Analyzing market...</div>';
  currentTab = 'predictions';
  updateTabs();

  try {
    const req = {
      token_id: m.left_token_id || m.token_id || m.primary_token_id || '',
      condition_id: m.condition_id || '',
      market_id: m.market_id || '',
      wallet_id: selectedWallet,
    };
    const pred = await api('/synth/analyze', {
      method: 'POST',
      body: JSON.stringify(req),
    });
    log(`Analyzed: ${pred.market_name}`, 'log-success');
    body.innerHTML = renderPrediction(pred, -1);
  } catch (e) {
    body.innerHTML = `<div class="empty-state"><p>Analysis failed: ${esc(e.message)}</p></div>`;
    log('Analysis failed: ' + e.message, 'log-error');
  }
}

// --- Tabs ---
$$('.tab').forEach(t => {
  t.onclick = () => {
    currentTab = t.dataset.tab;
    updateTabs();
    renderAnalysis();
  };
});

function updateTabs() {
  $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === currentTab));
}

// --- Render Analysis ---
function renderAnalysis() {
  const body = $('#analysis-body');
  if (!latestAnalysis && currentTab !== 'portfolio') {
    body.innerHTML = '<div class="empty-state"><div class="icon">🧠</div><p>Run an AI scan to generate predictions</p></div>';
    return;
  }

  if (currentTab === 'predictions') {
    const preds = latestAnalysis?.predictions || [];
    if (!preds.length) {
      body.innerHTML = '<div class="empty-state"><p>No predictions yet</p></div>';
      return;
    }
    body.innerHTML = `<div style="padding:4px 0 8px; font-size:11px; color:var(--text3);">${latestAnalysis.summary || ''}</div>` +
      preds.map((p, i) => renderPrediction(p, i)).join('');
  } else if (currentTab === 'proposals') {
    const props = latestAnalysis?.proposals || [];
    if (!props.length) {
      body.innerHTML = '<div class="empty-state"><p>No trade proposals — predictions with positive edge will appear here</p></div>';
      return;
    }
    body.innerHTML = props.map((p, i) => renderProposal(p, i)).join('');
  } else if (currentTab === 'portfolio') {
    renderPortfolio(body);
  }
}

function renderPrediction(p, idx) {
  const edge = p.edge || (p.predicted_probability - p.current_price);
  const edgePct = (edge * 100).toFixed(1);
  const edgeClass = edge > 0 ? 'high-edge' : edge < -0.02 ? 'negative-edge' : '';
  const edgeColor = edge > 0 ? 'var(--green)' : 'var(--red)';
  const confColor = p.confidence >= 0.7 ? 'var(--green)' : p.confidence >= 0.4 ? 'var(--yellow)' : 'var(--red)';

  return `<div class="prediction-card ${edgeClass}">
    <div class="prediction-header">
      <div class="prediction-title">${esc(p.market_name || 'Market')}</div>
      <span class="badge badge-venue">${p.venue || '?'}</span>
    </div>
    <div class="prediction-meta">
      <div><span class="label">Price </span><span class="value">${fmt(p.current_price)}</span></div>
      <div><span class="label">Predicted </span><span class="value" style="color:${confColor}">${pct(p.predicted_probability)}</span></div>
      <div><span class="label">Edge </span><span class="value" style="color:${edgeColor}">${edgePct > 0 ? '+' : ''}${edgePct}%</span></div>
      <div><span class="label">Confidence </span><span class="badge badge-confidence">${pct(p.confidence)}</span></div>
      <div><span class="label">Outcome </span><span class="value">${p.predicted_outcome || '—'}</span></div>
      <div><span class="label">Horizon </span><span class="value">${p.time_horizon || '—'}</span></div>
    </div>
    <div class="edge-bar"><div class="edge-fill ${edge > 0 ? 'edge-positive' : 'edge-negative'}" style="width:${Math.min(Math.abs(edge)*500, 100)}%"></div></div>
    <div class="thesis-text">${esc(p.thesis || 'No thesis')}</div>
    ${p.supporting_signals?.length ? `<ul class="signals-list">${p.supporting_signals.map(s => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}
    ${p.risk_notes?.length ? `<ul class="signals-list risk-list" style="margin-top:4px">${p.risk_notes.map(s => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}
    ${p.invalidation_conditions?.length ? `<div style="margin-top:6px; font-size:11px; color:var(--text3);">Invalidation: ${p.invalidation_conditions.map(esc).join('; ')}</div>` : ''}
  </div>`;
}

function renderProposal(p, idx) {
  const pred = p.prediction;
  const edge = pred.edge || (pred.predicted_probability - pred.current_price);
  const actionColors = {buy_yes:'var(--green)', buy_no:'var(--red)', sell_yes:'var(--orange)', sell_no:'var(--green)', hold:'var(--text3)', avoid:'var(--red)'};

  return `<div class="prediction-card" style="border-left:3px solid ${actionColors[p.action] || 'var(--border)'}">
    <div class="prediction-header">
      <div class="prediction-title">${esc(pred.market_name || 'Market')}</div>
      <span class="badge" style="background:rgba(59,130,246,0.15);color:var(--accent2)">${p.action.toUpperCase()}</span>
    </div>
    <div class="prediction-meta">
      <div><span class="label">Side </span><span class="value">${p.suggested_side}</span></div>
      <div><span class="label">Amount </span><span class="value">${fmtUSD(p.suggested_amount_usdc)}</span></div>
      <div><span class="label">Edge </span><span class="value" style="color:${edge>0?'var(--green)':'var(--red)'}">${(edge*100).toFixed(1)}%</span></div>
      <div><span class="label">Kelly </span><span class="value">${pct(p.kelly_fraction)}</span></div>
      <div><span class="label">Max Loss </span><span class="value" style="color:var(--red)">${fmtUSD(p.max_loss_usdc)}</span></div>
      <div><span class="label">Confidence </span><span class="badge badge-confidence">${pct(pred.confidence)}</span></div>
    </div>
    <div class="thesis-text">${esc(p.rationale || pred.thesis)}</div>
    ${p.why_now ? `<div style="font-size:11px; margin-top:4px;"><span style="color:var(--green)">Why now:</span> ${esc(p.why_now)}</div>` : ''}
    ${p.why_not ? `<div style="font-size:11px; margin-top:2px;"><span style="color:var(--red)">Counter:</span> ${esc(p.why_not)}</div>` : ''}
    <div class="proposal-actions">
      ${p.executed ? `<button class="btn-ghost" disabled>Executed${p.execution_result?.simulated ? ' (sim)' : ''}</button>` :
        `<button class="btn-success" onclick="approveProposal(${idx})">Approve & Execute</button>
         <button class="btn-ghost" onclick="log('Proposal ${idx} dismissed')">Dismiss</button>`}
    </div>
  </div>`;
}

async function approveProposal(idx) {
  if (!selectedWallet) {
    log('Set a wallet ID first', 'log-warn');
    alert('Enter a wallet ID in the Context panel first.');
    return;
  }
  if (!confirm(`Approve proposal #${idx} for execution?\nWallet: ${selectedWallet}`)) return;

  log(`Approving proposal #${idx}...`);
  try {
    const result = await api('/synth/approve', {
      method: 'POST',
      body: JSON.stringify({ proposal_index: idx, wallet_id: selectedWallet }),
    });
    log(`Proposal #${idx} executed (simulated: ${result.simulated})`, result.simulated ? 'log-success' : 'log-warn');
    if (latestAnalysis?.proposals?.[idx]) {
      latestAnalysis.proposals[idx].executed = true;
      latestAnalysis.proposals[idx].execution_result = result;
    }
    renderAnalysis();
  } catch (e) {
    log('Approval failed: ' + e.message, 'log-error');
  }
}

async function renderPortfolio(body) {
  if (!selectedWallet) {
    body.innerHTML = '<div class="empty-state"><p>Enter a wallet ID to view portfolio</p></div>';
    return;
  }
  body.innerHTML = '<div class="loading-overlay"><div class="spinner"></div>Loading portfolio...</div>';

  try {
    const summary = await api(`/portfolio/wallet/${selectedWallet}/summary`);
    const positions = summary.positions || [];

    let html = `<div class="info-section">
      <h3>Portfolio Overview</h3>
      <div class="info-row"><span class="label">Balance</span><span>$${summary.balance?.available || '0'}</span></div>
      <div class="info-row"><span class="label">Positions</span><span>${summary.position_count || 0}</span></div>
      <div class="info-row"><span class="label">Total Exposure</span><span>${fmtUSD(summary.exposure?.total_value_usdc || 0)}</span></div>
      <div class="info-row"><span class="label">Largest Position</span><span>${fmtUSD(summary.exposure?.largest_position_usdc || 0)} (${fmt(summary.exposure?.largest_position_pct || 0,1)}%)</span></div>
    </div>`;

    if (positions.length) {
      html += '<div class="info-section"><h3>Positions</h3>';
      for (const p of positions) {
        const pnl = parseFloat(p.pnl || 0);
        html += `<div class="card">
          <div class="card-title">${esc(p.title || p.token_id)}</div>
          <div class="card-row"><span class="label">Side</span><span>${p.side}</span></div>
          <div class="card-row"><span class="label">Size</span><span>${p.size}</span></div>
          <div class="card-row"><span class="label">Avg Price</span><span>${p.avg_price}</span></div>
          <div class="card-row"><span class="label">Current</span><span>${p.current_price}</span></div>
          <div class="card-row"><span class="label">P&L</span><span style="color:${pnl>=0?'var(--green)':'var(--red)'}">${fmtUSD(pnl)}</span></div>
        </div>`;
      }
      html += '</div>';

      html += `<div style="padding:8px 0;"><button class="btn-primary" id="ai-portfolio-review-btn" style="width:100%">AI Portfolio Review</button></div>`;
    }

    body.innerHTML = html;

    const reviewBtn = document.getElementById('ai-portfolio-review-btn');
    if (reviewBtn) {
      reviewBtn.onclick = async () => {
        reviewBtn.disabled = true;
        reviewBtn.innerHTML = '<span class="spinner"></span> Analyzing...';
        try {
          const review = await api('/synth/portfolio-review', {
            method: 'POST',
            body: JSON.stringify({ wallet_id: selectedWallet }),
          });
          let rhtml = `<div class="prediction-card">
            <div class="prediction-header"><div class="prediction-title">Portfolio Review</div>
            <span class="badge" style="background:rgba(${review.health==='good'?'34,197,94':review.health==='warning'?'234,179,8':'239,68,68'},0.15);color:var(--${review.health==='good'?'green':review.health==='warning'?'yellow':'red'})">${(review.health||'unknown').toUpperCase()}</span></div>
            <div class="thesis-text">${esc(review.summary || 'No summary')}</div>`;
          if (review.warnings?.length) rhtml += `<ul class="signals-list risk-list">${review.warnings.map(w=>`<li>${esc(w)}</li>`).join('')}</ul>`;
          if (review.rebalancing?.length) rhtml += `<div style="margin-top:8px"><h3 style="font-size:11px;color:var(--text3)">Suggestions</h3><ul class="signals-list">${review.rebalancing.map(r=>`<li>${esc(r)}</li>`).join('')}</ul></div>`;
          rhtml += '</div>';
          body.innerHTML += rhtml;
          log('Portfolio review complete', 'log-success');
        } catch (e) {
          log('Portfolio review failed: ' + e.message, 'log-error');
        }
      };
    }
  } catch (e) {
    body.innerHTML = `<div class="empty-state"><p>Failed to load portfolio: ${esc(e.message)}</p></div>`;
  }
}

// --- Helpers ---
function esc(s) { if (!s) return ''; const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }
function formatNum(n) {
  const v = parseFloat(n);
  if (isNaN(v)) return n;
  if (v >= 1e6) return '$' + (v/1e6).toFixed(1) + 'M';
  if (v >= 1e3) return '$' + (v/1e3).toFixed(1) + 'K';
  return '$' + v.toFixed(0);
}

log('Synth desk initialized');
</script>
</body>
</html>"""
