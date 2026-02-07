import React from 'react'

export function CategoryPieChart({ data }) {
  const processedData = data.map(item => ({
    ...item,
    value: item.amount || item.value || 0
  }))

  const total = processedData.reduce((sum, cat) => sum + cat.value, 0)
  const radius = 80
  const circumference = 2 * Math.PI * radius

  let cumulativePercentage = 0

  const formatBhat = (val) => "฿" + Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 });

  return (
    <div className="flex flex-col items-center justify-center hover-lift transition-all duration-300">
      <div className="relative w-[200px] h-[200px]">
        <svg width={200} height={200} viewBox="0 0 200 200" className="transform -rotate-90">
          <circle cx={100} cy={100} r={radius} fill="none" stroke="currentColor" className="text-gray-100 dark:text-gray-700" strokeWidth={20} />
          {processedData.map((category, index) => {
            if (category.value <= 0) return null;
            const percentage = (category.value / total) * 100
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
            const strokeDashoffset = - (cumulativePercentage / 100) * circumference
            cumulativePercentage += percentage
            return (
              <circle
                key={index}
                cx={100}
                cy={100}
                r={radius}
                fill="none"
                stroke={category.color}
                strokeWidth={20}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500 hover:opacity-80"
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Spending</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300 animate-fadeIn">{formatBhat(total)}</p>
        </div>
      </div>
    </div>
  )
}
