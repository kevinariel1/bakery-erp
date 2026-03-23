import { Router } from 'express'
import {
  getIngredients,
  restockIngredient,
  deductIngredients
} from '../controllers/inventory.controller.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = Router()

router.get('/', authenticate, getIngredients)
router.post('/restock', authenticate, requireRole('admin'), restockIngredient)
router.post('/deduct', authenticate, deductIngredients)

export default router