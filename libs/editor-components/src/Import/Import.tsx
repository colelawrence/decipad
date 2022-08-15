import { useEffect, useState } from 'react';
import { findNodePath } from '@udecode/plate';
import {
  ELEMENT_IMPORT,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { molecules } from '@decipad/ui';
import { tryImport } from '@decipad/import';
import { Result } from '@decipad/computer';
import { useComputer } from '@decipad/react-contexts';
import { formatError } from '@decipad/format';
import { DraggableBlock } from '../block-management';
import { importTable } from './importTable';

export const Import: PlateComponent = ({ attributes, element }) => {
  assertElementType(element, ELEMENT_IMPORT);

  const editor = useTEditorRef();
  const computer = useComputer();

  const [fetched, setFetched] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [result, setResult] = useState<Result.Result | undefined>();

  useEffect(() => {
    (async () => {
      if (!fetched && !fetching) {
        setFetching(true);
        try {
          setResult(await tryImport(element.source, new URL(element.url)));
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setFetched(true);
          setFetching(false);
        }
      }
    })();
  }, [element.source, element.url, fetched, fetching]);

  useEffect(() => {
    if (result?.type.kind === 'type-error') {
      setError(formatError('en-US', result.type.errorCause));
    }
    if (result && result.type.kind !== 'table') {
      setError('Expected result to be a table');
      return;
    }
    const path = findNodePath(editor, element);
    if (result && path) {
      importTable({
        editor,
        computer,
        path,
        table: result as Result.Result<'table'>,
      });
    }
  }, [computer, editor, element, result]);

  return (
    <div {...attributes}>
      <DraggableBlock blockKind="paragraph" element={element}>
        <molecules.Import
          url={element.url}
          fetching={fetching}
          error={error}
        ></molecules.Import>
      </DraggableBlock>
    </div>
  );
};
