import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, Shuffle, CheckCircle, XCircle, Star, AlertTriangle } from 'lucide-react'
import { useCourseContext } from '../context/CourseContext'
import type { LotteryEntry } from '../types/course'

function getProbabilityColor(probability: number): string {
  if (probability >= 80) return 'text-green-600 bg-green-100'
  if (probability >= 60) return 'text-yellow-600 bg-yellow-100'
  if (probability >= 40) return 'text-orange-600 bg-orange-100'
  return 'text-red-600 bg-red-100'
}

function getPriorityColor(priority: number): string {
  if (priority <= 2) return 'bg-red-100 text-red-800'
  if (priority <= 4) return 'bg-orange-100 text-orange-800'
  if (priority <= 6) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

export default function LotterySimulation() {
  const navigate = useNavigate()
  const { 
    lotteryEntries, 
    removeFromLottery, 
    updateLotteryPriority, 
    runLottery, 
    clearLottery,
    recommendByProbability,
    recommendSimilarToFavorites,
  } = useCourseContext()
  
  const [isRunning, setIsRunning] = useState(false)
  const [editingPriority, setEditingPriority] = useState<string | null>(null)
  const [newPriority, setNewPriority] = useState('')

  const handleRunLottery = async () => {
    setIsRunning(true)
    
    // Simulate lottery process with delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    runLottery()
    setIsRunning(false)
  }

  const handleEditPriority = (entry: LotteryEntry) => {
    setEditingPriority(entry.course.ser_no)
    setNewPriority(entry.priority.toString())
  }

  const handleSavePriority = (courseId: string) => {
    const priority = parseInt(newPriority)
    if (priority >= 1 && priority <= 10) {
      updateLotteryPriority(courseId, priority)
    }
    setEditingPriority(null)
    setNewPriority('')
  }

  const selectedCount = lotteryEntries.filter(entry => entry.isSelected).length
  const totalCredits = lotteryEntries
    .filter(entry => entry.isSelected)
    .reduce((sum, entry) => sum + entry.course.credit, 0)

  const recoHighProb = useMemo(() => recommendByProbability(6), [recommendByProbability, lotteryEntries])
  const recoSimilar = useMemo(() => recommendSimilarToFavorites(6), [recommendSimilarToFavorites, lotteryEntries])

  if (lotteryEntries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shuffle className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">抽籤系統</h2>
        <p className="text-gray-600 mb-6">將課程加入抽籤系統，設定優先順序後進行抽籤模擬</p>
        <div className="flex justify-center gap-4">
          <Button onClick={() => navigate('/favorites')}>
            從收藏加入
          </Button>
          <Button variant="outline" onClick={() => navigate('/results')}>
            搜尋課程
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">抽籤模擬系統</h1>
          <p className="text-gray-600">
            共 {lotteryEntries.length} 門課程參與抽籤
            {selectedCount > 0 && ` • ${selectedCount} 門中籤 • ${totalCredits} 學分`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleRunLottery} 
            disabled={isRunning}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            {isRunning ? '抽籤中...' : '開始抽籤'}
          </Button>
          <Button variant="outline" onClick={clearLottery}>
            <Trash2 className="w-4 h-4 mr-2" />
            清空
          </Button>
        </div>
      </div>

      {/* Lottery Results Summary */}
      {selectedCount > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              抽籤結果摘要
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{selectedCount}</div>
                <div className="text-sm text-green-700">中籤課程</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{totalCredits}</div>
                <div className="text-sm text-green-700">總學分</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((selectedCount / lotteryEntries.length) * 100)}%
                </div>
                <div className="text-sm text-green-700">中籤率</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lottery Entries */}
      <div className="space-y-4">
        {lotteryEntries
          .sort((a, b) => a.priority - b.priority)
          .map(entry => (
            <Card 
              key={entry.course.ser_no} 
              className={`transition-all ${
                entry.isSelected 
                  ? 'ring-2 ring-green-500 bg-green-50' 
                  : 'hover:shadow-md'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {entry.course.cou_cname || entry.course.cou_ename}
                      </h3>
                      {entry.isSelected ? (
                        <Badge className="bg-green-500 text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          中籤
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          <XCircle className="w-3 h-3 mr-1" />
                          未中籤
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">流水號:</span> {entry.course.ser_no}
                      </div>
                      <div>
                        <span className="font-medium">課號:</span> {entry.course.cou_code}
                      </div>
                      <div>
                        <span className="font-medium">系所:</span> {entry.course.dpt_abbr}
                      </div>
                      <div>
                        <span className="font-medium">教師:</span> {entry.course.tea_cname || entry.course.tea_ename}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex gap-2">
                        <Badge variant="secondary">{entry.course.credit}學分</Badge>
                        {entry.course.selectionProbability && (
                          <Badge className={getProbabilityColor(entry.course.selectionProbability)}>
                            <Star className="w-3 h-3 mr-1" />
                            {entry.course.selectionProbability}%
                          </Badge>
                        )}
                        <Badge className={getPriorityColor(entry.priority)}>
                          優先順序: {entry.priority}
                        </Badge>
                      </div>
                    </div>

                    {entry.course.co_rep && (
                      <div className="text-xs text-gray-500">
                        {entry.course.co_rep}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 ml-4">
                    {editingPriority === entry.course.ser_no ? (
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={newPriority}
                          onChange={(e) => setNewPriority(e.target.value)}
                          className="w-20"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSavePriority(entry.course.ser_no)}
                        >
                          儲存
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingPriority(null)}
                        >
                          取消
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditPriority(entry)}
                      >
                        編輯優先順序
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromLottery(entry.course.ser_no)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>高機率推薦</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-700">
            {recoHighProb.map(c => (
              <div key={c.ser_no} className="flex justify-between border-b py-2 last:border-b-0">
                <span className="truncate">{c.cou_cname || c.cou_ename}</span>
                <Badge>{c.selectionProbability || 0}%</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>與最愛相似</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-700">
            {recoSimilar.map(c => (
              <div key={c.ser_no} className="flex justify-between border-b py-2 last:border-b-0">
                <span className="truncate">{c.cou_cname || c.cou_ename}</span>
                <span className="text-gray-500">{c.dpt_abbr}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            抽籤說明
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-gray-600">
            <p><strong>優先順序：</strong>數字越小優先順序越高（1為最高優先順序）</p>
            <p><strong>中籤機率：</strong>基於課程的選課人數限制和歷史數據計算</p>
            <p><strong>衝突處理：</strong>時間衝突的課程中，優先順序較高的會被選中</p>
            <p><strong>抽籤結果：</strong>僅為模擬結果，實際選課結果以學校系統為準</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
