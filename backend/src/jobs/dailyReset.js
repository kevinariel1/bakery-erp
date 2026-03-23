import cron from 'node-cron'
import pool from '../db/pool.js'

export function startDailyReset() {
  // Runs every day at midnight (00:00) server time
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily reset...')
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Archive yesterday's production orders by doing nothing —
      // they stay in DB, the dashboard filters by due_date = today.
      // Only finished goods gets zeroed (optional — comment out if
      // your bakery sells day-old goods).
      await client.query(`
        UPDATE finished_goods
        SET quantity = 0, updated_at = NOW()
      `)

      await client.query('COMMIT')
      console.log('Daily reset complete — finished goods zeroed for new day')
    } catch (err) {
      await client.query('ROLLBACK')
      console.error('Daily reset failed:', err.message)
    } finally {
      client.release()
    }
  })

  console.log('Daily reset job scheduled for midnight')
}