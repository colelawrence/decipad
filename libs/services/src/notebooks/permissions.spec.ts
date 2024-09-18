import { expect, describe, it } from 'vitest';
import { internalCanDuplicatePad } from './permissions';

describe('Can duplicate pad', () => {
  it('cannot duplicate pad if pad is not public', () => {
    expect(
      internalCanDuplicatePad({
        id: 'id1',
        name: 'id1',
        createdAt: 0,
      })
    ).toBeFalsy();

    expect(
      internalCanDuplicatePad({
        id: 'id1',
        name: 'id1',
        createdAt: 0,
        isPublic: false,
      })
    ).toBeFalsy();

    expect(
      internalCanDuplicatePad({
        id: 'id1',
        name: 'id1',
        createdAt: 0,
        canPublicDuplicate: true,
      })
    ).toBeFalsy();

    expect(
      internalCanDuplicatePad({
        id: 'id1',
        name: 'id1',
        createdAt: 0,
        isPublic: false,
        canPublicDuplicate: true,
      })
    ).toBeFalsy();
  });

  it('can duplicate pad if public', () => {
    expect(
      internalCanDuplicatePad({
        id: 'id1',
        name: 'id1',
        createdAt: 0,
        isPublic: false,
        userConsentToFeatureOnGallery: true,
      })
    ).toBeTruthy();
    expect(
      internalCanDuplicatePad({
        id: 'id1',
        name: 'id1',
        createdAt: 0,
        isPublic: true,
        userConsentToFeatureOnGallery: true,
      })
    ).toBeTruthy();
  });

  it('cannot duplicate if is public (not publicly highlighted)', () => {
    expect(
      internalCanDuplicatePad({
        id: 'id1',
        name: 'id1',
        createdAt: 0,
        isPublic: true,
        canPublicDuplicate: false,
      })
    ).toBeFalsy();
  });

  it('can duplicate if is public (not publicly highlighted) and allow duplicate', () => {
    expect(
      internalCanDuplicatePad({
        id: 'id1',
        name: 'id1',
        createdAt: 0,
        isPublic: true,
        canPublicDuplicate: true,
      })
    ).toBeTruthy();

    expect(
      internalCanDuplicatePad({
        id: 'id1',
        name: 'id1',
        createdAt: 0,
        isPublic: true,
      })
    ).toBeTruthy();
  });
});
