import { useState, useEffect, useMemo } from 'react'
import type { Course } from '../types/course'
import useCourseData from '../hooks/useCourseData'
import { getSlots, hasTimeConflict } from '../utils/timeUtils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Trash2, Download, AlertTriangle } from 'lucide-react'

const DAY_NAMES = ['', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']

// Enhanced color palette with conflict highlighting
const COURSE_COLORS = [
  'bg-blue-100 border-blue-300 text-blue-800',
  'bg-green-100 border-green-300 text-green-800',
  'bg-purple-100 border-purple-300 text-purple-800',
  'bg-orange-100 border-orange-300 text-orange-800',
  'bg-pink-100 border-pink-300 text-pink-800',
  'bg-indigo-100 border-indigo-300 text-indigo-800',
  'bg-yellow-100 border-yellow-300 text-yellow-800',
  'bg-red-100 border-red-300 text-red-800',
  'bg-teal-100 border-teal-300 text-teal-800',
  'bg-cyan-100 border-cyan-300 text-cyan-800',
]

const CONFLICT_COLOR = 'bg-red-200 border-red-500 text-red-900 ring-2 ring-red-300'

interface ScheduleCourse extends Course {
  colorIndex: number
  hasConflict?: boolean
  conflictingCourses?: Course[]
}

export default function Schedule() {
  const { courses } = useCourseData()
  const [scheduleCourses, setScheduleCourses] = useState<ScheduleCourse[]>([])

  // Load schedule from localStorage with conflict detection
  useEffect(() => {
    const saved = localStorage.getItem('ntu-course-schedule')
    if (saved) {
      const courseIds = JSON.parse(saved) as string[]
      const baseScheduleData = courseIds
        .map(id => courses.find(c => c.ser_no === id))
        .filter((c): c is Course => c !== undefined)
      
      const scheduleData: ScheduleCourse[] = baseScheduleData.map((course, index) => {
        // Check for conflicts with other courses in schedule
        const conflictingCourses = baseScheduleData.filter((otherCourse: Course) => 
          otherCourse.ser_no !== course.ser_no && 
          hasTimeConflict(course, otherCourse)
        )
        
        return {
          ...course,
          colorIndex: index % COURSE_COLORS.length,
          hasConflict: conflictingCourses.length > 0,
          conflictingCourses
        }
      })
      setScheduleCourses(scheduleData)
    }
  }, [courses])

  // Remove course from schedule
  const removeFromSchedule = (ser_no: string) => {
    const newSchedule = scheduleCourses.filter(c => c.ser_no !== ser_no)
    setScheduleCourses(newSchedule)
    localStorage.setItem('ntu-course-schedule', JSON.stringify(newSchedule.map(c => c.ser_no)))
  }

  // Clear all courses
  const clearSchedule = () => {
    if (confirm('確定要清空整個課表嗎？')) {
      setScheduleCourses([])
      localStorage.removeItem('ntu-course-schedule')
    }
  }

  // Generate timetable grid with enhanced conflict visualization
  const timetable = useMemo(() => {
    const grid: (ScheduleCourse | null)[][] = Array(7).fill(null).map(() => Array(15).fill(null))
    
    scheduleCourses.forEach(course => {
      const slots = getSlots(course)
      slots.forEach(slot => {
        if (slot.day >= 1 && slot.day <= 7 && slot.period >= 1 && slot.period <= 15) {
          grid[slot.day - 1][slot.period - 1] = course
        }
      })
    })
    
    return grid
  }, [scheduleCourses])

  // Enhanced conflict detection with detailed information
  const conflicts = useMemo(() => {
    const conflictMap = new Map<string, ScheduleCourse[]>()
    
    scheduleCourses.forEach(course => {
      const slots = getSlots(course)
      slots.forEach(slot => {
        const key = `${slot.day}-${slot.period}`
        if (!conflictMap.has(key)) {
          conflictMap.set(key, [])
        }
        conflictMap.get(key)!.push(course)
      })
    })
    
    return Array.from(conflictMap.entries())
      .filter(([, courses]) => courses.length > 1)
      .map(([timeSlot, courses]) => ({
        timeSlot,
        courses,
        day: parseInt(timeSlot.split('-')[0]),
        period: parseInt(timeSlot.split('-')[1])
      }))
  }, [scheduleCourses])

  const totalCredits = scheduleCourses.reduce((sum, c) => sum + c.credit, 0)

  if (scheduleCourses.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">課表是空的</h3>
        <p className="text-gray-600 mb-4">前往「我的最愛」頁面，將收藏的課程匯入到課表中</p>
        <Button onClick={() => window.location.reload()}>
          重新整理
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">我的課表</h2>
            <p className="text-gray-600 mt-1">
              共 {scheduleCourses.length} 門課程 • {totalCredits} 學分
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={clearSchedule}>
              <Trash2 className="h-4 w-4 mr-2" />
              清空課表
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              匯出課表
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced conflicts warning with accessibility */}
      {conflicts.length > 0 && (
        <Card className="bg-red-50 border-red-200" role="alert" aria-live="polite">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              時間衝突警告
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conflicts.map((conflict, index) => (
                <div key={index} className="p-3 bg-white rounded-lg border border-red-200">
                  <p className="text-sm text-red-700 font-medium mb-2">
                    <strong>{DAY_NAMES[conflict.day]} 第{conflict.period}節</strong> 有時間衝突：
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {conflict.courses.map(course => (
                      <Badge 
                        key={course.ser_no} 
                        variant="destructive" 
                        className="text-xs"
                        title={`課程：${course.cou_cname || course.cou_ename}，教師：${course.tea_cname || course.tea_ename}`}
                      >
                        {course.cou_cname || course.cou_ename}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-red-600 mt-2">
                    建議：請移除其中一門課程或選擇其他時間的課程
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timetable */}
      <Card>
        <CardHeader>
          <CardTitle>週課表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2 bg-gray-50 font-medium">時間</th>
                  {DAY_NAMES.slice(1, 6).map((day, index) => (
                    <th key={index} className="border border-gray-300 p-2 bg-gray-50 font-medium min-w-[120px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 14 }, (_, periodIndex) => (
                  <tr key={periodIndex}>
                    <td className="border border-gray-300 p-2 bg-gray-50 text-center font-medium">
                      第{periodIndex + 1}節
                    </td>
                    {Array.from({ length: 5 }, (_, dayIndex) => {
                      const course = timetable[dayIndex][periodIndex]
                      const hasConflict = course?.hasConflict
                      const isConflictSlot = conflicts.some(c => 
                        c.day === dayIndex + 1 && c.period === periodIndex + 1
                      )
                      
                      return (
                        <td 
                          key={dayIndex} 
                          className={`border border-gray-300 p-1 min-h-[60px] ${
                            isConflictSlot ? 'bg-red-50' : ''
                          }`}
                        >
                          {course && (
                            <div 
                              className={`p-2 rounded text-xs border transition-all ${
                                hasConflict || isConflictSlot 
                                  ? CONFLICT_COLOR 
                                  : COURSE_COLORS[course.colorIndex]
                              }`}
                              title={`課程：${course.cou_cname || course.cou_ename}${hasConflict ? '（有衝突）' : ''}`}
                            >
                              <div className="font-medium truncate flex items-center gap-1">
                                {hasConflict && <AlertTriangle className="h-3 w-3 flex-shrink-0" />}
                                {course.cou_cname || course.cou_ename}
                              </div>
                              <div className="text-xs opacity-75">
                                {course.tea_cname || course.tea_ename}
                              </div>
                              <div className="text-xs opacity-75">
                                {course.clsrom_1 || course.clsrom_2 || '—'}
                              </div>
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Course list */}
      <Card>
        <CardHeader>
          <CardTitle>課表課程清單</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scheduleCourses.map(course => (
              <div 
                key={course.ser_no} 
                className={`flex items-center justify-between p-3 border rounded-lg ${
                  course.hasConflict ? 'border-red-300 bg-red-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded ${
                    course.hasConflict 
                      ? 'bg-red-500' 
                      : COURSE_COLORS[course.colorIndex].split(' ')[0]
                  }`}></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{course.cou_cname || course.cou_ename}</h4>
                      {course.hasConflict && (
                        <Badge variant="destructive" className="text-xs">
                          衝突
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {course.tea_cname || course.tea_ename} • {course.credit}學分 • {course.dpt_abbr}
                    </p>
                    {course.conflictingCourses && course.conflictingCourses.length > 0 && (
                      <p className="text-xs text-red-600 mt-1">
                        與 {course.conflictingCourses.map(c => c.cou_cname || c.cou_ename).join('、')} 有時間衝突
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromSchedule(course.ser_no)}
                  className="text-red-500 hover:text-red-700"
                  title={`移除 ${course.cou_cname || course.cou_ename}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
