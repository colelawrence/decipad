import styled from '@emotion/styled';
import { cssVar, p13Bold } from '../../../primitives';

export const SidebarWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  padding: '8px 0',
  gap: 4,
});

export const ToggleButton = styled.button(p13Bold, {
  width: 32,
  height: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: cssVar('backgroundHeavy'),
  border: 'none',
  outline: 'none',
  cursor: 'pointer',
  borderRadius: '6px',
  padding: 6,

  '& > svg': {
    width: 20,
    height: 20,
  },
});

export const DrawerContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  backgroundColor: cssVar('backgroundMain'),
  borderRadius: '16px 16px 0 0',
  border: `1px solid ${cssVar('borderSubdued')}`,
  borderBottom: 'none',
  padding: 8,
});

export const Separator = styled.div({
  width: '100%',
  borderBottom: `0.5px solid ${cssVar('borderSubdued')}`,
  borderTop: `0.5px solid ${cssVar('borderSubdued')}`,
  margin: '8px 0',
});
