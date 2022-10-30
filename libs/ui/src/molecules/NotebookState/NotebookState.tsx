import { css } from '@emotion/react';
import { FC } from 'react';
import { Tooltip } from '../../atoms';
import { CircularArrow } from '../../icons';
import { CurvedArrow } from '../../icons/CurvedArrow/CurvedArrow';
import {
  cssVar,
  grey500,
  mediumShadow,
  p12Bold,
  p12Medium,
} from '../../primitives';

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
});

const activeButtonStyles = css({
  transition: 'all 1.25s ease-in-out',
  ':hover': {
    border: `1px solid ${cssVar('strongHighlightColor')}`,
  },
});

const revertChangesStyles = css([
  p12Bold,
  {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: '16px',
    paddingRight: '16px',
    gap: '4px',
    borderRadius: '6px',
    height: '32px',
    color: cssVar('weakerTextColor'),
  },
]);

const activeRevertChangesStyles = css({
  color: cssVar('normalTextColor'),
  ':hover': {
    backgroundColor: cssVar('highlightColor'),
  },
});

type State = 'saved' | 'unsaved' | 'offline' | 'error';

// saved: all is ok, being || saved remotely and locally
// unsaved: after the debouncing 2s we still couldnt save the document, || locally saved
// offline: we have no access to the internet so things are || locally saved
// error (unused): an error has happened, you should contact support (e.g. broken block)

const getColour = (
  state: State
): { background: string; foreground: string } => {
  switch (state) {
    case 'saved':
      return {
        background: cssVar('notebookStateOkLight'),
        foreground: cssVar('notebookStateOkHeavy'),
      };
    case 'unsaved':
      return {
        background: cssVar('notebookStateWarningLight'),
        foreground: cssVar('notebookStateWarningHeavy'),
      };
    case 'offline':
      return {
        background: cssVar('notebookStateDisabledLight'),
        foreground: cssVar('notebookStateDisabledHeavy'),
      };
    case 'error':
      return {
        background: cssVar('notebookStateDangerLight'),
        foreground: cssVar('notebookStateDangerHeavy'),
      };
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
  isOffline: boolean;
}

const getText = (readOnly: boolean, saved: boolean, isOffline: boolean) => {
  if (readOnly) {
    return (
      <>
        <p>Play with this notebook 🕹️</p>
        <p>
          <span css={{ color: grey500.rgb }}>
            Duplicate if you have an account. Or sign up for early access.
          </span>
        </p>
      </>
    );
  }
  if (isOffline) {
    return (
      <>
        <p>Offline 🌐</p>
        <p>
          <span css={{ color: grey500.rgb }}>
            We're saving your work and your changes will sync when you are back
            online. If you think something is wrong contact support.
          </span>
        </p>
      </>
    );
  }
  if (!saved) {
    return (
      <>
        <p>Changes not synced</p>
        <p>
          <span css={{ color: grey500.rgb }}>
            If this error persists contact support.
          </span>
        </p>
      </>
    );
  }
  return <p>Saved</p>;
};

export const NotebookState: FC<NotebookStateProps> = ({
  undo,
  redo,
  revertChanges,
  canUndo,
  canRedo,
  readOnly,
  saved,
  isOffline,
}) => {
  const state = isOffline
    ? 'offline'
    : readOnly || !saved
    ? 'unsaved'
    : 'saved';
  return (
    <div
      css={[
        wrapperStyles,
        {
          right: readOnly ? '32px' : '64px',
        },
      ]}
    >
      <div css={[buttonStyles, canUndo && activeButtonStyles]}>
        <button css={{ width: 24, height: 24 }} onClick={undo}>
          <CurvedArrow
            title={canUndo ? 'Undo ⌘ + Z' : ''}
            direction="left"
            active={canUndo}
          />
        </button>
      </div>
      <div css={[buttonStyles, canRedo && activeButtonStyles]}>
        <button css={{ width: 24, height: 24 }} onClick={redo}>
          <CurvedArrow
            title={canRedo ? 'Redo ⌘ + SHIFT + Z' : ''}
            direction="right"
            active={canRedo}
          />
        </button>
      </div>
      {readOnly && (
        <button
          css={[
            revertChangesStyles,
            !(!canUndo && canRedo) && activeRevertChangesStyles,
          ]}
          onClick={revertChanges}
        >
          <div css={{ width: 16, height: 16 }}>
            <CircularArrow active={!canUndo && canRedo} />
          </div>
          Reset Changes
        </button>
      )}
      <Tooltip
        trigger={<div aria-label={state} css={stateStyles(state)}></div>}
        side="top"
        hoverOnly
        wrapperStyles={css({
          marginRight: '16px',
          borderRadius: '8px',
        })}
      >
        <div css={[p12Medium, { maxWidth: '200px' }]}>
          {getText(readOnly, saved, isOffline)}
        </div>
      </Tooltip>
    </div>
  );
};
