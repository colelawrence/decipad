import { hasMinimumPermission } from './minimum-permission';
import { P } from './utils';

describe('minimum permission level', () => {
  const verify = hasMinimumPermission('ADMIN');

  it('verifies correclty against no permissions', () => {
    expect(verify([])).toBeNull();
  });

  it('verifies correclty against not enough permissions (1)', () => {
    expect(verify([P('READ')])).toBeNull();
  });

  it('verifies correclty against not enough permissions (2)', () => {
    expect(verify([P('READ'), P('WRITE'), P('READ')])).toBeNull();
  });

  it('verifies correclty against enough permissions (1)', () => {
    expect(verify([P('ADMIN')])).toEqual('ADMIN');
  });

  it('verifies correclty against enough permissions (2)', () => {
    expect(
      verify([P('READ'), P('WRITE'), P('ADMIN'), P('READ'), P('WRITE')])
    ).toEqual('ADMIN');
  });

  it('returns the highest permission', () => {
    expect(
      hasMinimumPermission('WRITE')([
        P('READ'),
        P('WRITE'),
        P('ADMIN'),
        P('READ'),
        P('WRITE'),
      ])
    ).toEqual('ADMIN');
  });
});
