import { getCarbonLabel } from '../../utils/helpers'

const BAR_COLORS = {
  flight: '#ef4444',
  car:    '#f97316',
  bus:    '#eab308',
  train:  '#22c55e',
}

const LABEL_STYLES = {
  Low:    { color: '#15803d', bg: '#dcfce7' },
  Medium: { color: '#c2410c', bg: '#ffedd5' },
  High:   { color: '#dc2626', bg: '#fee2e2' },
}

export default function CarbonCard({ data }) {
  if (!data) return null

  const { label } = getCarbonLabel(data.co2kg)
  const ls = LABEL_STYLES[label] || { color: '#6b7280', bg: '#f0f4f8' }

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e5e9f0', borderRadius: '16px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e5e9f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🌱</span>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f1f4b', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Carbon Footprint</span>
        </div>
        <span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '8px', background: ls.bg, color: ls.color }}>
          {label} Impact
        </span>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Main number */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', marginBottom: '20px' }}>
          <span style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-1px', color: '#0f1f4b', lineHeight: 1, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {data.co2kg}
          </span>
          <span style={{ fontSize: '16px', color: '#6b7280', marginBottom: '4px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>kg CO₂</span>
        </div>

        {/* Comparison bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {data.comparison?.map((item, i) => {
            const max = Math.max(...data.comparison.map(c => c.co2kg))
            const width = max > 0 ? (item.co2kg / max) * 100 : 0
            const barColor = BAR_COLORS[item.mode] || '#1d4ed8'
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280', width: '36px', textTransform: 'capitalize', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {item.mode}
                </span>
                <div style={{ flex: 1, background: '#f0f4f8', borderRadius: '100px', height: '8px', overflow: 'hidden' }}>
                  <div style={{
                    height: '8px',
                    borderRadius: '100px',
                    background: barColor,
                    width: `${width}%`,
                    opacity: item.isSelected ? 1 : 0.45,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f1f4b', width: '56px', textAlign: 'right', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {item.co2kg} kg
                </span>
              </div>
            )
          })}
        </div>

        {/* Tip */}
        {data.greenerAlternative && (
          <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '12px 14px', display: 'flex', gap: '8px' }}>
            <span>💡</span>
            <p style={{ fontSize: '13px', color: '#15803d', lineHeight: 1.5, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Taking a <strong>{data.greenerAlternative}</strong> instead would save{' '}
              <strong>{data.savingsKg} kg CO₂</strong> on this trip!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
