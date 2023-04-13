import { css } from '@emotion/react';
import { ComponentProps, ReactNode } from 'react';
import { Overlay } from '../../atoms';
import { cssVar, grey700, offBlack, transparency } from '../../primitives';

const pageCoverStyles = css({
  position: 'fixed',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,

  display: 'grid',
  gridTemplate: '100% / 100%',
  overflow: 'hidden',
});

const overlayStyles = css({
  gridArea: '1 / 1',
  display: 'grid',
});

const dialogStyles = css({
  gridArea: '1 / 1',
  justifySelf: 'center',
  alignSelf: 'center',
  maxWidth: 'min(100% - 24px, 480px)',
  maxHeight: '75%',
  overflowY: 'auto',

  padding: '24px',
  backgroundColor: cssVar('backgroundColor'),
  border: `1px solid ${cssVar('borderColor')}`,
  borderRadius: '24px',
  width: '480px',
  boxShadow: `
    0px 2px 20px ${transparency(grey700, 0.04).rgba},
    0px 2px 8px ${transparency(offBlack, 0.02).rgba}
  `,
});

type ModalProps = {
  readonly children: ReactNode;
} & ComponentProps<typeof Overlay>;

export const Modal = ({
  children,
  ...props
}: ModalProps): ReturnType<React.FC> => {
  return (
    <div css={pageCoverStyles}>
      <div css={overlayStyles}>
        <Overlay {...props} />
      </div>
      <div role="dialog" css={dialogStyles}>
        {children}
      </div>
    </div>
  );
};
