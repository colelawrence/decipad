import { useClientEvents } from '@decipad/client-events';
import {
  ELEMENT_LAYOUT,
  ELEMENT_PARAGRAPH,
  LayoutElement,
  MyElement,
  useMyEditorRef,
} from '@decipad/editor-types';
import { useAnnotations } from '@decipad/notebook-state';
import {
  useInsideLayoutContext,
  useNotebookMetaData,
} from '@decipad/react-contexts';
import { BlockContextualActions } from '@decipad/ui';
import {
  findNodePath,
  insertNodes,
  nanoid,
  setNodes,
} from '@udecode/plate-common';
import {
  Add,
  Chat,
  DefaultWidthLayout,
  FullWidthLayout,
} from 'libs/ui/src/icons';
import { ComponentProps, FC, useMemo } from 'react';

type ContextualActionsProps = {
  element: MyElement;
};

export const ContextualActions: FC<ContextualActionsProps> = ({ element }) => {
  const setSidebar = useNotebookMetaData((s) => s.setSidebar);
  const { handleExpandedBlockId } = useAnnotations();

  const isInsideLayout = useInsideLayoutContext();
  const editor = useMyEditorRef();

  const event = useClientEvents();

  const contextualActions = useMemo<
    ComponentProps<typeof BlockContextualActions>['contextualActions']
  >(() => {
    if (element.type === ELEMENT_LAYOUT) {
      return [
        {
          id: 'add-column',
          icon: <Add />,
          onClick: () => {
            const path = findNodePath(editor, element);
            if (!path) return;

            const newColumnPath = [...path, element.children.length];

            insertNodes(
              editor,
              [
                {
                  type: ELEMENT_PARAGRAPH,
                  id: nanoid(),
                  children: [{ text: '' }],
                },
              ],
              {
                at: newColumnPath,
              }
            );
          },
        },
        {
          id: 'toggle-width',
          icon:
            element.width === 'full' ? (
              <DefaultWidthLayout />
            ) : (
              <FullWidthLayout />
            ),
          onClick: () => {
            const path = findNodePath(editor, element);
            if (!path) return;

            setNodes(
              editor,
              {
                width: (
                  {
                    full: 'default',
                    default: 'full',
                  } as const
                )[element.width ?? 'default'],
              } satisfies Partial<LayoutElement>,
              {
                at: path,
              }
            );

            event({
              segmentEvent: {
                type: 'action',
                action: 'Toggle Width Button Clicked',
                props: {
                  analytics_source: 'frontend',
                  button_location: 'shortcut button',
                },
              },
            });
          },
        },
      ];
    } else if (!isInsideLayout) {
      return [
        {
          id: 'comment',
          icon: <Chat />,
          onClick: () => {
            if (element.id == null) {
              return;
            }

            setSidebar({ type: 'annotations' });
            handleExpandedBlockId(element.id);
          },
        },
      ];
    } else {
      return [];
    }
  }, [
    editor,
    element,
    event,
    setSidebar,
    handleExpandedBlockId,
    isInsideLayout,
  ]);

  if (isInsideLayout) {
    return null;
  }

  return <BlockContextualActions contextualActions={contextualActions} />;
};
