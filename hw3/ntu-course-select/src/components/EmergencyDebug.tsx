import { useEffect, useState } from 'react'
import Papa from 'papaparse'

export default function EmergencyDebug() {
  const [status, setStatus] = useState('Testing CSV loading...')
  const [data, setData] = useState<any[]>([])

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
          setData(results.data.slice(0, 3)) // Show first 3 rows
          setStatus(`✅ CSV loaded successfully! ${results.data.length} rows found.`)
        },
        error: (error) => {
          console.error('CSV loading error:', error)
          setStatus(`❌ Error loading CSV: ${error.message}`)
        }
      })
    }

    testCSV()
  }, [])

  return (
    <div className="fixed top-4 right-4 bg-red-100 border border-red-300 rounded-lg p-4 max-w-md z-50">
      <h3 className="text-lg font-semibold text-red-800 mb-2">🚨 Emergency Debug</h3>
      <p className="text-sm text-red-700 mb-4">{status}</p>
      
      {data.length > 0 && (
        <div>
          <h4 className="font-medium text-red-800 mb-2">First 3 rows:</h4>
          <div className="bg-white p-2 rounded text-xs overflow-auto max-h-40">
            {data.map((row, index) => (
              <div key={index} className="mb-1">
                <strong>Row {index + 1}:</strong> {row.cou_cname || row.cou_ename || 'No name'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
