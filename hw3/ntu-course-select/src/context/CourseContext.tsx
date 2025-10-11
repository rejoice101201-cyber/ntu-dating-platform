import { createContext, useContext, useState, useEffect } from 'react'
import { assignRandomTimeSlots } from '../utils/simpleTimeAssigner'

interface Course {
  ser_no: string
  cou_cname: string
  cou_ename: string
  tea_cname: string
  cou_code: string
  credit: string | number
  dpt_code: string
  dpt_abbr: string
  co_tp: string
  mark: string
  co_rep: string
  pre_course: string
  probability?: number // 中籤機率 (0-1)
  priority?: number // 志願序 (1-20)
  time?: string // 上課時間
  classroom?: string // 教室
}

interface CourseContextValue {
  // Favorites functionality
  favorites: Set<string>
  addToFavorites: (course: Course) => void
  removeFromFavorites: (courseId: string) => void
  favoriteCourses: Course[]
  // Priority management
  updateCoursePriority: (courseId: string, priority: number) => void
  // Lottery functionality
  runLottery: (courses: Course[]) => Course[]
}

const CourseContext = createContext<CourseContextValue | undefined>(undefined)

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [favoriteCourses, setFavoriteCourses] = useState<Course[]>([])

  // Load data from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('ntu-course-favorites')
    const savedFavoriteCourses = localStorage.getItem('ntu-course-favorite-courses')
    
    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites)
        setFavorites(new Set(parsed))
      } catch (error) {
        console.error('Failed to load favorites from localStorage:', error)
      }
    }
    
    if (savedFavoriteCourses) {
      try {
        const parsed = JSON.parse(savedFavoriteCourses)
        setFavoriteCourses(parsed)
      } catch (error) {
        console.error('Failed to load favorite courses from localStorage:', error)
      }
    }
  }, [])

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ntu-course-favorites', JSON.stringify(Array.from(favorites)))
  }, [favorites])

  useEffect(() => {
    localStorage.setItem('ntu-course-favorite-courses', JSON.stringify(favoriteCourses))
  }, [favoriteCourses])

  const addToFavorites = (course: Course) => {
    console.log('Adding to favorites:', course.ser_no, course.cou_cname)
    setFavorites(prev => {
      const newSet = new Set(prev)
      newSet.add(course.ser_no)
      return newSet
    })
    setFavoriteCourses(prev => {
      if (!prev.find(c => c.ser_no === course.ser_no)) {
        return [...prev, course]
      }
      return prev
    })
  }

  const removeFromFavorites = (courseId: string) => {
    console.log('Removing from favorites:', courseId)
    setFavorites(prev => {
      const newSet = new Set(prev)
      newSet.delete(courseId)
      return newSet
    })
    setFavoriteCourses(prev => prev.filter(c => c.ser_no !== courseId))
  }

  const updateCoursePriority = (courseId: string, priority: number) => {
    setFavoriteCourses(prev => 
      prev.map(course => 
        course.ser_no === courseId 
          ? { ...course, priority }
          : course
      )
    )
  }

  const runLottery = (courses: Course[]): Course[] => {
    console.log('開始隨機選課，課程數量:', courses.length)
    
    // 第一階段：根據每門課程的機率獨立決定是否中籤
    const selectedCourses: Course[] = []
    
    courses.forEach(course => {
      const probability = course.probability || 0.5 // 預設機率 50%
      const isSelected = Math.random() < probability
      
      console.log(`課程 ${course.cou_cname}: 機率 ${(probability * 100).toFixed(1)}%, 中籤: ${isSelected}`)
      
      if (isSelected) {
        selectedCourses.push(course)
      }
    })
    
    console.log('第一階段中籤課程數量:', selectedCourses.length)
    
    // 第二階段：處理時間衝突，保留志願序最高的課程
    const finalCourses = resolveTimeConflicts(selectedCourses)
    
    console.log('最終選課結果數量:', finalCourses.length)
    return finalCourses
  }

  // 處理時間衝突的函數
  const resolveTimeConflicts = (courses: Course[]): Course[] => {
    const timeSlots = new Map<string, Course[]>()
    
    // 按時間分組課程 - 使用簡單時間分配器
    courses.forEach(course => {
      // 為課程分配隨機的連續3節課
      const courseWithTime = assignRandomTimeSlots(course as any)
      
      // 檢查所有時間段
      const timeKeys: string[] = []
      
      if (courseWithTime.day1 && courseWithTime.st1) {
        timeKeys.push(`${courseWithTime.day1}-${courseWithTime.st1}`)
      }
      if (courseWithTime.day2 && courseWithTime.st2) {
        timeKeys.push(`${courseWithTime.day2}-${courseWithTime.st2}`)
      }
      if (courseWithTime.day3 && courseWithTime.st3) {
        timeKeys.push(`${courseWithTime.day3}-${courseWithTime.st3}`)
      }
      
      // 將課程添加到所有相關時間段
      timeKeys.forEach(timeKey => {
        if (!timeSlots.has(timeKey)) {
          timeSlots.set(timeKey, [])
        }
        timeSlots.get(timeKey)!.push(course)
      })
    })
    
    const finalCourses: Course[] = []
    const processedCourses = new Set<string>()
    
    // 處理每個時間段的衝突
    timeSlots.forEach((conflictingCourses, timeSlot) => {
      if (conflictingCourses.length === 1) {
        // 沒有衝突，直接加入
        const course = conflictingCourses[0]
        if (!processedCourses.has(course.ser_no)) {
          finalCourses.push(course)
          processedCourses.add(course.ser_no)
        }
      } else {
        // 有衝突，按志願序排序，保留志願序最高的（數字最小）
        const sortedCourses = conflictingCourses.sort((a, b) => {
          const priorityA = a.priority || 999 // 沒有設定志願序的排在最後
          const priorityB = b.priority || 999
          return priorityA - priorityB
        })
        
        const selectedCourse = sortedCourses[0]
        if (!processedCourses.has(selectedCourse.ser_no)) {
          finalCourses.push(selectedCourse)
          processedCourses.add(selectedCourse.ser_no)
        }
        
        console.log(`時間衝突 ${timeSlot}: 保留 ${selectedCourse.cou_cname} (志願序: ${selectedCourse.priority || '未設定'})`)
      }
    })
    
    // 加入沒有時間信息的課程
    courses.forEach(course => {
      const courseData = course as any
      if (!courseData.day1 && !courseData.day2 && !courseData.day3) {
        if (!processedCourses.has(course.ser_no)) {
          finalCourses.push(course)
          processedCourses.add(course.ser_no)
        }
      }
    })
    
    return finalCourses
  }

  const value: CourseContextValue = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    favoriteCourses,
    updateCoursePriority,
    runLottery
  }

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  )
}

export function useCourseContext() {
  const context = useContext(CourseContext)
  if (context === undefined) {
    throw new Error('useCourseContext must be used within a CourseProvider')
  }
  return context
}