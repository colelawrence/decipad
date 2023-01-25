import {
  display,
  h1,
  h2,
  p14Medium,
  p16Regular,
  p8Regular,
  TypographyStyles,
} from '../primitives';

interface StyleData {
  spacingTop?: string;
  spacingBottom?: string;
  typography?: TypographyStyles;
}

export const title: StyleData = {
  typography: display,
};
export const paragraph: StyleData = {
  typography: p16Regular,
};
export const blockquote: StyleData = {
  typography: p16Regular,
};
export const callout: StyleData = {
  typography: p14Medium,
};

export const media: StyleData = {
  typography: p14Medium,
};

export const heading1: StyleData = {
  typography: h1,
};
export const heading2: StyleData = {
  typography: h2,
};
export const list: StyleData = {
  typography: p16Regular,
};
export const codeLine: StyleData = {};
export const editorTable: StyleData = {
  typography: h2,
};
export const editorWideTable: StyleData = {
  typography: h2,
};
export const plot: StyleData = {};
export const interactive: StyleData = {
  typography: p16Regular,
};
export const divider: StyleData = {
  typography: p8Regular,
};
export const dividerBlock: StyleData = {};
export const columns: StyleData = {
  spacingTop: '0',
  spacingBottom: '0',
};
export const draw: StyleData = {};

export const structured: StyleData = {};
