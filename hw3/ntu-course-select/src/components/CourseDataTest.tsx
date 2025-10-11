import { useCourseData } from '../hooks/useCourseData'

export default function CourseDataTest() {
  const { courses, isLoading, error } = useCourseData()

  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Course Data Test</h3>
      
      {isLoading && (
        <p className="text-blue-600">🔄 Loading courses...</p>
      )}
      
      {error && (
        <p className="text-red-600">❌ Error: {error}</p>
      )}
      
      {!isLoading && !error && (
        <div>
          <p className="text-green-600">✅ Courses loaded successfully!</p>
          <p className="text-sm text-gray-600 mt-2">
            Total courses: <span className="font-semibold">{courses.length}</span>
          </p>
          
          {courses.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">First 3 courses:</h4>
              <div className="space-y-2">
                {courses.slice(0, 3).map((course, index) => (
                  <div key={course.ser_no} className="bg-white p-2 rounded text-sm">
                    <p><strong>ID:</strong> {course.ser_no}</p>
                    <p><strong>Name:</strong> {course.cou_cname || course.cou_ename}</p>
                    <p><strong>Code:</strong> {course.cou_code}</p>
                    <p><strong>Teacher:</strong> {course.tea_cname || course.tea_ename || '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
