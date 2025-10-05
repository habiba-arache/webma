import { useEffect, useState } from 'react'
import { Leaf, Droplets, Flame, AlertTriangle } from 'lucide-react'

interface EnvironmentalData {
  vegetation: {
    ndvi: number
    vegetationLevel: string
    o2Estimate: number
    treeRecommendation: boolean
    color: string
  }
  flood: {
    riskLevel: string
    probability: number
    prediction: {
      next24h: string
      next48h: string
      next72h: string
    }
    recommendations: string[]
  }
  fireRisk: {
    riskLevel: string
    probability: number
    factors: {
      temperature: number
      humidity: number
      windSpeed: number
      ndvi: number
    }
    recommendations: string[]
  }
}

interface Props {
  lat: number
  lon: number
}

export default function EnvironmentalDataPanel({ lat, lon }: Props) {
  const [data, setData] = useState<EnvironmentalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEnvironmentalData()
  }, [lat, lon])

  const fetchEnvironmentalData = async () => {
    setLoading(true)
    setError(null)

    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'

      const [vegetation, flood, fireRisk] = await Promise.all([
        fetch(`${API_BASE}/vegetation?lat=${lat}&lon=${lon}`).then(r => r.json()),
        fetch(`${API_BASE}/flood?lat=${lat}&lon=${lon}`).then(r => r.json()),
        fetch(`${API_BASE}/fire-risk?lat=${lat}&lon=${lon}`).then(r => r.json())
      ])

      setData({ vegetation, flood, fireRisk })
    } catch (err: any) {
      setError(err.message || 'Failed to fetch environmental data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <p className="text-gray-600 dark:text-gray-400">Loading environmental data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-4">
      {/* Vegetation Section */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="flex items-center gap-2 mb-3">
          <Leaf className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Vegetation & O₂</h3>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">NDVI:</span>
            <span className="font-medium" style={{ color: data.vegetation.color }}>
              {data.vegetation.ndvi.toFixed(2)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Level:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {data.vegetation.vegetationLevel}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">O₂ Estimate:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {data.vegetation.o2Estimate}%
            </span>
          </div>

          {data.vegetation.treeRecommendation && (
            <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
              <p className="text-sm text-green-700 dark:text-green-400">
                🌳 Tree planting recommended in this area
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Flood Risk Section */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="flex items-center gap-2 mb-3">
          <Droplets className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Flood Risk</h3>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Risk Level:</span>
            <span className={`font-bold ${
              data.flood.riskLevel === 'High' ? 'text-red-600' :
              data.flood.riskLevel === 'Medium' ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {data.flood.riskLevel}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Probability:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {data.flood.probability.toFixed(0)}%
            </span>
          </div>

          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
            <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">
              Predictions:
            </p>
            <div className="space-y-1 text-xs text-blue-800 dark:text-blue-400">
              <div>24h: {data.flood.prediction.next24h}</div>
              <div>48h: {data.flood.prediction.next48h}</div>
              <div>72h: {data.flood.prediction.next72h}</div>
            </div>
          </div>

          {data.flood.recommendations.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Recommendations:
              </p>
              <ul className="space-y-1">
                {data.flood.recommendations.slice(0, 3).map((rec, i) => (
                  <li key={i} className="text-xs text-gray-600 dark:text-gray-400">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Fire Risk Section */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-5 h-5 text-orange-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Fire Risk</h3>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Risk Level:</span>
            <span className={`font-bold ${
              data.fireRisk.riskLevel === 'Extreme' ? 'text-red-700' :
              data.fireRisk.riskLevel === 'High' ? 'text-orange-600' :
              data.fireRisk.riskLevel === 'Medium' ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {data.fireRisk.riskLevel}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Probability:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {data.fireRisk.probability.toFixed(0)}%
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-xs text-gray-500 dark:text-gray-400">Temp</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {data.fireRisk.factors.temperature}°C
              </p>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-xs text-gray-500 dark:text-gray-400">Humidity</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {data.fireRisk.factors.humidity}%
              </p>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-xs text-gray-500 dark:text-gray-400">Wind</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {data.fireRisk.factors.windSpeed} km/h
              </p>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-xs text-gray-500 dark:text-gray-400">NDVI</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {data.fireRisk.factors.ndvi.toFixed(2)}
              </p>
            </div>
          </div>

          {data.fireRisk.recommendations.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Recommendations:
              </p>
              <ul className="space-y-1">
                {data.fireRisk.recommendations.slice(0, 3).map((rec, i) => (
                  <li key={i} className="text-xs text-gray-600 dark:text-gray-400">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Alert if any high risk */}
      {(data.flood.riskLevel === 'High' || data.fireRisk.riskLevel === 'High' || data.fireRisk.riskLevel === 'Extreme') && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">
              High Risk Alert
            </p>
          </div>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            Multiple environmental hazards detected. Take necessary precautions.
          </p>
        </div>
      )}
    </div>
  )
}
