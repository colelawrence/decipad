import { theme } from './themes/dark';
import { CssVariableKey, CssVariables, setCssVar } from './var';

export const darkTheme: Record<
  CssVariableKey<keyof CssVariables>,
  CssVariables[keyof CssVariables]
> = Object.keys(theme).reduce<Partial<CssVariables>>((c, k) => {
  return {
    ...c,
    ...setCssVar(k as keyof CssVariables, theme[k as keyof CssVariables]),
  };
}, {} as CssVariables) as Record<
  CssVariableKey<keyof CssVariables>,
  CssVariables[keyof CssVariables]
>;
