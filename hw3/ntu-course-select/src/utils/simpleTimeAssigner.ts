/**
 * 簡單時間分配器 - 為每門課程隨機分配連續3節課
 */

// 星期編碼 (1-5 對應星期一到星期五)
const DAYS = ['1', '2', '3', '4', '5']

// 時間段編碼 (1-8 對應第1-8節課，但只使用1-6節課以確保有連續3節課)
const TIME_SLOTS = ['1', '2', '3', '4', '5', '6']

/**
 * 為課程分配隨機的連續3節課
 */
export function assignRandomTimeSlots(course: any): any {
  // 使用課程代碼作為種子，確保同一門課程總是得到相同的時間
  const seed = hashString(course.cou_code || course.ser_no)
  const random = seededRandom(seed)
  
  // 隨機選擇星期
  const dayIndex = Math.floor(random() * DAYS.length)
  const selectedDay = DAYS[dayIndex]
  
  // 隨機選擇起始時間段 (確保有連續3節課的空間)
  const maxStartTime = TIME_SLOTS.length - 3 // 最多只能從第4節課開始
  const startTimeIndex = Math.floor(random() * (maxStartTime + 1))
  const startTime = TIME_SLOTS[startTimeIndex]
  
  // 生成連續3節課
  const timeSlots = [
    TIME_SLOTS[startTimeIndex],
    TIME_SLOTS[startTimeIndex + 1],
    TIME_SLOTS[startTimeIndex + 2]
  ]
  
  return {
    ...course,
    day1: selectedDay,
    st1: timeSlots[0],
    day2: selectedDay,
    st2: timeSlots[1],
    day3: selectedDay,
    st3: timeSlots[2]
  }
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
  
  return times.join(', ')
}
