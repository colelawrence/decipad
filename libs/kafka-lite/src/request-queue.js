const processRequest = require('./process-request')

function createRequestQueue () {
  const requests = []
  let processing = 0

  function push (req) {
    requests.push(req)
    maybeProcessOne()
  }

  async function maybeProcessOne () {
    if ((processing === 0) && (requests.length > 0)) {
      processing++
      try {
        await processOne()
      } catch (err) {
        processing--
        throw err
      }
      processing--
      maybeProcessOne()
    }
  }

  async function processOne () {
    const request = requests.shift()

    await processRequest(request)
  }

  return {
    push
  }
}

module.exports = createRequestQueue
