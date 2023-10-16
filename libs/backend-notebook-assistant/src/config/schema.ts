import { unique } from '@decipad/utils';

const schemaByElementType: Record<string, string> = {
  a: `interface LinkElement {
    id: string;
    type: 'a';
    children: Array<RichText>;
    url: string;
  }`,

  'inline-number': `interface InlineNumberElement {
    id: string;
    type: 'inline-number';
    blockId: string;
    children: [EmptyText];
  }`,

  'smart-ref': `type SmartRefDecoration = 'cell';
  interface SmartRefElement {
    id: string;
    type: 'smart-ref';
    lastSeenVariableName?: string;
    blockId: string;
    /** Identifies the "column" part of the smart ref, if any. */
    columnId: string | null; // dont change, has to do with migration from undefined
    decoration?: SmartRefDecoration;
    children: [PlainText];
  }`,

  InlineElement: `type InlineElement = LinkElement | InlineNumberElement | SmartRefElement;`,

  InlineChildren: `type InlineChildren = Array<InlineElement>;`,

  title: `interface TitleElement {
    id: string;
    type: 'title';
    children: PlainTextChildren;
  }`,

  h1: `interface H1Element {
    id: string;
    type: 'h1';
    children: PlainTextChildren;
  };`,

  p: `interface ParagraphElement {
    id: string;
    type: 'p;
    children: InlineChildren;
  };`,

  structured_varname: `interface StructuredVarnameElement {
    id: string;
    type: 'structured_varname';
    children: [PlainText];
  }`,

  caption: `interface CaptionElement {
    id: string;
    type: 'caption';
    children: [PlainText]; // contains the name of the element
    icon: string;
    color: string;
  }`,

  def: `type ElementVariants =
  | 'expression'
  | 'slider';

interface VariableBaseElement<
  V extends ElementVariants,
  T extends BlockElement[]
> {
  id: string;
  type: typeof 'def';
  variant: V;
  children: [CaptionElement, ...T];
}

type VariableExpressionElement = VariableBaseElement<
'expression',
[ExpressionElement]
>;

type VariableSliderElement = VariableBaseElement<
'slider',
[ExpressionElement, SliderElement],
>;`,

  exp: `interface ExpressionElement {
  id: string;
  type: 'exp';
  children: [PlainText];
}`,

  slider: `// sliders must always live inside VariableSliderElement
  interface SliderElement {
    id: string;
    type: 'slider';
    max: string;
    min: string;
    step: string;
    value: string;
    children: [EmptyText]; // do not use or change
  }`,

  Number: `type Number =
  | {
      kind: 'number';
      unit?: Unit[] | null;
      numberError?: 'month-day-conversion';
      numberFormat?: null;
    }
  | {
      kind: 'number';
      numberFormat: 'percentage';
      unit?: null;
      numberError?: null;
    );`,
  Boolean: `type Boolean = { kind: 'boolean' };`,
  String: `type String = { kind: 'string' };`,

  Date: `type Date = {
  kind: 'date';
  date: Time.Specificity;
};`,
  Anything: `type Anything = { kind: 'anything' };`,

  SimpleTableCellType: `type SimpleTableCellType =
  | Number
  | String
  | Boolean
  | Date
  | Anything // default type
  ;`,

  TableCellType: `type TableCellType =
  | SimpleTableCellType
  | { kind: 'table-formula' };`,

  'table-column-formula': `// table column formula. Needs to exist for every th with cell type kind of \`table-formula\`.
  interface TableColumnFormulaElement {
    id: string;
    type: 'table-column-formula';
    columnId: string; // the id of the \`th\` element this formula belongs to
    children: (PlainText | SmartRefElement)[]; // the formula mathematical expression for that column
  }`,

  'table-var-name': `interface TableVariableNameElement {
    id: string;
    type: 'table-var-name';
    children: [Text]; // table var name, CANNOT have spaces
  }`,

  'table-caption': `interface TableCaptionElement {
    id: string;
    type: 'table-caption';
    children: [TableVariableNameElement, ...TableColumnFormulaElement[]];
  }
  `,

  td: `interface TableCellElement {
    id: string;
    type: 'td';
    children: [Text]; // defaults to empty text ({ text: '' })
  }`,

  tr: `interface TableRowElement {
    id: string;
    type: 'tr';
    children: TableCellElement[];
  }`,

  th: `interface TableHeaderElement {
    id: string;
    type: 'th';
    cellType: TableCellType;
    children: [Text];  // column name, CANNOT have spaces
    aggregation?: string // NEVER use
  }`,

  TableHeaderRowElement: `interface TableHeaderRowElement {
    id: string;
    type: 'tr';
    children: TableHeaderElement[];
  }
  `,

  table: `interface TableElement {
    id: string;
    type: 'table';
    children: [TableCaptionElement, TableHeaderRowElement, ...TableRowElement[]];
  }`,

  code_line_v2: `interface CodeLineV2Element {
    type: 'code_line_v2';
    showResult?: boolean;
    children: [StructuredVarnameElement, CodeLineV2ElementCode];
  }`,

  code_line_v2_code: `interface CodeLineV2ElementCode {
    type: 'code_line_v2_code';
    children: Array<PlainText | SmartRefElement>;
  }`,
} as const;

type TagType = keyof typeof schemaByElementType;

const dependencies: Record<string, Array<TagType>> = {
  a: ['InlineElement', 'InlineChildren'],
  def: ['exp'],
  TableCellType: ['SimpleTableCellType'],
  'table-column-formula': ['smart-ref'],
  'table-caption': ['table-var-name', 'table-column-formula'],
  tr: ['td'],
  th: ['TableCellType'],
  table: ['table-caption', 'TableHeaderRowElement', 'tr'],
  code_line_v2: ['structured_varname', 'code_line_v2_code'],
  code_line_v2_code: ['smart-ref'],
};

const globalSchemaPreamble = `type PlainText = EmptyText | { text: string };
type PlainTextChildren = [PlainText];
type EmptyText = {
  text: '';
};
type RichText = PlainText & Partial<Record<MarkKind, true>>;
type Text = PlainText | RichText;`;

const globalSchemaFooter = `type BlockElement = ParagraphElement | TableElement | VariableElement | CodeLineV2Element;

type TabElement = {
  id: string;
  type: 'tab';
  name: string;
  children: Array<BlockElement>;
}

// The entire document

type Document = {
  children: [
    TitleElement,
    ...Array<TabElement>
  ];
};
`;

const getDependents = (tag: string): string[] => {
  const dependents = dependencies[tag];
  if (dependents) {
    return [...dependents, ...dependents.flatMap(getDependents)];
  }
  return [];
};

const getSpecificSchema = (tags: Array<string>): string =>
  unique(tags.concat(tags.flatMap((tag) => getDependents(tag))))
    .map((tag) => schemaByElementType[tag])
    .join('\n\n');

export const schema = (tags: Array<string>): string => `${globalSchemaPreamble}

${getSpecificSchema(tags)}

${globalSchemaFooter}`;
