import type { FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import { Toggle } from '../../atoms';

const hiddenChildrenStyles = css({
  display: 'none',
});

export interface BooleanEditorProps {
  children?: ReactNode;
  value?: string;
  onChangeValue: (
    value: string | undefined // only booleans for now
  ) => void;
}

export const BooleanEditor: FC<BooleanEditorProps> = ({
  children,
  value = 'false',
  onChangeValue,
}) => {
  return (
    <div contentEditable={false}>
      <Toggle
        active={value !== 'false' && value !== 'no' && value.trim() !== ''}
        onChange={(newValue) => onChangeValue(newValue ? 'true' : 'false')}
      />
      <div css={hiddenChildrenStyles}>{children}</div>
    </div>
  );
};
