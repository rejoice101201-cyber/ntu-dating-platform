import React, { memo, useState, useEffect, useRef } from 'react'
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  IconButton, 
  Chip 
} from '@mui/material'
import { Favorite, FavoriteBorder } from '@mui/icons-material'

interface FullCourse {
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
  probability: number
  classroom: string
  time: string
  day1?: string
  st1?: string
  day2?: string
  st2?: string
  day3?: string
  st3?: string
  day4?: string
  st4?: string
  day5?: string
  st5?: string
  day6?: string
  st6?: string
  day7?: string
  st7?: string
  day8?: string
  st8?: string
}

interface VirtualizedCourseListProps {
  courses: FullCourse[]
  favorites: Set<string>
  onToggleFavorite: (course: FullCourse, index: number) => void
  getCourseUniqueId: (course: FullCourse, index: number) => string
  height?: number
}

interface CourseItemProps {
  index: number
  style: React.CSSProperties
  data: {
    courses: FullCourse[]
    favorites: Set<string>
    onToggleFavorite: (course: FullCourse, index: number) => void
    getCourseUniqueId: (course: FullCourse, index: number) => string
  }
}

const CourseItem = memo(({ index, style, data }: CourseItemProps) => {
  const { courses, favorites, onToggleFavorite, getCourseUniqueId } = data
  const course = courses[index]
  
  if (!course) return null
  
  const isFavorite = favorites.has(getCourseUniqueId(course, index))
  
  return (
    <div style={style}>
      <Card 
        elevation={1} 
        sx={{ 
          mb: 2, 
          mx: 1,
          transition: 'all 0.2s ease',
          '&:hover': {
            elevation: 3,
            transform: 'translateY(-2px)'
          }
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" sx={{ color: '#424242', fontWeight: 600, mb: 1, lineHeight: 1.3 }}>
                {course.cou_cname}
              </Typography>
              <Typography variant="body2" sx={{ color: '#757575', mb: 1 }}>
                {course.cou_ename}
              </Typography>
              <Typography variant="body2" sx={{ color: '#757575', mb: 1 }}>
                教師: {course.tea_cname} | 課程代碼: {course.cou_code} | 學分: {course.credit}
              </Typography>
              
              {/* 中籤率顯示 */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label={`中籤率: ${((course.probability || 0.5) * 100).toFixed(1)}%`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{
                    fontSize: '0.75rem',
                    height: '24px',
                    backgroundColor: course.probability && course.probability > 0.7 ? '#e8f5e8' : 
                                   course.probability && course.probability > 0.4 ? '#fff3e0' : '#ffebee',
                    borderColor: course.probability && course.probability > 0.7 ? '#4caf50' : 
                               course.probability && course.probability > 0.4 ? '#ff9800' : '#f44336',
                    color: course.probability && course.probability > 0.7 ? '#2e7d32' : 
                           course.probability && course.probability > 0.4 ? '#f57c00' : '#d32f2f'
                  }}
                />
              </Box>
            </Box>
            
            <IconButton
              onClick={() => onToggleFavorite(course, index)}
              sx={{ 
                color: isFavorite ? '#f44336' : '#757575',
                transition: 'color 0.2s ease',
                '&:hover': {
                  color: isFavorite ? '#d32f2f' : '#f44336',
                  backgroundColor: isFavorite ? '#ffebee' : '#fafafa'
                }
              }}
            >
              {isFavorite ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    </div>
  )
})

CourseItem.displayName = 'CourseItem'

const VirtualizedCourseList: React.FC<VirtualizedCourseListProps> = ({
  courses,
  favorites,
  onToggleFavorite,
  getCourseUniqueId,
  height = 600
}) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 })
  const containerRef = useRef<HTMLDivElement>(null)
  const itemHeight = 140
  const overscan = 5

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      
      const scrollTop = containerRef.current.scrollTop
      const containerHeight = containerRef.current.clientHeight
      
      const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
      const end = Math.min(
        courses.length - 1,
        Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
      )
      
      setVisibleRange({ start, end })
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      handleScroll() // 初始計算
      
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [courses.length, itemHeight, overscan])

  const visibleCourses = courses.slice(visibleRange.start, visibleRange.end + 1)
  const totalHeight = courses.length * itemHeight
  const offsetY = visibleRange.start * itemHeight

  return (
    <div
      ref={containerRef}
      style={{
        height: height,
        overflow: 'auto',
        position: 'relative'
      }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleCourses.map((course, index) => {
            const globalIndex = visibleRange.start + index
            return (
              <CourseItem
                key={getCourseUniqueId(course, globalIndex)}
                index={globalIndex}
                style={{ height: itemHeight }}
                data={{
                  courses,
                  favorites,
                  onToggleFavorite,
                  getCourseUniqueId
                }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default VirtualizedCourseList
