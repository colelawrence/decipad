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
  p14Bold,
  smallestDesktop,
  strongOpacity,
  transparency,
  white,
} from '../../primitives';
import { hideOnPrint } from '../../styles/editor-layout';
import { AvailableSwatchColor, baseSwatches, colorSwatches } from '../../utils';
import { NumberCatalogHeading } from './NumberCatalogHeading';
import { NumberCatalogItem } from './NumberCatalogItem';

type NumberCatalogItemType = {
  name: string;
  blockId: string;
  type: 'h2' | 'h3' | 'var';
};

interface NumberCatalogProps {
  onDragStart: SmartRefDragCallback;
  items: NumberCatalogItemType[];
  alignment?: 'right' | 'left';
  startCollapsed?: boolean;
}

export const NumberCatalog = ({
  onDragStart,
  items = [],
  alignment = 'left',
  startCollapsed = true,
}: NumberCatalogProps) => {
  const [collapsed, setCollapsed] = useState(startCollapsed);
  const { color } = useEditorStylesContext();
  const [darkTheme] = useThemeFromStore();

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
        css={numberCatalogMenuStyles(color as AvailableSwatchColor, darkTheme)}
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
            <span css={numberFontStyles(color as AvailableSwatchColor)}>
              Numbers
            </span>

            <span
              css={css({
                marginLeft: '6px',
              })}
            >
              <Counter
                variant
                n={items.filter((item) => item.type === 'var').length}
                color={baseSwatches[color as AvailableSwatchColor]}
              ></Counter>
            </span>
          </div>
          <div
            css={[
              menuHeaderChevronStyles,
              {
                'svg > path': {
                  stroke:
                    colorSwatches[color as AvailableSwatchColor].highlight.rgb,
                  fill: colorSwatches[color as AvailableSwatchColor].highlight
                    .rgb,
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
  darkTheme: boolean
) =>
  css({
    borderRadius,
    backgroundColor: (darkTheme
      ? colorSwatches[color].dark
      : colorSwatches[color].light
    ).rgb,
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

const numberFontStyles = (color: AvailableSwatchColor) =>
  css({
    color: colorSwatches[color].highlight.rgb,
  });

const menuBodyStyles = (darkTheme: boolean) =>
  css({
    backgroundColor: transparency(darkTheme ? black : white, strongOpacity)
      .rgba,
    borderRadius: '10px',
    maxHeight: '54vh',
    minHeight: '40px',
    overflowY: 'auto',
    overflowX: 'hidden',
  });
