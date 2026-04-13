import express from 'express'
import pool from '../db/pool.js'

const router = express.Router()

router.get('/run', async (req, res) => {
  // Simple "shared secret" auth to prevent unauthorized resets
  const authHeader = req.headers.authorization
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  console.log('Running manual reset...')
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(`
      UPDATE finished_goods
      SET quantity = 0, updated_at = NOW()
    `)
    await client.query('COMMIT')
    res.json({ message: 'Daily reset complete' })
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
})

export default router
