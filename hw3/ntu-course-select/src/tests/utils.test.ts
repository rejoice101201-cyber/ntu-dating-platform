import { describe, it, expect } from '@jest/globals'
import { 
  getSlots, 
  detectConflicts, 
  hasTimeConflict, 
  getReadableTimeSlots,
  formatConflictMessage,
  getConflictSeverity
} from '../utils/timeUtils'
import type { Course } from '../types/course'

// Mock course data for testing
const createMockCourse = (overrides: Partial<Course> = {}): Course => ({
  ser_no: '12345',
  cou_code: 'CS101',
  cou_cname: '計算機概論',
  cou_ename: 'Introduction to Computer Science',
  dpt_code: '1000',
  dpt_abbr: 'CS',
  credit: 3,
  tlec: 3,
  tlab: 0,
  tea_cname: '張教授',
  tea_ename: 'Prof. Chang',
  st1: 1,
  day1: 1,
  st2: 2,
  day2: 1,
  clsrom_1: 'EC101',
  clsrom_2: 'EC102',
  limit: 50,
  pre_course: '',
  co_rep: '',
  co_select: '',
  outside: '',
  co_tp: '0',
  mark: '0',
  displayName: '計算機概論',
  totalHours: 3,
  timeSlots: [],
  ...overrides
})

describe('getSlots', () => {
  it('should parse basic time slots correctly', () => {
    const course = createMockCourse({
      st1: 1,
      day1: 1,
      st2: 2,
      day2: 1,
      clsrom_1: 'EC101',
      clsrom_2: 'EC102'
    })

    const slots = getSlots(course)
    
    expect(slots).toHaveLength(2)
    expect(slots[0]).toEqual({
      day: 1,
      period: 1,
      classroom: 'EC101'
    })
    expect(slots[1]).toEqual({
      day: 1,
      period: 2,
      classroom: 'EC102'
    })
  })

  it('should handle empty time slots', () => {
    const course = createMockCourse({
      st1: 0,
      day1: 0,
      st2: 0,
      day2: 0
    })

    const slots = getSlots(course)
    expect(slots).toHaveLength(0)
  })

  it('should handle online courses', () => {
    const course = createMockCourse({
      co_rep: 'This is an online course',
      st1: 1,
      day1: 1
    })

    const slots = getSlots(course)
    expect(slots).toHaveLength(0)
  })

  it('should handle weekend courses (day 7)', () => {
    const course = createMockCourse({
      st1: 1,
      day1: 7,
      clsrom_1: 'EC101'
    })

    const slots = getSlots(course)
    expect(slots).toHaveLength(1)
    expect(slots[0].day).toBe(7)
  })

  it('should filter out invalid periods', () => {
    const course = createMockCourse({
      st1: 20, // Invalid period
      day1: 1,
      st2: 1,
      day2: 1
    })

    const slots = getSlots(course)
    expect(slots).toHaveLength(1)
    expect(slots[0].period).toBe(1)
  })
})

describe('hasTimeConflict', () => {
  it('should detect time conflicts', () => {
    const course1 = createMockCourse({
      ser_no: '1',
      st1: 1,
      day1: 1
    })
    
    const course2 = createMockCourse({
      ser_no: '2',
      st1: 1,
      day1: 1
    })

    expect(hasTimeConflict(course1, course2)).toBe(true)
  })

  it('should not detect conflicts for different times', () => {
    const course1 = createMockCourse({
      ser_no: '1',
      st1: 1,
      day1: 1
    })
    
    const course2 = createMockCourse({
      ser_no: '2',
      st1: 2,
      day1: 1
    })

    expect(hasTimeConflict(course1, course2)).toBe(false)
  })

  it('should not detect conflicts for different days', () => {
    const course1 = createMockCourse({
      ser_no: '1',
      st1: 1,
      day1: 1
    })
    
    const course2 = createMockCourse({
      ser_no: '2',
      st1: 1,
      day1: 2
    })

    expect(hasTimeConflict(course1, course2)).toBe(false)
  })
})

