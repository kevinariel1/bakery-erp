import styles from './StatCard.module.css'

export default function StatCard({ label, value, unit }) {
  return (
    <div className={styles.card}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>
        {value}
        {unit && <span className={styles.unit}> {unit}</span>}
      </div>
    </div>
  )
}