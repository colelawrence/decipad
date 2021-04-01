'use strict'

const { parse: parseCookie} = require('simple-cookie')
const { parse: qsParse } = require('querystring')

function adaptReqRes(handle) {
  return async function respondWithAuth(req) {
    return new Promise((resolve, reject) => {
      const { method, path } = req.requestContext.http
      const url = req.rawPath
      const pathParts = path.split('/')
      let action = pathParts[pathParts.length - 1]
      const provider = req.pathParameters && req.pathParameters.provider
      if (provider === action) {
        action = pathParts[pathParts.length - 2]
      }

      const nextauth = [action]
      if (provider) {
        nextauth.push(provider)
      }

      const query = { nextauth, ...req.queryStringParameters }

      let body = req.body
      if (req.isBase64Encoded) {
        body = base64Decode(req.body)
      }

      if (body && req.headers['content-type'] === 'application/x-www-form-urlencoded') {
        body = urlDecode(body)
      }

      if (!body) {
        body = {}
      }

      const newReq = {
        cookies: parseCookies(req.cookies),
        body,
        method,
        url,
        query
      }

      let statusCode = 200
      const headers = {}
      const newRes = {
        end: (buf) => {
          reply(buf)
        },
        json: (json) => {
          reply(json)
        },
        send: (buf) => {
          reply(buf)
        },
        setHeader: (key, value) => {
          if (Array.isArray(value)) {
            for (const val of value) {
              newRes.setHeader(key, val)
            }
            return
          }
          key = key.toLowerCase()
          const existingValue = headers[key]
          if (key === 'set-cookie' && existingValue) {
            headers[key] = existingValue + ',' + value
          } else {
            headers[key] = value
          }
        },
        getHeader: (key) => {
          return headers[key.toLowerCase()]
        },
        status: (code) => {
          statusCode = code
          return newRes
        },
        redirect: (url) => {
          headers['Location'] = url
          statusCode = 302
          reply()
        }
      }
      handle(newReq, newRes)

      function reply(body) {
        if (typeof body === 'object') {
          body = JSON.stringify(body)
          if (!headers['content-type']) {
            headers['content-type'] = 'application/json; charset=utf-8'
          }
        }
        const response = {
          statusCode,
          headers,
          body
        }

        resolve(response)
      }
    })

  }
}

function parseCookies(cookies = []) {
  return cookies.reduce((cookies, cookie) => {
    const { name, value } = parseCookie(cookie)
    cookies[name] = decodeURIComponent(value)
    return cookies
  }, {})
}

function base64Decode(str) {
  return Buffer.from(str, 'base64').toString()
}

function urlDecode(str) {
  return qsParse(str)
}

module.exports = adaptReqRes
