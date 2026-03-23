import { Router } from 'express'
import {
  getOrders,
  addOrder,
  updateBaked,
  getFinishedGoods
} from '../controllers/production.controller.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.get('/', authenticate, getOrders)
router.get('/finished-goods', authenticate, getFinishedGoods)
router.post('/', authenticate, addOrder)
router.patch('/:id/bake', authenticate, updateBaked)

export default router