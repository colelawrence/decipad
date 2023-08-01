/* eslint decipad/css-prop-named-variable: 0 */
import { PropsWithChildren } from 'react';
import { css } from '@emotion/react';

import { cssVar, mobileQuery } from '../../primitives';
import { gridTile } from '../../images';

export const LoginBox: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div css={outerWrapperStyles}>
      <div css={shadowStyles} />
      <div css={[wrapperStyles, outerBorderStyles]}>{children}</div>
    </div>
  );
};

const outerWrapperStyles = css({
  display: 'grid',
  justifyItems: 'center',
  alignContent: 'center',

  padding: '10px',

  background: `
    radial-gradient(rgba(0,0,0,0), ${cssVar('backgroundMain')} 70%),
    center repeat url(${gridTile})
  `,
});

const outerBorderStyles = css({
  border: `1px solid ${cssVar('borderSubdued')}`,
  borderRadius: '32px',
});

const wrapperStyles = css({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '440px',

  gridGap: '16px',
  padding: '56px 64px',

  backgroundColor: cssVar('backgroundMain'),
  zIndex: 1,

  [mobileQuery]: {
    padding: '32px 24px',
    maxWidth: '320px',
  },
});

const shadowStyles = css({
  position: 'absolute',
  top: '0',
  left: '0',
  bottom: '0',
  right: '0',

  margin: 'auto',

  height: '182px',
  width: '320px',

  background: cssVar('textDisabled'),
  filter: 'blur(80px)',
  transform: 'translateY(52px)',
});
