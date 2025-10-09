import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HelpCircle, Search, Heart, Calendar, Shuffle } from 'lucide-react'

export default function Help() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">幫助與常見問題</h1>
        <p className="text-gray-600">使用指南和常見問題解答</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              課程搜尋
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-600">
              <p><strong>關鍵字搜尋：</strong>可以搜尋課程名稱、教師姓名、課號等</p>
              <p><strong>系所篩選：</strong>選擇特定系所的課程</p>
              <p><strong>學分範圍：</strong>設定學分數的上下限</p>
              <p><strong>進階篩選：</strong>課程類型、上課時段等</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              收藏功能
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-600">
              <p><strong>加入收藏：</strong>點擊課程卡片上的愛心圖示</p>
              <p><strong>管理收藏：</strong>在「我的最愛」頁面查看和管理</p>
              <p><strong>排序功能：</strong>按名稱、中籤率、學分數排序</p>
              <p><strong>統計資訊：</strong>查看總學分和平均中籤率</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              選課暫存
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-600">
              <p><strong>暫存課程：</strong>將感興趣的課程加入暫存清單</p>
              <p><strong>時間表檢視：</strong>以週課表形式檢視課程安排</p>
              <p><strong>衝突檢測：</strong>自動檢測時間衝突</p>
              <p><strong>提交選課：</strong>確認後提交最終選課</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shuffle className="w-5 h-5" />
              抽籤模擬
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-600">
              <p><strong>優先順序：</strong>設定課程的選課優先順序（1-10）</p>
              <p><strong>中籤機率：</strong>基於歷史數據計算的機率</p>
              <p><strong>衝突處理：</strong>自動處理時間衝突</p>
              <p><strong>結果模擬：</strong>模擬實際抽籤結果</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            常見問題
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Q: 如何知道課程的中籤機率？</h4>
            <p className="text-sm text-gray-600">
              A: 中籤機率是基於課程的選課人數限制和歷史數據計算的。機率越高表示越容易中籤。
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Q: 時間衝突如何處理？</h4>
            <p className="text-sm text-gray-600">
              A: 系統會自動檢測時間衝突並提供警告。您可以選擇移除衝突的課程或調整優先順序。
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Q: 抽籤結果是否準確？</h4>
            <p className="text-sm text-gray-600">
              A: 抽籤模擬僅供參考，實際選課結果以學校官方系統為準。
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Q: 如何備份我的選課資料？</h4>
            <p className="text-sm text-gray-600">
              A: 收藏的課程會自動儲存在瀏覽器的本地儲存中，不會遺失。
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">需要更多幫助？</h3>
          <p className="text-sm text-gray-600 mb-4">
            如果您有其他問題，請聯繫系統管理員或查看學校選課相關公告。
          </p>
          <Badge variant="outline">版本 1.0.0</Badge>
        </CardContent>
      </Card>
    </div>
  )
}
