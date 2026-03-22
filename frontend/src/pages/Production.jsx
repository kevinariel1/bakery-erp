import { useState, useEffect } from 'react'
import { productionApi } from '../api/index.js'
import PageHeader from '../components/PageHeader.jsx'
import StatCard from '../components/StatCard.jsx'
import styles from './Production.module.css'

const PRODUCTS = [
    'Vanilla Sponge Cake',
    'Chocolate Fudge Cake',
    'Sourdough Bread',
    'Croissant'
]

export default function Production() {
    const [orders, setOrders] = useState([])
    const [selected, setSelected] = useState(PRODUCTS[0])
    const [qty, setQty] = useState('')
    const [message, setMessage] = useState(null)

    const fetchOrders = async () => {
        try {
            const res = await productionApi.getOrders()
            setOrders(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await productionApi.getOrders();
                setOrders(res.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchOrders();
    }, []);

    const handleAddOrder = async () => {
        const q = parseInt(qty)
        if (!q || q < 1) {
            setMessage({ text: 'Enter a valid quantity', type: 'error' })
            return
        }
        try {
            await productionApi.addOrder(selected, q)
            setMessage({ text: `Order added: ${q}x ${selected}`, type: 'success' })
            setQty('')
            fetchOrders()
        } catch (err) {
            setMessage({ text: err.response?.data?.error || 'Failed to add order', type: 'error' })
        }
        setTimeout(() => setMessage(null), 3000)
    }

    const handleBake = async (id, amount) => {
        try {
            await productionApi.bake(id, amount)
            fetchOrders()
        } catch (err) {
            console.error(err)
        }
    }

    const totalOrdered = orders.reduce((s, o) => s + o.quantity_ordered, 0)
    const totalDone = orders.reduce((s, o) => s + o.quantity_done, 0)
    const rate = totalOrdered ? Math.round((totalDone / totalOrdered) * 100) : 0

    return (
        <div>
            <PageHeader
                title="Production Dashboard"
                subtitle="Today's baking schedule based on confirmed orders."
            />

            <div className={styles.statGrid}>
                <StatCard label="Total Ordered" value={totalOrdered} unit="units" />
                <StatCard label="Baked" value={totalDone} unit="units" />
                <StatCard label="Completion Rate" value={`${rate}%`} />
            </div>

            {orders.length === 0 ? (
                <div className={styles.empty}>No production orders yet. Add one below.</div>
            ) : (
                <div className={styles.orderGrid}>
                    {orders.map(order => {
                        const pct = order.quantity_ordered
                            ? Math.round((order.quantity_done / order.quantity_ordered) * 100)
                            : 0
                        return (
                            <div key={order.id} className={styles.orderCard}>
                                <div className={styles.orderName}>{order.product_name}</div>
                                <div className={styles.orderDue}>Due today</div>
                                <div className={styles.orderQty}>
                                    {order.quantity_ordered}
                                    <span className={styles.orderUnit}> units ordered</span>
                                </div>
                                <div className={styles.progressWrap}>
                                    <div className={styles.progressBar} style={{ width: `${pct}%` }} />
                                </div>
                                <div className={styles.progressLabel}>
                                    <span>{order.quantity_done} baked</span>
                                    <span>{pct}%</span>
                                </div>
                                <div className={styles.bakeButtons}>
                                    <button
                                        className={styles.btnOutline}
                                        onClick={() => handleBake(order.id, 1)}
                                        disabled={order.quantity_done >= order.quantity_ordered}
                                    >
                                        Bake 1
                                    </button>
                                    <button
                                        className={styles.btnPrimary}
                                        onClick={() => handleBake(order.id, 5)}
                                        disabled={order.quantity_done >= order.quantity_ordered}
                                    >
                                        Bake 5
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            <div className={styles.card}>
                <div className={styles.cardTitle}>Add Production Order</div>
                <div className={styles.tagRow}>
                    {PRODUCTS.map(name => (
                        <button
                            key={name}
                            className={`${styles.tag} ${selected === name ? styles.tagSel : ''}`}
                            onClick={() => setSelected(name)}
                        >
                            {name}
                        </button>
                    ))}
                </div>
                <div className={styles.inputRow}>
                    <label>Quantity</label>
                    <input
                        type="number"
                        placeholder="How many to bake?"
                        value={qty}
                        onChange={e => setQty(e.target.value)}
                        min="1"
                    />
                </div>
                <button className={styles.btnPrimary} onClick={handleAddOrder}>
                    + Add Order
                </button>
                {message && (
                    <div className={`${styles.msg} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    )
}