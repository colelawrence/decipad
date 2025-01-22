/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC } from 'react';
import { Add } from '../../../icons';
import { cssVar, p13Medium } from '../../../primitives';

const relativeWrapper = css({
  width: '100%',
  height: '0px',
  position: 'relative',
});

const parentWrapper = css({
  width: '100%',
  display: 'flex',
  height: '8px',
  alignItems: 'center',

  position: 'absolute',

  opacity: 0,
  transition: 'opacity 0.2s ease-in-out',

  ':hover': {
    opacity: 1,
  },
});

const addElementLine = css({
  display: 'block',
  width: '100%',
  height: 2,
  backgroundColor: cssVar('backgroundHeavy'),

  zIndex: 10,
});

const buttonStyles = css(p13Medium, {
  cursor: 'pointer',
  display: 'flex',
  gap: '6px',
  padding: '7px',
  borderRadius: '6px',
  backgroundColor: cssVar('backgroundDefault'),
  border: `1px solid ${cssVar('backgroundHeavy')}`,

  zIndex: 20,
});

const iconWrapperStyles = css({
  height: '16px',
  width: '16px',
});

type NewElementLineProps = {
  onAdd: () => void;
};

// TODO: move this block, and all other related blocks to the same UI thing.
export const ADD_NEW_LINE = 'add-new-line';

export const NewElementLine = ({
  onAdd,
}: NewElementLineProps): ReturnType<FC> => {
  return (
    <div contentEditable={false} className={ADD_NEW_LINE} css={relativeWrapper}>
      <div css={parentWrapper}>
        <span css={addElementLine} />
        <button css={buttonStyles} onClick={onAdd}>
          <span css={iconWrapperStyles} data-testid="add-new-line-button">
            <Add />
          </span>
        </button>
        <span css={addElementLine} />
      </div>
    </div>
  );
};
