import { isInternalEmail } from './email';

it('is true for n1n and decipad emails', () => {
  expect(isInternalEmail('john@decipad.com')).toBeTruthy();
  expect(isInternalEmail('pedro@decipad.com')).toBeTruthy();
  expect(
    isInternalEmail('dnsajndskajndsjk---3;2-dsanjk@decipad.com')
  ).toBeTruthy();
  expect(isInternalEmail('john@n1n.co')).toBeTruthy();
  expect(isInternalEmail('nunoi@decipad.com')).toBeTruthy();
});

it('returns falsy for non emails', () => {
  expect(isInternalEmail(null)).toBeFalsy();
  expect(isInternalEmail(undefined)).toBeFalsy();
  expect(isInternalEmail('not an email')).toBeFalsy();
  expect(isInternalEmail('@@@')).toBeFalsy();
  expect(isInternalEmail('decipad.com')).toBeFalsy();
  expect(isInternalEmail('n1n.co')).toBeFalsy();
});

it('returns falsy for other emails', () => {
  expect(isInternalEmail('john@n1nn1n.co')).toBeFalsy();
  expect(isInternalEmail('john@n1n.com')).toBeFalsy();
  expect(isInternalEmail('some@email.co')).toBeFalsy();
  expect(isInternalEmail('a@b.c')).toBeFalsy();
});

it('returns false for dev+number.decipad.com emails', () => {
  expect(isInternalEmail('dev@decipad.com')).toBeFalsy();
  expect(isInternalEmail('dev+2@decipad.com')).toBeFalsy();
  expect(isInternalEmail('dev+123@decipad.com')).toBeFalsy();
  expect(isInternalEmail('dev+3333@decipad.com')).toBeFalsy();
  expect(isInternalEmail('dev+812398@decipad.com')).toBeFalsy();
});

it('returns true for similar dev+number.decipad.com emails', () => {
  expect(isInternalEmail('dev+@decipad.com')).toBeTruthy();
  expect(isInternalEmail('dev+notanumber@decipad.com')).toBeTruthy();
  expect(isInternalEmail('dev+!@decipad.com')).toBeTruthy();
  expect(isInternalEmail('dev+nine@decipad.com')).toBeTruthy();
});
