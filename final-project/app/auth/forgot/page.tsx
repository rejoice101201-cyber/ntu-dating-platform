'use client'

import { useState } from 'react'

export default function ForgotPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.toLowerCase().includes('@')) {
      setError('請輸入有效 Email')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || '寄送失敗')
      }
      setSent(true)
    } catch (err: any) {
      setError(err.message || '寄送失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-4xl mb-2">🐕</h1>
          <h2 className="text-2xl font-bold text-gray-800">忘記密碼</h2>
          <p className="text-gray-600 mt-2">輸入註冊的 Gmail，我們會寄送重設連結</p>
        </div>
        {sent ? (
          <div className="text-center text-green-600">已寄出重設連結，請查收 Gmail。</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gmail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="your@gmail.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-400 to-purple-400 text-white py-3 rounded-lg font-semibold hover:from-pink-500 hover:to-purple-500 disabled:opacity-50"
            >
              {loading ? '寄送中...' : '寄送重設連結'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}


