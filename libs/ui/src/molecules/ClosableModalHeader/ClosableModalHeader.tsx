/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { Close } from '../../icons';
import { cssVar, p14Medium, p15Medium, p16Medium } from '../../primitives';
import { Anchor } from '../../utils';
import { closeButtonStyles } from '../../styles/buttons';

const styles = css({
  display: 'grid',
  rowGap: '12px',
});

const titleRowStyles = css({
  display: 'flex',
  alignItems: 'flex-end',
  flexWrap: 'wrap-reverse',
  marginBottom: '12px',
});

const titleColumnStyles = css({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  gap: '2px',
});

const largeTitleStyles = css(p16Medium, {
  color: cssVar('textHeavy'),
  flexGrow: 1,
});

const titleStyles = css(p15Medium, { flexGrow: 1 });

const paragraphStyles = css(p14Medium, {
  flexGrow: 1,
  color: cssVar('textSubdued'),
});

interface ClosableModalHeaderProps {
  readonly Heading: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  readonly title: string;
  readonly paragraph?: string;
  readonly closeAction: string | (() => void);
}

export const ClosableModalHeader = ({
  Heading,
  title,
  paragraph,
  closeAction,
}: ClosableModalHeaderProps): ReturnType<React.FC> => {
  return (
    <div css={styles}>
      <div css={titleRowStyles}>
        <div css={titleColumnStyles}>
          <Heading css={paragraph ? largeTitleStyles : titleStyles}>
            {title}
          </Heading>
          {paragraph && <p css={paragraphStyles}>{paragraph}</p>}
        </div>
        {typeof closeAction === 'string' ? (
          <Anchor css={closeButtonStyles} href={closeAction}>
            <Close />
          </Anchor>
        ) : (
          <button
            css={closeButtonStyles}
            onClick={closeAction}
            data-testid="closable-modal"
          >
            <Close />
          </button>
        )}
      </div>
    </div>
  );
};
