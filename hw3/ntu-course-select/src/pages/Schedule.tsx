import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert
} from '@mui/material'
import { ArrowBack, List } from '@mui/icons-material'

interface Course {
  ser_no: string
  cou_cname: string
  cou_ename: string
  tea_cname: string
  cou_code: string
  credit: string
  dpt_code: string
  dpt_abbr: string
  co_tp: string
  mark: string
  co_rep: string
  pre_course: string
}

// 台大課表時間對應
const TIME_SLOTS = [
  { period: '0', time: '07:10-08:00' },
  { period: '1', time: '08:10-09:00' },
  { period: '2', time: '09:10-10:00' },
  { period: '3', time: '10:20-11:10' },
  { period: '4', time: '11:20-12:10' },
  { period: '5', time: '13:20-14:10' },
  { period: '6', time: '14:20-15:10' },
  { period: '7', time: '15:30-16:20' },
  { period: '8', time: '16:30-17:20' },
  { period: '9', time: '17:30-18:20' },
  { period: '10', time: '18:25-19:15' },
  { period: 'A', time: '19:20-20:10' },
  { period: 'B', time: '20:15-21:05' },
  { period: 'C', time: '21:10-22:00' },
  { period: 'D', time: '22:05-22:55' }
]

const DAYS = ['一', '二', '三', '四', '五', '六', '日']

export default function Schedule() {
  const navigate = useNavigate()
  const location = useLocation()
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    if (location.state?.courses) {
      setCourses(location.state.courses)
    } else {
      navigate('/')
    }
  }, [location.state, navigate])

  // 模擬課程時間安排（實際應該從數據中獲取）
  const getMockSchedule = () => {
    const schedule: { [key: string]: { [key: string]: Course } } = {}
    
    // 初始化空課表
    DAYS.forEach(day => {
      schedule[day] = {}
    })

    // 為每門課程分配隨機時間（模擬）
    courses.forEach((course, index) => {
      const dayIndex = index % 5 // 週一到週五
      const timeIndex = Math.floor(index / 5) * 2 + 1 // 每兩節課一組
      
      if (timeIndex < TIME_SLOTS.length) {
        const day = DAYS[dayIndex]
        const timeSlot = TIME_SLOTS[timeIndex]
        schedule[day][timeSlot.period] = course
      }
    })

    return schedule
  }

  const schedule = getMockSchedule()
  const totalCredits = courses.reduce((sum, course) => sum + parseInt(course.credit || '0'), 0)

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* 頂部導航欄 */}
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => navigate('/results')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            臺大課程網
          </Typography>
          <Button
            color="inherit"
            startIcon={<List />}
            onClick={() => navigate('/results')}
          >
            列表
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* 麵包屑導航 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ color: '#666' }}>
            首頁 / 選課結果 / 最終結果 / 課表
          </Typography>
        </Box>

        {/* 頁面標題 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ color: '#424242', fontWeight: 600, mr: 2 }}>
            結果課表
          </Typography>
          <Chip 
            label={`已選上共 ${totalCredits} 學分`} 
            color="primary" 
            sx={{ fontWeight: 600 }}
          />
        </Box>

        {/* 課程類別圖例 */}
        <Paper elevation={1} sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
          <Typography variant="h6" sx={{ color: '#424242', fontWeight: 600, mb: 2 }}>
            課程類別
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#1976d2' }} />
              <Typography variant="body2">必帶</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f44336' }} />
              <Typography variant="body2">必修</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff9800' }} />
              <Typography variant="body2">通識</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#4caf50' }} />
              <Typography variant="body2">選修</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#9e9e9e' }} />
              <Typography variant="body2">已選上待分發</Typography>
            </Box>
          </Box>
        </Paper>

        {/* 課表 */}
        <Paper elevation={2} sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600, minWidth: 80 }}>時間</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>一</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>二</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>三</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>四</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>五</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>六</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>日</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {TIME_SLOTS.map((timeSlot) => (
                  <TableRow key={timeSlot.period}>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: '#fafafa' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {timeSlot.period}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          {timeSlot.time}
                        </Typography>
                      </Box>
                    </TableCell>
                    {DAYS.map((day) => {
                      const course = schedule[day]?.[timeSlot.period]
                      return (
                        <TableCell 
                          key={`${day}-${timeSlot.period}`}
                          sx={{ 
                            minWidth: 120, 
                            height: 80,
                            border: '1px solid #e0e0e0',
                            backgroundColor: course ? '#e8f5e8' : 'white'
                          }}
                        >
                          {course ? (
                            <Box sx={{ p: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {course.cou_cname}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                {course.tea_cname}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                {course.cou_code}
                              </Typography>
                            </Box>
                          ) : null}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* 注意事項 */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>註：</strong>
            已選上課程因暫無上課時間而未能顯示於課表，請留意並避免衝堂。
          </Typography>
        </Alert>
      </Container>
    </Box>
  )
}
