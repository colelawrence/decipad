import styled from '@emotion/styled';
import { componentCssVars, p10Bold } from 'libs/ui/src/primitives';

export const Badge = styled.span(p10Bold, {
  display: 'inline-block',
  padding: '2px 4px',
  borderRadius: 4,
  marginLeft: 4,
  lineHeight: 1,
  textTransform: 'uppercase',
  backgroundColor: componentCssVars('ButtonPrimaryDefaultBackground'),
  color: componentCssVars('ButtonPrimaryDefaultText'),
});
