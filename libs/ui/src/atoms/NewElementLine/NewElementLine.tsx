import { css } from '@emotion/react';
import { FC, HTMLAttributes, useEffect, useState } from 'react';
import { Create } from '../../icons';
import { cssVar, p13Medium } from '../../primitives';

const parentWrapper = css({
  position: 'absolute',
  width: '100%',
  height: 0,
  top: 0,
  zIndex: 1,
});

const tableStyles = css({
  left: 0,
  top: -5,
});

const tableReverseStyles = css({
  left: 0,
  top: 'auto',
  bottom: 5,
});

const addElementLineWrapper = css({
  width: '100%',
  height: 10,
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
  position: 'relative',
});

const addElementLine = css({
  width: '100%',
  height: 2,
  backgroundColor: cssVar('droplineGreyColor'),
});

const buttonStyles = (hasSibling: boolean) =>
  css(p13Medium, {
    cursor: 'pointer',
    display: 'flex',
    gap: '6px',
    padding: hasSibling ? `2px` : '7px',
    borderRadius: '6px',
    backgroundColor: cssVar('highlightColor'),
    border: `1px solid ${cssVar('strongHighlightColor')}`,
  });

const iconWrapperStyles = css({
  height: '16px',
  width: '16px',
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
  /* to be used when isTable is true */
  readonly tableAdditionalProps?: {
    isLastColumn: boolean;
    rowWidth: number;
  };

  readonly hasPreviousSibling?: boolean;
}

export const NewElementLine = ({
  onAdd,
  show = true,
  isTable,
  tableAdditionalProps,
  reverse,
  onMouseLeave,
  onMouseEnter,
  onClick,
  hasPreviousSibling,
}: NewElementLineProps): ReturnType<FC> => {
  const [clicked, setClicked] = useState<boolean>(false);
  /** In order to center the + button , we need to consider the button width:
   * 16px from the icon size
   * 12px from the button padding (6px + 6px)
   * 2px from the button border (1px + 1px)
   */
  const buttonWidth = 32;

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
        css={[
          addElementLineWrapper,
          isTable && show && { opacity: 1 },
          hasPreviousSibling && { marginTop: '-5px' },
        ]}
      >
        {(!isTable || (isTable && tableAdditionalProps?.isLastColumn)) && (
          <>
            <span css={addElementLine} />
            <button
              style={
                tableAdditionalProps && {
                  position: 'absolute',
                  right: `${
                    Math.round(
                      (tableAdditionalProps.rowWidth - buttonWidth) / 2
                    ) - 20 // this magic number comes from the width of the menu on the left side of the row
                  }px`,
                }
              }
              css={buttonStyles(!!hasPreviousSibling)}
              onClick={() => {
                setClicked(true);
                if (onAdd !== undefined) onAdd();
              }}
            >
              <span css={iconWrapperStyles}>
                <Create />
              </span>
            </button>
            <span css={addElementLine} />
          </>
        )}
        {isTable && tableAdditionalProps?.isLastColumn !== true && (
          <span css={addElementLine} />
        )}
        <span></span>
      </div>
    </div>
  );
};
