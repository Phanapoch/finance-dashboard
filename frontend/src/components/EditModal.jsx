import React, { useState, useEffect } from 'react'
import { X, Save, Plus, Trash2, Minus } from 'lucide-react'

export function EditModal({ transaction, onClose, onSave }) {
  const [formData, setFormData] = useState({
    description: '',
    category: '',
    amount: '',
    date: '',
    time: '',
    platform: '',
    items: []
  })

  useEffect(() => {
    if (transaction) {
      // Split date and time if it's a full timestamp
      const dateParts = transaction.date ? transaction.date.split(' ') : []
      const datePart = dateParts[0] || new Date().toISOString().split('T')[0]
      const timePart = dateParts[1] || '00:00'
      
      setFormData({
        description: transaction.description || '',
        category: transaction.category || '',
        amount: transaction.amount || '',
        date: datePart,
        time: timePart,
        platform: transaction.platform || '',
        items: Array.isArray(transaction.items) ? transaction.items.map(item => {
          // Parse item string like "Name (x3)" or just "Name"
          const match = item.match(/(.+?)\s*x(\d+)/)
          if (match) {
            return {
              id: Math.random().toString(36).substr(2, 9),
              name: match[1].trim(),
              quantity: parseInt(match[2])
            }
          }
          return {
            id: Math.random().toString(36).substr(2, 9),
            name: item.trim(),
            quantity: 1
          }
        }) : [{ id: Math.random().toString(36).substr(2, 9), name: '', quantity: 1 }]
      })
    }
  }, [transaction])

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleItemChange = (itemId, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }))
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: Math.random().toString(36).substr(2, 9), name: '', quantity: 1 }]
    }))
  }

  const removeItem = (itemId) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate
    if (!formData.description || !formData.amount || !formData.date) {
      alert('Please fill in required fields')
      return
    }

    try {
      // Update transaction
      const fullDateTime = formData.time ? `${formData.date} ${formData.time}` : formData.date
      
      await onSave({
        ...transaction,
        description: formData.description,
        category: formData.category,
        amount: parseFloat(formData.amount),
        date: fullDateTime,
        platform: formData.platform
      })

      // Handle items - first delete all existing items, then add new ones
      if (transaction.id && formData.items.length > 0) {
        // Get existing items
        const existingItemsResponse = await fetch(`/api/transactions/${transaction.id}`)
        const existingItemsData = await existingItemsResponse.json()
        const existingTransaction = existingItemsData.data

        // Delete all existing items
        if (existingTransaction.items) {
          for (const item of existingTransaction.items) {
            // Extract item_id from item string (e.g., "Item Name (x3)" -> item_id)
            // We need to store item_id in a more accessible way
            const itemMatch = item.match(/^[^:]+: ([0-9]+)/)
            if (itemMatch) {
              const itemId = itemMatch[1]
              await fetch(`/api/transactions/${transaction.id}/items/${itemId}`, {
                method: 'DELETE'
              })
            }
          }
        }

        // Add new items
        for (const item of formData.items) {
          if (item.name) {
            await fetch(`/api/transactions/${transaction.id}/items`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: item.name,
                quantity: item.quantity,
                unit_price: parseFloat(item.quantity) * parseFloat(formData.amount) / formData.items.length
              })
            })
          }
        }
      }

      onClose()
    } catch (error) {
      console.error('Error saving transaction:', error)
      alert('Error saving transaction. Please try again.')
    }
  }

  if (!transaction) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 pt-16 z-50 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto animate-fadeInUp">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Transaction...</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="e.g., Lunch at 7-Eleven"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleChange('time', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="e.g., Food & Dining"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Platform
            </label>
            <input
              type="text"
              value={formData.platform}
              onChange={(e) => handleChange('platform', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="e.g., K PLUS, LINE Pay"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Items
              </label>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg animate-fadeIn"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                      placeholder="Item name"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleItemChange(item.id, 'quantity', Math.max(1, item.quantity - 1))}
                      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-2 text-sm text-center border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => handleItemChange(item.id, 'quantity', item.quantity + 1)}
                      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}