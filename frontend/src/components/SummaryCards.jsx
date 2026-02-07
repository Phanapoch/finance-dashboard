import React, { useEffect, useState } from 'react'
import { Wallet, TrendingUp, Activity } from 'lucide-react'

export function SummaryCards({ filters }) {
  const [data, setData] = useState({ b: 0, i: 0, e: 0, c: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (filters?.from) params.append('date_from', filters.from);
        if (filters?.to) params.append('date_to', filters.to);
        
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
      }
    };
    fetchData();
  }, [filters]);

  const f = (v) => "฿ " + Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-sm font-medium text-gray-500">Total Spending</p>
        <div className="text-2xl font-bold text-red-600 mt-1">{f(data.e)}</div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-sm font-medium text-gray-500">Total Income</p>
        <div className="text-2xl font-bold text-green-600 mt-1">{f(data.i)}</div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-sm font-medium text-gray-500">Net Balance</p>
        <div className={`text-2xl font-bold mt-1 ${data.b >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {data.b >= 0 ? '' : '-'}{f(data.b)}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-sm font-medium text-gray-500">Transactions</p>
        <div className="text-2xl font-bold text-blue-600 mt-1">{data.c}</div>
      </div>
    </div>
  );
}
