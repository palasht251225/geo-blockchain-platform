/**
 * AI-Assisted Spatial Coordinate Validation Pipeline
 * Provides geographic coordinate boundary validation, anomaly detection,
 * spatial zone classification, and semantic consistency scoring.
 */

// Major regional reference centroids for semantic coordinate cross-check
const REGIONAL_KNOWLEDGE_BASE = [
  { region: 'South Asia / India', minLat: 6.0, maxLat: 38.0, minLng: 68.0, maxLng: 98.0, keywords: ['delhi', 'mumbai', 'bangalore', 'india', 'taj', 'ganga', 'himalaya', 'chennai', 'kolkata', 'hyderabad'] },
  { region: 'Europe', minLat: 35.0, maxLat: 71.0, minLng: -11.0, maxLng: 40.0, keywords: ['paris', 'london', 'berlin', 'rome', 'europe', 'alps', 'madrid', 'thames', 'eiffel'] },
  { region: 'North America', minLat: 15.0, maxLat: 72.0, minLng: -170.0, maxLng: -50.0, keywords: ['usa', 'america', 'california', 'new york', 'san francisco', 'canada', 'chicago', 'texas'] },
  { region: 'East Asia', minLat: 18.0, maxLat: 54.0, minLng: 73.0, maxLng: 150.0, keywords: ['tokyo', 'japan', 'beijing', 'china', 'seoul', 'korea', 'shanghai'] },
  { region: 'Middle East', minLat: 12.0, maxLat: 42.0, minLng: 34.0, maxLng: 64.0, keywords: ['dubai', 'uae', 'riyadh', 'saudi', 'doha', 'qatar', 'cairo', 'egypt'] },
  { region: 'South America', minLat: -56.0, maxLat: 13.0, minLng: -82.0, maxLng: -34.0, keywords: ['brazil', 'amazon', 'buenos aires', 'andes', 'chile', 'peru'] },
  { region: 'Africa', minLat: -35.0, maxLat: 38.0, minLng: -18.0, maxLng: 52.0, keywords: ['nairobi', 'kenya', 'sahara', 'lagos', 'cape town', 'south africa', 'serengeti'] },
  { region: 'Oceania', minLat: -48.0, maxLat: -10.0, minLng: 110.0, maxLng: 180.0, keywords: ['sydney', 'australia', 'melbourne', 'new zealand', 'auckland'] }
];

export function validateCoordinates(lat, lng) {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    return { valid: false, error: 'Latitude and Longitude must be valid numerical values.' };
  }

  if (latitude < -90 || latitude > 90) {
    return { valid: false, error: `Latitude ${latitude} is out of bounds [-90, +90].` };
  }

  if (longitude < -180 || longitude > 180) {
    return { valid: false, error: `Longitude ${longitude} is out of bounds [-180, +180].` };
  }

  // Check for Null Island placeholder
  if (Math.abs(latitude) < 0.0001 && Math.abs(longitude) < 0.0001) {
    return { valid: false, error: 'Coordinates point to (0,0) [Null Island], likely an uninitialized placeholder.' };
  }

  return { valid: true, latitude, longitude };
}

export function classifySpatialZone(lat, lng, elevation = 0) {
  if (lat > 66.5 || lat < -66.5) return 'Polar / Sub-Polar';
  if (Math.abs(lat) < 23.5) {
    if (elevation > 2500) return 'Tropical High-Altitude';
    return 'Tropical / Equatorial';
  }
  if (elevation > 2000) return 'Alpine / Mountainous';
  if (elevation < 0) return 'Sub-Sea Level / Coastal Depression';
  return 'Temperate Continental';
}

export function performAiValidation({ title = '', description = '', category = '', latitude, longitude, elevation = 0, previousPoint = null }) {
  const coordCheck = validateCoordinates(latitude, longitude);
  if (!coordCheck.valid) {
    return {
      isValid: false,
      confidence: 0.0,
      status: 'REJECTED',
      flags: [coordCheck.error],
      spatialZone: 'Invalid',
      matchedRegion: null
    };
  }

  const flags = [];
  let confidence = 0.99;
  const lat = coordCheck.latitude;
  const lng = coordCheck.longitude;

  // 1. Semantic Region Consistency Check
  const combinedText = `${title} ${description} ${category}`.toLowerCase();
  let matchedRegion = null;
  let semanticMismatch = false;

  for (const reg of REGIONAL_KNOWLEDGE_BASE) {
    const hasKeyword = reg.keywords.some(kw => combinedText.includes(kw));
    if (hasKeyword) {
      const inBounds = lat >= reg.minLat && lat <= reg.maxLat && lng >= reg.minLng && lng <= reg.maxLng;
      if (!inBounds) {
        flags.push(`Semantic Warning: Content mentions "${reg.region}" entities, but coordinates [${lat.toFixed(4)}, ${lng.toFixed(4)}] locate elsewhere.`);
        confidence -= 0.25;
        semanticMismatch = true;
      } else {
        matchedRegion = reg.region;
      }
    }
  }

  // 2. Precision & Granularity Check
  const latDecimals = (lat.toString().split('.')[1] || '').length;
  const lngDecimals = (lng.toString().split('.')[1] || '').length;
  if (latDecimals < 2 || lngDecimals < 2) {
    flags.push('Low precision coordinates detected (less than 2 decimal places, ~1km resolution).');
    confidence -= 0.1;
  }

  // 3. Teleportation / Kinematic Jump Check
  if (previousPoint && previousPoint.latitude && previousPoint.timestamp) {
    const timeDiffHours = (Date.now() - new Date(previousPoint.timestamp).getTime()) / (1000 * 3600);
    if (timeDiffHours > 0 && timeDiffHours < 2) {
      const distKm = haversineDistance(lat, lng, previousPoint.latitude, previousPoint.longitude);
      const speedKmh = distKm / timeDiffHours;
      if (speedKmh > 1200) { // Supersonic velocity anomaly
        flags.push(`Kinematic Anomaly: Speed from last recorded point exceeds ${speedKmh.toFixed(0)} km/h.`);
        confidence -= 0.35;
      }
    }
  }

  const spatialZone = classifySpatialZone(lat, lng, elevation);
  confidence = Math.max(0.1, Math.min(1.0, confidence));

  return {
    isValid: confidence >= 0.5,
    confidence: parseFloat(confidence.toFixed(2)),
    status: confidence >= 0.8 ? 'VERIFIED_HIGH_CONFIDENCE' : confidence >= 0.5 ? 'VERIFIED_WITH_WARNINGS' : 'SUSPICIOUS',
    flags: flags.length > 0 ? flags : ['Coordinates physically valid and within expected geographic tolerances'],
    spatialZone,
    matchedRegion: matchedRegion || 'Global Terrestrial Grid'
  };
}

export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
