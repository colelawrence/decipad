import { useEffect, useState } from 'react';
import { LiveQueryElement, LiveQueryQueryElement } from '@decipad/editor-types';
import { Computer } from '@decipad/computer';
import { getDatabaseUrl } from '../utils/getDatabaseUrl';

export const useLiveConnectionUrl = (
  element: LiveQueryElement | LiveQueryQueryElement,
  computer: Computer
): string | undefined => {
  const databaseResult = computer.getBlockIdResult$.use(
    element.connectionBlockId
  );

  const [url, setUrl] = useState<string | undefined>(undefined);

  // getDatabaseUrl must be async because the result is async
  useEffect(() => {
    if (databaseResult?.result && !url) {
      getDatabaseUrl(databaseResult.result).then((dbUrl) => {
        if (dbUrl) {
          setUrl(dbUrl);
        }
      });
    }
  }, [databaseResult?.result, url]);

  return url;
};