describe('detectConflicts', () => {
  it('should detect time conflicts', () => {
    const newCourse = createMockCourse({
      ser_no: '1',
      st1: 1,
      day1: 1
    })
    
    const existingCourses = [
      createMockCourse({
        ser_no: '2',
        st1: 1,
        day1: 1
      })
    ]

    const result = detectConflicts(newCourse, existingCourses)
    
    expect(result.hasConflict).toBe(true)
    expect(result.conflicts).toHaveLength(1)
    expect(result.conflicts[0].type).toBe('time')
  })

  it('should detect classroom distance conflicts', () => {
    const newCourse = createMockCourse({
      ser_no: '1',
      st1: 1,
      day1: 1,
      clsrom_1: 'EC101'
    })
    
    const existingCourses = [
      createMockCourse({
        ser_no: '2',
        st1: 1,
        day1: 1,
        clsrom_1: 'EC201' // Far classroom
      })
    ]

    const result = detectConflicts(newCourse, existingCourses, {
      checkClassroomDistance: true,
      maxClassroomDistance: 1
    })
    
    expect(result.hasConflict).toBe(true)
    expect(result.conflicts.some(c => c.type === 'classroom')).toBe(true)
  })

  it('should detect priority conflicts', () => {
    const newCourse = createMockCourse({
      ser_no: '1',
      st1: 1,
      day1: 1,
      co_tp: '0' // Elective
    })
    
    const existingCourses = [
      createMockCourse({
        ser_no: '2',
        st1: 1,
        day1: 1,
        co_tp: '1' // Required
      })
    ]

    const result = detectConflicts(newCourse, existingCourses)
    
    expect(result.hasConflict).toBe(true)
    expect(result.conflicts.some(c => c.type === 'priority')).toBe(true)
    expect(result.canOverride).toBe(false)
  })

  it('should allow override for non-priority conflicts', () => {
    const newCourse = createMockCourse({
      ser_no: '1',
      st1: 1,
      day1: 1
    })
    
    const existingCourses = [
      createMockCourse({
        ser_no: '2',
        st1: 1,
        day1: 1
      })
    ]

    const result = detectConflicts(newCourse, existingCourses)
    
    expect(result.hasConflict).toBe(true)
    expect(result.canOverride).toBe(true)
  })
})

describe('getReadableTimeSlots', () => {
  it('should format time slots correctly', () => {
    const course = createMockCourse({
      st1: 1,
      day1: 1,
      st2: 2,
      day2: 1,
      clsrom_1: 'EC101',
      clsrom_2: 'EC102'
    })

    const readable = getReadableTimeSlots(course)
    
    expect(readable).toHaveLength(2)
    expect(readable[0]).toBe('星期一第1節@EC101')
    expect(readable[1]).toBe('星期一第2節@EC102')
  })

  it('should handle courses without classrooms', () => {
    const course = createMockCourse({
      st1: 1,
      day1: 1,
      clsrom_1: ''
    })

    const readable = getReadableTimeSlots(course)
    
    expect(readable[0]).toBe('星期一第1節')
  })
})

describe('formatConflictMessage', () => {
  it('should format conflict messages correctly', () => {
    const conflicts = [
      {
        type: 'time' as const,
        message: '時間衝突：與「計算機概論」在星期一第1節',
        conflictingCourse: createMockCourse(),
        slot: { day: 1, period: 1 }
      },
      {
        type: 'classroom' as const,
        message: '教室距離過遠：EC101 與 EC201 距離 2.0 單位',
        conflictingCourse: createMockCourse(),
        slot: { day: 1, period: 1 }
      }
    ]

    const message = formatConflictMessage(conflicts)
    
    expect(message).toContain('時間衝突：與「計算機概論」在星期一第1節')
    expect(message).toContain('教室距離過遠：EC101 與 EC201 距離 2.0 單位')
  })

  it('should return empty string for no conflicts', () => {
    const message = formatConflictMessage([])
    expect(message).toBe('')
  })
})

describe('getConflictSeverity', () => {
  it('should return high severity for priority conflicts', () => {
    const conflicts = [
      {
        type: 'priority' as const,
        message: 'Priority conflict',
        conflictingCourse: createMockCourse(),
        slot: { day: 1, period: 1 }
      }
    ]

    expect(getConflictSeverity(conflicts)).toBe('high')
  })

  it('should return medium severity for time conflicts', () => {
    const conflicts = [
      {
        type: 'time' as const,
        message: 'Time conflict',
        conflictingCourse: createMockCourse(),
        slot: { day: 1, period: 1 }
      }
    ]

    expect(getConflictSeverity(conflicts)).toBe('medium')
  })

  it('should return low severity for classroom conflicts', () => {
    const conflicts = [
      {
        type: 'classroom' as const,
        message: 'Classroom conflict',
        conflictingCourse: createMockCourse(),
        slot: { day: 1, period: 1 }
      }
    ]

    expect(getConflictSeverity(conflicts)).toBe('low')
  })
})
