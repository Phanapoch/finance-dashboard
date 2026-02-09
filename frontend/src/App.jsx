import React, { useState, useEffect } from 'react'
import { DashboardLayout } from './components/DashboardLayout'
import { SummaryCards } from './components/SummaryCards'
import { CategoryBreakdown } from './components/CategoryBreakdown'
import { SpendingTrend } from './components/SpendingTrend'
import { TransactionsTable } from './components/TransactionsTable'
import { AddTransactionModal } from './components/AddTransactionModal'
import { Calendar, Filter, CalendarRange, Plus } from 'lucide-react'

function App() {
  const [period, setPeriod] = useState('all') // 1d, 7d, 1m, all
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [platformFilter, setPlatformFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState([])
  const [showDateRange, setShowDateRange] = useState(false)
  const [showPlatformFilter, setShowPlatformFilter] = useState(false)
  const [showCategoryFilter, setShowCategoryFilter] = useState(false)
  const [allCategories, setAllCategories] = useState([])
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [userEmail, setUserEmail] = useState('ice@imice.im')
  const [availableEmails, setAvailableEmails] = useState(['ice@imice.im', '8ojo3j@gmail.com'])
  const [showAddModal, setShowAddModal] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    const now = new Date()
    let fromDate = ''

    if (period === '1d') {
      fromDate = now.toISOString().split('T')[0]
    } else if (period === '7d') {
      const sevenDaysAgo = new Date(now)
      sevenDaysAgo.setDate(now.getDate() - 7)
      fromDate = sevenDaysAgo.toISOString().split('T')[0]
    } else if (period === '1m') {
      const oneMonthAgo = new Date(now)
      oneMonthAgo.setMonth(now.getMonth() - 1)
      fromDate = oneMonthAgo.toISOString().split('T')[0]
    } else if (period === 'custom') {
      // Custom date range - use current month as default
      fromDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`
    }

    setDateRange({ from: fromDate, to: '' }) // to empty means till today
  }, [period, currentYear, currentMonth])

  useEffect(() => {
    // Fetch all categories when component mounts
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAllCategories(data.data || [])
        }
      })
      .catch(err => console.error('Error fetching categories:', err))
  }, [])

  const handleAddSuccess = () => {
    // Refresh the transactions list by triggering a re-render
    setRefreshTrigger(prev => prev + 1)
  }

  const getPlatformFilterLabel = () => {
    if (platformFilter === 'all') return 'All Platforms'
    return platformFilter
  }

  const allPlatforms = ['K PLUS', 'LINE Pay', 'Shopee', '7-Eleven', 'Grab', 'GrabFood', 'K-Bank', 'KBANK', 'Manual']

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Main Filter Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
          <div className="flex-1">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">User Account</h2>
            <select
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-300"
            >
              {availableEmails.map(email => (
                <option key={email} value={email}>{email}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Filter Period</h2>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                {period === '1d' ? 'Today' : period === '7d' ? 'Last 7 Days' : period === '1m' ? 'Last 30 Days' : period === 'custom' ? 'Custom Date' : 'All Time'}
              </span>
            </div>
          </div>

          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-md transition-colors duration-300">
            {[
              { id: 'all', label: 'All Time' },
              { id: '1d', label: '1 Day' },
              { id: '7d', label: '7 Days' },
              { id: '1m', label: '1 Month' },
              { id: 'custom', label: 'Custom' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                  period === p.id
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters - Date Range Picker */}
        {showDateRange && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300 animate-fadeIn">
            <div className="flex items-center gap-2 mb-3">
              <CalendarRange className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Select Date Range</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">From</label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">To</label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Advanced Filters - Platform Selector */}
        {showPlatformFilter && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300 animate-fadeIn">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-green-600 dark:text-green-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Select Platform</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {allPlatforms.map((platform) => (
                <button
                  key={platform}
                  onClick={() => setPlatformFilter(platform)}
                  className={`px-3 py-2 text-xs font-medium rounded-md transition-all ${
                    platformFilter === platform
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-500'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {platform}
                </button>
              ))}
              <button
                onClick={() => setPlatformFilter('all')}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-all ${
                  platformFilter === 'all'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-500'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All Platforms
              </button>
            </div>
          </div>
        )}

        {/* Advanced Filters - Category Selector */}
        {showCategoryFilter && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300 animate-fadeIn">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Select Categories</h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">Multi-select allowed</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {allCategories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => {
                    const isSelected = categoryFilter.includes(category.name)
                    if (isSelected) {
                      setCategoryFilter(categoryFilter.filter(c => c !== category.name))
                    } else {
                      setCategoryFilter([...categoryFilter, category.name])
                    }
                  }}
                  className={`px-3 py-2 text-xs font-medium rounded-md transition-all ${
                    categoryFilter.includes(category.name)
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-2 border-orange-500'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  style={{
                    borderLeft: `3px solid ${category.color || '#000000'}`
                  }}
                >
                  {category.name}
                </button>
              ))}
              <button
                onClick={() => setCategoryFilter([])}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-all ${
                  categoryFilter.length === 0
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-2 border-orange-500'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All Categories
              </button>
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowDateRange(!showDateRange)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              showDateRange
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-2 border-purple-500'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <CalendarRange className="w-4 h-4" />
            Date Range
          </button>
          <button
            onClick={() => setShowPlatformFilter(!showPlatformFilter)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              showPlatformFilter
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-2 border-green-500'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            Platform Filter
          </button>
          <button
            onClick={() => setShowCategoryFilter(!showCategoryFilter)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              showCategoryFilter
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-2 border-orange-500'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            Category Filter
          </button>
        </div>

        {/* Add Transaction Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 hover-lift shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Transaction
        </button>

        {/* Active Filters Display */}
        {(platformFilter !== 'all' || showDateRange || categoryFilter.length > 0) && (
          <div className="flex flex-wrap items-center gap-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            {platformFilter !== 'all' && (
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <span>Platform:</span>
                <span className="font-semibold bg-white dark:bg-gray-800 px-2 py-1 rounded-md border border-blue-200 dark:border-blue-700">
                  {platformFilter}
                </span>
              </div>
            )}
            {categoryFilter.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300">
                <span>Categories:</span>
                <div className="flex flex-wrap gap-1">
                  {categoryFilter.map(cat => (
                    <span
                      key={cat}
                      className="font-semibold bg-white dark:bg-gray-800 px-2 py-1 rounded-md border border-orange-200 dark:border-orange-700"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {showDateRange && (
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <span>Range:</span>
                <span className="font-semibold bg-white dark:bg-gray-800 px-2 py-1 rounded-md border border-blue-200 dark:border-blue-700">
                  {dateRange.from || 'Select date'} {dateRange.to ? 'to ' + dateRange.to : ''}
                </span>
              </div>
            )}
          </div>
        )}

        <SummaryCards filters={dateRange} platformFilter={platformFilter} categoryFilter={categoryFilter} userEmail={userEmail} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <CategoryBreakdown filters={dateRange} categoryFilter={categoryFilter} userEmail={userEmail} />
          <SpendingTrend filters={dateRange} userEmail={userEmail} />
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white px-1 transition-colors duration-300">
            Raw Transactions
          </h2>
          <TransactionsTable
            key={`${refreshTrigger}-${userEmail}`}
            filters={dateRange}
            platformFilter={platformFilter}
            categoryFilter={categoryFilter}
            userEmail={userEmail}
          />
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <AddTransactionModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}
    </DashboardLayout>
  )
}

export default App
