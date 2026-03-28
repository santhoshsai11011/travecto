import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const categoryIcons = {
  essentials: '🎒', clothing: '👕', toiletries: '🧴',
  electronics: '🔌', documents: '📄', healthSafety: '💊',
}

function generatePackingList(weatherData, mode, destination) {
  const desc = weatherData?.description?.toLowerCase() || ''
  const temp = weatherData?.temperature || 25
  const humidity = weatherData?.humidity || 50
  const forecast = weatherData?.forecast || []

  const isRainy = desc.includes('rain') || desc.includes('drizzle') || forecast.some(f => f.description?.toLowerCase().includes('rain'))
  const isCold = temp < 15
  const isHot = temp > 30
  const isHumid = humidity > 70

  const beachCities = ['goa', 'mumbai', 'chennai', 'kochi', 'vizag', 'pondicherry']
  const hillCities  = ['shimla', 'manali', 'ooty', 'munnar', 'darjeeling', 'mussoorie']
  const dest   = destination?.toLowerCase() || ''
  const isBeach = beachCities.some(c => dest.includes(c))
  const isHill  = hillCities.some(c => dest.includes(c))

  const essentials = ['ID proof / Aadhar card', 'Phone + charger', 'Wallet + cash', 'Personal medicines', 'Water bottle', 'Backpack / day bag']
  const clothing   = ['3 sets of casual clothes', 'Comfortable walking shoes']
  if (isCold || isHill) clothing.push('Warm jacket', 'Sweater', 'Thermal wear', 'Gloves')
  if (isHot)  clothing.push('Light cotton clothes', 'Sunglasses', 'Hat/cap')
  if (isRainy) clothing.push('Raincoat / umbrella', 'Waterproof shoes')
  if (isBeach) clothing.push('Swimwear', 'Flip flops', 'Beach towel')
  if (isHumid) clothing.push('Extra t-shirts')

  const toiletries = ['Toothbrush + toothpaste', 'Shampoo + soap', 'Deodorant']
  if (isHot || !isRainy) toiletries.push('Sunscreen SPF 50+')
  if (isRainy || isHumid) toiletries.push('Moisturizer')

  const electronics = ['Phone charger', 'Power bank', 'Earphones']
  if (mode === 'road')   electronics.push('Car charger', 'Bluetooth speaker')
  if (mode === 'flight') electronics.push('Neck pillow', 'Travel adapter')

  const documents = ['ID proof (original + copy)', 'Hotel booking confirmation', 'Emergency contacts']
  if (mode === 'flight') documents.push('Flight tickets (digital + printed)')
  if (mode === 'road')   documents.push('Driving license', 'Vehicle RC book', 'Insurance papers')

  const healthSafety = ['Hand sanitizer', 'Face masks', 'First aid kit', 'Pain relief tablets']
  if (isHot)   healthSafety.push('ORS packets', 'Electrolyte drinks')
  if (isBeach) healthSafety.push('After-sun lotion', 'Insect repellent')
  if (isRainy) healthSafety.push('Anti-fungal powder')

  const context = []
  if (isRainy) context.push('Rainy weather expected')
  if (isCold)  context.push('Cold temperatures')
  if (isHot)   context.push('Hot weather')
  if (isBeach) context.push('Beach destination')
  if (isHill)  context.push('Hill station')

  return {
    categories: { essentials, clothing, toiletries, electronics, documents, healthSafety },
    weatherContext: context.join(' · ') || 'Moderate weather',
    totalItems: essentials.length + clothing.length + toiletries.length + electronics.length + documents.length + healthSafety.length,
  }
}

export default function PackingListCard({ weatherData, mode, destination }) {
  const [expanded, setExpanded] = useState('essentials')
  const { categories, weatherContext, totalItems } = generatePackingList(weatherData, mode, destination)

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e5e9f0', borderRadius: '16px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e5e9f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🎒</span>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f1f4b', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Packing List</span>
        </div>
        <span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '8px', background: '#dbeafe', color: '#1d4ed8' }}>
          {totalItems} items
        </span>
      </div>

      <div style={{ padding: '16px 20px' }}>
        {weatherContext && (
          <div style={{ background: '#f0f4f8', borderRadius: '10px', padding: '9px 12px', marginBottom: '12px' }}>
            <p style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>📍 {weatherContext}</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {Object.entries(categories).map(([cat, items]) => (
            <div key={cat} style={{ border: '1px solid #e5e9f0', borderRadius: '12px', overflow: 'hidden' }}>
              <button
                onClick={() => setExpanded(expanded === cat ? null : cat)}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: expanded === cat ? '#f0f4f8' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  transition: 'background 0.15s',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
                onMouseEnter={e => { if (expanded !== cat) e.currentTarget.style.background = '#f0f4f8' }}
                onMouseLeave={e => { if (expanded !== cat) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{categoryIcons[cat] || '📦'}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f1f4b', textTransform: 'capitalize', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {cat.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>({items.length})</span>
                </div>
                {expanded === cat
                  ? <ChevronUp size={13} style={{ color: '#6b7280' }} />
                  : <ChevronDown size={13} style={{ color: '#6b7280' }} />
                }
              </button>

              {expanded === cat && (
                <div style={{ padding: '4px 12px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#f76b5e', flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', color: '#6b7280', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
