# 🔌 API Reference - Webma EarthGuard Backend

**Base URL:** `http://localhost:8080/api` (development)  
**Production:** `https://your-backend-url/api`

---

## Endpoints

### 1. Health Check

**GET** `/health`

Check if the API is running.

**Parameters:** None

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-04T13:00:00.000Z"
}
```

**Status Codes:**
- `200` - API is healthy

---

### 2. Active Fires

**GET** `/fires`

Retrieve active fire detections within a bounding box.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `bbox` | string | Yes | Format: `minLon,minLat,maxLon,maxLat` |

**Example Request:**
```
GET /api/fires?bbox=-10,30,-9,31
```

**Response:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-9.55, 30.45]
      },
      "properties": {
        "brightness": 325.5,
        "confidence": "high",
        "acq_date": "2025-10-04",
        "acq_time": "1430"
      }
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing or invalid bbox parameter
- `500` - Server error

**Notes:**
- MVP uses mock data
- Production requires NASA FIRMS API key
- Data updates every 3-6 hours

---

### 3. Air Quality Points

**GET** `/air/points`

Retrieve air quality sensor readings within a bounding box.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `bbox` | string | Yes | Format: `minLon,minLat,maxLon,maxLat` |
| `parameters` | string | No | Comma-separated: `pm25,no2,o3` (default: `pm25`) |

**Example Request:**
```
GET /api/air/points?bbox=-10,30,-9,31&parameters=pm25,no2,o3
```

**Response:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-9.5981, 30.4278]
      },
      "properties": {
        "location": "Agadir Center",
        "pm25": 43,
        "no2": 28,
        "o3": 65,
        "timestamp": "2025-10-04T13:00:00.000Z"
      }
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing or invalid bbox parameter
- `500` - Server error

**Notes:**
- Uses OpenAQ API (free, no key required)
- Falls back to mock data if API unavailable
- Cache TTL: 10 minutes

---

### 4. Weather Forecast

**GET** `/weather`

Get current weather and 7-day forecast for a location.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `lat` | number | Yes | Latitude (-90 to 90) |
| `lon` | number | Yes | Longitude (-180 to 180) |

**Example Request:**
```
GET /api/weather?lat=30.4278&lon=-9.5981
```

**Response:**
```json
{
  "current": {
    "temperature_2m": 28,
    "relative_humidity_2m": 65,
    "precipitation": 0,
    "wind_speed_10m": 12
  },
  "daily": {
    "time": ["2025-10-04", "2025-10-05", "..."],
    "temperature_2m_max": [32, 33, 34, 35, 34, 33, 32],
    "temperature_2m_min": [22, 23, 24, 25, 24, 23, 22],
    "precipitation_sum": [0, 5, 10, 20, 15, 5, 0],
    "precipitation_probability_max": [10, 20, 30, 50, 40, 20, 10]
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing or invalid lat/lon parameters
- `500` - Server error

**Notes:**
- Uses Open-Meteo API (free, no key required)
- Falls back to mock data if API unavailable
- Cache TTL: 10 minutes

---

### 5. Risk Analysis

**GET** `/risk`

Get comprehensive environmental risk assessment for a location.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `lat` | number | Yes | Latitude (-90 to 90) |
| `lon` | number | Yes | Longitude (-180 to 180) |

**Example Request:**
```
GET /api/risk?lat=30.4278&lon=-9.5981
```

**Response:**
```json
{
  "floodRisk": "Medium (30-60mm rainfall expected)",
  "fireRisk": "Low (humidity 67%)",
  "heatRisk": "34°C, Medium risk",
  "airQualityRisk": "Moderate (PM2.5: 43 µg/m³)",
  "o2Estimate": "80% of normal",
  "suggestions": [
    "Prepare sandbags in low-lying areas — possible flooding from rainfall forecast.",
    "Install reflective coatings on public roofs nearby to reduce surface temp by 2–3°C.",
    "Increase vegetation along main boulevards to improve air quality."
  ],
  "metadata": {
    "lat": 30.4278,
    "lon": -9.5981,
    "timestamp": "2025-10-04T13:00:00.000Z"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing or invalid lat/lon parameters
- `500` - Server error

**Notes:**
- Aggregates data from weather, air, and fire APIs
- Uses heuristic-based risk calculation
- No caching (depends on real-time inputs)
- Suggestions are rule-based (AI placeholder)

---

### 6. Environmental Alerts

**GET** `/alerts`

Get active environmental alerts for a region.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `bbox` | string | Yes | Format: `minLon,minLat,maxLon,maxLat` |

**Example Request:**
```
GET /api/alerts?bbox=-10,30,-9,31
```

**Response:**
```json
{
  "alerts": [
    {
      "id": "flood-1728048000000",
      "type": "flood",
      "severity": "high",
      "message": "Flood Watch — 80% rainfall probability next 48h",
      "location": "Region",
      "timestamp": "2025-10-04T13:00:00.000Z"
    },
    {
      "id": "fire-1728048000000",
      "type": "fire",
      "severity": "medium",
      "message": "1 active fire(s) detected in region",
      "location": "Region",
      "timestamp": "2025-10-04T13:00:00.000Z"
    }
  ]
}
```

**Alert Types:**
- `flood` - High precipitation probability
- `fire` - Active fires detected
- `heat` - Extreme temperature warning
- `air` - Poor air quality

**Severity Levels:**
- `low` - Informational
- `medium` - Caution advised
- `high` - Immediate action recommended

**Status Codes:**
- `200` - Success
- `400` - Missing or invalid bbox parameter
- `500` - Server error

**Notes:**
- Analyzes weather, fire, and air quality data
- Returns only active alerts (no historical)
- Cache TTL: 10 minutes

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

**Common Error Codes:**
- `400` - Bad Request (invalid parameters)
- `500` - Internal Server Error (API failure, processing error)

---

## Rate Limiting

**Current (MVP):**
- No backend rate limiting
- Limited by external API quotas:
  - OpenAQ: 10,000 requests/day
  - Open-Meteo: Unlimited
  - NASA FIRMS: 1,000 requests/day (production)

**Production Recommendations:**
- Implement `express-rate-limit`
- Suggested limit: 100 requests/15 minutes per IP
- Return `429 Too Many Requests` when exceeded

---

## Caching

**Current Strategy:**

| Endpoint | Cache TTL | Reason |
|----------|-----------|--------|
| `/fires` | 1 hour | Fire data updates every 3-6 hours |
| `/air/points` | 10 minutes | Air quality updates every 15-30 min |
| `/weather` | 10 minutes | Weather updates hourly |
| `/risk` | No cache | Depends on real-time inputs |
| `/alerts` | 10 minutes | Aggregated from cached sources |

**Cache Key Format:**
```
fires: "firms:{bbox}"
air: "openaq:{bbox}:{parameters}"
weather: "weather:{lat},{lon}"
```

---

## CORS Configuration

**Allowed Origins (Development):**
```
http://localhost:5173
```

**Production:**
Update `backend/.env`:
```
CORS_ORIGIN=https://your-frontend-domain.com
```

**Allowed Methods:**
- `GET`

**Allowed Headers:**
- `Content-Type`
- `Authorization` (future)

---

## Authentication

**Current:** None (public endpoints)

**Future (Production):**
```
Authorization: Bearer <JWT_TOKEN>
```

Add to headers for protected endpoints.

---

## Testing with cURL

### Health Check
```bash
curl http://localhost:8080/api/health
```

### Get Fires
```bash
curl "http://localhost:8080/api/fires?bbox=-10,30,-9,31"
```

### Get Air Quality
```bash
curl "http://localhost:8080/api/air/points?bbox=-10,30,-9,31&parameters=pm25,no2"
```

### Get Weather
```bash
curl "http://localhost:8080/api/weather?lat=30.4278&lon=-9.5981"
```

### Get Risk Analysis
```bash
curl "http://localhost:8080/api/risk?lat=30.4278&lon=-9.5981"
```

### Get Alerts
```bash
curl "http://localhost:8080/api/alerts?bbox=-10,30,-9,31"
```

---

## Testing with JavaScript (Frontend)

```javascript
const API_BASE = 'http://localhost:8080/api'

// Get risk analysis
const getRisk = async (lat, lon) => {
  const response = await fetch(`${API_BASE}/risk?lat=${lat}&lon=${lon}`)
  const data = await response.json()
  return data
}

// Get fires in bounding box
const getFires = async (bbox) => {
  const response = await fetch(`${API_BASE}/fires?bbox=${bbox}`)
  const data = await response.json()
  return data
}

// Usage
const risk = await getRisk(30.4278, -9.5981)
console.log(risk.suggestions)
```

---

## Monitoring

**Recommended Tools:**
- **Uptime:** UptimeRobot, Pingdom
- **Performance:** New Relic, Datadog
- **Logging:** Winston, Pino
- **Errors:** Sentry

**Key Metrics to Track:**
- Response time (target: < 500ms)
- Error rate (target: < 1%)
- Cache hit rate (target: > 80%)
- External API failures

---

## Changelog

### v0.1.0 (2025-10-04)
- Initial MVP release
- All 6 endpoints implemented
- Mock data fallbacks
- In-memory caching
- CORS enabled

---

**Need help?** Check `README.md` or `SETUP.md` for more information.
