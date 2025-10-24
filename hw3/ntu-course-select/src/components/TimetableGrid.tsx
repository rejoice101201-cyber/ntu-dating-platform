import { useState } from 'react'
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { useTimetable } from '../hooks/useTimetable'
import type { Course } from '../types/course'

interface TimetableGridProps {
  selectedCourses: Course[]
  onCourseClick?: (course: Course) => void
  className?: string
}

export default function TimetableGrid({ selectedCourses, onCourseClick, className = '' }: TimetableGridProps) {
  const {
    timetable,
    showConflicts,
    setShowConflicts,
    getCourseAtSlot,
    hasConflictAtSlot,
    formatTimeSlot,
    statistics
  } = useTimetable(selectedCourses)

  const [hoveredSlot, setHoveredSlot] = useState<{day: number, period: number} | null>(null)

  const DAYS = ['', '一', '二', '三', '四', '五', '六', '日']
  const PERIODS = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14']

  const getSlotColor = (day: number, period: number) => {
    const course = getCourseAtSlot(day, period)
    const hasConflict = hasConflictAtSlot(day, period)
    
    if (hasConflict) return 'bg-red-100 border-red-300 text-red-800'
    if (course) return 'bg-blue-100 border-blue-300 text-blue-800'
    return 'bg-gray-50 border-gray-200 text-gray-600'
  }

  const getSlotIcon = (day: number, period: number) => {
    const hasConflict = hasConflictAtSlot(day, period)
    const course = getCourseAtSlot(day, period)
    
    if (hasConflict) return <AlertTriangle className="w-4 h-4 text-red-600" />
    if (course) return <CheckCircle className="w-4 h-4 text-blue-600" />
    return <Clock className="w-4 h-4 text-gray-400" />
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">課程時間表</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="show-conflicts"
                checked={showConflicts}
                onChange={(e) => setShowConflicts(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="show-conflicts" className="text-sm text-gray-700">
                顯示衝突
              </label>
            </div>
            <div className="text-sm text-gray-600">
              總學分: {statistics.totalCredits} | 利用率: {statistics.utilizationRate.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-16 p-2 text-sm font-medium text-gray-600 border border-gray-200 bg-gray-50">
                  時間
                </th>
                {DAYS.slice(1).map((day, index) => (
                  <th key={day} className="w-24 p-2 text-sm font-medium text-gray-600 border border-gray-200 bg-gray-50">
                    星期{day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.slice(1).map((period, periodIndex) => (
                <tr key={period}>
                  <td className="p-2 text-sm font-medium text-gray-600 border border-gray-200 bg-gray-50 text-center">
                    {period}
                  </td>
                  {DAYS.slice(1).map((day, dayIndex) => {
                    const dayNum = dayIndex + 1
                    const periodNum = periodIndex + 1
                    const course = getCourseAtSlot(dayNum, periodNum)
                    const hasConflict = hasConflictAtSlot(dayNum, periodNum)
                    
                    return (
                      <td
                        key={`${day}-${period}`}
                        className={`p-2 border border-gray-200 text-center cursor-pointer transition-colors hover:bg-gray-100 ${getSlotColor(dayNum, periodNum)}`}
                        onMouseEnter={() => setHoveredSlot({day: dayNum, period: periodNum})}
                        onMouseLeave={() => setHoveredSlot(null)}
                        onClick={() => course && onCourseClick?.(course)}
                      >
                        {course ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-center">
                              {getSlotIcon(dayNum, periodNum)}
                            </div>
                            <div className="text-xs font-medium truncate">
                              {course.cou_cname || course.cou_ename}
                            </div>
                            {course.timeSlots?.[0]?.classroom && (
                              <div className="text-xs text-gray-500 truncate">
                                {course.timeSlots[0].classroom}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-12">
                            {getSlotIcon(dayNum, periodNum)}
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
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span className="text-gray-700">已選課程</span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-gray-700">時間衝突</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700">空閒時間</span>
          </div>
        </div>
      </div>

      {/* Hover Tooltip */}
      {hoveredSlot && (
        <div className="absolute z-10 p-2 bg-gray-800 text-white text-sm rounded shadow-lg pointer-events-none">
          {formatTimeSlot(hoveredSlot.day, hoveredSlot.period)}
        </div>
      )}
    </div>
  )
}
