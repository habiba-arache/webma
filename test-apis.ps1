# API Testing Script for Webma EarthGuard
# Tests all new environmental data endpoints

$API_BASE = "http://localhost:8080/api"
$LAT = 30.4278
$LON = -9.5981

Write-Host "🌍 Testing Webma EarthGuard APIs" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Test Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/health" -Method Get
    Write-Host "✅ Health: $($response.status)" -ForegroundColor Green
    Write-Host "   Timestamp: $($response.timestamp)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test Vegetation API
Write-Host "2. Testing Vegetation API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/vegetation?lat=$LAT&lon=$LON" -Method Get
    Write-Host "✅ Vegetation Data:" -ForegroundColor Green
    Write-Host "   NDVI: $($response.ndvi)" -ForegroundColor Gray
    Write-Host "   Level: $($response.vegetationLevel)" -ForegroundColor Gray
    Write-Host "   O₂ Estimate: $($response.o2Estimate)%" -ForegroundColor Gray
    Write-Host "   Tree Recommendation: $($response.treeRecommendation)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Vegetation API failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test Tree Planting Priority
Write-Host "3. Testing Tree Planting Priority..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/vegetation/planting-priority?lat=$LAT&lon=$LON&temp=35&pm25=45" -Method Get
    Write-Host "✅ Planting Priority:" -ForegroundColor Green
    Write-Host "   Priority: $($response.priority)" -ForegroundColor Gray
    Write-Host "   Score: $($response.score)" -ForegroundColor Gray
    Write-Host "   Reason: $($response.reason)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Planting priority failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test Flood Risk API
