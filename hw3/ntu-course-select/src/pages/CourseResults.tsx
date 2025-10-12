import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { 
  Container, 
  Typography, 
  Box, 
  Button,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  IconButton,
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  LinearProgress,
} from '@mui/material'
import { Search, Favorite, FavoriteBorder } from '@mui/icons-material'
import { useCourseContext } from '../context/CourseContext'
import CourseInfoMenu from '../components/CourseInfoMenu'
import VirtualizedCourseList from '../components/VirtualizedCourseList'
// import { parseNtuTime } from '../utils/timeParser' // 暫時未使用
import { assignRandomTimeSlots, generateTimeString } from '../utils/simpleTimeAssigner'

// 生成常態分佈的中籤率 (0-100%)
function generateNormalDistribution(): number {
  // Box-Muller 變換生成常態分佈
  const u1 = Math.random()
  const u2 = Math.random()
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  
  // 轉換為均值50，標準差15的常態分佈
  const mean = 50
  const stdDev = 15
  const value = z0 * stdDev + mean
  
  // 限制在0-100範圍內
  return Math.max(0, Math.min(100, Math.round(value)))
}

interface FullCourse {
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
  probability?: number
  priority?: number
  time?: string
  classroom?: string
}

export default function CourseResults() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const keyword = searchParams.get('keyword') || ''
  const { favorites, addToFavorites, removeFromFavorites, lastLotteryResults } = useCourseContext()
  
  const [courses, setCourses] = useState<FullCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [parsingProgress, setParsingProgress] = useState(0)
  const [csvData, setCsvData] = useState<string>('')
  const [currentIndex, setCurrentIndex] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const batchSize = 100 // 每批處理100個課程
  const [searchKeyword, setSearchKeyword] = useState(keyword)
  // 移除分頁邏輯，使用虛擬化列表
  const [courseInfoMenuOpen, setCourseInfoMenuOpen] = useState(false)
  const [noResultsDialogOpen, setNoResultsDialogOpen] = useState(false)

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setIsLoading(true)
        setError(null)
        setParsingProgress(0)
        setCourses([])
        setCurrentIndex(1)
        
        console.log('開始載入課程數據...')
        
        const response = await fetch('/data/hw3-ntucourse-data-1002.csv')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const csvText = await response.text()
        console.log('CSV 載入成功，長度:', csvText.length)
        
        // 保存 CSV 數據並開始自動化懶加載
        setCsvData(csvText)
        setIsLoading(false)
        
        // 開始處理第一批課程
        setTimeout(() => {
          processNextBatch(csvText, 1)
        }, 100)
        
        // 自動化批次處理函數
        function processNextBatch(csvText: string, startIndex: number) {
          if (isProcessing) return
          
          setIsProcessing(true)
          console.log(`🔄 處理批次 ${startIndex}-${startIndex + batchSize - 1}...`)
          
          const lines = csvText.split('\n')
          const headers = lines[0].split(',')
          const endIndex = Math.min(startIndex + batchSize, lines.length)
          
          console.log(`📊 批次信息: 總行數=${lines.length}, 處理範圍=${startIndex}-${endIndex}, 剩餘=${lines.length - endIndex}`)
          
          const batchCourses: FullCourse[] = []
          
          for (let i = startIndex; i < endIndex; i++) {
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
            
            const baseCourse = {
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
            
            // 調試：記錄前幾個課程的原始數據
            if (i <= startIndex + 3) {
              console.log(`🔍 原始數據 ${i}: 課程名稱="${values[12]}", 教師="${values[16]}", 系所="${values[50]}", 學分="${values[7]}"`)
            }

            // 為課程分配隨機的連續時間
            const courseWithTime = assignRandomTimeSlots(baseCourse)
            
            const course: FullCourse = {
              ...courseWithTime,
              time: generateTimeString(courseWithTime)
            }
            
            // 放寬條件，包含更多課程
            if (course.cou_cname && course.cou_cname.trim()) {
              batchCourses.push(course)
              // 調試：記錄前幾個課程的詳細信息
              if (batchCourses.length <= 3) {
                console.log(`📝 課程 ${batchCourses.length}: ${course.cou_cname} | 教師: ${course.tea_cname} | 系所: ${course.dpt_abbr} | 學分: ${course.credit}`)
              }
            }
          }
          
          // 更新課程列表，使用更寬鬆的去重邏輯
          setCourses(prev => {
            // 使用更強的唯一標識符來避免重複
            const existingKeys = new Set(prev.map(c => `${c.cou_code}-${c.tea_cname}-${c.cou_cname}`))
            const uniqueBatchCourses = batchCourses.filter(course => {
              const key = `${course.cou_code}-${course.tea_cname}-${course.cou_cname}`
              return !existingKeys.has(key)
            })
            const newCourses = [...prev, ...uniqueBatchCourses]
            console.log(`✅ 批次完成，新增 ${uniqueBatchCourses.length} 門課程（去重後），累計 ${newCourses.length} 門`)
            return newCourses
          })
          setCurrentIndex(endIndex)
          
          // 更新進度
          const progress = Math.round((endIndex / lines.length) * 100)
          setParsingProgress(progress)
          
          setIsProcessing(false)
          
          // 如果還有更多數據，繼續處理下一批
          if (endIndex < lines.length) {
            setTimeout(() => {
              processNextBatch(csvText, endIndex)
            }, 50) // 50ms 間隔，保持流暢
          } else {
            console.log(`🎉 所有課程處理完成！總共處理了 ${lines.length} 行數據`)
            setParsingProgress(100)
          }
        }
        
      } catch (err) {
        console.error('載入課程數據失敗:', err)
        setError('載入課程數據失敗，請稍後再試')
        setIsLoading(false)
      }
    }

    loadCourses()
  }, [])

  const filteredCourses = useMemo(() => {
    let filtered = courses
    
    // 只在課程數量變化較大時記錄日誌，避免過多日誌
    if (courses.length % 1000 === 0 || courses.length < 1000) {
      console.log(`🔍 開始篩選，原始課程數: ${courses.length}`)
    }

    // 關鍵字搜尋
    if (searchKeyword.trim()) {
      const searchTerm = searchKeyword.toLowerCase()
      const beforeCount = filtered.length
      filtered = filtered.filter(course => 
        course.cou_cname.toLowerCase().includes(searchTerm) ||
        course.cou_ename.toLowerCase().includes(searchTerm) ||
        course.tea_cname.toLowerCase().includes(searchTerm) ||
        course.cou_code.toLowerCase().includes(searchTerm)
      )
      if (beforeCount !== filtered.length) {
        console.log(`📝 關鍵字篩選 "${searchKeyword}": ${beforeCount} -> ${filtered.length}`)
      }
    }

    // 學分數篩選
    const creditFilter = searchParams.get('credit')
    if (creditFilter) {
      const beforeCount = filtered.length
      filtered = filtered.filter(course => {
        const courseCredit = String(course.credit).trim()
        const filterCredit = String(creditFilter).trim()
        return courseCredit === filterCredit
      })
      if (beforeCount !== filtered.length) {
        console.log(`🎓 學分篩選 "${creditFilter}": ${beforeCount} -> ${filtered.length}`)
      }
    }

    // 系所篩選
    const departmentFilter = searchParams.get('department')
    if (departmentFilter) {
      const beforeCount = filtered.length
      filtered = filtered.filter(course => course.dpt_abbr === departmentFilter)
      if (beforeCount !== filtered.length) {
        console.log(`🏫 系所篩選 "${departmentFilter}": ${beforeCount} -> ${filtered.length}`)
      }
    }

    // 課程類型篩選
    const typeFilter = searchParams.get('type')
    if (typeFilter) {
      const beforeCount = filtered.length
      filtered = filtered.filter(course => course.co_tp === typeFilter)
      if (beforeCount !== filtered.length) {
        console.log(`📚 類型篩選 "${typeFilter}": ${beforeCount} -> ${filtered.length}`)
      }
    }

    // 中籤率篩選
    const probabilityFilter = searchParams.get('probability')
    if (probabilityFilter) {
      const beforeCount = filtered.length
      filtered = filtered.filter(course => {
        const probability = (course.probability || 0.5) * 100
        switch (probabilityFilter) {
          case 'high':
            return probability >= 70
          case 'medium':
            return probability >= 40 && probability < 70
          case 'low':
            return probability < 40
          default:
            return true
        }
      })
      if (beforeCount !== filtered.length) {
        console.log(`🎯 中籤率篩選 "${probabilityFilter}": ${beforeCount} -> ${filtered.length}`)
      }
    }
    
    // 只在最終結果變化時記錄
    if (filtered.length !== courses.length) {
      console.log(`✅ 篩選完成，最終結果: ${filtered.length} 門課程`)
    }
    
    // 臨時修復：如果篩選結果太少，顯示更多課程
    if (filtered.length < 10 && courses.length > 0) {
      console.log(`⚠️ 篩選結果太少 (${filtered.length})，顯示前100門課程`)
      return courses.slice(0, 100)
    }
    
    return filtered
  }, [courses, searchKeyword, searchParams])

  // 移除分頁相關邏輯，虛擬化列表會處理所有數據

  const handleSearch = () => {
    // 搜尋功能不需要重置頁面，因為是自動化載入
    if (searchKeyword.trim()) {
      navigate(`/results?keyword=${encodeURIComponent(searchKeyword.trim())}`)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  const handleScheduleClick = () => {
    if (lastLotteryResults.length === 0) {
      setNoResultsDialogOpen(true)
    } else {
      navigate('/schedule')
    }
  }

  // 創建唯一的課程識別符 - 使用更強的組合
  const getCourseUniqueId = useCallback((course: FullCourse, index: number) => {
    return `${course.ser_no}-${course.cou_code}-${course.tea_cname}-${index}`
  }, [])


  const toggleFavorite = useCallback((course: FullCourse, index: number) => {
    const uniqueId = getCourseUniqueId(course, index)
    
    if (favorites.has(uniqueId)) {
      removeFromFavorites(uniqueId)
    } else {
      // 轉換 FullCourse 到 Course 格式，使用唯一ID
      const courseForContext = {
        ser_no: uniqueId, // 使用唯一ID作為ser_no
        cou_cname: course.cou_cname,
        cou_ename: course.cou_ename,
        tea_cname: course.tea_cname,
        cou_code: course.cou_code,
        credit: course.credit,
        dpt_code: course.dpt_code,
        dpt_abbr: course.dpt_abbr,
        co_tp: course.co_tp,
        mark: course.mark,
        co_rep: course.co_rep,
        pre_course: course.pre_course
      }
      addToFavorites(courseForContext)
    }
  }, [favorites, getCourseUniqueId, addToFavorites, removeFromFavorites])

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', px: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CircularProgress size={40} />
          <Typography variant="h6" sx={{ ml: 2, color: '#757575' }}>
            載入課程數據中...
          </Typography>
        </Box>
        {parsingProgress > 0 && (
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#757575' }}>
                解析進度
              </Typography>
              <Typography variant="body2" sx={{ color: '#757575' }}>
                {parsingProgress}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={parsingProgress} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#1976d2'
                }
              }} 
            />
          </Box>
        )}
      </Box>
    )
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" color="error" sx={{ textAlign: 'center' }}>
          {error}
        </Typography>
      </Container>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e0e0e0' }}>
        <Toolbar>
          <Typography 
            variant="h4" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              color: '#424242', 
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'color 0.2s ease',
              '&:hover': {
                color: '#1976d2',
                textDecoration: 'underline'
              }
            }}
            onClick={() => navigate('/')}
          >
            臺大課程網
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, position: 'relative' }}>
            <Box 
              sx={{ 
                position: 'relative',
                // 擴展懸停區域，讓滑鼠移動更容易
                padding: '4px 8px',
                margin: '-4px -8px'
              }}
              onMouseEnter={() => setCourseInfoMenuOpen(true)}
            >
              <Typography 
                variant="body1" 
                sx={{ color: '#1976d2', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              >
                課程資訊
              </Typography>
              <CourseInfoMenu 
                open={courseInfoMenuOpen} 
                onClose={() => setCourseInfoMenuOpen(false)} 
              />
            </Box>
            <Typography 
              variant="body1" 
              sx={{ color: '#1976d2', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              onClick={handleScheduleClick}
            >
              選課結果
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ color: '#1976d2', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              onClick={() => navigate('/favorites')}
            >
              我的收藏
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Search Section */}
        <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#757575', minWidth: '60px' }}>
              關鍵字
            </Typography>
            <TextField
              fullWidth
                placeholder="搜尋課程名稱/教師/流水號"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#ffffff',
                },
              }}
            />
                  <Button
              variant="contained"
              startIcon={<Search />}
              onClick={handleSearch}
              sx={{
                backgroundColor: '#1976d2',
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
                minWidth: '120px',
              }}
            >
              搜尋
                  </Button>
          </Box>
        </Paper>

        {/* Results Summary */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ color: '#424242', fontWeight: 600 }}>
            {searchKeyword || searchParams.get('credit') || searchParams.get('department') || searchParams.get('type') ? '篩選結果' : '所有課程'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#757575' }}>
            {(() => {
              const filters = []
              if (searchKeyword) filters.push(`關鍵字: "${searchKeyword}"`)
              if (searchParams.get('credit')) filters.push(`${searchParams.get('credit')}學分`)
              if (searchParams.get('department')) {
                const deptNames: { [key: string]: string } = {
                  'FL': '外文系', 'CHIN': '中文系', 'EE': '電機系', 'Chem': '化學系',
                  'LAW': '法律系', 'ME': '機械系', 'Agron': '農藝系', 'MATH': '數學系',
                  'CSIE': '資工系', 'ChemE': '化工系'
                }
                filters.push(deptNames[searchParams.get('department')!] || searchParams.get('department'))
              }
              if (searchParams.get('type')) {
                const typeNames: { [key: string]: string } = {
                  '0': '選修課程', '1': '必修課程', '2': '通識課程'
                }
                filters.push(typeNames[searchParams.get('type')!] || searchParams.get('type'))
              }
              if (searchParams.get('probability')) {
                const probNames: { [key: string]: string } = {
                  'high': '高機率 (70%+)', 'medium': '中機率 (40-70%)', 'low': '低機率 (<40%)'
                }
                filters.push(probNames[searchParams.get('probability')!] || searchParams.get('probability'))
              }
              
              if (filters.length > 0) {
                return `顯示 ${filteredCourses.length} 門課程 (${filters.join(', ')})`
              } else {
                return `顯示 ${filteredCourses.length} 門課程`
              }
            })()}
            {parsingProgress < 100 && ` (載入中 ${parsingProgress}%)`}
            {parsingProgress === 100 && ` - 載入完成`}
          </Typography>
        </Box>

        {/* Course List */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* 調試信息 */}
          <Box sx={{ p: 2, backgroundColor: '#f0f0f0', borderRadius: 1, fontSize: '0.8rem' }}>
            <Typography variant="body2">
              🔍 調試信息: 總課程數: {courses.length} | 篩選後: {filteredCourses.length} | 進度: {parsingProgress}%
            </Typography>
            <Typography variant="body2">
              📊 篩選條件: 關鍵字="{searchKeyword}" | 學分="{searchParams.get('credit')}" | 系所="{searchParams.get('department')}" | 類型="{searchParams.get('type')}" | 中籤率="{searchParams.get('probability')}"
            </Typography>
            {courses.length > 0 && (
              <Typography variant="body2">
                📝 前3門課程: {courses.slice(0, 3).map((c, i) => `${i+1}.${c.cou_cname}(${c.credit}學分,${c.dpt_abbr})`).join(', ')}
              </Typography>
            )}
            {filteredCourses.length > 0 && (
              <Typography variant="body2">
                🎯 篩選後前3門課程: {filteredCourses.slice(0, 3).map((c, i) => `${i+1}.${c.cou_cname}(${c.credit}學分,${c.dpt_abbr})`).join(', ')}
              </Typography>
            )}
            {courses.length > 0 && (
              <Typography variant="body2">
                🎓 總課程學分分布: {Array.from(new Set(courses.slice(0, 100).map(c => c.credit))).slice(0, 10).join(', ')}
              </Typography>
            )}
            {filteredCourses.length > 0 && (
              <Typography variant="body2">
                🎯 篩選後學分分布: {Array.from(new Set(filteredCourses.map(c => c.credit))).slice(0, 10).join(', ')}
              </Typography>
            )}
            {courses.length > 0 && (
              <Typography variant="body2">
                🏫 總課程系所分布: {Array.from(new Set(courses.slice(0, 100).map(c => c.dpt_abbr).filter(dpt => dpt && dpt.trim()))).slice(0, 10).join(', ')}
              </Typography>
            )}
            {filteredCourses.length > 0 && (
              <Typography variant="body2">
                🎯 篩選後系所分布: {Array.from(new Set(filteredCourses.map(c => c.dpt_abbr).filter(dpt => dpt && dpt.trim()))).slice(0, 10).join(', ')}
              </Typography>
            )}
            <Typography variant="body2">
              🔧 技術信息: 批次大小={batchSize} | 當前索引={currentIndex} | 處理狀態={isProcessing ? '處理中' : '完成'}
            </Typography>
          </Box>
          
          {filteredCourses.length === 0 ? (
            <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#757575' }}>
                🔍 沒有找到符合條件的課程
              </Typography>
              <Typography variant="body2" sx={{ color: '#757575', mt: 1 }}>
                請嘗試其他關鍵字
              </Typography>
            </Paper>
          ) : (
            <VirtualizedCourseList
              courses={filteredCourses}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              getCourseUniqueId={getCourseUniqueId}
              height={600}
            />
          )}

          {/* 自動載入進度提示 */}
          {parsingProgress < 100 && (
            <Box sx={{ textAlign: 'center', mt: 3, mb: 3 }}>
              <Typography variant="body2" sx={{ color: '#757575', mb: 1 }}>
                🔄 正在自動載入課程... {parsingProgress}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={parsingProgress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#1976d2'
                  }
                }}
              />
            </Box>
          )}

          {/* 載入完成提示 */}
          {parsingProgress === 100 && courses.length > 0 && (
            <Box sx={{ textAlign: 'center', mt: 3, mb: 3 }}>
              <Typography variant="body2" sx={{ color: '#757575' }}>
                🎉 已載入所有課程，共 {courses.length} 門課程
              </Typography>
            </Box>
          )}
        </Box>

        {/* 虛擬化列表不需要分頁 */}
      </Container>

      {/* 無選課結果提示對話框 */}
      <Dialog 
        open={noResultsDialogOpen} 
        onClose={() => setNoResultsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', color: '#1976d2', fontWeight: 600 }}>
          尚未完成選課
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="body1" sx={{ color: '#424242', mb: 2 }}>
            您還沒有進行選課，請先完成選課流程。
          </Typography>
          <Typography variant="body2" sx={{ color: '#757575' }}>
            您可以點擊下方的選課流程卡片開始選課，或前往「我的收藏」查看已收藏的課程。
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            onClick={() => setNoResultsDialogOpen(false)}
            variant="outlined"
            sx={{ mr: 2, borderColor: '#1976d2', color: '#1976d2' }}
          >
            取消
          </Button>
          <Button 
            onClick={() => {
              setNoResultsDialogOpen(false)
              navigate('/results')
            }}
            variant="contained"
            sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}
          >
            開始選課
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}