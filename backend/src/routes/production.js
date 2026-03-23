import { Router } from 'express'
import {
  getOrders,
  addOrder,
  updateBaked,
  getFinishedGoods
} from '../controllers/production.controller.js'

const router = Router()

router.get('/', getOrders)
router.get('/finished-goods', getFinishedGoods)
router.post('/', addOrder)
router.patch('/:id/bake', updateBaked)

export default router