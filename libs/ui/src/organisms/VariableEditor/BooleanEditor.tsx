import type { FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import { noop } from '@decipad/utils';
import { Toggle } from '../../atoms';

const hiddenChildrenStyles = css({
  display: 'none',
});

export interface BooleanEditorProps {
  children?: ReactNode;
  value?: string;
  onChangeValue?: (
    value: string | undefined // only booleans for now
  ) => void;
}

export const BooleanEditor: FC<BooleanEditorProps> = ({
  children,
  value = 'false',
  onChangeValue = noop,
}) => {
  return (
    <div contentEditable={false}>
      <Toggle
        active={value === 'true' || value === 'yes'}
        onChange={(newValue) => onChangeValue(newValue ? 'true' : 'false')}
      />
      <div css={hiddenChildrenStyles}>{children}</div>
    </div>
  );
};
