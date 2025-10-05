# 🗺️ System Architecture Diagram

**Webma EarthGuard - Environmental Monitoring System**

---

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│                     http://localhost:5173                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   MapContainer│  │  LayerToggle │  │ EnvironmentalDataPanel│  │
│  │   (Leaflet)  │  │              │  │                       │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   InfoPanel  │  │  AlertsBar   │  │      TopNav          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                   │
└────────────────────────────┬──────────────────────────────────┘
                             │ HTTP/REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API (Express)                         │
│                   http://localhost:8080/api                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────── ROUTES ───────────────────────────┐  │
│  │                                                            │  │
│  │  /health          /fires           /air/points            │  │
│  │  /weather         /risk            /alerts                │  │
│  │  /vegetation      /flood           /fire-risk       ✨NEW │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌─────────────────────── SERVICES ──────────────────────────┐  │
│  │                                                            │  │
│  │  openmeteo.ts    openaq.ts       firms.ts                │  │
│  │  waqi.ts ✨      vegetation.ts ✨  flood.ts ✨            │  │
│  │  fire-risk.ts ✨                                          │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌─────────────────────── UTILS ─────────────────────────────┐  │
│  │                                                            │  │
│  │  cache.ts        bbox.ts         risk.ts                 │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
└────────────────────────────┬──────────────────────────────────┘
                             │ External APIs
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL DATA SOURCES                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Open-Meteo  │  │    OpenAQ    │  │    NASA FIRMS        │  │
│  │  (Weather)   │  │ (Air Quality)│  │    (Fires)           │  │
│  │  ✅ No Key   │  │  ✅ No Key   │  │    🔑 Key Required   │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │    WAQI      │  │  NASA GIBS   │  │   Copernicus DEM     │  │
│  │(Air Quality) │  │  (NDVI Tiles)│  │   (Elevation)        │  │
│  │🔑 Key Required│  │  ✅ No Key   │  │   ✅ No Key          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Sentinel-2  │  │  Sentinel-5P │  │   NASA GPM           │  │
│  │   (NDVI)     │  │  (CO₂, NO₂)  │  │  (Precipitation)     │  │
│  │📋 Optional   │  │  📋 Optional │  │   ✅ No Key          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

### User Clicks on Map

```
User clicks map location (lat, lon)
         │
         ▼
Frontend sends parallel requests:
         │
    ┌────┴────┬────────┬──────────┬──────────┐
    ▼         ▼        ▼          ▼          ▼
/vegetation /flood  /fire-risk /weather   /air/points
    │         │        │          │          │
    ▼         ▼        ▼          ▼          ▼
Backend services fetch/calculate data
    │         │        │          │          │
    ▼         ▼        ▼          ▼          ▼
Check cache (10min - 1hr TTL)
    │         │        │          │          │
    ▼         ▼        ▼          ▼          ▼
If not cached, fetch from external APIs
    │         │        │          │          │
    ▼         ▼        ▼          ▼          ▼
Process & calculate risk scores
    │         │        │          │          │
    ▼         ▼        ▼          ▼          ▼
Return JSON responses
    │         │        │          │          │
    └────┬────┴────────┴──────────┴──────────┘
         ▼
Frontend displays in InfoPanel/EnvironmentalDataPanel
         │
         ▼
User sees: NDVI, O₂, Flood Risk, Fire Risk, Recommendations
```

---

## 🌿 Vegetation Service Flow

```
GET /api/vegetation?lat=30.4278&lon=-9.5981
         │
         ▼
┌────────────────────────────────┐
│  vegetation.ts                 │
│                                │
│  1. Check cache (1hr TTL)      │
│  2. Calculate NDVI             │
│     (mock or Sentinel-2)       │
│  3. Estimate O₂ from NDVI      │
│  4. Determine vegetation level │
│  5. Check tree recommendation  │
│  6. Return color code          │
└────────────────────────────────┘
         │
         ▼
Response:
{
  "ndvi": 0.35,
  "vegetationLevel": "Moderate Vegetation",
  "o2Estimate": 82,
  "treeRecommendation": false,
  "color": "#ffffbf"
}
```

