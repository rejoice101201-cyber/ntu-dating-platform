import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Calendar, BookOpen, Users, Clock } from 'lucide-react'
import type { CourseFilters, SelectionPhase } from '../types/course'

const selectionPhases: SelectionPhase[] = [
  {
    name: '初選階段',
    startDate: '2025-08-18',
    endDate: '2025-08-20',
    description: '第一階段選課，可選擇所有課程',
    isActive: true
  },
  {
    name: '加退選第一階段',
    startDate: '2025-08-25',
    endDate: '2025-08-26',
    description: '調整選課，處理時間衝突',
    isActive: false
  },
  {
    name: '加退選第二階段',
    startDate: '2025-09-01',
    endDate: '2025-09-03',
    description: '最後調整機會',
    isActive: false
  },
  {
    name: '抽籤結果公布',
    startDate: '2025-09-05',
    endDate: '2025-09-05',
    description: '查看最終選課結果',
    isActive: false
  },
  {
    name: '開學',
    startDate: '2025-09-09',
    endDate: '2025-09-09',
    description: '正式開學，開始上課',
    isActive: false
  }
]

const departments = [
  '全部系所', '資訊工程學系', '電機工程學系', '機械工程學系', 
  '化學工程學系', '土木工程學系', '材料科學與工程學系',
  '數學系', '物理學系', '化學系', '生物學系', '心理學系',
  '經濟學系', '政治學系', '社會學系', '中文系', '外文系'
]

