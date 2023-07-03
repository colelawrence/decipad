import { getIdentifiedBlocks, prettyPrintProgram } from '../testUtils';
import { programWithAbstractNamesAndReferences } from './programWithAbstractNamesAndReferences';

describe('programWithAbstractNamesAndReferences', () => {
  it('turns non-assignment into exprref assignment', () => {
    expect(
      prettyPrintProgram(
        programWithAbstractNamesAndReferences(getIdentifiedBlocks('1')).program
      )
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "block": "(block
        (assign
          (def exprRef_block_0)
          1))",
          "definesVariable": "exprRef_block_0",
          "id": "block-0",
          "type": "identified-block",
        },
      ]
    `);
  });

  it('turns simple assignment into exprref assignment', () => {
    expect(
      prettyPrintProgram(
        programWithAbstractNamesAndReferences(getIdentifiedBlocks('A = 1'))
          .program
      )
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "block": "(block
        (assign
          (def exprRef_block_0)
          1))",
          "definesVariable": "A",
          "id": "block-0",
          "type": "identified-block",
        },
      ]
    `);
  });

  it('turns ref into exprref', () => {
    expect(
      prettyPrintProgram(
        programWithAbstractNamesAndReferences(
          getIdentifiedBlocks('A = 1', 'B = A + 2')
        ).program
      )
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "block": "(block
        (assign
          (def exprRef_block_0)
          1))",
          "definesVariable": "A",
          "id": "block-0",
          "type": "identified-block",
        },
        Object {
          "block": "(block
        (assign
          (def exprRef_block_1)
          (+ (ref exprRef_block_0 <prev=A>) 2)))",
          "definesVariable": "B",
          "id": "block-1",
          "type": "identified-block",
        },
      ]
    `);
  });

  it('turns table assignment into exprref assignment', () => {
    expect(
      prettyPrintProgram(
        programWithAbstractNamesAndReferences(getIdentifiedBlocks('A = {}'))
          .program
      )
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "block": "(block
        (table exprRef_block_0))",
          "definesVariable": "A",
          "id": "block-0",
          "type": "identified-block",
        },
      ]
    `);
  });

  it('turns column assignment into exprref assignment', () => {
    expect(
      prettyPrintProgram(
        programWithAbstractNamesAndReferences(
          getIdentifiedBlocks('T = {}', 'T.A = 3')
        ).program
      )
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "block": "(block
        (table exprRef_block_0))",
          "definesVariable": "T",
          "id": "block-0",
          "type": "identified-block",
        },
        Object {
          "block": "(block
        (table-column-assign (tablepartialdef exprRef_block_0) (coldef A) 3))",
          "definesTableColumn": Array [
            "T",
            "A",
          ],
          "id": "block-1",
          "type": "identified-block",
        },
      ]
    `);
  });

  it('turns column ref into exprref', () => {
    expect(
      prettyPrintProgram(
        programWithAbstractNamesAndReferences(
          getIdentifiedBlocks('T = {}', 'T.A = 3', 'T.A')
        ).program
      )
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "block": "(block
        (table exprRef_block_0))",
          "definesVariable": "T",
          "id": "block-0",
          "type": "identified-block",
        },
        Object {
          "block": "(block
        (table-column-assign (tablepartialdef exprRef_block_0) (coldef A) 3))",
          "definesTableColumn": Array [
            "T",
            "A",
          ],
          "id": "block-1",
          "type": "identified-block",
        },
        Object {
          "block": "(block
        (assign
          (def exprRef_block_2)
          (prop (ref exprRef_block_0 <prev=T>).A)))",
          "definesVariable": "exprRef_block_2",
          "id": "block-2",
          "type": "identified-block",
        },
      ]
    `);
  });
});
