import { useEffect, useState } from 'react'
import Papa from 'papaparse'

export default function CSVTest() {
  const [status, setStatus] = useState('Testing CSV loading...')
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    const testCSV = () => {
      setStatus('Testing CSV loading...')
      
      // Test multiple paths
      const paths = [
        '/data/hw3-ntucourse-data-1002.csv',
        '/src/public/data/hw3-ntucourse-data-1002.csv',
        './data/hw3-ntucourse-data-1002.csv'
      ]
      
      let currentPathIndex = 0
      
      const tryNextPath = () => {
        if (currentPathIndex >= paths.length) {
          setStatus('All paths failed. Check console for errors.')
          return
        }
        
        const path = paths[currentPathIndex]
        setStatus(`Trying path: ${path}`)
        
        Papa.parse(path, {
          download: true,
          header: true,
          worker: true,
          skipEmptyLines: true,
          complete: (results) => {
            console.log(`CSV loaded successfully from ${path}:`, results.data.length, 'rows')
            setData(results.data.slice(0, 5)) // Show first 5 rows
            setStatus(`✅ CSV loaded successfully from ${path}! ${results.data.length} rows found.`)
          },
          error: (error) => {
            console.error(`CSV loading error from ${path}:`, error)
            setStatus(`❌ Error loading CSV from ${path}: ${error.message}`)
            currentPathIndex++
            setTimeout(tryNextPath, 1000) // Try next path after 1 second
          }
        })
      }
      
      tryNextPath()
    }

    testCSV()
  }, [])

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">CSV Loading Test</h3>
      <p className="mb-4">{status}</p>
      
      {data.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">First 5 rows:</h4>
          <pre className="bg-white p-2 rounded text-xs overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
