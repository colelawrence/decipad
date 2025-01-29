import { describe, it, expect } from 'vitest';
import { getTemplateVariables } from './applyToTemplate';

describe('Detects variables inside template', () => {
  it('returns no variables if no variables were used', () => {
    expect(getTemplateVariables('hello world')).toHaveLength(0);
  });

  it('returns variables if variables are used', () => {
    expect(getTemplateVariables('Hello {{a}} from {{b}}')).toMatchObject([
      'a',
      'b',
    ]);
  });
});
