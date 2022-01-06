import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { code, cssVar, setCssVar } from '../../primitives';

const styles = css(code, {
  ...setCssVar('normalTextColor', cssVar('strongTextColor')),

  lineHeight: '32px',
  whiteSpace: 'pre-wrap',
});

interface CodeLineProps {
  readonly children: ReactNode;
}

export const CodeLine = ({ children }: CodeLineProps): ReturnType<React.FC> => {
  return <div css={styles}>{children}</div>;
};
