import { Result } from '@decipad/computer';
import { AnyElement, useTEditorRef } from '@decipad/editor-types';
import {
  CodeResult,
  DataViewTableHeader as DataViewTableHeaderUI,
  useEventNoEffect,
} from '@decipad/ui';
import { css } from '@emotion/react';
import { deselect } from '@udecode/plate';
import { Folder, FolderOpen } from 'libs/ui/src/icons';
import { FC, useCallback } from 'react';
import { HeaderProps } from '../../types';
import { GroupAggregation } from '../GroupAggregation/GroupAggregation';

const iconStyles = css({
  height: '24px',
  width: '24px',
});

interface DataViewTableHeaderProps extends HeaderProps {
  element?: AnyElement;
}

export const DataViewTableHeader: FC<DataViewTableHeaderProps> = ({
  tableName,
  column,
  previousColumns,
  roundings,
  type,
  value,
  rowSpan = 1,
  colSpan = 1,
  onHover,
  hover = false,
  alignRight,
  expandedGroups = [],
  onChangeExpandedGroups,
  groupId,
  collapsible,
  global,
  element,
  rotate,
  isFirstLevelHeader,
  aggregationType,
  replicaCount,
}) => {
  const editor = useTEditorRef();
  const handleCollapseGroupButtonPress = useEventNoEffect(
    useCallback((): void => {
      const { selection } = editor;
      if (selection) {
        deselect(editor);
      }
      const matchingGroupIndex = expandedGroups.indexOf(groupId);

      if (matchingGroupIndex !== -1) {
        return onChangeExpandedGroups(
          expandedGroups.filter((id) => id !== groupId)
        );
      }

      return onChangeExpandedGroups([...expandedGroups, groupId]);
    }, [expandedGroups, editor, groupId, onChangeExpandedGroups])
  );

  if (type == null) {
    return null;
  }

  const groupIsExpanded = !collapsible || expandedGroups.includes(groupId);

  const resultWrapperStyles = css({
    display: 'inline-flex',
    flexDirection: 'row',
    alignItems: 'center',
    fontWeight: '700',
    justifyContent: 'inherit',
    cursor: 'pointer',
    '&:hover': {
      opacity: 0.5,
    },
  });

  const groupAggregationWrapper = css({
    display: 'block',
  });

  return (
    <DataViewTableHeaderUI
      hover={hover}
      rowSpan={rowSpan}
      colSpan={groupIsExpanded ? colSpan : 1}
      onHover={onHover}
      alignRight={alignRight}
      global={global}
      rotate={rotate}
      isFirstLevelHeader={isFirstLevelHeader}
    >
      <div onClick={handleCollapseGroupButtonPress} css={resultWrapperStyles}>
        <>
          <CodeResult
            value={value as Result.Result['value']}
            variant="inline"
            type={type}
            element={element}
          />
          {collapsible && (
            <span css={iconStyles} data-testid="data-view-row-expander">
              {groupIsExpanded ? <FolderOpen /> : <Folder />}
            </span>
          )}
        </>
      </div>
      {aggregationType &&
        (!collapsible || !groupIsExpanded) &&
        replicaCount > 1 && (
          <div css={groupAggregationWrapper}>
            <GroupAggregation
              tableName={tableName}
              aggregationType={aggregationType}
              element={element}
              column={column}
              previousColumns={previousColumns.slice(0, -1)}
              roundings={roundings}
            />
          </div>
        )}
    </DataViewTableHeaderUI>
  );
};
