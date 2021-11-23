import { css } from '@emotion/react';
import { ReactNode } from 'react';
import {
  code,
  codeBubbleBackground,
  codeBubbleBorder,
  cssVar,
  setCssVar,
} from '../../primitives';
import { SlateLeafProps } from '../../utils';

const styles = css(code, {
  ...setCssVar('normalTextColor', cssVar('strongTextColor')),
  backgroundColor: codeBubbleBackground.rgb,
  border: `1px solid ${codeBubbleBorder.rgb}`,
  borderRadius: '8px',
  padding: '4px 8px',
});

interface CodeVariableProps extends SlateLeafProps {
  readonly children: ReactNode;
}

export const CodeVariable = ({
  children,
  slateAttrs,
}: CodeVariableProps): ReturnType<React.FC> => {
  return (
    <span css={styles} {...slateAttrs}>
      {children}
    </span>
  );
};
