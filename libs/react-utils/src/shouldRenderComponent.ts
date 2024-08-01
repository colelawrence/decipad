import { Children, ReactNode, isValidElement } from 'react';

//
// Often, we want to have a component `return null`,
// however React still sees this as a component, which sometimes leads
// to incorrect conditional rendering further down the line.
//
// Take a look at where this is used, it's easier to understand that way.
//
export const shouldRenderComponent = (node: ReactNode): boolean =>
  Boolean(
    Children.map(
      node,
      (child) =>
        isValidElement(child) &&
        typeof child.type === 'function' &&
        (child.type as any)(child.props)
    )?.[0]
  );
