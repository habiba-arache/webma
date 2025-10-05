# 🚀 Quick Start Guide - Webma EarthGuard

## ✅ Your App is Now Running!

Both servers are currently active:
- **Backend**: http://localhost:8080
- **Frontend**: http://localhost:5173

## 🎯 How to Use the App

### Opening the App
Simply visit: **http://localhost:5173** in your browser

### Features Available

1. **Interactive Map**
   - The map is centered on Agadir, Morocco
   - Click anywhere on the map to see environmental data for that location
   - Zoom in/out using mouse wheel or +/- buttons

2. **Layer Controls** (Left Sidebar)
   - Toggle different environmental layers:
     - 🌊 **Flood Risk** - Rainfall-based predictions
     - 🔥 **Fire Risk** - NASA FIRMS active fires (real satellite data)
     - 🌡️ **Heat Zones** - MODIS Land Surface Temperature (real satellite data)
     - 💨 **Air Quality** - PM2.5, NO₂, O₃ levels
     - 🌿 **Vegetation** - Coverage analysis

3. **Info Panel** (Right Side)
   - Appears when you click on the map
   - Shows detailed environmental metrics
   - Displays 5-day forecast
   - Provides AI-driven suggestions for mitigation

4. **Alerts Bar** (Top)
   - Shows active environmental hazards
   - Color-coded by severity (High/Medium/Low)

5. **Dark/Light Mode**
   - Toggle using the moon/sun icon in top-right corner

## 🔄 Starting the App (Next Time)

### Option 1: Use the Simple Script (Recommended)
Double-click: **START.ps1**

Or right-click → "Run with PowerShell"

### Option 2: Manual Start
1. Open two PowerShell windows
2. In first window:
   ```powershell
   cd backend
   npm run dev
   ```
3. In second window:
   ```powershell
   cd frontend
   npm run dev
   ```
4. Open browser to http://localhost:5173

## 🛑 Stopping the App

Press **Ctrl+C** in each PowerShell window to stop the servers.

## 🎨 Current Design Features

### Modern UI/UX
- ✅ Clean, professional interface
- ✅ Responsive layout
- ✅ Dark/Light theme support
- ✅ Smooth animations and transitions
- ✅ Intuitive controls
- ✅ Color-coded risk indicators

### Visual Elements
- **Color Scheme**:
  - Red (#ef4444) - High Risk
  - Orange (#f97316) - Medium Risk
  - Yellow (#eab308) - Low Risk
  - Blue (#3b82f6) - Water/Flood
  - Green (#10b981) - Vegetation/Safe
  - Purple (#8b5cf6) - Air Quality

- **Typography**: System fonts for optimal readability
- **Icons**: Lucide React icons throughout
- **Shadows**: Subtle depth for panels and controls

## 📊 Data Sources

### Currently Active
- **NASA GIBS** - Real-time satellite imagery for fires and heat
- **OpenStreetMap** - Base map tiles
- **Mock Data** - For demo purposes (weather, air quality)

### API Endpoints Available
- `GET /api/health` - Server health check
- `GET /api/fires?bbox=...` - Active fires (GeoJSON)
- `GET /api/air/points?bbox=...` - Air quality points
- `GET /api/weather?lat=...&lon=...` - Weather forecast
- `GET /api/risk?lat=...&lon=...` - Risk analysis + suggestions
- `GET /api/alerts?bbox=...` - Active alerts

## 🐛 Troubleshooting

### App Won't Start
1. Make sure Node.js is installed: `node --version`
2. If not, run: **INSTALL_NODEJS.bat**
3. Close and reopen PowerShell/VS Code
4. Try again with **START.ps1**

### Port Already in Use
If you see "port already in use" errors:
- Backend (8080): Another app is using this port
- Frontend (5173): Another Vite app is running

**Solution**: Close other apps or change ports in:
- Backend: `backend/.env` (PORT=8080)
- Frontend: `frontend/vite.config.ts` (port: 5173)

### Blank Screen
1. Check browser console (F12) for errors
2. Verify backend is running: http://localhost:8080/api/health
3. Check that .env files exist in both frontend and backend folders

## 🔧 Development Notes

### Current State
- ✅ Frontend fully designed and styled
- ✅ Backend API structure complete
- ✅ Real NASA satellite data integration
- ⚠️ Some features using mock data (will be replaced with real APIs)

### Next Steps (Optional Enhancements)
- Connect weather API for real forecast data
- Integrate OpenAQ for live air quality
- Add user authentication
- Implement data persistence
- Add search/geocoding functionality

## 📱 Browser Compatibility

Tested and working on:
- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari

## 💡 Tips

1. **Best Experience**: Use Chrome or Edge in fullscreen mode
2. **Performance**: Disable layers you don't need to improve map performance
3. **Exploration**: Try clicking different areas to see varied environmental data
4. **Dark Mode**: Better for extended viewing sessions

---

**Enjoy exploring environmental data with Webma EarthGuard! 🌍**
