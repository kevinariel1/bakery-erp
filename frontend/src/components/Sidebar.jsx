import { NavLink } from 'react-router-dom'
import styles from './Sidebar.module.css'

const links = [
  { to: '/inventory', label: 'Inventory', color: '#1D9E75' },
  { to: '/production', label: 'Production', color: '#378ADD' },
  { to: '/pos', label: 'Sales / POS', color: '#D85A30' },
  { to: '/log', label: 'Audit Log', color: '#888780' },
]

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        Unified <span>Bakery</span> Hub
      </div>
      <div className={styles.version}>Micro-ERP v1.0</div>
      <nav className={styles.nav}>
        <div className={styles.section}>Modules</div>
        {links.map(link => (
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
      <div className={styles.stack}>
        <div className={styles.stackLabel}>Stack</div>
        <div>Node.js + Express</div>
        <div>React 18 + Vite</div>
        <div>PostgreSQL 16</div>
      </div>
    </aside>
  )
}