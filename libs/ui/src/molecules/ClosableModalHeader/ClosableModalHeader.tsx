import { css } from '@emotion/react';
import { Close } from '../../icons';
import { p15Medium } from '../../primitives';
import { Anchor } from '../../utils';
import { closeButtonStyles } from '../../styles/buttons';

const styles = css({
  display: 'grid',
  rowGap: '12px',
});

const titleRowStyles = css({
  display: 'flex',
  flexWrap: 'wrap-reverse',
  marginBottom: '12px',
});

const titleStyles = css(p15Medium, { flexGrow: 1 });

interface ClosableModalHeaderProps {
  readonly Heading: 'h1' | 'h2';
  readonly title: string;
  readonly closeAction: string | (() => void);
}

export const ClosableModalHeader = ({
  Heading,
  title,
  closeAction,
}: ClosableModalHeaderProps): ReturnType<React.FC> => {
  return (
    <div css={styles}>
      <div css={titleRowStyles}>
        <Heading css={titleStyles}>{title}</Heading>
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
