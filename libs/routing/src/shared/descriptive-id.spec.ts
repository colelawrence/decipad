import * as fc from 'fast-check';
import { descriptiveIdParser } from './descriptive-id';

it('parses the id back to the one that was serialized', () => {
  fc.assert(
    fc.property(
      fc.string().filter((str) => !str.includes(':')),
      fc.string(),
      (id, name) => {
        const url = encodeURIComponent(
          descriptiveIdParser.serialize({ id, name })
        );
        expect(descriptiveIdParser.parse(url).id).toEqual(id);
      }
    )
  );
});

it('replaces whitespace in the name with dashes', () => {
  expect(
    descriptiveIdParser.serialize({
      id: '42',
      name: 'My first pad \tHello World',
    })
  ).toContain('My-first-pad-Hello-World');
});
