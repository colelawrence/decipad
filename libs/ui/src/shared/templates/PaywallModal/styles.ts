import styled from '@emotion/styled';
import {
  componentCssVars,
  cssVar,
  p10Medium,
  p13Medium,
  p14Bold,
  p14Medium,
  p16Medium,
} from 'libs/ui/src/primitives';

export const PaywallContainer = styled.div({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 16,
});

export const PaywallTitle = styled.h2(p16Medium, {
  color: cssVar('textHeavy'),
});

export const PaywallText = styled.p(p13Medium, {
  color: cssVar('textSubdued'),
});

export const PlanContainer = styled.div({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

export const PlanItem = styled.button({
  width: '100%',
  display: 'grid',
  gridTemplateColumns: 'auto 80px',
  gridTemplateRows: 'auto auto',
  gap: 2,
  padding: 16,
  borderRadius: 12,
  backgroundColor: cssVar('backgroundDefault'),
  border: `1px solid transparent`,
  cursor: 'pointer',

  '&[data-state="on"]': {
    borderColor: componentCssVars('RequiresPremiumBorder'),

    '& label': {
      borderColor: cssVar('textHeavy'),

      '&::before': {
        backgroundColor: cssVar('textHeavy'),
      },
    },
  },

  '&[data-disabled]': {
    backgroundColor: cssVar('backgroundSubdued'),
    cursor: 'not-allowed',

    '& label': {
      borderColor: cssVar('textDisabled'),

      '&::before': {
        backgroundColor: cssVar('textDisabled'),
      },
    },
  },
});

export const PlanTitle = styled.span(p14Medium, {
  textAlign: 'left',
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  color: cssVar('textHeavy'),
});

export const PlanRadio = styled.label({
  width: 12,
  height: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 6,
  border: `1px solid ${cssVar('textSubdued')}`,
  marginBottom: 2,

  '&::before': {
    content: '""',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'transparent',
  },
});

export const PlanBadge = styled.span(p10Medium, {
  padding: '3px 4px 2px',
  borderRadius: 4,
  backgroundColor: componentCssVars('RequiresPremium'),
  color: componentCssVars('RequiresPremiumText'),
});

export const PlanPrice = styled.span(p14Bold, {
  textAlign: 'right',
  color: cssVar('textHeavy'),
});

export const PlanPriceSuffix = styled.span(p13Medium, {
  textAlign: 'right',
  color: cssVar('textSubdued'),
});

export const PlanDescription = styled.span(p13Medium, {
  textAlign: 'left',
  color: cssVar('textSubdued'),
});

export const ButtonContainer = styled.div({
  display: 'flex',
  gap: 8,
});

export const FakePlanItem = styled.div({
  width: '100%',
  padding: 16,
  borderRadius: 12,
  backgroundColor: cssVar('backgroundDefault'),
  border: `1px solid transparent`,
  // to compensate the 8px gap from the plan container
  marginTop: '-8px',
  gap: '2px',
});
