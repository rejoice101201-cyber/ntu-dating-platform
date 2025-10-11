import { useEffect, useMemo, useRef, useState } from 'react'
import Papa from 'papaparse'
import type { ParseResult } from 'papaparse'
import type { Course } from '../types/course'

function coerceNumber(value: unknown): number | undefined {
  const num = typeof value === 'string' ? Number(value.trim()) : Number(value)
  return Number.isFinite(num) ? num : undefined
}

function calculateSelectionProbability(row: Record<string, unknown>): number {
  const limit = coerceNumber(row['limit'])
  const coSelect = coerceNumber(row['co_select'])
  
  // If we have both limit and co_select data, calculate based on ratio
  if (limit && coSelect && limit > 0) {
    const ratio = coSelect / limit
    return Math.min(100, Math.max(0, Math.round(ratio * 100)))
  }
  
  // Otherwise, generate random probability between 20-80%
  return Math.floor(Math.random() * 61) + 20 // 20-80%
}


function mapRowToCourse(row: Record<string, unknown>): Course | null {
  // Direct mapping from NTU CSV headers
  const ser_no = String(row['ser_no'] ?? '').trim()
  const cou_cname = String(row['cou_cname'] ?? '').trim()
  const cou_ename = String(row['cou_ename'] ?? '').trim()
  const cou_code = String(row['cou_code'] ?? '').trim()
  
  // Generate ser_no if it's empty, using cou_code as fallback
  const finalSerNo = ser_no || cou_code || `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  if (!finalSerNo || (!cou_cname && !cou_ename)) return null

  const course: Course = {
    ser_no: finalSerNo,
    cou_code: String(row['cou_code'] ?? '').trim(),
    cou_cname,
    cou_ename,
    dpt_code: String(row['dpt_code'] ?? '').trim(),
    dpt_abbr: String(row['dpt_abbr'] ?? '').trim(),
    credit: coerceNumber(row['credit']) ?? 0,
    tlec: coerceNumber(row['tlec']) ?? 0,
    tlab: coerceNumber(row['tlab']) ?? 0,
    tea_cname: String(row['tea_cname'] ?? '').trim(),
    tea_ename: String(row['tea_ename'] ?? '').trim(),
    
    // Time slots
    st1: coerceNumber(row['st1']),
    day1: coerceNumber(row['day1']),
    st2: coerceNumber(row['st2']),
    day2: coerceNumber(row['day2']),
    st3: coerceNumber(row['st3']),
    day3: coerceNumber(row['day3']),
    st4: coerceNumber(row['st4']),
    day4: coerceNumber(row['day4']),
    st5: coerceNumber(row['st5']),
    day5: coerceNumber(row['day5']),
    st6: coerceNumber(row['st6']),
    day6: coerceNumber(row['day6']),
    
    // Classrooms
    clsrom_1: String(row['clsrom_1'] ?? '').trim() || undefined,
    clsrom_2: String(row['clsrom_2'] ?? '').trim() || undefined,
    clsrom_3: String(row['clsrom_3'] ?? '').trim() || undefined,
    clsrom_4: String(row['clsrom_4'] ?? '').trim() || undefined,
    clsrom_5: String(row['clsrom_5'] ?? '').trim() || undefined,
    clsrom_6: String(row['clsrom_6'] ?? '').trim() || undefined,
    
    // Additional info
    limit: coerceNumber(row['limit']),
    pre_course: String(row['pre_course'] ?? '').trim() || undefined,
    co_rep: String(row['co_rep'] ?? '').trim() || undefined,
    co_select: String(row['co_select'] ?? '').trim() || undefined,
    outside: String(row['outside'] ?? '').trim() || undefined,
    
    // Computed fields
    displayName: cou_cname || cou_ename,
    totalHours: (coerceNumber(row['tlec']) ?? 0) + (coerceNumber(row['tlab']) ?? 0),
    selectionProbability: calculateSelectionProbability(row),
  }

  // Parse time slots
  const timeSlots: Array<{day: number, start: number, classroom?: string}> = []
  for (let i = 1; i <= 6; i++) {
    const start = course[`st${i}` as keyof Course] as number | undefined
    const day = course[`day${i}` as keyof Course] as number | undefined
    const classroom = course[`clsrom_${i}` as keyof Course] as string | undefined
    
    if (start && day) {
      timeSlots.push({ day, start, classroom })
    }
  }
  course.timeSlots = timeSlots

  return course
}

export interface UseCourseDataOptions {
  csvPath?: string
}

export function useCourseData(options?: UseCourseDataOptions) {
  const defaultCandidates = ['/src/public/data/hw3-ntucourse-data-1002.csv', '/data/hw3-ntucourse-data-1002.csv', '/data/courses.csv']
  const csvCandidates = options?.csvPath ? [options.csvPath, ...defaultCandidates] : defaultCandidates
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const accumulatedRef = useRef<Course[]>([])
  const triedRef = useRef<string[]>([])

  useEffect(() => {
    setIsLoading(true)
    setError(null)
    accumulatedRef.current = []
    let isActive = true

    function tryNext(index: number) {
      if (index >= csvCandidates.length) {
        setIsLoading(false)
        if (!error) setError('No CSV found at: ' + triedRef.current.join(', '))
        return
      }
      const path = csvCandidates[index]
      triedRef.current.push(path)
      Papa.parse(path, {
        download: true,
        header: true,
        worker: true,
        skipEmptyLines: true,
        chunk: (results: ParseResult<Record<string, unknown>>) => {
          const mapped = (results.data as Record<string, unknown>[])
            .map(mapRowToCourse)
            .filter((c: Course | null): c is Course => c !== null)
          if (mapped.length) {
            accumulatedRef.current = accumulatedRef.current.concat(mapped)
            if (isActive && accumulatedRef.current.length % 1000 === 0) {
              setCourses([...accumulatedRef.current])
            }
          }
        },
        complete: () => {
          if (accumulatedRef.current.length === 0) {
            // empty file; try next
            tryNext(index + 1)
            return
          }
          if (isActive) {
            setCourses([...accumulatedRef.current])
            setIsLoading(false)
          }
        },
            error: () => {
          // Try the next candidate on error
          accumulatedRef.current = []
          tryNext(index + 1)
        },
      })
    }

    tryNext(0)

    return () => {
      isActive = false
    }
  }, [csvCandidates.map(String).join('|')])

  const departments = useMemo(() => {
    const set = new Set<string>()
    for (const c of courses) {
      if (c.dpt_abbr) set.add(c.dpt_abbr)
    }
    return Array.from(set).sort()
  }, [courses])

  return { courses, isLoading, error, departments }
}

export default useCourseData

