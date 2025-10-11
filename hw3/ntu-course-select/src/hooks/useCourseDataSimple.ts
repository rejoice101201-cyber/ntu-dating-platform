import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import { Course } from '../types/course'

export function useCourseDataSimple() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setError(null)

    Papa.parse('/data/hw3-ntucourse-data-1002.csv', {
      download: true,
      header: true,
      worker: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log('CSV loaded:', results.data.length, 'rows')
        
        // Simple mapping without complex logic
        const mappedCourses: Course[] = results.data.slice(0, 50).map((row: any, index: number) => {
          const ser_no = String(row['ser_no'] ?? '').trim() || `course-${index}`
          const cou_cname = String(row['cou_cname'] ?? '').trim()
          const cou_ename = String(row['cou_ename'] ?? '').trim()
          const tea_cname = String(row['tea_cname'] ?? '').trim()
          const tea_ename = String(row['tea_ename'] ?? '').trim()
          const cou_code = String(row['cou_code'] ?? '').trim()
          const dpt_code = String(row['dpt_code'] ?? '').trim()
          const credit = Number(row['credit']) || 0
          const limit = Number(row['limit']) || 0
          const co_rep = String(row['co_rep'] ?? '').trim()

          return {
            ser_no,
            cou_code,
            cou_cname,
            cou_ename,
            tea_cname,
            tea_ename,
            dpt_code,
            credit,
            limit,
            co_rep,
            st1: Number(row['st1']) || 0,
            day1: Number(row['day1']) || 0,
            st2: Number(row['st2']) || 0,
            day2: Number(row['day2']) || 0,
            st3: Number(row['st3']) || 0,
            day3: Number(row['day3']) || 0,
            st4: Number(row['st4']) || 0,
            day4: Number(row['day4']) || 0,
            st5: Number(row['st5']) || 0,
            day5: Number(row['day5']) || 0,
            st6: Number(row['st6']) || 0,
            day6: Number(row['day6']) || 0,
            clsrom_1: String(row['clsrom_1'] ?? '').trim(),
            clsrom_2: String(row['clsrom_2'] ?? '').trim(),
            clsrom_3: String(row['clsrom_3'] ?? '').trim(),
            clsrom_4: String(row['clsrom_4'] ?? '').trim(),
            clsrom_5: String(row['clsrom_5'] ?? '').trim(),
            clsrom_6: String(row['clsrom_6'] ?? '').trim(),
            tlec: Number(row['tlec']) || 0,
            tlab: Number(row['tlab']) || 0,
            pre_course: String(row['pre_course'] ?? '').trim() || undefined,
            co_select: String(row['co_select'] ?? '').trim() || undefined,
            outside: String(row['outside'] ?? '').trim() || undefined,
            displayName: cou_cname || cou_ename,
            totalHours: (Number(row['tlec']) || 0) + (Number(row['tlab']) || 0),
            selectionProbability: Math.floor(Math.random() * 61) + 20, // 20-80%
            timeSlots: [] // Simplified for now
          }
        }).filter(course => course.cou_cname || course.cou_ename) // Filter out empty courses

        console.log('Mapped courses:', mappedCourses.length)
        setCourses(mappedCourses)
        setIsLoading(false)
      },
      error: (error) => {
        console.error('CSV loading error:', error)
        setError(`Error loading CSV: ${error.message}`)
        setIsLoading(false)
      }
    })
  }, [])

  return { courses, isLoading, error }
}
