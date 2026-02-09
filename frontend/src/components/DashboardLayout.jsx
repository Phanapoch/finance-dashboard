import React, { useState, useEffect } from 'react'
import { Moon, Sun, Sparkles } from 'lucide-react'

export function DashboardLayout({ children, onAiClick }) {
  const [isDark, setIsDark] = useState(() => {
    // Load preference from localStorage or check system preference
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    // Apply class to html element
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  const toggleTheme = () => setIsDark(!isDark)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 animate-fadeIn">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300 sticky top-0 z-10 hover-lift">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300 animate-fadeIn">
                Finance Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="hidden sm:block text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300 animate-fadeIn">
                Welcome back, ice!
              </span>
              <button
                onClick={onAiClick}
                className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-all duration-300 hover-lift btn-hover text-indigo-600 dark:text-indigo-400"
                aria-label="AI Analysis"
                title="AI Analysis"
              >
                <Sparkles className="w-5 h-5" />
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 hover-lift btn-hover"
                aria-label="Toggle dark mode"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300 card-enter-up">
        {children}
      </main>
    </div>
  )
}
