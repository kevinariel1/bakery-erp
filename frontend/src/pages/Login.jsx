import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import styles from './Login.module.css'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await login(email, password)
            navigate('/inventory')
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <div className={styles.logo}>
                    Unified <span>Bakery</span> Hub
                </div>
                <div className={styles.subtitle}>Micro-ERP — Sign in to continue</div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@bakeryhub.com"
                            required
                            autoFocus
                            autoComplete="username"
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    {error && <div className={styles.error}>{error}</div>}
                    <button
                        type="submit"
                        className={styles.btn}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <div className={styles.hint}>
                    <div>Admin: admin@bakeryhub.com / BakeryAdmin@2024</div>
                    <div>Staff: staff@bakeryhub.com / BakeryStaff@2024</div>
                </div>
            </div>
        </div>
    )
}