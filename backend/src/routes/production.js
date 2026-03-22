import { Router } from 'express'
import {
  getOrders,
  addOrder,
  updateBaked
} from '../controllers/production.controller.js'

const router = Router()

router.get('/', getOrders)
router.post('/', addOrder)
router.patch('/:id/bake', updateBaked)

export default router