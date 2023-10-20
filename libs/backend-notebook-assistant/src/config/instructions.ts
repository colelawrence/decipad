import cloneDeep from 'lodash.clonedeep';

export type InstructionConstituent =
  | 'code-lines'
  | 'sliders'
  | 'tables'
  | 'table-formulas'
  | 'data-views'
  | 'plots';

export const instructionSummaries: Record<InstructionConstituent, string> = {
  'code-lines':
    'Decipad language code, expressions or formulas in a single line',
  sliders: 'Input element for the user to choose a value',
  tables:
    'Tables with data and / or derived calculations. NEVER use to summarize or analyze a table.',
  'table-formulas':
    'Code, expressions or formulas that go inside table columns. Do NOT use to summarize or analyze a table.',
  'data-views':
    'Data views (pivot tables): should be used to analyze, summarize or aggregate tables.',
  plots: `Graphics, charts, plots to view table data.`,
};

export const tagsForInstructions: Record<InstructionConstituent, string[]> = {
  'code-lines': ['code_line_v2'],
  sliders: ['def'],
  tables: ['table'],
  'table-formulas': ['th'],
  'data-views': ['data-view'],
  plots: ['plot'],
};

type InstructionConstituents = Array<InstructionConstituent>;

const genericInstructions = `Minimize the changes to the document.
All new elements MUST have an id which is a string.
NEVER REMOVE ANY ELEMENT (unless the user explicitly tells you to).
Don't replace the ids of elements.
All text must be inside text elements like \`{ text: 'text here' }\`.
If appropriate, always set \`showResult\` to \`true\`.
NEVER use the \`aggregation\` attribute on any element.
Any new Block element ALWAYS goes into a tab.
To summarize a table ALWAYS use data-views.
Add a data view if you need to summarize data.`;

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
In a \`th\` the \`cellType\` must always be filled.
To summarize data, NEVER use a table, ALWAYS use a data view.`,

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

  'data-views': `Data views or pivot tables:
A data view element is used to analyze or aggregate columns in a table.
A data view cell type kind should NEVER be \`table-formula\`.
Inside a \`data-view\` element, the \`varName\` property needs to be filled with id of the table.
ALWAYS use the table id in the \`varName\` property, NOT the table name.
NEVER call the \`generate_decilang_code\` when adding or changing a data view.
To summarize a table ALWAYS use a data view.
To summarize data, NEVER use a table, ALWAYS use a data view.
NEVER replace a table with a data view.
NEVER remove a table.`,

  plots: `Plots, Graphs or Charts:
An element of type \`plot\` can be used to print a chart or graphic.
Always fill the \`xColumnName\` and the \`yColumnName\` attributes with column names.,
The chart type can be changed by changing the \`markType\` attribute to "bar", "circle", "square", "tick", "line", "area", or "point".
If the \`markType\` is \`arc\` it will print a pie chart. For pie charts the \`thetaColumnName\` should be filled.
NEVER remove a table when adding or changing a chart.`,
};

const sanitizeConstituents = (
  _constituents: InstructionConstituents
): InstructionConstituents => {
  let constituents = cloneDeep(_constituents);
  // HACK: remove tables if we're dealing with data views
  if (constituents.includes('data-views')) {
    {
      const indexOfTables = constituents.indexOf('tables');
      if (indexOfTables >= 0) {
        constituents = constituents
          .slice(0, indexOfTables)
          .concat(constituents.slice(indexOfTables + 1));
      }
    }
    {
      const indexOfTableFormulas = constituents.indexOf('table-formulas');
      if (indexOfTableFormulas >= 0) {
        constituents = constituents
          .slice(0, indexOfTableFormulas)
          .concat(constituents.slice(indexOfTableFormulas + 1));
      }
    }
  }
  return constituents;
};

export const getInstructions = (
  constituents: InstructionConstituents
): string => {
  let parts: string[] = [genericInstructions];

  parts = parts.concat(
    sanitizeConstituents(constituents).map(
      (constituent) => instructions[constituent]
    )
  );

  return parts.join('\n\n');
};
