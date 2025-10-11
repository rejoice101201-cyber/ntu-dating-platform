import { useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, Filter, Star } from 'lucide-react'
import useCourseData from '../hooks/useCourseData'
import { useCourseContext } from '../context/CourseContext'

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

export default function CourseResults() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { courses, isLoading, error, departments } = useCourseData()
  const { favorites, toggleFavorite } = useCourseContext()
  
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '')
  const [department, setDepartment] = useState(searchParams.get('department') || '')
  const [sortBy, setSortBy] = useState<'ser_no' | 'cou_cname' | 'probability'>('ser_no')
  const [page, setPage] = useState(1)
  const pageSize = 20

  const filteredCourses = useMemo(() => {
    let filtered = courses

    // Apply filters from URL params
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

    if (department && department !== 'all') {
      filtered = filtered.filter(c => c.dpt_abbr === department)
    }

    const minCredits = parseInt(searchParams.get('minCredits') || '0')
    const maxCredits = parseInt(searchParams.get('maxCredits') || '6')
    filtered = filtered.filter(c => c.credit >= minCredits && c.credit <= maxCredits)

    const courseType = searchParams.get('courseType')
    if (courseType) {
      filtered = filtered.filter(c => {
        if (courseType === '必修') return c.co_tp === '1' || c.mark === '1'
        if (courseType === '選修') return c.co_tp === '0' || c.mark === '0'
        return true
      })
    }

    const instructor = searchParams.get('instructor')
    if (instructor) {
      const inst = instructor.toLowerCase()
      filtered = filtered.filter(c =>
        c.tea_cname.toLowerCase().includes(inst) ||
        c.tea_ename.toLowerCase().includes(inst)
      )
    }

    // Tags AND/OR support from Home
    const tagsParam = (searchParams.get('tags') || '').trim()
    const mode = (searchParams.get('mode') || 'OR').toUpperCase()
    if (tagsParam) {
      const tags = tagsParam
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)
        .map(t => t.toLowerCase())
      if (tags.length) {
        filtered = filtered.filter(c => {
          const haystack = [
            c.cou_cname,
            c.cou_ename,
            c.dpt_abbr,
            c.co_rep || '',
            c.pre_course || ''
          ].join(' ').toLowerCase()
          const matches = tags.map(tag => haystack.includes(tag))
          return mode === 'AND' ? matches.every(Boolean) : matches.some(Boolean)
        })
      }
    }

    // Sort courses
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'cou_cname':
          return String(a.cou_cname).localeCompare(String(b.cou_cname))
        case 'probability':
          return (b.selectionProbability || 0) - (a.selectionProbability || 0)
        default:
          return String(a.ser_no).localeCompare(String(b.ser_no))
      }
    })

    return filtered
  }, [courses, keyword, department, searchParams, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / pageSize))
  const pageData = filteredCourses.slice(0, page * pageSize)

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-700">課程搜尋結果</h1>
          <p className="text-gray-600">找到 {filteredCourses.length} 門課程</p>
        </div>
        <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50" onClick={() => navigate('/filter')}>
          <Filter className="w-4 h-4 mr-2" />
          重新篩選
        </Button>
      </div>

      {/* Search and Sort Controls */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">關鍵字</label>
              <Input
                placeholder="搜尋課程名稱/教師/流水號"
                value={keyword}
                onChange={e => { setPage(1); setKeyword(e.target.value) }}
                className="w-80 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">系所</label>
              <Select value={department} onValueChange={value => { setPage(1); setDepartment(value) }}>
                <SelectTrigger className="w-48 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="全部系所" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部系所</SelectItem>
                  {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">排序</label>
              <Select value={sortBy} onValueChange={(value: 'ser_no' | 'cou_cname' | 'probability') => setSortBy(value)}>
                <SelectTrigger className="w-32 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ser_no">流水號</SelectItem>
                  <SelectItem value="cou_cname">課程名稱</SelectItem>
                  <SelectItem value="probability">中籤機率</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        第 {page} / {totalPages} 頁 • 共 {filteredCourses.length} 筆課程
      </div>

      {/* Course grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pageData.map(course => (
          <Card key={course.ser_no} className="hover:shadow-md transition-shadow bg-white border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-gray-700 truncate">
                    {course.cou_cname || course.cou_ename}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 truncate">👤 {course.tea_cname || course.tea_ename || '—'}</p>
                  <div className="flex flex-wrap gap-1 text-xs text-gray-600 mb-2">
                    <span>流水號 {course.ser_no}</span>
                    <span>· 課號 {course.cou_code}</span>
                    <span>· {course.dpt_abbr}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
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
                  <p className="text-xs text-gray-600 line-clamp-2">
                    <span className="font-medium">時間:</span> {formatTimeSlots(course.timeSlots)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(course.ser_no)}
                    className={`p-2 ${favorites.has(course.ser_no) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                    title={favorites.has(course.ser_no) ? '移除最愛' : '加入最愛'}
                  >
                    <Heart className={`h-5 w-5 ${favorites.has(course.ser_no) ? 'fill-current' : ''}`} />
                  </Button>
                  <Button size="sm" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">加入暫存</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load more */}
      {page * pageSize < filteredCourses.length && (
        <div className="flex justify-center">
          <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50" onClick={() => setPage(p => p + 1)}>載入更多</Button>
        </div>
      )}
    </div>
  )
}
