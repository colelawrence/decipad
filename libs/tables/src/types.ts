import type arc from '@architect/functions';

import { TableName } from '@decipad/backendtypes';

export interface ArcServices {
  tables: Record<TableName, string>;
}

export type Arc = typeof arc & {
  services: () => Promise<ArcServices>;
};
