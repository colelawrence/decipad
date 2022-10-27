import { FC } from 'react';
import { css } from '@emotion/react';
import {
  brand100,
  brand600,
  cssVar,
  grey50,
  grey500,
  mediumShadow,
  orange100,
  orange300,
  p12Bold,
  p12Medium,
} from '../../primitives';
import { CurvedArrow } from '../../icons/CurvedArrow/CurvedArrow';
import { CircularArrow } from '../../icons';
import { Tooltip } from '../../atoms';

const wrapperStyles = css({
  display: 'flex',
  alignItems: 'center',
  padding: '4px',
  gap: '4px',
  position: 'fixed',
  height: '42px',
  backgroundColor: cssVar('backgroundColor'),
  border: `1px solid ${cssVar('strongHighlightColor')}`,
  boxShadow: `0px 2px 24px -4px ${mediumShadow}`,
  borderRadius: '8px',
  bottom: '16px',
});

const buttonStyles = css({
  width: '32px',
  height: '32px',
  backgroundColor: cssVar('highlightColor'),
  borderRadius: 6,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'all 0.5s ease-in-out',
  ':hover': {
    backgroundColor: grey50.rgb,
  },
});

const revertChangesStyles = css([
  {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: '16px',
    paddingRight: '16px',
    gap: '4px',
  },
  p12Bold,
]);

type State = 'saved' | 'unsaved';

const getColour = (
  state: State
): { background: string; foreground: string } => {
  switch (state) {
    case 'saved':
      return { background: brand100.rgb, foreground: brand600.rgb };
    case 'unsaved':
      return { background: orange100.rgb, foreground: orange300.rgb };
  }
};

const stateStyles = (state: State) => {
  const colours = getColour(state);
  return css({
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.2s ease-in-out',
    ':hover': {
      backgroundColor: colours.background,
    },
    ':after': {
      content: '""',
      width: '6px',
      borderRadius: '6px',
      height: '6px',
      backgroundColor: colours.foreground,
    },
  });
};

export interface NotebookStateProps {
  undo: () => void;
  redo: () => void;
  revertChanges: () => void;
  canUndo: boolean;
  canRedo: boolean;
  readOnly: boolean;
  saved: boolean;
}

const getText = (readOnly: boolean, saved: boolean) => {
  if (readOnly) {
    return (
      <>
        <p>Changes not saved, just play 🕹️</p>
        <p>
          <u>Duplicate </u>
          <span css={{ color: grey500.rgb }}>
            this model to save your changes and edit
          </span>
        </p>
      </>
    );
  }
  if (!saved) {
    return <p>Notebook is being saved ⌛</p>;
  }
  return <p>Published and saved 🤝</p>;
};

export const NotebookState: FC<NotebookStateProps> = ({
  undo,
  redo,
  revertChanges,
  canUndo,
  canRedo,
  readOnly,
  saved,
}) => {
  return (
    <div
      css={[
        wrapperStyles,
        {
          right: readOnly ? '32px' : '64px',
        },
      ]}
    >
      <div css={buttonStyles}>
        <button css={{ width: 24, height: 24 }} onClick={undo}>
          <CurvedArrow direction="left" active={canUndo} />
        </button>
      </div>
      <div css={buttonStyles}>
        <button css={{ width: 24, height: 24 }} onClick={redo}>
          <CurvedArrow direction="right" active={canRedo} />
        </button>
      </div>
      {readOnly && (
        <button css={revertChangesStyles} onClick={revertChanges}>
          <div css={{ width: 16, height: 16 }}>
            <CircularArrow />
          </div>
          Revert Changes
        </button>
      )}
      <Tooltip
        trigger={
          <div
            css={stateStyles(readOnly || !saved ? 'unsaved' : 'saved')}
          ></div>
        }
        align="end"
      >
        <div css={[p12Medium, { maxWidth: '200px' }]}>
          {getText(readOnly, saved)}
        </div>
      </Tooltip>
    </div>
  );
};
