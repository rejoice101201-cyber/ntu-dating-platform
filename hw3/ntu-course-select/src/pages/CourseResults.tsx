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
} from '@mui/material'
import { Search, Favorite, FavoriteBorder, ArrowBack } from '@mui/icons-material'
import { useCourseContext } from '../context/CourseContext'
import { parseNtuTime } from '../utils/timeParser'

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
  const { favorites, addToFavorites, removeFromFavorites } = useCourseContext()
  
  const [courses, setCourses] = useState<FullCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchKeyword, setSearchKeyword] = useState(keyword)

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
          
          const course: FullCourse = {
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
            // 模擬機率：根據課程類型設定不同機率
            probability: Math.random() * 0.8 + 0.1, // 10%-90% 隨機機率
            time: parseNtuTime(values[25]?.trim(), values[24]?.trim()), // day1(索引25) + st1(索引24)
            classroom: values[18]?.trim() || '' // clsrom_1(19)
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
    if (!searchKeyword.trim()) return courses.slice(0, 50)
    
    const searchTerm = searchKeyword.toLowerCase()
    return courses.filter(course => 
      course.cou_cname.toLowerCase().includes(searchTerm) ||
      course.cou_ename.toLowerCase().includes(searchTerm) ||
      course.tea_cname.toLowerCase().includes(searchTerm) ||
      course.cou_code.toLowerCase().includes(searchTerm)
    ).slice(0, 50)
  }, [courses, searchKeyword])

  const handleSearch = () => {
    if (searchKeyword.trim()) {
      navigate(`/results?keyword=${encodeURIComponent(searchKeyword.trim())}`)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch()
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
          <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="div" sx={{ flexGrow: 1, color: '#424242', fontWeight: 600 }}>
            臺大課程網
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Typography 
              variant="body1" 
              sx={{ color: '#1976d2', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              onClick={() => navigate('/results')}
            >
              課程資訊
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ color: '#1976d2', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              onClick={() => navigate('/results')}
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
            搜尋結果
          </Typography>
          <Typography variant="body2" sx={{ color: '#757575' }}>
            找到 {filteredCourses.length} 門課程
            {searchKeyword && ` (關鍵字: "${searchKeyword}")`}
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
            filteredCourses.map((course, index) => (
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
                      <Typography variant="body2" sx={{ color: '#757575' }}>
                        教師: {course.tea_cname} | 課程代碼: {course.cou_code} | 學分: {course.credit}
                      </Typography>
                    </Box>
                    
                    <IconButton
                      onClick={() => toggleFavorite(course, index)}
                      sx={{ 
                        color: favorites.has(getCourseUniqueId(course, index)) ? '#f44336' : '#757575',
                        '&:hover': {
                          backgroundColor: favorites.has(getCourseUniqueId(course, index)) ? '#ffebee' : '#f5f5f5'
                        }
                      }}
                    >
                      {favorites.has(getCourseUniqueId(course, index)) ? <Favorite /> : <FavoriteBorder />}
                    </IconButton>
                  </Box>
            </CardContent>
          </Card>
            ))
          )}
        </Box>
      </Container>
    </Box>
  )
}