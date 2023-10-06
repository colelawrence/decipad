interface Attempts {
  triedHalving?: boolean;
  triedLookingForCodeSeparator?: boolean;
}

const tryLookingForCodeSeparator = (response: string): string | undefined => {
  if (response.indexOf('```') < 0) {
    return undefined;
  }
  const validLines: string[] = [];
  let started = false;
  for (const line of response.split('\n')) {
    if (line.startsWith('```')) {
      if (started) {
        return validLines.join('\n');
      }
      started = true;
    } else if (started) {
      validLines.push(line);
    }
  }
  return undefined;
};

export const parseJSONResponse = (
  response: string,
  originalError?: Error,
  attempts: Attempts = {}
): unknown => {
  try {
    return JSON.parse(response);
  } catch (err) {
    if (!attempts.triedLookingForCodeSeparator) {
      const newProposal = tryLookingForCodeSeparator(response);
      if (newProposal) {
        return parseJSONResponse(newProposal, err as Error, {
          ...attempts,
          triedLookingForCodeSeparator: true,
        });
      }
    }
    if (!attempts.triedHalving) {
      const half = response.length / 2;
      const firstHalf = response.slice(0, half).trim();
      const even = response.length % 2 === 0;
      const secondHalf = response.slice(half + (even ? 1 : 0)).trim();
      if (firstHalf === secondHalf) {
        return parseJSONResponse(firstHalf, err as Error, {
          ...attempts,
          triedHalving: true,
        });
      }
    }
    throw new Error(
      `Error parsing your response: ${
        (originalError ?? (err as Error)).message
      }.`
    );
  }
};
