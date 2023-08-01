/* eslint decipad/css-prop-named-variable: 0 */
import { useThemeFromStore } from '@decipad/react-contexts';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import * as Popover from '@radix-ui/react-popover';
import { FC, useState } from 'react';
import { ColorPicker, Divider, NotebookIconButton } from '../../atoms';
import * as icons from '../../icons';
import { Close } from '../../icons';
import { cssVar, p13Medium } from '../../primitives';
import { closeButtonStyles } from '../../styles/buttons';
import { deciOverflowXStyles } from '../../styles/scrollbars';
import {
  AvailableSwatchColor,
  UserIconKey,
  swatchNames,
  swatchesThemed,
  userIconKeys,
} from '../../utils';

const contentWrapper = css({
  marginTop: '6px',
  backgroundColor: cssVar('backgroundMain'),
  padding: '12px',
  borderRadius: '8px',
  maxWidth: '272px',
  boxShadow: `0px 1px 2px ${cssVar('backgroundDefault')}, 0px 2px 12px ${cssVar(
    'backgroundDefault'
  )}`,
});

const contentHeaderWrapper = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const contentHeaderText = css(p13Medium, {});

const iconsWrapper = css(
  {
    height: 175,
    paddingTop: '12px',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: '6px',
    flexDirection: 'column',
  },
  deciOverflowXStyles
);

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
  const [darkTheme] = useThemeFromStore();
  const baseSwatches = swatchesThemed(darkTheme);
  const [open, setOpen] = useState(false);
  return (
    <Popover.Root onOpenChange={setOpen}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      {open && (
        <Popover.Content css={contentWrapper}>
          <div css={contentHeaderWrapper}>
            <h2 css={contentHeaderText}>Pick a style</h2>
            <Popover.Close css={closeButtonStyles}>
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
              justifyContent: 'space-between',
            }}
          >
            {swatchNames.map((key) => {
              return (
                <button
                  key={key}
                  aria-label={key}
                  data-testid={`icon-color-picker-${key}`}
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
                <Popover.Close
                  key={choice}
                  aria-label={choice}
                  data-testid={`icon-picker-${choice}`}
                >
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
      )}
    </Popover.Root>
  );
};
