'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'

type Gender = 'male' | 'female' | 'other'

export default function RegisterPage() {
  const router = useRouter()
  const register = useAuthStore((s) => s.register)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [birthday, setBirthday] = useState('')
  const [gender, setGender] = useState<Gender>('other')

  const [location, setLocation] = useState('')
  const [height, setHeight] = useState<string>('')
  const [weight, setWeight] = useState<string>('')
  const [occupation, setOccupation] = useState('')
  const [school, setSchool] = useState('')
  const [bloodType, setBloodType] = useState('')

  const [photos, setPhotos] = useState<File[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const canSubmit = useMemo(() => {
    return (
      name.trim().length >= 2 &&
      email.trim().length > 0 &&
      password.length >= 6 &&
      birthday.trim().length > 0
    )
  }, [name, email, password, birthday])

  const uploadSelectedPhotos = async (files: File[]) => {
    if (files.length === 0) return
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) return

    setUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const fd = new FormData()
        fd.append('photo', files[i])
        fd.append('isCover', i === 0 ? 'true' : 'false')

        const res = await fetch('/api/users/me/photos', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: fd,
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data?.error || '上傳照片失敗')
        }
      }
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setError('')
    setLoading(true)
    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        birthday,
        gender,
        location: location.trim() || undefined,
        height: height.trim() ? Number(height) : undefined,
        weight: weight.trim() ? Number(weight) : undefined,
        occupation: occupation.trim() || undefined,
        school: school.trim() || undefined,
        bloodType: bloodType.trim() || undefined,
      })

      // 上傳照片（可選）
      if (photos.length > 0) {
        await uploadSelectedPhotos(photos)
      }

      router.push('/discover')
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        '註冊失敗，請稍後再試'
      setError(typeof msg === 'string' ? msg : '註冊失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="pixel-panel p-10 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🐾</div>
          <h2 className="text-2xl font-bold">建立帳號</h2>
          <p className="mt-2 text-sm text-gray-600">使用 Gmail 註冊並開始探索</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 text-red-700 p-3 border-3 border-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-700 mb-2">
              名稱 *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full"
              placeholder="你的暱稱"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-700 mb-2">
              Gmail *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              className="w-full"
              placeholder="your@gmail.com"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-700 mb-2">
              密碼 *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full"
              placeholder="至少 6 碼"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-700 mb-2">
              生日 *
            </label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-700 mb-2">
              性別 *
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
              className="w-full"
            >
              <option value="male">男</option>
              <option value="female">女</option>
              <option value="other">其他</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-700 mb-2">
                身高（cm）
              </label>
              <input
                inputMode="numeric"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full"
                placeholder="170"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-700 mb-2">
                體重（kg）
              </label>
              <input
                inputMode="numeric"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full"
                placeholder="60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-700 mb-2">
              地區
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full"
              placeholder="台北 / 新北 / ..."
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-700 mb-2">
              職業
            </label>
            <input
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className="w-full"
              placeholder="工程師 / 學生 / ..."
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-700 mb-2">
              學校
            </label>
            <input
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="w-full"
              placeholder="台大 / ..."
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-700 mb-2">
              血型
            </label>
            <input
              value={bloodType}
              onChange={(e) => setBloodType(e.target.value)}
              className="w-full"
              placeholder="A / B / AB / O"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-700 mb-2">
              上傳照片（可選）
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || [])
                setPhotos(files)
              }}
              className="w-full"
            />
            {photos.length > 0 && (
              <p className="mt-2 text-xs text-[var(--pixel-text-dim)]">
                已選擇 {photos.length} 張（第一張會設為封面）
              </p>
            )}
          </div>

          <button type="submit" disabled={loading || uploading || !canSubmit} className="w-full">
            {uploading ? '上傳照片中...' : loading ? '註冊中...' : '註冊'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-700">
          已有帳號？{' '}
          <Link href="/auth/login" className="underline">
            登入
          </Link>
        </p>
      </div>
    </div>
  )
}


