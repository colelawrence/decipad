import { isTableResult } from '@decipad/computer';
import {
  ImportElement,
  useTEditorRef,
  MAX_IMPORT_CELL_COUNT,
} from '@decipad/editor-types';
import { requirePathBelowBlock } from '@decipad/editor-utils';
import { formatError } from '@decipad/format';
import { ImportResult, tryImport } from '@decipad/import';
import { useComputer } from '@decipad/react-contexts';
import { Spinner } from '@decipad/ui';
import { findNodePath, removeNodes, withoutNormalizing } from '@udecode/plate';
import { useSession } from 'next-auth/react';
import { FC, useEffect, useRef, useState } from 'react';
import { importTable } from './importTable';

interface SuspendedImportProps {
  element: ImportElement;
}

export const SuspendedImport: FC<SuspendedImportProps> = ({ element }) => {
  const editor = useTEditorRef();
  const computer = useComputer();

  const [fetched, setFetched] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [result, setResult] = useState<ImportResult | undefined>();
  const session = useSession();
  const [promise, setPromise] = useState<Promise<ImportResult[]> | undefined>();
  const insertedTable = useRef(false);

  if (!fetched && fetching && promise) {
    throw promise;
  }
  if (error) {
    throw error;
  }

  useEffect(() => {
    (async () => {
      if (
        !fetched &&
        !fetching &&
        session.data?.user?.id === element.createdByUserId
      ) {
        setFetching(true);
        try {
          const p = tryImport(
            { computer, url: new URL(element.url), provider: element.source },
            {
              maxCellCount: MAX_IMPORT_CELL_COUNT,
            }
          );
          setPromise(p);
          const imported = await p;
          if (imported.length > 0) {
            setError(undefined);
            setResult(imported[0]);
          } else {
            setError(`Could not load from ${element.url}`);
          }
          const firstImported = imported[0];
          setResult(firstImported);
        } catch (err) {
          console.error('Error caught while importing', err);
          setError((err as Error).message);
        } finally {
          setFetched(true);
          setFetching(false);
        }
      }
    })();
  }, [
    computer,
    element.createdByUserId,
    element.source,
    element.url,
    fetched,
    fetching,
    session.data?.user?.id,
  ]);

  useEffect(() => {
    if (result && !insertedTable.current) {
      insertedTable.current = true;
      const computerResult = result.result;
      if (computerResult?.type.kind === 'type-error') {
        setError(formatError('en-US', computerResult.type.errorCause));
      } else if (!isTableResult(computerResult)) {
        console.error(computerResult);
        setError('Expected result to be a table');
        return;
      }
      const path = findNodePath(editor, element);
      if (path && computerResult && isTableResult(computerResult)) {
        try {
          const insertPath = requirePathBelowBlock(editor, path);
          withoutNormalizing(editor, () => {
            importTable({
              editor,
              computer,
              insertPath,
              result,
            }).catch((err) => setError(err.message));
            removeNodes(editor, { at: path });
          });
        } catch (err) {
          console.error(err);
          setError((err as Error).message);
        }
      }
    }
  }, [computer, editor, element, result]);

  return <Spinner />;
};
