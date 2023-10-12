/* eslint decipad/css-prop-named-variable: 0 */
import type { Result } from '@decipad/remote-computer';
import { AnyElement, CellValueType } from '@decipad/editor-types';
import { css } from '@emotion/react';
import { FC, ReactNode, useState } from 'react';
import { Caret } from '../../icons';
import { CodeResult, DropdownMenu } from '../../organisms';

const dropdownPill = css({
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
        groups={
          dropdownOptions?.map((v) => ({
            item: v.value,
            focused: v.focused,
          })) || []
        }
        onExecute={(i) => {
          const id = dropdownOptions?.find((v) => v.value === i.item);
          if (!id) return;
          onChangeValue(id.id);
          setOpen(false);
        }}
      >
        <div onClick={() => setOpen(!open)} css={dropdownPill}>
          {dropdownResult && (
            <CodeResult
              {...dropdownResult}
              variant="inline"
              element={element}
            />
          )}
          <div css={{ width: 16, height: 16, marginLeft: 'auto' }}>
            <Caret variant={open ? 'up' : 'down'} />
          </div>
          <div css={{ display: 'none' }}>{children}</div>
        </div>
      </DropdownMenu>
    </div>
  );
};
