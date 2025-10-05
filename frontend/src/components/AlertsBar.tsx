import { AlertTriangle, Flame, Droplets, Wind } from 'lucide-react'
import './AlertsBar.css'

export default function AlertsBar() {
  const alerts = [
    {
      id: 1,
      type: 'flood',
      icon: Droplets,
      message: 'Flood Watch in Inezgane — 80% rainfall probability next 48h',
      severity: 'high',
    },
    {
      id: 2,
      type: 'fire',
      icon: Flame,
      message: 'Active fire detected 12km NE of Agadir',
      severity: 'medium',
    },
    {
      id: 3,
      type: 'air',
      icon: Wind,
      message: 'Moderate air quality — PM2.5 levels elevated in city center',
      severity: 'low',
    },
  ]

  return (
    <div className="alerts-bar">
      <div className="alerts-container">
        <AlertTriangle size={18} className="alerts-icon" />
        <div className="alerts-scroll">
          {alerts.map((alert) => (
            <div key={alert.id} className={`alert-item severity-${alert.severity}`}>
              <alert.icon size={16} />
              <span>{alert.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
