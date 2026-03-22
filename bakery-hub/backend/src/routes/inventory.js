import { Router } from 'express'
import {
  getIngredients,
  restockIngredient,
  deductIngredients
} from '../controllers/inventory.controller.js'

const router = Router()

router.get('/', getIngredients)
router.post('/restock', restockIngredient)
router.post('/deduct', deductIngredients)

export default router