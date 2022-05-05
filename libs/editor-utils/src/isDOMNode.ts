/* eslint-disable @typescript-eslint/no-explicit-any */
const getDefaultView = (value: any): Window | null => {
  return (
    (value && value.ownerDocument && value.ownerDocument.defaultView) || null
  );
};

export const isDOMNode = (value: any): value is Node => {
  const window = getDefaultView(value);
  return !!window && value instanceof window.Node;
};
