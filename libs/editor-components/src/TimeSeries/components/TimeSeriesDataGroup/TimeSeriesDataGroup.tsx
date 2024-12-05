import { type FC } from 'react';
import type { Result } from '@decipad/language-interfaces';
import type {
  AggregationKind,
  DataGroup,
  HeaderProps,
  SmartProps,
} from '../../types';
import type { Element as GroupElement } from '../../utils/types';
import { isCellAlignRight } from '@decipad/editor-utils';

interface TimeSeriesDataGroupElementProps {
  element: GroupElement<DataGroup>;
  Header: FC<HeaderProps>;
  SmartCell: FC<SmartProps>;
  aggregationType: AggregationKind | undefined;
  isFullWidthRow: boolean;
  expandedGroups: string[] | undefined;
  onChangeExpandedGroups: (expandedGroups: string[]) => void;
  groupLength: number;
  index: number;
  rotate: boolean;
  isFirstLevel: boolean;
  alignRight?: boolean;
}

export const TimeSeriesDataGroupElement: FC<
  TimeSeriesDataGroupElementProps
> = ({
  element,
  Header,
  SmartCell,
  aggregationType,
  isFullWidthRow,
  expandedGroups,
  onChangeExpandedGroups,
  groupLength,
  index,
  rotate,
  isFirstLevel,
  alignRight,
}) => {
  return element.elementType === 'group' ? (
    <Header
      type={element.type}
      value={element.value}
      rowSpan={element.rowspan}
      colSpan={element.colspan}
      collapsible={element.collapsible}
      alignRight={alignRight ?? isCellAlignRight(element.type)}
      isFullWidthRow={isFullWidthRow}
      expandedGroups={expandedGroups}
      onChangeExpandedGroups={onChangeExpandedGroups}
      groupId={element.id || ''}
      groupLength={groupLength}
      index={index}
      global={element.global}
      rotate={rotate}
      isFirstLevelHeader={isFirstLevel}
      aggregationType={aggregationType}
      aggregationResult={element.aggregationResult}
      aggregationExpression={element.aggregationExpression}
    />
  ) : (
    <SmartCell
      rowSpan={element.rowspan}
      colSpan={element.colspan}
      aggregationType={aggregationType}
      alignRight={alignRight ?? isCellAlignRight(element.type)}
      global={element.global}
      rotate={rotate}
      aggregationResult={
        element.value != null && element.type
          ? ({ type: element.type, value: element.value } as Result.Result)
          : undefined
      }
      aggregationExpression={element.aggregationExpression}
    />
  );
};
