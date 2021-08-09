const castNumber = (input: string) => {
  input = input.replace(/^0+/, '');
  if (input === '') {
    return null;
  }

  const asNumber = Number(input);
  if (!Number.isNaN(asNumber)) {
    return asNumber;
  } else {
    return null;
  }
};

const castBoolean = (input: string) => {
  if (input === 'true' || input === 'false') {
    return input === 'true';
  } else {
    return null;
  }
};

const castDate = (input: string) => {
  if (input.startsWith('date(')) {
    input = input.slice('date('.length, -1);
  }

  let n = Date.parse(input + 'Z');
  if (isNaN(n)) {
    n = Date.parse(input);
  }
  if (!isNaN(n)) {
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
