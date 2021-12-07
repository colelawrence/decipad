import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { h1 } from '../../primitives';
import { SlateElementProps } from '../../utils';

const styles = css(h1, {
  padding: '12px 0',
});

interface Heading1Props extends SlateElementProps {
  readonly children: ReactNode;
  readonly Heading: 'h2';
}

export const Heading1 = ({
  children,
  Heading,
  slateAttrs,
}: Heading1Props): ReturnType<React.FC> => {
  return (
    <Heading css={styles} {...slateAttrs}>
      {children}
    </Heading>
  );
};
