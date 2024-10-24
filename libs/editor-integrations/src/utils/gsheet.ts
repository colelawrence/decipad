type SpreadsheetValue = string | boolean | number;
type SpreadsheetColumn = SpreadsheetValue[];

export interface Sheet {
  values: SpreadsheetColumn[];
}

type SheetRequestData = {
  sheetId: string;
  gid: number;
};

export type SheetMeta = {
  spreadsheetId: string;
  properties: {
    sheetId: number;
    title: string;
  };
  sheets: SheetMeta[];
};

const getSheetRequestDataFromApiUrl = (sheetUrl: URL): SheetRequestData => {
  const match = sheetUrl.pathname.match(
    /^\/v4\/spreadsheets\/([^/]+)\/values\/([^/]+)/
  );

  if (!match) {
    throw new Error(`Could not extract request data from ${sheetUrl}`);
  }

  const [, sheetId, gid] = match;
  return { sheetId, gid: Number(gid) };
};

const getSheetRequestDataFromUserUrl = (sheetUrl: URL): SheetRequestData => {
  let match = sheetUrl.pathname.match(/^\/spreadsheets\/d\/([^/]+)\/edit/);
  if (!match) {
    match = sheetUrl.pathname.match(
      /^\/spreadsheets\/u\/[^/]+\/d\/([^/]+)\/edit/
    );
  }
  if (!match) {
    throw new Error(`Could not extract sheet id from ${sheetUrl}`);
  }
  const [, sheetId] = match;
  if (!sheetId) {
    throw new Error(`Could not extract sheet id from ${sheetUrl}`);
  }

  const hashMatch = sheetUrl.hash.match(/gid=([0-9]+)/);
  const gid = Number((hashMatch && hashMatch[1]) ?? 0);

  return { sheetId, gid };
};

export const getSheetRequestDataFromUrl = (sheetUrl: URL): SheetRequestData => {
  if (sheetUrl.hostname === 'content-sheets.googleapis.com') {
    return getSheetRequestDataFromApiUrl(sheetUrl);
  }
  return getSheetRequestDataFromUserUrl(sheetUrl);
};
