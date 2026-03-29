import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plane, Car, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import useTripStore from '../store/useTripStore'
import useAuthStore from '../store/useAuthStore'
import WeatherCard from '../components/cards/WeatherCard'
import FlightCard from '../components/cards/FlightCard'
import RouteCard from '../components/cards/RouteCard'
import CarbonCard from '../components/cards/CarbonCard'
import NewsCard from '../components/cards/NewsCard'
import CurrencyCard from '../components/cards/CurrencyCard'
import CountryCard from '../components/cards/CountryCard'
import PackingListCard from '../components/cards/PackingListCard'
import SkeletonCard from '../components/common/SkeletonCard'
import MapView from '../components/map/MapView'
import PDFButton from '../components/pdf/PDFButton'

function MapViewWrapper({ mode, source, sourceCountry, destination, destinationCountry, routeData }) {
  const [coords, setCoords] = useState(null)

  useEffect(() => {
    // Reset immediately so stale coords never persist while new ones load
    setCoords(null)

    const geocode = async (city) => {
      try {
        // Use city name only — Nominatim ranks by prominence so "Moscow" returns
        // Moscow Russia, "Amsterdam" returns Amsterdam Netherlands, etc.
        // Appending a country (especially the default "India") breaks international cities.
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
          { headers: { 'User-Agent': 'Travecto/1.0' } }
        )
        const data = await res.json()
        if (data.length > 0) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
      } catch {}
      return null
    }

    const fetchCoords = async () => {
      // For road mode, prefer server-geocoded coords from ORS (already city-accurate)
      if (mode === 'road' && routeData?.sourceCoords && routeData?.destCoords) {
        setCoords({ source: routeData.sourceCoords, dest: routeData.destCoords })
        return
      }
      const [srcCoords, dstCoords] = await Promise.all([
        geocode(source),
        geocode(destination),
      ])
      if (srcCoords && dstCoords) setCoords({ source: srcCoords, dest: dstCoords })
    }

    fetchCoords()
  }, [source, sourceCountry, destination, destinationCountry, mode, routeData])

  if (!coords) return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e5e9f0',
      borderRadius: '16px',
      padding: '20px',
      textAlign: 'center',
      fontSize: '14px',
      color: '#6b7280',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
    }}>
      Loading map…
    </div>
  )

  return (
    <MapView
      mode={mode} source={source} destination={destination}
      sourceCoords={coords.source} destCoords={coords.dest} routeData={routeData}
    />
  )
}

export default function Results() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { streamingData, isStreaming, streamDone, startStream, stopStream, saveTrip, clearBriefing } = useTripStore()

  const source = searchParams.get('source') || ''
  const sourceCountry = searchParams.get('sourceCountry') || 'India'
  const destination = searchParams.get('destination') || ''
  const destinationCountry = searchParams.get('destinationCountry') || destination
  const date = searchParams.get('date') || ''
  const mode = searchParams.get('mode') || 'flight'
  const hasStarted = useRef(false)

  useEffect(() => {
    if (!source || !destination) { navigate('/'); return }
    if (hasStarted.current) return
    hasStarted.current = true
    clearBriefing()
    startStream({ source, sourceCountry, destination, destinationCountry, date, mode })
    return () => stopStream()
  }, [])

  const handleSave = async () => {
    const res = await saveTrip({ source, destination, date, mode })
    if (res) toast.success('Trip saved!')
    else toast.error('Failed to save trip')
  }

  const isFlight = mode === 'flight'

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>

      {/* Top bar */}
      <div style={{
        position: 'sticky',
        top: '56px',
        zIndex: 40,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e5e9f0',
        boxShadow: '0 1px 8px rgba(15,31,75,0.06)',
      }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          padding: '10px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Left */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                fontSize: '13px', color: '#6b7280',
                background: 'none', border: 'none', cursor: 'pointer',
                transition: 'color 0.2s',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#0f1f4b'}
              onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
            >
              <ArrowLeft size={14} />
              Back
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Route pill */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '5px 12px',
                background: '#f0f4f8',
                border: '1px solid #e5e9f0',
                borderRadius: '100px',
                fontSize: '13px', fontWeight: 600, color: '#0f1f4b',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}>
                {isFlight
                  ? <Plane size={12} style={{ color: '#1a3fd4' }} />
                  : <Car   size={12} style={{ color: '#22c55e' }} />
                }
                {source} → {destination}
              </div>

              {date && (
                <span style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {date}
                </span>
              )}

              <span style={{
                fontSize: '12px', fontWeight: 600,
                padding: '3px 10px', borderRadius: '100px',
                background: isFlight ? '#dbeafe' : '#dcfce7',
                color: isFlight ? '#1d4ed8' : '#15803d',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}>
                {isFlight ? '✈️ Flight' : '🚗 Road Trip'}
              </span>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isStreaming && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                <span className="live-dot" />
                Loading data…
              </div>
            )}
            {streamDone && (
              <>
                <PDFButton streamingData={streamingData} source={source} destination={destination} mode={mode} date={date} />
                <button
                  onClick={handleSave}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
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
                  <Save size={13} />
                  Save Trip
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {streamingData.weather ? <WeatherCard data={streamingData.weather.data} /> : <SkeletonCard height={200} lines={4} label="🌦️ Weather" />}
            {isFlight
              ? streamingData.flights ? <FlightCard data={streamingData.flights.data} /> : <SkeletonCard height={180} lines={3} label="✈️ Flights" />
              : streamingData.route   ? <RouteCard  data={streamingData.route.data}   /> : <SkeletonCard height={180} lines={3} label="🚗 Route" />
            }
            {streamingData.carbon ? <CarbonCard data={streamingData.carbon.data} /> : <SkeletonCard height={160} lines={3} label="🌱 Carbon Score" />}
            {streamingData.news   ? <NewsCard   data={streamingData.news.data}   /> : <SkeletonCard height={220} lines={5} label="📰 Local News" />}
            {(streamingData.route?.data || streamingData.flights?.data) && (
              <MapViewWrapper
                mode={mode} source={source} sourceCountry={sourceCountry}
                destination={destination} destinationCountry={destinationCountry}
                routeData={streamingData.route?.data}
              />
            )}
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {streamingData.country  ? <CountryCard  data={streamingData.country.data}  /> : <SkeletonCard height={160} lines={4} label="🌍 Country Info" />}
            {streamingData.currency ? <CurrencyCard data={streamingData.currency.data} /> : <SkeletonCard height={120} lines={2} label="💱 Currency" />}
            {streamingData.weather
              ? <PackingListCard weatherData={streamingData.weather?.data} mode={mode} destination={destination} />
              : <SkeletonCard height={200} lines={5} label="🎒 Packing List" />
            }
          </div>
        </div>
      </div>
    </div>
  )
}
