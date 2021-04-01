'use strict'

const arc = require('@architect/functions')
const NextAuth = require('next-auth').default
const Providers = require('next-auth/providers')
const { nanoid } = require('nanoid')
const adaptReqRes = require('./adapt-req-res')
const createDbAdapter = require('./db-adapter')
const jwt = require('./jwt')

module.exports = function createAuthHandler() {
  const providers = [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    })
  ]

  const callbacks = {}

  callbacks.signIn = async function signIn(user, account, metadata) {
    // Deny access to users that are not yet registered
    if (account.provider === 'github' && metadata && metadata.id) {
      const githubUser = {
        id: metadata.id,
        login: metadata.login,
        name: metadata.name,
        avatar: metadata.avatar_url,
        email: metadata.email
      }

      let existingUser
      const tables = await arc.tables()
      const userKeyId = `${account.provider}:${githubUser.id}`
      const userKey = await tables.userkeys.get({ id: userKeyId })

      if (userKey) {
        existingUser = await tables.users.get({ id: userKey.user_id })
      }
      if (!existingUser) {
        // If the user does not exist, we just create a new one.
        // In the future, we might want to redirect the user
        // to a registration page by defining next-auth options.pages.newUser.

        const newUser = {
          id: nanoid(),
          name: githubUser.name,
          last_login: Date.now(),
          avatar: githubUser.avatar,
          email: githubUser.email
        }

        await tables.users.put(newUser)

        const newUserKey = {
          id: `${account.provider}:${githubUser.id}`,
          user_id: newUser.id
        }

        await tables.userkeys.put(newUserKey)

        if (githubUser.email) {
          const newEmailUserKey = {
            id: `${githubUser.email}:${githubUser.email}`,
            user_id: newUser.id
          }

          await tables.userkeys.put(newEmailUserKey)
        }

        existingUser = newUser
      }

      user.accessToken = existingUser.id

      return true
    }

    return false;
  }

  callbacks.jwt = async function jwt(token, user) {
    if (user) {
      token = { accessToken: user.id }
    }

    return token
  }

  callbacks.session = async function session(session, token) {
    session.accessToken = token.accessToken
    const tables = await arc.tables()
    const user = await tables.users.get({ id:token.accessToken })

    if (user) {
      Object.assign(session.user, {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.avatar
      })
    }

    return session
  }

  const options = {
    session: {
      jwt: true,
      secret: process.env.JWT_SECRET
    },
    providers,
    callbacks,
    jwt,
    adapter: createDbAdapter()
  }

  const nextAuth = NextAuth(options)

  return adaptReqRes(nextAuth)
}

