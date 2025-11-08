"use client"

import { useEffect, useState } from "react"
import { formatRelativeTime } from "@/lib/utils"

interface RelativeTimeProps {
  date: Date | string
}

export function RelativeTime({ date }: RelativeTimeProps) {
  const [mounted, setMounted] = useState(false)
  const [timeString, setTimeString] = useState("")

  useEffect(() => {
    setMounted(true)
    const updateTime = () => {
      const dateObj = typeof date === "string" ? new Date(date) : date
      setTimeString(formatRelativeTime(dateObj))
    }
    
    updateTime()
    // Update every 10 seconds for recent posts
    const interval = setInterval(updateTime, 10000)
    
    return () => clearInterval(interval)
  }, [date])

  // During SSR, return the initial time (will be updated on client)
  const dateObj = typeof date === "string" ? new Date(date) : date
  const initialTime = formatRelativeTime(dateObj)

  return (
    <span className="text-gray-500" suppressHydrationWarning>
      {mounted ? timeString : initialTime}
    </span>
  )
}

