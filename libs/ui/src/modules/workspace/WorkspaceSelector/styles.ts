import styled from '@emotion/styled';
import {
  componentCssVars,
  cssVar,
  easingTiming,
  p10Bold,
  p12Medium,
  p14Medium,
} from '../../../primitives';
import { motion } from 'framer-motion';

type SelectorButtonProps = {
  isSelected: boolean;
};

export const SelectorButton = styled(motion.button)<SelectorButtonProps>(
  (props) => [
    {
      display: 'grid',
      gridTemplateColumns: '32px auto 32px',
      gap: 8,
      cursor: 'pointer',
      margin: '-8px',
      padding: '8px',
      borderRadius: 12,
      transition: `background-color 150ms ${easingTiming.easeOut}`,

      '&:hover, &:focus': {
        '& > span:last-child': {
          backgroundColor: cssVar('backgroundHeavy'),
        },
      },
      '&:active': {
        backgroundColor: cssVar('backgroundHeavy'),
      },

      '&:focus-visible': {
        boxShadow: `0 0 0 2px ${cssVar('focusOutline')}`,
      },
    },
    props.isSelected && {
      backgroundColor: cssVar('backgroundHeavy'),
    },
  ]
);

export const Avatar = styled.div({
  width: 32,
  height: 32,
  borderRadius: 8,
  marginRight: 8,
  overflow: 'hidden',
});

export const Profile = styled.div({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  paddingTop: 1,
  gap: 4,
  overflow: 'hidden',
});

export const Name = styled.p(p14Medium, {
  lineHeight: 1,
  margin: 0,
  width: '100%',
  textAlign: 'left',
  color: cssVar('textHeavy'),
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const Description = styled.p(p12Medium, {
  lineHeight: 1,
  margin: 0,
  width: '100%',
  textAlign: 'left',
  color: cssVar('textSubdued'),
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

type BadgeProps = {
  isPremium: boolean;
};

export const Badge = styled.span<BadgeProps>((props) => [
  p10Bold,
  {
    display: 'inline-block',
    padding: '2px 4px',
    borderRadius: 4,
    marginLeft: 4,
    lineHeight: 1,
    textTransform: 'uppercase',
    color: props.isPremium
      ? componentCssVars('ButtonPrimaryDefaultText')
      : cssVar('textDefault'),
    backgroundColor: props.isPremium
      ? componentCssVars('ButtonPrimaryDefaultBackground')
      : cssVar('borderDefault'),
  },
]);

export const ToggleButton = styled.span({
  placeSelf: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer',
  transition: `background-color 150ms ${easingTiming.easeOut}`,

  '& > svg': {
    width: 16,
    height: 16,
  },
});

export const MenuWrapper = styled(motion.div)({
  width: '100%',
  maxWidth: 256,
});
