import { useState, useMemo, useCallback } from 'react'
import type { Course } from '../types/course'

export interface SearchFilters {
  keyword: string
  department: string
  category: string
  timeSlot: string
  creditRange: [number, number]
  probabilityRange: [number, number]
}

export interface SortOptions {
  field: 'name' | 'teacher' | 'credit' | 'probability' | 'time'
  direction: 'asc' | 'desc'
}

export function useCourseSearch(courses: Course[]) {
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: '',
    department: '',
    category: '',
    timeSlot: '',
    creditRange: [0, 6],
    probabilityRange: [0, 100]
  })

  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'name',
    direction: 'asc'
  })

  // Memoized filtered and sorted courses
  const filteredCourses = useMemo(() => {
    let filtered = courses

    // Keyword search
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      filtered = filtered.filter(course =>
        course.cou_cname.toLowerCase().includes(keyword) ||
        course.cou_ename.toLowerCase().includes(keyword) ||
        course.tea_cname.toLowerCase().includes(keyword) ||
        course.tea_ename.toLowerCase().includes(keyword) ||
        course.ser_no.toLowerCase().includes(keyword) ||
        course.cou_code.toLowerCase().includes(keyword)
      )
    }

    // Department filter
    if (filters.department) {
      filtered = filtered.filter(course => course.dpt_abbr === filters.department)
    }

    // Category filter (based on course type)
    if (filters.category) {
      filtered = filtered.filter(course => {
        switch (filters.category) {
          case 'required':
            return course.co_tp === '1'
          case 'elective':
            return course.co_tp === '0'
          case 'general':
            return course.dpt_abbr?.includes('通識') || course.dpt_abbr?.includes('共同')
          case 'physical':
            return course.dpt_abbr?.includes('體育') || course.dpt_abbr?.includes('國防')
          default:
            return true
        }
      })
    }

    // Time slot filter
    if (filters.timeSlot) {
      const [day, period] = filters.timeSlot.split('-').map(Number)
      filtered = filtered.filter(course =>
        course.timeSlots?.some(slot => slot.day === day && slot.start === period)
      )
    }

    // Credit range filter
    filtered = filtered.filter(course =>
      course.credit >= filters.creditRange[0] && course.credit <= filters.creditRange[1]
    )

    // Probability range filter
    filtered = filtered.filter(course => {
      const probability = course.selectionProbability || 0
      return probability >= filters.probabilityRange[0] && probability <= filters.probabilityRange[1]
    })

    return filtered
  }, [courses, filters])

  // Memoized sorted courses
  const sortedCourses = useMemo(() => {
    return [...filteredCourses].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortOptions.field) {
        case 'name':
          aValue = a.cou_cname || a.cou_ename || ''
          bValue = b.cou_cname || b.cou_ename || ''
          break
        case 'teacher':
          aValue = a.tea_cname || a.tea_ename || ''
          bValue = b.tea_cname || b.tea_ename || ''
          break
        case 'credit':
          aValue = a.credit
          bValue = b.credit
          break
        case 'probability':
          aValue = a.selectionProbability || 0
          bValue = b.selectionProbability || 0
          break
        case 'time':
          aValue = a.timeSlots?.[0]?.day || 0
          bValue = b.timeSlots?.[0]?.day || 0
          break
        default:
          return 0
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOptions.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      } else {
        return sortOptions.direction === 'asc'
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number)
      }
    })
  }, [filteredCourses, sortOptions])

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Update sort options
  const updateSortOptions = useCallback((newSortOptions: Partial<SortOptions>) => {
    setSortOptions(prev => ({ ...prev, ...newSortOptions }))
  }, [])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      keyword: '',
      department: '',
      category: '',
      timeSlot: '',
      creditRange: [0, 6],
      probabilityRange: [0, 100]
    })
  }, [])

  // Get unique departments for filter dropdown
  const departments = useMemo(() => {
    const deptSet = new Set<string>()
    courses.forEach(course => {
      if (course.dpt_abbr) deptSet.add(course.dpt_abbr)
    })
    return Array.from(deptSet).sort()
  }, [courses])

  // Get unique time slots for filter dropdown
  const timeSlots = useMemo(() => {
    const slotSet = new Set<string>()
    courses.forEach(course => {
      course.timeSlots?.forEach(slot => {
        slotSet.add(`${slot.day}-${slot.start}`)
      })
    })
    return Array.from(slotSet).sort()
  }, [courses])

  return {
    filters,
    sortOptions,
    filteredCourses: sortedCourses,
    departments,
    timeSlots,
    updateFilters,
    updateSortOptions,
    clearFilters
  }
}
