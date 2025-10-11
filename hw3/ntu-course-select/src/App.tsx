import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { CourseProvider } from './context/CourseContext'
import { theme } from './theme/theme'
import Home from './pages/Home'
import CourseResultsSimple from './pages/CourseResultsSimple'
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CourseProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/results" element={<CourseResultsSimple />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/staging" element={<SelectionStaging />} />
            <Route path="/lottery" element={<LotterySimulation />} />
            <Route path="/final" element={<FinalTimetable />} />
            <Route path="/help" element={<Help />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Router>
      </CourseProvider>
    </ThemeProvider>
  )
}

export default App