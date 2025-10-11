import { useState, useMemo, useCallback } from 'react'
import type { Course } from '../types/course'
import { detectConflicts, type ConflictResult } from '../utils/timeUtils'

export interface TimetableSlot {
  day: number
  period: number
  course: Course | null
  isConflict: boolean
  conflictType?: 'time' | 'classroom' | 'priority'
}

export interface TimetableGrid {
  slots: TimetableSlot[][]
  conflicts: ConflictResult[]
  totalCredits: number
}

const DAYS = ['', '一', '二', '三', '四', '五', '六', '日']
const PERIODS = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14']

export function useTimetable(selectedCourses: Course[]) {
  const [showConflicts, setShowConflicts] = useState(true)

  // Generate timetable grid
  const timetable = useMemo((): TimetableGrid => {
    const slots: TimetableSlot[][] = []
    const conflicts: ConflictResult[] = []
    let totalCredits = 0

    // Initialize 7x14 grid (7 days, 14 periods)
    for (let day = 0; day <= 6; day++) {
      slots[day] = []
      for (let period = 0; period <= 13; period++) {
        slots[day][period] = {
          day: day + 1,
          period: period + 1,
          course: null,
          isConflict: false
        }
      }
    }

    // Place courses in timetable
    for (const course of selectedCourses) {
      totalCredits += course.credit

      // Check for conflicts with already placed courses
      const conflictResult = detectConflicts(course, selectedCourses.filter(c => c !== course))
      if (conflictResult.hasConflict) {
        conflicts.push(conflictResult)
      }

      // Place course in timetable slots
      course.timeSlots?.forEach(slot => {
        const day = slot.day - 1
        const period = slot.start - 1

        if (day >= 0 && day <= 6 && period >= 0 && period <= 13) {
          const existingSlot = slots[day][period]
          
          if (existingSlot.course) {
            // Conflict detected
            existingSlot.isConflict = true
            existingSlot.conflictType = 'time'
            slots[day][period] = {
              ...existingSlot,
              isConflict: true,
              conflictType: 'time'
            }
          } else {
            slots[day][period] = {
              day: day + 1,
              period: period + 1,
              course,
              isConflict: false
            }
          }
        }
      })
    }

    return { slots, conflicts, totalCredits }
  }, [selectedCourses])

  // Get course at specific time slot
  const getCourseAtSlot = useCallback((day: number, period: number): Course | null => {
    if (day < 1 || day > 7 || period < 1 || period > 14) return null
    return timetable.slots[day - 1][period - 1]?.course || null
  }, [timetable])

  // Check if slot has conflict
  const hasConflictAtSlot = useCallback((day: number, period: number): boolean => {
    if (day < 1 || day > 7 || period < 1 || period > 14) return false
    return timetable.slots[day - 1][period - 1]?.isConflict || false
  }, [timetable])

  // Get conflicts for a specific course
  const getConflictsForCourse = useCallback((course: Course): ConflictResult[] => {
    return timetable.conflicts.filter(conflict => 
      conflict.course.ser_no === course.ser_no
    )
  }, [timetable.conflicts])

  // Get all courses at a specific day
  const getCoursesAtDay = useCallback((day: number): Course[] => {
    if (day < 1 || day > 7) return []
    return timetable.slots[day - 1]
      .filter(slot => slot.course)
      .map(slot => slot.course!)
  }, [timetable])

  // Get all courses at a specific period
  const getCoursesAtPeriod = useCallback((period: number): Course[] => {
    if (period < 1 || period > 14) return []
    const courses: Course[] = []
    for (let day = 0; day < 7; day++) {
      const slot = timetable.slots[day][period - 1]
      if (slot.course) {
        courses.push(slot.course)
      }
    }
    return courses
  }, [timetable])

  // Format time slot for display
  const formatTimeSlot = useCallback((day: number, period: number): string => {
    return `${DAYS[day]}${PERIODS[period]}`
  }, [])

  // Get timetable statistics
  const statistics = useMemo(() => {
    const totalSlots = 7 * 14
    const occupiedSlots = timetable.slots.flat().filter(slot => slot.course).length
    const conflictSlots = timetable.slots.flat().filter(slot => slot.isConflict).length
    
    return {
      totalSlots,
      occupiedSlots,
      conflictSlots,
      utilizationRate: (occupiedSlots / totalSlots) * 100,
      conflictRate: conflictSlots > 0 ? (conflictSlots / occupiedSlots) * 100 : 0
    }
  }, [timetable])

  return {
    timetable,
    showConflicts,
    setShowConflicts,
    getCourseAtSlot,
    hasConflictAtSlot,
    getConflictsForCourse,
    getCoursesAtDay,
    getCoursesAtPeriod,
    formatTimeSlot,
    statistics
  }
}
