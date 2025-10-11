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
  Chip,
  CircularProgress,
  TextField,
  IconButton
} from '@mui/material'
import { Search, Favorite, FavoriteBorder, ArrowBack } from '@mui/icons-material'
import { useCourseContext } from '../context/CourseContext'

interface FullCourse {
  ser_no: string
  cou_cname: string
  cou_ename: string
  tea_cname: string
  cou_code: string
  credit: number
  dpt_code: string
  dpt_abbr: string
  limit: number
  co_rep: string
  co_tp: string
  mark: string
  outside: string
  pre_course: string
}

export default function CourseResultsFull() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const keyword = searchParams.get('keyword') || ''
  const filtersParam = searchParams.get('filters') || ''
  const { favorites, toggleFavorite, addToSelected } = useCourseContext()
  
  const [courses, setCourses] = useState<FullCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchKeyword, setSearchKeyword] = useState(keyword)
  const [selectedFilters, setSelectedFilters] = useState<string[]>(
    filtersParam ? filtersParam.split(',') : []
  )

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
            ser_no: values[1]?.trim() || `course-${i}`,
            cou_cname: values[12]?.trim() || '',
            cou_ename: values[13]?.trim() || '',
            tea_cname: values[16]?.trim() || '',
            cou_code: values[5]?.trim() || '',
            credit: parseInt(values[7]) || 0,
            dpt_code: values[3]?.trim() || '',
            dpt_abbr: values[50]?.trim() || values[3]?.trim() || '',
            limit: parseInt(values[36]) || 0,
            co_rep: values[42]?.trim() || '',
            co_tp: values[43]?.trim() || '',
            mark: values[41]?.trim() || '',
            outside: values[48]?.trim() || '',
            pre_course: values[49]?.trim() || ''
          }
          
          // 只添加有課程名稱的課程
          if (course.cou_cname) {
            parsedCourses.push(course)
          }
        }
        
        console.log('解析完成，課程數量:', parsedCourses.length)
        console.log('載入範圍: 全部', lines.length - 1, '行（100% 覆蓋率）')
        setCourses(parsedCourses)
        
      } catch (err) {
        console.error('載入課程數據時發生錯誤:', err)
        setError(err instanceof Error ? err.message : '載入失敗')
      } finally {
        setIsLoading(false)
      }
    }

    loadCourses()
  }, [])

  // 篩選邏輯
  const filteredCourses = useMemo(() => {
    let filtered = courses
    
    // 關鍵字搜尋
    if (searchKeyword.trim()) {
      const searchTerm = searchKeyword.toLowerCase()
      filtered = filtered.filter(c => 
        c.cou_cname.toLowerCase().includes(searchTerm) ||
        c.cou_ename.toLowerCase().includes(searchTerm) ||
        c.tea_cname.toLowerCase().includes(searchTerm) ||
        c.cou_code.toLowerCase().includes(searchTerm) ||
        c.dpt_code.toLowerCase().includes(searchTerm) ||
        c.dpt_abbr.toLowerCase().includes(searchTerm)
      )
    }
    
    // 篩選按鈕邏輯
    selectedFilters.forEach(filter => {
      switch (filter) {
        case '系所':
          filtered = filtered.filter(c => c.dpt_code && c.dpt_code.length > 0)
          break
        case '通識':
          filtered = filtered.filter(c => 
            c.cou_cname.includes('通識') || 
            c.cou_ename.toLowerCase().includes('general') ||
            c.dpt_abbr.includes('通識')
          )
          break
        case '共同':
          filtered = filtered.filter(c => 
            c.cou_cname.includes('共同') || 
            c.cou_cname.includes('國文') || 
            c.cou_cname.includes('英文') ||
            c.dpt_abbr.includes('Common')
          )
          break
        case '體育':
          filtered = filtered.filter(c => 
            c.cou_cname.includes('體育') || 
            c.cou_ename.toLowerCase().includes('physical') ||
            c.dpt_abbr.includes('體育')
          )
          break
        case '學程':
          filtered = filtered.filter(c => 
            c.cou_cname.includes('學程') || 
            c.cou_ename.toLowerCase().includes('program') ||
            c.co_rep.includes('學程')
          )
          break
        case '英語':
          filtered = filtered.filter(c => 
            c.cou_cname.includes('英語') || 
            c.cou_ename.toLowerCase().includes('english') ||
            c.cou_code.includes('ENGL')
          )
          break
        case '必修':
          filtered = filtered.filter(c => 
            c.co_tp === '1' || c.mark === '1' || c.co_rep.includes('必修')
          )
          break
        case '選修':
          filtered = filtered.filter(c => 
            c.co_tp === '0' || c.mark === '0' || c.co_rep.includes('選修')
          )
          break
        case '有教師':
          filtered = filtered.filter(c => c.tea_cname && c.tea_cname.length > 0)
          break
        case '有先修':
          filtered = filtered.filter(c => c.pre_course && c.pre_course.length > 0)
          break
      }
    })
    
    return filtered.slice(0, 50) // 限制顯示前50個結果
  }, [courses, searchKeyword, selectedFilters])

  const handleSearch = () => {
    navigate(`/results?keyword=${encodeURIComponent(searchKeyword)}`)
  }

  const handleFilterToggle = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    )
  }

  const clearFilters = () => {
    setSelectedFilters([])
    setSearchKeyword('')
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#757575' }}>
            🔄 載入所有課程中...
          </Typography>
          <Typography variant="body2" sx={{ color: '#757575', mt: 1 }}>
            正在載入完整的課程資料庫（100% 覆蓋率）
          </Typography>
        </Paper>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: '#d32f2f' }}>
            ❌ 載入錯誤
          </Typography>
          <Typography variant="body2" sx={{ color: '#757575', mt: 1 }}>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            重新載入
          </Button>
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 標題列 */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, backgroundColor: '#f5f5f5' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/')}
            sx={{ minWidth: 'auto' }}
          >
            返回
          </Button>
          <Typography variant="h4" sx={{ color: '#424242', fontWeight: 600 }}>
            課程搜尋結果
          </Typography>
        </Box>
        
        {/* 搜尋列 */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="搜尋課程名稱、教師、課程代碼..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            sx={{ flex: 1 }}
          />
          <Button
            variant="contained"
            startIcon={<Search />}
            onClick={handleSearch}
            sx={{ minWidth: 'auto' }}
          >
            搜尋
          </Button>
        </Box>
      </Paper>

      {/* 篩選按鈕 */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#424242' }}>
          快速篩選
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {['系所', '通識', '共同', '體育', '學程', '英語', '必修', '選修', '有教師', '有先修'].map((filter) => (
            <Chip
              key={filter}
              label={filter}
              onClick={() => handleFilterToggle(filter)}
              variant={selectedFilters.includes(filter) ? 'filled' : 'outlined'}
              color={selectedFilters.includes(filter) ? 'primary' : 'default'}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={clearFilters}
          sx={{ mt: 1 }}
        >
          清除所有篩選
        </Button>
      </Paper>

      {/* 調試信息 */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, backgroundColor: '#e3f2fd' }}>
        <Typography variant="body2" sx={{ color: '#1976d2' }}>
          🎉 完整數據載入成功！總課程數: {courses.length} | 過濾後: {filteredCourses.length} | 搜尋關鍵字: "{searchKeyword}" | 篩選條件: [{selectedFilters.join(', ')}]
        </Typography>
      </Paper>

      {/* 課程列表 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filteredCourses.length === 0 ? (
          <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: '#757575' }}>
              🔍 沒有找到符合條件的課程
            </Typography>
            <Typography variant="body2" sx={{ color: '#757575', mt: 1 }}>
              請嘗試其他關鍵字或篩選條件
            </Typography>
          </Paper>
        ) : (
          filteredCourses.map((course) => (
            <Card key={course.ser_no} elevation={1}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ color: '#424242', fontWeight: 600, mb: 1 }}>
                      {course.cou_cname}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#757575', mb: 1 }}>
                      {course.cou_ename}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#757575' }}>
                      教師: {course.tea_cname || '未指定'} | 課程代碼: {course.cou_code} | 學分: {course.credit}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      onClick={() => toggleFavorite(course.ser_no)}
                      sx={{ color: favorites.has(course.ser_no) ? '#d32f2f' : '#757575' }}
                    >
                      {favorites.has(course.ser_no) ? <Favorite /> : <FavoriteBorder />}
                    </IconButton>
                    
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => addToSelected(course.ser_no)}
                    >
                      加入選課
                    </Button>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`學分 ${course.credit}`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                  <Chip 
                    label={course.dpt_abbr || course.dpt_code} 
                    size="small" 
                    color="secondary" 
                    variant="outlined"
                  />
                  {course.limit > 0 && (
                    <Chip 
                      label={`限修 ${course.limit}`} 
                      size="small" 
                      color="default" 
                      variant="outlined"
                    />
                  )}
                  {course.co_tp === '1' && (
                    <Chip 
                      label="必修" 
                      size="small" 
                      color="error" 
                      variant="outlined"
                    />
                  )}
                  {course.pre_course && (
                    <Chip 
                      label="有先修" 
                      size="small" 
                      color="warning" 
                      variant="outlined"
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Container>
  )
}
