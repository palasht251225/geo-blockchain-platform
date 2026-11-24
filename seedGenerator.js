import { GeoRecord } from './blockchain.js';
import { performAiValidation } from './spatialValidator.js';

/**
 * Curated authentic, high-precision datasets for GeoLedger.
 * Every landmark has accurate, verified real-world latitude and longitude.
 */

export const REAL_ECO_SITES = [
  // --- National & State Parks / Wildlife Sanctuaries / Wetlands across India ---
  {
    name: 'Lodhi Gardens Urban Carbon Sink',
    city: 'New Delhi',
    region: 'India',
    lat: 28.5933,
    lng: 77.2197,
    elevation: 215,
    desc: 'Dense 90-acre urban forestry bio-telemetry station measuring localized air purification and microclimate temperature regulation.',
    metrics: { aqi: 44, aqiStatus: 'Good', pm25: '16 µg/m³', carbonAbsorption: '48.2 t CO₂/yr', powerSource: '100% Solar-Powered', ecosystemType: 'Urban Forest' }
  },
  {
    name: 'Yamuna Biodiversity Park Wetland Station',
    city: 'New Delhi',
    region: 'India',
    lat: 28.7183,
    lng: 77.2344,
    elevation: 208,
    desc: 'Active floodplain wetland monitoring sensor array tracking reed bed hydrological purification, dissolved oxygen, and avian migratory density.',
    metrics: { aqi: 38, aqiStatus: 'Good', pm25: '14 µg/m³', carbonAbsorption: '82.5 t CO₂/yr', powerSource: 'Solar Micro-Array', ecosystemType: 'Riparian Wetland' }
  },
  {
    name: 'Asola Bhatti Wildlife Sanctuary Eco-Telemetry',
    city: 'South Delhi / NCR',
    region: 'India',
    lat: 28.4722,
    lng: 77.2514,
    elevation: 260,
    desc: 'Southern ridge wildlife corridor sensor network measuring leopard habitat connectivity and indigenous scrub vegetation recovery.',
    metrics: { aqi: 41, aqiStatus: 'Good', pm25: '18 µg/m³', carbonAbsorption: '64.1 t CO₂/yr', powerSource: 'Solar-Kinetic Hybrid', ecosystemType: 'Aravalli Scrub Forest' }
  },
  {
    name: 'Okhla Bird Sanctuary Wetland Monitor',
    city: 'Noida / Delhi Border',
    region: 'India',
    lat: 28.5630,
    lng: 77.3082,
    elevation: 200,
    desc: 'Sub-surface aquatic probe and acoustic bio-sensor tracking wetland health, water alkalinity, and over 300 migratory waterfowl species.',
    metrics: { aqi: 49, aqiStatus: 'Moderate', pm25: '22 µg/m³', carbonAbsorption: '55.0 t CO₂/yr', powerSource: 'Solar Photovoltaic', ecosystemType: 'Freshwater Marsh' }
  },
  {
    name: 'Aravalli Biodiversity Park Native Flora Station',
    city: 'Gurugram / NCR',
    region: 'India',
    lat: 28.4839,
    lng: 77.0988,
    elevation: 245,
    desc: 'Ecological restoration project recovering over 200 native plant species from erstwhile stone mining quarries, logged for conservation audit.',
    metrics: { aqi: 42, aqiStatus: 'Good', pm25: '19 µg/m³', carbonAbsorption: '71.8 t CO₂/yr', powerSource: 'Solar + Battery', ecosystemType: 'Native Deciduous Scrub' }
  },
  {
    name: 'Sanjay Gandhi National Park Canopy Sensor',
    city: 'Mumbai',
    region: 'India',
    lat: 19.2288,
    lng: 72.9133,
    elevation: 120,
    desc: 'Western Ghats outlier national park canopy node tracking carbon flux, tropical evergreen density, and leopard tracking telemetry.',
    metrics: { aqi: 35, aqiStatus: 'Good', pm25: '12 µg/m³', carbonAbsorption: '112.4 t CO₂/yr', powerSource: 'Solar Cell', ecosystemType: 'Tropical Moist Deciduous' }
  },
  {
    name: 'Thane Creek Flamingo Sanctuary Mangrove Node',
    city: 'Mumbai / Thane',
    region: 'India',
    lat: 19.1245,
    lng: 72.9902,
    elevation: 4,
    desc: 'Critical tidal mudflat and mangrove conservation observatory monitoring blue carbon sequestration and flamingo flock density.',
    metrics: { aqi: 40, aqiStatus: 'Good', pm25: '15 µg/m³', carbonAbsorption: '145.0 t CO₂/yr', powerSource: 'Tidal-Solar Hybrid', ecosystemType: 'Coastal Mangrove Swamp' }
  },
  {
    name: 'Mahim Nature Park Urban Mangrove Station',
    city: 'Mumbai',
    region: 'India',
    lat: 19.0494,
    lng: 72.8566,
    elevation: 6,
    desc: 'Reclaimed urban estuary woodland along the Mithi River acting as an ecological buffer and bird refuge in central Mumbai.',
    metrics: { aqi: 46, aqiStatus: 'Good', pm25: '20 µg/m³', carbonAbsorption: '36.8 t CO₂/yr', powerSource: 'Solar Grid', ecosystemType: 'Urban Estuary Park' }
  },
  {
    name: 'Lalbagh Botanical Gardens Flora Bio-Telemetry',
    city: 'Bengaluru',
    region: 'India',
    lat: 12.9507,
    lng: 77.5848,
    elevation: 910,
    desc: 'Centuries-old 240-acre botanical sanctuary equipped with microclimate probes, century-old tree sap flux sensors, and lake hydrology loggers.',
    metrics: { aqi: 28, aqiStatus: 'Excellent', pm25: '9 µg/m³', carbonAbsorption: '89.3 t CO₂/yr', powerSource: 'Solar Self-Sustained', ecosystemType: 'Botanical Arboretum' }
  },
  {
    name: 'Bannerghatta Biological Park Wildlife Corridor',
    city: 'Bengaluru',
    region: 'India',
    lat: 12.8003,
    lng: 77.5777,
    elevation: 885,
    desc: 'Elephant corridor telemetry node checking habitat fragmentation, soil moisture, and acoustic anti-poaching geofences.',
    metrics: { aqi: 24, aqiStatus: 'Excellent', pm25: '7 µg/m³', carbonAbsorption: '138.6 t CO₂/yr', powerSource: 'Solar + Energy Harvester', ecosystemType: 'Scrub & Deciduous Forest' }
  },
  {
    name: 'Cubbon Park Urban Forest Carbon Absorption Hub',
    city: 'Bengaluru',
    region: 'India',
    lat: 12.9763,
    lng: 77.5929,
    elevation: 920,
    desc: 'Central 300-acre green lung of Bengaluru monitoring particulate filtration, noise suppression, and urban heat island mitigation.',
    metrics: { aqi: 31, aqiStatus: 'Good', pm25: '11 µg/m³', carbonAbsorption: '76.4 t CO₂/yr', powerSource: 'Solar Node', ecosystemType: 'Urban Heritage Forest' }
  },
  {
    name: 'Bhadla Solar Park Clean Energy Beacon',
    city: 'Phalodi, Rajasthan',
    region: 'India',
    lat: 27.5398,
    lng: 71.9152,
    elevation: 220,
    desc: 'World’s largest operational solar generation complex (2,245 MW capacity) logging verified clean green megawatt injections to northern grid.',
    metrics: { aqi: 30, aqiStatus: 'Good', pm25: '13 µg/m³', carbonAbsorption: '4,100,000 t CO₂/yr (Offset)', powerSource: 'Clean Solar Energy', ecosystemType: 'Ultra-Mega Solar Grid' }
  },
  {
    name: 'Pavagada Solar Ultra-Mega Green Grid',
    city: 'Tumakuru, Karnataka',
    region: 'India',
    lat: 14.2810,
    lng: 77.2750,
    elevation: 640,
    desc: '2,050 MW Shakti Sthala solar park telemetry node proving immutable zero-emission renewable power delivery to southern regional grid.',
    metrics: { aqi: 25, aqiStatus: 'Excellent', pm25: '8 µg/m³', carbonAbsorption: '3,800,000 t CO₂/yr (Offset)', powerSource: 'Clean Solar Energy', ecosystemType: 'Ultra-Mega Solar Grid' }
  },
  {
    name: 'Sundarbans Tiger Reserve Mangrove Carbon Sink',
    city: 'South 24 Parganas, West Bengal',
    region: 'India',
    lat: 21.9497,
    lng: 88.8999,
    elevation: 2,
    desc: 'UNESCO World Heritage tidal halophytic mangrove ecosystem measuring high-density blue carbon storage, salinity shift, and cyclone surge mitigation.',
    metrics: { aqi: 22, aqiStatus: 'Excellent', pm25: '6 µg/m³', carbonAbsorption: '320.0 t CO₂/yr', powerSource: 'Solar + Tidal Probe', ecosystemType: 'Tidal Halophytic Mangrove' }
  },
  {
    name: 'Kaziranga National Park Flood Plain Sensor',
    city: 'Golaghat / Nagaon, Assam',
    region: 'India',
    lat: 26.5775,
    lng: 93.1711,
    elevation: 65,
    desc: 'Brahmaputra alluvial flood plain bio-station monitoring high-grassland ecology, one-horned rhinoceros grazing corridors, and seasonal flood levels.',
    metrics: { aqi: 19, aqiStatus: 'Pristine', pm25: '5 µg/m³', carbonAbsorption: '240.5 t CO₂/yr', powerSource: 'Solar-Kinetic', ecosystemType: 'Alluvial Terai Grassland' }
  },
  {
    name: 'Gir National Park Asiatic Lion Bio-Tracker Station',
    city: 'Junagadh, Gujarat',
    region: 'India',
    lat: 21.1243,
    lng: 70.8242,
    elevation: 180,
    desc: 'Dry deciduous teak forest ecological node with camera trap cross-referencing and watering-hole hydrological level measurement.',
    metrics: { aqi: 27, aqiStatus: 'Good', pm25: '9 µg/m³', carbonAbsorption: '98.0 t CO₂/yr', powerSource: 'Solar Micro-Array', ecosystemType: 'Dry Deciduous Teak Forest' }
  },
  {
    name: 'Silent Valley National Park Rainforest Array',
    city: 'Palakkad, Kerala',
    region: 'India',
    lat: 11.1333,
    lng: 76.4500,
    elevation: 1100,
    desc: 'Undisturbed evergreen tropical rainforest in Nilgiri Biosphere Reserve recording pristine air quality, micro-precipitation, and lion-tailed macaque habitat.',
    metrics: { aqi: 12, aqiStatus: 'Pristine', pm25: '3 µg/m³', carbonAbsorption: '410.2 t CO₂/yr', powerSource: 'Solar Hydro-Probe', ecosystemType: 'Tropical Wet Evergreen' }
  },
  {
    name: 'Jim Corbett National Park Forest Canopy Array',
    city: 'Nainital, Uttarakhand',
    region: 'India',
    lat: 29.5300,
    lng: 78.7747,
    elevation: 400,
    desc: 'Himalayan sub-foothill Sal forest telemetry checking soil moisture, Ramganga river riparian corridor, and apex predator habitat integrity.',
    metrics: { aqi: 20, aqiStatus: 'Pristine', pm25: '5 µg/m³', carbonAbsorption: '185.0 t CO₂/yr', powerSource: 'Solar Node', ecosystemType: 'Sub-Himalayan Sal Belt' }
  },
  {
    name: 'Dal Lake Aquatic Purity & Eco-Sensor',
    city: 'Srinagar, Jammu & Kashmir',
    region: 'India',
    lat: 34.1167,
    lng: 74.8667,
    elevation: 1582,
    desc: 'High-altitude sub-alpine lake telemetry logging water clarity, dissolved nitrates, submersed macrophyte biomass, and floating garden agro-ecology.',
    metrics: { aqi: 23, aqiStatus: 'Pristine', pm25: '7 µg/m³', carbonAbsorption: '42.0 t CO₂/yr', powerSource: 'Solar Buoy Array', ecosystemType: 'Sub-Alpine Freshwater Lake' }
  },
  {
    name: 'Hemis High-Altitude Glacier Melting Monitor',
    city: 'Leh, Ladakh',
    region: 'India',
    lat: 33.9167,
    lng: 77.6167,
    elevation: 3850,
    desc: 'Trans-Himalayan cold desert alpine station tracking snow leopard movements, glacial recession rates, and permafrost freeze-thaw cycles.',
    metrics: { aqi: 9, aqiStatus: 'Pristine', pm25: '2 µg/m³', carbonAbsorption: '12.0 t CO₂/yr', powerSource: 'Extreme-Cold Solar + RTG', ecosystemType: 'Trans-Himalayan Alpine Steppe' }
  },
  {
    name: 'Chilika Lake Ramsar Wetland Salinity Station',
    city: 'Puri / Ganjam, Odisha',
    region: 'India',
    lat: 19.7167,
    lng: 85.3167,
    elevation: 1,
    desc: 'Asia’s largest brackish water coastal lagoon with automated sensors measuring tidal exchange salinity, seagrass bed health, and Irrawaddy dolphin pods.',
    metrics: { aqi: 26, aqiStatus: 'Excellent', pm25: '8 µg/m³', carbonAbsorption: '190.0 t CO₂/yr', powerSource: 'Solar Floating Beacon', ecosystemType: 'Brackish Coastal Lagoon' }
  },
  {
    name: 'Valley of Flowers Alpine Floral Observatory',
    city: 'Chamoli, Uttarakhand',
    region: 'India',
    lat: 30.7280,
    lng: 79.6053,
    elevation: 3600,
    desc: 'UNESCO High-altitude alpine valley measuring floral phenology, pollination cycles, snowline shift, and endemic medicinal flora protection.',
    metrics: { aqi: 8, aqiStatus: 'Pristine', pm25: '2 µg/m³', carbonAbsorption: '34.0 t CO₂/yr', powerSource: 'Alpine Solar Cell', ecosystemType: 'Alpine Meadow & Tundra' }
  },
  {
    name: 'Agumbe Rainforest Hydrology & Canopy Sensor',
    city: 'Shimoga, Karnataka',
    region: 'India',
    lat: 13.5074,
    lng: 75.0931,
    elevation: 645,
    desc: 'Known as the Cherrapunji of the South, this dense rainforest station logs hyper-precipitation (over 7,000mm/yr) and King Cobra nesting ecology.',
    metrics: { aqi: 14, aqiStatus: 'Pristine', pm25: '4 µg/m³', carbonAbsorption: '280.0 t CO₂/yr', powerSource: 'Hydro-Electric Micro Turbine', ecosystemType: 'Dense Evergreen Rainforest' }
  },
  {
    name: 'Keoladeo Ghana National Park Avian Radar',
    city: 'Bharatpur, Rajasthan',
    region: 'India',
    lat: 27.1600,
    lng: 77.5200,
    elevation: 174,
    desc: 'Ramsar wetland sanctuary recording artificial inundation levels, plankton densities, and winter migratory stops for central Asian flyway birds.',
    metrics: { aqi: 36, aqiStatus: 'Good', pm25: '14 µg/m³', carbonAbsorption: '68.0 t CO₂/yr', powerSource: 'Solar Station', ecosystemType: 'Inland Freshwater Swamp' }
  },
  {
    name: 'Muppandal Wind Clean Energy Generating Array',
    city: 'Kanyakumari, Tamil Nadu',
    region: 'India',
    lat: 8.2572,
    lng: 77.5458,
    elevation: 85,
    desc: 'One of the world’s largest onshore wind farms (1,500 MW) harnessing Arabian Sea and Bay of Bengal thermal winds with zero carbon emissions.',
    metrics: { aqi: 21, aqiStatus: 'Pristine', pm25: '6 µg/m³', carbonAbsorption: '2,600,000 t CO₂/yr (Offset)', powerSource: 'Clean Wind Power', ecosystemType: 'Wind Energy Corridor' }
  },
  {
    name: 'Loktak Floating Phumdis Wetland Monitor',
    city: 'Bishnupur, Manipur',
    region: 'India',
    lat: 24.5500,
    lng: 93.7833,
    elevation: 768,
    desc: 'World’s only floating national park ecosystem (Keibul Lamjao) monitoring biomass stability of floating phumdis and endangered Sangai deer.',
    metrics: { aqi: 18, aqiStatus: 'Pristine', pm25: '5 µg/m³', carbonAbsorption: '110.0 t CO₂/yr', powerSource: 'Floating Solar Node', ecosystemType: 'Floating Wetland' }
  },

  // --- Global Key Eco-Friendly & Conservation Stations ---
  {
    name: 'Central Park Urban Canopy & Air Quality Station',
    city: 'New York',
    region: 'North America',
    lat: 40.7829,
    lng: -73.9654,
    elevation: 32,
    desc: 'Central 843-acre Manhattan biosphere sensor measuring carbon sink efficacy against dense urban traffic and PM2.5 baseline.',
    metrics: { aqi: 32, aqiStatus: 'Good', pm25: '10 µg/m³', carbonAbsorption: '52.0 t CO₂/yr', powerSource: 'Solar Photovoltaic', ecosystemType: 'Temperate Urban Forest' }
  },
  {
    name: 'Muir Woods Redwood Forest Microclimate Array',
    city: 'San Francisco / Marin, California',
    region: 'North America',
    lat: 37.8970,
    lng: -122.5811,
    elevation: 85,
    desc: 'Ancient coastal redwood (Sequoia sempervirens) canopy sensors measuring coastal marine fog water intake and old-growth biomass carbon storage.',
    metrics: { aqi: 15, aqiStatus: 'Pristine', pm25: '4 µg/m³', carbonAbsorption: '520.0 t CO₂/yr', powerSource: 'Solar-Bio Harvester', ecosystemType: 'Coastal Redwood Rainforest' }
  },
  {
    name: 'Hyde Park Urban Biosphere Observatory',
    city: 'London',
    region: 'Europe',
    lat: 51.5073,
    lng: -0.1657,
    elevation: 24,
    desc: 'The Serpentine lake and Royal Park green corridor recording low-emission zone air impact and urban tree health across 350 acres.',
    metrics: { aqi: 29, aqiStatus: 'Good', pm25: '9 µg/m³', carbonAbsorption: '44.5 t CO₂/yr', powerSource: 'Solar Micro-Node', ecosystemType: 'Urban Royal Parkland' }
  },
  {
    name: 'Black Forest Biosphere Carbon Flux Station',
    city: 'Freiburg / Baden-Württemberg',
    region: 'Europe',
    lat: 48.1500,
    lng: 8.2000,
    elevation: 920,
    desc: 'Dense European fir and beech forest canopy eddy covariance flux tower measuring continental European carbon sequestration and acid rain recovery.',
    metrics: { aqi: 16, aqiStatus: 'Pristine', pm25: '4 µg/m³', carbonAbsorption: '290.0 t CO₂/yr', powerSource: 'Solar + Fuel Cell', ecosystemType: 'Temperate Mixed Coniferous Forest' }
  },
  {
    name: 'Jungfraujoch High Alpine Glaciological Observatory',
    city: 'Bernese Oberland',
    region: 'Europe',
    lat: 46.5475,
    lng: 7.9854,
    elevation: 3450,
    desc: 'Top of Europe atmospheric research station continuously logging tropospheric background greenhouse gas isotopes and Great Aletsch Glacier retreat.',
    metrics: { aqi: 7, aqiStatus: 'Pristine', pm25: '1 µg/m³', carbonAbsorption: 'Glacier Mass Balance', powerSource: 'Alpine Solar Array', ecosystemType: 'High Alpine Permafrost' }
  },
  {
    name: 'Gardens by the Bay Supertree Bio-Telemetry',
    city: 'Singapore',
    region: 'SE Asia',
    lat: 1.2816,
    lng: 103.8636,
    elevation: 15,
    desc: 'Vertical gardens and biomimicry supertrees equipped with photovoltaic solar cells, rainwater harvesting probes, and orchid microclimate telemetry.',
    metrics: { aqi: 22, aqiStatus: 'Excellent', pm25: '7 µg/m³', carbonAbsorption: '65.0 t CO₂/yr', powerSource: 'Supertree Integrated Solar', ecosystemType: 'Vertical Biophilic Canopy' }
  },
  {
    name: 'Yoyogi Forest Carbon Sink & Microclimate',
    city: 'Tokyo',
    region: 'East Asia',
    lat: 35.6715,
    lng: 139.6949,
    elevation: 36,
    desc: '100-year-old self-sustaining urban sacred forest surrounding Meiji Shrine acting as a biodiversity sanctuary and thermal heat damper in central Tokyo.',
    metrics: { aqi: 26, aqiStatus: 'Good', pm25: '8 µg/m³', carbonAbsorption: '84.0 t CO₂/yr', powerSource: 'Solar Smart Node', ecosystemType: 'Urban Self-Sustaining Evergreen' }
  },
  {
    name: 'Royal Botanic Garden Marine & Flora Sensor',
    city: 'Sydney',
    region: 'Oceania',
    lat: -33.8642,
    lng: 151.2166,
    elevation: 18,
    desc: 'Harbour-front botanical conservation reserve measuring coastal ozone, Sydney Harbour tidal health, and endangered Australian endemic cycads.',
    metrics: { aqi: 18, aqiStatus: 'Pristine', pm25: '5 µg/m³', carbonAbsorption: '61.0 t CO₂/yr', powerSource: 'Solar Coastal Array', ecosystemType: 'Coastal Botanical Reserve' }
  },
  {
    name: 'Amazon Rainforest Core Carbon Flux Tower',
    city: 'Manaus, Amazonas',
    region: 'South America',
    lat: -2.5972,
    lng: -60.2093,
    elevation: 85,
    desc: '325-meter Amazon Tall Tower Observatory (ATTO) recording biosphere-atmosphere chemical exchange across the world’s largest equatorial rainforest.',
    metrics: { aqi: 11, aqiStatus: 'Pristine', pm25: '3 µg/m³', carbonAbsorption: '680.0 t CO₂/yr', powerSource: 'Solar-Biomass Hybrid', ecosystemType: 'Dense Amazonian Evergreen' }
  },
  {
    name: 'Great Barrier Reef Marine Acidification Sensor',
    city: 'Cairns, Queensland',
    region: 'Oceania',
    lat: -16.9203,
    lng: 145.7710,
    elevation: 0,
    desc: 'Offshore moored buoy logging seawater pH, coral bleaching water temperature anomalies, and calcification rates across the Coral Sea barrier reef.',
    metrics: { aqi: 14, aqiStatus: 'Pristine', pm25: '3 µg/m³', carbonAbsorption: 'Marine Blue Carbon Sink', powerSource: 'Wave-Solar Hybrid Buoy', ecosystemType: 'Coral Reef Marine Ecosystem' }
  },
  {
    name: 'Serengeti Migration & Savanna Ecology Station',
    city: 'Mara / Arusha',
    region: 'Africa',
    lat: -2.3333,
    lng: 34.8333,
    elevation: 1450,
    desc: 'Vast East African savanna monitoring wildebeest migration paths, acacia grassland carbon density, and seasonal bushfire perimeter detection.',
    metrics: { aqi: 16, aqiStatus: 'Pristine', pm25: '4 µg/m³', carbonAbsorption: '140.0 t CO₂/yr', powerSource: 'Solar Off-Grid', ecosystemType: 'Tropical Acacia Savanna' }
  },
  {
    name: 'Hellisheidi Geothermal Carbon Capture Node',
    city: 'Reykjavik / Hengill',
    region: 'Europe',
    lat: 64.0381,
    lng: -21.4019,
    elevation: 280,
    desc: 'World-leading direct-air carbon capture & mineralisation station dissolving captured CO₂ into basalt bedrock for permanent cryptographic mineralization.',
    metrics: { aqi: 10, aqiStatus: 'Pristine', pm25: '2 µg/m³', carbonAbsorption: '4,000 t CO₂/yr (Direct Mineralization)', powerSource: '100% Geothermal Energy', ecosystemType: 'Geothermal Clean Energy Bed' }
  },
  {
    name: 'Dubai Solar Park & Desert Greening Sensor',
    city: 'Dubai',
    region: 'Middle East',
    lat: 24.7500,
    lng: 55.4000,
    elevation: 120,
    desc: 'Mohammed bin Rashid Al Maktoum Solar Park sensor tracking CSP tower mirror alignment and desert edge mangrove restoration carbon capture.',
    metrics: { aqi: 35, aqiStatus: 'Good', pm25: '12 µg/m³', carbonAbsorption: '1,800,000 t CO₂/yr (Offset)', powerSource: 'Concentrated Solar Power', ecosystemType: 'Desert Solar Complex' }
  }
];

