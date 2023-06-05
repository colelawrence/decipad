import { tags as t } from '@lezer/highlight';
import { createTheme, CreateThemeOptions } from '@uiw/codemirror-themes';

export const defaultTokyoNightStormCode: CreateThemeOptions['settings'] = {
  background: '#24283b',
  foreground: '#7982a9',
  caret: '#c0caf5',
  selection: '#6f7bb630',
  selectionMatch: '#1f2335',
  gutterBackground: '#24283b',
  gutterForeground: '#7982a9',
  gutterBorder: 'transparent',
  lineHighlight: '#292e42',
};

export const defaultSettingsDeciCodeDark = defaultTokyoNightStormCode;

export const deciCodeThemeInit = (options?: Partial<CreateThemeOptions>) => {
  const { theme = 'dark', settings = {}, styles = [] } = options || {};
  return createTheme({
    theme,
    settings: {
      ...defaultTokyoNightStormCode,
      ...settings,
    },
    styles: [
      { tag: t.keyword, color: '#bb9af7' },
      { tag: [t.name, t.deleted, t.character, t.macroName], color: '#c0caf5' },
      { tag: [t.propertyName], color: '#7aa2f7' },
      {
        tag: [
          t.processingInstruction,
          t.string,
          t.inserted,
          t.special(t.string),
        ],
        color: '#9ece6a',
      },
      { tag: [t.function(t.variableName), t.labelName], color: '#7aa2f7' },
      {
        tag: [t.color, t.constant(t.name), t.standard(t.name)],
        color: '#bb9af7',
      },
      { tag: [t.definition(t.name), t.separator], color: '#c0caf5' },
      { tag: [t.className], color: '#c0caf5' },
      {
        tag: [
          t.number,
          t.changed,
          t.annotation,
          t.modifier,
          t.self,
          t.namespace,
        ],
        color: '#ff9e64',
      },
      { tag: [t.typeName], color: '#2ac3de', fontStyle: '#2ac3de' },
      { tag: [t.operator, t.operatorKeyword], color: '#bb9af7' },
      { tag: [t.url, t.escape, t.regexp, t.link], color: '#b4f9f8' },
      { tag: [t.meta, t.comment], color: '#565f89' },
      { tag: t.strong, fontWeight: 'bold' },
      { tag: t.emphasis, fontStyle: 'italic' },
      { tag: t.link, textDecoration: 'underline' },
      { tag: t.heading, fontWeight: 'bold', color: '#89ddff' },
      { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#c0caf5' },
      { tag: t.invalid, color: '#ff5370' },
      { tag: t.strikethrough, textDecoration: 'line-through' },
      ...styles,
    ],
  });
};

export const deciDarkThemeInit = deciCodeThemeInit;
export const deciCodeTheme = deciCodeThemeInit();

export const defaultMaterialLight: CreateThemeOptions['settings'] = {
  background: '#FAFAFA',
  foreground: '#90A4AE',
  caret: '#272727',
  selection: '#80CBC440',
  selectionMatch: '#FAFAFA',
  gutterBackground: '#FAFAFA',
  gutterForeground: '#90A4AE',
  gutterBorder: 'transparent',
  lineHighlight: '#CCD7DA50',
};

export const deciLightThemeInit = (options?: Partial<CreateThemeOptions>) => {
  const { theme = 'light', settings = {}, styles = [] } = options || {};
  return createTheme({
    theme,
    settings: {
      ...defaultMaterialLight,
      ...settings,
    },
    styles: [
      { tag: t.keyword, color: '#39ADB5' },
      { tag: [t.name, t.deleted, t.character, t.macroName], color: '#90A4AE' },
      { tag: [t.propertyName], color: '#6182B8' },
      {
        tag: [
          t.processingInstruction,
          t.string,
          t.inserted,
          t.special(t.string),
        ],
        color: '#91B859',
      },
      { tag: [t.function(t.variableName), t.labelName], color: '#6182B8' },
      {
        tag: [t.color, t.constant(t.name), t.standard(t.name)],
        color: '#39ADB5',
      },
      { tag: [t.definition(t.name), t.separator], color: '#90A4AE' },
      { tag: [t.className], color: '#E2931D' },
      {
        tag: [
          t.number,
          t.changed,
          t.annotation,
          t.modifier,
          t.self,
          t.namespace,
        ],
        color: '#F76D47',
      },
      { tag: [t.typeName], color: '#E2931D', fontStyle: '#E2931D' },
      { tag: [t.operator, t.operatorKeyword], color: '#39ADB5' },
      { tag: [t.url, t.escape, t.regexp, t.link], color: '#91B859' },
      { tag: [t.meta, t.comment], color: '#90A4AE' },
      { tag: t.strong, fontWeight: 'bold' },
      { tag: t.emphasis, fontStyle: 'italic' },
      { tag: t.link, textDecoration: 'underline' },
      { tag: t.heading, fontWeight: 'bold', color: '#39ADB5' },
      { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#90A4AE' },
      { tag: t.invalid, color: '#E5393570' },
      { tag: t.strikethrough, textDecoration: 'line-through' },
      ...styles,
    ],
  });
};

export const deciCodeThemeLight = deciLightThemeInit();
export const deciCodeThemeDark = deciCodeThemeInit();
