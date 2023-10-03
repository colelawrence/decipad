import { parseJSONResponse } from './parseJSONResponse';

export const getRelevantBlockIds = (response: string): Array<string> => {
  const relevantBlockIds = parseJSONResponse(response);
  if (!Array.isArray(relevantBlockIds)) {
    throw new TypeError(`Your reply should have been a JSON array of block ids, and it's not.
Please reply in JSON only, no comments.`);
  }
  if (!relevantBlockIds.every((blockId) => typeof blockId === 'string')) {
    throw new TypeError(`Your reply should have been a JSON array with the block ids in them, and it's not.
Please reply in JSON only with an array of strings. No comments.`);
  }
  return relevantBlockIds;
};
