import { ClientEventsContext } from '@decipad/client-events';
import { DraggableBlock } from '@decipad/editor-components';
import {
  ELEMENT_DISPLAY,
  ELEMENT_SMART_REF,
  ELEMENT_VARIABLE_DEF,
  PlateComponent,
  SmartRefElement,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  hasLayoutAncestor,
  safeDelete,
  useElementMutatorCallback,
  useNodePath,
  wrapIntoColumns,
} from '@decipad/editor-utils';
import {
  useComputer,
  useIsEditorReadOnly,
  useResult,
} from '@decipad/react-contexts';
import {
  ELEMENT_CODE_LINE,
  findNode,
  findNodePath,
  getNodeString,
  moveNodes,
  PlateEditor,
  serializeHtml,
  withoutNormalizing,
} from '@udecode/plate';
import copy from 'copy-to-clipboard';
import { DisplayWidget, VariableEditor } from 'libs/ui/src/organisms';
import {
  ComponentProps,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Path } from 'slate';
import { useFocused, useSelected } from 'slate-react';
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
  const namesDefined = computer.getNamesDefined$
    .useWithSelector((names) =>
      Object.values(names).map((name): DropdownWidgetOptions | undefined => {
        if (!openMenu && loaded) return undefined;
        const { kind } = name.type;
        if (
          !(
            kind === 'string' ||
            kind === 'number' ||
            kind === 'boolean' ||
            kind === 'type-error'
          ) ||
          name.kind !== 'variable'
        ) {
          return undefined;
        }
        return {
          type: 'var',
          text: name.name,
          id: name.blockId || '',
        };
      })
    )
    .filter((n): n is DropdownWidgetOptions => n !== undefined);

  // Decilang codelines do not need to have a name defining them.
  // But we still want to add them.
  const resultsWithNoName = editor.children
    .filter((n) => n.type === ELEMENT_CODE_LINE)
    .filter((n) => !computer.getSymbolDefinedInBlock(n.id))
    .filter((n) => {
      assertElementType(n, ELEMENT_CODE_LINE);
      const codelineResult = computer.getBlockIdResult$.get(n.id);
      const kind = codelineResult?.result?.type.kind;
      return (
        (kind === 'string' || kind === 'number' || kind === 'boolean') &&
        codelineResult?.type !== 'identified-error'
      );
    })
    .map((codeline): DropdownWidgetOptions | undefined => {
      assertElementType(codeline, ELEMENT_CODE_LINE);
      let text = '';
      for (const c of codeline.children) {
        if ((c as SmartRefElement)?.type === 'smart-ref') {
          assertElementType(c, ELEMENT_SMART_REF);
          const varName = computer.getSymbolDefinedInBlock(c.blockId);
          if (!varName) return undefined;
          text += varName;
        }
        text += getNodeString(c);
      }
      return {
        type: 'calc',
        text,
        id: codeline.id,
      };
    })
    .filter((n): n is DropdownWidgetOptions => n !== undefined);

  const allResults = useMemo(
    () => [...namesDefined, ...resultsWithNoName],
    [namesDefined, resultsWithNoName]
  );

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

      withoutNormalizing(editor, () => {
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
      const newRes = allResults.find((i) => i.id === blockId);
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
    [changeBlockId, changeVarName, allResults, readOnly, userEvents]
  );

  // When the component is mounted, and the result has not yet been loaded,
  // we set the result name and value, this only happens once.
  useEffect(() => {
    if (allResults.length > 0 && !loaded) {
      changeResult(element.blockId);
      setLoaded(true);
    }
  }, [changeResult, element.blockId, allResults.length, loaded]);

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
          element={element}
        >
          <DisplayWidget
            dropdownContent={allResults}
            openMenu={openMenu && focused && selected}
            onChangeOpen={setOpenMenu}
            selectedId={element.blockId}
            setSelectedId={changeResult}
            lineResult={res}
            result={element.varName || 'Unnamed'}
            readOnly={readOnly}
          >
            {children}
          </DisplayWidget>
        </VariableEditor>
      </DraggableBlock>
    </div>
  );
};
