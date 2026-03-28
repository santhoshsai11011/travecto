export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

export const formatNumber = (num) => {
  if (!num) return 'N/A'
  return new Intl.NumberFormat('en-IN').format(num)
}

export const getWeatherIcon = (icon) => {
  if (!icon) return '🌤️'
  const map = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '⛅',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌦️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️',
  }
  return map[icon] || '🌤️'
}

export const getModeIcon = (mode) => {
  return mode === 'flight' ? '✈️' : '🚗'
}

export const getCarbonLabel = (co2kg) => {
  if (co2kg < 50) return { label: 'Low', color: 'text-green-600', bg: 'bg-green-50' }
  if (co2kg < 150) return { label: 'Medium', color: 'text-orange-600', bg: 'bg-orange-50' }
  return { label: 'High', color: 'text-red-600', bg: 'bg-red-50' }
}
