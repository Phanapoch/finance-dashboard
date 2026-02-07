import React, { useState, useEffect } from 'react'
import { MoreHorizontal, Search, ChevronDown, ChevronUp } from 'lucide-react'

export function TransactionsTable({ filters }) {
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [expandedRows, setExpandedRows] = useState(new Set())

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const params = new URLSearchParams();
        if (filters?.from) params.append('date_from', filters.from);
        if (filters?.to) params.append('date_to', filters.to);
        
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
  }, [filters])

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description?.toLowerCase().includes(filter.toLowerCase()) ||
    transaction.category?.toLowerCase().includes(filter.toLowerCase())
  )

  const formatCurrency = (val) => "฿" + Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 });

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
        <div className="text-center py-12"><p className="text-gray-500 dark:text-gray-400">Loading...</p></div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction History</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300"
          />
        </div>
      </div>

      <div className="overflow-x-auto -mx-6 sm:mx-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 transition-colors duration-300">
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((t) => (
                <React.Fragment key={t.id}>
                  <tr 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${t.item_count > 0 ? 'bg-blue-50/20 dark:bg-blue-900/10' : ''}`}
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
                      <td colSpan="4" className="py-2 px-8">
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
              <tr><td colSpan="4" className="py-12 text-center text-gray-500 dark:text-gray-400 italic">No transactions found</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500 italic">
        Total {filteredTransactions.length} records found
      </div>
    </div>
  )
}
