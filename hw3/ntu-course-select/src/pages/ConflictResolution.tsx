import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, CheckCircle } from 'lucide-react'

export default function ConflictResolution() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">衝突解決</h1>
        <p className="text-gray-600">解決課程時間衝突問題</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            目前沒有時間衝突
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            您的選課清單中沒有發現時間衝突。可以安全地提交選課。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            衝突解決指南
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-gray-600">
            <p><strong>時間衝突：</strong>當兩門課程在同一時間上課時會發生衝突</p>
            <p><strong>解決方法：</strong>選擇其中一門課程，或尋找其他時間的相同課程</p>
            <p><strong>優先順序：</strong>必修課程通常比選修課程優先</p>
            <p><strong>替代方案：</strong>查看是否有其他時段的相同課程</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
