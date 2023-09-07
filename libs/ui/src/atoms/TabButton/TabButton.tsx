/* eslint decipad/css-prop-named-variable: 0 */
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC } from 'react';
import { cssVar, p13Medium } from '../../primitives';
import { Anchor, TextChildren } from '../../utils';
import { useEventNoEffect } from '../../utils/useEventNoEffect';

type TabButtonProps = {
  readonly text?: TextChildren;
  readonly href?: string;
  readonly disabled?: boolean;
  readonly onClick?: () => void;
  readonly isSelected?: boolean;
  readonly testId?: string;
};

// eslint-disable-next-line complexity
export const TabButton = ({
  text,
  href,
  onClick,
  isSelected = false,
  disabled = false,
  testId = '',
}: TabButtonProps): ReturnType<FC> => {
  const onButtonClick = useEventNoEffect(disabled ? noop : onClick);

  const textElement = (
    <span
      data-testid={`tab-button:${text}`}
      css={[
        buttonTextStyles(isSelected),
        disabled && { color: cssVar('textDisabled') },
      ]}
    >
      {text}
    </span>
  );

  const buttonStyles = css([styles(isSelected), { cursor: 'pointer' }]);
  return (
    <div css={wrapperStyles} contentEditable={false}>
      {onClick ? (
        <button data-testid={testId} css={buttonStyles} onClick={onButtonClick}>
          {textElement}
        </button>
      ) : (
        <Anchor
          data-testid={testId}
          href={disabled ? '' : href}
          css={buttonStyles}
        >
          {textElement}
        </Anchor>
      )}
    </div>
  );
};

const wrapperStyles = {
  display: 'flex',
  flex: 1,
  height: '100%',
  gridRow: 1,
};

const styles = (isSelected: boolean) =>
  css([
    {
      borderRadius: '6px',
      border: `1px solid ${cssVar('borderDefault')}`,
      display: 'flex',
      justifyContent: 'center',
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      padding: '4px',
      height: 28,
    },
    isSelected && {
      backgroundColor: cssVar('backgroundHeavy'),
    },
  ]);

const buttonTextStyles = (isSelected: boolean) =>
  css(p13Medium, [
    {
      color: cssVar('textSubdued'),
      whiteSpace: 'nowrap',
      paddingTop: '1px',
      ':hover': {
        color: cssVar('textHeavy'),
      },
    },
    isSelected && {
      color: cssVar('textHeavy'),
    },
  ]);
