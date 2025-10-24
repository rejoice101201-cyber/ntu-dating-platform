import { useState } from 'react'
import { Search, Filter, X, ChevronDown } from 'lucide-react'
import { useCourseSearch } from '../hooks/useCourseSearch'
import type { Course } from '../types/course'

interface SearchFiltersProps {
  courses: Course[]
  onSearch: (filteredCourses: Course[]) => void
  className?: string
}

export default function SearchFilters({ courses, onSearch, className = '' }: SearchFiltersProps) {
  const {
    filters,
    sortOptions,
    filteredCourses,
    departments,
    timeSlots,
    updateFilters,
    updateSortOptions,
    clearFilters
  } = useCourseSearch(courses)

  const [isExpanded, setIsExpanded] = useState(false)

  // Update search results when filters change
  useState(() => {
    onSearch(filteredCourses)
  })

  const handleFilterChange = (key: string, value: any) => {
    updateFilters({ [key]: value })
  }

  const handleSortChange = (field: string) => {
    const newDirection = sortOptions.field === field && sortOptions.direction === 'asc' ? 'desc' : 'asc'
    updateSortOptions({ field: field as any, direction: newDirection })
  }

  const formatTimeSlot = (timeSlot: string): string => {
    const [day, period] = timeSlot.split('-').map(Number)
    const DAYS = ['', '一', '二', '三', '四', '五', '六', '日']
    return `${DAYS[day]}${period}`
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Main Search Bar */}
      <div className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜尋課程名稱、教師、流水號..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={filters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            <span>篩選</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={clearFilters}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <X className="w-4 h-4" />
            <span>清除</span>
          </button>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          {/* Quick Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">系所</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
              >
                <option value="">全部系所</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">類別</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">全部類別</option>
                <option value="required">必修</option>
                <option value="elective">選修</option>
                <option value="general">通識/共同</option>
                <option value="physical">體育/國防</option>
              </select>
            </div>

            {/* Time Slot Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">時間</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={filters.timeSlot}
                onChange={(e) => handleFilterChange('timeSlot', e.target.value)}
              >
                <option value="">全部時間</option>
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>{formatTimeSlot(slot)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Range Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Credit Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                學分範圍: {filters.creditRange[0]} - {filters.creditRange[1]}
              </label>
              <div className="flex space-x-2">
                <input
                  type="range"
                  min="0"
                  max="6"
                  value={filters.creditRange[0]}
                  onChange={(e) => handleFilterChange('creditRange', [Number(e.target.value), filters.creditRange[1]])}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="0"
                  max="6"
                  value={filters.creditRange[1]}
                  onChange={(e) => handleFilterChange('creditRange', [filters.creditRange[0], Number(e.target.value)])}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Probability Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                選課機率: {filters.probabilityRange[0]}% - {filters.probabilityRange[1]}%
              </label>
              <div className="flex space-x-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.probabilityRange[0]}
                  onChange={(e) => handleFilterChange('probabilityRange', [Number(e.target.value), filters.probabilityRange[1]])}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.probabilityRange[1]}
                  onChange={(e) => handleFilterChange('probabilityRange', [filters.probabilityRange[0], Number(e.target.value)])}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">排序方式</label>
            <div className="flex flex-wrap gap-2">
              {[
                { field: 'name', label: '課程名稱' },
                { field: 'teacher', label: '教師' },
                { field: 'credit', label: '學分' },
                { field: 'probability', label: '選課機率' },
                { field: 'time', label: '時間' }
              ].map(option => (
                <button
                  key={option.field}
                  onClick={() => handleSortChange(option.field)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    sortOptions.field === option.field
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {option.label}
                  {sortOptions.field === option.field && (
                    <span className="ml-1">
                      {sortOptions.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            找到 {filteredCourses.length} 門課程
          </div>
        </div>
      )}
    </div>
  )
}
