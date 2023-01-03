import { SerializedType } from '@decipad/computer';
import { css } from '@emotion/react';
import { ReactNode, useMemo } from 'react';
import { getTypeIcon } from '../../utils';
import { cssVar } from '../../primitives';
import { codeBlock } from '../../styles';

const varStyles = css(codeBlock.variableStyles, {
  padding: '4px 6px',
  borderRadius: '6px',
  fontSize: '13px',
  backgroundColor: cssVar('bubbleBackground'),
  color: cssVar('bubbleColor'),
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
  readonly type?: SerializedType;
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
