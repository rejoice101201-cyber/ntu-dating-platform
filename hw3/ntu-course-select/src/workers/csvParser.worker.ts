// CSV 解析 Web Worker
import { assignRandomTimeSlots } from '../utils/simpleTimeAssigner'

// 生成常態分佈的中籤率 (0-100%)
function generateNormalDistribution(): number {
  const u1 = Math.random()
  const u2 = Math.random()
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  const mean = 50
  const stdDev = 15
  const value = z0 * stdDev + mean
  return Math.max(0, Math.min(100, Math.round(value)))
}

interface Course {
  ser_no: string
  cou_cname: string
  cou_ename: string
  tea_cname: string
  cou_code: string
  credit: string
  dpt_code: string
  dpt_abbr: string
  co_tp: string
  mark: string
  co_rep: string
  pre_course: string
  probability: number
  classroom: string
  day1?: string
  st1?: string
  day2?: string
  st2?: string
  day3?: string
  st3?: string
  day4?: string
  st4?: string
  day5?: string
  st5?: string
  day6?: string
  st6?: string
  day7?: string
  st7?: string
  day8?: string
  st8?: string
}

self.onmessage = function(e) {
  const { csvData, chunkSize = 1000 } = e.data
  
  try {
    const lines = csvData.split('\n')
    const headers = lines[0].split(',')
    const courses: Course[] = []
    
    // 分批處理，避免阻塞
    let processed = 0
    const totalLines = lines.length - 1
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      // 解析 CSV 行
      const values: string[] = []
      let current = ''
      let inQuotes = false
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      values.push(current.trim())
      
      if (values.length < headers.length) continue
      
      const baseCourse: Course = {
        ser_no: values[0]?.trim() || `course-${i}-${Math.random().toString(36).substr(2, 9)}`,
        cou_cname: values[12]?.trim() || '',
        cou_ename: values[13]?.trim() || '',
        tea_cname: values[16]?.trim() || '',
        cou_code: values[5]?.trim() || '',
        credit: values[7]?.trim() || '',
        dpt_code: values[3]?.trim() || '',
        dpt_abbr: values[50]?.trim() || '',
        co_tp: values[8]?.trim() || '',
        mark: values[9]?.trim() || '',
        co_rep: values[10]?.trim() || '',
        pre_course: values[11]?.trim() || '',
        probability: generateNormalDistribution() / 100,
        classroom: values[18]?.trim() || ''
      }
      
      // 為課程分配隨機的連續時間
      const courseWithTime = assignRandomTimeSlots(baseCourse)
      courses.push(courseWithTime)
      
      processed++
      
      // 每處理一定數量後發送進度更新
      if (processed % chunkSize === 0) {
        self.postMessage({
          type: 'progress',
          processed,
          total: totalLines,
          percentage: Math.round((processed / totalLines) * 100)
        })
      }
    }
    
    // 確保 ser_no 唯一性
    const serNoSet = new Set<string>()
    const finalCourses = courses.map((course) => {
      let uniqueSerNo = course.ser_no
      let counter = 1
      
      while (serNoSet.has(uniqueSerNo)) {
        uniqueSerNo = `${course.ser_no}-${counter}`
        counter++
      }
      
      serNoSet.add(uniqueSerNo)
      return { ...course, ser_no: uniqueSerNo }
    })
    
    // 發送完成結果
    self.postMessage({
      type: 'complete',
      courses: finalCourses,
      total: finalCourses.length
    })
    
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message
    })
  }
}
