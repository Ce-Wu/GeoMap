const express = require('express')
const cors = require('cors')
const axios = require('axios')
require('dotenv').config()

const PORT = process.env.PORT || 3000

// INIT EXPRESS

const app = express()

// ENABLE CORS

app.use(cors())

app.get('/api/search/:query', async (req, res) => {
  try {
    // ADD API KEY
    const query = req.params.query
    const results = await axios(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${process.env.API_KEY}`,
    )

    // FORMAT DATA TO INCLUDE CITY AND REGION
    results.data.features.forEach((item) => {
      item.city = null
      item.state = null

      item.context.forEach((type) => {
        if (type.id.includes('place')) {
          item.city = type.text
        }
        if (type.id.includes('region')) {
          item.state = type.text
        }
      })
    })

    const data = results.data
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(`${__dirname}/public`))
}

app.listen(PORT, () => console.log(`app working on ${PORT} port`))
