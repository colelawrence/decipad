/* eslint decipad/css-prop-named-variable: 0 */
import { ClientEventsContext } from '@decipad/client-events';
import { SmartRefDragCallback } from '@decipad/editor-utils';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { ReactNode, useContext } from 'react';
import { hideOnPrint } from '../../../styles/editor-layout';
import { NumberCatalogHeading } from './NumberCatalogHeading';
import { NumberCatalogItem } from './NumberCatalogItem';
import { cssVar, p13Medium, p14Medium } from '../../../primitives';
import { isFlagEnabled } from '@decipad/feature-flags';
import { Add } from 'libs/ui/src/icons';

export type NumberCatalogItemType = {
  name: string;
  blockId: string;
  type: 'h2' | 'h3' | 'var';
  currentTab: boolean;
  dataTab: boolean;

  isSelected?: boolean;
};

interface NumberCatalogProps {
  onDragStart?: SmartRefDragCallback;
  onDragEnd?: (e: React.DragEvent) => void;
  items: Record<string, NumberCatalogItemType[]>;
  alignment?: 'right' | 'left';
  /* This is needed because we're using the same component twice
   * and in a specific case, the background is grey and to make the button
   * sticky, we need to setup a background colour
   */
  overrideNewVarButtonBgColour?: boolean;

  toggleAddNewVariable: () => void;
  editVariable: (id: string) => void;
}

export const NumberCatalog = ({
  onDragStart,
  onDragEnd,
  items = {},
  toggleAddNewVariable,
  editVariable,
  overrideNewVarButtonBgColour,
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
            isSelected={item.isSelected}
          />
        );
      default:
        return null;
    }
  }

  const event = useContext(ClientEventsContext);

  if (!Object.keys(items).length) {
    return isFlagEnabled('DATA_DRAWER') ? (
      <NewVariableButton
        onClick={() => {
          toggleAddNewVariable();
          event({
            segmentEvent: {
              type: 'action',
              action: 'Data Drawer Opened',
              props: {
                analytics_source: 'frontend',
                drawer_trigger: 'sidebar',
              },
            },
          });
        }}
      >
        <NewVariableIcon>
          <Add />
        </NewVariableIcon>{' '}
        New Variable
      </NewVariableButton>
    ) : null;
  }

  return (
    <div css={wrapperStyles}>
      <div css={numberCatalogMenuStyles}>
        {isFlagEnabled('DATA_DRAWER') && (
          <NewVariableButton
            onClick={() => {
              toggleAddNewVariable();
              event({
                segmentEvent: {
                  type: 'action',
                  action: 'Data Drawer Opened',
                  props: {
                    analytics_source: 'frontend',
                    drawer_trigger: 'sidebar',
                  },
                },
              });
            }}
            isBackgroundGrey={overrideNewVarButtonBgColour}
          >
            <NewVariableIcon>
              <Add />
            </NewVariableIcon>{' '}
            New Variable
          </NewVariableButton>
        )}
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

const NewVariableIcon = styled.div({
  marginRight: '8px',
  width: '16px',
  height: '16px',
});

const NewVariableButton = styled.button<{ isBackgroundGrey?: boolean }>(
  p13Medium,
  (props) => ({
    padding: '8px 6px',
    color: cssVar('textDisabled'),
    backgroundColor: props.isBackgroundGrey
      ? cssVar('backgroundAccent')
      : cssVar('backgroundMain'),
    bottom: '24px',
    textAlign: 'left',
    display: 'flex',
    width: '100%',
    position: 'sticky',
    top: 0,
    zIndex: '10',
  })
);
