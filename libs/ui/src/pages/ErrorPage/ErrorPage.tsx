import { css } from '@emotion/react';
import { FC } from 'react';
import { Button } from '../../atoms';
import { gridTile } from '../../images';
import {
  banner,
  cssVar,
  largestDesktop,
  lavender000,
  offBlack,
  p16Regular,
  p18Regular,
  setCssVar,
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
  minHeight: '100%',
  left: 0,
  right: 0,
  top: 0,

  background: `
    radial-gradient(
      ellipse at center,
      ${cssVar('tintedBackgroundColor')} 0%,
      transparent 100%
    ),
    center repeat url(${gridTile}),
    linear-gradient(
      180deg, ${cssVar('tintedBackgroundColor')} 30.41%, ${cssVar(
    'bubbleBackground'
  )} 90.69%
    )
  `,
});

const headingStyles = css(banner, setCssVar('currentTextColor', offBlack.rgb));
const subHeadingStyles = css(
  p18Regular,
  setCssVar('currentTextColor', lavender000.rgb),
  { paddingTop: '20px' }
);
const errorCodeStyles = css(
  p16Regular,
  setCssVar('currentTextColor', cssVar('weakerTextColor')),
  { paddingTop: '8px' }
);
const buttonStyles = css({ paddingTop: '36px' });

const message = (errorCode: ErrorPageProps['wellKnown']): string => {
  switch (errorCode) {
    case '403':
      return 'Forbidden';
    case '404':
      return 'Not found';
    default:
      return 'Sorry, we did something wrong';
  }
};

interface ErrorPageProps {
  readonly Heading: 'h1';
  readonly messages?: string[];
  readonly wellKnown?: '403' | '404' | '500';
  readonly authenticated?: boolean;
  readonly backUrl?: string;
  readonly backCall?: string;
}

export const ErrorPage = ({
  Heading,
  wellKnown,
  messages = [],
  authenticated = false,
  backUrl,
  backCall,
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
              <p css={subHeadingStyles}>
                You don't have permissions to access this page.
              </p>
              <p css={errorCodeStyles}>The geeks call this a 403 error</p>
            </>
          ) : wellKnown === '404' ? (
            <>
              <p css={subHeadingStyles}>
                The link you tried may be broken, or the page may have been
                removed
              </p>
              <p css={errorCodeStyles}>The geeks call this a 404 error</p>
            </>
          ) : (
            <>
              <p css={subHeadingStyles}>
                Decipad isn't accessible right now. We're probably fixing this
                right now
              </p>
              {wellKnown === '500' && (
                <p css={errorCodeStyles}>The geeks call this a 500 error</p>
              )}
            </>
          )}
        </>
      )}
      <div css={buttonStyles}>
        <Button
          type="primaryBrand"
          size="extraLarge"
          href={backUrl || (authenticated ? '/' : 'https://decipad.com')}
        >
          {backCall ||
            (authenticated ? 'Back to workspace' : 'Back to our website')}
        </Button>
      </div>
    </main>
  );
};
