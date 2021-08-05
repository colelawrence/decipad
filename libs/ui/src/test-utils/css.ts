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

export const applyPrefersColorScheme = async (
  colorScheme: 'dark' | 'light'
): Promise<() => void> => {
  // JSDOM ignores CSSOM modifications, so build a CSS string and create and append a style element instead
  const styleText = [...document.styleSheets]
    .flatMap((styleSheet) => [...styleSheet.cssRules])
    .flatMap((rule) => {
      if (rule.type === CSSRule.MEDIA_RULE) {
        const mediaRule = rule as CSSMediaRule;
        for (
          let mediaIndex = 0;
          mediaIndex < mediaRule.media.length;
          mediaIndex += 1
        ) {
          if (
            mediaRule.media[mediaIndex].replace(/\s/g, '') ===
            `(prefers-color-scheme:${colorScheme})`
          ) {
            return [...mediaRule.cssRules];
          }
        }
      }
      return [];
    })
    .flatMap((rule) => rule.cssText)
    .join(' ');

  const styleElement = document.createElement('style');
  styleElement.innerHTML = styleText;
  document.head.appendChild(styleElement);

  const cleanupCssVars = await applyCssVars();

  return () => {
    cleanupCssVars();
    styleElement.remove();
  };
};
