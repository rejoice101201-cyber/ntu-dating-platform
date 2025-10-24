/**
 * 簡單時間分配器 - 為每門課程隨機分配連續3節課
 */

// 星期編碼 (1-5 對應星期一到星期五)
const DAYS = ['1', '2', '3', '4', '5']

// 時間段編碼 (1-8 對應第1-8節課，使用1-8節課以支持更多時段)
const TIME_SLOTS = ['1', '2', '3', '4', '5', '6', '7', '8']

/**
 * 為課程分配隨機時段，根據學分數分配對應數量的時段
 */
export function assignRandomTimeSlots(course: any): any {
  // 使用課程代碼作為種子，確保同一門課程總是得到相同的時間
  const seed = hashString(course.cou_code || course.ser_no)
  const random = seededRandom(seed)
  
  // 根據學分數決定時段數量
  const credit = parseInt(course.credit) || 3
  const timeSlotCount = Math.max(1, Math.min(credit, 8)) // 至少1個時段，最多8個時段
  
  // 隨機選擇星期
  const dayIndex = Math.floor(random() * DAYS.length)
  const selectedDay = DAYS[dayIndex]
  
  // 隨機選擇起始時間段 (確保有足夠的連續時段空間)
  const maxStartTime = TIME_SLOTS.length - timeSlotCount
  const startTimeIndex = Math.floor(random() * (maxStartTime + 1))
  
  // 生成連續時段
  const timeSlots: string[] = []
  for (let i = 0; i < timeSlotCount; i++) {
    timeSlots.push(TIME_SLOTS[startTimeIndex + i])
  }
  
  const result: any = { ...course }
  
  // 根據時段數量設置對應的 day/st 字段
  if (timeSlots.length >= 1) {
    result.day1 = selectedDay
    result.st1 = timeSlots[0]
  }
  if (timeSlots.length >= 2) {
    result.day2 = selectedDay
    result.st2 = timeSlots[1]
  }
  if (timeSlots.length >= 3) {
    result.day3 = selectedDay
    result.st3 = timeSlots[2]
  }
  if (timeSlots.length >= 4) {
    result.day4 = selectedDay
    result.st4 = timeSlots[3]
  }
  if (timeSlots.length >= 5) {
    result.day5 = selectedDay
    result.st5 = timeSlots[4]
  }
  if (timeSlots.length >= 6) {
    result.day6 = selectedDay
    result.st6 = timeSlots[5]
  }
  if (timeSlots.length >= 7) {
    result.day7 = selectedDay
    result.st7 = timeSlots[6]
  }
  if (timeSlots.length >= 8) {
    result.day8 = selectedDay
    result.st8 = timeSlots[7]
  }
  
  return result
}

/**
 * 字符串哈希函數
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 轉換為32位整數
  }
  return Math.abs(hash)
}

/**
 * 種子隨機數生成器
 */
function seededRandom(seed: number): () => number {
  let currentSeed = seed
  return function() {
    currentSeed = (currentSeed * 9301 + 49297) % 233280
    return currentSeed / 233280
  }
}

/**
 * 獲取時間段的顯示信息
 */
export function getTimeDisplay(dayCode: string, timeCode: string): string {
  const dayNames: Record<string, string> = {
    '1': '星期一',
    '2': '星期二', 
    '3': '星期三',
    '4': '星期四',
    '5': '星期五'
  }
  
  const timeSlots: Record<string, string> = {
    '1': '08:10-09:00',
    '2': '09:10-10:00',
    '3': '10:20-11:10',
    '4': '11:20-12:10',
    '5': '12:20-13:10',
    '6': '13:20-14:10',
    '7': '14:20-15:10',
    '8': '15:30-16:20'
  }
  
  const dayName = dayNames[dayCode] || `星期${dayCode}`
  const timeStr = timeSlots[timeCode] || `時段${timeCode}`
  
  return `${dayName} ${timeStr}`
}

/**
 * 生成課程的完整時間字符串
 */
export function generateTimeString(course: any): string {
  const times: string[] = []
  
  if (course.day1 && course.st1) {
    times.push(getTimeDisplay(course.day1, course.st1))
  }
  if (course.day2 && course.st2) {
    times.push(getTimeDisplay(course.day2, course.st2))
  }
  if (course.day3 && course.st3) {
    times.push(getTimeDisplay(course.day3, course.st3))
  }
  if (course.day4 && course.st4) {
    times.push(getTimeDisplay(course.day4, course.st4))
  }
  if (course.day5 && course.st5) {
    times.push(getTimeDisplay(course.day5, course.st5))
  }
  if (course.day6 && course.st6) {
    times.push(getTimeDisplay(course.day6, course.st6))
  }
  if (course.day7 && course.st7) {
    times.push(getTimeDisplay(course.day7, course.st7))
  }
  if (course.day8 && course.st8) {
    times.push(getTimeDisplay(course.day8, course.st8))
  }
  
  return times.join(', ')
}
