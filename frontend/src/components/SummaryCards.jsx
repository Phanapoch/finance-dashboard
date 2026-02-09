import React, { useEffect, useState } from 'react'
import { Wallet, TrendingUp, Activity, Loader2 } from 'lucide-react'

export function SummaryCards({ filters, categoryFilter, userEmail }) {
  const [data, setData] = useState({ b: 0, i: 0, e: 0, c: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (filters?.from) params.append('date_from', filters.from);
        if (filters?.to) params.append('date_to', filters.to);
        if (userEmail) params.append('email', userEmail);
        // Add category filter if multiple categories are selected
        if (categoryFilter && categoryFilter.length > 0) {
          categoryFilter.forEach(cat => params.append('category', cat));
        }

        const response = await fetch(`/api/dashboard?${params.toString()}`);
        const json = await response.json();
        if (json.success && json.data) {
          const d = json.data;
          const incomeVal = Number(d.balance?.income) || 0;
          const expensesVal = Number(d.balance?.expenses) || 0;
          const balanceVal = Number(d.balance?.balance) || (incomeVal - expensesVal);
          const countVal = d.transactions?.length || 0;

          setData({
            b: balanceVal,
            i: incomeVal,
            e: expensesVal,
            c: countVal
          });
        }
      } catch (error) {
        console.error("Fetch dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters, categoryFilter]);

  const f = (v) => "฿ " + Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300 card-enter hover-lift ${loading ? 'shimmer-bg' : ''}`}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Spending</p>
          <Activity className="w-5 h-5 text-red-500" />
        </div>
        <div className="mt-4 flex items-center">
          {loading ? (
            <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
          ) : (
            <div className="text-2xl font-bold text-red-600 animate-fadeIn">
              {f(data.e)}
            </div>
          )}
        </div>
      </div>
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300 card-enter card-enter-delay-1 hover-lift ${loading ? 'shimmer-bg' : ''}`}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Income</p>
          <Wallet className="w-5 h-5 text-green-500" />
        </div>
        <div className="mt-4 flex items-center">
          {loading ? (
            <Loader2 className="w-5 h-5 text-green-500 animate-spin" />
          ) : (
            <div className="text-2xl font-bold text-green-600 animate-fadeIn">
              {f(data.i)}
            </div>
          )}
        </div>
      </div>
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300 card-enter card-enter-delay-2 hover-lift ${loading ? 'shimmer-bg' : ''}`}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Balance</p>
          <TrendingUp className="w-5 h-5 text-blue-500" />
        </div>
        <div className="mt-4 flex items-center">
          {loading ? (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          ) : (
            <div className={`text-2xl font-bold animate-fadeIn ${data.b >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.b >= 0 ? '' : '-'}{f(data.b)}
            </div>
          )}
        </div>
      </div>
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300 card-enter card-enter-delay-3 hover-lift ${loading ? 'shimmer-bg' : ''}`}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Transactions</p>
          <Activity className="w-5 h-5 text-purple-500" />
        </div>
        <div className="mt-4 flex items-center">
          {loading ? (
            <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
          ) : (
            <div className="text-2xl font-bold text-purple-600 animate-fadeIn">
              {data.c}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
