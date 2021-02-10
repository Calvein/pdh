const axios = require('axios')

const CODES = ['❌', '☀️', '☔', '🌧️', '⛈️']

const getGeocodeUrl = (query) =>
  `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    query
  )}.json?access_token=pk.eyJ1IjoiY2FsdmVpbiIsImEiOiJjZG5Td3FrIn0.u79_D5NDJMxg6TTmGoMlfA`
const getRainUrl = (lat, lon) =>
  `https://rpcache-aa.meteofrance.com/internet2018client/2.0/nowcast/rain?token=__Wj7dVSTjV9YGu1guveLyDq0g7S7TfTjaHBTPTpO0kj8__&lat=${lat}&lon=${lon}`

const formatTime = (time) => time.toString().padStart(2, 0)
const formatDate = (date) =>
  `${formatTime(date.getHours())}h${formatTime(date.getMinutes())}`

module.exports = async (query) => {
  const geocodedData = (await axios.get(getGeocodeUrl(query))).data
  if (!geocodedData.features || geocodedData.features.length === 0) {
    return `Il n'y a pas de résultats pour *${query}* 😔`
  }

  const place = geocodedData.features[0]
  const [lon, lat] = place.center
  const { data } = await axios.get(getRainUrl(lat, lon))
  if (!data.properties) {
    return `Il n'y a pas de données pour la recherche *${query}* 😔\nVous pouvez voir la couverture sur <https://meteofrance.com/|le site de Météo france>`
  }

  const { forecast } = data.properties

  const startTime = formatDate(new Date(forecast[0].time))
  const endTime = formatDate(new Date(forecast[forecast.length - 1].time))

  const hasRain = forecast.some((d) => d.rain_intensity > 1)
  const emojis = forecast.map((d) => CODES[d.rain_intensity]).join('')

  let message = `à *${place.text}* de ${startTime} ${emojis} à ${endTime}`
  if (hasRain) {
    message += '\nPrévoyez un parapluie ☂️'
  } else {
    message += '\nVous êtes tranquille 😎'
  }

  return message
}
