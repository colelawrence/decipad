export const schema = `

// Inline elements

interface LinkElement extends BaseElement {
  type: 'a';
  children: Array<RichText>;
  url: string;
}

interface InlineNumberElement extends BaseElement {
  type: 'inline-number';
  blockId: string;
  children: [EmptyText];
}

interface SmartRefElement extends BaseElement {
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

interface BaseElement {
  type: string;
  id: string;
};

// Title H1

interface H1Element extends BaseElement {
  type: 'h1';
  children: PlainTextChildren;
};

// Paragraph

interface ParagraphElement extends BaseElement {
  id: string;
  type: 'p;
  children: InlineChildren;
};


// Code line element types

interface StructuredVarnameElement extends BaseElement {
  type: 'structured_varname';
  children: [PlainText];
}

type SmartRefDecoration = 'cell';

interface SmartRefElement extends BaseElement {
  type: 'smart-ref';
  lastSeenVariableName?: string;
  blockId: string;
  columnId: string | null;
  decoration?: SmartRefDecoration;
  children: [PlainText];
}

interface CodeLineV2ElementCode extends BaseElement {
  type: 'code_line_v2_code';
  children: Array<PlainText | SmartRefElement>; // the code of a code line
}

interface CodeLineV2Element extends BaseElement {
  type: 'code_line_v2';
  showResult?: boolean;
  children: [StructuredVarnameElement, CodeLineV2ElementCode];
}

// Variable def and slider

interface CaptionElement extends BaseElement {
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
> extends BaseElement {
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
interface SliderElement extends BaseElement {
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

interface TableColumnFormulaElement extends BaseElement {
  type: 'table-column-formula';
  id: string;
  columnId: string; // the id of the \`th\` element this formula belongs to
  children: (PlainText | SmartRefElement)[]; // the formula mathematical expression for that column
}

interface TableVariableNameElement extends BaseElement {
  type: 'table-var-name';
  id: string;
  children: [Text]; // table var name, CANNOT have spaces
}
interface TableCaptionElement extends BaseElement {
  type: 'table-caption';
  id: string;
  children: [TableVariableNameElement, ...TableColumnFormulaElement[]];
}
interface TableCellElement extends BaseElement {
  type: 'td';
  id: string;
  children: [Text]; // defaults to empty text ({ text: '' })
}

interface TableRowElement extends BaseElement {
  type: 'tr';
  id: string;
  children: TableCellElement[];
}

interface TableHeaderElement extends BaseElement {
  type: 'th';
  id: string;
  cellType: TableCellType;
  children: [Text];  // column name, CANNOT have spaces
  aggregation?: string // NEVER use
}

interface TableHeaderRowElement extends BaseElement {
  type: 'tr';
  id: string;
  children: TableHeaderElement[];
}

interface TableElement extends BaseElement {
  type: 'table';
  id: string;
  children: [TableCaptionElement, TableHeaderRowElement, ...TableRowElement[]];
}

// All the block element types:

type BlockElement = ParagraphElement | TableElement | VariableElement | CodeLineV2Element;

// The entire document

type Document = {
  children: [
    H1Element,
    ...Array<BlockElement>
  ];
};
`;
