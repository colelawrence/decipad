import { DecoratorFn } from '@storybook/react';

export const sidePadding =
  (padding: number): DecoratorFn =>
  (story) =>
    (
      <div style={{ width: '100%', height: '100%', padding: `0 ${padding}px` }}>
        {story()}
      </div>
    );
