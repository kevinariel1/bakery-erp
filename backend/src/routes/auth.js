import { Router } from 'express'
import { register, login, getMe, getUsers } from '../controllers/auth.controller.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', authenticate, getMe)
router.get('/users', authenticate, requireRole('admin'), getUsers)

export default router