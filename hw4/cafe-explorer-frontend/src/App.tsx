import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CafeProvider } from './context/CafeContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Map } from './pages/Map';
import { List } from './pages/List';
import { DiagnosticPage } from './pages/Diagnostic';
import PerformanceDashboard from './components/PerformanceDashboard';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
};

// Main App Component
const AppContent: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/diagnostic" element={<DiagnosticPage />} />
        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <Map />
            </ProtectedRoute>
          }
        />
        <Route
          path="/list"
          element={
            <ProtectedRoute>
              <List />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <PerformanceDashboard />
    </Router>
  );
};

// App with Providers
function App() {
  return (
    <AuthProvider>
      <CafeProvider>
        <AppContent />
      </CafeProvider>
    </AuthProvider>
  );
}

export default App;
