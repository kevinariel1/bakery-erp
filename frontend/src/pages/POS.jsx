import { useState, useEffect, useCallback } from 'react';
import { salesApi } from '../api/index.js';
import PageHeader from '../components/PageHeader.jsx';
import styles from './POS.module.css';

export default function POS() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [revenue, setRevenue] = useState(0);
  const [txns, setTxns] = useState(0);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Consolidated fetcher to prevent cascading renders and satisfy ESLint
  const fetchData = useCallback(async () => {
    try {
      const [prodRes, revRes] = await Promise.all([
        salesApi.getProducts(),
        salesApi.getRevenue()
      ]);
      
      setProducts(prodRes.data);
      setRevenue(parseFloat(revRes.data.revenue || 0));
      setTxns(parseInt(revRes.data.transactions || 0));
    } catch (err) {
      console.error("Failed to fetch POS data:", err);
      setMessage({ text: "Failed to load data", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addToCart = (product) => {
    setCart(prev => ({
      ...prev,
      [product.id]: { ...product, qty: (prev[product.id]?.qty || 0) + 1 }
    }));
  };

  const changeQty = (id, delta) => {
    setCart(prev => {
      const qty = (prev[id]?.qty || 0) + delta;
      if (qty <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: { ...prev[id], qty } };
    });
  };

  const cartItems = Object.values(cart);
  const total = cartItems.reduce((s, i) => s + (i.price * i.qty), 0);

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setMessage({ text: 'Cart is empty', type: 'error' });
      return;
    }

    try {
      await salesApi.createSale(
        cartItems.map(i => ({ product_name: i.name, quantity: i.qty }))
      );
      
      setMessage({ text: `Sale complete! Rp ${total.toLocaleString('id-ID')}`, type: 'success' });
      setCart({});
      // Refresh revenue after a successful sale
      fetchData(); 
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Checkout failed', type: 'error' });
    }

    setTimeout(() => setMessage(null), 3500);
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading POS System...</div>;
  }

  return (
    <div>
      <PageHeader
        title="Point of Sale"
        subtitle="Log sales and auto-deduct ingredients from inventory."
      />

      <div className={styles.layout}>
        <div className={styles.left}>
          <div className={styles.sectionLabel}>Products</div>
          <div className={styles.productGrid}>
            {products.map(p => (
              <button
                key={p.id}
                className={styles.productBtn}
                onClick={() => addToCart(p)}
              >
                <div className={styles.pName}>{p.name}</div>
                <div className={styles.pPrice}>
                  Rp {parseFloat(p.price).toLocaleString('id-ID')}
                </div>
                <div className={styles.pIng}>
                  flour {p.flour_needed} · sugar {p.sugar_needed} · yeast {p.yeast_needed}
                </div>
              </button>
            ))}
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
                    <button className={styles.qtyBtn} onClick={() => changeQty(item.id, -1)}>−</button>
                    <span>{item.qty}</span>
                    <button className={styles.qtyBtn} onClick={() => changeQty(item.id, 1)}>+</button>
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
              <span className={styles.totalVal}>
                Rp {total.toLocaleString('id-ID')}
              </span>
            </div>
            <div className={styles.checkoutRow}>
              <button className={styles.btnOutline} onClick={() => setCart({})}>Clear</button>
              <button className={styles.btnPrimary} onClick={handleCheckout}>Checkout</button>
            </div>
            {message && (
              <div className={`${styles.msg} ${styles[message.type]}`}>
                {message.text}
              </div>
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>Today's Revenue</div>
            <div className={styles.revenue}>
              Rp {revenue.toLocaleString('id-ID')}
            </div>
            <div className={styles.txns}>{txns} transaction{txns !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>
    </div>
  );
}