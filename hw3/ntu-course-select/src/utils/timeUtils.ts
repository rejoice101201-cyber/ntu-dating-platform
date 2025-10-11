import type { Course } from '../types/course'

export interface Slot {
  day: number
  period: number
  classroom?: string
}

export interface ConflictInfo {
  type: 'time' | 'classroom' | 'priority'
  message: string
  conflictingCourse: Course
  slot: Slot
}

export interface ConflictResult {
  hasConflict: boolean
  conflicts: ConflictInfo[]
  canOverride: boolean
}

// Enhanced classroom coordinates for distance calculation
const CLASSROOM_COORDS: Record<string, { x: number; y: number; building: string }> = {
  // Engineering College
  'EC101': { x: 0, y: 0, building: 'EC' },
  'EC102': { x: 0, y: 1, building: 'EC' },
  'EC201': { x: 3, y: 0, building: 'EC' },
  'EC202': { x: 3, y: 1, building: 'EC' },
  'EC301': { x: 0, y: 2, building: 'EC' },
  'EC302': { x: 0, y: 3, building: 'EC' },
  
  // Liberal Arts Building
  '博雅101': { x: 2, y: 0, building: '博雅' },
  '博雅102': { x: 2, y: 1, building: '博雅' },
  '博雅201': { x: 2, y: 2, building: '博雅' },
  '博雅202': { x: 2, y: 3, building: '博雅' },
  
  // Common Building
  '共104': { x: 3, y: 0, building: '共' },
  '共105': { x: 3, y: 1, building: '共' },
  '共204': { x: 3, y: 2, building: '共' },
  '共205': { x: 3, y: 3, building: '共' },
  
  // Science Building
  '理101': { x: 1, y: 0, building: '理' },
  '理102': { x: 1, y: 1, building: '理' },
  '理201': { x: 1, y: 2, building: '理' },
  '理202': { x: 1, y: 3, building: '理' },
  
  // Online courses
  '線上': { x: -1, y: -1, building: '線上' },
  'Online': { x: -1, y: -1, building: '線上' },
}

