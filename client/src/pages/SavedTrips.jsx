import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plane, Car, Trash2, ArrowRight, BookMarked } from 'lucide-react'
import toast from 'react-hot-toast'
import useTripStore from '../store/useTripStore'

export default function SavedTrips() {
  const navigate = useNavigate()
  const { savedTrips, savedPagination, loading, fetchSavedTrips, deleteTrip } = useTripStore()

  useEffect(() => { fetchSavedTrips() }, [])

  const handleDelete = async (tripId) => {
    const success = await deleteTrip(tripId)
    if (success) toast.success('Trip deleted!')
    else toast.error('Failed to delete trip')
  }

  const handleView = (trip) => {
    const params = new URLSearchParams({
      source: trip.source,
      destination: trip.destination,
      date: trip.date ? trip.date.split('T')[0] : '',
      mode: trip.mode,
    })
    navigate(`/results?${params.toString()}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', paddingTop: '40px', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <div style={{
            width: '44px', height: '44px',
            background: '#dbeafe',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookMarked size={20} style={{ color: '#1d4ed8' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f1f4b', letterSpacing: '-0.3px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Saved Trips
            </h1>
            <p style={{ fontSize: '13px', color: '#6b7280', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {savedPagination?.total || 0} trips saved
            </p>
          </div>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                background: '#ffffff',
                border: '1px solid #e5e9f0',
                borderRadius: '16px',
                padding: '20px',
              }}>
                <div className="skeleton" style={{ height: '16px', width: '40%', marginBottom: '10px' }} />
                <div className="skeleton" style={{ height: '12px', width: '28%' }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && savedTrips.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: '80px', paddingBottom: '80px' }}>
            <div style={{
              width: '64px', height: '64px', margin: '0 auto 20px',
              background: '#ffffff',
              border: '1px solid #e5e9f0',
              borderRadius: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Plane size={28} style={{ color: '#9ca3af' }} />
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#0f1f4b', marginBottom: '8px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              No saved trips yet
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Search for a trip and save it to see it here
            </p>
            <button
              onClick={() => navigate('/')}
              style={{
                background: '#0f1f4b', color: '#ffffff',
                border: 'none', borderRadius: '12px',
                padding: '11px 24px', fontSize: '14px', fontWeight: 600,
                cursor: 'pointer', transition: 'background 0.2s',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#1a2f6b'}
              onMouseLeave={e => e.currentTarget.style.background = '#0f1f4b'}
            >
              Search a Trip
            </button>
          </div>
        )}

        {/* Trip list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {savedTrips.map((trip) => (
            <div
              key={trip._id}
              style={{
                background: '#ffffff',
                border: '1px solid #e5e9f0',
                borderRadius: '16px',
                padding: '18px 20px',
                transition: 'box-shadow 0.2s, border-color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(15,31,75,0.08)'; e.currentTarget.style.borderColor = '#1a3fd4' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e5e9f0' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: trip.mode === 'flight' ? '#dbeafe' : '#dcfce7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {trip.mode === 'flight'
                      ? <Plane size={17} style={{ color: '#1d4ed8' }} />
                      : <Car   size={17} style={{ color: '#15803d' }} />
                    }
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '15px', color: '#0f1f4b', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      {trip.source} → {trip.destination}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        {trip.date
                          ? new Date(trip.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : 'No date'
                        }
                      </span>
                      <span style={{ color: '#e5e9f0' }}>·</span>
                      <span style={{
                        fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '8px',
                        background: trip.mode === 'flight' ? '#dbeafe' : '#dcfce7',
                        color: trip.mode === 'flight' ? '#1d4ed8' : '#15803d',
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                      }}>
                        {trip.mode === 'flight' ? '✈️ Flight' : '🚗 Road Trip'}
                      </span>
                      <span style={{ color: '#e5e9f0' }}>·</span>
                      <span style={{ fontSize: '12px', color: '#9ca3af', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        Saved {new Date(trip.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => handleView(trip)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      fontSize: '13px', fontWeight: 600,
                      padding: '7px 14px', borderRadius: '10px',
                      border: '1.5px solid #f76b5e',
                      color: '#f76b5e', background: '#ffffff',
                      cursor: 'pointer', transition: 'background 0.2s',
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fff4f3'}
                    onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                  >
                    View <ArrowRight size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(trip._id)}
                    style={{
                      padding: '7px', borderRadius: '8px',
                      color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.background = '#fee2e2' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'none' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
