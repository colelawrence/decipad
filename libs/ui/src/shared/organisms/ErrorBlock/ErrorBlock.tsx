/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { Button } from '../../atoms';
import {
  cssVar,
  p13Medium,
  p14Medium,
  smallScreenQuery,
} from '../../../primitives';
import { slimBlockWidth } from '../../../styles/editor-layout';
import { Warning } from '../../../icons';

function getText(type: ErrorBlockProps['type'], message: string) {
  if (type === 'error') {
    return `The rest of your notebook should be fine. Delete this block or contact support. We've been notified of the error! ${message}`;
  }
  if (type === 'warning') {
    return `The rest of your notebook should be fine. Undo, delete this block or contact support. We've been notified of the error! ${message}`;
  }
  if (type === 'info') {
    return message;
  }
  return '';
}

function getButtons(
  type: ErrorBlockProps['type'],
  onDelete: ErrorBlockProps['onDelete'],
  onUndo: ErrorBlockProps['onUndo']
) {
  if (type === 'error') {
    return (
      <Button type="primary" onClick={onDelete}>
        Delete this block
      </Button>
    );
  }
  if (type === 'warning') {
    return (
      <>
        <Button type="primary" onClick={onUndo}>
          Undo
        </Button>
        <Button type="text" onClick={onDelete}>
          Delete this block
        </Button>
      </>
    );
  }
  return null;
}

// complete-error should never happen, but if it does it's when the fallback
// component cannot determine the path of it.
export interface ErrorBlockProps {
  readonly type: 'complete-error' | 'error' | 'warning' | 'info';
  readonly onDelete?: () => void;
  readonly onUndo?: () => void;
  readonly message?: string;
  readonly insideLayout?: boolean;
}

export const ErrorBlock: React.FC<ErrorBlockProps> = ({
  type,
  onDelete = () => {},
  onUndo = () => {},
  message = '',
  insideLayout = false,
}: ErrorBlockProps) => (
  <div
    css={errorBlock(insideLayout)}
    contentEditable={false}
    data-testid="error-block"
  >
    <div css={textRow}>
      <span>
        <Warning css={{ flexShrink: 0 }} />
        Oops something is broken, and that's on us.
      </span>
      {getText(type, message)}
    </div>
    <div css={buttonRow}>
      <div>{getButtons(type, onDelete, onUndo)}</div>
    </div>
  </div>
);

// When inside a layout, remove the explicit width to prevent overflow
const errorBlock = (insideLayout: boolean) =>
  css({
    padding: '16px 24px',
    gap: '16px',
    borderRadius: '8px',
    width: insideLayout ? undefined : slimBlockWidth,
    backgroundColor: cssVar('backgroundDefault'),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',

    [smallScreenQuery]: insideLayout
      ? undefined
      : {
          minWidth: '360px',
          maxWidth: slimBlockWidth,
          width: '100%',
        },
  });

const textRow = css(p13Medium, {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'start',
  gap: '6px',
  span: css(p14Medium, {
    color: cssVar('textTitle'),
    display: 'flex',
    gap: '4px',
  }),

  svg: {
    width: '16px',
    height: '16px',
  },
});

const buttonRow = css({
  div: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'start',
    alignItems: 'center',
    gap: '8px',
  },
});
