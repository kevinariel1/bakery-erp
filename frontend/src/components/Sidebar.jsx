import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import styles from './Sidebar.module.css'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const links = [
    { to: '/inventory', label: 'Inventory', color: '#1D9E75', adminOnly: false },
    { to: '/production', label: 'Production', color: '#378ADD', adminOnly: false },
    { to: '/pos', label: 'Sales / POS', color: '#D85A30', adminOnly: false },
    { to: '/log', label: 'Audit Log', color: '#888780', adminOnly: true },
  ]

  const visibleLinks = links.filter(l => !l.adminOnly || user?.role === 'admin')

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        Unified <span>Bakery</span> Hub
      </div>
      <div className={styles.version}>Micro-ERP v1.0</div>

      <nav className={styles.nav}>
        <div className={styles.section}>Modules</div>
        {visibleLinks.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ''}`
            }
            style={({ isActive }) => ({
              borderLeftColor: isActive ? link.color : 'transparent'
            })}
          >
            <span className={styles.dot} style={{ background: link.color }} />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className={styles.user}>
        <div className={styles.userName}>{user?.name}</div>
        <div className={styles.userMeta}>
          <span className={`${styles.roleBadge} ${styles[user?.role]}`}>
            {user?.role}
          </span>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </div>

      <div className={styles.stack}>
        <div className={styles.stackLabel}>Stack</div>
        <div>Node.js + Express</div>
        <div>React 18 + Vite</div>
        <div>PostgreSQL 16</div>
      </div>
    </aside>
  )
}