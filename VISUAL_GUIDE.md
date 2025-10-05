# 🎨 Visual Guide - Webma EarthGuard UI/UX

## Application Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  🌍 Webma EarthGuard    [Search: Agadir...]         🌙 Theme   │ TopNav
├─────────────────────────────────────────────────────────────────┤
│  ⚠️ Flood Watch in Inezgane — 80% rainfall probability...      │ AlertsBar
├──────────┬──────────────────────────────────────────┬───────────┤
│          │                                          │           │
│  Layers  │                                          │  Info     │
│  ┌────┐  │                                          │  Panel    │
│  │☑️ 🌊│  │                                          │           │
│  │☑️ 🔥│  │                                          │  📍 Area  │
│  │☐ 🌡️│  │          Interactive Map                │  Talborjt │
│  │☐ 💨│  │                                          │           │
│  │☐ 🌿│  │      (Leaflet + NASA GIBS Tiles)        │  Metrics  │
│  └────┘  │                                          │  ┌──────┐ │
│          │                                          │  │Risk  │ │
│  Legend  │                                          │  │Cards │ │
│  🔴 High │                                          │  └──────┘ │
│  🟠 Med  │                                          │           │
│  🟡 Low  │                                          │  Forecast │
│          │                                          │  Suggest. │
└──────────┴──────────────────────────────────────────┴───────────┘
```

## Color Palette

### Light Theme
```
Background Primary:   #ffffff  ████████
Background Secondary: #f5f5f5  ████████
Text Primary:         #1a1a1a  ████████
Text Secondary:       #666666  ████████
Border:               #e0e0e0  ████████
```

### Dark Theme
```
Background Primary:   #1a1a1a  ████████
Background Secondary: #2a2a2a  ████████
Text Primary:         #f5f5f5  ████████
Text Secondary:       #a0a0a0  ████████
Border:               #404040  ████████
```

### Accent Colors
```
Blue (Flood):         #3b82f6  ████████
Red (Heat):           #ef4444  ████████
Orange (Fire):        #f97316  ████████
Green (Vegetation):   #10b981  ████████
Purple (Air):         #8b5cf6  ████████
Yellow (Alerts):      #eab308  ████████
```

## Component Breakdown

### 1. TopNav (Header)

```
┌─────────────────────────────────────────────────────────────┐
│ 🌍 Webma EarthGuard                                         │
│    Environmental Risk & Resilience Map                      │
│                                                              │
│         🔍 [Search location (e.g., Agadir)...]              │
│                                                         🌙   │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Logo with emoji (🌍)
- Tagline subtitle
- Search bar (center)
- Theme toggle button (right)

**Interactions:**
- Click theme button → Toggle dark/light mode
- Type in search → Geocode and zoom to location (future)

---

### 2. AlertsBar (Warning Banner)

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️  💧 Flood Watch — 80% rainfall probability next 48h     │
│     🔥 Active fire detected 12km NE of Agadir              │
│     💨 Moderate air quality — PM2.5 levels elevated        │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Horizontal scroll for multiple alerts
- Color-coded by severity (yellow/orange/red gradient)
- Icon per alert type
- Auto-updates from `/api/alerts`

**Severity Colors:**
- High: Bold text, red icon
- Medium: Medium weight, orange icon
- Low: Normal weight, yellow icon

---

### 3. LayerToggle (Sidebar)

```
┌──────────────────────┐
│  Map Layers      ℹ️  │
├──────────────────────┤
│  ☑️ 💧 Flood Risk   │
│  ☑️ 🔥 Fire Risk    │
│  ☐ 🌡️ Heat Zones   │
│  ☐ 💨 Air Quality   │
│  ☐ 🌿 Vegetation    │
├──────────────────────┤
│  Legend              │
│  🔴 High Risk        │
│  🟠 Medium Risk      │
│  🟡 Low Risk         │
└──────────────────────┘
```

**Features:**
- Checkboxes to toggle layers
- Icon + label per layer
- Color indicator bar (right side)
- Legend at bottom
- Info icon for help

**Interactions:**
- Check/uncheck → Show/hide map layer
- Hover → Highlight row

---

### 4. MapContainer (Main View)

```
┌────────────────────────────────────────────────┐
│                                                │
│    🗺️  Interactive Leaflet Map                │
│                                                │
│    • Base: OpenStreetMap                      │
│    • Overlay: NASA GIBS WMTS tiles            │
│    • Markers: Fire/Air quality points         │
│    • Heatmaps: Temperature/pollution          │
│                                                │
│    [Click anywhere to view area details]      │
│                                                │
│                                    🔍 Zoom     │
│                                    + -         │
└────────────────────────────────────────────────┘
```

