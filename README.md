# 🌍 Webma EarthGuard – Environmental Risk & Resilience Map

A real-time web application that visualizes environmental hazards (floods, fires, heat, air pollution) with AI-driven insights and actionable mitigation suggestions.

## 🎯 Features

- **Interactive Map** centered on Agadir, Morocco (expandable to global coverage)
- **Multi-Layer Visualization**
  - 🌊 Flood Risk (rainfall-based predictions)
  - 🔥 Fire Risk (NASA FIRMS active fires)
  - 🌡️ Heat Zones (MODIS Land Surface Temperature)
  - 💨 Air Quality (OpenAQ sensors: PM2.5, NO₂, O₃)
  - 🌿 Vegetation Coverage
- **Risk Analysis** with AI-driven suggestions for urban planning and community action
- **Live Alerts** for environmental hazards
- **5-Day Forecast** integration
- **Dark/Light Mode** for accessibility

## 🏗️ Architecture

### Frontend
- **React** + **TypeScript** + **Vite**
- **Leaflet** for map rendering (no API key required)
- **Lucide React** for icons
- **NASA GIBS WMTS** tiles for satellite imagery

### Backend
- **Node.js** + **Express** + **TypeScript**
- **Open-Meteo API** for weather/forecast (free, no key)
- **OpenAQ API** for air quality data
- **NASA FIRMS** for fire detection (mock data in MVP; API key needed for production)

## 📦 Installation

### Prerequisites
- **Node.js** 18+ and **npm**

### Setup

1. **Clone or navigate to the project directory**
   ```bash
   cd TEST
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../backend
   npm install
   ```

4. **Configure environment variables**
   
   Frontend (`.env` already created):
   ```
   VITE_API_BASE=http://localhost:8080/api
   ```
   
   Backend (`.env` already created):
   ```
   PORT=8080
   CORS_ORIGIN=http://localhost:5173
   NODE_ENV=development
   ```

## 🚀 Running the Application

### Development Mode

1. **Start the backend** (from `backend/` directory):
   ```bash
   npm run dev
   ```
   Backend will run on `http://localhost:8080`

2. **Start the frontend** (from `frontend/` directory, in a new terminal):
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

3. **Open your browser** and navigate to `http://localhost:5173`

## 🗺️ Usage

1. **Toggle Layers** using the sidebar (Flood, Fire, Heat, Air Quality, Vegetation)
2. **Click on the map** to view detailed environmental metrics for that location
3. **View AI Suggestions** in the InfoPanel for mitigation actions
4. **Monitor Alerts** in the top banner for active hazards
5. **Search** for locations using the search bar (geocoding integration coming soon)
6. **Toggle Dark Mode** using the moon/sun icon in the top-right

## 📡 API Endpoints

### Backend Routes

- `GET /api/health` - Health check
- `GET /api/fires?bbox=minLon,minLat,maxLon,maxLat` - Active fires (GeoJSON)
- `GET /api/air/points?bbox=...&parameters=pm25,no2,o3` - Air quality points
- `GET /api/weather?lat=...&lon=...` - Weather forecast (7 days)
- `GET /api/risk?lat=...&lon=...` - Comprehensive risk analysis + suggestions
- `GET /api/alerts?bbox=...` - Active environmental alerts

## 🧪 Data Sources

| Type | Source | Notes |
|------|--------|-------|
| Fires | NASA FIRMS (VIIRS/MODIS) | Mock data in MVP; requires API key for production |
| Heat | NASA GIBS MODIS LST | WMTS tiles, no key required |
| Air Quality | OpenAQ | Free API, rate-limited |
| Weather | Open-Meteo | Free API, no key required |
| Base Map | OpenStreetMap | Free tiles |

## 🔮 Future Enhancements

- [ ] User accounts and saved views
- [ ] Community "Report an Issue" feature
- [ ] Real-time IoT sensor integration
- [ ] ML-based flood/fire prediction models
- [ ] Government dashboard with PDF export
- [ ] Mobile app (React Native)
- [ ] Sentinel-2 NDVI computation for vegetation
- [ ] Google Earth Engine integration
- [ ] PostgreSQL + PostGIS for data persistence

## 🚢 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Set root directory to `frontend/`
4. Add environment variable: `VITE_API_BASE=https://your-backend-url/api`
5. Deploy

### Backend (Render/AWS)
1. Create new Web Service on Render
2. Set root directory to `backend/`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables (`PORT`, `CORS_ORIGIN`)

## 📄 License

MIT License - feel free to use for educational or commercial purposes.

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

---

**Built with ❤️ for a sustainable future**
