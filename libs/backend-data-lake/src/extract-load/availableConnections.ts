import { DataLakeDataConnection } from '@decipad/backendtypes';
import { getAllExtractSourceDefinitions } from './sources/getAllExtractSourceDefinitions';

export interface PossibleConnectionOptions {
  exclude?: DataLakeDataConnection[];
}

export const availableConnections = ({
  exclude = [],
}: PossibleConnectionOptions) =>
  getAllExtractSourceDefinitions().filter(
    (source) => !exclude.some((e) => e.source === source.sourceType)
  );
