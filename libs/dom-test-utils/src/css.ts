import cssVarsPonyfill from 'css-vars-ponyfill';

export const findParentWithStyle = <P extends keyof CSSStyleDeclaration>(
  element: Element | null,
  propertyName: P
):
  | (Pick<CSSStyleDeclaration, P> & {
      element: Element;
      styles: CSSStyleDeclaration;
    })
  | null => {
  if (element === null) {
    return null;
  }
  const styles = getComputedStyle(element);
  if (!styles[propertyName]) {
    return findParentWithStyle(element.parentElement, propertyName);
  }
  return {
    [propertyName]: styles[propertyName],
    element,
    styles,
    // cannot type dynamic property key based on type parameter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
};

export const applyCssVars = (): Promise<() => void> => {
  return new Promise((resolve, reject) => {
    const cleanup = () =>
      [...document.head.querySelectorAll('[data-cssvars="out"]')].forEach(
        (element) => element.remove()
      );
    cssVarsPonyfill({
      onError: reject,
      onComplete: () => resolve(cleanup),
    });
  });
};
