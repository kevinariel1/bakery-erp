import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.js'
import inventoryRoutes from './routes/inventory.js'
import productionRoutes from './routes/production.js'
import salesRoutes from './routes/sales.js'
import jobRoutes from './routes/jobs.js'
import { startDailyReset } from './jobs/dailyReset.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

const router = express.Router()

router.get('/', (req, res) => {
  res.json({ 
    message: 'Bakery Hub API is running',
    environment: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL
  })
})

router.use('/auth', authRoutes)
router.use('/inventory', inventoryRoutes)
router.use('/production', productionRoutes)
router.use('/sales', salesRoutes)
router.use('/jobs', jobRoutes)

// Mount the router on both /api and / 
// This makes it compatible with both local development and various deployment configurations
app.use('/api', router)
app.use('/', router)

// 404 Handler for API
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found in Express', 
    path: req.url,
    method: req.method
  })
})

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  startDailyReset()
}

export default app

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}