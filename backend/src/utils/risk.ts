export interface RiskScore {
  floodRisk: string
  fireRisk: string
  heatRisk: string
  airQualityRisk: string
  o2Estimate: string
}

export function calculateRiskScore(
  lat: number,
  lon: number,
  weatherData: any,
  airData: any,
  firesNearby: number
): RiskScore {
  // Simple heuristic-based risk calculation for MVP
  
  // Flood risk based on precipitation forecast
  const precip = weatherData?.daily?.precipitation_sum?.[0] || 0
  let floodRisk = 'Low'
  if (precip > 60) floodRisk = 'High (>60mm rainfall expected)'
  else if (precip > 30) floodRisk = 'Medium (30-60mm rainfall expected)'
  else floodRisk = `Low (${precip.toFixed(0)}mm rainfall expected)`

  // Fire risk based on nearby fires, temperature, and humidity
  const temp = weatherData?.current?.temperature_2m || 25
  const humidity = weatherData?.current?.relative_humidity_2m || 50
  let fireRisk = 'Low'
  if (firesNearby > 0 && temp > 32 && humidity < 40) {
    fireRisk = `High (${firesNearby} active fires nearby, temp ${temp}°C, humidity ${humidity}%)`
  } else if (temp > 35 || humidity < 30) {
    fireRisk = `Medium (temp ${temp}°C, humidity ${humidity}%)`
  } else {
    fireRisk = `Low (humidity ${humidity}%)`
  }

  // Heat risk
  const maxTemp = weatherData?.daily?.temperature_2m_max?.[0] || temp
  let heatRisk = 'Low'
  if (maxTemp > 38) heatRisk = `High (${maxTemp}°C expected)`
  else if (maxTemp > 34) heatRisk = `Medium (${maxTemp}°C expected)`
  else heatRisk = `${maxTemp}°C, Low risk`

  // Air quality risk
  const pm25 = airData?.pm25 || 0
  let airQualityRisk = 'Good'
  if (pm25 > 55) airQualityRisk = `Unhealthy (PM2.5: ${pm25.toFixed(0)} µg/m³)`
  else if (pm25 > 35) airQualityRisk = `Moderate (PM2.5: ${pm25.toFixed(0)} µg/m³)`
  else if (pm25 > 0) airQualityRisk = `Good (PM2.5: ${pm25.toFixed(0)} µg/m³)`
  else airQualityRisk = 'No data available'

  // O2 estimate (derived from vegetation proxy and pollution)
  const vegetationProxy = 0.8 // Mock value for MVP
  const pollutionFactor = Math.max(0, 1 - pm25 / 100)
  const o2Estimate = Math.round(vegetationProxy * pollutionFactor * 100)

  return {
    floodRisk,
    fireRisk,
    heatRisk,
    airQualityRisk,
    o2Estimate: `${o2Estimate}% of normal`,
  }
}

export function generateSuggestions(risk: RiskScore): string[] {
  const suggestions: string[] = []

  if (risk.floodRisk.includes('High') || risk.floodRisk.includes('Medium')) {
    suggestions.push('Prepare sandbags in low-lying areas — possible flooding from rainfall forecast.')
    suggestions.push('Clear drainage systems and gutters to prevent water accumulation.')
  }

  if (risk.fireRisk.includes('High') || risk.fireRisk.includes('Medium')) {
    suggestions.push('Avoid open fires near suburban dry areas for the next 72 hours.')
    suggestions.push('Monitor local fire alerts and keep emergency contacts ready.')
  }

  if (risk.heatRisk.includes('High') || risk.heatRisk.includes('Medium')) {
    suggestions.push('Install reflective coatings on public roofs nearby to reduce surface temp by 2–3°C.')
    suggestions.push('Increase tree canopy coverage in exposed areas to provide shade.')
  }

  if (risk.airQualityRisk.includes('Unhealthy') || risk.airQualityRisk.includes('Moderate')) {
    suggestions.push('Increase vegetation along main boulevards to improve air quality.')
    suggestions.push('Consider car-free zones during peak pollution hours.')
  }

  if (parseInt(risk.o2Estimate) < 85) {
    suggestions.push('Plant more trees and create green spaces to boost oxygen production.')
  }

  if (suggestions.length === 0) {
    suggestions.push('Environmental conditions are currently favorable. Continue monitoring.')
  }

  return suggestions
}
