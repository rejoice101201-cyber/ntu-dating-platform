/**
 * 數據檢查工具 - 用於調試課表問題
 */

export interface CourseTimeData {
  ser_no: string
  cou_cname: string
  tea_cname: string
  cou_code: string
  // 原始時間數據
  day1?: string
  st1?: string
  day2?: string
  st2?: string
  day3?: string
  st3?: string
  // 解析後數據
  parsedTime?: string
  priority?: number
  classroom?: string
}

export interface DebugReport {
  totalCourses: number
  coursesWithTime: number
  coursesWithoutTime: number
  timeMappingIssues: string[]
  conflictDetected: Array<{
    timeSlot: string
    courses: string[]
    resolvedBy: string
  }>
  recommendations: string[]
}

/**
 * 檢查課程時間數據
 */
export function checkCourseTimeData(courses: any[]): DebugReport {
  const report: DebugReport = {
    totalCourses: courses.length,
    coursesWithTime: 0,
    coursesWithoutTime: 0,
    timeMappingIssues: [],
    conflictDetected: [],
    recommendations: []
  }

  const timeSlots = new Map<string, string[]>()

  courses.forEach(course => {
    const courseData = course as any
    let hasTime = false

    // 檢查所有時間段
    if (courseData.day1 && courseData.st1) {
      hasTime = true
      const timeKey = `${courseData.day1}-${courseData.st1}`
      if (!timeSlots.has(timeKey)) {
        timeSlots.set(timeKey, [])
      }
      timeSlots.get(timeKey)!.push(`${courseData.cou_cname} (志願序: ${courseData.priority || '未設定'})`)
    }

    if (courseData.day2 && courseData.st2) {
      hasTime = true
      const timeKey = `${courseData.day2}-${courseData.st2}`
      if (!timeSlots.has(timeKey)) {
        timeSlots.set(timeKey, [])
      }
      timeSlots.get(timeKey)!.push(`${courseData.cou_cname} (志願序: ${courseData.priority || '未設定'})`)
    }

    if (courseData.day3 && courseData.st3) {
      hasTime = true
      const timeKey = `${courseData.day3}-${courseData.st3}`
      if (!timeSlots.has(timeKey)) {
        timeSlots.set(timeKey, [])
      }
      timeSlots.get(timeKey)!.push(`${courseData.cou_cname} (志願序: ${courseData.priority || '未設定'})`)
    }

    if (hasTime) {
      report.coursesWithTime++
    } else {
      report.coursesWithoutTime++
    }

    // 檢查時間映射問題
    if (courseData.day1 && !isValidDayCode(courseData.day1)) {
      report.timeMappingIssues.push(`未知星期編碼: ${courseData.day1} (課程: ${courseData.cou_cname})`)
    }
    if (courseData.st1 && !isValidTimeCode(courseData.st1)) {
      report.timeMappingIssues.push(`未知時間編碼: ${courseData.st1} (課程: ${courseData.cou_cname})`)
    }
  })

  // 檢查時間衝突
  timeSlots.forEach((courses, timeSlot) => {
    if (courses.length > 1) {
      report.conflictDetected.push({
        timeSlot,
        courses,
        resolvedBy: '志願序優先'
      })
    }
  })

  // 生成建議
  if (report.coursesWithoutTime > 0) {
    report.recommendations.push(`${report.coursesWithoutTime} 門課程沒有時間數據，請檢查 CSV 數據`)
  }
  if (report.timeMappingIssues.length > 0) {
    report.recommendations.push(`發現 ${report.timeMappingIssues.length} 個時間映射問題，需要更新時間解析器`)
  }
  if (report.conflictDetected.length > 0) {
    report.recommendations.push(`發現 ${report.conflictDetected.length} 個時間衝突，已按志願序解決`)
  }

  return report
}

/**
 * 檢查星期編碼是否有效
 */
function isValidDayCode(dayCode: string): boolean {
  const validDays = ['1', '2', '3', '4', '5', '6', '7', '10', '12']
  return validDays.includes(dayCode)
}

/**
 * 檢查時間編碼是否有效
 */
function isValidTimeCode(timeCode: string): boolean {
  const validTimes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'S', '67']
  return validTimes.includes(timeCode)
}

/**
 * 生成詳細的調試報告
 */
export function generateDebugReport(courses: any[]): string {
  const report = checkCourseTimeData(courses)
  
  let debugReport = `🔍 課表調試報告\n`
  debugReport += `========================\n\n`
  
  debugReport += `📊 基本統計:\n`
  debugReport += `- 總課程數: ${report.totalCourses}\n`
  debugReport += `- 有時間數據: ${report.coursesWithTime}\n`
  debugReport += `- 無時間數據: ${report.coursesWithoutTime}\n\n`
  
  if (report.timeMappingIssues.length > 0) {
    debugReport += `⚠️ 時間映射問題:\n`
    report.timeMappingIssues.forEach(issue => {
      debugReport += `- ${issue}\n`
    })
    debugReport += `\n`
  }
  
  if (report.conflictDetected.length > 0) {
    debugReport += `🔄 時間衝突:\n`
    report.conflictDetected.forEach(conflict => {
      debugReport += `- 時間段 ${conflict.timeSlot}:\n`
      conflict.courses.forEach(course => {
        debugReport += `  * ${course}\n`
      })
    })
    debugReport += `\n`
  }
  
  if (report.recommendations.length > 0) {
    debugReport += `💡 建議:\n`
    report.recommendations.forEach(rec => {
      debugReport += `- ${rec}\n`
    })
  }
  
  return debugReport
}
