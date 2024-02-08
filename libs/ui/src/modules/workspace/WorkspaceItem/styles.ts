import styled from '@emotion/styled';
import {
  componentCssVars,
  cssVar,
  easingTiming,
  p10Bold,
  p12Medium,
  p13Medium,
} from '../../../primitives';

type ItemButtonProps = {
  isSelected: boolean;
};

export const ItemButton = styled.button<ItemButtonProps>((props) => [
  {
    display: 'grid',
    gridTemplateColumns: '32px auto 32px',
    gap: 8,
    cursor: 'pointer',
    padding: '8px',
    borderRadius: 12,
    transition: `background-color 150ms ${easingTiming.easeOut}`,

    '&:hover, &:focus': {
      backgroundColor: cssVar('backgroundSubdued'),
    },
    '&:active': {
      backgroundColor: cssVar('backgroundDefault'),
    },

    '&:focus-visible': {
      boxShadow: `0 0 0 2px ${cssVar('focusOutline')}`,
    },
  },
  props.isSelected && {
    backgroundColor: cssVar('backgroundDefault'),

    '&:hover': {
      backgroundColor: cssVar('backgroundDefault'),
    },
  },
]);

export const Avatar = styled.div({
  width: 32,
  height: 32,
  borderRadius: 8,
  marginRight: 8,
  overflow: 'hidden',
});

export const Profile = styled.div({
  width: '100%',
  height: 32,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  paddingTop: 2,
  overflow: 'hidden',
});

export const Name = styled.p(p13Medium, {
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
    fontWeight: 500,
    textTransform: 'uppercase',
    color: props.isPremium
      ? componentCssVars('ButtonPrimaryDefaultText')
      : cssVar('textDefault'),
    backgroundColor: props.isPremium
      ? componentCssVars('ButtonPrimaryDefaultBackground')
      : cssVar('backgroundHeavy'),
  },
]);

export const Icon = styled.span({
  placeSelf: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
  borderRadius: 8,
  padding: 5,
  border: 'none',
  cursor: 'pointer',
  transition: `background-color 150ms ${easingTiming.easeOut}`,

  '& > svg': {
    height: 14,
    width: 14,
  },
});
