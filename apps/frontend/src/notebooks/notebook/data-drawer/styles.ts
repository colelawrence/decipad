import {
  cssVar,
  p12Regular,
  p13Bold,
  p13Medium,
  p14Regular,
  red400,
  tabletScreenQuery,
} from '@decipad/ui';
import styled from '@emotion/styled';
import { ANNOTATIONS_WIDTH } from 'libs/ui/src/pages/NotebookPage/styles';

export const DataDrawerNotebookPageWrapper = styled.div<{
  isInEditorSidebar: boolean;
}>((props) => ({
  position: 'relative',
  zIndex: 50, // Above `dropzoneDetector`

  width: props.isInEditorSidebar
    ? `calc(100% - ${ANNOTATIONS_WIDTH}px - 32px)`
    : '100%',
  borderRadius: '16px',

  [tabletScreenQuery]: {
    width: '100%',
  },
}));

export const DataDrawerEditor = styled.div({
  display: 'flex',
  justifyContent: 'center',
  gap: '8px',
  width: '100%',
  minHeight: '32px',

  color: cssVar('stateOkBackground'),
});

export const DataDrawerInputWrapper = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  paddingRight: '4px',
  paddingLeft: '6px',

  color: cssVar('iconColorHeavy'),
});

export const DataDrawerNameWrapper = styled.div(p14Regular, {
  borderRadius: '8px',
  border: `1px solid ${cssVar('borderDefault')}`,

  display: 'flex',
  color: cssVar('textTitle'),

  height: '32px',

  '> div:first-of-type': {
    borderRight: `1px solid ${cssVar('borderDefault')}`,
    borderRadius: '8px',

    display: 'flex',
    justifyContent: 'left',
    alignItems: 'center',

    paddingRight: '8px',
    paddingLeft: '8px',

    minWidth: '160px',

    whiteSpace: 'pre',

    '> input': {
      background: 'transparent',
      border: 'none',
    },
  },
});

export const DataDrawerCodeWrapper = styled.div(p14Regular, {
  color: cssVar('textTitle'),
  borderRadius: '8px',
  border: `1px solid ${cssVar('borderDefault')}`,

  minHeight: '32px',
  height: '100%',
  width: '100%',

  display: 'flex',
  alignItems: 'center',

  paddingTop: '2px',
  paddingBottom: '2px',

  paddingLeft: '8px',

  '::before': {
    content: '"="',
    marginRight: '8px',
  },

  '> aside': {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',

    svg: {
      marginLeft: '8px',

      width: '32px',
      height: '32px',
      transition: 'all 0.2s',

      borderRadius: '8px',
      borderLeft: '1px solid transparent',

      cursor: 'pointer',

      ':hover': {
        borderLeft: `1px solid ${cssVar('borderDefault')}`,
        backgroundColor: cssVar('iconBackground'),
      },
    },
  },
});

export const FormulaUnitDrawer = styled.span(p13Medium, {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '2px',
  color: cssVar('themeTextSubdued'),
  paddingRight: '4px',
  svg: { width: '16px', height: '16px' },
  span: { display: 'inline-flex', alignItems: 'center' },
});

export const DataDrawerDragWrapper = styled.div<{ height: number }>(
  (props) => ({
    // 400px = notebook height
    maxHeight: 'calc(100svh - 400px)',
    height: props.height,
    overflow: 'hidden',

    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  })
);

export const DRAG_PILL_HEIGHT = 32 - 4;

export const DragPill = styled.div({
  width: '100%',
  height: DRAG_PILL_HEIGHT,

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',

  '> div': {
    width: '76px',
    height: '4px',
    borderRadius: '4px',
    backgroundColor: cssVar('iconBackground'),
    cursor: 'n-resize',

    transition: 'all 0.2s',

    '&:hover': {
      transform: 'scale(1.5)',
    },
  },
});

export const DataDrawerKeysWrapper = styled.div<{ maxHeight: number }>(
  (props) => ({
    width: '100%',
    height: '100%',

    maxHeight: props.maxHeight - DRAG_PILL_HEIGHT,

    display: 'flex',
    flexDirection: 'column',

    background: cssVar('backgroundMain'),
    borderRadius: '16px',

    '> footer': {
      ...p12Regular,
      color: cssVar('textDefault'),

      display: 'flex',
      justifyContent: 'end',
      alignItems: 'center',

      height: '48px',

      backgroundColor: cssVar('backgroundHeavy'),

      borderBottomLeftRadius: '16px',
      borderBottomRightRadius: '16px',

      padding: '0px 16px',
    },
  })
);

export const DataDrawerWrapper = styled.div({
  padding: '16px',

  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  height: '100%',
  width: '100%',

  '> div:first-of-type': {
    width: '100%',

    display: 'flex',
    // alignItems: 'center',
    gap: '8px',
  },

  '> footer:last-of-type': {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginTop: 'auto',
  },
});

export const DataDrawerFormulaHelperWrapper = styled.div(p12Regular, {
  display: 'flex',
  gap: '4px',
  marginLeft: 'auto',
  alignItems: 'center',
  height: '24px',

  borderRadius: '6px',
  border: `1px solid ${cssVar('borderDefault')}`,
  padding: '4px',
  paddingLeft: '8px',

  backgroundColor: cssVar('backgroundSubdued'),

  '& > button': {
    height: '16px',
  },
});

export const KeyWrapper = styled.div({
  display: 'flex',
  gap: '4px',
});

export const HotKey = styled.span({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',

  boxSizing: 'border-box',
  borderRadius: '6px',
  padding: '4px 4px',
  margin: '0px 2px',

  border: `1px ${cssVar('borderSubdued')} solid`,
  backgroundColor: cssVar('backgroundMain'),
  color: cssVar('textSubdued'),
});

export const DataDrawerCloseButton = styled.div({
  width: '15px',
  height: '15px',

  svg: {
    cursor: 'pointer',
    width: '100%',
    height: '100%',
  },
});

export const PaddingDiv = styled.div({ width: '8px', visibility: 'hidden' });

export const CreateVariableWrapper = styled.div({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

export const ErrorParagraph = styled.p(p13Bold, {
  color: red400.rgb,
});

export const StyledIntegrationPortal = styled.div({
  height: '100%',
});

export const DataDrawerContentWrapper = styled.div({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'start',
});

export const EditVariableContainer = styled.div({
  width: '100%',
});
