import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material'
import { Search, Favorite, FavoriteBorder, ArrowBack } from '@mui/icons-material'
import { useCourseContext } from '../context/CourseContext'

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
}

export default function CourseList() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { addToFavorites, removeFromFavorites, favorites } = useCourseContext()
  
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')

  useEffect(() => {
    const keyword = searchParams.get('keyword') || ''
    setSearchKeyword(keyword)
    loadCourses(keyword)
  }, [searchParams])

  const loadCourses = async (keyword: string) => {
    try {
      setLoading(true)
      const response = await fetch('/data/hw3-ntucourse-data-1002.csv')
      const csvText = await response.text()
      
      const lines = csvText.split('\n')
      const courseData: Course[] = []
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        
        const values = parseCSVLine(line)
        if (values.length >= 50) {
          const course: Course = {
            ser_no: values[0] || `auto-${i}`,
            cou_cname: values[12] || '',
            cou_ename: values[13] || '',
            tea_cname: values[15] || '',
            cou_code: values[5] || '',
            credit: values[7] || '',
            dpt_code: values[3] || '',
            dpt_abbr: values[49] || '',
            co_tp: values[8] || '',
            mark: values[9] || '',
            co_rep: values[10] || '',
            pre_course: values[11] || ''
          }
          
          if (course.cou_cname && course.tea_cname) {
            courseData.push(course)
          }
        }
      }
      
      setCourses(courseData)
    } catch (error) {
      console.error('載入課程數據失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result
  }

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
      navigate(`/courses?keyword=${encodeURIComponent(searchKeyword.trim())}`)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  const toggleFavorite = (course: Course) => {
    if (favorites.has(course.ser_no)) {
      removeFromFavorites(course.ser_no)
    } else {
      addToFavorites(course)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* 頂部導航欄 */}
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            課程搜尋結果
          </Typography>
          <IconButton
            color="inherit"
            onClick={() => navigate('/favorites')}
            sx={{ mr: 1 }}
          >
            <Favorite />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* 搜尋區域 */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="搜尋課程名稱、教師姓名或課程代碼..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            <Button
              variant="contained"
              size="large"
              onClick={handleSearch}
              startIcon={<Search />}
              sx={{
                minWidth: 120,
                height: 56,
                borderRadius: 2,
                fontWeight: 600
              }}
            >
              搜尋
            </Button>
          </Box>
        </Paper>

        {/* 搜尋結果統計 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ color: '#424242', fontWeight: 600 }}>
            搜尋結果
          </Typography>
          <Typography variant="body2" sx={{ color: '#757575' }}>
            找到 {filteredCourses.length} 門課程
            {searchKeyword && ` (關鍵字: "${searchKeyword}")`}
          </Typography>
        </Box>

        {/* 課程列表 */}
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
              <Card key={`${course.ser_no}-${index}`} elevation={1} sx={{ borderRadius: 2 }}>
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
                      onClick={() => toggleFavorite(course)}
                      sx={{ 
                        color: favorites.has(course.ser_no) ? '#f44336' : '#757575',
                        '&:hover': {
                          backgroundColor: favorites.has(course.ser_no) ? '#ffebee' : '#f5f5f5'
                        }
                      }}
                    >
                      {favorites.has(course.ser_no) ? <Favorite /> : <FavoriteBorder />}
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
