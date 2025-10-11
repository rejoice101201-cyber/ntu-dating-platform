import { createContext, useContext, useState, useEffect } from 'react'

interface Course {
  ser_no: string
  cou_cname: string
  cou_ename: string
  tea_cname: string
  cou_code: string
  credit: string
  dpt_code: string
  dpt_abbr: string
  co_tp: string
  mark: string
  co_rep: string
  pre_course: string
}

interface CourseContextValue {
  // Favorites functionality
  favorites: Set<string>
  addToFavorites: (course: Course) => void
  removeFromFavorites: (courseId: string) => void
  favoriteCourses: Course[]
  // Lottery functionality
  runLottery: (courses: Course[], probability: number, maxCourses: number) => Course[]
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

  const runLottery = (courses: Course[], probability: number, maxCourses: number): Course[] => {
    const selectedCourses: Course[] = []
    
    for (const course of courses) {
      if (selectedCourses.length >= maxCourses) break
      
      // 隨機決定是否選中這門課程
      if (Math.random() < probability) {
        selectedCourses.push(course)
      }
    }
    
    return selectedCourses
  }

  const value: CourseContextValue = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    favoriteCourses,
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