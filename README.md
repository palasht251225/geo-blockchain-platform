# GeoLedger — Blockchain-Based Geo-Tagging Platform

> **Engineered by [Palash Tripathi](https://github.com/palasht251225)**  
> *B.Tech Computer Science & Engineering (AI/ML) — Galgotias College of Engineering & Technology*  
> LinkedIn: [palash-tripathi](https://www.linkedin.com/in/palash-tripathi-b4305627a) • Email: [Palashtripathi25@gmail.com](mailto:Palashtripathi25@gmail.com)  
> 
> 🌐 **Live Production Deployment**: [https://geo-blockchain-platform.vercel.app/](https://geo-blockchain-platform.vercel.app/)  
> 📦 **GitHub Repository**: [https://github.com/palasht251225/geo-blockchain-platform](https://github.com/palasht251225/geo-blockchain-platform)

---

## 📌 Executive Summary

Traditional GIS and spatial database architectures (PostGIS, GeoJSON stores, central SQL tables) are vulnerable to unauthorized record modification, coordinate forgery, and retrospective tampering. In sectors such as land cadastral deeds, municipal rights-of-way, environmental monitoring stations, and multimodal supply-chain waypoints, proving that a recorded geographic coordinate has not been secretly shifted is paramount.

**GeoLedger** is a decentralized, tamper-evident spatial data platform combining:
1. **Cryptographic Distributed Ledger**: SHA-256 block-chaining, Merkle tree record aggregation, and proof-of-work consensus.
2. **AI-Assisted Spatial Validation Pipeline**: Boundary sanity verification, kinematic teleportation anomaly detection, and semantic zone tagging.
3. **Sub-Second Spatial Query Engine**: In-memory spatial grid index delivering radial and bounding-box queries in **< 1.0 ms** across 500+ records.
4. **Interactive Geospatial Web Client**: Built with Leaflet, official Survey of India boundary integration, real-time proximity radar, and a live tamper attack simulation chamber.

---

## 🏗️ System Architecture

```
                          ┌────────────────────────────┐
                          │   Leaflet Map & Web Client │
                          │  (Proximity Radar, Marker  │
                          │   Clustering & Audit Chamber│
                          └─────────────┬──────────────┘
                                        │ HTTP REST API
                                        ▼
                          ┌────────────────────────────┐
                          │     Node.js Core Server    │
                          │   (Sub-millisecond Router) │
                          └──────┬───────────────┬─────┘
                                 │               │
             ┌───────────────────▼──┐         ┌──▼───────────────────┐
             │ AI Spatial Validator │         │ Spatial Query Engine │
             │  • Bounds Check      │         │  • 0.5° Grid Buckets │
             │  • Semantic Match    │         │  • Haversine Radar   │
             │  • Kinematic Anomaly │         │  • Sub-ms Latencies  │
             └───────────────────┬──┘         └──┬───────────────────┘
                                 │               │
                                 ▼               ▼
                          ┌────────────────────────────┐
                          │    Cryptographic Ledger    │
                          │  • SHA-256 Block Chaining  │
                          │  • Merkle Tree Aggregation │
                          │  • Proof-of-Work Mining    │
                          │  • Live Tamper Detection   │
                          └────────────────────────────┘
```

---

## ⚡ Core Technical Features

### 1. Immutable Distributed Ledger (`blockchain.js`)
- **Block Hashing**: Each block contains `index`, `timestamp`, `records[]`, `previousHash`, `merkleRoot`, and `nonce`.
- **Merkle Roots**: Records are aggregated into a binary Merkle tree. Modifying 1 byte of latitude or metadata invalidates the Merkle root.
- **Proof-of-Work**: Configurable mining difficulty (2 leading hex zeros) providing interactive consensus simulation.
- **Tamper Simulation & Audit**: A dedicated audit engine recalculates all hashes across the entire chain. If an attacker directly alters a record in memory or storage, the platform flags the exact compromised block and severs subsequent block trust.

### 2. AI-Assisted Spatial Validation (`spatialValidator.js`)
- **Bounds Checking**: Validates latitude $\in [-90, +90]$ and longitude $\in [-180, +180]$, rejecting placeholder coordinates like Null Island $(0,0)$.
- **Semantic Cross-Checking**: Compares record text (e.g. "Delhi Metro") against known geographic bounding boxes to flag location-content mismatches.
- **Kinematic Anomaly Detection**: Rejects impossible velocity jumps (> 1,200 km/h) between successive readings from the same sensor node.

### 3. High-Speed Spatial Query Engine (`spatialEngine.js`)
- **Grid-Based Bucket Indexing**: Divides the globe into $0.5^\circ \times 0.5^\circ$ spatial buckets ($\sim 55\text{ km}$ cells).
- **Radial Search**: Computes candidate buckets via bounding offsets and applies the Haversine formula to candidate records only.
- **Performance**:
  - **Average Query Latency**: `~0.24 ms`
  - **P95 Latency**: `~0.92 ms`
  - **Throughput**: `> 4,000 queries/second`
  - **Benchmark Validation**: Exceeds the sub-second target by over **1,000x**.

### 4. Interactive Map & Modern UI (`public/`)
- **Survey of India Sovereign Boundary**: Includes complete, unfragmented borders for Jammu & Kashmir, Ladakh, and Arunachal Pradesh.
- **Marker Clustering**: Automatically groups dense regional clusters and expands smoothly on zoom.
- **Live Proximity Radar**: Moveable radar center and adjustable radius slider ($20\text{ km} - 1,500\text{ km}$) with live latency benchmarking.
- **Audit Chamber**: 1-click "Simulate Tamper Attack" and "Self-Heal Ledger" demonstrating cryptographic resilience.

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js (v18.0 or higher)
- No external npm packages required (built with zero dependencies for speed and portability).

### Running Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/palasht251225/geo-blockchain-platform.git
   cd geo-blockchain-platform
   ```

2. **Start the server**:
   ```bash
   node server.js
   ```

3. **Open the application**:
   Navigate to [http://localhost:4040](http://localhost:4040) in any modern web browser.

---

## 📊 Benchmark Results

| Metric | Measured Value | Target | Status |
| :--- | :--- | :--- | :--- |
| **Indexed Records** | 521 live records | 500+ records | ✅ Passed |
| **Average Query Latency** | **0.244 ms** | < 1,000 ms (Sub-second) | 🚀 4,000x Faster |
| **P95 Tail Latency** | **0.924 ms** | < 2,000 ms | ✅ Passed |
| **Tamper Detection Overhead** | **0.12 ms / block** | Real-time | ✅ Passed |
| **Consensus Verification** | **100% Cryptographic** | Zero false negatives | ✅ Passed |

---

## 🛠️ REST API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/status` | `GET` | Platform network status, total blocks, and chain integrity. |
| `/api/records` | `GET` | Fetch all indexed geo-records. |
| `/api/records` | `POST` | Create, validate, and notarize a new geo-tagged record. |
| `/api/records/search` | `GET` | Spatial radial query (`lat`, `lng`, `radiusKm`, `category`). |
| `/api/blockchain` | `GET` | Full blockchain explorer with hashes and Merkle roots. |
| `/api/blockchain/verify` | `GET` | Executes full cryptographic chain and Merkle audit. |
| `/api/blockchain/tamper` | `POST` | Simulates unauthorized database alteration for audit demo. |
| `/api/blockchain/restore`| `POST` | Self-heals ledger to cryptographically verified backup. |
| `/api/benchmark` | `GET` | Runs 100-query latency test and returns benchmark metrics. |

---

## 👨‍💻 Author

**Palash Tripathi**  
- **GitHub**: [@palasht251225](https://github.com/palasht251225)  
- **LinkedIn**: [palash-tripathi-b4305627a](https://www.linkedin.com/in/palash-tripathi-b4305627a)  
- **Email**: [Palashtripathi25@gmail.com](mailto:Palashtripathi25@gmail.com)  

*Built with precision, cryptographic rigor, and passion.*
