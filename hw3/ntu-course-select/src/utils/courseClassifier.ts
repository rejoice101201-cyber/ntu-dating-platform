// 台大課程智能分類系統
// 基於課號前綴和課程名稱的智能分類

export interface CourseCategory {
  id: string
  name: string
  description: string
  prefixes: string[]
  keywords: string[]
  color: string
}

// 台大課程分類規則 - 基於實際數據分析
export const COURSE_CATEGORIES: CourseCategory[] = [
  {
    id: 'common-required',
    name: '共同必修',
    description: '國文、外文、英文領域等共同必修課程',
    prefixes: ['000', '001', '002', '003'],
    keywords: ['國文領域', '外文領域', '英文領域', '共同必修', '國文', '英文'],
    color: '#1976d2'
  },
  {
    id: 'physical-education',
    name: '體育運動',
    description: '體育、運動相關課程',
    prefixes: ['901', '902', '903'],
    keywords: ['體育', '運動', '專項運動', '體能', 'Physical Education'],
    color: '#4caf50'
  },
  {
    id: 'mathematics',
    name: '數學',
    description: '數學、統計、微積分等數學相關課程',
    prefixes: ['101', '102', '103', '104', '105'],
    keywords: ['數學', '微積分', '統計', '線性代數', '離散數學', 'Mathematics', 'Calculus'],
    color: '#ff9800'
  },
  {
    id: 'physics',
    name: '物理',
    description: '物理學相關課程',
    prefixes: ['201', '202', '203', '204', '205'],
    keywords: ['物理', '力學', '電磁學', '量子力學', 'Physics'],
    color: '#9c27b0'
  },
  {
    id: 'chemistry',
    name: '化學',
    description: '化學相關課程',
    prefixes: ['301', '302', '303', '304', '305'],
    keywords: ['化學', '有機化學', '無機化學', '分析化學', 'Chemistry'],
    color: '#f44336'
  },
  {
    id: 'biology',
    name: '生物',
    description: '生物學相關課程',
    prefixes: ['401', '402', '403', '404', '405'],
    keywords: ['生物', '細胞生物學', '分子生物學', '生態學', 'Biology'],
    color: '#4caf50'
  },
  {
    id: 'computer-science',
    name: '資訊工程',
    description: '計算機科學、資訊工程相關課程',
    prefixes: ['601', '602', '603', '604', '605'],
    keywords: ['程式設計', '資料結構', '演算法', '計算機', '資訊', 'Computer Science', 'Programming'],
    color: '#2196f3'
  },
  {
    id: 'electrical-engineering',
    name: '電機工程',
    description: '電機工程相關課程',
    prefixes: ['521', '522', '523', '524', '525'],
    keywords: ['電機', '電子', '電路', '信號', 'Electrical Engineering'],
    color: '#ff5722'
  },
  {
    id: 'mechanical-engineering',
    name: '機械工程',
    description: '機械工程相關課程',
    prefixes: ['621', '622', '623', '624', '625'],
    keywords: ['機械', '力學', '材料', '製造', 'Mechanical Engineering'],
    color: '#795548'
  },
  {
    id: 'civil-engineering',
    name: '土木工程',
    description: '土木工程相關課程',
    prefixes: ['721', '722', '723', '724', '725'],
    keywords: ['土木', '結構', '建築', '工程', 'Civil Engineering'],
    color: '#607d8b'
  },
  {
    id: 'economics',
    name: '經濟學',
    description: '經濟學相關課程',
    prefixes: ['821', '822', '823', '824', '825'],
    keywords: ['經濟', '總體經濟', '個體經濟', 'Economics'],
    color: '#ffc107'
  },
  {
    id: 'psychology',
    name: '心理學',
    description: '心理學相關課程',
    prefixes: ['921', '922', '923', '924', '925'],
    keywords: ['心理', '認知', '社會心理', 'Psychology'],
    color: '#e91e63'
  },
  {
    id: 'research',
    name: '專題研究',
    description: '專題研究、論文相關課程',
    prefixes: ['A01', 'A02', 'A03', 'A04', 'A05'],
    keywords: ['專題研究', '專題討論', '碩士論文', '博士論文', '研究'],
    color: '#673ab7'
  },
  {
    id: 'service-learning',
    name: '服務學習',
    description: '服務學習相關課程',
    prefixes: ['B01', 'B02', 'B03', 'B04', 'B05'],
    keywords: ['服務學習', '社會服務', '實習'],
    color: '#009688'
  }
]

// 智能課程分類函數
export function classifyCourse(course: {
  cou_code: string
  cou_cname: string
  cou_ename: string
  dpt_code?: string
}): CourseCategory | null {
  const { cou_code, cou_cname, cou_ename } = course
  
  // 1. 首先根據課號前綴分類
  const prefix = cou_code.substring(0, 3)
  
  for (const category of COURSE_CATEGORIES) {
    if (category.prefixes.includes(prefix)) {
      return category
    }
  }
  
  // 2. 如果前綴不匹配，根據課程名稱關鍵字分類
  const courseText = `${cou_cname} ${cou_ename}`.toLowerCase()
  
  for (const category of COURSE_CATEGORIES) {
    for (const keyword of category.keywords) {
      if (courseText.includes(keyword.toLowerCase())) {
        return category
      }
    }
  }
  
  // 3. 如果都不匹配，返回 null（未分類）
  return null
}

// 獲取所有課程的分類統計
export function getCategoryStats(courses: any[]): Record<string, number> {
  const stats: Record<string, number> = {}
  
  for (const course of courses) {
    const category = classifyCourse(course)
    if (category) {
      stats[category.id] = (stats[category.id] || 0) + 1
    } else {
      stats['uncategorized'] = (stats['uncategorized'] || 0) + 1
    }
  }
  
  return stats
}

// 根據分類獲取課程
export function getCoursesByCategory(courses: any[], categoryId: string): any[] {
  return courses.filter(course => {
    const category = classifyCourse(course)
    return category?.id === categoryId
  })
}

// 獲取課程分類建議（用於調試）
export function getClassificationSuggestion(course: any): {
  category: CourseCategory | null
  confidence: number
  reasons: string[]
} {
  const { cou_code, cou_cname, cou_ename } = course
  const reasons: string[] = []
  let confidence = 0
  
  // 檢查課號前綴
  const prefix = cou_code.substring(0, 3)
  for (const category of COURSE_CATEGORIES) {
    if (category.prefixes.includes(prefix)) {
      reasons.push(`課號前綴 ${prefix} 匹配 ${category.name}`)
      confidence += 0.8
      return { category, confidence, reasons }
    }
  }
  
  // 檢查關鍵字
  const courseText = `${cou_cname} ${cou_ename}`.toLowerCase()
  for (const category of COURSE_CATEGORIES) {
    for (const keyword of category.keywords) {
      if (courseText.includes(keyword.toLowerCase())) {
        reasons.push(`課程名稱包含關鍵字 "${keyword}"`)
        confidence += 0.6
        return { category, confidence, reasons }
      }
    }
  }
  
  return { category: null, confidence: 0, reasons: ['無法分類'] }
}
