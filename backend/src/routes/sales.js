import { Router } from 'express'
import {
  getSales,
  getTodayRevenue,
  createSale,
  getProducts
} from '../controllers/sales.controller.js'

const router = Router()

router.get('/', getSales)
router.get('/revenue', getTodayRevenue)
router.get('/products', getProducts)
router.post('/', createSale)

export default router