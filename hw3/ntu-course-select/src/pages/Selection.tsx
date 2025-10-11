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
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material'
import { ArrowBack, Delete, Casino } from '@mui/icons-material'
import { useCourseContext } from '../context/CourseContext'

export default function Selection() {
  const navigate = useNavigate()
  const { favorites, runLottery } = useCourseContext()
  
  const [selectedCourses, setSelectedCourses] = useState(Array.from(favorites.values()))
  const [selectionProbability, setSelectionProbability] = useState(50)
  const [maxCourses, setMaxCourses] = useState(5)
  const [isSelecting, setIsSelecting] = useState(false)

  const removeCourse = (serNo: string) => {
    setSelectedCourses(prev => prev.filter(course => course.ser_no !== serNo))
  }

  const handleLottery = async () => {
    setIsSelecting(true)
    
    // 模擬選課過程
    setTimeout(() => {
      const result = runLottery(selectedCourses)
      navigate('/final-results', { state: { selectedCourses: result } })
    }, 2000)
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* 頂部導航欄 */}
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => navigate('/favorites')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            選課系統
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* 標題 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ color: '#424242', fontWeight: 600, mb: 2 }}>
            選課系統
          </Typography>
          <Typography variant="body1" sx={{ color: '#757575' }}>
            管理您的選課清單，設定選課參數，開始隨機選課
          </Typography>
        </Box>

        {/* 選課參數設定 */}
        <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h6" sx={{ color: '#424242', fontWeight: 600, mb: 3 }}>
            ⚙️ 選課參數設定
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* 選課機率 */}
            <Box>
              <Typography variant="body1" sx={{ color: '#666', mb: 2 }}>
                選課機率: {selectionProbability}%
              </Typography>
              <Slider
                value={selectionProbability}
                onChange={(_, value) => setSelectionProbability(value as number)}
                min={10}
                max={90}
                step={10}
                marks={[
                  { value: 10, label: '10%' },
                  { value: 30, label: '30%' },
                  { value: 50, label: '50%' },
                  { value: 70, label: '70%' },
                  { value: 90, label: '90%' }
                ]}
                sx={{ maxWidth: 400 }}
              />
              <Typography variant="caption" sx={{ color: '#999' }}>
                每門課程被選中的機率
              </Typography>
            </Box>

            {/* 最大選課數量 */}
            <Box>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>最大選課數量</InputLabel>
                <Select
                  value={maxCourses}
                  label="最大選課數量"
                  onChange={(e) => setMaxCourses(e.target.value as number)}
                >
                  <MenuItem value={3}>3 門課程</MenuItem>
                  <MenuItem value={4}>4 門課程</MenuItem>
                  <MenuItem value={5}>5 門課程</MenuItem>
                  <MenuItem value={6}>6 門課程</MenuItem>
                  <MenuItem value={7}>7 門課程</MenuItem>
                  <MenuItem value={8}>8 門課程</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 1 }}>
                系統最多會選出幾門課程
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
            <Alert severity="info">
              沒有課程可以選課，請先前往我的最愛頁面添加課程
            </Alert>
          ) : (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                {selectedCourses.map((course, index) => (
                  <Card key={`${course.ser_no}-${index}`} elevation={1} sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ color: '#424242', fontWeight: 600, mb: 1 }}>
                            {course.cou_cname}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#757575', mb: 1 }}>
                            {course.cou_ename}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip label={`教師: ${course.tea_cname}`} size="small" variant="outlined" />
                            <Chip label={`代碼: ${course.cou_code}`} size="small" variant="outlined" />
                            <Chip label={`學分: ${course.credit}`} size="small" variant="outlined" />
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

              {/* 開始選課按鈕 */}
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleLottery}
                  disabled={isSelecting}
                  startIcon={<Casino />}
                  sx={{
                    backgroundColor: '#ff9800',
                    '&:hover': {
                      backgroundColor: '#f57c00'
                    },
                    borderRadius: 2,
                    px: 6,
                    py: 2,
                    fontSize: '1.2rem',
                    fontWeight: 600
                  }}
                >
                  {isSelecting ? '選課中...' : '開始隨機選課'}
                </Button>
                {isSelecting && (
                  <Typography variant="body2" sx={{ color: '#666', mt: 2 }}>
                    正在進行隨機選課，請稍候...
                  </Typography>
                )}
              </Box>
            </>
          )}
        </Paper>

        {/* 注意事項 */}
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body2">
            <strong>注意事項：</strong>
            <br />• 選課結果是隨機的，不保證所有課程都會被選中
            <br />• 即使課程時間衝突，系統仍會進行選課
            <br />• 最終選課數量可能少於設定的最大值
            <br />• 選課完成後可以查看詳細的課表
          </Typography>
        </Alert>
      </Container>
    </Box>
  )
}
