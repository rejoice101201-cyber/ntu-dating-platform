import React from 'react'
import { useCourseContext } from '../context/CourseContext'

// 簡單的測試組件來驗證最愛功能
export default function FavoritesTest() {
  const { favorites, addToFavorites, removeFromFavorites, favoriteCourses } = useCourseContext()

  const testCourse = {
    ser_no: 'test-001',
    cou_cname: '測試課程',
    cou_ename: 'Test Course',
    tea_cname: '測試教師',
    cou_code: 'TEST001',
    credit: '3',
    dpt_code: 'TEST',
    dpt_abbr: 'TEST',
    co_tp: '選修',
    mark: '',
    co_rep: '',
    pre_course: ''
  }

  const handleAddTest = () => {
    console.log('Adding test course to favorites')
    addToFavorites(testCourse)
  }

  const handleRemoveTest = () => {
    console.log('Removing test course from favorites')
    removeFromFavorites('test-001')
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>最愛功能測試</h3>
      <p>當前最愛數量: {favorites.size}</p>
      <p>最愛課程數量: {favoriteCourses.length}</p>
      <p>是否包含測試課程: {favorites.has('test-001') ? '是' : '否'}</p>
      
      <button onClick={handleAddTest} style={{ margin: '5px', padding: '10px' }}>
        加入測試課程
      </button>
      
      <button onClick={handleRemoveTest} style={{ margin: '5px', padding: '10px' }}>
        移除測試課程
      </button>
      
      <div>
        <h4>最愛課程列表:</h4>
        {favoriteCourses.map(course => (
          <div key={course.ser_no} style={{ padding: '5px', border: '1px solid #eee' }}>
            {course.cou_cname} ({course.ser_no})
          </div>
        ))}
      </div>
    </div>
  )
}
