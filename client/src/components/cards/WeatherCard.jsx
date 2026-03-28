import { getWeatherIcon } from '../../utils/helpers'

export default function WeatherCard({ data }) {
  if (!data) return null

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e5e9f0', borderRadius: '16px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e5e9f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🌦️</span>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f1f4b', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Weather in {data.city}
          </span>
        </div>
        {data.isMock && (
          <span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '8px', background: '#ffedd5', color: '#c2410c' }}>
            Demo data
          </span>
        )}
      </div>

      <div style={{ padding: '20px' }}>
        {/* Current conditions */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', marginBottom: '6px' }}>
              <span style={{ fontSize: '72px', fontWeight: 800, letterSpacing: '-2px', color: '#0f1f4b', lineHeight: 1, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {data.temperature}
              </span>
              <span style={{ fontSize: '24px', color: '#6b7280', marginBottom: '6px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>°C</span>
            </div>
            <p style={{ fontSize: '16px', color: '#0f1f4b', textTransform: 'capitalize', marginBottom: '4px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {data.description}
            </p>
            <p style={{ fontSize: '13px', color: '#6b7280', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Feels like {data.feelsLike}° · Humidity {data.humidity}% · Wind {data.windSpeed} m/s
            </p>
          </div>
          <div style={{ fontSize: '64px', lineHeight: 1 }}>{getWeatherIcon(data.icon)}</div>
        </div>

        {/* 7-day forecast */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }} className="scrollbar-hide">
          {data.forecast?.slice(0, 7).map((day, i) => (
            <div
              key={i}
              style={{
                flexShrink: 0,
                minWidth: '60px',
                textAlign: 'center',
                padding: '10px 8px',
                background: '#f0f4f8',
                borderRadius: '12px',
                transition: 'background 0.15s',
                cursor: 'default',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#e5e9f0'}
              onMouseLeave={e => e.currentTarget.style.background = '#f0f4f8'}
            >
              <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{day.day?.slice(0, 3)}</p>
              <div style={{ fontSize: '20px', marginBottom: '6px' }}>{getWeatherIcon(day.icon)}</div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0f1f4b', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{day.high}°</p>
              <p style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{day.low}°</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
