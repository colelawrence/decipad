import { parseJSONResponse } from './parseJSONResponse';

export const parseInstructionConstituents = (response: string) => {
  const constituents = parseJSONResponse(response);
  if (!Array.isArray(constituents)) {
    throw new TypeError(`Your reply should have been a JSON array of block ids, and it's not.
Please reply in JSON only, no comments.`);
  }
  if (!constituents.every((blockId) => typeof blockId === 'string')) {
    throw new TypeError(`Your reply should have been a JSON array with the block ids in them, and it's not.
Please reply in JSON only with an array of strings. No comments.`);
  }
  return constituents;
};
