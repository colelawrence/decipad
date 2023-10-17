import { schema } from './schema';

describe('schema generator', () => {
  it('includes preamble and footer', () => {
    expect(schema([])).toMatchInlineSnapshot(`
      "type PlainText = EmptyText | { text: string };
      type PlainTextChildren = [PlainText];
      type EmptyText = {
        text: '';
      };
      type RichText = PlainText & Partial<Record<MarkKind, true>>;
      type Text = PlainText | RichText;


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
      };"
    `);
  });

  it('provides schema for paragraphs', () => {
    expect(schema(['p'])).toMatchInlineSnapshot(`
      "type PlainText = EmptyText | { text: string };
      type PlainTextChildren = [PlainText];
      type EmptyText = {
        text: '';
      };
      type RichText = PlainText & Partial<Record<MarkKind, true>>;
      type Text = PlainText | RichText;
      interface ParagraphElement {
          id: string;
          type: 'p;
          children: InlineChildren;
        };

      type InlineChildren = Array<InlineElement>;

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
      };"
    `);
  });

  it('provides schema for code lines', () => {
    expect(schema(['code_line_v2'])).toMatchInlineSnapshot(`
      "type PlainText = EmptyText | { text: string };
      type PlainTextChildren = [PlainText];
      type EmptyText = {
        text: '';
      };
      type RichText = PlainText & Partial<Record<MarkKind, true>>;
      type Text = PlainText | RichText;
      interface CodeLineV2Element {
          type: 'code_line_v2';
          showResult?: boolean;
          children: [StructuredVarnameElement, CodeLineV2ElementCode];
        }

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
          /** Identifies the "column" part of the smart ref, if any. */
          columnId: string | null; // dont change, has to do with migration from undefined
          decoration?: SmartRefDecoration;
          children: [PlainText];
        }

      interface CodeLineV2ElementCode {
          type: 'code_line_v2_code';
          children: Array<PlainText | SmartRefElement>;
        }

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
      };"
    `);
  });

  it('provides schema for code tables', () => {
    expect(schema(['table'])).toMatchInlineSnapshot(`
      "type PlainText = EmptyText | { text: string };
      type PlainTextChildren = [PlainText];
      type EmptyText = {
        text: '';
      };
      type RichText = PlainText & Partial<Record<MarkKind, true>>;
      type Text = PlainText | RichText;
      interface TableElement {
          id: string;
          type: 'table';
          children: [TableCaptionElement, TableHeaderRowElement, ...TableRowElement[]];
        }

      interface TableVariableNameElement {
          id: string;
          type: 'table-var-name';
          children: [Text]; // table var name, CANNOT have spaces
        }

      type SmartRefDecoration = 'cell';
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

      // table column formula. Needs to exist for every th with cell type kind of \`table-formula\`.
        interface TableColumnFormulaElement {
          id: string;
          type: 'table-column-formula';
          columnId: string; // the id of the \`th\` element this formula belongs to
          children: (PlainText | SmartRefElement)[]; // the formula mathematical expression for that column
        }

      interface TableCaptionElement {
          id: string;
          type: 'table-caption';
          children: [TableVariableNameElement, ...TableColumnFormulaElement[]];
        }
        

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
      };"
    `);
  });

  it('provides schema for def elements', () => {
    expect(schema(['def'])).toMatchInlineSnapshot(`
      "type PlainText = EmptyText | { text: string };
      type PlainTextChildren = [PlainText];
      type EmptyText = {
        text: '';
      };
      type RichText = PlainText & Partial<Record<MarkKind, true>>;
      type Text = PlainText | RichText;
      type ElementVariants =
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
      >;

      interface ExpressionElement {
        id: string;
        type: 'exp';
        children: [PlainText];
      }

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
      };"
    `);
  });

  it('provides schema for data view', () => {
    expect(schema(['data-view'])).toMatchInlineSnapshot(`
      "type PlainText = EmptyText | { text: string };
      type PlainTextChildren = [PlainText];
      type EmptyText = {
        text: '';
      };
      type RichText = PlainText & Partial<Record<MarkKind, true>>;
      type Text = PlainText | RichText;
      export interface DataViewElement extends BaseElement {
          type: 'data-view';
          children: [DataViewCaptionElement, DataViewHeaderRowElement];
          varName?: string; // contains the table block id
          color?: string;
          icon?: string;
        }

      interface DataViewNameElement {
          id: string;
          type: 'data-view-name';
          children: [Text];
        }

      interface DataViewCaptionElement {
          id: string;
          type: 'data-view-caption';
          children: [DataViewNameElement];
        }

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

      type SimpleTableCellType =
        | Number
        | String
        | Boolean
        | Date
        | Anything // default type
        ;

      interface DataViewHeader {
          id: string;
          type: 'data-view-th';
          cellType: SimpleTableCellType;
          aggregation?: 'average' | 'max' | 'median' | 'min' | 'span' | 'sum';
          rounding?: string;
          name: string;
          label: string;
          children: [EmptyText];
        }

      interface DataViewHeaderRowElement {
          id: string,
          type: 'data-view-tr';
          children: Array<DataViewHeader>;
        }

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
      };"
    `);
  });
});
