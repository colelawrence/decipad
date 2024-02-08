import { css } from '@emotion/react';
import { ComponentProps, ReactNode } from 'react';
import { Overlay } from '../../atoms';
import {
  cssVar,
  grey700,
  offBlack,
  smallestMobile,
  transparency,
} from '../../../primitives';
import { deciOverflowYStyles } from '../../../styles/scrollbars';

const pageCoverStyles = css({
  position: 'fixed',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  display: 'grid',
  gridTemplate: '100% / 100%',
  overflow: 'hidden',
  backdropFilter: 'brightness(50%)',
  zIndex: '200',
});

const overlayStyles = css({
  gridArea: '1 / 1',
  display: 'grid',
});

export const modalDialogStyles = css(
  {
    gridArea: '1 / 1',
    justifySelf: 'center',
    alignSelf: 'center',
    padding: '24px',
    backgroundColor: cssVar('backgroundMain'),
    border: `1px solid ${cssVar('borderSubdued')}`,
    maxHeight: '75vh',
    minWidth: smallestMobile.portrait.width,
    maxWidth: '100vw',
    borderRadius: '24px',
    boxShadow: `
    0px 2px 20px ${transparency(grey700, 0.04).rgba},
    0px 2px 8px ${transparency(offBlack, 0.02).rgba}
  `,
  },
  deciOverflowYStyles
);

type ModalProps = {
  readonly children: ReactNode;
  readonly testId?: string;
} & ComponentProps<typeof Overlay>;

export const Modal = ({
  children,
  testId,
  ...props
}: ModalProps): ReturnType<React.FC> => {
  const animatedDialog = css(modalDialogStyles);
  const animatedOverlay = css(overlayStyles);

  return (
    <div css={pageCoverStyles} data-testid={testId}>
      <div css={animatedOverlay}>
        <Overlay {...props} />
      </div>
      <div role="dialog" css={animatedDialog}>
        {children}
      </div>
    </div>
  );
};
