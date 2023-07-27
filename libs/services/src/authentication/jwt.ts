import { encode, decode } from 'next-auth/jwt';
import { auth as authConfig } from '@decipad/backend-config';

const config = authConfig().jwt;

export const jwt = {
  ...config,
  encode,
  decode,
};
