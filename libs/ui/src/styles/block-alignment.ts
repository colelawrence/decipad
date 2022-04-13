import {
  h1,
  h2,
  p14Medium,
  p16Regular,
  p8Regular,
  TypographyStyles,
} from '../primitives';
import { wideBlockWidth, slimBlockWidth } from './editor-layout';

interface StyleData {
  paddingTop: string;
  typography?: TypographyStyles;
  desiredWidth: number;
}

export const paragraph: StyleData = {
  paddingTop: '20px',
  typography: p16Regular,
  desiredWidth: slimBlockWidth,
};
export const blockquote: StyleData = {
  paddingTop: '40px',
  typography: p16Regular,
  desiredWidth: slimBlockWidth,
};
export const callout: StyleData = {
  paddingTop: '40px',
  typography: p14Medium,
  desiredWidth: slimBlockWidth,
};

export const heading1: StyleData = {
  paddingTop: '40px',
  typography: h1,
  desiredWidth: slimBlockWidth,
};
export const heading2: StyleData = {
  paddingTop: '40px',
  typography: h2,
  desiredWidth: slimBlockWidth,
};
export const list: StyleData = {
  paddingTop: '20px',
  typography: p16Regular,
  desiredWidth: slimBlockWidth,
};
export const codeBlock: StyleData = {
  paddingTop: '16px',
  desiredWidth: wideBlockWidth,
};
export const codeLine: StyleData = {
  paddingTop: '16px',
  desiredWidth: wideBlockWidth,
};
export const editorTable: StyleData = {
  paddingTop: '40px',
  typography: h2,
  desiredWidth: wideBlockWidth,
};
export const plot: StyleData = {
  paddingTop: '46px',
  desiredWidth: wideBlockWidth,
};
export const interactive: StyleData = {
  paddingTop: '40px',
  desiredWidth: wideBlockWidth,
};
export const divider: StyleData = {
  paddingTop: '24px',
  typography: p8Regular,
  desiredWidth: slimBlockWidth,
};
