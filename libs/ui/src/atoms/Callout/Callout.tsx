import {
  useIsEditorReadOnly,
  useThemeFromStore,
} from '@decipad/react-contexts';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import * as icons from '../../icons';
import { IconPopover } from '../../molecules/IconPopover/IconPopover';
import { cssVar, setCssVar, transparency } from '../../primitives';
import { blockAlignment } from '../../styles';
import { AvailableSwatchColor, swatchesThemed, UserIconKey } from '../../utils';

const { callout } = blockAlignment;

const verticalPadding = '12px';

const styles = css(
  callout.typography,
  setCssVar('currentTextColor', cssVar('weakTextColor')),
  {
    borderRadius: '12px',

    display: 'grid',
    gridTemplateColumns: '16px 1fr',
    gridGap: '16px',

    margin: `0`,
    padding: `${verticalPadding} 16px`,
  }
);

const iconWrapperStyles = css({
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),
  alignItems: 'center',
  display: 'grid',
  height: `calc(${callout.typography?.fontSize} * ${callout.typography?.lineHeight})`,
  width: '16px',
  mixBlendMode: 'luminosity',
});

interface CalloutProps {
  readonly children: ReactNode;
  readonly icon?: UserIconKey;
  readonly color?: AvailableSwatchColor;
  readonly saveIcon?: (newIcon: UserIconKey) => void;
  readonly saveColor?: (newColor: AvailableSwatchColor) => void;
}

export const Callout = ({
  children,
  icon = 'Announcement',
  color = 'Malibu',
  saveIcon = noop,
  saveColor = noop,
}: CalloutProps): ReturnType<FC> => {
  const Icon = icons[icon];
  const [darkTheme] = useThemeFromStore();
  return (
    <p
      css={[
        styles,
        {
          backgroundColor: transparency(swatchesThemed(darkTheme)[color], 0.4)
            .rgba,
          color: cssVar('weakTextColor'),
        },
      ]}
    >
      {useIsEditorReadOnly() ? (
        <span css={iconWrapperStyles}>
          <Icon />
        </span>
      ) : (
        <IconPopover
          color={color}
          trigger={
            <button css={iconWrapperStyles}>
              <Icon />
            </button>
          }
          onChangeColor={saveColor}
          onChangeIcon={saveIcon}
        />
      )}
      <em>{children}</em>
    </p>
  );
};
