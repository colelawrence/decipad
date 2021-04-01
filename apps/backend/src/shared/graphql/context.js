'use strict'

const arc = require('@architect/functions')
const { decode: decodeJWT } = require('next-auth/jwt')
const { parse: parseCookie} = require('simple-cookie')
const jwtConf = require('../auth/jwt')

const TOKEN_COOKIE_NAME = 'next-auth.session-token'

async function context ({ event, context }) {
  const cookies = parseCookies(event.cookies)
  const token = cookies[TOKEN_COOKIE_NAME]
  let user = null
  if (token) {
    try {
      const decoded = await decodeJWT({
        ...jwtConf,
        token
      })
      if (decoded.accessToken) {
        const tables = await arc.tables()
        user = await tables.users.get({ id: decoded.accessToken })
      }
    } catch (err) {
      console.error(err.message)
      // do nothing
    }
  }

  context.user = user

  return context
}


function parseCookies(cookies = []) {
  return cookies.reduce((cookies, cookie) => {
    const { name, value } = parseCookie(cookie)
    cookies[name] = value
    return cookies
  }, {})
}

module.exports = context
