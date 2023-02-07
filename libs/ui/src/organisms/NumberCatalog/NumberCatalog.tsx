import { SmartRefDragCallback } from '@decipad/editor-utils';
import {
  useEditorStylesContext,
  useThemeFromStore,
} from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { ReactNode, useState } from 'react';
import { Counter } from '../../atoms';
import { Chevron } from '../../icons';
import {
  black,
  normalOpacity,
  p14Bold,
  smallestDesktop,
  strongOpacity,
  transparency,
  white,
} from '../../primitives';
import { hideOnPrint } from '../../styles/editor-layout';
import { AvailableSwatchColor, Swatch, swatchesThemed } from '../../utils';
import { NumberCatalogHeading } from './NumberCatalogHeading';
import { NumberCatalogItem } from './NumberCatalogItem';

type NumberCatalogItemType = {
  name: string;
  blockId: string;
  type: 'h2' | 'h3' | 'var';
};

interface NumberCatalogProps {
  onDragStart: SmartRefDragCallback;
  onDragEnd: (e: React.DragEvent) => void;
  items: NumberCatalogItemType[];
  alignment?: 'right' | 'left';
  startCollapsed?: boolean;
}

export const NumberCatalog = ({
  onDragStart,
  onDragEnd,
  items = [],
  alignment = 'left',
  startCollapsed = true,
}: NumberCatalogProps) => {
  const [collapsed, setCollapsed] = useState(startCollapsed);
  const { color } = useEditorStylesContext();
  const [darkTheme] = useThemeFromStore();
  const baseSwatches = swatchesThemed(darkTheme);

  function getNumberCatalogItemComponent(
    item: NumberCatalogItemType
  ): ReactNode {
    switch (item.type) {
      case 'h2':
        return (
          <NumberCatalogHeading key={item.blockId} {...item} headingLevel={2} />
        );

      case 'h3':
        return (
          <NumberCatalogHeading key={item.blockId} {...item} headingLevel={3} />
        );
      case 'var':
        return (
          <NumberCatalogItem
            key={item.blockId}
            name={item.name}
            color={color}
            blockId={item.blockId}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        );
    }
  }

  if (!items.length) {
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
      <div
        css={numberCatalogMenuStyles(
          color as AvailableSwatchColor,
          baseSwatches
        )}
      >
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
            <span css={numberFontStyles(darkTheme)}>Numbers</span>

            <span
              css={css({
                marginLeft: '6px',
              })}
            >
              <Counter
                variant
                n={items.filter((item) => item.type === 'var').length}
              ></Counter>
            </span>
          </div>
          <div
            css={[
              menuHeaderChevronStyles,
              {
                'svg > path': {
                  stroke: baseSwatches[color as AvailableSwatchColor].rgb,
                  fill: baseSwatches[color as AvailableSwatchColor].rgb,
                },
              },
            ]}
          >
            <Chevron type={collapsed ? 'expand' : 'collapse'} />
          </div>
        </div>
        <div
          css={[
            menuBodyStyles(darkTheme),
            collapsed ? css({ display: 'none' }) : null,
          ]}
        >
          {items.map((item) => getNumberCatalogItemComponent(item))}
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
  zIndex: 2,
});

const borderRadius = '16px';

const gridHeaderNumberCatStyles = css({
  display: 'grid',
  gridTemplateColumns: 'auto 32px',
  gridColumnGap: '16px',
});

const numberCatalogMenuStyles = (
  color: AvailableSwatchColor,
  baseSwatches: Swatch
) =>
  css({
    borderRadius,
    backgroundColor: transparency(baseSwatches[color], 0.4).rgba,

    padding: '8px',
    width: '300px',
    userSelect: 'none',
  });

const menuHeaderStyles = css({
  ...p14Bold,
  padding: '11px 15px 9px',
  borderRadius,
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
});

const menuHeaderChevronStyles = css({
  padding: '14.5px 12px',
});

const numberFontStyles = (darkTheme: boolean) =>
  css({
    color: transparency(darkTheme ? white : black, normalOpacity).rgba,
  });

const menuBodyStyles = (darkTheme: boolean) =>
  css({
    backgroundColor: transparency(
      darkTheme ? black : white,
      darkTheme ? normalOpacity : strongOpacity
    ).rgba,
    borderRadius: '10px',
    maxHeight: '54vh',
    minHeight: '40px',
    overflowY: 'auto',
    overflowX: 'hidden',
  });
