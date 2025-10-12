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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { List } from '@mui/icons-material'
import { assignRandomTimeSlots } from '../utils/simpleTimeAssigner'
import { useCourseContext } from '../context/CourseContext'
import CourseInfoMenu from '../components/CourseInfoMenu'

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

// 台大課表時間對應 (匹配simpleTimeAssigner的1-8節課)
const TIME_SLOTS = [
  { period: '1', time: '08:10-09:00' },
  { period: '2', time: '09:10-10:00' },
  { period: '3', time: '10:20-11:10' },
  { period: '4', time: '11:20-12:10' },
  { period: '5', time: '12:20-13:10' },
  { period: '6', time: '13:20-14:10' },
  { period: '7', time: '14:20-15:10' },
  { period: '8', time: '15:30-16:20' }
]

const DAYS = ['一', '二', '三', '四', '五', '六', '日']

export default function Schedule() {
  const navigate = useNavigate()
  const location = useLocation()
  const { lastLotteryResults } = useCourseContext()
  const [courses, setCourses] = useState<Course[]>([])
  const [courseInfoMenuOpen, setCourseInfoMenuOpen] = useState(false)
  const [noResultsDialogOpen, setNoResultsDialogOpen] = useState(false)

  useEffect(() => {
    // 優先使用傳遞的課程，否則使用上次的選課結果
    if (location.state?.courses) {
      setCourses(location.state.courses)
    } else if (lastLotteryResults.length > 0) {
      setCourses(lastLotteryResults)
    } else {
      navigate('/')
    }
  }, [location.state, lastLotteryResults, navigate])

  // 使用真實時間數據安排課程，按志願序優先處理
  const getRealSchedule = () => {
    const schedule: { [key: string]: { [key: string]: Course } } = {}
    
    // 初始化空課表
    DAYS.forEach(day => {
      schedule[day] = {}
    })

    // 按志願序排序課程，優先處理志願序高的課程
    const sortedCourses = [...courses].sort((a, b) => {
      const priorityA = a.priority || 999
      const priorityB = b.priority || 999
      return priorityA - priorityB
    })

    console.log(`📊 按志願序排序的課程:`, sortedCourses.map(c => `${c.priority || 999}. ${c.cou_cname}`))

    // 為每門課程分配真實時間，按志願序優先處理
    sortedCourses.forEach((course) => {
      // 使用時間分配器為課程分配時間
      const courseWithTime = assignRandomTimeSlots(course)
      
      console.log(`📅 處理課程: ${course.cou_cname}, 學分: ${course.credit}, 志願序: ${course.priority || '未設定'}`)
      console.log(`📅 分配時間:`, {
        day1: courseWithTime.day1, st1: courseWithTime.st1,
        day2: courseWithTime.day2, st2: courseWithTime.st2,
        day3: courseWithTime.day3, st3: courseWithTime.st3,
        day4: courseWithTime.day4, st4: courseWithTime.st4,
        day5: courseWithTime.day5, st5: courseWithTime.st5,
        day6: courseWithTime.day6, st6: courseWithTime.st6,
        day7: courseWithTime.day7, st7: courseWithTime.st7,
        day8: courseWithTime.day8, st8: courseWithTime.st8
      })
      
      // 檢查課程是否可以放置所有時段
      const requiredSlots = parseInt(course.credit) || 3
      let canPlaceAll = true
      const timeSlots = []
      
      // 收集所有需要的時段
      if (courseWithTime.day1 && courseWithTime.st1) {
        const dayIndex = parseInt(courseWithTime.day1) - 1
        const day = DAYS[dayIndex]
        if (day) {
          timeSlots.push({ day, slot: courseWithTime.st1 })
        }
      }
      if (courseWithTime.day2 && courseWithTime.st2) {
        const dayIndex = parseInt(courseWithTime.day2) - 1
        const day = DAYS[dayIndex]
        if (day) {
          timeSlots.push({ day, slot: courseWithTime.st2 })
        }
      }
      if (courseWithTime.day3 && courseWithTime.st3) {
        const dayIndex = parseInt(courseWithTime.day3) - 1
        const day = DAYS[dayIndex]
        if (day) {
          timeSlots.push({ day, slot: courseWithTime.st3 })
        }
      }
      if (courseWithTime.day4 && courseWithTime.st4) {
        const dayIndex = parseInt(courseWithTime.day4) - 1
        const day = DAYS[dayIndex]
        if (day) {
          timeSlots.push({ day, slot: courseWithTime.st4 })
        }
      }
      if (courseWithTime.day5 && courseWithTime.st5) {
        const dayIndex = parseInt(courseWithTime.day5) - 1
        const day = DAYS[dayIndex]
        if (day) {
          timeSlots.push({ day, slot: courseWithTime.st5 })
        }
      }
      if (courseWithTime.day6 && courseWithTime.st6) {
        const dayIndex = parseInt(courseWithTime.day6) - 1
        const day = DAYS[dayIndex]
        if (day) {
          timeSlots.push({ day, slot: courseWithTime.st6 })
        }
      }
      if (courseWithTime.day7 && courseWithTime.st7) {
        const dayIndex = parseInt(courseWithTime.day7) - 1
        const day = DAYS[dayIndex]
        if (day) {
          timeSlots.push({ day, slot: courseWithTime.st7 })
        }
      }
      if (courseWithTime.day8 && courseWithTime.st8) {
        const dayIndex = parseInt(courseWithTime.day8) - 1
        const day = DAYS[dayIndex]
        if (day) {
          timeSlots.push({ day, slot: courseWithTime.st8 })
        }
      }
      
      // 檢查所有時段是否都可用
      for (const timeSlot of timeSlots) {
        if (schedule[timeSlot.day][timeSlot.slot]) {
          canPlaceAll = false
          console.log(`⚠️ 時段衝突: ${timeSlot.day} ${timeSlot.slot} 已被 ${schedule[timeSlot.day][timeSlot.slot].cou_cname} 佔用`)
          break
        }
      }
      
      // 只有當所有時段都可用時才放置課程
      if (canPlaceAll && timeSlots.length >= requiredSlots) {
        for (const timeSlot of timeSlots) {
          schedule[timeSlot.day][timeSlot.slot] = course
          console.log(`✅ 放置時段: ${timeSlot.day} ${timeSlot.slot} = ${course.cou_cname}`)
        }
        console.log(`🎉 課程 "${course.cou_cname}" 成功放置所有 ${timeSlots.length} 個時段`)
      } else {
        console.log(`❌ 課程 "${course.cou_cname}" 無法放置所有時段，已移除`)
      }
    })

    return schedule
  }

  const schedule = getRealSchedule()
  const totalCredits = courses.reduce((sum, course) => sum + parseInt(course.credit || '0'), 0)

  const handleScheduleClick = () => {
    if (lastLotteryResults.length === 0) {
      setNoResultsDialogOpen(true)
    } else {
      navigate('/schedule')
    }
  }

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

      <Container maxWidth="xl" sx={{ py: 4 }}>

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

        {/* 未排課課程列表 */}
        {(() => {
          const placedCourses = new Set()
          const schedule = getRealSchedule()
          
          // 收集已排課的課程
          DAYS.forEach(day => {
            TIME_SLOTS.forEach(slot => {
              if (schedule[day] && schedule[day][slot.period]) {
                placedCourses.add(schedule[day][slot.period].ser_no)
              }
            })
          })
          
          // 找出未排課的課程
          const unplacedCourses = courses.filter(course => !placedCourses.has(course.ser_no))
          
          if (unplacedCourses.length > 0) {
            return (
              <Paper elevation={1} sx={{ p: 3, mt: 3, backgroundColor: '#fff3e0' }}>
                <Typography variant="h6" sx={{ color: '#f57c00', fontWeight: 600, mb: 2 }}>
                  ⚠️ 已抽中但未排課的課程 ({unplacedCourses.length}門)
                </Typography>
                <Typography variant="body2" sx={{ color: '#757575', mb: 2 }}>
                  以下課程已成功抽中，但因時間安排問題未能顯示在課表中：
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {unplacedCourses.map((course, index) => (
                    <Box 
                      key={course.ser_no} 
                      sx={{ 
                        p: 2, 
                        border: '1px solid #ffcc02', 
                        borderRadius: 1, 
                        backgroundColor: '#fffbf0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#424242' }}>
                          {course.cou_cname}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#757575' }}>
                          教師: {course.tea_cname} | 課程代碼: {course.cou_code} | 學分: {course.credit}
                        </Typography>
                      </Box>
                      <Chip
                        label={`中籤率: ${((course.probability || 0.5) * 100).toFixed(1)}%`}
                        size="small"
                        sx={{
                          backgroundColor: course.probability && course.probability > 0.7 ? '#e8f5e8' : 
                                         course.probability && course.probability > 0.4 ? '#fff3e0' : '#ffebee',
                          borderColor: course.probability && course.probability > 0.7 ? '#4caf50' : 
                                     course.probability && course.probability > 0.4 ? '#ff9800' : '#f44336',
                          color: course.probability && course.probability > 0.7 ? '#2e7d32' : 
                                 course.probability && course.probability > 0.4 ? '#f57c00' : '#d32f2f'
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Paper>
            )
          }
          return null
        })()}
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
