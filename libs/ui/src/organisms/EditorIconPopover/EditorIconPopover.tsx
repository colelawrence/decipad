import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import * as Popover from '@radix-ui/react-popover';
import { FC, useState } from 'react';
import { ColorPicker, Divider, NotebookIconButton } from '../../atoms';
import { Close } from '../../icons';
import {
  baseSwatches,
  black,
  cssVar,
  grey500,
  grey600,
  p13Medium,
  setCssVar,
  shortAnimationDuration,
  swatchNames,
  white,
} from '../../primitives';
import { iconChoices } from './iconChoices';

const iconWrapper = css({
  width: '32px',
  height: '32px',
  display: 'grid',
  placeItems: 'center',
  borderRadius: '6px',
  transition: `background-color ${shortAnimationDuration} ease-out`,
});

const iconSize = css({
  ...setCssVar('currentTextColor', black.rgb),
  height: '24px',
  width: '24px',
});

const contentWrapper = css({
  marginTop: '6px',
  backgroundColor: white.rgb,
  padding: '12px',
  borderRadius: '8px',
  maxWidth: '272px',
  boxShadow: `0px 1px 2px ${cssVar('highlightColor')}, 0px 2px 12px ${cssVar(
    'highlightColor'
  )}`,
});

const contentHeaderWrapper = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const contentHeaderText = css(p13Medium, {
  ...setCssVar('currentTextColor', grey500.rgb),
});

const closeIconWrapper = css({
  ...setCssVar('currentTextColor', grey600.rgb),
  width: '16px',
  height: '16px',
});

const iconsWrapper = css({
  paddingTop: '12px',
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  gap: '6px',
});

type EditorIconPopoverProps = {
  readonly initialIcon?: string;
  readonly initialColor?: string;
  readonly onChangeIcon?: (newIcon: string) => void;
  readonly onChangeColor?: (newColor: string) => void;
};

export const EditorIconPopover = ({
  initialIcon = 'Rocket',
  initialColor = 'Catskill',
  onChangeIcon = noop,
  onChangeColor = noop,
}: EditorIconPopoverProps): ReturnType<FC> => {
  const [icon, setIcon] = useState(initialIcon);
  const [iconColor, setIconColor] = useState(baseSwatches[initialColor]);

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button css={[iconWrapper, { backgroundColor: iconColor.rgb }]}>
          <div css={iconSize}>
            {iconChoices.find(({ name }) => name === icon)?.icon}
          </div>
        </button>
      </Popover.Trigger>
      <Popover.Content css={contentWrapper}>
        <div css={contentHeaderWrapper}>
          <h2 css={contentHeaderText}>Pick a style</h2>
          <Popover.Close css={closeIconWrapper}>
            <Close />
          </Popover.Close>
        </div>
        <div css={{ padding: '12px 0' }}>
          <Divider />
        </div>
        <div
          css={{
            display: 'flex',
            gap: '8px',
          }}
        >
          {swatchNames.map((key) => {
            const color = baseSwatches[key];
            return (
              <button
                key={key}
                aria-label={key}
                onClick={() => {
                  setIconColor(color);
                  onChangeColor(key);
                }}
              >
                <ColorPicker color={color} selected={iconColor === color} />
              </button>
            );
          })}
        </div>
        <div css={iconsWrapper}>
          {iconChoices.map((choice) => (
            <NotebookIconButton
              key={choice.name}
              ariaLabel={choice.name}
              onClick={() => {
                setIcon(choice.name);
                onChangeIcon(choice.name);
              }}
            >
              {choice.icon}
            </NotebookIconButton>
          ))}
        </div>
      </Popover.Content>
    </Popover.Root>
  );
};
