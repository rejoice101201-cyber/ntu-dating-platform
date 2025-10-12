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

export default function Home() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')

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

        {/* Course Selection Timeline - 橫向四個框框 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
          {/* 初選一階 */}
          <Card sx={{ height: '100%', border: '1px solid #e0e0e0' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: '#424242', fontWeight: 600, mb: 2, textAlign: 'center' }}>
                初選一階
              </Typography>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Chip
                  label="08.18 → 08.20"
                  size="small"
                  sx={{
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    fontWeight: 600,
                  }}
                />
              </Box>
              <Box sx={{ '& > *': { mb: 1 } }}>
                <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.75rem' }}>
                  開放一階預選: 8.1(五) → 8.17(日)
                </Typography>
                <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.75rem' }}>
                  二階選課: 8.18(一) → 8.20(三)
                </Typography>
                <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.75rem' }}>
                  公布一階結果: 8.22(五) 15:00
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* 初選二階 */}
          <Card sx={{ height: '100%', border: '1px solid #e0e0e0' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: '#424242', fontWeight: 600, mb: 2, textAlign: 'center' }}>
                初選二階
              </Typography>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Chip
                  label="08.25 → 08.26"
                  size="small"
                  sx={{
                    backgroundColor: '#e8f5e8',
                    color: '#2e7d32',
                    fontWeight: 600,
                  }}
                />
              </Box>
              <Box sx={{ '& > *': { mb: 1 } }}>
                <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.75rem' }}>
                  開放一階預選: 8.22(五) → 8.24(日)
                </Typography>
                <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.75rem' }}>
                  二階選課: 8.25(一) → 8.26(三)
                </Typography>
                <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.75rem' }}>
                  公布一階結果: 8.28(五) 15:00
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* 網路加退選 */}
          <Card sx={{ height: '100%', border: '1px solid #e0e0e0' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: '#424242', fontWeight: 600, mb: 2, textAlign: 'center' }}>
                網路加退選
              </Typography>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Chip
                  label="09.01 → 09.15"
                  size="small"
                  sx={{
                    backgroundColor: '#fff3e0',
                    color: '#f57c00',
                    fontWeight: 600,
                  }}
                />
              </Box>
              <Box sx={{ '& > *': { mb: 1 } }}>
                <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.75rem' }}>
                  第一週加退選: 9.1(一) → 9.7(日)
                </Typography>
                <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.75rem' }}>
                  第二週加退選: 9.8(一) → 9.15(一)
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* 選課結果確認 */}
          <Card sx={{ height: '100%', border: '1px solid #e0e0e0' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: '#424242', fontWeight: 600, mb: 2, textAlign: 'center' }}>
                選課結果確認
              </Typography>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Chip
                  label="09.17 → 09.19"
                  size="small"
                  sx={{
                    backgroundColor: '#f3e5f5',
                    color: '#7b1fa2',
                    fontWeight: 600,
                  }}
                />
              </Box>
              <Box sx={{ '& > *': { mb: 1 } }}>
                <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.75rem' }}>
                  選課結果確認: 9.17(三) → 9.19(五)
                </Typography>
                <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.75rem' }}>
                  停修: 9.17(三) → 12.5(五)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  )
}