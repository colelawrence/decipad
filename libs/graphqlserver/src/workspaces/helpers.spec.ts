import { maybeThrowForbidden } from './helpers';

it('doesnt throw if is internal email', () => {
  expect(() =>
    maybeThrowForbidden({
      isInternal: true,
      hasFreeWorkspace: false,
    })
  ).not.toThrow();

  expect(() =>
    maybeThrowForbidden({
      isInternal: true,
      hasFreeWorkspace: true,
    })
  ).not.toThrow();
});

it('doesnt throws if user doesnt have free workspace', () => {
  expect(() =>
    maybeThrowForbidden({
      isInternal: false,
      hasFreeWorkspace: false,
    })
  ).not.toThrow();
});

it('throws if not internal and already has free workspace', () => {
  expect(() =>
    maybeThrowForbidden({
      isInternal: false,
      hasFreeWorkspace: true,
    })
  ).toThrow();
});
