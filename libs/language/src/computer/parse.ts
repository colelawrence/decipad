import { parseBlock } from '../parser';
import { IdentifiedBlock, IdentifiedError } from './types';

export type ParseRet = IdentifiedBlock | IdentifiedError;

const wrappedParse = ({ id, source }: Parser.UnparsedBlock): ParseRet => {
  try {
    const parsed = parseBlock({ id, source });

    if (parsed.solutions.length !== 1) {
      throw new Error('Syntax error');
    }

    return {
      type: 'identified-block',
      id,
      source,
      block: {
        ...parsed.solutions[0],
        // AST.Block doesn't *really* have an ID :(
        id: id,
      },
    };
  } catch (error) {
    return {
      type: 'identified-error',
      id,
      source,
      error,
    };
  }
};

export const updateParse = (
  unparsedProgram: Parser.UnparsedBlock[],
  previousBlocks: Map<string, ParseRet>
) => {
  const toEvict: string[] = [];
  const newProgram = unparsedProgram.map((unparsedBlock) => {
    const previouslyParsed = previousBlocks.get(unparsedBlock.id);

    if (previouslyParsed == null) {
      // Totally new
      return wrappedParse(unparsedBlock);
    } else if (previouslyParsed.source === unparsedBlock.source) {
      // Unchanged block
      return previouslyParsed;
    } else {
      // Block source changed
      const parsed = wrappedParse(unparsedBlock);
      toEvict.push(unparsedBlock.id);
      return parsed;
    }
  });

  // Find blocks which were totally deleted
  for (const prevBlockId of previousBlocks.keys()) {
    if (!newProgram.some((b) => b.id === prevBlockId)) {
      toEvict.push(prevBlockId);
    }
  }

  return [toEvict, newProgram] as const;
};