export default function Home() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<CourseFilters>({
    keyword: '',
    department: '',
    minCredits: 0,
    maxCredits: 6
  })
  // Tags and match mode (AND/OR)
  const [tagsInput, setTagsInput] = useState('')
  const [matchMode, setMatchMode] = useState<'AND' | 'OR'>('OR')

  // Load saved filters from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ntu-course-filters')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setFilters(prev => ({
          keyword: parsed.keyword ?? prev.keyword,
          department: parsed.department ?? prev.department,
          minCredits: Number.isFinite(parsed.minCredits) ? parsed.minCredits : prev.minCredits,
          maxCredits: Number.isFinite(parsed.maxCredits) ? parsed.maxCredits : prev.maxCredits,
        }))
        if (typeof parsed.tagsInput === 'string') setTagsInput(parsed.tagsInput)
        if (parsed.matchMode === 'AND' || parsed.matchMode === 'OR') setMatchMode(parsed.matchMode)
      } catch {
        // ignore
      }
    }
  }, [])

  // Persist filters
  useEffect(() => {
    localStorage.setItem('ntu-course-filters', JSON.stringify({
      ...filters,
      tagsInput,
      matchMode,
    }))
  }, [filters, tagsInput, matchMode])

  const handleSearch = () => {
    // Navigate to results page with filters
    const searchParams = new URLSearchParams()
    if (filters.keyword) searchParams.set('keyword', filters.keyword)
    if (filters.department && filters.department !== 'all') searchParams.set('department', filters.department)
    if (filters.minCredits) searchParams.set('minCredits', filters.minCredits.toString())
    if (filters.maxCredits) searchParams.set('maxCredits', filters.maxCredits.toString())
    if (tagsInput.trim()) searchParams.set('tags', tagsInput.trim())
    if (matchMode) searchParams.set('mode', matchMode)
    
    navigate(`/results?${searchParams.toString()}`)
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-b from-blue-50 to-white rounded-lg border border-blue-100 shadow-sm">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">
            臺大課程網
          </h1>
          <p className="text-lg text-blue-600 font-medium">
            National Taiwan University Course Selection System
          </p>
        </div>
        <p className="text-lg text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed">
          歡迎使用臺大課程選擇系統！本系統提供智能化的課程搜尋、時間衝突檢測、抽籤模擬等功能，
          幫助您輕鬆完成選課流程。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-blue-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2 text-center">1. 課程資訊</h3>
            <p className="text-sm text-gray-600 text-center">使用關鍵字、系所、學分等條件篩選課程</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-blue-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2 text-center">2. 選課結果</h3>
            <p className="text-sm text-gray-600 text-center">將感興趣的課程加入收藏清單</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-blue-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2 text-center">3. 抽籤模擬</h3>
            <p className="text-sm text-gray-600 text-center">設定優先順序並模擬抽籤結果</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <Badge variant="secondary" className="px-4 py-2 bg-blue-50 text-blue-700 border-blue-200">
            <Search className="w-4 h-4 mr-2" />
            智能搜尋
          </Badge>
          <Badge variant="secondary" className="px-4 py-2 bg-blue-50 text-blue-700 border-blue-200">
            <Calendar className="w-4 h-4 mr-2" />
            時間衝突檢測
          </Badge>
          <Badge variant="secondary" className="px-4 py-2 bg-blue-50 text-blue-700 border-blue-200">
            <BookOpen className="w-4 h-4 mr-2" />
            課程收藏
          </Badge>
          <Badge variant="secondary" className="px-4 py-2 bg-blue-50 text-blue-700 border-blue-200">
            <Users className="w-4 h-4 mr-2" />
            抽籤模擬
          </Badge>
        </div>
      </div>

      {/* Quick Search */}
      <Card className="bg-white border-blue-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
          <CardTitle className="flex items-center gap-2 text-blue-800 text-xl">
            <Search className="w-6 h-6 text-blue-600" />
            快速搜尋課程
          </CardTitle>
          <p className="text-blue-700 text-sm mt-2">請輸入搜尋條件來查找您需要的課程</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                關鍵字
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">標籤（以逗號分隔）</label>
              <Input
                placeholder="例如：通識, 英文, 實作"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className="text-gray-600">匹配模式</span>
                <Select value={matchMode} onValueChange={(v) => setMatchMode(v as 'AND' | 'OR')}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OR">OR（任一符合）</SelectItem>
                    <SelectItem value="AND">AND（全部符合）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                學分範圍
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="最少"
                  min="0"
                  max="6"
                  value={filters.minCredits || ''}
                  onChange={(e) => setFilters({ ...filters, minCredits: parseInt(e.target.value) || 0 })}
                />
                <Input
                  type="number"
                  placeholder="最多"
                  min="0"
                  max="6"
                  value={filters.maxCredits || ''}
                  onChange={(e) => setFilters({ ...filters, maxCredits: parseInt(e.target.value) || 6 })}
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3">
                <Search className="w-5 h-5 mr-2" />
                搜尋課程
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selection Timeline */}
      <Card className="bg-white border border-blue-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
          <CardTitle className="flex items-center gap-2 text-blue-800 text-xl">
            <Clock className="w-6 h-6 text-blue-600" />
            選課時程表 - 2025學年度第一學期
          </CardTitle>
          <p className="text-blue-700 text-sm mt-2">請注意各階段選課時間，逾期無法選課</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {selectionPhases.map((phase, index) => (
              <Card key={index} className={`transition-all hover:shadow-lg ${
                phase.isActive 
                  ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-300 shadow-md' 
                  : 'bg-white border-blue-200 hover:border-blue-300'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-700 text-sm">{phase.name}</h3>
                    {phase.isActive && (
                      <Badge className="bg-green-500 text-white text-xs">
                        進行中
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-2 font-medium">
                    {phase.startDate === phase.endDate 
                      ? phase.startDate 
                      : `${phase.startDate} - ${phase.endDate}`
                    }
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {phase.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-white border-blue-200 hover:border-blue-400 group" onClick={() => navigate('/favorites')}>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-red-200 transition-colors">
              <BookOpen className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="font-bold text-gray-800 mb-3 text-lg">我的最愛</h3>
            <p className="text-sm text-gray-600">查看已收藏的課程</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-white border-blue-200 hover:border-blue-400 group" onClick={() => navigate('/staging')}>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-800 mb-3 text-lg">選課暫存</h3>
            <p className="text-sm text-gray-600">管理暫存的課程選擇</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-white border-blue-200 hover:border-blue-400 group" onClick={() => navigate('/lottery')}>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-800 mb-3 text-lg">抽籤模擬</h3>
            <p className="text-sm text-gray-600">模擬選課抽籤結果</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
