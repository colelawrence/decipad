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
  backdropFilter: 'blur(3px) brightness(75%)',
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
  readonly fadeOut?: boolean;
  readonly testId?: string;
} & ComponentProps<typeof Overlay>;

export const Modal = ({
  children,
  testId,
  ...props
}: ModalProps): ReturnType<React.FC> => {
  const animatedDialog = css(animationsDialog(props.fadeOut), dialogStyles);
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
