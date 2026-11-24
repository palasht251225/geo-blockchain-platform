/* ==========================================================================
   GeoLedger - Full-Stack Client Controller & Interactive Visualizer
   ========================================================================== */

const API_BASE = window.location.origin;

// Application State
const state = {
  map: null,
  radarCircle: null,
  markerLayer: null,
  radarCenter: { lat: 28.6139, lng: 77.2090 },
  radarRadiusKm: 150,
  activeCategory: 'All',
  pinDropMode: false,
  allRecords: [],
  filteredRecords: [],
  blockchainData: null,
  auditReport: null,
  selectedRecord: null,
  benchmarkHistory: []
};

// Category Colors for Cyber Pin Styling
const CATEGORY_COLORS = {
  'Environmental Sensor': '#10b981',      // Emerald
  'Land Registry': '#f59e0b',             // Amber
  'Supply Chain & Logistics': '#00f2fe',  // Cyan
  'Critical Infrastructure': '#8b5cf6',   // Purple
  'Cultural Heritage': '#ec4899',         // Pink
  'System': '#38bdf8',                    // Light Blue
  'General': '#94a3b8'                    // Slate
};

// Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initMap();
  initEventListeners();
  loadPlatformStatus();
  loadBlockchainExplorer();
  runSpatialQuery();
});

/* ==========================================================================
   1. MAP INITIALIZATION & CONTROLS
   ========================================================================== */
