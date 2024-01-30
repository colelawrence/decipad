/* eslint decipad/css-prop-named-variable: 0 */
import { useEffect, useState, useMemo } from 'react';
import type { CellTextEditingProps } from './types';
import { usePipedCellPluginOption } from './usePipedCellPluginOption';
import { tdHorizontalPadding, tdVerticalPadding } from '../../../styles/table';
import { withHistory } from 'slate-history';
import { Editable, Slate, withReact } from 'slate-react';
import { createEditor } from 'slate';
import isHotkey from 'is-hotkey';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import {
  toDOMNode,
  useEditorRef,
  focusEditor,
  getEndPoint,
  getBlockAbove,
} from '@udecode/plate-common';
import { ELEMENT_TD } from '@decipad/editor-types';

export const CellEditorDefaultEditing = (props: CellTextEditingProps) => {
  const { cellProps, value, onChange, onConfirm, onCancel } = props;

  const {
    value: initialValue,
    plugins,
    onConvertToFormula,
    onSelectNextCell,
  } = cellProps;

  const editor = useEditorRef();

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const cellEntry = getBlockAbove(editor, {
      at: editor.selection?.focus,
      match: { type: ELEMENT_TD },
    });
    if (!cellEntry) return;

    /**
     * Note: onConfirm must be called before setting the selection to ensure
     * that the selection is set correctly.
     */

    switch (event.key) {
      case 'Tab': {
        onConfirm();
        event.preventDefault();
        onSelectNextCell?.(event.shiftKey ? 'before' : 'after');
        break;
      }
      case 'Enter': {
        onConfirm();
        onSelectNextCell?.(event.shiftKey ? 'top' : 'bottom');
        break;
      }
      case 'ArrowUp': {
        onConfirm();
        onSelectNextCell?.('top');
        break;
      }
      case 'ArrowDown': {
        onConfirm();
        onSelectNextCell?.('bottom');
        break;
      }
      case 'Escape': {
        onChange(initialValue);
        onCancel();
        break;
      }
    }
  };

  // Convert to formula if the value becomes '='
  useEffect(() => {
    if (value === '=') {
      onConvertToFormula?.();
      onCancel();
    }
  }, [value, onConvertToFormula, onCancel]);

  /**
   * COMPAT: In Chrome and WebKit, pressing the up arrow when on the first line
   * of a nested contenteditable, or the down arrow on the last line, moves the
   * cursor to the parent contenteditable. In the absence of a workaround to
   * prevent this, we should ensure that the cell editor stops editing when
   * this happens.
   */
  useEffect(() => {
    const editorEl = toDOMNode(editor, editor);
    editorEl?.addEventListener('focus', onConfirm);
    return () => {
      editorEl?.removeEventListener('focus', onConfirm);
    };
  }, [onConfirm, editor]);

  const useRenderAboveTextEditor = usePipedCellPluginOption(
    plugins,
    'useRenderAboveTextEditor'
  );

  const useTextAlign = usePipedCellPluginOption(plugins, 'useTextAlign');

  const textAlign = useTextAlign('left', cellProps);

  const cellInput = useRenderAboveTextEditor(
    <CellInput
      initialValue={value}
      textAlign={textAlign}
      onChange={(newValue) => onChange(newValue)}
      onKeyDown={handleKeyDown}
    />,
    props
  );

  return (
    <>
      <ValueContentSize aria-hidden>{value}</ValueContentSize>
      {cellInput}
    </>
  );
};

const ValueContentSize = styled.div`
  opacity: 0;
  pointer-events: none;
`;

interface CellInputProps {
  initialValue: string;
  textAlign?: React.CSSProperties['textAlign'];
  onChange?: (value: string) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

type CellInputValue = [
  {
    type: 'p';
    children: [{ text: string }];
  }
];

const cellInputStyles = css({
  cursor: 'text',
  // Ensure the input is flush against the cell border
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  '&, & [data-slate-editor], & [data-slate-node=element]': {
    height: '100%',
  },
  '& [data-slate-node=element]': {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  paddingTop: tdVerticalPadding,
  paddingBottom: tdVerticalPadding,
  /**
   * --td-placeholder-width ensures that the content of the cell input does not
   * overlap with the placeholder.
   */
  paddingLeft: `var(--td-placeholder-width, ${tdHorizontalPadding}px)`,
  paddingRight: tdHorizontalPadding,
});

const CellInput = ({
  initialValue,
  textAlign,
  onChange,
  onKeyDown,
}: CellInputProps) => {
  const [editor] = useState(() => withHistory(withReact(createEditor())));

  const initialSlateValue: CellInputValue = useMemo(
    () => [
      {
        type: 'p',
        children: [{ text: initialValue }],
      },
    ],
    [initialValue]
  );

  const handleChange = (value: CellInputValue) => {
    onChange?.(value[0].children[0].text);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isHotkey('mod+a', event)) {
      editor.select([]);
      event.preventDefault();
      return;
    }

    onKeyDown?.(event);
  };

  // Auto-focus end of input
  useEffect(() => {
    focusEditor(editor as any, getEndPoint(editor as any, []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      // Prevent keyboard shortcuts from interfering with the outer editor
      onKeyDown={(event) => event.stopPropagation()}
      css={[cellInputStyles, { textAlign }]}
    >
      <Slate
        editor={editor}
        initialValue={initialSlateValue}
        onChange={handleChange as any}
      >
        <Editable onKeyDown={handleKeyDown} />
      </Slate>
    </div>
  );
};
