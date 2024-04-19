import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import {
  cssVar,
  normalShadow,
  tabletScreenQuery,
} from 'libs/ui/src/primitives';
import { deciOverflowYStyles } from 'libs/ui/src/styles/scrollbars';

type AnnotationProps = {
  collapsed: boolean;
  offset: number;
  scroll: number;
};

export const Annotation = styled(motion.div)<AnnotationProps>(
  ({ collapsed, offset, scroll }) => [
    {
      top: offset + 16,
      zIndex: collapsed ? 0 : 1,
      position: 'absolute',
      width: '100%',
      maxWidth: 320,
      right: '0',
      left: '0',
      backgroundColor: cssVar('backgroundMain'),
      border: `1px solid ${cssVar('borderDefault')}`,
      boxShadow: normalShadow,
      borderRadius: '12px',
      padding: '16px 16px 12px',
      paddingTop: collapsed ? '12px' : '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxHeight: `calc(100vh - ${offset}px + ${scroll}px - 96px)`,
      overflowX: 'hidden',

      [tabletScreenQuery]: {
        position: 'absolute',
        right: 24,
        left: 'auto',
        top: offset + 80,
      },
    },
    deciOverflowYStyles,
  ]
);
