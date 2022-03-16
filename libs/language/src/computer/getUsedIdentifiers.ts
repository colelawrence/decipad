import { Token } from 'moo';
import { tokenize } from '../grammar';

interface TokenPos {
  text: string;
  start: number;
  end: number;
}

class LineInfo {
  list: TokenPos[];
  set: Set<string>;
  curTableName: string;

  constructor() {
    this.list = [];
    this.set = new Set();
    this.curTableName = '';
  }

  add(tok: TokenPos) {
    this.list.push(tok);
    let { text } = tok;
    if (this.curTableName) {
      text = `${this.curTableName}.${text}`;
    }
    this.set.add(text);
  }

  addToken(tok: Token) {
    const tokenPos = {
      text: tok.text,
      start: tok.offset,
      end: tok.offset + tok.text.length,
    };
    this.add(tokenPos);
  }

  last() {
    if (this.list.length) {
      return this.list[this.list.length - 1];
    }
    return null;
  }

  has(name: TokenPos | string) {
    if (typeof name === 'string') {
      return this.set.has(name);
    }
    return this.set.has(name.text);
  }
}

const relevantTokenTypes = [
  'identifier',
  'leftCurlyBracket',
  'rightCurlyBracket',
];

export const getUsedIdentifiers = (code: string, prevDefined: Set<string>) => {
  const lineInfo = new LineInfo();
  const tokens = tokenize(code).filter((tok) => tok.type !== 'ws');

  for (let i = 0; i < tokens.length; i += 1) {
    const currentTok = tokens[i];
    // token not relevant
    if (!currentTok.type || !relevantTokenTypes.includes(currentTok.type)) {
      continue;
    }

    // Table start and end
    if (currentTok.type === 'leftCurlyBracket') {
      lineInfo.curTableName = lineInfo.last()?.text || '';
    }
    if (currentTok.type === 'rightCurlyBracket') {
      lineInfo.curTableName = '';
    }

    // skip function name
    if (tokens[i + 1]?.type === 'leftParen') {
      continue;
    }

    // column access (Table.Column)
    if (prevDefined.has(currentTok.text) || lineInfo.has(currentTok.text)) {
      if (
        tokens[i + 1]?.type === 'dot' &&
        tokens[i + 2]?.type === 'identifier'
      ) {
        const fullId = `${currentTok.text}.${tokens[i + 2].text}`;
        if (prevDefined.has(fullId) || lineInfo.has(fullId)) {
          const newTok = {
            text: fullId,
            start: currentTok.offset,
            end: tokens[i + 2].offset + tokens[i + 2].text.length,
          };
          lineInfo.add(newTok);
        }
        // jump over next two tokens
        i += 2;
        continue;
      }
      lineInfo.addToken(currentTok);
      continue;
    }

    // column declaration
    if (currentTok.type === 'identifier' && lineInfo.curTableName) {
      const fullId = `${lineInfo.curTableName}.${currentTok.text}`;
      if (lineInfo.has(fullId)) {
        lineInfo.add({
          text: fullId,
          start: currentTok.offset,
          end: currentTok.offset + currentTok.text.length,
        });
        continue;
      }
    }

    // variable declaration
    if (
      currentTok.type === 'identifier' &&
      tokens[i + 1]?.type === 'equalSign'
    ) {
      lineInfo.addToken(currentTok);
      continue;
    }
  }
  return lineInfo.list;
};
