import React, { useState } from 'react'
import { useCourseContext } from '../context/CourseContext'

// 詳細的測試組件來驗證最愛功能
export default function FavoritesTest() {
  const { favorites, addToFavorites, removeFromFavorites, favoriteCourses } = useCourseContext()
  const [testResults, setTestResults] = useState<string[]>([])

  const testCourse1 = {
    ser_no: 'test-001',
    cou_cname: '測試課程1',
    cou_ename: 'Test Course 1',
    tea_cname: '測試教師1',
    cou_code: 'TEST001',
    credit: '3',
    dpt_code: 'TEST',
    dpt_abbr: 'TEST',
    co_tp: '選修',
    mark: '',
    co_rep: '',
    pre_course: ''
  }

  const testCourse2 = {
    ser_no: 'test-002',
    cou_cname: '測試課程2',
    cou_ename: 'Test Course 2',
    tea_cname: '測試教師2',
    cou_code: 'TEST002',
    credit: '2',
    dpt_code: 'TEST',
    dpt_abbr: 'TEST',
    co_tp: '必修',
    mark: '',
    co_rep: '',
    pre_course: ''
  }

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setTestResults(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const handleAddTest1 = () => {
    addLog(`嘗試加入測試課程1 (${testCourse1.ser_no})`)
    console.log('Adding test course 1 to favorites:', testCourse1)
    addToFavorites(testCourse1)
    setTimeout(() => {
      addLog(`加入後最愛數量: ${favorites.size + 1}, 是否包含: ${favorites.has(testCourse1.ser_no) ? '是' : '否'}`)
    }, 100)
  }

  const handleAddTest2 = () => {
    addLog(`嘗試加入測試課程2 (${testCourse2.ser_no})`)
    console.log('Adding test course 2 to favorites:', testCourse2)
    addToFavorites(testCourse2)
    setTimeout(() => {
      addLog(`加入後最愛數量: ${favorites.size + 1}, 是否包含: ${favorites.has(testCourse2.ser_no) ? '是' : '否'}`)
    }, 100)
  }

  const handleRemoveTest1 = () => {
    addLog(`嘗試移除測試課程1 (${testCourse1.ser_no})`)
    console.log('Removing test course 1 from favorites')
    removeFromFavorites('test-001')
    setTimeout(() => {
      addLog(`移除後最愛數量: ${favorites.size - 1}, 是否包含: ${favorites.has(testCourse1.ser_no) ? '是' : '否'}`)
    }, 100)
  }

  const handleRemoveTest2 = () => {
    addLog(`嘗試移除測試課程2 (${testCourse2.ser_no})`)
    console.log('Removing test course 2 from favorites')
    removeFromFavorites('test-002')
    setTimeout(() => {
      addLog(`移除後最愛數量: ${favorites.size - 1}, 是否包含: ${favorites.has(testCourse2.ser_no) ? '是' : '否'}`)
    }, 100)
  }

  const clearLogs = () => {
    setTestResults([])
  }

  return (
    <div style={{ padding: '20px', border: '2px solid #ff6b6b', margin: '10px', backgroundColor: '#fff5f5' }}>
      <h3 style={{ color: '#d63031' }}>🔧 最愛功能詳細測試</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h4>當前狀態</h4>
          <p><strong>最愛 Set 數量:</strong> {favorites.size}</p>
          <p><strong>最愛課程陣列數量:</strong> {favoriteCourses.length}</p>
          <p><strong>包含測試課程1:</strong> {favorites.has('test-001') ? '✅ 是' : '❌ 否'}</p>
          <p><strong>包含測試課程2:</strong> {favorites.has('test-002') ? '✅ 是' : '❌ 否'}</p>
          
          <h4>測試操作</h4>
          <button onClick={handleAddTest1} style={{ margin: '5px', padding: '10px', backgroundColor: '#00b894', color: 'white', border: 'none', borderRadius: '4px' }}>
            加入測試課程1
          </button>
          <button onClick={handleAddTest2} style={{ margin: '5px', padding: '10px', backgroundColor: '#00b894', color: 'white', border: 'none', borderRadius: '4px' }}>
            加入測試課程2
          </button>
          <br/>
          <button onClick={handleRemoveTest1} style={{ margin: '5px', padding: '10px', backgroundColor: '#e17055', color: 'white', border: 'none', borderRadius: '4px' }}>
            移除測試課程1
          </button>
          <button onClick={handleRemoveTest2} style={{ margin: '5px', padding: '10px', backgroundColor: '#e17055', color: 'white', border: 'none', borderRadius: '4px' }}>
            移除測試課程2
          </button>
          <br/>
          <button onClick={clearLogs} style={{ margin: '5px', padding: '10px', backgroundColor: '#636e72', color: 'white', border: 'none', borderRadius: '4px' }}>
            清除日誌
          </button>
        </div>
        
        <div>
          <h4>最愛課程列表</h4>
          {favoriteCourses.length === 0 ? (
            <p style={{ color: '#636e72' }}>沒有最愛課程</p>
          ) : (
            favoriteCourses.map(course => (
              <div key={course.ser_no} style={{ padding: '8px', border: '1px solid #ddd', margin: '5px 0', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                <strong>{course.cou_cname}</strong><br/>
                <small>ID: {course.ser_no} | 教師: {course.tea_cname}</small>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h4>測試日誌</h4>
        <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', backgroundColor: '#f8f9fa' }}>
          {testResults.length === 0 ? (
            <p style={{ color: '#636e72' }}>還沒有測試日誌</p>
          ) : (
            testResults.map((log, index) => (
              <div key={index} style={{ margin: '2px 0', fontSize: '12px', fontFamily: 'monospace' }}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
