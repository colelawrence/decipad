import { pushResultToComputer } from '@decipad/live-connect';
import {
  useCodeConnectionStore,
  useConnectionStore,
  useNotebookId,
} from '@decipad/react-contexts';
import { useCallback, useEffect, useMemo } from 'react';
import { useDeciVariables, useIntegrationOptions } from '../hooks';
import { importFromJSONAndCoercions } from '@decipad/import';
import { useComputer, useWorker } from '@decipad/editor-hooks';
import { findNodePath, getNodeString, setNodes } from '@udecode/plate-common';
import type { ResultMessageType } from '@decipad/safejs';
import { useMyEditorRef, type IntegrationTypes } from '@decipad/editor-types';
import type { FC } from 'react';

/**
 * Code block integration, child of the regular IntegrationBlock
 * This component handles the execution of user code, and also
 * pushing it to the computer.
 */
export const CodeIntegration: FC<
  IntegrationTypes.IntegrationBlock<'codeconnection'> & {
    element: IntegrationTypes.IntegrationBlock;
  }
> = ({
  id,
  typeMappings,
  latestResult,
  integrationType,
  children,
  element,
}) => {
  const computer = useComputer();
  const deciVars = useDeciVariables();
  const varName = getNodeString(children[0]);
  const editor = useMyEditorRef();

  useEffect(() => {
    let canceled = false;
    (async () => {
      const result = await importFromJSONAndCoercions(
        computer,
        latestResult,
        typeMappings
      );

      if (canceled || !result) return;

      await pushResultToComputer(computer, id, varName, result);
    })();

    return () => {
      canceled = true;
    };
  }, [computer, id, varName, typeMappings, latestResult, children]);

  const notebookId = useNotebookId();
  const [worker] = useWorker(
    useCallback(
      (msg: ResultMessageType) => {
        (async () => {
          const result = await importFromJSONAndCoercions(
            computer,
            msg.result,
            typeMappings
          );

          if (!result) return;

          await pushResultToComputer(computer, id, varName, result);

          const path = findNodePath(editor, element);
          if (path == null) {
            return;
          }

          setNodes(
            editor,
            {
              latestResult: msg.result,
            } satisfies Partial<IntegrationTypes.IntegrationBlock>,
            { at: path }
          );
        })();
      },
      [typeMappings, computer, id, varName, editor, element]
    ),
    useCallback((e) => console.error(e), []),
    notebookId
  );

  useIntegrationOptions(
    element,
    useMemo(
      () => ({
        async onRefresh() {
          const res = await worker?.execute(integrationType.code, deciVars);

          if (res == null || res instanceof Error) {
            return;
          }

          return res;
        },
        onShowSource() {
          const store = useConnectionStore.getState();
          const codeStore = useCodeConnectionStore.getState();

          store.abort();

          importFromJSONAndCoercions(
            computer,
            latestResult,
            store.resultTypeMapping
          ).then((res) => {
            if (res) {
              store.Set({ resultPreview: res });
            }

            store.Set({
              connectionType: 'codeconnection',
              stage: 'connect',
              existingIntegration: id,
              rawResult: latestResult,
              varName,
            });

            store.setAllTypeMapping(typeMappings);
            store.changeOpen(true);

            codeStore.setCode(integrationType.code);
          });
        },
      }),
      [
        computer,
        deciVars,
        id,
        integrationType.code,
        latestResult,
        typeMappings,
        varName,
        worker,
      ]
    )
  );

  return null;
};
