import { useState, useEffect } from 'react'
// eslint-disable-next-line no-unused-vars
import { salesApi, inventoryApi, productionApi } from '../api/index.js'
import PageHeader from '../components/PageHeader.jsx'
import styles from './Log.module.css'

export default function Log() {
  const [sales, setSales] = useState([])

  useEffect(() => {
    salesApi.getSales()
      .then(res => setSales(res.data))
      .catch(console.error)
  }, [])

  return (
    <div>
      <PageHeader
        title="Audit Log"
        subtitle="All sales transactions recorded by the system."
      />
      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Time</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.empty}>No transactions yet.</td>
              </tr>
            ) : (
              sales.map(s => (
                <tr key={s.id}>
                  <td>{new Date(s.sold_at).toLocaleString('id-ID')}</td>
                  <td>{s.product_name}</td>
                  <td>{s.quantity}</td>
                  <td>Rp {parseFloat(s.unit_price).toLocaleString('id-ID')}</td>
                  <td>Rp {parseFloat(s.total_price).toLocaleString('id-ID')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}