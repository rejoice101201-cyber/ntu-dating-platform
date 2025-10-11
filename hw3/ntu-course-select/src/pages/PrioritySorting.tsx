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
  Chip,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import { ArrowBack, Save, Delete, Edit, DragIndicator } from '@mui/icons-material'
import { useCourseContext } from '../context/CourseContext'

export default function PrioritySorting() {
  const navigate = useNavigate()
  const { favoriteCourses, removeFromFavorites, updateCoursePriority } = useCourseContext()
  const [sortedCourses, setSortedCourses] = useState(favoriteCourses)
  const [editDialog, setEditDialog] = useState<{ open: boolean; courseId: string; priority: number }>({
    open: false,
    courseId: '',
    priority: 1
  })

  useEffect(() => {
    setSortedCourses(favoriteCourses)
  }, [favoriteCourses])

  const handleEditPriority = (courseId: string, priority: number) => {
    setEditDialog({ open: true, courseId, priority })
  }

  const handleSavePriority = () => {
    updateCoursePriority(editDialog.courseId, editDialog.priority)
    setEditDialog({ open: false, courseId: '', priority: 1 })
  }

  const handleRemove = (courseId: string) => {
    removeFromFavorites(courseId)
  }

  const handleImportToSelection = () => {
    if (sortedCourses.length > 20) {
      alert('課程數量不能超過 20 門，請刪除多餘的課程')
      return
    }
    
    // 更新所有課程的志願序
    sortedCourses.forEach((course, index) => {
      updateCoursePriority(course.ser_no, index + 1)
    })
    
    navigate('/selection')
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* 頂部導航欄 */}
      <AppBar position="static" elevation={0} sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e0e0e0' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="back" onClick={() => navigate('/favorites')} sx={{ color: '#424242' }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="div" sx={{ flexGrow: 1, color: '#424242', fontWeight: 600 }}>
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
            志願序排序
          </Typography>
          <Typography variant="body1" sx={{ color: '#757575' }}>
            設定課程的志願序，數字越小優先級越高
          </Typography>
        </Box>

        {/* 課程數量警告 */}
        {sortedCourses.length > 20 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            課程數量超過 20 門！請刪除多餘的課程後才能繼續。
          </Alert>
        )}

        {/* 課程清單 */}
        <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h6" sx={{ color: '#424242', fontWeight: 600, mb: 3 }}>
            📚 課程清單 ({sortedCourses.length} 門課程)
          </Typography>
          
          {sortedCourses.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" sx={{ color: '#757575', mb: 2 }}>
                沒有課程可供排序
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
              {sortedCourses.map((course, index) => (
                <Card key={course.ser_no} elevation={1} sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {/* 志願序號 */}
                      <Chip
                        label={`第 ${index + 1} 志願`}
                        color="primary"
                        variant="filled"
                        sx={{ minWidth: '80px', fontWeight: 600 }}
                      />

                      {/* 課程信息 */}
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
                        {(course as any).time && (
                          <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                            時間: {(course as any).time} | 教室: {(course as any).classroom || '未指定'}
                          </Typography>
                        )}
                      </Box>

                      {/* 操作按鈕 */}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditPriority(course.ser_no, index + 1)}
                          sx={{ color: '#1976d2' }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRemove(course.ser_no)}
                          sx={{ color: '#f44336' }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Paper>

        {/* 操作按鈕 */}
        {sortedCourses.length > 0 && (
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleImportToSelection}
              disabled={sortedCourses.length > 20}
              startIcon={<Save />}
              sx={{
                backgroundColor: sortedCourses.length > 20 ? '#ccc' : '#4caf50',
                '&:hover': { 
                  backgroundColor: sortedCourses.length > 20 ? '#ccc' : '#388e3c' 
                },
                borderRadius: 3,
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                fontWeight: 600
              }}
            >
              {sortedCourses.length > 20 ? '課程數量超限' : '匯入選課系統'}
            </Button>
          </Box>
        )}

        {/* 使用說明 */}
        <Paper elevation={1} sx={{ p: 3, backgroundColor: '#e3f2fd' }}>
          <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600, mb: 2 }}>
            📖 使用說明
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" sx={{ color: '#424242' }}>
              • 最多只能選擇 20 門課程
            </Typography>
            <Typography variant="body2" sx={{ color: '#424242' }}>
              • 時間衝突時會保留志願序最高的課程
            </Typography>
            <Typography variant="body2" sx={{ color: '#424242' }}>
              • 點擊匯入選課系統開始選課流程
            </Typography>
          </Box>
        </Paper>
      </Container>

      {/* 編輯志願序對話框 */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, courseId: '', priority: 1 })}>
        <DialogTitle>編輯志願序</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="志願序"
            type="number"
            value={editDialog.priority}
            onChange={(e) => setEditDialog(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
            inputProps={{ min: 1, max: 20 }}
            fullWidth
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, courseId: '', priority: 1 })}>
            取消
          </Button>
          <Button onClick={handleSavePriority} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}