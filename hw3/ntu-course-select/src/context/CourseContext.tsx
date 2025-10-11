import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react'
import type { Course, LotteryEntry } from '../types/course'
import { detectConflicts, type ConflictResult } from '../utils/timeUtils'

interface CourseContextValue {
  courses: Course[]
  setCourses: (c: Course[]) => void
  selectedIds: Set<string>
  toggleSelect: (id: string) => void
  addToSelected: (id: string) => void
  clearSelection: () => void
  submittedIds: Set<string>
  submitSelection: () => void
  resetSubmitted: () => void
  // Enhanced conflict detection
  addSelectedWithConflictCheck: (course: Course) => Promise<ConflictResult>
  selectedCourses: Course[]
  conflicts: ConflictResult[]
  clearConflicts: () => void
  // Favorites functionality
  favorites: Set<string>
  toggleFavorite: (id: string) => void
  favoriteCourses: Course[]
  // Lottery functionality
  lotteryEntries: LotteryEntry[]
  addToLottery: (course: Course, priority: number) => void
  removeFromLottery: (courseId: string) => void
  updateLotteryPriority: (courseId: string, priority: number) => void
  runLottery: () => void
  clearLottery: () => void
  // Recommendation helpers
  recommendByProbability: (count?: number) => Course[]
  recommendSimilarToFavorites: (count?: number) => Course[]
  recommendNoConflicts: (count?: number) => Course[]
}

