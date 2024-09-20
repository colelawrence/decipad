export {
  // Code
  ELEMENT_CODE_BLOCK as DEPRECATED_ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
} from '@udecode/plate-code-block';
export { ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote';
export { ELEMENT_H1, ELEMENT_H2, ELEMENT_H3 } from '@udecode/plate-heading';
export { ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED } from '@udecode/plate-media';
export {
  ELEMENT_UL,
  ELEMENT_OL,
  ELEMENT_LI,
  ELEMENT_LIC,
} from '@udecode/plate-list';
export { ELEMENT_LINK } from '@udecode/plate-link';
export { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';

// Layout
export const ELEMENT_CALLOUT = 'callout';
export const ELEMENT_LAYOUT = 'columns';
export const ELEMENT_HR = 'divider';

// inputs

export const ELEMENT_PLOT = 'plot';
export const ELEMENT_VARIABLE_DEF = 'def';
export const ELEMENT_CODE_LINE_V2 = 'code_line_v2';
export const ELEMENT_STRUCTURED_VARNAME = 'structured_varname';
export const ELEMENT_CODE_LINE_V2_CODE = 'code_line_v2_code';
export const ELEMENT_EXPRESSION = 'exp';
export const ELEMENT_DROPDOWN = 'dropdown';
export const ELEMENT_SLIDER = 'slider';
export const ELEMENT_STRUCTURED_IN = 'structured_input';
export const ELEMENT_STRUCTURED_IN_CHILD = 'structured_input_child';
export const ELEMENT_MATH = 'math';

export const ELEMENT_DISPLAY = 'display';

// Interactive
export const DEPRECATED_ELEMENT_INPUT = 'input';

// Inlines
// @deprecated this element is no longer used.
export const ELEMENT_INLINE_NUMBER = 'inline-number';

// tables
export const DEPRECATED_ELEMENT_TABLE_INPUT = 'table-input'; // legacy
export const ELEMENT_TABLE = 'table';
export const ELEMENT_TABLE_CAPTION = 'table-caption';
export const ELEMENT_TR = 'tr';
export const ELEMENT_TH = 'th';
export const ELEMENT_TD = 'td';
export const ELEMENT_TABLE_COLUMN_FORMULA = 'table-column-formula';
export const ELEMENT_TABLE_VARIABLE_NAME = 'table-var-name';

// data-views
export const ELEMENT_DATA_VIEW = 'data-view';
export const ELEMENT_DATA_VIEW_CAPTION = 'data-view-caption';
export const ELEMENT_DATA_VIEW_NAME = 'data-view-name';
export const ELEMENT_DATA_VIEW_TR = 'data-view-tr';
export const ELEMENT_DATA_VIEW_TH = 'data-view-th';

// Master integration block
export const ELEMENT_INTEGRATION = 'integration-block';

// live connection
export const ELEMENT_LIVE_CONNECTION = 'live-conn';
export const ELEMENT_LIVE_CONNECTION_VARIABLE_NAME = 'live-var-name';
export const ELEMENT_LIVE_DATASET = 'live-dataset';
export const ELEMENT_LIVE_DATASET_VARIABLE_NAME = 'live-dataset-var-name';

// smart refs
export const ELEMENT_SMART_REF = 'smart-ref';

// draws
export const ELEMENT_DRAW = 'draw';
export const ELEMENT_SELECTION = 'selection';
export const ELEMENT_RECTANGLE = 'rectangle';
export const ELEMENT_DIAMOND = 'diamond';
export const ELEMENT_ELLIPSE = 'ellipse';
export const ELEMENT_TEXT = 'text';
export const ELEMENT_LINEAR = 'linear';
export const ELEMENT_LINE = 'line';
export const ELEMENT_FREEDRAW = 'freedraw';
export const ELEMENT_DRAW_IMAGE = 'image';

// others
export const ELEMENT_CAPTION = 'caption';
export const ELEMENT_IFRAME = 'iframe';
export const ELEMENT_SUBMIT_FORM = 'submit-form';

// Tabs
export const ELEMENT_TAB = 'tab';
export const ELEMENT_DATA_TAB = 'data-tab';
export const ELEMENT_DATA_TAB_CHILDREN = 'data-tab-children';
export const ELEMENT_TITLE = 'title';

// Deprecation area.
export const ELEMENT_FETCH = 'fetch-data';
export const ELEMENT_IMPORT = 'import';
export const ELEMENT_LIVE_QUERY = 'live-query';
export const ELEMENT_LIVE_QUERY_VARIABLE_NAME = 'live-query-var-name';
export const ELEMENT_LIVE_QUERY_QUERY = 'live-query-query';
