export interface SheetRequestData {
  sheetId: string;
  gid: string;
}

const getSheetRequestDataFromApiUrl = (sheetUrl: URL): SheetRequestData => {
  const match = sheetUrl.pathname.match(
    /^\/v4\/spreadsheets\/([^/]+)\/values\/([^/]+)/
  );

  if (!match) {
    throw new Error(`Could not extract request data from ${sheetUrl}`);
  }

  const [, sheetId, gid] = match;
  return { sheetId, gid };
};

const getSheetRequestDataFromUserUrl = (sheetUrl: URL): SheetRequestData => {
  const match = sheetUrl.pathname.match(/^\/spreadsheets\/d\/([^/]+)\/edit/);
  if (!match) {
    throw new Error(`Could not extract sheet id from ${sheetUrl}`);
  }
  const [, sheetId] = match;
  if (!sheetId) {
    throw new Error(`Could not extract sheet id from ${sheetUrl}`);
  }

  const hashMatch = sheetUrl.hash.match(/gid=([0-9]+)/);
  const gid = (hashMatch && hashMatch[1]) ?? '';

  return { sheetId, gid };
};

export const getSheetRequestDataFromUrl = (sheetUrl: URL): SheetRequestData => {
  if (sheetUrl.hostname === 'content-sheets.googleapis.com') {
    return getSheetRequestDataFromApiUrl(sheetUrl);
  }
  return getSheetRequestDataFromUserUrl(sheetUrl);
};
