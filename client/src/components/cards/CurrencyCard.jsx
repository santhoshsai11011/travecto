export default function CurrencyCard({ data }) {
  if (!data) return null

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e5e9f0', borderRadius: '16px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 20px', borderBottom: '1px solid #e5e9f0' }}>
        <span style={{ fontSize: '18px' }}>💱</span>
        <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f1f4b', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Currency</span>
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <p style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', color: '#0f1f4b', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {data.rate?.toFixed(4)}
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              1 {data.from} = {data.rate?.toFixed(4)} {data.to}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '17px', fontWeight: 700, color: '#1d4ed8', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{data.from}</span>
              <span style={{ color: '#9ca3af' }}>→</span>
              <span style={{ fontSize: '17px', fontWeight: 700, color: '#15803d', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{data.to}</span>
            </div>
            <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Updated {data.lastUpdated}</p>
          </div>
        </div>

        <div style={{ background: '#f0f4f8', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>₹10,000 =</p>
          <p style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px', color: '#0f1f4b', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {data.converted?.toFixed(2)} {data.to}
          </p>
        </div>
      </div>
    </div>
  )
}
