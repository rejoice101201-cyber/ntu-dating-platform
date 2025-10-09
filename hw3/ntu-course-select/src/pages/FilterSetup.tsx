import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Search, Filter, RotateCcw } from 'lucide-react'
import useCourseData from '../hooks/useCourseData'
import type { CourseFilters } from '../types/course'

const courseTypes = [
  '全部類型', '必修', '選修', '通識', '體育', '軍訓'
]

const timeSlots = [
  '全部時段', '第1-2節', '第3-4節', '第5-6節', '第7-8節', '第9-10節', '第11-12節'
]

export default function FilterSetup() {
  const navigate = useNavigate()
  const { departments } = useCourseData()
  const [filters, setFilters] = useState<CourseFilters>({
    keyword: '',
    department: '',
    minCredits: 0,
    maxCredits: 6
  })
  const [additionalFilters, setAdditionalFilters] = useState({
    courseType: '',
    timeSlot: '',
    instructor: '',
    hasConflict: false
  })

  const handleSearch = () => {
    const searchParams = new URLSearchParams()
    if (filters.keyword) searchParams.set('keyword', filters.keyword)
    if (filters.department && filters.department !== 'all') searchParams.set('department', filters.department)
    if (filters.minCredits) searchParams.set('minCredits', filters.minCredits.toString())
    if (filters.maxCredits) searchParams.set('maxCredits', filters.maxCredits.toString())
    if (additionalFilters.courseType && additionalFilters.courseType !== 'all') searchParams.set('courseType', additionalFilters.courseType)
    if (additionalFilters.timeSlot && additionalFilters.timeSlot !== 'all') searchParams.set('timeSlot', additionalFilters.timeSlot)
    if (additionalFilters.instructor) searchParams.set('instructor', additionalFilters.instructor)
    if (additionalFilters.hasConflict) searchParams.set('hasConflict', 'true')
    
    navigate(`/results?${searchParams.toString()}`)
  }

  const handleReset = () => {
    setFilters({
      keyword: '',
      department: '',
      minCredits: 0,
      maxCredits: 6
    })
    setAdditionalFilters({
      courseType: '',
      timeSlot: '',
      instructor: '',
      hasConflict: false
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">課程篩選設定</h1>
        <p className="text-gray-600">設定您的課程搜尋條件，找到最適合的課程</p>
      </div>

      {/* Basic Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            基本篩選條件
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                關鍵字搜尋
              </label>
              <Input
                placeholder="課程名稱、教師、課號..."
                value={filters.keyword || ''}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                系所
              </label>
              <Select value={filters.department || ''} onValueChange={(value) => setFilters({ ...filters, department: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇系所" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept === '全部系所' ? 'all' : dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              學分範圍: {filters.minCredits} - {filters.maxCredits} 學分
            </label>
            <div className="px-4">
              <Slider
                value={[filters.minCredits || 0, filters.maxCredits || 6]}
                onValueChange={([min, max]) => setFilters({ ...filters, minCredits: min, maxCredits: max })}
                max={6}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            進階篩選條件
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                課程類型
              </label>
              <Select value={additionalFilters.courseType} onValueChange={(value) => setAdditionalFilters({ ...additionalFilters, courseType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇課程類型" />
                </SelectTrigger>
                <SelectContent>
                  {courseTypes.map((type) => (
                    <SelectItem key={type} value={type === '全部類型' ? 'all' : type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                上課時段
              </label>
              <Select value={additionalFilters.timeSlot} onValueChange={(value) => setAdditionalFilters({ ...additionalFilters, timeSlot: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇時段" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot === '全部時段' ? 'all' : slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              授課教師
            </label>
            <Input
              placeholder="教師姓名..."
              value={additionalFilters.instructor}
              onChange={(e) => setAdditionalFilters({ ...additionalFilters, instructor: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          重置篩選
        </Button>
        <Button onClick={handleSearch} size="lg">
          <Search className="w-4 h-4 mr-2" />
          開始搜尋
        </Button>
      </div>

      {/* Current Filters Display */}
      {(filters.keyword || filters.department || additionalFilters.courseType || additionalFilters.timeSlot) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">目前篩選條件</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {filters.keyword && (
                <Badge variant="secondary">
                  關鍵字: {filters.keyword}
                </Badge>
              )}
              {filters.department && (
                <Badge variant="secondary">
                  系所: {filters.department}
                </Badge>
              )}
              <Badge variant="secondary">
                學分: {filters.minCredits}-{filters.maxCredits}
              </Badge>
              {additionalFilters.courseType && (
                <Badge variant="secondary">
                  類型: {additionalFilters.courseType}
                </Badge>
              )}
              {additionalFilters.timeSlot && (
                <Badge variant="secondary">
                  時段: {additionalFilters.timeSlot}
                </Badge>
              )}
              {additionalFilters.instructor && (
                <Badge variant="secondary">
                  教師: {additionalFilters.instructor}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
