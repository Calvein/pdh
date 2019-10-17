const axios = require('axios')

const CITY_URL = 'https://geo.api.gouv.fr/communes'
const WEATHER_URL = 'http://www.meteofrance.com/mf3-rpc-portlet/rest/pluie/'
const CODES = ['❌', '☀️', '☔', '🌧️', '⛈️']

const formatTime = (time) => time.toString().padStart(2, 0)
const formatDate = (date) =>
  `${formatTime(date.getHours())}h${formatTime(date.getMinutes())}`

module.exports = async (text) => {
  const queryParam = /^\d{5}$/.test(text) ? 'codePostal' : 'nom'
  const errorName = queryParam === 'codePostal' ? 'code postal' : 'nom'
  const cityData = (await axios.get(CITY_URL, {
    params: {
      fields: 'nom,code',
      [queryParam]: text,
    },
  })).data[0]
  if (!cityData) {
    return `Il n'y a pas de ville existante avec le ${errorName} *${text}* 😔`
  }

  // The API requires an additional 0 at the end of the INSEE code
  const { data } = await axios.get(WEATHER_URL + cityData.code + '0')
  if (!data.hasData) {
    return `Il n'y a pas de données pour la ville avec le ${errorName} *${text}* 😔\nVous pouvez voir la couverture sur <http://www.meteofrance.com/previsions-meteo-france/previsions-pluie|le site de Météo france>`
  }
  const date = new Date(
    data.echeance.replace(
      /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/,
      '$1-$2-$3T$4:$5'
    )
  )
  const startTime = formatDate(date)
  date.setHours(date.getHours() + 1)
  const endTime = formatDate(date)

  const hasRain = data.dataCadran.some((d) => d.niveauPluie > 1)
  const emojis = data.dataCadran.map((d) => CODES[d.niveauPluie]).join('')

  let message = `à *${cityData.nom}* de ${startTime} ${emojis} à ${endTime}`
  if (hasRain) {
    message += '\nPrévoyez un parapluie ☂️'
  }

  return message
}
