import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c'];

export function PlatformBreakdown({ filters, platformFilter, categoryFilter, userEmail }) {
  const [platforms, setPlatforms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlatformSummary = async () => {
      try {
        const params = new URLSearchParams();
        if (filters?.from) params.append('date_from', filters.from);
        if (filters?.to) params.append('date_to', filters.to);
        if (userEmail) params.append('email', userEmail);
        if (platformFilter && platformFilter !== 'all') params.append('platform', platformFilter);
        if (categoryFilter && categoryFilter.length > 0) {
          categoryFilter.forEach(cat => params.append('category', cat));
        }

        const response = await fetch(`/api/summary/platform?${params.toString()}`);
        const data = await response.json();
        setPlatforms(data.data || [])
      } catch (error) {
        console.error('Error fetching platform summary:', error)
      } finally {
        setLoading(false)
      }
    };
    fetchPlatformSummary();
  }, [filters, platformFilter, categoryFilter, userEmail])

  const total = platforms.reduce((sum, p) => sum + (Number(p.total) || 0), 0)

  const formatCurrency = (val) => "฿" + Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 });

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300 card-enter shimmer-bg">
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400 animate-fadeIn">Loading platforms...</p>
        </div>
      </div>
    )
  }

  const chartData = platforms.map(p => ({
    name: p.platform || 'Unknown',
    value: Number(p.total)
  }))

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300 card-enter card-enter-delay-1">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">Platform Breakdown</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                animationDuration={1000}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [formatCurrency(value), 'Total']}
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  backgroundColor: 'var(--tooltip-bg, white)',
                  color: 'var(--tooltip-color, black)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3 overflow-y-auto max-h-64 pr-2 custom-scrollbar">
          {platforms.map((platform, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 card-enter"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{platform.platform || 'Unknown'}</span>
              </div>
              <div className="text-sm text-right">
                <div className="font-medium text-gray-900 dark:text-white">{formatCurrency(platform.total)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {((platform.total / total) * 100).toFixed(1)}% • {platform.count} txn
                </div>
              </div>
            </div>
          ))}
          {platforms.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
              No platform data found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
