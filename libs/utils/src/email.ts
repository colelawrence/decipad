const DEV_EMAIL = /dev\+\d+@decipad\.com|dev@decipad\.com/i;

// See test cases
function isDevEmail(email: string): boolean {
  return DEV_EMAIL.test(email);
}

export function getEmailDomain(email: string): string | undefined {
  if (!email.includes('@')) return undefined;

  return email.split('@').at(-1);
}

export function isInternalEmail(email: string | null | undefined): boolean {
  if (email == null) return false;

  //
  // We want this type of email to pretend to be a regular
  // email, for QA purposes.
  //
  if (isDevEmail(email)) {
    return false;
  }

  const domain = getEmailDomain(email);
  if (!domain) return false;

  return domain === 'decipad.com' || domain === 'n1n.co';
}
