import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, Calendar, Star, Plus } from 'lucide-react'
import { useCourseContext } from '../context/CourseContext'
import type { Course } from '../types/course'

const DAYS = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const PERIODS = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14']

function formatTimeSlots(timeSlots?: Array<{day: number, start: number, classroom?: string}>): string {
  if (!timeSlots || timeSlots.length === 0) return '—'
  return timeSlots.map(ts => `${DAYS[ts.day]}${PERIODS[ts.start]}${ts.classroom ? `@${ts.classroom}` : ''}`).join(', ')
}

function getProbabilityColor(probability: number): string {
  if (probability >= 80) return 'text-green-600 bg-green-100'
  if (probability >= 60) return 'text-yellow-600 bg-yellow-100'
  if (probability >= 40) return 'text-orange-600 bg-orange-100'
  return 'text-red-600 bg-red-100'
}

export default function Favorites() {
  const navigate = useNavigate()
  const { favoriteCourses, toggleFavorite, addToLottery } = useCourseContext()
  const [sortBy, setSortBy] = useState<'name' | 'probability' | 'credits'>('name')

  const sortedFavorites = [...favoriteCourses].sort((a, b) => {
    switch (sortBy) {
      case 'probability':
        return (b.selectionProbability || 0) - (a.selectionProbability || 0)
      case 'credits':
        return b.credit - a.credit
      default:
        return (a.cou_cname || a.cou_ename).localeCompare(b.cou_cname || b.cou_ename)
    }
  })

  const handleAddToLottery = (course: Course) => {
    const priority = prompt(`請輸入 ${course.cou_cname || course.cou_ename} 的優先順序 (1-10，1為最高):`)
    if (priority && !isNaN(parseInt(priority))) {
      const priorityNum = Math.max(1, Math.min(10, parseInt(priority)))
      addToLottery(course, priorityNum)
      alert(`已將課程加入抽籤系統，優先順序: ${priorityNum}`)
    }
  }

  const totalCredits = favoriteCourses.reduce((sum, course) => sum + course.credit, 0)

  if (favoriteCourses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">還沒有收藏的課程</h2>
        <p className="text-gray-600 mb-6">前往課程搜尋頁面，將喜歡的課程加入收藏</p>
        <Button onClick={() => navigate('/results')}>
          <Plus className="w-4 h-4 mr-2" />
          開始搜尋課程
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">我的最愛課程</h1>
          <p className="text-gray-600">
            共 {favoriteCourses.length} 門課程 • {totalCredits} 學分
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/lottery')}>
            <Calendar className="w-4 h-4 mr-2" />
            前往抽籤
          </Button>
          <Button variant="outline" onClick={() => navigate('/results')}>
            <Plus className="w-4 h-4 mr-2" />
            新增課程
          </Button>
        </div>
      </div>

      {/* Sort Options */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">排序方式:</span>
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'name' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('name')}
              >
                課程名稱
              </Button>
              <Button
                variant={sortBy === 'probability' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('probability')}
              >
                中籤機率
              </Button>
              <Button
                variant={sortBy === 'credits' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('credits')}
              >
                學分數
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course List */}
      <div className="space-y-4">
        {sortedFavorites.map(course => (
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
                      {course.selectionProbability && (
                        <Badge className={getProbabilityColor(course.selectionProbability)}>
                          <Star className="w-3 h-3 mr-1" />
                          {course.selectionProbability}%
                        </Badge>
                      )}
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(course.ser_no)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <Heart className="h-5 w-5 fill-current" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddToLottery(course)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    加入抽籤
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">收藏摘要</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{favoriteCourses.length}</div>
              <div className="text-sm text-gray-600">收藏課程</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalCredits}</div>
              <div className="text-sm text-gray-600">總學分</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(favoriteCourses.reduce((sum, c) => sum + (c.selectionProbability || 0), 0) / favoriteCourses.length)}%
              </div>
              <div className="text-sm text-gray-600">平均中籤率</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
