import { Provider } from '../types';
import { importGsheet } from './importGsheet';
import { parseGsheetsSourceUrl } from './parseGsheetsSourceUrl';

export const gsheets: Provider = {
  name: 'gsheets',
  matchUrl: (url) => url.hostname === 'docs.google.com',
  import: importGsheet,
  parseSourceUrl: parseGsheetsSourceUrl,
};
