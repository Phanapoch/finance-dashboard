import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

// Helper function to format currency in Thai Baht
export const formatCurrency = (amount) => {
  const val = Number(amount) || 0;
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2
  }).format(val)
}

// API functions
export const api = {
  healthCheck: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/health`)
    return response.data
  },
  getTransactions: async (filters = {}) => {
    const response = await axios.get(`${API_BASE_URL}/api/transactions`, { params: filters })
    return response.data
  },
  getTransactionById: async (transactionId) => {
    const response = await axios.get(`${API_BASE_URL}/api/transactions/${transactionId}`)
    return response.data
  },
  updateTransaction: async (transactionId, data) => {
    const response = await axios.put(`${API_BASE_URL}/api/transactions/${transactionId}`, data)
    return response.data
  },
  deleteTransaction: async (transactionId) => {
    const response = await axios.delete(`${API_BASE_URL}/api/transactions/${transactionId}`)
    return response.data
  },
  createTransaction: async (data) => {
    const response = await axios.post(`${API_BASE_URL}/api/transactions`, data)
    return response.data
  },
  addTransactionItem: async (transactionId, data) => {
    const response = await axios.post(`${API_BASE_URL}/api/transactions/${transactionId}/items`, data)
    return response.data
  },
  updateTransactionItem: async (transactionId, itemId, data) => {
    const response = await axios.put(`${API_BASE_URL}/api/transactions/${transactionId}/items/${itemId}`, data)
    return response.data
  },
  deleteTransactionItem: async (transactionId, itemId) => {
    const response = await axios.delete(`${API_BASE_URL}/api/transactions/${transactionId}/items/${itemId}`)
    return response.data
  },
  getCategorySummary: async (filters = {}) => {
    const response = await axios.get(`${API_BASE_URL}/api/summary/category`, { params: filters })
    return response.data
  },
  getDateSummary: async (filters = {}) => {
    const response = await axios.get(`${API_BASE_URL}/api/summary/date`, { params: filters })
    return response.data
  },
  getCategories: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/categories`)
    return response.data
  },
  getBalance: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/balance`)
    return response.data
  },
  getDashboardData: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/dashboard`)
    return response.data
  }
}
