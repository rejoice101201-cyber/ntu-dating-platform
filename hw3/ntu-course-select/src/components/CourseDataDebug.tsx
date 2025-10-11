import { useEffect, useState } from 'react'
import { Box, Typography, Button, Alert } from '@mui/material'
import Papa from 'papaparse'
import { mapRowToCourse } from '../hooks/useCourseData'

export default function CourseDataDebug() {
  const [status, setStatus] = useState('Testing CSV loading...')
  const [data, setData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testCSV = () => {
      setStatus('Loading CSV from /data/hw3-ntucourse-data-1002.csv...')
      
      Papa.parse('/data/hw3-ntucourse-data-1002.csv', {
        download: true,
        header: true,
        worker: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log('CSV loaded successfully:', results.data.length, 'rows')
          console.log('First few rows:', results.data.slice(0, 3))
          
          // Test mapping
          const mapped = results.data.slice(0, 5).map(mapRowToCourse).filter(Boolean)
          console.log('Mapped courses:', mapped)
          
          setData(mapped)
          setStatus(`✅ CSV loaded successfully! ${results.data.length} rows found, ${mapped.length} valid courses.`)
        },
        error: (error) => {
          console.error('CSV loading error:', error)
          setError(`❌ Error loading CSV: ${error.message}`)
          setStatus(`❌ Error loading CSV: ${error.message}`)
        }
      })
    }

    testCSV()
  }, [])

  return (
    <Box sx={{ 
      position: 'fixed', 
      top: 16, 
      right: 16, 
      width: 400, 
      maxHeight: '80vh', 
      overflow: 'auto',
      backgroundColor: 'white',
      border: '2px solid #1976d2',
      borderRadius: 2,
      p: 2,
      zIndex: 9999,
      boxShadow: 3
    }}>
      <Typography variant="h6" sx={{ color: '#1976d2', mb: 2 }}>
        🔍 Course Data Debug
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 2, color: '#424242' }}>
        {status}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {data.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, color: '#424242' }}>
            First {data.length} courses:
          </Typography>
          {data.map((course, index) => (
            <Box key={index} sx={{ mb: 1, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold' }}>
                {course.cou_cname || course.cou_ename || 'No name'}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: '#757575' }}>
                Teacher: {course.tea_cname || course.tea_ename || '—'}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: '#757575' }}>
                Time: {course.timeSlots?.length || 0} slots
              </Typography>
            </Box>
          ))}
        </Box>
      )}
      
      <Button 
        variant="outlined" 
        size="small" 
        onClick={() => window.location.reload()}
        sx={{ mt: 2 }}
      >
        Refresh Page
      </Button>
    </Box>
  )
}
