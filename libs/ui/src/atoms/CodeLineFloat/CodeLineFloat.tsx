import { css } from '@emotion/react';
import { PropsWithChildren, useEffect, useState } from 'react';
import { cssVar, mediumShadow } from '../../primitives';

export const CodeLineFloat: React.FC<
  PropsWithChildren<{ offsetTop: number }>
> = ({ children, offsetTop }) => {
  const [cssAnim, setCssAnim] = useState(appearStyle);

  useEffect(() => setCssAnim(css({})), []);

  return (
    <div
      css={[wrapperStyle(offsetTop), cssAnim]}
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
};

const wrapperStyle = (offsetTop: number) =>
  css({
    position: 'absolute',
    left: 0,
    top: `${offsetTop}px`,
    width: '100%',
    zIndex: 10,
    marginTop: '2px',

    cursor: 'initial',

    transition: 'opacity 60ms ease-in, transform 60ms ease-in',

    borderRadius: '12px',
    backgroundColor: cssVar('backgroundColor'),

    boxShadow: `0px 3px 24px -4px ${mediumShadow.rgba}`,
  });

const appearStyle = css({
  opacity: 0,
  transform: 'translateY(32px)',
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
