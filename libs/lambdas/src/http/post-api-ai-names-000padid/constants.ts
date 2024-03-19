import { ElementKind, userIconKeys } from '@decipad/editor-types';

export const DOC_FILTER_ITEMS: Set<ElementKind> = new Set([
  'def',
  'code_line_v2',
  'structured_varname',
  'code_line_v2_code',
  'exp',
  'dropdown',
  'slider',
  'structured_input',
  'structured_input_child',
  'p',
  'h1',
  'h2',
  'h3',
]);

const EXAMPLE_RESPONSE = `
{
  label: 'SharePrice',
  icon: 'BalanceSheet',
}
`;

export const SYSTEM_PROMPT = `
Your role is to come up with a suitable name and icon for the variable, based on some contents of notebook and current variable name.
Find what new name works best in the context current variable is used in the document.
Try to keep the name very short and never use white space.
Your options for icons are ${userIconKeys.map((icon) => `${icon}`).join(', ')}.
Only reply with a valid JSON object with the new name and icon.
Never use icons that are not available in the editor. This will result in an error.
Never use a name that is already in use. This will result in an error.
Example response:
${EXAMPLE_RESPONSE}
`;
