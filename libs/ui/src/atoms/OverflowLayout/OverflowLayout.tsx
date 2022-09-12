import { FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import { editorLayout } from '../../styles';
import { tableControlWidth } from '../../styles/table';
import { smallestDesktop } from '../../primitives';

const gutterWidth = '60px';
const smallScreenQuery = `@media (max-width: ${smallestDesktop.portrait.width}px)`;

const overflowLayoutWrapperStyles = css({
  transform: `translateX(calc((((100vw - 700px) / 2) + ${tableControlWidth}) * -1 ))`,
  width: '100vw',
  minWidth: editorLayout.slimBlockWidth,
  overflowX: 'auto',
  paddingBottom: '12px',
  position: 'relative',
  whiteSpace: 'nowrap',
  left: tableControlWidth,
  display: 'flex',
  [smallScreenQuery]: {
    maxWidth: `calc(100vw - ${gutterWidth})`,
    transform: `translateX(-${tableControlWidth})`,
    minWidth: '0',
  },
});

const overflowStyles = css({
  display: 'inline-block',
  height: '20px',
  minWidth: `calc(((100vw - 700px) / 2) - ${tableControlWidth})`,
});

interface OverflowLayoutProps {
  children: ReactNode;
}

export const OverflowLayout: FC<OverflowLayoutProps> = ({ children }) => {
  return (
    <div css={overflowLayoutWrapperStyles}>
      <div css={overflowStyles} contentEditable={false} />
      {children}
    </div>
  );
};