const CourseContext = createContext<CourseContextValue | undefined>(undefined)

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set())
  const [conflicts, setConflicts] = useState<ConflictResult[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [lotteryEntries, setLotteryEntries] = useState<LotteryEntry[]>([])

  // Load data from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('ntu-course-favorites')
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)))
    }

    const savedSelected = localStorage.getItem('ntu-course-selected')
    if (savedSelected) {
      setSelectedIds(new Set(JSON.parse(savedSelected)))
    }

    const savedLottery = localStorage.getItem('ntu-course-lottery')
    if (savedLottery) {
      setLotteryEntries(JSON.parse(savedLottery))
    }
  }, [])

  // Save favorites to localStorage when changed
  useEffect(() => {
    localStorage.setItem('ntu-course-favorites', JSON.stringify([...favorites]))
  }, [favorites])

  // Save selected courses to localStorage when changed
  useEffect(() => {
    localStorage.setItem('ntu-course-selected', JSON.stringify([...selectedIds]))
  }, [selectedIds])

  // Save lottery entries to localStorage when changed
  useEffect(() => {
    localStorage.setItem('ntu-course-lottery', JSON.stringify(lotteryEntries))
  }, [lotteryEntries])

  const selectedCourses = useMemo(() => {
    return courses.filter(c => selectedIds.has(c.ser_no))
  }, [courses, selectedIds])

  const favoriteCourses = useMemo(() => {
    return courses.filter(c => favorites.has(c.ser_no))
  }, [courses, favorites])

  const toggleSelect = useCallback((ser_no: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(ser_no)) {
        next.delete(ser_no)
        // Clear conflicts when removing courses
        setConflicts(prev => prev.filter(c => 
          !c.conflicts.some(conflict => 
            conflict.conflictingCourse.ser_no === ser_no
          )
        ))
      } else {
        next.add(ser_no)
      }
      return next
    })
  }, [])

  const addToSelected = useCallback((ser_no: string) => {
    setSelectedIds(prev => new Set(prev).add(ser_no))
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
    setConflicts([])
  }, [])

  const submitSelection = useCallback(() => {
    setSubmittedIds(new Set(selectedIds))
  }, [selectedIds])

  const resetSubmitted = useCallback(() => {
    setSubmittedIds(new Set())
  }, [])

  const clearConflicts = useCallback(() => {
    setConflicts([])
  }, [])

  // Favorites functionality
  const toggleFavorite = useCallback((ser_no: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(ser_no)) {
        next.delete(ser_no)
      } else {
        next.add(ser_no)
      }
      return next
    })
  }, [])

  // Lottery functionality
  const addToLottery = useCallback((course: Course, priority: number) => {
    setLotteryEntries(prev => {
      const existing = prev.find(entry => entry.course.ser_no === course.ser_no)
      if (existing) {
        return prev.map(entry => 
          entry.course.ser_no === course.ser_no 
            ? { ...entry, priority }
            : entry
        )
      } else {
        return [...prev, { course, priority, isSelected: false }]
      }
    })
  }, [])

  const removeFromLottery = useCallback((courseId: string) => {
    setLotteryEntries(prev => prev.filter(entry => entry.course.ser_no !== courseId))
  }, [])

  const updateLotteryPriority = useCallback((courseId: string, priority: number) => {
    setLotteryEntries(prev => 
      prev.map(entry => 
        entry.course.ser_no === courseId 
          ? { ...entry, priority }
          : entry
      )
    )
  }, [])

  const runLottery = useCallback(() => {
    // Sort by priority (1 = highest)
    const sortedEntries = [...lotteryEntries].sort((a, b) => a.priority - b.priority)
    const selectedCourses = new Set<string>()
    const results: LotteryEntry[] = []
    const newlySelectedCourseIds: string[] = []

    for (const entry of sortedEntries) {
      const probability = entry.course.selectionProbability || 50
      const random = Math.random() * 100
      const isSelected = random <= probability

      if (isSelected) {
        // Check for conflicts with already selected courses
        const hasConflict = selectedCourses.has(entry.course.ser_no) || 
          results.some(selected => 
            selected.isSelected && 
            detectConflicts(entry.course, [selected.course]).hasConflict
          )

        if (!hasConflict) {
          selectedCourses.add(entry.course.ser_no)
          results.push({ ...entry, isSelected: true })
          newlySelectedCourseIds.push(entry.course.ser_no)
        } else {
          results.push({ ...entry, isSelected: false })
        }
      } else {
        results.push({ ...entry, isSelected: false })
      }
    }

    // Add newly selected courses to final selection
    if (newlySelectedCourseIds.length > 0) {
      setSubmittedIds(prev => {
        const newSet = new Set(prev)
        newlySelectedCourseIds.forEach(id => newSet.add(id))
        return newSet
      })
    }

    setLotteryEntries(results)
  }, [lotteryEntries])

  const clearLottery = useCallback(() => {
    setLotteryEntries([])
  }, [])

  // Enhanced recommendations with multiple strategies
  const recommendByProbability = useCallback((count = 8) => {
    return [...courses]
      .filter(c => !favorites.has(c.ser_no) && !selectedIds.has(c.ser_no)) // Exclude already favorited/selected
      .sort((a, b) => (b.selectionProbability || 0) - (a.selectionProbability || 0))
      .slice(0, count)
  }, [courses, favorites, selectedIds])

  const recommendSimilarToFavorites = useCallback((count = 8) => {
    const favDepts = new Set<string>()
    const favKeywords = new Set<string>()
    
    // Extract department and keywords from favorites
    for (const c of courses) {
      if (favorites.has(c.ser_no)) {
        if (c.dpt_abbr) favDepts.add(c.dpt_abbr)
        // Extract keywords from course names
        const keywords = (c.cou_cname + ' ' + c.cou_ename).toLowerCase()
          .split(/\s+/)
          .filter(word => word.length > 2)
        keywords.forEach(kw => favKeywords.add(kw))
      }
    }
    
    if (favDepts.size === 0 && favKeywords.size === 0) {
      return recommendByProbability(count)
    }
    
    // Score courses based on department and keyword matches
    const scored = courses
      .filter(c => !favorites.has(c.ser_no) && !selectedIds.has(c.ser_no))
      .map(course => {
        let score = 0
        if (course.dpt_abbr && favDepts.has(course.dpt_abbr)) score += 3
        if (course.selectionProbability) score += course.selectionProbability / 100
        
        // Keyword matching
        const courseText = (course.cou_cname + ' ' + course.cou_ename).toLowerCase()
        for (const keyword of favKeywords) {
          if (courseText.includes(keyword)) score += 1
        }
        
        return { course, score }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(item => item.course)
    
    return scored
  }, [courses, favorites, selectedIds, recommendByProbability])

  // New recommendation: courses with no time conflicts
  const recommendNoConflicts = useCallback((count = 8) => {
    return [...courses]
      .filter(c => !favorites.has(c.ser_no) && !selectedIds.has(c.ser_no))
      .filter(c => {
        const conflictResult = detectConflicts(c, selectedCourses)
        return !conflictResult.hasConflict
      })
      .sort((a, b) => (b.selectionProbability || 0) - (a.selectionProbability || 0))
      .slice(0, count)
  }, [courses, favorites, selectedIds])

  // Enhanced conflict detection with async support for user confirmation
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

  const value = useMemo<CourseContextValue>(() => ({
    courses,
    setCourses,
    selectedIds,
    toggleSelect,
    addToSelected,
    clearSelection,
    submittedIds,
    submitSelection,
    resetSubmitted,
    addSelectedWithConflictCheck,
    selectedCourses,
    conflicts,
    clearConflicts,
    favorites,
    toggleFavorite,
    favoriteCourses,
    lotteryEntries,
    addToLottery,
    removeFromLottery,
    updateLotteryPriority,
    runLottery,
    clearLottery,
    recommendByProbability,
    recommendSimilarToFavorites,
    recommendNoConflicts,
  }), [
    courses, selectedIds, submittedIds, selectedCourses, conflicts,
    addSelectedWithConflictCheck, favorites, favoriteCourses, lotteryEntries,
    recommendByProbability, recommendSimilarToFavorites, recommendNoConflicts
  ])

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>
}

export function useCourseContext() {
  const ctx = useContext(CourseContext)
  if (!ctx) throw new Error('useCourseContext must be used within CourseProvider')
  return ctx
}