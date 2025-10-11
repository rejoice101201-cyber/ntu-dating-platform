// 課程分析頁面 - 用於分析課程數據和分類效果
import { useState, useEffect } from 'react'
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  Button,
  Grid
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { COURSE_CATEGORIES, classifyCourse, getCategoryStats } from '../utils/courseClassifier'
import { analyzeCourses, generateClassificationSuggestions } from '../utils/courseAnalyzer'
import { classifyCourseWithNLP, classifyCoursesBatch, generateNLPImprovements } from '../utils/nlpClassifier'

interface FullCourse {
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

export default function CourseAnalysis() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState<FullCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [analysis, setAnalysis] = useState<any>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [nlpAnalysis, setNlpAnalysis] = useState<any>(null)
  const [nlpSuggestions, setNlpSuggestions] = useState<string[]>([])

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/data/hw3-ntucourse-data-1002.csv')
      const csvText = await response.text()
      
      const lines = csvText.split('\n')
      const headers = lines[0].split(',')
      
      const courseData: FullCourse[] = []
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        
        const values = parseCSVLine(line)
        if (values.length >= headers.length) {
          const course: FullCourse = {
            ser_no: values[0] || `auto-${i}`,
            cou_cname: values[12] || '',
            cou_ename: values[13] || '',
            tea_cname: values[15] || '',
            cou_code: values[5] || '',
            credit: values[7] || '',
            dpt_code: values[3] || '',
            dpt_abbr: values[49] || '',
            co_tp: values[8] || '',
            mark: values[9] || '',
            co_rep: values[10] || '',
            pre_course: values[11] || ''
          }
          
          if (course.cou_cname && course.tea_cname) {
            courseData.push(course)
          }
        }
      }
      
      setCourses(courseData)
      
      // 進行課程分析
      const analysisResult = analyzeCourses(courseData)
      setAnalysis(analysisResult)
      
      // 生成分類建議
      const classificationSuggestions = generateClassificationSuggestions(courseData)
      setSuggestions(classificationSuggestions)
      
      // NLP 分析
      const nlpResult = classifyCoursesBatch(courseData)
      setNlpAnalysis(nlpResult)
      
      // NLP 改進建議
      const nlpImprovements = generateNLPImprovements(courseData)
      setNlpSuggestions(nlpImprovements)
      
    } catch (error) {
      console.error('載入課程數據失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ textAlign: 'center', color: '#666' }}>
          載入課程分析中...
        </Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 標題 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
        >
          返回首頁
        </Button>
        <Typography variant="h4" sx={{ color: '#424242', fontWeight: 600 }}>
          🧠 台大課程 NLP 智能分析
        </Typography>
      </Box>

      {/* 總體統計 */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#424242' }}>
          📊 總體統計
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#e3f2fd', borderRadius: 2 }}>
              <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                {nlpAnalysis?.classified?.length + nlpAnalysis?.uncategorized?.length || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                總課程數
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#e8f5e8', borderRadius: 2 }}>
              <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                {nlpAnalysis?.classified?.length || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                NLP 已分類
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#fff3e0', borderRadius: 2 }}>
              <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                {nlpAnalysis?.uncategorized?.length || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                NLP 未分類
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f3e5f5', borderRadius: 2 }}>
              <Typography variant="h4" sx={{ color: '#9c27b0', fontWeight: 'bold' }}>
                {COURSE_CATEGORIES.length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                分類類別
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 分類統計表 */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#424242' }}>
          🎯 分類統計
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>分類</TableCell>
                <TableCell align="right">課程數</TableCell>
                <TableCell align="right">百分比</TableCell>
                <TableCell>樣本課程</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(analysis?.categoryStats || {}).map(([categoryId, stats]: [string, any]) => {
                const category = COURSE_CATEGORIES.find(cat => cat.id === categoryId)
                return (
                  <TableRow key={categoryId}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box 
                          sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            backgroundColor: category?.color || '#666' 
                          }} 
                        />
                        <Typography variant="body2">
                          {category?.name || categoryId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {stats.count}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {stats.percentage}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {stats.sampleCourses.slice(0, 2).map((course: string, index: number) => (
                          <Chip 
                            key={index}
                            label={course} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* NLP 改進建議 */}
      {nlpSuggestions.length > 0 && (
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#424242' }}>
            🧠 NLP 智能分析建議
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {nlpSuggestions.map((suggestion, index) => (
              <Typography key={index} variant="body2" sx={{ color: '#666', pl: 2 }}>
                • {suggestion}
              </Typography>
            ))}
          </Box>
        </Paper>
      )}

      {/* 傳統分類建議 */}
      {suggestions.length > 0 && (
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#424242' }}>
            💡 傳統分類建議
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {suggestions.map((suggestion, index) => (
              <Typography key={index} variant="body2" sx={{ color: '#666', pl: 2 }}>
                • {suggestion}
              </Typography>
            ))}
          </Box>
        </Paper>
      )}

      {/* 課號前綴分析 */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#424242' }}>
          🔢 課號前綴分析
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>前綴</TableCell>
                <TableCell align="right">課程數</TableCell>
                <TableCell>樣本課程</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(analysis?.prefixStats || {})
                .sort(([,a], [,b]) => (b as any).count - (a as any).count)
                .slice(0, 15)
                .map(([prefix, stats]: [string, any]) => (
                <TableRow key={prefix}>
                  <TableCell>
                    <Chip label={prefix} size="small" color="primary" />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {stats.count}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {stats.sampleCourses.slice(0, 2).join(', ')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  )
}
