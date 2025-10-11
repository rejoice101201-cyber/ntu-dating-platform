import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default function SearchTest() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')

  const handleSearch = () => {
    if (keyword.trim()) {
      console.log('Searching for:', keyword.trim())
      navigate(`/results?keyword=${encodeURIComponent(keyword.trim())}`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="p-4 bg-green-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Search Test</h3>
      <p className="text-sm text-gray-600 mb-4">Test the search functionality</p>
      
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="輸入課程名稱、教師或課號..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={!keyword.trim()}>
          <Search className="w-4 h-4 mr-2" />
          搜尋
        </Button>
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        Try searching for: "國文", "Chinese", "000 10002", etc.
      </div>
    </div>
  )
}
