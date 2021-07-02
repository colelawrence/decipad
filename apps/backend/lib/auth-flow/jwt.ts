import NextAuthJWT from 'next-auth/jwt';
import { auth as authConfig } from '../config';

const config = authConfig().jwt;

export default {
  ...config,
  encode: NextAuthJWT.encode,
  decode: NextAuthJWT.decode,
};
