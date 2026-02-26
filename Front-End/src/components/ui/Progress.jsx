// components/ui/Progress.jsx
import React from 'react'

const Progress = ({ value = 0, max = 100, color = 'blue', showLabel = true, size = 'md' }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }
  
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
    purple: 'bg-purple-600',
    gray: 'bg-gray-600'
  }

  return (
    <div>
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
      <div className={`${sizeClasses[size]} w-full bg-gray-200 rounded-full overflow-hidden`}>
        <div
          className={`${colorClasses[color]} h-full rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-right text-xs text-gray-500 mt-1">
          {percentage.toFixed(1)}%
        </div>
      )}
    </div>
  )
}

export default Progress