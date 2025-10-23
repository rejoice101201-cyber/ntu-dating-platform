import { useState, useMemo } from 'react'
import { Star, TrendingUp, Users, Clock, Filter } from 'lucide-react'
import { useCourseContext } from '../context/CourseContext'
import { useCourseRecommendations } from '../hooks/useCourseRecommendations'
import CourseCard from '../components/CourseCard'
import type { Course } from '../types/course'

export default function Recommendations() {
  const { courses, selectedCourses, favorites } = useCourseContext()
  const [selectedStrategy, setSelectedStrategy] = useState<string>('all')
  const [maxCredits, setMaxCredits] = useState<number>(20)

  const {
    strategies,
    recommendedCourses,
    getTopRecommendations,
    getRecommendationsByStrategy,
    getRecommendationsForTimeSlot,
    getRecommendationsForDepartment
  } = useCourseRecommendations(courses, selectedCourses, favorites, {
    maxCredits,
    avoidConflicts: true
  })

  // Get recommendations based on selected strategy
  const displayRecommendations = useMemo(() => {
    switch (selectedStrategy) {
      case 'probability':
        return getRecommendationsByStrategy('probability', 12)
      case 'similarity':
        return getRecommendationsByStrategy('similarity', 12)
      case 'department':
        return getRecommendationsByStrategy('department', 12)
      case 'no_conflict':
        return getRecommendationsByStrategy('no_conflict', 12)
      default:
        return getTopRecommendations(12)
    }
  }, [selectedStrategy, getTopRecommendations, getRecommendationsByStrategy])

  // Get popular departments
  const popularDepartments = useMemo(() => {
    const deptCount = new Map<string, number>()
    courses.forEach(course => {
      if (course.dpt_abbr) {
        deptCount.set(course.dpt_abbr, (deptCount.get(course.dpt_abbr) || 0) + 1)
      }
    })
    return Array.from(deptCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([dept]) => dept)
  }, [courses])

  // Get popular time slots
  const popularTimeSlots = useMemo(() => {
    const slotCount = new Map<string, number>()
    courses.forEach(course => {
      course.timeSlots?.forEach(slot => {
        const key = `${slot.day}-${slot.start}`
        slotCount.set(key, (slotCount.get(key) || 0) + 1)
      })
    })
    return Array.from(slotCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([slot]) => {
        const [day, period] = slot.split('-').map(Number)
        const DAYS = ['', '一', '二', '三', '四', '五', '六', '日']
        return { day, period, display: `星期${DAYS[day]}${period}節` }
      })
  }, [courses])

  return (
    <div className="min-h-screen bg-white text-gray-700 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-3 px-6 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">臺大課程網</h1>
        <nav>
          <ul className="flex space-x-6 text-sm font-medium">
            <li><a href="/" className="text-gray-700 hover:text-blue-600">課程資訊</a></li>
            <li><a href="/results" className="text-gray-700 hover:text-blue-600">選課結果</a></li>
            <li><a href="/recommendations" className="text-blue-600 hover:text-blue-800">推薦課程</a></li>
          </ul>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">課程推薦</h2>
          <p className="text-lg text-gray-600">基於您的選課偏好，為您推薦最適合的課程</p>
        </div>

        {/* Strategy Selection */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">推薦策略</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {strategies.map(strategy => (
              <button
                key={strategy.id}
                onClick={() => setSelectedStrategy(strategy.id)}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  selectedStrategy === strategy.id
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    selectedStrategy === strategy.id ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {strategy.id === 'probability' && <TrendingUp className="w-5 h-5" />}
                    {strategy.id === 'similarity' && <Star className="w-5 h-5" />}
                    {strategy.id === 'department' && <Users className="w-5 h-5" />}
                    {strategy.id === 'time_preference' && <Clock className="w-5 h-5" />}
                    {strategy.id === 'no_conflict' && <Filter className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-medium">{strategy.name}</h4>
                    <p className="text-sm text-gray-600">{strategy.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Popular Departments */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">熱門系所</h3>
            <div className="flex flex-wrap gap-2">
              {popularDepartments.map(dept => (
                <button
                  key={dept}
                  onClick={() => {
                    const deptRecommendations = getRecommendationsForDepartment(dept, 12)
                    // This would need to be implemented to update the display
                  }}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Popular Time Slots */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">熱門時段</h3>
            <div className="flex flex-wrap gap-2">
              {popularTimeSlots.map(slot => (
                <button
                  key={`${slot.day}-${slot.period}`}
                  onClick={() => {
                    const timeRecommendations = getRecommendationsForTimeSlot(slot.day, slot.period, 12)
                    // This would need to be implemented to update the display
                  }}
                  className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
                >
                  {slot.display}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations Display */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              推薦課程 ({displayRecommendations.length} 門)
            </h3>
            <div className="flex items-center space-x-4">
              <label className="text-sm text-gray-600">
                最大學分: {maxCredits}
              </label>
              <input
                type="range"
                min="10"
                max="30"
                value={maxCredits}
                onChange={(e) => setMaxCredits(Number(e.target.value))}
                className="w-32"
              />
            </div>
          </div>

          {displayRecommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayRecommendations.map(course => (
                <CourseCard
                  key={course.ser_no}
                  course={course}
                  showActions={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Star className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">暫無推薦課程</h3>
              <p className="text-gray-500">請嘗試調整推薦策略或篩選條件</p>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">推薦統計</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{courses.length}</div>
              <div className="text-sm text-gray-600">總課程數</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{selectedCourses.length}</div>
              <div className="text-sm text-gray-600">已選課程</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{favorites.size}</div>
              <div className="text-sm text-gray-600">收藏課程</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{displayRecommendations.length}</div>
              <div className="text-sm text-gray-600">推薦課程</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
