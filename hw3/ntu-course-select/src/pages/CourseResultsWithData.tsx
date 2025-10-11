import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { 
  Container, 
  Typography, 
  Box, 
  Button,
  Paper,
  Card,
  CardContent,
  Chip,
  CircularProgress
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'

interface SimpleCourse {
  ser_no: string
  cou_cname: string
  cou_ename: string
  tea_cname: string
  cou_code: string
  credit: number
  dpt_code: string
}

export default function CourseResultsWithData() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const keyword = searchParams.get('keyword') || ''
  
  const [courses, setCourses] = useState<SimpleCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        console.log('開始載入 CSV 數據...')
        
        // 使用 fetch 直接載入 CSV
        const response = await fetch('/data/hw3-ntucourse-data-1002.csv')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const csvText = await response.text()
        console.log('CSV 載入成功，長度:', csvText.length)
        
        // 改善的 CSV 解析
        const lines = csvText.split('\n')
        const headers = lines[0].split(',')
        console.log('CSV 標題:', headers.slice(0, 10)) // 只顯示前10個標題
        
        const parsedCourses: SimpleCourse[] = []
        
        // 解析前 5000 行數據，跳過沒有教師姓名的課程
        for (let i = 1; i <= Math.min(5000, lines.length - 1); i++) {
          const line = lines[i]
          if (!line.trim()) continue
          
          // 簡單的 CSV 解析，處理引號
          const values: string[] = []
          let current = ''
          let inQuotes = false
          
          for (let j = 0; j < line.length; j++) {
            const char = line[j]
            if (char === '"') {
              inQuotes = !inQuotes
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim())
              current = ''
            } else {
              current += char
            }
          }
          values.push(current.trim()) // 添加最後一個值
          
          if (values.length < headers.length) continue
          
          const course: SimpleCourse = {
            ser_no: values[1]?.trim() || `course-${i}`, // ser_no (index 1)
            cou_cname: values[12]?.trim() || '', // cou_cname (index 12)
            cou_ename: values[13]?.trim() || '', // cou_ename (index 13)
            tea_cname: values[16]?.trim() || '', // tea_cname (index 16)
            cou_code: values[5]?.trim() || '', // cou_code (index 5)
            credit: parseInt(values[7]) || 0, // credit (index 7)
            dpt_code: values[3]?.trim() || '' // dpt_code (index 3)
          }
          
          // 只添加有課程名稱且有教師姓名的課程
          if (course.cou_cname && course.tea_cname) {
            parsedCourses.push(course)
            // 調試：顯示前幾個課程的詳細信息
            if (parsedCourses.length <= 5) {
              console.log(`課程 ${parsedCourses.length}:`, {
                ser_no: course.ser_no,
                cou_cname: course.cou_cname,
                tea_cname: course.tea_cname,
                cou_code: course.cou_code,
                credit: course.credit,
                dpt_code: course.dpt_code
              })
            }
          }
        }
        
        console.log('解析完成，課程數量:', parsedCourses.length)
        console.log('前5門課程:', parsedCourses.slice(0, 5).map(c => ({ name: c.cou_cname, teacher: c.tea_cname })))
        console.log('載入範圍: 前', Math.min(5000, lines.length - 1), '行，總行數:', lines.length - 1)
        setCourses(parsedCourses)
        
      } catch (err) {
        console.error('載入課程數據時發生錯誤:', err)
        setError(err instanceof Error ? err.message : '載入失敗')
      } finally {
        setIsLoading(false)
      }
    }

    loadCourses()
  }, [])

  // 過濾課程
  const filteredCourses = courses.filter(course => {
    if (!keyword.trim()) return true
    const searchTerm = keyword.toLowerCase()
    return (
      course.cou_cname.toLowerCase().includes(searchTerm) ||
      course.cou_ename.toLowerCase().includes(searchTerm) ||
      course.tea_cname.toLowerCase().includes(searchTerm) ||
      course.cou_code.toLowerCase().includes(searchTerm)
    )
  })

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#757575' }}>
            🔄 載入課程中...
          </Typography>
          <Typography variant="body2" sx={{ color: '#757575', mt: 1 }}>
            正在從 CSV 文件載入課程資料
          </Typography>
        </Paper>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: '#d32f2f' }}>
            ❌ 載入錯誤
          </Typography>
          <Typography variant="body2" sx={{ color: '#757575', mt: 1 }}>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            重新載入
          </Button>
        </Paper>
      </Container>
    )
  }

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
          🎉 數據載入成功！總課程數: {courses.length} | 過濾後: {filteredCourses.length} | 搜尋關鍵字: "{keyword}"
        </Typography>
      </Paper>

      {/* 課程列表 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filteredCourses.length === 0 ? (
          <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: '#757575' }}>
              🔍 沒有找到符合條件的課程
            </Typography>
            <Typography variant="body2" sx={{ color: '#757575', mt: 1 }}>
              請嘗試其他關鍵字
            </Typography>
          </Paper>
        ) : (
          filteredCourses.map((course) => (
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
                    label={`學分 ${course.credit}`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                  <Chip 
                    label={course.dpt_code} 
                    size="small" 
                    color="secondary" 
                    variant="outlined"
                  />
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Container>
  )
}
