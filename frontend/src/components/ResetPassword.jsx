import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify'
import { BUTTON_CLASSES, INPUTWRAPPER } from '../assets/dummy'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const url = 'http://localhost:4000'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('Password should be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      toast.error('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const { data } = await axios.post(`${url}/api/user/reset-password/${token}`, { password })
      toast.success(data.message || 'Password reset successful. Please login.')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='max-w-md w-full bg-white shadow-lg border border-purple-100 rounded-xl p-8'>
      <ToastContainer position='top-center' autoClose={3000} hideProgressBar/>
      <h2 className='text-lg font-semibold mb-2 text-gray-800'>Reset Password</h2>
      <p className='text-sm text-gray-500 mb-4'>Set a new password for your account.</p>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className={INPUTWRAPPER}>
          <input
            type="password"
            placeholder='New Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-full focus:outline-none text-sm text-gray-700'
            required
          />
        </div>

        <div className={INPUTWRAPPER}>
          <input
            type="password"
            placeholder='Confirm Password'
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className='w-full focus:outline-none text-sm text-gray-700'
            required
          />
        </div>

        <div className='flex gap-2'>
          <button type='submit' className={BUTTON_CLASSES} disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
          <button type='button' onClick={() => navigate('/login')} className='py-2.5 px-4 rounded-lg border border-purple-100 text-sm text-gray-600 hover:text-purple-600 transition-colors'>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default ResetPassword