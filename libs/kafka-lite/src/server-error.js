class ServerError extends Error {
  constructor (message, code) {
    super(message)
    this.code = code
  }
}

function serverError (message, code) {
  return new ServerError(message, code)
}

module.exports = serverError
