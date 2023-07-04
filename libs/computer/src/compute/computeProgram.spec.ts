import { RuntimeError, AST } from '@decipad/language';
import { computeProgram, resultFromError } from './computeProgram';
import {
  deeperProgram,
  programContainingError,
  simplifyInBlockResults,
} from '../testUtils';
import { ComputationRealm } from '../computer/ComputationRealm';
import { Computer } from '../computer';
import { IdentifiedBlock } from '..';

it('creates a result from an error', () => {
  const realm = new ComputationRealm();
  expect(
    resultFromError(new RuntimeError('Message!'), 'blockid', realm).result.type
  ).toMatchInlineSnapshot(`
    Object {
      "errorCause": Object {
        "errType": "free-form",
        "message": "Message!",
      },
      "errorLocation": undefined,
      "kind": "type-error",
    }
  `);

  expect(
    resultFromError(new Error('panic: Message!'), 'blockid', realm).result.type
  ).toMatchInlineSnapshot(`
    Object {
      "errorCause": Object {
        "errType": "free-form",
        "message": "Internal Error: Message!. Please contact support",
      },
      "errorLocation": undefined,
      "kind": "type-error",
    }
  `);
});

const testCompute = async (program: AST.Block[]) =>
  simplifyInBlockResults(
    await computeProgram(
      program.map(
        (b): IdentifiedBlock => ({
          id: b.id,
          type: 'identified-block',
          block: b,
        })
      ),
      new Computer()
    )
  );

it('infers+evaluates a deep program', async () => {
  expect(await testCompute(deeperProgram)).toMatchInlineSnapshot(`
    Array [
      "block-0 -> 1",
      "block-1 -> 123",
      "block-2 -> 2",
      "block-3 -> 2",
      "block-4 -> 3",
      "block-5 -> 2",
      "block-6 -> 2",
    ]
  `);
});

it('returns type errors', async () => {
  expect(await testCompute(programContainingError)).toMatchInlineSnapshot(`
    Array [
      "block-0 -> 1",
      "block-1 -> Error in operation \\"+\\" (number, string): The function + cannot be called with (number, string)",
      "block-2 -> 2",
      "block-3 -> Error in operation \\"+\\" (number, string): The function + cannot be called with (number, string)",
    ]
  `);
});
