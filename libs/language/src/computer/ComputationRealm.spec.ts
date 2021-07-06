import { ComputationRealm } from './ComputationRealm';

it('checks if something is in the cache', () => {
  const realm = new ComputationRealm();

  expect(realm.has('var:A')).toEqual(false);
  expect(realm.has('fn:A')).toEqual(false);

  realm.inferContext.functionDefinitions.set('A', null as any);

  expect(realm.has('var:A')).toEqual(false);
  expect(realm.has('fn:A')).toEqual(true);

  realm.inferContext.stack.set('A', null as any);

  expect(realm.has('var:A')).toEqual(true);
  expect(realm.has('fn:A')).toEqual(true);

  expect(() => realm.has('A')).toThrow();
});

it('deletes from the cache', () => {
  const realm = new ComputationRealm();

  realm.inferContext.functionDefinitions.set('Fn', null as any);

  expect(realm.has('fn:Fn')).toEqual(true);

  realm.delete('fn:Fn');

  expect(realm.has('fn:Fn')).toEqual(false);
  expect(realm.inferContext.functionDefinitions.has('Fn')).toEqual(false);
});
