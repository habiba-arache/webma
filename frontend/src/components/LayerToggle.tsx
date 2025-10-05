import { Droplets, Flame, Thermometer, Wind, Trees, Info } from 'lucide-react'
import type { LayerState } from '../App'
import './LayerToggle.css'

interface LayerToggleProps {
  layers: LayerState
  onToggleLayer: (layer: keyof LayerState) => void
}

export default function LayerToggle({ layers, onToggleLayer }: LayerToggleProps) {
  const layerConfig = [
    { key: 'flood' as const, label: 'Flood Risk', icon: Droplets, color: '#3b82f6' },
    { key: 'fire' as const, label: 'Fire Risk', icon: Flame, color: '#f97316' },
    { key: 'heat' as const, label: 'Heat Zones', icon: Thermometer, color: '#ef4444' },
    { key: 'airQuality' as const, label: 'Air Quality', icon: Wind, color: '#8b5cf6' },
    { key: 'vegetation' as const, label: 'Vegetation', icon: Trees, color: '#10b981' },
  ]

  return (
    <div className="layer-toggle">
      <div className="layer-header">
        <h3>Map Layers</h3>
        <Info size={16} className="info-icon" />
      </div>
      <div className="layer-list">
        {layerConfig.map(({ key, label, icon: Icon, color }) => (
          <label key={key} className="layer-item">
            <input
              type="checkbox"
              checked={layers[key]}
              onChange={() => onToggleLayer(key)}
              className="layer-checkbox"
            />
            <div className="layer-content">
              <Icon size={18} style={{ color }} />
              <span className="layer-label">{label}</span>
            </div>
            <div className="layer-indicator" style={{ background: layers[key] ? color : 'transparent' }} />
          </label>
        ))}
      </div>
      <div className="legend">
        <h4>Legend</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#ef4444' }} />
            <span>High Risk</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#f97316' }} />
            <span>Medium Risk</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#eab308' }} />
            <span>Low Risk</span>
          </div>
        </div>
      </div>
    </div>
  )
}