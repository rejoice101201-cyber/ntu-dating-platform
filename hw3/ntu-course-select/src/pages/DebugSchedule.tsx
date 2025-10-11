import { useState, useEffect } from 'react'
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import { ExpandMore, BugReport } from '@mui/icons-material'
import { useCourseContext } from '../context/CourseContext'
import type { Course } from '../types/course'

export default function DebugSchedule() {
  const { lotteryResults } = useCourseContext()
  const [debugData, setDebugData] = useState<any[]>([])
  const [timeMapping, setTimeMapping] = useState<Record<string, string>>({})

  useEffect(() => {
    // 收集調試數據
    const debugInfo = lotteryResults.map((course: Course, index: number) => {
      const courseData = course as any
      
      return {
        index: index + 1,
        ser_no: course.ser_no,
        cou_cname: course.cou_cname,
        tea_cname: course.tea_cname,
        cou_code: course.cou_code,
        // 原始時間數據
        raw_day1: courseData.day1,
        raw_st1: courseData.st1,
        raw_day2: courseData.day2,
        raw_st2: courseData.st2,
        raw_day3: courseData.day3,
        raw_st3: courseData.st3,
        // 解析後的時間
        parsed_time: courseData.time,
        // 志願序
        priority: courseData.priority,
        // 教室
        classroom: courseData.classroom
      }
    })
    
    setDebugData(debugInfo)
    
    // 建立時間映射表
    const mapping: Record<string, string> = {
      '1': '星期一', '2': '星期二', '3': '星期三', '4': '星期四', '5': '星期五', '6': '星期六', '7': '星期日',
      '10': '星期四', '12': '星期六',
      '1': '08:10-09:00', '2': '09:10-10:00', '3': '10:20-11:10', '4': '11:20-12:10', '5': '12:20-13:10',
      '6': '13:20-14:10', '7': '14:20-15:10', '8': '15:30-16:20', '9': '16:30-17:20', '10': '17:30-18:20',
      '11': '18:30-19:20', '12': '19:30-20:20', 'S': '08:10-09:00', 'A': '08:10-09:00', 'B': '09:10-10:00',
      'C': '10:20-11:10', 'D': '11:20-12:10', 'E': '12:20-13:10', 'F': '13:20-14:10', 'G': '14:20-15:10',
      'H': '15:30-16:20', 'I': '16:30-17:20', 'J': '17:30-18:20', 'K': '18:30-19:20', 'L': '19:30-20:20'
    }
    setTimeMapping(mapping)
  }, [lotteryResults])

  const getTimeSlotInfo = (day: string, time: string) => {
    const dayName = timeMapping[day] || `星期${day}`
    const timeSlot = timeMapping[time] || `時段${time}`
    return `${dayName} ${timeSlot}`
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: '#424242', fontWeight: 600, mb: 2 }}>
          🔍 課表調試工具
        </Typography>
        <Typography variant="body1" sx={{ color: '#757575' }}>
          檢查課程時間解析和課表放置邏輯
        </Typography>
      </Box>

      {/* 統計信息 */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ color: '#424242', fontWeight: 600, mb: 2 }}>
          📊 統計信息
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip label={`總課程數: ${lotteryResults.length}`} color="primary" />
          <Chip label={`有時間數據: ${debugData.filter(d => d.raw_day1 || d.raw_day2 || d.raw_day3).length}`} color="secondary" />
          <Chip label={`有志願序: ${debugData.filter(d => d.priority).length}`} color="info" />
        </Box>
      </Paper>

      {/* 時間映射表 */}
      <Accordion sx={{ mb: 4 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">🗓️ 時間映射表</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>編碼</TableCell>
                  <TableCell>對應值</TableCell>
                  <TableCell>類型</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(timeMapping).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell>{key}</TableCell>
                    <TableCell>{value}</TableCell>
                    <TableCell>
                      <Chip 
                        label={key.match(/[A-Z]/) ? '時間' : key.match(/[1-9]/) ? '星期/時間' : '星期'} 
                        size="small" 
                        color={key.match(/[A-Z]/) ? 'primary' : 'secondary'} 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* 課程詳細信息 */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ color: '#424242', fontWeight: 600, mb: 3 }}>
          📚 課程時間解析詳情
        </Typography>
        
        {debugData.length === 0 ? (
          <Alert severity="info">沒有選課結果數據</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>課程名稱</TableCell>
                  <TableCell>教師</TableCell>
                  <TableCell>原始時間數據</TableCell>
                  <TableCell>解析後時間</TableCell>
                  <TableCell>志願序</TableCell>
                  <TableCell>教室</TableCell>
                  <TableCell>問題檢查</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {debugData.map((course, index) => (
                  <TableRow key={course.ser_no}>
                    <TableCell>{course.index}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {course.cou_cname}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        {course.cou_code}
                      </Typography>
                    </TableCell>
                    <TableCell>{course.tea_cname}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {course.raw_day1 && course.raw_st1 && (
                          <Chip 
                            label={`day1:${course.raw_day1} st1:${course.raw_st1}`} 
                            size="small" 
                            color="primary" 
                          />
                        )}
                        {course.raw_day2 && course.raw_st2 && (
                          <Chip 
                            label={`day2:${course.raw_day2} st2:${course.raw_st2}`} 
                            size="small" 
                            color="secondary" 
                          />
                        )}
                        {course.raw_day3 && course.raw_st3 && (
                          <Chip 
                            label={`day3:${course.raw_day3} st3:${course.raw_st3}`} 
                            size="small" 
                            color="info" 
                          />
                        )}
                        {!course.raw_day1 && !course.raw_day2 && !course.raw_day3 && (
                          <Chip label="無時間數據" size="small" color="default" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {course.parsed_time || '未解析'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {course.priority ? (
                        <Chip label={`第${course.priority}志願`} size="small" color="success" />
                      ) : (
                        <Chip label="未設定" size="small" color="default" />
                      )}
                    </TableCell>
                    <TableCell>{course.classroom || '未指定'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {!course.raw_day1 && !course.raw_day2 && !course.raw_day3 && (
                          <Alert severity="warning" sx={{ p: 0.5, fontSize: '0.75rem' }}>
                            無時間數據
                          </Alert>
                        )}
                        {course.raw_day1 && course.raw_st1 && !timeMapping[course.raw_day1] && (
                          <Alert severity="error" sx={{ p: 0.5, fontSize: '0.75rem' }}>
                            未知星期編碼: {course.raw_day1}
                          </Alert>
                        )}
                        {course.raw_day1 && course.raw_st1 && !timeMapping[course.raw_st1] && (
                          <Alert severity="error" sx={{ p: 0.5, fontSize: '0.75rem' }}>
                            未知時間編碼: {course.raw_st1}
                          </Alert>
                        )}
                        {course.raw_day1 && course.raw_st1 && timeMapping[course.raw_day1] && timeMapping[course.raw_st1] && (
                          <Alert severity="success" sx={{ p: 0.5, fontSize: '0.75rem' }}>
                            ✓ 時間解析正常
                          </Alert>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* 課表預覽 */}
      <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" sx={{ color: '#424242', fontWeight: 600, mb: 3 }}>
          📅 課表預覽 (基於解析數據)
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* 星期標題 */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Box sx={{ width: '100px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                時間
              </Typography>
            </Box>
            {['一', '二', '三', '四', '五', '六', '日'].map((day, index) => (
              <Box key={index} sx={{ flex: 1, height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  星期{day}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* 時間段 */}
          {['08:10-09:00', '09:10-10:00', '10:20-11:10', '11:20-12:10', '12:20-13:10', '13:20-14:10', '14:20-15:10', '15:30-16:20'].map((time, timeIndex) => (
            <Box key={timeIndex} sx={{ display: 'flex', gap: 1 }}>
              {/* 時間標籤 */}
              <Box sx={{ width: '100px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f8f8', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  {time}
                </Typography>
              </Box>
              
              {/* 每天的課程 */}
              {[1, 2, 3, 4, 5, 6, 7].map((dayIndex) => {
                // 找到這個時間段的課程
                const courseInSlot = debugData.find(course => {
                  const courseData = course as any
                  return (
                    (courseData.raw_day1 === dayIndex.toString() && courseData.raw_st1 === (timeIndex + 1).toString()) ||
                    (courseData.raw_day2 === dayIndex.toString() && courseData.raw_st2 === (timeIndex + 1).toString()) ||
                    (courseData.raw_day3 === dayIndex.toString() && courseData.raw_st3 === (timeIndex + 1).toString())
                  )
                })
                
                return (
                  <Box key={dayIndex} sx={{ flex: 1, height: '60px', p: 0.5 }}>
                    {courseInSlot ? (
                      <Card 
                        elevation={1} 
                        sx={{ 
                          height: '100%', 
                          backgroundColor: '#e3f2fd',
                          border: '1px solid #1976d2',
                          borderRadius: 1
                        }}
                      >
                        <CardContent sx={{ p: 0.5, '&:last-child': { pb: 0.5 } }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: '#1976d2', display: 'block', fontSize: '0.7rem' }}>
                            {courseInSlot.cou_cname}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#666', display: 'block', fontSize: '0.6rem' }}>
                            {courseInSlot.tea_cname}
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
    </Container>
  )
}
