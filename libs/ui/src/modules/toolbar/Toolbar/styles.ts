import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { cssVar, p14Medium } from '../../../primitives';

export const ToolbarContainer = styled.div({
  position: 'fixed',
  zIndex: '999',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  bottom: 56,
  padding: '8px',
});

export const ToolbarWrapper = styled(motion.div)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '40px',
  padding: '0 12px',
  borderRadius: 12,
  width: '100%',
  maxWidth: '800px',
  background: cssVar('backgroundMain'),
  border: `1px solid ${cssVar('borderSubdued')}`,
});

export const ToolbarTitle = styled.span(p14Medium, {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  color: cssVar('textHeavy'),
});

export const ToolbarIcon = styled.div({
  display: 'grid',
  height: '20px',
  width: '20px',

  '& > svg': {
    width: '20px',
    height: '20px',

    '& > path': {
      fill: cssVar('textHeavy'),
    },
  },
});

export const Tools = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
});
