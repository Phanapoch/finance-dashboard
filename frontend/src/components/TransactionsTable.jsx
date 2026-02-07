import React, { useState, useEffect } from 'react'
import { MoreHorizontal, Search, ChevronDown, ChevronUp, Loader2, Download } from 'lucide-react'

export function TransactionsTable({ filters, platformFilter, categoryFilter }) {
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')

  const getPlatformColor = (platform) => {
    const platformColors = {
      'K PLUS': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'LINE Pay': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'Shopee': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      '7-Eleven': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      'Grab': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      'GrabFood': 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
      'K-Bank': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      'KBANK': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      'Manual': 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
    }
    return platformColors[platform] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
  }

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const params = new URLSearchParams();
        if (filters?.from) params.append('date_from', filters.from);
        if (filters?.to) params.append('date_to', filters.to);
        if (platformFilter && platformFilter !== 'all') params.append('platform', platformFilter);
        // Add category filter if multiple categories are selected
        if (categoryFilter && categoryFilter.length > 0) {
          categoryFilter.forEach(cat => params.append('category', cat));
        }

        const response = await fetch(`/api/transactions?${params.toString()}`);
        const data = await response.json();
        setTransactions(data.data || [])
      } catch (error) {
        console.error('Error fetching transactions:', error)
      } finally {
        setLoading(false)
      }
    };
    fetchTransactions();
  }, [filters, platformFilter, categoryFilter])

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const sortTransactions = (transactions) => {
    return [...transactions].sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc'
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date)
      } else if (sortBy === 'amount') {
        return sortOrder === 'asc'
          ? a.amount - b.amount
          : b.amount - a.amount
      } else if (sortBy === 'category') {
        return sortOrder === 'asc'
          ? a.category.localeCompare(b.category)
          : b.category.localeCompare(a.category)
      }
      return 0
    })
  }

  const handleExport = (format) => {
    const exportData = filteredTransactions.map(t => ({
      date: t.date,
      description: t.description,
      platform: t.platform || 'Manual',
      category: t.category,
      amount: t.amount,
      type: t.transaction_type
    }))

    let content, filename, type

    if (format === 'csv') {
      const headers = ['Date', 'Description', 'Platform', 'Category', 'Amount', 'Type']
      const rows = exportData.map(t => [
        t.date,
        `"${t.description}"`,
        t.platform,
        t.category,
        t.amount,
        t.type
      ])
      content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      filename = 'transactions.csv'
      type = 'text/csv'
    } else {
      content = JSON.stringify(exportData, null, 2)
      filename = 'transactions.json'
      type = 'application/json'
    }

    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredTransactions = sortTransactions(transactions).filter(transaction =>
    transaction.description?.toLowerCase().includes(filter.toLowerCase()) ||
    transaction.category?.toLowerCase().includes(filter.toLowerCase())
  )

  const formatCurrency = (val) => "฿" + Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 });

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300 card-enter">
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-gray-500 animate-spin mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400 animate-fadeIn">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300 card-enter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white animate-fadeIn">Transaction History</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors duration-300 btn-hover"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-300 btn-hover"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300 btn-hover"
            />
          </div>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-')
              setSortBy(field)
              setSortOrder(order)
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-300 btn-hover"
          >
            <option value="date-desc">Date: Newest First</option>
            <option value="date-asc">Date: Oldest First</option>
            <option value="amount-desc">Amount: High to Low</option>
            <option value="amount-asc">Amount: Low to High</option>
            <option value="category">Category: A-Z</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto -mx-6 sm:mx-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 transition-colors duration-300 animate-fadeIn">
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Platform</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((t, index) => (
                <React.Fragment key={t.id}>
                  <tr
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer hover-lift ${t.item_count > 0 ? 'bg-blue-50/20 dark:bg-blue-900/10' : ''}`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={() => t.item_count > 0 && toggleRow(t.id)}
                  >
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString('th-TH', {
                        day: '2-digit', month: 'short', year: '2-digit',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                      <div className="flex items-center gap-2">
                        {t.description}
                        {t.item_count > 0 && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                            {t.item_count} ITEMS {expandedRows.has(t.id) ? <ChevronUp size={10}/> : <ChevronDown size={10}/>}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPlatformColor(t.platform)}`}>
                        {t.platform || 'Manual'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {t.category}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-sm text-right font-bold ${t.transaction_type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {t.transaction_type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>
                  </tr>
                  {expandedRows.has(t.id) && t.items && (
                    <tr className="bg-gray-50/50 dark:bg-gray-900/20">
                      <td colSpan="5" className="py-2 px-8">
                        <ul className="list-disc list-inside space-y-1">
                          {t.items.map((item, idx) => (
                            <li key={idx} className="text-xs text-gray-600 dark:text-gray-400">{item}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr><td colSpan="5" className="py-12 text-center text-gray-500 dark:text-gray-400 italic">No transactions found</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500 italic animate-fadeIn">
        Total {filteredTransactions.length} records found
      </div>
    </div>
  )
}
