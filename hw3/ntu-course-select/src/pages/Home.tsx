import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCourseContext } from '../context/CourseContext'
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { Search, Info, Assignment, Favorite } from '@mui/icons-material'
import CourseInfoMenu from '../components/CourseInfoMenu'

export default function Home() {
  const navigate = useNavigate()
  const { lastLotteryResults } = useCourseContext()
  const [keyword, setKeyword] = useState('')
  const [courseInfoMenuOpen, setCourseInfoMenuOpen] = useState(false)
  const [noResultsDialogOpen, setNoResultsDialogOpen] = useState(false)

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

  const handleScheduleClick = () => {
    if (lastLotteryResults.length === 0) {
      setNoResultsDialogOpen(true)
    } else {
      navigate('/schedule')
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
            <Box 
              sx={{ 
                position: 'relative',
                // 擴展懸停區域，讓滑鼠移動更容易
                padding: '4px 8px',
                margin: '-4px -8px'
              }}
              onMouseEnter={() => setCourseInfoMenuOpen(true)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Info sx={{ fontSize: '1.2rem', color: '#1976d2' }} />
                <Typography 
                  variant="body1" 
                  sx={{ color: '#1976d2', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                >
                  課程資訊
                </Typography>
              </Box>
              <CourseInfoMenu 
                open={courseInfoMenuOpen} 
                onClose={() => setCourseInfoMenuOpen(false)} 
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={handleScheduleClick}>
              <Assignment sx={{ fontSize: '1.2rem', color: '#1976d2' }} />
              <Typography 
                variant="body1" 
                sx={{ color: '#1976d2', '&:hover': { textDecoration: 'underline' } }}
              >
                選課結果
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => navigate('/favorites')}>
              <Favorite sx={{ fontSize: '1.2rem', color: '#1976d2' }} />
              <Typography 
                variant="body1" 
                sx={{ color: '#1976d2', '&:hover': { textDecoration: 'underline' } }}
              >
                我的收藏
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Search Section */}
        <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid #e0e0e0' }}>
          {/* Search Bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
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

          {/* Course Classifier */}
          <Box sx={{ borderTop: '1px solid #e0e0e0', pt: 3 }}>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* 學分數篩選 */}
              <Box>
                <Typography variant="body2" sx={{ color: '#757575', mb: 1, fontWeight: 500 }}>
                  學分數
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {[0, 1, 2, 3, 4].map((credit) => (
                    <Chip
                      key={credit}
                      label={`${credit}學分`}
                      variant="outlined"
                      clickable
                      sx={{
                        borderColor: '#1976d2',
                        color: '#1976d2',
                        '&:hover': {
                          backgroundColor: '#e3f2fd',
                        },
                        '&.MuiChip-clickable:hover': {
                          backgroundColor: '#e3f2fd',
                        },
                      }}
                      onClick={() => {
                        const searchParams = new URLSearchParams()
                        if (keyword.trim()) {
                          searchParams.set('keyword', keyword.trim())
                        }
                        searchParams.set('credit', credit.toString())
                        navigate(`/results?${searchParams.toString()}`)
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* 系所篩選 */}
              <Box>
                <Typography variant="body2" sx={{ color: '#757575', mb: 1, fontWeight: 500 }}>
                  主要系所
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {[
                    { code: 'FL', name: '外文系' },
                    { code: 'CHIN', name: '中文系' },
                    { code: 'EE', name: '電機系' },
                    { code: 'Chem', name: '化學系' },
                    { code: 'LAW', name: '法律系' },
                    { code: 'ME', name: '機械系' },
                    { code: 'Agron', name: '農藝系' },
                    { code: 'MATH', name: '數學系' },
                    { code: 'CSIE', name: '資工系' },
                    { code: 'ChemE', name: '化工系' }
                  ].map((dept) => (
                    <Chip
                      key={dept.code}
                      label={dept.name}
                      variant="outlined"
                      clickable
                      sx={{
                        borderColor: '#2e7d32',
                        color: '#2e7d32',
                        '&:hover': {
                          backgroundColor: '#e8f5e8',
                        },
                        '&.MuiChip-clickable:hover': {
                          backgroundColor: '#e8f5e8',
                        },
                      }}
                      onClick={() => {
                        const searchParams = new URLSearchParams()
                        if (keyword.trim()) {
                          searchParams.set('keyword', keyword.trim())
                        }
                        searchParams.set('department', dept.code)
                        navigate(`/results?${searchParams.toString()}`)
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* 課程類型篩選 */}
              <Box>
                <Typography variant="body2" sx={{ color: '#757575', mb: 1, fontWeight: 500 }}>
                  課程類型
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {[
                    { type: '0', name: '選修課程', color: '#ff9800' },
                    { type: '1', name: '必修課程', color: '#f44336' },
                    { type: '2', name: '通識課程', color: '#4caf50' }
                  ].map((courseType) => (
                    <Chip
                      key={courseType.type}
                      label={courseType.name}
                      variant="outlined"
                      clickable
                      sx={{
                        borderColor: courseType.color,
                        color: courseType.color,
                        '&:hover': {
                          backgroundColor: courseType.color === '#ff9800' ? '#fff3e0' : 
                                         courseType.color === '#f44336' ? '#ffebee' : '#e8f5e8',
                        },
                        '&.MuiChip-clickable:hover': {
                          backgroundColor: courseType.color === '#ff9800' ? '#fff3e0' : 
                                         courseType.color === '#f44336' ? '#ffebee' : '#e8f5e8',
                        },
                      }}
                      onClick={() => {
                        const searchParams = new URLSearchParams()
                        if (keyword.trim()) {
                          searchParams.set('keyword', keyword.trim())
                        }
                        searchParams.set('type', courseType.type)
                        navigate(`/results?${searchParams.toString()}`)
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* 中籤率篩選 */}
              <Box>
                <Typography variant="body2" sx={{ color: '#757575', mb: 1, fontWeight: 500 }}>
                  中籤率範圍
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {[
                    { range: 'high', label: '高機率 (70%+)', color: '#4caf50' },
                    { range: 'medium', label: '中機率 (40-70%)', color: '#ff9800' },
                    { range: 'low', label: '低機率 (<40%)', color: '#f44336' }
                  ].map((probRange) => (
                    <Chip
                      key={probRange.range}
                      label={probRange.label}
                      variant="outlined"
                      clickable
                      sx={{
                        borderColor: probRange.color,
                        color: probRange.color,
                        '&:hover': {
                          backgroundColor: probRange.color === '#4caf50' ? '#e8f5e8' : 
                                         probRange.color === '#ff9800' ? '#fff3e0' : '#ffebee',
                        },
                        '&.MuiChip-clickable:hover': {
                          backgroundColor: probRange.color === '#4caf50' ? '#e8f5e8' : 
                                         probRange.color === '#ff9800' ? '#fff3e0' : '#ffebee',
                        },
                      }}
                      onClick={() => {
                        const searchParams = new URLSearchParams()
                        if (keyword.trim()) {
                          searchParams.set('keyword', keyword.trim())
                        }
                        searchParams.set('probability', probRange.range)
                        navigate(`/results?${searchParams.toString()}`)
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* 快速篩選組合 */}
              <Box>
                <Typography variant="body2" sx={{ color: '#757575', mb: 1, fontWeight: 500 }}>
                  快速篩選
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label="3學分選修課程"
                    variant="filled"
                    clickable
                    sx={{
                      backgroundColor: '#1976d2',
                      color: '#ffffff',
                      '&:hover': {
                        backgroundColor: '#1565c0',
                      },
                    }}
                    onClick={() => {
                      const searchParams = new URLSearchParams()
                      if (keyword.trim()) {
                        searchParams.set('keyword', keyword.trim())
                      }
                      searchParams.set('credit', '3')
                      searchParams.set('type', '0')
                      navigate(`/results?${searchParams.toString()}`)
                    }}
                  />
                  <Chip
                    label="通識課程"
                    variant="filled"
                    clickable
                    sx={{
                      backgroundColor: '#4caf50',
                      color: '#ffffff',
                      '&:hover': {
                        backgroundColor: '#388e3c',
                      },
                    }}
                    onClick={() => {
                      const searchParams = new URLSearchParams()
                      if (keyword.trim()) {
                        searchParams.set('keyword', keyword.trim())
                      }
                      searchParams.set('type', '2')
                      navigate(`/results?${searchParams.toString()}`)
                    }}
                  />
                  <Chip
                    label="1學分課程"
                    variant="filled"
                    clickable
                    sx={{
                      backgroundColor: '#ff9800',
                      color: '#ffffff',
                      '&:hover': {
                        backgroundColor: '#f57c00',
                      },
                    }}
                    onClick={() => {
                      const searchParams = new URLSearchParams()
                      if (keyword.trim()) {
                        searchParams.set('keyword', keyword.trim())
                      }
                      searchParams.set('credit', '1')
                      navigate(`/results?${searchParams.toString()}`)
                    }}
                  />
                </Box>
              </Box>
            </Box>
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
            onClick={handleScheduleClick}
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

      {/* 無選課結果提示對話框 */}
      <Dialog 
        open={noResultsDialogOpen} 
        onClose={() => setNoResultsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', color: '#1976d2', fontWeight: 600 }}>
          尚未完成選課
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="body1" sx={{ color: '#424242', mb: 2 }}>
            您還沒有進行選課，請先完成選課流程。
          </Typography>
          <Typography variant="body2" sx={{ color: '#757575' }}>
            您可以點擊下方的選課流程卡片開始選課，或前往「我的收藏」查看已收藏的課程。
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            onClick={() => setNoResultsDialogOpen(false)}
            variant="outlined"
            sx={{ mr: 2, borderColor: '#1976d2', color: '#1976d2' }}
          >
            取消
          </Button>
          <Button 
            onClick={() => {
              setNoResultsDialogOpen(false)
              navigate('/results')
            }}
            variant="contained"
            sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}
          >
            開始選課
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}