---

## 💧 Flood Prediction Flow

```
GET /api/flood?lat=30.4278&lon=-9.5981
         │
         ▼
┌────────────────────────────────┐
│  flood.ts                      │
│                                │
│  1. Get weather forecast       │
│     (rainfall next 3 days)     │
│  2. Get elevation (DEM)        │
│  3. Calculate slope            │
│  4. Calculate soil saturation  │
│  5. Compute flood probability  │
│     - Rainfall: 0-40 points    │
│     - Elevation: 0-30 points   │
│     - Slope: 0-15 points       │
│     - Saturation: 0-15 points  │
│  6. Generate predictions       │
│  7. Create recommendations     │
└────────────────────────────────┘
         │
         ▼
Response:
{
  "riskLevel": "Medium",
  "probability": 45,
  "prediction": {
    "next24h": "Moderate risk",
    "next48h": "Moderate risk",
    "next72h": "Low risk"
  },
  "recommendations": [...]
}
```

---

## 🔥 Fire Risk Assessment Flow

```
GET /api/fire-risk?lat=30.4278&lon=-9.5981
         │
         ▼
┌────────────────────────────────┐
│  fire-risk.ts                  │
│                                │
│  1. Get weather data           │
│     - Temperature              │
│     - Humidity                 │
│     - Wind speed               │
│  2. Get vegetation (NDVI)      │
│  3. Calculate fire probability │
│     - Temperature: 0-30 points │
│     - Humidity: 0-30 points    │
│     - Wind: 0-25 points        │
│     - NDVI dryness: 0-15 pts   │
│  4. Determine risk level       │
│  5. Calculate fire spread      │
│     - Speed from wind          │
│     - Direction from wind      │
│  6. Generate recommendations   │
└────────────────────────────────┘
         │
         ▼
Response:
{
  "riskLevel": "Medium",
  "probability": 42,
  "spread": {
    "speed": 4.5,
    "direction": 0,
    "description": "Moderate spread rate"
  },
  "recommendations": [...]
}
```

---

## 🗺️ Map Layers Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Leaflet Map Container                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Base Layer (OpenStreetMap)                                  │
│  ├── Street view                                             │
│  ├── Satellite view                                          │
│  └── Terrain view                                            │
│                                                               │
│  Overlay Layers (Toggle on/off)                              │
│  ├── 🌿 Vegetation (NDVI)                                    │
│  │   └── NASA GIBS MODIS NDVI tiles                         │
│  │                                                            │
│  ├── 💧 Flood Risk                                           │
│  │   └── NASA GPM Precipitation tiles + calculated overlay  │
│  │                                                            │
│  ├── 🔥 Fire Risk                                            │
│  │   ├── NASA FIRMS active fire points                      │
│  │   └── Calculated risk heatmap                            │
│  │                                                            │
│  ├── 💨 Air Quality                                          │
│  │   ├── WAQI/OpenAQ sensor points                          │
│  │   └── AQI heatmap                                         │
│  │                                                            │
│  └── 🌡️ Temperature                                          │
│      └── MODIS Land Surface Temperature tiles               │
│                                                               │
│  Interactive Elements                                         │
│  ├── Click → Show InfoPanel with all data                   │
│  ├── Hover → Quick tooltip                                   │
│  └── Legend → Color scale explanation                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Caching Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                      Cache Layer                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  In-Memory Cache (utils/cache.ts)                           │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Key Format: "service:params"                        │   │
│  │                                                       │   │
│  │  vegetation:30.43,-9.60    → TTL: 1 hour            │   │
│  │  flood:30.43,-9.60         → TTL: 10 minutes        │   │
│  │  fire-risk:30.43,-9.60     → TTL: 10 minutes        │   │
│  │  weather:30.43,-9.60       → TTL: 10 minutes        │   │
│  │  openaq:-10,30,-9,31       → TTL: 10 minutes        │   │
│  │  firms:-10,30,-9,31        → TTL: 1 hour            │   │
│  │                                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  Cache Hit → Return immediately (< 1ms)                     │
│  Cache Miss → Fetch from API → Store → Return (200-500ms)  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Security Layers                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend (Public)                                           │
│  ├── No API keys exposed                                     │
│  ├── CORS: Only from allowed origins                         │
│  └── Environment: VITE_API_BASE only                         │
│                                                               │
│  Backend (Private)                                           │
│  ├── API keys in .env (not committed)                        │
│  ├── CORS middleware (express-cors)                          │
│  ├── Input validation (lat/lon ranges)                       │
│  └── Error handling (no sensitive data in errors)            │
│                                                               │
│  External APIs                                               │
│  ├── Keys stored in environment variables                    │
│  ├── Rate limiting handled by cache                          │
│  └── Fallback to mock data on failure                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Processing Pipeline

