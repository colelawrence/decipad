import { SerializedType } from '@decipad/computer';
import { css } from '@emotion/react';
import { ReactNode, useMemo } from 'react';
import { CellValueType } from '@decipad/editor-types';
import { getTypeIcon } from '../../utils';
import { codeBlock } from '../../styles';
import { cssVar } from '../../primitives';
import { Formula, Number } from '../../icons';

const varStyles = (type: 'simple' | 'formula') =>
  css(codeBlock.structuredVariableStyles, {
    padding: '4px 8px',
    borderRadius: '6px',
    background:
      type === 'formula'
        ? cssVar('structuredCalculationVariableColor')
        : cssVar('structuredCalculationSimpleColor'),
    display: 'flex',
    alignItems: 'center',
    width: 'fit-content',
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

const formulaIconStyles = css({
  position: 'absolute',
  left: '-18px',
  width: '16px',
  height: '100%',
  display: 'grid',
  alignItems: 'center',
});

interface NonInteractiveCodeVariableProps {
  readonly children: ReactNode;
  readonly empty: boolean;
  readonly type?: SerializedType | CellValueType;
  readonly isValue?: boolean;
}

export const CodeVariableDefinition = ({
  isValue = true,
  empty,
  children,
  type,
}: NonInteractiveCodeVariableProps) => {
  const Icon = useMemo(() => (type ? getTypeIcon(type) : Number), [type]);

  return (
    <span
      css={[varStyles(isValue ? 'simple' : 'formula'), empty && emptyStyles]}
    >
      {!isValue && (
        <span css={formulaIconStyles}>
          <Formula />
        </span>
      )}
      <span css={Icon && iconStyles} contentEditable={false}>
        {Icon && <Icon />}
      </span>
      <span>{children}</span>
    </span>
  );
};
