import { unique } from '@decipad/utils';
import toposort from 'toposort';

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

  'data-view-tr': `interface DataViewHeaderRowElement {
    id: string,
    type: 'data-view-tr';
    children: Array<DataViewHeader>;
  }`,

  'data-view-th': `interface DataViewHeader {
    id: string;
    type: 'data-view-th';
    cellType: SimpleTableCellType;
    aggregation?: 'average' | 'max' | 'median' | 'min' | 'span' | 'sum';
    rounding?: string;
    name: string;
    label: string;
    children: [EmptyText];
  }`,

  'data-view-name': `interface DataViewNameElement {
    id: string;
    type: 'data-view-name';
    children: [Text];
  }`,

  'data-view-caption': `interface DataViewCaptionElement {
    id: string;
    type: 'data-view-caption';
    children: [DataViewNameElement];
  }`,

  'data-view': `export interface DataViewElement {
    id: string;
    type: 'data-view';
    children: [DataViewCaptionElement, DataViewHeaderRowElement];
    varName?: string; // contains the table block id
    color?: string;
    icon?: string;
  }`,

  plot: `interface PlotElement {
    id: string;
    type: 'plot';
    title?: string;
    sourceVarName: string;
    markType:
      | 'bar'
      | 'circle'
      | 'square'
      | 'tick'
      | 'line'
      | 'area'
      | 'point'
      | 'arc';
    xColumnName: string;
    xAxisLabel: string;
    yAxisLabel: string;
    labelColumnName: string;
    sizeColumnName: string;
    children: [EmptyText];
    yColumnNames: string[];
    yColumnChartTypes: string[];
    orientation: string;
    startFromZero: boolean;
    mirrorYAxis: boolean;
    flipTable: boolean;
    groupByX: boolean;
    grid: boolean;
    showDataLabel: boolean;
    lineVariant: string;
    arcVariant: string;
    barVariant: string;
    schema: 'jun-2024';
  }`,
} as const;

type TagType = keyof typeof schemaByElementType;

const dependencies: Record<TagType, Array<TagType>> = {
  a: ['InlineElement', 'InlineChildren'],
  p: ['InlineChildren'],
  def: ['exp', 'slider'],
  TableCellType: ['SimpleTableCellType'],
  'table-column-formula': ['smart-ref'],
  'table-caption': ['table-var-name', 'table-column-formula'],
  tr: ['td'],
  th: ['TableCellType'],
  table: ['table-caption', 'TableHeaderRowElement', 'tr'],
  code_line_v2: ['structured_varname', 'code_line_v2_code'],
  code_line_v2_code: ['smart-ref'],
  TableHeaderRowElement: ['th'],
  'data-view': ['data-view-caption', 'data-view-tr'],
  'data-view-caption': ['data-view-name'],
  'data-view-tr': ['data-view-th'],
  'data-view-th': ['SimpleTableCellType'],
  SimpleTableCellType: ['Number', 'Boolean', 'String', 'Date', 'Anything'],
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
};`;

const getDependents = (tag: string): string[] => {
  const dependents = dependencies[tag];
  if (dependents) {
    return [...dependents, ...dependents.flatMap(getDependents)];
  }
  return [];
};

const getSpecificSchema = (tags: Array<string>): string => {
  const allTags = unique(
    tags.concat(tags.flatMap((tag) => getDependents(tag)))
  );

  const tagsWithDeps = allTags.flatMap((tag): Array<[string, string]> => {
    const dependents = getDependents(tag);
    return dependents.map((dep) => [dep, tag]);
  });
  const sortedTags = unique(tags.concat(toposort(tagsWithDeps)));

  return sortedTags.map((tag) => schemaByElementType[tag]).join('\n\n');
};

export const schema = (tags: Array<string>): string => `${globalSchemaPreamble}
${getSpecificSchema(tags)}

${globalSchemaFooter}`;
