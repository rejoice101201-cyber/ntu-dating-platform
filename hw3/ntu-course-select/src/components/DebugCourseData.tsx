import { useCourseData } from '../hooks/useCourseData'

export default function DebugCourseData() {
  const { courses, isLoading, error } = useCourseData()

  if (isLoading) {
    return <div className="p-4 bg-yellow-50 rounded">🔄 Loading courses...</div>
  }

  if (error) {
    return <div className="p-4 bg-red-50 rounded">❌ Error: {error}</div>
  }

  if (courses.length === 0) {
    return <div className="p-4 bg-orange-50 rounded">⚠️ No courses loaded</div>
  }

  const firstCourse = courses[0]
  const coursesWithTimeSlots = courses.filter(c => c.timeSlots && c.timeSlots.length > 0)
  const coursesWithoutTimeSlots = courses.filter(c => !c.timeSlots || c.timeSlots.length === 0)

  return (
    <div className="p-4 bg-blue-50 rounded-lg space-y-4">
      <h3 className="text-lg font-semibold">🔍 Course Data Debug</h3>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <strong>Total Courses:</strong> {courses.length}
        </div>
        <div>
          <strong>With Time Slots:</strong> {coursesWithTimeSlots.length}
        </div>
        <div>
          <strong>Without Time Slots:</strong> {coursesWithoutTimeSlots.length}
        </div>
        <div>
          <strong>First Course ID:</strong> {firstCourse.ser_no}
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">First Course Details:</h4>
        <div className="bg-white p-3 rounded text-xs space-y-1">
          <div><strong>Name:</strong> {firstCourse.cou_cname || firstCourse.cou_ename}</div>
          <div><strong>Teacher:</strong> {firstCourse.tea_cname || firstCourse.tea_ename}</div>
          <div><strong>Time Slots:</strong> {JSON.stringify(firstCourse.timeSlots)}</div>
          <div><strong>Raw Time Data:</strong> st1={firstCourse.st1}, day1={firstCourse.day1}, st2={firstCourse.st2}, day2={firstCourse.day2}</div>
          <div><strong>Classrooms:</strong> clsrom_1={firstCourse.clsrom_1}, clsrom_2={firstCourse.clsrom_2}</div>
        </div>
      </div>

      {coursesWithoutTimeSlots.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Courses Without Time Slots (first 5):</h4>
          <div className="space-y-1">
            {coursesWithoutTimeSlots.slice(0, 5).map(course => (
              <div key={course.ser_no} className="bg-white p-2 rounded text-xs">
                <strong>{course.cou_cname || course.cou_ename}</strong> - 
                st1={course.st1}, day1={course.day1}, st2={course.st2}, day2={course.day2}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
