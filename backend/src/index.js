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

app.get('/', (req, res) => {
  res.json({ message: 'Bakery Hub API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/production', productionRoutes)
app.use('/api/sales', salesRoutes)
app.use('/api/jobs', jobRoutes)

startDailyReset()

export default app

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}