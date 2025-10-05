import { memo } from 'react'
import { Moon, Sun, Search } from 'lucide-react'
import './TopNav.css'

interface TopNavProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

function TopNav({ theme, onToggleTheme }: TopNavProps) {
  return (
    <nav className="top-nav">
      <div className="nav-left">
        <h1 className="logo">🌍 Webma EarthGuard</h1>
        <p className="tagline">Environmental Risk & Resilience Map</p>
      </div>
     
      <div className="nav-right">
        <button className="theme-toggle" onClick={onToggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
    </nav>
  )
}

export default memo(TopNav)
