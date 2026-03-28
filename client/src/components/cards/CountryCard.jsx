// Fallback emergency numbers by country name (API always returns generic 999)
const EMERGENCY_MAP = {
  'India': {
    police:    { label: 'Police',          icon: '🚔', number: '100'  },
    ambulance: { label: 'Ambulance',       icon: '🚑', number: '108'  },
    fire:      { label: 'Fire',            icon: '🚒', number: '101'  },
    emergency: { label: 'Emergency',       icon: '🆘', number: '112'  },
    women:     { label: 'Women Helpline',  icon: '👩', number: '1091' },
    child:     { label: 'Child Helpline',  icon: '🧒', number: '1098' },
    disaster:  { label: 'Disaster',        icon: '🌊', number: '108'  },
  },
  'United States': {
    police:    { label: 'Police',    icon: '🚔', number: '911' },
    ambulance: { label: 'Ambulance', icon: '🚑', number: '911' },
    fire:      { label: 'Fire',      icon: '🚒', number: '911' },
    emergency: { label: 'Emergency', icon: '🆘', number: '911' },
  },
  'United Kingdom': {
    police:    { label: 'Police',    icon: '🚔', number: '999' },
    ambulance: { label: 'Ambulance', icon: '🚑', number: '999' },
    fire:      { label: 'Fire',      icon: '🚒', number: '999' },
    emergency: { label: 'Emergency', icon: '🆘', number: '112' },
  },
  'United Arab Emirates': {
    police:    { label: 'Police',    icon: '🚔', number: '999' },
    ambulance: { label: 'Ambulance', icon: '🚑', number: '998' },
    fire:      { label: 'Fire',      icon: '🚒', number: '997' },
    emergency: { label: 'Emergency', icon: '🆘', number: '999' },
  },
  'Singapore': {
    police:    { label: 'Police',    icon: '🚔', number: '999' },
    ambulance: { label: 'Ambulance', icon: '🚑', number: '995' },
    fire:      { label: 'Fire',      icon: '🚒', number: '995' },
    emergency: { label: 'Emergency', icon: '🆘', number: '999' },
  },
  'Australia': {
    police:    { label: 'Police',    icon: '🚔', number: '000' },
    ambulance: { label: 'Ambulance', icon: '🚑', number: '000' },
    fire:      { label: 'Fire',      icon: '🚒', number: '000' },
    emergency: { label: 'Emergency', icon: '🆘', number: '112' },
  },
  'Germany': {
    police:    { label: 'Police',    icon: '🚔', number: '110' },
    ambulance: { label: 'Ambulance', icon: '🚑', number: '112' },
    fire:      { label: 'Fire',      icon: '🚒', number: '112' },
    emergency: { label: 'Emergency', icon: '🆘', number: '112' },
  },
  'France': {
    police:    { label: 'Police',    icon: '🚔', number: '17'  },
    ambulance: { label: 'Ambulance', icon: '🚑', number: '15'  },
    fire:      { label: 'Fire',      icon: '🚒', number: '18'  },
    emergency: { label: 'Emergency', icon: '🆘', number: '112' },
  },
  'Japan': {
    police:    { label: 'Police',    icon: '🚔', number: '110' },
    ambulance: { label: 'Ambulance', icon: '🚑', number: '119' },
    fire:      { label: 'Fire',      icon: '🚒', number: '119' },
    emergency: { label: 'Emergency', icon: '🆘', number: '110' },
  },
  'Canada': {
    police:    { label: 'Police',    icon: '🚔', number: '911' },
    ambulance: { label: 'Ambulance', icon: '🚑', number: '911' },
    fire:      { label: 'Fire',      icon: '🚒', number: '911' },
    emergency: { label: 'Emergency', icon: '🆘', number: '911' },
  },
}

const DEFAULT_EMERGENCY = {
  emergency: { label: 'Emergency', icon: '🆘', number: '112' },
}

function getEmergencyNumbers(countryName) {
  if (!countryName) return DEFAULT_EMERGENCY
  // Try exact match first, then partial match
  const exact = EMERGENCY_MAP[countryName]
  if (exact) return exact
  const partial = Object.keys(EMERGENCY_MAP).find(k =>
    countryName.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(countryName.toLowerCase())
  )
  return partial ? EMERGENCY_MAP[partial] : DEFAULT_EMERGENCY
}

export default function CountryCard({ data }) {
  if (!data) return null

  const emergencyNumbers = getEmergencyNumbers(data.name)
  const emergencyEntries = Object.values(emergencyNumbers)

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e5e9f0', borderRadius: '16px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 20px', borderBottom: '1px solid #e5e9f0' }}>
        <span style={{ fontSize: '18px' }}>🌍</span>
        <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f1f4b', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Country Info</span>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Flag + name */}
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

        {/* Country details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
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

        {/* Emergency numbers */}
        <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '12px', padding: '14px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#dc2626', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            🚨 Emergency Numbers
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {emergencyEntries.map((entry, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.6)',
                borderRadius: '8px',
                padding: '7px 10px',
              }}>
                <span style={{ fontSize: '12px', color: '#7f1d1d', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {entry.icon} {entry.label}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {entry.number}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
