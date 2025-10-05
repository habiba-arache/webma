# 🎯 Multi-Layer Analysis Circle Guide

## New Features Added

### 1. **Drag-Based Circle Drawing** ✨
- **Click and drag** to draw analysis circles anywhere on the map
- **Real-time preview** - see the circle grow as you drag
- **Flexible radius** - draw circles as small or large as you need
- Works with **ALL map layers** simultaneously

### 2. **Multi-Layer Analysis**
The circle tool now analyzes **all enabled layers** and shows relevant data:

#### 🌬️ **Air Quality**
- Shows real monitoring station locations
- Color-coded icons by AQI level:
  - 🟢 Green (0-50): Good
  - 🟡 Yellow (51-100): Moderate
  - 🟠 Orange (101-150): Unhealthy for Sensitive Groups
  - 🔴 Red (151-200): Unhealthy
  - 🟣 Purple (201-300): Very Unhealthy
  - 🟤 Maroon (300+): Hazardous
- Only shows **actual monitoring stations** within circle

#### 🔥 **Fire Risk**
- Shows fire risk icons at high-risk locations
- **Smart positioning**: Fire risks only appear on land (not in sea/water)
- Displays temperature and humidity data
- Only shows Medium/High/Extreme risks

#### 💧 **Flood Risk**
- Shows flood risk icons in vulnerable areas
- Displays probability percentage
- Only shows Medium/High risks

#### 🌡️ **Heat Zones**
- Shows heat alert icons when temperature ≥ 30°C
- Displays current temperature and humidity
- Helps identify heat stress areas

#### 🌳 **Vegetation**
- Shows vegetation deficit areas (NDVI < 0.3)
- Displays NDVI value and O₂ estimates
- Identifies areas needing green space

### 3. **How to Use**

#### Step-by-Step:
1. **Enable layers** you want to analyze (e.g., Air Quality + Fire Risk)
2. **Click "🎯 Draw Analysis Circle"** button (top-right of map)
3. **Click and hold** on the map where you want the center
4. **Drag** to set the radius size
5. **Release** to finalize - icons appear instantly!
6. **Click icons** to see detailed information
7. **Click "🗑️ Clear Circle"** to remove and start over

### 3. **Delete Circle Functionality**
- Click the **"🗑️ Clear Circle"** button to remove the filter
- All air quality markers in the viewport will be restored
- You can draw a new circle immediately after clearing

## Usage Tips

### Best Practices:
- **Enable multiple layers** for comprehensive analysis (e.g., Fire + Heat + Vegetation)
- **Zoom in** before drawing for precise area selection
- **Draw circles over land** for fire/vegetation analysis (not over sea)
- **Use different sizes** - small circles for neighborhoods, large for districts
- **Click icons** to see detailed metrics and suggestions

### Example Use Cases:
1. **Urban Planning**: Draw circle around development site → check all environmental risks
2. **Emergency Response**: Enable Fire + Air Quality → identify evacuation zones
3. **Health Studies**: Analyze air quality + heat stress in residential areas
4. **Environmental Assessment**: Check vegetation + flood risk for green infrastructure planning
5. **Comparison Analysis**: Draw multiple circles to compare different neighborhoods

## Technical Details

### Performance Optimizations:
- ✅ Lazy loading of map components
- ✅ React.memo for preventing unnecessary re-renders
- ✅ useCallback for stable function references
- ✅ Efficient marker filtering using distance calculations

### Circle Drawing Logic:
- **Drag-based interaction**: Click and drag to draw (not two clicks)
- Uses Leaflet's native circle with real-time radius updates
- Calculates distance using `distanceTo()` method
- Fetches data for **all enabled layers** within circle
- Smart filtering: only shows relevant risks (e.g., fire on land, not sea)

### Icon System:
- **💨 Air Quality**: Color-coded by AQI level at real monitoring stations
- **🔥 Fire Risk**: Orange icons for Medium/High fire danger
- **💧 Flood Risk**: Blue icons for flood-prone areas
- **🌡️ Heat**: Red icons when temperature ≥ 30°C
- **🌳 Vegetation**: Green icons for low NDVI areas

## Troubleshooting

### Circle not appearing?
- Make sure you **click and drag** (not just click)
- Check that drawing mode is active (button should say "⏸️ Cancel Drawing")
- Try drawing a larger circle (drag further from center)

### No icons showing?
- **Enable at least one layer** in the layer panel before drawing
- Ensure you're viewing an area with data (e.g., Agadir for air quality)
- For **air quality**: Real monitoring stations only (limited coverage)
- For **fire risk**: Only shows Medium/High risks on land
- Try zooming in/out to see if data is available

### Icons in wrong places?
- **Air quality icons** appear at actual monitoring station locations
- **Other icons** appear at circle center (fire, flood, heat, vegetation)
- This is expected behavior - air quality uses real GPS coordinates

### Button not visible?
- The draw button appears after map initialization (~2-3 seconds)
- Refresh the page if it doesn't appear

## Advanced Features

### Multi-Layer Analysis:
Enable multiple layers before drawing to see combined environmental risks:
- **Fire + Heat + Vegetation**: Identify wildfire-prone areas
- **Flood + Vegetation**: Plan green infrastructure for flood mitigation
- **Air Quality + Heat**: Assess health risks in urban areas

### Cancel Drawing:
- Click the button again (shows "⏸️ Cancel Drawing") to exit drawing mode
- Or press ESC key (if implemented)

## Future Enhancements
- [ ] Save drawn circles for later reference
- [ ] Export filtered data to CSV/JSON
- [ ] Multiple circles simultaneously
- [ ] Polygon drawing for irregular shapes
- [ ] Historical data comparison within circle
- [ ] Heatmap overlay within circle area
