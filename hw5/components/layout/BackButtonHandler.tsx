"use client"

import { useEffect, useState, useRef } from "react"
import { LogoutConfirmModal } from "@/components/auth/LogoutConfirmModal"

// Custom event name for internal navigation
const INTERNAL_NAVIGATION_EVENT = "internal-navigation"

export function BackButtonHandler() {
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  // Use ref to track if next popstate should be ignored (internal navigation)
  const ignoreNextPopStateRef = useRef(false)

  useEffect(() => {
    // Listen for custom event from components that want to do internal navigation
    const handleInternalNavigation = () => {
      // Set flag synchronously before router.back() triggers popstate
      ignoreNextPopStateRef.current = true
    }

    const handlePopState = (e: PopStateEvent) => {
      // Check ref flag to determine if this is internal navigation
      const isInternal = ignoreNextPopStateRef.current
      
      if (!isInternal) {
        // This is browser-native back (browser back button or Alt+Left)
        // Push state back to prevent navigation, then show logout confirmation
        window.history.pushState(null, "", window.location.href)
        setShowLogoutModal(true)
      } else {
        // This is internal navigation (router.back()), clear flag and allow navigation
        ignoreNextPopStateRef.current = false
      }
    }
    
    // Listen for custom event
    window.addEventListener(INTERNAL_NAVIGATION_EVENT, handleInternalNavigation)
    // Listen for popstate
    window.addEventListener("popstate", handlePopState)

    return () => {
      window.removeEventListener(INTERNAL_NAVIGATION_EVENT, handleInternalNavigation)
      window.removeEventListener("popstate", handlePopState)
    }
  }, [])

  return (
    <LogoutConfirmModal 
      isOpen={showLogoutModal} 
      onClose={() => setShowLogoutModal(false)} 
    />
  )
}

// Export helper function for components to signal internal navigation
export function signalInternalNavigation() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(INTERNAL_NAVIGATION_EVENT))
  }
}

