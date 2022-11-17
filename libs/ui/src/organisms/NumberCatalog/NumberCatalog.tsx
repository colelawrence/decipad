import { SmartRefDragCallback } from '@decipad/editor-utils';
import { css } from '@emotion/react';
import { useState } from 'react';
import { Chevron } from '../../icons';
import { cssVar, p12Bold, smallestDesktop } from '../../primitives';
import { hideOnPrint } from '../../styles/editor-layout';
import { NumberCatalogItem } from './NumberCatalogItem';

interface NumberCatalogProps {
  onDragStart: SmartRefDragCallback;
  names: { name: string; blockId: string }[];
  alignment?: 'right' | 'left';
  startCollapsed?: boolean;
}

export const NumberCatalog = ({
  onDragStart,
  names = [],
  alignment = 'left',
  startCollapsed = true,
}: NumberCatalogProps) => {
  const [collapsed, setCollapsed] = useState(startCollapsed);

  if (!names.length) {
    return null;
  }

  const handleCollapsedClick = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div
      css={[
        floatyStyles,
        hideOnPrint,
        alignment === 'left' ? css({ left: '32px' }) : css({ right: '-12px' }),
      ]}
    >
      <div css={menuStyles}>
        <div
          css={[
            gridHeaderNumberCatStyles,
            collapsed
              ? css({
                  borderBottomLeftRadius: borderRadius,
                  borderBottomRightRadius: borderRadius,
                })
              : null,
          ]}
          onClick={handleCollapsedClick}
        >
          <div css={menuHeaderStyles}>
            <span css={css({ color: cssVar('normalTextColor') })}>Numbers</span>
            <span
              css={css({
                padding: '4px 6px',
                background: cssVar('highlightColor'),
                borderRadius: '4px',
                marginLeft: '6px',
              })}
            >
              {names.length}
            </span>
          </div>
          <div css={menuHeaderChevronStyles}>
            <Chevron type={collapsed ? 'expand' : 'collapse'} />
          </div>
        </div>
        <div
          css={[menuBodyStyles, collapsed ? css({ display: 'none' }) : null]}
        >
          {names.map(({ name, blockId }) => (
            <NumberCatalogItem
              key={blockId}
              name={name}
              blockId={blockId}
              onDragStart={onDragStart}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const floatyStyles = css({
  position: 'fixed',
  width: '300px',
  top: '80px',
  display: 'block',
  alignItems: 'center',
  [`@media (max-width: ${smallestDesktop.landscape.width}px)`]: {
    display: 'none',
  },
  zIndex: 1000,
});

const borderRadius = '12px';

const gridHeaderNumberCatStyles = css({
  display: 'grid',
  gridTemplateColumns: 'auto 32px',
  gridColumnGap: '16px',
  borderTopLeftRadius: borderRadius,
  borderTopRightRadius: borderRadius,
  backgroundColor: cssVar('tintedBackgroundColor'),
  cursor: 'pointer',
});

const menuStyles = css({
  border: `1px solid ${cssVar('strongerHighlightColor')}`,
  borderRadius,
  width: '260px',
  userSelect: 'none',
});

const menuHeaderStyles = css({
  ...p12Bold,
  padding: '11px 15px 9px',
  textTransform: 'uppercase',
  borderRadius,
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  color: cssVar('weakerTextColor'),
});

const menuHeaderChevronStyles = css({
  padding: '14.5px 12px',
  color: cssVar('weakerTextColor'),
});

const menuBodyStyles = css({
  background: cssVar('backgroundColor'),
  borderRadius,
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  maxHeight: '50vh',
  minHeight: '40px',
  overflowY: 'auto',
  overflowX: 'hidden',
});