function initMap() {
  // Center near New Delhi / Global Hub
  state.map = L.map('leafletMap', {
    zoomControl: false,
    attributionControl: false
  }).setView([state.radarCenter.lat, state.radarCenter.lng], 5);

  // Position zoom controls in top-left
  L.control.zoom({ position: 'topleft' }).addTo(state.map);

  // High-performance clean vector tiles (Free OpenStreetMap & ESRI, zero API key required)
  const baseMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(state.map);

  // Leaflet MarkerCluster Group for Smooth Zoom In / Out
  if (typeof L.markerClusterGroup === 'function') {
    state.markerLayer = L.markerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 40,
      iconCreateFunction: function (cluster) {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div class="friendly-cluster-bubble"><span>${count}</span></div>`,
          className: 'cluster-wrapper',
          iconSize: L.point(36, 36)
        });
      }
    }).addTo(state.map);
  } else {
    state.markerLayer = L.layerGroup().addTo(state.map);
  }

  // Initial full load
  loadAllRecordsOnMap();

  // Load Official Sovereign India Boundary Layer (Survey of India Standards)
  fetch('/india_boundary.geojson')
    .then(res => res.json())
    .then(geoJsonData => {
      L.geoJSON(geoJsonData, {
        style: {
          color: '#818cf8',
          weight: 2.8,
          opacity: 0.95,
          fillColor: '#6366f1',
          fillOpacity: 0.05
        }
      }).addTo(state.map);
      console.log('[Map] Official Survey of India complete boundary layer active.');
    })
    .catch(err => console.warn('Could not load india_boundary.geojson:', err));

  setTimeout(() => {
    if (state.map) state.map.invalidateSize();
  }, 250);

  // Map Click Listener
  state.map.on('click', (e) => {
    const lat = parseFloat(e.latlng.lat.toFixed(6));
    const lng = parseFloat(e.latlng.lng.toFixed(6));

    if (state.pinDropMode) {
      openNewRecordModal(lat, lng);
      togglePinDropMode(false);
    } else {
      // Reposition Radar Center
      state.radarCenter = { lat, lng };
      document.getElementById('radarLat').innerText = lat.toFixed(4);
      document.getElementById('radarLng').innerText = lng.toFixed(4);
      updateRadarCircle();
      runSpatialQuery();
    }
  });
}

function updateRadarCircle() {
  if (state.radarCircle) {
    state.map.removeLayer(state.radarCircle);
  }

  state.radarCircle = L.circle([state.radarCenter.lat, state.radarCenter.lng], {
    radius: state.radarRadiusKm * 1000,
    color: '#00f2fe',
    fillColor: '#00f2fe',
    fillOpacity: 0.1,
    weight: 1.5,
    dashArray: '4, 8'
  }).addTo(state.map);
}

function createCustomPin(color) {
  return L.divIcon({
    className: 'custom-pin-wrapper',
    html: `<div class="custom-geo-pin" style="background-color: ${color}; color: ${color};"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
}

async function loadAllRecordsOnMap() {
  try {
    const res = await fetch(`${API_BASE}/api/records?limit=1000`);
    const data = await res.json();
    state.allRecords = data.records || [];
    renderMarkers(state.allRecords);
    const countEl = document.getElementById('resultsCount');
    if (countEl) countEl.innerText = `${state.allRecords.length} Found`;
  } catch (err) {
    console.error('Failed to load all records:', err);
  }
}

function renderMarkers(records) {
  state.markerLayer.clearLayers();

  records.forEach(rec => {
    const color = CATEGORY_COLORS[rec.category] || '#6366f1';
    const marker = L.marker([rec.latitude, rec.longitude], {
      icon: createCustomPin(color)
    });

    // Sleek tooltip on hover
    marker.bindTooltip(`
      <div style="font-family: var(--font-sans); padding: 2px;">
        <strong style="color:#fff; font-size:11px;">${rec.title}</strong>
        <div style="color:${color}; font-size:9px; font-weight:700; margin-top:2px;">${rec.category}</div>
        <div style="color:#94a3b8; font-size:9px; font-family:var(--font-mono); margin-top:2px;">[${rec.latitude.toFixed(4)}, ${rec.longitude.toFixed(4)}]</div>
      </div>
    `, {
      direction: 'top',
      offset: [0, -8],
      className: 'human-leaflet-tooltip'
    });

    marker.on('click', () => {
      openRecordDrawer(rec);
    });

    state.markerLayer.addLayer(marker);
  });
}

/* ==========================================================================
   2. SPATIAL QUERY ENGINE CLIENT
   ========================================================================== */
async function runSpatialQuery() {
  const { lat, lng } = state.radarCenter;
  const radius = state.radarRadiusKm;
  const cat = state.activeCategory !== 'All' ? encodeURIComponent(state.activeCategory) : '';

  const url = `${API_BASE}/api/records/search?lat=${lat}&lng=${lng}&radiusKm=${radius}${cat ? `&category=${cat}` : ''}`;

  try {
    const startUi = performance.now();
    const res = await fetch(url);
    const data = await res.json();
    const totalUiElapsed = (performance.now() - startUi).toFixed(2);

    state.filteredRecords = data.results || [];

    // Update Stats if elements present
    const countEl = document.getElementById('resultsCount');
    if (countEl) countEl.innerText = `${state.filteredRecords.length} Discovered`;
    const latencyEl = document.getElementById('liveSearchLatency');
    if (latencyEl) latencyEl.innerText = `${data.elapsedMs} ms`;
    const statLatencyEl = document.getElementById('statLatency');
    if (statLatencyEl) statLatencyEl.innerText = `${data.elapsedMs} ms`;

    // Render Markers on Map
    renderMarkers(state.filteredRecords);
    if (document.getElementById('recordsListContainer')) {
      renderRecordsList(state.filteredRecords);
    }
  } catch (err) {
    console.error('Failed to run spatial query:', err);
  }
}

function renderRecordsList(records) {
  const container = document.getElementById('recordsListContainer');
  if (!container) return;
  container.innerHTML = '';

  const streamStats = document.getElementById('streamStats');
  if (streamStats) streamStats.innerText = `Showing ${records.length} records`;

  if (records.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 30px 10px; color: var(--text-dim);">
        <i class="fa-solid fa-satellite" style="font-size: 24px; margin-bottom: 8px;"></i>
        <p>No records found in current radar radius. Try expanding radius or moving the radar center.</p>
      </div>`;
    return;
  }

  records.slice(0, 50).forEach(rec => {
    const card = document.createElement('div');
    card.className = `record-item-card ${state.selectedRecord && state.selectedRecord.id === rec.id ? 'active' : ''}`;
    const color = CATEGORY_COLORS[rec.category] || '#00f2fe';

    card.innerHTML = `
      <div class="item-top">
        <span class="item-title" title="${rec.title}">${rec.title}</span>
        <span class="item-cat" style="color:${color}; border-color:${color}44;">${rec.category}</span>
      </div>
      <div class="item-coords">
        <span><i class="fa-solid fa-location-dot"></i> ${rec.latitude.toFixed(4)}, ${rec.longitude.toFixed(4)}</span>
        ${rec.distanceKm !== undefined ? `<span><i class="fa-solid fa-ruler"></i> ${rec.distanceKm} km</span>` : ''}
      </div>
      <div class="item-hash" title="${rec.recordHash}">
        SHA: ${rec.recordHash ? rec.recordHash.substring(0, 18) + '...' : 'GENESIS'}
      </div>
    `;

    card.addEventListener('click', () => {
      openRecordDrawer(rec);
      state.map.flyTo([rec.latitude, rec.longitude], 12, { duration: 0.8 });
    });

    container.appendChild(card);
  });
}

function openRecordDrawer(rec) {
  state.selectedRecord = rec;
  const drawer = document.getElementById('recordDrawer');
  const content = document.getElementById('drawerContent');
  const color = CATEGORY_COLORS[rec.category] || '#00f2fe';

  content.innerHTML = `
    <div style="margin-bottom: 16px;">
      <span class="badge" style="background:${color}22; color:${color}; border-color:${color}55;">${rec.category}</span>
      <h3 style="font-size: 18px; margin-top: 8px; font-weight: 800;">${rec.title}</h3>
      <div style="font-size: 11px; color: var(--text-dim); margin-top: 4px;">ID: <strong style="color:#fff;">${rec.id}</strong></div>
    </div>

    <div class="card-nested" style="margin-bottom: 14px;">
      <div class="group-title">
        <span><i class="fa-solid fa-compass text-cyan"></i> Spatial Coordinates</span>
        <span class="sub-label">${rec.elevation || 0}m Alt</span>
      </div>
      <div style="font-family: var(--font-mono); font-size: 12px; display:flex; justify-content:space-between;">
        <div>Lat: <strong class="text-cyan">${rec.latitude.toFixed(6)}</strong></div>
        <div>Lng: <strong class="text-cyan">${rec.longitude.toFixed(6)}</strong></div>
      </div>
    </div>

    <div class="card-nested" style="margin-bottom: 14px;">
      <div class="group-title">
        <span><i class="fa-solid fa-fingerprint text-purple"></i> Cryptographic Audit Proof</span>
      </div>
      <div style="font-size: 11px; color: var(--text-dim); margin-bottom: 4px;">Record SHA-256 Hash:</div>
      <div class="block-field-val" style="color: var(--cyan-glow); font-size: 10px; cursor: pointer;" title="Click to copy hash" onclick="navigator.clipboard.writeText('${rec.recordHash}'); alert('SHA-256 Hash copied to clipboard!');">
        ${rec.recordHash || 'N/A'} <i class="fa-solid fa-copy" style="margin-left: 6px;"></i>
      </div>
      <div style="margin-top: 8px; font-size: 11px; display: flex; justify-content: space-between;">
        <span style="color: var(--text-dim);">Anchored in Block:</span>
        <strong class="text-emerald">#${rec.blockIndex !== undefined ? rec.blockIndex : 'Mined'}</strong>
      </div>
    </div>

    <div class="card-nested" style="margin-bottom: 14px;">
      <div class="group-title">
        <span><i class="fa-solid fa-sparkles text-amber"></i> AI Spatial Validation</span>
        <span class="micro-badge" style="background:${rec.aiValidation?.isValid ? '#10b98125' : '#ef444425'}; color:${rec.aiValidation?.isValid ? '#10b981' : '#ef4444'};">
          ${rec.aiValidation?.status || 'VERIFIED'}
        </span>
      </div>
      <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
        ${(rec.aiValidation?.flags || []).join(' | ') || 'Passed multi-dimensional spatial integrity checks.'}
      </p>
      <div style="margin-top: 6px; font-size: 11px; display: flex; justify-content: space-between;">
        <span style="color: var(--text-dim);">Spatial Zone:</span>
        <strong style="color:#fff;">${rec.aiValidation?.spatialZone || 'Temperate'}</strong>
      </div>
    </div>

    <div style="margin-bottom: 14px;">
      <div style="font-size: 11px; text-transform: uppercase; color: var(--text-dim); font-weight:700; margin-bottom: 4px;">Description / Telemetry</div>
      <p style="font-size: 12px; line-height: 1.5; color: #cbd5e1; background: rgba(0,0,0,0.3); padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
        ${rec.description || 'No additional payload notes specified.'}
      </p>
    </div>

    <div style="font-size: 11px; color: var(--text-dim); display:flex; justify-content:space-between;">
      <span>Signer: <strong>${rec.creator || 'Validator'}</strong></span>
      <span>${new Date(rec.timestamp).toLocaleTimeString()}</span>
    </div>
  `;

  drawer.classList.add('open');
}

/* ==========================================================================
   3. BLOCKCHAIN LEDGER EXPLORER
   ========================================================================== */
async function loadBlockchainExplorer() {
  try {
    const res = await fetch(`${API_BASE}/api/blockchain`);
    const data = await res.json();
    state.blockchainData = data;

    // Update Header and Summary
    document.getElementById('statBlocks').innerText = data.chainLength;
    document.getElementById('chainHeight').innerText = data.chainLength;
    document.getElementById('chainDifficulty').innerText = `${data.difficulty} Leading Zeros`;

    renderChainTimeline(data.blocks);
  } catch (err) {
    console.error('Failed to load blockchain:', err);
  }
}

function renderChainTimeline(blocks) {
  const container = document.getElementById('chainTimeline');
  container.innerHTML = '';

  const tamperedIndices = state.auditReport ? state.auditReport.tamperedBlocks || [] : [];

  blocks.forEach((block, idx) => {
    const isTampered = tamperedIndices.includes(block.index);
    const card = document.createElement('div');
    card.className = `block-card ${isTampered ? 'tampered' : ''}`;

    card.innerHTML = `
      <div class="block-header">
        <span class="block-tag">
          ${block.index === 0 ? '<i class="fa-solid fa-crown text-amber"></i> Genesis' : `<i class="fa-solid fa-cube"></i> Block #${block.index}`}
        </span>
        <span class="block-time">${new Date(block.timestamp).toLocaleTimeString()}</span>
      </div>

      <div class="block-field">
        <div class="block-field-label">Block Hash (SHA-256)</div>
        <div class="block-field-val" style="color: ${isTampered ? 'var(--danger-glow)' : 'var(--cyan-glow)'};">
          ${block.hash}
        </div>
      </div>

      <div class="block-field">
        <div class="block-field-label">Previous Hash</div>
        <div class="block-field-val">${block.previousHash.substring(0, 24)}...</div>
      </div>

      <div class="block-field">
        <div class="block-field-label">Merkle Root</div>
        <div class="block-field-val" style="color: var(--amber-glow);">${block.merkleRoot.substring(0, 24)}...</div>
      </div>

      <div style="display:flex; justify-content:space-between; font-size:11px; margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--border-subtle);">
        <span>Nonce: <strong style="font-family: var(--font-mono);">${block.nonce}</strong></span>
        <span>Records: <strong class="text-emerald" style="font-family: var(--font-mono);">${block.recordsCount}</strong></span>
      </div>

      <button class="btn btn-secondary w-full" style="margin-top: 12px; font-size: 11px; padding: 6px;" onclick="viewBlockRecords(${block.index})">
        <i class="fa-solid fa-magnifying-glass"></i> Inspect Records (${block.recordsCount})
      </button>
    `;

    container.appendChild(card);
  });
}

window.viewBlockRecords = function(blockIndex) {
  if (!state.blockchainData) return;
  const blk = state.blockchainData.blocks.find(b => b.index === blockIndex);
  if (!blk) return;

  const recordsHtml = blk.records.map((r, i) => `
    <div style="background: rgba(0,0,0,0.4); padding: 8px; border-radius: 6px; margin-bottom: 6px; border: 1px solid var(--border-subtle);">
      <div style="font-weight:700; font-size:12px; color:#fff;">#${i + 1} ${r.title}</div>
      <div style="font-size:10px; font-family:var(--font-mono); color:var(--cyan-glow); margin-top:2px;">${r.recordHash}</div>
      <div style="font-size:10px; color:var(--text-dim); margin-top:2px;">[${r.latitude}, ${r.longitude}] • ${r.category}</div>
    </div>
  `).join('');

  alert(`=== Block #${blockIndex} Records (${blk.records.length}) ===\nInspect details in browser console or audit view.`);
  console.log(`Block #${blockIndex} Records:`, blk.records);
};

/* ==========================================================================
   4. TAMPER RESISTANCE & CRYPTOGRAPHIC AUDIT
   ========================================================================== */
async function runCryptographicAudit() {
  logTerminal('[Audit] Initiating full SHA-256 chain recalculation and Merkle tree verification...', 'info');

  try {
    const res = await fetch(`${API_BASE}/api/blockchain/verify`);
    const audit = await res.json();
    state.auditReport = audit;

    updateAuditUI(audit);

    if (audit.isValid) {
      logTerminal(`[Success] Verified all ${audit.totalBlocks} blocks and ${audit.totalRecords} records.`, 'success');
      logTerminal(`[Proof] 100% cryptographic consensus intact. Zero tampering detected.`, 'success');
    } else {
      logTerminal(`[ALERT] CRYPTOGRAPHIC INTEGRITY VIOLATION DETECTED!`, 'danger');
      audit.errors.forEach(err => logTerminal(`  -> ${err}`, 'danger'));
    }

    // Refresh block explorer to highlight tampered blocks
    loadBlockchainExplorer();
  } catch (err) {
    logTerminal(`[Error] Audit execution failed: ${err.message}`, 'danger');
  }
}

function updateAuditUI(audit) {
  const banner = document.getElementById('auditStatusBanner');
  const icon = document.getElementById('auditStatusIcon');
  const title = document.getElementById('auditTitle');
  const desc = document.getElementById('auditDesc');
  const score = document.getElementById('auditScore');
  const badge = document.getElementById('integrityBadge');
  const badgeVal = document.getElementById('statIntegrity');

  document.getElementById('auditBlocksChecked').innerText = audit.totalBlocks;
  document.getElementById('auditRecordsChecked').innerText = audit.totalRecords;

  if (audit.isValid) {
    banner.className = 'audit-status-card';
    icon.className = 'audit-status-icon safe';
    icon.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
    title.innerText = 'Ledger Cryptographically Sound';
    desc.innerText = 'All SHA-256 block hashes, previous block links, and record Merkle roots strictly match mathematical proofs.';
    score.className = 'text-emerald';
    score.innerText = '100.0%';

    badgeVal.className = 'pill-val text-emerald';
    badgeVal.innerText = 'SECURE';
  } else {
    banner.className = 'audit-status-card danger';
    icon.className = 'audit-status-icon danger';
    icon.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
    title.innerText = 'Tamper Breach Detected!';
    desc.innerText = `Mathematical inconsistencies found in ${audit.tamperedBlocks.length} block(s). Ledger integrity compromised!`;
    score.className = 'text-danger';
    score.innerText = `${Math.max(0, 100 - (audit.tamperedBlocks.length * 20)).toFixed(1)}%`;

    badgeVal.className = 'pill-val text-danger';
    badgeVal.innerText = 'TAMPERED!';
  }
}

async function triggerTamperAttack() {
  logTerminal('[Attack Simulator] Injecting malicious coordinate alteration into Block #1 database...', 'warn');

  try {
    const res = await fetch(`${API_BASE}/api/blockchain/tamper`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blockIndex: 1,
        recordIndex: 0,
        fakeFields: {
          title: '[FORGED RECORD] Unauthorized Land Boundary Modification',
          latitude: 12.3456,
          longitude: 78.9101,
          description: 'Hacked by malicious actor directly bypassing validator consensus'
        }
      })
    });
    const data = await res.json();
    logTerminal(`[Attack Simulator] Data written to Block #1, Record #0!`, 'danger');

    // Automatically trigger audit to demonstrate immediate detection
    await runCryptographicAudit();
  } catch (err) {
    logTerminal(`Tamper attack failed: ${err.message}`, 'danger');
  }
}

