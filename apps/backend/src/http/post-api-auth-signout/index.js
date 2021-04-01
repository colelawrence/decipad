const Auth = require('@architect/shared/auth')

const auth = Auth()

exports.handler = async (req) => {
  return auth(req)
}