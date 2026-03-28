import { Link, useNavigate } from 'react-router-dom'
import { Plane, BookMarked, LogOut, LogIn, LayoutDashboard } from 'lucide-react'
import useAuthStore from '../../store/useAuthStore'
import toast from 'react-hot-toast'

function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out!')
    navigate('/')
  }

  const linkStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: 'rgba(255,255,255,0.85)',
    fontSize: '14px',
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'color 0.2s ease',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
  }

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: '#0f1f4b',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      boxShadow: '0 2px 12px rgba(15,31,75,0.15)',
    }}>
      <div style={{
        maxWidth: '1100px',
        width: '100%',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <Plane size={20} style={{ color: '#f76b5e' }} />
          <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '18px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Travecto
          </span>
        </Link>

        {/* Right nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {isAuthenticated && (
            <Link to="/saved" style={linkStyle}
              onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
            >
              <BookMarked size={15} />
              Saved Trips
            </Link>
          )}

          {isAuthenticated && user?.role === 'admin' && (
            <Link to="/admin" style={linkStyle}
              onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
            >
              <LayoutDashboard size={15} />
              Admin
            </Link>
          )}

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: '#f76b5e',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s ease',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f55244'}
              onMouseLeave={e => e.currentTarget.style.background = '#f76b5e'}
            >
              <LogOut size={14} />
              Logout
            </button>
          ) : (
            <Link to="/auth" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: '#f76b5e',
              color: '#ffffff',
              borderRadius: '12px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background 0.2s ease',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#f55244'}
              onMouseLeave={e => e.currentTarget.style.background = '#f76b5e'}
            >
              <LogIn size={14} />
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
