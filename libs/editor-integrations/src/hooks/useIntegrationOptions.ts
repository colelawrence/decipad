import { useEffect } from 'react';
import { useIntegrationContext } from '.';
import { IntegrationTypes, useMyEditorRef } from '@decipad/editor-types';
import { findNodePath, setNodes } from '@udecode/plate-common';

interface IntegrationOptionActions {
  onRefresh: () => Promise<string | undefined>;
  onShowSource: () => void;
}

export function useIntegrationOptions(
  element: IntegrationTypes.IntegrationBlock,
  { onRefresh, onShowSource }: IntegrationOptionActions
): void {
  const observable = useIntegrationContext();
  const editor = useMyEditorRef();

  useEffect(() => {
    const sub = observable?.subscribe((action) => {
      switch (action) {
        case 'refresh':
          onRefresh().then((latestResult) => {
            if (latestResult == null) {
              return;
            }

            const path = findNodePath(editor, element);
            if (path == null) {
              return;
            }

            setNodes(
              editor,
              {
                latestResult,
              } satisfies Partial<IntegrationTypes.IntegrationBlock>,
              { at: path }
            );
          });

          break;
        case 'show-source': {
          onShowSource();
          break;
        }
      }
    });
    return () => {
      sub?.unsubscribe();
    };
  }, [editor, element, observable, onRefresh, onShowSource]);
}
