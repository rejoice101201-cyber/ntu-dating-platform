import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Heart, Filter, Plus } from 'lucide-react'
import useCourseData from '../hooks/useCourseData'
import { useCourseContext } from '../context/CourseContext'

const DAYS = ['', '一', '二', '三', '四', '五', '六', '日']
const PERIODS = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14']

function formatTimeSlots(timeSlots?: Array<{day: number, start: number, classroom?: string}>): string {
  if (!timeSlots || timeSlots.length === 0) return '—'
  return timeSlots.map(ts => `${DAYS[ts.day]}${PERIODS[ts.start]}${ts.classroom ? `@${ts.classroom}` : ''}`).join(', ')
}

export default function CourseResults() {
  const [searchParams] = useSearchParams()
  const { courses, isLoading, error } = useCourseData()
  const { favorites, toggleFavorite, addToSelected } = useCourseContext()
  
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '')
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)

  const filteredCourses = useMemo(() => {
    let filtered = courses

    if (keyword) {
      const kw = keyword.toLowerCase()
      filtered = filtered.filter(c =>
        c.cou_cname.toLowerCase().includes(kw) ||
        c.cou_ename.toLowerCase().includes(kw) ||
        c.cou_code.toLowerCase().includes(kw) ||
        c.tea_cname.toLowerCase().includes(kw) ||
        c.tea_ename.toLowerCase().includes(kw) ||
        c.ser_no.toLowerCase().includes(kw)
      )
    }

    return filtered.slice(0, 20) // 限制顯示數量
  }, [courses, keyword])

  const selectedCourseData = selectedCourse ? courses.find(c => c.ser_no === selectedCourse) : null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入課程中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">載入課程失敗: {error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header - 完全按照官方設計 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">臺大課程網</h1>
            </div>
            <nav className="flex space-x-8">
              <a href="#" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">課程資訊</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">課程網站</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">課程資訊</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">選課結果</a>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Course Categories - 完全按照官方設計 */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {['系所', '通識/溝通', '共同/新生', '體育/國防', '學程', '進階英語'].map((category) => (
              <button
                key={category}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  category === '系所'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Search Section - 完全按照官方設計 */}
        <div className="bg-white border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">關鍵字</label>
            <div className="flex-1 relative">
              <Input
                placeholder="搜尋課程名稱/教師/流水號"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pr-12"
              />
              <Button
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700"
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">114-1</span>
              <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded border border-blue-200 hover:bg-blue-200">
                上課時間
              </button>
              <button className="px-3 py-1 bg-white text-gray-700 rounded border border-gray-200 hover:bg-gray-50">
                加選方式
              </button>
              <button className="px-3 py-1 bg-white text-gray-700 rounded border border-gray-200 hover:bg-gray-50">
                其他限制
              </button>
              <button className="px-3 py-1 bg-white text-gray-700 rounded border border-gray-200 hover:bg-gray-50">
                排除關鍵字
              </button>
              <button className="px-3 py-1 bg-white text-gray-700 rounded border border-gray-200 hover:bg-gray-50">
                模糊搜尋
              </button>
              <button className="px-3 py-1 bg-white text-gray-700 rounded border border-gray-200 hover:bg-gray-50">
                清除
              </button>
            </div>
          </div>
        </div>

        {/* Two Column Layout - 完全按照官方設計 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Course List */}
          <div className="space-y-2">
            {filteredCourses.map(course => (
              <div 
                key={course.ser_no} 
                className={`cursor-pointer transition-all border ${
                  selectedCourse === course.ser_no 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setSelectedCourse(course.ser_no)}
              >
                {/* Course Header - 藍色標題條，完全按照官方設計 */}
                <div className="bg-blue-600 text-white px-4 py-3">
                  <h3 className="font-semibold text-lg">
                    {course.cou_cname || course.cou_ename}
                  </h3>
                </div>
                
                {/* Course Details - 完全按照官方設計 */}
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">教師:</span> {course.tea_cname || course.tea_ename || '—'}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">時間:</span> {formatTimeSlots(course.timeSlots)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">流水號:</span> {course.ser_no}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">課號:</span> {course.cou_code}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">課程識別碼:</span> {course.cou_code} {course.ser_no}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">必帶:</span> {course.credit}學分, {course.limit || 0}人
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - Course Details - 完全按照官方設計 */}
          <div>
            {selectedCourseData ? (
              <div className="bg-white border border-gray-200">
                {/* Course Header */}
                <div className="bg-blue-600 text-white px-4 py-3">
                  <h3 className="font-semibold text-lg">
                    {selectedCourseData.cou_cname || selectedCourseData.cou_ename}
                  </h3>
                </div>
                
                <div className="p-4 space-y-6">
                  {/* Course Info */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">課程資訊</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div><span className="font-medium">教師:</span> {selectedCourseData.tea_cname || selectedCourseData.tea_ename || '—'}</div>
                      <div><span className="font-medium">時間:</span> {formatTimeSlots(selectedCourseData.timeSlots)}</div>
                      <div><span className="font-medium">流水號:</span> {selectedCourseData.ser_no}</div>
                      <div><span className="font-medium">課號:</span> {selectedCourseData.cou_code}</div>
                      <div><span className="font-medium">課程識別碼:</span> {selectedCourseData.cou_code} {selectedCourseData.ser_no}</div>
                    </div>
                  </div>

                  {/* Restrictions - 完全按照官方設計 */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">限制條件</h4>
                    <div className="text-sm text-gray-600 space-y-2">
                      <div>限學號單號且限學士班一年級</div>
                      <div>第一堂課請於開學第一週星期一第五節於第五教室集合,之後由導師安排。</div>
                    </div>
                  </div>

                  {/* Selection Status - 完全按照官方設計 */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">選課狀態</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">已選上:</span>
                        <span className="font-medium">23/30</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">外系已選上:</span>
                        <span className="font-medium">0/0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">剩餘名額:</span>
                        <span className="font-medium text-green-600">7</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">已登記:</span>
                        <span className="font-medium">0</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - 完全按照官方設計 */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => addToSelected(selectedCourseData.ser_no)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      加入
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => toggleFavorite(selectedCourseData.ser_no)}
                      className={`${favorites.has(selectedCourseData.ser_no) ? 'text-red-500 border-red-200' : ''}`}
                    >
                      <Heart className={`w-4 h-4 ${favorites.has(selectedCourseData.ser_no) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 p-8 text-center">
                <div className="text-gray-500">
                  <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">選擇課程查看詳情</p>
                  <p className="text-sm">點擊左側課程查看詳細資訊</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}