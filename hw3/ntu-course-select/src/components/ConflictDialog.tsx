import { useState } from 'react'
import type { ConflictResult, ConflictInfo } from '../utils/timeUtils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Clock, MapPin, Star, X } from 'lucide-react'

interface ConflictDialogProps {
  conflict: ConflictResult
  courseName: string
  onConfirm: () => void
  onCancel: () => void
  onClose: () => void
}

const getConflictIcon = (type: ConflictInfo['type']) => {
  switch (type) {
    case 'time':
      return <Clock className="h-4 w-4" />
    case 'classroom':
      return <MapPin className="h-4 w-4" />
    case 'priority':
      return <Star className="h-4 w-4" />
    default:
      return <AlertTriangle className="h-4 w-4" />
  }
}

const getConflictColor = (type: ConflictInfo['type']) => {
  switch (type) {
    case 'time':
      return 'bg-orange-100 text-orange-800 border-orange-300'
    case 'classroom':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'priority':
      return 'bg-red-100 text-red-800 border-red-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
  switch (severity) {
    case 'low':
      return 'border-l-blue-500'
    case 'medium':
      return 'border-l-orange-500'
    case 'high':
      return 'border-l-red-500'
    default:
      return 'border-l-gray-500'
  }
}

export default function ConflictDialog({ 
  conflict, 
  courseName, 
  onConfirm, 
  onCancel, 
  onClose 
}: ConflictDialogProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const handleClose = () => {
    setIsVisible(false)
    onClose()
  }

  const handleConfirm = () => {
    setIsVisible(false)
    onConfirm()
  }

  const handleCancel = () => {
    setIsVisible(false)
    onCancel()
  }

  const severity = conflict.conflicts.some(c => c.type === 'priority') ? 'high' : 
                   conflict.conflicts.some(c => c.type === 'time') ? 'medium' : 'low'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className={`w-full max-w-2xl max-h-[80vh] overflow-y-auto border-l-4 ${getSeverityColor(severity)}`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              <CardTitle className="text-xl">
                課程衝突警告
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-gray-600">
            嘗試加入「<strong>{courseName}</strong>」時發現以下衝突：
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Conflict Details */}
          <div className="space-y-3">
            {conflict.conflicts.map((conflictInfo, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className={`p-2 rounded-full ${getConflictColor(conflictInfo.type)}`}>
                  {getConflictIcon(conflictInfo.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getConflictColor(conflictInfo.type)}`}
                    >
                      {conflictInfo.type === 'time' && '時間衝突'}
                      {conflictInfo.type === 'classroom' && '教室距離'}
                      {conflictInfo.type === 'priority' && '優先級衝突'}
                    </Badge>
                    {conflictInfo.type === 'priority' && (
                      <Badge variant="destructive" className="text-xs">
                        無法覆蓋
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">
                    {conflictInfo.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    衝突課程：{conflictInfo.conflictingCourse.cou_cname || conflictInfo.conflictingCourse.cou_ename}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Conflict Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">衝突摘要</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 共發現 {conflict.conflicts.length} 個衝突</li>
              <li>• 衝突類型：{conflict.conflicts.map(c => 
                c.type === 'time' ? '時間' : 
                c.type === 'classroom' ? '教室' : '優先級'
              ).join('、')}</li>
              {conflict.canOverride && (
                <li>• 此衝突可以手動覆蓋</li>
              )}
              {!conflict.canOverride && (
                <li>• ⚠️ 此衝突無法覆蓋（涉及必修課程）</li>
              )}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {conflict.canOverride ? (
              <>
                <Button 
                  onClick={handleConfirm}
                  variant="default"
                  className="flex-1"
                >
                  確認加入（覆蓋衝突）
                </Button>
                <Button 
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1"
                >
                  取消
                </Button>
              </>
            ) : (
              <Button 
                onClick={handleCancel}
                variant="destructive"
                className="w-full"
              >
                無法加入此課程
              </Button>
            )}
          </div>

          {/* Accessibility Note */}
          <div className="text-xs text-gray-500 pt-2 border-t">
            <p>
              <strong>無障礙說明：</strong>
              {conflict.canOverride 
                ? '此課程與現有課程有時間衝突，但可以手動覆蓋。請確認是否仍要加入。'
                : '此課程與必修課程有衝突，無法加入。請選擇其他時間的課程。'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
