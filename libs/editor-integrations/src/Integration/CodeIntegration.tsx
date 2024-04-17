import { pushResultToComputer } from '@decipad/live-connect';
import {
  useCodeConnectionStore,
  useComputer,
  useConnectionStore,
  useNotebookId,
} from '@decipad/react-contexts';
import { useCallback, useEffect } from 'react';
import { useDeciVariables, useIntegrationOptions } from '../hooks';
import { importFromJSONAndCoercions } from '@decipad/import';
import { useWorker } from '@decipad/editor-hooks';
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
  const store = useConnectionStore();
  const codeStore = useCodeConnectionStore();
  const deciVars = useDeciVariables();
  const varName = getNodeString(children[0]);
  const editor = useMyEditorRef();

  useEffect(() => {
    async function getResult() {
      const result = await importFromJSONAndCoercions(
        latestResult,
        typeMappings
      );

      if (!result) return;

      pushResultToComputer(computer, id, varName, result);
    }

    getResult();
  }, [computer, id, varName, typeMappings, latestResult, children]);

  const notebookId = useNotebookId();
  const [worker] = useWorker(
    useCallback(
      (msg: ResultMessageType) => {
        async function getResult() {
          const result = await importFromJSONAndCoercions(
            msg.result,
            typeMappings
          );

          if (!result) return;

          pushResultToComputer(computer, id, varName, result);

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
        }

        getResult();
      },
      [typeMappings, computer, id, varName, editor, element]
    ),
    useCallback((e) => console.error(e), []),
    notebookId
  );

  useIntegrationOptions({
    onRefresh() {
      worker?.execute(integrationType.code, deciVars);
    },
    onShowSource() {
      store.abort();

      importFromJSONAndCoercions(latestResult, store.resultTypeMapping).then(
        (res) => {
          if (res) {
            store.Set({ resultPreview: res });
          }

          store.Set({
            connectionType: 'codeconnection',
            stage: 'connect',
            existingIntegration: id,
            varName,
          });

          store.setAllTypeMapping(typeMappings);
          store.changeOpen(true);

          codeStore.setCode(integrationType.code);
          codeStore.setLatestResult(latestResult);
        }
      );
    },
    onDelete() {
      pushResultToComputer(computer, id, varName, undefined);
    },
  });

  return null;
};
