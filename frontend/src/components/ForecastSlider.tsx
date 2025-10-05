import { useMemo } from 'react'

interface ForecastSliderProps {
  days: number
  onChange: (days: number) => void
  max?: number
}

export default function ForecastSlider({ days, onChange, max = 5 }: ForecastSliderProps) {
  const labels = useMemo(() => ['Now', '+1d', '+2d', '+3d', '+4d', '+5d'], [])

  return (
    <div style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 1000, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '8px 12px', borderRadius: 8 }}>
      <div style={{ fontSize: 12, marginBottom: 6 }}>Forecast: {labels[days] ?? `+${days}d`}</div>
      <input
        type="range"
        min={0}
        max={max}
        step={1}
        value={days}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: 200 }}
      />
    </div>
  )
}
