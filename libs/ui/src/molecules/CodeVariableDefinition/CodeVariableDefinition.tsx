import { SerializedType } from '@decipad/computer';
import { css } from '@emotion/react';
import { ReactNode, useMemo } from 'react';
import { CellValueType } from '@decipad/editor-types';
import { getTypeIcon } from '../../utils';
import { codeBlock } from '../../styles';
import { cssVar } from '../../primitives';

const varStyles = css(codeBlock.structuredVariableStyles, {
  padding: '4px 8px',
  borderRadius: '6px',
  background: cssVar('structuredCalculationVariableColor'),
  display: 'flex',
  alignItems: 'center',
});

const iconStyles = css({
  display: 'inline-flex',
  verticalAlign: 'text-top',
  height: '16px',
  width: '16px',
  marginRight: '4px',
  pointerEvents: 'none',
  userSelect: 'none',
});

const emptyStyles = css({
  '::after': {
    display: 'inline',
    content: '" "',
  },
  // Slate creates a <br> for us. Pls no
  br: { display: 'none' },
});

interface NonInteractiveCodeVariableProps {
  readonly children: ReactNode;
  readonly empty: boolean;
  readonly type?: SerializedType | CellValueType;
}

export const CodeVariableDefinition = ({
  empty,
  children,
  type,
}: NonInteractiveCodeVariableProps) => {
  const Icon = useMemo(() => type && getTypeIcon(type), [type]);

  return (
    <span css={[varStyles, empty && emptyStyles]}>
      <span css={Icon && iconStyles} contentEditable={false}>
        {Icon && <Icon />}
      </span>
      <span>{children}</span>
    </span>
  );
};
