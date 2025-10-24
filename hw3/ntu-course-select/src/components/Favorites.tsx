import { useState, useEffect, useMemo } from 'react'
import useCourseData from '../hooks/useCourseData'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, Calendar, Trash2 } from 'lucide-react'

const DAYS = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const PERIODS = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14']

function formatTimeSlots(timeSlots?: Array<{day: number, start: number, classroom?: string}>): string {
  if (!timeSlots || timeSlots.length === 0) return '—'
  return timeSlots.map(ts => `${DAYS[ts.day]}${PERIODS[ts.start]}${ts.classroom ? `@${ts.classroom}` : ''}`).join(', ')
}

export default function Favorites() {
  const { courses } = useCourseData()
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [selectedForSchedule, setSelectedForSchedule] = useState<Set<string>>(new Set())

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ntu-course-favorites')
    if (saved) {
      setFavorites(new Set(JSON.parse(saved)))
    }
  }, [])

  // Get favorite courses
  const favoriteCourses = useMemo(() => {
    return courses.filter(course => favorites.has(course.ser_no))
  }, [courses, favorites])

  // Remove from favorites
  const removeFavorite = (ser_no: string) => {
    const newFavorites = new Set(favorites)
    newFavorites.delete(ser_no)
    setFavorites(newFavorites)
    localStorage.setItem('ntu-course-favorites', JSON.stringify([...newFavorites]))
    
    // Also remove from schedule selection
    const newSelected = new Set(selectedForSchedule)
    newSelected.delete(ser_no)
    setSelectedForSchedule(newSelected)
  }

  // Toggle selection for schedule import
  const toggleScheduleSelection = (ser_no: string) => {
    const newSelected = new Set(selectedForSchedule)
    if (newSelected.has(ser_no)) {
      newSelected.delete(ser_no)
    } else {
      newSelected.add(ser_no)
    }
    setSelectedForSchedule(newSelected)
  }

  // Import to schedule
  const importToSchedule = () => {
    const coursesToImport = selectedForSchedule.size > 0 
      ? favoriteCourses.filter(c => selectedForSchedule.has(c.ser_no))
      : favoriteCourses

    // Save to localStorage for Schedule component
    localStorage.setItem('ntu-course-schedule', JSON.stringify(coursesToImport.map(c => c.ser_no)))
    
    // Show success message
    alert(`已將 ${coursesToImport.length} 門課程匯入課表！請前往「我的課表」查看。`)
    
    // Clear selection
    setSelectedForSchedule(new Set())
  }

  // Select all / Deselect all
  const toggleSelectAll = () => {
    if (selectedForSchedule.size === favoriteCourses.length) {
      setSelectedForSchedule(new Set())
    } else {
      setSelectedForSchedule(new Set(favoriteCourses.map(c => c.ser_no)))
    }
  }

  const totalCredits = favoriteCourses.reduce((sum, c) => sum + c.credit, 0)
  const selectedCredits = favoriteCourses
    .filter(c => selectedForSchedule.has(c.ser_no))
    .reduce((sum, c) => sum + c.credit, 0)

  if (favoriteCourses.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">還沒有收藏的課程</h3>
        <p className="text-gray-600 mb-4">前往「課程瀏覽」頁面，點擊 ❤️ 圖示來收藏喜歡的課程</p>
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
            <h2 className="text-2xl font-semibold text-gray-900">我的最愛</h2>
            <p className="text-gray-600 mt-1">
              共 {favoriteCourses.length} 門課程 • {totalCredits} 學分
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={toggleSelectAll}
              disabled={favoriteCourses.length === 0}
            >
              {selectedForSchedule.size === favoriteCourses.length ? '取消全選' : '全選'}
            </Button>
            <Button
              onClick={importToSchedule}
              disabled={favoriteCourses.length === 0}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              📅 匯入到我的課表
            </Button>
          </div>
        </div>
        
        {selectedForSchedule.size > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              已選擇 {selectedForSchedule.size} 門課程 ({selectedCredits} 學分) 準備匯入課表
            </p>
          </div>
        )}
      </div>

      {/* Course list */}
      <div className="space-y-4">
        {favoriteCourses.map(course => (
          <Card key={course.ser_no} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {course.cou_cname || course.cou_ename}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">👤 {course.tea_cname || course.tea_ename || '—'}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">流水號:</span> {course.ser_no}
                    </div>
                    <div>
                      <span className="font-medium">課號:</span> {course.cou_code}
                    </div>
                    <div>
                      <span className="font-medium">課程識別碼:</span> {course.dpt_code}
                    </div>
                    <div>
                      <span className="font-medium">系所:</span> {course.dpt_abbr}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex gap-2">
                      <Badge variant="secondary">{course.credit}學分</Badge>
                      {course.tlec > 0 && <Badge variant="outline">{course.tlec}講</Badge>}
                      {course.tlab > 0 && <Badge variant="outline">{course.tlab}實</Badge>}
                      {course.limit && <Badge variant="outline">限{course.limit}人</Badge>}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <div className="mb-1">
                      <span className="font-medium">上課時間:</span> {formatTimeSlots(course.timeSlots)}
                    </div>
                    {course.co_rep && (
                      <div className="text-xs text-gray-500 mt-1">
                        {course.co_rep}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 ml-4">
                  <div className="flex gap-2">
                    <Button
                      variant={selectedForSchedule.has(course.ser_no) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleScheduleSelection(course.ser_no)}
                    >
                      {selectedForSchedule.has(course.ser_no) ? '已選' : '選擇'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFavorite(course.ser_no)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Import summary */}
      {selectedForSchedule.size > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-900">準備匯入課表</h4>
                <p className="text-sm text-blue-700">
                  {selectedForSchedule.size} 門課程 • {selectedCredits} 學分
                </p>
              </div>
              <Button onClick={importToSchedule} className="bg-blue-600 hover:bg-blue-700">
                <Calendar className="h-4 w-4 mr-2" />
                確認匯入
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
