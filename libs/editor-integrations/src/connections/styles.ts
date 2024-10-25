import { cssVar, p12Medium, p14Medium } from '@decipad/ui';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { hideOnPrint } from 'libs/ui/src/styles/editor-layout';
import { deciOverflowStyles } from 'libs/ui/src/styles/scrollbars';

const commonWrapper = css({
  display: 'flex',
  gap: '8px',
  borderRadius: '16px',
  padding: '16px',
});

export const LiveCodeNameWrapper = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '32px',
});

export const ResultPreviewTableWrapper = styled.div(
  deciOverflowStyles,
  commonWrapper,
  {
    padding: 0,
    borderRadius: 0,
    width: '100%',
    flexDirection: 'column',
    height: '100%',
  }
);

export const ResultPreviewVariableWrapper = styled.div(
  deciOverflowStyles,
  commonWrapper,
  { flexDirection: 'row' }
);

export const ChangeVariableTypeButton = styled.button(p12Medium, hideOnPrint, {
  display: 'inline-flex',
  gap: 4,
  padding: '2px 4px',
  alignItems: 'center',

  borderRadius: '6px',
  border: `1px solid ${cssVar('borderSubdued')}`,

  backgroundColor: cssVar('backgroundSubdued'),
  cursor: 'pointer',

  ':hover, :focus': {
    backgroundColor: cssVar('backgroundHeavy'),
  },

  'span:first-child': {
    width: '16px',
    display: 'grid',
  },
});

export const PreviewActionsWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  div: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
});

export const ActiveDataSetsWrapper = styled.div({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  '& > div': {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '8px',
  },
  'p:first-child': {
    ...p14Medium,
    padding: '0 8px',
    color: cssVar('textDisabled'),
  },
});

export const DatasetCollapsibleTrigger = css(p14Medium, {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  color: cssVar('textDisabled'),
  svg: {
    width: '16px',
    height: '16px',
    padding: '4px',
    boxSizing: 'content-box',
  },
  '& > *:last-child': {
    marginLeft: '8px',
  },
});
export const DatasetBadge = css({
  marginTop: '1px',
  lineHeight: 'normal',
  padding: '0.1em 0.4em',
  backgroundColor: cssVar('backgroundHeavy'),
});

export const AllServicesWrapper = styled.div({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  'p:first-child': {
    ...p14Medium,
    padding: '0 8px',
    color: cssVar('textDisabled'),
  },
});

export const DataDrawerButtonWrapper = styled.div({
  display: 'flex',
  order: 2,
  gap: '20px',
  button: {
    height: '32px',
  },
  span: {
    flexGrow: 1,
  },
});
