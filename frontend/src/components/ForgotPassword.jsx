import React, { useState } from 'react'
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify'
import { BUTTON_CLASSES, INPUTWRAPPER } from '../assets/dummy'
import { useNavigate } from 'react-router-dom'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [returnedToken, setReturnedToken] = useState(null) // dev helper
  const navigate = useNavigate()
  const url = 'http://localhost:4000'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await axios.post(`${url}/api/user/forgot-password`, { email })
      toast.success(data.message || 'If the email exists, a reset token was generated.')
      // For local/dev: backend returns token for testing. In production you would NOT return the token.
      if (data.token) {
        setReturnedToken(data.token)
        // Optionally navigate directly to reset with token for dev:
        // navigate(`/reset-password/${data.token}`)
      } else {
        setReturnedToken(null)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='max-w-md w-full bg-white shadow-lg border border-purple-100 rounded-xl p-8'>
      <ToastContainer position='top-center' autoClose={3000} hideProgressBar/>
      <h2 className='text-lg font-semibold mb-2 text-gray-800'>Forgot Password</h2>
      <p className='text-sm text-gray-500 mb-4'>Enter your account email and we'll send a reset token.</p>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className={INPUTWRAPPER}>
          <input type="email" placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)}
            className='w-full focus:outline-none text-sm text-gray-700' required />
        </div>

        <div className='flex gap-2'>
          <button type='submit' className={BUTTON_CLASSES} disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Token'}
          </button>
          <button type='button' onClick={() => navigate('/login')} className='py-2.5 px-4 rounded-lg border border-purple-100 text-sm text-gray-600 hover:text-purple-600 transition-colors'>
            Cancel
          </button>
        </div>
      </form>

      {returnedToken && (
        <div className='mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded'>
          <p className='text-xs text-gray-600'>Dev: reset token (copy & open reset link):</p>
          <pre className='text-xs break-words mt-1 text-purple-700'></pre>
          <div className='mt-2'>
            <button onClick={() => navigate(`/reset-password/${returnedToken}`)} className='text-sm text-purple-600 hover:underline'>Use this token to reset password</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ForgotPassword