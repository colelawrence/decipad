import { CssVariables } from './CssVariables';
import { theme } from './themes/dark';
import { theme as lightThemeVars } from './themes/light';
import { setCssVar, CssVariableKey } from './var';

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

export const lightTheme: Record<
  CssVariableKey<keyof CssVariables>,
  CssVariables[keyof CssVariables]
> = Object.keys(lightThemeVars).reduce<Partial<CssVariables>>((c, k) => {
  return {
    ...c,
    ...setCssVar(
      k as keyof CssVariables,
      lightThemeVars[k as keyof CssVariables]
    ),
  };
}, {} as CssVariables) as Record<
  CssVariableKey<keyof CssVariables>,
  CssVariables[keyof CssVariables]
>;
