import { GeoRecord } from './blockchain.js';
import { performAiValidation } from './spatialValidator.js';

const SEED_HUBS = [
  // India Metropolitan & Regional Hubs (Heavy density)
  { city: 'New Delhi / NCR', lat: 28.6139, lng: 77.2090, region: 'India' },
  { city: 'Mumbai Financial Hub', lat: 19.0760, lng: 72.8777, region: 'India' },
  { city: 'Bengaluru Tech Corridor', lat: 12.9716, lng: 77.5946, region: 'India' },
  { city: 'Hyderabad Cyberabad', lat: 17.3850, lng: 78.4867, region: 'India' },
  { city: 'Kolkata East Hub', lat: 22.5726, lng: 88.3639, region: 'India' },
  { city: 'Chennai Coast Corridor', lat: 13.0827, lng: 80.2707, region: 'India' },
  { city: 'Pune Industrial Belt', lat: 18.5204, lng: 73.8567, region: 'India' },
  { city: 'Ahmedabad Logistics Hub', lat: 23.0225, lng: 72.5714, region: 'India' },
  { city: 'Jaipur Heritage Zone', lat: 26.9124, lng: 75.7873, region: 'India' },
  { city: 'Varanasi Smart Corridor', lat: 25.3176, lng: 82.9739, region: 'India' },
  { city: 'Kochi Marine Port', lat: 9.9312, lng: 76.2673, region: 'India' },
  { city: 'Chandigarh Agri Grid', lat: 30.7333, lng: 76.7794, region: 'India' },

  // Global Key Hubs
  { city: 'London', lat: 51.5074, lng: -0.1278, region: 'Europe' },
  { city: 'Paris', lat: 48.8566, lng: 2.3522, region: 'Europe' },
  { city: 'Berlin', lat: 52.5200, lng: 13.4050, region: 'Europe' },
  { city: 'Zurich', lat: 47.3769, lng: 8.5417, region: 'Europe' },
  { city: 'San Francisco', lat: 37.7749, lng: -122.4194, region: 'North America' },
  { city: 'New York', lat: 40.7128, lng: -74.0060, region: 'North America' },
  { city: 'Tokyo', lat: 35.6762, lng: 139.6503, region: 'East Asia' },
  { city: 'Singapore', lat: 1.3521, lng: 103.8198, region: 'SE Asia' },
  { city: 'Dubai', lat: 25.2048, lng: 55.2708, region: 'Middle East' },
  { city: 'Sydney', lat: -33.8688, lng: 151.2093, region: 'Oceania' }
];

const CATEGORIES = [
  {
    name: 'Environmental Sensor',
    prefixes: ['Air Quality Monitor', 'Hydrological Station', 'Canopy Density Sensor', 'Seismic Micro-Array', 'Soil Salinity Probe'],
    descriptions: ['Real-time telemetry measuring PM2.5, NO2 and micro-climatic variance.', 'Continuous acoustic and hydraulic water flow telemetry.', 'Soil moisture and nutrient saturation sensors for precision forestry.']
  },
  {
    name: 'Land Registry',
    prefixes: ['Cadastral Parcel #', 'Municipal Boundary Deed', 'Agricultural Conservation Deed', 'Commercial Zone Title', 'Urban Development Parcel'],
    descriptions: ['Cryptographically notarized spatial land tenure deed verified by municipal GIS.', 'Registered easement and public utility right-of-way easement polygon.', 'Protected agro-forestry conservation perimeter boundary.']
  },
  {
    name: 'Supply Chain & Logistics',
    prefixes: ['Intermodal Freight Hub', 'Cold-Chain Pharma Depot', 'Customs Clearance Waypoint', 'Maritime Container Terminal', 'Automated Sortation Gate'],
    descriptions: ['Tamper-evident cargo checkpoint with calibrated GPS tracking and seal inspection.', 'Temperature-controlled pharmaceutical transit station with cold-chain provenance.', 'High-throughput multimodal shipping container exchange beacon.']
  },
  {
    name: 'Critical Infrastructure',
    prefixes: ['High-Voltage Substation', 'Solar Generation Grid Inverter', 'Telecom Fiber Repeater', 'Municipal Water Treatment Reservoir', 'Emergency Dispatch Transmitter'],
    descriptions: ['Supervised SCADA remote telemetry node with sub-meter geo-anchor.', 'Distributed renewable energy injection facility with verifiable grid coordinates.', 'Fiber optic main backhaul junction box monitored for unauthorized perimeter breaches.']
  },
  {
    name: 'Cultural Heritage',
    prefixes: ['Monuments Protection Zone', 'Archaeological Excavation Sector', 'Historic Citadel Perimeter', 'Paleontological Dig Site', 'Heritage Sanctuary Gate'],
    descriptions: ['UNESCO protected heritage perimeter benchmarked to prevent illegal encroachment.', 'Geo-demarcated archaeological trench with layer-stratigraphy coordinate logging.', 'Conservation buffer zone for ancient cultural masonry and artifacts.']
  }
];

export function generateSeedRecords(targetCount = 520) {
  const records = [];
  const now = Date.now();

  for (let i = 1; i <= targetCount; i++) {
    const hub = SEED_HUBS[i % SEED_HUBS.length];
    const cat = CATEGORIES[i % CATEGORIES.length];
    const prefix = cat.prefixes[Math.floor(Math.random() * cat.prefixes.length)];
    const desc = cat.descriptions[Math.floor(Math.random() * cat.descriptions.length)];

    // Jitter coordinates around the hub city (within ~25-40 km radius)
    const latJitter = (Math.random() - 0.5) * 0.35;
    const lngJitter = (Math.random() - 0.5) * 0.40;
    const lat = parseFloat((hub.lat + latJitter).toFixed(6));
    const lng = parseFloat((hub.lng + lngJitter).toFixed(6));
    const elevation = Math.floor(Math.random() * 800) + 10;

    const timeOffsetMs = (targetCount - i) * 60000 * (1 + Math.random() * 5);
    const timestamp = new Date(now - timeOffsetMs).toISOString();

    const title = `${prefix} [${hub.city}-${i.toString().padStart(3, '0')}]`;
    const aiValidation = performAiValidation({
      title,
      description: desc,
      category: cat.name,
      latitude: lat,
      longitude: lng,
      elevation
    });

    const record = new GeoRecord({
      id: `GEO-${i.toString().padStart(4, '0')}`,
      title,
      category: cat.name,
      latitude: lat,
      longitude: lng,
      elevation,
      description: desc,
      creator: `Node-${(i % 8) + 1}.validator.net`,
      metadata: {
        nearestCity: hub.city,
        region: hub.region,
        sensorStatus: 'ACTIVE_TELEMETRY',
        accuracyMeters: parseFloat((Math.random() * 2.5 + 0.5).toFixed(2)),
        hardwareSigner: `ED25519-SIG-${Math.random().toString(16).substring(2, 10).toUpperCase()}`
      },
      aiValidation,
      timestamp
    });

    records.push(record);
  }

  return records;
}
