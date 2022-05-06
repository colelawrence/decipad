import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import * as Popover from '@radix-ui/react-popover';
import React, { FC } from 'react';
import { ColorPicker, Divider, NotebookIconButton } from '../../atoms';
import * as icons from '../../icons';
import { Close } from '../../icons';
import {
  cssVar,
  grey500,
  grey600,
  p13Medium,
  setCssVar,
} from '../../primitives';
import {
  AvailableSwatchColor,
  baseSwatches,
  swatchNames,
  UserIconKey,
  userIconKeys,
} from '../../utils';

const contentWrapper = css({
  marginTop: '6px',
  backgroundColor: cssVar('backgroundColor'),
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

type IconPopoverProps = {
  readonly color: AvailableSwatchColor;
  readonly trigger: JSX.Element;
  readonly onChangeIcon?: (newIcon: UserIconKey) => void;
  readonly onChangeColor?: (newColor: AvailableSwatchColor) => void;
};

export const IconPopover = ({
  color,
  trigger,
  onChangeIcon = noop,
  onChangeColor = noop,
}: IconPopoverProps): ReturnType<FC> => {
  const triggerWithCursey = React.cloneElement(trigger, {
    style: { cursor: 'pointer' },
  });

  return (
    <Popover.Root>
      <Popover.Trigger asChild>{triggerWithCursey}</Popover.Trigger>
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
            return (
              <button
                key={key}
                aria-label={key}
                onClick={() => {
                  onChangeColor(key);
                }}
              >
                <ColorPicker
                  color={baseSwatches[key]}
                  selected={key === color}
                />
              </button>
            );
          })}
        </div>
        <div css={iconsWrapper}>
          {userIconKeys.map((choice) => {
            const Icon = icons[choice];
            return (
              <Popover.Close key={choice} aria-label={choice}>
                <NotebookIconButton
                  color={baseSwatches[color]}
                  onClick={() => {
                    onChangeIcon(choice);
                  }}
                >
                  <Icon />
                </NotebookIconButton>
              </Popover.Close>
            );
          })}
        </div>
      </Popover.Content>
    </Popover.Root>
  );
};
