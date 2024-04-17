import { useEffect } from 'react';
import { pushResultToComputer } from '@decipad/live-connect';
import {
  useComputer,
  useConnectionStore,
  useSQLConnectionStore,
} from '@decipad/react-contexts';
import { importFromJSONAndCoercions } from '@decipad/import';
import { fetchQuery } from '../utils';
import { useIntegrationOptions } from '../hooks';
import { findNodePath, getNodeString, setNodes } from '@udecode/plate-common';
import { useMyEditorRef, type IntegrationTypes } from '@decipad/editor-types';
import type { FC } from 'react';

export const SQLIntegration: FC<
  IntegrationTypes.IntegrationBlock<'mysql'> & {
    element: IntegrationTypes.IntegrationBlock;
  }
> = ({
  typeMappings,
  integrationType,
  latestResult,
  id,
  children,
  element,
}) => {
  const computer = useComputer();
  const store = useConnectionStore();
  const sqlStore = useSQLConnectionStore();
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
  }, [computer, id, varName, typeMappings, latestResult]);

  useIntegrationOptions({
    onRefresh() {
      fetchQuery(integrationType.externalDataUrl, integrationType.query).then(
        async (res) => {
          if (res?.type !== 'success') {
            return;
          }

          const result = await importFromJSONAndCoercions(
            JSON.stringify(res.data),
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
              latestResult: JSON.stringify(res.data),
            } satisfies Partial<IntegrationTypes.IntegrationBlock>,
            { at: path }
          );
        }
      );
    },
    onShowSource() {
      store.abort();

      importFromJSONAndCoercions(latestResult, typeMappings).then((res) => {
        if (res) {
          store.Set({ resultPreview: res });
        }

        store.Set({
          connectionType: 'mysql',
          stage: 'connect',
          existingIntegration: id,
          varName,
        });

        store.setAllTypeMapping(typeMappings);
        store.changeOpen(true);

        sqlStore.Set({
          Query: integrationType.query,
          ExternalDataName: integrationType.externalDataName,
          ExternalDataId: integrationType.externalDataUrl,
          latestResult,
        });
      });
    },
    onDelete() {
      pushResultToComputer(computer, id, varName, undefined);
    },
  });

  return null;
};
