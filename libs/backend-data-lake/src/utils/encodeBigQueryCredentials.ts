import { GoogleServiceAccountCredentials } from '../types';

export const encodeBigQueryCredentials = (
  credentials: GoogleServiceAccountCredentials
): string => Buffer.from(JSON.stringify(credentials)).toString('base64');
