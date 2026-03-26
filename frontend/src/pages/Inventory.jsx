import { useState, useEffect } from 'react'
import { inventoryApi } from '../api/index.js'
import PageHeader from '../components/PageHeader.jsx'
import StatCard from '../components/StatCard.jsx'
import styles from './Inventory.module.css'

import { useAuth } from '../context/AuthContext.jsx'    

const INGREDIENTS = ['flour', 'sugar', 'yeast']

function getStatus(ing) {
    const qty = parseFloat(ing.quantity)
    const low = parseFloat(ing.low_threshold)
    if (qty <= low * 0.33) return 'critical'
    if (qty <= low) return 'low'
    return 'ok'
}

export default function Inventory() {
    const [ingredients, setIngredients] = useState([])
    const [selected, setSelected] = useState('flour')
    const [amount, setAmount] = useState('')
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState(null)
    const { user } = useAuth()

    const fetchIngredients = async () => {
        try {
            const res = await inventoryApi.getAll()
            setIngredients(res.data)
        } catch (err) {
            setMessage({ text: 'Failed to load ingredients', error: err.message, type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchIngredients() }, [])

    const handleRestock = async () => {
        const amt = parseFloat(amount)
        if (!amt || amt <= 0) {
            setMessage({ text: 'Enter a valid amount', type: 'error' })
            return
        }
        try {
            await inventoryApi.restock(selected, amt)
            setMessage({ text: `Restocked ${selected}: +${amt}`, type: 'success' })
            setAmount('')
            fetchIngredients()
        } catch (err) {
            setMessage({ text: err.response?.data?.error || 'Restock failed', type: 'error' })
        }
        setTimeout(() => setMessage(null), 3000)
    }

    const lowCount = ingredients.filter(i => getStatus(i) !== 'ok').length

    return (
        <div>
            <PageHeader
                title="Inventory Management"
                subtitle="Track real-time ingredient levels across all bakery branches."
            />

            <div className={styles.statGrid}>
                <StatCard label="Ingredients Tracked" value={ingredients.length} unit="types" />
                <StatCard label="Low Stock Alerts" value={lowCount} unit="items" />
                <StatCard label="Last Updated" value={loading ? '—' : 'Just now'} />
            </div>

            <div className={styles.card}>
                <div className={styles.cardTitle}>Ingredient Levels</div>
                {loading ? (
                    <div className={styles.loading}>Loading...</div>
                ) : (
                    ingredients.map(ing => {
                        const pct = Math.round((ing.quantity / ing.max_quantity) * 100)
                        const status = getStatus(ing)
                        const barColor = status === 'critical' ? '#E24B4A' : status === 'low' ? '#EF9F27' : '#1D9E75'
                        return (
                            <div key={ing.id} className={styles.ingRow}>
                                <div className={styles.ingName}>
                                    {ing.name.charAt(0).toUpperCase() + ing.name.slice(1)}
                                </div>
                                <div className={styles.barWrap}>
                                    <div
                                        className={styles.bar}
                                        style={{ width: `${pct}%`, background: barColor }}
                                    />
                                </div>
                                <div className={styles.ingQty}>
                                    {parseFloat(ing.quantity).toFixed(1)} / {ing.max_quantity} {ing.unit}
                                </div>
                                <span className={`${styles.badge} ${styles[status]}`}>
                                    {status === 'critical' ? 'Critical' : status === 'low' ? 'Low' : 'OK'}
                                </span>
                            </div>
                        )
                    })
                )}
            </div>

            {user?.role === 'admin' && (
                <div className={styles.card}>
                    <div className={styles.cardTitle}>Restock Ingredient</div>
                    <div className={styles.tagRow}>
                        {INGREDIENTS.map(name => (
                            <button
                                key={name}
                                className={`${styles.tag} ${selected === name ? styles.tagSel : ''}`}
                                onClick={() => setSelected(name)}
                            >
                                {name.charAt(0).toUpperCase() + name.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className={styles.inputRow}>
                        <label>Amount</label>
                        <input
                            type="number"
                            placeholder="Enter amount to add"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            min="1"
                        />
                    </div>
                    <button className={styles.btnPrimary} onClick={handleRestock}>
                        + Add Stock
                    </button>
                    {message && (
                        <div className={`${styles.msg} ${styles[message.type]}`}>
                            {message.text}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}