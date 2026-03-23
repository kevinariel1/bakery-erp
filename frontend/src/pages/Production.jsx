import { useState, useEffect, useCallback } from 'react'
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
  const [finishedGoods, setFinishedGoods] = useState({})
  const [selected, setSelected] = useState(PRODUCTS[0])
  const [qty, setQty] = useState('')
  const [message, setMessage] = useState(null)

  const fetchAll = useCallback(async () => {
    try {
      const [ordersRes, goodsRes] = await Promise.all([
        productionApi.getOrders(),
        productionApi.getFinishedGoods()
      ])
      setOrders(ordersRes.data)
      const goodsMap = {}
      goodsRes.data.forEach(g => { goodsMap[g.product_name] = g.quantity })
      setFinishedGoods(goodsMap)
    } catch (err) {
      console.error(err)
    }
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchAll() }, [fetchAll])

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
      fetchAll()
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed to add order', type: 'error' })
    }
    setTimeout(() => setMessage(null), 3000)
  }

  const handleBake = async (id, amount, productName) => {
    try {
      await productionApi.bake(id, amount)
      setMessage({ text: `Baked ${amount}x ${productName} — ingredients deducted`, type: 'success' })
      fetchAll()
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Bake failed', type: 'error' })
    }
    setTimeout(() => setMessage(null), 4000)
  }

  const totalOrdered = orders.reduce((s, o) => s + o.quantity_ordered, 0)
  const totalDone = orders.reduce((s, o) => s + o.quantity_done, 0)
  const totalReady = Object.values(finishedGoods).reduce((s, v) => s + v, 0)
  const rate = totalOrdered ? Math.round((totalDone / totalOrdered) * 100) : 0

  return (
    <div>
      <PageHeader
        title="Production Dashboard"
        subtitle="Baking deducts raw ingredients and adds to finished goods stock."
      />

      <div className={styles.statGrid}>
        <StatCard label="Total Ordered" value={totalOrdered} unit="units" />
        <StatCard label="Baked Today" value={totalDone} unit="units" />
        <StatCard label="Ready to Sell" value={totalReady} unit="units" />
        <StatCard label="Completion Rate" value={`${rate}%`} />
      </div>

      {message && (
        <div className={`${styles.msg} ${styles[message.type]}`} style={{ marginBottom: 16 }}>
          {message.text}
        </div>
      )}

      <div className={styles.card} style={{ marginBottom: 16 }}>
        <div className={styles.cardTitle}>Finished goods stock</div>
        <div className={styles.goodsGrid}>
          {Object.entries(finishedGoods).map(([name, qty]) => (
            <div key={name} className={styles.goodsItem}>
              <div className={styles.goodsName}>{name}</div>
              <div className={`${styles.goodsQty} ${qty === 0 ? styles.goodsEmpty : ''}`}>
                {qty} ready
              </div>
            </div>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className={styles.empty}>No production orders yet. Add one below.</div>
      ) : (
        <div className={styles.orderGrid}>
          {orders.map(order => {
            const pct = order.quantity_ordered
              ? Math.round((order.quantity_done / order.quantity_ordered) * 100)
              : 0
            const inStock = finishedGoods[order.product_name] ?? 0
            const isDone = order.quantity_done >= order.quantity_ordered
            return (
              <div key={order.id} className={`${styles.orderCard} ${isDone ? styles.orderDone : ''}`}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderName}>{order.product_name}</div>
                  <span className={`${styles.stockBadge} ${inStock > 0 ? styles.stockOk : styles.stockZero}`}>
                    {inStock} in stock
                  </span>
                </div>
                <div className={styles.orderQty}>
                  {order.quantity_ordered}
                  <span className={styles.orderUnit}> ordered</span>
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
                    onClick={() => handleBake(order.id, 1, order.product_name)}
                    disabled={isDone}
                  >Bake 1</button>
                  <button
                    className={styles.btnPrimary}
                    onClick={() => handleBake(order.id, 5, order.product_name)}
                    disabled={isDone}
                  >Bake 5</button>
                  {isDone && <span className={styles.doneLabel}>Complete</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.cardTitle}>Add production order</div>
        <div className={styles.tagRow}>
          {PRODUCTS.map(name => (
            <button
              key={name}
              className={`${styles.tag} ${selected === name ? styles.tagSel : ''}`}
              onClick={() => setSelected(name)}
            >{name}</button>
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
      </div>
    </div>
  )
}