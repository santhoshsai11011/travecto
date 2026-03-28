import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plane, Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/useAuthStore'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const { login, register, loading, error, isAuthenticated, clearError } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true })
  }, [isAuthenticated, navigate])

  useEffect(() => {
    clearError()
    setForm({ name: '', email: '', password: '' })
  }, [mode])

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Email and password are required')
    if (mode === 'register' && !form.name.trim()) return toast.error('Name is required')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')

    if (mode === 'login') {
      const success = await login(form.email, form.password)
      if (success) { toast.success('Welcome back!'); navigate('/') }
    } else {
      const success = await register(form.name, form.email, form.password)
      if (success) { toast.success('Account created! Please login.'); setMode('login') }
    }
  }

  const inputBase = {
    width: '100%',
    padding: '12px 14px 12px 36px',
    background: '#f0f4f8',
    border: '1.5px solid #e5e9f0',
    borderRadius: '12px',
    color: '#0f1f4b',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
  }

  const focusHandler = e => {
    e.target.style.borderColor = '#1a3fd4'
    e.target.style.background = '#ffffff'
    e.target.style.outline = '2px solid rgba(26,63,212,0.15)'
  }
  const blurHandler = e => {
    e.target.style.borderColor = '#e5e9f0'
    e.target.style.background = '#f0f4f8'
    e.target.style.outline = 'none'
  }

  const features = [
    '🌦️ Live weather + 7-day forecast',
    '✈️ Real-time flight information',
    '🌱 Carbon footprint comparison',
    '🎒 Smart packing list generator',
    '📰 Local news at destination',
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f0f4f8' }}>

      {/* Left panel — blue gradient hero */}
      <div
        style={{
          display: 'none',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '45%',
          padding: '56px',
          background: 'radial-gradient(ellipse at 40% 50%, #1a3fd4 0%, #0e2494 60%, #1565c0 100%)',
        }}
        className="auth-left-panel"
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plane size={20} style={{ color: '#f76b5e' }} />
          <span style={{ fontWeight: 700, fontSize: '18px', color: '#ffffff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Travecto
          </span>
        </div>

        {/* Headline + features */}
        <div>
          <h2 style={{
            fontSize: '40px',
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.12,
            marginBottom: '16px',
            letterSpacing: '-0.5px',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}>
            Your intelligent<br />travel companion
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.70)', fontSize: '16px', marginBottom: '36px', lineHeight: 1.6 }}>
            Get weather, flights, carbon scores, news and
            packing lists for any destination — instantly.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'rgba(255,255,255,0.85)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f76b5e', flexShrink: 0 }} />
                {f}
              </div>
            ))}
          </div>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          © 2024 Travecto. Built with ❤ for smart travelers.
        </p>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{
          width: '100%',
          maxWidth: '420px',
          background: '#ffffff',
          border: '1px solid #e5e9f0',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 4px 24px rgba(15,31,75,0.08)',
        }}>
          {/* Back */}
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '13px', color: '#6b7280',
              background: 'none', border: 'none', cursor: 'pointer',
              marginBottom: '24px', transition: 'color 0.2s',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#0f1f4b'}
            onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
          >
            <ArrowLeft size={13} />
            Back to home
          </button>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '20px' }}>
            <Plane size={18} style={{ color: '#f76b5e' }} />
            <span style={{ fontWeight: 700, fontSize: '16px', color: '#0f1f4b', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Travecto
            </span>
          </div>

          {/* Heading */}
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f1f4b', marginBottom: '6px', letterSpacing: '-0.3px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {mode === 'login' ? 'Welcome back!' : 'Create account'}
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {mode === 'login' ? 'Login to access your travel briefings' : 'Join Travecto and start planning smarter'}
          </p>

          {/* Tab toggle */}
          <div style={{
            display: 'flex',
            background: '#f0f4f8',
            borderRadius: '12px',
            padding: '3px',
            gap: '3px',
            marginBottom: '20px',
          }}>
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1,
                  padding: '9px',
                  fontSize: '14px', fontWeight: 600,
                  borderRadius: '9px', border: 'none', cursor: 'pointer',
                  transition: 'all 0.15s',
                  background: mode === m ? '#0f1f4b' : 'transparent',
                  color: mode === m ? '#ffffff' : '#6b7280',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
              >
                {m === 'login' ? 'Login' : 'Register'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: '#fff0ef',
              border: '1px solid #ffc9c5',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '13px',
              color: '#c0392b',
              marginBottom: '16px',
              textAlign: 'center',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {mode === 'register' && (
              <div style={{ position: 'relative' }}>
                <User size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                <input
                  name="name" type="text" placeholder="Full name" value={form.name} onChange={handleChange}
                  style={inputBase} onFocus={focusHandler} onBlur={blurHandler}
                />
              </div>
            )}

            <div style={{ position: 'relative' }}>
              <Mail size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
              <input
                name="email" type="email" placeholder="Email address" value={form.email} onChange={handleChange}
                style={inputBase} onFocus={focusHandler} onBlur={blurHandler}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
              <input
                name="password" type={showPassword ? 'text' : 'password'}
                placeholder="Password (min 6 characters)" value={form.password} onChange={handleChange}
                style={{ ...inputBase, paddingRight: '40px' }} onFocus={focusHandler} onBlur={blurHandler}
              />
              <button
                type="button" onClick={() => setShowPassword(p => !p)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading ? '#9ca3af' : '#0f1f4b',
                color: '#ffffff', border: 'none', borderRadius: '12px',
                fontSize: '15px', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s', marginTop: '4px',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1a2f6b' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#0f1f4b' }}
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Login to Travecto' : 'Create Account'}
            </button>
          </form>

          {/* Switch */}
          <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280', marginTop: '20px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              style={{ color: '#f76b5e', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '13px' }}
            >
              {mode === 'login' ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .auth-left-panel { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
