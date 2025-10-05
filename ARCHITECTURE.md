# 🏛️ Webma EarthGuard - System Architecture

## Overview

Webma EarthGuard is a full-stack environmental monitoring platform that aggregates real-time satellite data, weather forecasts, and air quality metrics to provide actionable insights for climate resilience.

## System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         React Frontend (Vite + TypeScript)             │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │ │
│  │  │ TopNav   │ │AlertsBar │ │ Layer    │ │ Info     │  │ │
│  │  │          │ │          │ │ Toggle   │ │ Panel    │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │         MapContainer (Leaflet)                   │  │ │
│  │  │  • Base Layer (OSM)                              │  │ │
│  │  │  • WMTS Layers (NASA GIBS)                       │  │ │
│  │  │  • Heatmap Overlays                              │  │ │
│  │  │  • Click Handlers                                │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Node.js Backend (Express + TS)                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    API Routes                          │ │
│  │  /api/health  /api/fires  /api/air  /api/weather      │ │
│  │  /api/risk    /api/alerts                             │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   Services Layer                       │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐              │ │
│  │  │ FIRMS    │ │ OpenAQ   │ │ Open-    │              │ │
│  │  │ Service  │ │ Service  │ │ Meteo    │              │ │
│  │  └──────────┘ └──────────┘ └──────────┘              │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   Utils & Logic                        │ │
│  │  • Cache (in-memory)                                   │ │
│  │  • BBox parsing                                        │ │
│  │  • Risk calculation (heuristics)                       │ │
│  │  • Suggestion generation                               │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ External APIs
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Data Sources                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ NASA FIRMS   │ │   OpenAQ     │ │ Open-Meteo   │        │
│  │ (Fire Data)  │ │ (Air Quality)│ │  (Weather)   │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│  ┌──────────────┐ ┌──────────────┐                         │
│  │  NASA GIBS   │ │ OpenStreetMap│                         │
│  │ (WMTS Tiles) │ │  (Base Map)  │                         │
│  └──────────────┘ └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Map Initialization
```
User opens app
  → Frontend loads Leaflet map centered on Agadir
  → OSM base tiles loaded
  → User toggles layers (Fire, Heat, Air Quality, etc.)
  → WMTS tiles from NASA GIBS overlaid on map
```

### 2. Area Click Event
```
User clicks map location (lat, lon)
  → Frontend sends GET /api/risk?lat=X&lon=Y
  → Backend fetches:
      - Weather data (Open-Meteo)
      - Air quality (OpenAQ)
      - Nearby fires (FIRMS)
  → Backend calculates risk scores
  → Backend generates AI suggestions
  → Frontend displays InfoPanel with results
```

### 3. Layer Toggle
```
User enables "Fire Risk" layer
  → Frontend adds NASA GIBS FIRMS tile layer
  → Frontend sends GET /api/fires?bbox=...
  → Backend returns GeoJSON of active fires
  → Frontend renders fire markers/heatmap
```

### 4. Alerts Generation
```
Frontend loads
  → Sends GET /api/alerts?bbox=...
  → Backend analyzes:
      - Precipitation probability (flood risk)
      - Active fires count
      - Max temperature (heat risk)
      - PM2.5 levels (air quality)
  → Returns prioritized alerts
  → Frontend displays in AlertsBar
```

## Technology Stack

### Frontend
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | React 18 | UI components |
| Build Tool | Vite | Fast dev server & bundling |
| Language | TypeScript | Type safety |
| Map Library | Leaflet | Interactive maps |
| Icons | Lucide React | Modern icon set |
| Styling | CSS Variables | Dark/light theme |
| HTTP Client | Fetch API | Backend communication |

### Backend
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Runtime | Node.js 18+ | JavaScript server |
| Framework | Express | REST API routing |
| Language | TypeScript | Type safety |
| HTTP Client | node-fetch | External API calls |
| Caching | In-memory Map | Reduce API calls |
| CORS | cors middleware | Cross-origin requests |

### External APIs
| API | Purpose | Rate Limit | Auth |
|-----|---------|-----------|------|
| NASA GIBS WMTS | Satellite imagery tiles | None | No key |
| NASA FIRMS | Active fire detection | 1000/day | API key (production) |
| OpenAQ | Air quality sensors | 10,000/day | No key |
| Open-Meteo | Weather forecast | Unlimited | No key |
| OpenStreetMap | Base map tiles | Fair use | No key |

## Risk Calculation Logic

### Flood Risk
```typescript
Input: 48h precipitation forecast (mm)
Heuristic:
  - High: precip > 60mm
  - Medium: 30mm < precip ≤ 60mm
  - Low: precip ≤ 30mm
Future: Add elevation data (DEM) and soil saturation
```

