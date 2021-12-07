import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { h2 } from '../../primitives';
import { SlateElementProps } from '../../utils';

const styles = css(h2, {
  padding: '12px 0',
});

interface Heading2Props extends SlateElementProps {
  readonly children: ReactNode;
  readonly Heading: 'h3';
}

export const Heading2 = ({
  children,
  Heading,
  slateAttrs,
}: Heading2Props): ReturnType<React.FC> => {
  return (
    <Heading css={styles} {...slateAttrs}>
      {children}
    </Heading>
  );
};
