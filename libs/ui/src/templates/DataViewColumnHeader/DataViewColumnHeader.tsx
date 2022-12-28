import { FC, forwardRef, ReactNode, useCallback, useState } from 'react';
import type { SerializedType } from '@decipad/computer';
import { PlateComponentAttributes } from '@decipad/editor-types';
import {
  ConnectDragPreview,
  ConnectDragSource,
  ConnectDropTarget,
} from 'react-dnd';
import { css } from '@emotion/react';
import { capitalize } from 'lodash';
import { MenuItem, TriggerMenuItem } from '../../atoms';
import { MenuList } from '../../molecules';
import { Caret, Code, Trash } from '../../icons';
import { useEventNoEffect } from '../../utils/useEventNoEffect';
import { useMergedRef } from '../../hooks';
import { cssVar } from '../../primitives';

export interface DataViewColumnHeaderProps {
  name: string;
  type: SerializedType;
  attributes?: PlateComponentAttributes;
  children?: ReactNode;
  selectedAggregation?: string;
  availableAggregations: Array<string>;
  onAggregationChange: (aggregation: string | undefined) => void;
  onDeleteColumn: (columnName: string) => void;
  connectDragSource?: ConnectDragSource;
  connectDragPreview?: ConnectDragPreview;
  connectDropTarget?: ConnectDropTarget;
  hoverDirection?: 'left' | 'right';
  isOverCurrent?: boolean;
  alignRight?: boolean;
  global?: boolean;
}

export type Ref = HTMLTableCellElement;

const dataViewColumnHeaderStyles = css({
  '&::before, &::after': {
    display: 'block',
    content: ' attr(aria-placeholder)',
    width: '1px',
    background: 'transparent',
    height: 'calc(100% - 12px)',
    position: 'absolute',
    top: 0,
  },
  borderBottom: '1px solid',
  borderBottomColor: cssVar('evenStrongerHighlightColor'),
});

const triggerStyles = css({
  display: 'grid',
  alignItems: 'center',
  width: '16px',
});
const borderLeftStyles = css({
  '&::before': {
    background: 'blue',
    translate: '-8px',
  },
});

const dataViewColumnHeaderSelectWrapperStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const dataViewColumnHeaderNameStyles = css({
  cursor: 'grab',
  fontWeight: 'bold',
});

const alignRightStyles = css({
  justifyContent: 'flex-end',
});

const globalStyles = {
  color: cssVar('weakTextColor'),
  backgroundColor: cssVar('highlightColor'),
};

export const DataViewColumnHeader = forwardRef<
  HTMLTableCellElement,
  DataViewColumnHeaderProps
>(function DataViewColumnHeaderWithoutRef(
  {
    name,
    attributes,
    children,
    availableAggregations,
    selectedAggregation,
    onAggregationChange,
    onDeleteColumn,
    connectDragSource,
    connectDropTarget,
    hoverDirection,
    isOverCurrent,
    alignRight = false,
    global = false,
  }: DataViewColumnHeaderProps,
  ref
): ReturnType<FC> {
  const [menuListOpened, setMenuListOpened] = useState(false);

  const onTriggerClick = useEventNoEffect(
    useCallback(() => {
      setMenuListOpened(!menuListOpened);
    }, [menuListOpened])
  );
  const refs = useMergedRef(ref, connectDragSource, connectDropTarget);

  const getBorderRightTranslation = () => {
    if (typeof ref !== 'function' && ref && ref.current) {
      return ref.current.offsetWidth - 8;
    }
    return 0;
  };

  const borderRightStyles = css({
    '&::after': {
      background: 'blue',
      translate: getBorderRightTranslation(),
    },
  });

  return (
    <th
      {...attributes}
      css={[
        dataViewColumnHeaderStyles,
        isOverCurrent && hoverDirection === 'left' && borderLeftStyles,
        isOverCurrent && hoverDirection === 'right' && borderRightStyles,
        global && globalStyles,
      ]}
      contentEditable={false}
      ref={refs}
    >
      <div
        // eslint-disable-next-line no-sparse-arrays
        css={[
          dataViewColumnHeaderSelectWrapperStyles,
          alignRight ? alignRightStyles : null,
        ]}
        contentEditable={false}
      >
        <span css={dataViewColumnHeaderNameStyles}>{name}</span>

        <MenuList
          root
          dropdown
          open={menuListOpened}
          onChangeOpen={setMenuListOpened}
          trigger={
            <button css={triggerStyles} onClick={onTriggerClick}>
              <Caret color="normal" variant="down" />
            </button>
          }
        >
          <MenuItem onSelect={() => onDeleteColumn(name)} icon={<Trash />}>
            Remove column
          </MenuItem>
          {availableAggregations.length > 1 ? (
            <MenuList
              itemTrigger={
                <TriggerMenuItem icon={<Code />}>Aggregate</TriggerMenuItem>
              }
            >
              <MenuItem
                onSelect={() => onAggregationChange(undefined)}
                selected={selectedAggregation === undefined}
              >
                None
              </MenuItem>
              {availableAggregations
                .filter(Boolean)
                .map((availableAggregation, index) => {
                  return (
                    <MenuItem
                      onSelect={() => onAggregationChange(availableAggregation)}
                      selected={availableAggregation === selectedAggregation}
                      key={index}
                    >
                      {capitalize(availableAggregation)}
                    </MenuItem>
                  );
                })}
            </MenuList>
          ) : null}
        </MenuList>

        <div contentEditable={false}>{children}</div>
      </div>
    </th>
  );
});
