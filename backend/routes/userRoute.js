import express from 'express'
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword
} from '../controllers/userController.js'
import authMiddleware from '../middleware/auth.js' // adjust path if you have auth middleware

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/me', authMiddleware, getCurrentUser)
router.put('/profile', authMiddleware, updateProfile)
router.put('/change-password', authMiddleware, updatePassword)

// password reset endpoints
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)

export default router