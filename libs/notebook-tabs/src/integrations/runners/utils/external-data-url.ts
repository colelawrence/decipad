/**
 * @returns the correct URL pattern for our lambda that gets the external source data.
 */
export function getExternalDataUrl(
  id: string,
  specialParam: { url?: string; method?: 'GET' | 'POST' } = {}
): string {
  const baseUrl = new URL(
    `${window.location.origin}/api/externaldatasources/${id}/data`
  );

  if (specialParam.method != null) {
    // baseUrl += `?method=${specialParam.method}`;
    baseUrl.searchParams.set('method', specialParam.method);
  }

  if (specialParam.url != null) {
    baseUrl.searchParams.set('url', specialParam.url);
  }

  return baseUrl.toString();
}

/**
 * @returns the correct auth URL for this specific data source, which hits our lambda.
 */
export function getExternalDataAuthUrl(id: string): string {
  return `${window.location.origin}/api/externaldatasources/${id}/auth`;
}

/**
 * @returns the query URL for a specific notion database
 */
export function getNotionQueryDbLink(databaseId: string) {
  return `https://api.notion.com/v1/databases/${databaseId}/query`;
}

/**
 * @returns the external data URL for any special requests that are handled differently.
 */
export function getExternalDataReqUrl(
  id: string,
  req: 'getAllDatabases'
): string {
  return getExternalDataUrl(id, { url: req });
}

export function getExternalDataUrlWithDataLink(
  externalDataId: string,
  externalDataLinkId: string
): string {
  return `${getExternalDataUrl(
    externalDataId
  )}?externalDataLinkId=${externalDataLinkId}`;
}
