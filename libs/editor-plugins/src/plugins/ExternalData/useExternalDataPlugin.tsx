import { useState, useEffect, useCallback } from 'react';
import { Node, Transforms, Editor as SlateEditor } from 'slate';
import { produce } from 'immer';
import { useLocation } from 'react-router-dom';
import { TEditor } from '@udecode/plate';
import * as externalData from './external-data';

interface Identifiable {
  id: string;
}

interface ExternalDataPluginOptions {
  editor?: TEditor;
}

interface CreateOrUpdateExternalDataOptions {
  authUrl: string;
  padId: string;
  blockId: string;
  provider: string;
  externalId: string;
  externalDataSourceId?: string;
}

interface UseExternalDataPluginReturn {
  createOrUpdateExternalData: (
    options: CreateOrUpdateExternalDataOptions
  ) => void;
}

interface OneExternalDataImport {
  padId: string;
  provider: string;
  blockId: string;
  externalId: string;
  externalDataSourceId?: string;
  authUrl?: string;
  creatingExternalDataSource: boolean;
  authenticating: boolean;
  authenticated: boolean;
  error?: string;
}

type ExternalDataState = OneExternalDataImport[];

export const useExternalDataPlugin = ({
  editor,
}: ExternalDataPluginOptions): UseExternalDataPluginReturn => {
  const [externalDataState, setExternalDataState] = useState<ExternalDataState>(
    []
  );
  const location = useLocation();

  const saveState = useCallback(
    (blockId: string, changes: Partial<OneExternalDataImport>) => {
      setExternalDataState(
        produce((externalDataImports) => {
          const dataImport = externalDataImports.find(
            (i) => i.blockId === blockId
          );
          Object.assign(dataImport, changes);
        })
      );
    },
    [setExternalDataState]
  );

  useEffect(() => {
    (async () => {
      for (const externalDataSource of externalDataState) {
        const { padId, blockId, provider, externalId, error } =
          externalDataSource;

        const needsDataSourceCreation =
          !error && // break auth if we encountered an error
          !externalDataSource.externalDataSourceId &&
          !externalDataSource.creatingExternalDataSource;

        const needsAuthentication =
          !!error &&
          externalDataSource.externalDataSourceId &&
          !externalDataSource.authenticated &&
          !externalDataSource.authenticating &&
          externalDataSource.authUrl;

        if (needsDataSourceCreation) {
          saveState(blockId, { creatingExternalDataSource: true });
          try {
            const { externalDataSourceId, dataUrl, authUrl } =
              // eslint-disable-next-line no-await-in-loop
              await externalData.createExternalDataSource({
                name: `${provider}:${blockId}`,
                padId,
                provider,
                externalId,
              });

            saveState(blockId, { authUrl, externalDataSourceId });

            saveToDocState(editor, blockId, {
              'data-error': '', // remove the error if there was one
              'data-auth-url': authUrl,
              'data-external-data-source-id': externalDataSourceId,
              'data-href': dataUrl,
            });
          } catch (err) {
            saveState(blockId, { error: (err as Error).message });
            saveToDocState(editor, blockId, {
              'data-error': (err as Error).message,
            });
          } finally {
            saveState(blockId, {
              creatingExternalDataSource: false,
            });
          }
        } else if (needsAuthentication && externalDataSource.authUrl) {
          setExternalDataState(
            produce((dataImports) => {
              dataImports.splice(
                externalDataState.findIndex((b) => b.blockId === blockId),
                1
              );
            })
          );

          // eslint-disable-next-line no-await-in-loop
          await externalData.authenticate(
            externalDataSource.authUrl,
            location.pathname
          );
        }
      }
    })();
  }, [editor, externalDataState, location.pathname, saveState]);

  const createOrUpdateExternalData = useCallback(
    (options: CreateOrUpdateExternalDataOptions): void => {
      setExternalDataState(
        produce((externalDatas) => {
          const block = externalDatas.find(
            (b) => b.blockId === options.blockId
          );
          if (block) {
            Object.assign(block, {
              ...options,
              authenticated: false,
              authenticating: false,
              creatingExternalDataSource: false,
            });
          } else {
            externalDatas.push({
              ...options,
              authenticating: false,
              authenticated: false,
              creatingExternalDataSource: false,
            });
          }
        })
      );
    },
    [setExternalDataState]
  );

  return {
    createOrUpdateExternalData,
  };
};

function blockIdToBlockIndex(editor: TEditor, blockId: string): number {
  return editor.children.findIndex(
    (block) => (block as unknown as Identifiable).id === blockId
  );
}

function saveToDocState(
  editor: TEditor | undefined,
  blockId: string,
  props: Record<string, string>
) {
  if (editor) {
    const blockIndex = blockIdToBlockIndex(editor, blockId);
    Transforms.setNodes(
      editor as unknown as SlateEditor,
      props as Partial<Node>,
      { at: [blockIndex] }
    );
  }
}
