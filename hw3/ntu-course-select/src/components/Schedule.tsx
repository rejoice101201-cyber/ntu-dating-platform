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
  Chip
} from '@mui/material'
import { ArrowBack, Home, BugReport } from '@mui/icons-material'
import { useCourseContext } from '../context/CourseContext'
import type { Course } from '../types/course'
import { parseNtuTime } from '../utils/timeParser'

const DAY_NAMES = ['', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']
const TIME_SLOTS = [
  '07:10-08:00', '08:10-09:00', '09:10-10:00', '10:20-11:10', '11:20-12:10', '12:20-13:10',
  '13:20-14:10', '14:20-15:10', '15:30-16:20', '16:30-17:20', '17:30-18:20', '18:30-19:20', '19:30-20:20'
]

export default function Schedule() {
  const navigate = useNavigate()
  const { lotteryResults } = useCourseContext()
  const [scheduleData, setScheduleData] = useState<{ [key: string]: Course }>({})

  useEffect(() => {
    // 將課程分配到時間表中
    const newScheduleData: { [key: string]: Course } = {}
    
    lotteryResults.forEach((course: Course) => {
      // 從 Course 中提取原始時間數據
      const courseData = course as any
      
      // 解析第一個時間段
      if (courseData.day1 && courseData.st1) {
        const dayIndex = getDayIndex(courseData.day1)
        const timeIndex = getTimeIndex(courseData.st1)
        
        if (dayIndex > 0 && timeIndex >= 0) {
          const timeKey = `${dayIndex}-${timeIndex}`
          newScheduleData[timeKey] = course
        }
      }
      
      // 解析第二個時間段
      if (courseData.day2 && courseData.st2) {
        const dayIndex = getDayIndex(courseData.day2)
        const timeIndex = getTimeIndex(courseData.st2)
        
        if (dayIndex > 0 && timeIndex >= 0) {
          const timeKey = `${dayIndex}-${timeIndex}`
          newScheduleData[timeKey] = course
        }
      }
      
      // 解析第三個時間段
      if (courseData.day3 && courseData.st3) {
        const dayIndex = getDayIndex(courseData.day3)
        const timeIndex = getTimeIndex(courseData.st3)
        
        if (dayIndex > 0 && timeIndex >= 0) {
          const timeKey = `${dayIndex}-${timeIndex}`
          newScheduleData[timeKey] = course
        }
      }
    })
    
    setScheduleData(newScheduleData)
  }, [lotteryResults])

  // 將星期編碼轉換為索引
  const getDayIndex = (dayCode: string): number => {
    const dayMap: Record<string, number> = {
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
      '10': 4, '12': 6 // 特殊編碼
    }
    return dayMap[dayCode] || 0
  }

  // 將時間編碼轉換為索引
  const getTimeIndex = (timeCode: string): number => {
    const timeMap: Record<string, number> = {
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, '11': 11, '12': 12,
      'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9, 'J': 10, 'K': 11, 'L': 12,
      'S': 1, '67': 7 // 特殊編碼
    }
    return timeMap[timeCode] || -1
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* 頂部導航欄 */}
      <AppBar position="static" elevation={0} sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e0e0e0' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="back" onClick={() => navigate('/final-results')} sx={{ color: '#424242' }}>
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

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* 標題 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ color: '#424242', fontWeight: 600, mb: 2 }}>
            結果課表
          </Typography>
          <Typography variant="body1" sx={{ color: '#757575' }}>
            已選上共 {lotteryResults.length} 門課程
          </Typography>
        </Box>

        {/* 課程表 */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* 星期標題 */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Box sx={{ width: '100px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#666' }}>
                  時間
                </Typography>
              </Box>
              {DAY_NAMES.slice(1).map((day, index) => (
                <Box key={index} sx={{ flex: 1, height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#424242' }}>
                    {day}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* 時間段 */}
            {TIME_SLOTS.map((time, timeIndex) => (
              <Box key={timeIndex} sx={{ display: 'flex', gap: 1 }}>
                {/* 時間標籤 */}
                <Box sx={{ width: '100px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f8f8', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {timeIndex}: {time}
                  </Typography>
                </Box>
                
                {/* 每天的課程 */}
                {DAY_NAMES.slice(1).map((_, dayIndex) => {
                  const timeKey = `${dayIndex + 1}-${timeIndex + 1}`
                  const course = scheduleData[timeKey]
                  
                  return (
                    <Box key={dayIndex} sx={{ flex: 1, height: '80px', p: 1 }}>
                      {course ? (
                        <Card 
                          elevation={2} 
                          sx={{ 
                            height: '100%', 
                            backgroundColor: '#e3f2fd',
                            border: '1px solid #1976d2',
                            borderRadius: 1
                          }}
                        >
                          <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#1976d2', display: 'block' }}>
                              {course.cou_cname}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                              {course.tea_cname}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                              {course.cou_code}
                            </Typography>
                          </CardContent>
                        </Card>
                      ) : (
                        <Box sx={{ height: '100%', border: '1px dashed #e0e0e0', borderRadius: 1 }} />
                      )}
                    </Box>
                  )
                })}
              </Box>
            ))}
          </Box>
        </Paper>

        {/* 課程清單 */}
        {lotteryResults.length > 0 && (
          <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" sx={{ color: '#424242', fontWeight: 600, mb: 2 }}>
              選課結果 ({lotteryResults.length} 門課程)
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {lotteryResults.map((course: Course, index: number) => (
                <Box key={course.ser_no} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1 }}>
                  <Chip label={index + 1} size="small" color="primary" />
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {course.cou_cname} - {course.tea_cname}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {(course as any).time || '時間未定'}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        )}

        {/* 操作按鈕 */}
        <Box sx={{ textAlign: 'center', mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            startIcon={<Home />}
            sx={{ borderRadius: 2, px: 4 }}
          >
            返回首頁
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/debug-schedule')}
            startIcon={<BugReport />}
            sx={{ borderRadius: 2, px: 4 }}
          >
            調試課表
          </Button>
        </Box>
      </Container>
    </Box>
  )
}