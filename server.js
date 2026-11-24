import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Blockchain, GeoRecord } from './blockchain.js';
import { performAiValidation, validateCoordinates } from './spatialValidator.js';
import { SpatialQueryEngine } from './spatialEngine.js';
import { generateSeedRecords } from './seedGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 4040;
const STORAGE_FILE = path.join(__dirname, 'ledger.json');

// Initialize Core Engines
const blockchain = new Blockchain(STORAGE_FILE);
const spatialEngine = new SpatialQueryEngine();

// If blockchain only has genesis block, automatically seed 520 records so user immediately sees a populated system
function initializePlatform() {
  const allRecords = blockchain.getAllRecords();
  if (allRecords.length <= 1) {
    console.log('[System] Seeding 520 geo-tagged records across global hubs...');
    const seedRecords = generateSeedRecords(520);
    // Batch into blocks of 20 records each
    const chunkSize = 20;
    for (let i = 0; i < seedRecords.length; i += chunkSize) {
      const chunk = seedRecords.slice(i, i + chunkSize);
      for (const rec of chunk) {
        blockchain.addRecord(rec);
      }
      blockchain.minePendingRecords(`Genesis-Seed-Miner-${Math.floor(i / chunkSize) + 1}`);
    }
    console.log(`[System] Initialized with ${blockchain.chain.length} blocks and ${blockchain.getAllRecords().length} records.`);
  }

  // Build spatial search index
  spatialEngine.rebuildIndex(blockchain.getAllRecords());
  console.log(`[Spatial Engine] Indexed ${spatialEngine.recordsMap.size} records in spatial grid.`);
}

initializePlatform();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function sendJson(res, data, statusCode = 200) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 5 * 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', reject);
  });
}

