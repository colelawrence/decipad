import nearley, { Parser as NearleyParser } from 'nearley';
import { compiledGrammar, tokenize } from '../grammar';
import { ParserNode } from './types';
import { sourceMapDecorator } from './source-map-decorator';
import { AST, prettyPrintAST } from '..';
import { ISyntaxError, SyntaxError } from './SyntaxError';

const grammar = nearley.Grammar.fromCompiled(compiledGrammar);

function lineColFromLexerMessage(
  message: string
): [number | undefined, number | undefined] {
  const match = message.match(/line (\d+) col (\d+)/);
  if (!match) {
    return [undefined, undefined];
  }
  const [, line, col] = match;
  return [Number(line), Number(col)];
}

interface NearleyState {
  dot: number;
  rule: {
    symbols: string[];
  };
}

interface NearleyColumn {
  states: NearleyState[];
}

interface NearleyParserInternals {
  table: NearleyColumn[];
  displayStateStack: (states: NearleyState[], lines: string[]) => void;
  buildFirstStateStack: (
    state: NearleyState,
    lines: string[]
  ) => NearleyState[];
  getSymbolDisplay: (symbol: string) => string;
}

export class Parser extends NearleyParser {
  // this extends nearley and replaces the error string generation when a
  // parse error occurs.
  reportErrorCommon(
    this: Parser,
    lexerMessage: string,
    tokenDisplay: string
  ): string {
    const self = this as unknown as NearleyParserInternals;
    const [message, , source, posistionedCaret] = lexerMessage.split('\n');
    const error: ISyntaxError = {
      message: 'Syntax error',
      source,
      posistionedCaret,
    };
    const lastColumnIndex = self.table.length - 2;
    const lastColumn = self.table[lastColumnIndex];
    const expectantStates = lastColumn.states.filter((state) => {
      const nextSymbol = state.rule.symbols[state.dot];
      return nextSymbol && typeof nextSymbol !== 'string';
    });

    const [line, column] = lineColFromLexerMessage(message);
    error.line = line;
    error.column = column;

    if (expectantStates.length === 0) {
      error.detailMessage = `Unexpected ${tokenDisplay}. I did not expect any more input.\n`;
      const lines: string[] = [];
      self.displayStateStack(lastColumn.states, lines);
      error.detailMessage += lines.join('\n');
    } else {
      error.detailMessage = `Unexpected ${tokenDisplay}.`;
      // Display a "state stack" for each expectant state
      // - which shows you how this state came to be, step by step.
      // If there is more than one derivation, we only display the first one.
      const stateStacks = expectantStates.map((state) => {
        return self.buildFirstStateStack(state, []) || [state];
      }, self);
      // Display each state that is expecting a terminal symbol next.
      error.expected = stateStacks.map((stateStack) => {
        const state = stateStack[0];
        const nextSymbol = state.rule.symbols[state.dot];
        return self.getSymbolDisplay(nextSymbol);
      });
    }
    return JSON.stringify(error);
  }
}

function tryParse(source: string): ParserNode[] {
  const parser = new Parser(grammar);
  parser.feed(source);
  parser.finish();

  const solutions: ParserNode[] = (parser.results as ParserNode[]).map(
    sourceMapDecorator(source)
  ) as ParserNode[];

  if (solutions.length > 1) {
    const printedSolutions = solutions.map((s) =>
      prettyPrintAST(s as AST.Node)
    );
    console.error(
      [`Source: ${source}`, ...printedSolutions].join('\n\n---\n\n')
    );

    // If this ever happens, it's a problem with the grammar
    throw new SyntaxError({ message: 'panic: multiple solutions' });
  }

  if (solutions.length === 0) {
    const token = tokenize(source).pop();
    throw new SyntaxError({ message: 'No solutions', token });
  }

  return solutions;
}

export function parse(source: string): ParserNode[] {
  try {
    return tryParse(source);
  } catch (err) {
    if (!(err instanceof SyntaxError)) {
      let syntaxError: ISyntaxError | undefined;
      try {
        syntaxError = JSON.parse((err as Error).message);
      } catch (err2) {
        console.warn('Error trying to parse', (err as Error).message);
        console.warn(err2);
      }
      if (syntaxError) {
        throw SyntaxError.fromNearleySyntaxError({
          ...(err as Error),
          ...syntaxError,
        });
      }
    }
    throw err;
  }
}
