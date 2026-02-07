import React, { useState, useEffect } from 'react'
import { CategoryPieChart } from './CategoryPieChart'

export function CategoryBreakdown({ filters }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategorySummary = async () => {
      try {
        const params = new URLSearchParams();
        if (filters?.from) params.append('date_from', filters.from);
        if (filters?.to) params.append('date_to', filters.to);
        
        const response = await fetch(`/api/summary/category?${params.toString()}`);
        const data = await response.json();
        setCategories(data.data || [])
      } catch (error) {
        console.error('Error fetching category summary:', error)
      } finally {
        setLoading(false)
      }
    };
    fetchCategorySummary();
  }, [filters])

  const total = categories.reduce((sum, cat) => sum + (Number(cat.amount) || 0), 0)

  const formatCurrency = (val) => "฿" + Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12"><p className="text-gray-500">Loading...</p></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Category Breakdown</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CategoryPieChart data={categories} />
        <div className="space-y-3">
          {categories.map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                <span className="text-sm text-gray-700">{category.category}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-900">{formatCurrency(category.amount)}</span>
                <span className="text-gray-500 ml-2">({((category.amount / total) * 100).toFixed(1)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
