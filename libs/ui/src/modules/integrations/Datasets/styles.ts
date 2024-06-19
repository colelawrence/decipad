import styled from '@emotion/styled';
import {
  cssVar,
  p12Medium,
  p13Medium,
  p14Medium,
  p15Medium,
} from 'libs/ui/src/primitives';

export const Placeholder = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  border: `1px dashed ${cssVar('borderSubdued')}`,
  borderRadius: '12px',
  gap: 4,
  padding: 32,
  width: '100%',
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

export const Wrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: '12px',
});

export const Header = styled.div({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const Title = styled.p(p15Medium, {
  color: cssVar('textHeavy'),
  display: 'flex',
  alignItems: 'baseline',
  gap: 4,
});

export const Usage = styled.span(p12Medium, {
  display: 'inline-block',
  color: cssVar('textSubdued'),
  padding: '3px 6px',
  borderRadius: '4px',
  backgroundColor: cssVar('backgroundDefault'),
});
