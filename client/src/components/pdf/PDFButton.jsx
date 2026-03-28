import { useState } from 'react'
import { Download } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PDFButton({ streamingData, source, destination, mode, date }) {
  const [generating, setGenerating] = useState(false)

  const handleDownload = async () => {
    setGenerating(true)
    try {
      const { weather, flights, route, carbon, news, currency, country } = streamingData

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Travecto — ${source} to ${destination}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; color: #222; background: #fff; padding: 40px; }
    .header { background: #003580; color: white; padding: 24px 32px; border-radius: 12px; margin-bottom: 24px; }
    .header h1 { font-size: 24px; font-weight: 800; margin-bottom: 4px; }
    .header p { font-size: 13px; opacity: 0.8; }
    .badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-top: 8px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .card { border: 1px solid #e8e8e8; border-radius: 10px; padding: 16px; }
    .card h2 { font-size: 14px; font-weight: 700; margin-bottom: 12px; color: #003580; border-bottom: 2px solid #f0f4ff; padding-bottom: 8px; }
    .row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px; }
    .label { color: #717171; }
    .value { font-weight: 600; color: #222; }
    .temp { font-size: 32px; font-weight: 800; color: #003580; }
    .flight-item { background: #f7f7f7; border-radius: 8px; padding: 10px; margin-bottom: 8px; font-size: 12px; }
    .flight-item .airline { font-weight: 700; margin-bottom: 4px; }
    .carbon-bar { background: #f0f0f0; border-radius: 4px; height: 8px; margin: 4px 0; }
    .carbon-fill-flight { background: #ef4444; border-radius: 4px; height: 8px; }
    .carbon-fill-car { background: #f97316; border-radius: 4px; height: 8px; }
    .carbon-fill-bus { background: #eab308; border-radius: 4px; height: 8px; }
    .carbon-fill-train { background: #22c55e; border-radius: 4px; height: 8px; }
    .news-item { border-bottom: 1px solid #f0f0f0; padding: 8px 0; font-size: 12px; }
    .news-item:last-child { border-bottom: none; }
    .news-title { font-weight: 600; margin-bottom: 2px; }
    .news-source { color: #717171; font-size: 11px; }
    .tip { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px; font-size: 12px; color: #166534; margin-top: 8px; }
    .emergency { background: #fef2f2; border-radius: 8px; padding: 10px; margin-top: 8px; font-size: 12px; }
    .footer { text-align: center; margin-top: 24px; color: #717171; font-size: 11px; }
    .full-width { grid-column: 1 / -1; }
  </style>
</head>
<body>
  <div class="header">
    <h1>✈️ Travecto Trip Briefing</h1>
    <p>${source} → ${destination} · ${date || 'Flexible date'}</p>
    <span class="badge">${mode === 'flight' ? '✈️ Flight' : '🚗 Road Trip'}</span>
    <span class="badge" style="margin-left:8px">Generated ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
  </div>

  <div class="grid">

    ${weather?.data ? `
    <div class="card">
      <h2>🌦️ Weather — ${weather.data.city}</h2>
      <div class="temp">${weather.data.temperature}°C</div>
      <p style="font-size:12px;color:#717171;margin-bottom:12px;text-transform:capitalize">${weather.data.description}</p>
      <div class="row"><span class="label">Feels Like</span><span class="value">${weather.data.feelsLike}°C</span></div>
      <div class="row"><span class="label">Humidity</span><span class="value">${weather.data.humidity}%</span></div>
      <div class="row"><span class="label">Wind Speed</span><span class="value">${weather.data.windSpeed} m/s</span></div>
    </div>` : ''}

    ${country?.data ? `
    <div class="card">
      <h2>🌍 Country Info</h2>
      <div class="row"><span class="label">Country</span><span class="value">${country.data.name || 'India'}</span></div>
      <div class="row"><span class="label">Capital</span><span class="value">${country.data.capital || 'N/A'}</span></div>
      <div class="row"><span class="label">Language</span><span class="value">${country.data.languages?.slice(0,2).join(', ') || 'N/A'}</span></div>
      <div class="row"><span class="label">Currency</span><span class="value">${country.data.currencies?.map(c => c.code).join(', ') || 'INR'}</span></div>
      <div class="row"><span class="label">Timezone</span><span class="value">${country.data.timezone || 'N/A'}</span></div>
      <div class="row"><span class="label">Calling Code</span><span class="value">${country.data.callingCode || 'N/A'}</span></div>
      ${country.data.emergencyNumbers ? `
      <div class="emergency">
        🚨 Emergency: Police ${country.data.emergencyNumbers.police} ·
        Ambulance ${country.data.emergencyNumbers.ambulance} ·
        Fire ${country.data.emergencyNumbers.fire}
      </div>` : ''}
    </div>` : ''}

    ${currency?.data ? `
    <div class="card">
      <h2>💱 Currency</h2>
      <div class="row"><span class="label">Exchange Rate</span><span class="value">1 ${currency.data.from} = ${currency.data.rate?.toFixed(4)} ${currency.data.to}</span></div>
      <div class="row"><span class="label">₹10,000 =</span><span class="value">${currency.data.converted?.toFixed(2)} ${currency.data.to}</span></div>
      <div class="row"><span class="label">Last Updated</span><span class="value">${currency.data.lastUpdated}</span></div>
    </div>` : ''}

    ${carbon?.data ? `
    <div class="card">
      <h2>🌱 Carbon Footprint</h2>
      <div style="font-size:28px;font-weight:800;color:#003580;margin-bottom:8px">${carbon.data.co2kg} kg CO₂</div>
      ${carbon.data.comparison?.map(item => `
        <div style="margin-bottom:6px">
          <div class="row" style="margin-bottom:2px">
            <span class="label" style="text-transform:capitalize">${item.mode}</span>
            <span class="value">${item.co2kg} kg</span>
          </div>
          <div class="carbon-bar">
            <div class="carbon-fill-${item.mode}" style="width:${Math.min(100, (item.co2kg / Math.max(...carbon.data.comparison.map(c => c.co2kg))) * 100)}%"></div>
          </div>
        </div>
      `).join('')}
      ${carbon.data.greenerAlternative ? `
      <div class="tip">💡 Taking a ${carbon.data.greenerAlternative} instead saves ${carbon.data.savingsKg} kg CO₂!</div>
      ` : ''}
    </div>` : ''}

    ${mode === 'flight' && flights?.data ? `
    <div class="card full-width">
      <h2>✈️ Available Flights</h2>
      ${flights.data.flights?.map(f => `
        <div class="flight-item">
          <div class="airline">${f.airline} · ${f.flightNumber}</div>
          <div class="row">
            <span>${f.departure} → ${f.arrival}</span>
            <span>${f.duration}</span>
            <span style="color:#22c55e;font-weight:600">${f.status}</span>
            <span>Terminal ${f.terminal}</span>
          </div>
        </div>
      `).join('')}
    </div>` : ''}

    ${mode === 'road' && route?.data ? `
    <div class="card full-width">
      <h2>🚗 Road Trip Details</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;text-align:center">
        <div style="background:#eff6ff;border-radius:8px;padding:12px">
          <div style="font-size:24px;font-weight:800;color:#1d4ed8">${route.data.distanceKm}</div>
          <div style="font-size:11px;color:#6b7280">kilometres</div>
        </div>
        <div style="background:#f5f3ff;border-radius:8px;padding:12px">
          <div style="font-size:24px;font-weight:800;color:#7c3aed">${route.data.drivingTime?.formatted}</div>
          <div style="font-size:11px;color:#6b7280">drive time</div>
        </div>
        <div style="background:#f0fdf4;border-radius:8px;padding:12px">
          <div style="font-size:24px;font-weight:800;color:#16a34a">₹${route.data.fuelCost?.costINR}</div>
          <div style="font-size:11px;color:#6b7280">fuel cost</div>
        </div>
      </div>
    </div>` : ''}

    ${news?.data?.articles?.length > 0 ? `
    <div class="card full-width">
      <h2>📰 Latest News from ${destination}</h2>
      ${news.data.articles.slice(0, 4).map(a => `
        <div class="news-item">
          <div class="news-title">${a.title}</div>
          <div class="news-source">${a.source} · ${new Date(a.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
        </div>
      `).join('')}
    </div>` : ''}

  </div>

  <div class="footer">
    Generated by Travecto · travecto.app · ${new Date().toLocaleString('en-IN')}
  </div>
</body>
</html>`

      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Travecto-${source}-to-${destination}-${date || 'trip'}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Trip report downloaded!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate report')
    }
    setGenerating(false)
  }

  return (
    <button
      onClick={handleDownload}
      disabled={generating}
      className="flex items-center gap-1.5 text-sm font-semibold bg-primary text-white px-4 py-1.5 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50"
    >
      <Download size={14} />
      {generating ? 'Generating...' : 'Download Report'}
    </button>
  )
}
