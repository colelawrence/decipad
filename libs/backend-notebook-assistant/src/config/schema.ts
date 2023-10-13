export const schema = `

// Inline elements

interface LinkElement {
  id: string;
  type: 'a';
  children: Array<RichText>;
  url: string;
}

interface InlineNumberElement {
  id: string;
  type: 'inline-number';
  blockId: string;
  children: [EmptyText];
}

interface SmartRefElement {
  id: string;
  type: 'smart-ref';
  lastSeenVariableName?: string;
  blockId: string;
  /** Identifies the "column" part of the smart ref, if any. */
  columnId: string | null; // dont change, has to do with migration from undefined
  decoration?: SmartRefDecoration;
  children: [PlainText];
}

type InlineElement = LinkElement | InlineNumberElement | SmartRefElement;

type InlineChildren = Array<InlineElement>;

type PlainTextChildren = [PlainText];

type EmptyText = {
  text: '';
};

type PlainText = EmptyText | { text: string };
type RichText = PlainText & Partial<Record<MarkKind, true>>;
type Text = PlainText | RichText;

interface TitleElement {
  id: string;
  type: 'title';
  children: PlainTextChildren;
}

interface H1Element {
  id: string;
  type: 'h1';
  children: PlainTextChildren;
};

// Paragraph

interface ParagraphElement {
  id: string;
  type: 'p;
  children: InlineChildren;
};


// Code line element types

interface StructuredVarnameElement {
  id: string;
  type: 'structured_varname';
  children: [PlainText];
}

type SmartRefDecoration = 'cell';

interface SmartRefElement {
  id: string;
  type: 'smart-ref';
  lastSeenVariableName?: string;
  blockId: string;
  columnId: string | null;
  decoration?: SmartRefDecoration;
  children: [PlainText];
}

interface CodeLineV2ElementCode {
  id: string;
  type: 'code_line_v2_code';
  children: Array<PlainText | SmartRefElement>; // the code of a code line
}

interface CodeLineV2Element {
  id: string;
  type: 'code_line_v2';
  showResult?: boolean;
  children: [StructuredVarnameElement, CodeLineV2ElementCode];
}

// Variable def and slider

interface CaptionElement {
  id: string;
  type: 'caption';
  children: [PlainText]; // contains the name of the element
  icon: string;
  color: string;
}

type ElementVariants =
  | 'expression'
  | 'slider';

interface VariableBaseElement<
  V extends ElementVariants,
  T extends BlockElement[]
> {
  id: string;
  type: typeof ELEMENT_VARIABLE_DEF;
  variant: V;
  children: [CaptionElement, ...T];
}

type VariableExpressionElement = VariableBaseElement<
  'expression',
  [ExpressionElement]
>;

type VariableSliderElement = VariableBaseElement<
  'slider',
  [ExpressionElement, SliderElement]
>;

type VariableElement = VariableExpressionElement | VariableToggleElement | VariableDateElement | VariableDropdownElement | VariableSliderElement;

// sliders must always live inside VariableSliderElement
interface SliderElement {
  id: string;
  type: 'slider';
  max: string;
  min: string;
  step: string;
  value: string;
  children: [EmptyText]; // do not use or change
}

// Language

type Number =
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
    );

    type Boolean = { kind: 'boolean' };

type String = { kind: 'string' };

type Date = {
  kind: 'date';
  date: Time.Specificity;
};

type Anything = { kind: 'anything' };

// Table

type SimpleTableCellType =
| Number
| String
| Boolean
| Date
| Anything // default type
;

type TableCellType =
  | SimpleTableCellType
  | { kind: 'table-formula' };

// table column formula. Needs to exist for every th with cell type kind of \`table-formula\`.
interface TableColumnFormulaElement {
  id: string;
  type: 'table-column-formula';
  columnId: string; // the id of the \`th\` element this formula belongs to
  children: (PlainText | SmartRefElement)[]; // the formula mathematical expression for that column
}

interface TableVariableNameElement {
  id: string;
  type: 'table-var-name';
  children: [Text]; // table var name, CANNOT have spaces
}
interface TableCaptionElement {
  id: string;
  type: 'table-caption';
  children: [TableVariableNameElement, ...TableColumnFormulaElement[]];
}
interface TableCellElement {
  id: string;
  type: 'td';
  children: [Text]; // defaults to empty text ({ text: '' })
}

interface TableRowElement {
  id: string;
  type: 'tr';
  children: TableCellElement[];
}

interface TableHeaderElement {
  id: string;
  type: 'th';
  cellType: TableCellType;
  children: [Text];  // column name, CANNOT have spaces
  aggregation?: string // NEVER use
}

interface TableHeaderRowElement {
  id: string;
  type: 'tr';
  children: TableHeaderElement[];
}

interface TableElement {
  id: string;
  type: 'table';
  children: [TableCaptionElement, TableHeaderRowElement, ...TableRowElement[]];
}

// All the block element types:

type BlockElement = ParagraphElement | TableElement | VariableElement | CodeLineV2Element;

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
