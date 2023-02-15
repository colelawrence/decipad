import { IdentifiedError } from '@decipad/computer';
import { parseElementAsVariableAssignment } from './parseElementAsVariableAssignment';

it('can deny expression types', () => {
  // Not a table -- gets parsed
  expect(
    parseElementAsVariableAssignment('block-id', 'x', '1', ['table'])[0].type
  ).toMatchInlineSnapshot(`"identified-block"`);

  // Is a literal -- gets denied
  expect(
    (
      parseElementAsVariableAssignment('block-id', 'x', '1', [
        'literal',
      ])[0] as IdentifiedError
    ).error
  ).toMatchInlineSnapshot(`
    Object {
      "isDisallowedNodeType": true,
      "message": "Invalid expression in this context",
    }
  `);
});
