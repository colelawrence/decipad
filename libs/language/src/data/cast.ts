const castNumber = (input: string) => {
  if (input.trim() === '0') {
    return 0;
  }
  input = input.replace(/^0+/, '');
  if (input === '') {
    return null;
  }

  const asNumber = Number(input);
  if (!Number.isNaN(asNumber)) {
    return asNumber;
  }
  return null;
};

const castBoolean = (input: string) => {
  if (input === 'true' || input === 'false') {
    return input === 'true';
  }
  return null;
};

const castDate = (input: string) => {
  if (input.startsWith('date(')) {
    input = input.slice('date('.length, -1);
  }

  let n = Date.parse(`${input}Z`);
  if (Number.isNaN(n)) {
    n = Date.parse(input);
  }
  if (!Number.isNaN(n)) {
    return new Date(n);
  }

  return null;
};

type CastResult = number | boolean | Date | string;
export const cast = (input: string): CastResult => {
  let castResult: CastResult | null = null;

  const trimmedInput = input.trim();
  castResult ??= castNumber(trimmedInput);
  castResult ??= castBoolean(trimmedInput);
  castResult ??= castDate(trimmedInput);
  castResult ??= input;

  return castResult;
};
