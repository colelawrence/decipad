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

const iconWrapper = css({
  width: '32px',
  height: '32px',
  display: 'grid',
  placeItems: 'center',
  borderRadius: '6px',
  transition: `background-color ${shortAnimationDuration} ease-out`,
  cursor: 'pointer',
});

const iconStyles = css(p14Regular, {
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
  width: '24px',
  height: '24px',
});

type EditorIconProps = {
  readonly icon: UserIconKey;
  readonly color: AvailableSwatchColor;
  readonly onChangeIcon?: (newIcon: UserIconKey) => void;
  readonly onChangeColor?: (newColor: AvailableSwatchColor) => void;
};

export const EditorIcon = (props: EditorIconProps): ReturnType<FC> => {
  const Icon = icons[props.icon];
  return (
    <div css={blockStyles}>
      <IconPopover
        {...props}
        trigger={
          <div
            css={[
              iconWrapper,
              { backgroundColor: baseSwatches[props.color].rgb },
            ]}
          >
            <div css={iconStyles}>
              <Icon />
            </div>
          </div>
        }
      />
    </div>
  );
};
