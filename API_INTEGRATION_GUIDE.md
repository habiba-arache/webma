# 🌍 Environmental Data API Integration Guide

**Project:** Webma EarthGuard - Agadir Environmental Monitoring  
**Coordinates:** Lat: 30.4278, Lon: -9.5981  
**Last Updated:** 2025-10-04

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Data Categories & APIs](#data-categories--apis)
3. [API Details & Integration](#api-details--integration)
4. [Implementation Roadmap](#implementation-roadmap)
5. [Testing & Validation](#testing--validation)

---

## Overview

This guide documents all environmental data APIs and datasets for the Agadir-focused environmental monitoring application. Each API is evaluated for:

- **Availability** (Free/Paid, API Key Required)
- **Data Coverage** (Global/Regional)
- **Update Frequency**
- **Integration Complexity**
- **Rate Limits**

---

## Data Categories & APIs

### 🌿 Vegetation & Environmental Data

| Data Type | API/Source | Status | API Key | Update Freq | Notes |
|-----------|------------|--------|---------|-------------|-------|
| **NDVI (Vegetation Index)** | Sentinel-2 via Google Earth Engine | ✅ Recommended | Yes (Free) | 5 days | Best for vegetation monitoring |
| **NDVI Alternative** | MODIS NDVI via NASA GIBS | ✅ Recommended | No | Daily | Lower resolution but easier |
| **Tree Cover** | Global Forest Watch API | ✅ Available | Yes (Free) | Annual | Tree density maps |
| **Land Cover** | Copernicus Land Cover | ✅ Available | No | Annual | Land use classification |
| **O₂/CO₂ Estimates** | Derived from NDVI + Pollution | ⚙️ Calculated | N/A | Real-time | Algorithm-based |

### 💨 Air Quality Data

| Data Type | API/Source | Status | API Key | Update Freq | Notes |
|-----------|------------|--------|---------|-------------|-------|
| **PM2.5, PM10, NO₂, O₃** | OpenAQ API | ✅ Implemented | No | 15-30 min | Ground sensors, limited coverage |
| **PM2.5, PM10, NO₂, O₃** | WAQI (World Air Quality Index) | ✅ Recommended | Yes (Free) | Hourly | Better coverage than OpenAQ |
| **CO₂, NO₂, CH₄** | Sentinel-5P TROPOMI | ✅ Recommended | Via Copernicus | Daily | Satellite-based, global |
| **CO₂, NO₂, SO₂** | NASA Aura OMI | ✅ Available | No (GIBS) | Daily | Older but reliable |
| **AQI Index** | IQAir API | ⚠️ Limited Free | Yes (Paid) | Real-time | Commercial, limited free tier |

### 🌡️ Temperature & Humidity

| Data Type | API/Source | Status | API Key | Update Freq | Notes |
|-----------|------------|--------|---------|-------------|-------|
| **Surface Temperature** | MODIS LST via NASA GIBS | ✅ Implemented | No | Daily | Land Surface Temperature |
| **Air Temperature** | Open-Meteo API | ✅ Implemented | No | Hourly | Current + 7-day forecast |
| **Humidity** | Open-Meteo API | ✅ Implemented | No | Hourly | Included with temperature |
| **Urban Heat Islands** | Landsat 8/9 Thermal | ✅ Available | Yes (Free) | 16 days | High resolution (30m) |

### 💧 Water & Meteorological Data

| Data Type | API/Source | Status | API Key | Update Freq | Notes |
|-----------|------------|--------|---------|-------------|-------|
| **Rainfall (Current)** | Open-Meteo API | ✅ Implemented | No | Hourly | Precipitation data |
| **Rainfall (Satellite)** | NASA GPM IMERG | ✅ Recommended | Yes (Free) | 30 min | Global Precipitation Measurement |
| **Rainfall Forecast** | Open-Meteo API | ✅ Implemented | No | Hourly | 7-day forecast |
| **Soil Moisture** | NASA SMAP | ✅ Available | Yes (Free) | 3 days | For flood prediction |
| **River/Water Levels** | Global Flood Database | ⚠️ Limited | Varies | Varies | Limited real-time data |
| **Sea Level** | Copernicus Marine Service | ✅ Available | Yes (Free) | Daily | Coastal flood analysis |

### 🌀 Flood Prediction

| Data Type | API/Source | Status | API Key | Update Freq | Notes |
|-----------|------------|--------|---------|-------------|-------|
| **Elevation (DEM)** | Copernicus DEM (30m) | ✅ Recommended | No | Static | Free, global coverage |
| **Elevation (DEM)** | SRTM (90m) | ✅ Available | No | Static | Lower resolution |
| **Flood Maps** | Sentinel-1 SAR | ✅ Available | Yes (Free) | 6-12 days | Detects actual flooding |
| **Flood Forecasting** | Custom Algorithm | ⚙️ To Build | N/A | Real-time | DEM + Rainfall + Soil |

### 🔥 Fire Detection & Prediction

| Data Type | API/Source | Status | API Key | Update Freq | Notes |
|-----------|------------|--------|---------|-------------|-------|
| **Active Fires** | NASA FIRMS (VIIRS) | ✅ Partially Done | Yes (Free) | 3-6 hours | Near real-time |
| **Active Fires** | NASA FIRMS (MODIS) | ✅ Partially Done | Yes (Free) | 3-6 hours | Lower resolution |
| **Fire Risk** | Custom Algorithm | ⚙️ To Build | N/A | Real-time | NDVI + Temp + Wind + Humidity |
| **Burned Area** | MODIS Burned Area | ✅ Available | No (GIBS) | Monthly | Historical analysis |

### 🌬️ Wind Data

| Data Type | API/Source | Status | API Key | Update Freq | Notes |
|-----------|------------|--------|---------|-------------|-------|
| **Wind Speed/Direction** | Open-Meteo API | ✅ Implemented | No | Hourly | Current + forecast |
| **Wind (High-Res)** | Copernicus Atmosphere | ✅ Available | Yes (Free) | 6 hours | Better for fire/pollution modeling |

---

## API Details & Integration

### 1. ✅ **NASA FIRMS - Fire Detection**

**Endpoint:** `https://firms.modaps.eosdis.nasa.gov/api/area/csv/{MAP_KEY}/VIIRS_SNPP_NRT/{bbox}/1`

**Parameters:**
- `MAP_KEY`: Your NASA FIRMS API key (register at https://firms.modaps.eosdis.nasa.gov/api/)
- `bbox`: `minLon,minLat,maxLon,maxLat` (e.g., `-10,30,-9,31`)
- `1`: Last 1 day of data

**Response Format:** CSV
```csv
latitude,longitude,brightness,scan,track,acq_date,acq_time,satellite,confidence,version,bright_t31,frp,daynight
30.45,-9.55,325.5,0.4,0.4,2025-10-04,1430,N,high,2.0NRT,290.2,12.5,D
```

**Integration:**
```typescript
// backend/src/services/firms.ts
const API_KEY = process.env.NASA_FIRMS_KEY
const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${API_KEY}/VIIRS_SNPP_NRT/${bbox}/1`
```

**Rate Limit:** 1000 requests/day  
**Cost:** Free

---

### 2. ✅ **Sentinel-5P TROPOMI - Air Quality (CO₂, NO₂, CH₄)**

**Access Method:** Copernicus Data Space Ecosystem

**Option A: Direct API (Recommended)**
```
https://catalogue.dataspace.copernicus.eu/odata/v1/Products?$filter=...
```

**Option B: Google Earth Engine**
```javascript
var no2 = ee.ImageCollection('COPERNICUS/S5P/NRTI/L3_NO2')
  .filterBounds(ee.Geometry.Point(-9.5981, 30.4278))
  .filterDate('2025-10-01', '2025-10-04')
  .select('NO2_column_number_density')
  .mean()
```

**Option C: Pre-rendered WMTS Tiles (Easiest)**
```
https://services.sentinel-hub.com/ogc/wmts/{INSTANCE_ID}?
  layer=NO2&
  tilematrixset=PopularWebMercator512&
  time=2025-10-04
```

**Integration Strategy:**
- Use Sentinel Hub API for visualization (WMTS tiles)
- Use Copernicus API for data extraction
- Cache daily averages

**Rate Limit:** 1000 requests/month (free tier)  
**Cost:** Free tier available, paid plans for higher usage

---

### 3. ✅ **Sentinel-2 NDVI - Vegetation Index**

**Access Method:** Google Earth Engine or Copernicus

**Google Earth Engine Code:**
```javascript
var s2 = ee.ImageCollection('COPERNICUS/S2_SR')
  .filterBounds(ee.Geometry.Point(-9.5981, 30.4278))
  .filterDate('2025-09-01', '2025-10-04')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))

var ndvi = s2.map(function(image) {
  return image.normalizedDifference(['B8', 'B4']).rename('NDVI')
}).mean()
```

**Alternative: MODIS NDVI (Easier)**
```
https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day/default/{time}/{TileMatrixSet}/{z}/{y}/{x}.png
```

**Integration:**
- Use MODIS NDVI WMTS tiles for quick visualization
- Use Sentinel-2 for detailed analysis (requires GEE account)

**Rate Limit:** Unlimited (GIBS), GEE has usage limits  
**Cost:** Free

---

### 4. ✅ **NASA GPM IMERG - Rainfall Data**

**Access Method:** NASA Earthdata

**Endpoint:** `https://gpm1.gesdisc.eosdis.nasa.gov/opendap/GPM_L3/GPM_3IMERGHH.06/`

**Alternative: GIBS WMTS**
```
https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/GPM_Precipitation_Rate_IMERG/default/{time}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png
```

**Integration:**
- Use GIBS tiles for visualization
- Use OpenDAP for data extraction (requires NASA Earthdata login)

**Rate Limit:** Unlimited (GIBS)  
**Cost:** Free

---

### 5. ✅ **Copernicus DEM - Elevation Data**

**Access Method:** Direct Download or API

**Download URL:**
```
https://prism-dem-open.copernicus.eu/pd-desk-open-access/prismDownload/COP-DEM_GLO-30-DGED__2023_1/
```

**For Agadir Region:**
- Tile: `Copernicus_DSM_COG_10_N30_00_W010_00_DEM`
- Resolution: 30m

**Integration:**
- Download DEM tiles for Agadir region
- Store locally or in cloud storage
- Use for flood risk calculation

**Cost:** Free

---

### 6. ✅ **WAQI (World Air Quality Index)**

**Endpoint:** `https://api.waqi.info/feed/geo:{lat};{lon}/?token={API_KEY}`

**Example:**
```
https://api.waqi.info/feed/geo:30.4278;-9.5981/?token=YOUR_TOKEN
```

**Response:**
```json
{
  "status": "ok",
  "data": {
    "aqi": 65,
    "idx": 12345,
    "city": { "name": "Agadir" },
    "iaqi": {
      "pm25": { "v": 43 },
      "pm10": { "v": 58 },
      "no2": { "v": 28 },
      "o3": { "v": 65 }
    }
  }
}
```

**Rate Limit:** 1000 requests/minute  
**Cost:** Free (register at https://aqicn.org/data-platform/token/)

---

### 7. ✅ **Open-Meteo - Weather & Wind**

**Already Implemented** ✅

**Endpoint:** `https://api.open-meteo.com/v1/forecast`

**Parameters for Enhanced Data:**
```
?latitude=30.4278
&longitude=-9.5981
&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m
&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant
&hourly=temperature_2m,precipitation,wind_speed_10m,wind_direction_10m
&forecast_days=7
```

**Rate Limit:** Unlimited  
**Cost:** Free

---

### 8. ✅ **Global Forest Watch - Tree Cover**

**Endpoint:** `https://data-api.globalforestwatch.org/dataset/umd_tree_cover_density_2000/latest/query`

**Example Query:**
```json
{
  "geometry": {
    "type": "Polygon",
    "coordinates": [[[-10, 30], [-9, 30], [-9, 31], [-10, 31], [-10, 30]]]
  },
  "sql": "SELECT tcd_2000 FROM data WHERE tcd_2000 > 30"
}
```

**Rate Limit:** 1000 requests/day  
**Cost:** Free (API key required)

---

## Implementation Roadmap

### Phase 1: Enhanced Air Quality (Week 1)
- [ ] Integrate WAQI API for better air quality coverage
- [ ] Add Sentinel-5P NO₂ visualization layer
- [ ] Implement CO₂ estimation algorithm

### Phase 2: Vegetation & O₂ (Week 2)
- [ ] Add MODIS NDVI layer via GIBS
- [ ] Implement O₂ estimation from NDVI + pollution data
- [ ] Add tree planting recommendation zones

### Phase 3: Flood Prediction (Week 3)
- [ ] Download Copernicus DEM for Agadir region
- [ ] Implement flood risk algorithm (DEM + rainfall + soil moisture)
- [ ] Add flood probability visualization

### Phase 4: Fire Risk Enhancement (Week 4)
- [ ] Complete NASA FIRMS integration with real API
- [ ] Implement fire risk prediction (NDVI + temp + wind + humidity)
- [ ] Add fire-prone zone visualization

### Phase 5: Advanced Features (Week 5+)
- [ ] Add Sentinel-1 SAR flood detection
- [ ] Implement soil moisture from NASA SMAP
- [ ] Add coastal flood risk from sea level data
- [ ] Create admin dashboard for threshold configuration

---

## Testing & Validation

### Test Coordinates (Agadir Region)

```javascript
const TEST_LOCATIONS = {
  agadir_center: { lat: 30.4278, lon: -9.5981 },
  agadir_beach: { lat: 30.4167, lon: -9.6000 },
  agadir_mountains: { lat: 30.5000, lon: -9.5000 },
  agadir_airport: { lat: 30.3250, lon: -9.4131 }
}

const TEST_BBOX = {
  agadir_city: "-9.65,30.35,-9.50,30.50",
  agadir_region: "-10.0,30.0,-9.0,31.0"
}
```

### API Testing Checklist

- [ ] NASA FIRMS: Test with real API key
- [ ] Sentinel-5P: Test WMTS tile loading
- [ ] MODIS NDVI: Verify GIBS tile availability
- [ ] WAQI: Test air quality data retrieval
- [ ] Copernicus DEM: Download and process tiles
- [ ] NASA GPM: Test rainfall visualization
- [ ] Open-Meteo: Verify wind data accuracy

### Data Validation

```bash
# Test FIRMS API
curl "https://firms.modaps.eosdis.nasa.gov/api/area/csv/YOUR_KEY/VIIRS_SNPP_NRT/-10,30,-9,31/1"

# Test WAQI API
curl "https://api.waqi.info/feed/geo:30.4278;-9.5981/?token=YOUR_TOKEN"

# Test Open-Meteo (already working)
curl "https://api.open-meteo.com/v1/forecast?latitude=30.4278&longitude=-9.5981&current=temperature_2m,wind_speed_10m"
```

---

## API Keys Required

### Free Registration Links

1. **NASA Earthdata** (FIRMS, GPM): https://urs.earthdata.nasa.gov/users/new
2. **WAQI Token**: https://aqicn.org/data-platform/token/
3. **Copernicus Data Space**: https://dataspace.copernicus.eu/
4. **Sentinel Hub**: https://www.sentinel-hub.com/
5. **Google Earth Engine**: https://earthengine.google.com/signup/
6. **Global Forest Watch**: https://www.globalforestwatch.org/

### Environment Variables

Add to `backend/.env`:
```bash
# NASA APIs
NASA_FIRMS_KEY=your_firms_key_here
NASA_EARTHDATA_USER=your_username
NASA_EARTHDATA_PASS=your_password

# Air Quality
WAQI_TOKEN=your_waqi_token_here

# Copernicus/Sentinel
COPERNICUS_CLIENT_ID=your_client_id
COPERNICUS_CLIENT_SECRET=your_client_secret
SENTINEL_HUB_INSTANCE_ID=your_instance_id

# Google Earth Engine (optional)
GEE_SERVICE_ACCOUNT_KEY=path/to/service-account-key.json
```

---

## Next Steps

1. **Register for API Keys** (see links above)
2. **Test APIs** with Agadir coordinates
3. **Implement Priority Services** (WAQI, NDVI, DEM)
4. **Build Visualization Layers** in frontend
5. **Create Prediction Algorithms** (flood, fire risk)
6. **Deploy & Monitor** API usage and performance

---

**Questions or Issues?**
- Check API documentation links above
- Review `API_REFERENCE.md` for current endpoints
- See `ARCHITECTURE.md` for system design

**Last Updated:** 2025-10-04  
**Status:** Ready for Implementation 🚀
