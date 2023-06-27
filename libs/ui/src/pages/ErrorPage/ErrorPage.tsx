import { css } from '@emotion/react';
import { FC } from 'react';
import { Button } from '../../atoms';
import { gridTile } from '../../images';
import {
  banner,
  cssVar,
  largestDesktop,
  p18Regular,
  smallestMobile,
} from '../../primitives';
import { viewportClampCalc } from '../../utils';

const styles = css({
  padding: viewportClampCalc(smallestMobile, 16, largestDesktop, 66, 'px'),

  display: 'grid',
  placeContent: 'center',
  justifyItems: 'center',
  textAlign: 'center',

  position: 'absolute',
  zIndex: 1000,
  minWidth: '100%',
  minHeight: '100vh',
  left: 0,
  right: 0,
  top: 0,

  background: `
    radial-gradient(
      ellipse at center,
      ${cssVar('backgroundColor')} 0%,
      transparent 100%
    ),
    center repeat url(${gridTile}),
    linear-gradient(
      180deg, ${cssVar('backgroundColor')} 30.41%, ${cssVar(
    'errorPageGradientEnd'
  )} 90.69%
    )
  `,
});

const headingStyles = css(banner);
const subHeadingStyles = css(p18Regular, { paddingTop: '20px' });
const buttonStyles = css({ paddingTop: '36px', display: 'flex', gap: '12px' });

const message = (errorCode: ErrorPageProps['wellKnown']): string => {
  switch (errorCode) {
    case '403':
      return "You don't have permissions to access this page";
    case '404':
      return 'The requested URL was not found';
    default:
      return 'Sorry, we did something wrong';
  }
};

interface ErrorPageProps {
  readonly Heading: 'h1';
  readonly messages?: string[];
  readonly wellKnown?: '403' | '404' | '500' | '508';
  readonly authenticated?: boolean;
  readonly backUrl?: string;
  readonly backCall?: string;
  readonly retry?: () => void;
}

export const ErrorPage = ({
  Heading,
  wellKnown,
  messages = [],
  authenticated = false,
  backUrl,
  backCall,
  retry,
}: ErrorPageProps): ReturnType<FC> => {
  return (
    <main css={styles}>
      {messages.length ? (
        <>
          <Heading css={headingStyles}>{messages[0]}</Heading>
          {messages.slice(1).map((m) => (
            <p css={subHeadingStyles}>{m}</p>
          ))}
        </>
      ) : (
        <>
          <Heading css={headingStyles}>{message(wellKnown)}</Heading>
          {wellKnown === '403' ? (
            <>
              <p css={subHeadingStyles}>Contact the owner for access</p>
            </>
          ) : wellKnown === '404' ? (
            <>
              <p css={subHeadingStyles}>
                The link you tried may be broken, or the page may have been
                removed
              </p>
            </>
          ) : wellKnown === '508' ? (
            <>
              <p css={subHeadingStyles}>
                We had an issue problem with our notebook and couldn't
                automatically recover from that error.
              </p>
              <p css={subHeadingStyles}>
                You can retry, refresh this page, or contact support.
              </p>
            </>
          ) : (
            <>
              <p css={subHeadingStyles}>
                Decipad isn't accessible right now. We're probably fixing this
                right now
              </p>
            </>
          )}
        </>
      )}
      <div css={buttonStyles} data-testid="errorPageBacklink">
        {authenticated && retry ? (
          <Button
            type="primaryBrand"
            size="extraLarge"
            onClick={() => {
              retry();
              window.location.reload();
            }}
          >
            Retry
          </Button>
        ) : (
          <Button
            type="primaryBrand"
            size="extraLarge"
            href={backUrl || (authenticated ? '/' : 'https://decipad.com')}
          >
            {backCall ||
              (authenticated ? 'Back to workspace' : 'Back to our website')}
          </Button>
        )}
        <Button
          type="secondary"
          size="extraLarge"
          href={'mailto:support@decipad.com'}
        >
          Contact support
        </Button>
      </div>
    </main>
  );
};
