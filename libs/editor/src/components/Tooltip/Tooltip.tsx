import {
  MARK_BOLD,
  MARK_CODE,
  MARK_HIGHLIGHT,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
} from '@decipad/editor-types';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { icons } from '@decipad/ui';
import { css } from '@emotion/react';
import { PortalBody } from '@udecode/plate';
import { FC } from 'react';
import { ToggleMarkButton } from './buttons/ToggleMarkButton/ToggleMarkButton';
import { useEditorTooltip } from './hooks/useEditorTooltip';
import { wrapperStyles } from './styles/wrapper';

const iconWrapper = css({
  width: '16px',
  height: '16px',
});

const toolTipMarks = [
  {
    type: MARK_BOLD,
    icon: (
      <div css={iconWrapper}>
        <icons.Bold />
      </div>
    ),
    divider: false,
  },
  {
    type: MARK_ITALIC,
    icon: (
      <div css={iconWrapper}>
        <icons.Italic />
      </div>
    ),
    divider: false,
  },
  {
    type: MARK_UNDERLINE,
    icon: (
      <div css={iconWrapper}>
        <icons.Underline />
      </div>
    ),
    divider: false,
  },
  {
    type: MARK_STRIKETHROUGH,
    icon: (
      <div css={iconWrapper}>
        <icons.Strikethrough />
      </div>
    ),
    divider: false,
  },
  {
    type: MARK_HIGHLIGHT,
    icon: (
      <div css={iconWrapper}>
        <icons.Highlight />
      </div>
    ),
    divider: true,
  },
  {
    type: MARK_CODE,
    icon: (
      <div css={iconWrapper}>
        <icons.Code />
      </div>
    ),
    divider: false,
  },
];

export const Tooltip = (): ReturnType<FC> => {
  const { active, ref } = useEditorTooltip();
  const readOnly = useIsEditorReadOnly();

  if (readOnly || !active) return null;

  return (
    <PortalBody>
      <div ref={ref} css={wrapperStyles}>
        {toolTipMarks.map((m) => (
          <ToggleMarkButton key={m.type} {...m} />
        ))}
      </div>
    </PortalBody>
  );
};
