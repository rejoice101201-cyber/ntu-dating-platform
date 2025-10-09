import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Palette, Bell, Shield } from 'lucide-react'

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [autoSave, setAutoSave] = useState(true)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
        <p className="text-gray-600">個人化您的使用體驗</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              外觀設定
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">深色模式</h4>
                <p className="text-sm text-gray-600">切換到深色主題</p>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">自動儲存</h4>
                <p className="text-sm text-gray-600">自動儲存您的選課資料</p>
              </div>
              <Switch
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              通知設定
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">系統通知</h4>
                <p className="text-sm text-gray-600">接收系統重要通知</p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">選課提醒</h4>
                <p className="text-sm text-gray-600">選課截止日期提醒</p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            資料管理
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">清除快取</h4>
              <p className="text-sm text-gray-600">清除所有暫存資料</p>
            </div>
            <Button variant="outline" size="sm">
              清除
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">匯出資料</h4>
              <p className="text-sm text-gray-600">匯出您的選課資料</p>
            </div>
            <Button variant="outline" size="sm">
              匯出
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">重設設定</h4>
              <p className="text-sm text-gray-600">恢復預設設定</p>
            </div>
            <Button variant="outline" size="sm">
              重設
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">系統資訊</h3>
          <div className="flex justify-center gap-4 mb-4">
            <Badge variant="outline">版本 1.0.0</Badge>
            <Badge variant="outline">React 19.1.1</Badge>
            <Badge variant="outline">TypeScript 5.9.3</Badge>
          </div>
          <p className="text-sm text-gray-600">
            NTU Course Selection System
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
