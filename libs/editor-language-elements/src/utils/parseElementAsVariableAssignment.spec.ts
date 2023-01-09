import { IdentifiedError } from '@decipad/computer';
import { parseElementAsVariableAssignment } from './parseElementAsVariableAssignment';

it('can allowlist expression types', () => {
  expect(
    parseElementAsVariableAssignment('block-id', 'x', '1', ['literal'])[0].type
  ).toMatchInlineSnapshot(`"identified-block"`);

  expect(
    (
      parseElementAsVariableAssignment('block-id', 'x', '1', [
        'assign',
      ])[0] as IdentifiedError
    ).error
  ).toMatchInlineSnapshot(`
    Object {
      "isDisallowedNodeType": true,
      "message": "Invalid expression in this context",
    }
  `);
});
