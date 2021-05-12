const NextAuth = require('next-auth');
const NextAuthJWT = require('next-auth/jwt');
const Auth = require('@architect/shared/auth-flow');
const auth = Auth({ NextAuth, NextAuthJWT });

exports.handler = async (req) => {
  return auth(req);
};
