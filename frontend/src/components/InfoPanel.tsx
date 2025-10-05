import { memo, useMemo } from 'react'
import { X, MapPin, Droplets, Flame, Thermometer, Wind, Leaf, Lightbulb } from 'lucide-react'
import type { AreaInfo } from '../App'
import './InfoPanel.css'

interface InfoPanelProps {
  area: AreaInfo
  onClose: () => void
}

function InfoPanel({ area, onClose }: InfoPanelProps) {
  const getRiskColor = (risk: string) => {
    if (risk.toLowerCase().includes('high')) return '#ef4444'
    if (risk.toLowerCase().includes('medium')) return '#f97316'
    return '#10b981'
  }

  const risks = useMemo(() => [
    { label: 'Flood Risk', value: area.floodRisk, icon: Droplets },
    { label: 'Fire Risk', value: area.fireRisk, icon: Flame },
    { label: 'Heat Index', value: area.heatRisk, icon: Thermometer },
    { label: 'Air Quality', value: area.airQuality, icon: Wind },
    { label: 'O₂ Estimate', value: area.o2Estimate, icon: Leaf },
  ], [area.floodRisk, area.fireRisk, area.heatRisk, area.airQuality, area.o2Estimate])

  return (
    <div className="info-panel">
      <div className="panel-header">
        <div className="panel-title">
          <MapPin size={20} />
          <div>
            <h3>{area.name}</h3>
            <p className="coordinates">
              {area.lat.toFixed(4)}°N, {area.lon.toFixed(4)}°W
            </p>
          </div>
        </div>
        <button className="close-btn" onClick={onClose} aria-label="Close panel">
          <X size={20} />
        </button>
      </div>

      <div className="panel-content">
        <section className="risk-section">
          <h4>Environmental Metrics</h4>
          <div className="risk-grid">
            {risks.map(({ label, value, icon: Icon }) => (
              <div key={label} className="risk-card">
                <div className="risk-header">
                  <Icon size={16} style={{ color: getRiskColor(value) }} />
                  <span className="risk-label">{label}</span>
                </div>
                <p className="risk-value" style={{ color: getRiskColor(value) }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="forecast-section">
          <h4>5-Day Forecast</h4>
          <div className="forecast-grid">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
              <div key={day} className="forecast-day">
                <span className="day-label">{day}</span>
                <Thermometer size={14} />
                <span className="temp">{32 + i}°C</span>
                <Droplets size={14} />
                <span className="precip">{10 * (i + 1)}%</span>
              </div>
            ))}
          </div>
        </section>

        <section className="suggestions-section">
          <h4>
            <Lightbulb size={18} />
            AI-Driven Suggestions
          </h4>
          <ul className="suggestions-list">
            {area.suggestions.map((suggestion, i) => (
              <li key={i}>{suggestion}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

export default memo(InfoPanel)