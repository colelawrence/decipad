import {
  ELEMENT_CODE_LINE,
  ELEMENT_SMART_REF,
  SmartRefElement,
  useTEditorRef,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { useComputer } from '@decipad/react-contexts';
import { getNodeString } from '@udecode/plate';

interface SourceResult {
  sourceCode: string;
  blockId: string;
}

export const useUnnamedResults = () => {
  const computer = useComputer();
  const editor = useTEditorRef();

  // Decilang codelines do not need to have a name defining them.
  // But we still want to add them.
  const resultsWithNoName = editor.children
    .filter((n) => n.type === ELEMENT_CODE_LINE)
    .filter((n) => !computer.getSymbolDefinedInBlock(n.id))
    .filter((n) => {
      assertElementType(n, ELEMENT_CODE_LINE);
      const codelineResult = computer.getBlockIdResult$.get(n.id);
      const kind = codelineResult?.result?.type.kind;
      return (
        (kind === 'string' || kind === 'number' || kind === 'boolean') &&
        codelineResult?.type !== 'identified-error'
      );
    })
    .map((codeline): SourceResult | undefined => {
      assertElementType(codeline, ELEMENT_CODE_LINE);
      let text = '';
      for (const c of codeline.children) {
        if ((c as SmartRefElement)?.type === 'smart-ref') {
          assertElementType(c, ELEMENT_SMART_REF);
          const varName = computer.getSymbolDefinedInBlock(c.blockId);
          if (!varName) return undefined;
          text += varName;
        }
        text += getNodeString(c);
      }
      return {
        sourceCode: text,
        blockId: codeline.id,
      };
    })
    .filter((n): n is SourceResult => n !== undefined);

  return resultsWithNoName;
};
