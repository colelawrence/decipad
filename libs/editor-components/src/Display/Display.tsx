import { useEffect, useMemo, useState } from 'react';
import {
  ELEMENT_CODE_LINE,
  ELEMENT_COLUMNS,
  ELEMENT_DISPLAY,
  ELEMENT_VARIABLE_DEF,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { useFocused, useSelected } from 'slate-react';
import { useIsEditorReadOnly, useResult } from '@decipad/react-contexts';
import { getNodeString } from '@udecode/plate';
import { DisplayWidget, VariableEditor } from 'libs/ui/src/organisms';
import { parseStatement } from '@decipad/computer';
import { DraggableBlock } from '@decipad/editor-components';
import { useElementMutatorCallback } from '@decipad/editor-utils';

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

  const codeLines = useMemo(
    () =>
      editor.children
        .flatMap((child) =>
          child.type === ELEMENT_COLUMNS ? child.children : child
        )
        .filter(
          (n) => n.type === ELEMENT_CODE_LINE || n.type === ELEMENT_VARIABLE_DEF
        )
        .map((n) => {
          if (n.type === ELEMENT_VARIABLE_DEF) {
            return {
              type: 'var',
              id: n.id,
              text: n.children[0].children[0].text,
            };
          }
          const text = getNodeString(n);
          if (text.length === 0) return undefined;

          const computerParsed = parseStatement(text);
          if (computerParsed.error) return undefined;

          if (computerParsed.solution.type === 'assign') {
            return {
              type: 'var',
              id: n.id,
              text: computerParsed.solution.args[0].args[0],
            };
          }
          return {
            type: 'calc',
            id: n.id,
            text,
          };
        })
        .filter((n): n is DropdownWidgetOptions => n !== undefined),
    [editor.children]
  );

  const selectedLine = codeLines.find((i) => i.id === element.blockId);
  const readOnly = useIsEditorReadOnly();

  return (
    <div {...attributes} contentEditable={false} id={element.id}>
      <DraggableBlock blockKind="interactive" element={element}>
        <VariableEditor variant="display">
          <DisplayWidget
            dropdownContent={codeLines}
            openMenu={openMenu && focused && selected}
            onChangeOpen={setOpenMenu}
            selectedId={element.blockId}
            setSelectedId={(id) => changeBlockId(id)}
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
