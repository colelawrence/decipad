import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { Button, InputField } from '../../atoms';
import { h1, p12Medium, p16Regular, cssVar, setCssVar } from '../../primitives';
import { AccountSetup } from '../../templates';
import model2 from './model2.png';
import { backgroundStyles } from './styles';

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
  setCssVar('currentTextColor', cssVar('weakerTextColor')),
  {
    flexGrow: 3,
    display: 'flex',
    justifyContent: 'end',
  }
);

const rightStyles = css({
  height: '100%',
  width: '100%',
  background: `no-repeat bottom right/80% url('${model2}')`,
});

interface AccountSetupFlow2Props {
  name?: string;
  username?: string;
  onChangeName?: (newName: string) => void;
  onChangeUsername?: (newUsername: string) => void;
  next?: () => void;
  previous?: () => void;
}

export const AccountSetupFlow2 = ({
  name = '',
  username = '',
  onChangeName = noop,
  onChangeUsername = noop,
  next = noop,
  previous = noop,
}: AccountSetupFlow2Props) => {
  return (
    <div css={backgroundStyles}>
      <AccountSetup
        left={
          <div css={leftStyles}>
            <div css={groupStyles}>
              <h2 css={h1}>Create a new Profile</h2>
              <p css={p16Regular}>
                This is the info people will see on your public and shared
                notebooks. At Decipad we focus on modelling, publishing, and
                also networking. So please tell us about yourself in a few
                sentences
              </p>
            </div>
            <div css={groupStyles}>
              <label css={inputStyles}>
                <span>To start, what's your name?</span>
                <InputField
                  onChange={onChangeName}
                  value={name}
                  placeholder="Enter your full name"
                />
              </label>
              <label css={inputStyles}>
                <span>Reserve your username</span>
                <InputField
                  onChange={onChangeUsername}
                  value={username}
                  placeholder="@username"
                />
              </label>
            </div>
            <div css={bottomStyles}>
              <Button type="primaryBrand" onClick={next}>
                Continue
              </Button>
              <Button type="secondary" onClick={previous}>
                Back
              </Button>
              <span css={stepStyles}>01 of 02</span>
            </div>
          </div>
        }
        right={<div css={rightStyles}></div>}
      />
    </div>
  );
};
