/* eslint decipad/css-prop-named-variable: 0 */
import { SmartRefDragCallback } from '@decipad/editor-utils';
import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { hideOnPrint } from '../../styles/editor-layout';
import { NumberCatalogHeading } from './NumberCatalogHeading';
import { NumberCatalogItem } from './NumberCatalogItem';
import { cssVar, p14Medium } from '../../primitives';

export type NumberCatalogItemType = {
  name: string;
  blockId: string;
  type: 'h2' | 'h3' | 'var';
  currentTab: boolean;
};

interface NumberCatalogProps {
  onDragStart?: SmartRefDragCallback;
  onDragEnd?: (e: React.DragEvent) => void;
  items: Record<string, NumberCatalogItemType[]>;
  alignment?: 'right' | 'left';
}

export const NumberCatalog = ({
  onDragStart,
  onDragEnd,
  items = {},
}: NumberCatalogProps) => {
  function getNumberCatalogItemComponent(
    item: NumberCatalogItemType
  ): ReactNode {
    switch (item.type) {
      case 'h2':
      case 'h3':
        return <NumberCatalogHeading key={item.blockId} {...item} />;
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
      default:
        return null;
    }
  }

  if (!Object.keys(items).length) {
    return null;
  }

  return (
    <div css={wrapperStyles}>
      <div css={numberCatalogMenuStyles}>
        <div css={menuBodyStyles}>
          {Object.keys(items).map((tab) => (
            <div key={tab} css={groupStyles}>
              {Object.keys(items).length > 1 && (
                <span css={groupHeadingStyles}>{tab}:</span>
              )}
              {items[tab].map((item) => getNumberCatalogItemComponent(item))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const wrapperStyles = css(hideOnPrint, {
  width: '100%',
});

const borderRadius = '16px';

const numberCatalogMenuStyles = css({
  borderRadius,
  userSelect: 'none',
});

const menuBodyStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  minHeight: '40px',
  overflowX: 'hidden',
});

const groupStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  padding: '4px 0',

  '&:not(:last-child)': {
    borderBottom: `1px solid ${cssVar('borderSubdued')}`,
  },
});

const groupHeadingStyles = css(p14Medium, {
  color: cssVar('textSubdued'),
  padding: '4px 8px',
});
