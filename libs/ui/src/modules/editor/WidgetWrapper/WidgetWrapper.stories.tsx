import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { css } from '@emotion/react';
import { WidgetWrapper } from './WidgetWrapper';

export default {
  title: 'Organisms / Editor / Widget Wrapper',
  component: WidgetWrapper,
} as Meta;

const testStyles = css({
  height: '100px',
});

export const Normal: StoryFn<ComponentProps<typeof WidgetWrapper>> = () => {
  return (
    <WidgetWrapper>
      <div css={testStyles}>Test Children</div>
    </WidgetWrapper>
  );
};
