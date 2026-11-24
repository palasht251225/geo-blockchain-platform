import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export function sha256(data) {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(content).digest('hex');
}

export function calculateMerkleRoot(records) {
  if (!records || records.length === 0) {
    return sha256('EMPTY_BLOCK');
  }

  let hashes = records.map(r => r.recordHash || sha256(r));

  while (hashes.length > 1) {
    if (hashes.length % 2 !== 0) {
      hashes.push(hashes[hashes.length - 1]);
    }
    const nextLevel = [];
    for (let i = 0; i < hashes.length; i += 2) {
      nextLevel.push(sha256(hashes[i] + hashes[i + 1]));
    }
    hashes = nextLevel;
  }

  return hashes[0];
}

export class GeoRecord {
  constructor({ id, title, category, latitude, longitude, elevation = 0, description = '', creator = 'system', metadata = {}, aiValidation = null, timestamp = null }) {
    this.id = id || `REC-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    this.title = title;
    this.category = category || 'General';
    this.latitude = parseFloat(latitude);
    this.longitude = parseFloat(longitude);
    this.elevation = parseFloat(elevation);
    this.description = description;
    this.creator = creator;
    this.metadata = metadata;
    this.aiValidation = aiValidation || { isValid: true, confidence: 0.98, status: 'Verified' };
    this.timestamp = timestamp || new Date().toISOString();
    this.recordHash = this.computeHash();
  }

  computeHash() {
    const raw = `${this.id}|${this.title}|${this.latitude.toFixed(6)}|${this.longitude.toFixed(6)}|${this.timestamp}|${this.creator}|${JSON.stringify(this.metadata)}`;
    return sha256(raw);
  }
}

export class Block {
  constructor(index, timestamp, records, previousHash = '', nonce = 0, hash = null) {
    this.index = index;
    this.timestamp = timestamp;
    this.records = records;
    this.previousHash = previousHash;
    this.merkleRoot = calculateMerkleRoot(records);
    this.nonce = nonce;
    this.hash = hash || this.calculateHash();
  }

  calculateHash() {
    return sha256(
      this.index +
      this.previousHash +
      this.timestamp +
      this.merkleRoot +
      this.nonce
    );
  }

  mineBlock(difficulty = 2) {
    const target = Array(difficulty + 1).join('0');
    const start = performance.now();
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    const elapsed = (performance.now() - start).toFixed(2);
    return { hash: this.hash, nonce: this.nonce, elapsedMs: parseFloat(elapsed) };
  }
}

export class Blockchain {
  constructor(storagePath = null) {
    this.storagePath = storagePath;
    this.difficulty = 2; // Fast proof-of-work for responsive demo
    this.chain = [];
    this.pendingRecords = [];
    this.backupChain = null;

    if (this.storagePath && fs.existsSync(this.storagePath)) {
      this.loadFromFile();
    } else {
      this.chain = [this.createGenesisBlock()];
      if (this.storagePath) this.saveToFile();
    }
  }

  createGenesisBlock() {
    const genesisRecord = new GeoRecord({
      id: 'GENESIS-001',
      title: 'Genesis Geo-Tag: Zero Meridian & Prime Datum',
      category: 'System',
      latitude: 51.4769,
      longitude: 0.0005,
      description: 'Royal Observatory, Greenwich - Origin of Global Reference Coordinates',
      creator: 'Genesis Protocol',
      metadata: { network: 'GeoLedger-MainNet-1', version: '1.0' },
      aiValidation: { isValid: true, confidence: 1.0, status: 'Genesis Verified' }
    });

    const genesisBlock = new Block(0, new Date('2024-01-01T00:00:00.000Z').toISOString(), [genesisRecord], '0'.repeat(64));
    genesisBlock.mineBlock(this.difficulty);
    return genesisBlock;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addRecord(record) {
    if (!(record instanceof GeoRecord)) {
      record = new GeoRecord(record);
    }
    this.pendingRecords.push(record);
    return record;
  }

  minePendingRecords(minerAddress = 'Node-01-Validator') {
    if (this.pendingRecords.length === 0) {
      return null;
    }

    const newBlock = new Block(
      this.chain.length,
      new Date().toISOString(),
      [...this.pendingRecords],
      this.getLatestBlock().hash
    );

    const mineStats = newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
    this.pendingRecords = [];

    if (this.storagePath) {
      this.saveToFile();
    }

    return {
      block: newBlock,
      mineStats
    };
  }

  isChainValid() {
    const auditReport = {
      isValid: true,
      totalBlocks: this.chain.length,
      totalRecords: this.getAllRecords().length,
      errors: [],
      tamperedBlocks: []
    };

    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // 1. Check previous block hash linkage
      if (currentBlock.previousHash !== previousBlock.hash) {
        auditReport.isValid = false;
        auditReport.errors.push(`Broken chain linkage at Block #${currentBlock.index}: previousHash [${currentBlock.previousHash.slice(0, 10)}...] != Block #${previousBlock.index} hash [${previousBlock.hash.slice(0, 10)}...]`);
        auditReport.tamperedBlocks.push(currentBlock.index);
      }

