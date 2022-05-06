import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import * as icons from '../../icons';
import { IconPopover } from '../../molecules/IconPopover/IconPopover';
import { cssVar, setCssVar, transparency } from '../../primitives';
import { blockAlignment } from '../../styles';
import { AvailableSwatchColor, baseSwatches, UserIconKey } from '../../utils';

const { callout } = blockAlignment;

const verticalPadding = '12px';
const verticalMargin = `calc(${callout.paddingTop} - ${verticalPadding})`;

const styles = css(
  callout.typography,
  setCssVar('currentTextColor', cssVar('weakTextColor')),
  {
    borderRadius: '8px',

    display: 'grid',
    gridTemplateColumns: '16px 1fr',
    gridGap: '16px',

    margin: `${verticalMargin} 0 0`,
    padding: `${verticalPadding} 16px`,
  }
);

const iconWrapperStyles = css({
  alignItems: 'center',
  display: 'grid',
  height: `calc(${callout.typography?.fontSize} * ${callout.typography?.lineHeight})`,
  width: '16px',
  'svg > path': {
    stroke: cssVar('currentTextColor'),
  },
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
  return (
    <p
      css={[
        styles,
        { backgroundColor: transparency(baseSwatches[color], 0.4).rgba },
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
