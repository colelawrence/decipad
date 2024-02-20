import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { cssVar, offBlack, p14Medium, transparency } from '../../../primitives';
import { deciOverflowYStyles } from 'libs/ui/src/styles/scrollbars';

export const ModalOverlay = styled(motion.div)({
  backgroundColor: transparency(offBlack, 0.4).rgba,
  position: 'fixed',
  inset: 0,
  zIndex: 199,
});

export const sizes = {
  sm: 360,
  md: 480,
  lg: 640,
  xl: 800,
};

type ModalWrapperProps = {
  size: keyof typeof sizes;
};

export const ModalWrapper = styled(motion.div)<ModalWrapperProps>((props) => [
  {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90vw',
    maxWidth: sizes[props.size],
    maxHeight: '80vh',
    zIndex: 199,
  },
]);

export const ModalContainer = styled(motion.div)({
  backgroundColor: cssVar('backgroundMain'),
  border: `1px solid ${cssVar('borderSubdued')}`,
  borderRadius: 24,
  height: '100%',
  maxHeight: 'inherit',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  padding: 24,
  boxShadow: `0px 2px 8px ${transparency(offBlack, 0.08).rgba}, 0px 4px 16px ${
    transparency(offBlack, 0.08).rgba
  }`,
  '&:focus': { outline: 'none' },
});

export const ModalContent = styled(motion.div)(
  {
    height: '100%',
  },
  deciOverflowYStyles
);

export const ModalHeader = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
});

export const ModalTitle = styled.h2(p14Medium, {
  color: cssVar('textHeavy'),
});

export const ModalCloseButton = styled.button({
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  height: 16,
  width: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  '& > svg': {
    width: 16,
    height: 16,
  },

  '&:hover': {
    backgroundColor: cssVar('backgroundSubdued'),
  },
});
