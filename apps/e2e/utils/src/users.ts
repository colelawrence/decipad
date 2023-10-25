function randomNumber(max = 100000) {
  return Math.round(Math.random() * max);
}

export function randomEmail(): string {
  return `T${randomNumber()}-${Date.now()}@decipadusers.test`;
}

export function genericTestEmail(): string {
  return `generic-test-user@decipad.com`;
}
