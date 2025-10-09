import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { CourseProvider } from './context/CourseContext'
import Home from './pages/Home'
import CourseResults from './pages/CourseResults'
import Favorites from './pages/Favorites'
import SelectionStaging from './pages/SelectionStaging'
import LotterySimulation from './pages/LotterySimulation'
import FinalTimetable from './pages/FinalTimetable'
import Help from './pages/Help'
import Settings from './pages/Settings'
import './App.css'

function Navigation() {
  const location = useLocation()
  
  const navItems = [
    { path: '/', label: '首頁', icon: '🏠' },
    { path: '/results', label: '課程結果', icon: '📚' },
    { path: '/favorites', label: '我的最愛', icon: '❤️' },
    { path: '/staging', label: '選課暫存', icon: '📋' },
    { path: '/lottery', label: '抽籤系統', icon: '🎲' },
    { path: '/final', label: '最終課表', icon: '📅' },
    { path: '/help', label: '幫助', icon: '❓' },
    { path: '/settings', label: '設定', icon: '⚙️' },
  ]

  return (
    <aside className="hidden md:flex md:flex-col md:w-60 md:min-h-screen md:border-r md:bg-white">
      <div className="h-16 flex items-center px-4 border-b">
        <Link to="/" className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-blue-600">NTU Course Selection</h1>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium mb-1 transition-colors ${
              location.pathname === item.path
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}

function App() {
  return (
    <CourseProvider>
      <Router>
        <div className="min-h-screen bg-white antialiased flex">
          <Navigation />
          <main className="flex-1 px-4 py-6 max-w-7xl mx-auto w-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/results" element={<CourseResults />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/staging" element={<SelectionStaging />} />
              <Route path="/lottery" element={<LotterySimulation />} />
              <Route path="/final" element={<FinalTimetable />} />
              <Route path="/help" element={<Help />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </Router>
    </CourseProvider>
  )
}

export default App
