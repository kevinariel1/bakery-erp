import { Router } from 'express'
import {
  getSales,
  getTodayRevenue,
  createSale,
  getProducts
} from '../controllers/sales.controller.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = Router()

router.get('/products', authenticate, getProducts)
router.get('/', authenticate, requireRole('admin'), getSales)
router.get('/revenue', authenticate, getTodayRevenue)
router.post('/', authenticate, createSale)

export default router