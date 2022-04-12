import { css } from '@emotion/react';
import { FC } from 'react';
import { Button } from '../../atoms';
import { gridTile } from '../../images';
import {
  banner,
  black,
  grey200,
  grey400,
  grey50,
  largestDesktop,
  lavender000,
  p16Regular,
  p18Regular,
  setCssVar,
  smallestMobile,
} from '../../primitives';
import { viewportClampCalc } from '../../utils';

const styles = css({
  height: '100%',
  padding: viewportClampCalc(smallestMobile, 16, largestDesktop, 66, 'px'),

  display: 'grid',
  placeContent: 'center',
  justifyItems: 'center',
  textAlign: 'center',

  background: `
    radial-gradient(
      ellipse at center,
      ${grey50.rgb} 0%,
      transparent 100%
    ),
    center repeat url(${gridTile}),
    linear-gradient(
      180deg, ${grey50.rgb} 30.41%, ${grey200.rgb} 90.69%
    )
  `,
});

// TODO no dark mode on this page atm
const headingStyles = css(banner, setCssVar('currentTextColor', black.rgb));
const subHeadingStyles = css(
  p18Regular,
  setCssVar('currentTextColor', lavender000.rgb),
  { paddingTop: '20px' }
);
const errorCodeStyles = css(
  p16Regular,
  setCssVar('currentTextColor', grey400.rgb),
  { paddingTop: '8px' }
);
const buttonStyles = css({ paddingTop: '36px' });

interface ErrorPageProps {
  readonly Heading: 'h1';
  readonly wellKnown?: '404' | '500';
  readonly authenticated?: boolean;
}

export const ErrorPage = ({
  Heading,
  wellKnown,
  authenticated = false,
}: ErrorPageProps): ReturnType<FC> => {
  return (
    <main css={styles}>
      <Heading css={headingStyles}>
        {wellKnown === '404'
          ? 'Something went wrong'
          : 'Sorry, we did something wrong'}
      </Heading>
      {wellKnown === '404' && (
        <p css={subHeadingStyles}>
          The link you tried may be broken, or the page may have been removed
        </p>
      )}
      {wellKnown === '500' && (
        <p css={subHeadingStyles}>
          Decipad isn't accessible right now. We're probably fixing this right
          now
        </p>
      )}
      {wellKnown && (
        <p css={errorCodeStyles}>The geeks call this a {wellKnown} error</p>
      )}
      <div css={buttonStyles}>
        <Button
          type="primaryBrand"
          size="extraLarge"
          href={authenticated ? '/' : 'https://decipad.com'}
        >
          {authenticated ? 'Back to workspace' : 'Back to our website'}
        </Button>
      </div>
    </main>
  );
};
