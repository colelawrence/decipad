import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { ComponentProps, FC, ReactNode } from 'react';
import * as icons from '../../icons';

import {
  cssVar,
  display,
  Opacity,
  p16Regular,
  setCssVar,
} from '../../primitives';
import { AvailableSwatchColor, UserIconKey } from '../../utils';
import { IconPopover } from '../IconPopover/IconPopover';

interface CaptionProps
  extends Pick<
    ComponentProps<typeof IconPopover>,
    'onChangeColor' | 'onChangeIcon'
  > {
  color?: AvailableSwatchColor;
  icon?: UserIconKey;
  empty?: boolean;
  children: ReactNode;
}

const nameWrapperStyles = css({
  alignItems: 'center',
  display: 'flex',
  gap: '4px',
});

const iconWrapperStyles = css(
  setCssVar('currentTextColor', cssVar('weakTextColor')),
  {
    display: 'grid',
    height: '20px',
    width: '20px',
    flexShrink: 0,
  }
);

const placeholderOpacity: Opacity = 0.4;

const placeholderStyles = css(p16Regular, {
  display: 'grid',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  width: '100%',

  '> span, ::before': {
    gridArea: '1 / 1',
  },

  '::before': {
    ...display,
    ...p16Regular,
    ...setCssVar('currentTextColor', cssVar('weakTextColor')),
    pointerEvents: 'none',
    content: 'attr(aria-placeholder)',
    opacity: placeholderOpacity,
  },
});

export const Caption = ({
  empty = false,
  children,
  color = 'Sulu',
  icon = 'Frame',
  onChangeColor = noop,
  onChangeIcon = noop,
}: CaptionProps): ReturnType<FC> => {
  const Icon = icons[icon];
  return (
    <div css={nameWrapperStyles}>
      {useIsEditorReadOnly() ? (
        <span contentEditable={false} css={iconWrapperStyles}>
          <Icon />
        </span>
      ) : (
        <IconPopover
          onChangeColor={onChangeColor}
          onChangeIcon={onChangeIcon}
          color={color}
          trigger={
            <button contentEditable={false} css={iconWrapperStyles}>
              <Icon />
            </button>
          }
        />
      )}
      <div
        css={placeholderStyles}
        aria-placeholder={empty ? 'Name your input' : ''}
        spellCheck={false}
      >
        <span>
          <span>{children}</span>
        </span>
      </div>
    </div>
  );
};
