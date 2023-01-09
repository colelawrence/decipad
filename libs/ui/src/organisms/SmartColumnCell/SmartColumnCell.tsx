import { Result } from '@decipad/computer';
import { AnyElement } from '@decipad/editor-types';
import { css } from '@emotion/react';
import { DragEvent, FC, ReactNode, useState } from 'react';
import {
  antiwiggle,
  cssVar,
  p12Regular,
  setCssVar,
  wiggle,
} from '../../primitives';
import { table } from '../../styles';
import { CodeResult } from '../CodeResult/CodeResult';

const resultWrapperStyles = css({
  userSelect: 'all',
  cursor: 'grab',
  wordBreak: 'break-all',
  textAlign: 'left',
});

const grabbingStyles = css({
  cursor: 'grabbing',
});

const inlineResultStyles = css({
  ':empty': { display: 'none' },
  ':hover': {
    animation: `${antiwiggle} 0.5s ease-in-out`,
  },

  ':hover:after': {
    backgroundColor: 'blue',
    animation: `${wiggle} 0.5s ease-in-out`,
  },

  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',

  padding: '2px 8px',

  backgroundColor: cssVar('backgroundColor'),
  border: `1px solid ${cssVar('borderColor')}`,
  borderRadius: '8px',
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),
});

const smartColumnCellStyles = css(p12Regular, {
  color: cssVar('normalTextColor'),
  display: 'inline-flex',
  padding: '0 6px 0 10px',
  alignItems: 'center',
  position: 'relative',
  maxWidth: table.tdMaxWidth,
  minWidth: table.tdMinWidth,
  width: '100%',
  justifyContent: 'space-between',
  marginTop: `${table.smartRowHorizontalPadding}`,
});

interface SmartColumnCellProps {
  readonly aggregationTypeMenu: ReactNode | ReactNode[];
  readonly onDragStart: (e: DragEvent) => void;
  readonly result?: Result.Result;
  readonly element?: AnyElement;
}

export const SmartColumnCell: FC<SmartColumnCellProps> = ({
  aggregationTypeMenu,
  onDragStart,
  result,
  element,
}) => {
  // Drag and drop

  const [grabbing, setGrabbing] = useState(false);

  return (
    <div css={[smartColumnCellStyles]}>
      <div
        css={css({
          display: 'inline-flex',
          alignItems: 'center',
          position: 'relative',
        })}
      >
        {aggregationTypeMenu}
      </div>
      <span
        key="result"
        css={[
          resultWrapperStyles,
          inlineResultStyles,
          grabbing && grabbingStyles,
        ]}
        draggable
        onDragStart={(ev) => {
          setGrabbing(true);
          onDragStart(ev);
        }}
        onDragEnd={() => setGrabbing(false)}
      >
        {result && (
          <CodeResult variant="inline" {...result} element={element} />
        )}
      </span>
    </div>
  );
};
