import { useCallback, useEffect, useState } from 'react';
import {
  ELEMENT_DISPLAY,
  ELEMENT_VARIABLE_DEF,
  MyElement,
  PlateComponent,
  useTEditorState,
} from '@decipad/editor-types';
import { useFocused, useSelected } from 'slate-react';
import {
  findNode,
  findNodePath,
  getNodeString,
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
import { safeDelete, useElementMutatorCallback } from '@decipad/editor-utils';
import copy from 'copy-to-clipboard';

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

  const editor = useTEditorState();
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

  const selectedLine = codeLines.find((i) => i.id === element.blockId);
  const readOnly = useIsEditorReadOnly();

  if (deleted) return <></>;

  return (
    <div {...attributes} contentEditable={false} id={element.id}>
      <DraggableBlock blockKind="interactive" element={element}>
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
