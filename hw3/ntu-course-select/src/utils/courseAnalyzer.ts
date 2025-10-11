// 台大課程數據分析工具
// 用於分析課程數據並生成分類建議

export interface CourseAnalysis {
  totalCourses: number
  categorizedCourses: number
  uncategorizedCourses: number
  categoryStats: Record<string, {
    count: number
    percentage: number
    sampleCourses: string[]
  }>
  prefixStats: Record<string, {
    count: number
    sampleCourses: string[]
  }>
  suggestions: string[]
}

// 分析課程數據
export function analyzeCourses(courses: any[]): CourseAnalysis {
  const totalCourses = courses.length
  let categorizedCourses = 0
  const categoryStats: Record<string, any> = {}
  const prefixStats: Record<string, any> = {}
  const suggestions: string[] = []
  
  // 分析每個課程
  for (const course of courses) {
    const { cou_code, cou_cname } = course
    const prefix = cou_code.substring(0, 3)
    
    // 統計課號前綴
    if (!prefixStats[prefix]) {
      prefixStats[prefix] = {
        count: 0,
        sampleCourses: []
      }
    }
    prefixStats[prefix].count++
    if (prefixStats[prefix].sampleCourses.length < 3) {
      prefixStats[prefix].sampleCourses.push(cou_cname)
    }
    
    // 簡單分類邏輯（可以後續改進）
    let category = 'uncategorized'
    if (cou_cname.includes('國文領域') || cou_cname.includes('外文領域') || cou_cname.includes('英文領域')) {
      category = 'common-required'
    } else if (cou_cname.includes('專題研究') || cou_cname.includes('專題討論')) {
      category = 'research'
    } else if (cou_cname.includes('服務學習')) {
      category = 'service-learning'
    } else if (cou_cname.includes('體育') || cou_cname.includes('運動')) {
      category = 'physical-education'
    } else if (cou_cname.includes('數學') || cou_cname.includes('微積分')) {
      category = 'mathematics'
    } else if (cou_cname.includes('物理')) {
      category = 'physics'
    } else if (cou_cname.includes('化學')) {
      category = 'chemistry'
    } else if (cou_cname.includes('生物')) {
      category = 'biology'
    } else if (cou_cname.includes('經濟')) {
      category = 'economics'
    } else if (cou_cname.includes('心理')) {
      category = 'psychology'
    }
    
    if (category !== 'uncategorized') {
      categorizedCourses++
    }
    
    // 統計分類
    if (!categoryStats[category]) {
      categoryStats[category] = {
        count: 0,
        percentage: 0,
        sampleCourses: []
      }
    }
    categoryStats[category].count++
    if (categoryStats[category].sampleCourses.length < 3) {
      categoryStats[category].sampleCourses.push(cou_cname)
    }
  }
  
  // 計算百分比
  for (const category in categoryStats) {
    categoryStats[category].percentage = (categoryStats[category].count / totalCourses * 100).toFixed(1)
  }
  
  // 生成建議
  const uncategorizedCount = categoryStats['uncategorized']?.count || 0
  if (uncategorizedCount > 0) {
    suggestions.push(`有 ${uncategorizedCount} 門課程未分類，建議改進分類規則`)
  }
  
  // 分析前綴分布
  const topPrefixes = Object.entries(prefixStats)
    .sort(([,a], [,b]) => (b as any).count - (a as any).count)
    .slice(0, 10)
  
  suggestions.push(`主要課號前綴: ${topPrefixes.map(([prefix, data]) => `${prefix}(${(data as any).count})`).join(', ')}`)
  
  return {
    totalCourses,
    categorizedCourses,
    uncategorizedCourses: uncategorizedCount,
    categoryStats,
    prefixStats,
    suggestions
  }
}

// 生成分類規則建議
export function generateClassificationSuggestions(courses: any[]): string[] {
  const suggestions: string[] = []
  const prefixMap: Record<string, string[]> = {}
  
  // 分析課號前綴與課程名稱的對應關係
  for (const course of courses) {
    const { cou_code, cou_cname } = course
    const prefix = cou_code.substring(0, 3)
    
    if (!prefixMap[prefix]) {
      prefixMap[prefix] = []
    }
    prefixMap[prefix].push(cou_cname)
  }
  
  // 為每個前綴生成建議
  for (const [prefix, courseNames] of Object.entries(prefixMap)) {
    if (courseNames.length > 10) { // 只分析有足夠樣本的前綴
      const commonWords = findCommonWords(courseNames)
      if (commonWords.length > 0) {
        suggestions.push(`前綴 ${prefix}: 建議分類為 "${commonWords[0]}" (${courseNames.length} 門課程)`)
      }
    }
  }
  
  return suggestions
}

// 找出課程名稱中的共同詞彙
function findCommonWords(courseNames: string[]): string[] {
  const wordCount: Record<string, number> = {}
  
  for (const name of courseNames) {
    const words = name.split(/[\s\-\(\)]/).filter(word => word.length > 1)
    for (const word of words) {
      wordCount[word] = (wordCount[word] || 0) + 1
    }
  }
  
  // 找出出現頻率高的詞彙
  const commonWords = Object.entries(wordCount)
    .filter(([, count]) => count >= courseNames.length * 0.3) // 至少30%的課程包含此詞
    .sort(([,a], [,b]) => b - a)
    .map(([word]) => word)
  
  return commonWords
}
