/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { cssVar, mediumShadow } from '../../primitives';

export const CodeLineFloat: React.FC<
  PropsWithChildren<{ offsetTop: number }>
> = ({ children, offsetTop }) => {
  const [cssAnim, setCssAnim] = useState(appearStyle);

  useEffect(() => setCssAnim(css({})), []);

  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [translateX, setTranslateX] = useState(0);

  useEffect(() => {
    const updatePosition = () => {
      if (popoverRef.current == null) return;
      const popoverRect = popoverRef.current.getBoundingClientRect();
      const popoverMiddle = popoverRect.left + popoverRect.width / 2;
      const screenWidth = window.innerWidth;
      const middleScreen = screenWidth / 2;

      const newTranslateX = middleScreen - popoverMiddle;
      setTranslateX(newTranslateX);
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
    };
  }, []);

  return (
    <div
      css={[wrapperStyle(offsetTop, translateX), cssAnim]}
      onClick={(ev) => {
        ev.stopPropagation();
      }}
      ref={popoverRef}
    >
      <div data-testid="code-line-float" css={codeLineStyle}>
        {children}
      </div>
    </div>
  );
};

const wrapperStyle = (offsetTop: number, translateX: number) =>
  css([
    {
      transform: `translateX(${translateX}px)`,
    },
    {
      position: 'absolute',
      top: offsetTop,
      zIndex: 10,
      marginTop: '2px',
      padding: '8px 8px 0px 8px',

      cursor: 'initial',

      transition: 'opacity 60ms ease-in, transform 60ms ease-in',

      borderRadius: '12px',
      border: `1px solid ${cssVar('borderHighlightColor')}`,
      backgroundColor: cssVar('highlightColor'),

      boxShadow: `0px 3px 24px -4px ${mediumShadow.rgba}`,
    },
  ]);

const appearStyle = css({
  opacity: 0,
  transform: 'translateY(32px)',
});

const codeLineStyle = css({
  pointerEvents: 'all',
});