const DAY_NAMES = ['', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']
const PERIOD_NAMES = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15']

/**
 * Parse time slots from course data with enhanced error handling
 */
export const getSlots = (course: Course): Slot[] => {
  const slots: Slot[] = []
  
  // Check if course is online (ignore time slots)
  if (course.co_rep?.toLowerCase().includes('online') || 
      course.co_select?.toLowerCase().includes('online')) {
    return slots
  }

  for (let i = 1; i <= 6; i++) {
    const stKey = `st${i}` as keyof Course
    const dayKey = `day${i}` as keyof Course
    const classroomKey = `clsrom_${i}` as keyof Course
    
    const st = course[stKey] as number | string | undefined
    const day = course[dayKey] as number | undefined
    const classroom = course[classroomKey] as string | undefined

    // Skip if no time data
    if (!st || !day || (typeof st === 'number' && st <= 0) || day <= 0) continue
    
    // Handle weekend (day 7 = Sunday)
    if (day > 7) continue
    
    // Handle periods beyond 15 (extended periods) for numbers
    if (typeof st === 'number' && st > 15) continue

    // Handle special period formats (A=10, B=11, C=12, etc.)
    let period: number
    if (typeof st === 'string') {
      const upperSt = st.toUpperCase()
      if (upperSt >= 'A' && upperSt <= 'Z') {
        period = upperSt.charCodeAt(0) - 'A'.charCodeAt(0) + 10
      } else {
        period = parseInt(upperSt) || 0
      }
    } else {
      period = st
    }

    if (period > 0 && period <= 15) {
      slots.push({
        day,
        period,
        classroom: classroom?.trim() || undefined
      })
    }
  }
  
  return slots
}

/**
 * Calculate distance between two classrooms (enhanced implementation)
 */
const getClassroomDistance = (classroom1?: string, classroom2?: string): number => {
  if (!classroom1 || !classroom2) return Infinity
  
  const coord1 = CLASSROOM_COORDS[classroom1]
  const coord2 = CLASSROOM_COORDS[classroom2]
  
  if (!coord1 || !coord2) return Infinity
  
  // Online courses have no distance constraint
  if (coord1.building === '線上' || coord2.building === '線上') return 0
  
  // Same building = very close
  if (coord1.building === coord2.building) {
    return Math.sqrt(Math.pow(coord1.x - coord2.x, 2) + Math.pow(coord1.y - coord2.y, 2)) * 0.5
  }
  
  // Different buildings = farther
  return Math.sqrt(Math.pow(coord1.x - coord2.x, 2) + Math.pow(coord1.y - coord2.y, 2))
}

/**
 * Check if a course is required/priority (enhanced)
 */
const isRequiredCourse = (course: Course): boolean => {
  return (course.co_tp === '1') || // Required course type
         (course.mark === '1') ||   // Required mark
         (course.co_rep?.toLowerCase().includes('必修') ?? false) ||
         (course.co_rep?.toLowerCase().includes('必帶') ?? false) ||
         (course.co_rep?.toLowerCase().includes('required') ?? false) ||
         (course.co_rep?.toLowerCase().includes('mandatory') ?? false)
}

/**
 * Get course priority level (0-3, higher = more important)
 */
const getCoursePriority = (course: Course): number => {
  if (isRequiredCourse(course)) return 3 // Highest priority
  if (course.co_tp === '2') return 2 // Semi-required
  if (course.co_tp === '0' && course.mark === '0') return 1 // Elective
  return 0 // Unknown
}

/**
 * Enhanced conflict detection with multiple conflict types
 */
export const detectConflicts = (
  newCourse: Course,
  existingCourses: Course[],
  options: {
    checkClassroomDistance?: boolean
    maxClassroomDistance?: number
    allowOverride?: boolean
  } = {}
): ConflictResult => {
  const {
    checkClassroomDistance = false,
    maxClassroomDistance = 2,
    allowOverride = true
  } = options

  const newSlots = getSlots(newCourse)
  const conflicts: ConflictInfo[] = []
  
  // Performance optimization: Use Map for O(1) lookups
  const existingSlotsMap = new Map<number, Set<number>>()
  const existingCoursesMap = new Map<string, Course>()
  
  existingCourses.forEach(course => {
    const slots = getSlots(course)
    slots.forEach(slot => {
      if (!existingSlotsMap.has(slot.day)) {
        existingSlotsMap.set(slot.day, new Set())
      }
      existingSlotsMap.get(slot.day)!.add(slot.period)
      existingCoursesMap.set(`${slot.day}-${slot.period}`, course)
    })
  })

  // Check for conflicts
  newSlots.forEach(newSlot => {
    const daySet = existingSlotsMap.get(newSlot.day)
    if (daySet?.has(newSlot.period)) {
      const conflictingCourse = existingCoursesMap.get(`${newSlot.day}-${newSlot.period}`)!
      
      // Time conflict
      conflicts.push({
        type: 'time',
        message: `時間衝突：與「${conflictingCourse.cou_cname || conflictingCourse.cou_ename}」在${DAY_NAMES[newSlot.day]}第${PERIOD_NAMES[newSlot.period]}節`,
        conflictingCourse,
        slot: newSlot
      })

      // Classroom distance conflict (if enabled)
      if (checkClassroomDistance && newSlot.classroom && conflictingCourse) {
        const conflictingSlots = getSlots(conflictingCourse)
        const conflictingSlot = conflictingSlots.find(s => 
          s.day === newSlot.day && s.period === newSlot.period
        )
        
        if (conflictingSlot?.classroom) {
          const distance = getClassroomDistance(newSlot.classroom, conflictingSlot.classroom)
          if (distance > maxClassroomDistance) {
            conflicts.push({
              type: 'classroom',
              message: `教室距離過遠：${newSlot.classroom} 與 ${conflictingSlot.classroom} 距離 ${distance.toFixed(1)} 單位`,
              conflictingCourse,
              slot: newSlot
            })
          }
        }
      }

      // Priority conflict (required vs elective)
      if (isRequiredCourse(conflictingCourse) && !isRequiredCourse(newCourse)) {
        conflicts.push({
          type: 'priority',
          message: `優先級衝突：${conflictingCourse.cou_cname || conflictingCourse.cou_ename} 為必修課程`,
          conflictingCourse,
          slot: newSlot
        })
      }
    }
  })

  const hasConflict = conflicts.length > 0
  const canOverride = allowOverride && conflicts.every(c => c.type !== 'priority')

  return {
    hasConflict,
    conflicts,
    canOverride
  }
}

/**
 * Format conflict message for display
 */
export const formatConflictMessage = (conflicts: ConflictInfo[]): string => {
  if (conflicts.length === 0) return ''
  
  const messages = conflicts.map(c => c.message)
  return messages.join('\n')
}

/**
 * Get conflict severity level
 */
export const getConflictSeverity = (conflicts: ConflictInfo[]): 'low' | 'medium' | 'high' => {
  if (conflicts.some(c => c.type === 'priority')) return 'high'
  if (conflicts.some(c => c.type === 'time')) return 'medium'
  return 'low'
}

/**
 * Check if two courses have time conflicts (simple version)
 */
export const hasTimeConflict = (course1: Course, course2: Course): boolean => {
  const slots1 = getSlots(course1)
  const slots2 = getSlots(course2)
  
  const slots1Set = new Set(slots1.map(s => `${s.day}-${s.period}`))
  return slots2.some(s => slots1Set.has(`${s.day}-${s.period}`))
}

/**
 * Get all time slots for a course in a more readable format
 */
export const getReadableTimeSlots = (course: Course): string[] => {
  const slots = getSlots(course)
  return slots.map(slot => 
    `${DAY_NAMES[slot.day]}第${PERIOD_NAMES[slot.period]}節${slot.classroom ? `@${slot.classroom}` : ''}`
  )
}

/**
 * Calculate selection probability based on course data
 */
export const calculateSelectionProbability = (course: Course): number => {
  let probability = 50 // Base probability
  
  // Adjust based on limit
  if (course.limit) {
    if (course.limit > 100) probability += 20
    else if (course.limit > 50) probability += 10
    else if (course.limit < 20) probability -= 20
    else if (course.limit < 10) probability -= 30
  }
  
  // Adjust based on course type
  const priority = getCoursePriority(course)
  if (priority === 3) probability += 15 // Required courses
  else if (priority === 2) probability += 5 // Semi-required
  
  // Adjust based on department popularity (mock)
  const popularDepts = ['CS', 'EE', 'ME', 'CE']
  if (course.dpt_abbr && popularDepts.includes(course.dpt_abbr)) {
    probability -= 10 // More competitive
  }
  
  // Ensure probability is within reasonable bounds
  return Math.max(20, Math.min(90, probability))
}

/**
 * Get course priority level (exported for use in components)
 */
export { getCoursePriority }
