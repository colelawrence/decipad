import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { cssVar, p13Medium } from 'libs/ui/src/primitives';

export const Wrapper = styled(motion.header)({
  alignItems: 'center',
  display: 'grid',
  gridTemplateColumns: 'min-content auto 20px',
  gap: 8,
  cursor: 'pointer',
  // don't ask me why, this is hacky, but i'll fix it
  margin: '-12px',
  padding: '12px',
});

export const AvatarStack = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  flex: 1,
});

export const Avatar = styled.div({
  width: 20,
  height: 20,
  ':not(:first-child)': {
    marginLeft: -12,
  },
});

export const CommentCount = styled.span(p13Medium, {
  color: cssVar('textHeavy'),
});

export const Caret = styled.div({
  width: 20,
  height: 20,
  flexShrink: 0,
  color: cssVar('textSubdued'),
  borderRadius: 4,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  svg: {
    width: 16,
    height: 16,
  },
});
