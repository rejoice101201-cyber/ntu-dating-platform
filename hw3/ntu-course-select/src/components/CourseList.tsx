import { useMemo, useState, useEffect } from 'react'
import useCourseData from '../hooks/useCourseData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, Search } from 'lucide-react'

const DAYS = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const PERIODS = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14']

function formatTimeSlots(timeSlots?: Array<{day: number, start: number, classroom?: string}>): string {
  if (!timeSlots || timeSlots.length === 0) return '—'
  return timeSlots.map(ts => `${DAYS[ts.day]}${PERIODS[ts.start]}${ts.classroom ? `@${ts.classroom}` : ''}`).join(', ')
}

export default function CourseList() {
  const { courses, isLoading, error, departments } = useCourseData()
  const [keyword, setKeyword] = useState('')
  const [department, setDepartment] = useState('')
  const [sortKey, setSortKey] = useState<'ser_no' | 'cou_cname'>('ser_no')
  const [page, setPage] = useState(1)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const pageSize = 20

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ntu-course-favorites')
    if (saved) {
      setFavorites(new Set(JSON.parse(saved)))
    }
  }, [])

  // Save favorites to localStorage
  const toggleFavorite = (ser_no: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(ser_no)) {
      newFavorites.delete(ser_no)
    } else {
      newFavorites.add(ser_no)
    }
    setFavorites(newFavorites)
    localStorage.setItem('ntu-course-favorites', JSON.stringify([...newFavorites]))
  }

  const filtered = useMemo(() => {
    let list = courses
    if (keyword.trim()) {
      const kw = keyword.toLowerCase()
      list = list.filter(c =>
        c.cou_cname.toLowerCase().includes(kw) ||
        c.cou_ename.toLowerCase().includes(kw) ||
        c.cou_code.toLowerCase().includes(kw) ||
        c.tea_cname.toLowerCase().includes(kw) ||
        c.tea_ename.toLowerCase().includes(kw) ||
        c.ser_no.toLowerCase().includes(kw)
      )
    }
    if (department && department !== 'all') {
      list = list.filter(c => c.dpt_abbr === department)
    }
    list = [...list].sort((a, b) => String(a[sortKey]).localeCompare(String(b[sortKey])))
    return list
  }, [courses, keyword, department, sortKey])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize)

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
      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center gap-4 mb-4">
          <Search className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold">課程搜尋</h2>
        </div>
        
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">關鍵字</label>
            <Input 
              placeholder="搜尋課程名稱/教師/流水號" 
              value={keyword} 
              onChange={e => { setPage(1); setKeyword(e.target.value) }}
              className="w-80"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">系所</label>
            <Select value={department} onValueChange={value => { setPage(1); setDepartment(value) }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="全部系所" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部系所</SelectItem>
                {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">排序</label>
            <Select value={sortKey} onValueChange={(value: 'ser_no' | 'cou_cname') => setSortKey(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ser_no">流水號</SelectItem>
                <SelectItem value="cou_cname">課程名稱</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        第 {page} / {totalPages} 頁 • 共 {filtered.length} 筆課程
      </div>

      {/* Course list */}
      <div className="space-y-4">
        {pageData.map(course => (
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(course.ser_no)}
                    className={`p-2 ${favorites.has(course.ser_no) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                  >
                    <Heart className={`h-5 w-5 ${favorites.has(course.ser_no) ? 'fill-current' : ''}`} />
                  </Button>
                  <Button size="sm" variant="outline">
                    加入
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          第 {page} 頁，共 {totalPages} 頁
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            disabled={page === 1}
          >
            上一頁
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
            disabled={page === totalPages}
          >
            下一頁
          </Button>
        </div>
      </div>
    </div>
  )
}


