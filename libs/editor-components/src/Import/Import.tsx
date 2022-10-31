import { useEffect, useState } from 'react';
import { removeNodes, withoutNormalizing } from '@udecode/plate';
import {
  ELEMENT_IMPORT,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  requirePathBelowBlock,
  useNodePath,
} from '@decipad/editor-utils';
import { Import as UIImport } from '@decipad/ui';
import { ImportResult, tryImport } from '@decipad/import';
import { useComputer } from '@decipad/react-contexts';
import { formatError } from '@decipad/format';
import { DraggableBlock } from '../block-management';
import { importTable } from './importTable';

const MAX_IMPORT_CELL_COUNT = 300;

export const Import: PlateComponent = ({ attributes, element }) => {
  assertElementType(element, ELEMENT_IMPORT);

  const editor = useTEditorRef();
  const computer = useComputer();

  const [fetched, setFetched] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [result, setResult] = useState<ImportResult | undefined>();
  const path = useNodePath(element);

  useEffect(() => {
    (async () => {
      if (!fetched && !fetching) {
        setFetching(true);
        try {
          const imported = await tryImport(
            computer,
            new URL(element.url),
            element.source,
            {
              maxCellCount: MAX_IMPORT_CELL_COUNT,
            }
          );
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
  }, [computer, element.source, element.url, fetched, fetching]);

  useEffect(() => {
    if (result) {
      const computerResult = result.result;
      if (computerResult?.type.kind === 'type-error') {
        setError(formatError('en-US', computerResult.type.errorCause));
      } else if (computerResult?.type.kind !== 'table') {
        setError('Expected result to be a table');
        return;
      }
      if (path && computerResult && computerResult.type.kind === 'table') {
        try {
          const insertPath = requirePathBelowBlock(editor, path);
          withoutNormalizing(editor, () => {
            importTable({
              editor,
              computer,
              insertPath,
              result,
            });
            removeNodes(editor, { at: path });
          });
        } catch (err) {
          console.error(err);
          setError((err as Error).message);
        }
      }
    }
  }, [computer, editor, element, path, result]);

  return (
    <DraggableBlock blockKind="paragraph" element={element} {...attributes}>
      <UIImport url={element.url} fetching={fetching} error={error} />
    </DraggableBlock>
  );
};
