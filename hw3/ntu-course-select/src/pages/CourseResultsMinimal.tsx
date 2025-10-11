import { useSearchParams, useNavigate } from 'react-router-dom'
import { 
  Container, 
  Typography, 
  Box, 
  Button,
  Paper,
  TextField,
  Card,
  CardContent,
  Chip
} from '@mui/material'
import { Search, ArrowBack } from '@mui/icons-material'

export default function CourseResultsMinimal() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const keyword = searchParams.get('keyword') || ''

  // 模擬課程數據
  const mockCourses = [
    {
      ser_no: '1',
      cou_cname: '國文',
      cou_ename: 'Chinese Literature',
      tea_cname: '王老師',
      cou_code: 'CHIN1001',
      credit: 3,
      selectionProbability: 85,
      limit: 50,
      dpt_code: 'CHIN'
    },
    {
      ser_no: '2',
      cou_cname: '英文',
      cou_ename: 'English',
      tea_cname: '李老師',
      cou_code: 'ENGL1001',
      credit: 3,
      selectionProbability: 75,
      limit: 40,
      dpt_code: 'ENGL'
    },
    {
      ser_no: '3',
      cou_cname: '數學',
      cou_ename: 'Mathematics',
      tea_cname: '張老師',
      cou_code: 'MATH1001',
      credit: 4,
      selectionProbability: 60,
      limit: 30,
      dpt_code: 'MATH'
    }
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 標題列 */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, backgroundColor: '#f5f5f5' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/')}
            sx={{ minWidth: 'auto' }}
          >
            返回
          </Button>
          <Typography variant="h4" sx={{ color: '#424242', fontWeight: 600 }}>
            課程搜尋結果
          </Typography>
        </Box>
        
        <Typography variant="body1" sx={{ color: '#757575' }}>
          搜尋關鍵字: "{keyword}"
        </Typography>
      </Paper>

      {/* 調試信息 */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, backgroundColor: '#e3f2fd' }}>
        <Typography variant="body2" sx={{ color: '#1976d2' }}>
          🎉 最簡化版本正常運作！模擬課程數據載入成功
        </Typography>
      </Paper>

      {/* 課程列表 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {mockCourses.map((course) => (
          <Card key={course.ser_no} elevation={1}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
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
                </Box>
                
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => alert(`加入選課: ${course.cou_cname}`)}
                >
                  加入選課
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={`中簽率 ${course.selectionProbability}%`} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
                <Chip 
                  label={`限修 ${course.limit}`} 
                  size="small" 
                  color="secondary" 
                  variant="outlined"
                />
                <Chip 
                  label={course.dpt_code} 
                  size="small" 
                  color="default" 
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  )
}
