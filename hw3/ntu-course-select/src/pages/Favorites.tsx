import { useState } from 'react'
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
  Fab,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { Favorite, KeyboardArrowUp, Upload, Edit, Save, Cancel } from '@mui/icons-material'
import { useCourseContext } from '../context/CourseContext'
import CourseInfoMenu from '../components/CourseInfoMenu'

export default function Favorites() {
  const navigate = useNavigate()
  const { favorites, removeFromFavorites, favoriteCourses, updateCoursePriority, lastLotteryResults } = useCourseContext()
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [courseInfoMenuOpen, setCourseInfoMenuOpen] = useState(false)
  const [noResultsDialogOpen, setNoResultsDialogOpen] = useState(false)
  const [editingPriority, setEditingPriority] = useState<string | null>(null)
  const [tempPriority, setTempPriority] = useState<number>(1)

  const handleScroll = () => {
    setShowScrollTop(window.scrollY > 300)
  }

  const handleScheduleClick = () => {
    if (lastLotteryResults.length === 0) {
      setNoResultsDialogOpen(true)
    } else {
      navigate('/schedule')
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEditPriority = (courseId: string, currentPriority?: number) => {
    setEditingPriority(courseId)
    setTempPriority(currentPriority || 1)
  }

  const handleSavePriority = (courseId: string) => {
    if (tempPriority >= 1 && tempPriority <= 20) {
      updateCoursePriority(courseId, tempPriority)
    }
    setEditingPriority(null)
  }

  const handleCancelEdit = () => {
    setEditingPriority(null)
  }

  const handleImportToSelection = () => {
    if (favoritesList.length > 20) {
      alert('課程數量不能超過 20 門，請刪除多餘的課程')
      return
    }
    navigate('/priority-sorting')
  }

  // 監聽滾動事件
  useState(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  })

  const favoritesList = Array.from(favorites.values()).map(id => 
    favoriteCourses.find(course => course.ser_no === id)
  ).filter(Boolean)

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* 頂部導航欄 */}
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
              <Typography 
                variant="body1" 
                sx={{ color: '#1976d2', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
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
              onClick={handleScheduleClick}
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
        {/* 標題和統計 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ color: '#424242', fontWeight: 600, mb: 2 }}>
            我的最愛課程
          </Typography>
          <Typography variant="body1" sx={{ color: '#757575' }}>
            已收藏 {favoritesList.length} 門課程
          </Typography>
        </Box>

        {/* 課程列表 */}
        {favoritesList.length === 0 ? (
          <Paper elevation={1} sx={{ p: 6, textAlign: 'center' }}>
            <Favorite sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#757575', mb: 2 }}>
              還沒有收藏任何課程
            </Typography>
            <Typography variant="body2" sx={{ color: '#999', mb: 3 }}>
              前往課程搜尋頁面，將感興趣的課程加入最愛
            </Typography>
              <Button
              variant="contained"
              onClick={() => navigate('/')}
              sx={{ borderRadius: 2 }}
            >
              開始搜尋課程
              </Button>
          </Paper>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
              {favoritesList.map((course: any, index: number) => (
                <Card key={`${course?.ser_no}-${index}`} elevation={1} sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ color: '#424242', fontWeight: 600, mb: 1 }}>
                          {course?.cou_cname}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#757575', mb: 1 }}>
                          {course?.cou_ename}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#757575', mb: 1 }}>
                          教師: {course?.tea_cname} | 課程代碼: {course?.cou_code} | 學分: {course?.credit}
                        </Typography>
                        
                        {/* 志願序設定 */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <Typography variant="body2" sx={{ color: '#666', minWidth: '60px' }}>
                            志願序:
                          </Typography>
                          {editingPriority === course?.ser_no ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <TextField
                                type="number"
                                value={tempPriority}
                                onChange={(e) => setTempPriority(parseInt(e.target.value) || 1)}
                                inputProps={{ min: 1, max: 20 }}
                                size="small"
                                sx={{ width: '80px' }}
                              />
                              <IconButton
                                size="small"
                                onClick={() => handleSavePriority(course?.ser_no)}
                                sx={{ color: '#4caf50' }}
                              >
                                <Save fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={handleCancelEdit}
                                sx={{ color: '#f44336' }}
                              >
                                <Cancel fontSize="small" />
                              </IconButton>
                            </Box>
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={course?.priority ? `第 ${course.priority} 志願` : '未設定'}
                                size="small"
                                color={course?.priority ? 'primary' : 'default'}
                                variant={course?.priority ? 'filled' : 'outlined'}
                              />
                              <IconButton
                                size="small"
                                onClick={() => handleEditPriority(course?.ser_no, course?.priority)}
                                sx={{ color: '#1976d2' }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Box>
                          )}
                        </Box>
                      </Box>
                      
                      <IconButton
                        onClick={() => removeFromFavorites(course?.ser_no)}
                        sx={{ 
                          color: '#f44336',
                          '&:hover': {
                            backgroundColor: '#ffebee'
                          }
                        }}
                      >
                        <Favorite />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* 匯入選課系統按鈕 */}
            <Paper elevation={2} sx={{ p: 4, textAlign: 'center', backgroundColor: '#e8f5e8' }}>
              <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 600, mb: 2 }}>
                🎯 準備匯入選課系統
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
                將 {favoritesList.length} 門收藏課程匯入選課系統，系統會根據機率隨機選出課程
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleImportToSelection}
                startIcon={<Upload />}
                sx={{
                  backgroundColor: '#4caf50',
                  '&:hover': {
                    backgroundColor: '#45a049'
                  },
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}
              >
                匯入選課系統
              </Button>
            </Paper>
          </>
        )}

        {/* 返回頂部按鈕 */}
        {showScrollTop && (
          <Fab
            color="primary"
            aria-label="scroll to top"
            onClick={scrollToTop}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1000
            }}
          >
            <KeyboardArrowUp />
          </Fab>
        )}
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