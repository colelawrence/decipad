import { ComponentProps, useCallback, useEffect, useState } from 'react';
import {
  ELEMENT_DISPLAY,
  ELEMENT_VARIABLE_DEF,
  MyElement,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { useFocused, useSelected } from 'slate-react';
import {
  findNode,
  findNodePath,
  getNodeString,
  moveNodes,
  PlateEditor,
  serializeHtml,
} from '@udecode/plate';
import {
  useComputer,
  useIsEditorReadOnly,
  useResult,
} from '@decipad/react-contexts';
import { DisplayWidget, VariableEditor } from 'libs/ui/src/organisms';
import { parseStatement } from '@decipad/computer';
import { DraggableBlock } from '@decipad/editor-components';
import {
  hasLayoutAncestor,
  safeDelete,
  useElementMutatorCallback,
  useNodePath,
  wrapIntoColumns,
} from '@decipad/editor-utils';
import { Editor, Path } from 'slate';
import copy from 'copy-to-clipboard';
import { defaultMoveNode } from '../utils/useDnd';

interface DropdownWidgetOptions {
  type: 'var' | 'calc';
  id: string;
  text: string;
}

export const Display: PlateComponent = ({ attributes, element, children }) => {
  if (element?.type !== ELEMENT_DISPLAY) {
    throw new Error(`Expression is meant to render expression elements`);
  }
  const [openMenu, setOpenMenu] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const selected = useSelected();
  const focused = useFocused();

  // Avoids flickers, if the user clicked away when menu is open,
  // the state still thinks it is open, so if the user clicked again,
  // the menu would open and instanly close.
  useEffect(() => {
    if (!(selected && focused)) {
      setOpenMenu(false);
    }
  }, [selected, focused]);

  const editor = useTEditorRef();
  const changeBlockId = useElementMutatorCallback(editor, element, 'blockId');
  const res = useResult(element.blockId);
  const computer = useComputer();

  const onDelete = useCallback(() => {
    const path = findNodePath(editor, element);
    if (path) {
      setDeleted(true);
      safeDelete(editor, path);
    }
  }, [editor, element]);

  const onCopy = useCallback(() => {
    copy(serializeHtml(editor as PlateEditor, { nodes: [element] }), {
      format: 'text/html',
    });
  }, [editor, element]);

  const codeLines = computer.results$
    .useWithSelector(({ blockResults }) =>
      Object.keys(blockResults).map((blockId) => {
        const kind = blockResults[blockId].result?.type.kind;
        if (
          kind === 'string' ||
          kind === 'number' ||
          kind === 'boolean' ||
          kind === 'type-error'
        ) {
          const entry = findNode<MyElement>(editor, {
            at: [],
            match: (n) => n.id === blockId,
          });

          if (!entry) return undefined;
          const [node] = entry;

          // Variable Defs are always assignments, so we can just give the Id,
          // and display the name of the var def.
          if (node.type === ELEMENT_VARIABLE_DEF) {
            return {
              type: 'var',
              id: node.id,
              text: node.children[0].children[0].text,
            };
          }

          const text = getNodeString(node);
          if (text.length === 0) return undefined;

          const computerParsed = parseStatement(text);
          if (computerParsed.error) return undefined;

          if (computerParsed.solution.type === 'assign') {
            return {
              type: 'var',
              id: node.id,
              text: computerParsed.solution.args[0].args[0],
            };
          }
          return {
            type: 'calc',
            id: node.id,
            text,
          };
        }
        return undefined;
      })
    )
    .filter((n): n is DropdownWidgetOptions => n !== undefined);

  const path = useNodePath(element);
  const isHorizontal = !deleted && path && hasLayoutAncestor(editor, path);

  const getAxis = useCallback<
    NonNullable<ComponentProps<typeof DraggableBlock>['getAxis']>
  >(
    (_, monitor) => ({
      horizontal:
        monitor.getItemType() === ELEMENT_VARIABLE_DEF ||
        monitor.getItemType() === ELEMENT_DISPLAY,
      vertical: !isHorizontal,
    }),
    [isHorizontal]
  );

  const onDrop = useCallback<
    NonNullable<ComponentProps<typeof DraggableBlock>['onDrop']>
  >(
    (item, _, direction) => {
      if (!path || (direction !== 'left' && direction !== 'right')) {
        return defaultMoveNode(editor, item, element.id, direction);
      }

      Editor.withoutNormalizing(editor as Editor, () => {
        const dragPath = findNode(editor, {
          at: [],
          match: { id: item.id },
        })?.[1];
        let dropPath: Path = [];

        if (isHorizontal) {
          if (direction === 'left') {
            dropPath = path;
          }
          if (direction === 'right') {
            dropPath = Path.next(path);
          }
        } else {
          dropPath = [...path, direction === 'left' ? 0 : 1];
          wrapIntoColumns(editor, path);
        }

        moveNodes(editor, { at: dragPath, to: dropPath });
      });
    },
    [editor, element.id, isHorizontal, path]
  );

  const selectedLine = codeLines.find((i) => i.id === element.blockId);
  const readOnly = useIsEditorReadOnly();

  if (deleted) return <></>;

  return (
    <div {...attributes} contentEditable={false} id={element.id}>
      <DraggableBlock
        blockKind="interactive"
        element={element}
        accept={
          isHorizontal ? [ELEMENT_VARIABLE_DEF, ELEMENT_DISPLAY] : undefined
        }
        getAxis={getAxis}
        onDrop={onDrop}
      >
        <VariableEditor
          variant="display"
          onCopy={onCopy}
          onDelete={onDelete}
          readOnly={readOnly}
        >
          <DisplayWidget
            dropdownContent={codeLines}
            openMenu={openMenu && focused && selected}
            onChangeOpen={setOpenMenu}
            selectedId={element.blockId}
            setSelectedId={changeBlockId}
            lineResult={res}
            result={selectedLine ? selectedLine.text : null}
            readOnly={readOnly}
          >
            {children}
          </DisplayWidget>
        </VariableEditor>
      </DraggableBlock>
    </div>
  );
};
