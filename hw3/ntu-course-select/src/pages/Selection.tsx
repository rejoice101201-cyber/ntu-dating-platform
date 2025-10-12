import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Container, 
  Typography, 
  Box, 
  Button,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Card,
  CardContent,
  CircularProgress,
  Chip
} from '@mui/material'
import { ArrowBack, PlayArrow, Delete, Info } from '@mui/icons-material'
import { useCourseContext } from '../context/CourseContext'

export default function Selection() {
  const navigate = useNavigate()
  const { favoriteCourses, runLottery, setLastLotteryResults, clearLastLotteryResults } = useCourseContext()
  const [selectedCourses, setSelectedCourses] = useState(favoriteCourses)
  const [isSelecting, setIsSelecting] = useState(false)

  useEffect(() => {
    setSelectedCourses(favoriteCourses)
  }, [favoriteCourses])

  const removeCourse = (serNo: string) => {
    setSelectedCourses(prev => prev.filter(course => course.ser_no !== serNo))
  }

  const handleLottery = async () => {
    setIsSelecting(true)
    
    // 清除上次的選課結果
    clearLastLotteryResults()
    
    // 模擬選課過程
    setTimeout(() => {
      const result = runLottery(selectedCourses)
      // 保存新的選課結果
      setLastLotteryResults(result)
      navigate('/final-results', { state: { selectedCourses: result } })
    }, 2000)
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* 頂部導航欄 */}
      <AppBar position="static" elevation={0} sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e0e0e0' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="back" onClick={() => navigate('/favorites')} sx={{ color: '#424242' }}>
            <ArrowBack />
          </IconButton>
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
        {/* 標題 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ color: '#424242', fontWeight: 600, mb: 2 }}>
            選課系統
          </Typography>
          <Typography variant="body1" sx={{ color: '#757575' }}>
            管理您的選課清單，設定志願序，開始隨機選課
          </Typography>
        </Box>

        {/* 選課說明 */}
        <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h6" sx={{ color: '#424242', fontWeight: 600, mb: 3 }}>
            🎯 選課系統說明
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="body1" sx={{ color: '#666', mb: 1, fontWeight: 600 }}>
                📊 個別機率系統
              </Typography>
              <Typography variant="body2" sx={{ color: '#999' }}>
                每門課程都有獨立的中籤機率，系統會根據各課程的機率獨立決定是否選中
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body1" sx={{ color: '#666', mb: 1, fontWeight: 600 }}>
                🏆 志願序系統
              </Typography>
              <Typography variant="body2" sx={{ color: '#999' }}>
                當課程時間衝突時，系統會保留志願序最高的課程（數字越小優先級越高）
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body1" sx={{ color: '#666', mb: 1, fontWeight: 600 }}>
                ⚡ 自動衝突解決
              </Typography>
              <Typography variant="body2" sx={{ color: '#999' }}>
                系統會自動檢測時間衝突並根據志願序進行處理，確保最終課表沒有衝突
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* 選課清單 */}
        <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h6" sx={{ color: '#424242', fontWeight: 600, mb: 3 }}>
            📚 選課清單 ({selectedCourses.length} 門課程)
          </Typography>
          
          {selectedCourses.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" sx={{ color: '#757575', mb: 2 }}>
                沒有課程可供選取
              </Typography>
              <Typography variant="body2" sx={{ color: '#999', mb: 3 }}>
                請從我的最愛匯入課程
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/favorites')}
                sx={{ borderRadius: 2 }}
              >
                前往我的最愛
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {selectedCourses.map((course) => (
                <Card key={course.ser_no} elevation={1} sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ color: '#424242', fontWeight: 600, mb: 1 }}>
                          {course.cou_cname}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#757575', mb: 1 }}>
                          {course.cou_ename}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#757575', mb: 1 }}>
                          教師: {course.tea_cname} | 課程代碼: {course.cou_code} | 學分: {course.credit}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip
                            label={`中籤機率: ${((course.probability || 0.5) * 100).toFixed(1)}%`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          {course.priority && (
                            <Chip
                              label={`第 ${course.priority} 志願`}
                              size="small"
                              color="secondary"
                              variant="filled"
                            />
                          )}
                        </Box>
                      </Box>
                      
                      <IconButton
                        onClick={() => removeCourse(course.ser_no)}
                        sx={{ 
                          color: '#f44336',
                          '&:hover': {
                            backgroundColor: '#ffebee'
                          }
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Paper>

        {/* 開始選課按鈕 */}
        {selectedCourses.length > 0 && (
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleLottery}
              disabled={isSelecting}
              startIcon={isSelecting ? <CircularProgress size={20} /> : <PlayArrow />}
              sx={{
                backgroundColor: '#ff6b35',
                '&:hover': { backgroundColor: '#e55a2b' },
                borderRadius: 3,
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                fontWeight: 600
              }}
            >
              {isSelecting ? '選課中...' : '開始隨機選課'}
            </Button>
          </Box>
        )}

        {/* 注意事項 */}
        <Paper elevation={1} sx={{ p: 3, backgroundColor: '#e3f2fd' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Info sx={{ color: '#1976d2', mt: 0.5 }} />
            <Box>
              <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600, mb: 2 }}>
                注意事項
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  • 選課結果是隨機的，不保證所有課程都會被選中
                </Typography>
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  • 即使課程時間衝突，系統仍會進行選課
                </Typography>
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  • 最終選課數量可能少於設定的最大值
                </Typography>
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  • 選課完成後可以查看詳細的課表
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}