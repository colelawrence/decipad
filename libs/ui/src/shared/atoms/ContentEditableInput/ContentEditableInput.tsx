import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, useState } from 'react';
import { Descendant, Node, createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Editable, Slate, withReact } from 'slate-react';

export type ContentEditableInputProps = {
  readonly value: string;
  readonly onChange: (newValue: string) => void;
};

export const ContentEditableInput = ({
  value,
  onChange: onChangeProp = noop,
}: ContentEditableInputProps): ReturnType<FC> => {
  const [editor] = useState(() => {
    const e = withHistory(withReact(createEditor()));

    const { apply, onChange } = e;
    e.apply = (op) => {
      if (
        op.type !== 'insert_text' &&
        op.type !== 'remove_text' &&
        op.type !== 'set_selection'
      ) {
        return;
      }

      apply(op);
    };

    e.onChange = () => {
      const nodeString = Node.string(e.children[0]);

      onChangeProp(nodeString);
      onChange();
    };

    return e;
  });

  const initialValue: Descendant[] = [
    {
      type: 'paragraph',
      children: [{ text: value }],
    } as Descendant,
  ];

  return (
    <div
      contentEditable={false}
      css={containerStyles}
      data-testid="result-preview-input"
    >
      <Slate editor={editor} initialValue={initialValue}>
        <Editable />
      </Slate>
    </div>
  );
};

const containerStyles = css({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  span: {
    whiteSpace: 'nowrap',
  },
});
