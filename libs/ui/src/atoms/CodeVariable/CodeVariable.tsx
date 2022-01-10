import { css } from '@emotion/react';
import { ReactNode } from 'react';
import {
  code,
  codeBubbleBackground,
  codeBubbleBorder,
  cssVar,
  setCssVar,
} from '../../primitives';

const styles = css(code, {
  ...setCssVar('normalTextColor', cssVar('strongTextColor')),
  backgroundColor: codeBubbleBackground.rgb,
  border: `1px solid ${codeBubbleBorder.rgb}`,
  borderRadius: '8px',
  padding: '4px 8px',
});

interface CodeVariableProps {
  readonly children: ReactNode;
}

export const CodeVariable = ({
  children,
}: CodeVariableProps): ReturnType<React.FC> => {
  return <span css={styles}>{children}</span>;
};
