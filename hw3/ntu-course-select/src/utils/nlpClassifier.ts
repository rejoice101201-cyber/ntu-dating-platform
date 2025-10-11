// 基於自然語言處理的智能課程分類器
// 理解課程名稱的語義含義，進行智能分類

export interface CourseSemantic {
  category: string
  confidence: number
  reasoning: string[]
  keywords: string[]
}

// 課程語義分析規則
export const SEMANTIC_RULES = {
  // 共同必修課程
  'common-required': {
    patterns: [
      { keywords: ['國文領域', '外文領域', '英文領域'], weight: 1.0 },
      { keywords: ['國文', '英文', '外文'], weight: 0.8 },
      { keywords: ['共同必修', '通識必修'], weight: 0.9 },
      { keywords: ['基礎語文', '語言'], weight: 0.7 }
    ],
    exclusions: ['專題', '研究', '實習', '實驗']
  },
  
  // 數學相關
  'mathematics': {
    patterns: [
      { keywords: ['數學', '微積分', '線性代數'], weight: 1.0 },
      { keywords: ['統計', '機率', '離散數學'], weight: 0.9 },
      { keywords: ['數值分析', '數值方法'], weight: 0.8 },
      { keywords: ['幾何', '代數', '分析'], weight: 0.7 }
    ],
    exclusions: ['物理', '化學', '生物']
  },
  
  // 物理相關
  'physics': {
    patterns: [
      { keywords: ['物理', '力學', '電磁學'], weight: 1.0 },
      { keywords: ['量子力學', '熱力學', '光學'], weight: 0.9 },
      { keywords: ['相對論', '原子物理'], weight: 0.8 },
      { keywords: ['實驗物理', '物理實驗'], weight: 0.7 }
    ],
    exclusions: ['數學', '化學', '生物']
  },
  
  // 化學相關
  'chemistry': {
    patterns: [
      { keywords: ['化學', '有機化學', '無機化學'], weight: 1.0 },
      { keywords: ['分析化學', '物理化學'], weight: 0.9 },
      { keywords: ['生物化學', '材料化學'], weight: 0.8 },
      { keywords: ['化學實驗', '實驗化學'], weight: 0.7 }
    ],
    exclusions: ['物理', '數學', '生物']
  },
  
  // 生物相關
  'biology': {
    patterns: [
      { keywords: ['生物', '細胞生物學', '分子生物學'], weight: 1.0 },
      { keywords: ['生態學', '遺傳學', '演化'], weight: 0.9 },
      { keywords: ['生理學', '解剖學'], weight: 0.8 },
      { keywords: ['生物實驗', '實驗生物'], weight: 0.7 }
    ],
    exclusions: ['化學', '物理', '數學']
  },
  
  // 資訊工程
  'computer-science': {
    patterns: [
      { keywords: ['程式設計', '資料結構', '演算法'], weight: 1.0 },
      { keywords: ['計算機', '資訊', '軟體'], weight: 0.9 },
      { keywords: ['網路', '資料庫', '系統'], weight: 0.8 },
      { keywords: ['人工智慧', '機器學習'], weight: 0.8 }
    ],
    exclusions: ['數學', '物理', '化學']
  },
  
  // 電機工程
  'electrical-engineering': {
    patterns: [
      { keywords: ['電機', '電子', '電路'], weight: 1.0 },
      { keywords: ['信號', '通訊', '控制'], weight: 0.9 },
      { keywords: ['電力', '電磁', '半導體'], weight: 0.8 },
      { keywords: ['電機實驗', '電子實驗'], weight: 0.7 }
    ],
    exclusions: ['數學', '物理', '化學']
  },
  
  // 專題研究
  'research': {
    patterns: [
      { keywords: ['專題研究', '專題討論'], weight: 1.0 },
      { keywords: ['碩士論文', '博士論文'], weight: 0.9 },
      { keywords: ['研究', '論文'], weight: 0.6 },
      { keywords: ['seminar', 'thesis'], weight: 0.8 }
    ],
    exclusions: ['實驗', '實習', '服務']
  },
  
  // 服務學習
  'service-learning': {
    patterns: [
      { keywords: ['服務學習', '社會服務'], weight: 1.0 },
      { keywords: ['實習', '實務'], weight: 0.7 },
      { keywords: ['服務', '學習'], weight: 0.5 }
    ],
    exclusions: ['研究', '論文', '實驗']
  },
  
  // 體育運動
  'physical-education': {
    patterns: [
      { keywords: ['體育', '運動', '體能'], weight: 1.0 },
      { keywords: ['專項運動', '體育課'], weight: 0.9 },
      { keywords: ['健身', '訓練'], weight: 0.7 }
    ],
    exclusions: ['研究', '論文', '實驗']
  }
}

// 文本預處理函數
function preprocessText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '') // 移除標點符號
    .replace(/\s+/g, ' ') // 標準化空格
    .trim()
}

// 計算文本相似度
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = preprocessText(text1).split(' ')
  const words2 = preprocessText(text2).split(' ')
  
  const set1 = new Set(words1)
  const set2 = new Set(words2)
  
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])
  
  return intersection.size / union.size
}

// 檢查排除條件
function checkExclusions(text: string, exclusions: string[]): boolean {
  const processedText = preprocessText(text)
  return exclusions.some(exclusion => 
    processedText.includes(preprocessText(exclusion))
  )
}

