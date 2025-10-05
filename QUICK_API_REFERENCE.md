# 🚀 Quick API Reference - New Endpoints

**Base URL:** `http://localhost:8080/api`

---

## 🌿 Vegetation & O₂ Data

### Get Vegetation Data
```bash
GET /api/vegetation?lat=30.4278&lon=-9.5981
```

**Response:**
```json
{
  "ndvi": 0.35,
  "vegetationLevel": "Moderate Vegetation",
  "o2Estimate": 82,
  "treeRecommendation": false,
  "color": "#ffffbf"
}
```

### Get Tree Planting Priority
```bash
GET /api/vegetation/planting-priority?lat=30.4278&lon=-9.5981&temp=35&pm25=45
```

**Response:**
```json
{
  "priority": "High",
  "score": 75,
  "reason": "low vegetation cover, high temperature, poor air quality",
  "location": { "lat": 30.4278, "lon": -9.5981 },
  "ndvi": 0.25,
  "vegetationLevel": "Sparse Vegetation"
}
```

---

## 💧 Flood Risk Prediction

### Get Flood Risk
```bash
GET /api/flood?lat=30.4278&lon=-9.5981
```

**Response:**
```json
{
  "riskLevel": "Medium",
  "probability": 45,
  "factors": {
    "rainfall": 25,
    "elevation": 15,
    "slope": 3.2,
    "soilSaturation": 65
  },
  "prediction": {
    "next24h": "Moderate risk",
    "next48h": "Moderate risk",
    "next72h": "Low risk"
  },
  "color": "#fbbf24",
  "recommendations": [
    "⚠️ Prepare sandbags for low-lying areas",
    "🔍 Monitor drainage systems and clear blockages",
    "📋 Review evacuation routes",
    "🌧️ Avoid unnecessary travel during heavy rainfall",
    "💧 Expected rainfall: 25mm over next 3 days"
  ],
  "location": { "lat": 30.4278, "lon": -9.5981 },
  "timestamp": "2025-10-04T17:25:00.000Z"
}
```

---

## 🔥 Fire Risk Assessment

### Get Fire Risk
```bash
GET /api/fire-risk?lat=30.4278&lon=-9.5981
```

**Response:**
```json
{
  "riskLevel": "Medium",
  "probability": 42,
  "factors": {
    "temperature": 32,
    "humidity": 45,
    "windSpeed": 15,
    "ndvi": 0.35
  },
  "prediction": {
    "current": "Moderate fire danger - moderate spread",
    "next24h": "Risk may decrease",
    "next48h": "Conditions improving"
  },
  "color": "#eab308",
  "recommendations": [
    "⚡ MODERATE FIRE DANGER - Use caution",
    "🔥 Limit outdoor burning to designated areas",
    "💧 Keep water/extinguisher nearby if burning",
    "🌬️ Monitor wind conditions"
  ],
  "spread": {
    "speed": 4.5,
    "direction": 0,
    "description": "Moderate spread rate"
  },
  "location": { "lat": 30.4278, "lon": -9.5981 },
  "timestamp": "2025-10-04T17:25:00.000Z"
}
```

---

## 📊 Risk Levels

### Flood Risk
- **Low** (0-30%): Green `#4ade80`
- **Medium** (30-60%): Yellow `#fbbf24`
- **High** (60-100%): Red `#ef4444`

### Fire Risk
- **Low** (0-25%): Green `#22c55e`
- **Medium** (25-50%): Yellow `#eab308`
- **High** (50-75%): Orange `#f97316`
- **Extreme** (75-100%): Red `#dc2626`

### Vegetation (NDVI)
- **Barren/Urban** (0-0.2): Red `#d7191c`
- **Sparse** (0.2-0.3): Orange `#fdae61`
- **Moderate** (0.3-0.5): Yellow `#ffffbf`
- **Dense** (0.5-0.7): Light Green `#a6d96a`
- **Very Dense** (0.7-1.0): Dark Green `#1a9641`

---

## 🧪 Test Locations (Agadir Region)

```javascript
const TEST_COORDS = {
  agadir_center: { lat: 30.4278, lon: -9.5981 },
  agadir_beach: { lat: 30.4167, lon: -9.6000 },
  agadir_mountains: { lat: 30.5000, lon: -9.5000 },
  agadir_airport: { lat: 30.3250, lon: -9.4131 }
}
```

---

## 🔗 Frontend Integration Example

```javascript
// Fetch all environmental data for a location
async function getEnvironmentalData(lat, lon) {
  const [vegetation, flood, fireRisk, weather] = await Promise.all([
    fetch(`/api/vegetation?lat=${lat}&lon=${lon}`).then(r => r.json()),
    fetch(`/api/flood?lat=${lat}&lon=${lon}`).then(r => r.json()),
    fetch(`/api/fire-risk?lat=${lat}&lon=${lon}`).then(r => r.json()),
    fetch(`/api/weather?lat=${lat}&lon=${lon}`).then(r => r.json())
  ])

  return { vegetation, flood, fireRisk, weather }
}

// Usage
const data = await getEnvironmentalData(30.4278, -9.5981)
console.log(`NDVI: ${data.vegetation.ndvi}`)
console.log(`Flood Risk: ${data.flood.riskLevel}`)
console.log(`Fire Risk: ${data.fireRisk.riskLevel}`)
```

---

## 🎨 Map Layer URLs

### NDVI Tiles (NASA GIBS)
```
https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day/default/{date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png
```

### Precipitation Tiles (NASA GPM)
```
https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/GPM_Precipitation_Rate_IMERG/default/{date}T00:00:00Z/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png
```

### Fire Tiles (NASA FIRMS)
```
https://firms.modaps.eosdis.nasa.gov/mapserver/wms/fires/?SERVICE=WMS&REQUEST=GetMap&LAYERS=fires_viirs_24&...
```

---

## 🔑 Environment Variables

Add to `backend/.env`:

```bash
# Required for production
NASA_FIRMS_KEY=your_key_here
WAQI_TOKEN=your_token_here

# Optional for advanced features
COPERNICUS_CLIENT_ID=your_client_id
SENTINEL_HUB_INSTANCE_ID=your_instance_id
```

---

## ⚡ Quick Start

1. **Start backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Test vegetation endpoint:**
   ```bash
   curl "http://localhost:8080/api/vegetation?lat=30.4278&lon=-9.5981"
   ```

3. **Test flood endpoint:**
   ```bash
   curl "http://localhost:8080/api/flood?lat=30.4278&lon=-9.5981"
   ```

4. **Test fire risk endpoint:**
   ```bash
   curl "http://localhost:8080/api/fire-risk?lat=30.4278&lon=-9.5981"
   ```

---

**All endpoints return JSON with CORS enabled for `http://localhost:5173`**
