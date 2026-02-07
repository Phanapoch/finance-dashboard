import React, { useState, useEffect } from 'react'
import { DashboardLayout } from './components/DashboardLayout'
import { SummaryCards } from './components/SummaryCards'
import { CategoryBreakdown } from './components/CategoryBreakdown'
import { SpendingTrend } from './components/SpendingTrend'
import { TransactionsTable } from './components/TransactionsTable'
import { Calendar } from 'lucide-react'

function App() {
  const [period, setPeriod] = useState('all') // 1d, 7d, 1m, all
  const [dateRange, setDateRange] = useState({ from: '', to: '' })

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
    }

    setDateRange({ from: fromDate, to: '' }) // to empty means till today
  }, [period])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
          <div>
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Filter Period</h2>
            <div className="mt-1 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                {period === '1d' ? 'Today' : period === '7d' ? 'Last 7 Days' : period === '1m' ? 'Last 30 Days' : 'All Time'}
              </span>
            </div>
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-md transition-colors duration-300">
            {[
              { id: '1d', label: '1 Day' },
              { id: '7d', label: '7 Days' },
              { id: '1m', label: '1 Month' },
              { id: 'all', label: 'All Time' },
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

        <SummaryCards filters={dateRange} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryBreakdown filters={dateRange} />
          <SpendingTrend filters={dateRange} />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white px-1 transition-colors duration-300">Raw Transactions</h2>
          <TransactionsTable filters={dateRange} />
        </div>
      </div>
    </DashboardLayout>
  )
}

export default App
