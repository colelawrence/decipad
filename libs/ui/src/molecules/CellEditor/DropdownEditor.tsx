import { FC, ReactNode, useState } from 'react';
import { css } from '@emotion/react';
import { AnyElement, CellValueType } from '@decipad/editor-types';
import { getExprRef, Result } from '@decipad/computer';
import { CodeResult, DropdownMenu } from '../../organisms';
import { purple700 } from '../../primitives';

const dropdownPill = css({
  borderRadius: '16px',
  borderWidth: '2px',
  borderStyle: 'solid',
  borderColor: purple700.rgb,
  display: 'flex',
  alignItems: 'center',
});

export interface DropdownEditorProps {
  children?: ReactNode;
  value?: string;
  type?: CellValueType;
  parentType?: 'table' | 'input';
  onChangeValue: (value: string | undefined) => void;
  dropdownOptions?: Array<{ id: string; value: string; focused?: boolean }>;
  dropdownResult?: Result.Result;
  element?: AnyElement;
}

export const DropdownEditor: FC<DropdownEditorProps> = ({
  children,
  onChangeValue,
  dropdownResult,
  dropdownOptions,
  element,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div contentEditable={false} aria-roledescription="dropdown-editor">
      <DropdownMenu
        open={open}
        isReadOnly={true}
        setOpen={setOpen}
        items={
          dropdownOptions?.map((v) => ({
            item: v.value,
            focused: v.focused,
          })) || []
        }
        onExecute={(i) => {
          const id = dropdownOptions?.find((v) => v.value === i);
          if (!id) return;
          onChangeValue(getExprRef(id.id));
          setOpen(false);
        }}
      >
        <div
          onClick={() => setOpen(!open)}
          css={[
            { minHeight: '20px', paddingLeft: '8px' },
            dropdownResult && dropdownPill,
          ]}
        >
          {dropdownResult && (
            <CodeResult
              {...dropdownResult}
              variant="inline"
              element={element}
            />
          )}
          <div css={{ display: 'none' }}>{children}</div>
        </div>
      </DropdownMenu>
    </div>
  );
};
