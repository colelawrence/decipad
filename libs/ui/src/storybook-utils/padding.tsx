import { DecoratorFn } from '@storybook/react';

export const sidePadding =
  (pixelsOrValueString: number | string): DecoratorFn =>
  (story) =>
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          padding: `0 ${
            typeof pixelsOrValueString === 'number'
              ? `${pixelsOrValueString}px`
              : pixelsOrValueString
          }`,
        }}
      >
        {story()}
      </div>
    );

export const padding =
  (pixelsOrValueString: number | string): DecoratorFn =>
  (story) =>
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          padding:
            typeof pixelsOrValueString === 'number'
              ? `${pixelsOrValueString}px`
              : pixelsOrValueString,
        }}
      >
        {story()}
      </div>
    );