Write-Host "4. Testing Flood Risk API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/flood?lat=$LAT&lon=$LON" -Method Get
    Write-Host "✅ Flood Risk Data:" -ForegroundColor Green
    Write-Host "   Risk Level: $($response.riskLevel)" -ForegroundColor Gray
    Write-Host "   Probability: $($response.probability)%" -ForegroundColor Gray
    Write-Host "   Rainfall: $($response.factors.rainfall)mm" -ForegroundColor Gray
    Write-Host "   Elevation: $($response.factors.elevation)m" -ForegroundColor Gray
    Write-Host "   Predictions:" -ForegroundColor Gray
    Write-Host "     24h: $($response.prediction.next24h)" -ForegroundColor DarkGray
    Write-Host "     48h: $($response.prediction.next48h)" -ForegroundColor DarkGray
    Write-Host "     72h: $($response.prediction.next72h)" -ForegroundColor DarkGray
} catch {
    Write-Host "❌ Flood API failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test Fire Risk API
Write-Host "5. Testing Fire Risk API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/fire-risk?lat=$LAT&lon=$LON" -Method Get
    Write-Host "✅ Fire Risk Data:" -ForegroundColor Green
    Write-Host "   Risk Level: $($response.riskLevel)" -ForegroundColor Gray
    Write-Host "   Probability: $($response.probability)%" -ForegroundColor Gray
    Write-Host "   Temperature: $($response.factors.temperature)°C" -ForegroundColor Gray
    Write-Host "   Humidity: $($response.factors.humidity)%" -ForegroundColor Gray
    Write-Host "   Wind Speed: $($response.factors.windSpeed) km/h" -ForegroundColor Gray
    Write-Host "   Fire Spread: $($response.spread.description)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Fire Risk API failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test Weather API (existing)
Write-Host "6. Testing Weather API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/weather?lat=$LAT&lon=$LON" -Method Get
    Write-Host "✅ Weather Data:" -ForegroundColor Green
    Write-Host "   Temperature: $($response.current.temperature_2m)°C" -ForegroundColor Gray
    Write-Host "   Humidity: $($response.current.relative_humidity_2m)%" -ForegroundColor Gray
    Write-Host "   Precipitation: $($response.current.precipitation)mm" -ForegroundColor Gray
    Write-Host "   Wind Speed: $($response.current.wind_speed_10m) km/h" -ForegroundColor Gray
} catch {
    Write-Host "❌ Weather API failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test Air Quality API (existing)
Write-Host "7. Testing Air Quality API..." -ForegroundColor Yellow
try {
    $bbox = "-10,30,-9,31"
    $response = Invoke-RestMethod -Uri "$API_BASE/air/points?bbox=$bbox&parameters=pm25,no2,o3" -Method Get
    $pointCount = $response.features.Count
    Write-Host "✅ Air Quality Data:" -ForegroundColor Green
    Write-Host "   Points found: $pointCount" -ForegroundColor Gray
    if ($pointCount -gt 0) {
        $firstPoint = $response.features[0].properties
        Write-Host "   First point:" -ForegroundColor Gray
        Write-Host "     Location: $($firstPoint.location)" -ForegroundColor DarkGray
        Write-Host "     PM2.5: $($firstPoint.pm25)" -ForegroundColor DarkGray
        Write-Host "     NO₂: $($firstPoint.no2)" -ForegroundColor DarkGray
        Write-Host "     O₃: $($firstPoint.o3)" -ForegroundColor DarkGray
    }
} catch {
    Write-Host "❌ Air Quality API failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test Fires API (existing)
Write-Host "8. Testing Fires API..." -ForegroundColor Yellow
try {
    $bbox = "-10,30,-9,31"
    $response = Invoke-RestMethod -Uri "$API_BASE/fires?bbox=$bbox" -Method Get
    $fireCount = $response.features.Count
    Write-Host "✅ Fires Data:" -ForegroundColor Green
    Write-Host "   Active fires: $fireCount" -ForegroundColor Gray
    if ($fireCount -gt 0) {
        $firstFire = $response.features[0].properties
        Write-Host "   First fire:" -ForegroundColor Gray
        Write-Host "     Brightness: $($firstFire.brightness)" -ForegroundColor DarkGray
        Write-Host "     Confidence: $($firstFire.confidence)" -ForegroundColor DarkGray
    }
} catch {
    Write-Host "❌ Fires API failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test Risk Analysis API (existing)
Write-Host "9. Testing Risk Analysis API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/risk?lat=$LAT&lon=$LON" -Method Get
    Write-Host "✅ Risk Analysis:" -ForegroundColor Green
    Write-Host "   Flood Risk: $($response.floodRisk)" -ForegroundColor Gray
    Write-Host "   Fire Risk: $($response.fireRisk)" -ForegroundColor Gray
    Write-Host "   Heat Risk: $($response.heatRisk)" -ForegroundColor Gray
    Write-Host "   Air Quality Risk: $($response.airQualityRisk)" -ForegroundColor Gray
    Write-Host "   Suggestions: $($response.suggestions.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Risk Analysis API failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test Alerts API (existing)
Write-Host "10. Testing Alerts API..." -ForegroundColor Yellow
try {
    $bbox = "-10,30,-9,31"
    $response = Invoke-RestMethod -Uri "$API_BASE/alerts?bbox=$bbox" -Method Get
    $alertCount = $response.alerts.Count
    Write-Host "✅ Alerts:" -ForegroundColor Green
    Write-Host "   Active alerts: $alertCount" -ForegroundColor Gray
    if ($alertCount -gt 0) {
        foreach ($alert in $response.alerts) {
            Write-Host "   - [$($alert.severity)] $($alert.type): $($alert.message)" -ForegroundColor DarkGray
        }
    }
} catch {
    Write-Host "❌ Alerts API failed: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✅ API Testing Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Notes:" -ForegroundColor Yellow
Write-Host "   - Make sure backend is running: cd backend && npm run dev" -ForegroundColor Gray
Write-Host "   - Some APIs use mock data until API keys are configured" -ForegroundColor Gray
Write-Host "   - Check API_INTEGRATION_GUIDE.md for API key setup" -ForegroundColor Gray
Write-Host ""
