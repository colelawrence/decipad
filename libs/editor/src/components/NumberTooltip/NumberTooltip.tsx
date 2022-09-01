import React, { FC } from 'react';
import { css } from '@emotion/react';
import { blue500 } from '@decipad/ui';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { InlineNumberElement, useTEditorRef } from '@decipad/editor-types';
import { useElementMutatorCallback } from '@decipad/editor-utils';
import { jumpOutInlineNumber } from '@decipad/editor-plugins';
import { useNumberToolbar } from './hooks/useNumberToolbar';
import { wrapperStyles } from '../Tooltip/styles/wrapper';

export const NumberTooltip = (): ReturnType<FC> => {
  const { floating, style, open, bubble } = useNumberToolbar();

  const readOnly = useIsEditorReadOnly();
  const isClosed = readOnly || !open || !bubble;

  if (isClosed) return null;

  return (
    <div ref={floating} style={style} css={wrapperStyles}>
      <div css={nameStyle}>Name:</div>

      <NameInput bubble={bubble} />
    </div>
  );
};

const NameInput: React.FC<{ bubble: InlineNumberElement }> = ({ bubble }) => {
  const editor = useTEditorRef();
  const updateName = useElementMutatorCallback(editor, bubble, 'name');

  return (
    <input
      key={bubble.id}
      css={inputStyles}
      placeholder="untitled"
      autoComplete="off"
      defaultValue={bubble.name}
      onChange={(event) => {
        const newName = event.target.value;

        updateName(newName);
      }}
      onKeyDown={(event) => {
        if (/(Enter|Tab)/.test(event.key)) {
          event.preventDefault();
          jumpOutInlineNumber(editor, bubble);
        }
      }}
    />
  );
};

const usualRemPxs = 16;

const tooltipText = css({
  fontWeight: 500,
  fontSize: `${14 / usualRemPxs}rem`,
  lineHeight: 1.4,
  letterSpacing: '-0.8%',
  fontFeatureSettings: 'unset',
});

const nameStyle = css(tooltipText, {
  padding: '12px',
  userSelect: 'none',
  color: blue500.rgb,
});

const inputStyles = css(tooltipText, {
  width: '100%',
  maxWidth: '128px',
  background: 'transparent',
  border: 0,
  fontVariantNumeric: 'tabular-nums',

  '::placeholder': {
    opacity: 0.5,
  },
});
