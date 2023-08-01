/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { Button } from '../../atoms';
import { Modal } from '../../molecules';
import { p15Regular, p20Medium } from '../../primitives';

const headingStyles = css(p20Medium);
const paragraphStyles = css(p15Regular);

interface ErrorModalProps {
  readonly Heading: 'h1';
  readonly wellKnown: '404';
}

/**
 * Like ErrorPage, but in modal form so that we can display it over other pages,
 * at least for logged in users.
 */
export const ErrorModal = ({
  Heading,
}: ErrorModalProps): ReturnType<React.FC> => {
  return (
    <Modal>
      <div css={{ display: 'grid', rowGap: '24px' }}>
        <main css={{ display: 'grid', rowGap: '8px' }}>
          <Heading css={headingStyles}>Something went wrong</Heading>
          <p css={paragraphStyles}>
            The link you tried may be broken, or the page may have been removed.
          </p>
          <p css={paragraphStyles}>(The geeks call this a 404 error)</p>
        </main>
        <footer css={{ justifySelf: 'end' }}>
          <Button href="/">Back to workspace</Button>
        </footer>
      </div>
    </Modal>
  );
};
