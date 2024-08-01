/* eslint decipad/css-prop-named-variable: 0 */
import { SmartRefDragCallback } from '@decipad/editor-utils';
import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { hideOnPrint } from '../../../styles/editor-layout';
import { NumberCatalogHeading } from './NumberCatalogHeading';
import { NumberCatalogItem } from './NumberCatalogItem';
import { cssVar, p13Medium, p14Medium } from '../../../primitives';
import { isFlagEnabled } from '@decipad/feature-flags';

export type NumberCatalogItemType = {
  name: string;
  blockId: string;
  type: 'h2' | 'h3' | 'var';
  currentTab: boolean;
  dataTab: boolean;
};

interface NumberCatalogProps {
  onDragStart?: SmartRefDragCallback;
  onDragEnd?: (e: React.DragEvent) => void;
  items: Record<string, NumberCatalogItemType[]>;
  alignment?: 'right' | 'left';

  toggleAddNewVariable: () => void;
  editVariable: (id: string) => void;
}

export const NumberCatalog = ({
  onDragStart,
  onDragEnd,
  items = {},
  toggleAddNewVariable,
  editVariable,
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
            onClick={() => editVariable(item.blockId)}
            isDataTab={item.dataTab}
          />
        );
      default:
        return null;
    }
  }

  if (!Object.keys(items).length) {
    return isFlagEnabled('DATA_DRAWER') ? (
      <button onClick={toggleAddNewVariable}>+ New Variable</button>
    ) : null;
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

        {isFlagEnabled('DATA_DRAWER') && (
          <button css={newVariableButton} onClick={toggleAddNewVariable}>
            + New Variable
          </button>
        )}
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

const newVariableButton = css(p13Medium, {
  paddingLeft: '16px',
  color: cssVar('textDisabled'),
});
