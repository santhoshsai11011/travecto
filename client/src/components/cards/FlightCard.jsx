export default function FlightCard({ data }) {
  if (!data) return null

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e5e9f0', borderRadius: '16px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e5e9f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>✈️</span>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f1f4b', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Flights · {data.source} → {data.destination}
          </span>
        </div>
        {data.isMock && (
          <span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '8px', background: '#ffedd5', color: '#c2410c' }}>
            Demo data
          </span>
        )}
      </div>

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {data.flights?.map((flight, i) => (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 14px',
              background: '#f0f4f8', borderRadius: '12px',
              transition: 'background 0.15s',
              cursor: 'default',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
            onMouseLeave={e => e.currentTarget.style.background = '#f0f4f8'}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, color: '#0f1f4b', fontSize: '14px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{flight.airline}</span>
                <span style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{flight.flightNumber}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                <span style={{ fontWeight: 700, color: '#0f1f4b' }}>{flight.departure}</span>
                <span style={{ color: '#9ca3af' }}>→</span>
                <span style={{ fontWeight: 700, color: '#0f1f4b' }}>{flight.arrival}</span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>({flight.duration})</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '8px',
                background: flight.status === 'Scheduled' ? '#dcfce7' : '#ffedd5',
                color:      flight.status === 'Scheduled' ? '#15803d' : '#c2410c',
              }}>
                {flight.status}
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Terminal {flight.terminal}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
