import { useEffect, useState } from 'react'
import { Activity, Database, Zap, Server } from 'lucide-react'
import api from '../api/axiosInstance'
import toast from 'react-hot-toast'

const Card = ({ children, style = {} }) => (
  <div style={{
    background: '#ffffff',
    border: '1px solid #e5e9f0',
    borderRadius: '16px',
    ...style,
  }}>
    {children}
  </div>
)

export default function Admin() {
  const [metrics, setMetrics] = useState(null)
  const [cache, setCache] = useState(null)
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [metricsRes, cacheRes, healthRes] = await Promise.all([
        api.get('/admin/metrics'),
        api.get('/admin/cache'),
        api.get('/admin/health'),
      ])
      setMetrics(metricsRes.data.data)
      setCache(cacheRes.data.data)
      setHealth(healthRes.data.data)
    } catch {
      toast.error('Failed to load admin data')
    }
    setLoading(false)
  }

  const handleClearCache = async () => {
    try {
      await api.delete('/admin/cache')
      toast.success('Cache cleared!')
      fetchAll()
    } catch {
      toast.error('Failed to clear cache')
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#6b7280', fontSize: '14px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Loading admin data…</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', paddingTop: '40px', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f1f4b', letterSpacing: '-0.3px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Admin Dashboard
            </h1>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              System observability and metrics
            </p>
          </div>
          <button
            onClick={handleClearCache}
            style={{
              fontSize: '13px', fontWeight: 600,
              padding: '9px 18px', borderRadius: '10px',
              border: '1.5px solid #f76b5e',
              color: '#f76b5e', background: '#ffffff',
              cursor: 'pointer', transition: 'background 0.2s',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#fff4f3'}
            onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
          >
            Clear Cache
          </button>
        </div>

        {/* Health cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
          {[
            { label: 'Server',  value: health?.server,          icon: <Server   size={16} />, color: '#15803d', bg: '#dcfce7' },
            { label: 'MongoDB', value: health?.mongodb,         icon: <Database size={16} />, color: '#15803d', bg: '#dcfce7' },
            { label: 'Redis',   value: health?.redis,           icon: <Zap      size={16} />, color: '#15803d', bg: '#dcfce7' },
            { label: 'Uptime',  value: health?.uptimeFormatted, icon: <Activity size={16} />, color: '#1d4ed8', bg: '#dbeafe' },
          ].map((item, i) => (
            <Card key={i} style={{ padding: '18px' }}>
              <div style={{ width: '36px', height: '36px', background: item.bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, marginBottom: '12px' }}>
                {item.icon}
              </div>
              <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {item.label}
              </p>
              <p style={{ fontWeight: 700, fontSize: '13px', color: item.color, textTransform: 'capitalize', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {item.value}
              </p>
            </Card>
          ))}
        </div>

        {/* Overview stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
          {[
            { label: 'Total Trips',    value: metrics?.overview?.totalTrips },
            { label: 'Today Trips',    value: metrics?.overview?.todayTrips },
            { label: 'Cache Hit Rate', value: `${metrics?.overview?.overallHitRate}%` },
          ].map((item, i) => (
            <Card key={i} style={{ padding: '20px', textAlign: 'center' }}>
              <p style={{ fontSize: '40px', fontWeight: 800, letterSpacing: '-1px', color: '#0f1f4b', marginBottom: '4px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {item.value}
              </p>
              <p style={{ fontSize: '13px', color: '#6b7280', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{item.label}</p>
            </Card>
          ))}
        </div>

        {/* Queue */}
        {metrics?.queue && (
          <Card style={{ padding: '20px 24px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f1f4b', marginBottom: '18px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              ⚡ BullMQ Queue
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {[
                { label: 'Waiting',   value: metrics.queue.waiting,   color: '#c2410c' },
                { label: 'Active',    value: metrics.queue.active,    color: '#1d4ed8' },
                { label: 'Completed', value: metrics.queue.completed, color: '#15803d' },
                { label: 'Failed',    value: metrics.queue.failed,    color: '#dc2626' },
              ].map((item, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-1px', color: item.color, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {item.value}
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Cache */}
        {cache && (
          <Card style={{ padding: '20px 24px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f1f4b', marginBottom: '18px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              🔴 Redis Cache
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Memory Used',   value: cache.memory?.used },
                  { label: 'Total Keys',    value: cache.totalKeys },
                  { label: 'Connections',   value: cache.connections },
                  { label: 'Keyspace Hits', value: cache.keyspaceHits, green: true },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#6b7280', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{item.label}</span>
                    <span style={{ fontWeight: 700, color: item.green ? '#15803d' : '#0f1f4b', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{item.value}</span>
                  </div>
                ))}
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Keys by category
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {Object.entries(cache.keyCategories || {}).map(([key, val]) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: '#6b7280', textTransform: 'capitalize', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{key}</span>
                      <span style={{ fontWeight: 700, color: '#0f1f4b', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Service metrics table */}
        {metrics?.services?.length > 0 && (
          <Card style={{ overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e9f0' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f1f4b', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                📊 Service Metrics
              </h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f0f4f8' }}>
                    {['Service', 'Hit Rate', 'Hits', 'Misses', 'Last Success'].map((h, i) => (
                      <th key={i} style={{
                        padding: '11px 20px',
                        textAlign: i === 0 ? 'left' : 'right',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#6b7280',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        borderBottom: '1px solid #e5e9f0',
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metrics.services.map((s, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#ffffff' : '#f0f4f8' }}>
                      <td style={{ padding: '12px 20px', fontWeight: 700, color: '#0f1f4b', textTransform: 'capitalize', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        {s.service}
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 700, color: s.hitRate >= 70 ? '#15803d' : s.hitRate >= 40 ? '#c2410c' : '#dc2626', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        {s.hitRate}%
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 700, color: '#15803d', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        {s.cacheHits}
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'right', color: '#dc2626', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        {s.cacheMisses}
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'right', color: '#6b7280', fontSize: '12px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        {s.lastSuccess ? new Date(s.lastSuccess).toLocaleTimeString('en-IN') : 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
