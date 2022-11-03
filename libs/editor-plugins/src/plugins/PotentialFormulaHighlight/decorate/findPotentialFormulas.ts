import { AST, parseStatement, Token, tokenize } from '@decipad/computer';
import { acceptableOperators, isAcceptableUnit } from './languageSubset';

interface FormulaLoc {
  anchor: number;
  focus: number;
}

type MyToken = Token & { followsWhitespace?: boolean };

export function findPotentialFormulas(text: string): FormulaLoc[] {
  const locs: FormulaLoc[] = [];
  const allTokens = errorProofTokenize(text); // Mutated!

  while (allTokens.length) {
    const anchor = allTokens[0].offset;

    if (!allTokens[0].followsWhitespace) {
      allTokens.shift();
      continue;
    }

    // Potential formula start and any "-" or "$"
    skipAssignments(allTokens);
    skipPrefixes(allTokens);

    let tok = allTokens.shift();

    if (tok?.type !== 'number') {
      continue;
    }

    let latestGood: FormulaLoc | undefined;

    // Look for large strings of tokens that are valid exprs together
    formulaEndFinder: do {
      const focus = tok.offset + (tok.text ?? '').length;

      switch (isPotentialFormula(text.slice(anchor, focus))) {
        case 'incomplete': {
          continue;
        }
        case true: {
          latestGood = { anchor, focus };
          break;
        }
        case false: {
          break formulaEndFinder;
        }
      }
    } while ((tok = allTokens.shift()));

    if (latestGood) {
      locs.push(latestGood);
    }
  }

  return locs;
}

const skipAssignments = (tokens: MyToken[]) => {
  if (
    tokens.at(0)?.type === 'identifier' &&
    tokens.at(1)?.type === 'equalSign'
  ) {
    tokens.shift();
    tokens.shift();
  }
};

const skipPrefixes = (tokens: MyToken[]) => {
  while (['minus', 'currency'].includes(tokens.at(0)?.type ?? '')) {
    tokens.shift();
  }
};

export function isBasicStatement(exp: AST.Statement): boolean {
  switch (exp.type) {
    case 'literal': {
      return true;
    }
    case 'ref': {
      // Allow simple units
      return isAcceptableUnit(exp.args[0]);
    }
    case 'function-call': {
      const ident = exp.args[0].args[0];

      if (!acceptableOperators.has(ident)) {
        return false;
      }

      return exp.args[1].args.every((a) => isBasicStatement(a));
    }
    case 'assign': {
      return isBasicStatement(exp.args[1]);
    }
    default: {
      return false;
    }
  }
}

/**
 * true => good-to-go formula
 * incomplete => constructs like "1 + "
 * cancel => a forbidden part of the lang was used, let's not go on
 * false => I don't see it
 */
export function isPotentialFormula(text: string): true | 'incomplete' | false {
  const { solution: plain } = parseStatement(text);
  if (plain) {
    return isBasicStatement(plain);
  }

  const { solution: withBinopSatisfier } = parseStatement(`${text} 1`);
  if (withBinopSatisfier) {
    return isBasicStatement(withBinopSatisfier) ? 'incomplete' : false;
  }

  return false;
}

/** Tokenize while skipping "error" tokens */
function errorProofTokenize(text: string): MyToken[] {
  return tokenize(text).flatMap((token, i, all) => {
    if (token.type === 'ws') {
      return [];
    }
    if (token.type === 'error') {
      // Skip 1 character and integrate these tokens
      const offset = token.offset + 1;
      const restText = token.text.slice(1);

      return errorProofTokenize(restText).map((restTok) => ({
        ...restTok,
        offset: restTok.offset + offset,
      }));
    }
    const followsWhitespace = i === 0 || all.at(i - 1)?.type === 'ws';
    return [{ ...token, followsWhitespace }];
  });
}
