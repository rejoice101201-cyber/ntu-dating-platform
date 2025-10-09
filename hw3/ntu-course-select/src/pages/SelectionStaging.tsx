import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Trash2 } from 'lucide-react'
import { useCourseContext } from '../context/CourseContext'

const DAY_NAMES = ['', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']

export default function SelectionStaging() {
  const { selectedCourses, toggleSelect, clearSelection } = useCourseContext()
  const [activeTab, setActiveTab] = useState<'list' | 'timetable'>('list')

  const totalCredits = selectedCourses.reduce((sum, c) => sum + c.credit, 0)

  if (selectedCourses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">選課暫存</h2>
        <p className="text-gray-600 mb-6">您還沒有暫存任何課程</p>
        <Button onClick={() => window.history.back()}>
          返回搜尋課程
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">選課暫存</h1>
          <p className="text-gray-600">
            {selectedCourses.length} 門課程 • {totalCredits} 學分
          </p>
        </div>
        <Button variant="outline" onClick={clearSelection} aria-label="清空暫存">
          <Trash2 className="w-4 h-4 mr-2" />
          清空暫存
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'list' ? 'default' : 'outline'}
          onClick={() => setActiveTab('list')}
        >
          課程清單
        </Button>
        <Button
          variant={activeTab === 'timetable' ? 'default' : 'outline'}
          onClick={() => setActiveTab('timetable')}
        >
          時間表
        </Button>
      </div>

      {/* Course List */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {selectedCourses.map(course => (
            <Card key={course.ser_no} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {course.cou_cname || course.cou_ename}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                      <div><span className="font-medium">流水號:</span> {course.ser_no}</div>
                      <div><span className="font-medium">課號:</span> {course.cou_code}</div>
                      <div><span className="font-medium">系所:</span> {course.dpt_abbr}</div>
                      <div><span className="font-medium">教師:</span> {course.tea_cname || course.tea_ename}</div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{course.credit}學分</Badge>
                      {course.selectionProbability && (
                        <Badge variant="outline">
                          中籤率: {course.selectionProbability}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSelect(course.ser_no)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Timetable View */}
      {activeTab === 'timetable' && (
        <Card>
          <CardHeader>
            <CardTitle>週課表</CardTitle>
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
                      {Array.from({ length: 5 }, (_, dayIndex) => {
                        const course = selectedCourses.find(c => 
                          c.timeSlots?.some(ts => ts.day === dayIndex + 1 && ts.start === periodIndex + 1)
                        )
                        return (
                          <td key={dayIndex} className="border border-gray-300 p-1 min-h-[60px]">
                            {course && (
                              <div className="p-2 rounded text-xs border bg-blue-100 border-blue-300 text-blue-800">
                                <div className="font-medium truncate">
                                  {course.cou_cname || course.cou_ename}
                                </div>
                                <div className="text-xs opacity-75">
                                  {course.tea_cname || course.tea_ename}
                                </div>
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              準備好提交選課了嗎？
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                檢查衝突
              </Button>
              <Button>
                提交選課
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
