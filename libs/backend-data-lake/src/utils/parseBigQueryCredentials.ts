import { once } from '@decipad/utils';
import { z } from 'zod';
import { GoogleServiceAccountCredentials } from '../types';

const createGoogleServiceAccountCredentialsParser = once(() =>
  z.object({
    type: z.string(),
    project_id: z.string(),
    private_key_id: z.string(),
    private_key: z.string(),
    client_email: z.string(),
    client_id: z.string(),
    auth_uri: z.string(),
    token_uri: z.string(),
    auth_provider_x509_cert_url: z.string(),
    client_x509_cert_url: z.string(),
    universe_domain: z.string(),
  })
);

export const parseBigQueryCredentials = (
  credentials: string,
  fromBase64 = false
): GoogleServiceAccountCredentials => {
  return createGoogleServiceAccountCredentialsParser().parse(
    JSON.parse(
      fromBase64 ? Buffer.from(credentials, 'base64').toString() : credentials
    )
  );
};
