import { useCallback, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '../lib/utils'
import { useUIState } from '../hooks/useUIState'

interface NotificationProps {
  notification: {
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    duration?: number
    timestamp: number
  }
  onRemove: (id: string) => void
}

function NotificationItem({ notification, onRemove }: NotificationProps) {
  const { type, title, message, id } = notification

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />
      default:
        return <Info className="w-5 h-5 text-gray-600" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-orange-50 border-orange-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const handleRemove = useCallback(() => {
    onRemove(id)
  }, [id, onRemove])

  return (
    <div
      className={cn(
        "flex items-start space-x-3 p-4 rounded-lg border shadow-sm transition-all duration-300",
        getBackgroundColor()
      )}
    >
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600 mt-1">{message}</p>
      </div>
      <button
        onClick={handleRemove}
        className="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 transition-colors"
      >
        <X className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  )
}

export default function NotificationSystem() {
  const { notifications, removeNotification, clearNotifications } = useUIState()

  const handleRemove = useCallback((id: string) => {
    removeNotification(id)
  }, [removeNotification])

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">通知</h3>
        {notifications.length > 1 && (
          <button
            onClick={clearNotifications}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            清除全部
          </button>
        )}
      </div>
      <div className="space-y-2">
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={handleRemove}
          />
        ))}
      </div>
    </div>
  )
}
