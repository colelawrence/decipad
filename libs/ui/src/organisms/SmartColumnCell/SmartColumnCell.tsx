import { css } from '@emotion/react';
import { Result } from '@decipad/computer';
import { DragEvent, FC, ReactNode, useState } from 'react';
import { cssVar, p12Regular } from '../../primitives';
import { CodeResult } from '../CodeResult/CodeResult';
import { table } from '../../styles';

const resultWrapperStyles = css({
  userSelect: 'all',
  cursor: 'grab',
  wordBreak: 'break-all',
  textAlign: 'left',
});

const grabbingStyles = css({
  cursor: 'grabbing',
});

const smartColumnCellStyles = css(p12Regular, {
  color: cssVar('weakerTextColor'),
  display: 'inline-flex',
  padding: '10px',
  alignItems: 'center',
  position: 'relative',
  maxWidth: table.tdMaxWidth,
  minWidth: table.tdMinWidth,
  width: '100%',
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
    <div css={[smartColumnCellStyles]}>
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
