import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')

  const handleSearch = () => {
    if (keyword.trim()) {
      navigate(`/results?keyword=${encodeURIComponent(keyword.trim())}`)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header - 完全按照官方設計，沒有藍色標題 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">臺大課程網</h1>
            </div>
            <nav className="flex space-x-8">
              <a href="/" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">課程資訊</a>
              <a href="/results" className="text-gray-600 hover:text-gray-900">選課結果</a>
              <a href="/recommendations" className="text-gray-600 hover:text-gray-900">推薦課程</a>
              <a href="/favorites" className="text-gray-600 hover:text-gray-900">我的收藏</a>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Course Categories - 完全按照官方設計 */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {['系所', '通識/溝通', '共同/新生', '體育/國防', '學程', '進階英語'].map((category) => (
              <button
                key={category}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
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
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700"
                onClick={handleSearch}
              >
                <Search className="w-4 h-4" />
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

        {/* Main Title - 完全按照官方設計 */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">114學年度第一學期</h2>
          <h3 className="text-xl font-semibold text-gray-800">選課流程</h3>
        </div>

        {/* Selection Timeline - 完全按照官方設計，更緊湊的布局 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 初選一階 */}
          <div className="bg-white border border-gray-200 rounded p-4">
            <div className="mb-3">
              <h3 className="text-base font-semibold text-gray-800 mb-1">初選一階</h3>
              <div className="text-sm font-medium text-blue-600">08.18 → 08.20</div>
            </div>
            <div className="space-y-1 text-xs text-gray-700">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                <span>開放一階預選: 8.1(五) → 8.17(日)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                <span>二階選課: 8.18(一) → 8.20(三)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                <span>公布一階結果: 8.22(五) 15:00</span>
              </div>
            </div>
          </div>

          {/* 初選二階 */}
          <div className="bg-white border border-gray-200 rounded p-4">
            <div className="mb-3">
              <h3 className="text-base font-semibold text-gray-800 mb-1">初選二階</h3>
              <div className="text-sm font-medium text-blue-600">08.25 → 08.26</div>
            </div>
            <div className="space-y-1 text-xs text-gray-700">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                <span>開放一階預選: 8.22(五) → 8.24(日)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                <span>二階選課: 8.25(一) → 8.26(三)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                <span>公布一階結果: 8.28(五) 15:00</span>
              </div>
            </div>
          </div>

          {/* 網路加退選 */}
          <div className="bg-white border border-gray-200 rounded p-4">
            <div className="mb-3">
              <h3 className="text-base font-semibold text-gray-800 mb-1">網路加退選</h3>
              <div className="text-sm font-medium text-blue-600">08.18 → 08.20</div>
            </div>
            <div className="space-y-1 text-xs text-gray-700">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                <span>第一週加退選: 9.1(一) → 9.7(日)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                <span>第二週加退選: 9.8(一) → 9.15(一)</span>
              </div>
            </div>
          </div>

          {/* 選課結果確認 */}
          <div className="bg-white border border-gray-200 rounded p-4">
            <div className="mb-3">
              <h3 className="text-base font-semibold text-gray-800 mb-1">選課結果確認</h3>
              <div className="text-sm font-medium text-blue-600">09.17 → 09.19</div>
            </div>
            <div className="space-y-1 text-xs text-gray-700">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                <span>選課結果確認: 9.17(三) → 9.19(五)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                <span>停修: 9.17(三) → 12.5(五)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}