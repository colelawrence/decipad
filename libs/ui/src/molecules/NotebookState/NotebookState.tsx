/* eslint decipad/css-prop-named-variable: 0 */
import { isFlagEnabled } from '@decipad/feature-flags';
import { css } from '@emotion/react';
import { FC, useCallback, useState } from 'react';
import { Tooltip } from '../../atoms';
import { CircularArrow, CurvedArrow } from '../../icons';
import {
  cssVar,
  grey500,
  p13Bold,
  red100,
  red200,
  red500,
  componentCssVars,
} from '../../primitives';
import { hideOnPrint } from '../../styles/editor-layout';

const wrapperStyles = css({
  display: 'flex',
  alignItems: 'center',
  padding: '4px',
  gap: '4px',
  position: 'fixed',
  height: '42px',
  borderRadius: '8px',
  bottom: '11px',
  zIndex: 666,
});

const buttonStyles = css({
  width: '32px',
  height: '32px',
  backgroundColor: cssVar('backgroundHeavy'),
  borderRadius: 6,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const inactiveStyles = {
  cursor: 'default',
};

const activeStyles = {
  cursor: 'pointer',
};

const activeButtonStyles = css({
  backgroundColor: cssVar('backgroundDefault'),
  ':hover': {
    backgroundColor: cssVar('backgroundHeavy'),
  },
});

const revertChangesStyles = css([
  p13Bold,
  {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: '16px',
    paddingRight: '16px',
    gap: '4px',
    borderRadius: '6px',
    height: '32px',
    color: cssVar('textDisabled'),
    backgroundColor: cssVar('backgroundDefault'),
    ':hover': {
      backgroundColor: cssVar('backgroundHeavy'),
    },
  },
]);

const activeRevertChangesStyles = css({
  color: cssVar('textDefault'),
  ':hover': {
    backgroundColor: cssVar('backgroundHeavy'),
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
        background: componentCssVars('StatusIndicatorSavedBackground'),
        foreground: componentCssVars('StatusIndicatorSavedForeground'),
      };
    case 'unsaved':
      return {
        background: componentCssVars('StatusIndicatorUnsavedBackground'),
        foreground: componentCssVars('StatusIndicatorUnsavedForeground'),
      };
    case 'offline':
      return {
        background: componentCssVars('StatusIndicatorOfflineBackground'),
        foreground: componentCssVars('StatusIndicatorOfflineForeground'),
      };
    case 'error':
      return {
        background: componentCssVars('StatusIndicatorErrorBackground'),
        foreground: componentCssVars('StatusIndicatorErrorForeground'),
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
    backgroundColor: cssVar('backgroundHeavy'),
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
  clearNotebook: () => void;
  canUndo: boolean;
  canRedo: boolean;
  readOnly: boolean;
  saved: boolean;
  isOffline: boolean;
  authed: boolean;
  isNewNotebook: boolean;
}

const getText = (readOnly: boolean, saved: boolean, isOffline: boolean) => {
  if (readOnly) {
    return (
      <>
        <p>Play with this notebook 🕹️</p>
        <p>
          <span css={{ color: grey500.rgb }}>
            Duplicate if you have an account. <br /> Or sign up for early
            access.
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
            online. <br /> If you think something is wrong contact support.
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
  return <p>Notebook saved</p>;
};

export const NotebookState: FC<NotebookStateProps> = ({
  undo,
  redo,
  revertChanges,
  clearNotebook,
  canUndo,
  canRedo,
  readOnly,
  saved,
  isOffline,
  authed,
  isNewNotebook,
}) => {
  const state = isOffline
    ? 'offline'
    : readOnly || !saved
    ? 'unsaved'
    : 'saved';

  const onMouseLeave = useCallback(() => {
    setShowClearAllDirection(false);
  }, []);

  const [showClearAllDirection, setShowClearAllDirection] = useState(true);

  return (
    <div
      css={[
        wrapperStyles,
        hideOnPrint,
        {
          right: !authed ? '14px' : '80px',
        },
        !canUndo && readOnly && { display: 'none' },
      ]}
    >
      {!readOnly &&
        isNewNotebook &&
        !canUndo &&
        isFlagEnabled('POPULATED_NEW_NOTEBOOK') && (
          <span id="ClearAllButton" onMouseLeave={onMouseLeave}>
            {/*
            We want to temporarily control the tooltip, but after the user
            hovered it, we want to hand the control back to Radix.
          */}
            <Tooltip
              {...(showClearAllDirection && { open: true })}
              trigger={
                <button
                  onClick={clearNotebook}
                  css={[
                    revertChangesStyles,
                    activeStyles,
                    activeRevertChangesStyles,
                    {
                      backgroundColor: red100.rgb,
                      color: red500.rgb,
                      ':hover': {
                        backgroundColor: red200.rgb,
                      },
                    },
                  ]}
                >
                  Clear All
                </button>
              }
              align="center"
            >
              <>
                <p>Clear All Content</p>
                <p>
                  <span css={{ color: grey500.rgb }}>
                    Click to start from an empty notebook.
                  </span>
                </p>
              </>
            </Tooltip>
          </span>
        )}
      {(canRedo || canUndo) && (
        <>
          <div css={[buttonStyles, canUndo && activeButtonStyles]}>
            <button
              css={[
                { width: 24, height: 24 },
                inactiveStyles,
                canUndo && activeStyles,
              ]}
              onClick={undo}
              title={canUndo ? 'Undo ⌘ + Z' : ''}
            >
              <CurvedArrow direction="left" active={canUndo} />
            </button>
          </div>
          <div css={[buttonStyles, canRedo && activeButtonStyles]}>
            <button
              css={[
                { width: 24, height: 24 },
                inactiveStyles,
                canRedo && activeStyles,
              ]}
              onClick={redo}
              title={canRedo ? 'Redo ⌘ + SHIFT + Z' : ''}
            >
              <CurvedArrow direction="right" active={canRedo} />
            </button>
          </div>
        </>
      )}
      {readOnly && (
        <button
          css={[
            revertChangesStyles,
            inactiveStyles,
            canUndo && activeStyles,
            canUndo && activeRevertChangesStyles,
          ]}
          onClick={revertChanges}
          title={!canUndo ? 'Reset all changes to the document' : ''}
        >
          <div css={{ width: 16, height: 16 }}>
            <CircularArrow />
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
        <div css={[{ maxWidth: '200px' }]}>
          {getText(readOnly, saved, isOffline)}
        </div>
      </Tooltip>
    </div>
  );
};
