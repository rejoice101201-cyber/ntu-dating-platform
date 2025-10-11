import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CourseProvider } from './context/CourseContext'
import Home from './pages/Home'
import CourseResults from './pages/CourseResults'
import Recommendations from './pages/Recommendations'
import Favorites from './pages/Favorites'
import SelectionStaging from './pages/SelectionStaging'
import LotterySimulation from './pages/LotterySimulation'
import FinalTimetable from './pages/FinalTimetable'
import Help from './pages/Help'
import Settings from './pages/Settings'
import './App.css'

function App() {
  return (
    <CourseProvider>
      <Router>
        <div className="min-h-screen bg-white antialiased">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/results" element={<CourseResults />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/staging" element={<SelectionStaging />} />
            <Route path="/lottery" element={<LotterySimulation />} />
            <Route path="/final" element={<FinalTimetable />} />
            <Route path="/help" element={<Help />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </Router>
    </CourseProvider>
  )
}

export default App