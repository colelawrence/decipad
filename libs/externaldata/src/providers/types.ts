export interface WithResource {
  resourceName: string;
  resourceId: string;
}

export interface AccessToken {
  accessToken: string;
  tokenType: string;

  scope?: string;
  refreshToken?: string;
  expiresIn?: string;
}

interface BaseProvider {
  id: string;
  accessTokenUrl: string;
  authorizationUrl: string;
  clientId: string;
  clientSecret: string;
  scope: string;
  authorizationParams: Record<string, string>;
  headers: Record<string, string>;

  /**
   * Extra headers to send to OAuth provider during data fetching stage.
   */
  dataHeaders?: Record<string, string>;

  getAccessToken: (code: string) => Promise<AccessToken & WithResource>;

  refreshAccessToken: (refreshToken: string) => Promise<AccessToken>;
}

export type NotionProvider = BaseProvider & {
  type: 'notion';
  getAllDatabases: (
    authHeaders: Record<string, string>
  ) => Promise<Array<object>>;
};

export type GoogleSheetProvider = BaseProvider & {
  type: 'gsheets';
};

export type Provider = NotionProvider | GoogleSheetProvider;
