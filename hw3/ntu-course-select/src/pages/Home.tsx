import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Paper,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material'
import { Search, Favorite } from '@mui/icons-material'

export default function Home() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')

  const handleSearch = () => {
    if (keyword.trim()) {
      navigate(`/courses?keyword=${encodeURIComponent(keyword.trim())}`)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* 頂部導航欄 */}
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            臺大課程網
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
        {/* 標題 */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ color: '#424242', fontWeight: 600, mb: 2 }}>
            臺大課程搜尋
          </Typography>
          <Typography variant="body1" sx={{ color: '#757575' }}>
            請輸入課程名稱、教師姓名或課程代碼進行搜尋
          </Typography>
        </Box>

        {/* 搜尋區域 */}
        <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="搜尋課程名稱、教師姓名或課程代碼..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '1.1rem'
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
                fontSize: '1.1rem',
                fontWeight: 600
              }}
            >
              搜尋
            </Button>
          </Box>
        </Paper>

        {/* 選課流程說明 */}
        <Paper elevation={1} sx={{ p: 3, backgroundColor: '#e3f2fd' }}>
          <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600, mb: 2 }}>
            📚 選課流程
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ textAlign: 'center', flex: 1, minWidth: 200 }}>
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                1. 搜尋課程
              </Typography>
              <Typography variant="caption" sx={{ color: '#999' }}>
                輸入關鍵字找到想要的課程
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1, minWidth: 200 }}>
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                2. 加入最愛
              </Typography>
              <Typography variant="caption" sx={{ color: '#999' }}>
                將感興趣的課程加入收藏
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1, minWidth: 200 }}>
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                3. 匯入選課
              </Typography>
              <Typography variant="caption" sx={{ color: '#999' }}>
                將最愛課程匯入選課系統
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1, minWidth: 200 }}>
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                4. 查看結果
              </Typography>
              <Typography variant="caption" sx={{ color: '#999' }}>
                查看選課結果和課表
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}