import { h1, h2, p16Regular, TypographyStyles } from '../primitives';

interface VerticalAlignmentData {
  paddingTop: string;
  typography?: TypographyStyles;
}

export const paragraph: VerticalAlignmentData = {
  paddingTop: '6px',
  typography: p16Regular,
};
export const blockquote: VerticalAlignmentData = {
  paddingTop: '14px',
  typography: p16Regular,
};
export const heading1: VerticalAlignmentData = {
  paddingTop: '18px',
  typography: h1,
};
export const heading2: VerticalAlignmentData = {
  paddingTop: '18px',
  typography: h2,
};
export const list: VerticalAlignmentData = {
  paddingTop: '6px',
  typography: p16Regular,
};
export const codeBlock: VerticalAlignmentData = {
  paddingTop: '16px',
};
export const codeLine: VerticalAlignmentData = {
  paddingTop: '16px',
};
export const editorTable: VerticalAlignmentData = {
  paddingTop: '12px',
  typography: h2,
};
export const plot: VerticalAlignmentData = {
  paddingTop: '16px',
};
export const interactive: VerticalAlignmentData = {
  paddingTop: '34px',
};
