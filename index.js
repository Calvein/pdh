const getMessage = require('./getMessage')

module.exports = async (req, res) => {
  let body = req.query.text || JSON.parse(req.body).text

  if (!body) {
    res.writeHead(400, { 'content-type': 'application/json' })
    return res.end(JSON.stringify({ "error": "missing `text` parameter"}))
  }

  const message = await getMessage(body)
  res.end(message)
}
