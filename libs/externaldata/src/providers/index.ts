import type { ExternalDataSourceProvider } from '@decipad/backendtypes';
import { gsheets } from './gsheets';
import { notion } from './notion';

export interface ProviderOptions {
  useThirdPartyUrl?: string;
}

export interface Provider {
  id: string;
  accessTokenUrl: string;
  authorizationUrl: string;
  clientId: string;
  clientSecret: string;
  scope: string;
  authorizationParams: Record<string, string>;
  headers: Record<string, string>;

  /**
   * Some OAuth2 providers are different enough such that `oauth` library cannot handle the.
   *
   * In these cases, it is easier for us to make the request ourselves.
   */
  getAccessToken?: (
    code: string
  ) => Promise<{ accessToken: string; refreshToken: string | undefined }>;
}

export const providers: Partial<
  Record<ExternalDataSourceProvider, () => Provider>
> = {
  gsheets,
  notion,
};
