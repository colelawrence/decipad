import styled from '@emotion/styled';
import { ANNOTATIONS_WIDTH } from 'libs/ui/src/pages/NotebookPage/styles';
import {
  cssVar,
  p13Medium,
  p14Medium,
  tabletScreenQuery,
} from 'libs/ui/src/primitives';

export const AnnotationContainer = styled.div({
  width: ANNOTATIONS_WIDTH,
  height: '100%',
  position: 'relative',

  marginLeft: '16px',

  // A bit smaller, to accomodate for scroll bars, that have 8px width.
  marginRight: '8px',

  zIndex: 100,
});

const BOTTOM_AND_TOP_SIZE = '80px';

export const Placeholder = styled.div({
  // We need to to not scroll with the editor.
  position: 'fixed',

  // top-bar size
  top: 64,

  // margin-right size
  right: 16,

  zIndex: 100,
  width: ANNOTATIONS_WIDTH,

  height: `calc(100vh - ${BOTTOM_AND_TOP_SIZE})`,
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
    display: 'none',
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
