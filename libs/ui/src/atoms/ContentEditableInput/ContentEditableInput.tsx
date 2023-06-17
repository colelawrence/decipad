import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, useCallback, useMemo } from 'react';
import { Descendant, Node, createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Editable, Slate, withReact } from 'slate-react';

export type ContentEditableInputProps = {
  readonly value: string;
  readonly onChange: (newValue: string) => void;
};

export const ContentEditableInput = ({
  value,
  onChange = noop,
}: ContentEditableInputProps): ReturnType<FC> => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const initialValue: Descendant[] = [
    {
      type: 'paragraph',
      children: [{ text: value }],
    } as Descendant,
  ];

  const handleOnChange = useCallback(
    (newValue: string) => {
      if (onChange) {
        onChange(newValue);
      }
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (event: { key: string; preventDefault: () => void }) => {
      if (event.key === 'Enter') {
        return event.preventDefault();
      }
      const elementText = Node.string(editor);
      handleOnChange(elementText + event.key);
    },
    [editor, handleOnChange]
  );

  return (
    <div
      contentEditable={false}
      css={containerStyles}
      data-testid={'result-preview-input'}
    >
      <Slate editor={editor} initialValue={initialValue}>
        <Editable onKeyDown={handleKeyDown} />
      </Slate>
    </div>
  );
};

const containerStyles = css({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});
