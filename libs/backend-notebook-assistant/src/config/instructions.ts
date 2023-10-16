export type InstructionConstituent =
  | 'code-lines'
  | 'sliders'
  | 'tables'
  | 'table-formulas';

export const instructionSummaries: Record<InstructionConstituent, string> = {
  'code-lines':
    'Decipad language code, expressions or formulas in a single line',
  sliders: 'Input element for the user to choose a value',
  tables: 'Tables with data and / or derived calculations',
  'table-formulas':
    'Code, expressions or formulas that go inside table columns',
};

export const tagsForInstructions: Record<InstructionConstituent, string[]> = {
  'code-lines': ['code_line_v2'],
  sliders: ['def'],
  tables: ['table'],
  'table-formulas': ['th'],
};

type InstructionConstituents = Array<InstructionConstituent>;

const genericInstructions = `Minimize the changes to the document.
All new elements MUST have an id which is a string.
NEVER REMOVE ANY ELEMENT (unless the user explicitly tells you to).
Don't replace the ids of elements.
All text must be inside text elements like \`{ text: 'text here' }\`.
If appropriate, always set \`showResult\` to \`true\`.
NEVER use the \`aggregation\` attribute on any element.
Any new Block element ALWAYS goes into a tab.`;

const instructions: Record<InstructionConstituent, string> = {
  'code-lines': `Code lines:
On code lines, only fill the structured_varname text if the code line requires a variable name to be exported.
On code lines, if there's no variable name, include a structured_varname element with empty text.
On code lines, the variable name text must be a string with only letters or "_" and no spaces.
On code lines, the code resides in the text nodes like \`{ text: 'text here' }\` in the children of an element of type \`code_line_v2_code\`.
On code lines, don't use JavaScript or any other programming language. Always use pure maths.
Don't use the Math library. If you need any symbol (like PI), assume that symbol already exists.
On code lines, don't insert your calculations. Instead, insert the full expression to get that result.
Don't put any code inside an element of type \`structured_varname\`.`,
  sliders: `Sliders:
Elements of type \`slider\` must ALWAYS be inside an element if type \`def\` that is of a "slider" variant.,
The var name of a slider is contained inside the "caption" element of the parent "def".`,
  tables: `Tables:
By default a table has no formula elements.
A column on a table only has a corresponding formula element if and only if its cell type is "table-formula".
By default, table columns are of cell type "anything".
When asked to add new columns, NEVER change any property on other columns.
Column names are inside the text children of elements of type \`th\` and should have only letters and no spaces.
When asked to add a column, DON'T change the \`cellType\` of any other column on that table.
In a \`th\` the \`cellType\` must always be filled.`,
  'table-formulas': `Table formulas:
When asked to add or change a column that depends on other columns or symbols, the \`cellType\` should be \`{ kind: 'table-formula' }\`.
Column formulas or calculations need to be inside a \`table-column-formula\` element.
A \`table-column-formula\` should ALWAYS have the \`columnId\` property set to the id of the \`th\` element it corresponds to.
Any  \`th\` with cell type kind \`table-formula\` needs to have a corresponding element of type \`table-column-formula\` inside the caption.
This means that if you're adding a new column with a calculation, you MUST also add a corresponding \`table-column-formula\` element to the \`table-caption\` containing the Decipad code for that calculation.
New elements of type \`table-column-formula\` should NEVER have elements of type \`smart-ref\` inside.
NEVER put the code, formula or calculation for a column inside the \`th\` element. Instead, use a \`table-column-formula\` element for that.
When asked, in a calculation, to use positional references to a column (like "second column"), fetch the name of that column (inside the corresponding \`th\` element) and use it in the formula.
`,
};

export const getInstructions = (
  constituents: InstructionConstituents
): string => {
  let parts: string[] = [genericInstructions];

  parts = parts.concat(
    constituents.map((constituent) => instructions[constituent])
  );

  return parts.join('\n\n');
};
