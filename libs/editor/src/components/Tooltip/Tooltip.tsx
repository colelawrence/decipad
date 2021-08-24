import { Icons } from '@decipad/ui';
import { css } from '@emotion/react';
import {
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_UNDERLINE,
  PortalBody,
} from '@udecode/plate';
import { FC } from 'react';
import { ElementTypeMenu } from './buttons/ElementTypeMenu/ElementTypeMenu';
import { ToggleMarkButton } from './buttons/ToggleMarkButton/ToggleMarkButton';
import { useEditorTooltip } from './hooks/useEditorTooltip';
import { wrapperStyles } from './styles/wrapper';

const iconWrapper = css({
  width: '16px',
  height: '16px',
});

const marks = [
  {
    type: MARK_BOLD,
    icon: (
      <div css={iconWrapper}>
        <Icons.Bold />
      </div>
    ),
    divider: true,
  },
  {
    type: MARK_ITALIC,
    icon: (
      <div css={iconWrapper}>
        <Icons.Italic />
      </div>
    ),
    divider: false,
  },
  {
    type: MARK_UNDERLINE,
    icon: (
      <div css={iconWrapper}>
        <Icons.Underline />
      </div>
    ),
    divider: false,
  },
  {
    type: MARK_CODE,
    icon: (
      <div css={iconWrapper}>
        <Icons.Code />
      </div>
    ),
    divider: true,
  },
];

export const Tooltip = (): ReturnType<FC> => {
  const { active, ref, currentBlockType } = useEditorTooltip();

  if (!active) return null;

  return (
    <PortalBody>
      <div ref={ref} css={wrapperStyles}>
        <ElementTypeMenu currentBlockType={currentBlockType} />
        {marks.map((m) => (
          <ToggleMarkButton key={m.type} {...m} />
        ))}
      </div>
    </PortalBody>
  );
};
