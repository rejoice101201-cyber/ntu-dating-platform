import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CourseProvider } from './context/CourseContext'
import Home from './pages/Home'
import CourseResults from './pages/CourseResults'
import Favorites from './pages/Favorites'
import Selection from './pages/Selection'
import Results from './pages/Results'
import Schedule from './pages/Schedule'
import './App.css'

function App() {
  return (
    <CourseProvider>
      <Router>
        <div className="min-h-screen bg-white antialiased">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/results" element={<CourseResults />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/selection" element={<Selection />} />
            <Route path="/final-results" element={<Results />} />
            <Route path="/schedule" element={<Schedule />} />
          </Routes>
        </div>
      </Router>
    </CourseProvider>
  )
}

export default App