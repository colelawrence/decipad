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
}

export interface NotionProvider extends BaseProvider {
  type: 'notion';
  getAllDatabases: (
    authHeaders: Record<string, string>
  ) => Promise<Array<object>>;

  /**
   * Some OAuth2 providers are different enough such that `oauth` library cannot handle the.
   *
   * In these cases, it is easier for us to make the request ourselves.
   */
  getAccessToken: (code: string) => Promise<{
    workspaceId: string;
    accessToken: string;
    resourceName: string;
  }>;
}

export interface GoogleSheetProvider extends BaseProvider {
  type: 'gsheets';
}
