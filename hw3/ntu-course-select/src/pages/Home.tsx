import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Paper,
  Chip,
} from '@mui/material'
import { Search } from '@mui/icons-material'
import CourseInfoMenu from '../components/CourseInfoMenu'

export default function Home() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [courseInfoMenuOpen, setCourseInfoMenuOpen] = useState(false)

  const handleSearch = () => {
    const searchParams = new URLSearchParams()
    if (keyword.trim()) {
      searchParams.set('keyword', keyword.trim())
    }
    navigate(`/results?${searchParams.toString()}`)
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
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
            <Box sx={{ position: 'relative' }}>
              <Typography 
                variant="body1" 
                sx={{ color: '#1976d2', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                onClick={() => setCourseInfoMenuOpen(!courseInfoMenuOpen)}
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
              onClick={() => navigate('/schedule')}
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
        </Paper>

        {/* Main Title */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ color: '#424242', fontWeight: 600, mb: 1 }}>
            114學年度第一學期
          </Typography>
          <Typography variant="h5" sx={{ color: '#424242', fontWeight: 500 }}>
            選課流程
          </Typography>
        </Box>

        {/* Course Selection Timeline - 填滿整個區域的互動式卡片 */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
          gap: 4,
          minHeight: '400px',
          width: '100%'
        }}>
          {/* 初選一階 */}
          <Card 
            sx={{ 
              height: '100%', 
              border: '2px solid #e3f2fd',
              borderRadius: 3,
              transition: 'all 0.3s ease-in-out',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(25, 118, 210, 0.15)',
                borderColor: '#1976d2',
                backgroundColor: '#f8fbff'
              }
            }}
            onClick={() => navigate('/results')}
          >
            <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 700, mb: 3, textAlign: 'center' }}>
                  初選一階
                </Typography>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Chip
                    label="08.18 → 08.20"
                    size="medium"
                    sx={{
                      backgroundColor: '#e3f2fd',
                      color: '#1976d2',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      px: 2,
                      py: 1
                    }}
                  />
                </Box>
                <Box sx={{ '& > *': { mb: 2 } }}>
                  <Typography variant="body1" sx={{ color: '#424242', fontSize: '0.9rem', fontWeight: 500 }}>
                    開放一階預選: 8.1(五) → 8.17(日)
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#424242', fontSize: '0.9rem', fontWeight: 500 }}>
                    二階選課: 8.18(一) → 8.20(三)
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#424242', fontSize: '0.9rem', fontWeight: 500 }}>
                    公布一階結果: 8.22(五) 15:00
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 600 }}>
                  點擊開始選課 →
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* 初選二階 */}
          <Card 
            sx={{ 
              height: '100%', 
              border: '2px solid #e8f5e8',
              borderRadius: 3,
              transition: 'all 0.3s ease-in-out',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(46, 125, 50, 0.15)',
                borderColor: '#2e7d32',
                backgroundColor: '#f8fff8'
              }
            }}
            onClick={() => navigate('/results')}
          >
            <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h5" sx={{ color: '#2e7d32', fontWeight: 700, mb: 3, textAlign: 'center' }}>
                  初選二階
                </Typography>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Chip
                    label="08.25 → 08.26"
                    size="medium"
                    sx={{
                      backgroundColor: '#e8f5e8',
                      color: '#2e7d32',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      px: 2,
                      py: 1
                    }}
                  />
                </Box>
                <Box sx={{ '& > *': { mb: 2 } }}>
                  <Typography variant="body1" sx={{ color: '#424242', fontSize: '0.9rem', fontWeight: 500 }}>
                    開放一階預選: 8.22(五) → 8.24(日)
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#424242', fontSize: '0.9rem', fontWeight: 500 }}>
                    二階選課: 8.25(一) → 8.26(三)
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#424242', fontSize: '0.9rem', fontWeight: 500 }}>
                    公布二階結果: 8.28(五) 15:00
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                  點擊開始選課 →
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* 網路加退選 */}
          <Card 
            sx={{ 
              height: '100%', 
              border: '2px solid #fff3e0',
              borderRadius: 3,
              transition: 'all 0.3s ease-in-out',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(245, 124, 0, 0.15)',
                borderColor: '#f57c00',
                backgroundColor: '#fffbf5'
              }
            }}
            onClick={() => navigate('/results')}
          >
            <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h5" sx={{ color: '#f57c00', fontWeight: 700, mb: 3, textAlign: 'center' }}>
                  網路加退選
                </Typography>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Chip
                    label="09.01 → 09.15"
                    size="medium"
                    sx={{
                      backgroundColor: '#fff3e0',
                      color: '#f57c00',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      px: 2,
                      py: 1
                    }}
                  />
                </Box>
                <Box sx={{ '& > *': { mb: 2 } }}>
                  <Typography variant="body1" sx={{ color: '#424242', fontSize: '0.9rem', fontWeight: 500 }}>
                    第一週加退選: 9.1(一) → 9.7(日)
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#424242', fontSize: '0.9rem', fontWeight: 500 }}>
                    第二週加退選: 9.8(一) → 9.15(一)
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2" sx={{ color: '#f57c00', fontWeight: 600 }}>
                  點擊開始選課 →
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* 選課結果確認 */}
          <Card 
            sx={{ 
              height: '100%', 
              border: '2px solid #f3e5f5',
              borderRadius: 3,
              transition: 'all 0.3s ease-in-out',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(123, 31, 162, 0.15)',
                borderColor: '#7b1fa2',
                backgroundColor: '#fdf7ff'
              }
            }}
            onClick={() => navigate('/schedule')}
          >
            <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h5" sx={{ color: '#7b1fa2', fontWeight: 700, mb: 3, textAlign: 'center' }}>
                  選課結果確認
                </Typography>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Chip
                    label="09.17 → 09.19"
                    size="medium"
                    sx={{
                      backgroundColor: '#f3e5f5',
                      color: '#7b1fa2',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      px: 2,
                      py: 1
                    }}
                  />
                </Box>
                <Box sx={{ '& > *': { mb: 2 } }}>
                  <Typography variant="body1" sx={{ color: '#424242', fontSize: '0.9rem', fontWeight: 500 }}>
                    選課結果確認: 9.17(三) → 9.19(五)
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#424242', fontSize: '0.9rem', fontWeight: 500 }}>
                    停修: 9.17(三) → 12.5(五)
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2" sx={{ color: '#7b1fa2', fontWeight: 600 }}>
                  查看結果 →
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  )
}