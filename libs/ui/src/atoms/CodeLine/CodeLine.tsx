import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { code, cssVar, setCssVar } from '../../primitives';
import { SlateElementProps } from '../../utils';

const styles = css(code, {
  ...setCssVar('normalTextColor', cssVar('strongTextColor')),

  lineHeight: '32px',
  whiteSpace: 'pre-wrap',
});

interface CodeLineProps extends SlateElementProps {
  readonly children: ReactNode;
}

export const CodeLine = ({
  children,
  slateAttrs,
}: CodeLineProps): ReturnType<React.FC> => {
  return (
    <div css={styles} {...slateAttrs}>
      {children}
    </div>
  );
};
