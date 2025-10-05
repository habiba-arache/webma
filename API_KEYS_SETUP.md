# 🔑 API Keys Setup Guide

**Complete guide to registering and configuring all required API keys**

---

## 📋 Overview

This project uses multiple free APIs for environmental data. Most require registration but are **completely free** for reasonable usage.

### Required Keys (High Priority)
- ✅ **Open-Meteo** - No key required (already working)
- ✅ **OpenAQ** - No key required (already working)
- 🔑 **NASA FIRMS** - Fire detection (free, required)
- 🔑 **WAQI** - Enhanced air quality (free, required)

### Optional Keys (Advanced Features)
- 🔑 **Copernicus** - Sentinel satellite data
- 🔑 **Sentinel Hub** - WMTS tile service
- 🔑 **Google Earth Engine** - Advanced geospatial analysis

---

## 🚀 Quick Setup (15 minutes)

### Step 1: NASA FIRMS (Fire Detection)

**Why:** Real-time active fire detection from satellites

1. **Register:**
   - Go to: https://firms.modaps.eosdis.nasa.gov/api/
   - Click "Request API Key"
   - Fill in the form (name, email, organization)
   - Check your email for the API key

2. **Add to `.env`:**
   ```bash
   # backend/.env
   NASA_FIRMS_KEY=your_key_here_1234567890abcdef
   ```

3. **Test:**
   ```bash
   curl "https://firms.modaps.eosdis.nasa.gov/api/area/csv/YOUR_KEY/VIIRS_SNPP_NRT/-10,30,-9,31/1"
   ```

**Rate Limit:** 1,000 requests/day  
**Cost:** Free

---

### Step 2: WAQI (World Air Quality Index)

**Why:** Better air quality coverage than OpenAQ

1. **Register:**
   - Go to: https://aqicn.org/data-platform/token/
   - Enter your email
   - Accept terms
   - Receive token instantly via email

2. **Add to `.env`:**
   ```bash
   # backend/.env
   WAQI_TOKEN=your_token_here_abcdef123456
   ```

3. **Test:**
   ```bash
   curl "https://api.waqi.info/feed/geo:30.4278;-9.5981/?token=YOUR_TOKEN"
   ```

**Rate Limit:** 1,000 requests/minute  
**Cost:** Free

---

## 🌍 Advanced Setup (Optional)

### Step 3: Copernicus Data Space

**Why:** Access to Sentinel-2 (NDVI), Sentinel-5P (CO₂, NO₂), Sentinel-1 (SAR)

1. **Register:**
   - Go to: https://dataspace.copernicus.eu/
   - Click "Register"
   - Fill in details (name, email, organization)
   - Verify email
   - Login to get credentials

2. **Create OAuth Client:**
   - Go to: https://shapps.dataspace.copernicus.eu/dashboard/
   - Click "Create new client"
   - Note your Client ID and Client Secret

3. **Add to `.env`:**
   ```bash
   # backend/.env
   COPERNICUS_CLIENT_ID=your_client_id
   COPERNICUS_CLIENT_SECRET=your_client_secret
   ```

4. **Get Access Token:**
   ```bash
   curl -X POST "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token" \
     -d "grant_type=client_credentials" \
     -d "client_id=YOUR_CLIENT_ID" \
     -d "client_secret=YOUR_CLIENT_SECRET"
   ```

**Rate Limit:** 1,000 requests/month (free tier)  
**Cost:** Free tier available, paid plans for higher usage

---

### Step 4: Sentinel Hub

**Why:** Easy WMTS tile access for Sentinel data visualization

1. **Register:**
   - Go to: https://www.sentinel-hub.com/
   - Click "Sign Up"
   - Choose "Free Trial" (30 days, then free tier)
   - Verify email

2. **Create Configuration:**
   - Login to Dashboard
   - Go to "Configuration Utility"
   - Create new configuration
   - Note your Instance ID

3. **Add to `.env`:**
   ```bash
   # backend/.env
   SENTINEL_HUB_INSTANCE_ID=your_instance_id
   ```

4. **Get WMTS URL:**
   ```
   https://services.sentinel-hub.com/ogc/wmts/YOUR_INSTANCE_ID?
     layer=TRUE-COLOR&
     tilematrixset=PopularWebMercator512&
     time=2025-10-04
   ```

**Rate Limit:** 30,000 processing units/month (free tier)  
**Cost:** Free tier, then pay-as-you-go

---

### Step 5: Google Earth Engine (Advanced)

**Why:** Advanced NDVI calculation, time-series analysis

1. **Register:**
   - Go to: https://earthengine.google.com/signup/
   - Sign in with Google account
   - Fill in the application form
   - Wait for approval (usually 1-2 days)

2. **Create Service Account:**
   - Go to: https://console.cloud.google.com/
   - Create new project
   - Enable Earth Engine API
   - Create Service Account
   - Download JSON key file

3. **Add to `.env`:**
   ```bash
   # backend/.env
   GEE_SERVICE_ACCOUNT_KEY=/path/to/service-account-key.json
   ```

4. **Install Python Client (if needed):**
   ```bash
   pip install earthengine-api
   ```

**Rate Limit:** Varies by usage  
**Cost:** Free for research/education

---

## 📝 Complete `.env` File

### Backend Environment Variables

Create/update `backend/.env`:

