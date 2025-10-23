import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import type { Course } from '../types/course'
import { detectConflicts, type ConflictResult } from '../utils/timeUtils'

export interface SelectionState {
  selectedIds: Set<string>
  submittedIds: Set<string>
  conflicts: ConflictResult[]
  isSubmitting: boolean
}

export interface SelectionActions {
  toggleSelect: (courseId: string) => void
  addToSelected: (courseId: string) => void
  removeFromSelected: (courseId: string) => void
  clearSelection: () => void
  submitSelection: () => Promise<void>
  resetSubmitted: () => void
  addSelectedWithConflictCheck: (course: Course) => Promise<ConflictResult>
  clearConflicts: () => void
}

export interface UseCourseSelectionReturn extends SelectionState, SelectionActions {
  selectedCourses: Course[]
  submittedCourses: Course[]
  totalCredits: number
  submittedCredits: number
  canSubmit: boolean
  selectionStats: {
    selectedCount: number
    submittedCount: number
    conflictCount: number
    totalCredits: number
    submittedCredits: number
  }
}

export function useCourseSelection(
  courses: Course[],
  initialSelectedIds: Set<string> = new Set(),
  initialSubmittedIds: Set<string> = new Set()
): UseCourseSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(initialSelectedIds)
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(initialSubmittedIds)
  const [conflicts, setConflicts] = useState<ConflictResult[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Use ref to track previous selection for performance optimization
  const previousSelectionRef = useRef<Set<string>>(new Set())

  // Memoized selected courses
  const selectedCourses = useMemo(() => {
    return courses.filter(course => selectedIds.has(course.ser_no))
  }, [courses, selectedIds])

  // Memoized submitted courses
  const submittedCourses = useMemo(() => {
    return courses.filter(course => submittedIds.has(course.ser_no))
  }, [courses, submittedIds])

  // Calculate total credits
  const totalCredits = useMemo(() => {
    return selectedCourses.reduce((total, course) => total + course.credit, 0)
  }, [selectedCourses])

  const submittedCredits = useMemo(() => {
    return submittedCourses.reduce((total, course) => total + course.credit, 0)
  }, [submittedCourses])

  // Check if selection can be submitted
  const canSubmit = useMemo(() => {
    return selectedIds.size > 0 && conflicts.length === 0 && !isSubmitting
  }, [selectedIds.size, conflicts.length, isSubmitting])

  // Selection statistics
  const selectionStats = useMemo(() => ({
    selectedCount: selectedIds.size,
    submittedCount: submittedIds.size,
    conflictCount: conflicts.length,
    totalCredits,
    submittedCredits
  }), [selectedIds.size, submittedIds.size, conflicts.length, totalCredits, submittedCredits])

  // Toggle course selection
  const toggleSelect = useCallback((courseId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(courseId)) {
        next.delete(courseId)
        // Clear conflicts when removing courses
        setConflicts(prevConflicts => 
          prevConflicts.filter(conflict => 
            !conflict.conflicts.some(c => 
              c.conflictingCourse.ser_no === courseId
            )
          )
        )
      } else {
        next.add(courseId)
      }
      return next
    })
  }, [])

  // Add course to selection
  const addToSelected = useCallback((courseId: string) => {
    setSelectedIds(prev => new Set(prev).add(courseId))
  }, [])

  // Remove course from selection
  const removeFromSelected = useCallback((courseId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.delete(courseId)
      return next
    })
    // Clear related conflicts
    setConflicts(prevConflicts => 
      prevConflicts.filter(conflict => 
        !conflict.conflicts.some(c => 
          c.conflictingCourse.ser_no === courseId
        )
      )
    )
  }, [])

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
    setConflicts([])
  }, [])

  // Submit selection
  const submitSelection = useCallback(async () => {
    if (!canSubmit) return

    setIsSubmitting(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSubmittedIds(new Set(selectedIds))
    } catch (error) {
      console.error('Failed to submit selection:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [canSubmit, selectedIds])

  // Reset submitted courses
  const resetSubmitted = useCallback(() => {
    setSubmittedIds(new Set())
  }, [])

  // Clear conflicts
  const clearConflicts = useCallback(() => {
    setConflicts([])
  }, [])

  // Enhanced conflict detection with async support
  const addSelectedWithConflictCheck = useCallback(async (course: Course): Promise<ConflictResult> => {
    const conflictResult = detectConflicts(course, selectedCourses)

    if (conflictResult.hasConflict) {
      // Store conflict for display
      setConflicts(prev => [...prev, conflictResult])
      
      // Show detailed conflict dialog
      const conflictMessages = conflictResult.conflicts.map(c => c.message).join('\n')
      const severity = conflictResult.conflicts.some(c => c.type === 'priority') ? 'high' : 'medium'
      
      if (severity === 'high') {
        // High severity conflicts cannot be overridden
        alert(`⚠️ 嚴重衝突！\n\n${conflictMessages}\n\n無法加入此課程。`)
        return conflictResult
      } else {
        // Medium/low severity conflicts can be overridden with confirmation
        const userConfirmed = confirm(
          `⚠️ 時間衝突警告\n\n${conflictMessages}\n\n是否仍要加入此課程？`
        )
        
        if (userConfirmed) {
          setSelectedIds(prev => new Set([...prev, course.ser_no]))
          // Remove this conflict from the list since it's been resolved
          setConflicts(prev => prev.filter(c => c !== conflictResult))
          return { ...conflictResult, hasConflict: false, conflicts: [] }
        } else {
          return conflictResult
        }
      }
    } else {
      // No conflicts, add directly
      setSelectedIds(prev => new Set([...prev, course.ser_no]))
      return conflictResult
    }
  }, [selectedCourses])

  // Auto-detect conflicts when selection changes
  useEffect(() => {
    if (selectedIds.size > 1) {
      const newConflicts: ConflictResult[] = []
      
      for (const courseId of selectedIds) {
        const course = courses.find(c => c.ser_no === courseId)
        if (course) {
          const otherCourses = selectedCourses.filter(c => c.ser_no !== courseId)
          const conflictResult = detectConflicts(course, otherCourses)
          if (conflictResult.hasConflict) {
            newConflicts.push(conflictResult)
          }
        }
      }
      
      setConflicts(newConflicts)
    } else {
      setConflicts([])
    }
  }, [selectedIds, courses, selectedCourses])

  // Persist selection to localStorage
  useEffect(() => {
    localStorage.setItem('ntu-course-selected', JSON.stringify([...selectedIds]))
  }, [selectedIds])

  // Load selection from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ntu-course-selected')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSelectedIds(new Set(parsed))
      } catch (error) {
        console.error('Failed to load saved selection:', error)
      }
    }
  }, [])

  return {
    // State
    selectedIds,
    submittedIds,
    conflicts,
    isSubmitting,
    selectedCourses,
    submittedCourses,
    totalCredits,
    submittedCredits,
    canSubmit,
    selectionStats,
    
    // Actions
    toggleSelect,
    addToSelected,
    removeFromSelected,
    clearSelection,
    submitSelection,
    resetSubmitted,
    addSelectedWithConflictCheck,
    clearConflicts
  }
}
