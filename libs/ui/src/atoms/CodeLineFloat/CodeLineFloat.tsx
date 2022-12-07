import { css } from '@emotion/react';
import { PropsWithChildren } from 'react';
import { cssVar, mediumShadow } from '../../primitives';

export const CodeLineFloat: React.FC<
  PropsWithChildren<{ offsetTop: number }>
> = ({ children, offsetTop }) => (
  <div
    css={wrapperStyle(offsetTop)}
    onClick={(ev) => {
      ev.stopPropagation();
    }}
  >
    <div css={codeLineStyle}>{children}</div>

    <div css={instructionsStyle}>
      <div css={{ width: '1.5rem' }}></div>
      <div>Close with ESC or ENTER</div>
    </div>
  </div>
);

const wrapperStyle = (offsetTop: number) =>
  css({
    position: 'absolute',
    left: 0,
    top: `${offsetTop}px`,
    width: '100%',
    zIndex: 10,
    marginTop: '2px',

    cursor: 'initial',

    borderRadius: '12px',
    backgroundColor: cssVar('backgroundColor'),

    boxShadow: `0px 3px 24px -4px ${mediumShadow.rgba}`,
  });

const codeLineStyle = css({
  pointerEvents: 'all',
});

const instructionsStyle = css({
  height: '36px',
  fontSize: '12px',
  fontWeight: 500,

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  padding: '0 12px',
});
