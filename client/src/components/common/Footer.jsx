function Footer() {
  return (
    <footer style={{
      background: '#0f1f4b',
      borderTop: '1px solid #1a2f6b',
      padding: '32px 24px',
      marginTop: '64px',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
          <span style={{ fontSize: '16px' }}>✈️</span>
          <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '15px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Travecto</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Your intelligent travel briefing platform
        </p>
      </div>
    </footer>
  )
}

export default Footer
