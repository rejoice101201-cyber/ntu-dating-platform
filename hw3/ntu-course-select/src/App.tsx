import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { CourseProvider } from './context/CourseContext'
import Home from './pages/Home'
import CourseResults from './pages/CourseResults'
import Favorites from './pages/Favorites'
import PrioritySorting from './pages/PrioritySorting'
import Selection from './pages/Selection'
import Results from './pages/Results'
import Schedule from './pages/Schedule'
import DebugSchedule from './pages/DebugSchedule'
import './App.css'

// 創建Material UI主題，使用Roboto字體
const theme = createTheme({
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CourseProvider>
        <Router>
          <div className="min-h-screen bg-white antialiased">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/results" element={<CourseResults />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/priority-sorting" element={<PrioritySorting />} />
              <Route path="/selection" element={<Selection />} />
              <Route path="/final-results" element={<Results />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/debug-schedule" element={<DebugSchedule />} />
            </Routes>
          </div>
        </Router>
      </CourseProvider>
    </ThemeProvider>
  )
}

export default App