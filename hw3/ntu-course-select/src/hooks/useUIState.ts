import { useState, useCallback, useRef, useEffect } from 'react'

export interface UIState {
  isLoading: boolean
  error: string | null
  activeModal: string | null
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  notifications: Notification[]
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  timestamp: number
}

export interface UIActions {
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  openModal: (modalId: string) => void
  closeModal: () => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export interface UseUIStateReturn extends UIState, UIActions {
  // Computed properties
  hasActiveModal: boolean
  hasNotifications: boolean
  unreadNotifications: number
}

export function useUIState(): UseUIStateReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Use ref to track notification IDs
  const notificationIdRef = useRef(0)

  // Computed properties
  const hasActiveModal = activeModal !== null
  const hasNotifications = notifications.length > 0
  const unreadNotifications = notifications.filter(n => 
    Date.now() - n.timestamp < (n.duration || 5000)
  ).length

  // Actions
  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading)
  }, [])

  const setError = useCallback((error: string | null) => {
    setError(error)
  }, [])

  const openModal = useCallback((modalId: string) => {
    setActiveModal(modalId)
  }, [])

  const closeModal = useCallback(() => {
    setActiveModal(null)
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])

  const setSidebarOpenState = useCallback((open: boolean) => {
    setSidebarOpen(open)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }, [])

  const setThemeState = useCallback((theme: 'light' | 'dark') => {
    setTheme(theme)
  }, [])

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = `notification-${++notificationIdRef.current}`
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now()
    }

    setNotifications(prev => [...prev, newNotification])

    // Auto-remove notification after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id))
      }, notification.duration || 5000)
    }
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Auto-remove expired notifications
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => 
        prev.filter(notification => {
          const age = Date.now() - notification.timestamp
          return age < (notification.duration || 5000)
        })
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Persist theme to localStorage
  useEffect(() => {
    localStorage.setItem('ntu-course-theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('ntu-course-theme') as 'light' | 'dark'
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key closes modal
      if (event.key === 'Escape' && hasActiveModal) {
        closeModal()
      }

      // Ctrl/Cmd + K opens search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        openModal('search')
      }

      // Ctrl/Cmd + B toggles sidebar
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault()
        toggleSidebar()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [hasActiveModal, closeModal, openModal, toggleSidebar])

  return {
    // State
    isLoading,
    error,
    activeModal,
    sidebarOpen,
    theme,
    notifications,
    
    // Computed properties
    hasActiveModal,
    hasNotifications,
    unreadNotifications,
    
    // Actions
    setLoading,
    setError,
    openModal,
    closeModal,
    toggleSidebar,
    setSidebarOpen: setSidebarOpenState,
    toggleTheme,
    setTheme: setThemeState,
    addNotification,
    removeNotification,
    clearNotifications
  }
}
