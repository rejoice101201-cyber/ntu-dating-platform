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
  Card,
  CardContent,
  Chip,
  Alert
} from '@mui/material'
import { ArrowBack, CalendarToday, Refresh } from '@mui/icons-material'
import BreadcrumbNav from '../components/BreadcrumbNav'

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

export default function Results() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([])

  useEffect(() => {
    if (location.state?.selectedCourses) {
      setSelectedCourses(location.state.selectedCourses)
    } else {
      // 如果沒有選課結果，返回首頁
      navigate('/')
    }
  }, [location.state, navigate])

  const totalCredits = selectedCourses.reduce((sum, course) => sum + parseInt(course.credit || '0'), 0)

  const handleViewSchedule = () => {
    navigate('/schedule', { state: { courses: selectedCourses } })
  }

  const handleRestart = () => {
    navigate('/favorites')
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* 頂部導航欄 */}
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            選課結果
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* 麵包屑導航 */}
        <BreadcrumbNav 
          items={[
            { label: '首頁', path: '/' },
            { label: '選課結果', path: '/schedule' },
            { label: '最終結果', path: '/final-results', clickable: false }
          ]} 
        />

        {/* 標題和統計 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ color: '#424242', fontWeight: 600, mb: 2 }}>
            🎉 選課結果
          </Typography>
          <Typography variant="body1" sx={{ color: '#757575' }}>
            恭喜！您成功選中了 {selectedCourses.length} 門課程，共 {totalCredits} 學分
          </Typography>
        </Box>

        {/* 選課成功提示 */}
        <Alert severity="success" sx={{ mb: 4 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            選課成功！
          </Typography>
          <Typography variant="body2">
            系統已根據您設定的機率隨機選出課程。您可以查看詳細的課表安排。
          </Typography>
        </Alert>

        {/* 選中課程列表 */}
        <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h6" sx={{ color: '#424242', fontWeight: 600, mb: 3 }}>
            📚 選中的課程
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {selectedCourses.map((course, index) => (
              <Card key={`${course.ser_no}-${index}`} elevation={1} sx={{ borderRadius: 2, border: '2px solid #4caf50' }}>
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
                        <Chip label={`教師: ${course.tea_cname}`} size="small" color="primary" />
                        <Chip label={`代碼: ${course.cou_code}`} size="small" color="primary" />
                        <Chip label={`學分: ${course.credit}`} size="small" color="primary" />
                      </Box>
                    </Box>
                    
                    <Chip 
                      label="已選中" 
                      color="success" 
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Paper>

        {/* 操作按鈕 */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleViewSchedule}
            startIcon={<CalendarToday />}
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
            查看課表
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            onClick={handleRestart}
            startIcon={<Refresh />}
            sx={{
              borderColor: '#1976d2',
              color: '#1976d2',
              '&:hover': {
                borderColor: '#1565c0',
                backgroundColor: '#e3f2fd'
              },
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600
            }}
          >
            重新選課
          </Button>
        </Box>

        {/* 注意事項 */}
        <Alert severity="info" sx={{ mt: 4 }}>
          <Typography variant="body2">
            <strong>注意事項：</strong>
            <br />• 選課結果已確定，無法修改
            <br />• 如有時間衝突，請自行調整
            <br />• 可以點擊「查看課表」查看詳細的時間安排
            <br />• 如需重新選課，請點擊「重新選課」返回我的最愛頁面
          </Typography>
        </Alert>
      </Container>
    </Box>
  )
}
