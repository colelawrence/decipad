import type { Result } from '@decipad/language-interfaces';
import type { AnyElement } from '@decipad/editor-types';
import { useMyEditorRef } from '@decipad/editor-types';
import {
  CodeResult,
  DataViewTableHeader as TimeSeriesTableHeaderUI,
  useEventNoEffect,
} from '@decipad/ui';
import { css } from '@emotion/react';
import { deselect } from '@udecode/plate-common';
import { CaretDown, CaretRight } from 'libs/ui/src/icons';
import type { FC } from 'react';
import { useCallback } from 'react';
import type { HeaderProps } from '../../types';
import { GroupAggregation } from '../GroupAggregation/GroupAggregation';

const iconStyles = css({
  height: '16px',
  width: '16px',
  marginRight: '4px',
});

interface TimeSeriesTableHeaderProps extends HeaderProps {
  element?: AnyElement;
}

export const TimeSeriesTableHeader: FC<TimeSeriesTableHeaderProps> = ({
  type,
  value,
  rowSpan = 1,
  colSpan = 1,
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
  aggregationResult,
  aggregationExpression,
}) => {
  const editor = useMyEditorRef();
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
    <TimeSeriesTableHeaderUI
      rowSpan={rowSpan}
      colSpan={groupIsExpanded ? colSpan : 1}
      alignRight={alignRight}
      global={global}
      rotate={rotate}
      isFirstLevelHeader={isFirstLevelHeader}
    >
      <div onClick={handleCollapseGroupButtonPress} css={resultWrapperStyles}>
        <>
          {collapsible ? (
            <span css={iconStyles} data-testid="time-series-row-expander">
              {groupIsExpanded ? <CaretDown /> : <CaretRight />}
            </span>
          ) : (
            <span css={iconStyles}></span>
          )}
          <CodeResult
            value={value as Result.Result['value']}
            variant="inline"
            type={type}
            meta={undefined}
            element={element}
          />
        </>
      </div>
      {aggregationType && (!collapsible || !groupIsExpanded) ? (
        <div css={groupAggregationWrapper}>
          <GroupAggregation
            aggregationType={aggregationType}
            element={element}
            aggregationResult={aggregationResult}
            aggregationExpression={aggregationExpression}
          />
        </div>
      ) : null}
    </TimeSeriesTableHeaderUI>
  );
};
