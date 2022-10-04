// HACK: Plate uses https://github.com/bokuweb/re-resizable under the hood for resizing which sets
// `max-width: 100%` and `width` to the selected value. Unfortunately this is not responsive and
// it is baked into `re-resizable` so there's no way around it except to give it a wrapper in the
// `as` prop that will then switch `width` with `max-width` to make things responsive. In this case

import { CSSProperties, forwardRef } from 'react';

// we'll get `width: 100%` and `max-width` equal to the selected size.
const getResponsiveWidth = (style: CSSProperties) => ({
  ...style,
  width: '100%',
  maxWidth: style.width,
});

export const Div = forwardRef<HTMLDivElement, { style: CSSProperties }>(
  ({ style, ...props }, ref) => (
    <div style={getResponsiveWidth(style)} ref={ref} {...props} />
  )
);

export const FigCaption = forwardRef<HTMLDivElement, { style: CSSProperties }>(
  ({ style, ...props }, ref) => (
    <figcaption style={getResponsiveWidth(style)} ref={ref} {...props} />
  )
);
