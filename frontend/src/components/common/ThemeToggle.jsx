import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`relative inline-flex items-center w-12 h-7 rounded-full transition-colors duration-300
        border ${isDark ? 'bg-navy-800 border-white/10' : 'bg-gold-500/15 border-gold-500/30'} ${className}`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full flex items-center justify-center
          transition-all duration-300 shadow-md
          ${isDark ? 'left-[22px] bg-gold-400 text-navy-900' : 'left-0.5 bg-white text-gold-600'}`}
      >
        {isDark ? <Moon size={13} /> : <Sun size={13} />}
      </span>
    </button>
  )
}
