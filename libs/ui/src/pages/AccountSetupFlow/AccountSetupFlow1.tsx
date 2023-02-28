import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { useThemeFromStore } from '@decipad/react-contexts';
import { Button } from '../../atoms';
import { Deci } from '../../icons';
import { h1, p14Medium, p16Regular } from '../../primitives';
import { AccountSetup } from '../../templates';
import { backgroundStyles } from './styles';
import { useEnterListener } from './useEnterListener';
import calculationImgLight from './onboarding1-light.svg';
import calculationImgDark from './onboarding1-dark.svg';

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
  marginBottom: '24px',
  verticalAlign: 'sub',
});

const imageContainer = css({
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  height: '100%',
});

interface AccountSetupFlow1Props {
  next?: () => void;
}

export const AccountSetupFlow1 = ({ next = noop }: AccountSetupFlow1Props) => {
  useEnterListener(next);

  const [isDarkMode] = useThemeFromStore();

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
              <Button type="primaryBrand" onClick={next}>
                Get started
              </Button>
            </div>
          </div>
        }
        right={
          <div css={imageContainer}>
            <img
              src={isDarkMode ? calculationImgDark : calculationImgLight}
              alt="Notebook illustration"
            />
          </div>
        }
      />
    </div>
  );
};
