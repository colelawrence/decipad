import { css } from '@emotion/react';
import { ComponentProps, ReactNode } from 'react';
import { Overlay } from '../../atoms';
import {
  cssVar,
  grey700,
  offBlack,
  smallestMobile,
  transparency,
} from '../../primitives';
import { deciOverflowYStyles } from '../../styles/scrollbars';

const pageCoverStyles = css({
  zIndex: 666,
  position: 'fixed',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  display: 'grid',
  gridTemplate: '100% / 100%',
  overflow: 'hidden',
  backdropFilter: 'brightness(50%)',
});

const overlayStyles = css({
  gridArea: '1 / 1',
  display: 'grid',
});

const animationsDialog = (fadeOut?: boolean) =>
  css({
    '@keyframes fadeInDown': {
      from: {
        opacity: 0,
        transform: 'translate3d(0, -100%, 0)',
      },

      '50%': {
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
      },
    },

    '@keyframes fadeOutUp': {
      from: {
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
      },
      to: {
        opacity: 0,
        transform: 'translate3d(0, -100%, 0)',
      },
    },

    animationName: fadeOut ? 'fadeOutUp' : 'fadeInDown',
    animationDuration: '0.3s',
    animationFillMode: 'both',
  });

const animationsOverlay = (fadeOut?: boolean) =>
  css({
    '@keyframes fadeIn': {
      from: {
        opacity: 0,
      },
      to: {
        opacity: 1,
      },
    },

    '@keyframes fadeOut': {
      from: {
        opacity: 1,
      },
      to: {
        opacity: 0,
      },
    },

    animationName: fadeOut ? 'fadeOut' : 'fadeIn',
    animationDuration: '0.3s',
    animationFillMode: 'both',
  });

export const modalDialogStyles = css(
  {
    gridArea: '1 / 1',
    justifySelf: 'center',
    alignSelf: 'center',
    padding: '24px',
    backgroundColor: cssVar('backgroundColor'),
    border: `1px solid ${cssVar('borderColor')}`,
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
  readonly fadeOut?: boolean;
  readonly testId?: string;
} & ComponentProps<typeof Overlay>;

export const Modal = ({
  children,
  testId,
  ...props
}: ModalProps): ReturnType<React.FC> => {
  const animatedDialog = css(
    animationsDialog(props.fadeOut),
    modalDialogStyles
  );
  const animatedOverlay = css(animationsOverlay(props.fadeOut), overlayStyles);

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
