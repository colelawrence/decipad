import { css } from '@emotion/react';
import type { FC, ReactNode } from 'react';
import { Toggle } from '../../atoms';
import { p12Medium, p24Bold } from '../../primitives';

const wrapperStyles = css({
  display: 'flex',
  gap: '6px',
  alignItems: 'center',
  padding: '0px 6px 0px 8px',
});

const hiddenChildrenStyles = css({
  display: 'none',
});

export interface BooleanEditorProps {
  children?: ReactNode;
  value?: string;
  parentType?: 'table' | 'input';
  onChangeValue: (
    value: string | undefined // only booleans for now
  ) => void;
}

export const BooleanEditor: FC<BooleanEditorProps> = ({
  children,
  value = 'false',
  onChangeValue,
  parentType = 'input',
}) => {
  return (
    <div contentEditable={false} css={wrapperStyles}>
      <Toggle
        active={value !== 'false' && value.trim() !== ''}
        onChange={(newValue) => onChangeValue(newValue ? 'true' : 'false')}
        parentType={parentType}
      />
      <span css={parentType === 'input' ? p24Bold : p12Medium}>
        {parentType !== 'input' ? '' : value === 'true' ? 'On' : 'Off'}
      </span>
      <div css={hiddenChildrenStyles}>{children}</div>
    </div>
  );
};
