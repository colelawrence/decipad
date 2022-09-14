export interface SheetRequestData {
  sheetId: string;
  gid?: number;
}

export const getSheetRequestDataFromUrl = (sheetUrl: URL): SheetRequestData => {
  const match = sheetUrl.pathname.match(/^\/spreadsheets\/d\/([^/]+)\/edit/);
  if (!match) {
    throw new Error(`Could not extract sheet id from ${sheetUrl}`);
  }
  const [, sheetId] = match;
  if (!sheetId) {
    throw new Error(`Could not extract sheet id from ${sheetUrl}`);
  }

  const hashMatch = sheetUrl.hash.match(/gid=([0-9]+)/);
  const gidString = hashMatch && hashMatch[1];
  const gid = gidString != null ? Number(gidString) : undefined;

  return { sheetId, gid };
};
