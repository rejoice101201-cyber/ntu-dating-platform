import React, { useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { 
  Container, 
  Typography, 
  Box, 
  Button,
  Paper,
  TextField,
  Card,
  CardContent,
  Chip,
  IconButton
} from '@mui/material'
import { Search, Favorite, FavoriteBorder, ArrowBack } from '@mui/icons-material'
import { useCourseDataSimple } from '../hooks/useCourseDataSimple'
import { useCourseContext } from '../context/CourseContext'

const DAYS = ['', '一', '二', '三', '四', '五', '六', '日']

export default function CourseResultsSimple() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { courses, isLoading, error } = useCourseDataSimple()
  const { favorites, toggleFavorite, addToSelected } = useCourseContext()
  
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '')
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  // 簡單的過濾邏輯
  const filteredCourses = useMemo(() => {
    let filtered = courses
    
    // 關鍵字過濾
    if (keyword.trim()) {
      const searchTerm = keyword.toLowerCase()
      filtered = filtered.filter(c => 
        c.cou_cname.toLowerCase().includes(searchTerm) ||
        c.cou_ename.toLowerCase().includes(searchTerm) ||
        c.tea_cname.toLowerCase().includes(searchTerm) ||
        c.cou_code.toLowerCase().includes(searchTerm)
      )
    }
    
    // 類別過濾
    if (selectedCategory) {
      filtered = filtered.filter(c => {
        switch (selectedCategory) {
          case '系所':
            return c.dpt_code && c.dpt_code.length > 0
          case '通識':
            return c.cou_cname.includes('通識') || c.cou_ename.toLowerCase().includes('general')
          case '共同':
            return c.cou_cname.includes('共同') || c.cou_cname.includes('國文') || c.cou_cname.includes('英文')
          case '體育':
            return c.cou_cname.includes('體育') || c.cou_ename.toLowerCase().includes('physical')
          case '學程':
            return c.cou_cname.includes('學程') || c.cou_ename.toLowerCase().includes('program')
          case '英語':
            return c.cou_cname.includes('英語') || c.cou_ename.toLowerCase().includes('english')
          default:
            return true
        }
      })
    }
    
    return filtered.slice(0, 10) // 只顯示前10個結果
  }, [courses, keyword, selectedCategory])

  const handleSearch = () => {
    navigate(`/results?keyword=${encodeURIComponent(keyword)}`)
  }

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(selectedCategory === category ? '' : category)
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: '#757575' }}>
            🔄 載入課程中...
          </Typography>
          <Typography variant="body2" sx={{ color: '#757575', mt: 1 }}>
            正在載入課程資料，請稍候...
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
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="搜尋課程名稱、教師、課程代碼..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
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

      {/* 類別過濾 */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#424242' }}>
          快速過濾
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {['系所', '通識', '共同', '體育', '學程', '英語'].map((category) => (
            <Chip
              key={category}
              label={category}
              onClick={() => handleCategoryFilter(category)}
              variant={selectedCategory === category ? 'filled' : 'outlined'}
              color={selectedCategory === category ? 'primary' : 'default'}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
      </Paper>

      {/* 調試信息 */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, backgroundColor: '#e3f2fd' }}>
        <Typography variant="body2" sx={{ color: '#1976d2' }}>
          📊 調試信息: 總課程數 {courses.length} | 當前關鍵字 "{keyword}" | 選中類別 "{selectedCategory}" | 過濾後 {filteredCourses.length} 門課程
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
              請嘗試其他關鍵字或類別
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
                      教師: {course.tea_cname} | 課程代碼: {course.cou_code} | 學分: {course.credit}
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
                    label={`中簽率 ${course.selectionProbability}%`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                  <Chip 
                    label={`限修 ${course.limit}`} 
                    size="small" 
                    color="secondary" 
                    variant="outlined"
                  />
                  {course.dpt_code && (
                    <Chip 
                      label={course.dpt_code} 
                      size="small" 
                      color="default" 
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
