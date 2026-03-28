import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const sourceIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const destIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

function FitBounds({ positions }) {
  const map = useMap()
  useEffect(() => {
    if (positions && positions.length >= 2) {
      const bounds = L.latLngBounds(positions)
      map.fitBounds(bounds, { padding: [40, 40] })
    }
  }, [positions, map])
  return null
}

function generateArc(start, end, numPoints = 50) {
  const points = []
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints
    const lat = start[0] + (end[0] - start[0]) * t
    const lng = start[1] + (end[1] - start[1]) * t
    const distance = Math.sqrt(
      Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2)
    )
    const arc = Math.sin(Math.PI * t) * distance * 0.3
    points.push([lat + arc, lng])
  }
  return points
}

export default function MapView({ mode, sourceCoords, destCoords, source, destination, routeData }) {
  if (!sourceCoords || !destCoords) return null

  const startPos = [sourceCoords.lat, sourceCoords.lon]
  const endPos = [destCoords.lat, destCoords.lon]
  const centerLat = (startPos[0] + endPos[0]) / 2
  const centerLng = (startPos[1] + endPos[1]) / 2

  const arcPoints = mode === 'flight' ? generateArc(startPos, endPos) : null
  const roadPoints = mode === 'road' ? [startPos, endPos] : null

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e5e9f0',
      borderRadius: '16px',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '16px 20px',
        borderBottom: '1px solid #e5e9f0',
      }}>
        <span style={{ fontSize: '18px' }}>{mode === 'flight' ? '✈️' : '🚗'}</span>
        <span style={{ fontWeight: 700, color: '#0f1f4b', fontSize: '15px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {mode === 'flight' ? 'Flight Path' : 'Road Route'} Map
        </span>
        <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: 'auto', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {source} → {destination}
        </span>
      </div>

      <div style={{ height: '350px', width: '100%' }}>
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitBounds positions={[startPos, endPos]} />

          <Marker position={startPos} icon={sourceIcon}>
            <Popup>
              <div className="text-sm font-semibold">📍 {source}</div>
              <div className="text-xs text-gray-500">Departure</div>
            </Popup>
          </Marker>

          <Marker position={endPos} icon={destIcon}>
            <Popup>
              <div className="text-sm font-semibold">📍 {destination}</div>
              <div className="text-xs text-gray-500">Arrival</div>
            </Popup>
          </Marker>

          {mode === 'flight' && arcPoints && (
            <Polyline
              positions={arcPoints}
              color="#1a3fd4"
              weight={2.5}
              opacity={0.8}
              dashArray="8 4"
            />
          )}

          {mode === 'road' && roadPoints && (
            <Polyline
              positions={roadPoints}
              color="#22c55e"
              weight={3}
              opacity={0.8}
            />
          )}
        </MapContainer>
      </div>
    </div>
  )
}