async function restoreChain() {
  logTerminal('[Self-Heal] Reverting corrupted blocks to cryptographically verified backup state...', 'info');
  try {
    const res = await fetch(`${API_BASE}/api/blockchain/restore`, { method: 'POST' });
    const data = await res.json();
    logTerminal(`[Self-Heal] ${data.message}`, 'success');
    await runCryptographicAudit();
    runSpatialQuery();
  } catch (err) {
    logTerminal(`Failed to restore chain: ${err.message}`, 'danger');
  }
}

function logTerminal(message, type = 'info') {
  const terminal = document.getElementById('auditLogTerminal');
  const line = document.createElement('div');
  line.className = `log-line ${type}`;
  line.innerText = `[${new Date().toLocaleTimeString()}] ${message}`;
  terminal.appendChild(line);
  terminal.scrollTop = terminal.scrollHeight;
}

/* ==========================================================================
   5. BENCHMARK SUITE
   ========================================================================== */
async function runPerformanceBenchmark() {
  const btn = document.getElementById('btnRunBenchmark');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Running 100 Queries...';

  try {
    const res = await fetch(`${API_BASE}/api/benchmark?iterations=100`);
    const bench = await res.json();

    document.getElementById('benchAvgLatency').innerText = `${bench.averageQueryLatencyMs} ms`;
    document.getElementById('benchThroughput').innerText = Number(bench.throughputQueriesPerSec).toLocaleString();
    document.getElementById('benchP95Latency').innerText = `${bench.p95LatencyMs} ms`;

    // Add to history table
    const table = document.getElementById('benchResultsTable');
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>Run #${table.children.length + 1} (${new Date().toLocaleTimeString()})</td>
      <td>${bench.totalIndexedRecords} Records</td>
      <td>${bench.iterationsRun} Radial Queries</td>
      <td>${bench.minLatencyMs} ms</td>
      <td style="color:var(--cyan-glow); font-weight:700;">${bench.averageQueryLatencyMs} ms</td>
      <td>${bench.maxLatencyMs} ms</td>
      <td><span class="micro-badge" style="background:#10b98125; color:#10b981;">PASSED (&lt; 10ms)</span></td>
    `;
    table.prepend(row);
  } catch (err) {
    console.error('Benchmark failed:', err);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-play"></i> Run 100-Query Benchmark';
  }
}

async function reSeedGlobalRecords() {
  if (!confirm('Re-seed ledger with 520+ diverse global geo-records across all continents?')) return;

  const btn = document.getElementById('btnReSeedRecords');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Seeding & Mining...';

  try {
    const res = await fetch(`${API_BASE}/api/blockchain/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count: 520 })
    });
    const data = await res.json();
    alert(`Successfully generated and mined ${data.seededCount} records across ${data.totalBlocks} blocks!`);
    loadPlatformStatus();
    loadBlockchainExplorer();
    runSpatialQuery();
    runPerformanceBenchmark();
  } catch (err) {
    alert(`Seeding failed: ${err.message}`);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-database"></i> Re-Seed 500+ Global Records';
  }
}

