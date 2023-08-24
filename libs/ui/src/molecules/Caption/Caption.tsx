import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { ComponentProps, FC, ReactNode } from 'react';
import * as icons from '../../icons';

import {
  display,
  p13Regular,
  p14Regular,
  placeholderOpacity,
  smallScreenQuery,
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

const iconWrapperStyles = css({
  display: 'grid',
  height: '20px',
  width: '20px',
  flexShrink: 0,

  [smallScreenQuery]: {
    height: '16px',
    width: '16px',
  },
});

const placeholderStyles = css(
  p14Regular,

  {
    display: 'grid',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    width: '100%',

    '> span, ::before': {
      gridArea: '1 / 1',
    },

    '::before': {
      ...display,
      ...p14Regular,

      pointerEvents: 'none',
      content: 'attr(aria-placeholder)',
      opacity: placeholderOpacity,

      [smallScreenQuery]: p13Regular,
    },

    [smallScreenQuery]: p13Regular,
  }
);

export const Caption = ({
  empty = false,
  children,
  color = 'Catskill',
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
        role="textbox"
        css={placeholderStyles}
        aria-placeholder={empty ? 'Name your input' : ''}
        spellCheck={false}
        data-testid="input-widget-name"
      >
        <span>
          <span>{children}</span>
        </span>
      </div>
    </div>
  );
};
