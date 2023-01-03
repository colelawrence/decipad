import { Computer, parseStatement } from '@decipad/computer';
import {
  AnyElement,
  CodeLineElement,
  CodeLineV2Element,
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_TABLE,
  ELEMENT_VARIABLE_DEF,
  TableElement,
  VariableDefinitionElement,
} from '@decipad/editor-types';
import { getNodeString } from '@udecode/plate';
import produce from 'immer';

function deduplicateVarNameInDef(
  computer: Computer,
  el: VariableDefinitionElement
): VariableDefinitionElement {
  return produce(el, (e) => {
    e.children[0].children[0].text = computer.getAvailableIdentifier(
      `${getNodeString(e.children[0])}Copy`,
      1
    );
  });
}

function deduplicateAssignmentVarName(
  computer: Computer,
  el: CodeLineElement
): CodeLineElement {
  const code = getNodeString(el);
  const parsed = parseStatement(code);
  return produce(el, (e) => {
    if (!parsed.error && parsed.solution && parsed.solution.type === 'assign') {
      const varName = parsed.solution.args[0].args[0];
      const newVarName = computer.getAvailableIdentifier(`${varName}Copy`, 1);
      e.children[0].text = code.replace(varName, newVarName);
    }
  });
}

function deduplicateVarNameInCodeLineV2(
  computer: Computer,
  el: CodeLineV2Element
): CodeLineV2Element {
  return produce(el, (e) => {
    e.children[0].children[0].text = computer.getAvailableIdentifier(
      `${getNodeString(e.children[0])}Copy`,
      1
    );
  });
}

function deduplicateTableVarName(
  computer: Computer,
  el: TableElement
): TableElement {
  const captionEl = el.children[0].children[0];
  const varName = getNodeString(captionEl);
  return produce(el, (e) => {
    e.children[0].children[0].children[0].text =
      computer.getAvailableIdentifier(`${varName}Copy`, 1);
  });
}

export const deduplicateVarNameInBlock =
  (computer: Computer) =>
  <T extends AnyElement>(el: T): T => {
    switch (el.type) {
      case ELEMENT_VARIABLE_DEF:
        return deduplicateVarNameInDef(computer, el) as T;
      case ELEMENT_CODE_LINE:
        return deduplicateAssignmentVarName(computer, el) as T;
      case ELEMENT_CODE_LINE_V2:
        return deduplicateVarNameInCodeLineV2(computer, el) as T;
      case ELEMENT_TABLE:
        return deduplicateTableVarName(computer, el) as T;
    }
    return el;
  };
