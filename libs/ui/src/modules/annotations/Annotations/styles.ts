import styled from '@emotion/styled';
import {
  cssVar,
  p13Medium,
  p14Medium,
  tabletScreenQuery,
} from 'libs/ui/src/primitives';

export const Container = styled.div({
  width: '100%',
  position: 'relative',
});

export const Placeholder = styled.div({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 'calc(100vh - 80px)',

  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
  borderRadius: 16,
  padding: '32px 48px 64px',
  border: `1px solid ${cssVar('borderSubdued')}`,
  [tabletScreenQuery]: {
    position: 'fixed',
  },
});

export const PlaceholderIcon = styled.div({
  width: 40,
  height: 40,
  borderRadius: 8,
  backgroundColor: cssVar('backgroundDefault'),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 8,

  '& > svg': {
    height: '100%',
    width: '100%',
  },
});

export const HelperTitle = styled.p(p14Medium, {
  color: cssVar('textHeavy'),
});

export const HelperText = styled.p(p13Medium, {
  color: cssVar('textSubdued'),
});

export const HelperIcon = styled.span({
  display: 'inline-block',
  width: 12,
  height: 12,
  verticalAlign: '-10%',
  backgroundColor: cssVar('backgroundHeavy'),
  color: cssVar('textDefault'),
  borderRadius: 4,
});
