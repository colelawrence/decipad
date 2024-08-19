import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import {
  cssVar,
  p13Regular,
  p14Medium,
  p14Regular,
} from 'libs/ui/src/primitives';

export const AnnotationWrapper = styled(motion.div)({
  width: '100%',
  maxWidth: 320,
  display: 'grid',
  gridTemplateColumns: '20px auto',
  gridTemplateAreas: '"avatar header" "void content"',
  alignItems: 'center',
  gap: '4px 8px',
});

export const Avatar = styled.div({
  gridArea: 'avatar',
  width: 20,
  height: 20,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  backgroundColor: '#fff',
});

export const Header = styled.div({
  gridArea: 'header',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const Meta = styled.div({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: 4,
});

export const HeaderWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  paddingBottom: 2,
});

export const Username = styled.span(p14Medium, {
  color: cssVar('textDefault'),
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '160px',
});

export const Subtitle = styled.span(p13Regular, {
  color: cssVar('textSubdued'),
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const Date = styled.span(p13Regular, {
  color: cssVar('textSubdued'),
  whiteSpace: 'nowrap',
});

export const Content = styled.div(p14Regular, {
  gridArea: 'content',
  // break text to new line
  wordBreak: 'break-word',
  overflowWrap: 'break-word',
});

export const MenuButton = styled.button({
  height: 20,
  width: 20,
  padding: 2,
  borderRadius: 4,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: cssVar('textSubdued'),

  '&:hover': {
    backgroundColor: cssVar('backgroundDefault'),
    color: cssVar('textDefault'),
  },

  '& > svg': {
    height: '100%',
    width: '100%',
  },
});
