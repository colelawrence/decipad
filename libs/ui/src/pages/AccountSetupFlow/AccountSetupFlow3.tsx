import { docs } from '@decipad/routing';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import md5 from 'md5';
import Gravatar from 'react-gravatar';
import { isEmpty } from 'lodash';
import { Button, TextareaField } from '../../atoms';
import {
  h1,
  p12Medium,
  p16Regular,
  cssVar,
  setCssVar,
  blue400,
  p10Regular,
  purple300,
  p14Medium,
  p14Regular,
} from '../../primitives';
import { AccountSetup } from '../../templates';
import model3 from './model3.png';
import { Date, Sheet } from '../../icons';
import { backgroundStyles } from './styles';

const leftStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

const groupStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

const compactGroupStyles = css(groupStyles, {
  gap: '8px',
});

const linkStyles = css({
  textDecoration: 'underline',
});

const blueLinkStyles = css({
  color: blue400.rgb,
});

const avatarStyles = css({
  position: 'relative',

  boxShadow: `0px 2px 16px -4px rgba(0, 0, 0, 0.06)`,
  border: `1px solid ${cssVar('backgroundColor')}`,
  borderRadius: '8px',

  '& + &': {
    marginLeft: '-6px',
  },

  height: '40px',
  width: '40px',

  overflow: 'hidden',

  backgroundColor: purple300.rgb,
  '::before': {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',

    fontSize: '16px',

    content: 'attr(data-letter)',
  },
});

const gravatarStyles = css({
  position: 'absolute',
  zIndex: 2,
});

const inputStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const termsAndPrivacyStyles = css(
  p10Regular,
  setCssVar('currentTextColor', cssVar('weakerTextColor')),
  {}
);

const bottomStyles = css({
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  justifyContent: 'space-between',

  marginTop: '6px',
});

const stepStyles = css(
  p12Medium,
  setCssVar('currentTextColor', cssVar('weakerTextColor')),
  {
    flexGrow: 100,
    display: 'flex',
    justifyContent: 'end',
  }
);

const rightStyles = css({
  position: 'relative',

  height: '100%',
  width: '100%',
  background: `no-repeat bottom right/80% url('${model3}')`,
});

const backCardStyles = css({
  position: 'absolute',
  top: '176px',
  left: '10%',

  border: `1px solid ${cssVar('strongerHighlightColor')}`,
  borderRadius: '16px',
  padding: '16px',
  height: '146px',
  width: '100%',
  maxWidth: '375px',

  display: 'flex',
  flexDirection: 'column',

  background: cssVar('highlightColor'),
});

const nameStyles = css(
  p14Medium,
  setCssVar('currentTextColor', cssVar('strongTextColor'))
);

const usernameStyles = css(
  p14Regular,
  setCssVar('currentTextColor', cssVar('weakTextColor'))
);

const backCardAvatarStyles = css({
  flexGrow: 100,
  display: 'flex',
  alignItems: 'end',
});

const frontCardStyles = css({
  position: 'absolute',
  top: '226px',
  left: '45%',

  border: `1px solid ${cssVar('strongerHighlightColor')}`,
  borderRadius: '16px',
  padding: '16px',
  height: '186px',
  width: '100%',
  maxWidth: '269px',

  display: 'flex',
  flexDirection: 'column',
  gap: '6px',

  background: cssVar('highlightColor'),
});

const descriptionStyles = css(
  p14Regular,
  setCssVar('currentTextColor', cssVar('weakTextColor')),
  {
    border: `1px dashed ${cssVar('weakerTextColor')}`,
    borderRadius: '8px',
    padding: '8px 12px',
    minHeight: '80px',
  }
);

const placeholderStyles = css(
  descriptionStyles,
  setCssVar('currentTextColor', cssVar('weakerTextColor'))
);

const frontCardBottomStyles = css(
  p14Regular,
  setCssVar('currentTextColor', cssVar('normalTextColor')),
  {
    display: 'flex',
    gap: '8px',
  }
);

const iconWrapperStyles = css({
  display: 'flex',
  height: '16px',
  width: '16px',
});

interface AccountSetupFlow2Props {
  email?: string;
  name?: string;
  username?: string;
  description?: string;
  onChangeDescription?: (newDescription: string) => void;
  finish?: () => void;
  previous?: () => void;
}

export const AccountSetupFlow3 = ({
  email = 'decipad@decipad.com',
  name = 'Your Name',
  username = '@username',
  description = '',
  onChangeDescription = noop,
  finish = noop,
  previous = noop,
}: AccountSetupFlow2Props) => {
  const placeholder = 'Share something about yourself';
  const avatar = (
    <div css={avatarStyles} data-letter={email[0].toUpperCase()}>
      <Gravatar
        css={gravatarStyles}
        md5={md5(email, { encoding: 'binary' })}
        default={'blank'}
      />
    </div>
  );
  return (
    <div css={backgroundStyles}>
      <AccountSetup
        left={
          <div css={leftStyles}>
            <div css={groupStyles}>
              <h2 css={h1}>Create a new Profile</h2>
              <p css={p16Regular}>
                Add your account image. If you use{' '}
                <a
                  css={blueLinkStyles}
                  href="https://pt.gravatar.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  gravatar.com
                </a>
                , we'll take your image from there, or you can upload it here
              </p>
              {avatar}
            </div>
            <div css={compactGroupStyles}>
              <label css={inputStyles}>
                <span>Tell us about yourself in a few sentences</span>
                <TextareaField
                  onChange={onChangeDescription}
                  value={description}
                  placeholder={placeholder}
                />
              </label>
              <p css={termsAndPrivacyStyles}>
                By continuing, you agreed to our{' '}
                <a
                  css={linkStyles}
                  href={docs({}).page({ name: 'terms' }).$}
                  target="_blank"
                  rel="noreferrer"
                >
                  Terms of Service
                </a>{' '}
                &{' '}
                <a
                  css={linkStyles}
                  href={docs({}).page({ name: 'privacy' }).$}
                  target="_blank"
                  rel="noreferrer"
                >
                  Privacy policy
                </a>
              </p>
            </div>
            <div css={bottomStyles}>
              <Button type="primaryBrand" onClick={finish}>
                Create Profile
              </Button>
              <Button type="secondary" onClick={previous}>
                Back
              </Button>
              <span css={stepStyles}>02 of 02</span>
            </div>
          </div>
        }
        right={
          <div css={rightStyles}>
            <div css={backCardStyles}>
              <p css={nameStyles}>Data story by: {name}</p>
              <p css={usernameStyles}>{username}</p>
              <div css={backCardAvatarStyles}>{avatar}</div>
            </div>
            <div css={frontCardStyles}>
              <p css={nameStyles}>About author</p>
              <div
                css={
                  isEmpty(description) ? placeholderStyles : descriptionStyles
                }
              >
                {isEmpty(description) ? placeholder : description}
              </div>
              <div css={frontCardBottomStyles}>
                <span css={iconWrapperStyles}>
                  <Sheet />
                </span>{' '}
                Your published notebooks
              </div>
              <div css={frontCardBottomStyles}>
                <span css={iconWrapperStyles}>
                  <Date />
                </span>{' '}
                Member since today 🎉
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
};
