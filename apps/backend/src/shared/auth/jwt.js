'use strict';

const maxAge = 30 * 24 * 60 * 60;

module.exports = ({ NextAuthJWT: jwt }) => ({
  secret: process.env.JWT_SECRET,
  signingKey: process.env.JWT_SIGNING_PRIVATE_KEY,
  maxAge, // same as session maxAge,
  encode: jwt.encode,
  decode: jwt.decode,
});