**Features:**
- Centered on Agadir (30.4278°N, 9.5981°W)
- Zoom controls (bottom-right)
- Attribution (bottom-left)
- Multiple tile layers

**Interactions:**
- Click → Open InfoPanel with area data
- Drag → Pan map
- Scroll → Zoom in/out
- Hover → Show tooltip (future)

**Tile Layers:**
1. **Base:** OpenStreetMap (always visible)
2. **Fire:** NASA GIBS FIRMS (toggle)
3. **Heat:** NASA GIBS MODIS LST (toggle)
4. **Air:** Heatmap from OpenAQ points (toggle)
5. **Flood:** Blue overlay (toggle)
6. **Vegetation:** Green polygons (toggle)

---

### 5. InfoPanel (Details Sidebar)

```
┌────────────────────────────────┐
│ 📍 Talborjt, Agadir        ✕  │
│    30.4278°N, 9.5981°W         │
├────────────────────────────────┤
│ Environmental Metrics          │
│                                │
│ ┌──────────┐  ┌──────────┐    │
│ │💧 Flood  │  │🔥 Fire   │    │
│ │Medium    │  │Low       │    │
│ └──────────┘  └──────────┘    │
│ ┌──────────┐  ┌──────────┐    │
│ │🌡️ Heat   │  │💨 Air    │    │
│ │34°C High │  │Moderate  │    │
│ └──────────┘  └──────────┘    │
│ ┌──────────┐                   │
│ │🌿 O₂     │                   │
│ │80%       │                   │
│ └──────────┘                   │
├────────────────────────────────┤
│ 5-Day Forecast                 │
│ Mon  🌡️ 32°C  💧 10%          │
│ Tue  🌡️ 33°C  💧 20%          │
│ Wed  🌡️ 34°C  💧 30%          │
│ Thu  🌡️ 35°C  💧 50%          │
│ Fri  🌡️ 34°C  💧 40%          │
├────────────────────────────────┤
│ 💡 AI-Driven Suggestions       │
│                                │
│ • Increase vegetation along    │
│   Boulevard Hassan II          │
│ • Install reflective coatings  │
│   on public roofs              │
│ • Prepare sandbags in low      │
│   areas near Avenue du Port    │
└────────────────────────────────┘
```

**Features:**
- Location name + coordinates
- Risk cards (2-column grid)
- Color-coded risk levels
- 5-day forecast table
- AI suggestions list
- Close button (top-right)

**Interactions:**
- Click ✕ → Close panel
- Scroll → View all content

