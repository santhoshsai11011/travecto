import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plane, Car, Search, Cloud, Leaf, Package, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/useAuthStore'

export default function Home() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const [form, setForm] = useState({
    source: '',
    sourceCountry: 'India',
    destination: '',
    destinationCountry: '',
    date: '',
    mode: 'flight',
  })

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSearch = (e) => {
    e.preventDefault()
    if (!form.source.trim())      return toast.error('Please enter source city')
    if (!form.destination.trim()) return toast.error('Please enter destination city')
    if (!isAuthenticated)         { toast.error('Please login to search'); navigate('/auth'); return }

    const params = new URLSearchParams({
      source:           form.source,
      sourceCountry:    form.sourceCountry || 'India',
      destination:      form.destination,
      destinationCountry: form.destinationCountry || form.destination,
      date:             form.date || new Date().toISOString().split('T')[0],
      mode:             form.mode,
    })
    navigate(`/results?${params.toString()}`)
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    background: '#f0f4f8',
    border: '1.5px solid #e5e9f0',
    borderRadius: '12px',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: '14px',
    color: '#0f1f4b',
    outline: 'none',
    transition: 'all 0.2s ease',
  }

  const inputWithIcon = { ...inputStyle, paddingLeft: '38px' }

  const focusIn  = e => { e.target.style.borderColor = '#1a3fd4'; e.target.style.background = '#ffffff'; e.target.style.outline = '2px solid rgba(26,63,212,0.15)' }
  const focusOut = e => { e.target.style.borderColor = '#e5e9f0'; e.target.style.background = '#f0f4f8'; e.target.style.outline = 'none' }

  const features = [
    { icon: <Cloud size={22} />,   title: 'Live Weather',  desc: '7-day forecast with packing suggestions', iconBg: '#dbeafe', iconColor: '#1d4ed8' },
    { icon: <Plane size={22} />,   title: 'Flight Info',   desc: 'Live flight status and schedules',        iconBg: '#ede9fe', iconColor: '#7c3aed' },
    { icon: <Leaf size={22} />,    title: 'Carbon Score',  desc: 'Know your trip environmental impact',     iconBg: '#dcfce7', iconColor: '#15803d' },
    { icon: <Package size={22} />, title: 'Smart Packing', desc: 'Weather-based packing list instantly',    iconBg: '#ffedd5', iconColor: '#c2410c' },
  ]

  const stats = [
    { value: '8+',        label: 'Integrated APIs' },
    { value: 'Real-time', label: 'Live data streaming' },
    { value: '100%',      label: 'Free to use' },
  ]

  return (
    <div style={{ background: '#ffffff' }}>

      {/* ── HERO ─────────────────────────────────── */}
      <section style={{
        minHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        textAlign: 'center',
        background: 'radial-gradient(ellipse at 40% 50%, #1a3fd4 0%, #0e2494 60%, #1565c0 100%)',
      }}>

        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '28px',
          padding: '8px 18px',
          background: 'rgba(255,255,255,0.10)',
          border: '1px solid rgba(255,255,255,0.20)',
          borderRadius: '100px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#ffffff',
        }}>
          ✈️ Smart Travel Briefing Platform
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(38px, 5.5vw, 56px)',
          fontWeight: 800,
          color: '#ffffff',
          lineHeight: 1.12,
          maxWidth: '680px',
          marginBottom: '20px',
          letterSpacing: '-0.5px',
        }}>
          Your complete trip briefing,{' '}
          <span style={{ color: '#f76b5e' }}>instantly</span>
        </h1>

        {/* Subtext */}
        <p style={{
          fontSize: '16px',
          color: 'rgba(255,255,255,0.70)',
          maxWidth: '480px',
          marginBottom: '40px',
          lineHeight: 1.65,
        }}>
          Search any destination and get weather, flights, news,
          carbon score and packing list — all in one place.
        </p>

        {/* Search Card */}
        <div style={{
          width: '100%',
          maxWidth: '720px',
          background: '#ffffff',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 8px 40px rgba(15,31,75,0.22)',
        }}>
          <form onSubmit={handleSearch}>

            {/* Row 1: source city | source country */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div style={{ position: 'relative' }}>
                <MapPin size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                <input name="source" value={form.source} onChange={handleChange} placeholder="From — Hyderabad"
                  style={inputWithIcon} onFocus={focusIn} onBlur={focusOut} />
              </div>
              <input name="sourceCountry" value={form.sourceCountry} onChange={handleChange} placeholder="From Country — India"
                style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
            </div>

            {/* Row 2: destination city | destination country */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div style={{ position: 'relative' }}>
                <MapPin size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#f76b5e', pointerEvents: 'none' }} />
                <input name="destination" value={form.destination} onChange={handleChange} placeholder="To — Mumbai"
                  style={inputWithIcon} onFocus={focusIn} onBlur={focusOut} />
              </div>
              <input name="destinationCountry" value={form.destinationCountry} onChange={handleChange} placeholder="To Country — Russia"
                style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
            </div>

            {/* Row 3: date | mode toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <input type="date" name="date" value={form.date} onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                style={inputStyle} onFocus={focusIn} onBlur={focusOut} />

              {/* Mode toggle */}
              <div style={{
                display: 'flex',
                background: '#f0f4f8',
                border: '1.5px solid #e5e9f0',
                borderRadius: '12px',
                overflow: 'hidden',
                padding: '3px',
                gap: '3px',
              }}>
                {[
                  { val: 'flight', icon: <Plane size={13} />, label: 'Flight' },
                  { val: 'road',   icon: <Car   size={13} />, label: 'Road' },
                ].map(({ val, icon, label }) => (
                  <button
                    key={val} type="button"
                    onClick={() => setForm(p => ({ ...p, mode: val }))}
                    style={{
                      flex: 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      padding: '10px 8px',
                      fontSize: '13px', fontWeight: 600,
                      borderRadius: '9px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      background: form.mode === val ? '#0f1f4b' : 'transparent',
                      color:      form.mode === val ? '#ffffff'  : '#6b7280',
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                    }}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search button */}
            <button type="submit" style={{
              width: '100%',
              padding: '15px',
              background: '#f76b5e',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.2s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#f55244'}
              onMouseLeave={e => e.currentTarget.style.background = '#f76b5e'}
            >
              <Search size={17} /> Search Trip Briefing
            </button>
          </form>
        </div>

        {/* Trust bar */}
        <div style={{ display: 'flex', gap: '24px', marginTop: '24px', color: 'rgba(255,255,255,0.55)', fontSize: '13px', fontWeight: 500 }}>
          <span>✓ Free to use</span>
          <span>✓ Real-time data</span>
          <span>✓ 8+ APIs integrated</span>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────── */}
      <section style={{ background: '#ffffff', padding: '80px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <h2 style={{ fontSize: '34px', fontWeight: 800, color: '#0f1f4b', marginBottom: '12px', letterSpacing: '-0.5px' }}>
              Everything you need before you travel
            </h2>
            <p style={{ fontSize: '16px', color: '#6b7280', maxWidth: '480px', margin: '0 auto' }}>
              We pull data from 8 different sources so you don't have to open 8 different apps.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }}>
            {features.map((f, i) => (
              <div key={i} style={{
                background: '#ffffff',
                border: '1px solid #e5e9f0',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center',
                transition: 'box-shadow 0.2s ease',
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(15,31,75,0.10)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{
                  width: '52px', height: '52px',
                  background: f.iconBg,
                  borderRadius: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: f.iconColor,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f1f4b', marginBottom: '6px' }}>{f.title}</h3>
                <p  style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.55 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────── */}
      <section style={{ background: '#f0f4f8', padding: '56px 24px', borderTop: '1px solid #e5e9f0' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '32px', textAlign: 'center' }}>
          {stats.map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f1f4b', marginBottom: '6px', letterSpacing: '-1px' }}>
                {s.value}
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
