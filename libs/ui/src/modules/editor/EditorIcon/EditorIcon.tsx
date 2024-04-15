/* eslint decipad/css-prop-named-variable: 0 */
import { UserIconKey } from '@decipad/editor-types';
import { css } from '@emotion/react';
import { hideOnPrint } from 'libs/ui/src/styles/editor-layout';
import { FC } from 'react';
import * as userIcons from '../../../icons/user-icons';
import { IconPopover } from '../../../shared';
import {
  cssVar,
  p14Regular,
  shortAnimationDuration,
} from '../../../primitives';

import { editorLayout } from '../../../styles';
import { AvailableSwatchColor } from '../../../utils';

const blockStyles = css(hideOnPrint, {
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
  width: '24px',
  height: '24px',
  mixBlendMode: 'luminosity',
  opacity: '90%',
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
  color,
  ...props
}: EditorIconProps): ReturnType<FC> => {
  const Icon = userIcons[icon];

  const isDefaultColor = color === 'Catskill';

  const iconElement = (
    <button
      data-testid="notebook-icon"
      css={[
        iconWrapperStyles,
        {
          color: isDefaultColor
            ? cssVar('textDefault')
            : cssVar('themeTextDefault'),
          backgroundColor: isDefaultColor
            ? cssVar('backgroundDefault')
            : cssVar('themeBackgroundSubdued'),
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
      <IconPopover {...props} color={color} trigger={iconElement} />
    </div>
  );
};
