let NextAuth = require('next-auth');
if (typeof NextAuth !== 'function') {
  NextAuth = NextAuth.default;
}

let NextAuthJWT = require('next-auth/jwt');

if (typeof NextAuthJWT.encode !== 'function') {
  NextAuthJWT = NextAuthJWT.default;
}

const Auth = require('@architect/shared/auth');
const auth = Auth({ NextAuth, NextAuthJWT });

exports.handler = async (req) => {
  return auth(req);
};
