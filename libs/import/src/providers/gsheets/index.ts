import { importGsheet } from './importGsheet';

export const gsheets = {
  name: 'gsheets',
  matchUrl: (url: URL): boolean => url.hostname === 'docs.google.com',
  import: importGsheet,
};