      // 2. Check block hash integrity
      const recalculatedHash = currentBlock.calculateHash();
      if (currentBlock.hash !== recalculatedHash) {
        auditReport.isValid = false;
        auditReport.errors.push(`Hash mismatch at Block #${currentBlock.index}: stored hash [${currentBlock.hash.slice(0, 10)}...] != computed hash [${recalculatedHash.slice(0, 10)}...]`);
        if (!auditReport.tamperedBlocks.includes(currentBlock.index)) {
          auditReport.tamperedBlocks.push(currentBlock.index);
        }
      }

      // 3. Check Merkle root integrity
      const recalculatedMerkle = calculateMerkleRoot(currentBlock.records);
      if (currentBlock.merkleRoot !== recalculatedMerkle) {
        auditReport.isValid = false;
        auditReport.errors.push(`Merkle Root tampering detected at Block #${currentBlock.index}: stored Merkle [${currentBlock.merkleRoot.slice(0, 10)}...] != computed Merkle [${recalculatedMerkle.slice(0, 10)}...]`);
        if (!auditReport.tamperedBlocks.includes(currentBlock.index)) {
          auditReport.tamperedBlocks.push(currentBlock.index);
        }
      }

      // 4. Check individual record SHA-256 hashes
      for (let r = 0; r < currentBlock.records.length; r++) {
        const rec = currentBlock.records[r];
        const instantiated = rec instanceof GeoRecord ? rec : new GeoRecord(rec);
        const expectedHash = instantiated.computeHash();
        if (rec.recordHash !== expectedHash) {
          auditReport.isValid = false;
          auditReport.errors.push(`Data modification in Block #${currentBlock.index}, Record #${r} (${rec.title}): recordHash tampered!`);
          if (!auditReport.tamperedBlocks.includes(currentBlock.index)) {
            auditReport.tamperedBlocks.push(currentBlock.index);
          }
        }
      }
    }

    return auditReport;
  }

  tamperRecord(blockIndex, recordIndex, fakeFields) {
    if (blockIndex <= 0 || blockIndex >= this.chain.length) {
      throw new Error(`Invalid block index ${blockIndex}. Genesis block cannot be tampered.`);
    }

    const block = this.chain[blockIndex];
    if (recordIndex < 0 || recordIndex >= block.records.length) {
      throw new Error(`Invalid record index ${recordIndex}`);
    }

    // Save backup if not already saved
    if (!this.backupChain) {
      this.backupChain = JSON.stringify(this.chain);
    }

    const record = block.records[recordIndex];
    Object.assign(record, fakeFields);
    // Notice: we do NOT update record.recordHash, block.merkleRoot, or block.hash, mimicking an attacker modifying the database directly!
    return {
      message: `Simulated tamper attack executed on Block #${blockIndex}, Record #${recordIndex}`,
      tamperedRecord: record
    };
  }

  restoreChain() {
    if (this.backupChain) {
      this.chain = JSON.parse(this.backupChain).map(b => {
        const blk = new Block(b.index, b.timestamp, b.records.map(r => new GeoRecord(r)), b.previousHash, b.nonce, b.hash);
        blk.merkleRoot = b.merkleRoot;
        return blk;
      });
      this.backupChain = null;
      if (this.storagePath) this.saveToFile();
      return { restored: true, message: 'Ledger restored to cryptographically verified state' };
    }
    return { restored: false, message: 'No backup found or chain already intact' };
  }

  getAllRecords() {
    const records = [];
    for (const block of this.chain) {
      for (const rec of block.records) {
        records.push({
          ...rec,
          blockIndex: block.index,
          blockHash: block.hash,
          confirmedAt: block.timestamp
        });
      }
    }
    return records;
  }

  saveToFile() {
    if (!this.storagePath) return;
    try {
      const data = JSON.stringify(this.chain, null, 2);
      fs.writeFileSync(this.storagePath, data, 'utf-8');
    } catch (e) {
      console.error('Failed to save blockchain:', e.message);
    }
  }

  loadFromFile() {
    try {
      const raw = fs.readFileSync(this.storagePath, 'utf-8');
      const parsed = JSON.parse(raw);
      this.chain = parsed.map(b => {
        const records = (b.records || []).map(r => new GeoRecord(r));
        const block = new Block(b.index, b.timestamp, records, b.previousHash, b.nonce, b.hash);
        block.merkleRoot = b.merkleRoot;
        return block;
      });
    } catch (e) {
      console.warn('Could not load ledger from file, initializing fresh:', e.message);
      this.chain = [this.createGenesisBlock()];
    }
  }
}