```
External API Response
         │
         ▼
┌─────────────────────┐
│  Raw Data           │
│  (JSON/CSV/Tiles)   │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Parse & Validate   │
│  - Check format     │
│  - Validate values  │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Transform          │
│  - Calculate NDVI   │
│  - Compute risks    │
│  - Generate colors  │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Enrich             │
│  - Add metadata     │
│  - Add timestamps   │
│  - Add location     │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Cache              │
│  - Store in memory  │
│  - Set TTL          │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Return to Client   │
│  - JSON response    │
│  - HTTP 200         │
└─────────────────────┘
```

---

## 🎯 Request/Response Examples

### Example 1: Get Environmental Data

```
REQUEST:
GET http://localhost:8080/api/vegetation?lat=30.4278&lon=-9.5981

PROCESSING:
1. Parse lat/lon
2. Check cache (key: "vegetation:30.43,-9.60")
3. If miss: Calculate NDVI based on location
4. Estimate O₂ from NDVI
5. Determine vegetation level
6. Check tree recommendation
7. Cache result (1 hour)
8. Return JSON

RESPONSE:
{
  "ndvi": 0.35,
  "vegetationLevel": "Moderate Vegetation",
  "o2Estimate": 82,
  "treeRecommendation": false,
  "color": "#ffffbf"
}
```

### Example 2: Get Comprehensive Risk

```
REQUEST:
GET http://localhost:8080/api/risk?lat=30.4278&lon=-9.5981

PROCESSING:
1. Parallel fetch:
   - Weather (Open-Meteo)
   - Air quality (OpenAQ/WAQI)
   - Fires (NASA FIRMS)
2. Calculate risks:
   - Flood risk from rainfall
   - Fire risk from weather + vegetation
   - Heat risk from temperature
   - Air quality risk from PM2.5
3. Generate AI suggestions
4. Return combined analysis

RESPONSE:
{
  "floodRisk": "Medium (30-60mm rainfall expected)",
  "fireRisk": "Low (humidity 67%)",
  "heatRisk": "34°C, Medium risk",
  "airQualityRisk": "Moderate (PM2.5: 43 µg/m³)",
  "o2Estimate": "80% of normal",
  "suggestions": [
    "Prepare sandbags in low-lying areas",
    "Install reflective coatings on roofs",
    "Increase vegetation along boulevards"
  ]
}
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Production Setup                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend (Vercel)                                           │
│  ├── Domain: earthguard.vercel.app                          │
│  ├── CDN: Global edge network                               │
│  ├── Build: npm run build                                    │
│  └── Env: VITE_API_BASE=https://api.earthguard.com         │
│                                                               │
│  Backend (Render/Railway)                                    │
│  ├── Domain: api.earthguard.com                             │
│  ├── Build: npm run build                                    │
│  ├── Start: npm start                                        │
│  └── Env: All API keys + CORS_ORIGIN                        │
│                                                               │
│  Database (Future)                                           │
│  ├── PostgreSQL + PostGIS                                    │
│  ├── Store: Historical data, user prefs                     │
│  └── Cache: Redis for distributed caching                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📈 Scalability Considerations

```
Current (MVP):
- In-memory cache
- Single server
- ~100 requests/minute

Future (Production):
- Redis distributed cache
- Load balancer
- Multiple server instances
- CDN for static assets
- Database for persistence
- ~10,000 requests/minute
```

---

**This diagram shows the complete system architecture for Webma EarthGuard!** 🌍