export const REAL_LAND_SITES = [
  { name: 'Vasant Kunj DDA Institutional Deed', city: 'New Delhi', region: 'India', lat: 28.5284, lng: 77.1554, desc: 'Cryptographically registered Delhi Development Authority public utility lease parcel.' },
  { name: 'BKC Financial Center Title Deed', city: 'Mumbai', region: 'India', lat: 19.0657, lng: 72.8680, desc: 'MMRDA high-density commercial deed with sub-meter cadastral polygon verification.' },
  { name: 'Electronic City Tech Campus Cadastral', city: 'Bengaluru', region: 'India', lat: 12.8452, lng: 77.6602, desc: 'Industrial development boundary deed registered with Karnataka KIADB authority.' },
  { name: 'HITEC City Cyberabad Parcel 4B', city: 'Hyderabad', region: 'India', lat: 17.4474, lng: 78.3762, desc: 'TSIIC commercial lease tenure parcel with immutable boundary coordinates.' },
  { name: 'OMR Cyber Vale Tech Corridor Parcel', city: 'Chennai', region: 'India', lat: 12.9815, lng: 80.2464, desc: 'State infrastructure corporation commercial IT land title with survey benchmarks.' },
  { name: 'Canary Wharf Commercial Deed #88', city: 'London', region: 'Europe', lat: 51.5054, lng: -0.0235, desc: 'HM Land Registry digital freehold commercial parcel with crypto coordinate seal.' },
  { name: 'Manhattan Hudson Yards Master Parcel', city: 'New York', region: 'North America', lat: 40.7539, lng: -74.0017, desc: 'New York City Department of Finance registered high-rise commercial tax parcel.' },
  { name: 'Marunouchi Financial District Title', city: 'Tokyo', region: 'East Asia', lat: 35.6812, lng: 139.7671, desc: 'Tokyo Metropolitan legal affairs land registration block with millimeter accuracy.' },
  { name: 'DIFC Gateway Commercial Land Title', city: 'Dubai', region: 'Middle East', lat: 25.2104, lng: 55.2800, desc: 'Dubai Land Department registered commercial freehold cadastral demarcated node.' },
  { name: 'Barangaroo Coastal Crown Land Title', city: 'Sydney', region: 'Oceania', lat: -33.8604, lng: 151.2018, desc: 'New South Wales Land Registry Services urban waterfront cadastral parcel.' }
];

