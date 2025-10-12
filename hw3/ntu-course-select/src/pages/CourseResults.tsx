import { useState, useEffect, useMemo } from 'react'
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
} from '@mui/material'
import { Search, Favorite, FavoriteBorder } from '@mui/icons-material'
import { useCourseContext } from '../context/CourseContext'
import CourseInfoMenu from '../components/CourseInfoMenu'
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
  const [searchKeyword, setSearchKeyword] = useState(keyword)
  const [currentPage, setCurrentPage] = useState(1)
  const coursesPerPage = 50
  const [courseInfoMenuOpen, setCourseInfoMenuOpen] = useState(false)
  const [noResultsDialogOpen, setNoResultsDialogOpen] = useState(false)

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        console.log('開始載入所有課程數據...')
        
        const response = await fetch('/data/hw3-ntucourse-data-1002.csv')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const csvText = await response.text()
        console.log('CSV 載入成功，長度:', csvText.length)
        
        const lines = csvText.split('\n')
        const headers = lines[0].split(',')
        console.log('CSV 標題:', headers.slice(0, 10))
        
        const parsedCourses: FullCourse[] = []
        
        // 解析所有數據（100% 覆蓋率）
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i]
          if (!line.trim()) continue
          
          // 改善的 CSV 解析
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
            ser_no: values[0]?.trim() || `course-${i}-${Date.now()}`,
            cou_cname: values[12]?.trim() || '',
            cou_ename: values[13]?.trim() || '',
            tea_cname: values[16]?.trim() || '', // 修正：tea_cname 在第17欄（索引16）
            cou_code: values[5]?.trim() || '',
            credit: values[7]?.trim() || '',
            dpt_code: values[3]?.trim() || '',
            dpt_abbr: values[50]?.trim() || '', // 修正：dpt_abbr 在第51欄（索引50）
            co_tp: values[8]?.trim() || '',
            mark: values[9]?.trim() || '',
            co_rep: values[10]?.trim() || '',
            pre_course: values[11]?.trim() || '',
            // 模擬機率：使用常態分佈 (0-100%)
            probability: generateNormalDistribution() / 100, // 0-100% 常態分佈
            classroom: values[18]?.trim() || '' // clsrom_1(19)
          }

          // 為課程分配隨機的連續3節課
          const courseWithTime = assignRandomTimeSlots(baseCourse)
          
          const course: FullCourse = {
            ...courseWithTime,
            time: generateTimeString(courseWithTime)
          }
          
          // 只包含有課程名稱和教師的課程
          if (course.cou_cname && course.tea_cname) {
            parsedCourses.push(course)
          }
        }
        
        console.log('解析完成，課程數量:', parsedCourses.length)
        
        // 檢查前幾個課程的數據
        if (parsedCourses.length > 0) {
          console.log('前3個課程數據:', parsedCourses.slice(0, 3).map(course => ({
            ser_no: course.ser_no,
            cou_cname: course.cou_cname,
            tea_cname: course.tea_cname,
            cou_code: course.cou_code
          })))
        }
        
        // 檢查 ser_no 重複問題
        const serNoCounts = new Map<string, number>()
        parsedCourses.forEach(course => {
          const count = serNoCounts.get(course.ser_no) || 0
          serNoCounts.set(course.ser_no, count + 1)
        })
        
        const duplicates = Array.from(serNoCounts.entries()).filter(([_, count]) => count > 1)
        if (duplicates.length > 0) {
          console.warn('發現重複的 ser_no:', duplicates.slice(0, 5))
        }
        
        setCourses(parsedCourses)
        
      } catch (err) {
        console.error('載入課程數據失敗:', err)
        setError('載入課程數據失敗，請稍後再試')
      } finally {
        setIsLoading(false)
      }
    }

    loadCourses()
  }, [])

  const filteredCourses = useMemo(() => {
    let filtered = courses
    
    // 關鍵字搜尋
    if (searchKeyword.trim()) {
      const searchTerm = searchKeyword.toLowerCase()
      filtered = filtered.filter(course => 
        course.cou_cname.toLowerCase().includes(searchTerm) ||
        course.cou_ename.toLowerCase().includes(searchTerm) ||
        course.tea_cname.toLowerCase().includes(searchTerm) ||
        course.cou_code.toLowerCase().includes(searchTerm)
      )
    }

    // 學分數篩選
    const creditFilter = searchParams.get('credit')
    if (creditFilter) {
      filtered = filtered.filter(course => course.credit === creditFilter)
    }

    // 系所篩選
    const departmentFilter = searchParams.get('department')
    if (departmentFilter) {
      filtered = filtered.filter(course => course.dpt_abbr === departmentFilter)
    }

    // 課程類型篩選
    const typeFilter = searchParams.get('type')
    if (typeFilter) {
      filtered = filtered.filter(course => course.co_tp === typeFilter)
    }

    // 中籤率篩選
    const probabilityFilter = searchParams.get('probability')
    if (probabilityFilter) {
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
    }
    
    return filtered
  }, [courses, searchKeyword, searchParams])

  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * coursesPerPage
    const endIndex = startIndex + coursesPerPage
    return filteredCourses.slice(startIndex, endIndex)
  }, [filteredCourses, currentPage, coursesPerPage])

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage)

  const handleSearch = () => {
    setCurrentPage(1) // 重置到第一頁
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
  const getCourseUniqueId = (course: FullCourse, index: number) => {
    return `${course.ser_no}-${course.cou_code}-${course.tea_cname}-${index}`
  }

  const toggleFavorite = (course: FullCourse, index: number) => {
    const uniqueId = getCourseUniqueId(course, index)
    console.log('=== 點擊愛心 ===')
    console.log('課程信息:', {
      ser_no: course.ser_no,
      cou_cname: course.cou_cname,
      cou_code: course.cou_code,
      uniqueId: uniqueId
    })
    console.log('當前最愛 Set:', Array.from(favorites))
    console.log('是否已存在:', favorites.has(uniqueId))
    
    if (favorites.has(uniqueId)) {
      console.log('移除最愛:', uniqueId)
      removeFromFavorites(uniqueId)
    } else {
      console.log('加入最愛:', uniqueId)
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
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
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
                return `找到 ${filteredCourses.length} 門課程 (${filters.join(', ')})`
              } else {
                return `共 ${filteredCourses.length} 門課程可供選擇`
              }
            })()}
            {totalPages > 1 && ` - 第 ${currentPage} 頁，共 ${totalPages} 頁`}
          </Typography>
        </Box>

        {/* Course List */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
            paginatedCourses.map((course, index) => {
              const globalIndex = (currentPage - 1) * coursesPerPage + index
              return (
              <Card key={getCourseUniqueId(course, index)} elevation={1} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ color: '#424242', fontWeight: 600, mb: 1 }}>
                        {course.cou_cname}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#757575', mb: 1 }}>
                        {course.cou_ename}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#757575', mb: 1 }}>
                        教師: {course.tea_cname} | 課程代碼: {course.cou_code} | 學分: {course.credit}
                      </Typography>
                      
                      {/* 中籤率顯示 */}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          label={`中籤率: ${((course.probability || 0.5) * 100).toFixed(1)}%`}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{
                            fontSize: '0.75rem',
                            height: '24px',
                            backgroundColor: course.probability && course.probability > 0.7 ? '#e8f5e8' : 
                                           course.probability && course.probability > 0.4 ? '#fff3e0' : '#ffebee',
                            borderColor: course.probability && course.probability > 0.7 ? '#4caf50' : 
                                       course.probability && course.probability > 0.4 ? '#ff9800' : '#f44336',
                            color: course.probability && course.probability > 0.7 ? '#2e7d32' : 
                                   course.probability && course.probability > 0.4 ? '#f57c00' : '#d32f2f'
                          }}
                        />
                      </Box>
                    </Box>
                    
                    <IconButton
                      onClick={() => toggleFavorite(course, globalIndex)}
                      sx={{ 
                        color: favorites.has(getCourseUniqueId(course, globalIndex)) ? '#f44336' : '#757575',
                        '&:hover': {
                          backgroundColor: favorites.has(getCourseUniqueId(course, globalIndex)) ? '#ffebee' : '#f5f5f5'
                        }
                      }}
                    >
                      {favorites.has(getCourseUniqueId(course, globalIndex)) ? <Favorite /> : <FavoriteBorder />}
                    </IconButton>
                  </Box>
            </CardContent>
          </Card>
              )
            })
          )}
        </Box>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              sx={{ borderColor: '#1976d2', color: '#1976d2' }}
            >
              上一頁
            </Button>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
              {currentPage} / {totalPages}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              sx={{ borderColor: '#1976d2', color: '#1976d2' }}
            >
              下一頁
            </Button>
          </Box>
        )}
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