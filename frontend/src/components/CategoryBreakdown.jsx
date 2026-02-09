import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { CategoryPieChart } from './CategoryPieChart'

export function CategoryBreakdown({ filters, categoryFilter, userEmail }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategorySummary = async () => {
      try {
        const params = new URLSearchParams();
        if (filters?.from) params.append('date_from', filters.from);
        if (filters?.to) params.append('date_to', filters.to);
        if (userEmail) params.append('email', userEmail);
        // Add category filter if multiple categories are selected
        if (categoryFilter && categoryFilter.length > 0) {
          categoryFilter.forEach(cat => params.append('category', cat));
        }

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
  }, [filters, categoryFilter])

  const total = categories.reduce((sum, cat) => sum + (Number(cat.amount) || 0), 0)

  const formatCurrency = (val) => "฿" + Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 });

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300 card-enter shimmer-bg">
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400 animate-fadeIn">Loading categories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300 card-enter card-enter-delay-1">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">Category Breakdown</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CategoryPieChart data={categories} />
        <div className="space-y-3">
          {categories.map((category, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 card-enter card-enter-delay-2"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-3 h-3 rounded-full transition-transform duration-200 hover:scale-125"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{category.category}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(category.amount)}</span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">({((category.amount / total) * 100).toFixed(1)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
