import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Download, CheckCircle } from 'lucide-react'

const DAY_NAMES = ['', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']

export default function FinalTimetable() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">最終課表</h1>
        <p className="text-gray-600">您的正式選課結果</p>
      </div>

      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            選課成功
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700">
            恭喜！您已成功完成選課。以下是您的最終課表。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            週課表
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr>
                  <th className="w-[80px] border border-gray-300 p-2 bg-gray-100 text-sm font-medium">節次</th>
                  {Array.from({ length: 5 }, (_, i) => (
                    <th key={i} className="border border-gray-300 p-2 bg-gray-100 text-sm font-medium">
                      {DAY_NAMES[i + 1]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 14 }, (_, periodIndex) => (
                  <tr key={periodIndex}>
                    <td className="border border-gray-300 p-2 bg-gray-50 text-center font-medium">
                      第{periodIndex + 1}節
                    </td>
                    {Array.from({ length: 5 }, (_, dayIndex) => (
                      <td key={dayIndex} className="border border-gray-300 p-1 min-h-[60px]">
                        {/* Empty for now - would be populated with actual course data */}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              課表已確認，您可以下載或列印
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">3 門課程</Badge>
              <Badge variant="secondary">9 學分</Badge>
              <button className="text-blue-600 hover:text-blue-800">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
