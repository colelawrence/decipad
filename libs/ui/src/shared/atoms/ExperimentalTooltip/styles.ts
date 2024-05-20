import styled from '@emotion/styled';
import {
  componentCssVars,
  cssVar,
  p12Regular,
  p13Medium,
} from 'libs/ui/src/primitives';

export const Content = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  maxWidth: '240px',
  padding: '4px 0px',
});

export const Title = styled.span(p13Medium, {
  color: componentCssVars('TooltipText'),
  textAlign: 'center',
});

export const Body = styled.span(p12Regular, {
  color: componentCssVars('TooltipText'),
  textAlign: 'center',
  marginBottom: '12px',
});

export const Form = styled.form({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const Textarea = styled.textarea(p13Medium, {
  padding: '8px 12px',
  flex: '1 1 100%',
  resize: 'none',
  background: 'transparent',
  color: componentCssVars('TooltipText'),
  '&:focus-within': {},

  border: `1px solid ${cssVar('borderDefault')}`,
  borderRadius: '6px',
  '&:hover, &:focus': {
    borderColor: `${cssVar('borderSubdued')}`,
  },
});
