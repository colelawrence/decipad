import {
  ComponentProps,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  ELEMENT_DISPLAY,
  ELEMENT_VARIABLE_DEF,
  MyElement,
  PlateComponent,
  SmartRefElement,
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
import { ClientEventsContext } from '@decipad/client-events';
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

  // Because we only calculate results when the dropdown is open,
  // we must have the exception for this when the component hasn't yet rendered.
  // Otherwise you get `Result: Name`, because the component doesn't actually know
  // the name of the variable/result.
  const [loaded, setLoaded] = useState(false);

  const selected = useSelected();
  const focused = useFocused();
  const userEvents = useContext(ClientEventsContext);
  const readOnly = useIsEditorReadOnly();

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
  const changeVarName = useElementMutatorCallback(editor, element, 'varName');

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

  // Results from computer are NOT calculated until the menu is actually open.
  // Saving a lot of CPU when the editor is re-rendering when the user is busy
  // doing other work.
  const codeLines = computer.results$
    .useWithSelector(({ blockResults }) =>
      Object.keys(blockResults).map((blockId) => {
        if (!openMenu && loaded) return undefined;
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

          // Smart refs are used instead of variable names,
          // and in order to display these properly, we need to get the
          // smart ref name and create a string from this.
          let text = '';
          for (const c of node.children) {
            if ((c as MyElement)?.type === 'smart-ref') {
              const varName = computer.getSymbolDefinedInBlock(
                (c as SmartRefElement).blockId
              );
              text += varName;
            }
            text += getNodeString(c);
          }

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

  // Performance improvement: Because results are only calculated when
  // menu is open, we no longer have access to them all the time. So we
  // need to store a bit more information about it.
  const changeResult = useCallback(
    (blockId: string) => {
      const newRes = codeLines.find((i) => i.id === blockId);
      changeVarName(newRes?.text || '');
      changeBlockId(blockId);
      setOpenMenu(false);

      // Analytics
      userEvents({
        type: 'action',
        action: 'widget value updated',
        props: {
          variant: 'display',
          isReadOnly: readOnly,
        },
      });
    },
    [changeBlockId, changeVarName, codeLines, readOnly, userEvents]
  );

  // When the component is mounted, and the result has not yet been loaded,
  // we set the result name and value, this only happens once.
  useEffect(() => {
    if (codeLines.length > 0 && !loaded) {
      changeResult(element.blockId);
      setLoaded(true);
    }
  }, [changeResult, element.blockId, codeLines.length, loaded]);

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
            setSelectedId={changeResult}
            lineResult={res}
            result={element.varName || 'Name'}
            readOnly={readOnly}
          >
            {children}
          </DisplayWidget>
        </VariableEditor>
      </DraggableBlock>
    </div>
  );
};