export const REAL_LOGISTICS_SITES = [
  { name: 'JNPT Nhava Sheva Maritime Container Terminal', city: 'Navi Mumbai', region: 'India', lat: 18.9499, lng: 72.9515, desc: 'India’s premier container port tracking intermodal cargo transshipment provenance.' },
  { name: 'ICD Tughlakabad Inland Container Depot', city: 'New Delhi', region: 'India', lat: 28.5130, lng: 77.2917, desc: 'Asia’s largest dry port facility with automated customs container tamper checks.' },
  { name: 'Whitefield Concor Inland Logistics Hub', city: 'Bengaluru', region: 'India', lat: 12.9904, lng: 77.7523, desc: 'Rail-to-truck container freight terminal with GPS seal notarization.' },
  { name: 'Port of Rotterdam Automated Gateway', city: 'Rotterdam', region: 'Europe', lat: 51.9540, lng: 4.1432, desc: 'Europe’s largest sea shipping port automated automated container handling terminal.' },
  { name: 'Port of Singapore Pasir Panjang Terminal', city: 'Singapore', region: 'SE Asia', lat: 1.2740, lng: 103.7850, desc: 'World’s busiest transshipment maritime hub with automated guided vehicle routing.' },
  { name: 'Port of Los Angeles Pier 400', city: 'Los Angeles', region: 'North America', lat: 33.7258, lng: -118.2560, desc: 'Busiest container gateway in North America with smart cold-chain tracking beacons.' },
  { name: 'Jebel Ali Port Terminal 3', city: 'Dubai', region: 'Middle East', lat: 25.0125, lng: 55.0617, desc: 'Flagship deep-water port serving Middle East and African supply chain corridors.' }
];

