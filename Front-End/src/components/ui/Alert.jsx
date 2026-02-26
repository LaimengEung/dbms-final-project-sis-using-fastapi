// components/ui/Alert.jsx
import React from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const Alert = ({ type = 'info', title, message, className = '', onClose }) => {
  const config = {
    info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: <Info size={20} className="text-blue-600" /> },
    success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: <CheckCircle size={20} className="text-green-600" /> },
    warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: <AlertTriangle size={20} className="text-yellow-600" /> },
    error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: <AlertCircle size={20} className="text-red-600" /> }
  }

  const { bg, border, text, icon } = config[type]

  return (
    <div className={`${bg} border ${border} rounded-lg p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0 mr-3">
          {icon}
        </div>
        <div className="flex-1">
          {title && <h4 className={`font-medium ${text}`}>{title}</h4>}
          <p className={`text-sm ${text}`}>{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  )
}

export default Alert