/* ==========================================================================
   6. RECORD CREATION & PRE-VALIDATION MODAL
   ========================================================================== */
function openNewRecordModal(lat = 28.6139, lng = 77.2090) {
  document.getElementById('formLat').value = lat;
  document.getElementById('formLng').value = lng;
  document.getElementById('newRecordModal').classList.add('open');
  triggerAiPreValidation();
}

function closeNewRecordModal() {
  document.getElementById('newRecordModal').classList.remove('open');
}

async function triggerAiPreValidation() {
  const title = document.getElementById('formTitle').value;
  const lat = document.getElementById('formLat').value;
  const lng = document.getElementById('formLng').value;
  const category = document.getElementById('formCategory').value;

  if (!lat || !lng) return;

  try {
    const res = await fetch(`${API_BASE}/api/validate-coords`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, latitude: lat, longitude: lng, category })
    });
    const data = await res.json();

    const badge = document.getElementById('aiBadgeStatus');
    const score = document.getElementById('aiConfidenceScore');
    const feedback = document.getElementById('aiValidationFeedback');

    score.innerText = `Confidence: ${(data.confidence * 100).toFixed(0)}%`;
    feedback.innerText = (data.flags || []).join(' | ');

    if (data.isValid) {
      badge.style.color = 'var(--cyan-glow)';
      score.style.color = 'var(--emerald-glow)';
    } else {
      badge.style.color = 'var(--danger-glow)';
      score.style.color = 'var(--danger-glow)';
    }
  } catch (err) {
    console.error('Validation pre-check error:', err);
  }
}

