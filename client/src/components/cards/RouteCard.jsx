export default function RouteCard({ data }) {
  if (!data) return null

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e5e9f0', borderRadius: '16px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 20px', borderBottom: '1px solid #e5e9f0' }}>
        <span style={{ fontSize: '18px' }}>🚗</span>
        <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f1f4b', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Road Trip · {data.source} → {data.destination}
        </span>
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '14px' }}>
          {[
            { value: data.distanceKm, sub: 'km', label: 'Distance', color: '#1d4ed8', bg: '#dbeafe' },
            { value: data.drivingTime?.formatted, sub: '', label: 'Drive time', color: '#7c3aed', bg: '#ede9fe' },
            { value: `₹${data.fuelCost?.costINR}`, sub: '', label: 'Fuel cost', color: '#15803d', bg: '#dcfce7' },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '14px 10px', background: item.bg, borderRadius: '12px' }}>
              <p style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px', color: item.color, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{item.value}</p>
              {item.sub && <p style={{ fontSize: '11px', color: item.color, opacity: 0.8, marginTop: '1px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{item.sub}</p>}
              <p style={{ fontSize: '11px', color: item.color, opacity: 0.8, marginTop: '1px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{item.label}</p>
            </div>
          ))}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '10px 14px',
          background: '#f0f4f8', borderRadius: '10px',
          fontSize: '12px', color: '#6b7280',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
        }}>
          <span>⛽ {data.fuelCost?.litresNeeded}L needed</span>
          <span style={{ color: '#e5e9f0' }}>·</span>
          <span>₹{data.fuelCost?.pricePerLitre}/litre</span>
          <span style={{ color: '#e5e9f0' }}>·</span>
          <span>{data.fuelCost?.avgMileageKmpl} km/l avg</span>
        </div>
      </div>
    </div>
  )
}
