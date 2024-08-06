import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { cssVar } from 'libs/ui/src/primitives';

export const BlockWrapper = styled.div({
  position: 'relative',

  '&::before': {
    content: '""',
    position: 'absolute',
    width: 32,
    height: '100%',
    right: -36,
  },
});

export const ButtonsWrapper = styled.div({
  position: 'absolute',
  display: 'flex',
  gap: '2px',
  top: 4,
  right: -8,
  transform: 'translateX(100%)',
});

export const Button = styled(motion.button)({
  display: 'block',
  height: 20,
  width: 20,
  opacity: 0,
  color: cssVar('textSubdued'),

  '&:hover, &:focus': {
    color: cssVar('textDefault'),
  },

  '&:active': {
    color: cssVar('textHeavy'),
  },
});