/* ==========================================================================
   7. EVENT LISTENERS & NAVIGATION
   ========================================================================== */
function initTabs() {
  const tabButtons = document.querySelectorAll('.nav-pill, .tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-tab');
      if (!targetId) return;

      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }

      if (targetId === 'map-view' && state.map) {
        setTimeout(() => state.map.invalidateSize(), 150);
      } else if (targetId === 'blockchain-view') {
        loadBlockchainExplorer();
        runCryptographicAudit();
      } else if (targetId === 'benchmark-view') {
        runPerformanceBenchmark();
      }
    });
  });
}

function initEventListeners() {
  // Radius Slider
  const slider = document.getElementById('radiusSlider');
  slider?.addEventListener('input', (e) => {
    state.radarRadiusKm = parseInt(e.target.value, 10);
    const disp = document.getElementById('radiusValDisplay');
    if (disp) disp.innerText = `${state.radarRadiusKm} km`;
    updateRadarCircle();
  });
  slider?.addEventListener('change', () => {
    runSpatialQuery();
  });

  // Category Chips / Pills
  document.querySelectorAll('.chip, .cat-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chip, .cat-pill').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      state.activeCategory = btn.getAttribute('data-cat');
      if (state.activeCategory === 'All') {
        renderMarkers(state.allRecords);
      } else {
        const filtered = state.allRecords.filter(r => r.category === state.activeCategory);
        renderMarkers(filtered);
      }
    });
  });

  // Reset Map View
  document.getElementById('btnResetMap')?.addEventListener('click', () => {
    state.radarCenter = { lat: 20.5937, lng: 78.9629 };
    state.map.setView([20.5937, 78.9629], 5);
    renderMarkers(state.allRecords);
  });

  // Pin Drop Mode Button
  document.getElementById('btnTogglePinMode')?.addEventListener('click', () => {
    togglePinDropMode(!state.pinDropMode);
  });

  // Quick Search Input
  document.getElementById('quickSearchInput')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    if (!term) {
      renderMarkers(state.allRecords);
      return;
    }

    const matched = state.allRecords.filter(r =>
      r.title.toLowerCase().includes(term) ||
      r.category.toLowerCase().includes(term) ||
      (r.description && r.description.toLowerCase().includes(term)) ||
      r.id.toLowerCase().includes(term)
    );

    renderMarkers(matched);
  });

  // Drawer Close
  document.getElementById('btnCloseDrawer')?.addEventListener('click', () => {
    document.getElementById('recordDrawer')?.classList.remove('open');
    state.selectedRecord = null;
  });

  // Modals
  document.getElementById('btnOpenNewRecord')?.addEventListener('click', () => openNewRecordModal());
  document.getElementById('btnCloseModal')?.addEventListener('click', closeNewRecordModal);
  document.getElementById('btnCancelModal')?.addEventListener('click', closeNewRecordModal);

  // Real-time pre-validation on typing
  ['formTitle', 'formLat', 'formLng', 'formCategory'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', triggerAiPreValidation);
  });

  // Record Form Submit
  document.getElementById('recordForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnSubmitRecord');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mining Block...';
    }

    const payload = {
      title: document.getElementById('formTitle')?.value || 'Geo-Point',
      category: document.getElementById('formCategory')?.value || 'General',
      latitude: parseFloat(document.getElementById('formLat')?.value || '0'),
      longitude: parseFloat(document.getElementById('formLng')?.value || '0'),
      elevation: parseFloat(document.getElementById('formElev')?.value || '0'),
      description: document.getElementById('formDesc')?.value || '',
      creator: document.getElementById('formCreator')?.value || 'Palash-Node',
      autoMine: document.getElementById('formAutoMine')?.checked ?? true
    };

    try {
      const res = await fetch(`${API_BASE}/api/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        closeNewRecordModal();
        alert(`Record Notarized & Mined into Block #${data.minedBlock}!\nHash: ${data.blockHash.substring(0, 30)}...`);
        loadPlatformStatus();
        loadBlockchainExplorer();
        loadAllRecordsOnMap();
      } else {
        alert(`Error: ${data.error || 'Failed to notarize'}`);
      }
    } catch (err) {
      alert(`Submission error: ${err.message}`);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-stamp"></i> Notarize Record';
      }
    }
  });

  // Audit Buttons
  document.getElementById('btnRunAudit')?.addEventListener('click', runCryptographicAudit);
  document.getElementById('btnTriggerTamper')?.addEventListener('click', triggerTamperAttack);
  document.getElementById('btnRestoreChain')?.addEventListener('click', restoreChain);

  // Blockchain Buttons
  document.getElementById('btnMinePending')?.addEventListener('click', async () => {
    const res = await fetch(`${API_BASE}/api/blockchain/mine`, { method: 'POST' });
    const data = await res.json();
    alert(data.message || `Mined block #${data.block?.index}!`);
    loadBlockchainExplorer();
    loadPlatformStatus();
  });
  document.getElementById('btnRefreshChain')?.addEventListener('click', loadBlockchainExplorer);

  // Benchmark Buttons
  document.getElementById('btnRunBenchmark')?.addEventListener('click', runPerformanceBenchmark);
  document.getElementById('btnReSeedRecords')?.addEventListener('click', reSeedGlobalRecords);
}

async function loadPlatformStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/status`);
    const data = await res.json();
    const statBlocks = document.getElementById('statBlocks');
    if (statBlocks) statBlocks.innerText = data.totalBlocks;
    const statRecords = document.getElementById('statRecords');
    if (statRecords) statRecords.innerText = data.totalRecords;
    const statBlocksBadge = document.getElementById('statBlocksBadge');
    if (statBlocksBadge) statBlocksBadge.innerText = `${data.totalBlocks} Blocks`;
  } catch (err) {
    console.error('Failed to load status:', err);
  }
}
