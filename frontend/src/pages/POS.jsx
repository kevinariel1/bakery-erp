import { useState, useEffect } from 'react'
import { salesApi, productionApi } from '../api/index.js'
import PageHeader from '../components/PageHeader.jsx'
import styles from './POS.module.css'

export default function POS() {
  const [products, setProducts] = useState([])
  const [finishedGoods, setFinishedGoods] = useState({})
  const [cart, setCart] = useState({})
  const [revenue, setRevenue] = useState(0)
  const [txns, setTxns] = useState(0)
  const [message, setMessage] = useState(null)

  const fetchAll = async () => {
    try {
      const [prodRes, goodsRes, revRes] = await Promise.all([
        salesApi.getProducts(),
        productionApi.getFinishedGoods(),
        salesApi.getRevenue()
      ])
      setProducts(prodRes.data)
      const goodsMap = {}
      goodsRes.data.forEach(g => { goodsMap[g.product_name] = g.quantity })
      setFinishedGoods(goodsMap)
      setRevenue(parseFloat(revRes.data.revenue))
      setTxns(parseInt(revRes.data.transactions))
    } catch (err) { console.error(err) }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchAll() }, [])

  const addToCart = (product) => {
    const inStock = finishedGoods[product.name] ?? 0
    const inCart = cart[product.id]?.qty ?? 0
    if (inCart >= inStock) {
      setMessage({ text: `Only ${inStock} ${product.name} in stock`, type: 'error' })
      setTimeout(() => setMessage(null), 2500)
      return
    }
    setCart(prev => ({
      ...prev,
      [product.id]: { ...product, qty: inCart + 1 }
    }))
  }

  const changeQty = (id, delta, productName) => {
    setCart(prev => {
      const current = prev[id]?.qty ?? 0
      const newQty = current + delta
      if (newQty <= 0) {
        const next = { ...prev }
        delete next[id]
        return next
      }
      const inStock = finishedGoods[productName] ?? 0
      if (newQty > inStock) return prev
      return { ...prev, [id]: { ...prev[id], qty: newQty } }
    })
  }

  const cartItems = Object.values(cart)
  const total = cartItems.reduce((s, i) => s + i.price * i.qty, 0)

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setMessage({ text: 'Cart is empty', type: 'error' })
      return
    }
    try {
      await salesApi.createSale(
        cartItems.map(i => ({ product_name: i.name, quantity: i.qty }))
      )
      setMessage({ text: `Sale complete! Rp ${total.toLocaleString('id-ID')}`, type: 'success' })
      setCart({})
      fetchAll()
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Checkout failed', type: 'error' })
    }
    setTimeout(() => setMessage(null), 3500)
  }

  return (
    <div>
      <PageHeader
        title="Point of Sale"
        subtitle="Sells from baked stock only. Go to Production to bake more."
      />

      <div className={styles.layout}>
        <div className={styles.left}>
          <div className={styles.sectionLabel}>Products</div>
          <div className={styles.productGrid}>
            {products.map(p => {
              const inStock = finishedGoods[p.name] ?? 0
              const outOfStock = inStock === 0
              return (
                <button
                  key={p.id}
                  className={`${styles.productBtn} ${outOfStock ? styles.outOfStock : ''}`}
                  onClick={() => addToCart(p)}
                  disabled={outOfStock}
                >
                  <div className={styles.pName}>{p.name}</div>
                  <div className={styles.pPrice}>
                    Rp {parseFloat(p.price).toLocaleString('id-ID')}
                  </div>
                  <div className={`${styles.pStock} ${outOfStock ? styles.pStockEmpty : styles.pStockOk}`}>
                    {outOfStock ? 'Out of stock — bake more' : `${inStock} available`}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Current Cart</div>
            {cartItems.length === 0 ? (
              <div className={styles.empty}>Cart is empty. Add products ←</div>
            ) : (
              cartItems.map(item => (
                <div key={item.id} className={styles.cartRow}>
                  <div className={styles.cartName}>{item.name}</div>
                  <div className={styles.cartQty}>
                    <button className={styles.qtyBtn} onClick={() => changeQty(item.id, -1, item.name)}>−</button>
                    <span>{item.qty}</span>
                    <button className={styles.qtyBtn} onClick={() => changeQty(item.id, 1, item.name)}>+</button>
                  </div>
                  <div className={styles.cartPrice}>
                    Rp {(item.price * item.qty).toLocaleString('id-ID')}
                  </div>
                </div>
              ))
            )}
            <div className={styles.divider} />
            <div className={styles.totalRow}>
              <span>Total</span>
              <span className={styles.totalVal}>Rp {total.toLocaleString('id-ID')}</span>
            </div>
            <div className={styles.checkoutRow}>
              <button className={styles.btnOutline} onClick={() => setCart({})}>Clear</button>
              <button className={styles.btnPrimary} onClick={handleCheckout}>Checkout</button>
            </div>
            {message && (
              <div className={`${styles.msg} ${styles[message.type]}`}>{message.text}</div>
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>Today's Revenue</div>
            <div className={styles.revenue}>Rp {revenue.toLocaleString('id-ID')}</div>
            <div className={styles.txns}>{txns} transaction{txns !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>
    </div>
  )
}