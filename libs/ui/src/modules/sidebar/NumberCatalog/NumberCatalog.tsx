/* eslint decipad/css-prop-named-variable: 0 */
import { SmartRefDragCallback } from '@decipad/editor-utils';
import { css } from '@emotion/react';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { hideOnPrint } from '../../../styles/editor-layout';
import { NumberCatalogHeading } from './NumberCatalogHeading';
import { NumberCatalogItem } from './NumberCatalogItem';
import { cssVar, p14Medium } from '../../../primitives';
import { ImportElementSource } from '@decipad/editor-types';
import {
  blockSelectionStore,
  useBlockSelectionSelectors,
} from '@udecode/plate-selection';
import * as Styled from './styles';
import { CaretDown, CaretRight } from '../../../icons';
import { useNotebookWithIdState } from '@decipad/notebook-state';
import { useNotebookMetaData } from '@decipad/react-contexts';

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
  onDragStart: SmartRefDragCallback;
  onDragEnd: (e: React.DragEvent) => void;
  items: Record<string, NumberCatalogItemType[]>;

  editVariable: (id: string) => void;
}

export const NumberCatalog = ({
  onDragStart,
  onDragEnd,
  items = {},
  editVariable,
}: NumberCatalogProps) => {
  const selectedIdsStore =
    useBlockSelectionSelectors().selectedIds() as Set<string>;
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(selectedIdsStore)
  );
  const setSidebar = useNotebookMetaData((s) => s.setSidebar);

  useEffect(() => {
    setSelectedIds(new Set(selectedIdsStore));
  }, [selectedIdsStore]);

  const [closeDataDrawer, dataDrawerMode] = useNotebookWithIdState(
    (s) => [s.closeDataDrawer, s.dataDrawerMode] as const
  );
  const handleOnClick = useCallback(
    (event: React.MouseEvent, blockId: string) => {
      const newSelectedIds = new Set(selectedIds);
      if (newSelectedIds.has(blockId)) {
        newSelectedIds.delete(blockId);
      } else {
        // If shift is not pressed, enforce single selection, otherwise add to selection
        if (!event.shiftKey) {
          newSelectedIds.clear();
        }
        newSelectedIds.add(blockId);
      }
      // if we are now selecting nothing, or >1, we don't want data drawer
      if (newSelectedIds.size !== 1) {
        closeDataDrawer();
      } else {
        const id = newSelectedIds.values().next().value;
        if (items.Widgets?.some((i) => i.blockId === id)) {
          // when we select a widget, we want to close the data drawer as well
          closeDataDrawer();
          setSidebar({
            type: 'default-sidebar',
            selectedTab: 'format',
          });
        } else {
          // otherwise we want to have the data drawer editing the only selected value
          editVariable(newSelectedIds.values().next().value);
        }
      }

      blockSelectionStore.set.selectedIds(newSelectedIds);
      setSelectedIds(newSelectedIds);
    },
    [selectedIds, closeDataDrawer, editVariable, items.Widgets, setSidebar]
  );

  // Sync selection state with external changes to data-drawer
  useEffect(() => {
    if (dataDrawerMode.type !== 'edit') return;
    // If our selected state is not what's currently being edited,
    // we derive our selection state from the data-drawer
    //
    // This does not cause issues - since when we change selection above,
    // selection state and data-drawer state are kept in sync
    if (
      selectedIds.size > 1 ||
      selectedIds.values().next().value !== dataDrawerMode.variableId
    ) {
      setSelectedIds(new Set([dataDrawerMode.variableId]));
    }
  }, [dataDrawerMode, selectedIds]);

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
            onClick={(event: React.MouseEvent) =>
              handleOnClick(event, item.blockId)
            }
            isDataTab={item.dataTab}
            isSelected={item.isSelected || selectedIds.has(item.blockId)}
            integrationProvider={item.integrationProvider}
          />
        );
    }
  }

  return (
    <div css={wrapperStyles}>
      <div css={numberCatalogMenuStyles}>
        <div css={menuBodyStyles}>
          {Object.keys(items).map((tab) => (
            <div key={tab} css={groupStyles}>
              {Object.keys(items).length > 1 && (
                <span
                  css={groupHeadingStyles}
                  onClick={() => setIsHeadingExpanded(tab)}
                >
                  <Styled.IconOuterWrapper>
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
  padding: '4px 0',
});

export const groupHeadingStyles = css(p14Medium, {
  color: cssVar('textSubdued'),
  padding: '4px 0',
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  cursor: 'pointer',
});
