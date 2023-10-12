import { useEffect } from 'react';
import { RemoteComputer, parseBlock } from '@decipad/remote-computer';
import { MyEditor } from '@decipad/editor-types';
import { useComputer } from '@decipad/react-contexts';

const ENABLE_CLICK_REFERENCING = false;

export const useCodeLineClickReference = (
  editor: MyEditor,
  isSelected: boolean,
  code: string
) => {
  const computer = useComputer();

  useEffect(() => {
    if (!isSelected) return;
    if (!ENABLE_CLICK_REFERENCING) return;

    const onClick = (ev: MouseEvent) => {
      const elementId = getClickedInlineDef(ev);
      if (!elementId) return;

      ev.preventDefault();

      const insertName = getInsertableValue(editor, computer, elementId, code);
      if (!insertName) return;

      editor.insertText(insertName);
    };

    document.addEventListener('mousedown', onClick);

    return () => {
      document.removeEventListener('mousedown', onClick);
    };
  }, [editor, isSelected, code, computer]);
};

const DELIM_END = /[\s({[,]$/;

const getInsertableValue = (
  editor: MyEditor,
  computer: RemoteComputer,
  elementId: string,
  code: string
) => {
  const offset = editor.selection?.anchor.offset;
  const [left, right] = [code.slice(0, offset), code.slice(offset)];

  const variableName = getVariableName(computer, elementId);
  if (!variableName) return null;

  const block = `${left} ${variableName} ${right}`;
  const insertable = parseBlock(block).error == null;
  if (!insertable) return null;

  let insertableName = `${variableName} `;

  if (!left.match(DELIM_END) && left) insertableName = ` ${insertableName}`;

  return insertableName;
};

const getVariableName = (computer: RemoteComputer, elementId: string) => {
  const res = computer.getStatement(elementId);
  return res?.type === 'assign' ? res.args[0].args[0] : null;
};

const getClickedInlineDef = (ev: MouseEvent): string => {
  const { target } = ev;
  const inlineNumberEl =
    target instanceof HTMLElement ? getInlineElementParent(target) : null;

  return inlineNumberEl?.id || '';
};

const getInlineElementParent = (
  childElement: HTMLElement
): HTMLElement | null => {
  let element: HTMLElement | null = childElement;

  while (element) {
    const isInline =
      element?.dataset?.slateNode === 'element' &&
      element?.dataset?.slateInline === 'true';

    if (isInline) return element;

    element = element.parentElement;
  }

  return null;
};
