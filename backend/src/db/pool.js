import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

async function connectWithRetry(retries = 10, delay = 3000) {
  for (let i = 1; i <= retries; i++) {
    try {
      await pool.connect()
      console.log('Connected to PostgreSQL')
      return
    } catch (err) {
      console.log(`Waiting for DB... attempt ${i}/${retries}`)
      if (i === retries) {
        console.error('Could not connect to PostgreSQL:', err.message)
        process.exit(1)
      }
      await new Promise(res => setTimeout(res, delay))
    }
  }
}

connectWithRetry()

export default pool