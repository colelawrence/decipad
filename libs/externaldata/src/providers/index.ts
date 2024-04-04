import type { ExternalDataSourceProvider } from '@decipad/backendtypes';
import { gsheets } from './gsheets';
import { notion } from './notion';
import type { GoogleSheetProvider, NotionProvider } from './types';

export type Provider = NotionProvider | GoogleSheetProvider;

export const providers: Partial<
  Record<ExternalDataSourceProvider, () => Provider>
> = {
  gsheets,
  notion,
};
