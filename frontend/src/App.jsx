import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Inventory from './pages/Inventory.jsx'
import Production from './pages/Production.jsx'
import POS from './pages/POS.jsx'
import Log from './pages/Log.jsx'
import styles from './App.module.css'

export default function App() {
  return (
    <BrowserRouter>
      <div className={styles.layout}>
        <Sidebar />
        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<Navigate to="/inventory" replace />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/production" element={<Production />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/log" element={<Log />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}