export const REAL_INFRA_SITES = [
  { name: 'Pragati Combined Cycle Power Station', city: 'New Delhi', region: 'India', lat: 28.6186, lng: 77.2519, desc: 'High-voltage grid transmission dispatch center with continuous frequency stability logging.' },
  { name: 'Trombay Thermal Power Substation Grid', city: 'Mumbai', region: 'India', lat: 19.0028, lng: 72.9056, desc: 'Key metropolitan power injection substation with automated phase sync telemetry.' },
  { name: 'Peenya 400kV Ultra High-Voltage Substation', city: 'Bengaluru', region: 'India', lat: 13.0285, lng: 77.5195, desc: 'KPTCL major grid hub powering northern Bengaluru industrial and aerospace belts.' },
  { name: 'Battersea High-Voltage Grid Substation', city: 'London', region: 'Europe', lat: 51.4820, lng: -0.1448, desc: 'National Grid UK power transmission node with automated SCADA coordinate anchoring.' },
  { name: 'Hoover Dam Clean Hydroelectric Grid Node', city: 'Nevada / Arizona', region: 'North America', lat: 36.0156, lng: -114.7378, desc: '2,080 MW clean hydroelectric generation facility logging multi-state power transmission.' },
  { name: 'Shinkansen Tokaido Central Power Dispatch', city: 'Tokyo / Shinagawa', region: 'East Asia', lat: 35.6284, lng: 139.7387, desc: 'Dedicated 25kV high-speed railway electrical substations with microsecond telemetry.' }
];

