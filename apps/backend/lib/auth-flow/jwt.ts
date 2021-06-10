import NextAuthJWT from 'next-auth/jwt';

const maxAge = 30 * 24 * 60 * 60;

export default {
  secret: process.env.JWT_SECRET!,
  signingKey: Buffer.from(
    process.env.JWT_SIGNING_PRIVATE_KEY!,
    'base64'
  ).toString(),
  maxAge, // same as session maxAge,
  encode: NextAuthJWT.encode,
  decode: NextAuthJWT.decode,
};
