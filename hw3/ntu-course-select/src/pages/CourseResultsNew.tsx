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
  IconButton,
  Divider
} from '@mui/material'
import { Search, Favorite, FavoriteBorder, ArrowBack } from '@mui/icons-material'
import { useCourseContext } from '../context/CourseContext'
import { COURSE_CATEGORIES, classifyCourse, getCoursesByCategory } from '../utils/courseClassifier'
import { analyzeCourses } from '../utils/courseAnalyzer'
import { classifyCourseWithNLP, classifyCoursesBatch, generateNLPImprovements } from '../utils/nlpClassifier'

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

export default function CourseResultsNew() {
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
    
    // NLP 智能篩選邏輯 - 使用自然語言處理
    selectedFilters.forEach(filterId => {
      const category = COURSE_CATEGORIES.find(cat => cat.id === filterId)
      if (category) {
        filtered = filtered.filter(course => {
          const nlpResult = classifyCourseWithNLP(course)
          return nlpResult.category === filterId && nlpResult.confidence > 0.5
        })
      }
    })
    
    return filtered.slice(0, 50) // 限制顯示前50個結果
  }, [courses, searchKeyword, selectedFilters])

  const handleSearch = () => {
    const searchParams = new URLSearchParams()
    if (searchKeyword.trim()) {
      searchParams.set('keyword', searchKeyword.trim())
    }
    if (selectedFilters.length > 0) {
      searchParams.set('filters', selectedFilters.join(','))
    }
    navigate(`/results?${searchParams.toString()}`, { replace: true })
  }

  // 即時搜尋功能 - 僅針對關鍵字搜尋
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const searchParams = new URLSearchParams()
      if (searchKeyword.trim()) {
        searchParams.set('keyword', searchKeyword.trim())
      }
      if (selectedFilters.length > 0) {
        searchParams.set('filters', selectedFilters.join(','))
      }
      navigate(`/results?${searchParams.toString()}`, { replace: true })
    }, 500) // 500ms 延遲

    return () => clearTimeout(timeoutId)
  }, [searchKeyword, navigate]) // 移除 selectedFilters 依賴

  const handleKeywordChange = (value: string) => {
    setSearchKeyword(value)
  }

  const handleFilterToggle = (filter: string) => {
    // 單選模式：如果點擊已選中的篩選，則取消；否則選擇新的篩選
    const newFilters = selectedFilters.includes(filter) 
      ? [] // 取消當前篩選
      : [filter] // 只選擇一個篩選
    
    console.log('🔄 Filter Toggle (Single Select):', {
      clicked: filter,
      oldFilters: selectedFilters,
      newFilters: newFilters,
      action: selectedFilters.includes(filter) ? 'CLEAR' : 'SELECT'
    })
    
    // 更新狀態
    setSelectedFilters(newFilters)
    
    // 立即更新 URL 參數
    const searchParams = new URLSearchParams()
    if (searchKeyword.trim()) {
      searchParams.set('keyword', searchKeyword.trim())
    }
    if (newFilters.length > 0) {
      searchParams.set('filters', newFilters.join(','))
    }
    navigate(`/results?${searchParams.toString()}`, { replace: true })
  }

  const clearFilters = () => {
    setSelectedFilters([])
    setSearchKeyword('')
    // 即時清除 URL 參數
    navigate('/results', { replace: true })
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
      {/* 標題列 - 按照圖片設計 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/')}
            sx={{ 
              minWidth: 'auto',
              borderColor: '#1976d2',
              color: '#1976d2',
              '&:hover': {
                borderColor: '#1565c0',
                backgroundColor: '#e3f2fd'
              }
            }}
          >
            返回
          </Button>
          <Typography variant="h4" sx={{ color: '#424242', fontWeight: 600 }}>
            課程搜尋結果
          </Typography>
        </Box>
        
        {/* 搜尋列 - 按照圖片設計 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="搜尋課程名稱、教師、課程代碼..."
            value={searchKeyword}
            onChange={(e) => handleKeywordChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            sx={{ 
              flex: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
          <Button
            variant="contained"
            startIcon={<Search />}
            onClick={handleSearch}
            sx={{ 
              minWidth: 'auto',
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0',
              }
            }}
          >
            搜尋
          </Button>
        </Box>
      </Box>

      {/* 分隔線 */}
      <Divider sx={{ mb: 3 }} />

      {/* 快速篩選 - 按照圖片設計 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#424242', fontWeight: 600 }}>
          快速篩選
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {COURSE_CATEGORIES.slice(0, 10).map((category) => (
            <Chip
              key={category.id}
              label={category.name}
              onClick={() => handleFilterToggle(category.id)}
              variant={selectedFilters.includes(category.id) ? 'filled' : 'outlined'}
              color={selectedFilters.includes(category.id) ? 'primary' : 'default'}
              sx={{ 
                cursor: 'pointer',
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: selectedFilters.includes(category.id) ? '#1976d2' : '#f5f5f5'
                }
              }}
            />
          ))}
        </Box>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={clearFilters}
          sx={{ 
            borderColor: '#1976d2',
            color: '#1976d2',
            '&:hover': {
              borderColor: '#1565c0',
              backgroundColor: '#e3f2fd'
            }
          }}
        >
          清除所有篩選
        </Button>
      </Box>

      {/* 智能分析調試信息 */}
      <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="body2" sx={{ color: '#666' }}>
          📊 總課程數: {courses.length} | 過濾後: {filteredCourses.length} | 搜尋: "{searchKeyword}" | 篩選: [{selectedFilters.join(', ')}]
        </Typography>
        {filteredCourses.length > 0 && (
          <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
            🔍 前3門課程: {filteredCourses.slice(0, 3).map(c => c.cou_cname).join(', ')}
          </Typography>
        )}
        {selectedFilters.length > 0 && (
          <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
            🧠 NLP 智能分類: {selectedFilters.map(id => {
              const category = COURSE_CATEGORIES.find(cat => cat.id === id)
              return category ? category.name : id
            }).join(', ')}
          </Typography>
        )}
        {filteredCourses.length > 0 && selectedFilters.length > 0 && (
          <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
            🔍 分類置信度: {filteredCourses.slice(0, 1).map(course => {
              const nlpResult = classifyCourseWithNLP(course)
              return `${(nlpResult.confidence * 100).toFixed(1)}%`
            }).join(', ')}
          </Typography>
        )}
      </Box>

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
          filteredCourses.map((course, index) => (
            <Card key={`${course.ser_no}-${course.cou_code}-${index}`} elevation={1} sx={{ borderRadius: 2 }}>
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
                      sx={{
                        backgroundColor: '#1976d2',
                        '&:hover': {
                          backgroundColor: '#1565c0',
                        }
                      }}
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
                    sx={{ borderRadius: 2 }}
                  />
                  <Chip 
                    label={course.dpt_abbr || course.dpt_code} 
                    size="small" 
                    color="secondary" 
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                  />
                  {course.limit > 0 && (
                    <Chip 
                      label={`限修 ${course.limit}`} 
                      size="small" 
                      color="default" 
                      variant="outlined"
                      sx={{ borderRadius: 2 }}
                    />
                  )}
                  {course.co_tp === '1' && (
                    <Chip 
                      label="必修" 
                      size="small" 
                      color="error" 
                      variant="outlined"
                      sx={{ borderRadius: 2 }}
                    />
                  )}
                  {course.pre_course && (
                    <Chip 
                      label="有先修" 
                      size="small" 
                      color="warning" 
                      variant="outlined"
                      sx={{ borderRadius: 2 }}
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