export const REAL_HERITAGE_SITES = [
  { name: 'Qutub Minar Archaeological Benchmark', city: 'New Delhi', region: 'India', lat: 28.5245, lng: 77.1855, desc: '12th-century UNESCO World Heritage minaret with precision tilt and seismic telemetry.' },
  { name: 'Red Fort Lal Qila Conservation Perimeter', city: 'Old Delhi', region: 'India', lat: 28.6562, lng: 77.2410, desc: 'Mughal sandstone citadel boundary registered to prevent urban heritage encroachment.' },
  { name: 'Taj Mahal Monument Protection Buffer', city: 'Agra, Uttar Pradesh', region: 'India', lat: 27.1751, lng: 78.0421, desc: 'Strict Taj Trapezium Zone (TTZ) air quality and environmental protection boundary.' },
  { name: 'Hampi Virupaksha Temple Benchmark', city: 'Vijayanagara, Karnataka', region: 'India', lat: 15.3350, lng: 76.4600, desc: '14th-century Vijayanagara Empire stone monuments with sub-centimeter GPS benchmark.' },
  { name: 'Brihadisvara Temple Heritage Zone', city: 'Thanjavur, Tamil Nadu', region: 'India', lat: 10.7828, lng: 79.1318, desc: '1,000-year-old Chola granite temple protected by Archaeological Survey of India.' },
  { name: 'Ajanta Caves Geological Conservation Array', city: 'Aurangabad, Maharashtra', region: 'India', lat: 20.5519, lng: 75.7033, desc: 'Ancient rock-cut Buddhist cave monuments with micro-humidity and cliff vibration sensors.' },
  { name: 'Konark Sun Temple Shoreline Buffer', city: 'Puri, Odisha', region: 'India', lat: 19.8876, lng: 86.0945, desc: '13th-century coastal architectural benchmark monitoring marine saline air erosion.' },
  { name: 'Stonehenge Prehistoric Monument Benchmark', city: 'Wiltshire', region: 'Europe', lat: 51.1789, lng: -1.8262, desc: 'Neolithic stone circle monument perimeter demarcated with English Heritage GIS.' },
  { name: 'Colosseum Flavian Amphitheatre Benchmark', city: 'Rome', region: 'Europe', lat: 41.8902, lng: 12.4922, desc: 'Imperial Roman amphitheatre structural vibration and seismic monitoring geofence.' },
  { name: 'Acropolis of Athens Parthenon Landmark', city: 'Athens', region: 'Europe', lat: 37.9715, lng: 23.7257, desc: 'Classical Greek citadel archaeological site with continuous marble preservation telemetry.' },
  { name: 'Kinkaku-ji Golden Pavilion Buffer', city: 'Kyoto', region: 'East Asia', lat: 35.0394, lng: 135.7292, desc: 'UNESCO World Heritage Zen Buddhist temple surrounded by protected forest perimeter.' }
];

