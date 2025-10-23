import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { Search, Filter, X, ChevronDown, SortAsc, SortDesc } from 'lucide-react'
import { cn } from '../lib/utils'
import { useCourseSearch } from '../hooks/useCourseSearch'
import type { Course } from '../types/course'

interface AdvancedSearchProps {
  courses: Course[]
  onSearchResults: (results: Course[]) => void
  className?: string
}

export default function AdvancedSearch({ courses, onSearchResults, className }: AdvancedSearchProps) {
  const {
    filters,
    sortOptions,
    filteredCourses,
    departments,
    timeSlots,
    updateFilters,
    updateSortOptions,
    clearFilters,
    searchStats
  } = useCourseSearch(courses)

  const [isExpanded, setIsExpanded] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Update search results when filters change
  useEffect(() => {
    onSearchResults(filteredCourses)
  }, [filteredCourses, onSearchResults])

  // Handle filter changes
  const handleFilterChange = useCallback((key: string, value: any) => {
    updateFilters({ [key]: value })
  }, [updateFilters])

  // Handle sort changes
  const handleSortChange = useCallback((field: string) => {
    const newDirection = sortOptions.field === field && sortOptions.direction === 'asc' ? 'desc' : 'asc'
    updateSortOptions({ field: field as any, direction: newDirection })
    setShowSortMenu(false)
  }, [sortOptions, updateSortOptions])

  // Format time slot for display
  const formatTimeSlot = useCallback((timeSlot: string): string => {
    const [day, period] = timeSlot.split('-').map(Number)
    const DAYS = ['', '一', '二', '三', '四', '五', '六', '日']
    return `${DAYS[day]}${period}`
  }, [])

  // Sort options configuration
  const sortOptionsConfig = useMemo(() => [
    { field: 'name', label: '課程名稱', icon: '📚' },
    { field: 'teacher', label: '教師', icon: '👨‍🏫' },
    { field: 'credit', label: '學分', icon: '🎓' },
    { field: 'probability', label: '選課機率', icon: '📊' },
    { field: 'time', label: '時間', icon: '⏰' }
  ], [])

  // Focus search input on Ctrl/Cmd + K
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className={cn("bg-white border border-gray-200 rounded-lg shadow-sm", className)}>
      {/* Main Search Bar */}
      <div className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="搜尋課程名稱、教師、流水號... (Ctrl+K)"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={filters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
            />
            {filters.keyword && (
              <button
                onClick={() => handleFilterChange('keyword', '')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Sort Button */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {sortOptions.direction === 'asc' ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              )}
              <span>排序</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                {sortOptionsConfig.map(option => (
                  <button
                    key={option.field}
                    onClick={() => handleSortChange(option.field)}
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2",
                      sortOptions.field === option.field && "bg-blue-50 text-blue-700"
                    )}
                  >
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                    {sortOptions.field === option.field && (
                      <span className="ml-auto">
                        {sortOptions.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 border rounded-md transition-colors",
              isExpanded
                ? "bg-blue-600 text-white border-blue-600"
                : "text-gray-600 border-gray-300 hover:bg-gray-50"
            )}
          >
            <Filter className="w-4 h-4" />
            <span>篩選</span>
            <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
          </button>

          {/* Clear Filters */}
          {searchStats.filterActive && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
              <span>清除</span>
            </button>
          )}
        </div>

        {/* Search Stats */}
        <div className="mt-3 text-sm text-gray-600">
          找到 <span className="font-medium text-blue-600">{searchStats.filteredCount}</span> 門課程
          {searchStats.filterActive && (
            <span className="ml-2 text-gray-500">
              (共 {searchStats.totalCourses} 門)
            </span>
          )}
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
        </div>
      )}
    </div>
  )
}