```bash
# Server Configuration
PORT=8080
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development

# NASA APIs
NASA_FIRMS_KEY=your_firms_key_here
NASA_EARTHDATA_USER=your_username  # Optional
NASA_EARTHDATA_PASS=your_password  # Optional

# Air Quality
WAQI_TOKEN=your_waqi_token_here

# Copernicus/Sentinel (Optional)
COPERNICUS_CLIENT_ID=your_client_id
COPERNICUS_CLIENT_SECRET=your_client_secret
SENTINEL_HUB_INSTANCE_ID=your_instance_id

# Google Earth Engine (Optional)
GEE_SERVICE_ACCOUNT_KEY=/path/to/service-account-key.json

# Other APIs (Future)
OPENWEATHER_API_KEY=your_key  # If using OpenWeatherMap
MAPBOX_TOKEN=your_token  # If using Mapbox instead of Leaflet
```

### Frontend Environment Variables

Create/update `frontend/.env`:

```bash
# API Configuration
VITE_API_BASE=http://localhost:8080/api

# Map Configuration (Optional)
VITE_MAPBOX_TOKEN=your_token  # If using Mapbox
```

---

## ✅ Verification Checklist

### After Adding Keys

- [ ] **Restart backend server:**
  ```bash
  cd backend
  npm run dev
  ```

- [ ] **Test NASA FIRMS:**
  ```bash
  curl "http://localhost:8080/api/fires?bbox=-10,30,-9,31"
  ```

- [ ] **Test WAQI:**
  ```bash
  curl "http://localhost:8080/api/air/points?bbox=-10,30,-9,31"
  ```

- [ ] **Run full test script:**
  ```powershell
  .\test-apis.ps1
  ```

- [ ] **Check backend logs for errors:**
  - Look for "API key not configured" warnings
  - Verify no authentication errors

---

## 🔒 Security Best Practices

### DO ✅
- ✅ Keep `.env` files in `.gitignore`
- ✅ Use environment variables for all keys
- ✅ Rotate keys periodically
- ✅ Use different keys for dev/staging/prod
- ✅ Monitor API usage

### DON'T ❌
- ❌ Commit API keys to Git
- ❌ Share keys publicly
- ❌ Use production keys in development
- ❌ Hardcode keys in source code
- ❌ Expose keys in frontend code

### `.gitignore` Check

Ensure these are in `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env.production
*.env

# Service account keys
*-key.json
service-account*.json
```

---

## 📊 API Usage Limits

### Free Tier Limits

| API | Free Limit | Reset Period | Paid Option |
|-----|------------|--------------|-------------|
| Open-Meteo | Unlimited | - | No |
| OpenAQ | 10,000 req | Daily | No |
| WAQI | 1,000 req | Per minute | Yes |
| NASA FIRMS | 1,000 req | Daily | No |
| Copernicus | 1,000 req | Monthly | Yes |
| Sentinel Hub | 30,000 PU | Monthly | Yes |
| Google Earth Engine | Varies | - | Yes |

### Monitoring Usage

**Check current usage:**

```bash
# NASA FIRMS (check response headers)
curl -I "https://firms.modaps.eosdis.nasa.gov/api/area/csv/YOUR_KEY/VIIRS_SNPP_NRT/-10,30,-9,31/1"

# WAQI (check response)
curl "https://api.waqi.info/feed/geo:30.4278;-9.5981/?token=YOUR_TOKEN" | jq '.status'
```

**Set up alerts:**
- Monitor API response codes (429 = rate limited)
- Log API usage in backend
- Set up email alerts for quota warnings

---

## 🐛 Troubleshooting

### Issue: "API key not configured"

**Solution:**
1. Check `.env` file exists in `backend/` directory
2. Verify key name matches exactly (case-sensitive)
3. Restart backend server
4. Check for extra spaces in `.env` file

### Issue: "Invalid API key"

**Solution:**
1. Verify key is correct (copy-paste from email)
2. Check if key has been activated (some require email confirmation)
3. Try regenerating the key
4. Check API documentation for key format

### Issue: "Rate limit exceeded"

**Solution:**
1. Implement caching (already done in services)
2. Reduce request frequency
3. Use mock data fallbacks
4. Consider upgrading to paid tier

### Issue: "CORS error"

**Solution:**
1. Keys should only be in backend `.env`
2. Never use API keys in frontend code
3. Backend proxies all API requests
4. Check `CORS_ORIGIN` in backend `.env`

---

## 🔄 Key Rotation

### When to Rotate Keys

- Every 3-6 months (security best practice)
- If key is accidentally exposed
- When team members leave
- Before production deployment

### How to Rotate

1. **Generate new key** from API provider
2. **Update `.env`** with new key
3. **Test** with new key
4. **Deactivate old key** after 24-48 hours
5. **Update documentation** if needed

---

## 📞 Support Contacts

### If You Need Help

**NASA FIRMS:**
- Email: support@earthdata.nasa.gov
- Docs: https://firms.modaps.eosdis.nasa.gov/api/

**WAQI:**
- Email: contact@aqicn.org
- Docs: https://aqicn.org/api/

**Copernicus:**
- Forum: https://forum.dataspace.copernicus.eu/
- Docs: https://documentation.dataspace.copernicus.eu/

**Sentinel Hub:**
- Support: https://www.sentinel-hub.com/support/
- Docs: https://docs.sentinel-hub.com/

---

## ✨ Quick Commands

### Test All APIs
```powershell
.\test-apis.ps1
```

### Check Environment Variables
```bash
# Backend
cat backend/.env

# Frontend
cat frontend/.env
```

### Restart Services
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

---

**Status:** Ready to configure! Start with NASA FIRMS and WAQI (15 minutes) 🚀
