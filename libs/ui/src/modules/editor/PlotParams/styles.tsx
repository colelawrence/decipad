import { css } from '@emotion/react';
import { cssVar, p8Medium } from 'libs/ui/src/primitives';
import { hideOnPrint } from 'libs/ui/src/styles/editor-layout';

export const wrapperContainerStyles = css({
  marginBottom: '20px',
});

export const buttonStyles = css({
  borderRadius: '6px',
  border: `1px solid ${cssVar('borderSubdued')}`,
  backgroundColor: cssVar('backgroundSubdued'),

  ':hover, :focus': {
    backgroundColor: cssVar('backgroundHeavy'),
  },
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: '4px',
});

export const buttonInMenuStyles = css({
  borderRadius: '6px',
  border: `1px solid ${cssVar('borderSubdued')}`,
  backgroundColor: cssVar('backgroundSubdued'),

  ':hover, :focus': {
    backgroundColor: cssVar('backgroundHeavy'),
  },
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-evenly',
  width: 16,
  height: 16,
  svg: {
    width: 12,
    height: 12,
  },
});

export const iconStyles = css({
  width: '12px',
});

export const constMenuMinWidth = { minWidth: '160px' };

export const plotParamsWrapperStyles = [wrapperContainerStyles, hideOnPrint];

export const menuItemWithIconOnEnd = css({
  display: 'flex',
  gap: 10,
  justifyContent: 'space-between',
});

export const iconSizeForPlotParams = { height: 16, width: 16 };

export const chartMenuButtonStyles = {
  display: 'flex',
  gap: 4,
  cursor: 'pointer',
};

export const soonStyles = css(p8Medium, {
  marginLeft: 5,
  padding: '2px 4px',
  borderRadius: '4px',
  backgroundColor: cssVar('backgroundHeavy'),
  height: '12px',
});
