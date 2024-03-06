// see: https://github.com/ai/nanoid
const EXPR_REF_REGEX = /exprRef_[A-z0-9_]+/i;

export function containsExprRef(text: string): boolean {
  const replacedText = text.replaceAll('-', '_');

  return EXPR_REF_REGEX.test(replacedText);
}
