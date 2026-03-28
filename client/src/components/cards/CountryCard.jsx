export default function CountryCard({ data }) {
  if (!data) return null

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e5e9f0', borderRadius: '16px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 20px', borderBottom: '1px solid #e5e9f0' }}>
        <span style={{ fontSize: '18px' }}>🌍</span>
        <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f1f4b', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Country Info</span>
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          {data.flagUrl && (
            <img
              src={data.flagUrl}
              alt={data.name}
              style={{ width: '40px', height: '28px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e5e9f0' }}
            />
          )}
          <div>
            <p style={{ fontWeight: 700, color: '#0f1f4b', fontSize: '15px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{data.name}</p>
            <p style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{data.region} · {data.subregion}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { label: 'Capital',      value: data.capital },
            { label: 'Language',     value: data.languages?.slice(0, 2).join(', ') },
            { label: 'Currency',     value: data.currencies?.map(c => `${c.symbol} ${c.code}`).join(', ') },
            { label: 'Timezone',     value: data.timezone },
            { label: 'Calling Code', value: data.callingCode },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
              <span style={{ color: '#6b7280', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{item.label}</span>
              <span style={{ fontWeight: 600, color: '#0f1f4b', textAlign: 'right', maxWidth: '58%', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{item.value || 'N/A'}</span>
            </div>
          ))}
        </div>

        {data.emergencyNumbers && (
          <div style={{ marginTop: '16px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 14px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#dc2626', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              🚨 Emergency
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span style={{ fontSize: '12px', color: '#dc2626', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>🚔 {data.emergencyNumbers.police}</span>
              <span style={{ fontSize: '12px', color: '#dc2626', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>🚑 {data.emergencyNumbers.ambulance}</span>
              <span style={{ fontSize: '12px', color: '#dc2626', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>🔥 {data.emergencyNumbers.fire}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
