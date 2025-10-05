import { Lightbulb } from 'lucide-react'
import type { AreaInfo } from '../App' // Assurez-vous que le chemin vers AreaInfo est correct

interface SuggestionsCardProps {
  area: AreaInfo
}

export default function SuggestionsCard({ area }: SuggestionsCardProps) {
  // N'afficher la carte que si des suggestions sont disponibles
  if (!area || !area.suggestions || area.suggestions.length === 0) {
    return null 
  }

  return (
    // Utiliser une classe CSS similaire à info-panel pour un style cohérent
    <div className="suggestions-card info-panel"> 
      <div className="panel-header">
        <div className="panel-title">
          <Lightbulb size={20} />
          <div>
            <h3>AI-Driven Suggestions</h3>
            <p className="coordinates">
              {/* Afficher le lieu concerné pour plus de contexte */}
              For: {area.name} ({area.lat.toFixed(4)}°N, {area.lon.toFixed(4)}°W)
            </p>
          </div>
        </div>
      </div>
      <div className="panel-content">
        <section className="suggestions-section">
            {/* H4 n'est pas nécessaire ici car il est déjà dans H3 du panel-title */}
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