import {
  MARK_BOLD,
  MARK_CODE,
  MARK_HIGHLIGHT,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
  MyMark,
} from '@decipad/editor-types';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { icons } from '@decipad/ui';
import { css } from '@emotion/react';
import { FC, ReactElement } from 'react';
import { ToggleMarkButton } from './buttons/ToggleMarkButton/ToggleMarkButton';
import { useEditorTooltip } from './hooks/useEditorTooltip';
import { wrapperStyles } from './styles/wrapper';
import { LinkButton } from './buttons/LinkButton';

const iconWrapper = css({
  width: '16px',
  height: '16px',
});

interface TooltipMark {
  type: MyMark;
  icon: ReactElement;
  divider: boolean;
}

const toolTipMarks: TooltipMark[] = [
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
  const { floating, style, open } = useEditorTooltip();

  const readOnly = useIsEditorReadOnly();

  if (readOnly || !open) return null;

  return (
    <div ref={floating} style={style} css={wrapperStyles}>
      {toolTipMarks.map((m) => (
        <ToggleMarkButton key={m.type} {...m} />
      ))}
      <LinkButton>
        <div css={iconWrapper}>
          <icons.Link />
        </div>
      </LinkButton>
    </div>
  );
};
