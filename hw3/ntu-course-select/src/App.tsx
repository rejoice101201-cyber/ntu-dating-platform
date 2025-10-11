import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { CourseProvider } from './context/CourseContext'
import Home from './pages/Home'
import CourseList from './pages/CourseList'
import Favorites from './pages/Favorites'
import Selection from './pages/Selection'
import Results from './pages/Results'
import Schedule from './pages/Schedule'
import './App.css'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CourseProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<CourseList />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/selection" element={<Selection />} />
            <Route path="/results" element={<Results />} />
            <Route path="/schedule" element={<Schedule />} />
          </Routes>
        </Router>
      </CourseProvider>
    </ThemeProvider>
  )
}

export default App