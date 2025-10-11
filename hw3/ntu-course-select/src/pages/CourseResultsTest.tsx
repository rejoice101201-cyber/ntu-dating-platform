import React from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { 
  Container, 
  Typography, 
  Box, 
  Button,
  Paper
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'

export default function CourseResultsTest() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const keyword = searchParams.get('keyword') || ''

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
        
        <Typography variant="body1" sx={{ color: '#757575' }}>
          搜尋關鍵字: "{keyword}"
        </Typography>
      </Paper>

      {/* 測試內容 */}
      <Paper elevation={1} sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, color: '#424242' }}>
          🎉 測試頁面正常運作！
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 2, color: '#757575' }}>
          這是一個簡化的測試版本，用來確認頁面可以正常渲染。
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            返回首頁
          </Button>
          
          <Button 
            variant="outlined"
            onClick={() => window.location.reload()}
          >
            重新載入
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}