/**
 * Generate 520 clean, realistic, globally-distributed, and verified geo-records.
 * Curates realistic coordinates around genuine locations without wild random offsets.
 */
export function generateSeedRecords(targetCount = 520) {
  const records = [];
  const now = Date.now();

  // Combine curated sites
  const curatedLists = [
    { cat: 'Environmental Sensor', sites: REAL_ECO_SITES, prefix: '🌿 Eco-Station' },
    { cat: 'Land Registry', sites: REAL_LAND_SITES, prefix: '🏛️ Cadastral Deed' },
    { cat: 'Supply Chain & Logistics', sites: REAL_LOGISTICS_SITES, prefix: '📦 Logistics Node' },
    { cat: 'Critical Infrastructure', sites: REAL_INFRA_SITES, prefix: '⚡ Grid Infrastructure' },
    { cat: 'Cultural Heritage', sites: REAL_HERITAGE_SITES, prefix: '🏛️ Heritage Benchmark' }
  ];

  let recordIdx = 1;

  // First pass: add every curated site directly (guarantees 100% exact landmark pins)
  for (const group of curatedLists) {
    for (const site of group.sites) {
      if (recordIdx > targetCount) break;

      const timeOffsetMs = (targetCount - recordIdx) * 120000;
      const timestamp = new Date(now - timeOffsetMs).toISOString();

      const aiValidation = performAiValidation({
        title: site.name,
        description: site.desc,
        category: group.cat,
        latitude: site.lat,
        longitude: site.lng,
        elevation: site.elevation || 100
      });

      const isEco = group.cat === 'Environmental Sensor';
      const metadata = {
        nearestCity: site.city,
        region: site.region,
        ecoFriendly: isEco,
        sensorStatus: 'ACTIVE_TELEMETRY',
        accuracyMeters: isEco ? 0.85 : 1.2,
        hardwareSigner: `NODE-VERIFIED-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        ...(site.metrics ? { ecoMetrics: site.metrics } : {})
      };

      const record = new GeoRecord({
        id: `GEO-${recordIdx.toString().padStart(4, '0')}`,
        title: site.name,
        category: group.cat,
        latitude: site.lat,
        longitude: site.lng,
        elevation: site.elevation || 100,
        description: site.desc,
        creator: `Node-${(recordIdx % 12) + 1}.validator.net`,
        metadata,
        aiValidation,
        timestamp
      });

      records.push(record);
      recordIdx++;
    }
  }

  // Second pass: Populate remaining slots (up to 520) with realistic sub-stations / sensors
  // tightly clustered around the verified landmarks (e.g. within 200m - 1.5km, realistic campus/park perimeter)
  let loopCount = 0;
  while (recordIdx <= targetCount && loopCount < 1000) {
    loopCount++;
    const group = curatedLists[(recordIdx) % curatedLists.length];
    const baseSite = group.sites[(recordIdx + loopCount) % group.sites.length];

    // Very tight, realistic radius: within ~300 to 1200 meters of the landmark
    const latOffset = (Math.random() - 0.5) * 0.012; // ~600m
    const lngOffset = (Math.random() - 0.5) * 0.014;
    const lat = parseFloat((baseSite.lat + latOffset).toFixed(6));
    const lng = parseFloat((baseSite.lng + lngOffset).toFixed(6));
    const elevation = (baseSite.elevation || 100) + Math.floor((Math.random() - 0.5) * 20);

    const timeOffsetMs = (targetCount - recordIdx) * 90000;
    const timestamp = new Date(now - timeOffsetMs).toISOString();

    const isEco = group.cat === 'Environmental Sensor';
    let subTitle = '';
    let subDesc = '';
    let metrics = null;

    if (isEco) {
      const ecoTypes = ['Air Quality Probe', 'Canopy Flux Node', 'Hydrology Logger', 'Solar Radiometer', 'Bio-Acoustic Array'];
      const chosenType = ecoTypes[recordIdx % ecoTypes.length];
      subTitle = `${baseSite.name} — ${chosenType} #${(recordIdx % 9) + 1}`;
      subDesc = `Sub-station telemetry linked to ${baseSite.name}. Calibrated environmental sensing with continuous cryptographic ledger timestamping.`;
      
      const baseAqi = baseSite.metrics ? baseSite.metrics.aqi : 35;
      const localAqi = Math.max(8, baseAqi + Math.floor((Math.random() - 0.5) * 10));
      metrics = {
        aqi: localAqi,
        aqiStatus: localAqi < 25 ? 'Pristine' : localAqi < 45 ? 'Good' : 'Moderate',
        pm25: `${Math.round(localAqi * 0.38)} µg/m³`,
        carbonAbsorption: baseSite.metrics ? baseSite.metrics.carbonAbsorption : '55.0 t CO₂/yr',
        powerSource: '100% Solar-Powered',
        ecosystemType: baseSite.metrics ? baseSite.metrics.ecosystemType : 'Ecological Zone'
      };
    } else if (group.cat === 'Land Registry') {
      subTitle = `${baseSite.name} — Sector Lot ${((recordIdx % 15) + 101)}`;
      subDesc = `Notarized digital cadastral title registered adjacent to ${baseSite.name}. Cryptographic boundary bounds verified.`;
    } else if (group.cat === 'Supply Chain & Logistics') {
      subTitle = `${baseSite.name} — Automated Gate ${String.fromCharCode(65 + (recordIdx % 6))}`;
      subDesc = `Intermodal cargo exchange beacon at ${baseSite.name}. Real-time GPS container seal inspection verified.`;
    } else if (group.cat === 'Critical Infrastructure') {
      subTitle = `${baseSite.name} — Feeder Inverter ${recordIdx % 8 + 1}`;
      subDesc = `SCADA monitored grid power station telemetry at ${baseSite.name}. Zero-latency phase verification on-chain.`;
    } else {
      subTitle = `${baseSite.name} — Conservation Sector ${(recordIdx % 7) + 1}`;
      subDesc = `Archaeological buffer demarcation protecting ${baseSite.name} from structural intrusion.`;
    }

    const aiValidation = performAiValidation({
      title: subTitle,
      description: subDesc,
      category: group.cat,
      latitude: lat,
      longitude: lng,
      elevation
    });

    const record = new GeoRecord({
      id: `GEO-${recordIdx.toString().padStart(4, '0')}`,
      title: subTitle,
      category: group.cat,
      latitude: lat,
      longitude: lng,
      elevation,
      description: subDesc,
      creator: `Node-${(recordIdx % 12) + 1}.validator.net`,
      metadata: {
        nearestCity: baseSite.city,
        region: baseSite.region,
        ecoFriendly: isEco,
        sensorStatus: 'ACTIVE_TELEMETRY',
        accuracyMeters: parseFloat((Math.random() * 0.8 + 0.4).toFixed(2)),
        hardwareSigner: `NODE-ED25519-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        ...(metrics ? { ecoMetrics: metrics } : {})
      },
      aiValidation,
      timestamp
    });

    records.push(record);
    recordIdx++;
  }

  return records;
}
