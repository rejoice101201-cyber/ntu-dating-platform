import { useMemo, useCallback } from 'react'
import type { Course } from '../types/course'
import { detectConflicts } from '../utils/timeUtils'

export interface RecommendationStrategy {
  id: string
  name: string
  description: string
  weight: number
}

export interface RecommendedCourse extends Course {
  recommendationScore: number
  recommendationReasons: string[]
}

export function useCourseRecommendations(
  courses: Course[],
  selectedCourses: Course[],
  favorites: Set<string>,
  userPreferences?: {
    preferredDepartments?: string[]
    preferredTimeSlots?: Array<{day: number, period: number}>
    maxCredits?: number
    avoidConflicts?: boolean
  }
) {
  // Define recommendation strategies
  const strategies: RecommendationStrategy[] = [
    { id: 'probability', name: '選課機率', description: '基於歷史選課數據的高機率課程', weight: 0.3 },
    { id: 'similarity', name: '相似課程', description: '與已選課程相似的課程', weight: 0.25 },
    { id: 'department', name: '同系所', description: '相同系所的課程', weight: 0.2 },
    { id: 'time_preference', name: '時間偏好', description: '符合時間偏好的課程', weight: 0.15 },
    { id: 'no_conflict', name: '無衝突', description: '與已選課程無時間衝突', weight: 0.1 }
  ]

  // Get recommended courses based on multiple strategies
  const recommendedCourses = useMemo((): RecommendedCourse[] => {
    const excludedIds = new Set([
      ...selectedCourses.map(c => c.ser_no),
      ...favorites
    ])

    const candidates = courses.filter(course => !excludedIds.has(course.ser_no))

    return candidates.map(course => {
      const reasons: string[] = []
      let totalScore = 0

      // Strategy 1: Probability-based recommendation
      const probability = course.selectionProbability || 0
      if (probability > 70) {
        totalScore += strategies[0].weight * (probability / 100)
        reasons.push(`選課機率 ${probability}%`)
      }

      // Strategy 2: Similarity to selected courses
      const similarityScore = calculateSimilarityScore(course, selectedCourses)
      if (similarityScore > 0.3) {
        totalScore += strategies[1].weight * similarityScore
        reasons.push('與已選課程相似')
      }

      // Strategy 3: Same department
      if (userPreferences?.preferredDepartments?.includes(course.dpt_abbr || '')) {
        totalScore += strategies[2].weight
        reasons.push(`同系所: ${course.dpt_abbr}`)
      }

      // Strategy 4: Time preference
      const timeScore = calculateTimePreferenceScore(course, userPreferences?.preferredTimeSlots || [])
      if (timeScore > 0) {
        totalScore += strategies[3].weight * timeScore
        reasons.push('符合時間偏好')
      }

      // Strategy 5: No conflicts
      if (userPreferences?.avoidConflicts !== false) {
        const conflictResult = detectConflicts(course, selectedCourses)
        if (!conflictResult.hasConflict) {
          totalScore += strategies[4].weight
          reasons.push('無時間衝突')
        }
      }

      return {
        ...course,
        recommendationScore: totalScore,
        recommendationReasons: reasons
      }
    }).filter(course => course.recommendationScore > 0)
     .sort((a, b) => b.recommendationScore - a.recommendationScore)
  }, [courses, selectedCourses, favorites, userPreferences])

  // Get top recommendations
  const getTopRecommendations = useCallback((count = 10): RecommendedCourse[] => {
    return recommendedCourses.slice(0, count)
  }, [recommendedCourses])

  // Get recommendations by strategy
  const getRecommendationsByStrategy = useCallback((strategyId: string, count = 5): RecommendedCourse[] => {
    return recommendedCourses
      .filter(course => course.recommendationReasons.some(reason => 
        reason.includes(strategies.find(s => s.id === strategyId)?.name || '')
      ))
      .slice(0, count)
  }, [recommendedCourses, strategies])

  // Get recommendations for specific time slot
  const getRecommendationsForTimeSlot = useCallback((
    day: number, 
    period: number, 
    count = 5
  ): RecommendedCourse[] => {
    return recommendedCourses
      .filter(course => 
        course.timeSlots?.some(slot => slot.day === day && slot.start === period)
      )
      .slice(0, count)
  }, [recommendedCourses])

  // Get recommendations for specific department
  const getRecommendationsForDepartment = useCallback((
    department: string, 
    count = 5
  ): RecommendedCourse[] => {
    return recommendedCourses
      .filter(course => course.dpt_abbr === department)
      .slice(0, count)
  }, [recommendedCourses])

  // Calculate similarity score between courses
  const calculateSimilarityScore = useCallback((course: Course, selectedCourses: Course[]): number => {
    if (selectedCourses.length === 0) return 0

    let totalScore = 0
    let comparisons = 0

    for (const selected of selectedCourses) {
      let score = 0

      // Department similarity
      if (course.dpt_abbr === selected.dpt_abbr) {
        score += 0.4
      }

      // Course name similarity (simple keyword matching)
      const courseKeywords = extractKeywords(course.cou_cname + ' ' + course.cou_ename)
      const selectedKeywords = extractKeywords(selected.cou_cname + ' ' + selected.cou_ename)
      const commonKeywords = courseKeywords.filter(kw => selectedKeywords.includes(kw))
      score += (commonKeywords.length / Math.max(courseKeywords.length, selectedKeywords.length)) * 0.3

      // Credit similarity
      if (Math.abs(course.credit - selected.credit) <= 1) {
        score += 0.2
      }

      // Time similarity
      const courseTimes = course.timeSlots?.map(s => `${s.day}-${s.start}`) || []
      const selectedTimes = selected.timeSlots?.map(s => `${s.day}-${s.start}`) || []
      const commonTimes = courseTimes.filter(t => selectedTimes.includes(t))
      score += (commonTimes.length / Math.max(courseTimes.length, selectedTimes.length)) * 0.1

      totalScore += score
      comparisons++
    }

    return comparisons > 0 ? totalScore / comparisons : 0
  }, [])

  // Calculate time preference score
  const calculateTimePreferenceScore = useCallback((
    course: Course, 
    preferredTimeSlots: Array<{day: number, period: number}>
  ): number => {
    if (preferredTimeSlots.length === 0) return 0

    const courseTimeSlots = course.timeSlots || []
    const matches = courseTimeSlots.filter(courseSlot =>
      preferredTimeSlots.some(prefSlot =>
        courseSlot.day === prefSlot.day && courseSlot.start === prefSlot.period
      )
    )

    return matches.length / Math.max(courseTimeSlots.length, 1)
  }, [])

  // Extract keywords from text
  const extractKeywords = useCallback((text: string): string[] => {
    return text.toLowerCase()
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1)
  }, [])

  return {
    strategies,
    recommendedCourses,
    getTopRecommendations,
    getRecommendationsByStrategy,
    getRecommendationsForTimeSlot,
    getRecommendationsForDepartment
  }
}
