export default function SkeletonCard({ height = 180, lines = 3, label }) {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e5e9f0',
      borderRadius: '16px',
      padding: '20px',
    }}>
      {label && (
        <div style={{ marginBottom: '16px' }}>
          <div className="skeleton" style={{ height: '15px', width: '120px', borderRadius: '8px' }} />
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="skeleton"
            style={{
              height: '14px',
              width: `${100 - i * 12}%`,
              borderRadius: '7px',
              animationDelay: `${i * 0.08}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
