/**
 * 台大課程時間解析工具
 */

// 台大時間段對照表 (st1 編碼)
const TIME_SLOTS: Record<number, string> = {
  1: '08:10-09:00',
  2: '09:10-10:00', 
  3: '10:20-11:10',
  4: '11:20-12:10',
  5: '12:20-13:10',
  6: '13:20-14:10',
  7: '14:20-15:10',
  8: '15:30-16:20',
  9: '16:30-17:20',
  10: '17:30-18:20',
  11: '18:30-19:20',
  12: '19:30-20:20',
  // 繼續添加更多時間段...
  67: '14:20-15:10', // 根據您提到的課程
  // 其他時間段...
}

// 台大星期對照表 (day1 編碼)
const DAY_NAMES: Record<number, string> = {
  1: '星期一',
  2: '星期二', 
  3: '星期三',
  4: '星期四',
  5: '星期五',
  6: '星期六',
  7: '星期日',
  10: '星期四', // 根據您提到的課程
  // 其他編碼...
}

/**
 * 解析台大課程時間編碼
 */
export function parseNtuTime(day1?: string, st1?: string): string {
  if (!day1 || !st1) return '時間未定'
  
  const dayNum = parseInt(day1)
  const timeNum = parseInt(st1)
  
  const dayName = DAY_NAMES[dayNum] || `星期${dayNum}`
  const timeSlot = TIME_SLOTS[timeNum] || `時段${timeNum}`
  
  return `${dayName} ${timeSlot}`
}

/**
 * 解析多個時間段
 */
export function parseMultipleTimes(course: any): string[] {
  const times: string[] = []
  
  // 解析第一個時間段
  if (course.day1 && course.st1) {
    times.push(parseNtuTime(course.day1, course.st1))
  }
  
  // 解析第二個時間段
  if (course.day2 && course.st2) {
    times.push(parseNtuTime(course.day2, course.st2))
  }
  
  // 解析第三個時間段
  if (course.day3 && course.st3) {
    times.push(parseNtuTime(course.day3, course.st3))
  }
  
  return times
}

/**
 * 格式化時間顯示
 */
export function formatTimeDisplay(times: string[]): string {
  if (times.length === 0) return '時間未定'
  if (times.length === 1) return times[0]
  return times.join(', ')
}
