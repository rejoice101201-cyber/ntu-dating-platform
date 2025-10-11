import { useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Chip,
  Paper,
  IconButton,
} from '@mui/material'
import { Search, Favorite, FavoriteBorder, ArrowBack } from '@mui/icons-material'
import useCourseData from '../hooks/useCourseData'
import { useCourseContext } from '../context/CourseContext'
import CourseDataDebug from '../components/CourseDataDebug'

const DAYS = ['', '一', '二', '三', '四', '五', '六', '日']
const PERIODS = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14']

function formatTimeSlots(timeSlots?: Array<{day: number, start: number, classroom?: string}>): string {
  if (!timeSlots || timeSlots.length === 0) return '—'
  return timeSlots.map(ts => `${DAYS[ts.day]}${PERIODS[ts.start]}${ts.classroom ? `@${ts.classroom}` : ''}`).join(', ')
}

export default function CourseResults() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { courses, isLoading, error } = useCourseData()
  const { favorites, toggleFavorite, addToSelected } = useCourseContext()
  
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '')
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  const filteredCourses = useMemo(() => {
    let filtered = courses

    // 關鍵字搜尋
    if (keyword) {
      const kw = keyword.toLowerCase()
      filtered = filtered.filter(c =>
        c.cou_cname.toLowerCase().includes(kw) ||
        c.cou_ename.toLowerCase().includes(kw) ||
        c.cou_code.toLowerCase().includes(kw) ||
        c.tea_cname.toLowerCase().includes(kw) ||
        c.tea_ename.toLowerCase().includes(kw) ||
        c.ser_no.toLowerCase().includes(kw)
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

    return filtered.slice(0, 20) // 限制顯示數量
  }, [courses, keyword, selectedCategory])


  const handleSearch = () => {
    if (keyword.trim()) {
      navigate(`/results?keyword=${encodeURIComponent(keyword.trim())}`)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  const handleBack = () => {
    navigate('/')
  }

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(selectedCategory === category ? '' : category)
  }

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
        <AppBar position="static" elevation={0} sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e0e0e0' }}>
          <Toolbar>
            <IconButton onClick={handleBack} sx={{ mr: 2 }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" component="div" sx={{ flexGrow: 1, color: '#424242', fontWeight: 600 }}>
              臺大課程網
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <Typography variant="h6" sx={{ color: '#757575' }}>載入課程中...</Typography>
          </Box>
        </Container>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
        <AppBar position="static" elevation={0} sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e0e0e0' }}>
          <Toolbar>
            <IconButton onClick={handleBack} sx={{ mr: 2 }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" component="div" sx={{ flexGrow: 1, color: '#424242', fontWeight: 600 }}>
              臺大課程網
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <Typography variant="h6" sx={{ color: '#d32f2f' }}>載入課程失敗: {error}</Typography>
          </Box>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <CourseDataDebug />
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e0e0e0' }}>
        <Toolbar>
          <IconButton onClick={handleBack} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="div" sx={{ flexGrow: 1, color: '#424242', fontWeight: 600 }}>
            臺大課程網
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Typography variant="body1" sx={{ color: '#1976d2', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
              課程資訊
            </Typography>
            <Typography variant="body1" sx={{ color: '#1976d2', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
              選課結果
            </Typography>
            <Typography variant="body1" sx={{ color: '#1976d2', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
              推薦課程
            </Typography>
            <Typography variant="body1" sx={{ color: '#1976d2', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
              我的收藏
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Search Section */}
        <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid #e0e0e0' }}>
          {/* Filter Categories */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
            <Chip 
              label="系所" 
              variant={selectedCategory === '系所' ? 'filled' : 'outlined'} 
              size="small" 
              onClick={() => handleCategoryFilter('系所')}
              sx={{ 
                backgroundColor: selectedCategory === '系所' ? '#e3f2fd' : 'transparent',
                color: selectedCategory === '系所' ? '#1976d2' : '#757575',
                cursor: 'pointer'
              }}
            />
            <Chip 
              label="通識/溝通" 
              variant={selectedCategory === '通識' ? 'filled' : 'outlined'} 
              size="small" 
              onClick={() => handleCategoryFilter('通識')}
              sx={{ 
                backgroundColor: selectedCategory === '通識' ? '#e3f2fd' : 'transparent',
                color: selectedCategory === '通識' ? '#1976d2' : '#757575',
                cursor: 'pointer'
              }}
            />
            <Chip 
              label="共同/新生" 
              variant={selectedCategory === '共同' ? 'filled' : 'outlined'} 
              size="small" 
              onClick={() => handleCategoryFilter('共同')}
              sx={{ 
                backgroundColor: selectedCategory === '共同' ? '#e3f2fd' : 'transparent',
                color: selectedCategory === '共同' ? '#1976d2' : '#757575',
                cursor: 'pointer'
              }}
            />
            <Chip 
              label="體育/國防" 
              variant={selectedCategory === '體育' ? 'filled' : 'outlined'} 
              size="small" 
              onClick={() => handleCategoryFilter('體育')}
              sx={{ 
                backgroundColor: selectedCategory === '體育' ? '#e3f2fd' : 'transparent',
                color: selectedCategory === '體育' ? '#1976d2' : '#757575',
                cursor: 'pointer'
              }}
            />
            <Chip 
              label="學程" 
              variant={selectedCategory === '學程' ? 'filled' : 'outlined'} 
              size="small" 
              onClick={() => handleCategoryFilter('學程')}
              sx={{ 
                backgroundColor: selectedCategory === '學程' ? '#e3f2fd' : 'transparent',
                color: selectedCategory === '學程' ? '#1976d2' : '#757575',
                cursor: 'pointer'
              }}
            />
            <Chip 
              label="進階英語" 
              variant={selectedCategory === '英語' ? 'filled' : 'outlined'} 
              size="small" 
              onClick={() => handleCategoryFilter('英語')}
              sx={{ 
                backgroundColor: selectedCategory === '英語' ? '#e3f2fd' : 'transparent',
                color: selectedCategory === '英語' ? '#1976d2' : '#757575',
                cursor: 'pointer'
              }}
            />
          </Box>

          {/* Search Bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#757575', minWidth: '60px' }}>
              關鍵字
            </Typography>
            <TextField
              fullWidth
              placeholder="搜尋課程名稱/教師/流水號"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
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

          {/* Advanced Filters */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label="114-1" variant="filled" size="small" sx={{ backgroundColor: '#e3f2fd', color: '#1976d2' }} />
            <Chip label="上課時間" variant="outlined" size="small" />
            <Chip label="加選方式" variant="outlined" size="small" />
            <Chip label="其他限制" variant="outlined" size="small" />
            <Chip label="排除關鍵字" variant="outlined" size="small" />
            <Chip label="模糊搜尋" variant="outlined" size="small" />
            <Chip label="清除" variant="outlined" size="small" />
          </Box>
        </Paper>

        {/* Results Count */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ color: '#424242', fontWeight: 600 }}>
            搜尋結果: {filteredCourses.length} 門課程
          </Typography>
        </Box>

        {/* Course List */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredCourses.map(course => (
            <Card key={course.ser_no} sx={{ border: '1px solid #e0e0e0', '&:hover': { boxShadow: 2 } }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {/* Left Column - Course Info */}
                  <Box sx={{ flex: 2 }}>
                    {/* Course Title */}
                    <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600, mb: 1 }}>
                      {course.cou_cname || course.cou_ename}
                    </Typography>

                    {/* Instructor */}
                    <Typography variant="body2" sx={{ color: '#424242', mb: 1 }}>
                      教師: {course.tea_cname || course.tea_ename || '—'}
                    </Typography>

                    {/* Time and Location */}
                    <Typography variant="body2" sx={{ color: '#424242', mb: 1 }}>
                      時間: {formatTimeSlots(course.timeSlots)}
                    </Typography>

                    {/* Course Details */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                      <Typography variant="body2" sx={{ color: '#757575' }}>
                        流水號: {course.ser_no}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#757575' }}>
                        課號: {course.cou_code}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#757575' }}>
                        課程識別碼: {course.cou_code} {course.ser_no}
                      </Typography>
                    </Box>

                    {/* Requirements */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip label={`必帶`} size="small" sx={{ backgroundColor: '#ffebee', color: '#c62828' }} />
                      <Chip label={`${course.credit}學分`} size="small" variant="outlined" />
                      <Chip label={`${course.limit || 0}人`} size="small" variant="outlined" />
                    </Box>

                    {/* Restrictions */}
                    {course.co_rep && (
                      <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.875rem', mb: 1 }}>
                        限制: {course.co_rep}
                      </Typography>
                    )}

                    {/* Enrollment Status */}
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Typography variant="body2" sx={{ color: '#424242' }}>
                        已選上: {Math.floor((course.limit || 0) * 0.7)}/{course.limit || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#424242' }}>
                        外系已選上: 0/0
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#424242' }}>
                        剩餘名額: {Math.floor((course.limit || 0) * 0.3)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#424242' }}>
                        已登記: 0
                      </Typography>
                    </Box>
                  </Box>

                  {/* Right Column - Actions */}
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                    {/* Favorite Button */}
                    <IconButton
                      onClick={() => toggleFavorite(course.ser_no)}
                      sx={{ color: favorites.has(course.ser_no) ? '#d32f2f' : '#757575' }}
                    >
                      {favorites.has(course.ser_no) ? <Favorite /> : <FavoriteBorder />}
                    </IconButton>

                    {/* Add Button */}
                    <Button
                      variant="contained"
                      onClick={() => addToSelected(course.ser_no)}
                      sx={{
                        backgroundColor: '#1976d2',
                        '&:hover': {
                          backgroundColor: '#1565c0',
                        },
                        minWidth: '100px',
                      }}
                    >
                      加入
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* No Results */}
        {filteredCourses.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" sx={{ color: '#757575', mb: 2 }}>
              沒有找到相關課程
            </Typography>
            <Typography variant="body2" sx={{ color: '#757575' }}>
              請嘗試其他關鍵字或調整搜尋條件
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  )
}