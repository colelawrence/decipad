import { useEffect, useState, useMemo } from 'react';
import type { CellTextEditingProps } from './types';
import { usePipedCellPluginOption } from './usePipedCellPluginOption';
import { table as tableStyles } from '@decipad/ui';
import isHotkey from 'is-hotkey';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import {
  toDOMNode,
  useEditorRef,
  getEndPoint,
  getBlockAbove,
  Plate,
  PlateContent,
  createPlateEditor,
  PlatePlugin,
  getRange,
  select,
} from '@udecode/plate-common';
import { ELEMENT_PARAGRAPH, ELEMENT_TD } from '@decipad/editor-types';
import { decorateCode } from '@decipad/editor-utils';
import { RemoteComputer } from '@decipad/remote-computer';
import { useComputer } from '@decipad/react-contexts';
import {
  createAutoCompleteMenuPlugin,
  createSmartRefPlugin,
} from '@decipad/editor-plugins';
import {
  CellInputValue,
  deserializeCellText,
  serializeCellText,
} from './serializeCellText';
import { CellEditorDefaultReadOnly } from './CellEditorDefaultReadOnly';
import { isFlagEnabled } from '@decipad/feature-flags';

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
      initialText={value}
      textAlign={textAlign}
      onChange={(newValue) => onChange(newValue)}
      onKeyDown={handleKeyDown}
    />,
    props
  );

  return (
    <>
      <ValueContentSize aria-hidden>
        <CellEditorDefaultReadOnly
          {...cellProps}
          value={value}
          renderComputedValue={false}
        />
      </ValueContentSize>
      {cellInput}
    </>
  );
};

const ValueContentSize = styled.div`
  opacity: 0;
  pointer-events: none;
`;

interface CellInputProps {
  initialText: string;
  textAlign?: React.CSSProperties['textAlign'];
  onChange?: (value: string) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

const cellInputStyles = css({
  cursor: 'text',
  // Ensure the input is flush against the cell border
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  '& [data-slate-editor]': {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  '& [data-slate-editor] > [data-slate-node="element"]': {
    height: '100%',
    display: 'table-cell',
    verticalAlign: 'middle',
  },
  paddingTop: tableStyles.tdVerticalPadding,
  paddingBottom: tableStyles.tdVerticalPadding,
  /**
   * --td-placeholder-width ensures that the content of the cell input does not
   * overlap with the placeholder.
   */
  paddingLeft: `var(--td-placeholder-width, ${tableStyles.tdHorizontalPadding}px)`,
  paddingRight: tableStyles.tdHorizontalPadding,
});

export const createCellEditorInputPlugin = (
  computer: RemoteComputer
): PlatePlugin => ({
  key: 'cell-editor-input',
  decorate: decorateCode(computer, ELEMENT_PARAGRAPH),
  withOverrides: (editor) => {
    const { insertTextData } = editor;
    // Prevent pasting Slate fragments
    // eslint-disable-next-line no-param-reassign
    editor.insertData = insertTextData;

    return editor;
  },
});

const CellInput = ({
  initialText,
  textAlign,
  onChange,
  onKeyDown,
}: CellInputProps) => {
  const computer = useComputer();

  const [editor] = useState(() => {
    const plugins = [createCellEditorInputPlugin(computer)];

    if (isFlagEnabled('VARIABLES_IN_TABLES')) {
      plugins.push(
        createAutoCompleteMenuPlugin({
          options: {
            mode: 'tableCell',
          },
        })
      );

      plugins.push(createSmartRefPlugin());
    }

    return createPlateEditor<CellInputValue>({
      plugins,
    });
  });

  // Serialize the value to a string
  const handleChange = (value: CellInputValue) => {
    onChange?.(serializeCellText(value));
  };

  const initialValue: CellInputValue = useMemo(
    () => deserializeCellText(computer, initialText),
    [initialText, computer]
  );

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isHotkey('mod+a', event)) {
      editor.select([]);
      event.preventDefault();
      return;
    }
    if (isHotkey('mod+enter', event)) {
      editor.insertSoftBreak();
      event.preventDefault();
      return;
    }

    onKeyDown?.(event);
  };

  /**
   * Auto-focus end of input.
   * The reason we set the selection and focus manually, rather than using
   * Plate's `focusEditorEdge`, is because recent versions of slate-react use a
   * 10ms timeout before focusing the editor in cases where operations are
   * pending. Since setting the selection counts as a pending operation, this
   * can result in the first 10ms of keystrokes being lost.
   */
  useEffect(() => {
    const selection = getRange(editor, getEndPoint(editor, []));
    select(editor, selection);
    toDOMNode(editor, editor)?.focus();
  }, [editor]);

  return (
    <div
      // Prevent keyboard shortcuts from interfering with the outer editor
      onKeyDown={(event) => event.stopPropagation()}
      css={[cellInputStyles, { textAlign }]}
    >
      <Plate
        editor={editor}
        initialValue={initialValue}
        normalizeInitialValue
        onChange={handleChange}
      >
        <PlateContent onKeyDown={handleKeyDown} />
      </Plate>
    </div>
  );
};
