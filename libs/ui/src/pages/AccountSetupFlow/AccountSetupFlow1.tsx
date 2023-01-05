import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import md5 from 'md5';
import Gravatar from 'react-gravatar';
import { Button } from '../../atoms';
import { Deci } from '../../icons';
import {
  brand500,
  cssVar,
  h1,
  p10Medium,
  p14Medium,
  p16Regular,
  setCssVar,
} from '../../primitives';
import { AccountSetup } from '../../templates';
import { backgroundStyles } from './styles';

const groupStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',

  marginBottom: '57px',
});

const inlineLogoStyles = css({
  display: 'inline-flex',

  width: '16px',
  height: '16px',

  verticalAlign: 'sub',
});

const avatarStackStyles = css({
  display: 'flex',

  marginBottom: '24px',
});

const avatarStyles = css({
  border: `1.5px solid ${brand500.rgb}`,
  borderRadius: '50%',

  '& + &': {
    marginLeft: '-6px',
  },

  height: '28px',
  width: '28px',

  backgroundColor: cssVar('backgroundColor'),
});

const overflowAvatarStyles = css(
  avatarStyles,
  p10Medium,
  setCssVar('currentTextColor', 'strongTextColor'),
  {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    boxShadow: `-2px 0px 0px 0px ${cssVar('backgroundColor')}`,

    borderColor: cssVar('strongHighlightColor'),

    marginLeft: '-6px',
  }
);

const team = ['giulia@n1n.co', 'nuno@n1n.co', 'kelly@n1n.co', 'simao@n1n.co'];

interface AccountSetupFlow1Props {
  next?: () => void;
}

export const AccountSetupFlow1 = ({ next = noop }: AccountSetupFlow1Props) => {
  return (
    <div css={backgroundStyles}>
      <AccountSetup
        left={
          <div>
            <div css={groupStyles}>
              <h2 css={h1}>Welcome to Decipad!</h2>
              <p css={p16Regular}>
                We’re excited to have you join our journey in building anything
                you want using numbers.
              </p>
              <p css={p16Regular}>
                This is the idea that brought our small team together and this
                is just the beginning. We’ll be sharing more with you along the
                way, hope to see you on Discord 👋
              </p>
            </div>
            <div>
              <p css={p14Medium}>
                The Decipad Team{' '}
                <span css={inlineLogoStyles}>
                  <Deci />
                </span>
              </p>
              <div css={avatarStackStyles}>
                {team.map((email, i) => (
                  <Gravatar
                    key={i}
                    css={avatarStyles}
                    md5={md5(email, { encoding: 'binary' })}
                    default={'blank'}
                  />
                ))}
                <div css={overflowAvatarStyles}>+12</div>
              </div>
              <Button type="primaryBrand" onClick={next}>
                Get started
              </Button>
            </div>
          </div>
        }
        right={<span />}
      />
    </div>
  );
};
