import { css } from '@emotion/react';
import { FC } from 'react';
import * as icons from '../../icons';
import { IconPopover } from '../../molecules';
import {
  cssVar,
  p14Regular,
  setCssVar,
  shortAnimationDuration,
} from '../../primitives';
import { editorLayout } from '../../styles';
import { AvailableSwatchColor, baseSwatches, UserIconKey } from '../../utils';

const blockStyles = css({
  display: 'grid',
  gridTemplateRows: '32px',
  gridTemplateColumns: `min(100%, ${editorLayout.slimBlockWidth}px)`,
  justifyContent: 'center',
  alignItems: 'center',

  borderRadius: '6px',
});

const iconWrapperStyles = css({
  width: '32px',
  height: '32px',
  display: 'grid',
  placeItems: 'center',
  borderRadius: '8px',
  transition: `background-color ${shortAnimationDuration} ease-out`,
  zIndex: 2,
});

const iconStyles = css(p14Regular, {
  ...setCssVar('currentTextColor', cssVar('iconColorDark')),
  width: '24px',
  height: '24px',
});

type EditorIconProps = {
  readonly icon: UserIconKey;
  readonly color: AvailableSwatchColor;
  readonly onChangeIcon?: (newIcon: UserIconKey) => void;
  readonly onChangeColor?: (newColor: AvailableSwatchColor) => void;
  readonly readOnly?: boolean;
};

export const EditorIcon = ({
  readOnly = false,
  icon,
  ...props
}: EditorIconProps): ReturnType<FC> => {
  const Icon = icons[icon];

  const iconElement = (
    <button
      css={[
        iconWrapperStyles,
        {
          backgroundColor: baseSwatches[props.color].rgb,
          cursor: readOnly ? 'default' : 'pointer',
        },
      ]}
    >
      <div css={iconStyles}>
        <Icon />
      </div>
    </button>
  );
  if (readOnly) {
    return <div css={blockStyles}>{iconElement}</div>;
  }
  return (
    <div css={blockStyles}>
      <IconPopover {...props} trigger={iconElement} />
    </div>
  );
};
