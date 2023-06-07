/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { Button } from '../../atoms';
import { cssVar, p16Regular, smallScreenQuery } from '../../primitives';
import { slimBlockWidth } from '../../styles/editor-layout';

// complete-error should never happen, but if it does it's when the fallback
// component cannot determine the path of it.
export interface ErrorBlockProps {
  readonly type: 'complete-error' | 'error' | 'warning';
  readonly onDelete?: () => void;
  readonly onUndo?: () => void;
}

export const ErrorBlock: React.FC<ErrorBlockProps> = ({
  type,
  onDelete = () => {},
  onUndo = () => {},
}: ErrorBlockProps) => {
  const getText = () => {
    if (type === 'error') {
      return `Delete this block or contact support. We've been notified of the error! What now?`;
    }
    if (type === 'warning') {
      return `Undo, delete this block or contact support. We've been notified of the error! What now?`;
    }
    return '';
  };

  const getButtons = () => {
    if (type === 'error') {
      return (
        <Button type="darkDanger" onClick={onDelete}>
          Delete this block
        </Button>
      );
    }
    if (type === 'warning') {
      return (
        <>
          <Button type="darkWarningText" onClick={onDelete}>
            Delete this block
          </Button>
          <Button type="darkWarning" onClick={onUndo}>
            Undo
          </Button>
        </>
      );
    }
    return <></>;
  };

  return (
    <div
      css={[
        type === 'warning'
          ? { backgroundColor: cssVar('errorBlockWarning') }
          : { backgroundColor: cssVar('errorBlockError') },
        errorBlock,
      ]}
      contentEditable={false}
    >
      <div css={errorBlockWrapperStyles}>
        <div css={errorBlockRowStyles}>
          <span data-testid="error-block" css={errorMessageStypes}>
            {`Oops something is broken, and that's on us. The rest of your notebook should be fine.`}
            {getText()}
          </span>
        </div>
        <div css={buttonRow}>
          <div css={centeredFlex}>{getButtons()}</div>
        </div>
      </div>
    </div>
  );
};

const centeredFlex = css({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const errorBlock = css(centeredFlex, {
  padding: '16px 24px 16px 24px',
  gap: 8,
  borderRadius: 8,
  width: slimBlockWidth,
  [smallScreenQuery]: {
    minWidth: '360px',
    maxWidth: slimBlockWidth,
    width: '100%',
  },
});

const errorBlockWrapperStyles = css(centeredFlex, {
  flexDirection: 'column',
  gap: 12,
});

const errorMessageStypes = css(p16Regular, {
  color: cssVar('errorBlockColor'),
});

const errorBlockRowStyles = css(centeredFlex, {
  flexDirection: 'row',
  gap: 8,
});

const buttonRow = css({
  width: '100%',
  display: 'flex',
  justifyContent: 'end',
  alignItems: 'center',
  gap: 16,
});
