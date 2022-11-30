import { css } from '@emotion/react';
import { Divider } from '../../atoms';
import { Close } from '../../icons';
import { p15Medium } from '../../primitives';
import { Anchor } from '../../utils';

const styles = css({
  display: 'grid',
  rowGap: '12px',
});

const titleRowStyles = css({
  display: 'flex',
  flexWrap: 'wrap-reverse',
});
const closeStyles = css({
  width: '16px',
  height: '16px',
  display: 'grid',
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
          <Anchor css={closeStyles} href={closeAction}>
            <Close />
          </Anchor>
        ) : (
          <button css={closeStyles} onClick={closeAction}>
            <Close />
          </button>
        )}
      </div>
      <Divider />
    </div>
  );
};
