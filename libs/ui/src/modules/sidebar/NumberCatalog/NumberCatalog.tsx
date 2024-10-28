/* eslint decipad/css-prop-named-variable: 0 */
import { SmartRefDragCallback } from '@decipad/editor-utils';
import { css } from '@emotion/react';
import { ReactNode, useEffect, useState } from 'react';
import { hideOnPrint } from '../../../styles/editor-layout';
import { NumberCatalogHeading } from './NumberCatalogHeading';
import { NumberCatalogItem } from './NumberCatalogItem';
import { cssVar, p14Medium } from '../../../primitives';
import { ImportElementSource } from '@decipad/editor-types';
import * as Styled from './styles';
import { CaretDown, CaretRight } from '../../../icons';

export type NumberCatalogItemType = {
  name: string;
  blockId: string;
  type: 'h2' | 'h3' | 'var';
  currentTab: boolean;
  dataTab: boolean;
  integrationProvider?: ImportElementSource;
  isSelected?: boolean;
};

interface NumberCatalogProps {
  onDragStart?: SmartRefDragCallback;
  onDragEnd?: (e: React.DragEvent) => void;
  items: Record<string, NumberCatalogItemType[]>;
  alignment?: 'right' | 'left';

  editVariable: (id: string) => void;
}

export const NumberCatalog = ({
  onDragStart,
  onDragEnd,
  items = {},
  editVariable,
}: NumberCatalogProps) => {
  const [expandedHeadings, setExpandedHeadings] = useState<
    Record<string, boolean>
  >({});

  const setIsHeadingExpanded = (tab: string) => {
    setExpandedHeadings((prev) => ({ ...prev, [tab]: !prev[tab] }));
  };

  useEffect(() => {
    const allTabs = Object.keys(items);
    const expandedTabs = allTabs.reduce((acc, tab) => {
      acc[tab] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setExpandedHeadings(expandedTabs);
  }, [items]);

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
            isSelected={item.isSelected}
            integrationProvider={item.integrationProvider}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div css={wrapperStyles}>
      <div css={numberCatalogMenuStyles}>
        <div css={menuBodyStyles}>
          {Object.keys(items).map((tab) => (
            <div key={tab} css={groupStyles}>
              {Object.keys(items).length > 1 && (
                <span css={groupHeadingStyles}>
                  <Styled.IconOuterWrapper
                    onClick={() => setIsHeadingExpanded(tab)}
                  >
                    <Styled.IconWrapper>
                      {expandedHeadings[tab] ? <CaretDown /> : <CaretRight />}
                    </Styled.IconWrapper>
                  </Styled.IconOuterWrapper>
                  {tab}
                </span>
              )}
              {expandedHeadings[tab] &&
                items[tab].map((item) => getNumberCatalogItemComponent(item))}
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
  padding: '4px 0',
  display: 'flex',
  alignItems: 'center',
  gap: 4,
});
