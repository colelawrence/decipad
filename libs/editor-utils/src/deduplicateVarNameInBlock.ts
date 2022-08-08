import { Computer } from '@decipad/computer';
import {
  AnyElement,
  CodeLineElement,
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
  const parsed = computer.parseStatement(code);
  return produce(el, (e) => {
    if (
      !parsed.error &&
      parsed.statement &&
      parsed.statement.type === 'assign'
    ) {
      const varName = parsed.statement.args[0].args[0];
      const newVarName = computer.getAvailableIdentifier(`${varName}Copy`, 1);
      e.children[0].text = code.replace(varName, newVarName);
    }
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

export function deduplicateVarNameInBlock<T extends AnyElement>(
  computer: Computer,
  el: T
): T {
  switch (el.type) {
    case 'def':
      return deduplicateVarNameInDef(computer, el) as T;
    case 'code_line':
      return deduplicateAssignmentVarName(computer, el) as T;
    case 'table':
      return deduplicateTableVarName(computer, el) as T;
  }
  return el;
}
