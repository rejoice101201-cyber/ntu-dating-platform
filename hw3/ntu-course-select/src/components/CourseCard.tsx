import { useState } from 'react'
import { Heart, Plus, Clock, Users, BookOpen, Star } from 'lucide-react'
import type { Course } from '../types/course'
import { useCourseContext } from '../context/CourseContext'

interface CourseCardProps {
  course: Course
  showActions?: boolean
  compact?: boolean
  onSelect?: (course: Course) => void
}

export default function CourseCard({ 
  course, 
  showActions = true, 
  compact = false,
  onSelect 
}: CourseCardProps) {
  const { favorites, toggleFavorite, addToSelected, selectedIds } = useCourseContext()
  const [isHovered, setIsHovered] = useState(false)

  const isFavorite = favorites.has(course.ser_no)
  const isSelected = selectedIds.has(course.ser_no)

  const handleAddToSelected = () => {
    if (onSelect) {
      onSelect(course)
    } else {
      addToSelected(course.ser_no)
    }
  }

  const formatTimeSlots = (timeSlots?: Array<{day: number, start: number, classroom?: string}>): string => {
    if (!timeSlots || timeSlots.length === 0) return '無'
    
    const DAYS = ['', '一', '二', '三', '四', '五', '六', '日']
    const PERIODS = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14']
    
    return timeSlots.map(ts => 
      `${DAYS[ts.day]}${PERIODS[ts.start]}${ts.classroom ? `(${ts.classroom})` : ''}`
    ).join(', ')
  }

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600 bg-green-100'
    if (probability >= 60) return 'text-yellow-600 bg-yellow-100'
    if (probability >= 40) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  if (compact) {
    return (
      <div 
        className={`border rounded-lg p-3 cursor-pointer transition-all ${
          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleAddToSelected}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-gray-900 truncate">
              {course.cou_cname || course.cou_ename}
            </h3>
            <p className="text-xs text-gray-600 truncate">
              {course.tea_cname || course.tea_ename}
            </p>
          </div>
          <div className="flex items-center space-x-2 ml-2">
            <span className={`px-2 py-1 text-xs rounded-full ${getProbabilityColor(course.selectionProbability || 0)}`}>
              {course.selectionProbability || 0}%
            </span>
            {showActions && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFavorite(course.ser_no)
                }}
                className={`p-1 rounded-full transition-colors ${
                  isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`border rounded-lg overflow-hidden transition-all ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="bg-blue-50 p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-blue-800 mb-1">
              {course.cou_cname || course.cou_ename}
            </h3>
            <p className="text-sm text-blue-600">
              {course.tea_cname || course.tea_ename}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getProbabilityColor(course.selectionProbability || 0)}`}>
              {course.selectionProbability || 0}%
            </span>
            {showActions && (
              <button
                onClick={() => toggleFavorite(course.ser_no)}
                className={`p-2 rounded-full transition-colors ${
                  isFavorite ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">學分:</span>
            <span className="font-medium">{course.credit}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">人數:</span>
            <span className="font-medium">{course.limit || '無限制'}</span>
          </div>
        </div>

        {/* Time Slots */}
        <div className="flex items-start space-x-2">
          <Clock className="w-4 h-4 text-gray-500 mt-0.5" />
          <div>
            <span className="text-sm text-gray-600">時間:</span>
            <p className="text-sm font-medium text-gray-800">
              {formatTimeSlots(course.timeSlots)}
            </p>
          </div>
        </div>

        {/* Course Code */}
        <div className="text-sm text-gray-600">
          <span className="font-medium">流水號:</span> {course.ser_no} | 
          <span className="font-medium ml-2">課號:</span> {course.cou_code}
        </div>

        {/* Department */}
        {course.dpt_abbr && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">系所:</span> {course.dpt_abbr}
          </div>
        )}

        {/* Restrictions */}
        {course.co_rep && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">限制:</span> {course.co_rep}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center space-x-2">
              {course.co_tp === '1' && (
                <span className="px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full">
                  必修
                </span>
              )}
              {course.selectionProbability && course.selectionProbability > 80 && (
                <span className="px-2 py-1 text-xs font-medium text-green-600 bg-green-100 rounded-full">
                  熱門
                </span>
              )}
            </div>
            <button
              onClick={handleAddToSelected}
              disabled={isSelected}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                isSelected
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{isSelected ? '已選' : '選課'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
