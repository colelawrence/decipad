import { FC, useCallback, useEffect, useState } from 'react';
import { Subscription } from 'rxjs';
import { AggregationKind, DataGroup } from '../../types';
import { Element as GroupElement } from '../../utils/treeToTable';
import { HeaderProps, SmartProps } from '../PowerTableDataLayout';

interface PowerTableDataGroupElementProps {
  element: GroupElement<DataGroup>;
  Header: FC<HeaderProps>;
  SmartCell: FC<SmartProps>;
  aggregationType: AggregationKind | undefined;
}

const PowerTableDataGroupElement: FC<PowerTableDataGroupElementProps> = ({
  element,
  Header,
  SmartCell,
  aggregationType,
}) => {
  const [parentHover, setParentHover] = useState(false);
  const [selfHover, setSelfHover] = useState(false);

  useEffect(() => {
    let sub: Subscription;
    if (element.parentHighlight$) {
      sub = element.parentHighlight$.subscribe(setParentHover);
    }
    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, [element.parentHighlight$]);

  useEffect(() => {
    element.selfHighlight$?.next(parentHover || selfHover);
  }, [element.selfHighlight$, parentHover, selfHover]);

  const onHover = useCallback(
    (hover: boolean) => {
      setSelfHover(hover);
      if (element.selfHighlight$) {
        element.selfHighlight$.next(selfHover);
      }
    },
    [element.selfHighlight$, selfHover]
  );

  return element.elementType === 'group' ? (
    <Header
      type={element.type}
      value={element.value}
      rowSpan={element.rowspan}
      colSpan={element.colspan}
      onHover={onHover}
      hover={parentHover || selfHover}
    />
  ) : (
    element.column && (
      <SmartCell
        rowSpan={element.rowspan}
        colSpan={element.colspan}
        column={element.column}
        aggregationType={aggregationType}
        onHover={onHover}
        hover={parentHover || selfHover}
      />
    )
  );
};

interface PowerTableDataGroupProps {
  group: GroupElement<DataGroup>[];
  selectedAggregationTypes: Array<AggregationKind | undefined>;
  Header: FC<HeaderProps>;
  SmartCell: FC<SmartProps>;
}

export const PowerTableDataGroup: FC<PowerTableDataGroupProps> = ({
  group,
  selectedAggregationTypes,
  Header,
  SmartCell,
}: PowerTableDataGroupProps) => {
  return (
    <>
      {group.map((element, index) => (
        <PowerTableDataGroupElement
          key={index}
          element={element}
          aggregationType={selectedAggregationTypes[element.columnIndex]}
          Header={Header}
          SmartCell={SmartCell}
        />
      ))}
    </>
  );
};
