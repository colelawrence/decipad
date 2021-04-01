'use strict'

const jwt = require('next-auth/jwt')

const maxAge = 30 * 24 * 60 * 60

module.exports = {
  secret: process.env.JWT_SECRET,
  signingKey: process.env.JWT_SIGNING_PRIVATE_KEY,
  maxAge, // same as session maxAge,
  encode: jwt.encode,
  decode: jwt.decode
}
