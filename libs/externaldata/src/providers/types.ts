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

  getAccessToken: (code: string) => Promise<{
    accessToken: string;
    tokenType: string;

    resourceName: string;
    resourceId: string;

    scope?: string;
    refreshToken?: string;
    expiresIn?: string;
  }>;
}

interface WithRefreshAccessToken {
  refreshAccessToken: (refreshToken: string) => Promise<{
    accessToken: string;
    expiresIn?: string;
    tokenType: string;
    scope?: string;
  }>;
}

export type NotionProvider = BaseProvider & {
  type: 'notion';
  getAllDatabases: (
    authHeaders: Record<string, string>
  ) => Promise<Array<object>>;
};

export type GoogleSheetProvider = BaseProvider &
  WithRefreshAccessToken & {
    type: 'gsheets';
  };
