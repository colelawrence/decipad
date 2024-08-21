import { ClientEventsContext } from '@decipad/client-events';
import {
  Children,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { DraggableBlock } from '../block-management';
import type { LayoutElement, PlateComponent } from '@decipad/editor-types';
import {
  ELEMENT_LAYOUT,
  ELEMENT_PARAGRAPH,
  useMyEditorRef,
} from '@decipad/editor-types';
import { Layout as UILayout, layoutColumnGap, useMergedRef } from '@decipad/ui';
import { LayoutColumn } from './LayoutColumn';
import { useSelected } from 'slate-react';
import {
  InsideLayoutContext,
  useIsEditorReadOnly,
} from '@decipad/react-contexts';
import {
  findNodePath,
  setNodes,
  withoutNormalizing,
} from '@udecode/plate-common';
import { insertNodes, minColumnWidth } from '@decipad/editor-utils';
import { useElementWidth } from '@decipad/react-utils';
import { nanoid } from 'nanoid';
import { Add, FullWidthLayout, DefaultWidthLayout } from 'libs/ui/src/icons';

const useStableGetter = <T,>(value: T) => {
  const ref = useRef(value);
  ref.current = value;
  return useCallback(() => ref.current, []);
};

// The smallest width should have value 1
const normalizeRelativeWidths = (widths: number[]) => {
  const min = Math.min(...widths);
  return widths.map((w) => w / min);
};

export const Layout: PlateComponent = ({ attributes, children, element }) => {
  if (!element || element.type !== ELEMENT_LAYOUT) {
    throw new Error('Layout is meant to render columns elements');
  }
  if ('data-slate-leaf' in attributes) {
    throw new Error('Layout is not a leaf');
  }

  const editor = useMyEditorRef();
  const readOnly = useIsEditorReadOnly();
  const selected = useSelected();
  const layoutRef = useRef<HTMLUListElement>(null);
  const [availableWidthRef, availableWidth] =
    useElementWidth<HTMLUListElement>();

  const dependencyId = element.children.map((child) => child.id ?? '');

  const totalMinWidth = useMemo(() => {
    const sumOfMinWidths = element.children.reduce(
      (sum, { type }) => sum + minColumnWidth(type),
      0
    );

    const totalGaps = layoutColumnGap * (element.children.length - 1);

    return sumOfMinWidths + totalGaps;
  }, [element]);

  const hasSufficientWidth = availableWidth >= totalMinWidth;

  const getNthColumnMinWidth = (columnIndex: number) =>
    minColumnWidth(element.children[columnIndex].type);

  const getNthColumnWidth = (columnIndex: number) =>
    layoutRef.current?.children[columnIndex]?.clientWidth ??
    getNthColumnMinWidth(columnIndex);

  const getGetMaxWidth = (columnIndex: number) => () => {
    const columnWidth = getNthColumnWidth(columnIndex);
    const nextColumnWidth = getNthColumnWidth(columnIndex + 1);
    return (
      columnWidth + nextColumnWidth - getNthColumnMinWidth(columnIndex + 1)
    );
  };

  const [widthOverrides, setWidthOverrides] = useState<Partial<number[]>>([]);
  const getWidthOverrides = useStableGetter(widthOverrides);

  const getSetWidthOverride = (columnIndex: number) => (newWidth: number) => {
    const newWidthOverrides = element.children.map((_child, i) =>
      getNthColumnWidth(i)
    );

    const oldWidth = newWidthOverrides[columnIndex];
    const diff = newWidth - oldWidth;

    newWidthOverrides[columnIndex] = newWidth;
    newWidthOverrides[columnIndex + 1] -= diff;

    setWidthOverrides(normalizeRelativeWidths(newWidthOverrides));
  };

  const commitWidthOverride = () => {
    withoutNormalizing(editor, () => {
      const path = findNodePath(editor, element);
      if (!path) return;

      Object.entries(getWidthOverrides()).forEach(([key, newWidth]) => {
        const index = parseInt(key, 10);
        const columnPath = [...path, index];

        setNodes(
          editor,
          {
            columnWidth: newWidth,
          },
          {
            at: columnPath,
          }
        );
      });
    });

    setWidthOverrides([]);
  };

  const addColumn = () => {
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
  };

  const event = useContext(ClientEventsContext);

  const toggleWidth = () => {
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
  };

  const ref = useMergedRef(layoutRef, availableWidthRef);

  return (
    <DraggableBlock
      blockKind="layout"
      element={element}
      fullWidth={element.width === 'full'}
      dependencyId={dependencyId}
      data-layout={hasSufficientWidth ? 'columns' : 'rows'}
      contextualActions={
        readOnly
          ? []
          : [
              {
                id: 'add-column',
                icon: <Add />,
                onClick: addColumn,
              },
              {
                id: 'toggle-width',
                icon:
                  element.width === 'full' ? (
                    <DefaultWidthLayout />
                  ) : (
                    <FullWidthLayout />
                  ),
                onClick: toggleWidth,
              },
            ]
      }
      isCommentable={false}
      {...attributes}
    >
      <InsideLayoutContext.Provider value={true}>
        <UILayout ref={ref} insufficientWidth={!hasSufficientWidth}>
          {Children.map(children, (child, index) => {
            const childElement = element.children[index];
            return (
              <LayoutColumn
                element={childElement}
                layoutSelected={selected}
                relativeWidth={
                  widthOverrides[index] ?? childElement.columnWidth ?? 1
                }
                resizable={
                  !readOnly &&
                  hasSufficientWidth &&
                  index !== element.children.length - 1
                }
                getCurrentWidth={() => getNthColumnWidth(index)}
                getMaxWidth={getGetMaxWidth(index)}
                setWidthOverride={getSetWidthOverride(index)}
                commitWidthOverride={commitWidthOverride}
              >
                {child}
              </LayoutColumn>
            );
          })}
        </UILayout>
      </InsideLayoutContext.Provider>
    </DraggableBlock>
  );
};
