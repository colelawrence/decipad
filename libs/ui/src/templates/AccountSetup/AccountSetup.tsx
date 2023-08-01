import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { cssVar, smallScreenQuery } from '../../primitives';

const styles = css({
  display: 'grid',
  gridTemplateColumns: '430px 1fr',

  border: `1px solid ${cssVar('borderSubdued')}`,
  borderRadius: '32px',

  height: '552px',
  width: '100%',
  maxWidth: '1020px',

  overflow: 'hidden',

  background: cssVar('backgroundDefault'),

  [smallScreenQuery]: {
    gridTemplateColumns: '1fr',
  },
});

const leftSideStyles = css({
  padding: '82px 64px',

  background: `linear-gradient(to top, ${cssVar(
    'backgroundDefault'
  )}, transparent)`,
});
const rightSideStyles = css({
  background: `center right 5% / 90% 50% no-repeat radial-gradient(farthest-side, ${cssVar(
    'backgroundHeavy'
  )}, ${cssVar('backgroundDefault')})`,

  [smallScreenQuery]: {
    display: 'none',
  },
});

interface AccountSetupProps {
  left: ReactNode;
  right: ReactNode;
}

export const AccountSetup = ({ left, right }: AccountSetupProps) => {
  return (
    <div css={styles}>
      <div css={leftSideStyles}>{left}</div>
      <div css={rightSideStyles}>{right}</div>
    </div>
  );
};
