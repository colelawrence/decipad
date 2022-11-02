import { FC, ReactNode, useCallback, useState } from 'react';
import type { SerializedType } from '@decipad/computer';
import { PlateComponentAttributes } from '@decipad/editor-types';
import {
  ConnectDragPreview,
  ConnectDragSource,
  ConnectDropTarget,
} from 'react-dnd';
import { css } from '@emotion/react';
import { capitalize } from 'lodash';
import { DropLine, MenuItem, TriggerMenuItem } from '../../atoms';
import { MenuList } from '../../molecules';
import { Caret, Code, Trash } from '../../icons';

export interface DataViewColumnHeaderProps<TAggregation extends string> {
  name: string;
  type: SerializedType;
  attributes?: PlateComponentAttributes;
  children?: ReactNode;
  selectedAggregation?: TAggregation;
  availableAggregations: Array<TAggregation>;
  onAggregationChange: (aggregation: TAggregation | undefined) => void;
  onDeleteColumn: (columnName: string) => void;
  connectDragSource?: ConnectDragSource;
  connectDragPreview?: ConnectDragPreview;
  connectDropTarget?: ConnectDropTarget;
  overDirection?: 'left' | 'right';
  alignRight?: boolean;
}

const dataViewColumnHeaderStyles = css({
  whiteSpace: 'nowrap',
  position: 'relative',
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

export function DataViewColumnHeader<TAggregation extends string>({
  name,
  attributes,
  children,
  availableAggregations,
  selectedAggregation,
  onAggregationChange,
  onDeleteColumn,
  connectDragSource,
  connectDropTarget,
  overDirection,
  alignRight = false,
}: DataViewColumnHeaderProps<TAggregation>): ReturnType<FC> {
  const [menuListOpened, setMenuListOpened] = useState(false);

  const onTriggerClick = useCallback(() => {
    setMenuListOpened(!menuListOpened);
  }, [menuListOpened]);

  const triggerStyles = css({
    display: 'grid',
    alignItems: 'center',
    width: '16px',
  });

  return (
    <th {...attributes} css={dataViewColumnHeaderStyles}>
      <div ref={connectDropTarget} contentEditable={false}>
        {overDirection === 'left' && (
          <div contentEditable={false}>
            <DropLine variant="inline" />
          </div>
        )}
        <div
          ref={connectDragSource}
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
                  .filter((n) => n)
                  .map((availableAggregation, index) => {
                    return (
                      <MenuItem
                        onSelect={() =>
                          onAggregationChange(availableAggregation)
                        }
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

          <div>{children}</div>
        </div>
        {overDirection === 'right' && (
          <div contentEditable={false}>
            <DropLine variant="inline" />
          </div>
        )}
      </div>
    </th>
  );
}