**Risk Card Colors:**
- High: Red (#ef4444)
- Medium: Orange (#f97316)
- Low: Green (#10b981)

---

## User Flows

### Flow 1: View Area Risk
```
User opens app
  ↓
Map loads (Agadir center)
  ↓
User clicks on map location
  ↓
Frontend sends GET /api/risk?lat=X&lon=Y
  ↓
Backend fetches weather, air, fire data
  ↓
Backend calculates risk scores
  ↓
Backend generates suggestions
  ↓
InfoPanel opens with results
  ↓
User reads suggestions
```

### Flow 2: Toggle Fire Layer
```
User sees LayerToggle sidebar
  ↓
User checks "Fire Risk" checkbox
  ↓
Frontend adds NASA GIBS FIRMS tile layer
  ↓
Frontend sends GET /api/fires?bbox=...
  ↓
Backend returns GeoJSON of active fires
  ↓
Frontend renders fire markers on map
  ↓
User sees fire locations highlighted
```

### Flow 3: View Alerts
```
App loads
  ↓
Frontend sends GET /api/alerts?bbox=...
  ↓
Backend analyzes:
  - Precipitation (flood)
  - Active fires
  - Temperature (heat)
  - PM2.5 (air quality)
  ↓
Backend returns prioritized alerts
  ↓
AlertsBar displays warnings
  ↓
User sees scrolling alerts banner
```

### Flow 4: Toggle Dark Mode
```
User clicks moon icon (TopNav)
  ↓
Frontend toggles theme state
  ↓
document.documentElement.setAttribute('data-theme', 'dark')
  ↓
CSS variables update
  ↓
All components re-render with dark colors
```

---

## Responsive Design

### Desktop (> 1024px)
```
┌────────────────────────────────────────────┐
│  TopNav (full width)                       │
├──────┬────────────────────────┬────────────┤
│Layer │  Map (flex-grow)       │ InfoPanel  │
│Toggle│                        │ (380px)    │
│(280px)                        │            │
└──────┴────────────────────────┴────────────┘
```

### Tablet (768px - 1024px)
```
┌────────────────────────────────────────────┐
│  TopNav (full width)                       │
├──────┬─────────────────────────────────────┤
│Layer │  Map (flex-grow)                    │
│Toggle│                                     │
│(240px)  InfoPanel overlays map (absolute) │
└──────┴─────────────────────────────────────┘
```

### Mobile (< 768px)
```
┌────────────────────────────┐
│  TopNav (compact)          │
├────────────────────────────┤
│  Map (full width)          │
│                            │
│  LayerToggle (bottom)      │
│  InfoPanel (bottom sheet)  │
└────────────────────────────┘
```

---

## Typography

### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 
             'Fira Sans', 'Droid Sans', 'Helvetica Neue', 
             sans-serif;
```

### Font Sizes
- **Logo:** 1.5rem (24px) - Bold
- **Tagline:** 0.875rem (14px) - Regular
- **Section Headers:** 1rem (16px) - Semibold
- **Body Text:** 0.875rem (14px) - Regular
- **Small Text:** 0.75rem (12px) - Regular
- **Risk Values:** 0.875rem (14px) - Semibold

---

## Spacing System

```
4px   → 0.25rem → Tiny gaps
8px   → 0.5rem  → Small gaps
12px  → 0.75rem → Medium gaps
16px  → 1rem    → Standard gaps
24px  → 1.5rem  → Large gaps
32px  → 2rem    → Extra large gaps
```

---

## Border Radius

```
Small:  4px  → Buttons, inputs
Medium: 8px  → Cards, panels
Large:  12px → Modals, major containers
```

---

## Shadows

### Light Theme
```css
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);   /* Small */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);  /* Medium */
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);  /* Large */
```

### Dark Theme
```css
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);   /* Small */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);  /* Medium */
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);  /* Large */
```

---

## Icons (Lucide React)

| Component | Icon | Size | Color |
|-----------|------|------|-------|
| Search | `Search` | 18px | Secondary |
| Theme Toggle | `Moon`/`Sun` | 20px | Primary |
| Alerts | `AlertTriangle` | 18px | Warning |
| Flood | `Droplets` | 18px | Blue |
| Fire | `Flame` | 18px | Orange |
| Heat | `Thermometer` | 18px | Red |
| Air | `Wind` | 18px | Purple |
| Vegetation | `Trees` | 18px | Green |
| Location | `MapPin` | 20px | Primary |
| Suggestions | `Lightbulb` | 18px | Yellow |
| Close | `X` | 20px | Secondary |
| Info | `Info` | 16px | Secondary |

---

## Animations

### Hover Effects
```css
transition: background 0.2s ease;
transition: border-color 0.2s ease;
transition: transform 0.2s ease;
```

### Loading States
```css
/* Skeleton loader */
background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
animation: shimmer 1.5s infinite;
```

### Panel Transitions
```css
/* Slide in from right */
animation: slideInRight 0.3s ease-out;

/* Fade in */
animation: fadeIn 0.2s ease-in;
```

---

## Accessibility

### Color Contrast
- Text on background: Minimum 4.5:1 (WCAG AA)
- Large text: Minimum 3:1
- Icons: Minimum 3:1

### Keyboard Navigation
- Tab order: TopNav → Search → Theme → LayerToggle → Map → InfoPanel
- Enter/Space: Activate buttons
- Escape: Close InfoPanel
- Arrow keys: Pan map (future)

### ARIA Labels
```html
<button aria-label="Toggle theme">...</button>
<button aria-label="Close panel">...</button>
<input aria-label="Search location">...</input>
```

### Screen Reader Support
- Semantic HTML (`<nav>`, `<main>`, `<aside>`)
- Alt text for icons (via `aria-label`)
- Live regions for alerts (`role="alert"`)

---

## Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| First Contentful Paint | < 1.5s | Initial render |
| Time to Interactive | < 3s | Fully interactive |
| Largest Contentful Paint | < 2.5s | Map loaded |
| Cumulative Layout Shift | < 0.1 | Minimal reflow |
| Bundle Size (JS) | < 500KB | Gzipped |
| Bundle Size (CSS) | < 50KB | Gzipped |

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Safari 14+
- Chrome Android 90+

---

**Design System Version:** 0.1.0  
**Last Updated:** 2025-10-04
