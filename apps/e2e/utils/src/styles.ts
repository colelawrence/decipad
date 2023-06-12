import { Locator } from '@playwright/test';

export const getStyle = async (
  locator: Locator,
  property: string
): Promise<string> => {
  return locator.evaluate(
    (el, prop) => window.getComputedStyle(el).getPropertyValue(prop),
    property
  );
};
