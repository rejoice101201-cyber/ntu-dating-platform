import { CourseProvider, useCourseContext } from '../context/CourseContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function Inner() {
  const { courses, submittedIds, resetSubmitted } = useCourseContext()
  const submitted = courses.filter(c => submittedIds.has(c.ser_no))
  const totalCredits = submitted.reduce((sum, c) => sum + c.credit, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Submitted Courses</h2>
        <div className="text-sm text-muted-foreground">
          {submitted.length} courses • {totalCredits} credits
        </div>
      </div>
      
      <Button variant="outline" onClick={resetSubmitted} disabled={submitted.length === 0}>
        Reset All Submissions
      </Button>

      {submitted.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No courses submitted yet. Go to Selection to submit your course choices.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {submitted.map(course => (
            <Card key={course.ser_no}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{course.cou_cname || course.cou_ename}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {course.cou_code} • {course.ser_no} • {course.tea_cname || course.tea_ename}
                </div>
                <div className="text-sm text-muted-foreground">
                  {course.dpt_abbr} • {course.timeSlots?.map(ts => `${['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][ts.day]}${ts.start}`).join(', ') || '—'}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary">{course.credit}學分</Badge>
                  {course.tlec > 0 && <Badge variant="outline">{course.tlec}講</Badge>}
                  {course.tlab > 0 && <Badge variant="outline">{course.tlab}實</Badge>}
                  {course.limit && <Badge variant="outline">限{course.limit}人</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SubmittedPage() {
  return (
    <CourseProvider>
      <Inner />
    </CourseProvider>
  )
}