export async function requestHandler(req, res) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  try {
    // API ROUTES
    if (pathname.startsWith('/api/')) {
      // 1. Platform Status
      if (pathname === '/api/status' && req.method === 'GET') {
        const audit = blockchain.isChainValid();
        return sendJson(res, {
          status: 'ONLINE',
          network: 'GeoLedger-MainNet',
          totalBlocks: blockchain.chain.length,
          totalRecords: blockchain.getAllRecords().length,
          pendingRecords: blockchain.pendingRecords.length,
          difficulty: blockchain.difficulty,
          integrityValid: audit.isValid,
          latestBlockHash: blockchain.getLatestBlock().hash
        });
      }

      // 2. Spatial Radius Search (Sub-Second Query Engine)
      if (pathname === '/api/records/search' && req.method === 'GET') {
        const lat = parseFloat(parsedUrl.searchParams.get('lat') || '28.6139');
        const lng = parseFloat(parsedUrl.searchParams.get('lng') || '77.2090');
        const radiusKm = parseFloat(parsedUrl.searchParams.get('radiusKm') || '100');
        const category = parsedUrl.searchParams.get('category') || null;

        const result = spatialEngine.queryRadius(lat, lng, radiusKm, category);
        return sendJson(res, result);
      }

      // 3. Get All Records
      if (pathname === '/api/records' && req.method === 'GET') {
        const limit = parseInt(parsedUrl.searchParams.get('limit') || '1000', 10);
        const all = blockchain.getAllRecords();
        return sendJson(res, {
          total: all.length,
          limit,
          records: all.slice(0, limit)
        });
      }

      // 4. Create & Notarize New Geo-Tagged Record
      if (pathname === '/api/records' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const { title, category, latitude, longitude, elevation, description, creator, metadata, autoMine } = body;

        if (!title || latitude === undefined || longitude === undefined) {
          return sendJson(res, { error: 'title, latitude, and longitude are required' }, 400);
        }

        // Run AI-assisted validation pipeline
        const aiValidation = performAiValidation({
          title,
          description,
          category,
          latitude,
          longitude,
          elevation: elevation || 0
        });

        const record = new GeoRecord({
          title,
          category,
          latitude,
          longitude,
          elevation: elevation || 0,
          description,
          creator: creator || 'User-Terminal',
          metadata: metadata || {},
          aiValidation
        });

        blockchain.addRecord(record);
        spatialEngine.indexRecord(record);

        let miningResult = null;
        if (autoMine !== false) {
          miningResult = blockchain.minePendingRecords('Local-Node-Validator');
        }

        return sendJson(res, {
          success: true,
          record,
          aiValidation,
          minedBlock: miningResult ? miningResult.block.index : null,
          blockHash: miningResult ? miningResult.block.hash : 'Pending next block',
          mineStats: miningResult ? miningResult.mineStats : null
        }, 201);
      }

      // 5. Blockchain Explorer & Blocks List
      if (pathname === '/api/blockchain' && req.method === 'GET') {
        return sendJson(res, {
          difficulty: blockchain.difficulty,
          chainLength: blockchain.chain.length,
          blocks: blockchain.chain.map(b => ({
            index: b.index,
            timestamp: b.timestamp,
            previousHash: b.previousHash,
            hash: b.hash,
            merkleRoot: b.merkleRoot,
            nonce: b.nonce,
            recordsCount: b.records.length,
            records: b.records
          }))
        });
      }

      // 6. Cryptographic Audit / Verify Integrity
      if (pathname === '/api/blockchain/verify' && req.method === 'GET') {
        const audit = blockchain.isChainValid();
        return sendJson(res, audit);
      }

      // 7. Manual Mine Pending
      if (pathname === '/api/blockchain/mine' && req.method === 'POST') {
        const result = blockchain.minePendingRecords('Manual-Trigger-Miner');
        if (!result) {
          return sendJson(res, { message: 'No pending records to mine' }, 200);
        }
        spatialEngine.rebuildIndex(blockchain.getAllRecords());
        return sendJson(res, result);
      }

      // 8. Simulate Tamper Attack (Audit Demonstration)
      if (pathname === '/api/blockchain/tamper' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const blockIndex = body.blockIndex || 1;
        const recordIndex = body.recordIndex || 0;
        const fakeFields = body.fakeFields || {
          title: '[TAMPERED BY ATTACKER] Forged Municipal Boundary Deed',
          latitude: 9.9999,
          longitude: 9.9999,
          description: 'Malicious modification injected directly into memory/database'
        };

        const result = blockchain.tamperRecord(blockIndex, recordIndex, fakeFields);
        const auditAfterTamper = blockchain.isChainValid();
        return sendJson(res, {
          ...result,
          immediateAudit: auditAfterTamper
        });
      }

      // 9. Restore Chain after Tamper Demonstration
      if (pathname === '/api/blockchain/restore' && req.method === 'POST') {
        const result = blockchain.restoreChain();
        spatialEngine.rebuildIndex(blockchain.getAllRecords());
        const audit = blockchain.isChainValid();
        return sendJson(res, { ...result, audit });
      }

      // 10. Seed 500+ Records
      if (pathname === '/api/blockchain/seed' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const count = body.count || 520;
        const seedRecords = generateSeedRecords(count);

        const chunkSize = 25;
        let minedBlocks = 0;
        for (let i = 0; i < seedRecords.length; i += chunkSize) {
          const chunk = seedRecords.slice(i, i + chunkSize);
          for (const rec of chunk) {
            blockchain.addRecord(rec);
          }
          blockchain.minePendingRecords(`Batch-Miner-${minedBlocks + 1}`);
          minedBlocks++;
        }

        spatialEngine.rebuildIndex(blockchain.getAllRecords());
        const benchmark = spatialEngine.runBenchmark(100);

        return sendJson(res, {
          success: true,
          seededCount: seedRecords.length,
          totalRecords: blockchain.getAllRecords().length,
          totalBlocks: blockchain.chain.length,
          benchmark
        });
      }

      // 11. Run Benchmark Engine
      if (pathname === '/api/benchmark' && req.method === 'GET') {
        const iterations = parseInt(parsedUrl.searchParams.get('iterations') || '100', 10);
        const benchmark = spatialEngine.runBenchmark(iterations);
        return sendJson(res, benchmark);
      }

      // 12. Real-time Coordinate Pre-validation
      if (pathname === '/api/validate-coords' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const validation = performAiValidation(body);
        return sendJson(res, validation);
      }

      return sendJson(res, { error: 'API endpoint not found' }, 404);
    }

    // STATIC FILE SERVING
    let filePath = path.join(__dirname, 'public', pathname === '/' ? 'index.html' : pathname);

    // Prevent directory traversal
    if (!filePath.startsWith(path.join(__dirname, 'public'))) {
      res.writeHead(403);
      return res.end('Access Denied');
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(__dirname, 'public', 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (error) {
    console.error('Request processing error:', error);
    sendJson(res, { error: error.message }, 500);
  }
}

const server = http.createServer(requestHandler);

if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` Blockchain-Based Geo-Tagging Platform running!`);
    console.log(` Local URL: http://localhost:${PORT}`);
    console.log(`=======================================================`);
  });
}

export default requestHandler;
