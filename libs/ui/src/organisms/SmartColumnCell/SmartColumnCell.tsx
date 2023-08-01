/* eslint decipad/css-prop-named-variable: 0 */
import { Result } from '@decipad/computer';
import { AnyElement } from '@decipad/editor-types';
import { css } from '@emotion/react';
import { DragEvent, FC, ReactNode, RefObject, useState } from 'react';
import { antiwiggle, cssVar, p12Regular, wiggle } from '../../primitives';
import { table } from '../../styles';
import { resultBubbleStyles } from '../../styles/results';
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

const inlineResultStyles = css(resultBubbleStyles, {
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
});

const smartColumnCellStyles = css(p12Regular, {
  color: cssVar('textDefault'),
  display: 'inline-flex',
  padding: '0 6px 0 10px',
  alignItems: 'center',
  position: 'relative',
  width: '100%',
  justifyContent: 'space-between',
  marginTop: table.smartRowHorizontalPadding,
});

interface SmartColumnCellProps {
  readonly aggregationTypeMenu: ReactNode | ReactNode[];
  readonly onDragStart: (e: DragEvent) => void;
  readonly onDragEnd?: (e: DragEvent) => void;
  readonly result?: Result.Result;
  readonly element?: AnyElement;
  readonly previewRef?: RefObject<HTMLDivElement>;
}

export const SmartColumnCell: FC<SmartColumnCellProps> = ({
  aggregationTypeMenu,
  onDragStart,
  onDragEnd,
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
        onDragEnd={(ev) => {
          setGrabbing(false);
          onDragEnd?.(ev);
        }}
      >
        {result && (
          <CodeResult variant="inline" {...result} element={element} />
        )}
      </span>
    </div>
  );
};
