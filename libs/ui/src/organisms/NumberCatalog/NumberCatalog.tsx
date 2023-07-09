/* eslint decipad/css-prop-named-variable: 0 */
import { SmartRefDragCallback } from '@decipad/editor-utils';
import { useThemeFromStore } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { ReactNode } from 'react';
import {
  black,
  normalOpacity,
  strongOpacity,
  transparency,
  white,
} from '../../primitives';
import { hideOnPrint } from '../../styles/editor-layout';
import { NumberCatalogHeading } from './NumberCatalogHeading';
import { NumberCatalogItem } from './NumberCatalogItem';

export type NumberCatalogItemType = {
  name: string;
  blockId: string;
  type: 'h2' | 'h3' | 'var';
};

interface NumberCatalogProps {
  onDragStart?: SmartRefDragCallback;
  onDragEnd?: (e: React.DragEvent) => void;
  items: NumberCatalogItemType[];
  alignment?: 'right' | 'left';
}

export const NumberCatalog = ({
  onDragStart,
  onDragEnd,
  items = [],
}: NumberCatalogProps) => {
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

  return (
    <div css={[hideOnPrint, { width: '100%' }]}>
      <div css={numberCatalogMenuStyles}>
        <div css={[menuBodyStyles(darkTheme)]}>
          {items.map((item) => getNumberCatalogItemComponent(item))}
        </div>
      </div>
    </div>
  );
};

const borderRadius = '16px';

const numberCatalogMenuStyles = css({
  borderRadius,
  userSelect: 'none',
});

const menuBodyStyles = (darkTheme: boolean) =>
  css({
    backgroundColor: transparency(
      darkTheme ? black : white,
      darkTheme ? normalOpacity : strongOpacity
    ).rgba,
    borderRadius: '10px',
    minHeight: '40px',
    overflowX: 'hidden',
  });
