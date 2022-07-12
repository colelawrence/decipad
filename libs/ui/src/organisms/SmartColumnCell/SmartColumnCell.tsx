import { css } from '@emotion/react';
import { Result } from '@decipad/computer';
import { Children, DragEvent, FC, ReactNode, useState } from 'react';
import { cssVar, p12Regular } from '../../primitives';
import { table } from '../../styles';
import { CodeResult } from '../CodeResult/CodeResult';

const resultWrapperStyles = css({
  marginLeft: '1rem',
  userSelect: 'all',
  cursor: 'grab',
  paddingRight: table.cellSidePadding,
});

const grabbingStyles = css({
  cursor: 'grabbing',
});

const smartColumnCellStyles = css(p12Regular, {
  color: cssVar('weakerTextColor'),
  whiteSpace: 'nowrap',
  lineHeight: table.cellLineHeight,
});

const layoutStyles = (menuChildrenCount: number) =>
  css({
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: `1fr ${new Array(menuChildrenCount)
      .fill('0.5fr')
      .join(' ')} 1fr`,
  });

interface SmartColumnCellProps {
  readonly aggregationTypeMenu: ReactNode | ReactNode[];
  readonly onDragStart: (e: DragEvent) => void;
  readonly result?: Result.Result;
}

export const SmartColumnCell: FC<SmartColumnCellProps> = ({
  aggregationTypeMenu,
  onDragStart,
  result,
}) => {
  // Drag and drop

  const [grabbing, setGrabbing] = useState(false);

  return (
    <div
      css={[
        smartColumnCellStyles,
        layoutStyles(Children.count(aggregationTypeMenu)),
      ]}
    >
      <span>&nbsp;</span>
      {aggregationTypeMenu}
      <span
        css={[resultWrapperStyles, grabbing && grabbingStyles]}
        draggable
        onDragStart={(ev) => {
          setGrabbing(true);
          onDragStart(ev);
        }}
        onDragEnd={() => setGrabbing(false)}
      >
        {result && <CodeResult variant="inline" {...result} />}
      </span>
    </div>
  );
};
