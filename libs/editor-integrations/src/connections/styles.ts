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
    maxWidth: '100%',
    flexDirection: 'column',
    maxHeight: '100%',
  }
);

export const ResultPreviewVariableWrapper = styled.div(
  deciOverflowStyles,
  commonWrapper,
  {
    flexDirection: 'row',
    height: 'min-content',
    borderRadius: '16px',
    border: `1px solid ${cssVar('borderDefault')}`,
  }
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

export const PreviewActionsWrapper = styled.ul({
  display: 'contents',
  li: {
    display: 'contents',
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