// 智能課程分類主函數
export function classifyCourseWithNLP(course: {
  cou_cname: string
  cou_ename: string
  cou_code: string
  dpt_code?: string
}): CourseSemantic {
  const { cou_cname, cou_ename, cou_code } = course
  const fullText = `${cou_cname} ${cou_ename}`.toLowerCase()
  
  let bestMatch = {
    category: 'uncategorized',
    confidence: 0,
    reasoning: [] as string[],
    keywords: [] as string[]
  }
  
  // 分析每個分類規則
  for (const [categoryId, rules] of Object.entries(SEMANTIC_RULES)) {
    let categoryScore = 0
    const matchedKeywords: string[] = []
    const reasoning: string[] = []
    
    // 檢查排除條件
    if (checkExclusions(fullText, rules.exclusions)) {
      continue
    }
    
    // 計算模式匹配分數
    for (const pattern of rules.patterns) {
      for (const keyword of pattern.keywords) {
        const similarity = calculateSimilarity(fullText, keyword)
        if (similarity > 0.3) { // 相似度閾值
          const score = similarity * pattern.weight
          categoryScore += score
          matchedKeywords.push(keyword)
          reasoning.push(`匹配關鍵字 "${keyword}" (相似度: ${(similarity * 100).toFixed(1)}%)`)
        }
      }
    }
    
    // 課號前綴加分
    const prefix = cou_code.substring(0, 3)
    const prefixBonus = getPrefixBonus(categoryId, prefix)
    if (prefixBonus > 0) {
      categoryScore += prefixBonus
      reasoning.push(`課號前綴 ${prefix} 匹配 (加分: ${prefixBonus})`)
    }
    
    // 更新最佳匹配
    if (categoryScore > bestMatch.confidence) {
      bestMatch = {
        category: categoryId,
        confidence: Math.min(categoryScore, 1.0), // 限制在 0-1 範圍
        reasoning,
        keywords: matchedKeywords
      }
    }
  }
  
  return bestMatch
}

// 課號前綴加分規則
function getPrefixBonus(categoryId: string, prefix: string): number {
  const prefixRules: Record<string, string[]> = {
    'common-required': ['000', '001', '002', '003'],
    'mathematics': ['101', '102', '103', '104', '105'],
    'physics': ['201', '202', '203', '204', '205'],
    'chemistry': ['301', '302', '303', '304', '305'],
    'biology': ['401', '402', '403', '404', '405'],
    'computer-science': ['601', '602', '603', '604', '605'],
    'electrical-engineering': ['521', '522', '523', '524', '525'],
    'research': ['A01', 'A02', 'A03', 'A04', 'A05'],
    'service-learning': ['B01', 'B02', 'B03', 'B04', 'B05'],
    'physical-education': ['901', '902', '903']
  }
  
  return prefixRules[categoryId]?.includes(prefix) ? 0.3 : 0
}

// 批量分類課程
export function classifyCoursesBatch(courses: any[]): {
  classified: any[]
  uncategorized: any[]
  statistics: Record<string, number>
} {
  const classified: any[] = []
  const uncategorized: any[] = []
  const statistics: Record<string, number> = {}
  
  for (const course of courses) {
    const result = classifyCourseWithNLP(course)
    
    if (result.confidence > 0.5) { // 置信度閾值
      classified.push({
        ...course,
        classification: result
      })
      statistics[result.category] = (statistics[result.category] || 0) + 1
    } else {
      uncategorized.push({
        ...course,
        classification: result
      })
      statistics['uncategorized'] = (statistics['uncategorized'] || 0) + 1
    }
  }
  
  return { classified, uncategorized, statistics }
}

// 生成分類改進建議
export function generateNLPImprovements(courses: any[]): string[] {
  const suggestions: string[] = []
  const { uncategorized, statistics } = classifyCoursesBatch(courses)
  
  // 分析未分類課程
  if (uncategorized.length > 0) {
    suggestions.push(`有 ${uncategorized.length} 門課程未分類，建議改進分類規則`)
    
    // 分析未分類課程的共同特徵
    const commonWords = findCommonWordsInUncategorized(uncategorized)
    if (commonWords.length > 0) {
      suggestions.push(`未分類課程常見詞彙: ${commonWords.slice(0, 5).join(', ')}`)
    }
  }
  
  // 分析分類統計
  const totalClassified = Object.values(statistics).reduce((sum, count) => sum + count, 0)
  const accuracy = ((totalClassified - (statistics['uncategorized'] || 0)) / totalClassified * 100).toFixed(1)
  suggestions.push(`分類準確率: ${accuracy}%`)
  
  return suggestions
}

// 找出未分類課程的共同詞彙
function findCommonWordsInUncategorized(uncategorized: any[]): string[] {
  const wordCount: Record<string, number> = {}
  
  for (const course of uncategorized) {
    const text = `${course.cou_cname} ${course.cou_ename}`.toLowerCase()
    const words = text.split(/[\s\-\(\)]/).filter(word => word.length > 1)
    
    for (const word of words) {
      wordCount[word] = (wordCount[word] || 0) + 1
    }
  }
  
  return Object.entries(wordCount)
    .filter(([, count]) => count >= uncategorized.length * 0.2) // 至少20%的課程包含此詞
    .sort(([,a], [,b]) => b - a)
    .map(([word]) => word)
}
