import { importGsheet } from './importGsheet';
import { parseGsheetsSourceUrl } from './parseGsheetsSourceUrl';

export const gsheets = {
  name: 'gsheets',
  matchUrl: (url: URL): boolean => url.hostname === 'docs.google.com',
  import: importGsheet,
  parseSourceUrl: parseGsheetsSourceUrl,
};
