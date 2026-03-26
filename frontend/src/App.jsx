import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Sidebar from './components/Sidebar.jsx'
import Login from './pages/Login.jsx'
import Inventory from './pages/Inventory.jsx'
import Production from './pages/Production.jsx'
import POS from './pages/POS.jsx'
import Log from './pages/Log.jsx'
import styles from './App.module.css'

function AppLayout() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<Navigate to="/inventory" replace />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/production" element={<Production />} />
          <Route path="/pos" element={<POS />} />
          <Route
            path="/log"
            element={
              <ProtectedRoute adminOnly>
                <Log />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}