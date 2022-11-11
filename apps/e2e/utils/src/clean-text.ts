export const cleanText = (text: string | null | undefined) => {
  return text
    ?.replace(/\uFEFF/g, '') // ZERO WIDTH NO-BREAK SPACE
    .replace(/\u2060/g, ''); // WORD JOINER
};