### Fire Risk
```typescript
Input: Nearby fires, temperature, humidity
Heuristic:
  - High: fires within 10km AND temp > 32°C AND humidity < 40%
  - Medium: temp > 35°C OR humidity < 30%
  - Low: otherwise
Future: Add NDVI dryness index and wind speed
```

### Heat Risk
```typescript
Input: Daily max temperature forecast
Heuristic:
  - High: temp > 38°C
  - Medium: 34°C < temp ≤ 38°C
  - Low: temp ≤ 34°C
Future: Add Urban Heat Island effect (LST + vegetation)
```

### Air Quality Risk
```typescript
Input: PM2.5 concentration (µg/m³)
Heuristic:
  - Unhealthy: PM2.5 > 55
  - Moderate: 35 < PM2.5 ≤ 55
  - Good: PM2.5 ≤ 35
Future: Add NO₂, O₃, and AQI calculation
```

### O₂ Estimate
```typescript
Input: Vegetation density proxy, pollution level
Formula: O₂% = vegetationFactor × (1 - PM2.5/100) × 100
Future: Use real NDVI from Sentinel-2
```

## AI Suggestions Engine

Rule-based system (MVP):

```typescript
if (floodRisk === 'High' || 'Medium') {
  → "Prepare sandbags in low-lying areas"
  → "Clear drainage systems"
}

if (fireRisk === 'High' || 'Medium') {
  → "Avoid open fires for 72 hours"
  → "Monitor local fire alerts"
}

if (heatRisk === 'High' || 'Medium') {
  → "Install reflective roof coatings"
  → "Increase tree canopy coverage"
}

if (airQuality === 'Unhealthy' || 'Moderate') {
  → "Increase vegetation along boulevards"
  → "Consider car-free zones"
}

if (O₂ < 85%) {
  → "Plant more trees and green spaces"
}
```

Future: Replace with ML model trained on historical mitigation outcomes.

## Caching Strategy

| Data Type | TTL | Reason |
|-----------|-----|--------|
| Weather forecast | 10 min | Updates hourly |
| Air quality | 10 min | Updates every 15-30 min |
| Fire data | 1 hour | Updates every 3-6 hours |
| Risk calculations | No cache | Depends on real-time inputs |

## Security Considerations

### Current (MVP)
- CORS restricted to frontend origin
- No authentication (public data only)
- Rate limiting via external API quotas

### Production Recommendations
- Add API key authentication for backend
- Implement rate limiting (express-rate-limit)
- Use HTTPS only
- Add input validation (express-validator)
- Sanitize user inputs (geocoding search)
- Add CSP headers
- Store API keys in environment variables (never commit)

## Scalability

### Current Limitations
- In-memory cache (lost on restart)
- Single server instance
- No database (stateless)

### Future Improvements
- Redis for distributed caching
- PostgreSQL + PostGIS for data persistence
- Load balancer for multiple backend instances
- CDN for frontend assets
- WebSocket for real-time alerts
- Message queue (RabbitMQ) for async processing

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Production Setup                      │
│                                                          │
│  ┌────────────────┐         ┌────────────────┐         │
│  │   Vercel       │         │   Render       │         │
│  │   (Frontend)   │◄───────►│   (Backend)    │         │
│  │   - React app  │  HTTPS  │   - Express    │         │
│  │   - CDN        │         │   - Node.js    │         │
│  └────────────────┘         └────────────────┘         │
│         │                           │                   │
│         │                           │                   │
│         ▼                           ▼                   │
│  ┌────────────────┐         ┌────────────────┐         │
│  │  Static Assets │         │  External APIs │         │
│  │  (Vercel CDN)  │         │  (NASA, OpenAQ)│         │
│  └────────────────┘         └────────────────┘         │
└─────────────────────────────────────────────────────────┘
```

## Performance Metrics (Target)

| Metric | Target | Current |
|--------|--------|---------|
| Initial Load | < 2s | TBD |
| API Response | < 500ms | TBD |
| Map Interaction | < 100ms | TBD |
| Tile Load | < 1s | TBD |

## Future Architecture Enhancements

1. **Microservices**
   - Separate services for fires, air, weather
   - API Gateway (Kong/AWS API Gateway)

2. **Real-time Processing**
   - WebSocket server for live alerts
   - Server-Sent Events for updates

3. **ML Pipeline**
   - Python service for predictions
   - TensorFlow/PyTorch models
   - Training pipeline with historical data

4. **Data Lake**
   - Store historical satellite imagery
   - Time-series analysis
   - Trend detection

5. **Mobile App**
   - React Native
   - Push notifications
   - Offline mode with cached tiles

---

**Last Updated:** 2025-10-04
