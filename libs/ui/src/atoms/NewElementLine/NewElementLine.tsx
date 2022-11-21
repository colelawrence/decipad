import { css } from '@emotion/react';
import { FC, HTMLAttributes, useEffect, useState } from 'react';
import { cssVar } from '../../primitives';

const parentWrapper = css({
  position: 'absolute',
  width: '100%',
  height: 0,
  top: 0,
  zIndex: 1,
});

const tableStyles = css({
  left: 0,
  top: -10,
});

const tableReverseStyles = css({
  left: 0,
  top: 'auto',
  bottom: 10,
});

const addElementLineWrapper = css({
  width: '100%',
  height: 20,
  paddingTop: 4,
  paddingBottom: 4,
  justifyContent: 'center',
  alignItems: 'center',
  display: 'flex',
  opacity: 0,
  transition: 'all 0.2s ease',
  '&:hover': {
    opacity: 1,
  },
});

const addElementLine = css({
  width: '100%',
  height: 3,
  backgroundColor: cssVar('tableSelectionBackgroundColor'), // droplineColor too dark
});

interface NewElementLineProps
  extends Pick<
    HTMLAttributes<HTMLDivElement>,
    'onMouseEnter' | 'onMouseLeave' | 'onClick'
  > {
  readonly onAdd: (() => void) | undefined;
  readonly show: boolean;

  /**
   * Default is for block insert. Set to true for table row insert.
   */
  readonly isTable?: boolean;

  /**
   * Default position is top. If true, set position at bottom.
   */
  readonly reverse?: boolean;
}

export const NewElementLine = ({
  onAdd,
  show = true,
  isTable,
  reverse,
  onMouseLeave,
  onMouseEnter,
  onClick,
}: NewElementLineProps): ReturnType<FC> => {
  const [clicked, setClicked] = useState<boolean>(false);

  useEffect(() => {
    if (clicked) {
      setTimeout(() => setClicked(false), 1000);
    }
  }, [clicked]);

  if (!show && !isTable) {
    return <></>;
  }

  return (
    <div
      css={[
        parentWrapper,
        clicked ? { opacity: 0 } : {},
        isTable && tableStyles,
        reverse && tableReverseStyles,
      ]}
      contentEditable={false}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <div
        css={[addElementLineWrapper, isTable && show && { opacity: 1 }]}
        onClick={() => {
          setClicked(true);
          if (onAdd !== undefined) onAdd();
        }}
      >
        <span css={addElementLine} />
      </div>
    </div>
  );
};
