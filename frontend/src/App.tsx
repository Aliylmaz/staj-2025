import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import AdminPage from './pages/AdminPage';
import AgentPage from './pages/AgentPage';
import CustomerPage from './pages/CustomerPage';
import ForgotPasswordPage from './ForgotPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';
import { CustomerProvider } from './contexts/CustomerContext';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          
          {/* Agent Routes */}
          <Route
            path="/agent/*"
            element={
              <ProtectedRoute allowedRoles={['AGENT']}>
                <AgentPage />
              </ProtectedRoute>
            }
          />
          
          {/* Customer Routes */}
          <Route
            path="/customer/*"
            element={
              <CustomerProvider>
                <ProtectedRoute allowedRoles={['CUSTOMER']}>
                  <CustomerPage />
                </ProtectedRoute>
              </CustomerProvider>
            }
          />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
