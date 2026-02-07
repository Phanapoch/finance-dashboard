import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function SpendingTrend({ filters }) {
  const [spendingData, setSpendingData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (filters?.from) params.append('date_from', filters.from);
        if (filters?.to) params.append('date_to', filters.to);
        
        const response = await fetch(`/api/summary/date?${params.toString()}`);
        const data = await response.json();
        const dateSummary = data.data || []
        
        const formattedData = dateSummary.map((item) => ({
          name: new Date(item.date).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' }),
          spending: item.total
        }))

        setSpendingData(formattedData)
      } catch (error) {
        console.error('Error fetching date summary:', error)
      } finally {
        setLoading(false)
      }
    };
    fetchData();
  }, [filters])

  const formatCurrency = (val) => "฿" + Number(val).toLocaleString();

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-full transition-colors duration-300">
        <div className="text-center py-12"><p className="text-gray-500 dark:text-gray-400">Loading trend...</p></div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Spending Trend</h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={spendingData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-100 dark:text-gray-700" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `฿${v}`} />
            <Tooltip
              formatter={(v) => [formatCurrency(v), 'Spending']}
              contentStyle={{ 
                borderRadius: '8px', 
                border: 'none', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                backgroundColor: 'var(--tooltip-bg, white)',
                color: 'var(--tooltip-color, black)'
              }}
            />
            <Line type="monotone" dataKey="spending" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
