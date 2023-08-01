/* eslint decipad/css-prop-named-variable: 0 */
import { useThemeFromStore } from '@decipad/react-contexts';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FormEvent, useCallback } from 'react';
import { Button, InputField } from '../../atoms';
import { h1, p12Medium, p16Regular } from '../../primitives';
import { AccountSetup } from '../../templates';
import modelDark from './model2_dark.png';
import modelLight from './model2_light.png';
import { backgroundStyles } from './styles';
import { Loading } from '../../icons';

const leftStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

const groupStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

const inputStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const bottomStyles = css({
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const stepStyles = css(
  p12Medium,

  {
    flexGrow: 3,
    display: 'flex',
    justifyContent: 'end',
  }
);

const rightBgPosition = 'no-repeat bottom right/80%';
const rightStyles = css({
  height: '100%',
  width: '100%',
  background: `${rightBgPosition} url('${modelLight}')`,
});

const rightDarkBackgroundImage = css({
  background: `${rightBgPosition} url('${modelDark}')`,
});

interface AccountSetupFlow2Props {
  name?: string;
  username?: string;
  isSubmitting?: boolean;
  onChangeName?: (newName: string) => void;
  onChangeUsername?: (newUsername: string) => void;
  next?: () => void;
  previous?: () => void;
}

const LoadingDots = () => (
  <Loading width="16px" style={{ marginRight: '6px' }} />
);

export const AccountSetupFlow2 = ({
  name = '',
  username = '',
  isSubmitting = false,
  onChangeName = noop,
  onChangeUsername = noop,
  next = noop,
  previous = noop,
}: AccountSetupFlow2Props) => {
  const [isDarkMode] = useThemeFromStore();
  const handleSubmit = useCallback(
    (ev: FormEvent) => {
      if (isSubmitting) return;

      ev.preventDefault();
      next();
    },
    [next, isSubmitting]
  );

  return (
    <form css={backgroundStyles} onSubmit={handleSubmit}>
      <AccountSetup
        left={
          <div css={leftStyles}>
            <div css={groupStyles}>
              <h2 css={h1}>Create a profile</h2>
              <p css={p16Regular}>
                At Decipad, you can build models and reports and collaborate
                with your team, colleagues and friends.
              </p>
            </div>
            <div css={groupStyles}>
              <label css={inputStyles}>
                <span>To start, what's your name?</span>
                <InputField
                  autoFocus
                  onChange={onChangeName}
                  value={name}
                  placeholder="Enter your full name"
                />
              </label>
              <label css={inputStyles}>
                <span>Reserve your username</span>
                <InputField
                  tabIndex={0}
                  onChange={onChangeUsername}
                  value={username}
                  placeholder="username"
                />
              </label>
            </div>
            <div css={bottomStyles}>
              <Button submit type="primaryBrand">
                {isSubmitting ? <LoadingDots /> : null}
                Continue
              </Button>
              <Button type="secondary" onClick={previous} tabIndex={3}>
                Back
              </Button>
              <span css={stepStyles}>01 of 02</span>
            </div>
          </div>
        }
        right={
          <div
            css={[rightStyles, isDarkMode && rightDarkBackgroundImage]}
          ></div>
        }
      />
    </form>
  );
};
