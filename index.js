const { text } = require('micro')
const { parse } = require('querystring')
const getMessage = require('./getMessage')

module.exports = async (req, res) => {
  const body = parse(await text(req)).text
  if (!body) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    return res.end({ "error": "missing `text` parameter"})
  }

  const message = await getMessage(body)
  res.end(message)
}
