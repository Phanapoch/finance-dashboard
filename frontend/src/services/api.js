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
